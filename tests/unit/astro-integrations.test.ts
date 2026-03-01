import { EventEmitter } from "node:events"
import * as fsPromises from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { describe, expect, it, vi } from "vitest"

const { spawnMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
}))

vi.mock("node:fs/promises", { spy: true })

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
}))

import config from "../../astro.config"

const integrations = (config.integrations ?? []).flat().filter(Boolean)

const findIntegration = (name: string) =>
  integrations.find(
    (
      integration,
    ): integration is { name: string; hooks: Record<string, unknown> } =>
      typeof integration === "object" &&
      integration !== null &&
      "name" in integration &&
      integration.name === name &&
      "hooks" in integration,
  )

type BuildDoneHook = (options: {
  logger?: {
    fork: (name: string) => {
      info: (message: string) => void
    }
  }
  dir?: URL
}) => Promise<void> | void

type BuildDoneLogger = NonNullable<Parameters<BuildDoneHook>[0]["logger"]>
type BuildDoneDir = NonNullable<Parameters<BuildDoneHook>[0]["dir"]>

const getBuildDoneHook = (
  integration: { hooks: Record<string, unknown> } | undefined,
) => {
  expect(integration).toBeDefined()
  const hook = integration!.hooks["astro:build:done"]
  expect(typeof hook).toBe("function")
  return hook as BuildDoneHook
}

const aboutHtmlPath = resolve("dist/about/index.html")
const fixtureHtmlPath = resolve("tests/fixtures/html-document/index.html")
const backupHtmlPath = resolve("dist/about/index.html.test-backup")

describe("astro-autolink-headings integration", () => {
  it("runs astroAutolinkHeadings build hook and writes processed HTML", async () => {
    const autolinkIntegration = findIntegration("astro-autolink-headings")
    const buildDoneHook = getBuildDoneHook(autolinkIntegration)

    let hadExistingAboutHtml = false
    try {
      await fsPromises.stat(aboutHtmlPath)
      hadExistingAboutHtml = true
    } catch {
      hadExistingAboutHtml = false
    }

    if (hadExistingAboutHtml) {
      await fsPromises.mkdir(dirname(backupHtmlPath), { recursive: true })
      await fsPromises.copyFile(aboutHtmlPath, backupHtmlPath)
    }

    await fsPromises.mkdir(dirname(aboutHtmlPath), { recursive: true })
    const fixtureHtml = await fsPromises.readFile(fixtureHtmlPath, {
      encoding: "utf-8",
    })
    await fsPromises.writeFile(aboutHtmlPath, fixtureHtml)

    const info = vi.fn()
    const logger: BuildDoneLogger = {
      fork: vi.fn().mockReturnValue({ info }),
    }

    let writtenHtml = ""
    try {
      await buildDoneHook({ logger })
      await vi.waitFor(async () => {
        const currentHtml = await fsPromises.readFile(aboutHtmlPath, {
          encoding: "utf-8",
        })
        expect(currentHtml).toContain("anchor-link")
        expect(currentHtml).toContain("heading-element")
        writtenHtml = currentHtml
      })

      expect(fsPromises.readFile).toHaveBeenCalledWith("./dist/about/index.html", {
        encoding: "utf-8",
      })
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        "./dist/about/index.html",
        expect.any(String),
      )
    } finally {
      if (hadExistingAboutHtml) {
        await fsPromises.copyFile(backupHtmlPath, aboutHtmlPath)
        await fsPromises.unlink(backupHtmlPath)
      } else {
        await fsPromises.rm(resolve("dist/about"), {
          recursive: true,
          force: true,
        })
      }
    }

    expect(writtenHtml).toContain("anchor-link")
    expect(writtenHtml).toContain("heading-element")
  })
})

describe("astro-search integration", () => {
  it("runs astroSearch build hook and executes pagefind with relative dist path", async () => {
    spawnMock.mockImplementationOnce(() => {
      const process = new EventEmitter()
      queueMicrotask(() => process.emit("close", 0))
      return process
    })

    const searchIntegration = findIntegration("astro-search")
    const buildDoneHook = getBuildDoneHook(searchIntegration)

    const dir: BuildDoneDir = new URL("../../dist/", import.meta.url)

    await buildDoneHook({
      dir,
    })

    expect(spawnMock).toHaveBeenCalledWith(
      "pagefind",
      ["--site", "dist"],
      expect.objectContaining({
        cwd: expect.any(String),
        shell: true,
        stdio: "inherit",
      }),
    )
  })
})
