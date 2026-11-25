<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Project, ProjectMedia } from '@/types/portfolio'
import { Upload, Trash2, Star, Film, Image as ImageIcon, Eye, X, Undo2, Copy, Check } from 'lucide-vue-next'

interface UnifiedPreviewItem {
  key: string
  source: 'storage' | 'url'
  id?: number
  url: string
  isGif: boolean
  isCover: boolean
  caption: string
  media?: ProjectMedia
}

interface PendingFilePreview {
  file: File
  previewUrl: string
  isGif: boolean
}

interface PendingUndoDelete {
  kind: 'storage' | 'url'
  label: string
  projectSlug: string
  projectId: number
  media?: ProjectMedia
  urlValue?: string
  urlIndex?: number
  wasCover?: boolean
  previousCover?: string
  timerId: number
}

const projects = ref<Project[]>([])
const editingId = ref<number | null>(null)
const techInput = ref('')
const galleryInput = ref('')
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// Local files pending upload (with object URL previews)
const pendingFiles = ref<PendingFilePreview[]>([])
const mediaCaption = ref('')
const mediaAsCover = ref(false)
const uploadingMedia = ref(false)
const isDragging = ref(false)

// Lightbox modal preview
const lightboxItem = ref<{ url: string; caption: string; isGif: boolean } | null>(null)
const copiedKey = ref<string | null>(null)

// Gmail-style Undo snackbar (deferred deletion)
const pendingUndo = ref<PendingUndoDelete | null>(null)
const hiddenStorageIds = ref<Set<number>>(new Set())
const undoCountdownKey = ref(0)

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

const parsedGalleryUrls = computed(() =>
  galleryInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
)

const unifiedPreviews = computed<UnifiedPreviewItem[]>(() => {
  const items: UnifiedPreviewItem[] = []
  const seenUrls = new Set<string>()

  // 1. Uploaded Supabase Storage media items
  for (const m of editingProject.value?.media_items || []) {
    if (hiddenStorageIds.value.has(m.id)) continue
    seenUrls.add(m.file_url)
    items.push({
      key: `storage-${m.id}`,
      source: 'storage',
      id: m.id,
      url: m.file_url,
      isGif: m.media_type === 'GIF' || m.file_url.toLowerCase().endsWith('.gif'),
      isCover: m.is_cover || form.value.cover_image === m.file_url,
      caption: m.caption || '',
      media: m,
    })
  }

  // 2. URL-based gallery items (and cover_image if not already listed)
  const urlList = [...parsedGalleryUrls.value]
  if (form.value.cover_image && !seenUrls.has(form.value.cover_image) && !urlList.includes(form.value.cover_image)) {
    urlList.unshift(form.value.cover_image)
  }

  for (const url of urlList) {
    if (seenUrls.has(url)) continue
    seenUrls.add(url)
    items.push({
      key: `url-${url}`,
      source: 'url',
      url,
      isGif: url.toLowerCase().endsWith('.gif'),
      isCover: form.value.cover_image === url,
      caption: '',
    })
  }

  return items
})

async function load() {
  projects.value = await portfolioService.getProjects()
}

onMounted(load)

onBeforeUnmount(() => {
  clearPendingFiles()
  if (pendingUndo.value) {
    commitPendingUndo()
  }
})

function clearPendingFiles() {
  for (const pf of pendingFiles.value) {
    URL.revokeObjectURL(pf.previewUrl)
  }
  pendingFiles.value = []
}

async function commitPendingUndo() {
  const current = pendingUndo.value
  if (!current) return
  window.clearTimeout(current.timerId)
  pendingUndo.value = null

  try {
    if (current.kind === 'storage' && current.media) {
      await portfolioService.deleteProjectMedia(current.projectSlug, current.media.id)
      hiddenStorageIds.value.delete(current.media.id)
      await load()
      if (editingProject.value) {
        form.value.cover_image = editingProject.value.cover_image
      }
    } else if (current.kind === 'url') {
      await portfolioService.updateProject(current.projectId, {
        gallery: parsedGalleryUrls.value,
        cover_image: form.value.cover_image,
      })
      await load()
    }
  } catch (e: any) {
    error.value = e.message || 'Error al confirmar la eliminación.'
    if (current.kind === 'storage' && current.media) {
      hiddenStorageIds.value.delete(current.media.id)
    }
  }
}

