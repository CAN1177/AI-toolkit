# leetcode-coach 空私有仓库自动初始化设计

## 背景

`skills/leetcode-coach` 当前要求使用者把个人做题记录放到独立私有 git 仓库中，并通过：

- `LEETCODE_COACH_RECORDS_REPO_PATH`
- `LEETCODE_COACH_RECORDS_SUBDIR`

把本地 clone 下来的记录仓库接入同步流程。

现状中，`records-sync.js pull` 会在记录目录不存在或缺少必需文件时直接报错；README、`SKILL.md` 和 `references/records-repo-layout.md` 也要求用户手动把模板复制到私有仓库中。这导致“空私有仓库首次接入”仍然需要人工初始化，和预期不符。

## 目标

1. 当私有记录仓库是空仓或尚未初始化记录目录时，`node skills/leetcode-coach/records-sync.js pull` 能自动写入所需模板文件和目录。
2. 自动初始化来源固定为当前 skill 仓库中的 `skills/leetcode-coach/references/`。
3. 只放宽“空仓首次初始化”这个场景；已有内容但结构损坏时，仍然明确报错并停止。
4. 相关 skill 文档同步更新，避免继续要求用户手动初始化空仓。

## 非目标

- 不新增独立 `init` 命令。
- 不在 `push` 时自动初始化。
- 不自动 clone、创建远程仓库或修改用户的 git 远端配置。
- 不在非空仓缺文件时静默补齐模板。

## 方案选择

### 推荐方案：在 `pull` 时处理空仓初始化

`pull` 本来就是开始新一轮训练前的强制入口，放在这里处理首次初始化最自然：

- 用户只需要准备并 clone 一个私有仓库；
- 配置好环境变量后，首次执行 `pull` 即可得到完整记录目录；
- 初始化完成后继续沿用现有的 pull / 更新 / push 流程。

### 备选方案 1：总是自动补齐缺失项

不采用。原因是这会掩盖误删文件、目录损坏等真实异常，与当前 skill “发现缺项就明确报错停止”的约束冲突。

### 备选方案 2：新增独立 `init` 命令

不采用。原因是这仍然要求用户显式多走一步，没有解决“空仓首次接入还得手动初始化”的核心问题。

## 设计

### 1. 空仓判定

`records-sync.js pull` 在确认 `LEETCODE_COACH_RECORDS_REPO_PATH` 指向本地 git 仓库后，增加空仓初始化判断：

1. 解析记录目录：`${repoRoot}/${LEETCODE_COACH_RECORDS_SUBDIR:-leetcode-coach}`。
2. 如果记录目录已存在，则继续沿用现有必需项校验。
3. 如果记录目录不存在，再检查仓库是否处于“首次初始化”场景。

“首次初始化”场景限定为以下之一：

- 仓库工作树没有任何已跟踪或未跟踪内容；
- 仓库存在但尚未建立 `recordsSubdir`，且整体仍可视为一份空记录仓库。

实现上应尽量用 git 状态和仓库目录内容做显式判断，不依赖模糊猜测。

### 2. 自动初始化内容

只有在确认是空仓首次初始化场景时，脚本才执行以下动作：

1. 创建记录目录 `${recordsSubdir}`；
2. 复制模板文件：
   - `skills/leetcode-coach/references/pattern-progress.md`
   - `skills/leetcode-coach/references/training-log-template.md`
3. 创建 `training-logs/` 目录。

初始化目标结果：

```text
$LEETCODE_COACH_RECORDS_REPO_PATH/
`-- ${LEETCODE_COACH_RECORDS_SUBDIR:-leetcode-coach}/
    |-- pattern-progress.md
    |-- training-log-template.md
    `-- training-logs/
```

初始化完成后继续执行原有 `git pull --ff-only`。

### 3. 非空异常保持严格失败

下面这些情况不做自动修复，仍然报错并停止：

- 记录仓库路径不存在；
- 记录仓库不是 git 仓库；
- 仓库不是空仓，但记录目录不存在；
- 记录目录存在，但缺少 `pattern-progress.md`、`training-log-template.md` 或 `training-logs/`；
- `git pull --ff-only` 失败。

这样可以保证只有“首次空仓接入”走自动初始化，其他异常都保持显式可见。

### 4. 文档同步

以下文件需要同步更新：

- `skills/leetcode-coach/SKILL.md`
  - 把“缺文件就让用户自己补齐模板”的表述改成：
    - 空仓首次使用时，先执行 `pull` 自动初始化；
    - 非空仓缺项时，仍明确报错停止。
- `skills/leetcode-coach/README.md`
  - 把“按布局说明手动初始化”改成“空仓可由 `pull` 自动初始化”。
- `skills/leetcode-coach/references/records-repo-layout.md`
  - 把初始化步骤改为脚本自动同步模板到空仓；
  - 保留目录结构和环境变量说明。
- `docs/leetcode-record-sync.md`
  - 更新仓库级操作说明，删除手动 `cp` 模板作为默认路径的表述。

## 错误处理

1. 如果自动初始化阶段复制模板失败，直接报错退出，不继续 `pull`。
2. 如果初始化完成但后续 `git pull --ff-only` 失败，明确报错，不伪装成初始化成功即可开始训练。
3. `push` 语义保持不变：记录目录更新后自动提交推送，失败时明确说明“本地记录已更新，但远端尚未同步成功”。

## 验证重点

1. 空私有仓库首次执行 `pull` 时，能得到完整记录目录。
2. 非空仓但缺少记录目录时，仍然报错。
3. 非空仓记录目录缺文件时，仍然报错。
4. 已正常初始化的仓库继续执行 `pull` / `push` 不改变现有行为。
5. README、skill 规则和仓库级文档都统一说明“空仓自动初始化，非空缺项继续报错”。
