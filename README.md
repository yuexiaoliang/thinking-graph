# thinking-graph

A persistent, traceable graph of conversations, ideas, branches, cross-links, and evolving thoughts.

> **核心不是网站，而是高信噪比、可移植的头脑风暴上下文。** Astro、可视化、SEO、GEO、构建和部署都只是附加层，不能反向增加冗余内容。

这个仓库保存：

- **通过准入的高保真思想对话**：作为思想来源与 provenance；
- **思想节点**：压缩后的可复用理解；
- **主分叉与跨话题关系**：保留思想从哪里来、和什么有关；
- **认知演化**：用 `refines` / `contradicts` 等关系保留变化；
- **继续入口**：让任意 AI Agent 从指定节点以最小上下文继续讨论。

## 核心原则

1. **先做持久化准入，再判断是否分叉。** 话题变化不等于值得保存；不确定时默认不保存。
2. **一个聊天 Session 不是一个持久化单元。** 只保存值得未来继续思考的高保真片段，无关插曲可以不进入 corpus。
3. **文件组织像树，关系结构像图。**
4. **思想分叉不用 Git branch 表示。**
5. **同一个思想节点正文只保存一份。**
6. **conversation = 已准入的 provenance；node = 压缩理解；graph = 拓扑。**
7. **仓库自身的架构、Agent 协议、部署、可视化和维护不属于思想 corpus。**
8. **任何时候不得为了 SEO/GEO、关键词、字数或“完整感”增加冗余内容。**

## 目录

```text
thinking-graph/
├── AGENTS.md
├── BRAINSTORM.md       # 头脑风暴的最小上下文入口
├── graph.yaml
├── conversations/      # 通过准入的高保真思想来源
├── nodes/              # 高信噪比思想节点
├── lib/                # 图谱读取、Markdown 渲染与校验
├── scripts/            # 图谱校验
├── src/                # Astro SSG 发布层（可替换）
├── schema/
├── astro.config.mjs
├── package.json
├── wrangler.jsonc
└── CLOUDFLARE.md
```

## 头脑风暴模式

如果只是继续思考/讨论，**不要读取工程代码**。

最小读取路径：

1. [BRAINSTORM.md](./BRAINSTORM.md)
2. `graph.yaml` 中当前话题相关部分
3. 当前 `nodes/<id>.md`
4. 只有确有必要时才读父节点、关联节点或原始 conversation

只有通过 **Persistence Gate** 的内容才进入 `conversations/`、`nodes/`、`graph.yaml`。临时问题、闲聊、无关插曲以及仓库自身维护/设计内容不进入思想 corpus。

## Astro SSG 发布层

思想层保持原样：

```text
graph.yaml + nodes/ + conversations/
```

Astro 在构建期派生：

```text
/                                    # 交互式图谱首页
/thoughts/<node-id>/                 # 节点主页面，可索引
/conversations/<conversation-id>/    # provenance，noindex/follow
/thoughts/                           # 节点索引
/llms.txt                            # 机器导航索引
/robots.txt
/sitemap-*.xml                       # 配置 SITE_URL 后生成
```

Markdown 在构建期转成并清理为 HTML，不再依赖浏览器运行时 fetch Markdown。

真实内链从 `graph.yaml` 派生：主父节点、子分支、跨话题关系、反向引用和来源对话。SEO/GEO 只处理发布结构，不增加思想正文。

### 浏览与交互

- 桌面默认图谱与节点预览侧栏；手机默认节点列表，可切换到图谱。
- 首页与节点索引共用标题、摘要、标签搜索和主题筛选；浏览状态通过 URL 的 `q`、`category`、`view`、`node` 参数恢复。
- 图谱支持拖动、缩放按钮、Ctrl / ⌘ + 滚轮；键盘方向键平移、加减键缩放、`0` 适应画布、`/` 聚焦搜索。触屏先启用“移动画布”，支持拖动与双指缩放，关闭后恢复页面滚动。
- 主题默认跟随系统，可手动切换并记住选择。移动端节点预览使用原生模态对话框，支持 Escape 关闭和焦点返回。
- 禁用 JavaScript 时仍可浏览静态节点卡片、节点正文与来源对话。

## 本地开发

Astro 当前要求 Node 22.12.0+，仓库包含 `.nvmrc`。

```bash
npm install
npm run check
npm run dev
npm run build
npm run preview
```

## Cloudflare

部署方式：**Cloudflare Workers Static Assets**。

```text
Build command:  npm run build
Deploy command: npx wrangler deploy
Production branch: main
```

生产环境建议设置：

```text
SITE_URL=https://你的最终公开域名
```

它用于 canonical、JSON-LD 绝对 URL、sitemap 与 llms.txt 的绝对链接。详情见 [CLOUDFLARE.md](./CLOUDFLARE.md)。

## 提交与部署原子性

`main` 是发布边界：

> **一次完整逻辑变更 = 一个 Git commit = 一次 main 更新 = 一次 Cloudflare 构建。**

Agent 的标准发布路径：

```text
blobs → tree → commit → update_ref(main) once
```

详细规则见 [AGENTS.md](./AGENTS.md)。
