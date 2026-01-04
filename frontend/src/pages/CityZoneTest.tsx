// CityZoneTest.tsx - Prueba de división de ciudad en zonas
// Carga City_2.glb y filtra nodos por bounding box para mostrar zonas individuales

import { useState, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// Definición de zonas basada en análisis de posiciones
const CITY_ZONES = {
  playa: {
    name: 'Zona Playa',
    description: 'Puerto y playa costera',
    bounds: { minX: 100, maxX: 280, minZ: -80, maxZ: 60 },
    cameraPos: [190, 60, -10] as [number, number, number]
  },
  comercial: {
    name: 'Zona Comercial',
    description: 'Cafés, bancos, tiendas',
    bounds: { minX: 20, maxX: 160, minZ: -100, maxZ: 0 },
    cameraPos: [90, 80, -50] as [number, number, number]
  },
  financiera: {
    name: 'Zona Financiera',
    description: 'Rascacielos y centros de negocios',
    bounds: { minX: -50, maxX: 100, minZ: -60, maxZ: 60 },
    cameraPos: [25, 100, 0] as [number, number, number]
  },
  residencial_norte: {
    name: 'Zona Residencial Norte',
    description: 'Casas y cottages',
    bounds: { minX: -199, maxX: 0, minZ: -177, maxZ: -50 },
    cameraPos: [-100, 80, -120] as [number, number, number]
  },
  parque: {
    name: 'Zona Parque',
    description: 'Área verde con vegetación',
    bounds: { minX: 200, maxX: 344, minZ: -100, maxZ: 50 },
    cameraPos: [270, 60, -25] as [number, number, number]
  },
  centro: {
    name: 'Centro de Ciudad',
    description: 'Área central',
    bounds: { minX: -50, maxX: 150, minZ: -50, maxZ: 80 },
    cameraPos: [50, 100, 15] as [number, number, number]
  },
  completa: {
    name: 'Ciudad Completa',
    description: 'Toda la ciudad (pesada)',
    bounds: { minX: -300, maxX: 400, minZ: -200, maxZ: 200 },
    cameraPos: [100, 200, 100] as [number, number, number]
  }
}

type ZoneKey = keyof typeof CITY_ZONES

// Componente que carga y filtra la ciudad
function FilteredCity({ zone }: { zone: ZoneKey }) {
  const { scene } = useGLTF('/assets/models/City/CityFull/City_2.glb')
  const bounds = CITY_ZONES[zone].bounds
  const [stats, setStats] = useState({ visible: 0, hidden: 0 })

  // Clonar escena y filtrar por posición
  const filteredScene = useMemo(() => {
    const clone = scene.clone(true)
    let visible = 0
    let hidden = 0

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Obtener posición mundial del mesh
        const worldPos = new THREE.Vector3()
        child.getWorldPosition(worldPos)

        // Verificar si está dentro del bounding box
        const inBounds =
          worldPos.x >= bounds.minX &&
          worldPos.x <= bounds.maxX &&
          worldPos.z >= bounds.minZ &&
          worldPos.z <= bounds.maxZ

        child.visible = inBounds
        if (inBounds) {
          visible++
          child.castShadow = true
          child.receiveShadow = true
        } else {
          hidden++
        }
      }
    })

    setStats({ visible, hidden })
    return clone
  }, [scene, bounds])

  return (
    <>
      <primitive object={filteredScene} />
      <Html position={[bounds.minX + 10, 20, bounds.minZ + 10]}>
        <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
          Visibles: {stats.visible} | Ocultos: {stats.hidden}
        </div>
      </Html>
    </>
  )
}

// Loading
function Loader() {
  return (
    <Html center>
      <div className="text-white text-xl animate-pulse">Cargando ciudad...</div>
    </Html>
  )
}

// Componente principal
export default function CityZoneTest() {
  const [selectedZone, setSelectedZone] = useState<ZoneKey>('playa')
  const [showGrid, setShowGrid] = useState(true)
  const zone = CITY_ZONES[selectedZone]

  return (
    <div className="w-full h-screen bg-gray-900 flex">
      {/* Panel de control */}
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
        <h1 className="text-xl font-bold text-white mb-2">
          Divisor de Ciudad
        </h1>
        <p className="text-gray-400 text-sm mb-4">
          Prueba de filtrado de zonas de City_2.glb
        </p>

        {/* Selector de zonas */}
        <div className="space-y-2 mb-6">
          <label className="text-white text-sm font-medium">Seleccionar Zona:</label>
          {Object.entries(CITY_ZONES).map(([key, z]) => (
            <button
              key={key}
              onClick={() => setSelectedZone(key as ZoneKey)}
              className={`w-full text-left px-3 py-2 rounded transition-all ${
                selectedZone === key
                  ? 'bg-coral text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{z.name}</div>
              <div className="text-xs opacity-70">{z.description}</div>
            </button>
          ))}
        </div>

        {/* Info de zona actual */}
        <div className="bg-gray-700 rounded p-3 mb-4">
          <h3 className="text-white font-medium mb-2">{zone.name}</h3>
          <div className="text-gray-400 text-xs space-y-1">
            <p>X: {zone.bounds.minX} a {zone.bounds.maxX}</p>
            <p>Z: {zone.bounds.minZ} a {zone.bounds.maxZ}</p>
            <p>Ancho: {zone.bounds.maxX - zone.bounds.minX}</p>
            <p>Profundidad: {zone.bounds.maxZ - zone.bounds.minZ}</p>
          </div>
        </div>

        {/* Opciones */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded"
            />
            Mostrar Grid
          </label>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 bg-gray-700/50 rounded p-3">
          <h4 className="text-white text-sm font-medium mb-2">Controles:</h4>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>Click + Arrastrar = Rotar</li>
            <li>Scroll = Zoom</li>
            <li>Click derecho + Arrastrar = Pan</li>
          </ul>
        </div>
      </div>

      {/* Canvas 3D */}
      <div className="flex-1">
        <Canvas shadows>
          <color attach="background" args={['#1a1a2e']} />

          <PerspectiveCamera
            makeDefault
            position={zone.cameraPos}
            fov={50}
          />

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[100, 100, 50]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <Suspense fallback={<Loader />}>
            <FilteredCity key={selectedZone} zone={selectedZone} />
          </Suspense>

          {/* Grid helper */}
          {showGrid && (
            <gridHelper
              args={[500, 50, '#333', '#222']}
              position={[0, 0.1, 0]}
            />
          )}

          {/* Bounding box visual */}
          <mesh
            position={[
              (zone.bounds.minX + zone.bounds.maxX) / 2,
              0.5,
              (zone.bounds.minZ + zone.bounds.maxZ) / 2
            ]}
          >
            <boxGeometry
              args={[
                zone.bounds.maxX - zone.bounds.minX,
                1,
                zone.bounds.maxZ - zone.bounds.minZ
              ]}
            />
            <meshBasicMaterial
              color="#00ff00"
              transparent
              opacity={0.1}
              wireframe
            />
          </mesh>

          <OrbitControls
            target={[
              (zone.bounds.minX + zone.bounds.maxX) / 2,
              0,
              (zone.bounds.minZ + zone.bounds.maxZ) / 2
            ]}
            minDistance={20}
            maxDistance={400}
          />
        </Canvas>
      </div>
    </div>
  )
}
