<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Project } from '@/types/portfolio'

const projects = ref<Project[]>([])
const editingId = ref<number | null>(null)
const techInput = ref('')
const galleryInput = ref('')
const error = ref<string | null>(null)

const blankForm = () => ({
  title: '',
  summary: '',
  description: '',
  category: 'Full-Stack',
  cover_image: '',
  repo_url: '',
  demo_url: '',
  docs_url: '',
  is_featured: true,
  is_published: true,
  order: 0,
})
const form = ref(blankForm())

async function load() {
  projects.value = await portfolioService.getProjects()
}

onMounted(load)

function startEdit(p: Project) {
  editingId.value = p.id
  form.value = {
    title: p.title,
    summary: p.summary,
    description: p.description,
    category: p.category,
    cover_image: p.cover_image,
    repo_url: p.repo_url,
    demo_url: p.demo_url,
    docs_url: p.docs_url,
    is_featured: p.is_featured,
    is_published: p.is_published,
    order: p.order,
  }
  techInput.value = (p.tech_stack || []).join(', ')
  galleryInput.value = (p.gallery || []).join(', ')
}

function resetForm() {
  editingId.value = null
  form.value = blankForm()
  techInput.value = ''
  galleryInput.value = ''
}

async function handleSubmit() {
  error.value = null
  const payload = {
    ...form.value,
    tech_stack: techInput.value.split(',').map((s) => s.trim()).filter(Boolean),
    gallery: galleryInput.value.split(',').map((s) => s.trim()).filter(Boolean),
  }
  try {
    if (editingId.value) {
      await portfolioService.updateProject(editingId.value, payload)
    } else {
      await portfolioService.createProject(payload)
    }
    resetForm()
    await load()
  } catch (e: any) {
    error.value = e.message
  }
}

async function remove(id: number) {
  if (!confirm('¿Eliminar este proyecto?')) return
  await portfolioService.deleteProject(id)
  await load()
}
</script>

<template>
  <div>
    <h1 class="section-title">Gestión de Proyectos</h1>
    <p class="section-subtitle">Crea, edita o publica los proyectos de tu portafolio.</p>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <form class="card" style="margin-bottom: 1.5rem" @submit.prevent="handleSubmit">
      <h3 style="margin-top: 0">{{ editingId ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h3>
      <div class="grid-2">
        <div class="field"><label>Título</label><input v-model="form.title" class="input" required /></div>
        <div class="field"><label>Categoría</label><input v-model="form.category" class="input" required /></div>
      </div>
      <div class="field"><label>Resumen corto</label><input v-model="form.summary" class="input" required /></div>
      <div class="field"><label>Descripción completa</label><textarea v-model="form.description" rows="4" class="textarea" required></textarea></div>
      <div class="grid-2">
        <div class="field"><label>Imagen portada (URL o /images/...)</label><input v-model="form.cover_image" class="input" /></div>
        <div class="field"><label>Stack (separado por comas)</label><input v-model="techInput" class="input" placeholder="Django, Vue 3, Docker" /></div>
        <div class="field"><label>Galería (URLs separadas por comas)</label><input v-model="galleryInput" class="input" /></div>
        <div class="field"><label>Demo URL</label><input v-model="form.demo_url" class="input" /></div>
        <div class="field"><label>Repositorio URL</label><input v-model="form.repo_url" class="input" /></div>
        <div class="field"><label>Docs / Monografía URL</label><input v-model="form.docs_url" class="input" /></div>
      </div>
      <div style="display: flex; gap: 1.25rem; margin-bottom: 1rem">
        <label><input type="checkbox" v-model="form.is_featured" /> Destacado</label>
        <label><input type="checkbox" v-model="form.is_published" /> Publicado</label>
      </div>
      <div style="display: flex; gap: 0.75rem">
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Actualizar' : 'Crear proyecto' }}</button>
        <button v-if="editingId" type="button" class="btn btn-secondary" @click="resetForm">Cancelar</button>
      </div>
    </form>

    <div class="card">
      <div v-for="p in projects" :key="p.id" class="item-row">
        <div>
          <strong>{{ p.title }}</strong>
          <div class="muted">{{ p.category }} • {{ p.is_published ? 'Publicado' : 'Borrador' }}</div>
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
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border);
}
.item-row:last-child {
  border-bottom: none;
}
.muted {
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
