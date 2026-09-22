import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");
const checkOnly = process.argv.includes("--check");

const requiredPaths = [
  "graph.yaml",
  "visualizer/index.html",
  "nodes",
  "conversations"
];

function fail(message) {
  throw new Error(message);
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) return { data: {}, body: markdown };
  const data = loadYaml(match[1]) || {};
  const body = markdown.slice(match[0].length).replace(/^\s+/, "");
  return { data, body };
}

function frontMatterId(markdown) {
  return parseFrontMatter(markdown).data?.id || null;
}

async function collectMarkdownFiles(relativeDir) {
  const base = path.join(root, relativeDir);
  const out = [];

  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        out.push(path.relative(root, absolute).split(path.sep).join("/"));
      }
    }
  }

  await walk(base);
  return out;
}

async function validateGraph() {
  for (const required of requiredPaths) {
    if (!(await exists(required))) fail(`Missing required path: ${required}`);
  }

  const raw = await readText("graph.yaml");
  const graph = loadYaml(raw);

  if (!graph || typeof graph !== "object") fail("graph.yaml must contain an object");
  if (!Array.isArray(graph.nodes)) fail("graph.yaml must contain nodes[]");
  if (!Array.isArray(graph.edges)) fail("graph.yaml must contain edges[]");
  if (!Array.isArray(graph.relation_types)) fail("graph.yaml must contain relation_types[]");

  const nodeIds = new Set();
  for (const node of graph.nodes) {
    if (!node?.id) fail("Every graph node must have an id");
    if (nodeIds.has(node.id)) fail(`Duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
  }

  const conversationFiles = await collectMarkdownFiles("conversations");
  const conversationIds = new Map();
  const conversationIndex = [];
  for (const file of conversationFiles) {
    const markdown = await readText(file);
    const frontMatter = parseFrontMatter(markdown).data || {};
    const id = frontMatter.id;
    if (!id) fail(`Conversation file is missing front-matter id: ${file}`);
    if (conversationIds.has(id)) {
      fail(`Duplicate conversation id ${id}: ${conversationIds.get(id)} and ${file}`);
    }
    conversationIds.set(id, file);
    conversationIndex.push({
      id,
      title: frontMatter.title || id,
      date: frontMatter.date || null,
      status: frontMatter.status || null,
      path: file,
      forked_from_node: frontMatter.forked_from_node || null,
      primary_parent_conversation: frontMatter.primary_parent_conversation || null
    });
  }

  for (const node of graph.nodes) {
    if (node.primary_parent !== null && node.primary_parent !== undefined && !nodeIds.has(node.primary_parent)) {
      fail(`Node ${node.id} references missing primary_parent ${node.primary_parent}`);
    }

    if (!node.file || !(await exists(node.file))) {
      fail(`Node ${node.id} references missing file: ${node.file}`);
    }

    const nodeFileId = frontMatterId(await readText(node.file));
    if (nodeFileId !== node.id) {
      fail(`Node file id mismatch for ${node.file}: expected ${node.id}, got ${nodeFileId}`);
    }

    for (const conversationId of node.source_conversations || []) {
      if (!conversationIds.has(conversationId)) {
        fail(`Node ${node.id} references missing conversation ${conversationId}`);
      }
    }
  }

  const allowedRelations = new Set(graph.relation_types);
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) fail(`Edge references missing source node: ${edge.source}`);
    if (!nodeIds.has(edge.target)) fail(`Edge references missing target node: ${edge.target}`);
    if (!allowedRelations.has(edge.type)) fail(`Edge uses unknown relation type: ${edge.type}`);
    if (!edge.reason || !String(edge.reason).trim()) fail(`Edge ${edge.source} -> ${edge.target} is missing reason`);
  }

  return {
    graph,
    conversationIndex,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    conversationCount: conversationIds.size
  };
}

async function build() {
  const stats = await validateGraph();

  if (checkOnly) {
    console.log(
      `Graph OK: ${stats.nodeCount} nodes, ${stats.edgeCount} edges, ${stats.conversationCount} conversations.`
    );
    return;
  }

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await cp(path.join(root, "visualizer", "index.html"), path.join(dist, "index.html"));
  await cp(path.join(root, "visualizer", "enhancements.css"), path.join(dist, "enhancements.css"));
  await cp(path.join(root, "visualizer", "enhancements.js"), path.join(dist, "enhancements.js"));
  await cp(path.join(root, "graph.yaml"), path.join(dist, "graph.yaml"));
  await cp(path.join(root, "nodes"), path.join(dist, "nodes"), { recursive: true });
  await cp(path.join(root, "conversations"), path.join(dist, "conversations"), { recursive: true });

  const contentIndex = {
    version: 1,
    generated_at: new Date().toISOString(),
    conversations: stats.conversationIndex
      .slice()
      .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || a.id.localeCompare(b.id))
  };
  await writeFile(
    path.join(dist, "content-index.json"),
    JSON.stringify(contentIndex, null, 2) + "\n",
    "utf8"
  );

  const notFound = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>404 · Thinking Graph</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1020;color:#eef3ff}
    main{max-width:560px;padding:32px;text-align:center}
    a{color:#79a8ff}
  </style>
</head>
<body>
  <main>
    <h1>404</h1>
    <p>这个 Thinking Graph 路径不存在。</p>
    <p><a href="/">返回图谱首页</a></p>
  </main>
</body>
</html>`;

  await writeFile(path.join(dist, "404.html"), notFound, "utf8");

  console.log(
    `Built dist/: ${stats.nodeCount} nodes, ${stats.edgeCount} edges, ${stats.conversationCount} conversations + content-index.json.`
  );
}

build().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
