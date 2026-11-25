<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { SiteProfile } from '@/types/portfolio'

const form = ref<SiteProfile>({
  full_name: '',
  headline: '',
  subheadline: '',
  bio: '',
  avatar_url: '',
  cv_url: '',
  email: '',
  phone: '',
  location: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  available_for_work: true,
})
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    form.value = await portfolioService.getProfile()
  } catch (e: any) {
    error.value = e.message
  }
})

async function handleSave() {
  saving.value = true
  saved.value = false
  error.value = null
  try {
    form.value = await portfolioService.updateProfile(form.value)
    saved.value = true
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="section-title">Perfil & CV</h1>
    <p class="section-subtitle">Edita la información pública de tu portada, redes y enlace de hoja de vida.</p>

    <div v-if="saved" class="alert alert-success">Perfil actualizado correctamente.</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <form class="card" @submit.prevent="handleSave">
      <div class="grid-2">
        <div class="field">
          <label>Nombre completo</label>
          <input v-model="form.full_name" class="input" required />
        </div>
        <div class="field">
          <label>Titular profesional</label>
          <input v-model="form.headline" class="input" required />
        </div>
      </div>

      <div class="field">
        <label>Subtítulo / Especialidades</label>
        <input v-model="form.subheadline" class="input" />
      </div>

      <div class="field">
        <label>Biografía</label>
        <textarea v-model="form.bio" rows="4" class="textarea"></textarea>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>URL de Avatar</label>
          <input v-model="form.avatar_url" class="input" />
        </div>
        <div class="field">
          <label>URL del CV (Google Drive / PDF)</label>
          <input v-model="form.cv_url" type="url" class="input" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" class="input" />
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input v-model="form.phone" class="input" />
        </div>
        <div class="field">
          <label>Ubicación</label>
          <input v-model="form.location" class="input" />
        </div>
        <div class="field">
          <label>GitHub URL</label>
          <input v-model="form.github_url" type="url" class="input" />
        </div>
        <div class="field">
          <label>LinkedIn URL</label>
          <input v-model="form.linkedin_url" type="url" class="input" />
        </div>
        <div class="field">
          <label>Disponible para proyectos</label>
          <label style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem">
            <input type="checkbox" v-model="form.available_for_work" /> Mostrar badge de disponibilidad
          </label>
        </div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </form>
  </div>
</template>
