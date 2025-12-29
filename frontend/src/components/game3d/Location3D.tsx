// Location3D.tsx - 3D Location/Scene for gameplay
// Loads and positions city assets to create playable locations

import React, { Suspense, useMemo } from 'react'
import { useGLTF, Clone } from '@react-three/drei'

const CITY_ASSETS_PATH = '/assets/models/City/Separate_assets_glb'

// Asset loader component
const CityAsset: React.FC<{
  name: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}> = ({ name, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF(`${CITY_ASSETS_PATH}/${name}`)

  const scaleArray = typeof scale === 'number' ? [scale, scale, scale] : scale

  return (
    <Clone
      object={scene}
      position={position}
      rotation={rotation}
      scale={scaleArray as [number, number, number]}
    />
  )
}

// Ground plane
const Ground: React.FC<{ size?: number; color?: string }> = ({
  size = 50,
  color = '#4a5568'
}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={color} />
  </mesh>
)

// Sidewalk/Plaza area
const Plaza: React.FC<{
  position?: [number, number, number]
  size?: [number, number]
  color?: string
}> = ({ position = [0, 0, 0], size = [10, 10], color = '#d1d5db' }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.01, position[2]]} receiveShadow>
    <planeGeometry args={size} />
    <meshStandardMaterial color={color} />
  </mesh>
)

// Location configuration type
export interface LocationConfig {
  id: string
  name: string
  description: string
  groundColor: string
  plazaColor: string
  plazaSize: [number, number]
  truckPosition: [number, number, number]
  truckRotation: number
  customerSpawnPoints: [number, number, number][]
  customerTargetPoint: [number, number, number]
  assets: {
    name: string
    position: [number, number, number]
    rotation?: [number, number, number]
    scale?: number
  }[]
  ambientIntensity: number
  sunPosition: [number, number, number]
}

