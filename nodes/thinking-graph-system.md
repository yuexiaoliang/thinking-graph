---
id: thinking-graph-system
title: Thinking Graph 持久化系统
status: active
kind: meta
category: meta
primary_parent: ai-future
source_conversations:
  - conv-20260922-004
  - conv-20260922-005
tags:
  - github
  - knowledge-graph
  - memory
  - agents
  - visualization
---

# Thinking Graph 持久化系统

## Current understanding

目标是把长期对话保存成一个跨会话、跨 AI 可读的思想图谱，而不是只保存在单一聊天上下文中。

系统同时保留：

- **Raw conversation**：历史事实；
- **Node summary**：快速恢复上下文；
- **Primary parent**：从哪里分叉；
- **Cross-links**：与什么其他话题相连；
- **Revision relations**：观点如何被修正；
- **Continue From Here**：从哪里继续。

GitHub 是当前持久化载体。

仓库的首要目标是让任何 AI Agent 以**最小必要上下文**继续头脑风暴。网站、SEO、GEO、部署和代码都是次级层，默认不进入头脑风暴上下文。

## Key reasoning

严格树结构无法表达跨话题关系，所以采用：

> **文件组织像树，关系结构像图。**

Git 分支只处理版本控制，不表示思想分叉。

可视化页面只是 `graph.yaml` 的一个视图，不得自己维护第二套关系数据。

内容层还有一个硬约束：

> **不得因为任何原因增加冗余内容。**

原始对话负责 provenance，节点负责压缩后的可复用理解，graph 负责关系。SEO/GEO 只能从已有高质量内容派生展示层，不得反向生成填充内容。

为了避免上下文浪费，纯头脑风暴会话只读取 `BRAINSTORM.md`、相关 graph/node，以及确有必要的原始 conversation；工程代码默认不读。

## Cross-links

- `ai-future`

## Open questions

- 分叉识别是否可以自动化？
- 什么时候需要把 YAML 迁移到图数据库？
- 如何让不同 AI 使用完全一致且低上下文成本的读写协议？
- 是否需要给关系增加置信度和证据来源？

## Continue From Here

下一步可以做：自动化采集协议、分叉检测器、图谱校验脚本、GitHub Pages 可视化部署。
