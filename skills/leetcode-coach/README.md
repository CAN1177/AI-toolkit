# leetcode-coach

一句话：**公共 skill 只管规则和工具；你的做题记录存在你自己的私有 git 仓库里，每次开始 / 结束时由 skill 自动 pull / push。**

> 灵感来源：[My Google Recruitment Journey (Part 1)](http://blog.dominikrudnik.pl/my-google-recruitment-journey-part-1)。这个 skill 的**记录结构字段**（触发信号 / 核心不变量 / 最小骨架 / Timebox / Verbalization）和**阶段化课程思路**都来自这篇文章。

---

## 它要解决什么问题

`leetcode-coach` 是一个可以被很多人安装复用的**公共 skill**。但做题记录天然是**个人数据**——每人练到哪里、哪些题卡住了、日期、薄弱点——如果把记录直接放公共仓库，会出现三个坏情况：

1. **数据污染**：A 的记录会覆盖 B 的记录，多人协作时混乱
2. **隐私泄露**：个人训练日志暴露在公共仓库中
3. **易忘记同步**：手动 `git add / commit / push` 经常漏步，换机器后丢失进度

这个 skill 的整个设计就是围绕解决这三点展开的。

---

## 核心设计：三层分离

```
┌─────────────────────────────────┐
│  公共 skill 仓库（所有人共享）   │
│  ─────────────────────────────  │
│  • SKILL.md        规则约束     │
│  • records-sync.js 同步工具     │
│  • references/     记录模板     │   ← 只读，不写入真实记录
└───────────────┬─────────────────┘
                │ 初始化时拷贝模板
                ▼
┌─────────────────────────────────┐
│  本机工作区（每台机器独立）      │
│  ─────────────────────────────  │
│  ~/.leetcode-coach/             │
│  ├─ config.json   记得你的仓库  │
│  └─ records/      本地 clone    │   ← 双向同步中转站
└───────────────┬─────────────────┘
                │ git clone / pull / push
                ▼
┌─────────────────────────────────┐
│  远程私有仓库（每人独立 source) │
│  ─────────────────────────────  │
│  git@github.com:you/xxx.git     │
│  ├─ pattern-progress.md         │  ← 卫星视图：一张总表看进度
│  ├─ training-log-template.md    │  ← 模板副本
│  ├─ pattern-profile-template.md │  ← 模板副本
│  ├─ patterns/                   │  ← 每个模式一份深度档案
│  │   └─ <pattern-slug>.md       │
│  └─ training-logs/              │  ← 每题一份训练日志
│      └─ <date>-<problem>.md     │
└─────────────────────────────────┘
```

**三层各司其职**：

| 层 | 所有权 | 内容 | 是否可被写入真实记录 |
| :--- | :--- | :--- | :--- |
| 公共 skill 仓库 | 所有人共享 | 规则 + 工具 + 模板 | 否 |
| 本机 `~/.leetcode-coach/` | 当前机器 | 配置 + 本地 clone | 是（中转） |
| 远程私有仓库 | 使用者个人 | 真实训练记录 | **是（权威来源）** |

---

## 工作原理（三个命令的内部流程）

### `init <git-url>` —— 只运行一次

```
你给出一个私有 git 仓库 URL
         │
         ▼
 目标路径 ~/.leetcode-coach/records 是否存在？
         │
    ┌────┴────┐
   No         Yes
    │         │
    │         └─► 是 git 仓库？不是则 fail
    │             是 → reuse，必要时修正 origin
    ▼
 git clone <url> ~/.leetcode-coach/records
         │
         ▼
 ensureRecordsReady()
  • 缺 pattern-progress.md          → 从 references/ 拷贝
  • 缺 training-log-template.md     → 从 references/ 拷贝
  • 缺 pattern-profile-template.md  → 从 references/ 拷贝
  • 缺 training-logs/.gitkeep       → 自动创建
  • 缺 patterns/.gitkeep            → 自动创建
         │
         ▼
 把 { remoteUrl, localPath } 写入 ~/.leetcode-coach/config.json
         │
         ▼
 git add -A  →  git commit  →  git push -u origin <branch>
```

关键点：

- **空仓库也能 init**：脚本会自动建初始 commit 并推上去，不需要你先在 GitHub 建个 README。
- **已有内容的仓库也能 init**：`seedRecordsDirectory` 只补齐缺失文件，**不会覆盖**你已有的 `pattern-progress.md`。
- **幂等**：对同一个仓库重复 `init` 是安全的——本地仓库会被复用，缺失文件自动补齐，没有变更就跳过 commit。

### `pull` —— 每次开始新类型前

```
 读 ~/.leetcode-coach/config.json
         │
         ▼
 本地 records/ 目录还在吗？
         │
    ┌────┴────┐
   No         Yes
    │         │
    └─► 自动 │
       clone  │
       恢复   │
    ┌────────┘
    ▼
 远端有 HEAD 吗？（即远端有没有提交过？）
         │
    ┌────┴────┐
   No         Yes
    │         │
    │         └─► git pull --ff-only
    │
    ▼
 ensureRecordsReady()（再次兜底补齐模板）
```

关键点：

- **`--ff-only`** 是刻意选择：只接受快进合并，拒绝 merge commit。这样如果两台机器产生了分叉，会明确报错让你手动处理，**不会静默生成奇怪的 merge commit**。
- **本地目录丢失能自己恢复**：只要 `config.json` 在，删掉 `~/.leetcode-coach/records/` 再跑 `pull` 会自动重新 clone。

### `push` —— 每完成一个类型后

```
 校验 records/ 目录存在且是 git 仓库
         │
         ▼
 ensureRecordsReady()
         │
         ▼
 git add -A                        ← 所有变更都纳入（包括新建的 training log）
         │
         ▼
 git diff --cached --quiet
         │
    ┌────┴────┐
  有变更    无变更 → 跳过 commit/push，直接返回
    │
    ▼
 git commit -m <msg>               ← 默认 "docs: sync leetcode practice progress"
         │
         ▼
 有 upstream？
         │
    ┌────┴────┐
   Yes        No
    │         │
    ▼         ▼
 git push    git push -u origin <branch>   ← 首次推送自动建远程分支
         │
         ▼
 失败 → 明确报错"本地记录已更新，但远端尚未同步成功"
```

关键点：

- **`git add -A`** 而不是只 add 特定文件：这样无论你或 agent 在记录目录里改了什么（新 log、重命名、删除），都能被正确提交。
- **首次 push 自动 `-u`**：空仓库首次 push 时不需要你手敲 `-u origin main`。
- **push 失败不装没事**：退出码非 0 + 明确文字说明，让 agent 知道记录还留在本地。

---

## 关键设计原则

| 原则 | 体现 |
| :--- | :--- |
| **零环境变量** | 配置持久化到 `~/.leetcode-coach/config.json`，不需要改 `.zshrc` |
| **幂等** | `init` / `pull` / `push` 重复执行都安全，不会破坏数据 |
| **自动恢复** | 本地目录丢失 → `pull` 自动 clone 回来 |
| **明确报错** | 不静默跳过、不静默回退到模板、不生成意料之外的 merge commit |
| **规则约束在 SKILL.md** | 强制 agent 在"开始新类型 / 完成一个类型"两个节点调用脚本 |
| **模板和真实记录分离** | `references/` 永远只当种子，真实数据永远在远程仓库 |

---

## 谁在什么时候触发脚本？

这个 skill 的触发逻辑分两层：

1. **工具层**（`records-sync.js`）：被动响应命令，不会自己运行
2. **规则层**（`SKILL.md`）：Agent 加载 skill 时读取规则，在以下两个节点**必须**主动调用工具：
   - 学习者说"我想开始练某类型" → agent 先 `pull` 再读 `pattern-progress.md`
   - 学习者说"这一类型可以记档" → agent 更新记录后立刻 `push`

也就是说：**用户一般不需要手动敲命令**，命令由 agent 按规则自动触发。手动命令只在首次 `init` 或排查问题时才用。

---

## 实操：如何使用

### 1. 先找到 skill 的实际路径

不同 agent 框架把 skill 装在不同位置，先定位：

```bash
ls ~/.agents/skills/leetcode-coach   # agents 规范
ls ~/.claude/skills/leetcode-coach   # Claude Code
ls ~/.cursor/skills/leetcode-coach   # Cursor
ls ./skills/leetcode-coach           # 本仓库内
```

为了下文方便，给 skill 路径起个短变量（当前终端有效）：

```bash
export LC_SKILL_DIR="$HOME/.agents/skills/leetcode-coach"   # 换成你的实际路径
```

> 这个变量**只是为了让命令短一点**，不是 skill 必需的环境变量。

### 2. 首次配置（只执行一次）

准备一个**私有** GitHub / GitLab 仓库（**可以是空仓**，仓库名随意），然后：

```bash
node "$LC_SKILL_DIR/records-sync.js" init git@github.com:<your-name>/<your-repo>.git
```

### 3. 日常命令

```bash
node "$LC_SKILL_DIR/records-sync.js" pull    # 开始新类型前
node "$LC_SKILL_DIR/records-sync.js" push    # 一个类型完成后
node "$LC_SKILL_DIR/records-sync.js" status  # 查看当前状态
```

### 4. 想要更短？配个持久 alias（可选）

把下面两行加到 `~/.zshrc` 或 `~/.bashrc`：

```bash
export LC_SKILL_DIR="$HOME/.agents/skills/leetcode-coach"
alias lc-sync='node "$LC_SKILL_DIR/records-sync.js"'
```

之后任何目录下都可以：

```bash
lc-sync init git@github.com:<your-name>/<your-repo>.git
lc-sync pull
lc-sync push
lc-sync status
```

### 5. 换机器 / 新设备

就是重新跑一次 init，脚本会识别远程仓库已有内容、只做 clone：

```bash
node "$LC_SKILL_DIR/records-sync.js" init git@github.com:<your-name>/<your-repo>.git
```

---

## 文件说明

| 文件 | 作用 |
| :--- | :--- |
| `SKILL.md` | 约束 agent 在关键节点调用脚本的规则（agent 必读） |
| `records-sync.js` | `init` / `pull` / `push` / `status`，自动化 git 同步 |
| `references/pattern-progress.md` | 模式进度总表模板（卫星视图） |
| `references/pattern-profile-template.md` | 单模式深度档案模板（记触发信号/骨架/相关题） |
| `references/training-log-template.md` | 单题训练日志模板（记每次训练的核心不变量/失误/差异） |
| `references/coach-protocol.md` | 可选的教练协议（文章精华，不是本 skill 的强制行为） |

### 记录结构的设计动机

这套"总表 + 深度档案 + 训练日志"三层结构对应文章里的三种思维粒度：

- **总表**（`pattern-progress.md`）：我整体练到哪了？——用于每次开始新训练前快速决策下一步
- **深度档案**（`patterns/<pattern>.md`）：我真的懂这个模式了吗？——触发信号 + 最小骨架，是模式在脑子里的长期存储
- **训练日志**（`training-logs/<date>-<problem>.md`）：这次具体怎么做的？——当时的卡点和"我的写法 vs 最优解"对照，是短期反思

---

## 自定义（可选，大多数人用不到）

脚本内部使用以下默认值，一般**不需要关心**：

- 配置文件：`~/.leetcode-coach/config.json`
- 默认本地仓库路径：`~/.leetcode-coach/records`
- 默认分支：跟随远端
- 默认 commit 信息：`docs: sync leetcode practice progress`

覆盖方式（全部可选）：

```bash
export LEETCODE_COACH_RECORDS_REPO_PATH="$HOME/code/leetcode-records"       # 本地路径
export LEETCODE_COACH_RECORDS_COMMIT_MESSAGE="chore: update practice log"  # 默认 commit 信息
```

---

## 同步失败时怎么办

| 场景 | 处理 |
| :--- | :--- |
| `pull` 失败（冲突 / 网络） | 先手动处理仓库再继续，skill 不会静默跳过 |
| `push` 失败 | 脚本会明确告知"本地记录已更新，但远端未同步成功"，下次 `push` 会重试 |
| 没 init 就跑 pull/push | 脚本明确提示 "请先运行 init <git-url>" |
| `Cannot find module '.../records-sync.js'` | 命令里路径不是 skill 实际位置，回到"先找到 skill 的实际路径"一节 |
| 两台机器分叉 | `pull --ff-only` 会明确报错，到仓库手动 rebase 或 merge |

---

## TL;DR

- 这个 skill = **规则（SKILL.md）+ 工具（records-sync.js）+ 模板（references/）**
- 你的真实记录 = **你自己的私有远程 git 仓库**
- 两者之间的胶水 = **`~/.leetcode-coach/` 下的 config + 本地 clone**
- 一条命令 `init <url>` 搞定全部配置，之后由 agent 在对话中自动触发 `pull` / `push`
