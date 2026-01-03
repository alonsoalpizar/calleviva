import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Mapeo de animaciones
export const ANIMATION_MAP: Record<string, { name: string; duration: number }> = {
  idle: { name: 'NlaTrack', duration: 5.21 },
  walk: { name: 'NlaTrack.001', duration: 1.04 },
  run: { name: 'NlaTrack.002', duration: 0.79 },
  run_boost: { name: 'NlaTrack.003', duration: 0.50 },
  win: { name: 'NlaTrack.004', duration: 3.08 },
  jump_idle_start: { name: 'NlaTrack.005', duration: 1.42 },
  jump_idle_middle: { name: 'NlaTrack.006', duration: 0.67 },
  jump_idle_end: { name: 'NlaTrack.007', duration: 1.46 },
  jump_run_start: { name: 'NlaTrack.008', duration: 0.58 },
  jump_run_middle: { name: 'NlaTrack.009', duration: 1.04 },
  jump_run_end: { name: 'NlaTrack.011', duration: 0.63 },
  fighting_stance: { name: 'NlaTrack.012', duration: 2.21 },
  attack_left: { name: 'NlaTrack.013', duration: 1.04 },
  attack_right_1: { name: 'NlaTrack.014', duration: 1.00 },
  attack_right_heavy: { name: 'NlaTrack.015', duration: 2.00 },
  damage_body: { name: 'NlaTrack.016', duration: 1.46 },
  damage_head: { name: 'NlaTrack.017', duration: 1.33 },
  death_idle: { name: 'NlaTrack.018', duration: 2.33 },
  death_fight_1: { name: 'NlaTrack.019', duration: 3.13 },
  death_fight_2: { name: 'NlaTrack.020', duration: 4.58 },
  dance_1: { name: 'NlaTrack.021', duration: 9.46 },
  dance_2: { name: 'NlaTrack.010', duration: 9.67 },
  dance_3: { name: 'NlaTrack.022', duration: 9.83 },
  dance_start: { name: 'NlaTrack.023', duration: 2.08 },
}

// Colores de cuerpo
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

// Rutas
const ANIMATED_MODEL = '/assets/models/funny_characters_pack/Assets_glb/animations/characters_animated.glb'
const SKINNED_BASE = '/assets/models/funny_characters_pack/Skinned_GLB'

// Interfaz de receta
export interface CharacterRecipe {
  body?: string
  hair?: string
  hat?: string
  glasses?: string
  eyebrow?: string
  mustache?: string
  outerwear?: string
  pants?: string
  shoe?: string
  glove?: string
  backpack?: string
  full_body?: string  // Disfraces completos (hot_dog, astronaut, etc.)
}

// Mapeo de full_body IDs a archivos
const FULL_BODY_MAP: Record<string, string> = {
  action_figure: 'Action_figure_001',
  alien: 'Alien_001',
  astronaut: 'Astronaut_001',
  banana: 'Banana_001',
  crayfish: 'Crayfish_001',
  demon: 'Demon_001',
  eggplant: 'Eggplant_001',
  flower: 'Flower_001',
  ghost: 'Ghost_001',
  gift: 'Gift_001',
  hot_dog: 'Hot_dog_001',
  lego: 'Lego_001',
  mushroom: 'Mushroom_001',
  nightstand: 'Nightstand_001',
  ostrich: 'Ostrich_001',
  palm: 'Palm_001',
  red_fall_guys: 'Red_Fall_Guys_001',
  sausage: 'Sausage_001',
  shark: 'Shark_001',
  snake: 'Snake_001',
  snowman: 'Snowman_001',
  sushi: 'Sushi_001',
  tooth: 'Tooth_001',
  trash_can: 'Trash_can_001',
  ufo: 'UFO_001',
}

// Obtener path de full_body
function getFullBodyPath(fullBodyId: string): string | null {
  if (!fullBodyId) return null
  const filename = FULL_BODY_MAP[fullBodyId.toLowerCase()]
  if (!filename) return null
  return `${SKINNED_BASE}/Full_Body/${filename}.glb`
}

