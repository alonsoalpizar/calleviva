// NormalCharacterTest.tsx - Prueba del NormalCharacter con 31 animaciones y accesorios

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import { NormalCharacter, NORMAL_ANIMATIONS, NORMAL_ACCESSORIES } from '../components/game3d'
import type { NormalCharacterRecipe } from '../components/game3d'

export default function NormalCharacterTest() {
  const [animation, setAnimation] = useState<string>('idle')
  const [scale, setScale] = useState(1)
  const [recipe, setRecipe] = useState<NormalCharacterRecipe>({})

  // Actualizar un accesorio en la receta
  const updateRecipe = (key: keyof NormalCharacterRecipe, value: string) => {
    setRecipe(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  // Receta aleatoria
  const randomizeRecipe = () => {
    const newRecipe: NormalCharacterRecipe = {}
    const categories = Object.keys(NORMAL_ACCESSORIES) as (keyof typeof NORMAL_ACCESSORIES)[]

    categories.forEach(cat => {
      // 50% probabilidad de tener cada accesorio
      if (Math.random() > 0.5) {
        const items = NORMAL_ACCESSORIES[cat]
        newRecipe[cat] = items[Math.floor(Math.random() * items.length)]
      }
    })

    setRecipe(newRecipe)
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 rounded-xl p-4 shadow-lg max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-2">NormalCharacter Test</h2>
        <p className="text-sm text-gray-600 mb-3">31 animaciones + accesorios skinned</p>

        {/* Animation selector */}
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">Animacion:</label>
          <select
            value={animation}
            onChange={(e) => setAnimation(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
          >
            {NORMAL_ANIMATIONS.map((anim) => (
              <option key={anim} value={anim}>
                {anim}
              </option>
            ))}
          </select>
        </div>

        {/* Scale slider */}
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">
            Escala: {scale.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Quick animation buttons */}
        <div className="grid grid-cols-3 gap-1 mb-4">
          {['idle', 'walk', 'run', 'jump_start', 'attack_punch', 'death_forward'].map((anim) => (
            <button
              key={anim}
              onClick={() => setAnimation(anim)}
              className={`px-2 py-1 text-xs rounded ${
                animation === anim
                  ? 'bg-coral text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {anim.split('_')[0]}
            </button>
          ))}
        </div>

        {/* Accessories section */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Accesorios</h3>
            <button
              onClick={randomizeRecipe}
              className="px-2 py-1 text-xs bg-coral text-white rounded hover:bg-coral/80"
            >
              🎲 Random
            </button>
          </div>

          {/* Accessory selectors */}
          <div className="space-y-2 text-xs">
            {(Object.keys(NORMAL_ACCESSORIES) as (keyof typeof NORMAL_ACCESSORIES)[]).map(cat => (
              <div key={cat} className="flex items-center gap-2">
                <label className="w-20 capitalize">{cat}:</label>
                <select
                  value={recipe[cat] || ''}
                  onChange={(e) => updateRecipe(cat, e.target.value)}
                  className="flex-1 p-1 border rounded text-xs"
                >
                  <option value="">Ninguno</option>
                  {NORMAL_ACCESSORIES[cat].map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Clear all button */}
          <button
            onClick={() => setRecipe({})}
            className="mt-3 w-full py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [3, 2, 3], fov: 50 }}>
        <Suspense fallback={null}>
          {/* Lighting - Studio para iluminación uniforme 360° */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Luz frontal para eliminar sombras en la cara */}
          <directionalLight
            position={[-3, 5, 8]}
            intensity={0.4}
          />

          {/* Environment studio = iluminación 360° uniforme */}
          <Environment preset="studio" />

          {/* Grid */}
          <Grid
            position={[0, 0, 0]}
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6e6e6e"
            sectionSize={2}
            fadeDistance={20}
          />

          {/* Character */}
          <NormalCharacter
            recipe={recipe}
            animation={animation as keyof typeof import('../components/game3d/NormalCharacter').NORMAL_ANIMATION_MAP}
            scale={scale}
            position={[0, 0, 0]}
          />

          {/* Controls */}
          <OrbitControls
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
        Usa el mouse para rotar la camara
      </div>
    </div>
  )
}
