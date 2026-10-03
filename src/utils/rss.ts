import { ELEMENT_NODE, transform, walk } from "ultrahtml"
import sanitize from "ultrahtml/transformers/sanitize"

export async function prepareRssContent(html: string, permalink: URL) {
  return transform(html.replace(/^<!doctype html>/i, ""), [
    async (document) => {
      await walk(document, (node) => {
        if (node.type !== ELEMENT_NODE) return

        for (const attribute of ["href", "src", "poster"]) {
          const value = node.attributes[attribute]
          if (value) node.attributes[attribute] = new URL(value, permalink).href
        }
      })
      return document
    },
    sanitize({
      dropElements: ["script", "style", "link", "button"],
      // Feed readers can use the fallback image without responsive sources.
      dropAttributes: { srcset: ["*"], sizes: ["*"] },
    }),
  ])
}
