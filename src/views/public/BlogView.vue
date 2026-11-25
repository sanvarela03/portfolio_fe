<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { BlogPost } from '@/types/portfolio'
import { Clock } from 'lucide-vue-next'

const posts = ref<BlogPost[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    posts.value = await portfolioService.getPosts()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container">
    <h1 class="section-title">Blog Técnico</h1>
    <p class="section-subtitle">Artículos sobre arquitectura de software, Django, Docker, Supabase y frontend moderno.</p>

    <div v-if="loading" class="card">Cargando artículos...</div>
    <div v-else-if="!posts.length" class="card">Aún no hay artículos publicados.</div>
    <div v-else class="grid-2">
      <article v-for="post in posts" :key="post.id" class="card post-card">
        <div class="tags">
          <span v-for="tag in post.tags" :key="tag" class="badge">{{ tag }}</span>
        </div>
        <h2>{{ post.title }}</h2>
        <p class="muted">{{ post.excerpt }}</p>
        <div class="post-meta">
          <span><Clock :size="14" /> {{ post.reading_time_minutes }} min</span>
          <span>{{ post.author_name }}</span>
        </div>
        <router-link :to="`/blog/${post.slug}`" class="btn btn-primary btn-sm" style="align-self: flex-start">
          Leer artículo
        </router-link>
      </article>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.post-card h2 {
  margin: 0;
  font-size: 1.25rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.muted {
  color: var(--text-muted);
  margin: 0;
}
.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.84rem;
  color: var(--text-muted);
}
.post-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
</style>
