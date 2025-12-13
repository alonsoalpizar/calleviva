// Auth Store - Zustand

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

interface Player {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
}

interface AuthState {
  player: Player | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      player: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { token, player } = await api.auth.login(email, password)
          localStorage.setItem('token', token)
          set({ player, token, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
          throw err
        }
      },

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null })
        try {
          const { token, player } = await api.auth.register(email, password, displayName)
          localStorage.setItem('token', token)
          set({ player, token, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ player: null, token: null, error: null })
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token')
        if (!token) return

        set({ isLoading: true })
        try {
          const player = await api.auth.me()
          set({ player, token, isLoading: false })
        } catch {
          localStorage.removeItem('token')
          set({ player: null, token: null, isLoading: false })
        }
      },
    }),
    {
      name: 'calleviva-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
