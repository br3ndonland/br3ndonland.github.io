import type { AstroIntegration } from "astro"

export const integrationName = "astro-open-graph"

export const createIntegration = (): AstroIntegration => {
  return { hooks: {}, name: integrationName }
}
