// Environment3D.tsx - Ground, sky, buildings, and lighting

import React, { useMemo } from 'react'
import { Sky, Cloud } from '@react-three/drei'

interface Environment3DProps {
  timeOfDay?: number // 0-24
  weather?: 'sunny' | 'cloudy' | 'rainy'
}

// Simple building component
const Building: React.FC<{
  position: [number, number, number]
  size: [number, number, number]
  color: string
}> = ({ position, size, color }) => (
  <group position={position}>
    {/* Main building */}
    <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>

    {/* Windows */}
    {Array.from({ length: Math.floor(size[1] / 0.8) }).map((_, floor) =>
      Array.from({ length: Math.floor(size[0] / 0.6) }).map((_, col) => (
        <mesh
          key={`${floor}-${col}`}
          position={[
            -size[0] / 2 + 0.4 + col * 0.6,
            0.5 + floor * 0.8,
            size[2] / 2 + 0.01,
          ]}
        >
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial
            color="#87CEEB"
            emissive="#FFE66D"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))
    )}

    {/* Roof */}
    <mesh position={[0, size[1] + 0.1, 0]} castShadow>
      <boxGeometry args={[size[0] + 0.2, 0.2, size[2] + 0.2]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
  </group>
)

// Tree component
const Tree: React.FC<{ position: [number, number, number]; scale?: number }> = ({
  position,
  scale = 1,
}) => (
  <group position={position} scale={scale}>
    {/* Trunk */}
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>

    {/* Foliage */}
    <mesh position={[0, 0.9, 0]} castShadow>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshStandardMaterial color="#4CAF50" />
    </mesh>
    <mesh position={[0.2, 0.7, 0.1]} castShadow>
      <sphereGeometry args={[0.25, 8, 8]} />
      <meshStandardMaterial color="#66BB6A" />
    </mesh>
    <mesh position={[-0.15, 0.75, -0.1]} castShadow>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial color="#43A047" />
    </mesh>
  </group>
)

// Street lamp
const StreetLamp: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    {/* Pole */}
    <mesh position={[0, 1, 0]} castShadow>
      <cylinderGeometry args={[0.03, 0.05, 2, 8]} />
      <meshStandardMaterial color="#37474F" />
    </mesh>

    {/* Lamp head */}
    <mesh position={[0, 2.1, 0]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="#FFEE58" emissive="#FFF59D" emissiveIntensity={0.5} />
    </mesh>

    {/* Point light */}
    <pointLight position={[0, 2.1, 0]} intensity={0.5} distance={4} color="#FFF59D" />
  </group>
)

export const Environment3D: React.FC<Environment3DProps> = ({
  timeOfDay = 12,
  weather = 'sunny',
}) => {
  // Calculate sun position based on time
  const sunPosition = useMemo(() => {
    const angle = ((timeOfDay - 6) / 12) * Math.PI // 6am = 0, 6pm = PI
    const height = Math.sin(angle) * 100
    const distance = Math.cos(angle) * 100
    return [distance, Math.max(height, 10), 50] as [number, number, number]
  }, [timeOfDay])

  const isNight = timeOfDay < 6 || timeOfDay > 19

  return (
    <>
      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.5}
        azimuth={0.25}
        rayleigh={isNight ? 0.1 : 2}
      />

      {/* Clouds */}
      {weather !== 'sunny' && (
        <>
          <Cloud position={[-10, 15, -5]} speed={0.2} opacity={0.5} />
          <Cloud position={[10, 12, 5]} speed={0.3} opacity={0.4} />
          <Cloud position={[0, 14, -10]} speed={0.1} opacity={0.6} />
        </>
      )}

      {/* Ground - grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#7CB342" />
      </mesh>

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 3]} receiveShadow>
        <planeGeometry args={[50, 4]} />
        <meshStandardMaterial color="#424242" />
      </mesh>

      {/* Road lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-20 + i * 5, 0.02, 3]}
        >
          <planeGeometry args={[2, 0.1]} />
          <meshStandardMaterial color="#FFE66D" />
        </mesh>
      ))}

      {/* Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 2]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>

      {/* Buildings - background */}
      <Building position={[-8, 0, -6]} size={[3, 4, 2]} color="#FFAB91" />
      <Building position={[-4, 0, -7]} size={[2.5, 5, 2]} color="#90CAF9" />
      <Building position={[0, 0, -8]} size={[4, 6, 2.5]} color="#CE93D8" />
      <Building position={[5, 0, -7]} size={[3, 4.5, 2]} color="#A5D6A7" />
      <Building position={[9, 0, -6]} size={[2.5, 3.5, 2]} color="#FFF59D" />

      {/* Trees */}
      <Tree position={[-6, 0, -2]} scale={1.2} />
      <Tree position={[6, 0, -2]} scale={1} />
      <Tree position={[-10, 0, -4]} scale={0.8} />
      <Tree position={[10, 0, -3]} scale={1.1} />

      {/* Street lamps */}
      <StreetLamp position={[-5, 0, 1.5]} />
      <StreetLamp position={[5, 0, 1.5]} />

      {/* Ambient light */}
      <ambientLight intensity={isNight ? 0.2 : 0.4} />

      {/* Sun/Moon light */}
      <directionalLight
        position={sunPosition}
        intensity={isNight ? 0.3 : 1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  )
}

export default Environment3D
