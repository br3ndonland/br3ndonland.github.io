import { satteriHeadingIdsPlugin } from "@astrojs/markdown-satteri"
import type { HastPluginEntry } from "satteri"
import { calloutIcons, satteriCallouts } from "./callouts"
import { satteriAutolinkHeadings } from "./heading-links"
import { satteriTableCaptions } from "./table-captions"

export {
  calloutIcons,
  satteriAutolinkHeadings,
  satteriCallouts,
  satteriTableCaptions,
}

export const markdownHastPlugins = [
  satteriCallouts,
  // Keep this factory before autolinking so IDs and slug state are document-scoped.
  satteriHeadingIdsPlugin,
  satteriAutolinkHeadings,
  satteriTableCaptions,
] satisfies HastPluginEntry[]
