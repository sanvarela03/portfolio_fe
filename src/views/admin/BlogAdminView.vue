<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { BlogPost } from '@/types/portfolio'

const posts = ref<BlogPost[]>([])
const editingId = ref<number | null>(null)
const tagsInput = ref('')
const form = ref({
  title: '',
  excerpt: '',
  content: '',
  reading_time_minutes: 5,
  is_published: true,
})

async function load() {
  posts.value = await portfolioService.getPosts()
}
onMounted(load)

function startEdit(p: BlogPost) {
  editingId.value = p.id
  form.value = {
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    reading_time_minutes: p.reading_time_minutes,
    is_published: p.is_published,
  }
  tagsInput.value = (p.tags || []).join(', ')
}

function reset() {
  editingId.value = null
  form.value = { title: '', excerpt: '', content: '', reading_time_minutes: 5, is_published: true }
  tagsInput.value = ''
}

async function save() {
  const payload = {
    ...form.value,
    tags: tagsInput.value.split(',').map((s) => s.trim()).filter(Boolean),
  }
  if (editingId.value) {
    await portfolioService.updatePost(editingId.value, payload)
  } else {
    await portfolioService.createPost(payload)
  }
  reset()
  await load()
}

async function remove(id: number) {
  if (!confirm('¿Eliminar artículo?')) return
  await portfolioService.deletePost(id)
  await load()
}
</script>

<template>
  <div>
    <h1 class="section-title">Blog Técnico</h1>
    <p class="section-subtitle">Redacta y publica artículos en tu portafolio.</p>

    <form class="card" style="margin-bottom: 1.5rem" @submit.prevent="save">
      <div class="field"><label>Título</label><input v-model="form.title" class="input" required /></div>
      <div class="field"><label>Resumen</label><input v-model="form.excerpt" class="input" required /></div>
      <div class="grid-2">
        <div class="field"><label>Tags (separados por coma)</label><input v-model="tagsInput" class="input" placeholder="Django, Docker, Vue" /></div>
        <div class="field"><label>Minutos de lectura</label><input v-model.number="form.reading_time_minutes" type="number" min="1" class="input" /></div>
      </div>
      <div class="field"><label>Contenido</label><textarea v-model="form.content" rows="7" class="textarea" required></textarea></div>
      <div class="field"><label><input type="checkbox" v-model="form.is_published" /> Publicado</label></div>
      <div style="display: flex; gap: 0.75rem">
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Actualizar artículo' : 'Publicar artículo' }}</button>
        <button v-if="editingId" type="button" class="btn btn-secondary" @click="reset">Cancelar</button>
      </div>
    </form>

    <div class="card">
      <div v-for="p in posts" :key="p.id" class="row">
        <div>
          <strong>{{ p.title }}</strong>
          <div class="muted">{{ p.is_published ? 'Publicado' : 'Borrador' }} • {{ p.reading_time_minutes }} min</div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <button class="btn btn-secondary btn-sm" @click="startEdit(p)">Editar</button>
          <button class="btn btn-danger btn-sm" @click="remove(p.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border);
}
.row:last-child {
  border-bottom: none;
}
.muted {
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
