# leetcode-coach Remote Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach `skills/leetcode-coach` to treat interview-practice records as an external git-backed records repo: pull before use, push immediately after local record updates, and show explicit setup instructions when the records repo is missing.

**Architecture:** This repository has no runtime code for `leetcode-coach`; the skill is implemented through Markdown instructions and reference files. The change should therefore be delivered as a documentation-contract update across `SKILL.md`, bilingual READMEs, and reference templates so the agent follows a single remote-sync workflow instead of reading/writing local template files directly.

**Tech Stack:** Markdown, git workflow conventions, GitHub Copilot skill metadata

---

## File Map

- Modify: `skills/leetcode-coach/SKILL.md`
  - Add the remote-sync contract, environment-variable configuration, startup pull sequence, post-update push sequence, and explicit failure semantics.
- Modify: `skills/leetcode-coach/README.md`
  - Document the new records-repo setup and the execution order in English-facing project docs.
- Modify: `skills/leetcode-coach/README.zh-CN.md`
  - Mirror the setup and sync behavior in Chinese.
- Create: `skills/leetcode-coach/references/records-repo-layout.md`
  - Define the external records-repo layout, required files, and environment variables in one stable reference file.
- Modify: `skills/leetcode-coach/references/pattern-progress.md`
  - Reframe this file as a template/example, not the live personal source of truth.
- Modify: `skills/leetcode-coach/references/training-log-template.md`
  - Clarify that instantiated logs should live in the external records repo.

## Notes Before Implementation

- There are no automated tests in this repository today, so validation must use targeted content checks (`rg`, `git diff --check`, and manual inspection).
- Keep the training flow unchanged: only the record source and sync rules are changing.
- Do not add clone automation; the approved spec requires the user to prepare and clone their own records repo locally.
- Default external records path behavior should assume `LEETCODE_COACH_RECORDS_REPO_PATH` points at the repo root and records live under `leetcode-coach/` unless `LEETCODE_COACH_RECORDS_SUBDIR` overrides it.

### Task 1: Define the external records repo contract

**Files:**
- Create: `skills/leetcode-coach/references/records-repo-layout.md`
- Modify: `skills/leetcode-coach/references/pattern-progress.md`
- Modify: `skills/leetcode-coach/references/training-log-template.md`

- [ ] **Step 1: Create the new records layout reference**

~~~md
# Records Repo Layout

`leetcode-coach` keeps personal progress in a separate git repository.

## Required environment variables

- `LEETCODE_COACH_RECORDS_REPO_PATH`: absolute path to your local cloned records repo
- `LEETCODE_COACH_RECORDS_SUBDIR` (optional): subdirectory containing the `leetcode-coach` records; defaults to `leetcode-coach/`

## Expected layout

```text
your-records-repo/
└── leetcode-coach/
    ├── pattern-progress.md
    └── training-logs/
        └── 2026-04-16-example.md
```

## Required behavior

1. Before using the skill, verify the repo path and pull latest changes.
2. Read and write records from this external repo, not from the skill's built-in template files.
3. After updating a record locally, commit and push immediately.
~~~

- [ ] **Step 2: Reframe `pattern-progress.md` as a template**

```md
# 模式进度表（模板）

把它当作 `leetcode-coach` 的默认模板，不要把这个文件当作个人长期记录的唯一真实来源。

实际训练时：

1. 先检查并拉取外部记录仓库；
2. 读取外部记录仓库中的 `pattern-progress.md`；
3. 只有在学习者明确确认可以记档后，才更新外部记录仓库中的对应记录。
```

- [ ] **Step 3: Clarify where training logs belong**

```md
## 使用位置

这个模板文件保存在 skill 仓库中，仅作为格式参考。

如果需要保存某次训练总结，请把实例化后的记录写到外部记录仓库中的 `leetcode-coach/training-logs/` 目录，而不是直接把长期个人记录留在当前 skill 仓库里。
```

