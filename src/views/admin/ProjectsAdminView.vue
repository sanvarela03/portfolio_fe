<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Project, ProjectMedia } from '@/types/portfolio'
import { Upload, Trash2, Star, Film, Image as ImageIcon } from 'lucide-vue-next'

const projects = ref<Project[]>([])
const editingId = ref<number | null>(null)
const techInput = ref('')
const galleryInput = ref('')
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Media upload state
const selectedFiles = ref<File[]>([])
const mediaCaption = ref('')
const mediaAsCover = ref(false)
const uploadingMedia = ref(false)
const isDragging = ref(false)

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

const editingProject = computed(() => projects.value.find((p) => p.id === editingId.value) || null)

async function load() {
  projects.value = await portfolioService.getProjects()
}

onMounted(load)

function startEdit(p: Project) {
  editingId.value = p.id
  error.value = null
  successMsg.value = null
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
  selectedFiles.value = []
  mediaCaption.value = ''
  mediaAsCover.value = false
}

function resetForm() {
  editingId.value = null
  form.value = blankForm()
  techInput.value = ''
  galleryInput.value = ''
  selectedFiles.value = []
  mediaCaption.value = ''
  mediaAsCover.value = false
}

async function handleSubmit() {
  error.value = null
  successMsg.value = null
  const payload = {
    ...form.value,
    tech_stack: techInput.value.split(',').map((s) => s.trim()).filter(Boolean),
    gallery: galleryInput.value.split(',').map((s) => s.trim()).filter(Boolean),
  }
  try {
    if (editingId.value) {
      await portfolioService.updateProject(editingId.value, payload)
      successMsg.value = 'Proyecto actualizado.'
      await load()
    } else {
      const created = await portfolioService.createProject(payload)
      await load()
      startEdit(created)
      successMsg.value = 'Proyecto creado. Ahora puedes subir capturas y GIFs debajo.'
    }
  } catch (e: any) {
    error.value = e.message
  }
}

async function remove(id: number) {
  if (!confirm('¿Eliminar este proyecto?')) return
  await portfolioService.deleteProject(id)
  if (editingId.value === id) resetForm()
  await load()
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(input.files)]
    input.value = ''
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files?.length) {
    const valid = Array.from(event.dataTransfer.files).filter((f) =>
      ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(f.type)
    )
    selectedFiles.value = [...selectedFiles.value, ...valid]
  }
}

function removeSelectedFile(idx: number) {
  selectedFiles.value.splice(idx, 1)
}

async function uploadMedia() {
  if (!editingProject.value || !selectedFiles.value.length) return
  uploadingMedia.value = true
  error.value = null
  successMsg.value = null
  try {
    await portfolioService.uploadProjectMedia(
      editingProject.value.slug,
      selectedFiles.value,
      mediaCaption.value,
      mediaAsCover.value
    )
    selectedFiles.value = []
    mediaCaption.value = ''
    mediaAsCover.value = false
    await load()
    if (editingProject.value) {
      form.value.cover_image = editingProject.value.cover_image
    }
    successMsg.value = 'Archivos subidos a Supabase Storage correctamente.'
  } catch (e: any) {
    error.value = e.message || 'Error subiendo archivos'
  } finally {
    uploadingMedia.value = false
  }
}

async function setAsCover(item: ProjectMedia) {
  if (!editingProject.value) return
  await portfolioService.updateProjectMedia(editingProject.value.slug, item.id, { is_cover: true })
  await load()
  if (editingProject.value) {
    form.value.cover_image = editingProject.value.cover_image
  }
}

async function deleteMedia(item: ProjectMedia) {
  if (!editingProject.value) return
  if (!confirm('¿Eliminar este archivo de la galería y de Supabase Storage?')) return
  await portfolioService.deleteProjectMedia(editingProject.value.slug, item.id)
  await load()
  if (editingProject.value) {
    form.value.cover_image = editingProject.value.cover_image
  }
}
</script>

