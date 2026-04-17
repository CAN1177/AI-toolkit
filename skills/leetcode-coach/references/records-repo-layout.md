# 外部记录仓库布局说明

`leetcode-coach` 是公共 skill，所以**个人训练记录不应存放在公共仓库里**，而应放在由学习者自己维护的、可同步到远端的**私有 git 仓库**中。

这个文件只定义约定；真正被读取和更新的是外部私有记录仓库里的副本。

## 极简配置

只需一条命令完成所有配置：

```bash
node skills/leetcode-coach/records-sync.js init <git-url>
```

脚本会：

- 把远端仓库 clone 到 `~/.leetcode-coach/records/`
- 自动生成记录模板
- 写入配置 `~/.leetcode-coach/config.json`
- 生成初始 commit 并 push

之后 `pull` / `push` 都**完全自动**，不需要任何环境变量。

## 期望目录结构

初始化完成后，私有记录仓库里会包含：

```text
<records-repo>/
|-- pattern-progress.md
|-- training-log-template.md
`-- training-logs/
    |-- .gitkeep
    |-- 2026-04-16-session-01.md
    `-- ...
```

整个仓库根目录就是记录目录，**不再需要子目录**。

## 配置文件

配置存放在 `~/.leetcode-coach/config.json`：

```json
{
  "remoteUrl": "git@github.com:user/leetcode-records.git",
  "localPath": "/Users/<user>/.leetcode-coach/records"
}
```

脚本会自动维护这个文件，一般**无需手动编辑**。

## 可选环境变量

所有变量都是**可选**，只在需要覆盖默认行为时使用：

| 变量 | 用途 |
| :--- | :--- |
| `LEETCODE_COACH_RECORDS_REPO_PATH` | 覆盖本地记录仓库路径 |
| `LEETCODE_COACH_RECORDS_COMMIT_MESSAGE` | 覆盖默认提交信息 |

## 行为约定

1. 每次开始新类型前，先执行 `node records-sync.js pull`，确保读取最新记录。
2. 训练中读取的模式进度、历史训练记录，都来自**外部记录仓库**，不是公共仓库模板。
3. 产生新训练记录或更新模式进度时，写入目标也必须是外部记录仓库中的对应文件。
4. 只在学习者明确确认“可以记档”后，才更新 `pattern-progress.md`。
5. 本地记录一旦更新，立即执行 `node records-sync.js push` 自动提交并推送。

## 自动同步脚本

```bash
node skills/leetcode-coach/records-sync.js init <git-url>  # 首次配置
node skills/leetcode-coach/records-sync.js pull            # 每次开始新类型前
node skills/leetcode-coach/records-sync.js push [-m <msg>] # 完成一个类型后
node skills/leetcode-coach/records-sync.js status          # 查看当前状态
```

- `pull`：本地目录丢失时自动恢复；远端无提交时跳过 pull；缺模板自动补齐。
- `push`：自动 `git add -A` + `commit` + `push`；首次推送自动 `-u origin <branch>`。

## 公共仓库中文件的角色

- `references/pattern-progress.md`：模板 / 示例
- `references/training-log-template.md`：模板
- 外部记录仓库中的对应文件：**真实训练记录，唯一应被同步的 source of truth**
