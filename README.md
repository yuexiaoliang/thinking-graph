# thinking-graph

A persistent, traceable graph of conversations, ideas, branches, cross-links, and evolving thoughts.

> **核心不是网站，而是高信噪比、可移植的头脑风暴上下文。** Astro、可视化、SEO、GEO、构建和部署都只是附加层，不能反向增加冗余内容。

这个仓库保存通过准入的高保真思想对话、压缩后的可复用理解、真实主分叉与跨话题关系，以及有意义的认知演化。目标是让任意 AI Agent 从指定问题以最小上下文继续讨论。

## 核心原则

1. **先做持久化准入，再判断更新、分叉或新根。** 话题变化不等于值得保存；不确定时默认不保存。
2. **一个聊天 Session 不是一个持久化单元。** 无关插曲不进入 corpus，独立且有价值的新话题可以单独保存。
3. **主父关系是一片森林，跨话题关系构成图。** `AI 未来` 不是所有主题的父节点。
4. **同一个思想节点只保存一份，思想分叉不用 Git branch 表示。**
5. **conversation = 已准入的 provenance；node = 压缩理解；graph = 拓扑。**
6. **仓库自身的架构、Agent 协议、部署、可视化和维护不属于思想 corpus。**
7. **不得为了 SEO/GEO、关键词、字数或“完整感”增加冗余内容。**

## 拆分规则

最小单位是：

> **一个可独立继续的问题 + 当前理解 + 关键理由 + 不可缺少的成立条件和边界。**

先在已有图谱中寻找同一问题，而不是只看当前分支。已有问题的新例子、证据、解释和限定条件更新原节点；独立问题已有不重复的理解增量，且值得单独检索与继续时，才新增节点。新名词、能力清单、章节标题和可能的后续问题都不能单独作为新建理由。

`topic` 负责问题空间与综合导航，`concept` 负责具体机制或判断，`question` 只用于有实质上下文的未决问题。总览不重复子节点全文；必要限定条件不拆到另一个节点，让原判断失去边界。小修订更新原节点，值得保留新旧差异的重大修正才用 `refines` / `contradicts`。

完整判断表、语义检查与整理已有内容的要求见 [BRAINSTORM.md](./BRAINSTORM.md)。结构校验不能代替这些语义判断。

## 新增与 AI 未来并列的话题

**支持多个独立的顶层主题，不要求把新话题挂在 `ai-future` 下。**

新话题通过准入、没有已有同义节点，也没有真正的来源父节点时，创建包含实际理解与来源的节点：

```yaml
kind: topic
primary_parent: null
```

其第一份已准入对话的 `primary_parent_conversation` 和 `forked_from_node` 也为 null。不创建通向 `AI 未来` 的虚构分叉边，不要求所有根彼此相连，也不提前创建空主题或演示内容。

多个根从 `graph.yaml` 的空父节点自动识别；`category` 只是类别标签，不是根主题。新话题与既有节点确有联系时，用有理由的 `related_to`、`supports` 等边连接，不复制节点或改变其真实来源。

## 目录

```text
thinking-graph/
├── AGENTS.md
├── BRAINSTORM.md       # 头脑风暴的最小上下文入口
├── graph.yaml
├── conversations/      # 通过准入的高保真思想来源
├── nodes/              # 高信噪比思想节点
├── lib/                # 图谱读取、Markdown 渲染与校验
├── scripts/            # 图谱校验入口
├── tests/              # 多根主题、父链和元数据回归测试
├── src/                # Astro SSG 发布层（可替换）
├── schema/
├── astro.config.mjs
├── package.json
├── wrangler.jsonc
└── CLOUDFLARE.md
```

## 头脑风暴模式

如果只是继续思考/讨论，**不要读取工程代码**。最小读取路径为 `BRAINSTORM.md` → `graph.yaml` 中相关问题 → 对应 `nodes/<id>.md`；仅在需要时扩展父节点、关系或原始 conversation。

只有通过 Persistence Gate 的内容才进入思想 corpus。总览综合新来源时，同步维护节点和图谱的 `source_conversations`。长来源可在节点的 `Source scope` 中注明原会话小节或关键原句，不为查找方便拆碎、改写原会话。

## Astro SSG 发布层

思想层是 `graph.yaml + nodes/ + conversations/`。Astro 在构建期派生：

```text
/                                    # 交互式图谱首页
/thoughts/<node-id>/                 # 节点主页面，可索引
/conversations/<conversation-id>/    # provenance，noindex/follow
/thoughts/                           # 节点索引
/llms.txt                            # 机器导航索引
/robots.txt
/sitemap-*.xml                       # 配置 SITE_URL 后生成
```

Markdown 在构建期转成并清理为 HTML。内链从主父节点、子分支、正式关系和来源中派生；SEO/GEO 不增加思想正文。

### 浏览与交互

- 首页在桌面和手机上默认显示全屏图谱；竖屏树形图向下展开，横屏向右展开，首屏自动适应全部节点。完整列表位于“节点”页。图谱并列绘制所有根，节点索引列出全部顶层话题；llms.txt 区分根主题入口与其他节点。
- 点击图谱节点会在桌面弹出画布上的正文面板，在手机弹出原生对话框；两者都有独立页面入口。手机节点阅读页保持扁平布局。
- 首页将搜索和**类别筛选**合并在顶栏，手机默认收起；搜索、筛选和选中节点通过 URL 的 `q`、`category`、`node` 恢复。类别筛选不是顶层主题归属筛选。
- 图谱支持拖动、滚轮和双指缩放；方向键平移、加减键缩放、`0` 适应全图、`/` 聚焦搜索。画布不显示视图切换或缩放按钮，阅读与列表页面仍可正常滚动。
- 颜色主题跟随系统且可手动切换。手机对话框支持 Escape 和焦点返回。禁用 JavaScript 时，首页仍显示可访问的静态节点链接。

## 本地开发与校验

仓库要求 Node 22.12.0+，包含 `.nvmrc`。

```bash
npm install
npm test
npm run check
npm run dev
npm run build
npm run preview
```

`npm test` 使用 Node 内置测试，不依赖第三方包。`npm run check` 先执行测试，再读取实际图谱，检查多根父链、循环、分叉边、来源存在性，以及节点与图谱元数据一致性。`npm run build` 在这些检查后执行 Astro 构建。

测试里的独立话题只存在于工程夹具中，不进入 `nodes/`、`conversations/` 或正式图谱。通过结构测试不代表内容自动通过语义准入或事实核验。

## Cloudflare

部署方式：**Cloudflare Workers Static Assets**。

```text
Build command:  npm run build
Deploy command: npx wrangler deploy
Production branch: main
```

生产环境设置 `SITE_URL` 为最终公开域名，用于 canonical、JSON-LD、sitemap 与 llms.txt 绝对链接。详情见 [CLOUDFLARE.md](./CLOUDFLARE.md)。

## 提交与部署原子性

`main` 是发布边界：**一次完整逻辑变更 = 一个 Git commit = 一次 main 更新 = 一次 Cloudflare 构建触发。**

Agent 使用 `blobs → tree → commit → recheck main → update_ref(main) once`，不得逐文件连续发布不完整状态。详细协议见 [AGENTS.md](./AGENTS.md)。
