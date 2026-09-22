# Brainstorm mode

This file is the **minimal context entrypoint** for AI agents doing brainstorming with this repository.

The repository's primary product is a **high-signal, portable thinking context** that any AI agent can load and continue. The website, visualization, build system, SEO, GEO, and deployment are secondary presentation/infrastructure layers.

## Core invariant

> **Never add redundant content for any reason.**

Do not add prose merely for:

- SEO or GEO;
- keyword coverage;
- page length;
- perceived completeness;
- stylistic polish;
- explaining the same idea again in another file;
- making the repository look more substantial.

If a sentence does not add new information, provenance, a durable conclusion, a correction, a real relationship, or a useful open question, do not add it.

The only intentional overlap is between layers with different jobs:

- `conversations/`: source/provenance;
- `nodes/`: compact reusable understanding;
- `graph.yaml`: topology/navigation.

A node summary must **compress** its source conversation, not restate it.

## Brainstorming read scope

Default to the smallest useful context.

Read in this order:

1. `BRAINSTORM.md` — this contract.
2. `graph.yaml` — only enough to locate the active node and meaningful relations.
3. The active `nodes/<id>.md`.
4. The primary-parent chain only when the current idea depends on it.
5. Cross-linked nodes only when directly relevant.
6. Source conversation files only when exact wording, reasoning history, or provenance is needed.

If the user names a node, start there. Do not scan the whole repository first.

### Do not read in brainstorm-only mode

Unless the user explicitly asks about the website, build, deployment, schema, or implementation, do not load:

- `visualizer/`
- `scripts/`
- `package.json`
- `wrangler.jsonc`
- `CLOUDFLARE.md`
- `schema/`
- generated `dist/`
- unrelated source files

Code is not brainstorming context.

## Brainstorming write scope

A normal brainstorming session may modify only:

### `conversations/YYYY-MM-DD/`
Save the meaningful discussion as provenance.

Do not put routine implementation/debug/deployment chatter here.

### `nodes/`
Update an existing node only when the session adds a durable conclusion, correction, open question, or reusable reasoning.

Create a new node only when the problem can meaningfully continue as its own branch.

Keep nodes compact.

### `graph.yaml`
Update only when topology or source references change:

- new node;
- primary parent;
- meaningful cross-link;
- refinement/contradiction;
- source conversation reference.

Do not add edges just because two nodes share keywords.

### Protocol files
Modify `BRAINSTORM.md` or `AGENTS.md` only when the operating rules themselves change.

## Engineering boundary

Routine work on Cloudflare, CSS, JavaScript, build scripts, deployment, or UI belongs in Git history and engineering documentation, **not** in the thought graph.

Only promote engineering discussion into the thought graph when it creates a durable idea or rule needed by future brainstorming agents.

## SEO / GEO boundary

SEO and GEO may derive presentation from existing thinking:

- stable URLs;
- semantic HTML;
- metadata;
- sitemap;
- internal links derived from real graph relations;
- machine-readable provenance.

They must never cause new filler content, artificial FAQs, keyword-expanded prose, duplicate pages, or synthetic conclusions.

If discoverability conflicts with content quality, content quality wins.

## User shortcuts

A user can start with:

- “从 `<node-id>` 继续聊” — resume that node with minimal context.
- “回到 `<node-id>`，分叉讨论……” — create a child branch if warranted.
- “只做头脑风暴，不碰工程代码” — remain strictly in brainstorm mode.
- “把这轮思考保存下来” — persist only the thought-layer changes.

If no node is named, locate the best anchor from `graph.yaml` and read only what is necessary.

## Publish rule

When persisting a session, publish all thought-layer file changes as one atomic Git commit. Do not create one commit per file.
