<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Project } from '@/types/portfolio'
import { ExternalLink } from 'lucide-vue-next'

const projects = ref<Project[]>([])
const loading = ref(true)
const selectedCategory = ref('Todos')

const categories = computed(() => {
  const set = new Set(projects.value.map((p) => p.category))
  return ['Todos', ...Array.from(set)]
})

const filtered = computed(() => {
  if (selectedCategory.value === 'Todos') return projects.value
  return projects.value.filter((p) => p.category === selectedCategory.value)
})

onMounted(async () => {
  try {
    projects.value = await portfolioService.getProjects()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container">
    <h1 class="section-title">Proyectos</h1>
    <p class="section-subtitle">Explora mis trabajos de ingeniería, aplicaciones web, móviles y arquitecturas cloud.</p>

    <div class="filter-bar">
      <button
        v-for="cat in categories"
        :key="cat"
        class="btn btn-sm"
        :class="selectedCategory === cat ? 'btn-primary' : 'btn-secondary'"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" class="card">Cargando proyectos...</div>
    <div v-else class="grid-2">
      <article v-for="proj in filtered" :key="proj.id" class="card project-card">
        <img v-if="proj.cover_image" :src="proj.cover_image" :alt="proj.title" class="project-cover" />
        <div class="project-body">
          <div class="row">
            <span class="badge">{{ proj.category }}</span>
            <span v-if="proj.is_featured" class="badge badge-success">Destacado</span>
          </div>
          <h2>{{ proj.title }}</h2>
          <p class="muted">{{ proj.summary }}</p>
          <div class="row">
            <span v-for="t in proj.tech_stack" :key="t" class="badge badge-muted">{{ t }}</span>
          </div>
          <div class="row" style="margin-top: auto">
            <router-link :to="`/proyectos/${proj.slug}`" class="btn btn-primary btn-sm">Ver detalle</router-link>
            <a v-if="proj.demo_url" :href="proj.demo_url" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
              Demo <ExternalLink :size="14" />
            </a>
            <a v-if="proj.repo_url" :href="proj.repo_url" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
              Código <ExternalLink :size="14" />
            </a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.project-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.project-cover {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-bottom: 1px solid var(--border);
}
.project-body {
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}
.project-body h2 {
  margin: 0;
  font-size: 1.25rem;
}
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.muted {
  color: var(--text-muted);
  margin: 0;
}
</style>
