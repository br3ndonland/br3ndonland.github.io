import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

let htmlDir: string
let tempDir: string
let tempDirPath: string

describe("astroAutolinkHeadings", () => {
  beforeAll(async () => {
    htmlDir = path.resolve("tests", "fixtures", "html-document")
    tempDirPath = path.join(os.tmpdir(), "astro-autolink-headings-")
    tempDir = await fs.mkdtemp(tempDirPath)
    await fs.cp(htmlDir, tempDirPath, { errorOnExist: false, recursive: true })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
  })

  describe("WIP", () => {
    it("WIP", async () => {
      vi.spyOn(fs, "readFile")

      // TODO: replace with actual call to integration
      await fs.readFile(`${htmlDir}/index.html`)

      expect(fs.readFile).toHaveBeenCalledOnce()
    })
  })
})
