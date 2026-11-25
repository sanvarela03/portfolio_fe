<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import portfolioService from '@/services/portfolioService'
import type { BlogPost } from '@/types/portfolio'
import { ArrowLeft, Clock } from 'lucide-vue-next'

const route = useRoute()
const post = ref<BlogPost | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    post.value = await portfolioService.getPost(route.params.slug as string)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container">
    <router-link to="/blog" class="btn btn-secondary btn-sm" style="margin-bottom: 1.5rem">
      <ArrowLeft :size="15" /> Volver al blog
    </router-link>

    <div v-if="loading" class="card">Cargando...</div>
    <article v-else-if="post" class="card article-card">
      <div class="tags">
        <span v-for="t in post.tags" :key="t" class="badge">{{ t }}</span>
      </div>
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <span>Por {{ post.author_name }}</span>
        <span><Clock :size="14" /> {{ post.reading_time_minutes }} min de lectura</span>
      </div>
      <div class="content">{{ post.content }}</div>
    </article>
  </div>
</template>

<style scoped>
.article-card {
  max-width: 820px;
  margin: 0 auto;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.meta {
  display: flex;
  gap: 1.25rem;
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-bottom: 1.75rem;
}
.meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.content {
  white-space: pre-line;
  line-height: 1.8;
  font-size: 1.02rem;
}
</style>
