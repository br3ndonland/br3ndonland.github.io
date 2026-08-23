import {
  defineHastPlugin,
  type HastNode,
  type HastVisitorContext,
} from "satteri"
import { ICON_PATHS } from "../../consts"
import {
  type HastElement,
  type HastElementContent,
  isElement,
  isElementParent,
  isWhitespaceText,
} from "./utils"

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
