// API Service for CalleViva

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

interface AuthResponse {
  token: string
  player: {
    id: string
    email: string
    display_name?: string
    avatar_url?: string
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
}
