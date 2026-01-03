// ApprovedCharacters3D.tsx - Visualizador de Personajes Aprobados con Animaciones
// Usa el mismo estilo visual que Character3DCreator para consistencia

import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei'
import {
  SkinnedCharacter,
  ANIMATION_MAP,
  CharacterRecipe
} from '../game3d/SkinnedCharacter'
import { creatorApi, ContentCreation } from '../../services/creatorApi'

// Componente de carga
function Cargando() {
  return (
    <Html center>
      <div className="text-gray-600 text-sm animate-pulse">Cargando...</div>
    </Html>
  )
}

// Escena del personaje animado - mismo estilo que Character3DCreator
function EscenaAnimada({
  recipe,
  animation,
  onLoaded
}: {
  recipe: CharacterRecipe
  animation: keyof typeof ANIMATION_MAP
  onLoaded: () => void
}) {
  return (
    <>
      {/* Fondo oscuro elegante */}
      <color attach="background" args={['#0f0f1a']} />

      {/* Iluminación uniforme 360° */}
      <ambientLight intensity={0.3} />
      {/* Luz frontal */}
      <directionalLight position={[0, 5, 5]} intensity={0.6} />
      {/* Luz trasera */}
      <directionalLight position={[0, 5, -5]} intensity={0.6} />
      {/* Luz izquierda */}
      <directionalLight position={[-5, 5, 0]} intensity={0.4} />
      {/* Luz derecha */}
      <directionalLight position={[5, 5, 0]} intensity={0.4} />
      <Environment preset="studio" />

      <OrbitControls
        minDistance={1.5}
        maxDistance={6}
        target={[0, 1, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Personaje animado */}
      <SkinnedCharacter
        recipe={recipe}
        animation={animation}
        position={[0, 0, 0]}
        scale={1}
        onLoaded={onLoaded}
      />

      {/* Sombras suaves */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />

      {/* Piso reflectante */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid futurista muy sutil */}
      <gridHelper args={[20, 20, '#1a1a28', '#151520']} position={[0, 0.01, 0]} />
    </>
  )
}

// Componente principal
export function ApprovedCharacters3D() {
  const [characters, setCharacters] = useState<ContentCreation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [animation, setAnimation] = useState<keyof typeof ANIMATION_MAP>('idle')
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar personajes aprobados
  useEffect(() => {
    async function loadCharacters() {
      try {
        setLoading(true)
        // Obtener todos y filtrar los aprobados de tipo personaje_3d
        const all = await creatorApi.getMyCreations('Nacho')
        const approved = all.filter(
          c => c.content_type === 'personaje_3d' && c.status === 'approved'
        )
        setCharacters(approved)

        if (approved.length > 0) {
          setSelectedId(approved[0].id)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando personajes')
      } finally {
        setLoading(false)
      }
    }
    loadCharacters()
  }, [])

  // Eliminar personaje
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return

    try {
      await creatorApi.deleteCreation(id)
      // Actualizar lista local
      setCharacters(prev => prev.filter(c => c.id !== id))
      // Si era el seleccionado, seleccionar otro
      if (selectedId === id) {
        const remaining = characters.filter(c => c.id !== id)
        setSelectedId(remaining.length > 0 ? remaining[0].id : null)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

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
    full_body: selectedCharacter.recipe.full_body,
  } : null

  // Animaciones principales para mostrar
  const mainAnimations: (keyof typeof ANIMATION_MAP)[] = [
    'idle', 'walk', 'run', 'dance_1', 'dance_2', 'win', 'attack_left'
  ]

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gray-100">
      {/* Panel izquierdo - Lista de personajes */}
      <div className="lg:w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-coral to-mango">
          <h2 className="text-lg font-bold text-white">Personajes Animados</h2>
          <p className="text-white/80 text-xs">Personajes aprobados con animaciones</p>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              <p className="text-gray-500 text-sm">Cargando personajes...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3">
            <div className="bg-red-100 border border-red-300 rounded p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && characters.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🎭</div>
              <p className="text-gray-500 text-sm">
                No hay personajes aprobados todavia.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Los personajes aparecen aqui despues de ser aprobados.
              </p>
            </div>
          </div>
        )}

        {/* Lista de personajes */}
        {characters.length > 0 && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {characters.map(char => (
              <div
                key={char.id}
                className={`flex items-center gap-1 rounded-lg transition-all ${
                  selectedId === char.id
                    ? 'bg-coral text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <button
                  onClick={() => {
                    setIsLoaded(false)
                    setSelectedId(char.id)
                  }}
                  className="flex-1 text-left px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {char.recipe.full_body && <span>🎭</span>}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{char.name}</div>
                      <div className="text-xs opacity-70 truncate">
                        {char.description || 'Sin descripcion'}
                      </div>
                    </div>
                  </div>
                </button>
                {/* Botón eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(char.id, char.name)
                  }}
                  className={`p-2 rounded-r-lg transition-colors ${
                    selectedId === char.id
                      ? 'hover:bg-red-500 text-white/70 hover:text-white'
                      : 'hover:bg-red-100 text-gray-400 hover:text-red-500'
                  }`}
                  title="Eliminar personaje"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Selector de animacion */}
        {selectedCharacter && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Animacion:
            </label>
            <div className="grid grid-cols-4 gap-1">
              {mainAnimations.map(anim => (
                <button
                  key={anim}
                  onClick={() => setAnimation(anim)}
                  className={`px-2 py-1.5 text-xs rounded transition-all ${
                    animation === anim
                      ? 'bg-coral text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {anim === 'idle' ? 'Quieto' :
                   anim === 'walk' ? 'Caminar' :
                   anim === 'run' ? 'Correr' :
                   anim === 'dance_1' ? 'Baile 1' :
                   anim === 'dance_2' ? 'Baile 2' :
                   anim === 'win' ? 'Victoria' :
                   anim === 'attack_left' ? 'Golpe' : anim}
                </button>
              ))}
            </div>

            {/* Todas las animaciones */}
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Mas animaciones ({Object.keys(ANIMATION_MAP).length})
              </summary>
              <select
                value={animation}
                onChange={(e) => setAnimation(e.target.value as keyof typeof ANIMATION_MAP)}
                className="w-full mt-2 text-xs bg-white border border-gray-200 rounded px-2 py-1"
              >
                {Object.entries(ANIMATION_MAP).map(([key, config]) => (
                  <option key={key} value={key}>
                    {key.replace(/_/g, ' ')} ({config.duration.toFixed(1)}s)
                  </option>
                ))}
              </select>
            </details>
          </div>
        )}
      </div>

      {/* Panel derecho - Canvas 3D */}
      <div className="flex-1 flex flex-col">
        {/* Canvas con fondo claro igual a Character3DCreator */}
        <div className="flex-1 relative">
          {recipe ? (
            <Canvas
              shadows
              camera={{ position: [3, 2, 5], fov: 45 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
              }}
              dpr={[1, 2]}
            >
              <Suspense fallback={<Cargando />}>
                <EscenaAnimada
                  recipe={recipe}
                  animation={animation}
                  onLoaded={() => setIsLoaded(true)}
                />
              </Suspense>
            </Canvas>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-2">👈</div>
                <p>Selecciona un personaje</p>
              </div>
            </div>
          )}

          {/* Estado de carga */}
          {recipe && !isLoaded && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              Cargando modelo...
            </div>
          )}

          {/* Info del personaje */}
          {selectedCharacter && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedCharacter.name}
            </div>
          )}

          {/* Animacion actual */}
          {selectedCharacter && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {animation.replace(/_/g, ' ')}
            </div>
          )}
        </div>

        {/* Info adicional */}
        {selectedCharacter && (
          <div className="bg-white border-t border-gray-200 p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Creado por: {selectedCharacter.creator_name}</span>
              <span>
                {selectedCharacter.recipe.full_body
                  ? `Disfraz: ${selectedCharacter.recipe.full_body}`
                  : `${Object.values(selectedCharacter.recipe).filter(Boolean).length} partes`
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApprovedCharacters3D
