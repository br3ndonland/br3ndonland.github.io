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

interface NavLinkInterface {
  TITLE: string
  HREF: string
}

export type NavLink = NavLinkInterface

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
  | "linkedin-logo"
  | "microphone-stage"
  | "moon-stars"
  | "orcid-logo"
  | "paper-plane-tilt"
  | "pencil-line"
  | "read-cv-logo"
  | "rocket-launch"
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

export type IconPaths = Record<IconNames, string>

interface SocialInterface extends NavLink {
  TITLE: string
  HREF: string
  ICON: IconNames
}

export type Social = SocialInterface

export type Socials = Social[]
