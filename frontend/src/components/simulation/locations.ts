// locations.ts - Configuraciones de locaciones estilo premium
// Cada locación define sus elementos de fondo, tipos de clientes, y características

import { LocationConfig } from './types'

// ============================================
// UNIVERSIDAD (UCR) - Demo principal
// ============================================
export const UNIVERSIDAD_LOCATION: LocationConfig = {
  code: 'ucr',
  name: 'Universidad',
  icon: '🏫',
  description: 'Campus universitario lleno de estudiantes hambrientos',

  backgroundElements: [
    { emoji: '🏛️', size: 'xl', position: 'left', depth: 'mid', offsetY: 4 },
    { emoji: '🌳', size: 'lg', position: 'center-left', depth: 'far', offsetY: 8 },
    { emoji: '🏫', size: '2xl', position: 'center', depth: 'near', offsetY: 0 },
    { emoji: '📚', size: 'md', position: 'center-right', depth: 'far', offsetY: 12 },
    { emoji: '🌴', size: 'lg', position: 'right', depth: 'mid', offsetY: 6 },
  ],

  customerTypes: ['student_f', 'student_m', 'office_m', 'office_f', 'chef'],

  rushHours: [
    { start: 7, end: 9, multiplier: 2.0 },   // Antes de clases
    { start: 11, end: 14, multiplier: 3.0 }, // Almuerzo
    { start: 17, end: 19, multiplier: 1.5 }, // Salida de clases
  ],

  baseCustomerRate: 0.05,
  priceMultiplier: 0.9, // Estudiantes = precios más bajos
}

// ============================================
// MERCADO CENTRAL
// ============================================
export const MERCADO_CENTRAL_LOCATION: LocationConfig = {
  code: 'mercado_central',
  name: 'Mercado Central',
  icon: '🏪',
  description: 'El corazón gastronómico de San José',

  backgroundElements: [
    { emoji: '🏬', size: 'xl', position: 'left', depth: 'near', offsetY: 2 },
    { emoji: '🍎', size: 'md', position: 'center-left', depth: 'far', offsetY: 16 },
    { emoji: '🏛️', size: '2xl', position: 'center', depth: 'mid', offsetY: 0 },
    { emoji: '🥬', size: 'md', position: 'center-right', depth: 'far', offsetY: 14 },
    { emoji: '🏢', size: 'lg', position: 'right', depth: 'mid', offsetY: 8 },
  ],

  customerTypes: ['senior_m', 'senior_f', 'worker', 'office_m', 'tourist'],

  rushHours: [
    { start: 6, end: 9, multiplier: 2.5 },   // Madrugadores
    { start: 11, end: 13, multiplier: 2.0 }, // Almuerzo
  ],

  baseCustomerRate: 0.08,
  priceMultiplier: 1.0,
}

// ============================================
// PLAYA JACÓ
// ============================================
export const JACO_LOCATION: LocationConfig = {
  code: 'jaco',
  name: 'Playa Jacó',
  icon: '🏖️',
  description: 'Sol, arena y turistas con hambre',

  backgroundElements: [
    { emoji: '🌴', size: 'xl', position: 'left', depth: 'near', offsetY: -10 },
    { emoji: '🏄', size: 'md', position: 'center-left', depth: 'far', offsetY: 20 },
    { emoji: '🌊', size: '2xl', position: 'center', depth: 'mid', offsetY: 10 },
    { emoji: '☂️', size: 'lg', position: 'center-right', depth: 'mid', offsetY: 8 },
    { emoji: '🌴', size: 'xl', position: 'right', depth: 'near', offsetY: -8 },
  ],

  customerTypes: ['tourist', 'kid', 'student_f', 'student_m'],

  rushHours: [
    { start: 11, end: 15, multiplier: 2.5 }, // Mediodía caliente
    { start: 17, end: 20, multiplier: 2.0 }, // Atardecer
  ],

  baseCustomerRate: 0.06,
  priceMultiplier: 1.3, // Turistas = precios más altos
}

// ============================================
// ESTADIO SAPRISSA
// ============================================
export const SAPRISSA_LOCATION: LocationConfig = {
  code: 'saprissa',
  name: 'Estadio Saprissa',
  icon: '🏟️',
  description: 'El Monstruo Morado y sus fanáticos',

  backgroundElements: [
    { emoji: '🏟️', size: '2xl', position: 'center', depth: 'near', offsetY: -20 },
    { emoji: '💜', size: 'lg', position: 'left', depth: 'mid', offsetY: 10 },
    { emoji: '⚽', size: 'md', position: 'center-left', depth: 'far', offsetY: 18 },
    { emoji: '🎺', size: 'md', position: 'center-right', depth: 'far', offsetY: 16 },
    { emoji: '💜', size: 'lg', position: 'right', depth: 'mid', offsetY: 8 },
  ],

  customerTypes: ['worker', 'student_m', 'senior_m', 'kid'],

  rushHours: [
    { start: 18, end: 22, multiplier: 4.0 }, // Partido!
  ],

  baseCustomerRate: 0.03, // Bajo fuera de partidos
  priceMultiplier: 1.2,
}

