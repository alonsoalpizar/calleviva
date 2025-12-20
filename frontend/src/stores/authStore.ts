// Auth Store - Zustand

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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
  _hasHydrated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
  clearError: () => void
  checkAuth: () => Promise<void>
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      player: null,
      token: null,
      isLoading: true, // Start as loading until hydration completes
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

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
        localStorage.removeItem('calleviva-auth') // Clear Zustand persist too
        set({ player: null, token: null, error: null })
      },

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        // Get token from state or localStorage
        let token = get().token || localStorage.getItem('token')

        // Also try Zustand persist storage if not found
        if (!token) {
          try {
            const zustandData = localStorage.getItem('calleviva-auth')
            if (zustandData) {
              const parsed = JSON.parse(zustandData)
              token = parsed.state?.token || null
            }
          } catch {
            // ignore parse errors
          }
        }

        if (!token) {
          set({ isLoading: false })
          return
        }

        // Sync token to localStorage for API calls
        localStorage.setItem('token', token)

        set({ isLoading: true })
        try {
          const player = await api.auth.me()
          set({ player, token, isLoading: false })
        } catch {
          // Clear ALL token storages on auth failure
          localStorage.removeItem('token')
          localStorage.removeItem('calleviva-auth')
          set({ player: null, token: null, isLoading: false })
        }
      },
    }),
    {
      name: 'calleviva-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Called when hydration completes
        if (state) {
          state.setHasHydrated(true)
          // Auto-check auth after hydration if we have a token
          if (state.token) {
            state.checkAuth()
          } else {
            // No token, stop loading
            useAuthStore.setState({ isLoading: false })
          }
        }
      },
    }
  )
)
