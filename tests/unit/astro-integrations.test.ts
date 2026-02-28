import { EventEmitter } from "node:events"
import { describe, expect, it, vi } from "vitest"

const { readFileMock, writeFileMock, spawnMock } = vi.hoisted(() => ({
  readFileMock: vi.fn(),
  writeFileMock: vi.fn(),
  spawnMock: vi.fn(),
}))

vi.mock("node:fs/promises", () => ({
  readFile: readFileMock,
  writeFile: writeFileMock,
}))

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

describe("Astro integrations in astro.config.ts", () => {
  it("runs astroAutolinkHeadings build hook and writes processed HTML", async () => {
    readFileMock.mockResolvedValueOnce('<h2 id="about">About</h2>')
    writeFileMock.mockResolvedValueOnce(undefined)

    const autolinkIntegration = findIntegration("astro-autolink-headings")

    const buildDoneHook = getBuildDoneHook(autolinkIntegration)

    const info = vi.fn()
    const logger: BuildDoneLogger = {
      fork: vi.fn().mockReturnValue({ info }),
    }

    await buildDoneHook({ logger })
    await vi.waitFor(() => {
      expect(writeFileMock).toHaveBeenCalledTimes(1)
    })

    expect(readFileMock).toHaveBeenCalledWith("./dist/about/index.html", {
      encoding: "utf-8",
    })
    const writtenHtml = writeFileMock.mock.calls[0]?.[1]
    expect(writtenHtml).toContain("anchor-link")
    expect(writtenHtml).toContain("heading-element")
  })

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
