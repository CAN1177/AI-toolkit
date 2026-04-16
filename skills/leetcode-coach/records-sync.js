#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const DEFAULT_SUBDIR = "leetcode-coach";
const DEFAULT_COMMIT_MESSAGE = "docs: sync leetcode practice progress";
const TEMPLATE_ROOT = path.join(__dirname, "references");
const REQUIRED_ENTRIES = [
  "pattern-progress.md",
  "training-log-template.md",
  "training-logs",
];
const TRAINING_LOGS_PLACEHOLDER = ".gitkeep";
const REQUIRED_TEMPLATE_FILES = [
  ["pattern-progress.md", "pattern-progress.md"],
  ["training-log-template.md", "training-log-template.md"],
];

function fail(message) {
  console.error(`[leetcode-records-sync] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const action = args[0];
  let message;

  if (!action || action === "--help" || action === "-h") {
    return { action: "help" };
  }

  for (let i = 1; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--message" || arg === "-m") {
      if (i + 1 >= args.length) {
        fail("缺少 commit message，请在 --message 后提供内容。");
      }
      message = args[i + 1];
      i += 1;
      continue;
    }

    fail(`不支持的参数: ${arg}`);
  }

  if (action !== "pull" && action !== "push") {
    fail(`不支持的动作: ${action}。只支持 pull / push。`);
  }

  return { action, message };
}

function runGit(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function ensurePathExists(targetPath, description) {
  if (!fs.existsSync(targetPath)) {
    fail(`${description}不存在: ${targetPath}`);
  }
}

function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

function listRepoEntries(repoRoot) {
  return fs.readdirSync(repoRoot).filter((entry) => entry !== ".git");
}

function hasVerifiedHead(repoRoot) {
  try {
    runGit(["rev-parse", "--verify", "HEAD"], repoRoot);
    return true;
  } catch {
    return false;
  }
}

function isBootstrapCandidate(repoRoot, recordsDir) {
  if (pathExists(recordsDir)) {
    return false;
  }

  return listRepoEntries(repoRoot).length === 0;
}

function seedRecordsDirectory(recordsDir) {
  fs.mkdirSync(recordsDir, { recursive: true });

  for (const [sourceName, targetName] of REQUIRED_TEMPLATE_FILES) {
    const sourcePath = path.join(TEMPLATE_ROOT, sourceName);
    ensurePathExists(sourcePath, `模板文件 ${sourceName}`);
    fs.copyFileSync(sourcePath, path.join(recordsDir, targetName));
  }

  const trainingLogsDir = path.join(recordsDir, "training-logs");
  fs.mkdirSync(trainingLogsDir, { recursive: true });
  fs.writeFileSync(path.join(trainingLogsDir, TRAINING_LOGS_PLACEHOLDER), "");
}

function loadContext(action) {
  const configuredRepoPath = process.env.LEETCODE_COACH_RECORDS_REPO_PATH;
  if (!configuredRepoPath) {
    fail("缺少环境变量 LEETCODE_COACH_RECORDS_REPO_PATH。");
  }

  const repoPath = path.resolve(configuredRepoPath);
  ensurePathExists(repoPath, "外部记录仓库路径");

  let repoRoot;
  try {
    repoRoot = runGit(["rev-parse", "--show-toplevel"], repoPath);
  } catch {
    fail(`外部记录仓库路径不是 git 仓库: ${repoPath}`);
  }

  const recordsSubdir = process.env.LEETCODE_COACH_RECORDS_SUBDIR || DEFAULT_SUBDIR;
  const recordsDir = path.join(repoRoot, recordsSubdir);
  const bootstrapped = action === "pull" && isBootstrapCandidate(repoRoot, recordsDir);

  if (bootstrapped) {
    seedRecordsDirectory(recordsDir);
  }

  ensurePathExists(recordsDir, "记录目录");

  for (const entry of REQUIRED_ENTRIES) {
    ensurePathExists(path.join(recordsDir, entry), `记录目录必需项 ${entry}`);
  }

  return {
    repoRoot,
    recordsSubdir,
    recordsDir,
    bootstrapped,
    hasHead: hasVerifiedHead(repoRoot),
  };
}

function printContext(context) {
  console.log(`[leetcode-records-sync] repo: ${context.repoRoot}`);
  console.log(`[leetcode-records-sync] records: ${context.recordsDir}`);
}

function pullRecords(context) {
  printContext(context);

  if (context.bootstrapped) {
    console.log("[leetcode-records-sync] 已检测到空记录仓库，已自动初始化模板文件。");
  }

  if (!context.hasHead) {
    console.log(
      "[leetcode-records-sync] 远端当前还没有可拉取的提交；初始化已完成，后续更新后执行 push 即可。",
    );
    return;
  }

  const output = runGit(["pull", "--ff-only"], context.repoRoot);
  if (output) {
    console.log(output);
  }
  console.log("[leetcode-records-sync] 已完成远端拉取。");
}

function pushRecords(context, message) {
  printContext(context);
  runGit(["add", "--", context.recordsSubdir], context.repoRoot);

  let hasChanges = true;
  try {
    runGit(["diff", "--cached", "--quiet", "--", context.recordsSubdir], context.repoRoot);
    hasChanges = false;
  } catch {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log("[leetcode-records-sync] 记录目录没有可提交变更，跳过 commit / push。");
    return;
  }

  const commitMessage =
    message ||
    process.env.LEETCODE_COACH_RECORDS_COMMIT_MESSAGE ||
    DEFAULT_COMMIT_MESSAGE;

  const commitOutput = runGit(["commit", "-m", commitMessage], context.repoRoot);
  if (commitOutput) {
    console.log(commitOutput);
  }

  const pushOutput = runGit(["push"], context.repoRoot);
  if (pushOutput) {
    console.log(pushOutput);
  }

  console.log("[leetcode-records-sync] 已完成本地提交并推送到远端。");
}

function printHelp() {
  console.log(`用法:
  node skills/leetcode-coach/records-sync.js pull
  node skills/leetcode-coach/records-sync.js push --message "docs: sync leetcode practice progress"

环境变量:
  LEETCODE_COACH_RECORDS_REPO_PATH        外部记录仓库路径（必填）
  LEETCODE_COACH_RECORDS_SUBDIR           记录子目录（默认 leetcode-coach）
  LEETCODE_COACH_RECORDS_COMMIT_MESSAGE   默认提交信息（可选）`);
}

function main() {
  const { action, message } = parseArgs(process.argv);
  if (action === "help") {
    printHelp();
    return;
  }

  const context = loadContext(action);

  if (action === "pull") {
    pullRecords(context);
    return;
  }

  pushRecords(context, message);
}

main();
