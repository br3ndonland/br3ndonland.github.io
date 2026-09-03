import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { ABOUT, HOME, PROJECTS, SITE, WORK } from "@consts"
import { getMarkdownUrlPath } from "../utils/markdown"

const plainText = (text: string) =>
  text
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const link = (title: string, pathname: string, description: string) => {
  const url = new URL(getMarkdownUrlPath(pathname)!, import.meta.env.SITE)
  const label = plainText(title).replace(/[\\[\]]/g, "\\$&")
  return `- [${label}](${url.href}): ${plainText(description)}`
}

export const GET: APIRoute = async () => {
  const [projects, work] = await Promise.all([
    getCollection("projects", ({ data }) => !data.draft),
    getCollection("work", ({ data }) => !data.draft),
  ])
  const sections = [
    "## Overview",
    [ABOUT, HOME, PROJECTS, WORK]
      .map(({ TITLE, HREF, DESCRIPTION }) => link(TITLE, HREF, DESCRIPTION))
      .join("\n"),
    "## Projects",
    projects
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
      .map(({ id, data }) =>
        link(data.title, `/projects/${id}`, data.description),
      )
      .join("\n"),
    "## Work",
    work
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
      .map(({ id, data }) =>
        link(data.title, `/work/${id}`, data.roles.join("; ")),
      )
      .join("\n"),
  ]
  const text = [
    `# ${SITE.TITLE}`,
    "> Personal website of Brendon Smith, covering his work, research, hobbies, and open source software projects.",
    "The links below provide Markdown versions of the site's pages. Each includes the canonical HTML URL in its frontmatter.",
    ...sections,
  ].join("\n\n")

  return new Response(`${text}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
