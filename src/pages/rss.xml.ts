import { getContainerRenderer } from "@astrojs/mdx/container-renderer"
import rss, { type RSSFeedItem } from "@astrojs/rss"
import type { APIContext } from "astro"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { loadRenderers } from "astro:container"
import { getCollection, render } from "astro:content"
import { SITE } from "@consts"
import { prepareRssContent } from "../utils/rss"

export async function GET({ site }: APIContext) {
  if (!site) throw new Error("Configure a site URL to generate the RSS feed.")

  const collections = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getCollection("projects", ({ data }) => !data.draft),
    getCollection("work", ({ data }) => !data.draft),
  ])
  const entries = collections.flat().map((entry) => ({
    entry,
    pubDate:
      entry.collection === "blog"
        ? entry.data.datePublished
        : entry.data.dateStart,
  }))
  entries.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())

  const renderers = await loadRenderers([getContainerRenderer()])
  const container = await AstroContainer.create({ renderers })
  const items: RSSFeedItem[] = []

  for (const { entry, pubDate } of entries) {
    const link = `/${entry.collection}/${entry.id}/`
    const permalink = new URL(link, site)
    const { Content } = await render(entry)
    const html = await container.renderToString(Content, {
      request: new Request(permalink),
    })
    items.push({
      title: entry.data.title,
      description:
        entry.collection === "work"
          ? `Summary of ${SITE.TITLE}'s work at ${entry.data.title}.`
          : entry.data.description,
      pubDate,
      link,
      content: await prepareRssContent(html, permalink),
    })
  }

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site,
    items,
  })
}
