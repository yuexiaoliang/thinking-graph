# Schema

本目录定义数据约定。语义准入与拆分规则见 `BRAINSTORM.md`；结构校验不能判断内容是否值得保存、是否重复或结论是否真实。

## Conversation front matter

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | 稳定 conversation ID，如 `conv-20260922-001` |
| `title` | string | 可读标题 |
| `date` | YYYY-MM-DD | 对话日期 |
| `status` | string | `active` / `parked` / `closed` |
| `primary_parent_conversation` | string/null | 真实来源父对话；独立新话题的首轮为 null |
| `forked_from_node` | string/null | 真正触发该分支的节点；独立新话题的首轮为 null |
| `nodes` | list[string] | 对话当时产生/更新的节点，不是后来所有引用的动态反向索引 |
| `tags` | list[string] | 检索标签 |

一个宿主聊天可以包含多个已准入话题及不保存的插曲；不要把相邻聊天轮次误当成主父关系。已保存原文不因整理节点而改写。

## Node front matter

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | 稳定节点 ID |
| `title` | string | 节点标题 |
| `status` | string | `active` / `parked` / `superseded` / `closed` |
| `kind` | string | `topic` / `concept` / `question` / `meta` |
| `category` | string | 展示和筛选类别，不代表父节点或顶层主题 |
| `primary_parent` | string/null | 唯一主父节点；根节点必须显式写 null |
| `source_conversations` | nonempty list[string] | 实际支撑当前理解的来源，无重复 |
| `tags` | list[string] | 检索标签 |

`topic` 是问题空间或总览，可以是根，也可以是嵌套总览；`concept` 承载独立机制/论点/角色边界；`question` 是已有实质上下文的未决问题。保留 `meta` 枚举兼容性，不等于允许仓库维护进入思想内容。

节点文件和 `graph.yaml` 中重复的 `id`、`title`、`kind`、`category`、`status`、`primary_parent`、`source_conversations` 必须一致。来源列表按集合比较，不要求顺序相同。

### Source scope

长会话可在节点正文中增加 `## Source scope`：链接已存在的 conversation 页面，并注明其精确小节标题或短的独特原句，用于定位论据。例如“`AI System Governor` 小节”。这是文本定位提示，不是新的 front-matter 字段，也不是自动段落锚点。

总览综合多个来源时同步补齐实际使用的来源 ID；不要因为同属某分支就机械继承全部来源。不要为适配节点粒度拆碎原会话。

## 多根主题森林

根节点的唯一判断标准：

```yaml
kind: topic
primary_parent: null
```

允许零个节点的空图，也允许任意多个互不连通的根主题。非空节点集的主父链必须无环并最终到达某个根。根不需要子节点，不创建演示根、空占位节点、虚构全局根或重复的单子节点包装层。

`ai-future` 没有特殊权限。新增独立主题的节点、文件和真实来源符合约定后，首页、节点索引、图谱及 llms.txt 都从数据自动派生入口。不同根可以共享类别；同一根下可以有不同类别。

`loadThinkingGraph()` 派生 `roots` 和 `rootByNode`，不向 `graph.yaml` 写入第二套根列表或根归属字段。

## graph.yaml 与关系

`nodes[]` 是导航元数据，`edges[]` 是规范关系，`relation_types[]` 是允许的类型。语义方向始终是：

> source --type--> target

例如：

```yaml
- source: real-world-data-value
  target: real-world-connector
  type: supports
  reason: 真实数据越稀缺，能获取并验证它的人越有价值。
```

每个非根节点恰有一条与 `primary_parent` 一致的 child → parent `forked_from` 边；根没有该边。父链禁止循环。跨根语义边可以存在，也可形成有意义的图循环，但不改变主父链。

每条边必须引用存在的节点、使用已声明的关系类型并有非空理由；不允许重复边或自环。正文提到节点名不会自动生成关系。

## 校验

```bash
npm test        # 不依赖第三方包的结构回归测试，夹具仅在 tests 中
npm run check  # 测试 + 读取并校验实际图谱与来源
```

`lib/graph-contract.mjs` 校验类型、源列表、ID/文件唯一性、多根父链、关系及元数据同步；`lib/thinking-graph.mjs` 负责文件读取、实际来源存在性和渲染。

`graph.schema.json` 描述 JSON/YAML 字段形状与根类型条件；跨文件一致性、父链循环和关系语义方向由运行时结构校验负责。语义拆分仍需人工/Agent 审核。

## Compatibility rule

新增字段尽量向后兼容。删除、改名字段或收紧数据约束时，同步更新 schema、AGENTS/BRAINSTORM、读写/发布代码与测试，并在提交说明中记录变化。不要只改其中一层。
