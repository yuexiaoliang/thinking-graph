export function initExplorer(root) {
  const nodes = JSON.parse(root.querySelector("[data-graph-data]").textContent);
  nodes.forEach((node) => { node.vertical = { x: node.x, y: node.y }; });
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const find = (selector) => root.querySelector(selector);
  const listOnly = root.dataset.listOnly === "true";
  const mobile = window.matchMedia("(max-width: 760px)");
  const headerSearch = document.querySelector("[data-header-search]");
  const search = find("[data-graph-search]") || headerSearch?.querySelector("[data-graph-search]");
  const category = find("[data-graph-category]") || headerSearch?.querySelector("[data-graph-category]");
  const filterReset = find(".filter-reset") || headerSearch?.querySelector("[data-filter-reset]");
  const searchTrigger = headerSearch?.querySelector("[data-search-trigger]");
  const cards = [...root.querySelectorAll("[data-node-card]")];
  const graphNodes = [...root.querySelectorAll("[data-graph-node]")];
  const list = find("[data-list-view]");
  const graph = find("[data-graph-view]");
  const svg = find("[data-graph-svg]");
  const viewport = find("[data-graph-viewport]");
  const stage = find("[data-graph-stage]");
  const detail = find("[data-graph-detail]");
  const detailContent = find("[data-detail-content]");
  const dialog = find("[data-node-dialog]");
  const pointers = new Map();
  let visible = new Set(nodes.map((node) => node.id));
  let view = "list";
  let explicitView = false;
  let selectedId = null;
  let explicitSelection = false;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let width = 1;
  let height = 1;
  let layoutMode = null;
  let cameraMode = "overview";
  let suppressClickUntil = 0;
  const minScale = 0.12;
  const maxScale = 2.5;

  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function setSearchOpen(open, focus = false) {
    if (!headerSearch) return;
    headerSearch.dataset.open = String(open);
    searchTrigger.setAttribute("aria-expanded", String(open));
    if (focus) (open ? search : searchTrigger).focus();
  }

  function saveState() {
    const url = new URL(window.location.href);
    const state = { q: search.value.trim(), category: category.value === "all" ? "" : category.value,
      view: listOnly || !explicitView ? "" : view, node: explicitSelection ? selectedId || "" : "" };
    for (const [key, value] of Object.entries(state)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    // Filtering changes the current browsing state without filling browser history.
    window.history.replaceState(null, "", url);
  }

  function transform() {
    viewport?.setAttribute("transform", `translate(${tx} ${ty}) scale(${scale})`);
  }

  function edgePath(source, target) {
    if ((layoutMode === "horizontal" && source.x !== target.x) || source.y === target.y) {
      const direction = target.x >= source.x ? 1 : -1;
      const mid = (source.x + target.x) / 2;
      return `M ${source.x + direction * 96} ${source.y} C ${mid} ${source.y}, ${mid} ${target.y}, ${target.x - direction * 96} ${target.y}`;
    }
    const direction = target.y >= source.y ? 1 : -1;
    const mid = (source.y + target.y) / 2;
    return `M ${source.x} ${source.y + direction * 34} C ${source.x} ${mid}, ${target.x} ${mid}, ${target.x} ${target.y - direction * 34}`;
  }

  function applyLayout(nextLayout) {
    if (nextLayout === layoutMode) return;
    layoutMode = nextLayout;
    root.dataset.layout = layoutMode;
    nodes.forEach((node) => {
      const position = node[layoutMode];
      node.x = position.x;
      node.y = position.y;
    });
    graphNodes.forEach((element) => {
      const node = nodeMap.get(element.dataset.id);
      element.setAttribute("transform", `translate(${node.x},${node.y})`);
    });
    root.querySelectorAll(".graph-edge").forEach((element) => {
      const source = nodeMap.get(element.dataset.source);
      const target = nodeMap.get(element.dataset.target);
      element.setAttribute("d", edgePath(source, target));
    });
    cameraMode = "overview";
  }

  function frame() {
    if (!svg || view !== "graph" || !visible.size) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    applyLayout(rect.height > rect.width ? "vertical" : "horizontal");
    const oldWidth = width;
    const oldHeight = height;
    width = rect.width; height = rect.height;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    if (cameraMode === "manual") {
      tx += (width - oldWidth) / 2;
      ty += (height - oldHeight) / 2;
      transform();
      return;
    }
    const points = nodes.filter((node) => visible.has(node.id));
    const left = Math.min(...points.map((node) => node.x)) - 110;
    const right = Math.max(...points.map((node) => node.x)) + 110;
    const top = Math.min(...points.map((node) => node.y)) - 48;
    const bottom = Math.max(...points.map((node) => node.y)) + 48;
    const shortScreen = height < 520;
    const topInset = shortScreen || mobile.matches ? 80 : 104;
    const bottomInset = shortScreen ? 90 : mobile.matches ? 72 : 64;
    const overviewScale = Math.max(minScale, Math.min(1, (width - 36) / (right - left), (height - topInset - bottomInset) / (bottom - top)));
    scale = overviewScale;
    tx = (width - (right - left) * scale) / 2 - left * scale;
    ty = topInset + (height - topInset - bottomInset - (bottom - top) * scale) / 2 - top * scale;
    transform();
  }

  function fit() {
    cameraMode = "overview";
    frame();
  }

  function zoom(factor, x = width / 2, y = height / 2) {
    const next = Math.max(minScale, Math.min(maxScale, scale * factor));
    const ratio = next / scale;
    tx = x - (x - tx) * ratio;
    ty = y - (y - ty) * ratio;
    scale = next;
    cameraMode = "manual";
    transform();
  }

  function renderVisibility() {
    list.hidden = view !== "list" || !visible.size;
    if (graph) graph.hidden = view !== "graph";
    find("[data-empty-state]").hidden = visible.size > 0;
    root.dataset.view = view;
    document.body.classList.toggle("graph-mode", !listOnly && view === "graph");
  }

  function clearSelection() {
    selectedId = null;
    explicitSelection = false;
    if (detail) detail.hidden = true;
    if (detailContent) detailContent.innerHTML = "";
    graphNodes.forEach((element) => element.classList.remove("selected"));
  }

  function filter(persist = true) {
    const query = search.value.trim().toLocaleLowerCase();
    visible = new Set();
    cards.forEach((card) => {
      const match = (category.value === "all" || category.value === card.dataset.category)
        && (!query || card.dataset.search.includes(query));
      card.hidden = !match;
      if (match) visible.add(card.dataset.id);
    });
    graphNodes.forEach((element) => {
      const match = visible.has(element.dataset.id);
      element.classList.toggle("dimmed", !match);
      element.setAttribute("tabindex", match ? "0" : "-1");
      element.setAttribute("aria-hidden", String(!match));
    });
    root.querySelectorAll(".graph-edge").forEach((edge) => {
      edge.classList.toggle("dimmed", !visible.has(edge.dataset.source) || !visible.has(edge.dataset.target));
    });
    if (selectedId && !visible.has(selectedId)) clearSelection();
    const active = !!query || category.value !== "all";
    find("[data-result-count]").textContent = active ? `${visible.size} / ${nodes.length} 个节点` : `${nodes.length} 个节点`;
    filterReset.hidden = !active;
    if (searchTrigger) {
      searchTrigger.classList.toggle("has-filter", active);
      searchTrigger.setAttribute("aria-label", active ? "展开搜索与筛选，当前有筛选" : "展开搜索与筛选");
    }
    cameraMode = "overview";
    renderVisibility();
    frame();
    if (persist) saveState();
  }

  function detailMarkup(node, mobileView = false) {
    function section(title, items) {
      if (!items.length) return "";
      return `<section class="detail-section"><h4>${title}</h4><div class="detail-links">${items.map((item) =>
        `<a href="${escape(item.url)}">${item.label ? `<span class="relation-label">${escape(item.label)}</span>` : ""}${escape(item.title)}${item.reason ? `<small>${escape(item.reason)}</small>` : ""}<span class="link-arrow" aria-hidden="true">↗</span></a>`
      ).join("")}</div></section>`;
    }
    // node.html is rendered and sanitized at build time in lib/thinking-graph.mjs.
    return `<div class="detail-intro"><span class="category-label" style="--category-color:${escape(node.color)}">${escape(node.categoryLabel)}</span><h3${mobileView ? ' id="dialog-node-title"' : ""}>${escape(node.title)}</h3><p>${escape(node.summary)}</p></div>`
      + `<div class="markdown detail-reading">${node.html || ""}</div>`
      + `<div class="detail-actions"><a class="button" href="${escape(node.url)}">在独立页面打开 <span aria-hidden="true">↗</span></a></div>`
      + section("思考起点", node.parent ? [node.parent] : [])
      + section("继续探索", node.children)
      + section("跨话题关系", node.relations)
      + section("来源对话", node.conversations);
  }

  function selectNode(id, openPreview = true, explicit = true) {
    const node = nodeMap.get(id);
    if (!node || !detailContent) return;
    selectedId = id;
    explicitSelection = explicit;
    graphNodes.forEach((element) => element.classList.toggle("selected", element.dataset.id === id));
    detailContent.innerHTML = detailMarkup(node);
    detail.hidden = false;
    detail.scrollTop = 0;
    find("[data-selection-status]").textContent = "正在查看：" + node.title;
    if (mobile.matches && openPreview) {
      find("[data-dialog-content]").innerHTML = detailMarkup(node, true);
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add("dialog-open");
    } else if (!mobile.matches && view === "graph") {
      const availableRight = width - detail.getBoundingClientRect().width - 40;
      const nodeX = node.x * scale + tx;
      const nodeY = node.y * scale + ty;
      if (nodeX > availableRight - 55 || nodeX < 55) tx += availableRight / 2 - nodeX;
      if (nodeY < 170 || nodeY > height - 75) ty += height * 0.48 - nodeY;
      cameraMode = "manual";
      transform();
    }
    saveState();
  }

  function restoreState() {
    const params = new URL(window.location.href).searchParams;
    search.value = params.get("q") || "";
    category.value = [...category.options].some((option) => option.value === params.get("category")) ? params.get("category") : "all";
    setSearchOpen(!mobile.matches || !!search.value || category.value !== "all");
    const requestedView = params.get("view");
    explicitView = requestedView === "list" || requestedView === "graph";
    const nodeId = params.get("node");
    view = listOnly ? "list" : explicitView ? requestedView : "graph";
    clearSelection();
    filter(false);
    if (view === "graph" && visible.has(nodeId) && !listOnly) selectNode(nodeId);
  }

  root.querySelectorAll("[data-enhanced]").forEach((element) => { element.hidden = false; });
  headerSearch?.removeAttribute("hidden");
  searchTrigger?.addEventListener("click", () => setSearchOpen(true, true));
  headerSearch?.querySelector("[data-search-close]")?.addEventListener("click", () => setSearchOpen(false, true));
  search.addEventListener("input", () => filter());
  category.addEventListener("change", () => filter());
  [...root.querySelectorAll("[data-clear-filters]"), ...(headerSearch?.querySelectorAll("[data-clear-filters]") || [])].forEach((button) => button.addEventListener("click", () => {
    search.value = ""; category.value = "all"; filter();
    if (headerSearch) setSearchOpen(true, true);
    else search.focus();
  }));
  root.querySelectorAll("[data-graph-node]").forEach((element) => element.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (performance.now() < suppressClickUntil || !visible.has(element.dataset.id)) return;
    selectNode(element.dataset.id);
  }));
  find("[data-graph-cross-toggle]")?.addEventListener("change", (event) => {
    find("[data-graph-cross-layer]").classList.toggle("hidden", !event.target.checked);
  });
  find("[data-close-detail]")?.addEventListener("click", () => {
    const node = graphNodes.find((element) => element.dataset.id === selectedId);
    clearSelection();
    saveState();
    node?.focus();
  });
  find("[data-close-dialog]")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("close", () => {
    const node = graphNodes.find((element) => element.dataset.id === selectedId);
    document.body.classList.remove("dialog-open");
    clearSelection();
    saveState();
    node?.focus();
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientY < rect.top || event.clientX < rect.left || event.clientX > rect.right || event.clientY > rect.bottom) dialog.close();
  });

  svg?.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = svg.getBoundingClientRect();
    zoom(Math.exp(-event.deltaY * (event.ctrlKey || event.metaKey ? 0.008 : 0.0015)), event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });
  svg?.addEventListener("keydown", (event) => {
    const movement = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (movement) { event.preventDefault(); tx += movement[0]; ty += movement[1]; cameraMode = "manual"; transform(); }
    if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") fit(); else zoom(event.key === "-" ? 0.8 : 1.25);
    }
  });
  svg?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, moved: false });
  });
  svg?.addEventListener("pointermove", (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const next = { ...previous, x: event.clientX, y: event.clientY };
    if (!previous.moved && pointers.size === 1 && Math.hypot(next.x - next.startX, next.y - next.startY) < 5) return;
    next.moved = true;
    const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1];
    if (other) {
      const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
      const newDistance = Math.hypot(next.x - other.x, next.y - other.y);
      const rect = svg.getBoundingClientRect();
      if (oldDistance > 0) zoom(newDistance / oldDistance, (previous.x + other.x) / 2 - rect.left, (previous.y + other.y) / 2 - rect.top);
      tx += (next.x - previous.x) / 2; ty += (next.y - previous.y) / 2;
    } else {
      tx += next.x - previous.x; ty += next.y - previous.y;
    }
    pointers.set(event.pointerId, next);
    svg.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");
    suppressClickUntil = performance.now() + 350;
    cameraMode = "manual";
    transform();
  });
  function release(event) {
    pointers.delete(event.pointerId);
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    if (!pointers.size) stage.classList.remove("is-dragging");
  }
  svg?.addEventListener("pointerup", release);
  svg?.addEventListener("pointercancel", release);
  svg?.addEventListener("lostpointercapture", (event) => {
    // A node's implicit touch capture also bubbles here when capture moves to the SVG.
    if (event.target === svg) release(event);
  });
  svg?.addEventListener("pointerleave", (event) => {
    if (!svg.hasPointerCapture(event.pointerId)) pointers.delete(event.pointerId);
  });
  if (stage) new ResizeObserver(frame).observe(stage);
  mobile.addEventListener("change", () => {
    if (dialog?.open) dialog.close();
    setSearchOpen(!mobile.matches || !!search.value || category.value !== "all");
    frame();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches && headerSearch?.dataset.open === "true" && !dialog?.open) {
      event.preventDefault();
      setSearchOpen(false, true);
      return;
    }
    if (event.key === "Escape" && selectedId && !dialog?.open && view === "graph") {
      const node = graphNodes.find((element) => element.dataset.id === selectedId);
      clearSelection();
      saveState();
      node?.focus();
      return;
    }
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || dialog?.open) return;
    if (event.target.closest("input, select, textarea, [contenteditable]")) return;
    event.preventDefault(); setSearchOpen(true, true); search.focus();
  });
  window.addEventListener("popstate", restoreState);
  restoreState();
  root.dataset.ready = "true";
}
