# AGENTS.md

Instructions for coding agents working in this repository.

## Project overview

- Personal website built with Astro.
- Package manager: `pnpm`.
- Primary source directories:
  - `src/components/` (UI components)
  - `src/layouts/` (layout templates)
  - `src/pages/` (routes)
  - `src/content/` (project/work content)
  - `src/styles/` (global styles)
  - `public/` (static assets)

## Working agreements

### Output

- Use ASCII characters only in all written output, code comments, commit messages, and documentation. Forbidden characters include em/en dashes (— –), curly quotes (“ ” ‘ ’), ellipses (…), or other non-ASCII Unicode. Prefer plain ASCII equivalents at all times. The only exceptions to this rule are box-drawing characters (├, └, │, ─) in tree diagrams.
- Default to pragmatic, concise communication.
- Keep edits minimal and well-scoped; explain changes.
- Prefer local context; use the web only when needed.
- Make safe assumptions; ask only when necessary.
- Follow existing formatting and naming patterns.
- Sort lists alphabetically by default unless there is a clear reason not to.
- Do not add licenses/headers unless explicitly requested.
- Preserve content authorship style in `src/content/**`.

### Git commits

- Do not create Git commits on `main`; always work on a feature branch.
- Do not Git push to `main`; always push to a feature branch.
- Use descriptive branch names such as `test-astro-integrations`.
- Format Git commit messages in the following style:

  ```text
  Imperative commit title limited to 50 characters

  Begin by describing how the code works now and why a change is needed.
  The commit message body can be detailed. Full paragraphs are acceptable.
  Lines in commit message paragraphs should be limited to 72 characters.

  Summarize changes by saying "This commit will" and using the imperative.

  - The end of the commit message should have a list of references.
  - Add an unordered list item for each URL.
  - Do not hard wrap URLs. URLs can exceed 72 characters if needed.
  ```

### GitHub pull requests

- Always open GitHub pull requests in draft mode.
- Each time a new commit is pushed to a pull request branch, check the pull request title and description and update them if needed to match the current state of the pull request.
- Format GitHub pull request titles and descriptions in the following style:
  - Limit the PR title to around 50 characters so it fits into a squash commit title.
  - Include a concise PR description with these sections:
    - `## Description`: background and context on why the PR is needed.
    - `## Changes`: summarize changes by saying "This PR will" and using the imperative in each sentence. Explain what will change and why. Place terminal output/log snippets in fenced code blocks inside HTML `<details><summary>...</summary> ... </details>` sections.
    - `## Related`: unordered list of links to related resources. Do not link the PR to itself.
  - In the PR description, GitHub autolinked references should be used to refer to issues, PRs, commits, GitHub security advisories, and other supported links. GitHub permanent links to code snippets (permalinks) should be used when referencing code in the same repository as the PR. Permalinks should be on separate lines so they render properly. Non-GitHub URLs should be formatted as Markdown links with descriptive titles (no bare URLs).
  - Format the PR body with Prettier using the equivalent command-line overrides so the text wraps at 72 characters for use in squash commit messages:
    ```sh
    echo "<pr-body>" | pnpm exec prettier --parser markdown --print-width 72 --prose-wrap always
    ```

### MCP servers

- Always use the Astro MCP server to answer questions about Astro and search the Astro documentation (docs.astro.build).

## Required local validation

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
- Do not run development server commands in agent mode (for example, `astro dev`, `pnpm run dev`, `pnpm run start`, `pnpm run test:watch`, or `vitest` without arguments). Instead, run `pnpm run build` to inspect changes.

## CI expectations

GitHub Actions workflow: `.github/workflows/ci.yml`

- Triggers on pull requests and pushes to `main`.
- CI job performs:
  - checkout (with Git LFS)
  - pnpm + Node setup from repo variables
  - `pnpm install --frozen-lockfile`
  - `pnpm run check`
  - `pnpm run build --site "https://${GITHUB_REPOSITORY##*/}"`

Keep contributions compatible with this sequence.

## Content and assets

- Media assets and other large files in this repository are stored with Git LFS.
- Git LFS is installed separately from Git. If the `git-lfs` command is not available, prompt the user to install it first.
- After cloning the repository, download LFS objects:
  ```sh
  git lfs install
  git lfs pull
  ```
- Prefer editing existing content files rather than moving directories.
- Keep frontmatter valid for markdown/MDX content in `src/content/**`.
- If cspell flags accepted technical terms (for example, framework-specific words), add them to `cspell.json`; do not add misspellings.
- When adding images/assets:
  - place route-served static files in `public/`
  - use `src/images/` for source images processed in Astro where appropriate

## Dependency and tooling changes

- Do not downgrade dependencies unless explicitly asked.
- If dependency changes are made, run `pnpm dedupe` and full validation (`check`, `build`, `test`).
- Keep dependency updates scoped and justified.
- To update Astro and related dependencies, run `pnpm -s dlx @astrojs/upgrade && pnpm dedupe`.

## Agent workflow for this repo

1. Read relevant files first (`README.md`, `package.json`, CI workflow, and touched modules).
2. Implement minimal, targeted changes.
3. Run validation commands.
4. Commit on a non-`main` branch.
5. Open a PR (or report exact error if repo settings prevent it).
6. Wait for required status checks to complete.
7. Ensure the PR passes all required status checks; if checks fail, read logs and add commits to fix the failing checks.