// Mapear ID de asset a path de archivo skinned
function getSkinnedPath(category: string, assetId: string): string | null {
  if (!assetId) return null

  const categoryMap: Record<string, { folder: string; pattern: (id: string) => string }> = {
    body: {
      folder: 'Body',
      pattern: (id) => {
        const parts = id.replace('body_', '').split('_')
        const color = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const num = parts[1].padStart(3, '0')
        return `Body_${color}_${num}`
      }
    },
    hair: {
      folder: 'Hair',
      pattern: (id) => `Hair_${id.replace('hair_', '').padStart(3, '0')}`
    },
    hat: {
      folder: 'Hat',
      pattern: (id) => `Hat_${id.replace('hat_', '').padStart(3, '0')}`
    },
    glasses: {
      folder: 'Glasses',
      pattern: (id) => `Glasses_${id.replace('glasses_', '').padStart(3, '0')}`
    },
    eyebrow: {
      folder: 'Eyebrow',
      pattern: (id) => `Eyebrow_${id.replace('eyebrow_', '').padStart(3, '0')}`
    },
    mustache: {
      folder: 'Mustache',
      pattern: (id) => {
        const parts = id.replace('mustache_', '').split('_')
        const color = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const num = parts[1].padStart(3, '0')
        return `Mustache_${color}_${num}`
      }
    },
    outerwear: {
      folder: 'Outerwear',
      pattern: (id) => {
        const parts = id.replace('outerwear_', '').split('_')
        const color = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('_')
        const num = parts[parts.length - 1].padStart(3, '0')
        return `Outerwear_${color}_${num}`
      }
    },
    pants: {
      folder: 'Pants',
      pattern: (id) => {
        const parts = id.replace('pants_', '').split('_')
        const color = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('_')
        const num = parts[parts.length - 1].padStart(3, '0')
        return `Pants_${color}_${num}`
      }
    },
    shoe: {
      folder: 'Shoe',
      pattern: (id) => {
        const parts = id.replace('shoe_', '').split('_')
        const type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const num = parts[1].padStart(3, '0')
        return `Shoe_${type}_${num}`
      }
    },
    glove: {
      folder: 'Glove',
      pattern: (id) => `Glove_${id.replace('glove_', '').padStart(3, '0')}`
    },
    backpack: {
      folder: 'Backpack',
      pattern: (id) => `Backpack_${id.replace('backpack_', '').padStart(3, '0')}`
    },
  }

  const mapping = categoryMap[category]
  if (!mapping) return null

  try {
    const filename = mapping.pattern(assetId)
    return `${SKINNED_BASE}/${mapping.folder}/${filename}.glb`
  } catch {
    return null
  }
}

// Componente para un item de ropa con skinning que sincroniza con el skeleton animado
function SkinnedClothing({
  path,
  skeleton: animatedSkeleton,
  visible = true
}: {
  path: string
  skeleton: THREE.Skeleton | null
  visible?: boolean
}) {
  const { scene } = useGLTF(path)

  // Clonar la escena completa para no modificar el original cacheado
  const clonedScene = useMemo(() => {
    return cloneSkeleton(scene)
  }, [scene])

  // Encontrar el SkinnedMesh y su skeleton en la escena clonada
  const { clothingMesh, clothingSkeleton } = useMemo((): {
    clothingMesh: THREE.SkinnedMesh | null
    clothingSkeleton: THREE.Skeleton | null
  } => {
    let mesh: THREE.SkinnedMesh | null = null
    let skel: THREE.Skeleton | null = null

    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh && !mesh) {
        mesh = child
        skel = child.skeleton
      }
    })

    return { clothingMesh: mesh, clothingSkeleton: skel }
  }, [clonedScene])

  // Crear mapa de nombres de huesos a índices para sincronización
  const boneMapping = useMemo((): number[] | null => {
    if (!animatedSkeleton || !clothingSkeleton) return null

    const mapping: number[] = []
    const animatedBonesByName = new Map<string, number>()

    // Indexar huesos del skeleton animado por nombre
    animatedSkeleton.bones.forEach((bone: THREE.Bone, index: number) => {
      animatedBonesByName.set(bone.name, index)
    })

    // Crear mapping: índice en clothing -> índice en animated
    clothingSkeleton.bones.forEach((bone: THREE.Bone, clothingIndex: number) => {
      const animatedIndex = animatedBonesByName.get(bone.name)
      if (animatedIndex !== undefined) {
        mapping[clothingIndex] = animatedIndex
      } else {
        mapping[clothingIndex] = -1 // No match
      }
    })

    return mapping
  }, [animatedSkeleton, clothingSkeleton])

  // Sincronizar matrices de huesos cada frame
  useFrame(() => {
    if (!animatedSkeleton || !clothingSkeleton || !boneMapping) return

    // Copiar matrices de huesos del skeleton animado al de la ropa
    for (let i = 0; i < clothingSkeleton.bones.length; i++) {
      const animatedIndex = boneMapping[i]
      if (animatedIndex >= 0 && animatedIndex < animatedSkeleton.bones.length) {
        const animatedBone = animatedSkeleton.bones[animatedIndex]
        const clothingBone = clothingSkeleton.bones[i]

        // Copiar transformaciones
        clothingBone.position.copy(animatedBone.position)
        clothingBone.quaternion.copy(animatedBone.quaternion)
        clothingBone.scale.copy(animatedBone.scale)
      }
    }
  })

  // Configurar el mesh
  useEffect(() => {
    if (clothingMesh) {
      clothingMesh.castShadow = true
      clothingMesh.receiveShadow = true
      clothingMesh.frustumCulled = false

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

      if (Array.isArray(clothingMesh.material)) {
        clothingMesh.material.forEach(improveMaterial)
      } else {
        improveMaterial(clothingMesh.material as THREE.Material)
      }
    }
  }, [clothingMesh])

  if (!clothingMesh) return null

  return <primitive object={clonedScene} visible={visible} />
}

