// LocationCreator.tsx - Creador de Locaciones 3D para CalleViva
// Permite colocar y posicionar assets de ciudad para crear escenarios de juego

import React, { useState, Suspense, useRef, useCallback } from 'react'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html, Grid } from '@react-three/drei'
import * as THREE from 'three'

// ==================== CONFIGURACION ====================
// Pack de assets: 'original' = Cartoon_City_Free, 'cityfull' = CityFull (427 assets)
const ASSET_PACK = 'cityfull' as const
const CITY_ASSETS_PATH = ASSET_PACK === 'cityfull'
  ? '/assets/models/City/CityFull/Separate_assets_glb'
  : '/assets/models/City/Separate_assets_glb'

// ==================== TIPOS ====================
interface Asset3D {
  id: string
  nombre: string
  archivo: string
}

interface Categoria3D {
  id: string
  nombre: string
  icono: string
  assets: Asset3D[]
}

interface PlacedObject {
  id: string
  assetId: string
  archivo: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

interface LocationData {
  id: string
  nombre: string
  descripcion: string
  groundColor: string
  groundSize: number
  objetos: PlacedObject[]
  spawnPoints: [number, number, number][]
  truckSpot: [number, number, number]
}

// ==================== CATALOGO DE ASSETS DE CIUDAD (CityFull Pack - 427 assets) ====================
// Funcion helper para generar assets numerados
const generateAssets = (prefix: string, nombre: string, count: number, start = 1): Asset3D[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}_${String(i + start).padStart(3, '0')}`,
    nombre: `${nombre} ${i + start}`,
    archivo: `${prefix}_${String(i + start).padStart(3, '0')}.glb`,
  }))

const CATEGORIAS_CIUDAD: Categoria3D[] = [
  // === EDIFICIOS ===
  {
    id: 'skyscrapers',
    nombre: 'Rascacielos',
    icono: '🏙️',
    assets: generateAssets('skyscraper', 'Rascacielos', 10),
  },
  {
    id: 'hotels',
    nombre: 'Hoteles',
    icono: '🏨',
    assets: generateAssets('hotel', 'Hotel', 10),
  },
  {
    id: 'business',
    nombre: 'Oficinas',
    icono: '🏢',
    assets: generateAssets('business_center', 'Centro Empresarial', 10),
  },
  {
    id: 'houses_small',
    nombre: 'Casas',
    icono: '🏠',
    assets: [
      ...generateAssets('house_small_1', 'Casa Pequeña A', 10),
      ...generateAssets('house_small_2', 'Casa Pequeña B', 10),
      ...generateAssets('cottage', 'Cottage', 10),
    ],
  },
  {
    id: 'houses_medium',
    nombre: 'Casas Medianas',
    icono: '🏡',
    assets: [
      ...generateAssets('house_middle', 'Casa Mediana', 10),
      ...generateAssets('house_high', 'Casa Alta', 10),
      ...generateAssets('house_art', 'Casa Artística', 10),
      ...generateAssets('house_purpose', 'Casa Especial', 10),
    ],
  },
  {
    id: 'commercial',
    nombre: 'Comercios',
    icono: '🛒',
    assets: [
      ...generateAssets('supermarket', 'Supermercado', 10),
      ...generateAssets('cafe', 'Café', 10),
      ...generateAssets('services_store', 'Tienda', 10),
      ...generateAssets('bank', 'Banco', 10),
    ],
  },
  {
    id: 'special',
    nombre: 'Especiales',
    icono: '⛪',
    assets: [
      ...generateAssets('temple', 'Templo', 10),
      ...generateAssets('stadium', 'Estadio', 10),
    ],
  },
  // === VEHICULOS ===
  {
    id: 'cars_sport',
    nombre: 'Autos Deportivos',
    icono: '🏎️',
    assets: [
      ...generateAssets('transport_sport', 'Deportivo', 9),
      ...generateAssets('transport_cool', 'Auto Cool', 10),
    ],
  },
  {
    id: 'cars_classic',
    nombre: 'Autos Clásicos',
    icono: '🚗',
    assets: generateAssets('transport_old', 'Clásico', 13),
  },
  {
    id: 'trucks',
    nombre: 'Camiones',
    icono: '🚚',
    assets: [
      ...generateAssets('transport_truck', 'Camión', 15),
      ...generateAssets('transport_purpose', 'Utilitario', 10),
    ],
  },
  {
    id: 'buses',
    nombre: 'Buses/Jeeps',
    icono: '🚌',
    assets: [
      ...generateAssets('transport_bus', 'Bus', 10),
      ...generateAssets('transport_jeep', 'Jeep', 11),
    ],
  },
  {
    id: 'boats',
    nombre: 'Barcos',
    icono: '🚤',
    assets: generateAssets('transport_water', 'Barco', 10),
  },
  {
    id: 'aircraft',
    nombre: 'Aéreos',
    icono: '✈️',
    assets: generateAssets('transport_air', 'Aeronave', 10),
  },
  // === TILES Y CALLES ===
  {
    id: 'roads',
    nombre: 'Calles',
    icono: '🛣️',
    assets: [
      ...generateAssets('road_tile_1x1', 'Calle 1x1', 13),
      ...generateAssets('road_tile_2x2', 'Calle 2x2', 8),
    ],
  },
  {
    id: 'bridges',
    nombre: 'Puentes',
    icono: '🌉',
    assets: [
      ...generateAssets('road_tile_bridge_1x1', 'Puente 1x1', 5),
      ...generateAssets('road_tile_bridge_2x2', 'Puente 2x2', 9),
      ...generateAssets('bridge_road', 'Camino Puente', 3),
      ...generateAssets('bridge_shroud', 'Cubierta Puente', 2),
      ...generateAssets('bridge_tower', 'Torre Puente', 2),
    ],
  },
  {
    id: 'rivers',
    nombre: 'Ríos',
    icono: '🌊',
    assets: [
      ...generateAssets('road_tile_river_1x1', 'Río 1x1', 4),
      ...generateAssets('road_tile_river_2x2', 'Río 2x2', 11),
    ],
  },
  {
    id: 'tiles_home',
    nombre: 'Tiles Casa',
    icono: '🏗️',
    assets: [
      ...generateAssets('tile_for_home_1x1', 'Tile Casa 1x1', 23),
      ...generateAssets('tile_for_home_2x2', 'Tile Casa 2x2', 8),
    ],
  },
  {
    id: 'tiles_special',
    nombre: 'Tiles Especiales',
    icono: '🏖️',
    assets: [
      ...generateAssets('beach_tile_1x1', 'Playa', 9),
      ...generateAssets('parking_tile_2x2', 'Parking', 4),
      ...generateAssets('port_tile_1x1', 'Puerto 1x1', 6),
      ...generateAssets('port_tile_2x2', 'Puerto 2x2', 3),
    ],
  },
  // === VEGETACION Y PROPS ===
  {
    id: 'vegetation',
    nombre: 'Vegetación',
    icono: '🌳',
    assets: generateAssets('vegetation', 'Vegetación', 12),
  },
  {
    id: 'parks',
    nombre: 'Parques',
    icono: '🌲',
    assets: [
      ...generateAssets('park', 'Parque', 10),
      ...generateAssets('landscape_entertainment', 'Entretenimiento', 10),
    ],
  },
  {
    id: 'furniture',
    nombre: 'Mobiliario',
    icono: '🪑',
    assets: [
      ...generateAssets('bench', 'Banca', 3),
      ...generateAssets('pillar', 'Pilar', 10),
      ...generateAssets('phone_box', 'Cabina Tel.', 2),
      ...generateAssets('trash', 'Basurero', 5),
      { id: 'fire_hydrant_001', nombre: 'Hidrante', archivo: 'fire_hydrant_001.glb' },
      { id: 'table_001', nombre: 'Mesa', archivo: 'table_001.glb' },
      { id: 'sunbed_001', nombre: 'Camastro', archivo: 'sunbed_001.glb' },
    ],
  },
  {
    id: 'rails',
    nombre: 'Vías',
    icono: '🚃',
    assets: generateAssets('rail', 'Vía', 4),
  },
]

// ==================== COMPONENTES 3D ====================

// Asset individual colocado en la escena
const PlacedAsset: React.FC<{
  objeto: PlacedObject
  selected: boolean
  onClick: () => void
}> = ({ objeto, onClick }) => {
  const { scene } = useGLTF(`${CITY_ASSETS_PATH}/${objeto.archivo}`)
  const clonedScene = scene.clone()

  return (
    <primitive
      object={clonedScene}
      position={objeto.position}
      rotation={objeto.rotation}
      scale={objeto.scale}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onClick()
      }}
    />
  )
}

// Suelo/Ground - clickeable para posicionar objetos
const Ground: React.FC<{
  size: number
  color: string
  onGroundClick?: (point: THREE.Vector3) => void
}> = ({ size, color, onGroundClick }) => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, -0.01, 0]}
    receiveShadow
    onClick={(e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (onGroundClick) {
        onGroundClick(e.point)
      }
    }}
  >
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={color} />
  </mesh>
)

// Ciudad completa pre-armada (City_2.glb)
const CompleteCityModel: React.FC<{
  position?: [number, number, number]
  scale?: number
}> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF('/assets/models/City/CityFull/City_2.glb')
  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
    />
  )
}

// Marcador de posicion del truck
const TruckSpotMarker: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <circleGeometry args={[2, 32]} />
      <meshBasicMaterial color="#FF6B35" transparent opacity={0.5} />
    </mesh>
    <Html center position={[0, 1, 0]}>
      <div className="bg-coral text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
        🚚 Food Truck
      </div>
    </Html>
  </group>
)

// ==================== COMPONENTE PRINCIPAL ====================
export const LocationCreator: React.FC = () => {
  // Estado de la locacion
  const [locationName, setLocationName] = useState('Nueva Locacion')
  const [locationDesc, setLocationDesc] = useState('Descripcion de la locacion')
  const [groundColor, setGroundColor] = useState('#4a5568')
  const [groundSize, setGroundSize] = useState(100)

  // Objetos colocados
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [truckSpot, setTruckSpot] = useState<[number, number, number]>([0, 0, 0])

  // UI state
  const [activeCategory, setActiveCategory] = useState('skyscrapers')
  const [showGrid, setShowGrid] = useState(true)
  const [showCompleteCity, setShowCompleteCity] = useState(false)

  // Contador para IDs unicos
  const objectIdCounter = useRef(0)

  // Agregar objeto a la escena
  const addObject = useCallback((asset: Asset3D) => {
    objectIdCounter.current += 1
    const newObject: PlacedObject = {
      id: `obj_${objectIdCounter.current}`,
      assetId: asset.id,
      archivo: asset.archivo,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
    }
    setPlacedObjects(prev => [...prev, newObject])
    setSelectedObjectId(newObject.id)
  }, [])

  // Eliminar objeto seleccionado
  const deleteSelected = useCallback(() => {
    if (selectedObjectId) {
      setPlacedObjects(prev => prev.filter(o => o.id !== selectedObjectId))
      setSelectedObjectId(null)
    }
  }, [selectedObjectId])

  // Duplicar objeto seleccionado
  const duplicateSelected = useCallback(() => {
    if (!selectedObjectId) return
    const obj = placedObjects.find(o => o.id === selectedObjectId)
    if (!obj) return

    objectIdCounter.current += 1
    const newObject: PlacedObject = {
      ...obj,
      id: `obj_${objectIdCounter.current}`,
      position: [obj.position[0] + 2, obj.position[1], obj.position[2] + 2],
    }
    setPlacedObjects(prev => [...prev, newObject])
    setSelectedObjectId(newObject.id)
  }, [selectedObjectId, placedObjects])

  // Actualizar posicion de objeto
  const updateObjectPosition = useCallback((id: string, position: [number, number, number]) => {
    setPlacedObjects(prev =>
      prev.map(o => (o.id === id ? { ...o, position } : o))
    )
  }, [])

  // Actualizar rotacion de objeto
  const updateObjectRotation = useCallback((id: string, rotation: [number, number, number]) => {
    setPlacedObjects(prev =>
      prev.map(o => (o.id === id ? { ...o, rotation } : o))
    )
  }, [])

  // Actualizar escala de objeto
  const updateObjectScale = useCallback((id: string, scale: number) => {
    setPlacedObjects(prev =>
      prev.map(o => (o.id === id ? { ...o, scale } : o))
    )
  }, [])

  // ==================== GENERADOR DE CIUDAD PROCEDURAL ====================
  // Genera una ciudad completa con calles, edificios y decoración conectados
  const generateProceduralCity = useCallback((gridSize: number = 7, cellSize: number = 8) => {
    const objects: PlacedObject[] = []
    let id = 0
    const nextId = () => `city_${++id}`

    // Helpers
    const getAssets = (catId: string) => CATEGORIAS_CIUDAD.find(c => c.id === catId)?.assets || []
    const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

    // Offset para centrar la ciudad
    const offset = (gridSize * cellSize) / 2

    // 1. DEFINIR LAYOUT DE LA CIUDAD (qué hay en cada celda)
    // 'R' = Road, 'B' = Building, 'P' = Park, 'X' = Intersection
    const layout: string[][] = []
    for (let z = 0; z < gridSize; z++) {
      layout[z] = []
      for (let x = 0; x < gridSize; x++) {
        // Calles principales en filas 2 y 4, columnas 2 y 4
        const isMainRoadX = x === 2 || x === 4
        const isMainRoadZ = z === 2 || z === 4

        if (isMainRoadX && isMainRoadZ) {
          layout[z][x] = 'X' // Intersección
        } else if (isMainRoadX || isMainRoadZ) {
          layout[z][x] = 'R' // Calle
        } else if ((x === 3 && z === 3)) {
          layout[z][x] = 'P' // Parque central
        } else {
          layout[z][x] = 'B' // Edificio
        }
      }
    }

    // 2. COLOCAR TILES DE SUELO según el layout
    for (let z = 0; z < gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        const posX = x * cellSize - offset + cellSize / 2
        const posZ = z * cellSize - offset + cellSize / 2
        const cell = layout[z][x]

        if (cell === 'X') {
          // Intersección - usar tile 2x2
          const tile = randomFrom(getAssets('roads').filter(a => a.id.includes('2x2')))
          if (tile) {
            objects.push({
              id: nextId(), assetId: tile.id, archivo: tile.archivo,
              position: [posX, 0, posZ], rotation: [0, 0, 0], scale: 1
            })
          }
        } else if (cell === 'R') {
          // Calle - determinar orientación
          const isVertical = x === 2 || x === 4
          const tile = randomFrom(getAssets('roads').filter(a => a.id.includes('1x1')))
          if (tile) {
            objects.push({
              id: nextId(), assetId: tile.id, archivo: tile.archivo,
              position: [posX, 0, posZ], rotation: [0, isVertical ? 0 : Math.PI / 2, 0], scale: 1
            })
          }
        } else if (cell === 'P') {
          // Parque
          const park = randomFrom(getAssets('parks'))
          if (park) {
            objects.push({
              id: nextId(), assetId: park.id, archivo: park.archivo,
              position: [posX, 0, posZ], rotation: [0, 0, 0], scale: 1
            })
          }
        } else {
          // Tile de casa/edificio
          const tile = randomFrom(getAssets('tiles_home').filter(a => a.id.includes('1x1')))
          if (tile) {
            objects.push({
              id: nextId(), assetId: tile.id, archivo: tile.archivo,
              position: [posX, 0, posZ], rotation: [0, Math.random() * Math.PI * 2, 0], scale: 1
            })
          }
        }
      }
    }

    // 3. COLOCAR EDIFICIOS en las celdas 'B'
    for (let z = 0; z < gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        if (layout[z][x] !== 'B') continue

        const posX = x * cellSize - offset + cellSize / 2
        const posZ = z * cellSize - offset + cellSize / 2

        // Determinar tipo de edificio según zona
        let building: Asset3D | undefined
        const distFromCenter = Math.abs(x - 3) + Math.abs(z - 3)

        if (distFromCenter <= 1) {
          // Centro: edificios altos
          const options = [...getAssets('skyscrapers'), ...getAssets('hotels'), ...getAssets('business')]
          building = randomFrom(options)
        } else if (distFromCenter <= 2) {
          // Zona media: comercios
          building = randomFrom(getAssets('commercial'))
        } else {
          // Periferia: casas
          const options = [...getAssets('houses_small'), ...getAssets('houses_medium')]
          building = randomFrom(options)
        }

        if (building) {
          // Orientar edificio hacia la calle más cercana
          let rotation = 0
          if (x < 2) rotation = Math.PI / 2  // Mira hacia derecha
          else if (x > 4) rotation = -Math.PI / 2  // Mira hacia izquierda
          else if (z < 2) rotation = Math.PI  // Mira hacia abajo
          // else rotation = 0  // Mira hacia arriba (default)

          objects.push({
            id: nextId(), assetId: building.id, archivo: building.archivo,
            position: [posX, 0, posZ], rotation: [0, rotation, 0], scale: 1
          })
        }
      }
    }

    // 4. AÑADIR VEGETACIÓN alrededor de edificios y parque
    const vegAssets = getAssets('vegetation')
    for (let z = 0; z < gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        if (layout[z][x] !== 'B' && layout[z][x] !== 'P') continue

        const posX = x * cellSize - offset + cellSize / 2
        const posZ = z * cellSize - offset + cellSize / 2

        // Añadir 1-3 árboles/plantas alrededor
        const numVeg = layout[z][x] === 'P' ? randomInt(3, 5) : randomInt(1, 2)
        for (let v = 0; v < numVeg; v++) {
          const veg = randomFrom(vegAssets)
          if (veg) {
            const offsetX = (Math.random() - 0.5) * (cellSize * 0.6)
            const offsetZ = (Math.random() - 0.5) * (cellSize * 0.6)
            objects.push({
              id: nextId(), assetId: veg.id, archivo: veg.archivo,
              position: [posX + offsetX, 0, posZ + offsetZ],
              rotation: [0, Math.random() * Math.PI * 2, 0], scale: 0.8 + Math.random() * 0.4
            })
          }
        }
      }
    }

    // 5. AÑADIR VEHÍCULOS en las calles
    const carAssets = [...getAssets('cars_sport'), ...getAssets('cars_classic'), ...getAssets('trucks')]
    for (let z = 0; z < gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        if (layout[z][x] !== 'R') continue
        if (Math.random() > 0.4) continue // 40% de calles tienen carro

        const posX = x * cellSize - offset + cellSize / 2
        const posZ = z * cellSize - offset + cellSize / 2
        const isVertical = x === 2 || x === 4

        const car = randomFrom(carAssets)
        if (car) {
          const laneOffset = (Math.random() - 0.5) * 2
          objects.push({
            id: nextId(), assetId: car.id, archivo: car.archivo,
            position: [
              posX + (isVertical ? laneOffset : 0),
              0,
              posZ + (isVertical ? 0 : laneOffset)
            ],
            rotation: [0, isVertical ? 0 : Math.PI / 2, 0], scale: 1
          })
        }
      }
    }

    // 6. AÑADIR MOBILIARIO URBANO
    const furnitureAssets = getAssets('furniture')
    for (let z = 0; z < gridSize; z++) {
      for (let x = 0; x < gridSize; x++) {
        // Solo cerca de calles
        if (layout[z][x] !== 'R' && layout[z][x] !== 'X') continue
        if (Math.random() > 0.3) continue

        const posX = x * cellSize - offset + cellSize / 2
        const posZ = z * cellSize - offset + cellSize / 2

        const furniture = randomFrom(furnitureAssets)
        if (furniture) {
          const sideOffset = (Math.random() > 0.5 ? 1 : -1) * (cellSize * 0.4)
          objects.push({
            id: nextId(), assetId: furniture.id, archivo: furniture.archivo,
            position: [posX + sideOffset, 0, posZ + sideOffset * 0.5],
            rotation: [0, Math.random() * Math.PI * 2, 0], scale: 1
          })
        }
      }
    }

    return objects
  }, [])

  // Cargar escena de ejemplo - Ciudad completa City_2.glb
  const loadExampleScene = useCallback(() => {
    setShowCompleteCity(true)
    setPlacedObjects([]) // Limpiar objetos individuales
    setSelectedObjectId(null)
    setLocationName('Ciudad Completa')
    setLocationDesc('Ciudad pre-armada City_2.glb (3600+ objetos)')
    setGroundSize(200)
    setGroundColor('#5a6a3a')
    setTruckSpot([0, 0, 20])
  }, [])

  // Generar nueva ciudad random con el generador procedural
  const generateRandomScene = useCallback(() => {
    setShowCompleteCity(false) // Cambiar a modo assets individuales
    // Generar con tamaño aleatorio entre 5x5 y 9x9
    const sizes = [5, 7, 9]
    const gridSize = sizes[Math.floor(Math.random() * sizes.length)]
    const cellSize = gridSize <= 5 ? 10 : 8

    const cityObjects = generateProceduralCity(gridSize, cellSize)
    setPlacedObjects(cityObjects)
    setSelectedObjectId(null)
    setLocationName(`Ciudad Random ${gridSize}x${gridSize}`)
    setLocationDesc(`Ciudad procedural de ${gridSize}x${gridSize} bloques`)
    setGroundSize(gridSize * cellSize + 20)
    setGroundColor('#5a6a3a')
    setTruckSpot([0, 0, 0])
    objectIdCounter.current = cityObjects.length + 1
  }, [generateProceduralCity])

  // Click en el suelo para mover objeto seleccionado
  const handleGroundClick = useCallback((point: THREE.Vector3) => {
    if (selectedObjectId) {
      updateObjectPosition(selectedObjectId, [point.x, 0, point.z])
    }
  }, [selectedObjectId, updateObjectPosition])

  // Exportar configuracion de locacion
  const exportLocation = useCallback(() => {
    const data: LocationData = {
      id: locationName.toLowerCase().replace(/\s+/g, '_'),
      nombre: locationName,
      descripcion: locationDesc,
      groundColor,
      groundSize,
      objetos: placedObjects,
      spawnPoints: [], // TODO: agregar marcadores de spawn
      truckSpot,
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `location_${data.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [locationName, locationDesc, groundColor, groundSize, placedObjects, truckSpot])

