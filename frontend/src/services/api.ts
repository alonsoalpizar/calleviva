// API Service for CalleViva

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

interface AuthResponse {
  token: string
  player: {
    id: string
    email: string
    display_name?: string
    avatar_url?: string
    is_admin: boolean
    created_at: string
  }
}

interface ApiError {
  error: string
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as ApiError).error || 'Request failed')
  }

  return data as T
}

export const api = {
  auth: {
    register: (email: string, password: string, displayName?: string) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName }),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    me: () => request<AuthResponse['player']>('/auth/me'),
  },

  health: () => request<{ status: string }>('/health'),

  // Public parameters (read-only)
  parameters: {
    list: (category?: string) =>
      request<ParametersResponse>(`/parameters${category ? `?category=${category}` : ''}`),
    categories: () => request<{ categories: string[] }>('/parameters/categories'),
  },

  // Games endpoints
  games: {
    list: () => request<GamesResponse>('/games'),
    get: (id: string) => request<GameSession>(`/games/${id}`),
    create: (data: CreateGame) =>
      request<GameSession>('/games', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdateGame) =>
      request<GameSession>(`/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/games/${id}`, {
        method: 'DELETE',
      }),
  },

  // Admin endpoints
  admin: {
    parameters: {
      list: (category?: string) =>
        request<ParametersResponse>(`/admin/parameters${category ? `?category=${category}` : ''}`),
      get: (id: string) => request<Parameter>(`/admin/parameters/${id}`),
      create: (data: CreateParameter) =>
        request<Parameter>('/admin/parameters', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: UpdateParameter) =>
        request<Parameter>(`/admin/parameters/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<{ message: string }>(`/admin/parameters/${id}`, {
          method: 'DELETE',
        }),
    },
  },
}

// Types
interface Parameter {
  id: string
  category: string
  code: string
  name: string
  description?: string
  icon?: string
  config?: Record<string, unknown>
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ParametersResponse {
  parameters: Parameter[]
  total: number
}

interface CreateParameter {
  category: string
  code: string
  name: string
  description?: string
  icon?: string
  config?: Record<string, unknown>
  sort_order?: number
  is_active?: boolean
}

interface UpdateParameter {
  name?: string
  description?: string
  icon?: string
  config?: Record<string, unknown>
  sort_order?: number
  is_active?: boolean
}

// Game types
interface GameSession {
  id: string
  player_id: string
  world_type: string
  name?: string
  game_day: number
  money: number
  reputation: number
  current_location?: string
  weather: string
  status: string
  stats?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface GamesResponse {
  games: GameSession[]
  total: number
}

interface CreateGame {
  world_type: string
  name?: string
}

interface UpdateGame {
  name?: string
  game_day?: number
  money?: number
  reputation?: number
  current_location?: string
  weather?: string
  status?: string
  stats?: Record<string, unknown>
}

export type { Parameter, ParametersResponse, CreateParameter, UpdateParameter, GameSession, GamesResponse, CreateGame, UpdateGame }
