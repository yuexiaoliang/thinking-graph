# Cloudflare deployment

The public site is an **Astro static site** deployed as **Cloudflare Workers Static Assets**.

Astro is used only at build time. There is no SSR Worker and no Cloudflare adapter.

## Build flow

```text
graph.yaml + nodes/ + conversations/
                ↓
         npm run check
                ↓
          astro build
                ↓
              dist/
     ├── index.html
     ├── thoughts/.../
     ├── conversations/.../
     ├── robots.txt
     ├── llms.txt
     ├── sitemap-*.xml
     ├── _astro/
     └── 404.html
                ↓
     Cloudflare Static Assets
```

## Cloudflare dashboard

Repository:

```text
yuexiaoliang/thinking-graph
```

Recommended Workers Builds settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | repository root |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

`wrangler.jsonc` already points Static Assets at `./dist`.

## Production variable

Set:

```text
SITE_URL=https://your-public-domain.example
```

Use the final public origin with no path.

This enables:

- canonical URLs;
- Open Graph page URLs;
- JSON-LD absolute URLs;
- `@astrojs/sitemap`;
- the sitemap line in `robots.txt`;
- absolute links in `llms.txt`.

Without `SITE_URL`, the site still builds and serves correctly, but it deliberately does not invent a production origin or sitemap.

## UI release checks

The responsive explorer and theme controls are client-side enhancements to the same static routes; no Worker bindings or runtime API are required. Before releasing UI changes, preview the built output at phone and desktop widths and verify filtering, graph selection, node-to-source navigation, keyboard focus, and the static node-list fallback. Query parameters restore the explorer state; canonical paths remain unchanged.

## Node version

The repository includes:

```text
.nvmrc → 22.12.0
```

## Local commands

```bash
npm install
npm run check
npm run dev
npm run build
npm run preview
```

Manual deploy:

```bash
npm run deploy
```

## Build trigger hygiene

`main` is the release boundary:

> **one logical change = one commit = one main ref update = one Cloudflare build**

Agent-managed multi-file changes must use the atomic Git Data flow documented in `AGENTS.md`. Never push intermediate implementation states to `main`.
