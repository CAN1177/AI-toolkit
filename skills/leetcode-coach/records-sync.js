#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const CONFIG_DIR = path.join(os.homedir(), ".leetcode-coach");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");
const DEFAULT_LOCAL_PATH = path.join(CONFIG_DIR, "records");
const DEFAULT_COMMIT_MESSAGE = "docs: sync leetcode practice progress";
const TEMPLATE_ROOT = path.join(__dirname, "references");

const TEMPLATE_FILES = [
  "pattern-progress.md",
  "training-log-template.md",
  "pattern-profile-template.md",
];
const PLACEHOLDER_DIRS = ["training-logs", "patterns"];
const PLACEHOLDER_FILE = ".gitkeep";
const REQUIRED_ENTRIES = [...TEMPLATE_FILES, ...PLACEHOLDER_DIRS];

function fail(message) {
  console.error(`[leetcode-records-sync] ${message}`);
  process.exit(1);
}

function log(message) {
  console.log(`[leetcode-records-sync] ${message}`);
}

function runGit(args, cwd, options = {}) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: options.stdio || ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryRunGit(args, cwd) {
  try {
    return { ok: true, output: runGit(args, cwd) };
  } catch (error) {
    return { ok: false, error };
  }
}

function pathExists(targetPath) {
  return fs.existsSync(targetPath);
}

