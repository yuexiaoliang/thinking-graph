import test from "node:test";
import assert from "node:assert/strict";
import { validateGraphContract, assertNodeMetadata, RELATION_TYPES } from "../lib/graph-contract.mjs";

function node(id, primary_parent = null, extra = {}) {
  return { id, title: id, kind: primary_parent === null ? "topic" : "concept", category: "shared-category", status: "active", primary_parent, file: `nodes/${id}.md`, source_conversations: ["conv-20260922-001"], summary: "Fixture only; never persisted to the corpus.", continue: [], ...extra };
}
function fixture() {
  const nodes = [node("topic-a"), node("child-a", "topic-a"), node("topic-b"), node("child-b", "topic-b")];
  return { version: 1, updated_at: "2026-09-23", relation_types: [...RELATION_TYPES], nodes,
    edges: nodes.filter((item) => item.primary_parent).map((item) => ({ source: item.id, target: item.primary_parent, type: "forked_from", reason: "Fixture provenance" })) };
}

test("independent roots remain peers even when they share a category", () => {
  const result = validateGraphContract(fixture());
  assert.deepEqual(result.roots.map((item) => item.id), ["topic-a", "topic-b"]);
  assert.equal(result.rootByNode.get("child-a"), "topic-a");
  assert.equal(result.rootByNode.get("child-b"), "topic-b");
});
test("cross-topic links, including cycles, do not change provenance roots", () => {
  const graph = fixture();
  graph.edges.push({ source: "child-a", target: "child-b", type: "related_to", reason: "Relevant independent roots" }, { source: "child-b", target: "child-a", type: "supports", reason: "Independent support" });
  assert.equal(validateGraphContract(graph).rootByNode.get("child-b"), "topic-b");
});
test("a new substantive topic can start without placeholder children", () => {
  const graph = fixture(); graph.nodes.push(node("topic-c"));
  assert.equal(validateGraphContract(graph).roots.length, 3);
});
test("a topic may also be a nested overview rather than a root", () => {
  const graph = fixture(); graph.nodes[1].kind = "topic";
  assert.equal(validateGraphContract(graph).roots.length, 2);
});
test("an empty graph is valid and contains no invented root", () => {
  assert.equal(validateGraphContract({ nodes: [], edges: [], relation_types: [...RELATION_TYPES] }).roots.length, 0);
});

for (const [name, mutate, pattern] of [
  ["missing explicit parent", (g) => delete g.nodes[0].primary_parent, /explicit null/],
  ["non-topic root", (g) => g.nodes[0].kind = "concept", /kind: topic/],
  ["unknown parent", (g) => g.nodes[1].primary_parent = "absent", /missing primary_parent/],
  ["self parent", (g) => g.nodes[1].primary_parent = "child-a", /cycle/],
  ["multi-node parent cycle", (g) => g.nodes[0].primary_parent = "child-a", /cycle/],
  ["duplicate id", (g) => g.nodes.push({ ...g.nodes[0] }), /Duplicate node id/],
  ["shared canonical file", (g) => g.nodes[1].file = g.nodes[0].file, /Duplicate node file/],
  ["path traversal", (g) => g.nodes[0].file = "nodes/../AGENTS.md", /Invalid node file/],
  ["empty source list", (g) => g.nodes[0].source_conversations = [], /nonempty/],
  ["duplicate source", (g) => g.nodes[0].source_conversations.push("conv-20260922-001"), /duplicates/],
  ["unknown relationship declaration", (g) => g.relation_types.push("invented"), /Unknown relation/],
  ["unknown edge node", (g) => g.edges[0].target = "absent", /missing target/],
  ["duplicate edge", (g) => g.edges.push({ ...g.edges[0] }), /Duplicate edge/],
  ["missing edge reason", (g) => g.edges[0].reason = " ", /missing reason/],
  ["invented root fork", (g) => g.edges.push({ source: "topic-b", target: "topic-a", type: "forked_from", reason: "False parent" }), /disagrees/],
  ["wrong fork parent", (g) => g.edges[0].target = "topic-b", /disagrees/],
  ["missing fork edge", (g) => g.edges.shift(), /matching forked_from/]
]) {
  test("rejects " + name, () => { const graph = fixture(); mutate(graph); assert.throws(() => validateGraphContract(graph), pattern); });
}

test("metadata source order is immaterial", () => {
  const graphNode = node("topic-a", null, { source_conversations: ["conv-20260922-001", "conv-20260922-003"] });
  assertNodeMetadata(graphNode, { ...graphNode, source_conversations: [...graphNode.source_conversations].reverse() });
});
for (const [field, value] of [["kind", "concept"], ["primary_parent", "other"], ["title", "different"], ["source_conversations", ["conv-20260922-002"]]]) {
  test("rejects front-matter drift: " + field, () => {
    const graphNode = node("topic-a");
    assert.throws(() => assertNodeMetadata(graphNode, { ...graphNode, [field]: value }), /metadata mismatch/);
  });
}
