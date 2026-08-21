import type { HookParameters } from "astro"
import { createMarkdownProcessor } from "@astrojs/markdown-remark"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import {
  astroOpenGraph,
  astroSearch,
  calloutIcons,
  markdownRehypePlugins,
  rehypeTableCaptions,
} from "../../astro.config"
import { describe, expect, it } from "vitest"

type AstroBuildDoneHookOptions = HookParameters<"astro:build:done">

const pathToDirectoryURL = (directoryPath: string) =>
  pathToFileURL(
    directoryPath.endsWith(path.sep)
      ? directoryPath
      : `${directoryPath}${path.sep}`,
  )

const createIntegrationLogger = (
  label: string,
): AstroBuildDoneHookOptions["logger"] => {
  const logger: AstroBuildDoneHookOptions["logger"] = {
    close: () => undefined,
    debug: () => undefined,
    error: () => undefined,
    flush: () => undefined,
    fork: () => logger,
    info: () => undefined,
    label,
    options: {
      destination: {
        write: () => true,
      },
      level: "info",
    },
    warn: () => undefined,
  }

  return logger
}

const openGraphWrap = (...children: unknown[]) => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    },
    children,
  },
})

describe("markdownRehypePlugins", () => {
  it("adds anchor links after adding heading ids", async () => {
    const processor = await createMarkdownProcessor({
      rehypePlugins: markdownRehypePlugins,
      syntaxHighlight: false,
    })

    const { code } = await processor.render("## Research")

    expect(code).toContain(
      '<h2 id="research" tabindex="-1" class="heading-element">',
    )
    expect(code).toContain(
      '<a aria-label="Link to self" class="anchor-link" href="#research">',
    )
  })

  it.each([
    ["CAUTION", "Caution", calloutIcons.caution],
    ["IMPORTANT", "Important", calloutIcons.important],
    ["NOTE", "Note", calloutIcons.note],
    ["TIP", "Tip", calloutIcons.tip],
    ["WARNING", "Warning", calloutIcons.warning],
  ])("renders %s callouts with a default title", async (type, title, icon) => {
    const processor = await createMarkdownProcessor({
      rehypePlugins: markdownRehypePlugins,
      syntaxHighlight: false,
    })

    const { code } = await processor.render(`> [!${type}]\n> Callout content`)

    expect(code).toContain(`class="callout callout-${type.toLowerCase()}"`)
    expect(code).toContain(`aria-label="${title}"`)
    expect(code).toContain(
      `class="callout-icon callout-icon-${icon}" fill="currentColor"`,
    )
    expect(code).toContain(`</svg>${title}</p>`)
    expect(code).toContain("<p>Callout content</p>")
  })

  it("renders a custom callout title and rich body content", async () => {
    const processor = await createMarkdownProcessor({
      rehypePlugins: markdownRehypePlugins,
      syntaxHighlight: false,
    })

    const { code } = await processor.render(`> [!TIP] Optional **callout title**
> Callout content
>
> - First item
> - Second item`)

    expect(code).toContain('aria-label="Optional callout title"')
    expect(code).toContain('class="callout callout-tip"')
    expect(code).toContain("</svg>Optional <strong>callout title</strong></p>")
    expect(code).toContain("<p>Callout content</p>")
    expect(code).toContain("<li>First item</li>")
    expect(code).toContain("<li>Second item</li>")
  })

  it("preserves ordinary and unsupported blockquotes", async () => {
    const processor = await createMarkdownProcessor({
      rehypePlugins: markdownRehypePlugins,
      syntaxHighlight: false,
    })

    const { code } = await processor.render(`> Ordinary quotation

> [!INFO]
> Unsupported callout

> [!TIP]not a callout
> Missing required whitespace`)

    expect(code).toContain(
      "<blockquote>\n<p>Ordinary quotation</p>\n</blockquote>",
    )
    expect(code).toContain("<p>[!INFO]\nUnsupported callout</p>")
    expect(code).toContain(
      "<p>[!TIP]not a callout\nMissing required whitespace</p>",
    )
    expect(code).not.toContain('class="callout')
  })
})

