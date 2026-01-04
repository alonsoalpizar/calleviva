// NormalCharacter.tsx - Personaje "normal" con 31 animaciones
// Basado en creative_character pack con accesorios skinned

import { useRef, useEffect, useState, useMemo, Suspense, Component, ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Error boundary para capturar errores de carga de accesorios
class AccessoryErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; name: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error(`[AccessoryError] ${this.props.name}:`, error.message)
  }

  render() {
    if (this.state.hasError) {
      return null // No renderizar nada si hay error
    }
    return this.props.children
  }
}

// Mapeo de animaciones del character_pack
export const NORMAL_ANIMATION_MAP: Record<string, { name: string; loop: boolean }> = {
  // Idle variations
  idle: { name: 'Idle_Breathing', loop: true },
  idle_look: { name: 'Idle_Look_Around', loop: true },
  idle_relaxed: { name: 'Idle_Relaxed', loop: true },

  // Movement
  walk: { name: 'Walk_Forward', loop: true },
  walk_back: { name: 'Walk_Backward', loop: true },
  run: { name: 'Run_Forward', loop: true },
  run_back: { name: 'Run_Backward', loop: true },
  run_left: { name: 'Run_Left', loop: true },
  run_right: { name: 'Run_Right', loop: true },
  strafe_left: { name: 'Strafe_Left', loop: true },
  strafe_right: { name: 'Strafe_Right', loop: true },

  // Crouch movement
  crouch_forward: { name: 'Crouch_Walk _Forward', loop: true },
  crouch_back: { name: 'Crouch_Walk_Backward', loop: true },
  crouch_left: { name: 'Crouch_Walk_Left', loop: true },
  crouch_right: { name: 'Crouch_Walk_Right', loop: true },

  // Jump
  jump_start: { name: 'Jump_Start', loop: false },
  jump_loop: { name: 'Jump_Loop', loop: true },
  jump_end: { name: 'Jump_End', loop: false },
  fall: { name: 'Fall', loop: true },

  // Combat
  attack_kick: { name: 'Attack_Kick', loop: false },
  attack_punch: { name: 'Attack_Punch', loop: false },
  block: { name: 'Block_With_Hands', loop: true },
  hit_light: { name: 'Hit_Reaction_Light', loop: false },
  hit_heavy: { name: 'Hit_Reaction_Heavy', loop: false },

  // Death
  death_back: { name: 'Death_Backward', loop: false },
  death_forward: { name: 'Death_Forward', loop: false },

  // Actions
  dodge_roll: { name: 'Dodge_Roll', loop: false },
  dodge_side: { name: 'Dodge_Sidestep', loop: false },
  climb: { name: 'Climb_Ladder', loop: true },
}

// Rutas
const ANIMATED_MODEL = '/assets/models/character_pack/animations/character_animated.glb'
const ACCESSORIES_BASE = '/assets/models/character_pack/Separate_assets_glb'

// Mapear ID de accessorio a path de archivo
function getAccessoryPath(_category: keyof NormalCharacterRecipe, assetId: string | undefined): string | null {
  if (!assetId) return null

  // Los IDs ya son los nombres de archivo exactos (ej: "Hairstyle_male_010")
  // Solo agregamos la extensión
  return `${ACCESSORIES_BASE}/${assetId}.glb`
}