function undoDelete() {
  const current = pendingUndo.value
  if (!current) return
  window.clearTimeout(current.timerId)
  pendingUndo.value = null

  if (current.kind === 'storage' && current.media) {
    const next = new Set(hiddenStorageIds.value)
    next.delete(current.media.id)
    hiddenStorageIds.value = next
    if (current.wasCover && current.previousCover) {
      form.value.cover_image = current.previousCover
    }
  } else if (current.kind === 'url' && current.urlValue) {
    const urls = [...parsedGalleryUrls.value]
    const insertAt = Math.min(current.urlIndex ?? urls.length, urls.length)
    if (!urls.includes(current.urlValue)) {
      urls.splice(insertAt, 0, current.urlValue)
      galleryInput.value = urls.join(', ')
    }
    if (current.wasCover && current.previousCover) {
      form.value.cover_image = current.previousCover
    }
  }
}

async function startEdit(p: Project) {
  if (pendingUndo.value) {
    await commitPendingUndo()
  }
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
  clearPendingFiles()
  mediaCaption.value = ''
  mediaAsCover.value = false
}

async function resetForm() {
  if (pendingUndo.value) {
    await commitPendingUndo()
  }
  editingId.value = null
  form.value = blankForm()
  techInput.value = ''
  galleryInput.value = ''
  clearPendingFiles()
  mediaCaption.value = ''
  mediaAsCover.value = false
}

async function handleSubmit() {
  error.value = null
  successMsg.value = null
  const payload = {
    ...form.value,
    tech_stack: techInput.value.split(',').map((s) => s.trim()).filter(Boolean),
    gallery: parsedGalleryUrls.value,
  }
  try {
    if (editingId.value) {
      await portfolioService.updateProject(editingId.value, payload)
      successMsg.value = 'Proyecto actualizado.'
      await load()
    } else {
      const created = await portfolioService.createProject(payload)
      await load()
      await startEdit(created)
      successMsg.value = 'Proyecto creado. Ahora puedes subir capturas y GIFs debajo.'
    }
  } catch (e: any) {
    error.value = e.message
  }
}

async function removeProject(id: number) {
  if (!confirm('¿Eliminar este proyecto completo?')) return
  await portfolioService.deleteProject(id)
  if (editingId.value === id) await resetForm()
  await load()
}

function appendFiles(files: File[]) {
  const valid = files.filter((f) => ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(f.type))
  for (const file of valid) {
    pendingFiles.value.push({
      file,
      previewUrl: URL.createObjectURL(file),
      isGif: file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif'),
    })
  }
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    appendFiles(Array.from(input.files))
    input.value = ''
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files?.length) {
    appendFiles(Array.from(event.dataTransfer.files))
  }
}

function removePendingFile(idx: number) {
  const item = pendingFiles.value[idx]
  if (item) {
    URL.revokeObjectURL(item.previewUrl)
    pendingFiles.value.splice(idx, 1)
  }
}

