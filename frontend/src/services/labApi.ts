// Laboratorio de Sabores API Service

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

// Types
export interface Ingredient {
  id: string
  type: 'default' | 'creator'
  name: string
  icon?: string
  base_cost?: number
}

export interface IngredientsResponse {
  default: Ingredient[]
  from_creator: Ingredient[]
}

export interface PlayerDish {
  id: string
  session_id: string
  player_id: string
  name: string
  description: string
  ingredients: Ingredient[]
  player_prompt?: string
  suggested_price: number
  suggested_popularity: number
  suggested_difficulty: 'facil' | 'medio' | 'dificil'
  tags: string[]
  player_price?: number
  is_in_menu: boolean
  times_sold: number
  total_revenue: number
  avg_satisfaction: number
  created_at: string
  updated_at: string
}

export interface GenerateDishRequest {
  ingredients: Ingredient[]
  player_prompt: string
}

export interface GenerateDishResponse {
  id: string
  name: string
  description: string
  suggested_price: number
  suggested_popularity: number
  suggested_difficulty: 'facil' | 'medio' | 'dificil'
  tags: string[]
  hits_remaining: number
}

export interface UsageResponse {
  hits_used: number
  max_hits: number
  hits_remaining: number
  is_unlimited: boolean
}

// Helper for authenticated requests
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
    throw new Error(data.error || 'Request failed')
  }

  return data as T
}

// Lab API
export const labApi = {
  // Get available ingredients (default + from Creator)
  getIngredients: (gameId: string) =>
    request<IngredientsResponse>(`/games/${gameId}/lab/ingredients`),

  // Generate a new dish with AI
  generateDish: (gameId: string, data: GenerateDishRequest) =>
    request<GenerateDishResponse>(`/games/${gameId}/lab/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get player's dishes for this game session
  getDishes: (gameId: string) =>
    request<PlayerDish[]>(`/games/${gameId}/lab/dishes`),

  // Get a single dish
  getDish: (gameId: string, dishId: string) =>
    request<PlayerDish>(`/games/${gameId}/lab/dishes/${dishId}`),

  // Update a dish (price, menu status)
  updateDish: (gameId: string, dishId: string, data: { player_price?: number; is_in_menu?: boolean }) =>
    request<{ message: string }>(`/games/${gameId}/lab/dishes/${dishId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete a dish
  deleteDish: (gameId: string, dishId: string) =>
    request<{ message: string }>(`/games/${gameId}/lab/dishes/${dishId}`, {
      method: 'DELETE',
    }),

  // Get AI usage stats
  getUsage: (gameId: string) =>
    request<UsageResponse>(`/games/${gameId}/lab/usage`),
}
