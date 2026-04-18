import type { HookParameters } from "astro"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import {
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
    debug: () => undefined,
    error: () => undefined,
    fork: () => logger,
    info: () => undefined,
    label,
    options: {
      dest: {
        write: () => true,
      },
      level: "info",
    },
    warn: () => undefined,
  }

  return logger
}

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
