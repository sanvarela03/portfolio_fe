<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const form = ref({ old_password: '', new_password: '', confirm_password: '' })
const ok = ref(false)

async function submit() {
  ok.value = false
  const success = await auth.changePassword(form.value)
  if (success) {
    ok.value = true
    form.value = { old_password: '', new_password: '', confirm_password: '' }
  }
}
</script>

<template>
  <div>
    <h1 class="section-title">Seguridad</h1>
    <p class="section-subtitle">Actualiza la contraseña de tu cuenta administrativa.</p>

    <div v-if="ok" class="alert alert-success">Contraseña actualizada correctamente.</div>
    <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

    <form class="card" style="max-width: 480px" @submit.prevent="submit">
      <div class="field">
        <label>Contraseña actual</label>
        <input v-model="form.old_password" type="password" class="input" required />
      </div>
      <div class="field">
        <label>Nueva contraseña (mín. 8 caracteres)</label>
        <input v-model="form.new_password" type="password" class="input" minlength="8" required />
      </div>
      <div class="field">
        <label>Confirmar nueva contraseña</label>
        <input v-model="form.confirm_password" type="password" class="input" minlength="8" required />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="auth.loading">
        {{ auth.loading ? 'Actualizando...' : 'Cambiar contraseña' }}
      </button>
    </form>
  </div>
</template>
