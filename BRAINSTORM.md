# Brainstorm mode

This file is the **minimal context entrypoint** for AI agents brainstorming with this repository.

The repository's primary product is a **high-signal, portable thinking context** that another AI can load and continue. The website, visualization, build system, SEO, GEO, deployment, and repository-maintenance process are secondary infrastructure.

## Core invariant

> **Do not persist content merely because it appeared in the chat.**

Thinking Graph is not a complete transcript archive. It stores only durable thought content that is worth loading again.

A host ChatGPT/AI session may contain:

- admitted thought discussion;
- unrelated detours;
- casual chat;
- one-off questions;
- implementation/debugging;
- repository-maintenance discussion;
- another admitted thought topic.

Only the admitted thought segments belong in the corpus.

## Persistence gate

Before deciding whether something continues a node or creates a branch, ask:

> **Will preserving this materially improve a future AI's ability to resume a line of thought the user is likely to care about?**

Strong reasons to persist:

- it forms, changes, challenges, or materially extends a durable idea;
- the user may want to continue this line of thinking later;
- it remains useful outside the immediate turn;
- the future-context value is greater than the noise it adds.

Normally do **not** persist:

- casual small talk or incidental remarks;
- temporary factual/operational questions;
- errands, scheduling, status chatter;
- routine implementation, debugging, deployment, or tool usage;
- unrelated detours that are not intended as a lasting topic;
- discussion of this repository's own architecture, storage format, Agent protocol, website, visualization, deployment, maintenance, or debugging.

Repository rules belong in `AGENTS.md`, `BRAINSTORM.md`, engineering docs, and Git history — not in the thought corpus.

When uncertain, **do not persist by default**.

## Persistence and branching are different decisions

Use this order:

```text
new material
    ↓
worth long-term thought memory?
    ├── no → ignore
    └── yes
          ↓
continues current durable problem?
    ├── yes → update current node
    └── no
          ↓
independent durable thought?
    ├── yes → new branch or new root/topic
    └── no → ignore
```

A topic change alone is not a branch.

If admitted content is genuinely unrelated to the current graph, create a new root/topic rather than inventing a parent relation.

## What “raw/high-fidelity conversation” means

`conversations/` preserves admitted thought discussion faithfully. It does **not** mean copying an entire host chat session without filtering.

If a session goes:

```text
AI future discussion
→ unrelated computer question
→ AI future discussion resumes
```

the unrelated computer question does not need to enter the thought corpus. Preserve the relevant thought turns with high fidelity; omit rejected interludes.

The three intentional layers remain:

- `conversations/`: admitted high-fidelity provenance;
- `nodes/`: compact reusable understanding;
- `graph.yaml`: topology/navigation.

A node summary must compress its admitted sources, not restate them.

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

Unless explicitly required, do not load:

- `src/`
- `lib/`
- `scripts/`
- `astro.config.mjs`
- `package.json`
- `wrangler.jsonc`
- `CLOUDFLARE.md`
- `schema/`
- generated `dist/` and `.astro/`
- unrelated source files

Code and repository operation are not brainstorming context.

## Brainstorming write scope

After the persistence gate passes, a normal brainstorming session may modify:

### `conversations/YYYY-MM-DD/`
Save only the admitted, meaningful thought discussion as high-fidelity provenance.

### `nodes/`
Update an existing node only when the admitted discussion adds a durable conclusion, correction, open question, or reusable reasoning.

Create a new node only when an admitted problem can meaningfully continue as its own branch/root.

Keep nodes compact.

### `graph.yaml`
Update only when topology or source references change:

- new admitted node;
- primary parent;
- meaningful cross-link;
- refinement/contradiction;
- source conversation reference.

Do not add edges just because two nodes share keywords.

### Protocol files
Modify `BRAINSTORM.md` or `AGENTS.md` when repository operating rules change. These changes are **not** themselves thought content.

## Engineering boundary

Routine work on Astro, Cloudflare, CSS, JavaScript, build scripts, deployment, schema, repository architecture, or Agent maintenance belongs in Git history and engineering/protocol documentation, not in the thought graph.

Do not create a meta thought node just because repository design discussion is durable.

## SEO / GEO boundary

SEO and GEO may derive presentation from existing admitted thinking:

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
- “回到 `<node-id>`，分叉讨论……” — create a child branch only if the new material passes the persistence gate.
- “这个不用保存” — keep the discussion out of the thought corpus.
- “把这轮思考保存下来” — persist the admitted thought-layer changes.
- “只做头脑风暴，不碰工程代码” — remain strictly in brainstorm mode.

If no node is named, locate the best anchor from `graph.yaml` and read only what is necessary.

## Publish rule

When persisting admitted thought-layer changes, publish the complete logical change as one atomic Git commit. Do not create one commit per file.
