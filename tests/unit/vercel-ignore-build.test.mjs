import { describe, expect, it } from "vitest"
import { shouldIgnoreBuild } from "../../scripts/vercel-ignore-build.mjs"

describe("shouldIgnoreBuild", () => {
  it.each([
    "[actions skip]",
    "[ci skip]",
    "[no ci]",
    "[skip actions]",
    "[skip ci]",
  ])("recognizes the GitHub Actions instruction %s", (instruction) => {
    expect(
      shouldIgnoreBuild(`Update documentation\n\nDetails ${instruction} here.`),
    ).toBe(true)
  })

  it.each(["skip-checks:true", "skip-checks: true"])(
    "recognizes the GitHub Actions trailer %s",
    (trailer) => {
      expect(shouldIgnoreBuild(`Update documentation\n\n\n${trailer}\n`)).toBe(
        true,
      )
    },
  )

  it("recognizes a final skip-checks trailer after other trailers", () => {
    expect(
      shouldIgnoreBuild(
        "Update documentation\n\n\nSigned-off-by: Example User\nskip-checks: true",
      ),
    ).toBe(true)
  })

  it.each([
    "Update documentation",
    "Update documentation [skip deploy]",
    "Update documentation\n\nskip-checks: true",
    "Update documentation\n\n\nskip-checks: false",
    "Update documentation\n\n\nskip-checks: true\nSigned-off-by: Example User",
  ])("continues the build for a message without an instruction", (message) => {
    expect(shouldIgnoreBuild(message)).toBe(false)
  })
})
