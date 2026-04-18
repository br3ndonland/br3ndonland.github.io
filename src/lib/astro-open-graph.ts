import type { AstroIntegration } from "astro"
import type { SatoriOptions } from "satori"
import createSatoriSvg from "satori"
import sharp, { type SharpOptions } from "sharp"

type SatoriTemplate = Parameters<typeof createSatoriSvg>[0]
type AstroOpenGraphChild = AstroOpenGraphElement | string

interface AstroOpenGraphElement {
  type: string
  props: {
    children?: AstroOpenGraphChild | AstroOpenGraphChild[]
    style?: Record<string, string>
    [prop: string]: unknown
  }
}

interface AstroOpenGraphOptions {
  height: number
  template: SatoriTemplate
  width: number
}

type AstroOpenGraphSvgOptions = Omit<SatoriOptions, "height" | "width">

interface AstroOpenGraphImageOptions {
  satori: AstroOpenGraphSvgOptions
  sharp?:
    | SharpOptions
    | ((params: { height: number; width: number }) => SharpOptions)
}

interface AstroOpenGraphResponseOptions extends AstroOpenGraphImageOptions {
  response?: ResponseInit
}

const openGraphRootStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
}

const openGraphVoidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])

const decodeOpenGraphEntities = (value: string): string => {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
}

const toOpenGraphStyleName = (name: string): string => {
  return name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
}

const splitOpenGraphCss = (cssText: string, separator: string): string[] => {
  const parts: string[] = []
  let current = ""
  let depth = 0
  let quote: string | undefined

  for (const char of cssText) {
    if (quote) {
      current += char
      if (char === quote) {
        quote = undefined
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      current += char
      continue
    }

    if (char === "(") {
      depth += 1
    } else if (char === ")" && depth > 0) {
      depth -= 1
    }

    if (char === separator && depth === 0) {
      parts.push(current)
      current = ""
      continue
    }

    current += char
  }

  parts.push(current)
  return parts
}

const parseOpenGraphStyle = (styleText: string): Record<string, string> => {
  return splitOpenGraphCss(styleText, ";").reduce<Record<string, string>>(
    (style, declaration) => {
      const [name = "", ...valueParts] = splitOpenGraphCss(declaration, ":")
      const value = valueParts.join(":").trim()
      if (!name.trim() || !value) {
        return style
      }

      style[toOpenGraphStyleName(name.trim())] = decodeOpenGraphEntities(value)
      return style
    },
    {},
  )
}

const parseOpenGraphAttributes = (
  attributesText: string,
): AstroOpenGraphElement["props"] => {
  const props: AstroOpenGraphElement["props"] = { children: [] }
  const attributePattern =
    /([A-Za-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match: RegExpExecArray | null

  while ((match = attributePattern.exec(attributesText))) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match
    if (!name) {
      continue
    }

    const value = doubleQuoted ?? singleQuoted ?? unquoted ?? "true"
    if (name === "style") {
      props.style = parseOpenGraphStyle(value)
    } else {
      props[name] = decodeOpenGraphEntities(value)
    }
  }

  return props
}

const appendOpenGraphChild = (
  parent: AstroOpenGraphElement,
  child: AstroOpenGraphChild,
) => {
  if (!Array.isArray(parent.props.children)) {
    parent.props.children =
      parent.props.children === undefined ? [] : [parent.props.children]
  }
  parent.props.children.push(child)
}

const isOpenGraphElement = (
  child: AstroOpenGraphChild,
): child is AstroOpenGraphElement => {
  return typeof child === "object" && child !== null && "props" in child
}

const normalizeOpenGraphElement = (
  element: AstroOpenGraphElement,
): AstroOpenGraphElement => {
  if (!Array.isArray(element.props.children)) {
    return element
  }

  const children = element.props.children
    .filter((child) => child !== "")
    .map((child) =>
      isOpenGraphElement(child) ? normalizeOpenGraphElement(child) : child,
    )

  element.props.children =
    children.length === 1 && typeof children[0] === "string"
      ? children[0]
      : children

  return element
}

const stringifyOpenGraphTemplate = (
  template: string | TemplateStringsArray,
  expressions: unknown[],
): string => {
  if (typeof template === "string") {
    return template
  }

  return template.reduce((markup, part, index) => {
    return `${markup}${part}${String(expressions[index] ?? "")}`
  }, "")
}

const astroOpenGraphHtml = (
  template: string | TemplateStringsArray,
  ...expressions: unknown[]
): SatoriTemplate => {
  const markup = stringifyOpenGraphTemplate(template, expressions).trim()
  const root: AstroOpenGraphElement = {
    type: "div",
    props: {
      style: openGraphRootStyle,
      children: [],
    },
  }
  const stack = [root]
  const tokenPattern = /<!--[\s\S]*?-->|<!doctype[\s\S]*?>|<\/?[^>]+>|[^<]+/gi
  let match: RegExpExecArray | null

  while ((match = tokenPattern.exec(markup))) {
    const [token] = match
    const parent = stack.at(-1)
    if (!parent || token.startsWith("<!--") || /^<!doctype/i.test(token)) {
      continue
    }

    if (token.startsWith("</")) {
      stack.pop()
      continue
    }

    if (token.startsWith("<")) {
      const isSelfClosing = token.endsWith("/>")
      const tagText = token.slice(1, isSelfClosing ? -2 : -1).trim()
      const tagNameMatch = tagText.match(/^([^\s/>]+)/)
      const tagName = tagNameMatch?.[1]
      if (!tagName) {
        continue
      }

      const attributesText = tagText.slice(tagName.length)
      const element: AstroOpenGraphElement = {
        type: tagName,
        props: parseOpenGraphAttributes(attributesText),
      }
      appendOpenGraphChild(parent, element)

      if (!isSelfClosing && !openGraphVoidElements.has(tagName)) {
        stack.push(element)
      }
      continue
    }

    const text = decodeOpenGraphEntities(token).replace(/\s+/g, " ").trim()
    if (text) {
      appendOpenGraphChild(parent, text)
    }
  }

  return normalizeOpenGraphElement(root) as SatoriTemplate
}

const astroOpenGraphImage = ({
  height,
  template,
  width,
}: AstroOpenGraphOptions) => {
  const toSvg = async (options: AstroOpenGraphSvgOptions): Promise<string> => {
    return await createSatoriSvg(template, { ...options, height, width })
  }

  const toImage = async ({
    satori: satoriOptions,
    sharp: sharpOptionsInput,
  }: AstroOpenGraphImageOptions): Promise<Buffer> => {
    const sharpOptions =
      typeof sharpOptionsInput === "function"
        ? sharpOptionsInput({ height, width })
        : sharpOptionsInput
    const svg = await toSvg(satoriOptions)

    return await sharp(Buffer.from(svg), sharpOptions)
      .resize(width, height)
      .png()
      .toBuffer()
  }

  const toResponse = async ({
    response,
    ...options
  }: AstroOpenGraphResponseOptions): Promise<Response> => {
    const image = await toImage(options)

    return new Response(new Uint8Array(image), {
      ...response,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": image.byteLength.toString(),
        "Content-Type": "image/png",
        ...response?.headers,
      },
    })
  }

  return { toImage, toResponse, toSvg }
}

export const AstroOpenGraph = Object.assign(
  (): AstroIntegration => {
    const integrationName = "astro-open-graph"
    return { hooks: {}, name: integrationName }
  },
  {
    html: astroOpenGraphHtml,
    image: astroOpenGraphImage,
  },
)
