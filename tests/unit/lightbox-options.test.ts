import { GLIGHTBOX_OPTIONS } from "../../src/consts"
import { describe, expect, it } from "vitest"

describe("GLightbox options", () => {
  // https://github.com/biati-digital/glightbox/blob/a9385e5/src/js/core/slide.js#L85-L87
  it("prevents GLightbox from altering captions on mobile devices", () => {
    expect(GLIGHTBOX_OPTIONS.moreLength).toBe(0)
  })

  // https://github.com/biati-digital/glightbox/blob/a9385e5/src/js/glightbox.js#L54-L55
  it("prevents GLightbox from loading separate plyr assets from CDN", () => {
    const cdn_domain = "cdn.plyr.io"
    expect(GLIGHTBOX_OPTIONS.plyr.config.blankVideo).not.toContain(cdn_domain)
    expect(GLIGHTBOX_OPTIONS.plyr.config.blankVideo).toBeDefined()
    expect(GLIGHTBOX_OPTIONS.plyr.config.iconUrl).not.toContain(cdn_domain)
    expect(GLIGHTBOX_OPTIONS.plyr.config.iconUrl).toBeDefined()
    expect(GLIGHTBOX_OPTIONS.plyr.css).toBeDefined()
    expect(GLIGHTBOX_OPTIONS.plyr.js).toBeDefined()
  })
})
