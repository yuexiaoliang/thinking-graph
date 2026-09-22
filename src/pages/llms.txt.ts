import { loadThinkingGraph, thoughtPath } from "../../lib/thinking-graph.mjs";

export const prerender = true;

export async function GET() {
  const model = await loadThinkingGraph();
  const site = import.meta.env.SITE_URL?.trim().replace(/\/+$/, "");

  const linkFor = (node) =>
    site ? site + thoughtPath(node.id) : thoughtPath(node.id);

  const lines = [
    "# Thinking Graph",
    "",
    "> High-signal, traceable thought nodes. The thought corpus is primary; publishing and discoverability layers are derived.",
    "",
    "## Thought nodes",
    ""
  ];

  for (const node of model.nodes) {
    lines.push(
      "- [" +
        node.title +
        "](" +
        linkFor(node) +
        "): " +
        node.summary
    );
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
