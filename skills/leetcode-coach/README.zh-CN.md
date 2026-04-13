# leetcode-coach

`leetcode-coach` 是一个面向 LeetCode 与算法面试训练的中文教练型 skill。它保留了原来的“先教思路，后给代码”分阶段训练方式，同时补充了轻量的全局模式进度记录，以及在用户卡概念时更通俗易懂的解释方式。

English version: [README.md](README.md)

## 文件说明

| 文件 | 作用 |
| :--- | :--- |
| `SKILL.md` | skill 的核心规则、训练阶段流程、概念救援模式、进度记录要求 |
| `references/pattern-ladder.md` | 推荐的算法模式进阶顺序，用来决定下一题练什么 |
| `references/pattern-progress.md` | 全局算法类型学习记录，每种模式一条 |
| `references/training-log-template.md` | 可选的单次训练总结模板 |
| `playground.js` | 本地练习或临时实验用的 playground |

## 推荐使用流程

1. 开始新一轮训练前，先看 `references/pattern-progress.md`。
2. 优先根据当前薄弱模式选题，而不是重复舒适区里的题。
3. 如果用户卡在某个概念上，先用白话解释、生活类比和最小例子讲清楚，再继续推代码。
4. 验证环节保持轻量，方向已经对了就确认关键点后继续推进。
5. 当用户完成或有效练习了一个算法类型后，更新 `references/pattern-progress.md` 对应那一行。

## 全局进度文件

`references/pattern-progress.md` 刻意保持简单：

- 每种算法类型一行
- 以汇总更新为主，不堆很长的单次日志
- 信息只保留到足够支持“下一步练什么”为止

建议维护这些字段：

- `Status`
- `Last practiced`
- `Weak point`
- `Next suggested problem`

如果只需要一次训练的小结，再使用 `references/training-log-template.md`。
