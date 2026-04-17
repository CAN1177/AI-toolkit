# leetcode-coach

`leetcode-coach` 只负责**做题记录仓库的约束与同步**，不把个人训练记录放进公共 skill 仓库里。

核心目的：

1. 公共 skill 仓库 → 只保留规则、模板、同步脚本
2. 使用者 → 把自己的做题记录托管到**独立的私有 git 仓库**
3. 每次“开始新类型”和“完成一个类型”，强制走 pull / push 流程

## 先找到 skill 的实际路径

这个 skill 可能被不同 agent 框架装到不同目录，先定位它在你本机的位置：

```bash
# 常见安装位置（选一个存在的）
ls ~/.agents/skills/leetcode-coach   # agents 规范
ls ~/.claude/skills/leetcode-coach   # Claude Code
ls ~/.cursor/skills/leetcode-coach   # Cursor
ls ./skills/leetcode-coach           # 本仓库内
```

为了下文方便，定义一个 shell 变量（一次性输入，当前终端有效）：

```bash
export LC_SKILL_DIR="$HOME/.agents/skills/leetcode-coach"   # 换成你实际的路径
```

> 这个变量**只是为了让命令更短**，不是 skill 必需的环境变量。

## 极简配置（一条命令搞定）

先准备一个**私有** GitHub / GitLab 仓库（**可以是空仓**），仓库名随意（例如 `leetcode-records`、`algo-journal`、`my-lc-log` 都可以），然后只运行一次：

```bash
# 把下面的 URL 换成你自己的私有仓库地址即可，仓库名不强制
node "$LC_SKILL_DIR/records-sync.js" init git@github.com:<your-name>/<your-repo>.git
```

脚本会自动完成：

- 把仓库 clone 到 `~/.leetcode-coach/records/`
- 生成 `pattern-progress.md`、`training-log-template.md`、`training-logs/.gitkeep`
- 写入配置 `~/.leetcode-coach/config.json`
- 生成初始 commit 并 push 到远端

**不需要改 `.zshrc`，不需要设任何 skill 相关的环境变量。**

## 日常命令

```bash
node "$LC_SKILL_DIR/records-sync.js" pull   # 开始新类型前
node "$LC_SKILL_DIR/records-sync.js" push   # 一个类型完成后
node "$LC_SKILL_DIR/records-sync.js" status # 查看当前状态
```

- `pull`：如果本地目录丢失，会根据配置自动重新 clone；远端无提交时跳过 pull；缺模板自动补齐。
- `push`：自动 `git add -A` + `commit` + `push`；首次推送会自动 `-u origin <branch>`。
- `status`：显示配置文件、远程仓库、本地路径、当前分支等。

## 想要更短？做一个持久 alias（可选）

把下面两行加到 `~/.zshrc` 或 `~/.bashrc`，以后在任何目录都能用 `lc-sync` 短命令：

```bash
export LC_SKILL_DIR="$HOME/.agents/skills/leetcode-coach"
alias lc-sync='node "$LC_SKILL_DIR/records-sync.js"'
```

保存后 `source ~/.zshrc`，之后只需：

```bash
lc-sync init git@github.com:<your-name>/<your-repo>.git
lc-sync pull
lc-sync push
lc-sync status
```

## 换机器 / 新设备

```bash
node "$LC_SKILL_DIR/records-sync.js" init git@github.com:<your-name>/<your-repo>.git
```

同一条命令，脚本识别远程仓库已有内容，只会 clone 下来，不会覆盖。

## 文件说明

| 文件 | 作用 |
| :--- | :--- |
| `SKILL.md` | 做题记录仓库的读取、校验、更新与同步规则 |
| `records-sync.js` | `init` / `pull` / `push` / `status`，自动化 git 同步 |
| `references/pattern-progress.md` | 题型维度进度模板 |
| `references/training-log-template.md` | 单次训练日志模板 |
| `references/records-repo-layout.md` | 私有记录仓库的目录约定 |

## 为什么要独立仓库

`leetcode-coach` 是公共 skill，会被多人安装复用；而做题记录是**个人数据**，必须独立托管：

- 公共仓库 → 只放 skill 规则、模板、同步工具
- 私有仓库 → 只放个人的 `pattern-progress.md`、训练日志、同步历史
- 公共仓库 `references/` → 只当模板，绝不是个人真实记录

## 自定义（可选）

脚本使用以下约定，大部分情况**不需要关心**：

- 配置文件：`~/.leetcode-coach/config.json`
- 默认本地仓库路径：`~/.leetcode-coach/records`
- 默认分支：跟随远端

如果需要把本地路径改到别处，可通过环境变量覆盖：

```bash
export LEETCODE_COACH_RECORDS_REPO_PATH="$HOME/code/leetcode-records"
```

## 同步失败时的处理

- `pull` 失败：停止继续训练，先修复同步问题
- `push` 失败：明确说明“本地记录已更新，但远端未同步成功”
- 未 init 就运行 pull/push：脚本明确提示先运行 `init <git-url>`
- `Cannot find module '.../records-sync.js'`：命令里的路径不是 skill 实际位置，参考"先找到 skill 的实际路径"一节修正

## 模板文件角色

当前仓库保留的模板只用于**初始化**私有记录仓库：

- `references/pattern-progress.md`
- `references/training-log-template.md`
- `references/records-repo-layout.md`

真实记录始终存在私有仓库里。
