# 外部记录仓库布局说明

`leetcode-coach` 是一个公共 skill，因此个人训练记录不应存放在当前仓库里，而应放在一个由学习者自己维护的、可同步到远端的**私有 git 仓库**中。

这个文件只定义约定；真正被读取和更新的是外部记录仓库里的副本。

## 环境变量

### 必填：`LEETCODE_COACH_RECORDS_REPO_PATH`

- 含义：外部记录仓库在**用户自己电脑上**的本地绝对路径。
- 这不是远程仓库 URL，也不是当前 skill 仓库路径；它应该指向你 clone 下来的那个私有记录仓库根目录。
- 推荐写法：使用 `$HOME`，例如 `export LEETCODE_COACH_RECORDS_REPO_PATH="$HOME/code/leetcode-records"`。
- 配置位置：通常写进 `~/.zshrc` 或 `~/.bashrc`。
- 生效方式：保存后执行 `source ~/.zshrc` 或 `source ~/.bashrc`。
- 验证方式：运行 `echo $LEETCODE_COACH_RECORDS_REPO_PATH`，确认输出的是正确的本地目录。
- 要求：路径必须存在，而且必须是一个 git 仓库。
- 建议：该仓库使用私有托管，避免把个人做题记录暴露在公共仓库中。

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

如果学习者 clone 下来的是一个空私有仓库，不需要自己手动复制模板文件。

只要配置好 `LEETCODE_COACH_RECORDS_REPO_PATH`，然后执行：

```bash
node skills/leetcode-coach/records-sync.js pull
```

脚本会自动在 `$LEETCODE_COACH_RECORDS_REPO_PATH/${LEETCODE_COACH_RECORDS_SUBDIR:-leetcode-coach}/` 下创建：

- `pattern-progress.md`
- `training-log-template.md`
- `training-logs/`

其中 `training-logs/` 会带一个占位文件，确保空目录也能被 git 正常同步。

如果仓库不是空的，但这些内容缺失，则会明确报错，不会静默补齐。

## 行为约定

1. 每次开始一个新类型前，先执行 `node skills/leetcode-coach/records-sync.js pull`，确保读取的是最新记录。
2. 训练过程中读取的模式进度、历史训练记录，都应来自外部记录仓库中的文件，而不是当前仓库里的模板。
3. 产生新的训练记录或更新模式进度时，写入目标也必须是外部记录仓库中的对应文件。
4. 只在学习者明确确认“当前这个类型可以记档”后，才更新外部记录仓库中的 `pattern-progress.md`。
5. 本地记录一旦更新，应立即执行 `node skills/leetcode-coach/records-sync.js push`，自动完成 `git add`、`git commit`、`git push`，不要把未推送的变更长期留在本地。

## 自动同步脚本

当前仓库提供：

```bash
node skills/leetcode-coach/records-sync.js pull
node skills/leetcode-coach/records-sync.js push --message "docs: sync leetcode practice progress"
```

- `pull`：校验环境变量、仓库根目录；如果私有仓库是空仓，则先自动初始化记录目录和必需文件，再执行远端拉取检查。
- `push`：把记录目录变更自动加入暂存区、生成提交并推送到远端。

## 当前仓库中文件的角色

- `skills/leetcode-coach/references/pattern-progress.md`：模板 / 示例。
- `skills/leetcode-coach/references/training-log-template.md`：模板。
- 外部记录仓库中的对应文件：真实训练记录与唯一应被同步的 source of truth。
