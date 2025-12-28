// types.ts - Types for 3D game components

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface Customer3DState {
  id: string
  position: Position3D
  targetPosition: Position3D
  state: 'walking' | 'waiting' | 'ordering' | 'leaving'
  type: CustomerType3D
  orderTime?: number
}

export interface CustomerType3D {
  name: string
  modelPath?: string
  color: string
  scale: number
}

export interface FoodTruck3DConfig {
  position: Position3D
  rotation: number
  color: string
  name: string
  open: boolean
}

export interface Game3DState {
  customers: Customer3DState[]
  truck: FoodTruck3DConfig
  time: number // 0-24 hours
  weather: 'sunny' | 'cloudy' | 'rainy'
  money: number
  dayNumber: number
}

// Customer types available
export const CUSTOMER_TYPES: CustomerType3D[] = [
  { name: 'Estudiante', color: '#4FC3F7', scale: 0.8 },
  { name: 'Oficinista', color: '#7986CB', scale: 1.0 },
  { name: 'Turista', color: '#FFB74D', scale: 0.9 },
  { name: 'Abuelito', color: '#A1887F', scale: 0.85 },
  { name: 'Deportista', color: '#81C784', scale: 1.1 },
]

// Generate random customer
export const generateCustomer3D = (id: string, spawnZ: number = 8): Customer3DState => {
  const type = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)]
  const startX = (Math.random() - 0.5) * 6

  return {
    id,
    position: { x: startX, y: 0, z: spawnZ },
    targetPosition: { x: (Math.random() - 0.5) * 2, y: 0, z: 2 },
    state: 'walking',
    type,
  }
}
