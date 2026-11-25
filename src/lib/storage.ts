import type { UserProfile } from '@/types/auth'

const TOKEN_KEY = 'portfolio_access_token'
const USER_KEY = 'portfolio_user_profile'

export class StorageService {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch (e) {
      console.error('Error guardando token:', e)
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (e) {
      console.error('Error eliminando token:', e)
    }
  }

  getUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(USER_KEY)
      return data ? (JSON.parse(data) as UserProfile) : null
    } catch {
      return null
    }
  }

  setUser(user: UserProfile): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (e) {
      console.error('Error guardando perfil:', e)
    }
  }

  removeUser(): void {
    try {
      localStorage.removeItem(USER_KEY)
    } catch (e) {
      console.error('Error eliminando perfil:', e)
    }
  }

  clearAuth(): void {
    this.removeToken()
    this.removeUser()
  }
}

export const storage = new StorageService()
export default storage
