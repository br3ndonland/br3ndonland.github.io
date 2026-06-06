import { type AstroIntegration, type HookParameters } from "astro"
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark"
import { spawn } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { rehype } from "rehype"
import type { Options as RehypeAutolinkOptions } from "rehype-autolink-headings"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

export { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

export interface AstroAutolinkOptions {
  /** Paths are resolved relative to Astro's build output directory. */
  paths: string[]
  rehypeAutolinkOptions?: Readonly<RehypeAutolinkOptions> | null | undefined
}

export const astroAutolinkHeadings = (
  astroAutolinkOptions: AstroAutolinkOptions,
): AstroIntegration => {
  const { paths, rehypeAutolinkOptions } = astroAutolinkOptions
  const integrationName = "astro-autolink-headings"
  return {
    name: integrationName,
    hooks: {
      "astro:build:done": async ({
        dir,
        logger,
      }: HookParameters<"astro:build:done">) => {
        const integrationLogger = logger.fork(`${integrationName}/build`)
        await Promise.all(
          paths.map(async (path) => {
            const filePath = fileURLToPath(new URL(path, dir))
            integrationLogger.info(`Processing ${filePath}`)
            const fileContents = await readFile(filePath, { encoding: "utf-8" })
            const processedFileContents = await rehype()
              .use(rehypeHeadingIds)
              .use(rehypeAutolinkHeadings, rehypeAutolinkOptions)
              .process(fileContents)
            await writeFile(filePath, String(processedFileContents))
          }),
        )
      },
    },
  }
}

export const rehypeAutolinkOptions: RehypeAutolinkOptions = {
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
  paths: ["about/index.html"],
  rehypeAutolinkOptions: rehypeAutolinkOptions,
}

interface HastNode {
  children?: HastNode[]
  name?: string
  properties?: Record<string, unknown>
  tagName?: string
  type: string
  value?: string
}

interface HastElement extends HastNode {
  children: HastNode[]
  tagName: string
  type: "element"
}

const isElement = (
  node: HastNode | undefined,
  tagName?: string,
): node is HastElement =>
  node?.type === "element" && (!tagName || node.tagName === tagName)

const isWhitespaceText = (node: HastNode | undefined) =>
  node?.type === "text" && !node.value?.trim()

const isCaption = (node: HastNode | undefined): node is HastNode =>
  isElement(node, "caption") ||
  (node?.name === "caption" &&
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement"))

const toCaptionElement = (node: HastNode): HastElement => {
  if (isElement(node, "caption")) return node
  return {
    children: node.children ?? [],
    tagName: "caption",
    type: "element",
  }
}

export const rehypeTableCaptions = () => (tree: HastNode) => {
  const visit = (node: HastNode) => {
    const { children } = node
    if (!children) return

    for (let index = 0; index < children.length; index += 1) {
      const child = children[index]
      if (!child) continue

      visit(child)

      if (!isElement(child, "table")) continue

      let captionIndex = index - 1
      while (captionIndex >= 0 && isWhitespaceText(children[captionIndex])) {
        captionIndex -= 1
      }

      const captionNode = children[captionIndex]
      if (isCaption(captionNode)) {
        child.children.unshift(toCaptionElement(captionNode))
        children.splice(captionIndex, 1)
        index -= 1
      }

      children[index] = {
        children: [child],
        properties: { className: ["table-scroll"] },
        tagName: "div",
        type: "element",
      }
    }
  }

  visit(tree)
}

export const astroSearch = (): AstroIntegration => {
  const integrationName = "astro-search"
  return {
    name: integrationName,
    hooks: {
      "astro:build:done": ({ dir }: HookParameters<"astro:build:done">) => {
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
    astroOpenGraph(),
    astroSearch(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    processor: unified({
      rehypePlugins: [
        [rehypeAutolinkHeadings, rehypeAutolinkOptions],
        rehypeHeadingIds,
        rehypeTableCaptions,
      ],
      smartypants: false,
    }),
    shikiConfig: {
      theme: "dracula",
    },
  },
  prefetch: true,
  site: "https://www.bws.bio",
})
