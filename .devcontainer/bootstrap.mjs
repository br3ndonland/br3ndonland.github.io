#!/usr/bin/env node

import { spawnSync } from "node:child_process"

const log = (message) => {
  console.log(`[bootstrap] ${message}`)
}

const fail = (message) => {
  console.error(`[bootstrap] ERROR: ${message}`)
  process.exit(1)
}

const repo = process.argv[2]

if (!repo || !repo.includes("/")) {
  fail("Please supply a script argument in org/repo format.")
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`)
  }
}

const read = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`)
  }

  return result.stdout.trim()
}

const hasCommand = (command) => {
  const result = spawnSync(command, ["--version"], {
    stdio: "ignore",
  })

  return !result.error && result.status === 0
}

try {
  for (const command of ["git", "git-lfs", "corepack"]) {
    if (hasCommand(command)) {
      continue
    }

    fail(`${command} is required`)
  }

  log(`$PWD: ${process.cwd()}`)

  const defaultOriginUrl = `https://github.com/${repo}.git`
  const originUrl = read("git", [
    "config",
    "--local",
    "--default",
    "",
    "--get",
    "remote.origin.url",
  ])

  if (!originUrl) {
    log(`remote.origin.url is empty; setting it to ${defaultOriginUrl}`)
    run("git", ["config", "remote.origin.url", defaultOriginUrl])
  }

  log("Initializing Git LFS and pulling objects...")
  run("git", ["lfs", "install", "--local"])

  try {
    run("git", ["lfs", "pull"])
    log("Git LFS objects are ready")
  } catch {
    fail("git lfs pull failed")
  }

  log("Installing dependencies...")
  run("corepack", ["pnpm", "install", "--frozen-lockfile"], {
    env: {
      ...process.env,
      CI: "true",
    },
  })
  run("corepack", ["pnpm", "run", "astro", "telemetry", "disable"])
  log("Dependencies installed.")

  log("Running repository checks...")
  run("corepack", ["pnpm", "run", "check"])
  log("Checks complete.")

  log("Running production build...")
  run("corepack", ["pnpm", "run", "build"])
  log("Build complete.")

  log("Done.")
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
