# Cloudflare deployment

This repository is designed to deploy as **Cloudflare Workers Static Assets**.

The source of truth remains GitHub. Cloudflare only serves the generated static site.

## Build flow

```text
graph.yaml + nodes/ + conversations/ + visualizer/
                         ↓
                  npm run build
                         ↓
                       dist/
                 ├── index.html
                 ├── graph.yaml
                 ├── nodes/
                 ├── conversations/
                 └── 404.html
                         ↓
                Cloudflare Workers
```

## Cloudflare dashboard setup

Create/connect a Worker to the GitHub repository:

```text
yuexiaoliang/thinking-graph
```

Recommended settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | repository root |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

The Wrangler configuration is already committed in `wrangler.jsonc`.

Cloudflare will deploy the generated `./dist` directory as Workers Static Assets.

## Local verification

Install dependencies:

```bash
npm install
```

Validate graph integrity without building:

```bash
npm run check
```

Build:

```bash
npm run build
```

Preview with Wrangler:

```bash
npx wrangler dev
```

Or:

```bash
npm run dev
```

## Manual deploy

If you ever need to deploy from a local machine:

```bash
npm run deploy
```

## What the build validates

Before writing `dist/`, the build fails if it finds:

- duplicate node IDs;
- missing `primary_parent` nodes;
- node files missing from disk;
- node-file front-matter IDs that do not match `graph.yaml`;
- missing source conversation IDs;
- relation edges that point to missing nodes;
- relation types not declared in `graph.yaml`;
- relationship edges without a reason.

This prevents a malformed graph from being published.

## Deployment rule for agents

Agents should modify source files only:

- `graph.yaml`
- `nodes/`
- `conversations/`
- `visualizer/`
- schemas/docs/scripts as needed

Do **not** commit `dist/`. It is generated during CI/deployment and is intentionally ignored by Git.
