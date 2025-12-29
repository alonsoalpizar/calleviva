// CustomizableTruck3D.tsx - Food Truck procedural de alta calidad
// Estilo lowpoly cartoon coherente con los assets del juego

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  ContactShadows,
  RoundedBox,
  Html,
  Text
} from '@react-three/drei'
import { Group } from 'three'
import * as THREE from 'three'

// ============================================
// TIPOS Y CONFIGURACIÓN
// ============================================

export interface TruckCustomization {
  // Colores principales
  bodyColor: string
  accentColor: string
  awningColor: string
  wheelColor: string

  // Opciones de diseño
  awningStyle: 'solid' | 'striped' | 'none'
  windowOpen: boolean

  // Decoraciones (basadas en la DB)
  hasSign: boolean        // sign - Letrero
  hasLights: boolean      // lights - Luces decorativas
  hasPlants: boolean      // plants - Plantas/macetas
  hasBalloon: boolean     // balloon - Globos
  hasUmbrella: boolean    // umbrella - Sombrilla
  hasMenuBoard: boolean   // menu_board - Pizarra menú
  hasSpeaker: boolean     // music - Bocina/música
  hasNeon: boolean        // neon - Letrero neón
  hasStar: boolean        // star - Estrella decorativa
  hasFlag: boolean        // flag_* - Bandera
  flagCountry?: 'cr' | 'mx' | 'us'  // País de la bandera

  // Texto del letrero
  signText?: string
}

export const DEFAULT_TRUCK_CONFIG: TruckCustomization = {
  bodyColor: '#FF6B6B',      // Coral - color principal CalleViva
  accentColor: '#4ECDC4',    // Agua - acento CalleViva
  awningColor: '#FFE66D',    // Mango - awning CalleViva
  wheelColor: '#2D3436',     // Gris oscuro
  awningStyle: 'striped',
  windowOpen: true,
  // Decoraciones por defecto
  hasSign: true,
  hasLights: true,
  hasPlants: false,
  hasBalloon: false,
  hasUmbrella: false,
  hasMenuBoard: false,
  hasSpeaker: false,
  hasNeon: false,
  hasStar: false,
  hasFlag: false,
  flagCountry: 'cr',
}

// ============================================
// COMPONENTES DE PARTES DEL TRUCK
// ============================================

