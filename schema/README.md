# Schema

本目录定义 `thinking-graph` 的数据约定。

## Conversation front matter

必需字段：

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | 稳定 conversation ID，例如 `conv-20260922-001` |
| `title` | string | 人类可读标题 |
| `date` | YYYY-MM-DD | 对话日期 |
| `status` | string | `active` / `parked` / `closed` |
| `primary_parent_conversation` | string/null | 主父对话 |
| `forked_from_node` | string/null | 从哪个思想节点分叉 |
| `nodes` | list[string] | 本对话产生/更新的节点 |
| `tags` | list[string] | 检索标签 |

## Node front matter

必需字段：

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | 稳定节点 ID |
| `title` | string | 节点标题 |
| `status` | string | `active` / `superseded` / `parked` |
| `kind` | string | `topic` / `concept` / `question` / `meta` |
| `category` | string | 可视化和筛选用类别 |
| `primary_parent` | string/null | 唯一主父节点 |
| `source_conversations` | list[string] | 原始对话来源 |
| `tags` | list[string] | 检索标签 |

## graph.yaml

`graph.yaml` 是全局拓扑索引。

- `nodes[]`：导航所需的节点元数据。
- `edges[]`：跨节点关系。
- `relation_types[]`：允许的关系类型。

关系边遵循：

```yaml
- source: child-or-source-node
  target: parent-or-target-node
  type: related_to
  reason: 为什么需要这条边
```

语义方向始终是：

> `source` --`type`--> `target`

例如：

```yaml
- source: real-world-data-value
  target: real-world-connector
  type: supports
```

表示：

> “真实世界数据价值上升”支持“连接 AI 与真实世界的人更稀缺”这一判断。

## Compatibility rule

新增字段应尽量保持向后兼容。删除或改名已有字段时：

1. 同步修改 `graph.schema.json`；
2. 同步修改 `AGENTS.md`；
3. 同步修改依赖该 schema 的 `lib/` / `src/` 发布层与校验逻辑；
4. 在 commit message 中明确写出 schema change。
