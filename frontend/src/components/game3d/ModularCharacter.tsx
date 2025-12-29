// ModularCharacter.tsx - Personaje modular animado
// Combina partes del pack Funny Characters con animacion procedural

import React, { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import { AnimatedCharacter, AnimationType, WalkPath } from './CharacterAnimation'

// ==================== PATHS ====================

const ASSET_PATH = '/assets/models/funny_characters_pack/Assets_glb'

// ==================== TIPOS ====================

export interface ModularCharacterParts {
  body?: string        // Body/Body_Blue_001.glb
  fullBody?: string    // Full_Body/Astronaut_001.glb (reemplaza body + ropa)
  hair?: string        // Hair/Hair_001.glb
  hat?: string         // Hat/Hat_001.glb
  glasses?: string     // Glasses/Glasses_001.glb
  eyebrow?: string     // Eyebrow/Eyebrow_001.glb
  mustache?: string    // Mustache/Mustache_Black_001.glb
  outerwear?: string   // Outerwear/Outerwear_Black_001.glb
  pants?: string       // Pants/Pants_Black_001.glb
  shoe?: string        // Shoe/Shoe_Sneaker_001.glb
  glove?: string       // Glove/Glove_001.glb
  backpack?: string    // Backpack/Backpack_001.glb
}

export interface ModularCharacterProps {
  parts: ModularCharacterParts
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  animation?: AnimationType
  animationSpeed?: number
  animationIntensity?: number
  walkPath?: WalkPath
}

// ==================== COMPONENTE DE PARTE ====================

const CharacterPart: React.FC<{ path: string }> = ({ path }) => {
  const { scene } = useGLTF(`${ASSET_PATH}/${path}`)
  return <primitive object={scene.clone()} />
}

// ==================== COMPONENTE PRINCIPAL ====================

export const ModularCharacter: React.FC<ModularCharacterProps> = ({
  parts,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  animation = 'idle',
  animationSpeed = 1,
  animationIntensity = 1,
  walkPath
}) => {
  // Si hay fullBody, solo renderiza ese (ignora body + ropa)
  const partsToRender = parts.fullBody
    ? { fullBody: parts.fullBody, hat: parts.hat, glasses: parts.glasses, backpack: parts.backpack }
    : parts

  return (
    <AnimatedCharacter
      position={position}
      scale={scale}
      rotation={rotation}
      animation={{ type: animation, speed: animationSpeed, intensity: animationIntensity }}
      path={walkPath}
    >
      <group>
        {Object.entries(partsToRender).map(([key, path]) => {
          if (!path) return null
          return (
            <Suspense key={key} fallback={null}>
              <CharacterPart path={path} />
            </Suspense>
          )
        })}
      </group>
    </AnimatedCharacter>
  )
}

// ==================== PRESETS DE PERSONAJES ====================

export const CHARACTER_PRESETS = {
  // Astronauta caminando
  astronaut: {
    parts: { fullBody: 'Full_Body/Astronaut_001.glb' },
    animation: 'walk' as AnimationType,
    walkPath: { type: 'circle' as const, radius: 8 }
  },

  // Alien idle
  alien: {
    parts: { fullBody: 'Full_Body/Alien_001.glb' },
    animation: 'idle' as AnimationType
  },

  // Hot Dog bailando
  hotdog: {
    parts: { fullBody: 'Full_Body/Hot_dog_001.glb' },
    animation: 'dance' as AnimationType
  },

  // Personaje casual
  casual: {
    parts: {
      body: 'Body/Body_Blue_001.glb',
      hair: 'Hair/Hair_001.glb',
      outerwear: 'Outerwear/Outerwear_Blue_001.glb',
      pants: 'Pants/Pants_Blue_001.glb',
      shoe: 'Shoe/Shoe_Sneaker_001.glb'
    },
    animation: 'walk' as AnimationType,
    walkPath: { type: 'circle' as const, radius: 6 }
  },

  // Trabajador de food truck
  foodTruckWorker: {
    parts: {
      body: 'Body/Body_White_001.glb',
      hat: 'Hat/Hat_010.glb',  // Gorra de chef o similar
      outerwear: 'Outerwear/Outerwear_White_001.glb',
      pants: 'Pants/Pants_Black_001.glb',
      shoe: 'Shoe/Shoe_Sneaker_001.glb'
    },
    animation: 'idle' as AnimationType
  }
}

// ==================== HELPERS ====================

// Crear personaje desde receta del Character3DCreator
export function createCharacterFromRecipe(
  recipe: Record<string, string | null>,
  animation: AnimationType = 'idle',
  walkPath?: WalkPath
): ModularCharacterProps {
  const parts: ModularCharacterParts = {}

  // Mapear IDs de receta a paths de archivos
  const categoryToPath: Record<string, string> = {
    body: 'Body',
    full_body: 'Full_Body',
    hair: 'Hair',
    hat: 'Hat',
    glasses: 'Glasses',
    eyebrow: 'Eyebrow',
    mustache: 'Mustache',
    outerwear: 'Outerwear',
    pants: 'Pants',
    shoe: 'Shoe',
    glove: 'Glove',
    backpack: 'Backpack'
  }

  Object.entries(recipe).forEach(([category, assetId]) => {
    if (!assetId) return

    // El assetId viene como "body_blue_1", necesitamos convertirlo a path
    // Por ahora asumimos que el archivo ya está en el formato correcto
    const folder = categoryToPath[category]
    if (folder) {
      // Convertir snake_case a formato de archivo
      // body_blue_1 -> Body_Blue_001.glb
      const fileName = assetIdToFileName(assetId)
      if (fileName) {
        (parts as Record<string, string>)[category === 'full_body' ? 'fullBody' : category] = `${folder}/${fileName}`
      }
    }
  })

  return {
    parts,
    animation,
    walkPath
  }
}

// Helper para convertir asset ID a nombre de archivo
function assetIdToFileName(assetId: string): string | null {
  // Ejemplos:
  // body_blue_1 -> Body_Blue_001.glb
  // astronaut -> Astronaut_001.glb
  // hat_15 -> Hat_015.glb

  const parts = assetId.split('_')

  if (parts.length === 1) {
    // Single word like "astronaut"
    return `${capitalize(parts[0])}_001.glb`
  }

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1]
    const isNumber = !isNaN(Number(lastPart))

    if (isNumber) {
      // Has number at end: body_blue_1 -> Body_Blue_001.glb
      const number = String(Number(lastPart)).padStart(3, '0')
      const nameParts = parts.slice(1, -1).map(capitalize)
      return `${capitalize(parts[0])}_${nameParts.join('_')}${nameParts.length ? '_' : ''}${number}.glb`
    } else {
      // No number: something_else -> Something_Else_001.glb
      return `${parts.map(capitalize).join('_')}_001.glb`
    }
  }

  return null
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default ModularCharacter
