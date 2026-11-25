import http from '@/lib/http'
import {
  type LoginPayload,
  type LoginResponse,
  type ChangePasswordPayload,
  type UserProfile,
  type UserCreatePayload,
  type UserUpdatePayload,
  normalizeUser,
} from '@/types/auth'

export class AuthService {
  async login(payload: LoginPayload): Promise<{ token: string; user: UserProfile }> {
    const res = await http.post<LoginResponse>('/api/v1/auth/login/', payload)
    if (!res || !res.token) {
      throw new Error('Respuesta de autenticación inválida del servidor.')
    }
    return {
      token: res.token,
      user: normalizeUser(res.user),
    }
  }

  async logout(): Promise<void> {
    await http.post('/api/v1/auth/logout/')
  }

  async getMe(): Promise<UserProfile> {
    const res = await http.get<any>('/api/v1/auth/me/')
    return normalizeUser(res)
  }

  async changePassword(payload: ChangePasswordPayload): Promise<{ detail: string }> {
    return await http.post<{ detail: string }>('/api/v1/auth/change-password/', payload)
  }

  async getUsers(): Promise<UserProfile[]> {
    const res = await http.get<any>('/api/v1/auth/users/')
    const list = Array.isArray(res) ? res : res?.results || []
    return list.map(normalizeUser)
  }

  async createUser(payload: UserCreatePayload): Promise<UserProfile> {
    const res = await http.post<any>('/api/v1/auth/users/', payload)
    return normalizeUser(res)
  }

  async updateUser(id: number, payload: UserUpdatePayload): Promise<UserProfile> {
    const res = await http.patch<any>(`/api/v1/auth/users/${id}/`, payload)
    return normalizeUser(res)
  }

  async deleteUser(id: number): Promise<void> {
    await http.delete(`/api/v1/auth/users/${id}/`)
  }
}

export const authService = new AuthService()
export default authService
