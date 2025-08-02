import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      dateStart: z.coerce.date(),
      dateEnd: z.union([z.coerce.date(), z.string()]),
      image: z.object({
        src: image(),
        alt: z.string().default(""),
      }),
      description: z.string(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      URLdemo: z.string().optional(),
      URLdocs: z.string().optional(),
      URLrepo: z.string().optional(),
    }),
})

const work = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/work",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      dateStart: z.coerce.date(),
      dateEnd: z.union([z.coerce.date(), z.string()]),
      draft: z.boolean().default(false),
      image: z.object({
        src: image(),
        alt: z.string().default(""),
      }),
      roles: z.array(z.string()),
      tags: z.array(z.string()).default([]),
    }),
})

export const collections = { projects, work }
