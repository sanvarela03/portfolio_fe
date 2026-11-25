<script setup lang="ts">
import { onMounted, ref } from 'vue'
import portfolioService from '@/services/portfolioService'
import type { SiteProfile } from '@/types/portfolio'
import { Mail, Phone, MapPin, Send } from 'lucide-vue-next'

const profile = ref<SiteProfile | null>(null)
const form = ref({ name: '', email: '', subject: '', message: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    profile.value = await portfolioService.getProfile()
  } catch {
    // ignore
  }
})

async function handleSubmit() {
  sending.value = true
  error.value = null
  sent.value = false
  try {
    await portfolioService.sendContact(form.value)
    sent.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  } catch (e: any) {
    error.value = e.message || 'No fue posible enviar el mensaje.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="section-title">Contacto</h1>
    <p class="section-subtitle">¿Tienes un proyecto, propuesta laboral o colaboración? Escríbeme directamente.</p>

    <div class="grid-2">
      <div class="card">
        <div v-if="sent" class="alert alert-success">
          ¡Mensaje enviado correctamente! Te responderé pronto.
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="name">Nombre</label>
            <input id="name" v-model="form.name" class="input" required placeholder="Tu nombre" />
          </div>
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input id="email" v-model="form.email" type="email" class="input" required placeholder="tu@correo.com" />
          </div>
          <div class="field">
            <label for="subject">Asunto</label>
            <input id="subject" v-model="form.subject" class="input" required placeholder="Propuesta de proyecto" />
          </div>
          <div class="field">
            <label for="message">Mensaje</label>
            <textarea id="message" v-model="form.message" rows="5" class="textarea" required placeholder="Cuéntame sobre tu idea..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="sending">
            <Send :size="16" /> {{ sending ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
        </form>
      </div>

      <div class="card info-card">
        <h2>Información directa</h2>
        <div class="info-item">
          <Mail :size="18" class="accent" />
          <div>
            <div class="label">Email</div>
            <div>{{ profile?.email || 'santivarela.agent@gmail.com' }}</div>
          </div>
        </div>
        <div class="info-item">
          <Phone :size="18" class="accent" />
          <div>
            <div class="label">Teléfono</div>
            <div>{{ profile?.phone || '(+57) 313 801 0280' }}</div>
          </div>
        </div>
        <div class="info-item">
          <MapPin :size="18" class="accent" />
          <div>
            <div class="label">Ubicación</div>
            <div>{{ profile?.location || 'Colombia' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.info-item {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}
.accent {
  color: var(--accent);
  margin-top: 0.2rem;
}
.label {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
