import {
  createTableOfContents,
  findCurrentHeadingIndex,
} from "../../src/utils/table-of-contents"
import { describe, expect, it } from "vitest"

describe("createTableOfContents", () => {
  it("creates a nested table of contents from h2 and h3 headings", () => {
    const headings = [
      { depth: 1, slug: "title", text: "Title" },
      { depth: 2, slug: "first", text: "First" },
      { depth: 3, slug: "first-detail", text: "First detail" },
      { depth: 2, slug: "second", text: "Second" },
    ]

    expect(createTableOfContents(headings)).toEqual([
      {
        children: [
          {
            children: [],
            depth: 3,
            slug: "first-detail",
            text: "First detail",
          },
        ],
        depth: 2,
        slug: "first",
        text: "First",
      },
      { children: [], depth: 2, slug: "second", text: "Second" },
    ])
  })

  it("keeps an h3 without an h2 parent at the root", () => {
    const headings = [{ depth: 3, slug: "detail", text: "Detail" }]

    expect(createTableOfContents(headings)).toEqual([
      { children: [], depth: 3, slug: "detail", text: "Detail" },
    ])
  })

  it("supports a custom heading depth range", () => {
    const headings = [
      { depth: 2, slug: "section", text: "Section" },
      { depth: 3, slug: "detail", text: "Detail" },
      { depth: 4, slug: "note", text: "Note" },
    ]

    expect(createTableOfContents(headings, 3, 4)).toEqual([
      {
        children: [{ children: [], depth: 4, slug: "note", text: "Note" }],
        depth: 3,
        slug: "detail",
        text: "Detail",
      },
    ])
  })
})

describe("findCurrentHeadingIndex", () => {
  it("advances when headings pass the sticky table of contents", () => {
    expect(findCurrentHeadingIndex([-300, 80, 900], 72)).toBe(0)
    expect(findCurrentHeadingIndex([-900, 40, 600], 72)).toBe(1)
    expect(findCurrentHeadingIndex([-1200, -300, 50], 72)).toBe(2)
  })

  it("selects the last heading at the bottom of the document", () => {
    expect(findCurrentHeadingIndex([-100, 400, 900], 72, true)).toBe(2)
  })

  it("handles an empty heading list", () => {
    expect(findCurrentHeadingIndex([], 72)).toBe(-1)
  })
})
