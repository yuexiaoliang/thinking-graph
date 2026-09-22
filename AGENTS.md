# AGENTS.md

This file is the operating contract for any AI agent or human maintaining this repository.

## 1. Mission

`thinking-graph` is a persistent, portable memory of long-running conversations and evolving ideas.

The repository must make it possible for a new AI session, a different AI system, or a human reader to:

1. reconstruct where an idea came from;
2. see which branch it belongs to;
3. see which other topics it intersects with;
4. read the original conversation that produced it;
5. understand the current conclusion without rereading everything;
6. resume from any chosen node without losing prior context;
7. inspect how earlier conclusions were refined or contradicted over time.

This is **not** merely a summary repository and **not** merely a transcript archive.

---

## 2. Mental model

Use two simultaneous structures:

- **Tree-like provenance**: every non-root idea node has one `primary_parent`. This answers: “Where did this branch come from?”
- **Graph-like relationships**: nodes may have many typed relationships to other nodes. This answers: “What else is this idea connected to?”

Therefore:

> File organization may look tree-like, but the conceptual model is a graph.

### Critical rule

**Never use Git branches to represent thought branches.**

Git branches are only for repository/version-control workflow. Thought branches live in conversation metadata, node metadata, and `graph.yaml`.

---

## 3. Sources of truth

There are three layers. Do not collapse them into one.

### 3.1 Raw conversation layer — `conversations/`

Purpose: historical record.

- Preserve user and assistant messages as faithfully as possible.
- Do not silently rewrite old messages to improve style.
- Do not replace the conversation with a summary.
- If a discussion clearly forks into a new problem space, create a new conversation file.
- A child conversation must record its parent conversation and the node it forked from.

### 3.2 Idea layer — `nodes/`

Purpose: reusable understanding.

A node contains:

- stable ID;
- title;
- primary parent;
- source conversations;
- current summary;
- key reasoning;
- open questions;
- continuation prompts;
- status;
- tags.

A node body exists **once**. If it belongs to multiple topics, link to it; do not copy it into multiple folders/files.

### 3.3 Relationship layer — `graph.yaml`

Purpose: global topology.

`graph.yaml` is the canonical relationship index used by agents and the visualizer.

It contains:

- node index;
- primary parent information;
- cross-topic edges;
- relation types;
- file locations;
- source conversation IDs;
- summaries and continuation hints needed for navigation.

The visualizer must read this data. It must not maintain a second hand-written relationship graph.

---

## 4. Repository layout

```text
/
├── AGENTS.md
├── README.md
├── CLOUDFLARE.md
├── package.json
├── wrangler.jsonc
├── graph.yaml
├── conversations/
│   └── YYYY-MM-DD/
│       ├── 001-topic.md
│       ├── 002-child-topic.md
│       └── ...
├── nodes/
│   ├── stable-node-id.md
│   └── ...
├── schema/
│   ├── README.md
│   └── graph.schema.json
├── scripts/
│   └── build-site.mjs
└── visualizer/
    └── index.html
```

Generated locally/CI (never committed):

```text
dist/
├── index.html
├── graph.yaml
├── nodes/
├── conversations/
└── 404.html
```

Do not create empty placeholder folders. Git does not preserve empty directories.

---

## 5. Stable identifiers

IDs must be:

- lowercase;
- ASCII;
- kebab-case;
- descriptive;
- stable after publication.

Examples:

```text
ai-future
future-talent
verification-architecture
white-collar-displacement
real-world-data-value
```

Conversation IDs should be date-scoped:

```text
conv-20260922-001
conv-20260922-002
```

Do not rename an ID merely to improve wording once other nodes reference it. Change the display title instead.

---

## 6. Conversation file contract

Each conversation file begins with YAML front matter.

Required fields:

```yaml
---
id: conv-YYYYMMDD-NNN
title: Human-readable title
date: YYYY-MM-DD
status: active
primary_parent_conversation: null
forked_from_node: null
nodes:
  - node-id
tags:
  - tag
---
```

For a fork:

```yaml
primary_parent_conversation: conv-20260922-001
forked_from_node: future-talent
```

### Conversation body

Use this form:

```markdown
## Conversation

### User

Exact or high-fidelity user message.

### Assistant

Exact or high-fidelity assistant response.

### User

...
```

Then append:

```markdown
## Branch outcome

Short factual description of what changed in the graph.

## Continue from here

- unresolved question
- plausible next branch
```

“Branch outcome” is secondary metadata. It never replaces the transcript.

---

## 7. Node file contract

Each node file begins with YAML front matter:

```yaml
---
id: real-world-data-value
title: 真实世界数据价值上升
status: active
kind: concept
category: data
primary_parent: training-data-pollution
source_conversations:
  - conv-20260922-003
tags:
  - ai
  - data
---
```

Recommended body:

```markdown
# Title

## Current understanding

...

## Why this node exists

...

## Key reasoning

...

## Cross-links

- relation -> node

## Open questions

...

## Continue From Here

...
```

Keep node summaries compact enough for an AI to reload quickly, but preserve the source conversation separately.

---

## 8. When to create a new branch

Create a new conversation file and usually a new node when the discussion changes the **problem being investigated**, not merely when it adds detail.

Strong signals for a fork:

1. The user asks a new causal question.
2. The answer would require a substantially different evidence base.
3. The new discussion could continue independently for many turns.
4. A new actor/system/market is introduced as the main object of analysis.
5. The conversation jumps from an object-level topic to a meta-level topic.
6. The user explicitly says they want to branch or revisit a prior branch.

Examples:

- “未来什么人才稀缺？” → “白领会不会挤压蓝领？” is a fork.
- “白领挤压蓝领” → “这些人会不会大量做自媒体？” can become a new fork when content economics becomes the main subject.
- Clarifying one sentence inside the same argument is **not** necessarily a fork.

When uncertain, prefer preserving a meaningful branch rather than letting one transcript grow indefinitely.

---

## 9. Primary parent rule

Every non-root node has exactly one `primary_parent`.

Choose the node that best answers:

> “Which earlier idea directly caused this idea to be investigated?”

This preserves provenance even when many cross-links exist.

Do not assign multiple primary parents.

---

## 10. Cross-topic relation types

Use only these relation types unless AGENTS.md is deliberately amended:

### `related_to`
There is a useful association, but no strong directional claim.

### `supports`
The source node supplies reasoning/evidence supporting the target node.

### `contradicts`
The source node conflicts with the target conclusion. Preserve both nodes.

### `refines`
The source node is a later, more precise version of the target. Do not delete the older view.

### `leads_to`
The source naturally raises the target as a next question.

### `depends_on`
Understanding or accepting the source materially depends on the target.

### `forked_from`
Used for explicit provenance when representing a branch edge in relationship data. The node's `primary_parent` remains the canonical parent field.

Each non-trivial cross-link should have a short `reason` in `graph.yaml`.

Do not invent a dense web of weak relations just because two nodes share keywords.

---

## 11. Cross-topic overlap

Multiple topics are expected to overlap.

Correct:

```text
real-world-data-value
  related_to -> creator-economy-influx
  supports   -> real-world-connector
  leads_to   -> data-collection-business
```

Incorrect:

```text
nodes/data/real-world-data-value.md
nodes/talent/real-world-data-value.md
nodes/business/real-world-data-value.md
```

One idea, one canonical node file.

---

## 12. Evolving or corrected views

Never rewrite history to make the repository look internally consistent.

If a later discussion changes an earlier conclusion:

1. keep the original conversation;
2. keep the original node;
3. create/update the new node;
4. connect it using `refines` or `contradicts`;
5. optionally mark the old node `status: superseded`;
6. add `superseded_by` only when the new position clearly replaces the old one.

This repository should expose cognitive evolution, not hide it.

---

## 13. Starting a new AI session

Before answering a request that references this repository:

1. Read this `AGENTS.md`.
2. Read `graph.yaml`.
3. Locate the requested node.
4. Read that node file.
5. Read its source conversation(s) if the user's question depends on exact prior reasoning.
6. Read the primary-parent chain only as far as necessary.
7. Read cross-linked nodes only when relevant.
8. Continue from the existing state instead of re-deriving settled context.

If the user says “continue from node X,” node X is the active context anchor.

---

## 14. Adding a new conversation

For every meaningful new discussion:

1. Identify the active node.
2. Decide whether the discussion continues the same node or forks.
3. Save the new transcript in `conversations/YYYY-MM-DD/`.
4. Create or update node files.
5. Update `graph.yaml`.
6. Add cross-links only when they add real navigational value.
7. Update `updated_at`.
8. Run `npm run check` when a Node environment is available.
9. Run `npm run build` when changing deployment/build-sensitive files and verify the visualizer output.
10. Commit with a descriptive message.

