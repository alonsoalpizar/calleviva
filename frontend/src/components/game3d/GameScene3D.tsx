// GameScene3D.tsx - City exploration with zone selection
// Clean 3D city viewer without post-processing (for stability)

import React, { useState, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { getZone, CityZone, ZONE_LIST } from './cityZones'

// Complete City Scene Model
const CityScene: React.FC<{
  position?: [number, number, number]
  scale?: number
}> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF('/assets/models/City/CityFull/City_2.glb')

  // Habilitar sombras en todos los meshes del modelo
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
    />
  )
}

// Animated 3D Model - wrapper with walking animation
const AnimatedModel: React.FC<{
  url: string
  position: [number, number, number]
  scale?: number
  walkRadius?: number
}> = ({ url, position, scale = 3, walkRadius = 5 }) => {
  const groupRef = useRef<THREE.Group>(null!)
  const modelRef = useRef<THREE.Group>(null!)
  const { scene } = useGLTF(url)

  useFrame((state) => {
    if (!groupRef.current || !modelRef.current) return
    const t = state.clock.elapsedTime * 0.5

    // Movimiento circular
    groupRef.current.position.x = position[0] + Math.sin(t) * walkRadius
    groupRef.current.position.z = position[2] + Math.cos(t) * walkRadius

    // Bounce vertical (pasos)
    groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 8)) * 0.15

    // Rotar para mirar hacia donde camina
    groupRef.current.rotation.y = t + Math.PI

    // Animacion del modelo: inclinacion hacia adelante y balanceo
    modelRef.current.rotation.x = 0.15 // Inclinado hacia adelante
    modelRef.current.rotation.z = Math.sin(t * 8) * 0.08 // Balanceo lateral
  })

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <primitive object={scene} scale={scale} />
      </group>
    </group>
  )
}

// Astronaut shortcut
const Astronaut: React.FC<{
  position: [number, number, number]
  scale?: number
  walkRadius?: number
}> = (props) => (
  <AnimatedModel
    url="/assets/models/funny_characters_pack/Assets_glb/Full_Body/Astronaut_001.glb"
    {...props}
  />
)

// Loading component with progress
const Loader = () => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="bg-black/90 text-white px-8 py-6 rounded-2xl text-center min-w-[280px]">
        <div className="text-4xl mb-4 animate-bounce">🚚</div>
        <div className="text-xl font-bold mb-2">Cargando ciudad...</div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-coral h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-400">{Math.round(progress)}%</div>
      </div>
    </Html>
  )
}

// 3D Scene - city and controls
const Scene: React.FC<{
  zone: CityZone
}> = ({ zone }) => {
  return (
    <>
      {/* Camera - positioned based on zone */}
      <PerspectiveCamera
        makeDefault
        position={zone.cameraPosition}
        fov={60}
      />

      {/* Controls - limited to zone area */}
      <OrbitControls
        target={zone.center}
        minDistance={15}
        maxDistance={zone.radius * 2}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 8}
        enablePan={true}
        panSpeed={0.5}
      />

      {/* Background sky color */}
      <color attach="background" args={['#7ec8e3']} />

      {/* Ambient light - very soft */}
      <ambientLight intensity={0.2} />

      {/* Main sun light */}
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={400}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-bias={-0.0001}
        color="#fffaf0"
      />

      {/* Fill light */}
      <directionalLight
        position={[-50, 50, -50]}
        intensity={0.3}
        color="#b0d0ff"
      />

      {/* Hemisphere for color variation */}
      <hemisphereLight
        args={['#87ceeb', '#90785a', 0.35]}
      />

      {/* Complete City Scene */}
      <Suspense fallback={null}>
        <CityScene position={[0, 0, 0]} scale={1} />
      </Suspense>

      {/* Astronaut NPC walking around */}
      <Suspense fallback={null}>
        <Astronaut position={[zone.center[0], 0, zone.center[2]]} scale={3} walkRadius={8} />
      </Suspense>
    </>
  )
}

// Main Component - simple explorer
export const GameScene3D: React.FC<{
  zoneId?: string
}> = ({
  zoneId = 'centro',
}) => {
  const [currentZoneId, setCurrentZoneId] = useState(zoneId)
  const zone = getZone(currentZoneId)

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.NoToneMapping,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={<Loader />}>
          <Scene
            key={zone.id}
            zone={zone}
          />
        </Suspense>
      </Canvas>

      {/* Zone selector - always visible */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Current zone info */}
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{zone.icono}</span>
            <div>
              <div className="font-bold text-lg">{zone.nombre}</div>
              <div className="text-xs text-gray-300">{zone.descripcion}</div>
            </div>
          </div>
        </div>

        {/* Zone buttons */}
        <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2">
          <div className="text-white text-xs mb-2 font-bold">Zonas:</div>
          <div className="flex gap-2 flex-wrap">
            {ZONE_LIST.map((z) => (
              <button
                key={z.id}
                onClick={() => setCurrentZoneId(z.id)}
                className={`px-3 py-2 rounded-lg text-lg transition-all ${
                  z.id === zone.id
                    ? 'bg-coral text-white scale-110 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/40 hover:scale-105'
                }`}
                title={z.nombre}
              >
                {z.icono}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-sm">
        <div className="font-bold mb-1">Controles:</div>
        <div className="text-gray-300 text-xs">
          🖱️ Arrastrar = Rotar<br/>
          🔍 Scroll = Zoom<br/>
          👆 Click derecho + arrastrar = Mover
        </div>
      </div>

      {/* Coordinates debug */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-xs font-mono">
        Centro: [{zone.center.join(', ')}]
      </div>
    </div>
  )
}

// Preload city model
useGLTF.preload('/assets/models/City/CityFull/City_2.glb')

export default GameScene3D
