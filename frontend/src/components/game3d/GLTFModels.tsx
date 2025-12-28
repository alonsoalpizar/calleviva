// GLTFModels.tsx - Components that load and display GLTF models

import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group } from 'three'

// Preload models
useGLTF.preload('/assets/models/characters/soldier.glb')
useGLTF.preload('/assets/models/characters/parrot.glb')

// =============================================
// SOLDIER MODEL - Animated character
// =============================================
interface SoldierProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  animation?: 'Idle' | 'Walk' | 'Run'
}

export const Soldier: React.FC<SoldierProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animation = 'Idle',
}) => {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF('/assets/models/characters/soldier.glb')
  const { actions } = useAnimations(animations, groupRef)

  useEffect(() => {
    // Play the selected animation
    const action = actions[animation]
    if (action) {
      action.reset().fadeIn(0.5).play()
      return () => {
        action.fadeOut(0.5)
      }
    }
  }, [animation, actions])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  )
}

// =============================================
// PARROT MODEL - Flying bird
// =============================================
interface ParrotProps {
  position?: [number, number, number]
  scale?: number
}

export const Parrot: React.FC<ParrotProps> = ({
  position = [0, 2, 0],
  scale = 0.03,
}) => {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF('/assets/models/characters/parrot.glb')
  const { mixer } = useAnimations(animations, groupRef)

  // Auto-play first animation
  useEffect(() => {
    if (animations.length > 0 && mixer) {
      const action = mixer.clipAction(animations[0])
      action.play()
    }
  }, [animations, mixer])

  // Flying motion
  useFrame((state) => {
    if (groupRef.current) {
      // Circular flying pattern
      const t = state.clock.elapsedTime * 0.5
      groupRef.current.position.x = position[0] + Math.sin(t) * 3
      groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.5
      groupRef.current.position.z = position[2] + Math.cos(t) * 3

      // Face direction of movement
      groupRef.current.rotation.y = -t + Math.PI / 2
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  )
}

// =============================================
// ANIMATED CUSTOMER using Soldier model
// =============================================
interface AnimatedCustomerProps {
  id: string
  position: [number, number, number]
  targetPosition: [number, number, number]
  state: 'walking' | 'waiting' | 'ordering' | 'leaving'
  onReachTarget?: (id: string) => void
}

export const AnimatedCustomer: React.FC<AnimatedCustomerProps> = ({
  id,
  position,
  targetPosition,
  state,
  onReachTarget,
}) => {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF('/assets/models/characters/soldier.glb')
  const { actions } = useAnimations(animations, groupRef)
  const currentPos = useRef({ x: position[0], y: position[1], z: position[2] })

  // Animation based on state
  useEffect(() => {
    const animName = state === 'walking' || state === 'leaving' ? 'Walk' : 'Idle'
    const action = actions[animName]
    if (action) {
      // Stop all other animations
      Object.values(actions).forEach(a => a?.fadeOut(0.2))
      action.reset().fadeIn(0.2).play()
    }
  }, [state, actions])

  // Movement
  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (state === 'walking' || state === 'leaving') {
      const speed = 1.5
      const dx = targetPosition[0] - currentPos.current.x
      const dz = targetPosition[2] - currentPos.current.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance > 0.1) {
        const moveX = (dx / distance) * speed * delta
        const moveZ = (dz / distance) * speed * delta
        currentPos.current.x += moveX
        currentPos.current.z += moveZ

        // Rotate to face direction
        groupRef.current.rotation.y = Math.atan2(dx, dz)
      } else if (state === 'walking') {
        onReachTarget?.(id)
      }
    }

    groupRef.current.position.set(
      currentPos.current.x,
      currentPos.current.y,
      currentPos.current.z
    )
  })

  return (
    <group ref={groupRef} position={position} scale={0.5}>
      <primitive object={scene.clone()} />
    </group>
  )
}

export default { Soldier, Parrot, AnimatedCustomer }
