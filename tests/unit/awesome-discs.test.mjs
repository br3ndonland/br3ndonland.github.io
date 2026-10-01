import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { parse } from "node-html-parser"
import AwesomeDiscs from "../../src/components/AwesomeDiscs.astro"
import films from "../../src/content/awesome-discs/awesome-discs.json"
import { describe, expect, it } from "vitest"

describe("Awesome Discs collections", () => {
  it.each([false, true])(
    "preserves mixed formats with shared release URLs (reversed: %s)",
    async (reversed) => {
      const collectionId =
        "the-cinema-of-powell-and-pressburger-collection-two-2026"
      const collectionFilms = films
        .filter((film) =>
          film.releases.some(
            (release) => release.collection?.id === collectionId,
          ),
        )
        .map((film) => ({
          data: {
            ...film,
            releases: film.releases.filter(
              (release) => release.collection?.id === collectionId,
            ),
          },
        }))
      if (reversed) collectionFilms.reverse()

      const container = await AstroContainer.create()
      const html = await container.renderToString(AwesomeDiscs, {
        props: { films: collectionFilms },
      })
      const items = parse(html).querySelectorAll("li")

      expect(items).toHaveLength(1)
      expect(items[0].text).toContain("UHD/Blu-ray (Imprint 2026-09-09)")
      expect(items[0].querySelectorAll("a")).toHaveLength(9)
      for (const film of collectionFilms) {
        expect(items[0].text).toContain(film.data.title)
      }
    },
  )
})