function readConfig() {
  if (!pathExists(CONFIG_PATH)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch (error) {
    fail(`配置文件解析失败 ${CONFIG_PATH}: ${error.message}`);
    return null;
  }
}

function writeConfig(config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

function resolveLocalPath(config) {
  const override = process.env.LEETCODE_COACH_RECORDS_REPO_PATH;
  if (override && override.trim()) {
    return path.resolve(override.trim());
  }
  if (config && config.localPath) {
    return path.resolve(config.localPath);
  }
  return DEFAULT_LOCAL_PATH;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const action = args[0];

  if (!action || action === "--help" || action === "-h") {
    return { action: "help" };
  }

  if (action === "init") {
    const remoteUrl = args[1];
    if (!remoteUrl) {
      fail("init 需要传入远程仓库 URL，例如：\n  node records-sync.js init git@github.com:you/leetcode-records.git");
    }
    return { action: "init", remoteUrl };
  }

  if (action === "status") {
    return { action: "status" };
  }

  if (action !== "pull" && action !== "push") {
    fail(`不支持的动作: ${action}。支持 init / pull / push / status。`);
  }

  let message;
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

  return { action, message };
}

function isGitRepo(targetPath) {
  if (!pathExists(targetPath)) {
    return false;
  }
  const result = tryRunGit(["rev-parse", "--show-toplevel"], targetPath);
  return result.ok;
}

function seedRecordsDirectory(recordsDir) {
  fs.mkdirSync(recordsDir, { recursive: true });

  for (const name of TEMPLATE_FILES) {
    const sourcePath = path.join(TEMPLATE_ROOT, name);
    const targetPath = path.join(recordsDir, name);
    if (pathExists(targetPath)) continue;
    if (!pathExists(sourcePath)) {
      fail(`模板文件不存在: ${sourcePath}`);
    }
    fs.copyFileSync(sourcePath, targetPath);
    log(`已生成 ${name}`);
  }

  for (const dirName of PLACEHOLDER_DIRS) {
    const dirPath = path.join(recordsDir, dirName);
    fs.mkdirSync(dirPath, { recursive: true });
    const placeholder = path.join(dirPath, PLACEHOLDER_FILE);
    if (!pathExists(placeholder)) {
      fs.writeFileSync(placeholder, "");
      log(`已生成 ${dirName}/${PLACEHOLDER_FILE}`);
    }
  }
}

function ensureRecordsReady(recordsDir) {
  seedRecordsDirectory(recordsDir);
  for (const entry of REQUIRED_ENTRIES) {
    if (!pathExists(path.join(recordsDir, entry))) {
      fail(`记录目录必需项缺失: ${entry}`);
    }
  }
}

function hasHead(repoRoot) {
  return tryRunGit(["rev-parse", "--verify", "HEAD"], repoRoot).ok;
}

function getCurrentBranch(repoRoot) {
  const result = tryRunGit(["symbolic-ref", "--short", "HEAD"], repoRoot);
  return result.ok ? result.output : null;
}

function hasUpstream(repoRoot) {
  return tryRunGit(
    ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
    repoRoot,
  ).ok;
}

function commitAndPush(repoRoot, message) {
  runGit(["add", "-A"], repoRoot);

  const diff = tryRunGit(["diff", "--cached", "--quiet"], repoRoot);
  if (diff.ok) {
    log("没有待提交的变更，跳过 commit / push。");
    return;
  }

  const commitMessage =
    message ||
    process.env.LEETCODE_COACH_RECORDS_COMMIT_MESSAGE ||
    DEFAULT_COMMIT_MESSAGE;

  const commitResult = tryRunGit(["commit", "-m", commitMessage], repoRoot);
  if (!commitResult.ok) {
    fail(`git commit 失败: ${commitResult.error.message}`);
  }
  if (commitResult.output) console.log(commitResult.output);

  const branch = getCurrentBranch(repoRoot);
  const pushArgs = hasUpstream(repoRoot)
    ? ["push"]
    : ["push", "-u", "origin", branch || "HEAD"];

  const pushResult = tryRunGit(pushArgs, repoRoot);
  if (!pushResult.ok) {
    fail(
      `git push 失败：本地记录已更新，但远端尚未同步成功。\n${pushResult.error.message}`,
    );
  }
  if (pushResult.output) console.log(pushResult.output);
  log("已完成本地提交并推送到远端。");
}

function commandInit({ remoteUrl }) {
  const existingConfig = readConfig();
  const localPath =
    (existingConfig && existingConfig.localPath) || DEFAULT_LOCAL_PATH;

  log(`远程仓库: ${remoteUrl}`);
  log(`本地路径: ${localPath}`);

  fs.mkdirSync(path.dirname(localPath), { recursive: true });

  if (!pathExists(localPath)) {
    log("本地目录不存在，开始 clone...");
    const cloneResult = tryRunGit(
      ["clone", remoteUrl, localPath],
      path.dirname(localPath),
    );
    if (!cloneResult.ok) {
      fail(`git clone 失败: ${cloneResult.error.message}`);
    }
    if (cloneResult.output) console.log(cloneResult.output);
  } else if (!isGitRepo(localPath)) {
    fail(
      `本地路径已存在但不是 git 仓库: ${localPath}。请删除后重试，或另指定本地路径。`,
    );
  } else {
    log("本地仓库已存在，跳过 clone。");
    const currentRemote = tryRunGit(
      ["remote", "get-url", "origin"],
      localPath,
    );
    if (currentRemote.ok && currentRemote.output !== remoteUrl) {
      log(
        `检测到 origin 与配置不一致：${currentRemote.output} → 更新为 ${remoteUrl}`,
      );
      runGit(["remote", "set-url", "origin", remoteUrl], localPath);
    }
  }

  ensureRecordsReady(localPath);

  writeConfig({ remoteUrl, localPath });
  log(`配置已写入 ${CONFIG_PATH}`);

  commitAndPush(localPath, "docs: bootstrap leetcode-coach records");
  log("初始化完成。后续只需运行 pull / push。");
}

function commandPull() {
  const config = readConfig();
  const localPath = resolveLocalPath(config);

  if (!pathExists(localPath) || !isGitRepo(localPath)) {
    if (!config || !config.remoteUrl) {
      fail(
        "尚未配置记录仓库。请先运行:\n  node records-sync.js init <git-url>",
      );
    }
    log("本地尚未 clone，自动恢复中...");
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    const cloneResult = tryRunGit(
      ["clone", config.remoteUrl, localPath],
      path.dirname(localPath),
    );
    if (!cloneResult.ok) {
      fail(`git clone 失败: ${cloneResult.error.message}`);
    }
  }

  log(`records: ${localPath}`);

  if (hasHead(localPath) && hasUpstream(localPath)) {
    const pullResult = tryRunGit(["pull", "--ff-only"], localPath);
    if (!pullResult.ok) {
      fail(`git pull 失败: ${pullResult.error.message}`);
    }
    if (pullResult.output) console.log(pullResult.output);
  } else {
    log("远端尚无可拉取提交，跳过 pull。");
  }

  ensureRecordsReady(localPath);
  log("已完成拉取，可以开始读取 pattern-progress.md 决定下一步。");
}

function commandPush({ message }) {
  const config = readConfig();
  const localPath = resolveLocalPath(config);

  if (!pathExists(localPath) || !isGitRepo(localPath)) {
    fail(
      "记录仓库不存在或未初始化，请先运行:\n  node records-sync.js init <git-url>",
    );
  }

  log(`records: ${localPath}`);
  ensureRecordsReady(localPath);
  commitAndPush(localPath, message);
}

function commandStatus() {
  const config = readConfig();
  const localPath = resolveLocalPath(config);

  console.log(`配置文件: ${CONFIG_PATH}`);
  console.log(
    `远程仓库: ${config && config.remoteUrl ? config.remoteUrl : "(未配置)"}`,
  );
  console.log(`本地路径: ${localPath}`);
  console.log(`本地存在: ${pathExists(localPath) ? "是" : "否"}`);
  console.log(`是 git 仓库: ${isGitRepo(localPath) ? "是" : "否"}`);

  if (isGitRepo(localPath)) {
    const branch = getCurrentBranch(localPath) || "(detached)";
    const remote = tryRunGit(["remote", "get-url", "origin"], localPath);
    console.log(`当前分支: ${branch}`);
    console.log(`origin: ${remote.ok ? remote.output : "(未设置)"}`);
  }
}

function printHelp() {
  console.log(`leetcode-coach 做题记录同步

用法:
  node records-sync.js init <git-url>     首次配置：clone 仓库、生成模板、写入配置
  node records-sync.js pull               开始新类型前：拉取最新记录
  node records-sync.js push [-m <msg>]    完成一个类型后：自动提交并推送
  node records-sync.js status             查看当前配置和本地状态

配置文件:
  ${CONFIG_PATH}

默认本地路径:
  ${DEFAULT_LOCAL_PATH}

可选环境变量（覆盖配置）:
  LEETCODE_COACH_RECORDS_REPO_PATH        覆盖本地记录仓库路径
  LEETCODE_COACH_RECORDS_COMMIT_MESSAGE   覆盖默认提交信息
`);
}

function main() {
  const parsed = parseArgs(process.argv);

  switch (parsed.action) {
    case "help":
      printHelp();
      return;
    case "init":
      commandInit(parsed);
      return;
    case "pull":
      commandPull();
      return;
    case "push":
      commandPush(parsed);
      return;
    case "status":
      commandStatus();
      return;
    default:
      fail(`未知动作: ${parsed.action}`);
  }
}

main();
