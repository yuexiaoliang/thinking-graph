# Brainstorm mode

This is the **minimal context entrypoint** for an AI continuing this repository's thinking. The product is high-signal, portable thought context; the website, deployment, and repository maintenance are secondary infrastructure.

## 1. Admit before organizing

> Do not persist content merely because it appeared in the chat.

Before writing a conversation, node, or edge, ask: **Will this materially improve a future AI's ability to resume a line of thought the user is likely to care about?**

Admit material that forms, changes, challenges, or materially extends a durable idea and remains useful outside the immediate turn. Normally reject casual chat, temporary errands, one-off operational questions, routine implementation/debugging, and unrelated detours without lasting reasoning value. When uncertain, do not persist by default.

This repository's own architecture, storage, Agent protocol, website, deployment, and maintenance belong in protocol/engineering documents and Git history, **never in the thought corpus**. A durable repository rule is not a thought node.

An unrelated topic is not automatically noise: a substantial, independently valuable new line of thinking can pass this gate and become a peer root. Merely changing the subject is insufficient.

## 2. The unit of a node

> **One independently resumable question + current understanding + essential reasoning + the conditions and boundaries needed to interpret it correctly.**

This is a semantic unit, not a word-count, paragraph-count, noun-count, fixed-depth, or fixed-number-of-nodes rule.

Keep qualifications with the claim they constrain. For example, the distinction between unverified recursive model output and reliably verified synthetic data belongs with the training-data-risk argument; separating it can turn a conditional claim into a misleading blanket statement.

Before creating a node, require all of these checks:

1. **Distinct question:** State what it answers that an existing node does not. Search the graph, including other roots; do not search only the active branch.
2. **Independent increment:** It already contains non-duplicated reasoning, a conclusion, a tension, or a well-scoped unresolved problem. A new name, a capability list, or possible follow-up questions alone is not enough.
3. **Standalone meaning:** Without rereading the entire source conversation, a future AI can understand the problem, current position, important conditions, and uncertainty.
4. **Separate continuation:** Future evidence could develop this question without repeatedly rewriting the same content in its parent or sibling.
5. **Net context value:** The benefit of a separate retrieval unit exceeds the extra navigation and context-recovery cost.

Do not invent a conclusion to pass these checks. A `question` node is appropriate only for a substantive unresolved research problem with an explicit scope, known context, and reason for preserving it—not every item in an Open questions list.

## 3. Route admitted material

| Material | Default action |
| --- | --- |
| Same durable question, even in a different session/root from the active one | Update the existing canonical node |
| New example, evidence, explanation, necessary qualification, or minor wording correction | Update that node; do not split |
| Independent question with its own durable increment, genuinely prompted by an existing idea | Create a child with that idea as `primary_parent` |
| Independent durable topic with no genuine provenance parent | Create a peer root with `primary_parent: null` |
| A useful connection to an existing idea | Add a justified typed edge; do not copy the idea |
| Several existing branches need a shared synthesis/entry point | Use a `topic` overview, without repeating child arguments |
| Only a new term, subskill, example, speculative branch title, or list of follow-ups | Keep it in the existing node; do not pre-create nodes |
| A substantive later position changes an earlier conclusion and the difference matters | Preserve the earlier view/source; use `refines` or `contradicts` |
| No durable increment | Write nothing |

A shift of actor, evidence base, or causal question is a **candidate signal**, not sufficient permission to split. Apply the full checks above.

For each new node, be able to explain: “It answers X, unlike Y; its independent increment is Z; its source/parent is W.” This is an authoring review, not boilerplate to copy into every node.

## 4. Topic overviews versus concepts

- `topic`: a durable problem space or synthesis/entry point. State the common question and integrated understanding; delegate detailed mechanisms to existing nodes. A topic can be a root or a nested overview.
- `concept`: one independently useful explanation, mechanism, proposition, or role boundary.
- `question`: a scoped unresolved problem with meaningful existing context.
- `meta`: retained for schema compatibility, not an excuse to admit repository-maintenance content.

An overview is not an additional full summary of every child. Do not create a new child for every heading, example, ability, or open question. An existing broad concept may become a topic **without changing its ID, URL, or provenance parent**.

Do not manufacture a wrapper root plus one identical child. A new root can initially hold one substantial line of thought directly and develop branches later.

## 5. Multiple peer roots are first-class

The provenance structure is a **forest**, with optional cross-topic graph links. `ai-future` is one root, not the repository's universal parent.

A new independent topic uses:

```yaml
kind: topic
primary_parent: null
```

Its first admitted conversation uses:

```yaml
primary_parent_conversation: null
forked_from_node: null
```

Then create its canonical node file and `graph.yaml` entry with real sources and current understanding. Do **not** create a `forked_from` edge to `ai-future`, invent a universal root, or require a link simply to make the graph connected.