async function uploadMedia() {
  if (!editingProject.value || !pendingFiles.value.length) return
  uploadingMedia.value = true
  error.value = null
  successMsg.value = null
  try {
    await portfolioService.uploadProjectMedia(
      editingProject.value.slug,
      pendingFiles.value.map((p) => p.file),
      mediaCaption.value,
      mediaAsCover.value
    )
    clearPendingFiles()
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

async function setPreviewAsCover(item: UnifiedPreviewItem) {
  if (!editingProject.value) return
  if (item.source === 'storage' && item.media) {
    await portfolioService.updateProjectMedia(editingProject.value.slug, item.media.id, { is_cover: true })
    await load()
    form.value.cover_image = editingProject.value.cover_image
  } else {
    form.value.cover_image = item.url
    await portfolioService.updateProject(editingProject.value.id, { cover_image: item.url })
    await load()
  }
  successMsg.value = 'Portada actualizada.'
}

async function scheduleDeletePreview(item: UnifiedPreviewItem) {
  if (!editingProject.value) return
  // If there was another pending deletion, commit it first
  if (pendingUndo.value) {
    await commitPendingUndo()
  }

  const prevCover = form.value.cover_image
  const wasCover = item.isCover

  if (item.source === 'storage' && item.media) {
    const nextHidden = new Set(hiddenStorageIds.value)
    nextHidden.add(item.media.id)
    hiddenStorageIds.value = nextHidden

    if (wasCover) {
      const remaining = unifiedPreviews.value.find((x) => x.key !== item.key)
      form.value.cover_image = remaining?.url || ''
    }

    const timerId = window.setTimeout(() => {
      commitPendingUndo()
    }, 6000)

    undoCountdownKey.value += 1
    pendingUndo.value = {
      kind: 'storage',
      label: item.isGif ? 'GIF eliminado' : 'Imagen eliminada',
      projectSlug: editingProject.value.slug,
      projectId: editingProject.value.id,
      media: item.media,
      wasCover,
      previousCover: prevCover,
      timerId,
    }
  } else {
    const urls = [...parsedGalleryUrls.value]
    const idx = urls.indexOf(item.url)
    if (idx !== -1) {
      urls.splice(idx, 1)
      galleryInput.value = urls.join(', ')
    }
    if (wasCover) {
      const remaining = unifiedPreviews.value.find((x) => x.key !== item.key)
      form.value.cover_image = remaining?.url || ''
    }

    const timerId = window.setTimeout(() => {
      commitPendingUndo()
    }, 6000)

    undoCountdownKey.value += 1
    pendingUndo.value = {
      kind: 'url',
      label: item.isGif ? 'GIF quitado de galería' : 'Imagen quitada de galería',
      projectSlug: editingProject.value.slug,
      projectId: editingProject.value.id,
      urlValue: item.url,
      urlIndex: idx === -1 ? urls.length : idx,
      wasCover,
      previousCover: prevCover,
      timerId,
    }
  }
}

async function copyUrl(item: UnifiedPreviewItem) {
  try {
    await navigator.clipboard.writeText(item.url)
    copiedKey.value = item.key
    window.setTimeout(() => {
      if (copiedKey.value === item.key) copiedKey.value = null
    }, 1800)
  } catch {
    // ignore
  }
}
</script>

<template>
  <div>
    <h1 class="section-title">Gestión de Proyectos</h1>
    <p class="section-subtitle">Edita proyectos, visualiza el preview de imágenes y GIFs, y sube nuevos archivos a Supabase Storage.</p>

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

      <!-- LIVE VISUAL PREVIEW OF ALL IMAGES & GIFS -->
      <div v-if="unifiedPreviews.length" class="preview-section">
        <div class="preview-header">
          <strong>Preview de imágenes y GIFs ({{ unifiedPreviews.length }})</strong>
          <span class="muted">Haz clic en la imagen para ampliar o elimínala con opción de deshacer.</span>
        </div>

        <div class="media-grid">
          <div v-for="item in unifiedPreviews" :key="item.key" class="media-card">
            <div class="media-thumb-wrap" @click="lightboxItem = { url: item.url, caption: item.caption || item.url, isGif: item.isGif }">
              <img :src="item.url" :alt="item.caption || form.title" loading="lazy" />
              <span class="badge media-type-badge" :class="item.isGif ? 'badge-success' : ''">
                <Film v-if="item.isGif" :size="12" />
                <ImageIcon v-else :size="12" />
                {{ item.isGif ? 'GIF' : 'IMG' }}
              </span>
              <span v-if="item.isCover" class="badge cover-badge">Portada</span>
              <div class="thumb-hover-overlay">
                <Eye :size="20" />
              </div>
            </div>

            <div class="media-meta">
              <div class="url-row" :title="item.url">
                <span class="url-text">{{ item.url }}</span>
                <button type="button" class="icon-btn" title="Copiar URL" @click="copyUrl(item)">
                  <Check v-if="copiedKey === item.key" :size="13" />
                  <Copy v-else :size="13" />
                </button>
              </div>
              <div v-if="item.caption" class="muted" style="margin-top: 0.25rem">{{ item.caption }}</div>
              <div class="media-actions">
                <button
                  v-if="!item.isCover && editingProject"
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="setPreviewAsCover(item)"
                >
                  <Star :size="13" /> Portada
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  title="Eliminar archivo"
                  @click="scheduleDeletePreview(item)"
                >
                  <Trash2 :size="13" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 1.25rem; margin: 1.15rem 0 1rem">
        <label><input type="checkbox" v-model="form.is_featured" /> Destacado</label>
        <label><input type="checkbox" v-model="form.is_published" /> Publicado</label>
      </div>
      <div style="display: flex; gap: 0.75rem">
        <button type="submit" class="btn btn-primary">{{ editingId ? 'Guardar cambios' : 'Crear proyecto' }}</button>
        <button v-if="editingId" type="button" class="btn btn-secondary" @click="resetForm">Nuevo proyecto</button>
      </div>
    </form>

    <!-- DRAG & DROP UPLOADER FOR ACTIVE PROJECT -->
    <div v-if="editingProject" class="card" style="margin-bottom: 1.5rem">
      <h3 style="margin-top: 0">Subir nuevas imágenes o GIFs — {{ editingProject.title }}</h3>
      <p class="muted" style="margin-bottom: 1rem">
        PNG, JPG, WebP (máx. 5 MB) o GIF animado (máx. 10 MB). Se suben directamente a Supabase Storage.
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

      <!-- LOCAL PREVIEW BEFORE UPLOADING -->
      <div v-if="pendingFiles.length" class="selected-list">
        <strong style="font-size: 0.9rem">Vista previa antes de subir ({{ pendingFiles.length }})</strong>
        <div class="pending-grid">
          <div v-for="(pf, idx) in pendingFiles" :key="`${pf.file.name}-${idx}`" class="pending-card">
            <div class="pending-thumb">
              <img :src="pf.previewUrl" :alt="pf.file.name" />
              <span v-if="pf.isGif" class="badge badge-success media-type-badge">GIF</span>
              <button type="button" class="pending-rm" title="Quitar" @click="removePendingFile(idx)">
                <X :size="14" />
              </button>
            </div>
            <div class="pending-name" :title="pf.file.name">{{ pf.file.name }}</div>
            <div class="muted" style="font-size: 0.75rem">{{ (pf.file.size / 1024 / 1024).toFixed(2) }} MB</div>
          </div>
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
          <Upload :size="15" /> {{ uploadingMedia ? 'Subiendo a Supabase...' : `Subir ${pendingFiles.length} archivo(s)` }}
        </button>
      </div>
    </div>

    <!-- PROJECTS LIST -->
    <div class="card">
      <div v-for="p in projects" :key="p.id" class="item-row">
        <div class="item-main">
          <img v-if="p.cover_image" :src="p.cover_image" :alt="p.title" class="list-thumb" loading="lazy" />
          <div>
            <strong>{{ p.title }}</strong>
            <div class="muted">
              {{ p.category }} • {{ p.is_published ? 'Publicado' : 'Borrador' }}
              <span v-if="p.media_items?.length"> • {{ p.media_items.length }} en Storage</span>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <button class="btn btn-secondary btn-sm" @click="startEdit(p)">Editar / Media</button>
          <button class="btn btn-danger btn-sm" @click="removeProject(p.id)">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- LIGHTBOX MODAL -->
    <div v-if="lightboxItem" class="lightbox-backdrop" @click.self="lightboxItem = null">
      <div class="lightbox-box">
        <button type="button" class="lightbox-close" @click="lightboxItem = null" aria-label="Cerrar">
          <X :size="20" />
        </button>
        <img :src="lightboxItem.url" :alt="lightboxItem.caption" class="lightbox-img" />
        <div class="lightbox-footer">
          <span v-if="lightboxItem.isGif" class="badge badge-success">GIF Animado</span>
          <span class="url-text">{{ lightboxItem.caption }}</span>
        </div>
      </div>
    </div>

    <!-- GMAIL-STYLE UNDO SNACKBAR -->
    <transition name="toast">
      <div v-if="pendingUndo" :key="undoCountdownKey" class="undo-snackbar" role="status">
        <div class="undo-content">
          <span>{{ pendingUndo.label }}</span>
          <button type="button" class="undo-btn" @click="undoDelete">
            <Undo2 :size="15" /> Deshacer
          </button>
          <button type="button" class="undo-close" title="Confirmar ahora" @click="commitPendingUndo">
            <X :size="16" />
          </button>
        </div>
        <div class="undo-progress"></div>
      </div>
    </transition>
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
.item-main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.list-thumb {
  width: 58px;
  height: 40px;
  object-fit: cover;
  border-radius: 7px;
  border: 1px solid var(--border);
}
.muted {
  color: var(--text-muted);
  font-size: 0.84rem;
}
.preview-section {
  margin-top: 1.25rem;
  padding-top: 1.15rem;
  border-top: 1px solid var(--border);
}
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 0.9rem;
}
.media-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(11, 16, 32, 0.55);
  display: flex;
  flex-direction: column;
}
.media-thumb-wrap {
  position: relative;
  height: 150px;
  background: #080c18;
  cursor: pointer;
}
.media-thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 16, 32, 0.52);
  color: #fff;
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.16s ease;
}
.media-thumb-wrap:hover .thumb-hover-overlay {
  opacity: 1;
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
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}
.url-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.25rem 0.45rem;
}
.url-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.15rem;
  display: inline-flex;
}
.icon-btn:hover {
  color: var(--accent);
}
.media-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: auto;
  padding-top: 0.35rem;
}
.dropzone {
  border: 2px dashed var(--border-strong);
  border-radius: 12px;
  padding: 1.65rem 1rem;
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
.pending-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;
}
.pending-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.45rem;
  background: var(--bg-card);
}
.pending-thumb {
  position: relative;
  height: 95px;
  border-radius: 6px;
  overflow: hidden;
  background: #080c18;
  margin-bottom: 0.4rem;
}
.pending-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pending-rm {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(11, 16, 32, 0.85);
  color: #fca5a5;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.pending-name {
  font-size: 0.78rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}
.lightbox-box {
  position: relative;
  max-width: 920px;
  width: 100%;
  background: var(--bg-elev);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  padding: 1rem;
}
.lightbox-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: rgba(11, 16, 32, 0.9);
  color: var(--text);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.lightbox-img {
  max-height: 75vh;
  width: 100%;
  object-fit: contain;
  border-radius: 8px;
  background: #080c18;
}
.lightbox-footer {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

/* Gmail-style Undo Snackbar */
.undo-snackbar {
  position: fixed;
  left: 1.5rem;
  bottom: 1.5rem;
  z-index: 90;
  min-width: 290px;
  background: #1e293b;
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 10px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}
.undo-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  font-size: 0.92rem;
}
.undo-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: transparent;
  border: none;
  color: #38bdf8;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.45rem;
  border-radius: 6px;
}
.undo-btn:hover {
  background: rgba(56, 189, 248, 0.14);
}
.undo-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: inline-flex;
  padding: 0.2rem;
}
.undo-close:hover {
  color: #fff;
}
.undo-progress {
  height: 3px;
  background: linear-gradient(90deg, #38bdf8, #6366f1);
  transform-origin: left;
  animation: undoShrink 6s linear forwards;
}
@keyframes undoShrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