- [ ] **Step 4: Verify the new reference contract is wired together**

Run: `rg -n "LEETCODE_COACH_RECORDS_REPO_PATH|外部记录仓库|template|模板" skills/leetcode-coach/references`

Expected: matches from `records-repo-layout.md`, `pattern-progress.md`, and `training-log-template.md`

- [ ] **Step 5: Commit the reference contract**

```bash
git add skills/leetcode-coach/references/records-repo-layout.md \
        skills/leetcode-coach/references/pattern-progress.md \
        skills/leetcode-coach/references/training-log-template.md
git commit -m "docs: define leetcode-coach records repo contract" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 2: Update `SKILL.md` to enforce the sync lifecycle

**Files:**
- Modify: `skills/leetcode-coach/SKILL.md`

- [ ] **Step 1: Update the overview to separate templates from personal records**

```md
这个技能默认依赖一份“外部做题记录仓库”来保存个人进度：

- skill 仓库中的 `references/` 只提供模板和说明；
- 个人做题记录保存在你自己的 git 仓库里；
- 每次使用前先检查配置并拉取最新记录；
- 每次本地更新记录后，立刻提交并推送到远端。
```

- [ ] **Step 2: Add hard rules for pull-before-use and push-after-update**

```md
15. **每次使用前，必须先检查外部记录仓库配置，并拉取远端最新做题记录。**
16. **每次更新完本地记录后，必须先提交并推送到远端。**
17. **如果外部记录仓库缺失、未配置或拉取失败，必须明确提示配置或同步问题，不能静默退回到 skill 内置模板继续记档。**
```

- [ ] **Step 3: Extend the “开启一轮新训练” section with startup checks**

```md
- 开始前先检查 `LEETCODE_COACH_RECORDS_REPO_PATH`
- 检查路径是否存在、是否为 git 仓库
- 默认读取记录仓库中的 `leetcode-coach/pattern-progress.md`；如设置了 `LEETCODE_COACH_RECORDS_SUBDIR`，则读取对应子目录
- 检查通过后，先 `git fetch` / `git pull`
- 拉取成功后，再决定下一题
```

- [ ] **Step 4: Replace the global progress section with the external records flow**

```md
这个技能默认依赖一份轻量的外部 git 记录仓库：

- 选下一题前，先检查并拉取外部记录仓库
- 训练过程中读取外部记录仓库中的 `pattern-progress.md`
- 只有在学习者明确确认“可以记档”后，才更新外部记录仓库中的对应记录
- 更新后立刻执行 `git add`、`git commit`、`git push`
- 如果 push 失败，要明确告诉学习者“本地记录已更新，远端未同步成功”
```

- [ ] **Step 5: Add the missing-config prompt text verbatim**

```md
如果本地没有配置对应记录仓库，直接提示：

1. 先准备一个你自己的做题记录仓库
2. 先把仓库 clone 到本地
3. 设置 `LEETCODE_COACH_RECORDS_REPO_PATH=/absolute/path/to/your/repo`
4. 如有需要，再设置 `LEETCODE_COACH_RECORDS_SUBDIR=leetcode-coach`
5. 确保记录仓库中包含 `pattern-progress.md` 等 leetcode 做题记录文件
```

- [ ] **Step 6: Verify the rule text exists in the correct sections**

Run: `rg -n "LEETCODE_COACH_RECORDS_REPO_PATH|git pull|git push|外部记录仓库|本地记录已更新，远端未同步成功" skills/leetcode-coach/SKILL.md`

Expected: matches in the overview, hard-rules list, startup section, and global progress section

- [ ] **Step 7: Commit the skill contract update**

```bash
git add skills/leetcode-coach/SKILL.md
git commit -m "docs: add leetcode-coach remote sync workflow" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 3: Update the bilingual READMEs

