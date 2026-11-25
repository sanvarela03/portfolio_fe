<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { Skill, SkillCategory } from '@/types/portfolio'

const skills = ref<Skill[]>([])
const form = ref({
  name: '',
  category: 'BACKEND' as SkillCategory,
  level: 85,
  order: 0,
  is_visible: true,
})

const categories: { value: SkillCategory; label: string }[] = [
  { value: 'BACKEND', label: 'Backend & APIs' },
  { value: 'FRONTEND', label: 'Frontend & Web' },
  { value: 'DATABASE', label: 'Bases de Datos' },
  { value: 'DEVOPS', label: 'Cloud & DevOps' },
  { value: 'MOBILE', label: 'Desarrollo Móvil' },
  { value: 'DATA', label: 'Datos & Matemáticas' },
  { value: 'OTHER', label: 'Otras Herramientas' },
]

async function load() {
  skills.value = await portfolioService.getSkills()
}
onMounted(load)

async function addSkill() {
  await portfolioService.createSkill(form.value)
  form.value = { name: '', category: 'BACKEND', level: 85, order: 0, is_visible: true }
  await load()
}

async function remove(id: number) {
  if (!confirm('¿Eliminar habilidad?')) return
  await portfolioService.deleteSkill(id)
  await load()
}
</script>

<template>
  <div>
    <h1 class="section-title">Habilidades</h1>
    <p class="section-subtitle">Administra tu stack técnico y niveles de dominio.</p>

    <form class="card" style="margin-bottom: 1.5rem" @submit.prevent="addSkill">
      <div class="grid-3">
        <div class="field"><label>Nombre</label><input v-model="form.name" class="input" required placeholder="Django REST Framework" /></div>
        <div class="field">
          <label>Categoría</label>
          <select v-model="form.category" class="select">
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="field"><label>Nivel ({{ form.level }}%)</label><input v-model.number="form.level" type="range" min="10" max="100" /></div>
      </div>
      <button type="submit" class="btn btn-primary">Agregar habilidad</button>
    </form>

    <div class="card">
      <div v-for="s in skills" :key="s.id" class="row">
        <div>
          <strong>{{ s.name }}</strong>
          <span class="badge" style="margin-left: 0.5rem">{{ s.category_display }}</span>
          <span class="muted" style="margin-left: 0.5rem">{{ s.level }}%</span>
        </div>
        <button class="btn btn-danger btn-sm" @click="remove(s.id)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
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