  // Objeto seleccionado actual
  const selectedObject = placedObjects.find(o => o.id === selectedObjectId)

  return (
    <div className="flex h-full bg-gray-100">
      {/* Panel izquierdo - Paleta de assets */}
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-3 border-b bg-gray-50">
          <h2 className="font-bold text-sm text-gray-700">Assets</h2>
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-1 p-2 border-b">
          {CATEGORIAS_CIUDAD.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-coral text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat.icono}
            </button>
          ))}
        </div>

        {/* Lista de assets */}
        <div className="p-2 space-y-1">
          {CATEGORIAS_CIUDAD.find(c => c.id === activeCategory)?.assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => addObject(asset)}
              className="w-full text-left px-3 py-2 rounded hover:bg-coral/10 transition-colors text-sm flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>{asset.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewport 3D - Centro */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [30, 30, 30], fov: 50 }}>
          <Suspense fallback={<Html center><div className="bg-black/80 text-white px-4 py-2 rounded">Cargando...</div></Html>}>
            {/* Iluminacion */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[20, 40, 20]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />

            {/* Environment */}
            <Environment preset="city" />

            {/* Grid */}
            {showGrid && (
              <Grid
                args={[groundSize, groundSize]}
                cellSize={2}
                cellThickness={0.5}
                cellColor="#6b7280"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#374151"
                fadeDistance={100}
                fadeStrength={1}
                followCamera={false}
              />
            )}

            {/* Suelo - click para mover objeto seleccionado */}
            <Ground size={groundSize} color={groundColor} onGroundClick={handleGroundClick} />

            {/* Marcador de Food Truck */}
            <TruckSpotMarker position={truckSpot} />

            {/* Ciudad completa pre-armada */}
            {showCompleteCity && (
              <Suspense fallback={null}>
                <CompleteCityModel position={[0, 0, 0]} scale={1} />
              </Suspense>
            )}

            {/* Objetos colocados (modo individual) */}
            {!showCompleteCity && placedObjects.map(obj => (
              <Suspense key={obj.id} fallback={null}>
                <PlacedAsset
                  objeto={obj}
                  selected={obj.id === selectedObjectId}
                  onClick={() => setSelectedObjectId(obj.id)}
                />
              </Suspense>
            ))}

            {/* Indicador visual de objeto seleccionado */}
            {selectedObject && (
              <mesh position={selectedObject.position}>
                <ringGeometry args={[1.5, 2, 32]} />
                <meshBasicMaterial color="#FF6B35" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Controles de camara */}
            <OrbitControls
              makeDefault
              minDistance={5}
              maxDistance={200}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Suspense>
        </Canvas>

        {/* Toolbar flotante */}
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          <button
            onClick={loadExampleScene}
            className={`px-3 py-2 rounded font-bold text-sm shadow-lg ${
              showCompleteCity
                ? 'bg-emerald-700 text-white ring-2 ring-white'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
            }`}
          >
            🏙️ Ciudad Completa
          </button>
          <button
            onClick={generateRandomScene}
            className="px-3 py-2 rounded font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            🎲 Random
          </button>
          {showCompleteCity && (
            <button
              onClick={() => {
                setShowCompleteCity(false)
                setPlacedObjects([])
                setLocationName('Nueva Locacion')
                setLocationDesc('Descripcion de la locacion')
              }}
              className="px-3 py-2 rounded font-bold text-sm bg-gray-600 text-white hover:bg-gray-700 shadow-lg"
            >
              ✏️ Modo Editor
            </button>
          )}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded font-bold text-sm ${
              showGrid ? 'bg-gray-700 text-white' : 'bg-white shadow'
            }`}
          >
            # Grid
          </button>
          {selectedObjectId && !showCompleteCity && (
            <>
              <button
                onClick={duplicateSelected}
                className="px-3 py-2 rounded font-bold text-sm bg-blue-500 text-white"
              >
                📋 Duplicar
              </button>
              <button
                onClick={deleteSelected}
                className="px-3 py-2 rounded font-bold text-sm bg-red-500 text-white"
              >
                🗑️ Eliminar
              </button>
            </>
          )}
        </div>

        {/* Banner ciudad completa */}
        {showCompleteCity && (
          <div className="absolute top-16 left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg max-w-md">
            🏙️ <strong>Ciudad Completa (City_2.glb)</strong><br/>
            <span className="text-emerald-100 text-xs">3600+ objetos pre-armados. Click "Modo Editor" para crear tu propia escena.</span>
          </div>
        )}

        {/* Instrucciones */}
        {selectedObjectId && !showCompleteCity && (
          <div className="absolute top-16 left-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-xs font-medium">
            💡 Click en el suelo para mover el objeto
          </div>
        )}

        {/* Panel de transformacion del objeto seleccionado */}
        {selectedObject && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm w-80">
            <div className="font-bold mb-3 text-coral">{selectedObject.assetId}</div>

            {/* Posicion */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Posicion</label>
              <div className="grid grid-cols-3 gap-2">
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <div key={axis}>
                    <label className="text-xs text-gray-400">{axis}</label>
                    <input
                      type="number"
                      step="0.5"
                      value={selectedObject.position[i]}
                      onChange={e => {
                        const newPos = [...selectedObject.position] as [number, number, number]
                        newPos[i] = Number(e.target.value)
                        updateObjectPosition(selectedObject.id, newPos)
                      }}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotacion */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Rotacion (grados)</label>
              <div className="grid grid-cols-3 gap-2">
                {['X', 'Y', 'Z'].map((axis, i) => (
                  <div key={axis}>
                    <label className="text-xs text-gray-400">{axis}</label>
                    <input
                      type="number"
                      step="15"
                      value={Math.round(selectedObject.rotation[i] * 180 / Math.PI)}
                      onChange={e => {
                        const newRot = [...selectedObject.rotation] as [number, number, number]
                        newRot[i] = Number(e.target.value) * Math.PI / 180
                        updateObjectRotation(selectedObject.id, newRot)
                      }}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Escala */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Escala: {selectedObject.scale.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedObject.scale}
                onChange={e => updateObjectScale(selectedObject.id, Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Contador de objetos */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow px-3 py-2 text-sm">
          <span className="font-bold">{placedObjects.length}</span> objetos
        </div>
      </div>

      {/* Panel derecho - Propiedades */}
      <div className="w-72 bg-white border-l overflow-y-auto">
        <div className="p-3 border-b bg-gray-50">
          <h2 className="font-bold text-sm text-gray-700">Propiedades</h2>
        </div>

        {/* Info de la locacion */}
        <div className="p-3 border-b space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Nombre</label>
            <input
              type="text"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Descripcion</label>
            <textarea
              value={locationDesc}
              onChange={e => setLocationDesc(e.target.value)}
              className="w-full mt-1 px-2 py-1 border rounded text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Color del suelo</label>
            <div className="flex gap-2 mt-1">
              {['#4a5568', '#2d5a27', '#c9b99a', '#8b7355', '#3d4f3d'].map(color => (
                <button
                  key={color}
                  onClick={() => setGroundColor(color)}
                  className={`w-8 h-8 rounded border-2 ${
                    groundColor === color ? 'border-coral' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Tamano del suelo: {groundSize}m</label>
            <input
              type="range"
              min={50}
              max={200}
              value={groundSize}
              onChange={e => setGroundSize(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
        </div>

        {/* Posicion del Food Truck */}
        <div className="p-3 border-b space-y-2">
          <label className="text-xs font-medium text-gray-600">Posicion Food Truck</label>
          <div className="grid grid-cols-3 gap-2">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis}>
                <label className="text-xs text-gray-500">{axis}</label>
                <input
                  type="number"
                  value={truckSpot[i]}
                  onChange={e => {
                    const newSpot = [...truckSpot] as [number, number, number]
                    newSpot[i] = Number(e.target.value)
                    setTruckSpot(newSpot)
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lista de objetos */}
        <div className="p-3 border-b">
          <label className="text-xs font-medium text-gray-600">Objetos ({placedObjects.length})</label>
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
            {placedObjects.map(obj => (
              <button
                key={obj.id}
                onClick={() => setSelectedObjectId(obj.id)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  obj.id === selectedObjectId
                    ? 'bg-coral text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {obj.assetId}
              </button>
            ))}
          </div>
        </div>

        {/* Botones de accion */}
        <div className="p-3 space-y-2">
          <button
            onClick={exportLocation}
            className="w-full py-2 bg-coral text-white rounded-lg font-bold text-sm hover:bg-coral/90"
          >
            💾 Exportar JSON
          </button>
          <button
            onClick={() => {
              setPlacedObjects([])
              setShowCompleteCity(false)
            }}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300"
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationCreator
