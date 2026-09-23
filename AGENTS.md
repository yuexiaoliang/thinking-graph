# AGENTS.md

This is the operating contract for any AI agent or human maintaining this repository.

## 0. Prime directive and work-mode routing

The primary product is a **compact, high-signal, portable context for ongoing thinking by any AI**. The website, visualization, build pipeline, Cloudflare, SEO, and GEO are replaceable infrastructure; they must never distort or inflate the thought corpus.

> **Never add redundant content for any reason.**

The intentional functional layers are: conversation = admitted provenance; node = compressed reusable understanding; graph = topology. Do not add prose for keywords, polish, length, SEO/GEO, or perceived completeness.

### Persistence gate

Before creating/updating any conversation, node, or edge, ask: **Will preserving this materially improve a future AI's ability to resume a line of thought the user is likely to care about?**

Admit material that forms, changes, challenges, or materially extends a durable idea, remains useful outside the immediate chat turn, and adds more future context value than noise. Normally reject casual chat, temporary errands/status, one-off operational questions, routine implementation/debugging, and incidental detours without lasting value. When uncertain, do not persist by default.

This repository's own architecture, storage format, Agent protocol, website, visualization, deployment, maintenance, and debugging belong in protocol/engineering documentation and Git history, **not in `conversations/`, `nodes/`, or `graph.yaml`**. Durability alone does not make a repository rule thought content.

A host chat is not a persistence unit. Save only admitted thought segments, not rejected interludes. An unrelated but independently valuable long-running topic may become a separate root; do not invent a parent relation to the active topic.

### Choose work mode before reading

- **Brainstorm:** read [BRAINSTORM.md](./BRAINSTORM.md), then minimal relevant graph/node/source context. Do not load engineering files by default.
- **Engineering:** when the user asks about code, publishing, deployment, schema, or repository operation, read this contract and only relevant engineering files.
- **Mixed:** begin with thought scope; expand to engineering only when the requested action requires it.

`BRAINSTORM.md` is the detailed semantic admission/granularity contract for **all** content edits, including engineering-driven cleanup. Sections below summarize it; implementation checks do not replace it.

---

## 1. Mission

Preserve admitted high-signal thought conversations and evolving understanding, not an archive of everything said. A new AI session or human should be able to reconstruct an idea's origin, read the admitted source, understand the current position without rereading everything, locate its branch and cross-topic relations, resume it, and inspect substantive refinements or contradictions.

---

## 2. Mental model

Use two simultaneous structures:

- **Forest-like provenance:** every non-root has exactly one `primary_parent`; any number of independent roots have `primary_parent: null`.
- **Graph-like relationships:** justified typed links may connect any nodes, including across roots.

File organization may look tree-like; the conceptual model is a graph. `ai-future` is one topic root, not a universal parent. `category` is a display/retrieval label, not parentage.

**Never represent thought branches using Git branches.** Git branches are version-control workflow only.

---

## 3. Sources of truth

### 3.1 `conversations/` — admitted provenance

A file represents a logical thought conversation or admitted segment, not necessarily an entire host session. Preserve retained user/assistant wording and order faithfully. Omit rejected interludes. Do not silently polish retained messages or replace them with summaries. Label reconstructed wording as reconstruction.

Keep a coherent causal discussion together even when it yields several nodes. Split only when admitted material starts a durable independent problem space—not one file per node. A genuine child conversation records its parent and fork node. The first conversation for an unrelated root has both fields explicitly null.

### 3.2 `nodes/` — reusable understanding

A node contains a stable ID, title, kind, parent, source IDs, status/tags, current understanding, essential reasoning and conditions, and meaningful continuation. Its canonical body exists once. Link to it across topics; never copy it into several folders.

### 3.3 `graph.yaml` — canonical topology

Contains the node index, files, primary parents, source IDs, navigation summaries/continuation hints, and typed relationships. Publishing derives navigation from it; never maintain a second handwritten graph or roots list.

Node metadata repeated in the graph must match the canonical file: `id`, `title`, `kind`, `category`, `status`, `primary_parent`, and the set of `source_conversations`. Update them together.

---

## 4. Repository layout

```text
/
├── AGENTS.md
├── BRAINSTORM.md
├── README.md
├── CLOUDFLARE.md
├── graph.yaml
├── conversations/       # admitted provenance
├── nodes/               # reusable understanding
├── lib/                 # loading, rendering, structural validation
├── scripts/             # validation entry point
├── tests/               # engineering fixtures, never thought content
├── schema/
├── src/                 # replaceable Astro publishing layer
├── package.json
├── astro.config.mjs
└── wrangler.jsonc
```

Generated `dist/` and `.astro/` are disposable and must not be committed. Static output includes `/`, `/thoughts/<id>/`, `/conversations/<id>/`, `/thoughts/`, `llms.txt`, `robots.txt`, `404.html`, assets, and sitemap files when `SITE_URL` is configured. Do not create empty placeholder folders.

---

## 5. Stable identifiers

Use descriptive lowercase ASCII kebab-case IDs. Keep IDs stable after publication; change display titles rather than renaming referenced IDs. Conversation IDs are date-scoped, e.g. `conv-20260922-001`.

A type change from concept to topic is not an ID change. Do not rename/reparent a node merely to tidy a taxonomy.

---

## 6. Conversation file contract

Create a conversation file only after admission. Required front matter:

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

For a genuine fork, replace the two nulls with the actual parent conversation ID and originating node ID. Do not use chat adjacency as evidence of provenance.

Body:

```markdown
## Conversation

### User

Exact or high-fidelity admitted message.

### Assistant

Exact or high-fidelity admitted response.

## Branch outcome

Short factual description of the original graph outcome.

## Continue from here

- unresolved question
```

Preserve admitted turns in order; rejected interludes may be omitted. Outcome/continuation metadata never replaces the transcript. Historical `nodes`/Branch outcome describes what the conversation originally produced; current backlinks are derived from node source references, not by rewriting old dialogue as summaries evolve.

---

## 7. Node file contract

Required front matter:

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

Recommended body sections: Current understanding; Why this node exists or Scope; Key reasoning; necessary conditions/boundaries; optional Source scope; Open questions; Continue From Here. Do not insert empty boilerplate sections merely to match a template.

Minimum semantic unit:

> One independently resumable question + current understanding + essential reasoning + conditions needed to interpret the claim correctly.

`topic` is an overview/problem space, either root or nested. It synthesizes and routes, rather than repeating child arguments. `concept` carries an independent mechanism, proposition, explanation, or role boundary. `question` is a substantive, scoped unresolved problem with known context—not every speculative follow-up. `meta` remains schema-compatible but does not override the exclusion of repository-maintenance content.

For long sources, a compact `Source scope` may link the original conversation and name exact headings or distinctive short phrases. It is a textual locator, not a generated deep-link guarantee. Do not split or rewrite transcripts merely to improve source lookup.

---

## 8. Persistence first, granularity second

Follow [BRAINSTORM.md](./BRAINSTORM.md)'s routing table and five semantic checks.

```text
new material
  → persistence gate (reject means write nothing)
  → search existing questions across the graph, not only the active branch
  → same question: update canonical node
  → independent increment: assess separate retrieval/continuation value
      → genuine earlier idea prompted it: child branch
      → no genuine parent: peer root
```

A new actor, evidence base, causal question, or possible long discussion is a candidate signal, not sufficient permission to split. Require a distinct question, independent durable increment, standalone meaning, separate continuation, and net context value.

Keep new examples, necessary qualifications, evidence, explanations, subskills, and minor corrections with the existing question. A name or a list of future questions is not enough for a new node. Do not use word count, fixed depth, or a target node count as a splitting rule.

Keep claims with indispensable conditions: do not separate the risk of unverified recursive AI data from the distinction that reliably verified synthetic data can differ. Do not invent conclusions just to make a node look independent.

---

## 9. Primary parents and peer roots

Each non-root has exactly one valid `primary_parent`. Choose the earlier idea that genuinely prompted the investigation, not whichever node happens to be active or shares its category. Each non-root also has exactly one matching child → parent `forked_from` edge.

Every root has:

```yaml
kind: topic
primary_parent: null
```

Roots have no outgoing `forked_from` edge. Multiple disconnected roots are valid. Do not create a fake universal root, force all topics under `ai-future`, or invent links just to make the graph connected. Do not create empty example roots or a wrapper plus an identical child; a substantial new topic can start without children.

Independent topics in the same host chat may have separate root conversations (`primary_parent_conversation: null`, `forked_from_node: null`). Cross-root associations use semantic edges and do not change primary provenance. A subject change genuinely prompted by an existing idea can remain its child even if the category changes.

Roots and each node's root membership are derived from the acyclic parent forest. Categories neither determine nor restrict root membership. Existing published nodes must not be reparented merely for cosmetic grouping.

---

## 10. Cross-topic relation types

Use only these unless this contract and schema are deliberately amended:

| Type | Direction/meaning |
| --- | --- |
| `related_to` | Useful association without a stronger directional claim |
| `supports` | Source supplies reasoning/evidence supporting target |
| `contradicts` | Source conflicts with target conclusion |
| `refines` | Source is a substantively more precise later position |
| `leads_to` | Source raises target as a next question |
| `depends_on` | Understanding/accepting source materially depends on target |
| `forked_from` | Child source arose from target parent |

Every edge needs a specific, nonempty `reason`. The node's `primary_parent` is canonical for parentage; duplicated fork edges must agree with it. Primary-parent cycles are forbidden; legitimate cross-topic graph cycles are allowed. Reject duplicate/self edges.

A typed relation mentioned only in prose or a backticked node ID does not create a graph edge. Record useful semantic relations in `graph.yaml`; avoid a second relation list in prose. Do not invent dense keyword-based links or duplicate parent/child navigation with unnecessary semantic edges.

---

## 11. Cross-topic overlap and cleanup

One idea, one canonical node file. Multiple topics can link to it. Do not copy `real-world-data-value` into separate data, talent, and business folders.

For existing content, first clarify scope, correct kind, remove repeated child arguments from overviews, and complete genuine sources/relationships. A short node is not automatically too granular. A broad overview is not a reason to split every listed capability.

Do not silently merge published branches. Explicit merges require preserving independent provenance, updating references, and a URL compatibility/redirect plan. Preserve stable IDs for ordinary cleanup. Engineering fixtures/examples stay in `tests/` or docs and must never enter the corpus or published thought index.

---

## 12. Evolving or corrected views

Never rewrite history to make thinking appear consistent. If a substantive later position changes an earlier conclusion and the difference deserves preservation: keep the original conversation/node, create or update the new position, link with `refines` or `contradicts`, and optionally mark the earlier node `superseded`. Use `superseded_by` only for clear replacement.

Routine wording fixes, new examples, and minor clarifications update the same canonical node. Do not manufacture a new evolution node for every edit. Required conditions belong with the current claim; material changes must not silently erase an earlier substantive position.

---

## 13. Starting a new AI session

Choose work mode first. In brainstorm mode: read `BRAINSTORM.md`, locate the relevant question in `graph.yaml`, read its node, then expand to parents/relations/sources only as needed. A named node is the active anchor. If no node matches, consider a new admitted root instead of defaulting to `ai-future`.

Do not load `src/`, `lib/`, `scripts/`, `tests/`, schema, deployment configuration, or generated output during pure brainstorming without a concrete engineering need. Engineering sessions read this full contract and relevant implementation files; mixed sessions expand scope only as needed.

---

## 14. Adding or updating thought content

1. Admit durable thought segments; discard rejected interludes.
2. Search existing canonical questions and apply semantic granularity checks.
3. Decide update, genuine child, independent root, relation, or meaningful revision.
4. Save admitted high-fidelity provenance without replacing earlier transcripts.
5. Update node understanding, essential conditions, and actual source references.
6. Synchronize graph metadata/relations; update `updated_at`.
7. Review scope, non-duplication, parent rationale, and source locators.
8. Run `npm run check`; run `npm run build` for publishing-sensitive changes when tooling is available. Report unrun checks honestly.
9. Publish one complete atomic commit.

When a synthesis uses new conversations, add the actual source IDs to both node front matter and graph; do not inherit every source mechanically from descendants.

Repository rules, debugging, deployment, and this system's own operation remain documentation/Git history, not thought conversations. Suggested commit prefixes: `content:`, `graph:`, `docs:`, `viz:`.

---

## 15. Astro SSG publishing contract

Canonical direction:

```text
conversations/ + nodes/ + graph.yaml → Astro SSG → dist/
```

Every node has a real `/thoughts/<id>/` static URL. Every conversation has `/conversations/<id>/`, normally `noindex,follow` so provenance does not compete with compressed nodes. The homepage keeps the interactive graph and real crawlable links. Render and sanitize Markdown at build time; public reading pages must not depend on browser-side Markdown fetching/rendering.

Preserve progressive enhancement: desktop defaults to graph, mobile to readable list; static links work without JavaScript. Preserve current-page graph-node reading with optional standalone URLs, keyboard controls, modal focus handling, ordinary page scrolling, and URL-restorable browsing state. Do not regress the flat mobile reading layout.

Navigation derives from actual parents, children, typed relations, incoming links, sources, and **all roots**, never a hard-coded `ai-future` assumption. Category labels are not topic-root labels. `graph.yaml` remains the sole relationship source.

SEO/GEO may derive semantic HTML, canonical/Open Graph metadata, JSON-LD, breadcrumbs, sitemap, robots.txt, llms.txt, and machine-readable relations. Never create expanded prose, FAQs, keyword variants, or artificial thought pages. `SITE_URL` enables production absolute URLs and sitemap; without it, build without inventing an origin.

---

## 16. Data quality and validation

Preserve only admitted provenance; do not save low-value material for transcript completeness. Every substantive node has at least one real source conversation. Separate external facts, inference, and uncertainty; retain available source URLs/citations. Do not fabricate past wording.

Structural validation checks the parent forest, root kind, valid references, matching fork edges, known edge types/reasons, unique IDs/files, source lists, and agreement between graph metadata and node front matter. It accepts multiple roots and cross-root semantic edges. Regression fixtures cover these cases without adding demonstration thought content.

**Structural validity does not prove semantic novelty, good granularity, admission, or factual truth.** Perform the BRAINSTORM review separately. Preserve signal density; no filler, duplicated explanations, artificial FAQs, or SEO-driven content.

---

## 17. Prohibited patterns

Do not: use Git branches for thought forks; duplicate node bodies; replace retained conversations with summaries; erase earlier conclusions; add keyword-only links; hard-code a second graph/root list; casually change IDs or parents; flatten all thoughts into one giant file; create an archive that removes earlier thought from provenance; fabricate historical dialogue; commit generated output; treat Cloudflare/Astro as source of truth; load engineering context unnecessarily; persist rejected interludes or repository self-maintenance; create a node for every topic change/name/heading; force independent topics under `ai-future`; or add content for length, keywords, SEO/GEO, or perceived completeness.

---

## 18. Definition of done

- [ ] Material passed admission; only admitted high-fidelity provenance is saved.
- [ ] Existing canonical questions were checked across relevant roots.
- [ ] New nodes pass distinct-question, independent-increment, standalone-meaning, separate-continuation, and net-value checks.
- [ ] Kind/scope are appropriate; necessary conditions remain with the claim.
- [ ] Child parent/fork metadata is genuine, or independent-root metadata is explicitly null.
- [ ] Node/graph metadata and real source references agree; long-source locators are useful where needed.
- [ ] Meaningful semantic links are in `graph.yaml`; no redundant content or invented links.
- [ ] Continuation reflects real open issues, not empty placeholder branches.
- [ ] `npm run check` passes when tooling is available; relevant SSG pages build for publishing-sensitive changes.
- [ ] Complete logical change is committed atomically, with any validation limitations reported.

---

## 19. Repository philosophy

Do not prebuild a perfect ontology. Preserve:

> admission → thought conversation → update/branch/root → reasoning → conclusion → revision → next durable thought

When neat structure conflicts with provenance, preserve provenance. Optimize for a future AI resuming a meaningful question, not a target number of nodes.

---

## 20. Build and deployment contract

Target: **Astro static output served by Cloudflare Workers Static Assets**. Do not add SSR or `@astrojs/cloudflare` without a genuine runtime requirement.

Canonical thought data: `graph.yaml`, `nodes/`, `conversations/`. Replaceable infrastructure: `src/`, `lib/`, `scripts/`, `tests/`, Astro configuration, package manifest, Wrangler configuration.

```bash
npm test
npm run check
npm run dev
npm run build
npm run preview
npm run deploy
```

`npm test` runs dependency-free Node structural tests. `npm run check` runs tests and loads/validates the actual graph. `npm run build` checks the graph before `astro build`. `wrangler.jsonc` serves `./dist`.

Workers Builds: build command `npm run build`; deploy command `npx wrangler deploy`; production branch `main`. Set `SITE_URL` to the final public origin for canonical URLs, sitemap, JSON-LD, and absolute llms.txt links. Generated `dist/` and `.astro/` stay ignored.

When changing publishing behavior, synchronize relevant code, README, and this contract. Update `CLOUDFLARE.md` as well when deployment configuration/behavior is affected; do not add documentation-only deployment claims unrelated to the actual change.

---

## 21. Atomic Git commit and deployment contract

Cloudflare builds are triggered by updates to `main`.

> **One logical change set = one Git commit = one main ref update = one Cloudflare build trigger.**

Prepare all related content, graph, code, tests, and documentation together. Prefer Git Data, not a sequence of Contents API writes to `main`:

```text
read current main ref and base tree
→ prepare every changed file completely
→ create_blob for changed files
→ create one tree based on current tree
→ create one commit with current main as parent
→ re-check main has not moved
→ update_ref(main) exactly once, force=false
```

Blob/tree/commit creation does not publish intermediate states. Immediately before updating the ref, confirm it still matches the parent SHA. If it moved, do not publish the stale commit or force-update: read the new head/tree, reconcile, and create a new commit against that parent.

Never issue repeated `create_file`/`update_file` writes to main for one feature, publish partly prepared files, bypass a race with `force=true`, or split a coherent change into deployment-triggering implementation commits unless explicitly requested. Even independent single-file changes should default to this atomic flow. Treat main as a release boundary, not a scratchpad.
