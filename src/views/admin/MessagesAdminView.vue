<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { ContactMessage } from '@/types/portfolio'

const messages = ref<ContactMessage[]>([])

async function load() {
  messages.value = await portfolioService.getMessages()
}
onMounted(load)

async function toggleRead(id: number) {
  await portfolioService.toggleMessageRead(id)
  await load()
}

async function remove(id: number) {
  if (!confirm('¿Eliminar mensaje?')) return
  await portfolioService.deleteMessage(id)
  await load()
}
</script>

<template>
  <div>
    <h1 class="section-title">Bandeja de Mensajes</h1>
    <p class="section-subtitle">Mensajes enviados desde el formulario público de contacto.</p>

    <div v-if="!messages.length" class="card">No tienes mensajes todavía.</div>
    <div v-else class="msg-list">
      <div v-for="m in messages" :key="m.id" class="card" :class="{ unread: !m.is_read }">
        <div class="msg-head">
          <div>
            <strong>{{ m.subject }}</strong>
            <div class="muted">{{ m.name }} &lt;{{ m.email }}&gt;</div>
          </div>
          <span class="badge" :class="m.is_read ? 'badge-muted' : 'badge-success'">
            {{ m.is_read ? 'Leído' : 'Nuevo' }}
          </span>
        </div>
        <p style="white-space: pre-line">{{ m.message }}</p>
        <div style="display: flex; gap: 0.5rem">
          <button class="btn btn-secondary btn-sm" @click="toggleRead(m.id)">
            {{ m.is_read ? 'Marcar sin leer' : 'Marcar leído' }}
          </button>
          <a :href="`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`" class="btn btn-primary btn-sm">
            Responder por correo
          </a>
          <button class="btn btn-danger btn-sm" @click="remove(m.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msg-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.unread {
  border-color: var(--accent);
}
.msg-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.muted {
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
