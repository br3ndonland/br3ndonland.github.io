import middleware from "../../middleware"
import { describe, expect, it } from "vitest"

describe("Markdown content negotiation", () => {
  it.each([
    ["/", "/index.md"],
    ["/about", "/about.md"],
    ["/blog/new-post", "/blog/new-post.md"],
    ["/projects", "/projects.md"],
    ["/projects/gitless/", "/projects/gitless.md"],
    ["/work/harvard?source=agent", "/work/harvard.md?source=agent"],
  ])("rewrites %s to its static Markdown sibling", (path, destination) => {
    const response = middleware(
      new Request(`https://example.com${path}`, {
        headers: { Accept: "text/markdown" },
      }),
    )

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `https://example.com${destination}`,
    )
    expect(response.headers.get("Vary")).toBe("Accept")
    expect(response.headers.has("Location")).toBe(false)
  })

  it.each([
    ["text/markdown", true],
    ["text/html;q=0.5, text/markdown", true],
    ["TEXT/MARKDOWN; charset=utf-8; q=1, text/html;q=0.8", true],
    ["text/markdown, */*;q=0.5", true],
    ["text/markdown, */*", true],
    ["text/markdown;q=0.5, text/*;q=0.5", true],
    ["text/html;q=0, text/markdown;q=0.5, text/*;q=1", true],
    ["", false],
    ["*/*", false],
    ["text/*", false],
    ["text/html", false],
    ["text/markdown;q=0", false],
    ["text/markdown;q=0, */*;q=1", false],
    ["text/html, text/markdown;q=0.5", false],
    ["text/html, text/markdown", false],
    ["text/markdown;q=invalid", false],
    ["text/markdown;q=2", false],
    ["text/markdown-other", false],
  ])("honors Accept: %s", (accept, markdown) => {
    const response = middleware(
      new Request("https://example.com/about", {
        headers: { Accept: accept },
      }),
    )

    expect(response.headers.has("x-middleware-rewrite")).toBe(markdown)
    expect(response.headers.get("Vary")).toBe("Accept")
  })

  it.each([
    "/about.md",
    "/projects/gitless.md",
    "/images/example.png",
    "/llms.txt",
  ])("leaves the explicit file %s unchanged", (path) => {
    const response = middleware(
      new Request(`https://example.com${path}`, {
        headers: { Accept: "text/markdown" },
      }),
    )
    expect(response.headers.has("x-middleware-rewrite")).toBe(false)
  })

  it("negotiates HEAD requests", () => {
    const response = middleware(
      new Request("https://example.com/about", {
        method: "HEAD",
        headers: { Accept: "text/markdown" },
      }),
    )
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://example.com/about.md",
    )
  })

  it("does not rewrite POST requests", () => {
    const response = middleware(
      new Request("https://example.com/about", {
        method: "POST",
        headers: { Accept: "text/markdown" },
      }),
    )
    expect(response.headers.has("x-middleware-rewrite")).toBe(false)
  })
})