// Rueda estilizada
const Wheel: React.FC<{ position: [number, number, number]; color: string }> = ({
  position,
  color
}) => {
  return (
    <group position={position}>
      {/* Llanta exterior */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Rin */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.16, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Centro del rin */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 6]} />
        <meshStandardMaterial color="#808080" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Toldo/Awning con soporte para rayas
const Awning: React.FC<{
  style: 'solid' | 'striped' | 'none'
  color: string
  accentColor: string
}> = ({ style, color, accentColor }) => {
  if (style === 'none') return null

  const stripeCount = 6

  return (
    <group position={[0, 1.45, 0.65]}>
      {/* Estructura del toldo */}
      <mesh position={[0, 0.08, 0.3]} castShadow>
        <boxGeometry args={[1.6, 0.04, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Frente ondulado del toldo */}
      <mesh position={[0, 0, 0.65]} castShadow>
        <boxGeometry args={[1.6, 0.12, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Rayas si es striped */}
      {style === 'striped' && (
        <>
          {Array.from({ length: stripeCount }).map((_, i) => (
            <mesh
              key={i}
              position={[-0.75 + (i * 0.3), 0.1, 0.3]}
              castShadow
            >
              <boxGeometry args={[0.12, 0.02, 0.7]} />
              <meshStandardMaterial color={accentColor} roughness={0.6} />
            </mesh>
          ))}
        </>
      )}

      {/* Soportes del toldo */}
      <mesh position={[-0.75, -0.2, 0.6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.75, -0.2, 0.6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#808080" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Ventana de servicio - con animación de apertura
const ServiceWindow: React.FC<{
  isOpen: boolean
  bodyColor: string
  accentColor: string
}> = ({ isOpen, bodyColor, accentColor }) => {
  // Ángulo de apertura de la ventana (tipo escotilla hacia arriba)
  const openAngle = isOpen ? -Math.PI / 2.5 : 0 // ~72 grados cuando abierta

  return (
    <group position={[0, 0.85, 0.51]}>
      {/* Marco de la ventana */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.7, 0.05]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>

      {/* Interior oscuro (profundidad) - siempre visible */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1.1, 0.6, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>

      {/* Interior del truck - hueco oscuro */}
      <group position={[0, 0, -0.15]}>
        {/* Fondo negro profundo - siempre visible */}
        <mesh>
          <boxGeometry args={[1.05, 0.55, 0.2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>

      {/* Panel de la ventana - pivota desde arriba */}
      <group position={[0, 0.3, 0.03]}>
        {/* Punto de pivote en la parte superior */}
        <group rotation={[openAngle, 0, 0]}>
          {/* El vidrio/panel de la ventana */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[1.1, 0.6, 0.02]} />
            <meshStandardMaterial
              color={isOpen ? "#6BA5B5" : "#87CEEB"}
              transparent
              opacity={isOpen ? 0.8 : 0.6}
              roughness={0.1}
              metalness={0.3}
            />
          </mesh>
          {/* Borde inferior del panel (manija) */}
          <mesh position={[0, -0.58, 0.015]} castShadow>
            <boxGeometry args={[0.3, 0.04, 0.03]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Mostrador */}
      <mesh position={[0, -0.4, 0.15]} castShadow>
        <boxGeometry args={[1.3, 0.08, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>

      {/* Detalles del mostrador - bordes redondeados simulados */}
      <mesh position={[0, -0.38, 0.32]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>
    </group>
  )
}

// Letrero del negocio con texto real
const Sign: React.FC<{ color: string; text?: string }> = ({ color, text = "FOOD TRUCK" }) => {
  // Truncar texto si es muy largo
  const displayText = text.length > 12 ? text.substring(0, 12) : text

  return (
    <group position={[0, 1.75, 0.2]}>
      {/* Tablero del letrero */}
      <RoundedBox args={[1.1, 0.38, 0.08]} radius={0.04} castShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>

      {/* Borde decorativo */}
      <RoundedBox args={[1.0, 0.28, 0.02]} radius={0.02} position={[0, 0, 0.04]}>
        <meshStandardMaterial color="#FFFFFF" roughness={0.7} />
      </RoundedBox>

      {/* Texto 3D del nombre del negocio */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.11}
        color="#1a1a2e"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.9}
        fontWeight="bold"
      >
        {displayText.toUpperCase()}
      </Text>

      {/* Soportes del letrero */}
      <mesh position={[-0.45, -0.28, 0]} castShadow>
        <boxGeometry args={[0.04, 0.18, 0.04]} />
        <meshStandardMaterial color="#808080" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.45, -0.28, 0]} castShadow>
        <boxGeometry args={[0.04, 0.18, 0.04]} />
        <meshStandardMaterial color="#808080" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  )
}

// Luces decorativas
const DecorativeLights: React.FC<{ color: string }> = ({ color }) => {
  const lightPositions = [-0.6, -0.3, 0, 0.3, 0.6]

  return (
    <group position={[0, 1.52, 0.55]}>
      {/* Cable */}
      <mesh>
        <boxGeometry args={[1.4, 0.02, 0.02]} />
        <meshStandardMaterial color="#2D3436" roughness={0.8} />
      </mesh>

      {/* Focos */}
      {lightPositions.map((x, i) => (
        <group key={i} position={[x, -0.05, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? color : '#FFFFFF'}
              emissive={i % 2 === 0 ? color : '#FFFFAA'}
              emissiveIntensity={0.3}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Plantas decorativas - Separadas del truck, en el suelo
const DecorativePlants: React.FC = () => {
  return (
    <>
      {/* Maceta grande con planta frondosa - frente izquierdo */}
      <group position={[-1.5, 0, 0.9]}>
        {/* Maceta de terracota */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.1, 0.25, 12]} />
          <meshStandardMaterial color="#C2785C" roughness={0.7} />
        </mesh>
        {/* Borde de la maceta */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <torusGeometry args={[0.15, 0.02, 8, 16]} />
          <meshStandardMaterial color="#B86B4D" roughness={0.7} />
        </mesh>
        {/* Tierra */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
          <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </mesh>
        {/* Planta - hojas */}
        <group position={[0, 0.3, 0]}>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(angle * Math.PI / 180) * 0.08,
                0.1 + (i % 2) * 0.05,
                Math.sin(angle * Math.PI / 180) * 0.08
              ]}
              rotation={[0.3, angle * Math.PI / 180, 0.2]}
              castShadow
            >
              <sphereGeometry args={[0.08, 8, 6]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#228B22' : '#32CD32'} roughness={0.7} />
            </mesh>
          ))}
          {/* Centro más alto */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#2E8B57" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Cactus en maceta - frente derecho */}
      <group position={[1.4, 0, 1.1]}>
        {/* Maceta cerámica azul */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.08, 0.2, 10]} />
          <meshStandardMaterial color="#4A90A4" roughness={0.5} />
        </mesh>
        {/* Tierra */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 10]} />
          <meshStandardMaterial color="#6D4C41" roughness={0.9} />
        </mesh>
        {/* Cactus principal */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.25, 8, 12]} />
          <meshStandardMaterial color="#3D8B40" roughness={0.6} />
        </mesh>
        {/* Brazos del cactus */}
        <mesh position={[0.08, 0.4, 0]} rotation={[0, 0, -0.4]} castShadow>
          <capsuleGeometry args={[0.035, 0.12, 6, 8]} />
          <meshStandardMaterial color="#4CAF50" roughness={0.6} />
        </mesh>
        <mesh position={[-0.06, 0.35, 0.04]} rotation={[0.3, 0, 0.5]} castShadow>
          <capsuleGeometry args={[0.03, 0.1, 6, 8]} />
          <meshStandardMaterial color="#66BB6A" roughness={0.6} />
        </mesh>
        {/* Flor del cactus */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FF6B6B" roughness={0.4} />
        </mesh>
      </group>

      {/* Maceta pequeña con suculenta - junto al mostrador */}
      <group position={[0.7, 0.47, 0.7]}>
        {/* Maceta pequeña */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.07, 8]} />
          <meshStandardMaterial color="#E8B89D" roughness={0.6} />
        </mesh>
        {/* Suculenta */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <dodecahedronGeometry args={[0.05, 0]} />
          <meshStandardMaterial color="#81C784" roughness={0.5} />
        </mesh>
      </group>
    </>
  )
}

// Globos decorativos (balloon) - Posicionados arriba del truck
const Balloon: React.FC<{ color: string }> = ({ color }) => {
  const groupRef = useRef<Group>(null)
  const baseY = useRef(2.4)

  // Animación de flotación suave
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY.current + Math.sin(state.clock.elapsedTime * 2) * 0.05
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.08
    }
  })

  return (
    <group ref={groupRef} position={[0.6, 2.4, 0.4]}>
      {/* Globo principal - coral */}
      <mesh castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      {/* Nudo del globo */}
      <mesh position={[0, -0.15, 0]}>
        <coneGeometry args={[0.025, 0.04, 6]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Segundo globo - amarillo, un poco más arriba */}
      <mesh position={[-0.18, 0.12, 0.05]} castShadow>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial
          color="#FFE66D"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[-0.18, -0.02, 0.05]}>
        <coneGeometry args={[0.02, 0.03, 6]} />
        <meshStandardMaterial color="#FFE66D" roughness={0.4} />
      </mesh>

      {/* Tercer globo - agua */}
      <mesh position={[0.1, 0.18, -0.1]} castShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial
          color="#4ECDC4"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Cuerdas hacia abajo */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.7, 4]} />
        <meshStandardMaterial color="#666666" roughness={0.9} />
      </mesh>
      <mesh position={[-0.18, -0.38, 0.05]}>
        <cylinderGeometry args={[0.003, 0.003, 0.6, 4]} />
        <meshStandardMaterial color="#666666" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Sombrilla/Parasol para clientes (separada del truck, en el suelo)
const Umbrella: React.FC<{ color: string }> = ({ color }) => {
  return (
    <group position={[1.8, 0, 0.8]}>
      {/* Poste principal - desde el suelo */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 1.8, 8]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>

      {/* Sombrilla arriba */}
      <group position={[0, 1.85, 0]}>
        {/* Tela de la sombrilla */}
        <mesh rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.7, 0.3, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} side={2} />
        </mesh>
        {/* Rayas blancas */}
        {[0, 2, 4, 6].map((i) => (
          <mesh key={i} rotation={[0, (Math.PI / 4) * i, 0]}>
            <coneGeometry args={[0.68, 0.28, 8, 1, false, (Math.PI / 8) * i, Math.PI / 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} side={2} />
          </mesh>
        ))}
        {/* Punta decorativa */}
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} />
        </mesh>
      </group>

      {/* Base/soporte en el suelo */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.05, 12]} />
        <meshStandardMaterial color="#4A4A4A" roughness={0.8} />
      </mesh>

      {/* Mesa pequeña opcional bajo la sombrilla */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 12]} />
        <meshStandardMaterial color="#DEB887" roughness={0.6} />
      </mesh>
      {/* Pata de la mesa */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.7} />
      </mesh>
    </group>
  )
}

// Pizarra de menú (menu_board)
const MenuBoard: React.FC = () => {
  return (
    <group position={[0.95, 0.7, 0.35]} rotation={[0, -0.3, 0]}>
      {/* Marco de madera */}
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.5, 0.03]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Pizarra negra */}
      <mesh position={[0, 0, 0.016]}>
        <boxGeometry args={[0.3, 0.44, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Líneas de texto simuladas (tiza) */}
      {[-0.12, -0.04, 0.04, 0.12].map((y, i) => (
        <mesh key={i} position={[0, y, 0.025]}>
          <boxGeometry args={[0.22 - i * 0.03, 0.02, 0.005]} />
          <meshStandardMaterial color="#FFFFEE" roughness={0.95} />
        </mesh>
      ))}
      {/* Soporte/pata */}
      <mesh position={[0, -0.35, -0.15]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.03, 0.35]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Bocina/Speaker (music)
const Speaker: React.FC<{ color: string }> = ({ color }) => {
  const groupRef = useRef<Group>(null)

  // Vibración sutil para simular el sonido
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.01
      groupRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.01
    }
  })

  return (
    <group ref={groupRef} position={[-0.88, 1.2, 0.3]}>
      {/* Cuerpo del speaker */}
      <RoundedBox args={[0.15, 0.2, 0.12]} radius={0.02} castShadow>
        <meshStandardMaterial color="#2D3436" roughness={0.7} />
      </RoundedBox>
      {/* Cono del speaker */}
      <mesh position={[0.01, 0.03, 0.06]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0.01, 0.03, 0.065]}>
        <circleGeometry args={[0.02, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Speaker pequeño (tweeter) */}
      <mesh position={[0.01, -0.05, 0.06]}>
        <circleGeometry args={[0.025, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Indicador LED */}
      <mesh position={[0.04, 0.08, 0.06]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

// Letrero Neón (neon) con texto brillante
const NeonSign: React.FC<{ color: string; text?: string }> = ({ color, text = "OPEN" }) => {
  const groupRef = useRef<Group>(null)
  // Truncar texto si es muy largo
  const displayText = text.length > 8 ? text.substring(0, 8) : text

  // Efecto de parpadeo sutil del neón
  useFrame((state) => {
    if (groupRef.current) {
      const flicker = Math.sin(state.clock.elapsedTime * 15) * 0.1 + 0.9
      groupRef.current.children.forEach(child => {
        if (child.type === 'PointLight') {
          (child as THREE.PointLight).intensity = 0.4 * flicker
        }
      })
    }
  })

  return (
    <group ref={groupRef} position={[0, 1.3, 0.53]}>
      {/* Marco del neón */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.28, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Fondo del neón - ligeramente iluminado */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[0.82, 0.2, 0.01]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={color}
          emissiveIntensity={0.05}
          roughness={0.9}
        />
      </mesh>

      {/* Texto neón brillante */}
      <Text
        position={[0, 0, 0.03]}
        fontSize={0.09}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor={color}
        fontWeight="bold"
      >
        {displayText.toUpperCase()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </Text>

      {/* Efecto de brillo del neón */}
      <pointLight position={[0, 0, 0.15]} color={color} intensity={0.4} distance={1.2} />

      {/* Borde decorativo del marco */}
      <mesh position={[0, 0.12, 0.02]}>
        <boxGeometry args={[0.85, 0.02, 0.02]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.12, 0.02]}>
        <boxGeometry args={[0.85, 0.02, 0.02]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
    </group>
  )
}

// Estrella decorativa (star)
const DecorativeStar: React.FC<{ color: string }> = ({ color }) => {
  const groupRef = useRef<Group>(null)

  // Rotación lenta
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[-0.5, 1.85, 0.1]}>
      {/* Estrella 3D simplificada (dos pirámides) */}
      <mesh rotation={[0, 0, 0]} castShadow>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Brillo */}
      <pointLight position={[0, 0, 0]} color={color} intensity={0.2} distance={0.5} />
    </group>
  )
}

// Bandera (flag)
const Flag: React.FC<{ country: 'cr' | 'mx' | 'us' }> = ({ country }) => {
  const groupRef = useRef<Group>(null)

  // Ondulación de la bandera
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  // Colores de las banderas
  const flagColors = {
    cr: ['#002B7F', '#FFFFFF', '#CE1126', '#FFFFFF', '#002B7F'], // Costa Rica
    mx: ['#006341', '#FFFFFF', '#CE1126'], // México
    us: ['#B22234', '#FFFFFF', '#3C3B6E'], // USA
  }

  const colors = flagColors[country]
  const stripeHeight = country === 'cr' ? 0.04 : 0.067

  return (
    <group position={[0.85, 1.6, -0.35]}>
      {/* Poste */}
      <mesh castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Punta dorada */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Bandera */}
      <group ref={groupRef} position={[0.12, 0.2, 0]}>
        {colors.map((color, i) => (
          <mesh key={i} position={[0, (colors.length / 2 - i - 0.5) * stripeHeight, 0]} castShadow>
            <boxGeometry args={[0.2, stripeHeight, 0.01]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ============================================
// COMPONENTE PRINCIPAL DEL TRUCK
// ============================================

interface TruckModelProps {
  config: TruckCustomization
  autoRotate?: boolean
}

const TruckModel: React.FC<TruckModelProps> = ({
  config,
  autoRotate = false
}) => {
  const groupRef = useRef<Group>(null)

  // Auto-rotación suave
  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* === CUERPO PRINCIPAL === */}
      <group position={[0, 0.5, 0]}>
        {/* Base/Chassis */}
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.1, 1.1]} />
          <meshStandardMaterial color="#2D3436" roughness={0.8} />
        </mesh>

        {/* Cuerpo principal del trailer */}
        <RoundedBox
          args={[1.7, 1.1, 1]}
          radius={0.05}
          smoothness={4}
          castShadow
          receiveShadow
          position={[0, 0.45, 0]}
        >
          <meshStandardMaterial
            color={config.bodyColor}
            roughness={0.6}
            metalness={0.1}
          />
        </RoundedBox>

        {/* Techo */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[1.75, 0.08, 1.05]} />
          <meshStandardMaterial
            color={config.bodyColor}
            roughness={0.5}
            metalness={0.15}
          />
        </mesh>

        {/* Franja decorativa lateral */}
        <mesh position={[0, 0.3, 0.51]} castShadow>
          <boxGeometry args={[1.6, 0.15, 0.02]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.3, -0.51]} castShadow>
          <boxGeometry args={[1.6, 0.15, 0.02]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} />
        </mesh>

        {/* Línea inferior */}
        <mesh position={[0, -0.05, 0.51]} castShadow>
          <boxGeometry args={[1.7, 0.08, 0.02]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.05, -0.51]} castShadow>
          <boxGeometry args={[1.7, 0.08, 0.02]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} />
        </mesh>

        {/* Panel trasero */}
        <mesh position={[-0.86, 0.45, 0]} castShadow>
          <boxGeometry args={[0.02, 1, 0.95]} />
          <meshStandardMaterial color={config.bodyColor} roughness={0.6} />
        </mesh>

        {/* Panel frontal con detalles */}
        <mesh position={[0.86, 0.45, 0]} castShadow>
          <boxGeometry args={[0.02, 1, 0.95]} />
          <meshStandardMaterial color={config.bodyColor} roughness={0.6} />
        </mesh>

        {/* Ventana lateral trasera */}
        <mesh position={[-0.5, 0.65, -0.51]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.03]} />
          <meshStandardMaterial
            color="#87CEEB"
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Puerta trasera */}
        <group position={[-0.86, 0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.04, 0.8, 0.6]} />
            <meshStandardMaterial color={config.accentColor} roughness={0.5} />
          </mesh>
          {/* Manija */}
          <mesh position={[-0.03, 0, 0.2]} castShadow>
            <boxGeometry args={[0.04, 0.08, 0.04]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* === VENTANA DE SERVICIO === */}
      <ServiceWindow
        isOpen={config.windowOpen}
        bodyColor={config.bodyColor}
        accentColor={config.accentColor}
      />

      {/* === TOLDO === */}
      <Awning
        style={config.awningStyle}
        color={config.awningColor}
        accentColor={config.bodyColor}
      />

      {/* === RUEDAS === */}
      <Wheel position={[-0.55, 0.25, 0.5]} color={config.wheelColor} />
      <Wheel position={[-0.55, 0.25, -0.5]} color={config.wheelColor} />
      <Wheel position={[0.55, 0.25, 0.5]} color={config.wheelColor} />
      <Wheel position={[0.55, 0.25, -0.5]} color={config.wheelColor} />

      {/* === ACCESORIOS Y DECORACIONES === */}
      {config.hasSign && (
        <Sign color={config.accentColor} text={config.signText} />
      )}

      {config.hasLights && (
        <DecorativeLights color={config.awningColor} />
      )}

      {config.hasPlants && (
        <DecorativePlants />
      )}

      {config.hasBalloon && (
        <Balloon color={config.accentColor} />
      )}

      {config.hasUmbrella && (
        <Umbrella color={config.awningColor} />
      )}

      {config.hasMenuBoard && (
        <MenuBoard />
      )}

      {config.hasSpeaker && (
        <Speaker color={config.accentColor} />
      )}

      {config.hasNeon && (
        <NeonSign color={config.accentColor} text={config.signText || "ABIERTO"} />
      )}

      {config.hasStar && (
        <DecorativeStar color="#FFD700" />
      )}

      {config.hasFlag && config.flagCountry && (
        <Flag country={config.flagCountry} />
      )}

      {/* === DETALLES ADICIONALES === */}
      {/* Aire acondicionado en el techo */}
      <mesh position={[0.3, 1.65, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.3]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.7} />
      </mesh>
      <mesh position={[0.3, 1.75, -0.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 8]} />
        <meshStandardMaterial color="#808080" roughness={0.6} />
      </mesh>

      {/* Generador/tanque de gas */}
      <mesh position={[-0.6, 1.65, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
        <meshStandardMaterial color="#4A4A4A" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ============================================
// COMPONENTE CANVAS COMPLETO
// ============================================

interface CustomizableTruck3DProps {
  config?: Partial<TruckCustomization>
  autoRotate?: boolean
  height?: number
  showControls?: boolean
}

export const CustomizableTruck3D: React.FC<CustomizableTruck3DProps> = ({
  config = {},
  autoRotate = true,
  height = 350,
  showControls = true,
}) => {
  const fullConfig = useMemo(() => ({
    ...DEFAULT_TRUCK_CONFIG,
    ...config,
  }), [config])

  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50"
    >
      <Canvas
        shadows
        camera={{ position: [3, 2.5, 3], fov: 40 }}
        gl={{ antialias: true }}
      >
        <React.Suspense fallback={
          <Html center>
            <div className="text-coral text-lg font-bold animate-pulse">
              Cargando...
            </div>
          </Html>
        }>
          {/* Iluminación profesional */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-3, 4, -3]} intensity={0.3} />
          <pointLight position={[0, 3, 2]} intensity={0.4} color="#FFE4B5" />

          {/* Ambiente HDR */}
          <Environment preset="city" />

          {/* El Truck */}
          <TruckModel config={fullConfig} autoRotate={autoRotate} />

          {/* Sombra de contacto */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.5}
            scale={8}
            blur={2.5}
            far={4}
            color="#2D3436"
          />

          {/* Piso sutil */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial
              color="#E8E8E8"
              roughness={0.9}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Controles de órbita */}
          {showControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2.5}
              maxDistance={8}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.2}
              target={[0, 0.8, 0]}
              autoRotate={false}
            />
          )}
        </React.Suspense>
      </Canvas>
    </div>
  )
}

// ============================================
// VISOR 3D PREMIUM CON CONTROLES
// ============================================

interface TruckViewer3DProps {
  config?: Partial<TruckCustomization>
  onRandomize?: () => void
  showControls?: boolean
  className?: string
}

export const TruckViewer3D: React.FC<TruckViewer3DProps> = ({
  config = {},
  onRandomize,
  showControls = true,
  className = ''
}) => {
  const [autoRotate, setAutoRotate] = useState(true)
  const [zoom, setZoom] = useState(1)

  const fullConfig = useMemo(() => ({
    ...DEFAULT_TRUCK_CONFIG,
    ...config,
  }), [config])

  // Contar decoraciones activas
  const decorationCount = useMemo(() => {
    let count = 0
    if (fullConfig.hasSign) count++
    if (fullConfig.hasLights) count++
    if (fullConfig.hasPlants) count++
    if (fullConfig.hasBalloon) count++
    if (fullConfig.hasUmbrella) count++
    if (fullConfig.hasMenuBoard) count++
    if (fullConfig.hasSpeaker) count++
    if (fullConfig.hasNeon) count++
    if (fullConfig.hasStar) count++
    if (fullConfig.hasFlag) count++
    return count
  }, [fullConfig])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Canvas 3D Principal */}
      <Canvas
        shadows
        camera={{ position: [3 / zoom, 2.5 / zoom, 3 / zoom], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={
          <Html center>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
              <span className="text-white font-bold text-sm">Cargando modelo...</span>
            </div>
          </Html>
        }>
          {/* Iluminación cinematográfica */}
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={20}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-4, 3, -4]} intensity={0.25} color="#B0E0E6" />
          <pointLight position={[0, 4, 3]} intensity={0.5} color="#FFE4B5" />
          <pointLight position={[-3, 2, 0]} intensity={0.2} color="#87CEEB" />

          {/* Ambiente HDR */}
          <Environment preset="city" />

          {/* El Food Truck */}
          <TruckModel config={fullConfig} autoRotate={autoRotate} />

          {/* Sombra de contacto premium */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.6}
            scale={10}
            blur={2.5}
            far={5}
            color="#1a1a2e"
          />

          {/* Piso con gradiente sutil */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial
              color="#E8E8E8"
              roughness={0.95}
              transparent
              opacity={0.25}
            />
          </mesh>

          {/* Controles de órbita */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.1}
            target={[0, 0.7, 0]}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </React.Suspense>
      </Canvas>

      {/* Overlay de controles */}
      {showControls && (
        <>
          {/* Contador de decoraciones - esquina superior derecha */}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span>{decorationCount} accesorios</span>
          </div>

          {/* Controles inferiores */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {/* Botones de control izquierda */}
            <div className="flex gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-2.5 rounded-xl backdrop-blur-sm transition-all font-bold text-sm flex items-center gap-1.5 ${
                  autoRotate
                    ? 'bg-coral/90 text-white shadow-lg'
                    : 'bg-black/50 text-white/80 hover:bg-black/70'
                }`}
                title={autoRotate ? 'Detener rotación' : 'Rotar automáticamente'}
              >
                {autoRotate ? '⏸️' : '🔄'}
                <span className="hidden sm:inline">{autoRotate ? 'Pausar' : 'Rotar'}</span>
              </button>

              <button
                onClick={() => setZoom(z => z === 1 ? 1.5 : z === 1.5 ? 0.7 : 1)}
                className="p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white/80 hover:bg-black/70 transition-all font-bold text-sm flex items-center gap-1.5"
                title="Cambiar zoom"
              >
                🔍
                <span className="hidden sm:inline">{zoom === 1 ? 'Normal' : zoom > 1 ? 'Cerca' : 'Lejos'}</span>
              </button>
            </div>

            {/* Botón aleatorio (si está disponible) */}
            {onRandomize && (
              <button
                onClick={onRandomize}
                className="p-2.5 px-4 rounded-xl bg-agua/90 backdrop-blur-sm text-white shadow-lg hover:bg-agua transition-all font-bold text-sm flex items-center gap-1.5"
              >
                🎲
                <span>Aleatorio</span>
              </button>
            )}

            {/* Instrucciones */}
            <div className="hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white/70 px-3 py-1.5 rounded-full text-xs">
              <span>🖱️ Arrastra para girar</span>
              <span className="text-white/40">|</span>
              <span>🔍 Scroll para zoom</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// VERSIÓN COMPACTA PARA PREVIEW (legacy)
// ============================================

export const CustomizableTruck3DPreview: React.FC<{
  config?: Partial<TruckCustomization>
}> = ({ config = {} }) => {
  return <TruckViewer3D config={config} showControls={false} />
}

export default CustomizableTruck3D
