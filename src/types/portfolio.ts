export interface SiteProfile {
  id?: number
  full_name: string
  headline: string
  subheadline: string
  bio: string
  avatar_url: string
  cv_url: string
  email: string
  phone: string
  location: string
  github_url: string
  linkedin_url: string
  twitter_url: string
  available_for_work: boolean
  updated_at?: string
}

export type SkillCategory = 'BACKEND' | 'FRONTEND' | 'DATABASE' | 'DEVOPS' | 'MOBILE' | 'DATA' | 'OTHER'

export interface Skill {
  id: number
  name: string
  category: SkillCategory
  category_display?: string
  level: number
  icon: string
  order: number
  is_visible: boolean
}

export type ExperienceType = 'WORK' | 'EDUCATION'

export interface Experience {
  id: number
  role: string
  company: string
  location: string
  entry_type: ExperienceType
  entry_type_display?: string
  start_date: string
  end_date: string
  is_current: boolean
  description: string
  highlights: string[]
  order: number
}

export interface Project {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  category: string
  cover_image: string
  gallery: string[]
  tech_stack: string[]
  repo_url: string
  demo_url: string
  docs_url: string
  is_featured: boolean
  is_published: boolean
  order: number
  created_at?: string
  updated_at?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  tags: string[]
  reading_time_minutes: number
  is_published: boolean
  published_at?: string | null
  author?: number | null
  author_name?: string
  created_at?: string
  updated_at?: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  is_archived: boolean
  created_at: string
}

export interface DashboardStats {
  projects_total: number
  projects_published: number
  skills_total: number
  experiences_total: number
  blog_posts_total: number
  blog_posts_published: number
  messages_total: number
  messages_unread: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
