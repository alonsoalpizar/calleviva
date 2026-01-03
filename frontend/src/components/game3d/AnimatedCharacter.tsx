import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Mapeo de animaciones basado en duraciones analizadas
export const ANIMATION_MAP: Record<string, { index: number; name: string; duration: number }> = {
  idle: { index: 0, name: 'NlaTrack', duration: 5.21 },
  walk: { index: 1, name: 'NlaTrack.001', duration: 1.04 },
  run: { index: 2, name: 'NlaTrack.002', duration: 0.79 },
  run_boost: { index: 3, name: 'NlaTrack.003', duration: 0.50 },
  win: { index: 4, name: 'NlaTrack.004', duration: 3.08 },
  jump_idle_start: { index: 5, name: 'NlaTrack.005', duration: 1.42 },
  jump_idle_middle: { index: 6, name: 'NlaTrack.006', duration: 0.67 },
  jump_idle_end: { index: 7, name: 'NlaTrack.007', duration: 1.46 },
  jump_run_start: { index: 8, name: 'NlaTrack.008', duration: 0.58 },
  jump_run_middle: { index: 9, name: 'NlaTrack.009', duration: 1.04 },
  jump_run_end: { index: 10, name: 'NlaTrack.011', duration: 0.63 },
  fighting_stance: { index: 11, name: 'NlaTrack.012', duration: 2.21 },
  attack_left: { index: 12, name: 'NlaTrack.013', duration: 1.04 },
  attack_right_1: { index: 13, name: 'NlaTrack.014', duration: 1.00 },
  attack_right_heavy: { index: 14, name: 'NlaTrack.015', duration: 2.00 },
  damage_body: { index: 15, name: 'NlaTrack.016', duration: 1.46 },
  damage_head: { index: 16, name: 'NlaTrack.017', duration: 1.33 },
  death_idle: { index: 17, name: 'NlaTrack.018', duration: 2.33 },
  death_fight_1: { index: 18, name: 'NlaTrack.019', duration: 3.13 },
  death_fight_2: { index: 19, name: 'NlaTrack.020', duration: 4.58 },
  dance_1: { index: 20, name: 'NlaTrack.021', duration: 9.46 },
  dance_2: { index: 21, name: 'NlaTrack.010', duration: 9.67 },
  dance_3: { index: 22, name: 'NlaTrack.022', duration: 9.83 },
  dance_start: { index: 23, name: 'NlaTrack.023', duration: 2.08 },
}

// Colores de cuerpo disponibles (basados en el pack original)
export const BODY_COLORS: Record<string, string> = {
  white: '#e8e8e8',
  blue: '#4a90d9',
  red: '#d94a4a',
  orange: '#d9944a',
  yellow: '#d9d94a',
  brown: '#8b6914',
  green: '#4ad94a',
  purple: '#944ad9',
  pink: '#d94a94',
  black: '#2a2a2a',
}

// Huesos para adjuntar accesorios (del modelo animado)
export const ATTACHMENT_BONES = {
  head: 'DEF-spine.006',
  back: 'DEF-spine.004',
  chest: 'DEF-spine.003',
  hand_left: 'DEF-hand.L',
  hand_right: 'DEF-hand.R',
  foot_left: 'DEF-foot.L',
  foot_right: 'DEF-foot.R',
}

interface AccessoryConfig {
  slot: keyof typeof ATTACHMENT_BONES
  modelPath: string
  offset?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

interface AnimatedCharacterProps {
  animation?: keyof typeof ANIMATION_MAP
  bodyColor?: string // hex color o nombre de BODY_COLORS
  accessories?: AccessoryConfig[]
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  onLoaded?: () => void
}

// Componente para cargar un accesorio y adjuntarlo a un hueso
function Accessory({
  modelPath,
  bone,
  offset = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}: {
  modelPath: string
  bone: THREE.Bone | null
  offset?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}) {
  const { scene } = useGLTF(modelPath)
  const clonedScene = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    if (bone && clonedScene) {
      // Aplicar transformaciones
      clonedScene.position.set(...offset)
      clonedScene.rotation.set(...rotation)
      clonedScene.scale.setScalar(scale)

      // Adjuntar al hueso
      bone.add(clonedScene)

      return () => {
        bone.remove(clonedScene)
      }
    }
  }, [bone, clonedScene, offset, rotation, scale])

  return null
}

