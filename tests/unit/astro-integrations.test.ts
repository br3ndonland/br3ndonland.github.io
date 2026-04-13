import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import {
  astroAutolinkHeadings,
  astroSearch,
  rehypeAutolinkOptions,
} from "../../astro.config"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let htmlDir: string
let tempDir: string
let tempDirPath: string

describe("astroAutolinkHeadings", () => {
  beforeEach(async () => {
    htmlDir = path.resolve("tests", "fixtures", "html-document")
    tempDirPath = path.join(os.tmpdir(), "astro-autolink-headings-")
    tempDir = await fs.mkdtemp(tempDirPath)
    await fs.cp(htmlDir, tempDir, { errorOnExist: false, recursive: true })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  it("adds ids and anchor links to h2-h6 headings", async () => {
    const integration = astroAutolinkHeadings({
      paths: [path.join(tempDir, "index.html")],
      rehypeAutolinkOptions,
    })
    const hook = integration.hooks["astro:build:done"]
    const logger = {
      fork: vi.fn(() => ({ info: vi.fn() })),
    }

    await hook?.({
      logger,
    } as unknown as Parameters<NonNullable<typeof hook>>[0])

    const output = await fs.readFile(path.join(tempDir, "index.html"), "utf-8")

    expect(output).toContain('h2 id="this-is-an-html-h2-heading"')
    expect(output).toContain('class="heading-element"')
    expect(output).toContain('class="anchor-link"')
    expect(output).toContain('aria-label="Link to self"')
    expect(output).toContain('class="anchor-icon"')
    expect(output).toContain('h1 id="this-is-an-html-h1-heading"')
    expect(output).not.toContain('href="#this-is-an-html-h1-heading"')
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

    await hook?.({
      assets: new Map(),
      dir: new URL(`file://${pagefindSitePath}/`),
      logger: {} as Parameters<NonNullable<typeof hook>>[0]["logger"],
      pages: [],
    })

    const entryFile = await fs.stat(
      path.join(pagefindSitePath, "pagefind", "pagefind-entry.json"),
    )
    expect(entryFile.isFile()).toBe(true)
  })
})
