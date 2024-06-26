import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"

export default defineConfig({
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "dracula",
    },
  },
  site: "https://www.bws.bio",
})
