import { loadThinkingGraph } from "../lib/thinking-graph.mjs";

try {
  const model = await loadThinkingGraph();
  console.log(
    "Graph OK: " +
      model.nodes.length +
      " nodes, " +
      model.graph.edges.length +
      " edges, " +
      model.conversations.length +
      " conversations."
  );
} catch (error) {
  console.error(error?.stack || error);
  process.exitCode = 1;
}