**Files:**
- Modify: `skills/leetcode-coach/README.md`
- Modify: `skills/leetcode-coach/README.zh-CN.md`

- [ ] **Step 1: Expand the file table to include the new reference**

```md
| `references/records-repo-layout.md` | Defines the external records repo structure, required environment variables, and sync workflow |
```

```md
| `references/records-repo-layout.md` | 定义外部记录仓库结构、必需环境变量和同步流程 |
```

- [ ] **Step 2: Add a “records repo setup” section to both READMEs**

```md
## Records repo setup

1. Create your own git repository for leetcode records.
2. Clone it locally.
3. Export `LEETCODE_COACH_RECORDS_REPO_PATH=/absolute/path/to/your/repo`.
4. If records live under a subdirectory, also export `LEETCODE_COACH_RECORDS_SUBDIR=leetcode-coach`.
```

```md
## 记录仓库配置

1. 准备一个你自己的 leetcode 做题记录仓库。
2. 先 clone 到本地。
3. 配置 `LEETCODE_COACH_RECORDS_REPO_PATH=/absolute/path/to/your/repo`。
4. 如果记录放在子目录，再配置 `LEETCODE_COACH_RECORDS_SUBDIR=leetcode-coach`。
```

- [ ] **Step 3: Add the sync order and failure semantics to both READMEs**

```md
1. Before each session, verify the records repo and pull latest changes.
2. Read progress from the external records repo instead of the built-in template files.
3. After local record updates, commit and push immediately.
4. If pull fails, stop and fix sync first.
5. If push fails, report that local records changed but remote sync did not finish.
```

```md
1. 每次使用前先检查记录仓库并拉取最新内容。
2. 训练时读取外部记录仓库，而不是直接把 skill 内置模板当成个人真实记录。
3. 本地记录一旦更新，立刻提交并推送。
4. pull 失败时，先解决同步问题再继续。
5. push 失败时，要明确说明“本地已更新，远端未同步完成”。
```

- [ ] **Step 4: Verify both READMEs mention the same configuration keys**

Run: `rg -n "LEETCODE_COACH_RECORDS_REPO_PATH|LEETCODE_COACH_RECORDS_SUBDIR|pull|push|记录仓库配置|Records repo setup" skills/leetcode-coach/README.md skills/leetcode-coach/README.zh-CN.md`

Expected: both files reference the same environment variables and the same sync order

- [ ] **Step 5: Commit the README updates**

```bash
git add skills/leetcode-coach/README.md skills/leetcode-coach/README.zh-CN.md
git commit -m "docs: document leetcode-coach records sync setup" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Task 4: Final consistency check and delivery

**Files:**
- Modify: `skills/leetcode-coach/SKILL.md`
- Modify: `skills/leetcode-coach/README.md`
- Modify: `skills/leetcode-coach/README.zh-CN.md`
- Create: `skills/leetcode-coach/references/records-repo-layout.md`
- Modify: `skills/leetcode-coach/references/pattern-progress.md`
- Modify: `skills/leetcode-coach/references/training-log-template.md`

- [ ] **Step 1: Run a whitespace and patch sanity check**

Run: `git diff --check`

Expected: no output

- [ ] **Step 2: Run a final keyword coverage check**

Run: `rg -n "LEETCODE_COACH_RECORDS_REPO_PATH|LEETCODE_COACH_RECORDS_SUBDIR|git pull|git push|外部记录仓库|records repo" skills/leetcode-coach`

Expected: matches across the skill file, both READMEs, and the new reference file

- [ ] **Step 3: Inspect the staged diff for requirement coverage**

Run: `git --no-pager diff -- skills/leetcode-coach`

Expected: the diff shows all four requested behaviors: pull before use, push after update, missing-repo prompt, and related file updates

- [ ] **Step 4: Create the final delivery commit**

```bash
git add skills/leetcode-coach
git commit -m "feat: add leetcode-coach remote records sync rules" \
  -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
