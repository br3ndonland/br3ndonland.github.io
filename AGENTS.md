# AGENTS.md

Instructions for coding agents working in this repository.

## Project Overview

- Personal website built with Astro.
- Package manager: `pnpm`.
- Primary source directories:
  - `src/components/` (UI components)
  - `src/layouts/` (layout templates)
  - `src/pages/` (routes)
  - `src/content/` (project/work content)
  - `src/styles/` (global styles)
  - `public/` (static assets)

## Ground Rules

- Keep changes focused and minimal; avoid broad refactors unless requested.
- Follow existing formatting and naming patterns.
- Do not add licenses/headers unless explicitly requested.
- Do not create commits on `main`; work on a feature branch.
- Preserve content authorship style in `src/content/**`.

## Required Local Validation

Run these commands from repository root before opening a PR:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run build
pnpm run test
```

Notes:

- `pnpm run check` runs Prettier, cspell, and `astro check`.
- Build should succeed without changing deployment configuration.

## CI Expectations

GitHub Actions workflow: `.github/workflows/ci.yml`

- Triggers on pull requests and pushes to `main`.
- CI job performs:
  - checkout (with Git LFS)
  - pnpm + Node setup from repo variables
  - `pnpm install --frozen-lockfile`
  - `pnpm run check`
  - `pnpm run build --site "https://${GITHUB_REPOSITORY##*/}"`

Keep contributions compatible with this sequence.

## Content and Assets

- Prefer editing existing content files rather than moving directories.
- Keep frontmatter valid for markdown/MDX content in `src/content/**`.
- If cspell flags accepted technical terms (for example, framework-specific words), add them to `cspell.json`; do not add misspellings.
- When adding images/assets:
  - place route-served static files in `public/`
  - use `src/images/` for source images processed in Astro where appropriate
- Respect Git LFS usage for large media assets.

## Dependency and Tooling Changes

- Do not downgrade dependencies unless explicitly asked.
- Keep dependency updates scoped and justified.
- If dependency changes are made, run full validation (`check`, `build`, `test`).

## Pull Request Guidance

- Use a descriptive branch name and small, reviewable diffs.
- Include a concise PR description:
  - what changed
  - why it changed
  - how it was validated (commands + results)
- If PR creation is blocked by repository restrictions, report the exact GitHub/CLI error message.

## Agent Workflow for This Repo

1. Read relevant files first (`README.md`, `package.json`, CI workflow, and touched modules).
2. Implement minimal, targeted changes.
3. Run validation commands.
4. Commit on a non-`main` branch.
5. Open a PR (or report exact error if repo settings prevent it).
6. Wait for required status checks to complete.
7. Ensure the PR passes all required status checks; if checks fail, read logs and add commits to fix the failing checks.
