import { type AstroIntegration, type HookParameters } from "astro"
import { defineConfig } from "astro/config"
import { satteri } from "@astrojs/markdown-satteri"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import astroExpressiveCode from "astro-expressive-code"
import { spawn } from "node:child_process"
import { dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { astroMarkdownEndpoints } from "./src/integrations/astro-markdown-endpoints/index"
import { astroOpenGraph } from "./src/integrations/astro-open-graph/index"
import { markdownHastPlugins } from "./src/plugins/satteri/index"

export { astroOpenGraph } from "./src/integrations/astro-open-graph/index"

export const astroSearch = (): AstroIntegration => {
  const integrationName = "astro-search"
  return {
    name: integrationName,
    hooks: {
      "astro:build:done": ({ dir }: HookParameters<"astro:build:done">) => {
        const targetDir = fileURLToPath(dir)
        const cwd = dirname(fileURLToPath(import.meta.url))
        const relativeDir = relative(cwd, targetDir)
        return new Promise<void>((resolve) => {
          spawn("pagefind", ["--site", relativeDir], {
            stdio: "inherit",
            shell: true,
            cwd,
          }).on("close", () => resolve())
        })
      },
    },
  }
}

export default defineConfig({
  integrations: [
    astroExpressiveCode({
      frames: {
        showCopyToClipboardButton: true,
      },
      styleOverrides: {
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "var(--text-sm)",
      },
      themes: ["dracula"],
    }),
    astroOpenGraph(),
    astroSearch(),
    mdx(),
    sitemap(),
    astroMarkdownEndpoints(),
  ],
  markdown: {
    processor: satteri({
      features: { smartPunctuation: false },
      hastPlugins: markdownHastPlugins,
    }),
  },
  prefetch: true,
  site: "https://www.bws.bio",
})