// Pre-defined locations
export const LOCATIONS: Record<string, LocationConfig> = {
  universidad: {
    id: 'universidad',
    name: 'Plaza Universidad',
    description: 'Zona universitaria con estudiantes hambrientos',
    groundColor: '#3d4f3d',  // Grass green
    plazaColor: '#c9b99a',   // Stone/concrete
    plazaSize: [20, 15],
    truckPosition: [0, 0, 0],
    truckRotation: Math.PI / 4,
    customerSpawnPoints: [
      [-12, 0, -8],
      [-12, 0, 0],
      [-12, 0, 8],
      [12, 0, -8],
      [12, 0, 8],
    ],
    customerTargetPoint: [2, 0, 2],
    assets: [
      // Roads
      { name: 'road_001.glb', position: [-15, 0, 0], rotation: [0, Math.PI / 2, 0], scale: 0.8 },
      { name: 'road_001.glb', position: [15, 0, 0], rotation: [0, Math.PI / 2, 0], scale: 0.8 },

      // Buildings - background
      { name: 'Eco_Building_Grid.glb', position: [-20, 0, -15], scale: 1.2 },
      { name: 'Eco_Building_Terrace.glb', position: [0, 0, -18], scale: 1.0 },
      { name: 'Eco_Building_Slope.glb', position: [20, 0, -15], scale: 1.2 },

      // Palm trees
      { name: 'Palm_03.glb', position: [-8, 0, -6], scale: 1.0 },
      { name: 'Palm_03.glb', position: [8, 0, -6], scale: 1.0 },
      { name: 'Palm_03.glb', position: [-8, 0, 6], scale: 0.9 },
      { name: 'Palm_03.glb', position: [8, 0, 6], scale: 0.9 },

      // Bushes
      { name: 'Bush_06.glb', position: [-6, 0, -8], scale: 0.8 },
      { name: 'Bush_07.glb', position: [6, 0, -8], scale: 0.8 },
      { name: 'Bush_10.glb', position: [-6, 0, 8], scale: 0.7 },
      { name: 'Bush_06.glb', position: [6, 0, 8], scale: 0.7 },

      // Street furniture
      { name: 'Fountain_03.glb', position: [-5, 0, 0], scale: 0.6 },
      { name: 'Trash_Can_04.glb', position: [5, 0, 5], scale: 0.5 },
      { name: 'Trash_Can_05.glb', position: [-5, 0, 5], scale: 0.5 },
      { name: 'Bus_Stop_02.glb', position: [-15, 0, 5], rotation: [0, Math.PI / 2, 0], scale: 0.7 },

      // Parked cars
      { name: 'Car_06.glb', position: [-18, 0, -5], rotation: [0, Math.PI / 2, 0], scale: 0.7 },
      { name: 'Car_13.glb', position: [18, 0, -3], rotation: [0, -Math.PI / 2, 0], scale: 0.7 },
      { name: 'Van.glb', position: [18, 0, 5], rotation: [0, -Math.PI / 2, 0], scale: 0.6 },

      // Traffic lights
      { name: 'traffic_light_001.glb', position: [-12, 0, -10], scale: 0.6 },
      { name: 'traffic_light_002.glb', position: [12, 0, -10], scale: 0.6 },

      // Signboard
      { name: 'Signboard_01.glb', position: [0, 0, -12], scale: 0.8 },
    ],
    ambientIntensity: 0.6,
    sunPosition: [20, 30, 20],
  },

  parque: {
    id: 'parque',
    name: 'Parque Central',
    description: 'Parque lleno de familias y paseantes',
    groundColor: '#2d5a27',  // Darker grass
    plazaColor: '#8b7355',   // Brown path
    plazaSize: [12, 12],
    truckPosition: [0, 0, 0],
    truckRotation: 0,
    customerSpawnPoints: [
      [-10, 0, -10],
      [10, 0, -10],
      [-10, 0, 10],
      [10, 0, 10],
    ],
    customerTargetPoint: [2, 0, 0],
    assets: [
      // More trees for park setting
      { name: 'Palm_03.glb', position: [-10, 0, -8], scale: 1.2 },
      { name: 'Palm_03.glb', position: [10, 0, -8], scale: 1.2 },
      { name: 'Palm_03.glb', position: [-10, 0, 8], scale: 1.1 },
      { name: 'Palm_03.glb', position: [10, 0, 8], scale: 1.1 },
      { name: 'Palm_03.glb', position: [0, 0, -12], scale: 1.3 },

      // Lots of bushes
      { name: 'Bush_06.glb', position: [-7, 0, -5], scale: 0.9 },
      { name: 'Bush_07.glb', position: [7, 0, -5], scale: 0.9 },
      { name: 'Bush_10.glb', position: [-7, 0, 5], scale: 0.8 },
      { name: 'Bush_06.glb', position: [7, 0, 5], scale: 0.8 },
      { name: 'Bush_07.glb', position: [-12, 0, 0], scale: 1.0 },
      { name: 'Bush_10.glb', position: [12, 0, 0], scale: 1.0 },

      // Fountain in center area
      { name: 'Fountain_03.glb', position: [8, 0, 0], scale: 0.8 },

      // Trash cans
      { name: 'Trash_Can_06.glb', position: [4, 0, 6], scale: 0.5 },
      { name: 'Trash_Can_07.glb', position: [-4, 0, 6], scale: 0.5 },

      // Buildings in distance
      { name: 'Eco_Building_Grid.glb', position: [-25, 0, -20], scale: 1.0 },
      { name: 'Eco_Building_Terrace.glb', position: [25, 0, -20], scale: 1.0 },
    ],
    ambientIntensity: 0.7,
    sunPosition: [15, 35, 15],
  },
}

// Main Location3D Component
export const Location3D: React.FC<{
  locationId: string
  showGround?: boolean
  showPlaza?: boolean
}> = ({ locationId, showGround = true, showPlaza = true }) => {
  const config = LOCATIONS[locationId] || LOCATIONS.universidad

  // Memoize asset components to prevent unnecessary re-renders
  const assetComponents = useMemo(() =>
    config.assets.map((asset, index) => (
      <Suspense key={`${asset.name}-${index}`} fallback={null}>
        <CityAsset
          name={asset.name}
          position={asset.position}
          rotation={asset.rotation}
          scale={asset.scale}
        />
      </Suspense>
    )), [config.assets]
  )

  return (
    <group>
      {/* Ground */}
      {showGround && <Ground size={60} color={config.groundColor} />}

      {/* Plaza/sidewalk area */}
      {showPlaza && (
        <Plaza
          position={[0, 0, 0]}
          size={config.plazaSize}
          color={config.plazaColor}
        />
      )}

      {/* City assets */}
      {assetComponents}
    </group>
  )
}

// Preload assets for a location
export const preloadLocationAssets = (locationId: string) => {
  const config = LOCATIONS[locationId]
  if (!config) return

  config.assets.forEach(asset => {
    useGLTF.preload(`${CITY_ASSETS_PATH}/${asset.name}`)
  })
}

export default Location3D
