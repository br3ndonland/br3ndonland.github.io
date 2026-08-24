/* Align Vercel Ignored Build Step with GitHub

Vercel deployment checks are enabled for the project. Vercel waits for GitHub
Actions checks to finish before deploying. The problem with this is that Vercel
and GitHub have different behaviors for skipping CI runs. GitHub supports skip
terms like "skip ci" and will not run Actions on commits that have those terms.
Vercel does not respect those terms, so it will begin deployments and wait for
GitHub Actions checks that aren't going to run.

This script is used in Ignored Build Step (`ignoreCommand` in `vercel.json`) so
that Vercel respects the same skip terms as GitHub.

- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs
- https://vercel.com/docs/deployment-checks
- https://vercel.com/docs/project-configuration/project-settings#ignored-build-step
- https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel
- https://github.com/vercel/community/discussions/60
*/

import { execFileSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const skipInstructions = [
  "[actions skip]",
  "[ci skip]",
  "[no ci]",
  "[skip actions]",
  "[skip ci]",
]

export function shouldIgnoreBuild(commitMessage) {
  const normalizedMessage = commitMessage.replace(/\r\n/g, "\n").trimEnd()

  if (
    skipInstructions.some((instruction) =>
      normalizedMessage.includes(instruction),
    )
  ) {
    return true
  }

  const trailerSeparator = normalizedMessage.lastIndexOf("\n\n\n")
  if (trailerSeparator === -1) {
    return false
  }

  const trailerLines = normalizedMessage.slice(trailerSeparator + 3).split("\n")
  const lastTrailer = trailerLines.at(-1) ?? ""

  return /^skip-checks: ?true$/.test(lastTrailer)
}

function main() {
  // Read from git log. $VERCEL_GIT_COMMIT_MESSAGE is truncated to 2048 bytes.
  // https://vercel.com/docs/environment-variables/system-environment-variables
  const commitMessage = execFileSync("git", ["log", "-1", "--format=%B"], {
    encoding: "utf8",
  })

  if (shouldIgnoreBuild(commitMessage)) {
    console.log("GitHub Actions skip instruction found. Skipping Vercel build.")
    return 0
  }

  console.log(
    "No GitHub Actions skip instruction found. Continuing Vercel build.",
  )
  return 1
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = main()
}
