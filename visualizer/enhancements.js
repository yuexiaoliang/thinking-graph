
const detail = document.querySelector("#detail");
if (detail) {
  const rootBase = new URL("../", window.location.href);
  let contentIndex = new Map();
  let contentIndexReady = false;
  let hasUserInteracted = false;
  let markdownToolsPromise = null;
  let readerLastFocus = null;
  let enhanceScheduled = false;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isMobile() {
    return window.matchMedia("(max-width: 820px)").matches;
  }

  function fileUrl(path) {
    return new URL(String(path || "").replace(/^\/+/, ""), rootBase).toString();
  }

  function stripFrontMatter(markdown) {
    return markdown.replace(/^---\s*[\r\n]+[\s\S]*?[\r\n]+---\s*[\r\n]*/, "");
  }

  function ensureReader() {
    let overlay = document.querySelector("#tgReader");
    if (overlay) return overlay;

    overlay = document.createElement("section");
    overlay.id = "tgReader";
    overlay.className = "tg-reader-overlay";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Markdown 阅读器");
    overlay.innerHTML =
      '<div class="tg-reader-card">' +
        '<header class="tg-reader-header">' +
          '<div class="tg-reader-heading">' +
            '<strong id="tgReaderTitle">文档</strong>' +
            '<small id="tgReaderMeta"></small>' +
          '</div>' +
          '<button id="tgReaderClose" class="tg-reader-close" type="button" aria-label="关闭阅读器">×</button>' +
        '</header>' +
        '<div id="tgReaderBody" class="tg-reader-body"><div class="tg-reader-loading">正在加载…</div></div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector("#tgReaderClose").addEventListener("click", closeReader);
    overlay.addEventListener("click", function(event) {
      if (event.target === overlay) closeReader();
    });

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && !overlay.hidden) {
        closeReader();
      }
    });

    return overlay;
  }

  function closeReader() {
    const overlay = document.querySelector("#tgReader");
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("tg-reader-open");
    if (readerLastFocus && typeof readerLastFocus.focus === "function") {
      readerLastFocus.focus();
    }
  }

  async function markdownTools() {
    if (!markdownToolsPromise) {
      markdownToolsPromise = Promise.all([
        import("https://cdn.jsdelivr.net/npm/marked@15.0.7/+esm"),
        import("https://cdn.jsdelivr.net/npm/dompurify@3.2.4/+esm")
      ]).then(function(modules) {
        const markedModule = modules[0];
        const purifyModule = modules[1];
        const marked = markedModule.marked || markedModule.default;
        const purifier = purifyModule.default || purifyModule.DOMPurify || purifyModule;
        if (!marked || typeof marked.parse !== "function" || !purifier || typeof purifier.sanitize !== "function") {
          throw new Error("Markdown renderer initialization failed");
        }
        return { marked: marked, purifier: purifier };
      });
    }
    return markdownToolsPromise;
  }

  async function openMarkdown(options) {
    const overlay = ensureReader();
    const title = overlay.querySelector("#tgReaderTitle");
    const meta = overlay.querySelector("#tgReaderMeta");
    const body = overlay.querySelector("#tgReaderBody");

    readerLastFocus = document.activeElement;
    title.textContent = options.title || "文档";
    meta.textContent = options.meta || options.path || "";
    body.innerHTML = '<div class="tg-reader-loading">正在加载 Markdown…</div>';
    overlay.hidden = false;
    document.body.classList.add("tg-reader-open");
    overlay.querySelector("#tgReaderClose").focus();

    try {
      const responseAndTools = await Promise.all([
        fetch(fileUrl(options.path), { cache: "no-store" }),
        markdownTools()
      ]);
      const response = responseAndTools[0];
      const tools = responseAndTools[1];

      if (!response.ok) throw new Error("HTTP " + response.status);

      const markdown = stripFrontMatter(await response.text());
      const unsafeHtml = tools.marked.parse(markdown, { gfm: true, breaks: false });
      const safeHtml = tools.purifier.sanitize(unsafeHtml, { USE_PROFILES: { html: true } });
      body.innerHTML = '<article class="tg-markdown">' + safeHtml + '</article>';
      body.scrollTop = 0;

      body.querySelectorAll("a").forEach(function(anchor) {
        const href = anchor.getAttribute("href") || "";
        if (/^https?:\/\//i.test(href)) {
          anchor.target = "_blank";
          anchor.rel = "noreferrer noopener";
        }
      });
    } catch (error) {
      body.innerHTML =
        '<div class="error">无法渲染这个 Markdown：' +
        escapeHtml(error && error.message ? error.message : error) +
        "</div>";
    }
  }

  async function loadContentIndex() {
    try {
      const response = await fetch(fileUrl("content-index.json"), { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      contentIndex = new Map((data.conversations || []).map(function(item) {
        return [item.id, item];
      }));
    } catch {
      contentIndex = new Map();
    } finally {
      contentIndexReady = true;
    }
  }

  function createReaderButton(title, meta, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tg-reader-trigger";
    button.innerHTML =
      '<span><strong>' + escapeHtml(title) + '</strong><small>' + escapeHtml(meta || "") + '</small></span>' +
      '<span aria-hidden="true">›</span>';
    button.addEventListener("click", handler);
    return button;
  }

  function enhanceNodeFileSection() {
    const sections = [...detail.querySelectorAll(".section")];
    const section = sections.find(function(item) {
      const heading = item.querySelector("h3");
      return heading && heading.textContent.trim().toLowerCase() === "node file";
    });
    if (!section || section.dataset.tgEnhanced === "1") return;

    const anchor = section.querySelector("a");
    if (!anchor) return;

    const rawHref = anchor.getAttribute("href") || "";
    const cleanPath = decodeURI(rawHref.replace(/^\.\.\//, "").replace(/^\/+/, ""));
    const title = detail.querySelector("h2")?.textContent?.trim() || "节点笔记";
    const button = createReaderButton("阅读节点笔记", cleanPath, function() {
      openMarkdown({ path: cleanPath, title: title, meta: cleanPath });
    });

    anchor.replaceWith(button);
    section.dataset.tgEnhanced = "1";
  }

  function enhanceConversationSection() {
    if (!contentIndexReady) return;
    const sections = [...detail.querySelectorAll(".section")];
    const section = sections.find(function(item) {
      const heading = item.querySelector("h3");
      return heading && heading.textContent.trim().toLowerCase() === "source conversations";
    });
    if (!section || section.dataset.tgEnhanced === "1") return;

    const list = section.querySelector("ul");
    if (!list) return;

    const ids = [...list.querySelectorAll("code")].map(function(code) {
      return code.textContent.trim();
    }).filter(Boolean);

    if (!ids.length) return;

    const fragment = document.createDocumentFragment();
    ids.forEach(function(id) {
      const item = contentIndex.get(id);
      if (!item) {
        const unavailable = createReaderButton(id, "内容索引尚未生成", function() {});
        unavailable.disabled = true;
        fragment.appendChild(unavailable);
        return;
      }

      const meta = [item.date, id].filter(Boolean).join(" · ");
      fragment.appendChild(createReaderButton(item.title || id, meta, function() {
        openMarkdown({
          path: item.path,
          title: item.title || id,
          meta: meta
        });
      }));
    });

    list.replaceWith(fragment);
    section.dataset.tgEnhanced = "1";
  }

  function enhanceMobileSheet() {
    if (!detail.querySelector(".tg-mobile-grabber")) {
      const grabber = document.createElement("div");
      grabber.className = "tg-mobile-grabber";
      grabber.setAttribute("aria-hidden", "true");
      detail.prepend(grabber);
    }

    if (!detail.querySelector(".tg-mobile-close")) {
      const close = document.createElement("button");
      close.type = "button";
      close.className = "tg-mobile-close";
      close.setAttribute("aria-label", "关闭节点详情");
      close.textContent = "×";
      close.addEventListener("click", function() {
        detail.classList.remove("tg-mobile-open");
      });
      detail.prepend(close);
    }

    if (isMobile() && hasUserInteracted && detail.querySelector("h2")) {
      detail.classList.add("tg-mobile-open");
    }
  }

  function enhanceDetail() {
    enhanceNodeFileSection();
    enhanceConversationSection();
    enhanceMobileSheet();
  }

  function scheduleEnhance() {
    if (enhanceScheduled) return;
    enhanceScheduled = true;
    requestAnimationFrame(function() {
      enhanceScheduled = false;
      enhanceDetail();
    });
  }

  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(detail, { childList: true, subtree: true });

  document.querySelector("#graph")?.addEventListener("click", function(event) {
    if (event.target.closest?.(".node")) {
      hasUserInteracted = true;
      return;
    }
    if (isMobile()) {
      detail.classList.remove("tg-mobile-open");
    }
  }, true);

  window.addEventListener("resize", function() {
    if (!isMobile()) detail.classList.remove("tg-mobile-open");
  });

  loadContentIndex().finally(function() {
    scheduleEnhance();
  });

  ensureReader();
  scheduleEnhance();
}
