import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.SITE_URL?.trim().replace(/\/+$/, "");

export default defineConfig({
  output: "static",
  site: site || undefined,
  build: {
    format: "directory"
  },
  integrations: site
    ? [
        sitemap({
          filter(page) {
            const pathname = new URL(page).pathname;
            return (
              !pathname.startsWith("/conversations/") &&
              pathname !== "/robots.txt" &&
              pathname !== "/llms.txt"
            );
          }
        })
      ]
    : []
});
