// cityZones.ts - Definicion de zonas dentro de City_2.glb
// Cada zona representa una ubicacion jugable con caracteristicas unicas
// Modelo bounds: X: -199 to 344 (543 width), Z: -177 to 149 (326 depth)

// Bounding box para filtrar meshes de la ciudad
export interface ZoneBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

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
  bounds?: ZoneBounds // bounding box para filtrar la ciudad
}

export const CITY_ZONES: Record<string, CityZone> = {
  // PLAYA - Puerto y playa costera (Este de la ciudad)
  playa: {
    id: 'playa',
    nombre: 'Zona Playa',
    descripcion: 'Puerto y playa costera. Turistas y pescadores.',
    icono: '🏖️',
    center: [190, 0, -10],
    radius: 90,
    cameraPosition: [240, 50, 60],  // Panorámica desde sureste
    spawnPoints: [
      [150, 0, -40],
      [220, 0, 20],
      [180, 0, 30],
      [200, 0, -50],
    ],
    truckSpot: [190, 0, 0],
    customerRate: 0.04,
    priceMultiplier: 1.3,
    bounds: { minX: 100, maxX: 280, minZ: -80, maxZ: 60 },
  },

  // COMERCIAL - Cafes, bancos, tiendas
  comercial: {
    id: 'comercial',
    nombre: 'Zona Comercial',
    descripcion: 'Cafes, bancos y tiendas. Oficinistas y compradores.',
    icono: '🏪',
    center: [90, 0, -50],
    radius: 70,
    cameraPosition: [150, 55, 20],  // Panorámica desde sureste
    spawnPoints: [
      [50, 0, -80],
      [130, 0, -20],
      [80, 0, -30],
      [100, 0, -70],
    ],
    truckSpot: [90, 0, -40],
    customerRate: 0.06,
    priceMultiplier: 1.1,
    bounds: { minX: 20, maxX: 160, minZ: -100, maxZ: 0 },
  },

  // FINANCIERA - Rascacielos y centros de negocios
  financiera: {
    id: 'financiera',
    nombre: 'Zona Financiera',
    descripcion: 'Rascacielos y centros de negocios. Ejecutivos con presupuesto.',
    icono: '🏢',
    center: [25, 0, 0],
    radius: 75,
    cameraPosition: [90, 65, 70],  // Panorámica desde sureste
    spawnPoints: [
      [-20, 0, -30],
      [70, 0, 30],
      [30, 0, 40],
      [50, 0, -40],
    ],
    truckSpot: [25, 0, 10],
    customerRate: 0.05,
    priceMultiplier: 1.4,
    bounds: { minX: -50, maxX: 100, minZ: -60, maxZ: 60 },
  },

  // RESIDENCIAL NORTE - Casas y cottages
  residencial: {
    id: 'residencial',
    nombre: 'Zona Residencial',
    descripcion: 'Barrios de casas y cottages. Familias y vecinos.',
    icono: '🏠',
    center: [-100, 0, -120],
    radius: 70,
    cameraPosition: [-40, 55, -50],  // Panorámica desde sureste
    spawnPoints: [
      [-150, 0, -150],
      [-50, 0, -90],
      [-120, 0, -100],
      [-80, 0, -140],
    ],
    truckSpot: [-100, 0, -110],
    customerRate: 0.05,
    priceMultiplier: 0.9,
    bounds: { minX: -199, maxX: 0, minZ: -177, maxZ: -50 },
  },

  // PARQUE - Area verde con vegetacion
  parque: {
    id: 'parque',
    nombre: 'Zona Parque',
    descripcion: 'Area verde con vegetacion. Familias y deportistas.',
    icono: '🌳',
    center: [270, 0, -25],
    radius: 75,
    cameraPosition: [320, 50, 45],  // Panorámica desde sureste
    spawnPoints: [
      [230, 0, -70],
      [310, 0, 20],
      [260, 0, 0],
      [280, 0, -50],
    ],
    truckSpot: [270, 0, -15],
    customerRate: 0.04,
    priceMultiplier: 1.0,
    bounds: { minX: 200, maxX: 344, minZ: -100, maxZ: 50 },
  },

  // CENTRO - Area central mixta
  centro: {
    id: 'centro',
    nombre: 'Centro de Ciudad',
    descripcion: 'El corazon de la ciudad. Mucho trafico todo el dia.',
    icono: '🏛️',
    center: [50, 0, 15],
    radius: 100,
    cameraPosition: [120, 60, 90],  // Panorámica desde sureste
    spawnPoints: [
      [0, 0, -20],
      [100, 0, 50],
      [50, 0, 60],
      [80, 0, -30],
    ],
    truckSpot: [50, 0, 20],
    customerRate: 0.07,
    priceMultiplier: 1.0,
    bounds: { minX: -50, maxX: 150, minZ: -50, maxZ: 80 },
  },
}

// Lista de zonas para UI (todas son ligeras, ya no hay ciudad completa)
export const ZONE_LIST = Object.values(CITY_ZONES)

// Alias para compatibilidad (ya no hay diferencia)
export const EDITOR_ZONES = ZONE_LIST

// Obtener zona por ID, con fallback a centro
export const getZone = (zoneId: string): CityZone => {
  return CITY_ZONES[zoneId] || CITY_ZONES.centro
}
