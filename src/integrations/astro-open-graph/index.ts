import { html } from "./html.js"
import { image } from "./image.js"
import { createIntegration, integrationName } from "./integration.js"
import type { AstroOpenGraphIntegration } from "./types.js"

export const AstroOpenGraph = Object.assign(createIntegration, {
  html,
  image,
}) satisfies AstroOpenGraphIntegration

export { html, image, integrationName }
export type {
  AstroOpenGraphChild,
  AstroOpenGraphElement,
  AstroOpenGraphImageOptions,
  AstroOpenGraphIntegration,
  AstroOpenGraphOptions,
  AstroOpenGraphResponseOptions,
  AstroOpenGraphSvgOptions,
  AstroOpenGraphTemplate,
} from "./types.js"
