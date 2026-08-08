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
    - `## Description`: background and context on why the PR is needed. Do not summarize code changes in this section; that will be done in the next section.
    - `## Changes`: summarize changes using the imperative mood. Explain what will change and why. Unordered lists can be helpful here; preface the list in the imperative mood (e.g. "This PR will:"), then state each list item in the imperative mood (e.g. "Fix incorrect styling"). Place terminal output/log snippets in fenced code blocks inside HTML `<details><summary>...</summary> ... </details>` sections.
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
- Do not run local server or watch commands (for example, `astro dev`, `pnpm run dev`, `pnpm run start`, `pnpm run test:watch`, `python -m http.server`, or `vitest` without arguments). Instead, run `pnpm run build` to verify successful builds after making changes. Optionally, to serve the site after building, run `pnpm run preview`. Prompt the user before running `pnpm run preview` because this command also starts a server and the user should be aware that a server is running. If `pnpm run preview` is approved, stop the preview server before finishing the task.

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

### Awesome Discs collection

Awesome Disc metadata lives in `src/content/awesome-discs/awesome-discs.json` and is validated by the `awesomeDiscs` schema in `src/content.config.ts`. The project page derives its yearly lists from this data. Do not add a parallel hand-written list to `src/content/projects/awesome-discs.mdx`.

#### Minimum request input

- Require one full Blu-ray.com release page URL for each requested edition.
- Treat the film title and original release year as optional but recommended cross-checks. A request can be as simple as:

  ```text
  https://www.blu-ray.com/movies/Gilda-4K-Blu-ray/404721/
  ```

  A readable batch can use one release per line:

  ```text
  Gilda (1946): https://www.blu-ray.com/movies/Gilda-4K-Blu-ray/404721/
  Trouble in Paradise (1932): https://www.blu-ray.com/movies/Trouble-in-Paradise-4K-Blu-ray/404722/
  ```

- Do not require the user to supply wiki-link syntax, format, distributor, imprint, release date, IMDb ID, TMDB ID, or Wikipedia URL. Research these fields from the release page and film databases.
- Ask for clarification only when the supplied page cannot be accessed, does not identify the film or edition unambiguously, or does not establish the contents of a box set.

#### Research and data entry

1. Open the supplied Blu-ray.com page and confirm that it is the exact edition requested. Record its canonical URL, disc format, distributor or label, street date, and box-set contents when applicable. Do not infer these fields from the URL slug alone.
2. Search the existing JSON before adding anything. Match on the Blu-ray.com URL, title and year, IMDb ID, and TMDB ID. Add another `releases` item to an existing film instead of creating a duplicate film object.
3. Resolve the film separately from the physical release. Use the film's established display title, usually its canonical English-language title, rather than a translated Blu-ray.com listing or packaging title. Verify that title, year, director, and identifiers all refer to the same work or cut.
4. Use Wikidata as an identifier hub when possible. Confirm the IMDb title ID (`P345`), TMDB movie ID (`P4947`), linked English Wikipedia page, and candidate original release dates (`P577`) against IMDb, TMDB, and Wikipedia. Do not trust an identifier match based on title alone.
5. Add exactly one canonical URL of each type, in the existing order: `IMDb`, `TMDB`, and `Wikipedia`.
6. Build a stable film `id` from the established title and original release year using lowercase ASCII kebab-case, for example `gilda-1946`. Reuse an existing ID when adding another release. If two works would produce the same ID, add the smallest stable distinguishing qualifier.
7. Populate the physical release fields as follows:
   - Use `UHD` for a 4K Ultra HD release and `Blu-ray` for a standard Blu-ray.
   - Store the parent company or main label in `distributor` and a recurring imprint in `subLabel`. Follow existing spellings and pairings, such as:
     - `Powerhouse` / `Indicator`
     - `Shout! Factory` / `Scream Factory`
     - `Warner Bros.` / `Warner Archive Collection`
   - Store the exact street date for that edition in ISO `YYYY-MM-DD` format.
   - Keep distinct regional editions or distributors as distinct release objects, even when they concern the same film and year.
8. For a box set, create or update one film object for every included film. Give each corresponding release the same `collection` ID and title so the component groups them into one list item. Use a lowercase kebab-case collection ID ending in the release year. Reuse existing film objects and collection IDs where applicable.
9. Avoid exact duplicate releases. Within a film, treat the combination of release date, distributor, `subLabel`, and URL as the release identity. Keep new film and release objects near the existing chronological order without reordering unrelated data.

#### Resolving date conflicts

- Keep `originalReleaseDate` separate from the physical disc release `date`. The former identifies the film; the latter identifies the Blu-ray edition.
- For `originalReleaseDate`, use the earliest verified public premiere or exhibition of the same film or version. Include a documented festival premiere, but exclude production completion dates, private screenings, later regional openings, restorations, re-releases, and home-video dates.
- Classify apparently conflicting dates before choosing one. They may describe a festival premiere versus theatrical opening, different countries, a first part versus a complete version, or a substantially different cut. Do not assign the date of a source film to a compilation or recut released as a distinct work.
- Treat Wikidata dates as candidates, not automatic answers. Inspect `P577` precision, qualifiers, and references. Never convert a year-only value to January 1. Because January 1 can also be a legitimate premiere date, verify it rather than rejecting it automatically.
- Prefer a film archive, festival record, studio or distributor record, or another source with direct knowledge when IMDb, TMDB, Wikipedia, or Wikidata disagree. Use the database records and Wikipedia citations to locate and corroborate the strongest source.
- For a film first released in parts, use the first verified public release of the first part. For example, the collection records the July 10, 1970, Taiwanese first-part premiere of _A Touch of Zen_, not a year-only placeholder or the later international release.
- For a disc street-date conflict, distinguish regional editions first. If the same edition has genuinely conflicting dates, prefer the label or distributor's current official product information over an aggregator and note the discrepancy in the work summary.
- Do not guess when credible sources remain irreconcilable or only a year is known. Report the evidence and ask the user before adding a fabricated exact date. Briefly explain every non-obvious date decision when handing off the change.

#### Validation

- Confirm that each film has exactly one IMDb, one TMDB, and one Wikipedia URL.
- Confirm that every new release has a valid format, distributor, exact date, and Blu-ray.com URL, plus consistent collection metadata when applicable.
- Run the repository's required local validation after editing the collection.

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
