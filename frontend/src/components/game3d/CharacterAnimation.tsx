// CharacterAnimation.tsx - Sistema de animacion procedural para personajes
// Funciona con cualquier personaje (modular o full_body) sin necesidad de rig

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ==================== TIPOS DE ANIMACION ====================

export type AnimationType =
  | 'idle'      // Respiracion suave, pequeño movimiento
  | 'walk'      // Caminar con bounce y balanceo
  | 'run'       // Correr (mas rapido, mas bounce)
  | 'jump'      // Salto (una vez)
  | 'wave'      // Saludar (rotacion lateral)
  | 'dance'     // Bailar (movimiento ritmico)
  | 'none'      // Sin animacion

export interface AnimationConfig {
  type: AnimationType
  speed?: number        // Multiplicador de velocidad (default: 1)
  intensity?: number    // Intensidad del movimiento (default: 1)
  loop?: boolean        // Si la animacion se repite (default: true)
}

export interface WalkPath {
  type: 'circle' | 'line' | 'random' | 'patrol'
  radius?: number       // Para circle
  points?: [number, number, number][]  // Para patrol
  bounds?: { minX: number, maxX: number, minZ: number, maxZ: number }  // Para random
}

// ==================== HOOK DE ANIMACION ====================

interface UseCharacterAnimationProps {
  animation: AnimationConfig
  path?: WalkPath
  startPosition: [number, number, number]
}

interface AnimationRefs {
  groupRef: React.RefObject<THREE.Group>
  modelRef: React.RefObject<THREE.Group>
}

export function useCharacterAnimation({
  animation,
  path,
  startPosition
}: UseCharacterAnimationProps): AnimationRefs {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)

  // Estado interno para animaciones con estado
  const stateRef = useRef({
    jumpPhase: 0,
    patrolIndex: 0,
    randomTarget: { x: startPosition[0], z: startPosition[2] },
    lastRandomTime: 0
  })

  useFrame((state) => {
    if (!groupRef.current || !modelRef.current) return

    const time = state.clock.elapsedTime
    const { type, speed = 1, intensity = 1 } = animation
    const t = time * speed

    // Reset rotaciones del modelo
    modelRef.current.rotation.set(0, 0, 0)

    switch (type) {
      case 'idle':
        // Respiracion suave
        const breathe = Math.sin(t * 2) * 0.02 * intensity
        groupRef.current.position.y = startPosition[1] + breathe
        // Pequeño balanceo
        modelRef.current.rotation.z = Math.sin(t * 1.5) * 0.01 * intensity
        break

      case 'walk':
        applyWalkAnimation(groupRef.current, modelRef.current, t, intensity, path, startPosition, stateRef.current)
        break

      case 'run':
        applyRunAnimation(groupRef.current, modelRef.current, t, intensity, path, startPosition, stateRef.current)
        break

      case 'jump':
        applyJumpAnimation(groupRef.current, modelRef.current, t, intensity, startPosition, stateRef.current)
        break

      case 'wave':
        // Saludar - rotacion lateral
        groupRef.current.position.set(...startPosition)
        modelRef.current.rotation.z = Math.sin(t * 8) * 0.15 * intensity
        modelRef.current.rotation.x = 0.1 * intensity
        break

      case 'dance':
        // Bailar - movimiento ritmico
        groupRef.current.position.y = startPosition[1] + Math.abs(Math.sin(t * 4)) * 0.1 * intensity
        modelRef.current.rotation.y = Math.sin(t * 2) * 0.3 * intensity
        modelRef.current.rotation.z = Math.sin(t * 4) * 0.1 * intensity
        break

      case 'none':
      default:
        groupRef.current.position.set(...startPosition)
        break
    }
  })

  return { groupRef, modelRef }
}

// ==================== FUNCIONES DE ANIMACION ====================

interface AnimationState {
  jumpPhase: number
  patrolIndex: number
  randomTarget: { x: number, z: number }
  lastRandomTime: number
}

function applyWalkAnimation(
  group: THREE.Group,
  model: THREE.Group,
  t: number,
  intensity: number,
  path: WalkPath | undefined,
  startPosition: [number, number, number],
  _state: AnimationState
) {
  const walkSpeed = 0.5
  const time = t * walkSpeed

  // Bounce (pasos)
  const bounce = Math.abs(Math.sin(time * 8)) * 0.12 * intensity

  // Posicion segun el path
  let x = startPosition[0]
  let z = startPosition[2]
  let rotation = 0

  if (path) {
    switch (path.type) {
      case 'circle':
        const radius = path.radius || 8
        x = startPosition[0] + Math.sin(time) * radius
        z = startPosition[2] + Math.cos(time) * radius
        rotation = time + Math.PI
        break

      case 'line':
        // Caminar de ida y vuelta
        const lineLength = path.radius || 10
        const progress = Math.sin(time * 0.5)
        x = startPosition[0] + progress * lineLength
        rotation = progress > 0 ? Math.PI / 2 : -Math.PI / 2
        break

      case 'patrol':
        if (path.points && path.points.length > 1) {
          // TODO: Implementar patrulla entre puntos
          x = startPosition[0]
          z = startPosition[2]
        }
        break

      case 'random':
        // TODO: Implementar movimiento aleatorio
        break
    }
  } else {
    // Sin path, camina en circulo pequeño
    x = startPosition[0] + Math.sin(time) * 5
    z = startPosition[2] + Math.cos(time) * 5
    rotation = time + Math.PI
  }

  group.position.set(x, startPosition[1] + bounce, z)
  group.rotation.y = rotation

  // Inclinacion hacia adelante
  model.rotation.x = 0.08 * intensity

  // Balanceo lateral (waddle)
  model.rotation.z = Math.sin(time * 8) * 0.06 * intensity
}

