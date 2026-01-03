import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

// Mapeo de animaciones
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

// Hueso de la cabeza para adjuntar accesorios
const HEAD_BONE = 'DEF-spine.006'
const BACK_BONE = 'DEF-spine.004'

// Ruta base para assets
const ASSET_PATH = '/assets/models/funny_characters_pack/Assets_glb'
const ANIMATED_MODEL_PATH = `${ASSET_PATH}/animations/characters_animated.glb`

// Categorías que se adjuntan a la cabeza (siguen el movimiento de la cabeza)
const HEAD_CATEGORIES = ['hair', 'hat', 'glasses', 'eyebrow', 'mustache']

// Categorías que se muestran estáticas (en pose de reposo)
const _STATIC_CATEGORIES = ['outerwear', 'pants', 'shoe', 'glove']
void _STATIC_CATEGORIES // Evitar warning de no usado

// Categorías que van en la espalda
const BACK_CATEGORIES = ['backpack']

// Tipo de receta del Creator
export interface CharacterRecipe {
  body?: string        // body_blue_1, body_red_2, etc.
  hair?: string        // hair_1, hair_2, etc.
  hat?: string         // hat_1, hat_2, etc.
  glasses?: string     // glasses_1, etc.
  eyebrow?: string
  mustache?: string
  outerwear?: string
  pants?: string
  shoe?: string
  glove?: string
  backpack?: string
  full_body?: string   // Si se selecciona un disfraz completo
}

// Función para convertir ID de asset a path de archivo
function assetIdToPath(category: string, assetId: string): string | null {
  if (!assetId) return null

  // Mapeo de categorías a carpetas y patrones de nombre
  const categoryMap: Record<string, { folder: string; pattern: (id: string) => string }> = {
    body: {
      folder: 'Body',
      pattern: (id) => {
        // body_blue_1 -> Body_Blue_001.glb
        const parts = id.replace('body_', '').split('_')
        const color = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const num = parts[1].padStart(3, '0')
        return `Body_${color}_${num}.glb`
      }
    },
    hair: {
      folder: 'Hair',
      pattern: (id) => {
        const num = id.replace('hair_', '').padStart(3, '0')
        return `Hair_${num}.glb`
      }
    },
    hat: {
      folder: 'Hat',
      pattern: (id) => {
        const num = id.replace('hat_', '').padStart(3, '0')
        return `Hat_${num}.glb`
      }
    },
    glasses: {
      folder: 'Glasses',
      pattern: (id) => {
        const num = id.replace('glasses_', '').padStart(3, '0')
        return `Glasses_${num}.glb`
      }
    },
    eyebrow: {
      folder: 'Eyebrow',
      pattern: (id) => {
        const num = id.replace('eyebrow_', '').padStart(3, '0')
        return `Eyebrow_${num}.glb`
      }
    },
    mustache: {
      folder: 'Mustache',
      pattern: (id) => {
        // mustache_black_1 -> Mustache_Black_001.glb
        const parts = id.replace('mustache_', '').split('_')
        const color = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const num = parts[1].padStart(3, '0')
        return `Mustache_${color}_${num}.glb`
      }
    },
    outerwear: {
      folder: 'Outerwear',
      pattern: (id) => {
        // outerwear_black_1 -> Outerwear_Black_001.glb
        const parts = id.replace('outerwear_', '').split('_')
        const color = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('_')
        const num = parts[parts.length - 1].padStart(3, '0')
        return `Outerwear_${color}_${num}.glb`
      }
    },
    pants: {
      folder: 'Pants',
      pattern: (id) => {
        const parts = id.replace('pants_', '').split('_')
        const color = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('_')
        const num = parts[parts.length - 1].padStart(3, '0')
        return `Pants_${color}_${num}.glb`
      }
    },
    shoe: {
      folder: 'Shoe',
      pattern: (id) => {
        // shoe_sneaker_1 -> Shoe_Sneaker_001.glb
        const parts = id.replace('shoe_', '').split('_')
        const type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        const num = parts[1].padStart(3, '0')
        return `Shoe_${type}_${num}.glb`
      }
    },
    glove: {
      folder: 'Glove',
      pattern: (id) => {
        const num = id.replace('glove_', '').padStart(3, '0')
        return `Glove_${num}.glb`
      }
    },
    backpack: {
      folder: 'Backpack',
      pattern: (id) => {
        const num = id.replace('backpack_', '').padStart(3, '0')
        return `Backpack_${num}.glb`
      }
    },
    full_body: {
      folder: 'Full_Body',
      pattern: (id) => {
        // alien -> Alien_001.glb
        const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, '_')
        return `${name}_001.glb`
      }
    }
  }

  const mapping = categoryMap[category]
  if (!mapping) return null

  try {
    const filename = mapping.pattern(assetId)
    return `${ASSET_PATH}/${mapping.folder}/${filename}`
  } catch {
    console.warn(`No se pudo mapear asset: ${category}/${assetId}`)
    return null
  }
}

// Componente para un accesorio estático
function StaticAccessory({ path }: { path: string }) {
  const { scene } = useGLTF(path)
  const cloned = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  return <primitive object={cloned} />
}

