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
    "> High-signal, traceable thought nodes. Independent topics are peer roots; publishing and discoverability layers are derived.",
    ""
  ];

  const groups = [
    ["Topic entrypoints", model.roots],
    ["Thought nodes", model.nodes.filter((node) => node.primary_parent !== null)]
  ];
  for (const [title, nodes] of groups) {
    lines.push("## " + title, "");
    for (const node of nodes) {
      lines.push("- [" + node.title + "](" + linkFor(node) + "): " + node.summary);
    }
    lines.push("");
  }

  // Static assets retain a BOM for reliable UTF-8 detection after prerendering.
  return new Response("\uFEFF" + lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
