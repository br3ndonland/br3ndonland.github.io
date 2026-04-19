export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_TYPE = "image/png"
export const OG_IMAGE_WIDTH = 1200

const normalizePathname = (pathname: string | URL): string => {
  const path = pathname instanceof URL ? pathname.pathname : pathname
  const trimmedPath = path.replace(/\/+$/, "").replace(/^\/+/, "")
  return trimmedPath || "index"
}

export const getOgImageRoute = (pathname: string | URL): string => {
  return `${normalizePathname(pathname)}.png`
}

export const getOgImagePath = (pathname: string | URL): string => {
  return `/og/${getOgImageRoute(pathname)}`
}
