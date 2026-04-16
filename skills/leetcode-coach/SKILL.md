---
name: leetcode-coach
description: 用于在 leetcode 教练场景中读取、更新并同步独立做题记录仓库，尤其适用于开始新题型前拉取记录和完成题型后回推记录的场景。
---

# 力扣做题记录同步

## 概览

这是一个面向 `leetcode-coach` 场景的**记录约束 skill**。它只负责一件事：把公共 skill 和个人做题记录彻底分开，让公共仓库只保存规则、模板和同步工具，而把真实做题记录托管在学习者自己的**私有 git 仓库**中。

当前仓库 `skills/leetcode-coach/references/` 里的文件都只是模板；真正的 `pattern-progress.md`、训练日志和同步历史，必须存在外部记录仓库里，并以它作为唯一真实记录源。

## 什么时候用

下面这些场景使用本技能：

- 开始一个新的算法类型前，要先检查远端记录并决定接下来练什么
- 完成一个算法类型后，要更新记录并回推到远端
- 需要确认个人做题记录是否放在独立私有仓库中
- 需要校验记录目录、模板文件和同步命令是否齐备

下面这些场景不要使用本技能：

- 讲解题目思路、讲评代码、安排训练路径
- 直接生成解法代码
- 与做题记录无关的 git 或工程问题

## 不可妥协的规则

1. **公共 skill 只保存规则、模板和脚本；个人做题记录必须放在学习者自己的私有 git 仓库中。**
2. **当前仓库 `references/` 里的文件一律只当模板，绝不能当真实记录源。**
3. **每次准备开始一个新的算法类型前，必须先执行 `node skills/leetcode-coach/records-sync.js pull`。**
4. **只有在 `pull` 成功后，才允许读取外部记录仓库中的 `pattern-progress.md` 并据此决定下一步。**
5. **每次完成一个算法类型后，只有在学习者明确确认“这一类型可以记档”时，才允许更新外部记录。**
6. **只要记录目录里的内容发生更新，就必须立刻执行 `node skills/leetcode-coach/records-sync.js push` 自动提交并推送。**
7. **缺少配置、路径不存在、不是 git 仓库、记录目录缺失、`pull` 失败或 `push` 失败时，必须明确报错并停止；不准静默回退到当前仓库模板。**

## 启动检查

开始新类型前，按这个顺序检查：

1. `LEETCODE_COACH_RECORDS_REPO_PATH` 已配置，并且指向一个本地 git 仓库根目录
2. `LEETCODE_COACH_RECORDS_SUBDIR` 未设置时默认使用 `leetcode-coach/`；设置后使用对应子目录
3. 如果私有记录仓库是空仓，执行 `node skills/leetcode-coach/records-sync.js pull` 时会自动初始化 `pattern-progress.md`、`training-log-template.md` 和 `training-logs/`
4. 如果仓库不是空的，但记录目录或必需文件缺失，必须明确报错并停止
5. 必要时先用 `echo $LEETCODE_COACH_RECORDS_REPO_PATH` 确认环境变量已经在当前 shell 中生效
6. 执行 `node skills/leetcode-coach/records-sync.js pull`
7. 只有 `pull` 成功后，才读取外部记录仓库里的 `pattern-progress.md`

如果启动检查失败，直接告诉学习者先修复仓库或配置，不要继续依赖本地旧记录。

## 归档与同步

当一个算法类型完成并且学习者明确允许记档时：

1. 更新外部记录仓库中的 `pattern-progress.md`
2. 按需在 `training-logs/` 下追加本次训练记录
3. 立刻执行 `node skills/leetcode-coach/records-sync.js push`

如果 `push` 失败，必须明确说明：**本地记录已更新，但远端尚未同步成功。**

## 快速对照

| 场景 | 应该做什么 | 不要做什么 |
| :--- | :--- | :--- |
| 开始新类型 | 先 `pull`，再读远端记录决定下一步 | 直接按本地旧记录继续 |
| 空私有仓库首次接入 | 执行 `pull` 自动初始化模板和目录 | 手动回退到当前仓库模板记档 |
| 非空仓缺文件 | 明确报错并停止 | 偷偷补齐后继续 |
| 一个类型练完 | 先确认可以记档，再更新记录并 `push` | 没确认就改 `pattern-progress.md` |
| `push` 失败 | 明确说明远端未同步成功 | 假装已经同步完成 |

## 参考资料

- 模式进度模板：[references/pattern-progress.md](references/pattern-progress.md)
- 单次训练日志模板：[references/training-log-template.md](references/training-log-template.md)
- 外部记录仓库布局说明：[references/records-repo-layout.md](references/records-repo-layout.md)
- 自动同步脚本：[records-sync.js](records-sync.js)
- 仓库级同步说明：[../../docs/leetcode-record-sync.md](../../docs/leetcode-record-sync.md)
