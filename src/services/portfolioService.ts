import http from '@/lib/http'
import type {
  SiteProfile,
  Skill,
  Experience,
  Project,
  ProjectMedia,
  BlogPost,
  ContactMessage,
  DashboardStats,
  PaginatedResponse,
} from '@/types/portfolio'

function unwrapList<T>(res: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(res) ? res : res?.results || []
}

export const portfolioService = {
  // Site Profile
  getProfile: () => http.get<SiteProfile>('/api/v1/portfolio/profile/'),
  updateProfile: (payload: Partial<SiteProfile>) => http.patch<SiteProfile>('/api/v1/portfolio/profile/', payload),

  // Dashboard stats
  getStats: () => http.get<DashboardStats>('/api/v1/portfolio/stats/'),

  // Skills
  getSkills: async () => unwrapList(await http.get<PaginatedResponse<Skill> | Skill[]>('/api/v1/portfolio/skills/')),
  createSkill: (payload: Partial<Skill>) => http.post<Skill>('/api/v1/portfolio/skills/', payload),
  updateSkill: (id: number, payload: Partial<Skill>) => http.patch<Skill>(`/api/v1/portfolio/skills/${id}/`, payload),
  deleteSkill: (id: number) => http.delete(`/api/v1/portfolio/skills/${id}/`),

  // Experience & Education
  getExperiences: async () =>
    unwrapList(await http.get<PaginatedResponse<Experience> | Experience[]>('/api/v1/portfolio/experiences/')),
  createExperience: (payload: Partial<Experience>) => http.post<Experience>('/api/v1/portfolio/experiences/', payload),
  updateExperience: (id: number, payload: Partial<Experience>) =>
    http.patch<Experience>(`/api/v1/portfolio/experiences/${id}/`, payload),
  deleteExperience: (id: number) => http.delete(`/api/v1/portfolio/experiences/${id}/`),

  // Projects
  getProjects: async (params?: Record<string, any>) =>
    unwrapList(await http.get<PaginatedResponse<Project> | Project[]>('/api/v1/portfolio/projects/', { params })),
  getProject: (slugOrId: string | number) => http.get<Project>(`/api/v1/portfolio/projects/${slugOrId}/`),
  createProject: (payload: Partial<Project>) => http.post<Project>('/api/v1/portfolio/projects/', payload),
  updateProject: (slugOrId: string | number, payload: Partial<Project>) =>
    http.patch<Project>(`/api/v1/portfolio/projects/${slugOrId}/`, payload),
  deleteProject: (slugOrId: string | number) => http.delete(`/api/v1/portfolio/projects/${slugOrId}/`),
  uploadProjectMedia: (slugOrId: string | number, files: File[], caption = '', isCover = false) => {
    const fd = new FormData()
    for (const f of files) {
      fd.append('files', f)
    }
    if (caption) fd.append('caption', caption)
    fd.append('is_cover', String(isCover))
    return http.postFormData<ProjectMedia[]>(`/api/v1/portfolio/projects/${slugOrId}/upload-media/`, fd)
  },
  updateProjectMedia: (slugOrId: string | number, mediaId: number, payload: Partial<ProjectMedia>) =>
    http.patch<ProjectMedia>(`/api/v1/portfolio/projects/${slugOrId}/media/${mediaId}/`, payload),
  deleteProjectMedia: (slugOrId: string | number, mediaId: number) =>
    http.delete(`/api/v1/portfolio/projects/${slugOrId}/media/${mediaId}/`),

  // Blog
  getPosts: async (params?: Record<string, any>) =>
    unwrapList(await http.get<PaginatedResponse<BlogPost> | BlogPost[]>('/api/v1/blog/posts/', { params })),
  getPost: (slugOrId: string | number) => http.get<BlogPost>(`/api/v1/blog/posts/${slugOrId}/`),
  createPost: (payload: Partial<BlogPost>) => http.post<BlogPost>('/api/v1/blog/posts/', payload),
  updatePost: (slugOrId: string | number, payload: Partial<BlogPost>) =>
    http.patch<BlogPost>(`/api/v1/blog/posts/${slugOrId}/`, payload),
  deletePost: (slugOrId: string | number) => http.delete(`/api/v1/blog/posts/${slugOrId}/`),

  // Contact messages
  sendContact: (payload: { name: string; email: string; subject: string; message: string }) =>
    http.post<ContactMessage>('/api/v1/contact/messages/', payload),
  getMessages: async () =>
    unwrapList(await http.get<PaginatedResponse<ContactMessage> | ContactMessage[]>('/api/v1/contact/messages/')),
  toggleMessageRead: (id: number) => http.post<ContactMessage>(`/api/v1/contact/messages/${id}/toggle_read/`),
  updateMessage: (id: number, payload: Partial<ContactMessage>) =>
    http.patch<ContactMessage>(`/api/v1/contact/messages/${id}/`, payload),
  deleteMessage: (id: number) => http.delete(`/api/v1/contact/messages/${id}/`),
}

export default portfolioService