function applyRunAnimation(
  group: THREE.Group,
  model: THREE.Group,
  t: number,
  intensity: number,
  path: WalkPath | undefined,
  startPosition: [number, number, number],
  state: AnimationState
) {
  // Run es como walk pero mas rapido y con mas bounce
  applyWalkAnimation(group, model, t * 2, intensity * 1.5, path, startPosition, state)

  // Mas inclinacion hacia adelante
  model.rotation.x = 0.15 * intensity
}

function applyJumpAnimation(
  group: THREE.Group,
  model: THREE.Group,
  t: number,
  intensity: number,
  startPosition: [number, number, number],
  state: { jumpPhase: number }
) {
  // Salto con curva parabolica
  const jumpDuration = 1.5
  const jumpHeight = 1.5 * intensity

  const phase = (t % jumpDuration) / jumpDuration

  // Curva parabolica para el salto
  const height = jumpHeight * Math.sin(phase * Math.PI)

  group.position.set(startPosition[0], startPosition[1] + height, startPosition[2])

  // Rotacion durante el salto
  model.rotation.x = phase < 0.5 ? -0.2 * intensity : 0.2 * intensity

  state.jumpPhase = phase
}

// ==================== COMPONENTE WRAPPER ====================

interface AnimatedCharacterProps {
  children: React.ReactNode
  animation?: AnimationConfig
  path?: WalkPath
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  children,
  animation = { type: 'idle' },
  path,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)

  // Estado interno
  const stateRef = useRef({
    jumpPhase: 0,
    patrolIndex: 0,
    randomTarget: { x: position[0], z: position[2] },
    lastRandomTime: 0
  })

  useFrame((state) => {
    if (!groupRef.current || !modelRef.current) return

    const time = state.clock.elapsedTime
    const { type, speed = 1, intensity = 1 } = animation
    const t = time * speed

    // Reset rotaciones del modelo
    modelRef.current.rotation.set(0, 0, 0)

    switch (type) {
      case 'idle':
        // Respiracion suave
        const breathe = Math.sin(t * 2) * 0.02 * intensity
        groupRef.current.position.y = position[1] + breathe
        groupRef.current.position.x = position[0]
        groupRef.current.position.z = position[2]
        modelRef.current.rotation.z = Math.sin(t * 1.5) * 0.01 * intensity
        break

      case 'walk':
        applyWalkAnimation(groupRef.current, modelRef.current, t, intensity, path, position, stateRef.current)
        break

      case 'run':
        applyRunAnimation(groupRef.current, modelRef.current, t, intensity, path, position, stateRef.current)
        break

      case 'jump':
        applyJumpAnimation(groupRef.current, modelRef.current, t, intensity, position, stateRef.current)
        break

      case 'wave':
        groupRef.current.position.set(...position)
        modelRef.current.rotation.z = Math.sin(t * 8) * 0.15 * intensity
        modelRef.current.rotation.x = 0.1 * intensity
        break

      case 'dance':
        groupRef.current.position.x = position[0]
        groupRef.current.position.z = position[2]
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 4)) * 0.1 * intensity
        modelRef.current.rotation.y = Math.sin(t * 2) * 0.3 * intensity
        modelRef.current.rotation.z = Math.sin(t * 4) * 0.1 * intensity
        break

      case 'none':
      default:
        groupRef.current.position.set(...position)
        break
    }
  })

  return (
    <group ref={groupRef} rotation={rotation as unknown as THREE.Euler}>
      <group ref={modelRef} scale={scale}>
        {children}
      </group>
    </group>
  )
}

// ==================== PRESETS DE ANIMACION ====================

export const ANIMATION_PRESETS = {
  // NPC caminando por la ciudad
  npcWalk: {
    animation: { type: 'walk' as AnimationType, speed: 0.8, intensity: 1 },
    path: { type: 'circle' as const, radius: 8 }
  },

  // NPC esperando (idle)
  npcIdle: {
    animation: { type: 'idle' as AnimationType, speed: 1, intensity: 1 }
  },

  // NPC corriendo
  npcRun: {
    animation: { type: 'run' as AnimationType, speed: 1, intensity: 1 },
    path: { type: 'circle' as const, radius: 12 }
  },

  // Personaje del jugador (idle por defecto)
  player: {
    animation: { type: 'idle' as AnimationType, speed: 1, intensity: 0.8 }
  },

  // Personaje bailando (celebracion)
  celebration: {
    animation: { type: 'dance' as AnimationType, speed: 1.2, intensity: 1.2 }
  }
}

export default AnimatedCharacter
