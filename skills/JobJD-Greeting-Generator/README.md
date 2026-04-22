# JobJD-Greeting-Generator

一句话：**优先读取 `jd_url`，多路抓取岗位正文与关键信息，再生成 1 条适合 BOSS直聘 / 智联招聘 / 前程无忧聊天场景的最终打招呼话术。**

---

## 它解决什么问题

很多招聘平台的默认招呼语太泛，既不能体现候选人与岗位的匹配度，也很难在已读未回或投递后沉默的场景里继续礼貌跟进。

`JobJD-Greeting-Generator` 的目标是把两类信息压缩成一条短消息：

1. **岗位信息**：从 `jd_url` 或 `jd_text` 中获取岗位名称、公司名、职责和技能关键词
2. **候选人信息**：从个人简介、亮点和当前状态中提炼能打动 HR 的真实匹配点

默认输出只有**1 条最终可复制结果**，方便直接贴到 BOSS直聘、智联招聘、前程无忧等招聘 IM 对话框里。

---

## 核心设计

### 1. `jd_url` 优先，不是一失败就放弃

如果用户给了 `jd_url`，skill 会优先尝试从 URL 获取 JD 信息，而不是立刻要求粘贴文字版 JD。

固定回退顺序：

1. **直接页面提取**：读页面标题、主标题、公司区块、正文
2. **readability / third-party 提取**：在页面难抓、前端渲染不完整、或正文被包壳时，改走可读化文本提取
3. **正文语义推断**：在拿到正文但字段不完整时，保守推断 `position_name`、`company_name` 和核心技能
4. **请求 `jd_text`**：只有多路提取后仍不可靠，才让用户补文本

这套设计的核心不是“保证一定抓到”，而是：**把 `jd_url` 用到极限，再向用户索要补充输入。**

### 2. 用户手填字段永远优先

如果用户显式给了：

- `position_name`
- `company_name`

就直接覆盖自动抽取结果。因为招聘页标题、品牌名、主体公司名经常不一致，人工输入往往更准。

### 3. 默认只返回一条成品

这个 skill 默认不做“给你 5 条自己挑”，而是输出一条已经按场景压缩好的最终话术。除非用户明确要求分析或备选方案，否则不展开结构说明。

---

## 支持的输入

至少需要以下之一：

- `jd_url`
- `jd_text`

可选：

- `position_name`
- `company_name`
- `candidate_brief`
- `candidate_highlights`
- `candidate_status`
- `hr_role`
- `hr_gender`
- `tone_style`
- `scenario`
- `length_limit`
- `platform`

### 推荐输入方式

最推荐的组合是：

```text
jd_url
candidate_brief
candidate_highlights
candidate_status
scenario
tone_style
```

其中 `candidate_highlights` 最关键。没有它，话术很容易只剩礼貌，没有辨识度。

---

## 生成逻辑

内部使用固定三段式：

1. **身份标签**：一句话说明你是谁、做什么、当前状态如何
2. **岗位匹配点**：把 JD 里的核心要求和你的真实亮点对齐
3. **礼貌收尾**：表达想沟通，但不给 HR 压力

### 场景

#### `first_contact`

首次联系。重点是：

- 你是谁
- 为什么适合这个岗位
- 希望进一步沟通

#### `follow_up_read`

已读未回后的跟进。重点是：

- 承接前一条消息
- 轻补充一点价值信息
- 不埋怨、不催促

#### `follow_up_silent`

投递或发消息后没有任何反馈。重点是：

- 礼貌确认流程进度
- 不提“已读”
- 给对方留退出空间

---

## 语气与长度

### 语气

- `正式`：更适合传统行业、偏稳妥场景
- `自然专业`：默认，适合绝大多数岗位
- `略活泼`：轻微口语化，但仍然职业，不用表情

### 长度

默认按 `length_limit` 控制，首次打招呼通常默认 100 字。

超长时压缩顺序：

1. 去掉重复信息
2. 去掉空泛修饰词
3. 缩短成果细节
4. 保留最小骨架：身份标签 + 至少 2 个核心匹配点关键词 + 礼貌收尾

---

## 安全约束

这个 skill 必须满足：

- **不捏造**项目、经历、数据、学历
- **不施压** HR，不写“请尽快回复”“为什么不回”
- **不乱放联系方式**，尤其是在平台不适合的情况下
- **字段不确定时宁可留白**，也不要硬猜公司名或岗位名

---

## 用法示例

### 示例 1：`jd_url` 优先

```text
jd_url: https://example.com/job/123
candidate_brief: 3 年后端开发，做过支付与会员系统
candidate_highlights:
- 负责过高并发支付链路重构，接口成功率提升到 99.95%
- 熟悉 Java、Spring Boot、MySQL、Redis
- 最近在会员权益系统中负责活动引擎改造
candidate_status: 在职，正在看更匹配的后端机会
scenario: first_contact
tone_style: 自然专业
platform: BOSS直聘
```

预期行为：

1. 先尝试从 `jd_url` 取岗位正文
2. 抓不到再走 readability / third-party 提取
3. 仍不够再提示补 `jd_text`
4. 最终只输出 1 条成品

### 示例 2：`follow_up_read`

```text
jd_text: 负责用户增长、活动运营、数据复盘...
candidate_brief: 2 年用户运营经验，做过教育产品增长
candidate_highlights:
- 独立负责裂变活动，注册转化提升 28%
- 熟悉活动策划、社群承接、数据分析
scenario: follow_up_read
tone_style: 正式
platform: 智联招聘
```

这里应生成一条适合 **follow_up_read** 的礼貌跟进话术，而不是重新写一条“第一次见面式”的开场白。

### 示例 3：`follow_up_silent`

```text
jd_text: 电商运营岗位，要求熟悉平台招商、活动策划、数据分析
candidate_brief: 4 年电商运营经验，做过平台招商与大促项目
candidate_highlights:
- 主导平台招商项目，季度新增商家数提升 35%
- 参与双十一活动节奏设计与复盘
scenario: follow_up_silent
platform: 前程无忧
```

这里应生成一条适合 **follow_up_silent** 的进度确认式话术，不提“已读”，也不催促。

---

## 安装后放在哪里

不同 agent 可能把 skill 安装在不同目录，例如：

```bash
~/.agents/skills/JobJD-Greeting-Generator
~/.claude/skills/JobJD-Greeting-Generator
~/.cursor/skills/JobJD-Greeting-Generator
./skills/JobJD-Greeting-Generator
```

只要 `SKILL.md` 与 `README.md` 保持同目录即可。
