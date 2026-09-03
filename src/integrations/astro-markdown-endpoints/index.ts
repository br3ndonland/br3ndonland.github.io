import type { AstroIntegration } from "astro"
import { HTMLElement, parse } from "node-html-parser"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { extname, join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

const excludedDirectories = new Set(["_astro", "pagefind"])
const ignoredSelectors = [
  "[aria-hidden='true']",
  "[data-markdown-ignore]",
  ".anchor-link",
  "button",
  "link",
  "noscript",
  "script",
  "style",
  "svg",
  "template",
].join(", ")

const toPosixPath = (path: string) => path.split(sep).join("/")

const isExcludedHtmlPath = (relativePath: string) => {
  const posixPath = toPosixPath(relativePath)
  const parts = posixPath.split("/")
  return (
    parts.some((part) => excludedDirectories.has(part)) ||
    posixPath === "404.html" ||
    posixPath === "404/index.html" ||
    posixPath.endsWith("/404/index.html")
  )
}

export const getMarkdownOutputPath = (htmlPath: string): string | undefined => {
  if (extname(htmlPath) !== ".html" || isExcludedHtmlPath(htmlPath)) {
    return undefined
  }

  const pathParts = htmlPath.split(sep)
  const fileName = pathParts.at(-1)

  if (fileName === "index.html") {
    if (pathParts.length === 1) return "index.md"
    return `${pathParts.slice(0, -1).join(sep)}.md`
  }

  return `${htmlPath.slice(0, -".html".length)}.md`
}

export const getCanonicalPath = (htmlPath: string): string => {
  const posixPath = toPosixPath(htmlPath)
  if (posixPath === "index.html") return "/"
  if (posixPath.endsWith("/index.html")) {
    return `/${posixPath.slice(0, -"index.html".length)}`
  }
  return `/${posixPath.slice(0, -".html".length)}`
}

const getMarkdownPath = (markdownOutputPath: string) =>
  `/${toPosixPath(markdownOutputPath)}`

const toAbsoluteUrl = (value: string, site: URL) => {
  if (!value.startsWith("/") || value.startsWith("//")) return value
  return new URL(value, site).href
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

const normalizeUrls = (body: HTMLElement, site: URL) => {
  for (const link of body.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href")
    if (href) link.setAttribute("href", toAbsoluteUrl(href, site))
  }

  for (const image of body.querySelectorAll("img[src]")) {
    const src = image.getAttribute("src")
    if (src) image.setAttribute("src", toAbsoluteUrl(src, site))

    const alt = image.getAttribute("alt")
    if (alt?.includes("<")) {
      image.setAttribute("alt", parse(alt).textContent.trim())
    }
  }
}

const prepareCards = (body: HTMLElement) => {
  for (const link of body.querySelectorAll("a.card")) {
    const title = link.querySelector(".title")?.textContent.trim()
    if (!title) continue
    const imageHtml = link.querySelector("img")?.outerHTML
    link.set_content(`${escapeHtml(title)}${imageHtml ? ` ${imageHtml}` : ""}`)
  }
}

const prepareTags = (body: HTMLElement) => {
  for (const container of body.querySelectorAll(".tags")) {
    const tags = container
      .querySelectorAll(".pill")
      .map((pill) => pill.textContent.trim())
      .filter(Boolean)
    if (tags.length === 0) continue
    container.set_content(
      `<ul>${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`,
    )
  }
}

const prepareLabeledLinks = (body: HTMLElement) => {
  for (const link of body.querySelectorAll("a[aria-label]")) {
    if (link.textContent.trim() || link.querySelector("img, picture")) continue
    const label = link.getAttribute("aria-label")
    if (label) link.set_content(label)
  }
}

const preserveTableCaptions = (body: HTMLElement) => {
  for (const caption of body.querySelectorAll("table > caption")) {
    const table = caption.parentNode
    if (!(table instanceof HTMLElement)) continue
    table.insertAdjacentHTML("beforebegin", `<p>${caption.innerHTML}</p>`)
    caption.remove()
  }
}

const getCodeText = (pre: HTMLElement) => {
  const codeRoot = parse(pre.innerHTML)
  const lines = codeRoot.querySelectorAll(".ec-line")
  if (lines.length > 0) {
    return lines
      .map((line) => line.querySelector(".code")?.textContent ?? "")
      .join("\n")
  }
  return codeRoot.querySelector("code")?.textContent ?? codeRoot.textContent
}

const prepareExpressiveCode = (body: HTMLElement) => {
  for (const pre of body.querySelectorAll("pre[data-language]")) {
    pre.set_content(getCodeText(pre))
  }
}

const getCodeFence = (code: string) => {
  const longestRun = Math.max(
    0,
    ...Array.from(code.matchAll(/`+/g), ([match]) => match.length),
  )
  return "`".repeat(Math.max(3, longestRun + 1))
}

const createTurndownService = () => {
  const service = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
    strongDelimiter: "**",
  })
  service.use(gfm)
  service.addRule("compactListItem", {
    filter: "li",
    replacement: (content, node, options) => {
      const parent = node.parentElement
      let prefix = `${options.bulletListMarker} `
      if (parent?.nodeName === "OL") {
        const start = parent.getAttribute("start")
        const index = Array.from(parent.children).indexOf(node)
        prefix = `${start ? Number(start) + index : index + 1}.  `
      }

      const hasTrailingNewline = /\n$/.test(content)
      const trimmedContent = content.replace(/^\n+/, "").replace(/\n+$/, "")
      const normalizedContent =
        `${trimmedContent}${hasTrailingNewline ? "\n" : ""}`.replaceAll(
          "\n",
          `\n${" ".repeat(prefix.length)}`,
        )
      return `${prefix}${normalizedContent}${node.nextSibling ? "\n" : ""}`
    },
  })
  service.addRule("expressiveCode", {
    filter: (node) =>
      node.nodeName === "PRE" && node.hasAttribute("data-language"),
    replacement: (_content, node) => {
      const code = node.textContent.replace(/\n$/, "")
      const language = node.getAttribute("data-language") ?? ""
      const fence = getCodeFence(code)
      return `\n\n${fence}${language}\n${code}\n${fence}\n\n`
    },
  })
  return service
}

const quoteYaml = (value: string) => JSON.stringify(value)

interface MarkdownPageOptions {
  canonicalUrl: URL
  html: string
  markdownUrl: URL
  site: URL
}

const renderMarkdownPage = ({
  canonicalUrl,
  html,
  markdownUrl,
  site,
}: MarkdownPageOptions) => {
  const document = parse(html)
  const body = document.querySelector("body")
  if (!body) throw new Error(`No body found for ${canonicalUrl.href}`)

  const description = document
    .querySelector('meta[name="description"]')
    ?.getAttribute("content")
    ?.trim()

  for (const element of body.querySelectorAll(ignoredSelectors)) {
    element.remove()
  }
  const headingTitle = document.querySelector("h1")?.textContent.trim()
  const documentTitle = document.querySelector("title")?.textContent.trim()
  const title =
    canonicalUrl.pathname === "/"
      ? documentTitle || headingTitle || canonicalUrl.pathname
      : headingTitle || documentTitle || canonicalUrl.pathname
  prepareCards(body)
  prepareTags(body)
  prepareLabeledLinks(body)
  preserveTableCaptions(body)
  prepareExpressiveCode(body)
  normalizeUrls(body, site)

  const frontmatter = [
    "---",
    `title: ${quoteYaml(title)}`,
    ...(description ? [`description: ${quoteYaml(description)}`] : []),
    `canonical_url: ${quoteYaml(canonicalUrl.href)}`,
    `md_url: ${quoteYaml(markdownUrl.href)}`,
    "---",
  ].join("\n")
  const markdown = createTurndownService().turndown(body.innerHTML).trim()
  return {
    canonicalUrl,
    description,
    markdown: `${frontmatter}\n\n${markdown}\n`,
    markdownUrl,
    title,
  }
}

export const createMarkdownPage = (options: MarkdownPageOptions): string =>
  renderMarkdownPage(options).markdown

const plainText = (text: string) =>
  text
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const createLlmsTxt = (
  pages: ReturnType<typeof renderMarkdownPage>[],
  site: URL,
) => {
  const homepage = pages.find(
    ({ canonicalUrl }) => canonicalUrl.pathname === "/",
  )
  const sections = new Map<string, typeof pages>()

  for (const page of pages) {
    const parts = page.markdownUrl.pathname.split("/").filter(Boolean)
    const section = parts.length > 1 ? parts[0]! : ""
    const entries = sections.get(section) ?? []
    entries.push(page)
    sections.set(section, entries)
  }

  const index = [
    `# ${plainText(homepage?.title ?? site.hostname)}`,
    ...(homepage?.description ? [`> ${plainText(homepage.description)}`] : []),
    "The links below provide Markdown versions of the site's pages. Each includes the canonical HTML URL in its frontmatter.",
  ]
  for (const [section, entries] of [...sections].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const sectionPage = pages.find(
      ({ markdownUrl }) => markdownUrl.pathname === `/${section}.md`,
    )
    const title = section
      ? (sectionPage?.title ??
        section.charAt(0).toUpperCase() + section.slice(1))
      : "Overview"
    index.push(
      `## ${plainText(title)}`,
      entries
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(({ description, markdownUrl, title }) => {
          const label = plainText(title).replace(/[\\[\]]/g, "\\$&")
          const summary = description ? `: ${plainText(description)}` : ""
          return `- [${label}](${markdownUrl.href})${summary}`
        })
        .join("\n"),
    )
  }
  return `${index.join("\n\n")}\n`
}

const findHtmlFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return findHtmlFiles(path)
      return entry.isFile() && entry.name.endsWith(".html") ? [path] : []
    }),
  )
  return files.flat().sort()
}

