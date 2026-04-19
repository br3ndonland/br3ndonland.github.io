import type { AstroIntegration } from "astro"
import type { SatoriOptions } from "satori"
import createSatoriSvg from "satori"
import type { SharpOptions } from "sharp"

export type AstroOpenGraphTemplate = Parameters<typeof createSatoriSvg>[0]
export type AstroOpenGraphChild = AstroOpenGraphElement | string

export interface AstroOpenGraphElement {
  type: string
  props: {
    children?: AstroOpenGraphChild | AstroOpenGraphChild[]
    style?: Record<string, string>
    [prop: string]: unknown
  }
}

export interface AstroOpenGraphOptions {
  height: number
  template: AstroOpenGraphTemplate
  width: number
}

export type AstroOpenGraphSvgOptions = Omit<SatoriOptions, "height" | "width">

export interface AstroOpenGraphImageOptions {
  satori: AstroOpenGraphSvgOptions
  sharp?:
    | SharpOptions
    | ((params: { height: number; width: number }) => SharpOptions)
}

export interface AstroOpenGraphResponseOptions
  extends AstroOpenGraphImageOptions {
  response?: ResponseInit
}

export type AstroOpenGraphIntegration = (() => AstroIntegration) & {
  html: (
    template: string | TemplateStringsArray,
    ...expressions: unknown[]
  ) => AstroOpenGraphTemplate
  image: (options: AstroOpenGraphOptions) => {
    toImage: (options: AstroOpenGraphImageOptions) => Promise<Buffer>
    toResponse: (options: AstroOpenGraphResponseOptions) => Promise<Response>
    toSvg: (options: AstroOpenGraphSvgOptions) => Promise<string>
  }
}
