---
id: verification-architecture
title: 验证架构
status: active
kind: concept
category: talent
primary_parent: future-talent
source_conversations:
  - conv-20260922-001
tags:
  - verification
  - evaluation
  - ai-systems
---

# 验证架构

## Current understanding

AI 生成规模上升后，人类逐行、逐项 Review 会成为吞吐瓶颈。

更可扩展的方式是先定义“什么叫正确”，再把正确性尽量转成自动可验证的约束、测试、指标和反馈回路。

## Key reasoning

典型机制包括：

- invariant / property；
- 自动测试；
- property-based testing；
- fuzzing；
- simulation；
- formal verification；
- 多模型交叉检查；
- adversarial / red-team agents；
- shadow traffic；
- anomaly detection。

核心转变：

> **Review Output → Design Evaluation**

## Cross-links

- `training-data-pollution`：无论审计 AI 产出还是筛选训练数据，都依赖可靠 verifier。
- `ai-system-governor`：验证架构是 AI 系统治理者的重要能力。

## Open questions

- 对商业、管理、战略等没有明确 ground truth 的领域，如何设计 verifier？
- 哪些验证可以自动化，哪些必须保留人类判断？
- 验证器本身被 AI 生成后，如何验证验证器？

## Continue From Here

优先探索“无法形式验证的问题如何做分层验证”。
