// LocationCreator.tsx - Creador de Locaciones 3D para CalleViva
// Permite colocar y posicionar assets de ciudad para crear escenarios de juego

import React, { useState, Suspense, useRef, useCallback } from 'react'
import { Canvas, ThreeEvent } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html, Grid } from '@react-three/drei'
import * as THREE from 'three'

// ==================== CONFIGURACION ====================
const CITY_ASSETS_PATH = '/assets/models/City/Separate_assets_glb'

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

// ==================== CATALOGO DE ASSETS DE CIUDAD ====================
const CATEGORIAS_CIUDAD: Categoria3D[] = [
  {
    id: 'buildings',
    nombre: 'Edificios',
    icono: '🏢',
    assets: [
      { id: 'eco_grid', nombre: 'Eco Grid', archivo: 'Eco_Building_Grid.glb' },
      { id: 'eco_slope', nombre: 'Eco Slope', archivo: 'Eco_Building_Slope.glb' },
      { id: 'eco_terrace', nombre: 'Eco Terrace', archivo: 'Eco_Building_Terrace.glb' },
      { id: 'tower', nombre: 'Torre', archivo: 'Regular_Building_TwistedTower_Large.glb' },
    ],
  },
  {
    id: 'roads',
    nombre: 'Calles',
    icono: '🛣️',
    assets: [
      { id: 'road_001', nombre: 'Calle Recta', archivo: 'road_001.glb' },
      { id: 'road_003', nombre: 'Calle Curva', archivo: 'road_003.glb' },
      { id: 'road_009', nombre: 'Intersección', archivo: 'road_009.glb' },
      { id: 'road_013', nombre: 'T-Junction', archivo: 'road_013.glb' },
      { id: 'road_019', nombre: 'Cruce', archivo: 'road_019.glb' },
      { id: 'road_020', nombre: 'Esquina', archivo: 'road_020.glb' },
      { id: 'road_022', nombre: 'Fin Calle', archivo: 'road_022.glb' },
      { id: 'tiles_01', nombre: 'Tile Plaza 1', archivo: 'Set_B_Tiles_01.glb' },
      { id: 'tiles_04', nombre: 'Tile Plaza 2', archivo: 'Set_B_Tiles_04.glb' },
      { id: 'tiles_05', nombre: 'Tile Plaza 3', archivo: 'Set_B_Tiles_05.glb' },
    ],
  },
  {
    id: 'vegetation',
    nombre: 'Vegetacion',
    icono: '🌴',
    assets: [
      { id: 'palm', nombre: 'Palmera', archivo: 'Palm_03.glb' },
      { id: 'bush_06', nombre: 'Arbusto 1', archivo: 'Bush_06.glb' },
      { id: 'bush_07', nombre: 'Arbusto 2', archivo: 'Bush_07.glb' },
      { id: 'bush_10', nombre: 'Arbusto 3', archivo: 'Bush_10.glb' },
    ],
  },
  {
    id: 'vehicles',
    nombre: 'Vehiculos',
    icono: '🚗',
    assets: [
      { id: 'car_06', nombre: 'Auto 1', archivo: 'Car_06.glb' },
      { id: 'car_13', nombre: 'Auto 2', archivo: 'Car_13.glb' },
      { id: 'car_16', nombre: 'Auto 3', archivo: 'Car_16.glb' },
      { id: 'car_19', nombre: 'Auto 4', archivo: 'Car_19.glb' },
      { id: 'van', nombre: 'Van', archivo: 'Van.glb' },
      { id: 'futuristic', nombre: 'Futurista', archivo: 'Futuristic_Car_1.glb' },
    ],
  },
  {
    id: 'furniture',
    nombre: 'Mobiliario',
    icono: '🪑',
    assets: [
      { id: 'bus_stop', nombre: 'Parada Bus', archivo: 'Bus_Stop_02.glb' },
      { id: 'fountain', nombre: 'Fuente', archivo: 'Fountain_03.glb' },
      { id: 'trash_can_04', nombre: 'Basurero 1', archivo: 'Trash_Can_04.glb' },
      { id: 'trash_can_05', nombre: 'Basurero 2', archivo: 'Trash_Can_05.glb' },
      { id: 'trash_can_06', nombre: 'Basurero 3', archivo: 'Trash_Can_06.glb' },
      { id: 'signboard', nombre: 'Letrero', archivo: 'Signboard_01.glb' },
      { id: 'traffic_light_1', nombre: 'Semaforo 1', archivo: 'traffic_light_001.glb' },
      { id: 'traffic_light_2', nombre: 'Semaforo 2', archivo: 'traffic_light_002.glb' },
      { id: 'spotlight_1', nombre: 'Spotlight 1', archivo: 'Spotlight_01.glb' },
      { id: 'spotlight_2', nombre: 'Spotlight 2', archivo: 'Spotlight_02.glb' },
    ],
  },
  {
    id: 'decorative',
    nombre: 'Decorativo',
    icono: '🎨',
    assets: [
      { id: 'billboard_2x1_03', nombre: 'Billboard 2x1 A', archivo: 'Billboard_2x1_03.glb' },
      { id: 'billboard_2x1_05', nombre: 'Billboard 2x1 B', archivo: 'Billboard_2x1_05.glb' },
      { id: 'billboard_4x1_03', nombre: 'Billboard 4x1 A', archivo: 'Billboard_4x1_03.glb' },
      { id: 'billboard_4x1_04', nombre: 'Billboard 4x1 B', archivo: 'Billboard_4x1_04.glb' },
      { id: 'graffiti', nombre: 'Graffiti', archivo: 'Graffiti_03.glb' },
      { id: 'trash_02', nombre: 'Basura 1', archivo: 'Trash_02.glb' },
      { id: 'trash_03', nombre: 'Basura 2', archivo: 'Trash_03.glb' },
    ],
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
  const [activeCategory, setActiveCategory] = useState('buildings')
  const [showGrid, setShowGrid] = useState(true)

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

  // Cargar escena de ejemplo (extraida del Cartoon_City_Free.glb)
  const loadExampleScene = useCallback(() => {
    // Escena simplificada basada en el modelo original
    const exampleObjects: PlacedObject[] = [
      // EDIFICIOS - Posiciones del modelo original
      { id: 'ex_1', assetId: 'eco_slope', archivo: 'Eco_Building_Slope.glb', position: [-29, 0, 52], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_2', assetId: 'eco_grid', archivo: 'Eco_Building_Grid.glb', position: [34, 0, -7], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_3', assetId: 'eco_slope', archivo: 'Eco_Building_Slope.glb', position: [-29, 0, -37], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_4', assetId: 'eco_terrace', archivo: 'Eco_Building_Terrace.glb', position: [33, 0, -40], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'ex_5', assetId: 'eco_slope', archivo: 'Eco_Building_Slope.glb', position: [-29, 0, 8], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_6', assetId: 'tower', archivo: 'Regular_Building_TwistedTower_Large.glb', position: [32, 0, 48], rotation: [0, 1.66, 0], scale: 1 },

      // TILES/CALLES - Grid de la ciudad
      { id: 'ex_10', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-22.5, 0, -52.5], rotation: [0, -1.57, 0], scale: 1 },
      { id: 'ex_11', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-7.5, 0, -52.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'ex_12', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [7.5, 0, -52.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_13', assetId: 'tiles_04', archivo: 'Set_B_Tiles_04.glb', position: [-22.5, 0, -37.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_14', assetId: 'tiles_05', archivo: 'Set_B_Tiles_05.glb', position: [-7.5, 0, -37.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'ex_15', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [7.5, 0, -37.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_16', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-22.5, 0, 7.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_17', assetId: 'tiles_04', archivo: 'Set_B_Tiles_04.glb', position: [-7.5, 0, 7.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'ex_18', assetId: 'tiles_05', archivo: 'Set_B_Tiles_05.glb', position: [7.5, 0, 7.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_19', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-22.5, 0, 37.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'ex_20', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-7.5, 0, 37.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_21', assetId: 'tiles_04', archivo: 'Set_B_Tiles_04.glb', position: [7.5, 0, 37.5], rotation: [0, -1.57, 0], scale: 1 },

      // VEHICULOS - Posiciones reales
      { id: 'ex_30', assetId: 'car_06', archivo: 'Car_06.glb', position: [5.86, 0, -2.72], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_31', assetId: 'car_13', archivo: 'Car_13.glb', position: [5.87, 0, -19.13], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_32', assetId: 'car_19', archivo: 'Car_19.glb', position: [-54, 0, 16], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_33', assetId: 'car_16', archivo: 'Car_16.glb', position: [2.78, 0, -12.68], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_34', assetId: 'futuristic', archivo: 'Futuristic_Car_1.glb', position: [5.87, 0, 6.99], rotation: [0, 0, 0], scale: 1 },

      // MOBILIARIO URBANO
      { id: 'ex_40', assetId: 'bus_stop', archivo: 'Bus_Stop_02.glb', position: [46, 0, -23], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_41', assetId: 'fountain', archivo: 'Fountain_03.glb', position: [-12.5, 0, 30], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_42', assetId: 'fountain', archivo: 'Fountain_03.glb', position: [-12.5, 0, -15], rotation: [0, 0, 0], scale: 1 },

      // VEGETACION - Palmeras
      { id: 'ex_50', assetId: 'palm', archivo: 'Palm_03.glb', position: [16.5, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'ex_51', assetId: 'palm', archivo: 'Palm_03.glb', position: [16.5, 0, 14], rotation: [0, -1.57, 0], scale: 1 },
      { id: 'ex_52', assetId: 'palm', archivo: 'Palm_03.glb', position: [-31, 0, -15], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_53', assetId: 'palm', archivo: 'Palm_03.glb', position: [-31, 0, 30], rotation: [0, -1.4, 0], scale: 1 },

      // ARBUSTOS - Lineas decorativas
      { id: 'ex_60', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [38, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'ex_61', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [42, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'ex_62', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [25, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'ex_63', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [33, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'ex_64', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [29, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'ex_65', assetId: 'bush_06', archivo: 'Bush_06.glb', position: [-1, 0, -30], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_66', assetId: 'bush_06', archivo: 'Bush_06.glb', position: [-1, 0, -33], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'ex_67', assetId: 'bush_07', archivo: 'Bush_07.glb', position: [-1, 0, 48], rotation: [0, 0, 0], scale: 1 },
      { id: 'ex_68', assetId: 'bush_07', archivo: 'Bush_07.glb', position: [-1, 0, 45], rotation: [0, 0, 0], scale: 1 },
    ]

    setPlacedObjects(exampleObjects)
    setSelectedObjectId(null)
    setLocationName('Ciudad Demo')
    setLocationDesc('Escena basada en Cartoon_City_Free.glb')
    setGroundSize(150)
    setGroundColor('#8B9556')
    setTruckSpot([0, 0, 20])
    objectIdCounter.current = 100
  }, [])

  // Generar escena random basada en el ejemplo real
  const generateRandomScene = useCallback(() => {
    // Obtener assets por categoria
    const getAssets = (catId: string) => CATEGORIAS_CIUDAD.find(c => c.id === catId)?.assets || []
    const randomFrom = (arr: Asset3D[]) => arr[Math.floor(Math.random() * arr.length)]
    const randomBuilding = () => randomFrom(getAssets('buildings'))
    const randomVehicle = () => randomFrom(getAssets('vehicles'))
    const randomVegetation = () => randomFrom(getAssets('vegetation'))
    const randomTile = () => {
      const tiles = getAssets('roads').filter(r => r.id.includes('tiles'))
      return randomFrom(tiles) || getAssets('roads')[0]
    }

    // Usar la estructura del ejemplo pero variar los tipos
    const b1 = randomBuilding(), b2 = randomBuilding(), b3 = randomBuilding()
    const b4 = randomBuilding(), b5 = randomBuilding(), b6 = randomBuilding()
    const v1 = randomVehicle(), v2 = randomVehicle(), v3 = randomVehicle()
    const v4 = randomVehicle(), v5 = randomVehicle()
    const veg = randomVegetation()
    const t1 = randomTile(), t2 = randomTile(), t3 = randomTile()

    const randomObjects: PlacedObject[] = [
      // EDIFICIOS - Mismas posiciones del ejemplo, tipos aleatorios
      { id: 'rnd_1', assetId: b1?.id || 'eco_slope', archivo: b1?.archivo || 'Eco_Building_Slope.glb', position: [-29, 0, 52], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_2', assetId: b2?.id || 'eco_grid', archivo: b2?.archivo || 'Eco_Building_Grid.glb', position: [34, 0, -7], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_3', assetId: b3?.id || 'eco_slope', archivo: b3?.archivo || 'Eco_Building_Slope.glb', position: [-29, 0, -37], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_4', assetId: b4?.id || 'eco_terrace', archivo: b4?.archivo || 'Eco_Building_Terrace.glb', position: [33, 0, -40], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'rnd_5', assetId: b5?.id || 'eco_slope', archivo: b5?.archivo || 'Eco_Building_Slope.glb', position: [-29, 0, 8], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_6', assetId: b6?.id || 'tower', archivo: b6?.archivo || 'Regular_Building_TwistedTower_Large.glb', position: [32, 0, 48], rotation: [0, 1.66, 0], scale: 1 },

      // TILES - Estructura fija del grid de ciudad (siempre igual)
      { id: 'rnd_10', assetId: t1?.id || 'tiles_01', archivo: t1?.archivo || 'Set_B_Tiles_01.glb', position: [-22.5, 0, -52.5], rotation: [0, -1.57, 0], scale: 1 },
      { id: 'rnd_11', assetId: t2?.id || 'tiles_01', archivo: t2?.archivo || 'Set_B_Tiles_01.glb', position: [-7.5, 0, -52.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'rnd_12', assetId: t3?.id || 'tiles_01', archivo: t3?.archivo || 'Set_B_Tiles_01.glb', position: [7.5, 0, -52.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_13', assetId: 'tiles_04', archivo: 'Set_B_Tiles_04.glb', position: [-22.5, 0, -37.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_14', assetId: 'tiles_05', archivo: 'Set_B_Tiles_05.glb', position: [-7.5, 0, -37.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'rnd_15', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [7.5, 0, -37.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_16', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-22.5, 0, 7.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_17', assetId: 'tiles_04', archivo: 'Set_B_Tiles_04.glb', position: [-7.5, 0, 7.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'rnd_18', assetId: 'tiles_05', archivo: 'Set_B_Tiles_05.glb', position: [7.5, 0, 7.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_19', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-22.5, 0, 37.5], rotation: [0, 3.14, 0], scale: 1 },
      { id: 'rnd_20', assetId: 'tiles_01', archivo: 'Set_B_Tiles_01.glb', position: [-7.5, 0, 37.5], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_21', assetId: 'tiles_04', archivo: 'Set_B_Tiles_04.glb', position: [7.5, 0, 37.5], rotation: [0, -1.57, 0], scale: 1 },

      // VEHICULOS - Mismas posiciones, tipos aleatorios
      { id: 'rnd_30', assetId: v1?.id || 'car_06', archivo: v1?.archivo || 'Car_06.glb', position: [5.86, 0, -2.72], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_31', assetId: v2?.id || 'car_13', archivo: v2?.archivo || 'Car_13.glb', position: [5.87, 0, -19.13], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_32', assetId: v3?.id || 'car_19', archivo: v3?.archivo || 'Car_19.glb', position: [-54, 0, 16], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_33', assetId: v4?.id || 'car_16', archivo: v4?.archivo || 'Car_16.glb', position: [2.78, 0, -12.68], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_34', assetId: v5?.id || 'futuristic', archivo: v5?.archivo || 'Futuristic_Car_1.glb', position: [5.87, 0, 6.99], rotation: [0, 0, 0], scale: 1 },

      // MOBILIARIO - Fijo
      { id: 'rnd_40', assetId: 'bus_stop', archivo: 'Bus_Stop_02.glb', position: [46, 0, -23], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_41', assetId: 'fountain', archivo: 'Fountain_03.glb', position: [-12.5, 0, 30], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_42', assetId: 'fountain', archivo: 'Fountain_03.glb', position: [-12.5, 0, -15], rotation: [0, 0, 0], scale: 1 },

      // VEGETACION - Tipo aleatorio en las mismas posiciones
      { id: 'rnd_50', assetId: veg?.id || 'palm', archivo: veg?.archivo || 'Palm_03.glb', position: [16.5, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'rnd_51', assetId: veg?.id || 'palm', archivo: veg?.archivo || 'Palm_03.glb', position: [16.5, 0, 14], rotation: [0, -1.57, 0], scale: 1 },
      { id: 'rnd_52', assetId: veg?.id || 'palm', archivo: veg?.archivo || 'Palm_03.glb', position: [-31, 0, -15], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_53', assetId: veg?.id || 'palm', archivo: veg?.archivo || 'Palm_03.glb', position: [-31, 0, 30], rotation: [0, -1.4, 0], scale: 1 },

      // ARBUSTOS - Lineas fijas
      { id: 'rnd_60', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [38, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'rnd_61', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [42, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'rnd_62', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [25, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'rnd_63', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [33, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'rnd_64', assetId: 'bush_10', archivo: 'Bush_10.glb', position: [29, 0, 31], rotation: [0, -3.14, 0], scale: 1 },
      { id: 'rnd_65', assetId: 'bush_06', archivo: 'Bush_06.glb', position: [-1, 0, -30], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_66', assetId: 'bush_06', archivo: 'Bush_06.glb', position: [-1, 0, -33], rotation: [0, 1.57, 0], scale: 1 },
      { id: 'rnd_67', assetId: 'bush_07', archivo: 'Bush_07.glb', position: [-1, 0, 48], rotation: [0, 0, 0], scale: 1 },
      { id: 'rnd_68', assetId: 'bush_07', archivo: 'Bush_07.glb', position: [-1, 0, 45], rotation: [0, 0, 0], scale: 1 },
    ]

    setPlacedObjects(randomObjects)
    setSelectedObjectId(null)
    setLocationName('Ciudad Random')
    setLocationDesc('Variacion aleatoria de la escena base')
    setGroundSize(150)
    setGroundColor('#8B9556')
    setTruckSpot([0, 0, 20])
    objectIdCounter.current = 100
  }, [])

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

            {/* Objetos colocados */}
            {placedObjects.map(obj => (
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
            className="px-3 py-2 rounded font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg"
          >
            📁 Cargar Ejemplo
          </button>
          <button
            onClick={generateRandomScene}
            className="px-3 py-2 rounded font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            🎲 Random
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-2 rounded font-bold text-sm ${
              showGrid ? 'bg-gray-700 text-white' : 'bg-white shadow'
            }`}
          >
            # Grid
          </button>
          {selectedObjectId && (
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

        {/* Instrucciones */}
        {selectedObjectId && (
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
            onClick={() => setPlacedObjects([])}
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
