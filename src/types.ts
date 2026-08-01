export type Author = {
  NAME: string
  EMAIL: string
}

export type Site = {
  TITLE: string
  DESCRIPTION: string
  NUM_PROJECTS_ON_HOMEPAGE: number
  NUM_WORKS_ON_HOMEPAGE: number
}

export type Metadata = {
  TITLE: string
  DESCRIPTION: string
  HREF: string
}

export interface NavLink {
  TITLE: string
  HREF: string
}

export type NavLinks = NavLink[]

export type IconNames =
  | "arrow-bend-left-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "copy"
  | "file-doc"
  | "flask"
  | "gear"
  | "github-logo"
  | "info"
  | "linkedin-logo"
  | "lightbulb"
  | "magnifying-glass"
  | "microphone-stage"
  | "moon-stars"
  | "orcid-logo"
  | "paper-plane-tilt"
  | "pencil-line"
  | "read-cv-logo"
  | "rocket-launch"
  | "star"
  | "terminal-window"
  | "atom"
  | "cloud"
  | "code"
  | "heart"
  | "list"
  | "strategy"
  | "sun"
  | "test-tube"
  | "trophy"
  | "warning"
  | "warning-octagon"

export type IconPaths = Record<IconNames, string>

export interface Social extends NavLink {
  ICON: IconNames
}

export type Socials = Social[]

export interface VercelEnvironment {
  readonly [key: string]: string | boolean | undefined
  readonly VERCEL_ENV?: string | boolean | undefined
  readonly VERCEL_URL?: string | boolean | undefined
}
