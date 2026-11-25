<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { DashboardStats } from '@/types/portfolio'
import { FolderKanban, Cpu, Briefcase, BookOpen, Mail } from 'lucide-vue-next'

const stats = ref<DashboardStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    stats.value = await portfolioService.getStats()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="section-title">Panel General</h1>
    <p class="section-subtitle">Resumen en vivo del contenido almacenado en Supabase vía Django REST.</p>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" class="card">Cargando estadísticas...</div>
    <div v-else-if="stats" class="grid-3">
      <router-link to="/admin/proyectos" class="card stat-card">
        <FolderKanban :size="22" class="accent" />
        <div class="stat-val">{{ stats.projects_total }}</div>
        <div class="stat-lbl">Proyectos ({{ stats.projects_published }} publicados)</div>
      </router-link>
      <router-link to="/admin/habilidades" class="card stat-card">
        <Cpu :size="22" class="accent" />
        <div class="stat-val">{{ stats.skills_total }}</div>
        <div class="stat-lbl">Habilidades</div>
      </router-link>
      <router-link to="/admin/experiencia" class="card stat-card">
        <Briefcase :size="22" class="accent" />
        <div class="stat-val">{{ stats.experiences_total }}</div>
        <div class="stat-lbl">Experiencia y Educación</div>
      </router-link>
      <router-link to="/admin/blog" class="card stat-card">
        <BookOpen :size="22" class="accent" />
        <div class="stat-val">{{ stats.blog_posts_total }}</div>
        <div class="stat-lbl">Artículos ({{ stats.blog_posts_published }} publicados)</div>
      </router-link>
      <router-link to="/admin/mensajes" class="card stat-card">
        <Mail :size="22" class="accent" />
        <div class="stat-val">{{ stats.messages_unread }} / {{ stats.messages_total }}</div>
        <div class="stat-lbl">Mensajes sin leer / totales</div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  color: var(--text);
  text-decoration: none;
  transition: transform 0.16s ease, border-color 0.16s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  text-decoration: none;
}
.accent {
  color: var(--accent);
}
.stat-val {
  font-size: 1.9rem;
  font-weight: 800;
}
.stat-lbl {
  color: var(--text-muted);
  font-size: 0.88rem;
}
</style>