describe("rehypeTableCaptions", () => {
  it("wraps tables and moves a caption into the table", () => {
    const tree = {
      children: [
        {
          children: [
            {
              type: "text",
              value: "Table: Fixture caption.",
            },
          ],
          name: "caption",
          type: "mdxJsxFlowElement",
        },
        {
          children: [
            {
              children: [],
              tagName: "thead",
              type: "element",
            },
          ],
          tagName: "table",
          type: "element",
        },
      ],
      type: "root",
    }

    rehypeTableCaptions()(tree)

    expect(tree.children).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    type: "text",
                    value: "Table: Fixture caption.",
                  },
                ],
                tagName: "caption",
                type: "element",
              },
              {
                children: [],
                tagName: "thead",
                type: "element",
              },
            ],
            tagName: "table",
            type: "element",
          },
        ],
        properties: { className: ["table-scroll"] },
        tagName: "div",
        type: "element",
      },
    ])
  })
})

describe("astroOpenGraph", () => {
  it("creates an Astro integration", () => {
    expect(astroOpenGraph().name).toBe("astro-open-graph")
  })

  it("converts basic html into a Satori element tree", () => {
    const result = astroOpenGraph.html`<div>Hello ${"world"}</div>`

    expect(result).toEqual(
      openGraphWrap({
        type: "div",
        props: {
          children: "Hello world",
        },
      }),
    )
  })

  it("supports function input", () => {
    const result = astroOpenGraph.html("<div>Hello world</div>")

    expect(result).toEqual(
      openGraphWrap({
        type: "div",
        props: {
          children: "Hello world",
        },
      }),
    )
  })

  it("parses style attributes for Satori", () => {
    const result = astroOpenGraph.html`<div
      style="
        background-image: linear-gradient(135deg, #ef629f, #eecda3);
        border-top: 1px solid green;
        color: red;
      "
    >
      Hello world
    </div>`

    expect(result).toEqual(
      openGraphWrap({
        type: "div",
        props: {
          children: "Hello world",
          style: {
            backgroundImage: "linear-gradient(135deg, #ef629f, #eecda3)",
            borderTop: "1px solid green",
            color: "red",
          },
        },
      }),
    )
  })

  it("preserves self-closing image attributes", () => {
    const result = astroOpenGraph.html`<img
      src="data:image/png;base64,AAAA"
      height="10"
      width="20"
    />`

    expect(result).toEqual(
      openGraphWrap({
        type: "img",
        props: {
          children: [],
          height: "10",
          src: "data:image/png;base64,AAAA",
          width: "20",
        },
      }),
    )
  })

  it("decodes html entities once", () => {
    const result = astroOpenGraph.html`<div title="&amp;lt;">
      A &amp;lt; B
    </div>`

    expect(result).toEqual(
      openGraphWrap({
        type: "div",
        props: {
          children: "A &lt; B",
          title: "&lt;",
        },
      }),
    )
  })

  it("returns a PNG response", async () => {
    const fontData = await fs.readFile(
      path.resolve("public", "fonts", "RecursiveSansLinearStatic-Regular.ttf"),
    )
    const response = await astroOpenGraph
      .image({
        height: 126,
        template: astroOpenGraph.html`<div
        style="color: black; display: flex; font-family: Recursive Sans;"
      >
        Hello world
      </div>`,
        width: 240,
      })
      .toResponse({
        satori: {
          fonts: [
            {
              data: fontData,
              name: "Recursive Sans",
              style: "normal",
              weight: 400,
            },
          ],
        },
      })

    const bytes = Buffer.from(await response.arrayBuffer())

    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=31536000, immutable",
    )
    expect(response.headers.get("Content-Length")).toBe(
      bytes.byteLength.toString(),
    )
    expect(response.headers.get("Content-Type")).toBe("image/png")
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  })
})

describe("astroSearch", () => {
  it("spawns pagefind against the built site directory", async () => {
    const pagefindSitePath = await fs.mkdtemp(
      path.join(os.tmpdir(), "astro-search-site-"),
    )
    await fs.writeFile(
      path.join(pagefindSitePath, "index.html"),
      "<!doctype html><html><body><h1>Pagefind fixture</h1></body></html>",
      "utf-8",
    )
    const integration = astroSearch()
    const hook = integration.hooks["astro:build:done"]

    const hookOptions = {
      assets: new Map(),
      dir: pathToDirectoryURL(pagefindSitePath),
      logger: createIntegrationLogger("astro-search"),
      pages: [{ pathname: "/" }],
    } satisfies AstroBuildDoneHookOptions

    await hook?.(hookOptions)

    const outputFiles = [
      "pagefind-component-ui.css",
      "pagefind-component-ui.js",
      "pagefind-entry.json",
    ]

    for (const outputFile of outputFiles) {
      const file = await fs.stat(
        path.join(pagefindSitePath, "pagefind", outputFile),
      )
      expect(file.isFile()).toBe(true)
    }
  })
})
