// FoodTruck3D.tsx - 3D Food Truck model using basic geometries
// Can be replaced with GLTF model later

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group } from 'three'
import { Html } from '@react-three/drei'

interface FoodTruck3DProps {
  position?: [number, number, number]
  rotation?: number
  color?: string
  name?: string
  open?: boolean
  onTruckClick?: () => void
}

export const FoodTruck3D: React.FC<FoodTruck3DProps> = ({
  position = [0, 0, 0],
  rotation = 0,
  color = '#FF6B6B',
  name = 'Mi Carrito',
  open = true,
  onTruckClick,
}) => {
  const groupRef = useRef<Group>(null)
  const awningRef = useRef<Mesh>(null)

  // Subtle idle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
    if (awningRef.current && open) {
      awningRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.02 - 0.3
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      onClick={onTruckClick}
    >
      {/* Main body */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.4, 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Cabin */}
      <mesh position={[-1.5, 0.6, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 1.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Cabin windshield */}
      <mesh position={[-1.95, 0.7, 0]}>
        <boxGeometry args={[0.1, 0.5, 1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>

      {/* Counter window */}
      {open && (
        <mesh position={[0, 1.1, 0.76]}>
          <boxGeometry args={[1.5, 0.7, 0.05]} />
          <meshStandardMaterial color="#2D3436" />
        </mesh>
      )}

      {/* Awning */}
      {open && (
        <mesh
          ref={awningRef}
          position={[0, 1.7, 1.2]}
          rotation={[-0.3, 0, 0]}
          castShadow
        >
          <boxGeometry args={[2.2, 0.05, 1]} />
          <meshStandardMaterial color="#FFE66D" />
        </mesh>
      )}

      {/* Wheels */}
      {[[-1.2, 0.2, 0.8], [-1.2, 0.2, -0.8], [0.8, 0.2, 0.8], [0.8, 0.2, -0.8]].map(
        (pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial color="#2D3436" />
          </mesh>
        )
      )}

      {/* Menu board */}
      {open && (
        <group position={[0, 2.2, 0.8]}>
          <mesh>
            <boxGeometry args={[1.2, 0.4, 0.05]} />
            <meshStandardMaterial color="#F5F0E6" />
          </mesh>
          <Html
            position={[0, 0, 0.03]}
            transform
            occlude
            style={{
              fontSize: '8px',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 'bold',
              color: '#2D3436',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Html>
        </group>
      )}

      {/* Smoke particles when open */}
      {open && (
        <group position={[0.5, 1.8, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.sin(Date.now() * 0.001 + i) * 0.1,
                (Date.now() * 0.001 + i * 0.5) % 1,
                0,
              ]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color="white"
                transparent
                opacity={0.5 - ((Date.now() * 0.001 + i * 0.5) % 1) * 0.5}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export default FoodTruck3D
