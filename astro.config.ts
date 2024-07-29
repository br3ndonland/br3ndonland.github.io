import { type AstroIntegration } from "astro"
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import { readFile, writeFile } from "node:fs/promises"
import { rehype } from "rehype"
import type { Options as RehypeAutolinkOptions } from "rehype-autolink-headings"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

interface AstroAutolinkOptions {
  paths: string[]
  rehypeAutolinkOptions?: Readonly<RehypeAutolinkOptions> | null | undefined
}

const astroAutolinkHeadings = (
  astroAutolinkOptions: AstroAutolinkOptions,
): AstroIntegration => {
  const { paths, rehypeAutolinkOptions } = astroAutolinkOptions
  const integrationName = "astro-autolink-headings"
  return {
    name: integrationName,
    hooks: {
      "astro:build:done": async (options) => {
        const logger = options.logger.fork(`${integrationName}/build`)
        paths.forEach(async (path) => {
          logger.info(`Processing ${path}`)
          const fileContents = await readFile(path)
          const processedFileContents = await rehype()
            .use(rehypeHeadingIds)
            .use(rehypeAutolinkHeadings, rehypeAutolinkOptions)
            .process(fileContents)
          await writeFile(path, String(processedFileContents))
        })
      },
    },
  }
}

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
  test: ["h2", "h3", "h4", "h5", "h6"],
}

const astroAutolinkOptions: AstroAutolinkOptions = {
  paths: ["./dist/about/index.html"],
  rehypeAutolinkOptions: rehypeAutolinkOptions,
}

export default defineConfig({
  integrations: [astroAutolinkHeadings(astroAutolinkOptions), mdx(), sitemap()],
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
