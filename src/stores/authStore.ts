import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storage from '@/lib/storage'
import authService from '@/services/authService'
import type { UserProfile, LoginPayload, ChangePasswordPayload } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(storage.getToken())
  const user = ref<UserProfile | null>(storage.getUser())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const isSuperadmin = computed(() => Boolean(user.value?.is_superuser || user.value?.role === 'SUPERADMIN'))
  const displayName = computed(() => {
    if (!user.value) return ''
    const full = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim()
    return full || user.value.username
  })

  async function login(payload: LoginPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(payload)
      token.value = res.token
      user.value = res.user
      storage.setToken(res.token)
      storage.setUser(res.user)
      return true
    } catch (err: any) {
      error.value = err.message || 'Credenciales inválidas'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe(): Promise<UserProfile | null> {
    if (!token.value) return null
    try {
      const profile = await authService.getMe()
      user.value = profile
      storage.setUser(profile)
      return profile
    } catch {
      return null
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    try {
      await authService.logout()
    } catch {
      // Ignore network errors on logout
    } finally {
      token.value = null
      user.value = null
      storage.clearAuth()
      loading.value = false
    }
  }

  async function changePassword(payload: ChangePasswordPayload): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await authService.changePassword(payload)
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al cambiar la contraseña'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isSuperadmin,
    displayName,
    login,
    fetchMe,
    logout,
    changePassword,
  }
})
