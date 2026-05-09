import { GLIGHTBOX_OPTIONS } from "../../src/consts"
import { describe, expect, it } from "vitest"

describe("GLightbox options", () => {
  it("keeps mobile captions as full HTML", () => {
    expect(GLIGHTBOX_OPTIONS.moreLength).toBe(0)
  })

  // https://github.com/biati-digital/glightbox/blob/a9385e5/src/js/glightbox.js#L54-L55
  it("prevents GLightbox from loading separate plyr assets from CDN", () => {
    expect(GLIGHTBOX_OPTIONS.plyr.css).toBeDefined()
    expect(GLIGHTBOX_OPTIONS.plyr.js).toBeDefined()
  })

  it("serves Plyr fallback assets from this site", () => {
    const { blankVideo, iconUrl } = GLIGHTBOX_OPTIONS.plyr.config

    expect(blankVideo).toBeDefined()
    expect(blankVideo).not.toContain("cdn.plyr.io")
    expect(iconUrl).toBeDefined()
    expect(iconUrl).not.toContain("cdn.plyr.io")
  })
})
