import { OPEN_GRAPH } from "../../src/consts"
import { describe, expect, it } from "vitest"

describe("open graph helpers", () => {
  it("normalizes page paths to image routes", () => {
    expect(
      OPEN_GRAPH.getImageRoute(new URL("https://www.example.com/about/")),
    ).toBe("about.png")
    expect(OPEN_GRAPH.getImageRoute("/")).toBe("index.png")
    expect(OPEN_GRAPH.getImagePath("/projects/my-project/")).toBe(
      "/og/projects/my-project.png",
    )
  })

  it("uses the fallback URL outside Vercel previews", () => {
    expect(
      OPEN_GRAPH.getImageBaseUrl("https://www.example.com/about/", {
        VERCEL_ENV: "production",
        VERCEL_URL: "example-production.vercel.app",
      }).href,
    ).toBe("https://www.example.com/about/")
  })

  it("uses the deployment URL in Vercel previews", () => {
    const imageUrl = new URL(
      OPEN_GRAPH.getImagePath("/about/"),
      OPEN_GRAPH.getImageBaseUrl("https://www.example.com/about/", {
        VERCEL_ENV: "preview",
        VERCEL_URL: "example-preview.vercel.app",
      }),
    )
    expect(imageUrl.href).toBe(
      "https://example-preview.vercel.app/og/about.png",
    )
  })
})
