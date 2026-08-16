import type { MarkdownHeading } from "astro"

export interface TableOfContentsItem extends MarkdownHeading {
  children: TableOfContentsItem[]
}

export const findCurrentHeadingIndex = (
  headingTops: readonly number[],
  threshold: number,
  isAtDocumentBottom = false,
) => {
  if (headingTops.length === 0) return -1
  if (isAtDocumentBottom) return headingTops.length - 1

  let currentIndex = 0
  for (const [index, headingTop] of headingTops.entries()) {
    if (headingTop > threshold) break
    currentIndex = index
  }

  return currentIndex
}

export const createTableOfContents = (
  headings: readonly MarkdownHeading[],
  minHeadingDepth = 2,
  maxHeadingDepth = 3,
): TableOfContentsItem[] => {
  const items: TableOfContentsItem[] = []
  const ancestors: TableOfContentsItem[] = []

  for (const heading of headings) {
    if (heading.depth < minHeadingDepth || heading.depth > maxHeadingDepth) {
      continue
    }

    const item = { ...heading, children: [] }

    while (
      ancestors.length > 0 &&
      ancestors[ancestors.length - 1]!.depth >= item.depth
    ) {
      ancestors.pop()
    }

    const parent = ancestors[ancestors.length - 1]
    if (parent) {
      parent.children.push(item)
    } else {
      items.push(item)
    }

    ancestors.push(item)
  }

  return items
}
