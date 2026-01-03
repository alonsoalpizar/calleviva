import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Reutilizar mapeo de animaciones del AnimatedCharacter
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

// Lista de Full_Body disponibles
export const FULL_BODY_CHARACTERS = [
  'Action_figure_001', 'Alien_001', 'Astronaut_001', 'Banana_001',
  'Crayfish_001', 'Demon_001', 'Eggplant_001', 'Flower_001',
  'Ghost_001', 'Gift_001', 'Gnome_001', 'Gummy_bear_001',
  'Mummy_001', 'Robot_001', 'Snowman_001', 'Tiger_001',
  'Unicorn_001', 'Zombie_001'
]

// Huesos DEF- que existen en los Full_Body
const DEF_BONES = [
  'DEF-spine', 'DEF-spine.001', 'DEF-spine.002', 'DEF-spine.003',
  'DEF-spine.004', 'DEF-spine.006',
  'DEF-shoulder.R', 'DEF-upper_arm.R', 'DEF-forearm.R', 'DEF-hand.R',
  'DEF-f_index.01.R', 'DEF-f_index.02.R', 'DEF-thumb.01.R', 'DEF-thumb.02.R',
  'DEF-f_middle.01.R', 'DEF-f_middle.02.R', 'DEF-f_ring.01.R', 'DEF-f_ring.02.R',
  'DEF-f_pinky.01.R', 'DEF-f_pinky.02.R',
  'DEF-shoulder.L', 'DEF-upper_arm.L', 'DEF-forearm.L', 'DEF-hand.L',
  'DEF-f_index.01.L', 'DEF-f_index.02.L', 'DEF-thumb.01.L', 'DEF-thumb.02.L',
  'DEF-f_middle.01.L', 'DEF-f_middle.02.L', 'DEF-f_ring.01.L', 'DEF-f_ring.02.L',
  'DEF-f_pinky.01.L', 'DEF-f_pinky.02.L',
  'DEF-thigh.L', 'DEF-shin.L', 'DEF-foot.L', 'DEF-toe.L',
  'DEF-thigh.R', 'DEF-shin.R', 'DEF-foot.R', 'DEF-toe.R'
]

// Ruta al modelo de animaciones
const ANIMATIONS_MODEL_PATH = '/assets/models/funny_characters_pack/Assets_glb/animations/characters_animated.glb'

// Función para filtrar tracks de animación
function filterAnimationClips(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  return clips.map(clip => {
    const filteredTracks = clip.tracks.filter(track => {
      // El formato del track es "nombreNodo.property"
      const nodeName = track.name.split('.')[0]
      return DEF_BONES.includes(nodeName)
    })

    // Crear nuevo clip con solo los tracks filtrados
    const newClip = new THREE.AnimationClip(clip.name, clip.duration, filteredTracks)
    return newClip
  })
}

interface AnimatedFullBodyProps {
  character?: string // Nombre del personaje (ej: 'Alien_001')
  animation?: keyof typeof ANIMATION_MAP
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  onLoaded?: () => void
}

export function AnimatedFullBody({
  character = 'Alien_001',
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onLoaded
}: AnimatedFullBodyProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Ruta al modelo del personaje
  const characterPath = `/assets/models/funny_characters_pack/Assets_glb/Full_Body/${character}.glb`

  // Cargar modelo del personaje (tiene mesh + skeleton)
  const characterGltf = useGLTF(characterPath)

  // Cargar modelo de animaciones (solo para extraer las animaciones)
  const animationsGltf = useGLTF(ANIMATIONS_MODEL_PATH)

  // Clonar el personaje para evitar conflictos
  const clonedScene = useMemo(() => {
    const clone = cloneSkeleton(characterGltf.scene)

    // Configurar materiales y sombras
    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return clone
  }, [characterGltf.scene])

  // Filtrar animaciones para solo incluir tracks DEF-
  const filteredAnimations = useMemo(() => {
    console.log('Filtrando animaciones...')
    console.log('Clips originales:', animationsGltf.animations.length)

    const filtered = filterAnimationClips(animationsGltf.animations)

    // Log para debug
    if (filtered.length > 0) {
      console.log('Primer clip filtrado:', filtered[0].name, 'tracks:', filtered[0].tracks.length)
    }

    return filtered
  }, [animationsGltf.animations])

  // Crear mixer y acciones
  const actions = useMemo(() => {
    if (!clonedScene || filteredAnimations.length === 0) return {}

    const mixer = new THREE.AnimationMixer(clonedScene)
    mixerRef.current = mixer

    const actionsMap: Record<string, THREE.AnimationAction> = {}

    filteredAnimations.forEach(clip => {
      try {
        const action = mixer.clipAction(clip)
        actionsMap[clip.name] = action
      } catch (e) {
        console.warn(`No se pudo crear acción para ${clip.name}:`, e)
      }
    })

    console.log('Acciones creadas:', Object.keys(actionsMap).length)
    return actionsMap
  }, [clonedScene, filteredAnimations])

  // Notificar cuando está listo
  useEffect(() => {
    if (Object.keys(actions).length > 0 && !isReady) {
      setIsReady(true)
      onLoaded?.()
    }
  }, [actions, isReady, onLoaded])

  // Reproducir animación cuando cambia
  useEffect(() => {
    if (Object.keys(actions).length === 0) return

    const animConfig = ANIMATION_MAP[animation]
    if (!animConfig) {
      console.warn(`Animación "${animation}" no encontrada`)
      return
    }

    const action = actions[animConfig.name]
    if (!action) {
      console.warn(`Action "${animConfig.name}" no disponible`)
      return
    }

    // Detener todas las animaciones
    Object.values(actions).forEach(a => a?.stop())

    // Reproducir la nueva
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()

    console.log(`Reproduciendo: ${animation} (${animConfig.name})`)

    return () => {
      action.stop()
    }
  }, [animation, actions])

  // Actualizar mixer cada frame
  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  )
}

// Precargar modelos
useGLTF.preload(ANIMATIONS_MODEL_PATH)
