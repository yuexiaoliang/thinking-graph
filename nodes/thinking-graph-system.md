---
id: thinking-graph-system
title: Thinking Graph 持久化系统
status: active
kind: meta
category: meta
primary_parent: ai-future
source_conversations:
  - conv-20260922-004
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

## Key reasoning

严格树结构无法表达跨话题关系，所以采用：

> **文件组织像树，关系结构像图。**

Git 分支只处理版本控制，不表示思想分叉。

可视化页面只是 `graph.yaml` 的一个视图，不得自己维护第二套关系数据。

## Cross-links

- `ai-future`

## Open questions

- 分叉识别是否可以自动化？
- 什么时候需要把 YAML 迁移到图数据库？
- 如何让不同 AI 使用完全一致的读写协议？
- 是否需要给关系增加置信度和证据来源？

## Continue From Here

下一步可以做：自动化采集协议、分叉检测器、图谱校验脚本、GitHub Pages 可视化部署。
