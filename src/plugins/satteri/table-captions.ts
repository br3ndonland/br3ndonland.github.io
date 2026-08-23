import { defineHastPlugin, type HastNode } from "satteri"
import { type HastElement, isElement, isWhitespaceText } from "./utils"

type HastMdxElement = Extract<
  HastNode,
  { type: "mdxJsxFlowElement" | "mdxJsxTextElement" }
>

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
