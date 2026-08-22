import { type AstroIntegration, type HookParameters } from "astro"
import { defineConfig } from "astro/config"
import { satteri, satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import astroExpressiveCode from "astro-expressive-code"
import { spawn } from "node:child_process"
import { dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"
import {
  defineHastPlugin,
  type HastNode,
  type HastPluginEntry,
  type HastVisitorContext,
} from "satteri"
import { ICON_PATHS } from "./src/consts"
import { astroMarkdownEndpoints } from "./src/integrations/astro-markdown-endpoints/index"
import { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

export { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

type HastElement = Extract<HastNode, { type: "element" }>
type HastElementContent = HastElement["children"][number]
type HastElementParent = Extract<HastElementContent, { children: unknown[] }>
type HastMdxElement = Extract<
  HastNode,
  { type: "mdxJsxFlowElement" | "mdxJsxTextElement" }
>

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

const isElementParent = (node: HastElementContent): node is HastElementParent =>
  "children" in node

const isWhitespaceText = (node: HastNode | undefined) =>
  node?.type === "text" && !node.value?.trim()

const getTextContent = (nodes: readonly HastElementContent[]): string =>
  nodes
    .map((node) =>
      "value" in node && node.value
        ? node.value
        : getTextContent(isElementParent(node) ? node.children : []),
    )
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
  const inlineChildren: HastElementContent[] = [
    {
      ...firstChild,
      value: firstChild.value.slice(markerMatch[0].length),
    },
    ...paragraph.children.slice(1),
  ]
  const bodyChildren: HastElementContent[] = []
  const titleChildren: HastElementContent[] = []
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
  const resolvedTitleChildren: HastElementContent[] = title
    ? titleChildren
    : [{ type: "text", value: calloutLabels[type] }]
  return {
    bodyChildren,
    title: title || calloutLabels[type],
    titleChildren: resolvedTitleChildren,
    type,
  }
}

const getCallout = (blockquote: HastElement) => {
  let paragraphIndex = 0
  while (isWhitespaceText(blockquote.children[paragraphIndex])) {
    paragraphIndex += 1
  }

  const paragraph = blockquote.children[paragraphIndex]
  if (!isElement(paragraph, "p")) return

  const callout = splitCalloutParagraph(paragraph)
  if (!callout) return

  return { callout, paragraph, paragraphIndex }
}

const transformNestedCallouts = (
  node: HastElementContent,
): HastElementContent => {
  if (isElement(node, "blockquote")) {
    const transformed = createCalloutElement(node)
    if (transformed) return transformed
  }

  if (!isElementParent(node)) return node
  return {
    ...node,
    children: node.children.map(transformNestedCallouts),
  } as HastElementContent
}

const createCalloutElement = (
  blockquote: HastElement,
): HastElement | undefined => {
  const parsed = getCallout(blockquote)
  if (!parsed) return

  const { callout, paragraph, paragraphIndex } = parsed
  const remainingChildren = blockquote.children
    .slice(paragraphIndex + 1)
    .map(transformNestedCallouts)
  const bodyChildren: HastElementContent[] = callout.bodyChildren.length
    ? [
        {
          ...paragraph,
          children: callout.bodyChildren.map(transformNestedCallouts),
        },
        ...remainingChildren,
      ]
    : remainingChildren

  return {
    children: [
      {
        children: [createCalloutIcon(callout.type), ...callout.titleChildren],
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

const hasCalloutAncestor = (node: HastNode, context: HastVisitorContext) => {
  let parent = context.parent(node)
  while (parent) {
    if (isElement(parent, "blockquote") && getCallout(parent)) return true
    parent = context.parent(parent)
  }
  return false
}

export const satteriCallouts = defineHastPlugin({
  name: "callouts",
  element: {
    filter: ["blockquote"],
    visit(node, context) {
      if (hasCalloutAncestor(node, context)) return
      return createCalloutElement(node)
    },
  },
})

export const satteriAutolinkHeadings = defineHastPlugin({
  name: "autolink-headings",
  element: {
    filter: ["h2", "h3", "h4", "h5", "h6"],
    visit(node, context) {
      const id = node.properties?.id
      if (typeof id !== "string") return

      context.setProperty(node, "className", ["heading-element"])
      context.setProperty(node, "tabIndex", "-1")
      context.prependChild(node, {
        children: [
          {
            children: [],
            properties: { className: ["anchor-icon"] },
            tagName: "span",
            type: "element",
          },
        ],
        properties: {
          ariaLabel: "Link to self",
          className: ["anchor-link"],
          href: `#${id}`,
        },
        tagName: "a",
        type: "element",
      })
    },
  },
})

const isCaption = (
  node: HastNode | undefined,
): node is HastElement | HastMdxElement =>
  isElement(node, "caption") ||
  ((node?.type === "mdxJsxFlowElement" || node?.type === "mdxJsxTextElement") &&
    node.name === "caption")

const toCaptionElement = (node: HastElement | HastMdxElement): HastElement => {
  if (isElement(node, "caption")) return node
  return {
    children: node.children,
    properties: {},
    tagName: "caption",
    type: "element",
  }
}

export const satteriTableCaptions = defineHastPlugin({
  name: "table-captions",
  element: {
    filter: ["table"],
    visit(node, context) {
      const parent = context.parent(node)
      const tableIndex = context.indexOf(node)
      let captionNode: HastElement | HastMdxElement | undefined

      if (parent && tableIndex !== undefined) {
        let captionIndex = tableIndex - 1
        while (
          captionIndex >= 0 &&
          isWhitespaceText(parent.children[captionIndex])
        ) {
          captionIndex -= 1
        }

        const candidate = parent.children[captionIndex]
        if (isCaption(candidate)) captionNode = candidate
      }

      if (captionNode) context.removeNode(captionNode)

      const table: HastElement = {
        ...node,
        children: [
          ...(captionNode ? [toCaptionElement(captionNode)] : []),
          ...node.children,
        ],
      }

      return {
        children: [table],
        properties: { className: ["table-scroll"] },
        tagName: "div",
        type: "element",
      }
    },
  },
})

export const markdownHastPlugins = [
  satteriCallouts,
  // Keep this factory before autolinking so IDs and slug state are document-scoped.
  satteriHeadingIdsPlugin,
  satteriAutolinkHeadings,
  satteriTableCaptions,
] satisfies HastPluginEntry[]

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
    astroMarkdownEndpoints(),
  ],
  markdown: {
    processor: satteri({
      features: { smartPunctuation: false },
      hastPlugins: markdownHastPlugins,
    }),
  },
  prefetch: true,
  site: "https://www.bws.bio",
})