// Ruta al modelo animado que contiene el personaje + animaciones
const ANIMATED_MODEL_PATH = '/assets/models/funny_characters_pack/Assets_glb/animations/characters_animated.glb'

export function AnimatedCharacter({
  animation = 'idle',
  bodyColor = 'blue',
  accessories = [],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onLoaded
}: AnimatedCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [bones, setBones] = useState<Record<string, THREE.Bone | null>>({})
  const meshRef = useRef<THREE.SkinnedMesh | null>(null)

  // Cargar el modelo animado completo (personaje + animaciones)
  const { scene, animations } = useGLTF(ANIMATED_MODEL_PATH)

  // Resolver color (puede ser nombre o hex)
  const resolvedColor = useMemo(() => {
    if (bodyColor.startsWith('#')) return bodyColor
    return BODY_COLORS[bodyColor] || BODY_COLORS.blue
  }, [bodyColor])

  // Clonar la escena para evitar conflictos si se usan múltiples instancias
  const clonedScene = useMemo(() => {
    const clone = cloneSkeleton(scene)

    // Encontrar el mesh y crear material nuevo
    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh) {
        // Crear un nuevo material para este clon
        const newMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(resolvedColor),
          roughness: 0.7,
          metalness: 0.1,
        })
        child.material = newMaterial
        child.castShadow = true
        child.receiveShadow = true
        meshRef.current = child
      }
    })

    return clone
  }, [scene, resolvedColor])

  // Configurar animaciones con el modelo clonado
  const { actions, mixer } = useAnimations(animations, clonedScene)

  // Actualizar color cuando cambia
  useEffect(() => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.color.set(resolvedColor)
    }
  }, [resolvedColor])

  // Encontrar huesos después de cargar
  useEffect(() => {
    const foundBones: Record<string, THREE.Bone | null> = {}

    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Bone) {
        // Mapear nombres de slots a huesos encontrados
        Object.entries(ATTACHMENT_BONES).forEach(([slot, boneName]) => {
          if (child.name === boneName) {
            foundBones[slot] = child
          }
        })
      }
    })

    setBones(foundBones)
    console.log('Huesos encontrados:', Object.keys(foundBones))

    onLoaded?.()
  }, [clonedScene, onLoaded])

  // Reproducir animación cuando cambia
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return

    const animConfig = ANIMATION_MAP[animation]
    if (!animConfig) {
      console.warn(`Animación "${animation}" no encontrada`)
      return
    }

    const action = actions[animConfig.name]
    if (!action) {
      console.warn(`Action "${animConfig.name}" no encontrada en el mixer`)
      return
    }

    // Detener todas las acciones actuales
    Object.values(actions).forEach(a => a?.stop())

    // Reproducir la nueva animación
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()

    console.log(`Reproduciendo animación: ${animation} (${animConfig.name})`)

    return () => {
      action.stop()
    }
  }, [animation, actions])

  // Actualizar el mixer en cada frame
  useFrame((_, delta) => {
    mixer?.update(delta)
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />

      {/* Renderizar accesorios */}
      {accessories.map((acc, idx) => (
        <Accessory
          key={`${acc.slot}-${idx}`}
          modelPath={acc.modelPath}
          bone={bones[acc.slot] || null}
          offset={acc.offset}
          rotation={acc.rotation}
          scale={acc.scale}
        />
      ))}
    </group>
  )
}

// Precargar el modelo animado
useGLTF.preload(ANIMATED_MODEL_PATH)