export const generateMarkdownPages = async (outputDir: string, site: URL) => {
  const htmlFiles = await findHtmlFiles(outputDir)
  const pages: ReturnType<typeof renderMarkdownPage>[] = []

  for (const htmlFile of htmlFiles) {
    const relativeHtmlPath = relative(outputDir, htmlFile)
    const markdownOutputPath = getMarkdownOutputPath(relativeHtmlPath)
    if (!markdownOutputPath) continue

    const canonicalUrl = new URL(getCanonicalPath(relativeHtmlPath), site)
    const markdownUrl = new URL(getMarkdownPath(markdownOutputPath), site)
    const html = await readFile(htmlFile, "utf8")
    const page = renderMarkdownPage({
      canonicalUrl,
      html,
      markdownUrl,
      site,
    })
    const markdownFile = join(outputDir, markdownOutputPath)
    await writeFile(markdownFile, page.markdown, "utf8")
    pages.push(page)
  }

  await writeFile(
    join(outputDir, "llms.txt"),
    createLlmsTxt(pages, site),
    "utf8",
  )
  return pages.length
}

export const astroMarkdownEndpoints = (): AstroIntegration => {
  let site: URL | undefined

  return {
    name: "astro-markdown-endpoints",
    hooks: {
      "astro:config:done": ({ config }) => {
        site = config.site ? new URL(config.site) : undefined
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (!site) throw new Error("Astro site URL is required")
        const outputDir = fileURLToPath(dir)
        const count = await generateMarkdownPages(outputDir, site)
        logger.info(`Generated ${count} Markdown pages and llms.txt`)
      },
    },
  }
}
