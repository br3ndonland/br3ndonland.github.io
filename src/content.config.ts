import { defineCollection } from "astro:content"
import { file, glob } from "astro/loaders"
import { z } from "astro/zod"

const awesomeDiscCollection = z.object({
  id: z.string(),
  title: z.string(),
  url: z.url(),
})

const awesomeDiscRelease = z.object({
  format: z.enum(["Blu-ray", "UHD"]),
  distributor: z.string(),
  subLabel: z.string().optional(),
  date: z.iso.date(),
  url: z.url(),
  collection: awesomeDiscCollection.optional(),
})

const awesomeDiscUrl = z.object({
  type: z.enum(["IMDb", "TMDB", "Wikipedia"]),
  url: z.url(),
})

const awesomeDiscs = defineCollection({
  loader: file("./src/content/awesome-discs/awesome-discs.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    originalReleaseDate: z.iso.date(),
    urls: z.array(awesomeDiscUrl).length(3),
    releases: z.array(awesomeDiscRelease).min(1),
  }),
})

const publicImage = z.string().regex(/^\/images\/.+/)

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
        src: z.union([publicImage, image()]),
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

export const collections = { awesomeDiscs, projects, work }
