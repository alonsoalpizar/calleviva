// types.ts - Tipos para el sistema de simulación premium
// Arquitectura modular preparada para assets personalizados del creador

// ============================================
// Time & Weather
// ============================================
export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy'

export interface GameTime {
  hour: number    // 0-23
  minute: number  // 0-59
}

// ============================================
// Sky Configuration
// ============================================
export interface SkyConfig {
  timeOfDay: TimeOfDay
  weather: Weather
  showClouds?: boolean
  cloudCount?: number
}

export const SKY_GRADIENTS: Record<TimeOfDay, [string, string]> = {
  dawn: ['#FFADAD', '#FFD6A5'],
  morning: ['#87CEEB', '#E0F6FF'],
  noon: ['#4A90D9', '#87CEEB'],
  afternoon: ['#87CEEB', '#B0E0E6'],
  evening: ['#FF9F43', '#FFC300'],
  night: ['#1a1a2e', '#16213e'],
}

// ============================================
// Location Definition
// ============================================
export interface LocationConfig {
  code: string
  name: string
  icon: string
  description: string

  // Background elements (emojis o referencias a assets)
  backgroundElements: BackgroundElement[]

  // Customer types que aparecen en esta locación
  customerTypes: string[]

  // Rush hours (horas pico)
  rushHours: { start: number; end: number; multiplier: number }[]

  // Ambiente base
  baseCustomerRate: number  // Clientes por minuto base
  priceMultiplier: number   // Multiplicador de precios
}

export interface BackgroundElement {
  emoji: string
  size: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  position: 'left' | 'center-left' | 'center' | 'center-right' | 'right'
  depth: 'far' | 'mid' | 'near'  // Para parallax
  offsetY?: number  // Ajuste vertical
}

// ============================================
// Customer System
// ============================================
export interface CustomerType {
  id: string
  emoji: string
  name: string
  preferredProducts: string[]  // Códigos de productos preferidos
  patience: number  // Segundos de paciencia (1-10)
  tipChance: number  // Probabilidad de propina (0-1)
}

export interface Customer {
  id: string
  type: CustomerType
  arrivalTime: number
  state: 'arriving' | 'waiting' | 'served' | 'leaving_happy' | 'leaving_angry'
  preferredProduct: string
}

// ============================================
// Food Truck (preparado para assets del creador)
// ============================================
export interface TruckAsset {
  type: 'emoji' | 'svg' | 'image' | 'component'
  source: string  // Emoji, URL, o component name
  scale?: number
}

export interface TruckConfig {
  asset: TruckAsset
  name: string
  level: number
  capacity: number
  speed: number  // Velocidad de servicio

  // Stats visuales
  stats: {
    capacity: number
    speed: number
    appeal: number
  }
}

// ============================================
// Products & Inventory
// ============================================
export interface Product {
  code: string
  name: string
  emoji: string
  price: number
  cost: number
  prepTime: number  // Segundos de preparación
}

export interface InventoryItem {
  product: Product
  quantity: number
}

// ============================================
// Game State
// ============================================
export interface SimulationState {
  // Control
  playing: boolean
  speed: 1 | 2 | 5

  // Time
  time: GameTime
  dayNumber: number

  // Economy
  money: number
  sales: number
  revenue: number

  // Stats
  customersServed: number
  customersLost: number

  // Current
  inventory: Record<string, number>
  customersInQueue: Customer[]

  // Location
  location: LocationConfig
}

// ============================================
// Events & Notifications
// ============================================
export interface GameEvent {
  type: 'sale' | 'customer_arrived' | 'customer_left' | 'out_of_stock' | 'tip' | 'special'
  message: string
  icon: string
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple'
  timestamp: GameTime
}

export interface Notification {
  id: string
  title: string
  type: 'success' | 'warning' | 'error' | 'info'
  duration?: number
}

// ============================================
// Props for Components
// ============================================
export interface PremiumSceneProps {
  location: LocationConfig
  time: GameTime
  weather: Weather
  truck?: TruckConfig
  customers?: Customer[]
  onCustomerClick?: (customer: Customer) => void
  onTruckClick?: () => void
}

export interface HUDProps {
  location: LocationConfig
  time: GameTime
  weather: Weather
  money: number
  reputation: number
  sales: number
  dayNumber: number
  inventory: InventoryItem[]
  events: GameEvent[]
  playing: boolean
  speed: 1 | 2 | 5
  onPlayPause: () => void
  onSpeedChange: (speed: 1 | 2 | 5) => void
}

// ============================================
// Utility Functions
// ============================================
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour < 6) return 'night'
  if (hour < 8) return 'dawn'
  if (hour < 12) return 'morning'
  if (hour < 14) return 'noon'
  if (hour < 17) return 'afternoon'
  if (hour < 20) return 'evening'
  return 'night'
}

export function formatGameTime(time: GameTime): string {
  const h = time.hour.toString().padStart(2, '0')
  const m = time.minute.toString().padStart(2, '0')
  return `${h}:${m}`
}

export function getAmPm(hour: number): 'AM' | 'PM' {
  return hour >= 12 ? 'PM' : 'AM'
}

// Size mappings for emojis
export const EMOJI_SIZES: Record<string, string> = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-9xl',
  '2xl': 'text-[140px]',
}
