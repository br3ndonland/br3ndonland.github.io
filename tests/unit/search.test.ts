import fs from "node:fs/promises"
import { bindSearchResultNavigation } from "../../src/utils/search"
import { describe, expect, it, vi } from "vitest"

const searchComponent = await fs.readFile(
  new URL("../../src/components/Search.astro", import.meta.url),
  "utf-8",
)

describe("bindSearchResultNavigation", () => {
  it("closes the modal when a Pagefind result link is activated", () => {
    const close = vi.fn()
    const closest = vi.fn(() => ({}))
    const search = Object.assign(new EventTarget(), { closest })

    bindSearchResultNavigation(search, { close })
    search.dispatchEvent(new Event("click"))

    expect(closest).toHaveBeenCalledWith("pagefind-results a")
    expect(close).toHaveBeenCalledOnce()
  })

  it("keeps the modal open for clicks outside Pagefind results", () => {
    const close = vi.fn()
    const search = Object.assign(new EventTarget(), {
      closest: vi.fn(() => null),
    })

    bindSearchResultNavigation(search, { close })
    search.dispatchEvent(new Event("click"))

    expect(close).not.toHaveBeenCalled()
  })
})

describe("Search component regression contract", () => {
  it("resets the search query when the modal closes", () => {
    expect(searchComponent).toContain("<pagefind-modal reset-on-close />")
  })

  it("keeps highlighted terms visible and theme-aware", () => {
    expect(searchComponent).toContain("--pf-mark: var(--link-color);")
    expect(searchComponent).toContain(`site-search .pf-result-excerpt,
  site-search .pf-heading-excerpt {
    white-space: normal !important;
  }`)
  })

  it("hides redundant parent excerpts when heading results exist", () => {
    expect(searchComponent).toContain(`
  site-search .pf-result:has(.pf-heading-chips) .pf-result-excerpt {
    display: none !important;
  }`)
  })

  it("hides the empty keyboard footer on touch-only devices", () => {
    expect(searchComponent).toContain(`
  @media (hover: none) {
    site-search pagefind-modal-footer {
      display: none !important;
    }
  }`)
  })

  it("binds Pagefind result navigation to the modal", () => {
    expect(searchComponent).toContain("bindSearchResultNavigation(this, modal)")
  })
})
