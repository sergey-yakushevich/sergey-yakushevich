export type SocialLink = {
  name: string
  url: string
  icon: "github" | "linkedin" | "globe" | "mail"
}

export type Stat = {
  value: number
  suffix: string
  label: string
}

export type SkillGroup = {
  label: string
  chips: string[]
  signal?: boolean
}

export type WorkEntry = {
  company: string
  link: string
  title: string
  start: string
  end: string
  badges: string[]
  description: string[]
  more?: string[]
}

export type Project = {
  title: string
  techStack: string[]
  link: { label: string; href: string } | null
  placeholder?: boolean
}

export type Education = {
  school: string
  degree: string
  start: string
  end: string
}

export type Resume = {
  name: string
  initials: string
  headline: string
  languages: string
  location: string
  locationLink: string
  email: string
  available: boolean
  availabilityLabel: string
  social: SocialLink[]
  bio: string[]
  stats: Stat[]
  skillGroups: SkillGroup[]
  work: WorkEntry[]
  education: Education[]
  projects: Project[]
}

export type PostSummary = {
  slug: string
  title: string
  summary: string
  date: string
  dateLabel: string
  readingTime: string
  tags: string[]
  coverImage: string | null
  draft: boolean
  url: string
}

export type PostDetail = PostSummary & {
  html: string
}

export type SharedProps = {
  resume: Resume
  avatarUrl: string | null
  [key: string]: unknown
}
