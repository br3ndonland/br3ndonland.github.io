export const getMarkdownUrlPath = (pathname: string): string | undefined => {
  const absolutePath = pathname.startsWith("/") ? pathname : `/${pathname}`
  const normalizedPath =
    absolutePath.length > 1 ? absolutePath.replace(/\/+$/, "") : absolutePath

  if (normalizedPath === "/404" || normalizedPath === "/404.html") {
    return undefined
  }
  if (normalizedPath === "/") return "/index.md"
  if (normalizedPath.endsWith(".html")) {
    return `${normalizedPath.slice(0, -".html".length)}.md`
  }
  return `${normalizedPath}.md`
}
