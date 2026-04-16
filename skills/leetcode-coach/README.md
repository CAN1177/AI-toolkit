# 力扣教练

`leetcode-coach` 是一个面向国内力扣与算法面试训练的中文教练型技能。它保留了原来的“先教思路，后给代码”分阶段训练方式，并把“题目全文展示、关键词白话解释、切换算法类型前必须得到用户确认、确认后再更新记录”都提升为硬规则。

[中文说明](README.zh-CN.md)

## 文件说明

| 文件 | 作用 |
| :--- | :--- |
| `SKILL.md` | 技能的核心规则、训练阶段流程、概念救援模式、进度记录要求 |
| `references/pattern-ladder.md` | 推荐的算法模式进阶顺序，用来决定下一题练什么 |
| `references/pattern-progress.md` | 全局算法类型学习记录模板，每种模式一条 |
| `references/training-log-template.md` | 可选的单次训练总结模板 |
| `references/records-repo-layout.md` | 定义外部记录仓库结构、必需环境变量和同步流程 |
| `records-sync.js` | 自动拉取远端记录，或自动提交并推送记录目录变更 |
| `../../docs/leetcode-record-sync.md` | 仓库级做题记录远程同步说明 |
| `playground.js` | 本地临时实验用的练习文件 |

## 记录仓库配置

`leetcode-coach` 现在默认把个人做题记录放在**外部 git 仓库**里，而不是直接把当前 skill 仓库下的 `references/` 当成真实记录源。

1. 准备一个你自己的 leetcode 做题记录仓库。
2. 先 clone 到本地。
3. 配置 `LEETCODE_COACH_RECORDS_REPO_PATH=/absolute/path/to/your/repo`，让 skill 能找到这个仓库根目录。
4. 如果记录不放在默认 `leetcode-coach/` 子目录，再配置 `LEETCODE_COACH_RECORDS_SUBDIR=your/subdir`。
5. 按 `references/records-repo-layout.md` 的说明，把 `pattern-progress.md`、`training-log-template.md` 和 `training-logs/` 初始化到外部记录目录里。

## 自动同步命令

```bash
node skills/leetcode-coach/records-sync.js pull
node skills/leetcode-coach/records-sync.js push --message "docs: sync leetcode practice progress"
```

- `pull`：在开始训练前自动检查配置、校验目录并执行远端拉取。
- `push`：在更新完记录后，自动执行 `git add`、`git commit`、`git push`。
- 如果不传 `--message`，脚本会使用默认提交信息。

## 推荐使用流程

1. 每次开始新一轮训练前，先检查外部记录仓库配置，并执行 `node skills/leetcode-coach/records-sync.js pull`。
2. 训练时读取外部记录目录里的 `pattern-progress.md`，不要把当前仓库 `references/` 里的模板直接当成真实记录。
3. 默认从国内力扣（`leetcode.cn`）选题，并把题目完整给出，不要只做摘要式转述。
4. 在推动学习者作答前，先把题目里的重要关键词用白话解释清楚。
5. 如果学习者卡在某个概念上，先用白话解释、生活类比和最小例子讲清楚，再继续推代码。
6. 验证保持轻量，方向明显对了就确认关键点后继续推进。
7. 当前算法类型没完成、没得到学习者明确确认前，不要切到下一个类型。
8. 只有在得到确认后，才更新外部记录目录里的 `pattern-progress.md`；本地记录一旦更新，立刻执行 `node skills/leetcode-coach/records-sync.js push`。

## 全局进度文件

当前仓库里的 `references/pattern-progress.md` 刻意保持简单，它只是模板；真正的个人记录应该存在外部记录仓库中。

- 每种算法类型一行
- 以汇总更新为主，不堆很长的单次日志
- 信息只保留到足够支持“下一步练什么”为止
- 只有在学习者明确确认当前类型阶段完成后才更新

建议维护这些字段：

- `状态`
- `最近练习`
- `薄弱点`
- `下一题建议`

如果只需要一次训练的小结，再使用 `references/training-log-template.md` 作为模板，并把生成结果写进外部记录仓库的 `training-logs/` 目录。

## 同步规则

1. 每次使用前先检查外部记录仓库和记录目录是否存在。
2. `records-sync.js` 会在 `LEETCODE_COACH_RECORDS_REPO_PATH` 指向的仓库根目录自动执行 `git pull`、`git add`、`git commit`、`git push`。
3. 真正被读取和写入的记录文件，在默认 `leetcode-coach/` 子目录或 `LEETCODE_COACH_RECORDS_SUBDIR` 指向的子目录里。
4. 如果 `node skills/leetcode-coach/records-sync.js pull` 失败，就先解决同步问题，不能继续依赖旧的本地记录训练。
5. 如果 `node skills/leetcode-coach/records-sync.js push` 失败，要明确视为“本地已更新，远端未同步成功”。

更完整的仓库级操作说明见 [../../docs/leetcode-record-sync.md](../../docs/leetcode-record-sync.md)。
