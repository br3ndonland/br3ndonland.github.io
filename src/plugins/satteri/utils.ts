import type { HastNode } from "satteri"

export type HastElement = Extract<HastNode, { type: "element" }>
export type HastElementContent = HastElement["children"][number]
export type HastElementParent = Extract<
  HastElementContent,
  { children: unknown[] }
>

export const isElement = (
  node: HastNode | undefined,
  tagName?: string,
): node is HastElement =>
  node?.type === "element" && (!tagName || node.tagName === tagName)

export const isElementParent = (
  node: HastElementContent,
): node is HastElementParent => "children" in node

export const isWhitespaceText = (node: HastNode | undefined) =>
  node?.type === "text" && !node.value?.trim()
