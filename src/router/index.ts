import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import storage from '@/lib/storage'

import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

import HomeView from '@/views/public/HomeView.vue'
import ProjectsView from '@/views/public/ProjectsView.vue'
import ProjectDetailView from '@/views/public/ProjectDetailView.vue'
import BlogView from '@/views/public/BlogView.vue'
import BlogDetailView from '@/views/public/BlogDetailView.vue'
import ContactView from '@/views/public/ContactView.vue'

import LoginView from '@/views/auth/LoginView.vue'

import AdminDashboardView from '@/views/admin/DashboardView.vue'
import AdminProfileView from '@/views/admin/SiteProfileView.vue'
import AdminProjectsView from '@/views/admin/ProjectsAdminView.vue'
import AdminSkillsView from '@/views/admin/SkillsAdminView.vue'
import AdminExperienceView from '@/views/admin/ExperienceAdminView.vue'
import AdminBlogView from '@/views/admin/BlogAdminView.vue'
import AdminMessagesView from '@/views/admin/MessagesAdminView.vue'
import AdminSecurityView from '@/views/admin/SecurityView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'Home', component: HomeView, meta: { title: 'Inicio' } },
      { path: 'proyectos', name: 'Projects', component: ProjectsView, meta: { title: 'Proyectos' } },
      { path: 'proyectos/:slug', name: 'ProjectDetail', component: ProjectDetailView, meta: { title: 'Detalle de Proyecto' } },
      { path: 'blog', name: 'Blog', component: BlogView, meta: { title: 'Blog Técnico' } },
      { path: 'blog/:slug', name: 'BlogDetail', component: BlogDetailView, meta: { title: 'Artículo' } },
      { path: 'contacto', name: 'Contact', component: ContactView, meta: { title: 'Contacto' } },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Acceso Administrativo' },
    beforeEnter: (_to, _from, next) => {
      if (storage.getToken()) {
        next('/admin')
      } else {
        next()
      }
    },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboardView, meta: { requiresAuth: true, title: 'Panel General' } },
      { path: 'perfil', name: 'AdminProfile', component: AdminProfileView, meta: { requiresAuth: true, title: 'Perfil & CV' } },
      { path: 'proyectos', name: 'AdminProjects', component: AdminProjectsView, meta: { requiresAuth: true, title: 'Proyectos' } },
      { path: 'habilidades', name: 'AdminSkills', component: AdminSkillsView, meta: { requiresAuth: true, title: 'Habilidades' } },
      { path: 'experiencia', name: 'AdminExperience', component: AdminExperienceView, meta: { requiresAuth: true, title: 'Experiencia y Educación' } },
      { path: 'blog', name: 'AdminBlog', component: AdminBlogView, meta: { requiresAuth: true, title: 'Blog' } },
      { path: 'mensajes', name: 'AdminMessages', component: AdminMessagesView, meta: { requiresAuth: true, title: 'Mensajes' } },
      { path: 'seguridad', name: 'AdminSecurity', component: AdminSecurityView, meta: { requiresAuth: true, title: 'Seguridad' } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} • Santiago Varela`
  }

  const token = storage.getToken()
  const user = storage.getUser()

  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!token) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    const requiredRoles = to.meta.roles as string[] | undefined
    if (requiredRoles && requiredRoles.length > 0) {
      const isSuperadmin = user?.role === 'SUPERADMIN' || user?.is_superuser
      if (!isSuperadmin && (!user?.role || !requiredRoles.includes(user.role))) {
        next('/admin')
        return
      }
    }
  }

  next()
})

export default router
