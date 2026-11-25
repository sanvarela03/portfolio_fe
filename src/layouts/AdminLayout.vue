<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Cpu,
  Briefcase,
  BookOpen,
  Mail,
  Shield,
  LogOut,
  ExternalLink,
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  auth.fetchMe()
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="sidebar-header">
        <strong>Portfolio Admin</strong>
        <span class="badge">{{ auth.user?.role_display || 'Admin' }}</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" exact-active-class="active">
          <LayoutDashboard :size="18" /> Resumen
        </router-link>
        <router-link to="/admin/perfil" active-class="active">
          <User :size="18" /> Perfil & CV
        </router-link>
        <router-link to="/admin/proyectos" active-class="active">
          <FolderKanban :size="18" /> Proyectos
        </router-link>
        <router-link to="/admin/habilidades" active-class="active">
          <Cpu :size="18" /> Habilidades
        </router-link>
        <router-link to="/admin/experiencia" active-class="active">
          <Briefcase :size="18" /> Experiencia
        </router-link>
        <router-link to="/admin/blog" active-class="active">
          <BookOpen :size="18" /> Blog
        </router-link>
        <router-link to="/admin/mensajes" active-class="active">
          <Mail :size="18" /> Mensajes
        </router-link>
        <router-link to="/admin/seguridad" active-class="active">
          <Shield :size="18" /> Seguridad
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-name">{{ auth.displayName }}</div>
          <div class="user-email">{{ auth.user?.email }}</div>
        </div>
        <div class="sidebar-actions">
          <router-link to="/" class="btn btn-secondary btn-sm">
            <ExternalLink :size="15" /> Ver sitio
          </router-link>
          <button class="btn btn-danger btn-sm" @click="handleLogout">
            <LogOut :size="15" /> Salir
          </button>
        </div>
      </div>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
}
.sidebar {
  background: var(--bg-elev);
  border-right: 1px solid var(--border);
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0 0.5rem;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: var(--text-muted);
  font-weight: 500;
  text-decoration: none;
}
.sidebar-nav a:hover,
.sidebar-nav a.active {
  background: var(--accent-soft);
  color: var(--accent);
}
.sidebar-footer {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}
.user-email {
  font-size: 0.78rem;
  color: var(--text-muted);
  word-break: break-all;
}
.sidebar-actions {
  display: flex;
  gap: 0.5rem;
}
.admin-main {
  padding: 2rem;
  max-width: 1100px;
  width: 100%;
}
@media (max-width: 860px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
