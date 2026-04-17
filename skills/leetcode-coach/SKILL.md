---
name: leetcode-coach
description: 用于在 leetcode 教练场景中读取、更新并同步独立做题记录仓库，尤其适用于开始新题型前拉取记录和完成题型后回推记录的场景。
---

# 力扣做题记录同步

## 概览

这是一个面向 `leetcode-coach` 场景的**记录约束 skill**。它只做一件事：把公共 skill 和个人做题记录彻底分开，让公共仓库只保留规则、模板和同步脚本，真实做题记录托管在学习者自己的**私有 git 仓库**中。

公共仓库 `references/` 里的文件**只是模板**；真正的 `pattern-progress.md`、训练日志和同步历史，全部存在外部私有记录仓库里，并作为唯一真实记录源。

## 什么时候用

适用场景：

- 开始一个新的算法类型前，要先检查远端记录并决定接下来练什么
- 完成一个算法类型后，要更新记录并回推到远端
- 首次接入 / 切换机器时，要配置独立记录仓库
- 需要校验记录目录、模板和同步命令是否齐备

不适用场景：

- 讲解题目思路、讲评代码、安排训练路径
- 直接生成解法代码
- 与做题记录无关的 git 或工程问题

## 不可妥协的规则

1. **公共 skill 只保存规则、模板和脚本；个人做题记录必须放在学习者自己的私有 git 仓库中。**
2. **公共仓库 `references/` 里的文件一律只当模板，绝不能当真实记录源。**
3. **每次开始一个新的算法类型前，必须先执行 `node <SKILL_DIR>/records-sync.js pull`。**
4. **只有在 `pull` 成功后，才允许读取外部记录仓库中的 `pattern-progress.md` 并据此决定下一步。**
5. **每次完成一个算法类型后，只有在学习者明确确认“这一类型可以记档”时，才允许更新外部记录。**
6. **只要记录目录里的内容发生更新，就必须立刻执行 `node <SKILL_DIR>/records-sync.js push` 自动提交并推送。**
7. **未初始化、`pull` 失败或 `push` 失败时，必须明确报错并停止；不准静默回退到当前仓库模板。**

> `<SKILL_DIR>` 代指本 skill 在当前机器上的**绝对路径**（例如 `~/.agents/skills/leetcode-coach`、`~/.claude/skills/leetcode-coach`、`~/.cursor/skills/leetcode-coach` 或仓库内 `skills/leetcode-coach`）。Agent 执行命令时**必须替换为实际绝对路径**，不要依赖当前工作目录的相对路径。

## 首次配置（只执行一次）

学习者准备一个**私有** GitHub / GitLab 仓库（**仓库可以是空的，仓库名随意**，脚本不关心具体名字），然后只需一条命令：

```bash
# 把 <SKILL_DIR> 换成本 skill 的绝对路径、URL 换成你自己的私有仓库地址
node <SKILL_DIR>/records-sync.js init git@github.com:<your-name>/<your-repo>.git
```

脚本会自动完成：

- 把仓库 clone 到 `~/.leetcode-coach/records/`
- 生成 `pattern-progress.md`、`training-log-template.md`、`training-logs/.gitkeep`
- 写入配置文件 `~/.leetcode-coach/config.json`
- 生成初始 commit 并 push 到远端（`push -u origin <branch>`）

这一步完成之后，**后续所有流程都不再需要环境变量或手动配置**。

## 启动检查（每次开始新类型前）

按这个顺序执行：

1. 运行 `node <SKILL_DIR>/records-sync.js pull`
   - 如果学习者还没 init，脚本会明确报错，提示先运行 `init`
   - 如果本地目录丢失，脚本会根据配置文件自动重新 clone
   - 如果远端无可拉取提交，会自动跳过 pull，确保模板齐备
2. 只有 `pull` 成功后，才读取外部记录仓库里的 `pattern-progress.md`
3. 基于最新记录决定接下来练什么

启动检查失败时，直接告诉学习者先修复仓库或重新 init，不要继续依赖本地旧记录。

## 归档与同步（每个类型完成后）

当一个算法类型完成，并且学习者明确允许记档：

1. 更新外部记录仓库中的 `pattern-progress.md`
2. 按需在 `training-logs/` 下追加本次训练记录
3. 立刻执行 `node <SKILL_DIR>/records-sync.js push`

`push` 会自动完成 `git add -A` + `commit` + `push`。如果 `push` 失败，必须明确说明：**本地记录已更新，但远端尚未同步成功。**

## 快速对照

| 场景 | 应该做什么 | 不要做什么 |
| :--- | :--- | :--- |
| 新设备 / 首次接入 | 运行一次 `init <git-url>` | 手动 clone + 手动配 env |
| 开始新类型 | 先 `pull`，再读远端记录决定下一步 | 直接按本地旧记录继续 |
| 本地目录丢失 | 直接 `pull` 即可自动恢复 | 手动重新 clone |
| 一个类型练完 | 确认可以记档后更新并 `push` | 没确认就改 `pattern-progress.md` |
| `push` 失败 | 明确说明远端未同步成功 | 假装已经同步完成 |

## 命令速查

```bash
node <SKILL_DIR>/records-sync.js init <git-url>  # 首次配置
node <SKILL_DIR>/records-sync.js pull            # 开始新类型前
node <SKILL_DIR>/records-sync.js push [-m msg]   # 一个类型完成后
node <SKILL_DIR>/records-sync.js status          # 查看配置和本地状态
```

执行前务必把 `<SKILL_DIR>` 替换成 skill 在当前机器上的实际绝对路径。

## 参考资料

- 模式进度模板：[references/pattern-progress.md](references/pattern-progress.md)
- 单次训练日志模板：[references/training-log-template.md](references/training-log-template.md)
- 外部记录仓库布局说明：[references/records-repo-layout.md](references/records-repo-layout.md)
- 自动同步脚本：[records-sync.js](records-sync.js)
