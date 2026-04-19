import {
  getOgImageBaseUrl,
  getOgImagePath,
  getOgImageRoute,
} from "../../src/open-graph"
import { describe, expect, it } from "vitest"

describe("open graph helpers", () => {
  it("normalizes page paths to image routes", () => {
    expect(getOgImageRoute(new URL("https://www.example.com/about/"))).toBe(
      "about.png",
    )
    expect(getOgImageRoute("/")).toBe("index.png")
    expect(getOgImagePath("/projects/my-project/")).toBe(
      "/og/projects/my-project.png",
    )
  })

  it("uses the fallback URL outside Vercel previews", () => {
    expect(
      getOgImageBaseUrl("https://www.example.com/about/", {
        VERCEL_ENV: "production",
        VERCEL_URL: "example-production.vercel.app",
      }).href,
    ).toBe("https://www.example.com/about/")
  })

  it("uses the deployment URL in Vercel previews", () => {
    const imageUrl = new URL(
      getOgImagePath("/about/"),
      getOgImageBaseUrl("https://www.example.com/about/", {
        VERCEL_ENV: "preview",
        VERCEL_URL: "example-preview.vercel.app",
      }),
    )
    expect(imageUrl.href).toBe(
      "https://example-preview.vercel.app/og/about.png",
    )
  })
})
