export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_TYPE = "image/png"
export const OG_IMAGE_WIDTH = 1200

interface VercelEnvironment {
  readonly [key: string]: string | boolean | undefined
  readonly VERCEL_ENV?: string | boolean | undefined
  readonly VERCEL_URL?: string | boolean | undefined
}

const normalizePathname = (pathname: string | URL): string => {
  const path = pathname instanceof URL ? pathname.pathname : pathname
  const trimmedPath = path.replace(/\/+$/, "").replace(/^\/+/, "")
  return trimmedPath || "index"
}

const getVercelPreviewUrl = (env: VercelEnvironment): string | undefined => {
  if (env.VERCEL_ENV !== "preview" || typeof env.VERCEL_URL !== "string") {
    return undefined
  }

  const deploymentHost = env.VERCEL_URL.trim().replace(/^https?:\/\//, "")
  return deploymentHost ? `https://${deploymentHost}` : undefined
}

export const getOgImageRoute = (pathname: string | URL): string => {
  return `${normalizePathname(pathname)}.png`
}

export const getOgImagePath = (pathname: string | URL): string => {
  return `/og/${getOgImageRoute(pathname)}`
}

export const getOgImageBaseUrl = (
  fallback: string | URL,
  env: VercelEnvironment = import.meta.env,
): URL => {
  const previewUrl = getVercelPreviewUrl(env)
  return new URL(previewUrl ?? fallback)
}