// Componente para un accesorio skinned que se vincula al skeleton animado
function SkinnedAccessory({
  path,
  skeleton: animatedSkeleton,
  visible = true
}: {
  path: string
  skeleton: THREE.Skeleton | null
  visible?: boolean
}) {
  const { scene } = useGLTF(path)
  const [boundMesh, setBoundMesh] = useState<THREE.SkinnedMesh | null>(null)

  // Encontrar y vincular el SkinnedMesh al skeleton animado
  useEffect(() => {
    if (!animatedSkeleton) return

    let originalMesh: THREE.SkinnedMesh | null = null

    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh && !originalMesh) {
        originalMesh = child
      }
    })

    if (!originalMesh) return

    // Guardar referencia tipada
    const sourceMesh = originalMesh as THREE.SkinnedMesh

    // Clonar el mesh (no toda la escena)
    const clonedMesh = sourceMesh.clone() as THREE.SkinnedMesh

    // Clonar geometría y materiales para esta instancia
    clonedMesh.geometry = sourceMesh.geometry.clone()
    if (Array.isArray(sourceMesh.material)) {
      clonedMesh.material = sourceMesh.material.map((m: THREE.Material) => m.clone())
    } else {
      clonedMesh.material = (sourceMesh.material as THREE.Material).clone()
    }

    // Vincular al skeleton animado usando la bindMatrix original
    clonedMesh.bind(animatedSkeleton, sourceMesh.bindMatrix)

    // Configurar propiedades
    clonedMesh.castShadow = true
    clonedMesh.receiveShadow = true
    clonedMesh.frustumCulled = false
    clonedMesh.visible = true

    // Mejorar calidad de materiales
    const improveMaterial = (mat: THREE.Material) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.roughness = Math.max(0.3, mat.roughness)
        mat.metalness = Math.min(0.2, mat.metalness)
        mat.envMapIntensity = 0.5
        if (mat.map) {
          mat.map.anisotropy = 16
          mat.map.minFilter = THREE.LinearMipmapLinearFilter
          mat.map.magFilter = THREE.LinearFilter
        }
      }
    }

    if (Array.isArray(clonedMesh.material)) {
      clonedMesh.material.forEach(improveMaterial)
    } else {
      improveMaterial(clonedMesh.material as THREE.Material)
    }

    setBoundMesh(clonedMesh)
  }, [scene, animatedSkeleton, path])

  if (!boundMesh) return null

  return <primitive object={boundMesh} visible={visible} />
}

// Interfaz de receta para NormalCharacter
export interface NormalCharacterRecipe {
  body?: string        // Body_010
  emotion?: string     // Male_emotion_usual_001, happy_002, angry_003
  hair?: string        // Hairstyle_male_010, 012
  hat?: string         // Hat_010, 049, 057
  glasses?: string     // Glasses_004, 006
  headphones?: string  // Headphones_002
  mustache?: string    // Moustache_001, 002
  clown_nose?: string  // Clown_nose_001
  pacifier?: string    // Pacifier_001
  outerwear?: string   // Outerwear_029, 036
  tshirt?: string      // T_Shirt_009
  pants?: string       // Pants_010, 014
  shorts?: string      // Shorts_003
  socks?: string       // Socks_008
  shoe?: string        // Shoe_Slippers_002, 005, Sneakers_009
  gloves?: string      // Gloves_006, 014
  costume?: string     // Costume_6_001, 10_001 (full body costume)
}

// Lista de accesorios disponibles
export const NORMAL_ACCESSORIES = {
  body: ['Body_010'],
  emotion: ['Male_emotion_usual_001', 'Male_emotion_happy_002', 'Male_emotion_angry_003'],
  hair: ['Hairstyle_male_010', 'Hairstyle_male_012'],
  hat: ['Hat_010', 'Hat_049', 'Hat_057'],
  glasses: ['Glasses_004', 'Glasses_006'],
  headphones: ['Headphones_002'],
  mustache: ['Moustache_001', 'Moustache_002'],
  clown_nose: ['Clown_nose_001'],
  pacifier: ['Pacifier_001'],
  outerwear: ['Outwear_029', 'Outwear_036'],
  tshirt: ['T-Shirt_009'],
  pants: ['Pants_010', 'Pants_014'],
  shorts: ['Shorts_003'],
  socks: ['Socks_008'],
  shoe: ['Shoe_Slippers_002', 'Shoe_Slippers_005', 'Shoe_Sneakers_009'],
  gloves: ['Gloves_006', 'Gloves_014'],
  costume: ['Costume_6_001', 'Costume_10_001'],
}

interface NormalCharacterProps {
  recipe?: NormalCharacterRecipe
  animation?: keyof typeof NORMAL_ANIMATION_MAP
  position?: [number, number, number]
  rotation?: number
  scale?: number
  onAnimationEnd?: () => void
  onLoaded?: () => void
}

// Pre-load the animated model
useGLTF.preload(ANIMATED_MODEL)

