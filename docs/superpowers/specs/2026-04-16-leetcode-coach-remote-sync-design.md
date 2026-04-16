# leetcode-coach 远程做题记录同步设计

## 背景

`skills/leetcode-coach` 当前把做题记录默认放在 skill 自带的 `references/` 目录里，其中 `pattern-progress.md` 是模式级学习台账。现状适合本地模板维护，但不适合把个人做题记录持续同步到独立仓库。

这次改动要把“记录模板”和“个人记录”分开：

- skill 仓库继续保存模板、规则和说明；
- 用户自己的做题记录保存在单独的本地 git 仓库里；
- 每次使用 skill 时，先从记录仓库拉取最新内容；
- 每次本地记录更新后，立刻提交并推送到远端；
- 如果本地没有配置对应记录仓库，就直接提示所需配置，而不是静默退回到模板文件。

## 目标

1. 支持把 leetcode 做题记录同步到用户自己的独立仓库。
2. 每次使用 `leetcode-coach` 时，先检查并拉取远端最新记录。
3. 每次更新完本地记录后，立即执行 `git add`、`git commit`、`git push`。
4. 当本地没有配置或没有对应记录仓库时，给出明确提示和必需配置。
5. 更新与该行为相关的 skill 文档和说明文件。

## 非目标

- 不改动 `leetcode-coach` 的训练阶段规则。
- 不把整个 `skills/leetcode-coach` 目录镜像到用户仓库。
- 不自动 clone 远端仓库；用户自行准备并 clone 本地记录仓库。
- 不引入静默 fallback 到 skill 内置 `references/pattern-progress.md` 作为个人记录源。

## 推荐方案

采用“独立记录仓库路径 + 环境变量配置 + 只同步 leetcode 做题记录相关文件”的方案。

理由：

- 个人记录与 skill 源码彻底解耦；
- 配置简单，行为清晰，可预测；
- 不需要把 clone、目录生命周期、权限处理塞进 skill；
- 能严格满足“先拉后用、更新即推、缺仓强提示”的要求。

## 配置约定

### 必填环境变量

- `LEETCODE_COACH_RECORDS_REPO_PATH`
  - 含义：用户自己的 leetcode 做题记录仓库在本地的绝对路径。
  - 要求：路径存在，且是一个 git 仓库。

### 可选环境变量

- `LEETCODE_COACH_RECORDS_SUBDIR`
  - 含义：记录文件在记录仓库中的相对子目录。
  - 默认：未设置时，使用仓库内的 `leetcode-coach/` 目录。

## 记录文件边界

远程同步范围只覆盖 leetcode 做题记录相关文件，不同步整个 skill 目录。

最小范围：

- `pattern-progress.md`

可扩展范围：

- `training-log-template.md` 对应实例化后的单次训练记录文件；
- 后续新增的 leetcode 记录文件，但必须仍然归属于记录仓库中的 `leetcode-coach/` 记录目录。

skill 仓库中的 `skills/leetcode-coach/references/` 继续作为模板和默认结构说明，不再作为个人记录的唯一真实来源。

## 运行时流程

### 1. 每次使用前的检查与拉取

在开始新一轮训练前，先执行以下检查：

1. 检查 `LEETCODE_COACH_RECORDS_REPO_PATH` 是否已设置。
2. 检查该路径是否存在。
3. 检查该路径是否为 git 仓库。
4. 解析记录目录：`$LEETCODE_COACH_RECORDS_REPO_PATH/$LEETCODE_COACH_RECORDS_SUBDIR`，未设置子目录时默认落到 `leetcode-coach/`。
5. 检查记录目录下的必需记录文件是否存在。
6. 检查通过后，先执行 `git fetch` 与 `git pull`，把远端最新做题记录同步到本地。
7. 后续读取记录时，以记录仓库中的同步文件为准。

### 2. 每次更新后的提交与推送

只有当学习者明确确认当前模式/类型可以记档时，才允许更新记录。

更新顺序固定为：

1. 更新记录仓库中的本地记录文件；
2. 执行 `git add`；
3. 生成同步提交；
4. 执行 `git push`；
5. push 成功后，才算远端同步完成。

## 缺仓与缺配置提示

当出现以下任一情况时，skill 必须直接提示用户完成配置：

- `LEETCODE_COACH_RECORDS_REPO_PATH` 未设置；
- 路径不存在；
- 路径不是 git 仓库；
- 记录子目录不存在；
- 必需记录文件不存在。

提示内容必须明确包含：

1. 需要准备一个自己的做题记录仓库；
2. 需要先把该仓库 clone 到本地；
3. 需要设置 `LEETCODE_COACH_RECORDS_REPO_PATH=/absolute/path/to/your/repo`；
4. 如果记录不放在默认目录，可选设置 `LEETCODE_COACH_RECORDS_SUBDIR=leetcode-coach`；
5. 记录仓库中需要包含 leetcode 做题记录相关文件。

## 失败处理

### 拉取失败

- 停止本次基于远端记录的训练初始化；
- 直接提示用户先解决同步问题；
- 不继续使用旧的本地记录副本冒充最新状态。

### 本地记录更新失败

- 直接报错；
- 不进入 `git add` / `git commit` / `git push`。

### 推送失败

- 明确提示：“本地记录已更新，远端未同步成功”；
- 不伪装成同步成功。

## 文档与文件改动范围

至少更新以下文件：

- `skills/leetcode-coach/SKILL.md`
  - 增加远程同步规则：开始前检查并拉取，更新后立即提交并推送，缺配置时报明确提示。
- `skills/leetcode-coach/README.md`
  - 增加英文说明：记录仓库准备步骤、环境变量配置、同步时机、失败语义。
- `skills/leetcode-coach/README.zh-CN.md`
  - 增加中文说明：记录仓库准备步骤、环境变量配置、同步时机、失败语义。
- `skills/leetcode-coach/references/`
  - 明确这些文件是模板或默认结构说明，个人记录应放在外部记录仓库中。

如果实现中需要新增辅助说明文件，应仅围绕 leetcode 做题记录同步，不引入与当前需求无关的结构。

## 测试与验证重点

1. 缺少环境变量时，是否输出所需配置。
2. 配置路径不存在时，是否输出明确提示。
3. 路径不是 git 仓库时，是否输出明确提示。
4. 使用前是否明确要求先拉取远端最新记录。
5. 本地记录更新后，是否明确要求先提交再推送。
6. push 失败时，是否把“本地已更新、远端未同步”表达清楚。
7. 文档是否完整覆盖配置、同步顺序、缺仓提示和失败处理。

## 实施建议

实现时优先把“同步行为约定”写进 `SKILL.md` 与 README，然后再补齐需要同步的记录目录约定。这样即使后续执行环境不同，agent 也能基于同一套规则稳定执行。
