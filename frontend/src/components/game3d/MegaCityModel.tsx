// MegaCityModel.tsx - Loader para assets del MegaCity pack que requieren textura externa
// Los GLB de este pack no tienen textura embebida, hay que aplicar Polygon_Texture.png

import React, { useEffect, useMemo } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Path base del MegaCity pack
export const MEGACITY_PATH = '/assets/models/City/MegaCity/MegapolisCityPack/Assets/Models'
export const MEGACITY_TEXTURE = '/assets/models/City/MegaCity/MegapolisCityPack/Assets/Textures/Polygon_Texture.png'

interface MegaCityModelProps {
  /** Ruta relativa al modelo dentro del pack (ej: "Airport/SM_airplane_01.glb") */
  modelPath: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
}

/**
 * Componente para cargar modelos del MegaCity pack
 * Automáticamente aplica la textura Polygon_Texture.png a todos los materiales
 */
export const MegaCityModel: React.FC<MegaCityModelProps> = ({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const fullPath = `${MEGACITY_PATH}/${modelPath}`
  const { scene } = useGLTF(fullPath)
  const texture = useTexture(MEGACITY_TEXTURE)

  // Configurar la textura
  useEffect(() => {
    texture.flipY = false // Los GLB suelen necesitar esto
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
  }, [texture])

  // Clonar la escena y aplicar textura a todos los materiales
  const clonedScene = useMemo(() => {
    const clone = scene.clone()

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        // Manejar material único o array de materiales
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(mat => {
            const newMat = (mat as THREE.MeshStandardMaterial).clone()
            newMat.map = texture
            newMat.needsUpdate = true
            return newMat
          })
        } else {
          const newMat = (mesh.material as THREE.MeshStandardMaterial).clone()
          newMat.map = texture
          newMat.needsUpdate = true
          mesh.material = newMat
        }

        // Habilitar sombras
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    return clone
  }, [scene, texture])

  const scaleArray = typeof scale === 'number' ? [scale, scale, scale] : scale

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={scaleArray}
    />
  )
}

/**
 * Hook para precargar modelos del MegaCity pack
 */
export const preloadMegaCityModel = (modelPath: string) => {
  useGLTF.preload(`${MEGACITY_PATH}/${modelPath}`)
}

// Precargar la textura compartida
useTexture.preload(MEGACITY_TEXTURE)

export default MegaCityModel
