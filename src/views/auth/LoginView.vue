<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Lock, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const expired = route.query.expired === '1'

async function handleSubmit() {
  const ok = await auth.login({ username: username.value, password: password.value })
  if (ok) {
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="login-page">
    <div class="card login-card">
      <div class="login-head">
        <div class="icon-circle"><Lock :size="22" /></div>
        <h1>Panel Administrativo</h1>
        <p>Inicia sesión con tu usuario o correo para gestionar tu portafolio.</p>
      </div>

      <div v-if="expired" class="alert alert-error">
        Tu sesión expiró. Por favor vuelve a iniciar sesión.
      </div>
      <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="username">Usuario o correo</label>
          <input id="username" v-model="username" class="input" required autocomplete="username" placeholder="sanvarela03" />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" class="input" required autocomplete="current-password" />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="auth.loading">
          {{ auth.loading ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="login-back">
        <router-link to="/"><ArrowLeft :size="15" /> Volver al portafolio</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}
.login-card {
  width: 100%;
  max-width: 420px;
}
.login-head {
  text-align: center;
  margin-bottom: 1.5rem;
}
.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  margin: 0 auto 0.75rem;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
}
.login-head h1 {
  margin: 0 0 0.35rem;
  font-size: 1.4rem;
}
.login-head p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.login-back {
  margin-top: 1.25rem;
  text-align: center;
}
.login-back a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  color: var(--text-muted);
}
</style>
