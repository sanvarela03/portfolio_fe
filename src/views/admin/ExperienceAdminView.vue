<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Experience, ExperienceType } from '@/types/portfolio'

const items = ref<Experience[]>([])
const highlightsText = ref('')
const form = ref({
  role: '',
  company: '',
  location: '',
  entry_type: 'WORK' as ExperienceType,
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
  order: 0,
})

async function load() {
  items.value = await portfolioService.getExperiences()
}
onMounted(load)

async function addItem() {
  await portfolioService.createExperience({
    ...form.value,
    highlights: highlightsText.value.split('\n').map((s) => s.trim()).filter(Boolean),
  })
  form.value = { role: '', company: '', location: '', entry_type: 'WORK', start_date: '', end_date: '', is_current: false, description: '', order: 0 }
  highlightsText.value = ''
  await load()
}

async function remove(id: number) {
  if (!confirm('¿Eliminar registro?')) return
  await portfolioService.deleteExperience(id)
  await load()
}
</script>

<template>
  <div>
    <h1 class="section-title">Experiencia y Educación</h1>
    <p class="section-subtitle">Gestiona tu línea de tiempo laboral y académica.</p>

    <form class="card" style="margin-bottom: 1.5rem" @submit.prevent="addItem">
      <div class="grid-2">
        <div class="field"><label>Cargo o Título</label><input v-model="form.role" class="input" required /></div>
        <div class="field"><label>Empresa o Institución</label><input v-model="form.company" class="input" required /></div>
        <div class="field">
          <label>Tipo</label>
          <select v-model="form.entry_type" class="select">
            <option value="WORK">Experiencia Laboral</option>
            <option value="EDUCATION">Educación</option>
          </select>
        </div>
        <div class="field"><label>Ubicación</label><input v-model="form.location" class="input" /></div>
        <div class="field"><label>Fecha inicio</label><input v-model="form.start_date" class="input" required placeholder="2024-01" /></div>
        <div class="field"><label>Fecha fin</label><input v-model="form.end_date" class="input" :disabled="form.is_current" /></div>
      </div>
      <div class="field">
        <label><input type="checkbox" v-model="form.is_current" /> En curso / Actualidad</label>
      </div>
      <div class="field"><label>Descripción</label><textarea v-model="form.description" rows="3" class="textarea"></textarea></div>
      <div class="field"><label>Logros (uno por línea)</label><textarea v-model="highlightsText" rows="3" class="textarea"></textarea></div>
      <button type="submit" class="btn btn-primary">Agregar</button>
    </form>

    <div class="card">
      <div v-for="e in items" :key="e.id" class="row">
        <div>
          <strong>{{ e.role }}</strong> — {{ e.company }}
          <div class="muted">{{ e.entry_type_display }} • {{ e.start_date }} - {{ e.is_current ? 'Actualidad' : e.end_date }}</div>
        </div>
        <button class="btn btn-danger btn-sm" @click="remove(e.id)">Eliminar</button>
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
