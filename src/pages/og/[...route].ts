import type { APIRoute, GetStaticPaths, ImageMetadata } from "astro"
import { getCollection } from "astro:content"
import { readFile } from "node:fs/promises"
import { extname, join } from "node:path"
import sharp from "sharp"
import defaultImage from "@images/brendon-smith-portrait-2025-07-15-1920.jpg"
import { ABOUT, HOME, PROJECTS, SITE, WORK } from "@consts"
import { AstroOpenGraph } from "../../lib/astro-open-graph"
import { getOgImageRoute, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "../../lib/og"

type OgImageSource = ImageMetadata | string

type ImageMetadataWithFsPath = ImageMetadata & {
  fsPath?: string
}

interface OgPage {
  description: string
  image?: OgImageSource | undefined
  pathname: string
  route: string
  title: string
}

interface OgRouteProps extends Record<string, unknown> {
  page: OgPage
}

const DEFAULT_IMAGE_FILE = join(
  process.cwd(),
  "src/images/brendon-smith-portrait-2025-07-15-1920.jpg",
)

const FONT_FILES = {
  mono: join(process.cwd(), "public/fonts/RecursiveMonoDuotone-Regular.ttf"),
  sansBold: join(
    process.cwd(),
    "public/fonts/RecursiveSansCasualStatic-Bold.ttf",
  ),
  sansRegular: join(
    process.cwd(),
    "public/fonts/RecursiveSansLinearStatic-Regular.ttf",
  ),
} as const

const withRoute = (page: Omit<OgPage, "route">): OgPage => {
  return { ...page, route: getOgImageRoute(page.pathname) }
}

const normalizeText = (text: string): string => {
  return text
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

const escapeHtml = (text: string): string => {
  return normalizeText(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

const getImageFilePath = (
  source: OgImageSource | undefined,
): string | undefined => {
  if (!source) {
    return undefined
  }

  if (typeof source === "string") {
    return source.startsWith("/")
      ? join(process.cwd(), "public", source)
      : source
  }

  return (source as ImageMetadataWithFsPath).fsPath
}

const getImageDataUri = async (
  source: OgImageSource | undefined,
): Promise<string> => {
  const imageFile = getImageFilePath(source) ?? DEFAULT_IMAGE_FILE
  const imageBuffer = await readFile(imageFile)
  const isSvg = extname(imageFile).toLowerCase() === ".svg"
  const resizedImage = await sharp(imageBuffer, { density: 192 })
    .resize(432, 432, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: isSvg ? "contain" : "cover",
    })
    .png()
    .toBuffer()

  return `data:image/png;base64,${resizedImage.toString("base64")}`
}

const getFontData = async () => {
  const [sansRegular, sansBold, mono] = await Promise.all([
    readFile(FONT_FILES.sansRegular),
    readFile(FONT_FILES.sansBold),
    readFile(FONT_FILES.mono),
  ])

  return [
    {
      name: "Recursive Sans",
      data: sansRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Recursive Sans",
      data: sansBold,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Recursive Mono",
      data: mono,
      weight: 400 as const,
      style: "normal" as const,
    },
  ]
}

const getStaticPages = (): OgPage[] => {
  return [
    withRoute({
      pathname: "/default",
      title: SITE.TITLE,
      description: SITE.DESCRIPTION,
      image: defaultImage,
    }),
    withRoute({
      pathname: HOME.HREF,
      title: SITE.TITLE,
      description: HOME.DESCRIPTION,
      image: defaultImage,
    }),
    withRoute({
      pathname: ABOUT.HREF,
      title: `${SITE.TITLE}: ${ABOUT.TITLE}`,
      description: ABOUT.DESCRIPTION,
      image: defaultImage,
    }),
    withRoute({
      pathname: PROJECTS.HREF,
      title: `${SITE.TITLE}: ${PROJECTS.TITLE}`,
      description: PROJECTS.DESCRIPTION,
      image: defaultImage,
    }),
    withRoute({
      pathname: WORK.HREF,
      title: `${SITE.TITLE}: ${WORK.TITLE}`,
      description: WORK.DESCRIPTION,
      image: defaultImage,
    }),
    withRoute({
      pathname: "/404",
      title: "404 Not Found",
      description: "404 Not Found - this page was not found",
      image: defaultImage,
    }),
  ]
}

const getOgPages = async (): Promise<OgPage[]> => {
  const projects = await getCollection("projects")
  const work = await getCollection("work")

  return [
    ...getStaticPages(),
    ...projects.map((entry) =>
      withRoute({
        pathname: `${PROJECTS.HREF}/${entry.id}`,
        title: `${SITE.TITLE}: ${PROJECTS.TITLE} - ${entry.data.title}`,
        description: `Summary of ${SITE.TITLE}'s project ${entry.data.title}.`,
        image: entry.data.image.src,
      }),
    ),
    ...work.map((entry) =>
      withRoute({
        pathname: `${WORK.HREF}/${entry.id}`,
        title: `${SITE.TITLE}: ${WORK.TITLE} - ${entry.data.title}`,
        description: `Summary of ${SITE.TITLE}'s work at ${entry.data.title}.`,
        image: entry.data.image.src,
      }),
    ),
  ]
}

const getTitleSize = (title: string): number => {
  if (title.length > 58) {
    return 48
  }
  if (title.length > 42) {
    return 56
  }
  return 66
}

const getDescriptionSize = (description: string): number => {
  return description.length > 96 ? 26 : 30
}

const getTemplate = async (page: OgPage) => {
  const host = new URL(import.meta.env.SITE).host
  const imageDataUri = await getImageDataUri(page.image)
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const titleSize = getTitleSize(title)
  const descriptionSize = getDescriptionSize(description)

  return AstroOpenGraph.html`<div
    style="background: #f3f4f7; color: #090b11; display: flex; font-family: Recursive Sans; height: 100%; width: 100%;"
  >
    <div
      style="background: #ffffff; border-left: 18px solid #7611a6; display: flex; flex-direction: column; height: 100%; justify-content: space-between; padding: 66px 54px 52px 66px; width: 58%;"
    >
      <div style="display: flex; flex-direction: column; gap: 26px;">
        <p
          style="color: #505d84; font-family: Recursive Mono; font-size: 25px; line-height: 1;"
        >
          ${escapeHtml(SITE.TITLE)}
        </p>
        <h1
          style="color: #090b11; font-size: ${titleSize}px; font-weight: 700; line-height: 1.03; margin: 0;"
        >
          ${title}
        </h1>
        <p
          style="color: #283044; font-size: ${descriptionSize}px; line-height: 1.28; margin: 0;"
        >
          ${description}
        </p>
      </div>
      <p
        style="color: #6474a2; font-family: Recursive Mono; font-size: 23px; line-height: 1; margin: 0;"
      >
        ${escapeHtml(host)}
      </p>
    </div>
    <div
      style="align-items: center; background: #e3e6ee; display: flex; height: 100%; justify-content: center; padding: 48px 60px 48px 42px; width: 42%;"
    >
      <div
        style="align-items: center; background: #ffffff; border: 1px solid #c3cadb; border-radius: 8px; display: flex; height: 458px; justify-content: center; width: 458px;"
      >
        <img
          src="${imageDataUri}"
          height="432"
          width="432"
          style="border-radius: 8px; height: 432px; width: 432px;"
        />
      </div>
    </div>
  </div>`
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getOgPages()
  return pages.map((page) => ({
    params: { route: page.route },
    props: { page },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { page } = props as OgRouteProps

  return await AstroOpenGraph.image({
    height: OG_IMAGE_HEIGHT,
    template: await getTemplate(page),
    width: OG_IMAGE_WIDTH,
  }).toResponse({
    satori: {
      fonts: await getFontData(),
    },
  })
}
