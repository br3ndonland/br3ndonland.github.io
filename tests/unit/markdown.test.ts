import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import {
  createMarkdownPage,
  generateMarkdownPages,
  getCanonicalPath,
  getMarkdownOutputPath,
} from "../../src/integrations/astro-markdown-endpoints/index"
import { getMarkdownUrlPath } from "../../src/utils/markdown"
import { afterEach, describe, expect, it } from "vitest"

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {
        force: true,
        recursive: true,
      }),
    ),
  )
})

describe("Markdown route paths", () => {
  it.each([
    ["index.html", "index.md"],
    [path.join("about", "index.html"), "about.md"],
    [
      path.join("projects", "example", "index.html"),
      path.join("projects", "example.md"),
    ],
    [path.join("feed", "page.html"), path.join("feed", "page.md")],
  ])("maps %s to %s", (htmlPath, markdownPath) => {
    expect(getMarkdownOutputPath(htmlPath)).toBe(markdownPath)
  })

  it.each([
    "404.html",
    path.join("404", "index.html"),
    path.join("_astro", "fixture.html"),
    path.join("pagefind", "fixture.html"),
    "robots.txt",
  ])("excludes %s", (htmlPath) => {
    expect(getMarkdownOutputPath(htmlPath)).toBeUndefined()
  })

  it.each([
    ["index.html", "/"],
    [path.join("about", "index.html"), "/about/"],
    [path.join("projects", "example", "index.html"), "/projects/example/"],
    [path.join("feed", "page.html"), "/feed/page"],
  ])("gets the canonical route for %s", (htmlPath, canonicalPath) => {
    expect(getCanonicalPath(htmlPath)).toBe(canonicalPath)
  })

  it.each([
    ["/", "/index.md"],
    ["/about/", "/about.md"],
    ["/projects/example", "/projects/example.md"],
    ["/feed/page.html", "/feed/page.md"],
    ["/404", undefined],
    ["/404.html", undefined],
  ])("gets the visible Markdown link for %s", (pathname, markdownPath) => {
    expect(getMarkdownUrlPath(pathname)).toBe(markdownPath)
  })
})

