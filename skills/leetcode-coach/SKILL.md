---
name: leetcode-coach
description: 用于在 leetcode 教练场景中读取、更新并同步独立做题记录仓库，尤其适用于开始新题型前拉取记录和完成题型后回推记录的场景。
---

# 力扣做题记录同步

这个 skill 只做**一件事**：把公共 skill 和个人做题记录彻底分开，让公共仓库只保留规则 / 工具 / 模板，真实做题记录托管在学习者自己的**私有 git 仓库**中。

操作说明、原理图、命令速查详见 [README.md](README.md)。本文件只列**agent 必须遵守的规则**。

## 什么时候触发

- 学习者要开始新题型前 → 先 `pull`，再读外部 `pattern-progress.md` 决定下一步
- 学习者明确说"这一题可以记档"后 → 更新外部记录，然后立刻 `push`
- 首次接入 / 换机器 → 提示学习者执行一次 `init <git-url>`

不该用本 skill 的场景：讲解题目思路、直接写解法代码、与做题记录无关的 git 问题。

## 不可妥协的规则

1. **公共 skill 的 `references/` 只能作为模板种子；真实记录永远在外部私有仓库，绝不能把模板当记录源。**
2. **每次开始新类型前，必须先执行 `node <SKILL_DIR>/records-sync.js pull`，失败时停止，不准静默回退。**
3. **只有 `pull` 成功后，才允许读取外部 `pattern-progress.md` 决定下一步。**
4. **只有在学习者明确确认"这一题可以记档"时，才能更新外部记录。**
5. **记录目录内容一旦更新，必须立刻执行 `node <SKILL_DIR>/records-sync.js push`。**
6. **未初始化 / `pull` 失败 / `push` 失败时，必须明确报错并停止；特别是 `push` 失败要告知"本地已更新，远端未同步成功"。**

> `<SKILL_DIR>` 代指本 skill 在当前机器上的**绝对路径**（例如 `~/.agents/skills/leetcode-coach`、`~/.claude/skills/leetcode-coach`、`~/.cursor/skills/leetcode-coach` 或仓库内 `skills/leetcode-coach`）。Agent 执行命令时必须替换为实际绝对路径，不要依赖当前工作目录的相对路径。

## 记档时要写的最小字段

每次记档，agent 应引导学习者在训练日志里至少填满这四项（详见 [training-log-template.md](references/training-log-template.md)）：

1. **核心不变量**：这道题剥到最后在考什么常量关系？
2. **触发信号**：下次什么"气味"应该想到这个模式？
3. **关键失误**：今天的卡点 / 弯路 / 边界漏洞。
4. **下一题建议**：一道邻近题或邻近模式。

若涉及一个**新模式**或现有模式的**重要补充**，还应更新对应 `patterns/<pattern-slug>.md` 的深度档案，至少写"核心不变量 + 触发信号 + 最小骨架"三项。

## 命令速查

```bash
node <SKILL_DIR>/records-sync.js init <git-url>  # 首次配置
node <SKILL_DIR>/records-sync.js pull            # 开始新类型前
node <SKILL_DIR>/records-sync.js push [-m msg]   # 一个类型完成后
node <SKILL_DIR>/records-sync.js status          # 查看配置和本地状态
```

## 参考资料

- [README.md](README.md)：原理、三层架构图、操作说明、故障处理
- [references/pattern-progress.md](references/pattern-progress.md)：模式进度总表模板
- [references/pattern-profile-template.md](references/pattern-profile-template.md)：单模式深度档案模板
- [references/training-log-template.md](references/training-log-template.md)：单题训练日志模板
- [references/coach-protocol.md](references/coach-protocol.md)：**可选**的教练协议（不是本 skill 的强制行为，但值得教练 agent 读一遍）
- [records-sync.js](records-sync.js)：自动同步工具
