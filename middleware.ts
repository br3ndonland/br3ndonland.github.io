import { next, rewrite } from "@vercel/functions"
import { getMarkdownUrlPath } from "./src/utils/markdown.js"

const prefersMarkdown = (accept: string) => {
  const ranges = accept
    .toLowerCase()
    .split(",")
    .map((range) => {
      const [type, ...parameters] = range.trim().split(";")
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="))
      const value = quality ? Number(quality.slice(2)) : 1
      return {
        type: type?.trim(),
        quality: Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0,
      }
    })
  if (!ranges.some(({ type }) => type === "text/markdown")) return false

  const qualityFor = (type: string) => {
    for (const match of [type, "text/*", "*/*"]) {
      const matches = ranges.filter((range) => range.type === match)
      if (matches.length > 0) {
        return Math.max(...matches.map(({ quality }) => quality))
      }
    }
    return 0
  }

  const markdownQuality = qualityFor("text/markdown")
  const htmlQuality = qualityFor("text/html")
  return (
    markdownQuality > 0 &&
    (markdownQuality > htmlQuality ||
      (markdownQuality === htmlQuality &&
        !ranges.some(({ type }) => type === "text/html")))
  )
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  if (!["GET", "HEAD"].includes(request.method) || url.pathname.includes(".")) {
    return next()
  }

  const headers = { Vary: "Accept" }
  const markdownPath = getMarkdownUrlPath(url.pathname)
  if (markdownPath && prefersMarkdown(request.headers.get("Accept") ?? "")) {
    url.pathname = markdownPath
    return rewrite(url, { headers })
  }
  return next({ headers })
}

export const config = {
  matcher: ["/((?!_astro/|pagefind/|.*\\.).*)"],
}
