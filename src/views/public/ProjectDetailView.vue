<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import portfolioService from '@/services/portfolioService'
import type { Project } from '@/types/portfolio'
import { ArrowLeft, ExternalLink, Film } from 'lucide-vue-next'

interface GalleryEntry {
  url: string
  isGif: boolean
  caption: string
}

const route = useRoute()
const project = ref<Project | null>(null)
const activeIndex = ref(0)
const loading = ref(true)

const galleryItems = computed<GalleryEntry[]>(() => {
  if (!project.value) return []
  const items: GalleryEntry[] = []
  const seen = new Set<string>()

  // 1. Uploaded Supabase Storage media items first
  for (const m of project.value.media_items || []) {
    if (!seen.has(m.file_url)) {
      seen.add(m.file_url)
      items.push({
        url: m.file_url,
        isGif: m.media_type === 'GIF' || m.file_url.toLowerCase().endsWith('.gif'),
        caption: m.caption || '',
      })
    }
  }

  // 2. Legacy gallery URLs / cover fallback
  const extras = [project.value.cover_image, ...(project.value.gallery || [])].filter(Boolean)
  for (const url of extras) {
    if (!seen.has(url)) {
      seen.add(url)
      items.push({
        url,
        isGif: url.toLowerCase().endsWith('.gif'),
        caption: '',
      })
    }
  }

  return items
})

const activeItem = computed(() => galleryItems.value[activeIndex.value] || null)

onMounted(async () => {
  try {
    const slug = route.params.slug as string
    project.value = await portfolioService.getProject(slug)
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

      <div v-if="activeItem" class="gallery">
        <div class="gallery-stage">
          <img :src="activeItem.url" :alt="activeItem.caption || project.title" class="gallery-main" />
          <span v-if="activeItem.isGif" class="badge badge-success stage-gif-badge">
            <Film :size="13" /> Demo GIF
          </span>
        </div>
        <p v-if="activeItem.caption" class="gallery-caption">{{ activeItem.caption }}</p>

        <div v-if="galleryItems.length > 1" class="gallery-thumbs">
          <button
            v-for="(item, idx) in galleryItems"
            :key="item.url"
            type="button"
            class="thumb-btn"
            :class="{ active: idx === activeIndex }"
            @click="activeIndex = idx"
          >
            <img :src="item.url" :alt="item.caption || project.title" loading="lazy" />
            <span v-if="item.isGif" class="thumb-gif">GIF</span>
          </button>
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
.gallery-stage {
  position: relative;
}
.gallery-main {
  width: 100%;
  max-height: 480px;
  object-fit: contain;
  background: rgba(11, 16, 32, 0.85);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.stage-gif-badge {
  position: absolute;
  top: 12px;
  left: 12px;
}
.gallery-caption {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  text-align: center;
}
.gallery-thumbs {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.85rem;
  overflow-x: auto;
}
.thumb-btn {
  position: relative;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: transparent;
  opacity: 0.65;
  flex-shrink: 0;
}
.thumb-btn img {
  width: 96px;
  height: 64px;
  object-fit: cover;
}
.thumb-btn.active,
.thumb-btn:hover {
  opacity: 1;
  border-color: var(--accent);
}
.thumb-gif {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(11, 16, 32, 0.88);
  color: #86efac;
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
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
