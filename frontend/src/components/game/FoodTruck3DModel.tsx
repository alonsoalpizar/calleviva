// FoodTruck3DModel.tsx - Modelo 3D del Food Truck para personalización
// Usa el modelo lowpoly de ithappy

import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html, ContactShadows } from '@react-three/drei'
import { Group, MeshStandardMaterial, Mesh } from 'three'

const MODEL_PATH = '/assets/models/trucks/food_truck_lowpoly.glb'

// Preload the model
useGLTF.preload(MODEL_PATH)

// Loading component
const Loader = () => (
  <Html center>
    <div className="text-coral text-lg font-bold animate-pulse">Cargando modelo...</div>
  </Html>
)

// The 3D Food Truck Model
interface TruckModelProps {
  color?: string
  autoRotate?: boolean
}

const TruckModel: React.FC<TruckModelProps> = ({ color = '#4ECDC4', autoRotate = true }) => {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(MODEL_PATH)

  // Clone the scene to allow color changes
  const clonedScene = scene.clone()

  // Apply color to main body parts
  clonedScene.traverse((child) => {
    if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
      // Check if this is a body part (not wheels, windows, etc.)
      const name = child.name.toLowerCase()
      if (name.includes('body') || name.includes('trailer') || name.includes('truck')) {
        const material = child.material.clone()
        material.color.set(color)
        child.material = material
      }
    }
  })

  // Auto-rotate animation
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1.2}>
      <primitive object={clonedScene} />
    </group>
  )
}

// Main component with Canvas
interface FoodTruck3DModelProps {
  color?: string
  autoRotate?: boolean
  height?: number
}

export const FoodTruck3DModel: React.FC<FoodTruck3DModelProps> = ({
  color = '#4ECDC4',
  autoRotate = true,
  height = 300
}) => {
  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100">
      <Canvas
        shadows
        camera={{ position: [3, 2, 3], fov: 45 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={<Loader />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* The Truck */}
          <TruckModel color={color} autoRotate={autoRotate} />

          {/* Shadow */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0.3, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Compact preview version
export const FoodTruck3DPreview: React.FC<{ color?: string }> = ({ color = '#4ECDC4' }) => {
  return (
    <div className="w-full h-full min-h-[200px]">
      <Canvas
        shadows
        camera={{ position: [2.5, 1.5, 2.5], fov: 50 }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Environment preset="sunset" />
          <TruckModel color={color} autoRotate={true} />
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.3}
            scale={6}
            blur={1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default FoodTruck3DModel
