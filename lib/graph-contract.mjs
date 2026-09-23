/** Structural checks only. Semantic admission/granularity still requires review. */
export const RELATION_TYPES = Object.freeze([
  "forked_from", "related_to", "supports", "contradicts", "refines", "leads_to", "depends_on"
]);
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONVERSATION_ID = /^conv-[0-9]{8}-[0-9]{3,}$/;
const KINDS = new Set(["topic", "concept", "question", "meta"]);
const STATUSES = new Set(["active", "parked", "superseded", "closed"]);
const fail = (message) => { throw new Error(message); };
const text = (value) => typeof value === "string" && value.trim().length > 0;

function stringList(value, label, { nonempty = false, pattern = null } = {}) {
  if (!Array.isArray(value) || (nonempty && !value.length) || value.some((item) => !text(item) || (pattern && !pattern.test(item)))) {
    fail(label + " must be " + (nonempty ? "a nonempty" : "an") + " array of valid strings");
  }
  if (new Set(value).size !== value.length) fail(label + " contains duplicates");
}

/** primary_parent defines a forest, not a single-root tree or a category hierarchy. */
export function validateGraphContract(graph) {
  if (!graph || typeof graph !== "object") fail("graph.yaml must contain an object");
  if (!Array.isArray(graph.nodes)) fail("graph.yaml must contain nodes[]");
  if (!Array.isArray(graph.edges)) fail("graph.yaml must contain edges[]");
  stringList(graph.relation_types, "relation_types", { nonempty: true });
  for (const type of graph.relation_types) {
    if (!RELATION_TYPES.includes(type)) fail("Unknown relation type: " + type);
  }
  const nodeMap = new Map();
  const files = new Set();
  for (const node of graph.nodes) {
    if (!node || typeof node.id !== "string" || !ID.test(node.id)) fail("Every node must have a stable kebab-case id");
    if (nodeMap.has(node.id)) fail("Duplicate node id: " + node.id);
    for (const field of ["title", "category", "summary"]) {
      if (!text(node[field])) fail("Node " + node.id + " is missing " + field);
    }
    if (!KINDS.has(node.kind)) fail("Invalid kind for node " + node.id);
    if (!STATUSES.has(node.status)) fail("Invalid status for node " + node.id);
    if (node.primary_parent !== null && (typeof node.primary_parent !== "string" || !ID.test(node.primary_parent))) {
      fail("Node " + node.id + " primary_parent must be an id or explicit null");
    }
    if (node.primary_parent === null && node.kind !== "topic") fail("Root node " + node.id + " must have kind: topic");
    if (typeof node.file !== "string" || !/^nodes\/.+\.md$/.test(node.file) || node.file.split("/").some((part) => part === "." || part === ".." || !part) || node.file.includes("\\")) {
      fail("Invalid node file path: " + node.id);
    }
    if (files.has(node.file)) fail("Duplicate node file: " + node.file);
    files.add(node.file);
    stringList(node.source_conversations, "Node " + node.id + " source_conversations", { nonempty: true, pattern: CONVERSATION_ID });
    stringList(node.continue, "Node " + node.id + " continue");
    nodeMap.set(node.id, node);
  }
  for (const node of graph.nodes) {
    if (node.primary_parent !== null && !nodeMap.has(node.primary_parent)) fail("Node " + node.id + " references missing primary_parent " + node.primary_parent);
  }

  // Iterative traversal also tolerates a long valid provenance chain.
  const rootByNode = new Map();
  for (const node of graph.nodes) {
    if (rootByNode.has(node.id)) continue;
    const trail = [];
    const seen = new Set();
    let current = node;
    while (!rootByNode.has(current.id)) {
      if (seen.has(current.id)) fail("Primary-parent cycle: " + [...trail, current.id].join(" -> "));
      seen.add(current.id);
      trail.push(current.id);
      if (current.primary_parent === null) {
        rootByNode.set(current.id, current.id);
        break;
      }
      current = nodeMap.get(current.primary_parent);
    }
    const rootId = rootByNode.get(current.id);
    for (const id of trail) rootByNode.set(id, rootId);
  }

  const edgeKeys = new Set();
  const forkCounts = new Map();
  for (const edge of graph.edges) {
    if (!nodeMap.has(edge?.source)) fail("Edge references missing source node: " + edge?.source);
    if (!nodeMap.has(edge.target)) fail("Edge references missing target node: " + edge.target);
    if (!graph.relation_types.includes(edge.type)) fail("Edge uses unknown relation type: " + edge.type);
    if (edge.source === edge.target) fail("Self edge: " + edge.source);
    if (!text(edge.reason)) fail("Edge " + edge.source + " -> " + edge.target + " is missing reason");
    const key = JSON.stringify([edge.source, edge.type, edge.target]);
    if (edgeKeys.has(key)) fail("Duplicate edge: " + key);
    edgeKeys.add(key);
    if (edge.type === "forked_from") {
      if (nodeMap.get(edge.source).primary_parent !== edge.target) fail("forked_from disagrees with primary_parent: " + edge.source);
      forkCounts.set(edge.source, (forkCounts.get(edge.source) || 0) + 1);
    }
  }
  for (const node of graph.nodes) {
    const expected = node.primary_parent === null ? 0 : 1;
    if ((forkCounts.get(node.id) || 0) !== expected) fail("Node " + node.id + " must have " + expected + " matching forked_from edge(s)");
  }
  return { roots: graph.nodes.filter((node) => node.primary_parent === null), rootByNode };
}

/** Repeated navigation metadata must not silently disagree with the node file. */
export function assertNodeMetadata(graphNode, meta) {
  for (const field of ["id", "title", "kind", "category", "status", "primary_parent"]) {
    if (meta[field] !== graphNode[field]) fail("Node metadata mismatch for " + graphNode.id + ": " + field);
  }
  stringList(meta.source_conversations, "Node " + graphNode.id + " front-matter source_conversations", { nonempty: true, pattern: CONVERSATION_ID });
  const expected = [...graphNode.source_conversations].sort();
  if (JSON.stringify([...meta.source_conversations].sort()) !== JSON.stringify(expected)) {
    fail("Node metadata mismatch for " + graphNode.id + ": source_conversations");
  }
}
