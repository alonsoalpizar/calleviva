// cityZones.ts - Definicion de zonas dentro de City_2.glb
// Cada zona representa una ubicacion jugable con caracteristicas unicas
// Modelo bounds: X: -199 to 344 (543 width), Z: -177 to 149 (326 depth)

export interface CityZone {
  id: string
  nombre: string
  descripcion: string
  icono: string
  center: [number, number, number]
  radius: number
  cameraPosition: [number, number, number]
  spawnPoints: [number, number, number][]
  truckSpot: [number, number, number]
  customerRate: number // clientes por minuto base
  priceMultiplier: number // multiplicador de precios
}

export const CITY_ZONES: Record<string, CityZone> = {
  // CENTRO - Area central de la ciudad
  centro: {
    id: 'centro',
    nombre: 'Centro de la Ciudad',
    descripcion: 'El corazon de la ciudad. Mucho trafico todo el dia.',
    icono: '🏛️',
    center: [70, 0, -15],
    radius: 60,
    cameraPosition: [70, 80, 60],
    spawnPoints: [
      [50, 0, -30],
      [90, 0, 0],
      [60, 0, 10],
      [80, 0, -40],
    ],
    truckSpot: [70, 0, 0],
    customerRate: 0.07,
    priceMultiplier: 1.0,
  },

  // ESTE - Zona hotelera/turistica
  este: {
    id: 'este',
    nombre: 'Zona Este - Hoteles',
    descripcion: 'Hoteles de lujo y turistas. Clientes premium.',
    icono: '🏨',
    center: [280, 0, -50],
    radius: 70,
    cameraPosition: [280, 90, 30],
    spawnPoints: [
      [260, 0, -70],
      [300, 0, -30],
      [270, 0, -20],
      [290, 0, -80],
    ],
    truckSpot: [280, 0, -40],
    customerRate: 0.04,
    priceMultiplier: 1.5,
  },

  // OESTE - Zona residencial
  oeste: {
    id: 'oeste',
    nombre: 'Zona Oeste - Residencial',
    descripcion: 'Barrios de casas y familias. Alto volumen.',
    icono: '🏠',
    center: [-120, 0, 0],
    radius: 70,
    cameraPosition: [-120, 80, 80],
    spawnPoints: [
      [-140, 0, -20],
      [-100, 0, 20],
      [-130, 0, 30],
      [-110, 0, -30],
    ],
    truckSpot: [-120, 0, 10],
    customerRate: 0.06,
    priceMultiplier: 0.85,
  },

  // NORTE - Zona industrial/comercial
  norte: {
    id: 'norte',
    nombre: 'Zona Norte - Comercial',
    descripcion: 'Bodegas y comercios. Trabajadores hambrientos.',
    icono: '🏭',
    center: [70, 0, -140],
    radius: 60,
    cameraPosition: [70, 80, -80],
    spawnPoints: [
      [50, 0, -160],
      [90, 0, -120],
      [60, 0, -130],
      [80, 0, -150],
    ],
    truckSpot: [70, 0, -130],
    customerRate: 0.05,
    priceMultiplier: 0.95,
  },

  // SUR - Zona de entretenimiento
  sur: {
    id: 'sur',
    nombre: 'Zona Sur - Parques',
    descripcion: 'Parques y areas verdes. Familias los fines de semana.',
    icono: '🌳',
    center: [70, 0, 100],
    radius: 60,
    cameraPosition: [70, 80, 170],
    spawnPoints: [
      [50, 0, 80],
      [90, 0, 120],
      [60, 0, 110],
      [80, 0, 90],
    ],
    truckSpot: [70, 0, 95],
    customerRate: 0.04,
    priceMultiplier: 1.1,
  },

  // PUERTO - Costa este
  puerto: {
    id: 'puerto',
    nombre: 'El Puerto',
    descripcion: 'Zona costera con vistas al mar. Turistas y pescadores.',
    icono: '⚓',
    center: [300, 0, 80],
    radius: 60,
    cameraPosition: [300, 70, 150],
    spawnPoints: [
      [280, 0, 60],
      [320, 0, 100],
      [290, 0, 90],
      [310, 0, 70],
    ],
    truckSpot: [300, 0, 75],
    customerRate: 0.03,
    priceMultiplier: 1.3,
  },
}

// Lista ordenada de zonas para UI
export const ZONE_LIST = Object.values(CITY_ZONES)

// Obtener zona por ID, con fallback a centro
export const getZone = (zoneId: string): CityZone => {
  return CITY_ZONES[zoneId] || CITY_ZONES.centro
}