Preferred commit patterns:

```text
content: add branch on AI evaluation
content: continue real-world data branch
graph: link creator economy to data provenance
docs: clarify branching rules
viz: improve graph navigation
```

---

## 15. Visualizer contract

`visualizer/index.html` is a **view**, not a database.

It must:

- read `../graph.yaml`;
- display node titles and parent structure;
- distinguish primary-parent edges from cross-topic edges;
- support search;
- support category filtering;
- support node selection;
- show source conversations and continuation hints;
- support zoom/pan or equivalent navigation.

It must not contain a manually duplicated copy of the graph topology.

The repository uses a thin static build:

- source visualizer: `visualizer/index.html`;
- canonical graph: `graph.yaml`;
- build command: `npm run build`;
- generated deployment output: `dist/`.

The build script validates graph integrity before copying source content into `dist/`.

If the schema changes, update the visualizer, build validation, and schema docs in the same change.

---

## 16. Data quality rules

### Preserve provenance
A conclusion without a source conversation is suspect. Every substantive node should normally have at least one source conversation.

### Separate fact from inference
When a node contains external factual claims, keep source URLs/citations in the source conversation or node notes when available.

### Do not fabricate transcript
If exact past wording is unavailable, label reconstructed text as a reconstruction rather than presenting it as exact.

### Do not over-summarize
If the raw conversation exists, keep it. Summaries are navigation aids, not replacements.

### Do not silently merge branches
Two similar nodes may later be linked or explicitly merged, but never erase their independent provenance casually.

---

## 17. Prohibited patterns

Do **not**:

- represent thought forks with Git branches;
- duplicate one node body under multiple topic directories;
- replace original conversations with summaries;
- delete old conclusions merely because a newer view exists;
- add cross-links based only on keyword overlap;
- hard-code a second graph inside the visualizer;
- change stable node IDs casually;
- flatten all discussion into one giant markdown file;
- create an “archive” that removes old thinking from the active provenance graph;
- fabricate missing historical conversation;
- commit generated `dist/` output;
- treat Cloudflare as the source of truth instead of GitHub source files.

---

## 18. Definition of done for a new branch

A branch is not complete until:

- [ ] raw/high-fidelity conversation is saved;
- [ ] conversation metadata names its parent/fork node;
- [ ] relevant node exists or is updated;
- [ ] node has source conversation reference;
- [ ] `graph.yaml` contains the node;
- [ ] `primary_parent` is valid;
- [ ] meaningful cross-links are recorded;
- [ ] open questions / Continue From Here are present;
- [ ] `npm run check` passes when tooling is available;
- [ ] visualizer can render the graph;
- [ ] change is committed.

---

## 19. Current repository philosophy

The long-term goal is not to produce a perfect ontology in advance.

The goal is to preserve:

> **conversation → branch → reasoning → conclusion → revision → new branch**

with enough structure that future AI systems can reconstruct and extend it.

When forced to choose between a neat structure and preserving provenance, preserve provenance.


---

## 20. Build and deployment contract

The deployment target is **Cloudflare Workers Static Assets**.

### Source of truth

GitHub source files remain canonical:

- `graph.yaml`
- `nodes/`
- `conversations/`
- `visualizer/`

Cloudflare is only a deployment/serving layer.

### Commands

```bash
npm run check
npm run build
npm run dev
npm run deploy
```

### Cloudflare configuration

`wrangler.jsonc` points Static Assets at:

```text
./dist
```

Cloudflare Workers Builds should use:

```text
Build command:  npm run build
Deploy command: npx wrangler deploy
Production branch: main
```

### Build behavior

`scripts/build-site.mjs` must fail before deployment when graph integrity is broken, including missing parent nodes, missing node files, missing source conversations, invalid relation endpoints, or unknown relation types.

### Generated files

`dist/` is disposable and ignored by Git. Never edit it as source and never commit it.

If build/deployment behavior changes, update all of the following together:

1. `scripts/build-site.mjs`
2. `package.json`
3. `wrangler.jsonc` when applicable
4. `CLOUDFLARE.md`
5. this section of `AGENTS.md`
