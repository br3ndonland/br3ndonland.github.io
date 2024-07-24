import type { APIRoute } from "astro"

const sitemapURL = new URL("sitemap-index.xml", import.meta.env.SITE)

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`.trim()

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
