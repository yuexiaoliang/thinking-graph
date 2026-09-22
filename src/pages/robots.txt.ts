export const prerender = true;

export function GET() {
  const site = import.meta.env.SITE_URL?.trim().replace(/\/+$/, "");
  const lines = [
    "User-agent: *",
    "Allow: /"
  ];

  if (site) {
    lines.push("", "Sitemap: " + site + "/sitemap-index.xml");
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
