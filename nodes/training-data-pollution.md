---
id: training-data-pollution
title: AI 训练数据污染
status: active
kind: concept
category: data
primary_parent: ai-content-inflation
source_conversations:
  - conv-20260922-003
tags:
  - training-data
  - synthetic-data
  - model-collapse
  - verification
---

# AI 训练数据污染

## Current understanding

如果公开互联网越来越多由 AI 生成，而训练流程又无区分地继续抓取这些内容，公开网页作为高质量训练数据源的边际价值会下降。

关键不是“AI 生成数据一定有害”，而是：

> **无法验证的 AI 生成数据** 与 **经过可靠 verifier 筛选的合成数据** 必须区分。

递归学习低质量模型输出还可能造成长尾分布逐渐丢失，即常被讨论的 model collapse 风险。

## Key reasoning

高质量合成数据可以来自：

- 程序可验证的问题；
- 数学形式证明；
- 游戏输赢；
- 仿真环境；
- 工具执行结果；
- 强约束任务。

难点最大的是没有简单 ground truth 的领域，例如商业、管理、社会和复杂人类行为。

因此 AI 训练范式可能从“抓更多互联网文本”逐步转向：

- 真实世界数据；
- 可验证合成数据；
- 强化学习；
- 环境交互；
- 模拟；
- 工具反馈；
- 自我博弈。

## Cross-links

- `verification-architecture`
- `real-world-data-value`

## Open questions

- 如何检测训练语料是否来自模型生成？
- 数据 provenance 会不会成为 AI 基础设施？
- 难验证领域的 reward / verifier 如何构造？

## Continue From Here

一个自然下一步是继续讨论“可信数据层”和训练数据的来源证明。