interface SkinnedCharacterProps {
  recipe: CharacterRecipe
  animation?: keyof typeof ANIMATION_MAP
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  onLoaded?: () => void
}

export function SkinnedCharacter({
  recipe,
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onLoaded
}: SkinnedCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [skeleton, setSkeleton] = useState<THREE.Skeleton | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Cargar modelo animado base (tiene skeleton + animaciones)
  const { scene: baseScene, animations } = useGLTF(ANIMATED_MODEL)

  // Clonar la escena base y extraer skeleton (mesh invisible - usamos Body skinned)
  const { clonedScene, baseSkeleton } = useMemo(() => {
    const clone = cloneSkeleton(baseScene)

    // Encontrar el SkinnedMesh y su skeleton
    let foundSkeleton: THREE.Skeleton | null = null
    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh) {
        foundSkeleton = child.skeleton
        // Ocultar el mesh base - usaremos el Body skinned con textura
        child.visible = false
      }
    })

    return { clonedScene: clone, baseSkeleton: foundSkeleton }
  }, [baseScene])

  // Guardar skeleton cuando esté listo - siempre actualizar cuando baseSkeleton cambie
  useEffect(() => {
    if (baseSkeleton) {
      setSkeleton(baseSkeleton)
      setIsReady(false) // Resetear para que onLoaded se llame de nuevo
    }
  }, [baseSkeleton])

  // Crear mixer y acciones
  const actions = useMemo(() => {
    const mixer = new THREE.AnimationMixer(clonedScene)
    mixerRef.current = mixer

    const actionsMap: Record<string, THREE.AnimationAction> = {}
    animations.forEach(clip => {
      actionsMap[clip.name] = mixer.clipAction(clip)
    })

    return actionsMap
  }, [clonedScene, animations])

  // Notificar cuando está listo
  useEffect(() => {
    if (skeleton && Object.keys(actions).length > 0 && !isReady) {
      setIsReady(true)
      onLoaded?.()
    }
  }, [skeleton, actions, isReady, onLoaded])

  // Reproducir animación
  useEffect(() => {
    const animConfig = ANIMATION_MAP[animation]
    if (!animConfig || !actions[animConfig.name]) return

    Object.values(actions).forEach(a => a?.stop())

    const action = actions[animConfig.name]
    action.reset()
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.play()

    return () => {
      action.stop()
    }
  }, [animation, actions])

  // Actualizar mixer
  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  // Verificar si hay full_body (disfraz completo)
  const hasFullBody = Boolean(recipe.full_body)
  const fullBodyPath = useMemo(() => {
    if (!recipe.full_body) return null
    return getFullBodyPath(recipe.full_body)
  }, [recipe.full_body])

  // Construir lista de paths de ropa skinned
  const clothingPaths = useMemo(() => {
    const paths: { category: string; path: string }[] = []

    // Si hay full_body, solo cargar accesorios de cabeza y backpack
    // Body va primero para que se renderice debajo de la ropa
    const categories: (keyof CharacterRecipe)[] = hasFullBody
      ? ['body', 'hair', 'hat', 'glasses', 'eyebrow', 'mustache', 'backpack']
      : ['body', 'hair', 'hat', 'glasses', 'eyebrow', 'mustache', 'outerwear', 'pants', 'shoe', 'glove', 'backpack']

    categories.forEach(cat => {
      const assetId = recipe[cat]
      if (assetId) {
        const path = getSkinnedPath(cat, assetId)
        if (path) {
          paths.push({ category: cat, path })
        }
      }
    })

    return paths
  }, [recipe, hasFullBody])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Cuerpo base animado - siempre visible (full_body va encima) */}
      <primitive object={clonedScene} />

      {/* Full body costume (disfraz completo) */}
      {skeleton && fullBodyPath && (
        <SkinnedClothing
          key={`full_body-${fullBodyPath}`}
          path={fullBodyPath}
          skeleton={skeleton}
        />
      )}

      {/* Ropa skinned - comparten el skeleton */}
      {skeleton && clothingPaths.map(({ category, path }) => (
        <SkinnedClothing
          key={`${category}-${path}`}
          path={path}
          skeleton={skeleton}
        />
      ))}
    </group>
  )
}

// Precargar modelo animado
useGLTF.preload(ANIMATED_MODEL)
