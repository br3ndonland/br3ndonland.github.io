import type { HookParameters } from "astro"
import { satteri } from "@astrojs/markdown-satteri"
import mdx from "@astrojs/mdx"
import astroExpressiveCode from "astro-expressive-code"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import {
  defineHastPlugin,
  type HastPluginEntry,
  markdownToHtml,
  mdxToJs,
} from "satteri"
import {
  astroOpenGraph,
  astroSearch,
  calloutIcons,
  markdownHastPlugins,
  satteriTableCaptions,
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

const renderMarkdown = async (
  content: string,
  extraPlugins: HastPluginEntry[] = [],
) => {
  const astro = {
    frontmatter: {},
    headings: [] as Array<{ depth: number; slug: string; text: string }>,
    localImagePaths: new Set<string>(),
    remoteImagePaths: new Set<string>(),
  }
  const result = await markdownToHtml(content, {
    data: { astro },
    features: { smartPunctuation: false },
    hastPlugins: [...markdownHastPlugins, ...extraPlugins],
  })
  return { code: result.html, headings: astro.headings }
}

describe("markdownHastPlugins", () => {
  it("adds anchor links after adding heading ids", async () => {
    const { code, headings } = await renderMarkdown(`## Research

## Research

### Methods

#### Results

##### Discussion

###### References`)

    expect(code).toContain(
      '<h2 id="research" class="heading-element" tabindex="-1">',
    )
    expect(code).toContain(
      '<a aria-label="Link to self" class="anchor-link" href="#research">',
    )
    expect(code).toContain('<h2 id="research-1"')
    for (const [depth, slug] of [
      [3, "methods"],
      [4, "results"],
      [5, "discussion"],
      [6, "references"],
    ] as const) {
      expect(code).toContain(
        `<h${depth} id="${slug}" class="heading-element" tabindex="-1">`,
      )
      expect(code).toContain(`href="#${slug}"`)
    }
    expect(headings).toEqual([
      { depth: 2, slug: "research", text: "Research" },
      { depth: 2, slug: "research-1", text: "Research" },
      { depth: 3, slug: "methods", text: "Methods" },
      { depth: 4, slug: "results", text: "Results" },
      { depth: 5, slug: "discussion", text: "Discussion" },
      { depth: 6, slug: "references", text: "References" },
    ])

    const secondDocument = await renderMarkdown("## Research")
    expect(secondDocument.code).toContain('<h2 id="research"')
    expect(secondDocument.code).not.toContain('id="research-2"')
  })

  it.each([
    ["CAUTION", "Caution", calloutIcons.caution],
    ["IMPORTANT", "Important", calloutIcons.important],
    ["NOTE", "Note", calloutIcons.note],
    ["TIP", "Tip", calloutIcons.tip],
    ["WARNING", "Warning", calloutIcons.warning],
  ])("renders %s callouts with a default title", async (type, title, icon) => {
    const { code } = await renderMarkdown(`> [!${type}]\n> Callout content`)

    expect(code).toContain(`class="callout callout-${type.toLowerCase()}"`)
    expect(code).toContain(`aria-label="${title}"`)
    expect(code).toContain(
      `class="callout-icon callout-icon-${icon}" fill="currentColor"`,
    )
    expect(code).toContain(`</svg>${title}</p>`)
    expect(code).toContain("<p>Callout content</p>")
  })

  it("renders a custom callout title and rich body content", async () => {
    const { code } = await renderMarkdown(`> [!TIP] Optional **callout title**
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

  it("renders nested callouts", async () => {
    const { code } = await renderMarkdown(`> [!NOTE] Outer title
> Outer content
>
> > [!TIP] Inner title
> > Inner content`)

    expect(code).toContain('class="callout callout-note"')
    expect(code).toContain('class="callout callout-tip"')
    expect(code).toContain('aria-label="Outer title"')
    expect(code).toContain('aria-label="Inner title"')
  })

  it("preserves ordinary and unsupported blockquotes", async () => {
    const { code } = await renderMarkdown(`> Ordinary quotation

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

  it("preserves code metadata and renders Expressive Code", async () => {
    let codeData: unknown
    const metadataProbe = defineHastPlugin({
      name: "code-metadata-probe",
      element: {
        filter: ["pre"],
        visit(node) {
          const code = node.children.find(
            (child) => child.type === "element" && child.tagName === "code",
          )
          codeData = code?.data
        },
      },
    })

    await renderMarkdown('```ts title="example.ts"\nconst value = 1\n```', [
      metadataProbe,
    ])

    expect(codeData).toMatchObject({
      lang: "ts",
      meta: 'title="example.ts"',
    })

    const processor = satteri({ hastPlugins: [] })
    const expressiveCode = astroExpressiveCode({ themes: ["dracula"] })
    const root = new URL("../../", import.meta.url)
    const logger = {
      debug() {},
      error() {},
      fork: () => logger,
      info() {},
      warn() {},
    }

    await expressiveCode.hooks["astro:config:setup"]?.({
      addWatchFile() {},
      command: "build",
      config: {
        base: "/",
        build: { assets: "_astro" },
        integrations: [expressiveCode, mdx()],
        markdown: { processor, shikiConfig: {} },
        root,
        srcDir: new URL("src/", root),
      },
      logger,
      updateConfig() {},
    } as never)

    const result = await markdownToHtml(
      '```ts title="example.ts"\nconst value = 1\n```',
      { hastPlugins: processor.options.hastPlugins },
    )

    expect(result.html).toContain('<div class="expressive-code">')
    expect(result.html).toContain('<figure class="frame has-title">')
    expect(result.html).toContain('<span class="title">example.ts</span>')
    expect(result.html).toContain('<pre data-language="ts">')
    expect(result.html).toContain('data-code="const value = 1"')
  })
})

describe("satteriTableCaptions", () => {
  it("wraps an uncaptioned Markdown table", async () => {
    const { code } = await renderMarkdown(`| Name | Value |
| --- | --- |
| Alpha | 1 |`)

    expect(code).toContain('<div class="table-scroll"><table>')
    expect(code).not.toContain("<caption>")
  })

  it("wraps an MDX table and moves its caption into the table", async () => {
    const result = mdxToJs(
      `<caption>Table: Fixture caption.</caption>

| Name | Value |
| --- | --- |
| Alpha | 1 |`,
      {
        elementAttributeNameCase: "html",
        hastPlugins: [satteriTableCaptions],
        jsx: true,
      },
    )

    expect(result.code).toContain('<_components.div class="table-scroll">')
    expect(result.code).toContain("<_components.table>")
    expect(result.code).toContain(
      '<_components.caption>{"Table: Fixture caption."}</_components.caption>',
    )
    expect(result.code.indexOf("<_components.caption>")).toBeLessThan(
      result.code.indexOf("<_components.thead>"),
    )
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