<template>
  <div>
    <h1 class="section-title">Gestión de Proyectos</h1>
    <p class="section-subtitle">Crea, edita y sube capturas (PNG, JPG, WebP) y demos animadas (GIF) a Supabase Storage.</p>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>

    <form class="card" style="margin-bottom: 1.5rem" @submit.prevent="handleSubmit">
      <h3 style="margin-top: 0">{{ editingId ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h3>
      <div class="grid-2">
        <div class="field"><label>Título</label><input v-model="form.title" class="input" required /></div>
        <div class="field"><label>Categoría</label><input v-model="form.category" class="input" required /></div>
      </div>
      <div class="field"><label>Resumen corto</label><input v-model="form.summary" class="input" required /></div>
      <div class="field"><label>Descripción completa</label><textarea v-model="form.description" rows="4" class="textarea" required></textarea></div>
      <div class="grid-2">
        <div class="field"><label>Imagen portada (URL o automática al subir)</label><input v-model="form.cover_image" class="input" /></div>
        <div class="field"><label>Stack (separado por comas)</label><input v-model="techInput" class="input" placeholder="Django, Vue 3, Docker" /></div>
        <div class="field"><label>URLs extra de galería (opcional, comas)</label><input v-model="galleryInput" class="input" /></div>
        <div class="field"><label>Demo URL</label><input v-model="form.demo_url" class="input" /></div>
        <div class="field"><label>Repositorio URL</label><input v-model="form.repo_url" class="input" /></div>
        <div class="field"><label>Docs / Monografía URL</label><input v-model="form.docs_url" class="input" /></div>
      </div>
      <div style="display: flex; gap: 1.25rem; margin-bottom: 1rem">
        <label><input type="checkbox" v-model="form.is_featured" /> Destacado</label>
        <label><input type="checkbox" v-model="form.is_published" /> Publicado</label>
      </div>
      <div style="display: flex; gap: 0.75rem">
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Guardar cambios' : 'Crear proyecto' }}</button>
        <button v-if="editingId" type="button" class="btn btn-secondary" @click="resetForm">Nuevo proyecto</button>
      </div>
    </form>

    <!-- MEDIA UPLOADER FOR ACTIVE PROJECT -->
    <div v-if="editingProject" class="card" style="margin-bottom: 1.5rem">
      <h3 style="margin-top: 0">Galería & Demos GIF — {{ editingProject.title }}</h3>
      <p class="muted" style="margin-bottom: 1rem">
        Sube capturas (PNG, JPG, WebP hasta 5 MB) o demos animadas (GIF hasta 10 MB). Se almacenan en Supabase Storage.
      </p>

      <div
        class="dropzone"
        :class="{ dragging: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <Upload :size="26" class="accent" />
        <p style="margin: 0.4rem 0">Arrastra aquí tus imágenes o GIFs, o selecciónalos</p>
        <label class="btn btn-secondary btn-sm">
          Seleccionar archivos
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            style="display: none"
            @change="onFileSelect"
          />
        </label>
      </div>

      <div v-if="selectedFiles.length" class="selected-list">
        <div v-for="(f, idx) in selectedFiles" :key="`${f.name}-${idx}`" class="selected-chip">
          <span>{{ f.name }} ({{ (f.size / 1024 / 1024).toFixed(2) }} MB)</span>
          <button type="button" class="chip-rm" @click="removeSelectedFile(idx)">×</button>
        </div>

        <div class="grid-2" style="margin-top: 0.85rem">
          <div class="field" style="margin-bottom: 0">
            <label>Descripción / Caption (opcional)</label>
            <input v-model="mediaCaption" class="input" placeholder="Ej: Flujo de login y panel admin" />
          </div>
          <div class="field" style="margin-bottom: 0; justify-content: flex-end">
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1.6rem">
              <input type="checkbox" v-model="mediaAsCover" /> Usar el primer archivo como portada
            </label>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-primary"
          style="margin-top: 1rem"
          :disabled="uploadingMedia"
          @click="uploadMedia"
        >
          <Upload :size="15" /> {{ uploadingMedia ? 'Subiendo a Supabase...' : `Subir ${selectedFiles.length} archivo(s)` }}
        </button>
      </div>

      <div v-if="editingProject.media_items?.length" class="media-grid">
        <div v-for="m in editingProject.media_items" :key="m.id" class="media-card">
          <div class="media-thumb-wrap">
            <img :src="m.file_url" :alt="m.caption || editingProject.title" loading="lazy" />
            <span class="badge media-type-badge" :class="m.media_type === 'GIF' ? 'badge-success' : ''">
              <Film v-if="m.media_type === 'GIF'" :size="12" />
              <ImageIcon v-else :size="12" />
              {{ m.media_type }}
            </span>
            <span v-if="m.is_cover" class="badge cover-badge">Portada</span>
          </div>
          <div class="media-meta">
            <div class="muted">{{ m.caption || 'Sin descripción' }}</div>
            <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem">
              <button
                v-if="!m.is_cover"
                type="button"
                class="btn btn-secondary btn-sm"
                @click="setAsCover(m)"
              >
                <Star :size="13" /> Portada
              </button>
              <button type="button" class="btn btn-danger btn-sm" @click="deleteMedia(m)">
                <Trash2 :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div v-for="p in projects" :key="p.id" class="item-row">
        <div>
          <strong>{{ p.title }}</strong>
          <div class="muted">
            {{ p.category }} • {{ p.is_published ? 'Publicado' : 'Borrador' }}
            <span v-if="p.media_items?.length"> • {{ p.media_items.length }} archivo(s) en Storage</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <button class="btn btn-secondary btn-sm" @click="startEdit(p)">Editar / Media</button>
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
.dropzone {
  border: 2px dashed var(--border-strong);
  border-radius: 12px;
  padding: 1.75rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  transition: border-color 0.18s ease, background 0.18s ease;
}
.dropzone.dragging {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.accent {
  color: var(--accent);
}
.selected-list {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(11, 16, 32, 0.55);
  border: 1px solid var(--border);
}
.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.25rem 0.4rem 0.25rem 0;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.82rem;
}
.chip-rm {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: 700;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}
.media-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(11, 16, 32, 0.5);
}
.media-thumb-wrap {
  position: relative;
  height: 145px;
  background: #080c18;
}
.media-thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.media-type-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}
.cover-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
.media-meta {
  padding: 0.7rem;
}
</style>