export function NormalCharacter({
  recipe = {},
  animation = 'idle',
  position = [0, 0, 0],
  rotation = 0,
  scale = 1,
  onAnimationEnd,
  onLoaded
}: NormalCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const [skeleton, setSkeleton] = useState<THREE.Skeleton | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Load animated model
  const { scene, animations } = useGLTF(ANIMATED_MODEL)

  // Clone the scene and extract skeleton
  const { clonedScene, baseSkeleton } = useMemo(() => {
    const cloned = cloneSkeleton(scene)

    // Encontrar el SkinnedMesh y su skeleton
    let foundSkeleton: THREE.Skeleton | null = null
    cloned.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh) {
        foundSkeleton = child.skeleton
        // El mesh base permanece visible (es el cuerpo del personaje)
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return { clonedScene: cloned, baseSkeleton: foundSkeleton }
  }, [scene])

  // Guardar skeleton cuando esté listo
  useEffect(() => {
    if (baseSkeleton) {
      setSkeleton(baseSkeleton)
    }
  }, [baseSkeleton])

  // Setup animation mixer
  useEffect(() => {
    if (!clonedScene) return

    const mixer = new THREE.AnimationMixer(clonedScene)
    mixerRef.current = mixer

    // Handle animation finished event
    const onFinished = (_e: THREE.Event & { action: THREE.AnimationAction }) => {
      const animConfig = NORMAL_ANIMATION_MAP[animation]
      if (!animConfig?.loop && onAnimationEnd) {
        onAnimationEnd()
      }
    }

    mixer.addEventListener('finished', onFinished as unknown as (event: THREE.Event) => void)
    setIsReady(true)

    return () => {
      mixer.stopAllAction()
      mixer.removeEventListener('finished', onFinished as unknown as (event: THREE.Event) => void)
      mixerRef.current = null
    }
  }, [clonedScene])

  // Notificar cuando está listo
  useEffect(() => {
    if (skeleton && isReady) {
      onLoaded?.()
    }
  }, [skeleton, isReady, onLoaded])

  // Play animation when it changes
  useEffect(() => {
    if (!mixerRef.current || !animations.length) return

    const animConfig = NORMAL_ANIMATION_MAP[animation]
    if (!animConfig) {
      console.warn(`Animation "${animation}" not found in NormalCharacter`)
      return
    }

    // Find the animation clip
    const clip = animations.find(a => a.name === animConfig.name)
    if (!clip) {
      console.warn(`Animation clip "${animConfig.name}" not found`)
      return
    }

    // Fade out current action
    if (currentActionRef.current) {
      currentActionRef.current.fadeOut(0.3)
    }

    // Play new action
    const action = mixerRef.current.clipAction(clip)
    action.reset()
    action.setLoop(animConfig.loop ? THREE.LoopRepeat : THREE.LoopOnce, animConfig.loop ? Infinity : 1)
    action.clampWhenFinished = !animConfig.loop
    action.fadeIn(0.3)
    action.play()

    currentActionRef.current = action
  }, [animation, animations, isReady])

  // Update mixer - Prioridad -1 para que corra ANTES del sync de accesorios
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  }, -1) // Prioridad -1: antes que los accesorios (prioridad 1)

  // Construir lista de paths de accesorios
  const accessoryPaths = useMemo(() => {
    const paths: { category: keyof NormalCharacterRecipe; path: string }[] = []

    // Orden de renderizado (de atrás hacia adelante)
    const categories: (keyof NormalCharacterRecipe)[] = [
      'body', 'emotion', 'hair', 'hat', 'glasses', 'headphones',
      'mustache', 'clown_nose', 'pacifier', 'outerwear', 'tshirt',
      'pants', 'shorts', 'socks', 'shoe', 'gloves', 'costume'
    ]

    categories.forEach(cat => {
      const assetId = recipe[cat]
      if (assetId) {
        const path = getAccessoryPath(cat, assetId)
        if (path) {
          paths.push({ category: cat, path })
        }
      }
    })

    return paths
  }, [recipe])

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Cuerpo base animado */}
      <primitive object={clonedScene} />

      {/* Accesorios skinned - sincronizados con el skeleton */}
      {/* Cada accesorio en su propio Suspense + ErrorBoundary para no bloquear la escena */}
      {skeleton && accessoryPaths.map(({ category, path }) => (
        <AccessoryErrorBoundary key={`${category}-${path}`} name={`${category}: ${path}`}>
          <Suspense fallback={null}>
            <SkinnedAccessory
              path={path}
              skeleton={skeleton}
            />
          </Suspense>
        </AccessoryErrorBoundary>
      ))}
    </group>
  )
}

// Export available animation names
export const NORMAL_ANIMATIONS = Object.keys(NORMAL_ANIMATION_MAP)

export default NormalCharacter