// ============================================
// FERIA DEL AGRICULTOR
// ============================================
export const FERIA_LOCATION: LocationConfig = {
  code: 'feria_agricultor',
  name: 'Feria del Agricultor',
  icon: '🥕',
  description: 'Productos frescos y ambiente familiar',

  backgroundElements: [
    { emoji: '🎪', size: 'xl', position: 'left', depth: 'near', offsetY: 0 },
    { emoji: '🥕', size: 'md', position: 'center-left', depth: 'far', offsetY: 16 },
    { emoji: '🍊', size: 'lg', position: 'center', depth: 'mid', offsetY: 8 },
    { emoji: '🥬', size: 'md', position: 'center-right', depth: 'far', offsetY: 14 },
    { emoji: '🎪', size: 'xl', position: 'right', depth: 'near', offsetY: 2 },
  ],

  customerTypes: ['senior_f', 'senior_m', 'office_f', 'kid'],

  rushHours: [
    { start: 6, end: 10, multiplier: 3.0 }, // Mañana temprano
  ],

  baseCustomerRate: 0.07,
  priceMultiplier: 0.85, // Competencia = precios bajos
}

// ============================================
// AEROPUERTO
// ============================================
export const AEROPUERTO_LOCATION: LocationConfig = {
  code: 'aeropuerto',
  name: 'Aeropuerto',
  icon: '✈️',
  description: 'Viajeros de todo el mundo',

  backgroundElements: [
    { emoji: '🛫', size: 'xl', position: 'left', depth: 'far', offsetY: -30 },
    { emoji: '🧳', size: 'md', position: 'center-left', depth: 'mid', offsetY: 12 },
    { emoji: '🏢', size: '2xl', position: 'center', depth: 'near', offsetY: 0 },
    { emoji: '🛬', size: 'lg', position: 'center-right', depth: 'far', offsetY: -20 },
    { emoji: '🚕', size: 'md', position: 'right', depth: 'mid', offsetY: 16 },
  ],

  customerTypes: ['tourist', 'office_m', 'office_f'],

  rushHours: [
    { start: 5, end: 8, multiplier: 2.0 },   // Vuelos mañaneros
    { start: 12, end: 15, multiplier: 1.5 }, // Vuelos de medio día
    { start: 18, end: 22, multiplier: 2.0 }, // Vuelos nocturnos
  ],

  baseCustomerRate: 0.04,
  priceMultiplier: 1.5, // Aeropuerto = precios premium
}

// ============================================
// PARQUE LA SABANA
// ============================================
export const SABANA_LOCATION: LocationConfig = {
  code: 'sabana',
  name: 'Parque La Sabana',
  icon: '🌳',
  description: 'Deportistas y familias disfrutando',

  backgroundElements: [
    { emoji: '🌲', size: 'xl', position: 'left', depth: 'near', offsetY: 0 },
    { emoji: '🏃', size: 'md', position: 'center-left', depth: 'far', offsetY: 18 },
    { emoji: '🌳', size: '2xl', position: 'center', depth: 'mid', offsetY: 4 },
    { emoji: '⚽', size: 'md', position: 'center-right', depth: 'far', offsetY: 16 },
    { emoji: '🌲', size: 'xl', position: 'right', depth: 'near', offsetY: 2 },
  ],

  customerTypes: ['worker', 'student_m', 'student_f', 'kid', 'senior_m'],

  rushHours: [
    { start: 6, end: 8, multiplier: 2.0 },   // Corredores mañaneros
    { start: 16, end: 19, multiplier: 2.5 }, // Después del trabajo
  ],

  baseCustomerRate: 0.05,
  priceMultiplier: 1.0,
}

// ============================================
// BARRIO ESCALANTE
// ============================================
export const ESCALANTE_LOCATION: LocationConfig = {
  code: 'escalante',
  name: 'Barrio Escalante',
  icon: '🍽️',
  description: 'El barrio gastronómico de moda',

  backgroundElements: [
    { emoji: '🏠', size: 'lg', position: 'left', depth: 'mid', offsetY: 6 },
    { emoji: '☕', size: 'md', position: 'center-left', depth: 'far', offsetY: 14 },
    { emoji: '🏡', size: 'xl', position: 'center', depth: 'near', offsetY: 2 },
    { emoji: '🍷', size: 'md', position: 'center-right', depth: 'far', offsetY: 12 },
    { emoji: '🏠', size: 'lg', position: 'right', depth: 'mid', offsetY: 8 },
  ],

  customerTypes: ['office_f', 'office_m', 'chef', 'tourist'],

  rushHours: [
    { start: 12, end: 14, multiplier: 2.0 }, // Almuerzo
    { start: 19, end: 22, multiplier: 3.0 }, // Cena
  ],

  baseCustomerRate: 0.04,
  priceMultiplier: 1.4, // Zona premium
}

// ============================================
// Mapa de todas las locaciones
// ============================================
export const ALL_LOCATIONS: Record<string, LocationConfig> = {
  ucr: UNIVERSIDAD_LOCATION,
  mercado_central: MERCADO_CENTRAL_LOCATION,
  jaco: JACO_LOCATION,
  saprissa: SAPRISSA_LOCATION,
  feria_agricultor: FERIA_LOCATION,
  aeropuerto: AEROPUERTO_LOCATION,
  sabana: SABANA_LOCATION,
  escalante: ESCALANTE_LOCATION,
}

// Helper para obtener locación por código
export const getLocation = (code: string): LocationConfig => {
  return ALL_LOCATIONS[code] || UNIVERSIDAD_LOCATION
}
