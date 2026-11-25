<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import portfolioService from '@/services/portfolioService'
import type { Project } from '@/types/portfolio'
import { ArrowLeft, ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const project = ref<Project | null>(null)
const activeImage = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const slug = route.params.slug as string
    project.value = await portfolioService.getProject(slug)
    activeImage.value = project.value.cover_image || project.value.gallery?.[0] || ''
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container">
    <router-link to="/proyectos" class="btn btn-secondary btn-sm" style="margin-bottom: 1.5rem">
      <ArrowLeft :size="15" /> Volver a proyectos
    </router-link>

    <div v-if="loading" class="card">Cargando...</div>
    <div v-else-if="project" class="card detail-card">
      <span class="badge">{{ project.category }}</span>
      <h1 style="margin: 0.75rem 0 0.5rem">{{ project.title }}</h1>
      <p class="muted">{{ project.summary }}</p>

      <div v-if="activeImage" class="gallery">
        <img :src="activeImage" :alt="project.title" class="gallery-main" />
        <div v-if="project.gallery?.length > 1" class="gallery-thumbs">
          <img
            v-for="img in project.gallery"
            :key="img"
            :src="img"
            :class="{ active: img === activeImage }"
            @click="activeImage = img"
          />
        </div>
      </div>

      <div class="description">{{ project.description }}</div>

      <div class="tags">
        <span v-for="t in project.tech_stack" :key="t" class="badge badge-muted">{{ t }}</span>
      </div>

      <div class="links">
        <a v-if="project.demo_url" :href="project.demo_url" target="_blank" rel="noopener" class="btn btn-primary">
          Ver Demo <ExternalLink :size="15" />
        </a>
        <a v-if="project.repo_url" :href="project.repo_url" target="_blank" rel="noopener" class="btn btn-secondary">
          Repositorio <ExternalLink :size="15" />
        </a>
        <a v-if="project.docs_url" :href="project.docs_url" target="_blank" rel="noopener" class="btn btn-secondary">
          Documentación / Monografía <ExternalLink :size="15" />
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.muted {
  color: var(--text-muted);
}
.gallery {
  margin: 1.5rem 0;
}
.gallery-main {
  width: 100%;
  max-height: 460px;
  object-fit: contain;
  background: rgba(11, 16, 32, 0.8);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.gallery-thumbs {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.75rem;
  overflow-x: auto;
}
.gallery-thumbs img {
  width: 90px;
  height: 62px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  opacity: 0.65;
  border: 2px solid transparent;
}
.gallery-thumbs img.active,
.gallery-thumbs img:hover {
  opacity: 1;
  border-color: var(--accent);
}
.description {
  white-space: pre-line;
  margin: 1.5rem 0;
}
.tags,
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}
</style>