describe("createMarkdownPage", () => {
  const site = new URL("https://example.com")
  const options = {
    canonicalUrl: new URL("/projects/example/", site),
    html: `<!doctype html>
      <html>
        <head>
          <title>Fallback title</title>
          <meta name="description" content="A &quot;quoted&quot; description">
        </head>
        <body>
          <nav data-markdown-ignore>Site navigation</nav>
          <header>
            <h1><a class="anchor-link" href="#example">Anchor</a>Example</h1>
            <a aria-label="Repository" href="/repository"><svg></svg></a>
          </header>
          <main>
            <p>Read the <a href="/about">about page</a>.</p>
            <custom-image>
              <img src="/images/diagram.png" alt="Diagram">
            </custom-image>
            <a aria-label="Open image: Linked diagram" href="/images/full.png">
              <picture><img src="/images/thumbnail.png" alt="Linked diagram"></picture>
            </a>
            <ul>
              <li>
                <a class="card" href="/projects/card">
                  <h3 class="title">Card title<svg></svg></h3>
                  <picture><img src="/images/card.png" alt="Card image"></picture>
                </a>
              </li>
            </ul>
            <h2>Skills used:</h2>
            <div class="tags">
              <div class="pill">Astro</div>
              <div class="pill">TypeScript</div>
            </div>
            <ul>
              <li>Parent item<ul><li>Nested item</li></ul></li>
              <li><input type="checkbox" checked>Complete item</li>
            </ul>
            <aside class="callout"><p>Important context.</p></aside>
            <table>
              <caption>Example values</caption>
              <thead><tr><th>Name</th><th>Value</th></tr></thead>
              <tbody><tr><td>Alpha</td><td>1</td></tr></tbody>
            </table>
            <div class="expressive-code">
              <pre data-language="ts"><code>
                <div class="ec-line"><div class="code"><span>const value = 1</span></div></div>
                <div class="ec-line"><div class="code"><span>console.log(value)</span></div></div>
              </code></pre>
            </div>
            <del>Removed</del>
            <script>import Component from "./Component.astro"</script>
            <style>.fixture { color: red; }</style>
          </main>
          <footer data-markdown-ignore>Site footer</footer>
        </body>
      </html>`,
    markdownUrl: new URL("/projects/example.md", site),
    site,
  }

  it("creates agent-readable Markdown from rendered HTML", () => {
    const markdown = createMarkdownPage(options)

    expect(markdown).toContain('title: "Example"')
    expect(markdown).toContain('description: "A \\"quoted\\" description"')
    expect(markdown).toContain(
      'canonical_url: "https://example.com/projects/example/"',
    )
    expect(markdown).toContain(
      'md_url: "https://example.com/projects/example.md"',
    )
    expect(markdown).toContain("# Example")
    expect(markdown).toContain("[Repository](https://example.com/repository)")
    expect(markdown).toContain("[about page](https://example.com/about)")
    expect(markdown).toContain(
      "![Diagram](https://example.com/images/diagram.png)",
    )
    expect(markdown).toContain(
      "[![Linked diagram](https://example.com/images/thumbnail.png)](https://example.com/images/full.png)",
    )
    expect(markdown).toContain(
      "[Card title ![Card image](https://example.com/images/card.png)](https://example.com/projects/card)",
    )
    expect(markdown).not.toContain("### Card title")
    expect(markdown).toContain("## Skills used:")
    expect(markdown).toContain("- Astro\n- TypeScript")
    expect(markdown).toContain("- Parent item\n  - Nested item")
    expect(markdown).toContain("- [x] Complete item")
    expect(markdown).not.toMatch(/^\s*- {2,}/m)
    expect(markdown).toContain("Important context.")
    expect(markdown).toContain("Example values")
    expect(markdown).toContain("| Name | Value |")
    expect(markdown).toContain("| --- | --- |")
    expect(markdown).toContain(
      "```ts\nconst value = 1\nconsole.log(value)\n```",
    )
    expect(markdown).toContain("~Removed~")
    expect(markdown).not.toContain("Site navigation")
    expect(markdown).not.toContain("Site footer")
    expect(markdown).not.toContain("Component.astro")
    expect(markdown).not.toContain("<custom-image>")
    expect(markdown).not.toContain("<svg")
    expect(markdown.endsWith("\n")).toBe(true)
    expect(markdown.endsWith("\n\n")).toBe(false)
  })

  it("uses the document title for homepage metadata", () => {
    const markdown = createMarkdownPage({
      ...options,
      canonicalUrl: new URL("/", site),
      html: `<!doctype html><html><head><title>Brendon Smith</title></head><body><h1>Hi, I'm Brendon.</h1></body></html>`,
      markdownUrl: new URL("/index.md", site),
    })

    expect(markdown).toContain('title: "Brendon Smith"')
    expect(markdown).toContain("# Hi, I'm Brendon.")
  })

  it("is deterministic", () => {
    expect(createMarkdownPage(options)).toBe(createMarkdownPage(options))
  })
})

describe("generateMarkdownPages", () => {
  it("writes Markdown siblings for public HTML pages", async () => {
    const outputDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), "astro-markdown-"),
    )
    temporaryDirectories.push(outputDirectory)
    await fs.mkdir(path.join(outputDirectory, "about"))
    const html = (title: string) =>
      `<!doctype html><html><head><title>${title}</title></head><body><h1>${title}</h1></body></html>`

    await Promise.all([
      fs.writeFile(path.join(outputDirectory, "index.html"), html("Home")),
      fs.writeFile(
        path.join(outputDirectory, "about", "index.html"),
        html("About"),
      ),
      fs.writeFile(path.join(outputDirectory, "404.html"), html("Missing")),
    ])

    const count = await generateMarkdownPages(
      outputDirectory,
      new URL("https://example.com"),
    )

    expect(count).toBe(2)
    await expect(
      fs.readFile(path.join(outputDirectory, "index.md"), "utf8"),
    ).resolves.toContain("# Home")
    await expect(
      fs.readFile(path.join(outputDirectory, "about.md"), "utf8"),
    ).resolves.toContain("# About")
    await expect(
      fs.stat(path.join(outputDirectory, "404.md")),
    ).rejects.toThrow()
  })
})
