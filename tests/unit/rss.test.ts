import type { APIContext } from "astro"
import { parse } from "node-html-parser"
import { describe, expect, it, vi } from "vitest"
import { prepareRssContent } from "../../src/utils/rss"

vi.mock("astro:container", () => ({ loadRenderers: async () => [] }))
vi.mock("astro/container", () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async (content: string) => content,
    }),
  },
}))
vi.mock("astro:content", () => {
  const entries = [
    {
      collection: "blog",
      id: "older-post",
      data: {
        title: "Older & revised",
        description: "Backdated post",
        datePublished: new Date("2019-01-01"),
        dateUpdated: new Date("2026-09-30"),
      },
    },
    {
      collection: "projects",
      id: "project",
      data: {
        title: "Project",
        description: "Project summary",
        dateStart: new Date("2020-01-01"),
      },
    },
    {
      collection: "work",
      id: "job",
      data: { title: "Job", dateStart: new Date("2021-01-01") },
    },
  ]
  const drafts = entries.map((entry) => ({
    ...entry,
    id: "draft",
    data: { ...entry.data, draft: true },
  }))
  return {
    getCollection: async (
      collection: string,
      filter: (entry: { data: { title: string; draft?: boolean } }) => boolean,
    ) =>
      [...entries, ...drafts].filter(
        (entry) => entry.collection === collection && filter(entry),
      ),
    render: async () => ({
      Content: '<p>Full <strong>content</strong><a href="./more">More</a></p>',
    }),
  }
})

describe("RSS feed", () => {
  it("includes full content from all collections in original date order", async () => {
    const { GET } = await import("../../src/pages/rss.xml")
    const response = await GET({
      site: new URL("https://feed.example/"),
    } as APIContext)
    const xml = await response.text()

    expect(response.headers.get("Content-Type")).toContain("application/xml")
    expect(xml.match(/<item>/g)).toHaveLength(3)
    expect(xml).not.toContain("/draft/")
    expect(xml.indexOf("/work/job/")).toBeLessThan(
      xml.indexOf("/projects/project/"),
    )
    expect(xml.indexOf("/projects/project/")).toBeLessThan(
      xml.indexOf("/blog/older-post/"),
    )
    expect(xml).toContain("Older &amp; revised")
    expect(xml).toContain("Tue, 01 Jan 2019 00:00:00 GMT")
    expect(xml).not.toContain("2026")
    const content = parse(xml).querySelectorAll("content\\:encoded")
    expect(content).toHaveLength(3)
    expect(content[2]?.textContent).toContain(
      "<p>Full <strong>content</strong>",
    )
    expect(content[2]?.textContent).toContain(
      'href="https://feed.example/blog/older-post/more"',
    )
  })

  it("prepares rendered links and media for readers without site scripts", async () => {
    const html = await prepareRssContent(
      `<!DOCTYPE html><style>p { color: red }</style>
      <p>Text &amp; details</p><a href="#heading">Heading</a>
      <a href="../other/?a=1&amp;b=2">Other</a>
      <a href="https://external.example/">External</a>
      <picture><source srcset="/image.avif 1x" type="image/avif">
      <img src="/image.png" srcset="/image.png 1x, /large.png 2x" sizes="100vw" alt="Example"></picture>
      <video poster="./poster.png"><source src="//cdn.example/video.mp4"></video>
      <script>siteScript()</script><button>Copy code</button>
      <pre><code>const value = 1</code></pre>`,
      new URL("https://feed.example/blog/post/"),
    )
    const document = parse(html, { blockTextElements: {} })
    const links = document.querySelectorAll("a")

    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://feed.example/blog/post/#heading",
      "https://feed.example/blog/other/?a=1&b=2",
      "https://external.example/",
    ])
    expect(document.querySelector("img")?.getAttribute("src")).toBe(
      "https://feed.example/image.png",
    )
    expect(document.querySelector("video")?.getAttribute("poster")).toBe(
      "https://feed.example/blog/post/poster.png",
    )
    expect(document.querySelector("video source")?.getAttribute("src")).toBe(
      "https://cdn.example/video.mp4",
    )
    expect(document.querySelector("code")?.textContent).toBe("const value = 1")
    expect(
      document.querySelectorAll("script, style, button, [srcset]"),
    ).toEqual([])
    expect(document.querySelector("p")?.textContent).toBe("Text & details")
  })
})
