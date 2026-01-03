import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import {
  SkinnedCharacter,
  ANIMATION_MAP,
  CharacterRecipe
} from '../components/game3d/SkinnedCharacter'
import { creatorApi, ContentCreation } from '../services/creatorApi'

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white bg-black/50 px-4 py-2 rounded">
        Cargando personaje...
      </div>
    </Html>
  )
}

export default function SavedCharactersTest() {
  const [characters, setCharacters] = useState<ContentCreation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animation, setAnimation] = useState<keyof typeof ANIMATION_MAP>('idle')
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar personajes de la DB
  useEffect(() => {
    async function loadCharacters() {
      try {
        setLoading(true)
        const all = await creatorApi.getMyCreations('Nacho')
        // Filtrar solo personaje_3d
        const chars3d = all.filter(c => c.content_type === 'personaje_3d')
        setCharacters(chars3d)

        // Seleccionar el primero por defecto
        if (chars3d.length > 0) {
          setSelectedId(chars3d[0].id)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando personajes')
      } finally {
        setLoading(false)
      }
    }
    loadCharacters()
  }, [])

  const selectedCharacter = characters.find(c => c.id === selectedId)

  // Convertir recipe de la DB al formato de CharacterRecipe
  const recipe: CharacterRecipe | null = selectedCharacter ? {
    body: selectedCharacter.recipe.body,
    hair: selectedCharacter.recipe.hair,
    hat: selectedCharacter.recipe.hat,
    glasses: selectedCharacter.recipe.glasses,
    eyebrow: selectedCharacter.recipe.eyebrow,
    mustache: selectedCharacter.recipe.mustache,
    outerwear: selectedCharacter.recipe.outerwear,
    pants: selectedCharacter.recipe.pants,
    shoe: selectedCharacter.recipe.shoe,
    glove: selectedCharacter.recipe.glove,
    backpack: selectedCharacter.recipe.backpack,
    full_body: selectedCharacter.recipe.full_body,  // Disfraces completos
  } : null

  return (
    <div className="w-full h-screen bg-gradient-to-b from-indigo-900 to-gray-900 flex">
      {/* Panel de control */}
      <div className="w-96 bg-gray-800 p-4 overflow-y-auto text-white">
        <h1 className="text-xl font-bold mb-2 text-indigo-400">
          Personajes Guardados
        </h1>

        <p className="text-xs text-gray-400 mb-4">
          Personajes creados en el Creator y guardados en la base de datos.
          Ahora con animaciones reales.
        </p>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p className="text-gray-400">Cargando personajes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {!loading && characters.length === 0 && (
          <div className="bg-yellow-900/50 border border-yellow-500 rounded p-3 mb-4">
            <p className="text-yellow-300 text-sm">
              No hay personajes 3D guardados.
              Crea uno en /creator primero.
            </p>
          </div>
        )}

        {/* Lista de personajes */}
        {characters.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Selecciona un personaje ({characters.length} guardados):
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {characters.map(char => (
                <button
                  key={char.id}
                  onClick={() => {
                    setIsLoaded(false)
                    setSelectedId(char.id)
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedId === char.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <div className="font-medium">{char.name}</div>
                  <div className="text-xs opacity-70">
                    {char.description || 'Sin descripción'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <hr className="border-gray-600 my-4" />

        {/* Animación */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Animación:</label>
          <select
            value={animation}
            onChange={(e) => setAnimation(e.target.value as keyof typeof ANIMATION_MAP)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {Object.entries(ANIMATION_MAP).map(([key, config]) => (
              <option key={key} value={key}>
                {key.replace(/_/g, ' ')} ({config.duration.toFixed(1)}s)
              </option>
            ))}
          </select>
        </div>

        {/* Botones rápidos */}
        <div className="mb-4 grid grid-cols-3 gap-1">
          {['idle', 'walk', 'run', 'dance_1', 'win', 'attack_left'].map(anim => (
            <button
              key={anim}
              onClick={() => setAnimation(anim as keyof typeof ANIMATION_MAP)}
              className={`px-2 py-1 text-xs rounded ${
                animation === anim
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {anim.replace(/_/g, ' ').slice(0, 8)}
            </button>
          ))}
        </div>

        <hr className="border-gray-600 my-4" />

        {/* Info del personaje seleccionado */}
        {selectedCharacter && (
          <div className="bg-gray-700/50 rounded p-3">
            <h3 className="font-medium text-indigo-300 mb-2">
              {selectedCharacter.name}
            </h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Estado:</strong> {isLoaded ? '✅ Cargado' : '⏳ Cargando...'}</p>
              <p><strong>Creador:</strong> {selectedCharacter.creator_name}</p>
              <p><strong>Recipe:</strong></p>
              <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(selectedCharacter.recipe, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Canvas 3D con mejor calidad */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ position: [3, 2, 5], fov: 45 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          dpr={[1, 2]} // Pixel ratio para mejor calidad
        >
          <color attach="background" args={['#0f0f1a']} />

          {/* Iluminación uniforme frente/atrás */}
          <ambientLight intensity={0.8} />
          {/* Luz principal desde arriba-adelante */}
          <directionalLight
            position={[0, 8, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          {/* Fill light desde el frente para iluminar la cara */}
          <directionalLight position={[0, 2, 8]} intensity={0.5} />
          {/* Rim light desde atrás */}
          <directionalLight position={[0, 3, -5]} intensity={0.3} />
          <Environment preset="studio" />

          {/* Personaje */}
          {recipe && (
            <Suspense fallback={<LoadingFallback />}>
              <SkinnedCharacter
                key={selectedId}
                recipe={recipe}
                animation={animation}
                position={[0, 0, 0]}
                scale={1}
                onLoaded={() => setIsLoaded(true)}
              />
            </Suspense>
          )}

          {/* Piso con mejor sombra */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.6}
            scale={12}
            blur={2.5}
            far={4}
          />

          {/* Piso reflectante sutil */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
              color="#1a1a2e"
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>

          {/* Grid */}
          <gridHelper args={[20, 20, '#333', '#222']} position={[0, 0.01, 0]} />

          {/* Controles */}
          <OrbitControls
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
            enableDamping
            dampingFactor={0.05}
          />

          {/* Ambiente HDR para mejor iluminación */}
          <Environment preset="city" background={false} />
        </Canvas>
      </div>
    </div>
  )
}
