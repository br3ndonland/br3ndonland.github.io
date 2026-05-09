import { GLIGHTBOX_OPTIONS } from "../../src/consts"
import { describe, expect, it } from "vitest"

describe("GLightbox options", () => {
  it("keeps mobile captions as full HTML", () => {
    expect(GLIGHTBOX_OPTIONS.moreLength).toBe(0)
  })

  it("defines Plyr asset URL overrides", () => {
    expect(GLIGHTBOX_OPTIONS.plyr.css).toBeDefined()
    expect(GLIGHTBOX_OPTIONS.plyr.js).toBeDefined()
  })
})
