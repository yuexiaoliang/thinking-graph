---
id: conv-20260922-005
title: 内容质量优先与头脑风暴最小上下文协议
date: 2026-09-22
status: active
primary_parent_conversation: conv-20260922-004
forked_from_node: thinking-graph-system
nodes:
  - thinking-graph-system
tags:
  - meta
  - agents
  - context-efficiency
  - content-quality
---

# 内容质量优先与头脑风暴最小上下文协议

## Conversation

### User

我同意你的梳理，尤其是 AGENTS 中的规则，很重要，任何时候不得因为任何原因增加冗余的内容，因为我们这个仓库的核心是为了随时随地任何 AI Agent 都可以基于这个仓库进行头脑风暴，多余的内容会带来副作用。另外，我想你能将这个核心明确，并且告诉 AI Agent 和用户头脑风暴的时候应该读取、修改哪些内容，避免以后如果包含了大量代码的时候导致浪费。

### Assistant

将仓库明确分为两种工作模式：

- **头脑风暴模式**：只加载思想层的最小必要上下文。
- **工程模式**：只有用户明确要求网站、构建、部署、可视化或代码变更时才加载工程文件。

确立最高内容约束：

> **任何时候不得因为 SEO、GEO、关键词、字数、完整感、润色或其他原因增加冗余内容。**

允许的三层内容各自只承担一种职责：

- `conversations/`：原始讨论与 provenance；
- `nodes/`：压缩后的可复用理解；
- `graph.yaml`：关系与导航。

正常头脑风暴的最小读取顺序为：

1. `BRAINSTORM.md`
2. 相关 `graph.yaml` 内容
3. 当前 node
4. 只有需要时才扩展到父节点、关联节点或原始 conversation

纯头脑风暴默认不读取 `visualizer/`、`scripts/`、Cloudflare、package 或 schema 等工程文件。

正常头脑风暴只写 `conversations/`、`nodes/` 和必要的 `graph.yaml` 关系。常规构建、部署、CSS、JS 调试记录留在 Git 历史和工程文档中，不污染思想图谱。

SEO/GEO 只能从已有内容派生 URL、语义 HTML、元数据、真实内链和来源信息，不能反向生成新内容。

## Branch outcome

Thinking Graph 的优先级被明确为：

```text
高质量、低冗余、可移植的头脑风暴上下文
                    ↓
           最小必要读取范围
                    ↓
      conversations / nodes / graph
                    ↓
       可视化 / SSG / SEO / GEO
          （全部为次级派生层）
```

新增 `BRAINSTORM.md` 作为任何 AI 进行头脑风暴时的低上下文入口。

## Continue from here

- 是否需要进一步自动生成“最小上下文包”来加载指定节点？
- 是否需要基于 graph 自动计算一个节点的最小依赖集合？
- 当思想图谱规模达到数千节点时，如何在不降低信号密度的前提下检索？
