# thinking-graph

A persistent, traceable graph of conversations, ideas, branches, cross-links, and evolving thoughts.

这个仓库不是普通的聊天备份，也不是一棵严格的树。它保存：

- **完整对话**：尽量高保真保存原始聊天，不用摘要替代历史。
- **主分叉关系**：每个分支有唯一的主父节点，回答“这个想法从哪里长出来？”
- **跨话题关系**：一个节点可以与多个话题交叉，回答“这个想法还与什么有关？”
- **认知演化**：旧观点不覆盖，通过 `refines` / `contradicts` 等关系保留变化轨迹。
- **继续入口**：任意 AI 都可以从一个节点恢复必要上下文并继续讨论。
- **可视化**：`visualizer/` 直接读取 `graph.yaml`，展示可点击、可搜索、可追溯的思想图谱。

## 核心原则

1. **文件组织像树，关系结构像图。**
2. **Git 分支只用于代码版本控制，不用于表示思想分叉。**
3. **同一个思想节点正文只保存一份，不因跨话题而复制。**
4. **原始对话是历史事实；节点摘要是当前理解；`graph.yaml` 是关系拓扑。**
5. **修改观点时保留旧节点，通过关系表达修正，而不是抹掉历史。**

## 目录

```text
thinking-graph/
├── AGENTS.md
├── README.md
├── CLOUDFLARE.md       # Cloudflare Workers 部署说明
├── package.json
├── wrangler.jsonc
├── graph.yaml
├── conversations/      # 完整/高保真聊天记录，按真实分叉拆分
├── nodes/              # 思想节点正文；一个节点只存在一份
├── schema/             # 数据格式与字段约定
├── scripts/
│   └── build-site.mjs  # 校验图谱并生成 dist/
└── visualizer/         # 交互式图谱 + 站内 Markdown 阅读器 + 移动端 UX
```

## 新 Agent 从哪里开始

请先阅读 **[AGENTS.md](./AGENTS.md)**。然后：

1. 读 `graph.yaml` 获取全局拓扑。
2. 根据用户指定的分支读取对应 `nodes/*.md`。
3. 沿节点中的 `source_conversations` 读取必要原始聊天。
4. 从该节点的 **Continue From Here** 继续，而不是重新从头解释。

## 当前第一组讨论

首版收录 2026-09-22 的讨论：

- AI 时代未来稀缺人才
- 白领岗位压缩及对蓝领/服务业的二阶影响
- AI 自媒体内容爆炸与信息通胀
- 模型训练数据污染、Model Collapse 与真实世界数据价值
- thinking-graph 本身的持久化与可视化设计

## 构建与可视化

项目保持无框架的轻量静态架构。源文件仍然是：

```text
graph.yaml + nodes/ + conversations/ + visualizer/
```

构建时执行：

```bash
npm install
npm run check
npm run build
```

输出：

```text
dist/
├── index.html
├── graph.yaml
├── content-index.json  # build 自动生成：conversation id -> Markdown 路径
├── enhancements.css
├── enhancements.js
├── nodes/
├── conversations/
└── 404.html
```

可视化支持直接在页面内阅读节点笔记与来源对话 Markdown，不再跳转到原始 `.md` 文件；移动端使用底部节点详情面板和全屏阅读器。

本地用 Cloudflare Wrangler 预览：

```bash
npm run dev
```

`graph.yaml` 始终是关系数据源；`dist/` 只是构建产物，不提交 Git，也不得成为第二套手工维护的数据。

## Cloudflare

仓库已经配置为 **Cloudflare Workers Static Assets**：

- Wrangler 配置：`wrangler.jsonc`
- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`
- Production branch：`main`

Cloudflare 控制台的具体连接步骤见 **[CLOUDFLARE.md](./CLOUDFLARE.md)**。

## 状态

这是 v0.1：先把数据模型、分叉规则、第一批对话和交互式可视化骨架固定下来，后续再逐步自动化采集、分叉识别和图谱更新。
