import createSatoriSvg from "satori"
import sharp from "sharp"
import type {
  AstroOpenGraphImageOptions,
  AstroOpenGraphOptions,
  AstroOpenGraphResponseOptions,
  AstroOpenGraphSvgOptions,
} from "./types.js"

export const image = ({ height, template, width }: AstroOpenGraphOptions) => {
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
