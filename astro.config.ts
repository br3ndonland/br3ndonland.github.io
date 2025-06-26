import { type AstroIntegration, type AstroIntegrationLogger } from "astro"
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import { spawn } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"
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
      "astro:build:done": async ({
        logger,
      }: {
        logger: AstroIntegrationLogger
      }) => {
        const integrationLogger = logger.fork(`${integrationName}/build`)
        paths.forEach(async (path) => {
          integrationLogger.info(`Processing ${path}`)
          const fileContents = await readFile(path, { encoding: "utf-8" })
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

const astroSearch = (): AstroIntegration => {
  const integrationName = "astro-search"
  return {
    name: integrationName,
    hooks: {
      "astro:build:done": ({ dir }: { dir: URL }) => {
        const targetDir = fileURLToPath(dir)
        const cwd = dirname(fileURLToPath(import.meta.url))
        const relativeDir = relative(cwd, targetDir)
        return new Promise<void>((resolve) => {
          spawn("pagefind", ["--site", relativeDir], {
            stdio: "inherit",
            shell: true,
            cwd,
          }).on("close", () => resolve())
        })
      },
    },
  }
}

export default defineConfig({
  integrations: [
    astroAutolinkHeadings(astroAutolinkOptions),
    astroSearch(),
    mdx(),
    sitemap(),
  ],
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
