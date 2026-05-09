import type { HookParameters } from "astro"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import {
  astroOpenGraph,
  astroAutolinkHeadings,
  astroSearch,
  rehypeAutolinkOptions,
} from "../../astro.config"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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

let htmlDir: string
let outDir: string
let outDirPath: string

describe("astroAutolinkHeadings", () => {
  beforeEach(async () => {
    htmlDir = path.resolve("tests", "fixtures", "html-document")
    outDirPath = path.join(os.tmpdir(), "astro-autolink-out-dir-")
    outDir = await fs.mkdtemp(outDirPath)
    await fs.cp(htmlDir, path.join(outDir, "about"), {
      errorOnExist: false,
      recursive: true,
    })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  it("adds ids and anchor links to h2-h6 headings", async () => {
    const integration = astroAutolinkHeadings({
      paths: ["about/index.html"],
      rehypeAutolinkOptions,
    })
    const hook = integration.hooks["astro:build:done"]
    const htmlPath = path.join(outDir, "about", "index.html")
    const logger = createIntegrationLogger("astro-autolink-headings")
    const forkSpy = vi.spyOn(logger, "fork")
    const infoSpy = vi.spyOn(logger, "info")

    const hookOptions = {
      assets: new Map(),
      dir: pathToDirectoryURL(outDir),
      logger,
      pages: [{ pathname: "/about/" }],
    } satisfies AstroBuildDoneHookOptions

    await hook?.(hookOptions)

    const output = await fs.readFile(htmlPath, "utf-8")

    expect(forkSpy).toHaveBeenCalledWith("astro-autolink-headings/build")
    expect(infoSpy).toHaveBeenCalledWith(`Processing ${htmlPath}`)
    expect(output).toContain('h2 id="this-is-an-html-h2-heading"')
    expect(output).toContain('class="heading-element"')
    expect(output).toContain('class="anchor-link"')
    expect(output).toContain('aria-label="Link to self"')
    expect(output).toContain('class="anchor-icon"')
    expect(output).toContain('h1 id="this-is-an-html-h1-heading"')
    expect(output).not.toContain('href="#this-is-an-html-h1-heading"')
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

    const entryFile = await fs.stat(
      path.join(pagefindSitePath, "pagefind", "pagefind-entry.json"),
    )
    expect(entryFile.isFile()).toBe(true)
  })
})
