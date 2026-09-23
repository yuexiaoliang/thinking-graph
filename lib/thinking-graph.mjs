import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { validateGraphContract, assertNodeMetadata } from "./graph-contract.mjs";

const ROOT = process.cwd();

export const RELATION_LABELS = Object.freeze({
  forked_from: "分叉自",
  related_to: "相关",
  supports: "支持",
  contradicts: "矛盾",
  refines: "修正",
  leads_to: "引出",
  depends_on: "依赖"
});

export function thoughtPath(id) {
  return "/thoughts/" + encodeURIComponent(id) + "/";
}

export function conversationPath(id) {
  return "/conversations/" + encodeURIComponent(id) + "/";
}

export function normalizeDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) return { data: {}, body: markdown };
  const data = loadYaml(match[1]) || {};
  const body = markdown.slice(match[0].length).replace(/^\s+/, "");
  return { data, body };
}

export function stripLeadingH1(markdown) {
  return markdown.replace(/^#\s+.+?(?:\r?\n)+/, "");
}

export function renderMarkdown(markdown) {
  const source = stripLeadingH1(markdown);
  const rendered = marked.parse(source, {
    gfm: true,
    breaks: false
  });

  return sanitizeHtml(rendered, {
    allowedTags: Array.from(
      new Set([
        ...sanitizeHtml.defaults.allowedTags,
        "img",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6"
      ])
    ),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "loading"],
      code: ["class"],
      th: ["align"],
      td: ["align"]
    },
    allowedSchemes: ["http", "https", "mailto"]
  });
}

async function collectMarkdownFiles(relativeDir) {
  const base = path.join(ROOT, relativeDir);
  const files = [];

  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(path.relative(ROOT, absolute).split(path.sep).join("/"));
      }
    }
  }

  await walk(base);
  files.sort();
  return files;
}

async function readText(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8");
}

function fail(message) {
  throw new Error(message);
}

export async function loadThinkingGraph() {
  const graph = loadYaml(await readText("graph.yaml"));
  const topology = validateGraphContract(graph);
  graph.updated_at = normalizeDate(graph.updated_at);

  const conversationFiles = await collectMarkdownFiles("conversations");
  const conversations = [];
  const conversationMap = new Map();

  for (const file of conversationFiles) {
    const markdown = await readText(file);
    const parsed = parseFrontMatter(markdown);
    const meta = parsed.data || {};
    const id = meta.id;

    if (!id) fail("Conversation file is missing front-matter id: " + file);
    if (conversationMap.has(id)) fail("Duplicate conversation id: " + id);

    const conversation = {
      id,
      title: meta.title || id,
      date: normalizeDate(meta.date),
      status: meta.status || null,
      primary_parent_conversation: meta.primary_parent_conversation || null,
      forked_from_node: meta.forked_from_node || null,
      nodes: Array.isArray(meta.nodes) ? meta.nodes : [],
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      file,
      body: parsed.body,
      html: renderMarkdown(parsed.body)
    };

    conversations.push(conversation);
    conversationMap.set(id, conversation);
  }

  const nodes = [];
  const nodeMap = new Map();

  for (const graphNode of graph.nodes) {
    const markdown = await readText(graphNode.file);
    const parsed = parseFrontMatter(markdown);
    const meta = parsed.data || {};
    assertNodeMetadata(graphNode, meta);

    const node = {
      ...graphNode,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      body: parsed.body,
      html: renderMarkdown(parsed.body)
    };

    nodes.push(node);
    nodeMap.set(node.id, node);
  }

  for (const node of nodes) {
    for (const conversationId of node.source_conversations) {
      if (!conversationMap.has(conversationId)) {
        fail("Node " + node.id + " references missing conversation " + conversationId);
      }
    }
  }

  for (const conversation of conversations) {
    if (
      conversation.primary_parent_conversation &&
      !conversationMap.has(conversation.primary_parent_conversation)
    ) {
      fail(
        "Conversation " +
          conversation.id +
          " references missing parent conversation " +
          conversation.primary_parent_conversation
      );
    }
    if (conversation.forked_from_node && !nodeMap.has(conversation.forked_from_node)) {
      fail(
        "Conversation " +
          conversation.id +
          " references missing fork node " +
          conversation.forked_from_node
      );
    }
    for (const nodeId of conversation.nodes) {
      if (!nodeMap.has(nodeId)) {
        fail("Conversation " + conversation.id + " references missing node " + nodeId);
      }
    }
  }

  return {
    graph,
    nodes,
    nodeMap,
    roots: topology.roots.map((node) => nodeMap.get(node.id)),
    rootByNode: topology.rootByNode,
    conversations,
    conversationMap
  };
}

export function getNodeRelations(model, nodeId) {
  const node = model.nodeMap.get(nodeId);
  if (!node) return null;

  const parent = node.primary_parent ? model.nodeMap.get(node.primary_parent) || null : null;
  const children = model.nodes.filter((candidate) => candidate.primary_parent === nodeId);

  const outgoing = model.graph.edges
    .filter((edge) => edge.source === nodeId && edge.type !== "forked_from")
    .map((edge) => ({
      edge,
      node: model.nodeMap.get(edge.target)
    }))
    .filter((item) => item.node);

  const incoming = model.graph.edges
    .filter((edge) => edge.target === nodeId && edge.type !== "forked_from")
    .map((edge) => ({
      edge,
      node: model.nodeMap.get(edge.source)
    }))
    .filter((item) => item.node);

  const conversations = (node.source_conversations || [])
    .map((id) => model.conversationMap.get(id))
    .filter(Boolean);

  return {
    node,
    parent,
    children,
    outgoing,
    incoming,
    conversations
  };
}
