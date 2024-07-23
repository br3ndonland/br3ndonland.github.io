import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import type { Options as RehypeAutolinkOptions } from "rehype-autolink-headings"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

const rehypeAutolinkOptions: RehypeAutolinkOptions = {
  behavior: "prepend",
  content: {
    type: "element",
    tagName: "span",
    properties: {
      className: ["anchor-icon"],
    },
    children: [],
  },
  headingProperties: { tabIndex: "-1", className: ["heading-element"] },
  properties: { ariaLabel: "Link to self", className: ["anchor-link"] },
}

export default defineConfig({
  integrations: [mdx(), sitemap()],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, rehypeAutolinkOptions],
    ],
    shikiConfig: {
      theme: "dracula",
    },
    smartypants: false,
  },
  prefetch: true,
  site: "https://www.bws.bio",
})
