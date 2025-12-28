// CharacterViewer.tsx - Test viewer for modular character GLB assets
// Allows viewing and combining different character parts

import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei'

const ASSET_PATH = '/assets/models/character_pack/Separate_assets_glb'

// Asset categories with their files
const ASSET_CATEGORIES = {
  body: ['Body_010.glb'],
  face: [
    'Male_emotion_usual_001.glb',
    'Male_emotion_happy_002.glb',
    'Male_emotion_angry_003.glb',
  ],
  hairstyle: ['Hairstyle_male_010.glb', 'Hairstyle_male_012.glb'],
  hat: ['Hat_010.glb', 'Hat_049.glb', 'Hat_057.glb'],
  glasses: ['Glasses_004.glb', 'Glasses_006.glb'],
  outwear: ['Outwear_029.glb', 'Outwear_036.glb'],
  tshirt: ['T-Shirt_009.glb'],
  pants: ['Pants_010.glb', 'Pants_014.glb', 'Shorts_003.glb'],
  shoes: ['Shoe_Slippers_002.glb', 'Shoe_Slippers_005.glb', 'Shoe_Sneakers_009.glb'],
  socks: ['Socks_008.glb'],
  gloves: ['Gloves_006.glb', 'Gloves_014.glb'],
  costume: ['Costume_6_001.glb', 'Costume_10_001.glb'],
  accessories: [
    'Moustache_001.glb',
    'Moustache_002.glb',
    'Headphones_002.glb',
    'Clown_nose_001.glb',
    'Pacifier_001.glb',
  ],
}

type CategoryKey = keyof typeof ASSET_CATEGORIES

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  body: '📦 Body',
  face: '😀 Face',
  hairstyle: '💇 Hair',
  hat: '🎩 Hat',
  glasses: '👓 Glasses',
  outwear: '🧥 Outwear',
  tshirt: '👕 T-Shirt',
  pants: '👖 Pants',
  shoes: '👟 Shoes',
  socks: '🧦 Socks',
  gloves: '🧤 Gloves',
  costume: '🎭 Costume',
  accessories: '🎪 Accessories',
}

// Single GLB Model component
const GLBModel: React.FC<{ path: string; visible: boolean }> = ({ path, visible }) => {
  const { scene } = useGLTF(path)

  if (!visible) return null

  return <primitive object={scene.clone()} />
}

// Loading fallback
const Loader = () => (
  <Html center>
    <div className="text-white text-lg animate-pulse">Cargando modelo...</div>
  </Html>
)

// Character Preview Scene
const CharacterScene: React.FC<{ selectedParts: Record<CategoryKey, string | null> }> = ({
  selectedParts,
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Environment preset="city" />

      <OrbitControls
        minDistance={1}
        maxDistance={5}
        target={[0, 1, 0]}
      />

      <group position={[0, 0, 0]} scale={1}>
        {Object.entries(selectedParts).map(([category, file]) => {
          if (!file) return null
          const path = `${ASSET_PATH}/${file}`
          return (
            <Suspense key={category} fallback={null}>
              <GLBModel path={path} visible={true} />
            </Suspense>
          )
        })}
      </group>

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#2D3436" />
      </mesh>
    </>
  )
}

// Main Viewer Component
export const CharacterViewer: React.FC = () => {
  const [selectedParts, setSelectedParts] = useState<Record<CategoryKey, string | null>>({
    body: 'Body_010.glb',
    face: 'Male_emotion_usual_001.glb',
    hairstyle: null,
    hat: null,
    glasses: null,
    outwear: null,
    tshirt: null,
    pants: null,
    shoes: null,
    socks: null,
    gloves: null,
    costume: null,
    accessories: null,
  })

  const togglePart = (category: CategoryKey, file: string) => {
    setSelectedParts((prev) => ({
      ...prev,
      [category]: prev[category] === file ? null : file,
    }))
  }

  const randomize = () => {
    const newParts: Record<CategoryKey, string | null> = { ...selectedParts }

    // Always keep body
    newParts.body = 'Body_010.glb'

    // Random face
    const faces = ASSET_CATEGORIES.face
    newParts.face = faces[Math.floor(Math.random() * faces.length)]

    // Random other parts (50% chance each)
    const optionalCategories: CategoryKey[] = [
      'hairstyle', 'hat', 'glasses', 'outwear', 'tshirt',
      'pants', 'shoes', 'socks', 'gloves', 'accessories'
    ]

    optionalCategories.forEach((cat) => {
      if (Math.random() > 0.5) {
        const options = ASSET_CATEGORIES[cat]
        newParts[cat] = options[Math.floor(Math.random() * options.length)]
      } else {
        newParts[cat] = null
      }
    })

    // Clear costume if we have other clothes
    if (newParts.tshirt || newParts.outwear) {
      newParts.costume = null
    }

    setSelectedParts(newParts)
  }

  const clearAll = () => {
    setSelectedParts({
      body: 'Body_010.glb',
      face: 'Male_emotion_usual_001.glb',
      hairstyle: null,
      hat: null,
      glasses: null,
      outwear: null,
      tshirt: null,
      pants: null,
      shoes: null,
      socks: null,
      gloves: null,
      costume: null,
      accessories: null,
    })
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* 3D Preview */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [2, 2, 2], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <CharacterScene selectedParts={selectedParts} />
          </Suspense>
        </Canvas>

        {/* Title */}
        <div className="absolute top-4 left-4 text-white">
          <h1 className="text-2xl font-bold">Character Viewer</h1>
          <p className="text-sm text-gray-400">ithappy Modular Pack</p>
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={randomize}
            className="bg-coral hover:bg-coral/80 text-white font-bold py-2 px-4 rounded-lg"
          >
            🎲 Random
          </button>
          <button
            onClick={clearAll}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Sidebar - Part Selection */}
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Customization</h2>

        {(Object.keys(ASSET_CATEGORIES) as CategoryKey[]).map((category) => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="flex flex-wrap gap-1">
              {ASSET_CATEGORIES[category].map((file) => {
                const isSelected = selectedParts[category] === file
                const shortName = file.replace('.glb', '').replace(/_/g, ' ')

                return (
                  <button
                    key={file}
                    onClick={() => togglePart(category, file)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isSelected
                        ? 'bg-coral text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {shortName}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CharacterViewer
