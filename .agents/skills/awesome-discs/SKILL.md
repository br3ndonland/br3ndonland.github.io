---
name: awesome-discs
description: Add one or more Blu-ray.com releases to this repository's Awesome Discs collection. Use when the user supplies release URLs, asks to add Awesome Discs entries, or begins a prompt with /awesome-discs or /ad. Do not use for general film recommendations or reviews.
---

# Awesome Discs

Add films and physical releases to `src/content/awesome-discs/awesome-discs.json`. The collection schema lives in `src/content.config.ts`, and `src/components/AwesomeDiscs.astro` derives the yearly lists. Do not add a parallel hand-written list to `src/content/projects/awesome-discs.mdx`.

## Authorization

- Work in the current local workspace by default.
- Do not commit, push, open or update a pull request, or perform another external write unless the user explicitly approves that action.
- Use read-only web research as needed to identify films and releases.
- Keep edits scoped to the collection unless the user requests a broader change or the current schema cannot represent the release.

## Inputs

- Require one full Blu-ray.com release page URL for each requested edition.
- Accept URLs following `/awesome-discs`, `/ad`, or `$awesome-discs`, whether separated by spaces or newlines.
- Treat a supplied film title and original release year as optional cross-checks. Do not require wiki-link syntax, format, distributor, imprint, release date, IMDb ID, TMDB ID, or Wikipedia URL.
- Ask for clarification only when a page cannot be accessed, does not identify the film or edition unambiguously, or does not establish a box set's contents.

Example minimum request:

```text
$awesome-discs https://www.blu-ray.com/movies/Gilda-4K-Blu-ray/404721/
```

Example readable batch:

```text
/ad Gilda (1946): https://www.blu-ray.com/movies/Gilda-4K-Blu-ray/404721/
Trouble in Paradise (1932): https://www.blu-ray.com/movies/Trouble-in-Paradise-4K-Blu-ray/404722/
```

## Research and data entry

1. Inspect `src/content.config.ts`, the existing JSON, and the relevant rendering code before editing. Follow the current schema and established values rather than relying only on these instructions.
2. Open each supplied Blu-ray.com page and confirm that it is the requested edition. Record its canonical URL, disc format, distributor or label, street date, and box-set contents when applicable. Do not infer these fields from the URL slug alone.
3. Search the existing JSON before adding anything. Match on Blu-ray.com URL, title and year, IMDb ID, and TMDB ID. Add another `releases` item to an existing film instead of creating a duplicate film object.
4. Resolve the film separately from the physical release. Use the film's established display title, usually its canonical English-language title, rather than a translated Blu-ray.com listing or packaging title. Verify that title, year, director, and identifiers refer to the same work or cut.
5. Use Wikidata as an identifier hub when possible. Confirm the IMDb title ID (`P345`), TMDB movie ID (`P4947`), linked English Wikipedia page, and candidate original release dates (`P577`) against IMDb, TMDB, and Wikipedia. Do not trust a match based on title alone.
6. Add exactly one canonical URL of each type in this order: `IMDb`, `TMDB`, and `Wikipedia`.
7. Build a stable film `id` from the established title and original release year using lowercase ASCII kebab-case, for example `gilda-1946`. Reuse an existing ID when adding another release. If two works would produce the same ID, add the smallest stable distinguishing qualifier.
8. Populate physical release fields as follows:
   - Use `UHD` for 4K Ultra HD and `Blu-ray` for standard Blu-ray.
   - Store the parent company or main label in `distributor` and a recurring imprint in `subLabel`.
   - Search existing metadata before introducing a distributor or `subLabel` spelling. Reuse canonical values such as `Criterion Collection`, or established pairings such as `Powerhouse` / `Indicator`, `Shout! Factory` / `Scream Factory`, and `Warner Bros.` / `Warner Archive Collection`.
   - Store the exact street date for that edition as `YYYY-MM-DD`.
   - Keep distinct regional editions or distributors as distinct release objects, even for the same film and release year.
9. For a box set, create or update one film object for every included film. Give each corresponding release the same `collection` ID and title so the component groups them into one item. Use a lowercase kebab-case collection ID ending in the release year. Reuse existing film objects and collection IDs where applicable.
10. Avoid exact duplicate releases. Within a film, treat release date, distributor, `subLabel`, and URL together as the release identity. Keep new film and release objects near the existing chronological order without reordering unrelated data.

## Resolve date conflicts

- Keep `originalReleaseDate` separate from the physical release `date`. The former identifies the film; the latter identifies the Blu-ray edition.
- For `originalReleaseDate`, use the earliest verified public premiere or exhibition of the same film or version. Include a documented festival premiere. Exclude production completion dates, private screenings, later regional openings, restorations, re-releases, and home-video dates.
- Classify apparently conflicting dates before choosing one. They may describe a festival premiere versus a theatrical opening, different countries, a first part versus a complete version, or a substantially different cut. Do not assign a source film's date to a compilation or recut released as a distinct work.
- Treat Wikidata dates as candidates, not automatic answers. Inspect `P577` precision, qualifiers, and references. Never convert a year-only value to January 1. Because January 1 can be legitimate, verify it rather than rejecting it automatically.
- Prefer film archives, festival records, studio or distributor records, and other sources with direct knowledge when IMDb, TMDB, Wikipedia, or Wikidata disagree. Use database records and Wikipedia citations to locate and corroborate the strongest source.
- For a film first released in parts, use the first verified public release of the first part. For example, the collection records the July 10, 1970, Taiwanese first-part premiere of _A Touch of Zen_, not a year-only placeholder or the later international release.
- For a disc street-date conflict, distinguish regional editions first. For a genuine conflict within the same edition, prefer the label or distributor's current official product information over an aggregator.
- Do not fabricate an exact date when credible sources remain irreconcilable or only a year is known. Report the evidence and ask the user. Explain every non-obvious date decision in the handoff.

## Validate and hand off

- Confirm that every film has exactly one IMDb, one TMDB, and one Wikipedia URL.
- Confirm that every new release has a valid format, distributor, exact date, and Blu-ray.com URL, plus consistent collection metadata when applicable.
- Run `pnpm run check`, `pnpm run build`, and `pnpm run test` after editing.
- Summarize added or updated films, source URLs, validation results, and any conflict decisions. State that changes remain local and uncommitted unless the user authorized otherwise.
