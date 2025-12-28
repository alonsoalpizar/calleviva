// Simulation components - Export all
// Sistema de simulación premium para CalleViva

// Types
export * from './types'

// Locations
export * from './locations'

// Components
export { default as SkyLayer } from './SkyLayer'
export { default as FoodTruckSlot } from './FoodTruckSlot'
export { default as CustomerQueue, generateRandomCustomer, createSalePopup, DEFAULT_CUSTOMER_TYPES } from './CustomerQueue'
export { default as PremiumLocationScene } from './PremiumLocationScene'
export { default as SimulationHUD } from './SimulationHUD'
export { default as GameSimulationDemo } from './GameSimulationDemo'
