# leetcode-coach

`leetcode-coach` 现在只负责**做题记录仓库的约束与同步**，不再把个人训练记录放进这个公共 skill 仓库里。

这个 skill 的目的很简单：

1. 让公共 skill 只保留规则、模板和同步脚本
2. 让每个使用者把自己的做题记录托管到**单独的私有 git 仓库**
3. 在“开始新类型”和“完成一个类型”这两个节点，强制执行拉取、更新、推送这套记录流程

## 文件说明

| 文件 | 作用 |
| :--- | :--- |
| `SKILL.md` | 只保留做题记录仓库的读取、校验、更新与同步规则 |
| `records-sync.js` | 自动执行 `pull` / `push`，在外部记录仓库中完成 git 同步 |
| `references/pattern-progress.md` | 题型维度的进度模板 |
| `references/training-log-template.md` | 单次训练日志模板 |
| `references/records-repo-layout.md` | 私有记录仓库的目录约定与初始化说明 |
| `../../docs/leetcode-record-sync.md` | 仓库级同步说明 |

## 为什么要单独仓库

这个 skill 是公共的，别人也会安装和复用；但做题记录是个人数据，应该独立托管。

所以这里采用固定原则：

- 公共仓库：只放 skill 规则、模板和同步工具
- 私有仓库：只放个人的 `pattern-progress.md`、训练日志和同步历史
- 当前仓库 `references/`：只当模板，绝不是个人真实记录

## 单独记录仓库配置

1. 准备一个你自己的**私有**做题记录仓库。
2. 先 clone 到本地，例如把它放到你的机器上：`$HOME/code/leetcode-records`
3. `LEETCODE_COACH_RECORDS_REPO_PATH` 的含义就是：**这个私有记录仓库在你自己电脑上的本地绝对路径**。例如，如果你把仓库 clone 到 `/Users/ke/code/leetcode-records`，那这个变量就应该指向这个目录。
4. 把环境变量写进你的 shell 配置文件：

   ```bash
   # zsh 用户通常写到 ~/.zshrc
   # bash 用户通常写到 ~/.bashrc
   export LEETCODE_COACH_RECORDS_REPO_PATH="$HOME/code/leetcode-records"
   export LEETCODE_COACH_RECORDS_SUBDIR="leetcode-coach"
   ```

5. 让配置立刻生效：

   ```bash
   source ~/.zshrc
   # 或 source ~/.bashrc
   ```

6. 验证配置是否成功：

   ```bash
   echo $LEETCODE_COACH_RECORDS_REPO_PATH
   ```

   应该输出你的本地仓库完整路径，例如 `/Users/ke/code/leetcode-records`。

7. 如果记录不放在默认 `leetcode-coach/` 子目录，再把 `LEETCODE_COACH_RECORDS_SUBDIR` 改成你自己的相对子目录。
8. 按 `references/records-repo-layout.md` 的说明，把 `pattern-progress.md`、`training-log-template.md` 和 `training-logs/` 初始化到外部记录目录里。

## 自动同步命令

```bash
node skills/leetcode-coach/records-sync.js pull
node skills/leetcode-coach/records-sync.js push --message "docs: sync leetcode practice progress"
```

- `pull`：在开始训练前自动检查配置、校验目录并执行远端拉取。
- `push`：在完成一个类型并更新记录后，自动执行 `git add`、`git commit`、`git push`。
- 如果不传 `--message`，脚本会使用默认提交信息。

## 使用时机

### 开始一个新类型前

1. 先检查外部记录仓库配置。
2. 执行 `node skills/leetcode-coach/records-sync.js pull`。
3. 只在 `pull` 成功后读取外部记录目录里的 `pattern-progress.md`。
4. 基于最新记录决定接下来练什么。

### 完成一个类型后

1. 学习者明确确认当前类型可以记档。
2. 更新外部记录目录里的 `pattern-progress.md`。
3. 如有需要，在 `training-logs/` 下补充本次训练日志。
4. 立刻执行 `node skills/leetcode-coach/records-sync.js push`。

## 同步失败时的处理

- `pull` 失败：停止继续训练，先修复同步问题
- `push` 失败：明确说明“本地记录已更新，但远端未同步成功”
- 缺配置、缺目录、缺模板文件：提示用户先补齐，不要回退到当前仓库模板

## 模板文件角色

当前仓库保留的模板只用于初始化私有记录仓库：

- `references/pattern-progress.md`
- `references/training-log-template.md`
- `references/records-repo-layout.md`

真实记录始终应该存在你自己的私有仓库里。

更完整的仓库级操作说明见 [../../docs/leetcode-record-sync.md](../../docs/leetcode-record-sync.md)。
