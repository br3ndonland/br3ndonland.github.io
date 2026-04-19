import {
  getOgImageBaseUrl,
  getOgImagePath,
  getOgImageRoute,
} from "../../src/open-graph"
import { describe, expect, it } from "vitest"

describe("open graph helpers", () => {
  it("normalizes page paths to image routes", () => {
    expect(getOgImageRoute(new URL("https://www.bws.bio/about/"))).toBe(
      "about.png",
    )
    expect(getOgImageRoute("/")).toBe("index.png")
    expect(getOgImagePath("/projects/inboard/")).toBe(
      "/og/projects/inboard.png",
    )
  })

  it("uses the fallback URL outside Vercel previews", () => {
    expect(
      getOgImageBaseUrl("https://www.bws.bio/about/", {
        VERCEL_ENV: "production",
        VERCEL_URL: "bws-production.vercel.app",
      }).href,
    ).toBe("https://www.bws.bio/about/")
  })

  it("uses the deployment URL in Vercel previews", () => {
    const imageUrl = new URL(
      getOgImagePath("/about/"),
      getOgImageBaseUrl("https://www.bws.bio/about/", {
        VERCEL_ENV: "preview",
        VERCEL_URL: "bws-preview.vercel.app",
      }),
    )

    expect(imageUrl.href).toBe("https://bws-preview.vercel.app/og/about.png")
  })
})
