// Mercado API Service

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

// Types
export interface MarketIngredient {
  code: string
  name: string
  icon?: string
  cost: number
  tier: 'basic' | 'common' | 'premium' | 'special'
  type?: string
  tags?: string[]
  owned: boolean
  source?: string
  creator_name?: string
}

export interface CatalogStats {
  total_available: number
  owned: number
  basic_owned: number
  common_owned: number
  premium_owned: number
  special_owned: number
}

export interface CatalogResponse {
  ingredients: MarketIngredient[]
  player_money: number
  stats: CatalogStats
}

export interface InventoryResponse {
  ingredients: MarketIngredient[]
  total: number
}

export interface BuyResponse {
  success: boolean
  message: string
  new_balance: number
  ingredient_code: string
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

// Market API
export const marketApi = {
  // Get full catalog with owned status
  getCatalog: (gameId: string) =>
    request<CatalogResponse>(`/games/${gameId}/market/catalog`),

  // Get only owned ingredients
  getInventory: (gameId: string) =>
    request<InventoryResponse>(`/games/${gameId}/market/inventory`),

  // Buy an ingredient
  buyIngredient: (gameId: string, ingredientCode: string) =>
    request<BuyResponse>(`/games/${gameId}/market/buy`, {
      method: 'POST',
      body: JSON.stringify({ ingredient_code: ingredientCode }),
    }),
}