Roots are derived from `primary_parent: null`; do not maintain a second handwritten roots list. `category` is a presentation/retrieval label, **not** parentage or root identity. Multiple roots may share a category; a root's descendants may span categories.

Choose a non-root parent by intellectual provenance: “Which earlier idea genuinely prompted this investigation?” Adjacent turns in the same chat are not, by themselves, a provenance relationship. If a new question truly grows out of an existing node, retain that origin even when its subject category changes. Do not reparent existing nodes merely for a tidier taxonomy.

Cross-root `related_to`, `supports`, `depends_on`, etc. are allowed when justified; they do not change either node's root. Reuse existing canonical nodes across roots instead of duplicating them.

Example only, **not a request to add content**: a later sustained discussion of restaurant operations could become a peer of AI future if it passes admission and is independent of the AI discussion. A one-off computer command or this repository's splitting rules do not become roots.

## 6. Conversation granularity and provenance

A host chat session is not a persistence unit. One session can contain an admitted topic, rejected interludes, and another admitted topic.

`conversations/` retains the admitted turns faithfully, in their original order. Omit rejected passages; do not silently rewrite retained turns or replace them with summaries. Label reconstructions when exact wording is unavailable.

Keep a coherent causal discussion together even if it produces several nodes. Split the saved conversation when an admitted independent problem space begins, not merely at every node boundary. Independent roots in the same host session get separate admitted segments without an invented conversation parent.

The three layers have different jobs:

- conversation = high-fidelity admitted provenance;
- node = compressed reusable understanding;
- graph = canonical topology/navigation.

For nodes synthesizing several branches, include every conversation actually used in both the node front matter and graph entry. Do not add sources solely because they belong to the same branch. Historical `conversation.nodes` records the original branch outcome; current source backlinks are derived from node/graph source references, not by rewriting old transcripts.

Where a source is long, add a compact `## Source scope` section to the node: link the existing conversation and name its exact heading(s), or quote a short distinctive phrase locating the relevant passage. This is a textual locator, not a promise of an HTML paragraph anchor. Preserve original conversations rather than cutting them into more files for retrieval convenience.

## 7. Relationships and existing-content cleanup

`graph.yaml` is the sole relationship index. If a meaningful cross-relation is mentioned in prose, record its type and reason there; a backticked node ID in the body does not create an edge. Parent/child navigation is already derived—do not add redundant semantic edges for it.

Each non-root has one matching child → parent `forked_from` edge. Roots have none. Do not add weak keyword links.

For cleanup: review independent value before merging. Prefer clarifying scope, removing repeated explanations from overviews, correcting `kind`, and completing actual sources/relations. Keep stable IDs and source transcripts. Do not delete a published node merely because it is short. An explicit merge requires preserved provenance, updated references, and a compatibility/redirect plan; it is not an ordinary wording cleanup.

Small refinements, examples, or editorial changes normally update the same node. Use separate `refines`/`contradicts` nodes only when the difference between positions deserves independent preservation. Never erase an earlier substantive conclusion to hide its history.

## 8. Minimal read and write scope

Read this file, then enough of `graph.yaml` to locate the requested question, then its node. Expand to parents, related nodes, or source conversations only when necessary. If no existing question matches, evaluate a new root rather than defaulting to `ai-future`.

In brainstorm-only mode, do not load `src/`, `lib/`, `scripts/`, Astro/Cloudflare configuration, `schema/`, or generated output without a concrete engineering need.

After admission, normal writes are confined to admitted `conversations/`, canonical `nodes/`, and `graph.yaml`. Protocol changes belong here and in `AGENTS.md`, not in the corpus. SEO/GEO can derive presentation, never additional thought prose, FAQs, keywords, or duplicate pages.

## 9. Before publishing

Check admission, the five semantic tests, type/scope, real provenance, necessary conditions, source locators, and non-duplicated relationships. Keep shared metadata synchronized between node files and `graph.yaml`; update `updated_at`.

`npm run check` validates structure and runs regression tests, but cannot determine semantic novelty, admission, or truth. Run `npm run build` when publishing-sensitive files change and tooling is available; report any unrun checks honestly.

Publish the complete change atomically: one logical change, one Git commit, one `main` update. See `AGENTS.md` for engineering and Git Data rules.

## User shortcuts

“从 `<node-id>` 继续聊” resumes an existing node. “回到 `<node-id>`，分叉讨论……” still requires admission and independent value. “另开一个长期话题……” may start a peer root after checking for an existing canonical topic. “这个不用保存” keeps it out of the corpus. “把这轮思考保存下来” preserves only the admitted thought segments. “只做头脑风暴，不碰工程代码” remains strictly in brainstorm mode.
