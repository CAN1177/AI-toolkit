# 做题记录远程同步说明

## 目标

为 `leetcode-coach` 额外准备一个独立的 git 仓库，用来保存个人做题步骤、模式进度和训练日志。

这个独立仓库是**真实记录源**：

- 当前仓库里的 `skills/leetcode-coach/references/` 只保留模板；
- 个人做题记录统一写到外部记录仓库；
- 每次做题前先同步远端最新内容；
- 每次完成一个类型后，立刻把更新同步到远端。

## 推荐目录结构

```text
your-records-repo/
`-- leetcode-coach/
    |-- pattern-progress.md
    |-- training-log-template.md
    `-- training-logs/
        |-- 2026-04-16-two-pointers.md
        `-- ...
```

## 初始化步骤

1. 新建一个自己的远程仓库，专门用于保存做题记录。
2. clone 到本地，例如：

   ```bash
   git clone <your-records-repo-url> ~/code/leetcode-records
   ```

3. 在本地仓库中创建 `leetcode-coach/` 目录。
4. 把当前仓库中的模板复制过去：

   ```bash
   mkdir -p ~/code/leetcode-records/leetcode-coach/training-logs
   cp skills/leetcode-coach/references/pattern-progress.md \
     ~/code/leetcode-records/leetcode-coach/pattern-progress.md
   cp skills/leetcode-coach/references/training-log-template.md \
     ~/code/leetcode-records/leetcode-coach/training-log-template.md
   ```

5. 配置环境变量：

   ```bash
   export LEETCODE_COACH_RECORDS_REPO_PATH=~/code/leetcode-records
   export LEETCODE_COACH_RECORDS_SUBDIR=leetcode-coach
   ```

## 同步时机

### 每次做题前

固定执行下面的顺序：

1. 进入外部记录仓库；
2. 拉取远端最新记录；
3. 再开始本次做题。

推荐直接执行自动脚本：

```bash
node skills/leetcode-coach/records-sync.js pull
```

如果 pull 失败，先解决同步问题，不继续使用旧记录。

### 每次完成一个类型后

固定执行下面的顺序：

1. 更新 `pattern-progress.md`；
2. 如有需要，在 `training-logs/` 下新增或补充本次训练日志；
3. 提交本地变更；
4. 推送到远端。

推荐直接执行自动脚本：

```bash
node skills/leetcode-coach/records-sync.js push --message "docs: sync leetcode practice progress"
```

如果 push 失败，需要明确认定为：**本地记录已更新，但远端尚未同步成功**。

## 自动同步脚本

当前仓库已经提供自动同步脚本：

```bash
node skills/leetcode-coach/records-sync.js pull
node skills/leetcode-coach/records-sync.js push --message "docs: sync leetcode practice progress"
```

- `pull`：自动检查 `LEETCODE_COACH_RECORDS_REPO_PATH`、记录目录和必需文件，然后执行拉取。
- `push`：自动把记录目录加入暂存区，提交并推送。
- 不传 `--message` 时，会使用默认提交信息。

## 建议记录内容

- `pattern-progress.md`：维护题型维度的整体进度；
- `training-logs/*.md`：记录某次训练的题目、思路、卡点、复盘结论；
- 必要时可补充“下一次继续做什么”，保证下一轮训练可以直接接上。

## 执行约束

1. 不要把 skill 仓库中的模板文件直接当成长期个人记录使用。
2. 做题前必须先 pull。
3. 完成一个类型后必须立即 commit + push。
4. 缺少外部记录仓库、目录或文件时，先补齐配置，再继续训练。

## 参考

- `skills/leetcode-coach/references/records-repo-layout.md`
- `skills/leetcode-coach/references/pattern-progress.md`
- `skills/leetcode-coach/references/training-log-template.md`
