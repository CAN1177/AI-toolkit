# 外部记录仓库布局说明

`leetcode-coach` 的个人训练记录不再以当前仓库中的 `references/` 文件作为真实数据源，而是放在一个由学习者自己维护的、可同步到远端的外部 git 仓库中。

这个文件只定义约定；真正被读取和更新的是外部记录仓库里的副本。

## 环境变量

### 必填：`LEETCODE_COACH_RECORDS_REPO_PATH`

- 含义：外部记录仓库在本地的绝对路径。
- 要求：路径必须存在，而且必须是一个 git 仓库。

### 选填：`LEETCODE_COACH_RECORDS_SUBDIR`

- 含义：`leetcode-coach` 记录文件在外部记录仓库中的相对子目录。
- 默认值：未设置时，使用 `leetcode-coach`。

## 期望目录结构

未设置 `LEETCODE_COACH_RECORDS_SUBDIR` 时，外部记录仓库至少应包含：

```text
$LEETCODE_COACH_RECORDS_REPO_PATH/
`-- leetcode-coach/
    |-- pattern-progress.md
    `-- training-logs/
        |-- 2026-04-16-session-01.md
        `-- ...
```

设置了 `LEETCODE_COACH_RECORDS_SUBDIR` 时，应把上面的 `leetcode-coach/` 替换成对应子目录。

## 初始化方式

如果学习者新建了一个全新的外部记录仓库，需要先自己完成初始化：把当前仓库 `skills/leetcode-coach/references/` 中的模板文件复制到外部记录仓库的 `leetcode-coach/` 目录（如果设置了 `LEETCODE_COACH_RECORDS_SUBDIR`，则复制到对应子目录）。

最低限度应复制：

- `skills/leetcode-coach/references/pattern-progress.md` → `$LEETCODE_COACH_RECORDS_REPO_PATH/${LEETCODE_COACH_RECORDS_SUBDIR:-leetcode-coach}/pattern-progress.md`
- `skills/leetcode-coach/references/training-log-template.md` → `$LEETCODE_COACH_RECORDS_REPO_PATH/${LEETCODE_COACH_RECORDS_SUBDIR:-leetcode-coach}/training-log-template.md`

同时创建 `$LEETCODE_COACH_RECORDS_REPO_PATH/${LEETCODE_COACH_RECORDS_SUBDIR:-leetcode-coach}/training-logs/`，供后续按模板落地每次训练记录。

完成这一步之后，再把外部记录仓库路径配置到 `LEETCODE_COACH_RECORDS_REPO_PATH`。

## 行为约定

1. 每次开始使用 `leetcode-coach` 前，先对外部记录仓库执行 `git pull`，确保读取的是最新记录。
2. 训练过程中读取的模式进度、历史训练记录，都应来自外部记录仓库中的文件，而不是当前仓库里的模板。
3. 产生新的训练记录或更新模式进度时，写入目标也必须是外部记录仓库中的对应文件。
4. 只在学习者明确确认“这次进度可以记档”后，才更新外部记录仓库中的 `pattern-progress.md`。
5. 本地记录一旦更新，应立即完成 `git add`、`git commit`、`git push`，不要把未推送的变更长期留在本地。

## 当前仓库中文件的角色

- `skills/leetcode-coach/references/pattern-progress.md`：模板 / 示例。
- `skills/leetcode-coach/references/training-log-template.md`：模板。
- 外部记录仓库中的对应文件：真实训练记录与唯一应被同步的 source of truth。