// Componente para accesorio adjunto a un hueso
function BoneAttachedAccessory({
  path,
  bone
}: {
  path: string
  bone: THREE.Bone | null
}) {
  const { scene } = useGLTF(path)
  const clonedScene = useMemo(() => scene.clone(), [scene])
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!bone || !groupRef.current) return

    // Calcular la inversa de la transformación del hueso
    // para que el accesorio quede en su posición original del mundo
    const updatePosition = () => {
      if (!groupRef.current || !bone) return

      // Obtener la matriz mundial del hueso
      const boneMatrix = new THREE.Matrix4()
      bone.updateWorldMatrix(true, false)
      boneMatrix.copy(bone.matrixWorld)

      // Invertirla para compensar
      const inverseMatrix = new THREE.Matrix4()
      inverseMatrix.copy(boneMatrix).invert()

      // Aplicar al grupo
      groupRef.current.matrix.copy(inverseMatrix)
      groupRef.current.matrixAutoUpdate = false
    }

    // Adjuntar al hueso
    bone.add(groupRef.current)
    updatePosition()

    return () => {
      if (groupRef.current) {
        bone.remove(groupRef.current)
      }
    }
  }, [bone])

  // Actualizar posición cada frame para seguir el hueso correctamente
  useFrame(() => {
    if (!bone || !groupRef.current) return

    const boneMatrix = new THREE.Matrix4()
    bone.updateWorldMatrix(true, false)
    boneMatrix.copy(bone.matrixWorld)

    const inverseMatrix = new THREE.Matrix4()
    inverseMatrix.copy(boneMatrix).invert()

    groupRef.current.matrix.copy(inverseMatrix)
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

interface CustomizedAnimatedCharacterProps {
  recipe: CharacterRecipe
  animation?: keyof typeof ANIMATION_MAP
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  onLoaded?: () => void
}

export function CustomizedAnimatedCharacter({
  recipe,
  animation = 'idle',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onLoaded
}: CustomizedAnimatedCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const [headBone, setHeadBone] = useState<THREE.Bone | null>(null)
  const [backBone, setBackBone] = useState<THREE.Bone | null>(null)

  // Cargar modelo animado base
  const { scene, animations } = useGLTF(ANIMATED_MODEL_PATH)

  // Resolver color del cuerpo desde la receta
  const bodyColor = useMemo(() => {
    if (!recipe.body) return BODY_COLORS.blue
    // body_blue_1 -> blue
    const colorName = recipe.body.replace('body_', '').split('_')[0]
    return BODY_COLORS[colorName] || BODY_COLORS.blue
  }, [recipe.body])

  // Clonar y configurar el modelo animado
  const clonedScene = useMemo(() => {
    const clone = cloneSkeleton(scene)

    clone.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.SkinnedMesh) {
        // Aplicar color del cuerpo
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(bodyColor),
          roughness: 0.7,
          metalness: 0.1,
        })
        child.material = material
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    return clone
  }, [scene, bodyColor])

  // Crear mixer y acciones de animación
  const actions = useMemo(() => {
    const mixer = new THREE.AnimationMixer(clonedScene)
    mixerRef.current = mixer

    const actionsMap: Record<string, THREE.AnimationAction> = {}
    animations.forEach(clip => {
      actionsMap[clip.name] = mixer.clipAction(clip)
    })

    return actionsMap
  }, [clonedScene, animations])

  // Encontrar huesos después de cargar
  useEffect(() => {
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Bone) {
        if (child.name === HEAD_BONE) {
          setHeadBone(child)
        } else if (child.name === BACK_BONE) {
          setBackBone(child)
        }
      }
    })

    onLoaded?.()
  }, [clonedScene, onLoaded])

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

  // Construir lista de accesorios a renderizar
  const accessories = useMemo(() => {
    const items: { category: string; path: string; type: 'head' | 'back' | 'static' }[] = []

    Object.entries(recipe).forEach(([category, assetId]) => {
      if (!assetId || category === 'body' || category === 'full_body') return

      const path = assetIdToPath(category, assetId)
      if (!path) return

      let type: 'head' | 'back' | 'static' = 'static'
      if (HEAD_CATEGORIES.includes(category)) {
        type = 'head'
      } else if (BACK_CATEGORIES.includes(category)) {
        type = 'back'
      }

      items.push({ category, path, type })
    })

    return items
  }, [recipe])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Modelo animado base */}
      <primitive object={clonedScene} />

      {/* Accesorios de cabeza - adjuntos al hueso */}
      {accessories
        .filter(a => a.type === 'head')
        .map(acc => (
          <BoneAttachedAccessory
            key={acc.category}
            path={acc.path}
            bone={headBone}
          />
        ))}

      {/* Accesorios de espalda - adjuntos al hueso */}
      {accessories
        .filter(a => a.type === 'back')
        .map(acc => (
          <BoneAttachedAccessory
            key={acc.category}
            path={acc.path}
            bone={backBone}
          />
        ))}

      {/* Accesorios estáticos - ropa del cuerpo */}
      {accessories
        .filter(a => a.type === 'static')
        .map(acc => (
          <StaticAccessory key={acc.category} path={acc.path} />
        ))}
    </group>
  )
}

// Precargar modelo animado
useGLTF.preload(ANIMATED_MODEL_PATH)
