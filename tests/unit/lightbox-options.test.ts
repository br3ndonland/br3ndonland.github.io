import { GLIGHTBOX_OPTIONS } from "../../src/consts"
import { describe, expect, it } from "vitest"

describe("GLightbox options", () => {
  it("keeps mobile captions as full HTML", () => {
    expect(GLIGHTBOX_OPTIONS.moreLength).toBe(0)
  })

  it("does not ask GLightbox to load Plyr from the CDN", () => {
    expect(GLIGHTBOX_OPTIONS.plyr.css).toBe("")
    expect(GLIGHTBOX_OPTIONS.plyr.js).toBe("")
  })
})
