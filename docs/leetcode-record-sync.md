# 做题记录远程同步说明

## 目标

为 `leetcode-coach` 额外准备一个独立的**私有** git 仓库，用来保存个人做题步骤、模式进度和训练日志。

这个独立仓库是**真实记录源**：

- 当前仓库里的 `skills/leetcode-coach/references/` 只保留模板；
- 个人做题记录统一写到外部记录仓库；
- 每次开始一个新类型前先同步远端最新内容；
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

1. 新建一个自己的私有远程仓库，专门用于保存做题记录。
2. clone 到本地，例如：

   ```bash
   git clone <your-records-repo-url> ~/code/leetcode-records
   ```

3. 配置环境变量：

   ```bash
    # 写到 ~/.zshrc 或 ~/.bashrc
    export LEETCODE_COACH_RECORDS_REPO_PATH="$HOME/code/leetcode-records"
    export LEETCODE_COACH_RECORDS_SUBDIR="leetcode-coach"
   ```

   这里的 `LEETCODE_COACH_RECORDS_REPO_PATH` 指的是：**你本机上这个私有记录仓库的绝对路径**。
   比如你把仓库 clone 到 `/Users/ke/code/leetcode-records`，那它就应该指向这个目录。

4. 如果这个私有仓库还是空仓，直接执行：

   ```bash
   node skills/leetcode-coach/records-sync.js pull
   ```

   这一步会自动创建 `leetcode-coach/`（或你自定义的子目录），并同步：

   - `pattern-progress.md`
   - `training-log-template.md`
   - `training-logs/`

   其中 `training-logs/` 会带一个占位文件，确保空目录也能跟着 git 一起同步。

5. 如果仓库不是空的，但记录目录或上述文件缺失，脚本会明确报错；这种情况需要手动修复仓库结构，不会静默补齐。

6. 重新加载配置并验证：

   ```bash
   source ~/.zshrc
   # 或 source ~/.bashrc
   echo $LEETCODE_COACH_RECORDS_REPO_PATH
   ```

   如果输出的是本地仓库路径，说明配置成功。

## 同步时机

### 每次开始新类型前

固定执行下面的顺序：

1. 进入外部记录仓库；
2. 拉取远端最新记录；
3. 再开始本次类型训练。

推荐直接执行自动脚本：

```bash
node skills/leetcode-coach/records-sync.js pull
```

如果 pull 失败，先解决同步问题，不继续使用旧记录。

### 每次完成一个类型后

固定执行下面的顺序：

1. 在学习者明确确认当前类型可以记档后，更新 `pattern-progress.md`；
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

- `pull`：自动检查 `LEETCODE_COACH_RECORDS_REPO_PATH`；如果私有仓库是空仓，会先初始化记录目录和必需文件，然后再继续拉取检查。
- `push`：自动把记录目录加入暂存区，提交并推送。
- 不传 `--message` 时，会使用默认提交信息。

## 建议记录内容

- `pattern-progress.md`：维护题型维度的整体进度；
- `training-logs/*.md`：记录某次训练的题目、思路、卡点、复盘结论；
- 必要时可补充“下一次继续做什么”，保证下一轮训练可以直接接上。

## 执行约束

1. 不要把 skill 仓库中的模板文件直接当成长期个人记录使用。
2. 开始新类型前必须先 pull。
3. 完成一个类型后必须立即 commit + push。
4. 空仓首次接入时，可以直接用 `pull` 自动初始化。
5. 缺少外部记录仓库、非空仓缺目录或缺文件时，先补齐配置或修复仓库结构，再继续训练。

## 参考

- `skills/leetcode-coach/references/records-repo-layout.md`
- `skills/leetcode-coach/references/pattern-progress.md`
- `skills/leetcode-coach/references/training-log-template.md`
