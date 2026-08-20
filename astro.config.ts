import { type AstroIntegration, type HookParameters } from "astro"
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import astroExpressiveCode from "astro-expressive-code"
import {
  rehypeHeadingIds,
  type RehypePlugins,
  unified,
} from "@astrojs/markdown-remark"
import { spawn } from "node:child_process"
import { dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"
import type { Options as RehypeAutolinkOptions } from "rehype-autolink-headings"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { ICON_PATHS } from "./src/consts"
import { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

export { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

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

const calloutLabels = {
  caution: "Caution",
  important: "Important",
  note: "Note",
  tip: "Tip",
  warning: "Warning",
} as const

type CalloutType = keyof typeof calloutLabels

export const calloutIcons = {
  caution: "warning-octagon",
  important: "star",
  note: "info",
  tip: "lightbulb",
  warning: "warning",
} as const satisfies Record<CalloutType, keyof typeof ICON_PATHS>

const calloutMarkerPattern =
  /^\[!(CAUTION|IMPORTANT|NOTE|TIP|WARNING)\](?:[\t ]+|(?=\r?\n|$))/i

const isElement = (
  node: HastNode | undefined,
  tagName?: string,
): node is HastElement =>
  node?.type === "element" && (!tagName || node.tagName === tagName)

const isWhitespaceText = (node: HastNode | undefined) =>
  node?.type === "text" && !node.value?.trim()

const getTextContent = (nodes: HastNode[]): string =>
  nodes
    .map((node) => node.value ?? getTextContent(node.children ?? []))
    .join("")

const createCalloutIcon = (type: CalloutType): HastElement => {
  const icon = calloutIcons[type]
  return {
    children: [{ type: "raw", value: ICON_PATHS[icon] }],
    properties: {
      ariaHidden: "true",
      className: ["callout-icon", `callout-icon-${icon}`],
      fill: "currentColor",
      viewBox: "0 0 256 256",
      xmlns: "http://www.w3.org/2000/svg",
    },
    tagName: "svg",
    type: "element",
  }
}

const splitCalloutParagraph = (paragraph: HastElement) => {
  const firstChild = paragraph.children[0]
  if (firstChild?.type !== "text" || !firstChild.value) return

  const markerMatch = firstChild.value.match(calloutMarkerPattern)
  if (!markerMatch?.[1]) return

  const type = markerMatch[1].toLowerCase() as CalloutType
  const inlineChildren: HastNode[] = [
    {
      ...firstChild,
      value: firstChild.value.slice(markerMatch[0].length),
    },
    ...paragraph.children.slice(1),
  ]
  const bodyChildren: HastNode[] = []
  const titleChildren: HastNode[] = []
  let isBody = false

  for (const child of inlineChildren) {
    if (isBody) {
      bodyChildren.push(child)
      continue
    }

    if (isElement(child, "br")) {
      isBody = true
      continue
    }

    if (child.type !== "text" || !child.value?.includes("\n")) {
      titleChildren.push(child)
      continue
    }

    const lineBreakIndex = child.value.indexOf("\n")
    const titleValue = child.value.slice(0, lineBreakIndex).replace(/\r$/, "")
    const bodyValue = child.value.slice(lineBreakIndex + 1)

    if (titleValue) titleChildren.push({ ...child, value: titleValue })
    if (bodyValue) bodyChildren.push({ ...child, value: bodyValue })
    isBody = true
  }

  const title = getTextContent(titleChildren).trim()
  return {
    bodyChildren,
    title: title || calloutLabels[type],
    titleChildren: title
      ? titleChildren
      : [{ type: "text", value: calloutLabels[type] }],
    type,
  }
}

export const rehypeCallouts = () => (tree: HastNode) => {
  const visit = (node: HastNode) => {
    const { children } = node
    if (!children) return

    for (let index = 0; index < children.length; index += 1) {
      const child = children[index]
      if (!child) continue

      visit(child)

      if (!isElement(child, "blockquote")) continue

      let paragraphIndex = 0
      while (isWhitespaceText(child.children[paragraphIndex])) {
        paragraphIndex += 1
      }

      const firstChild = child.children[paragraphIndex]
      if (!isElement(firstChild, "p")) continue

      const callout = splitCalloutParagraph(firstChild)
      if (!callout) continue

      const remainingChildren = child.children.slice(paragraphIndex + 1)

      const bodyChildren = callout.bodyChildren.length
        ? [
            { ...firstChild, children: callout.bodyChildren },
            ...remainingChildren,
          ]
        : remainingChildren

      children[index] = {
        children: [
          {
            children: [
              createCalloutIcon(callout.type),
              ...callout.titleChildren,
            ],
            properties: { className: ["callout-title"] },
            tagName: "p",
            type: "element",
          },
          ...bodyChildren,
        ],
        properties: {
          ariaLabel: callout.title,
          className: ["callout", `callout-${callout.type}`],
        },
        tagName: "aside",
        type: "element",
      }
    }
  }

  visit(tree)
}

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

export const markdownRehypePlugins: RehypePlugins = [
  rehypeCallouts,
  /*
    rehypeHeadingIds must occur before rehypeAutolinkHeadings
    or headings will not be properly linked.
  */
  rehypeHeadingIds,
  [rehypeAutolinkHeadings, rehypeAutolinkOptions],
  rehypeTableCaptions,
]

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
    astroExpressiveCode({
      frames: {
        showCopyToClipboardButton: true,
      },
      styleOverrides: {
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "var(--text-sm)",
      },
      themes: ["dracula"],
    }),
    astroOpenGraph(),
    astroSearch(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    processor: unified({
      rehypePlugins: markdownRehypePlugins,
      smartypants: false,
    }),
  },
  prefetch: true,
  site: "https://www.bws.bio",
})
