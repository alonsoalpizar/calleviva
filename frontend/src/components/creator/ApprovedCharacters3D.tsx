// ApprovedCharacters3D.tsx - Visualizador de Personajes Aprobados con Animaciones
// Soporta Funny Pack (SkinnedCharacter) y Modular Pack (NormalCharacter)

import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, ContactShadows } from '@react-three/drei'
import {
  SkinnedCharacter,
  ANIMATION_MAP,
  CharacterRecipe
} from '../game3d/SkinnedCharacter'
import {
  NormalCharacter,
  NORMAL_ANIMATION_MAP,
  NormalCharacterRecipe
} from '../game3d/NormalCharacter'
import { creatorApi, ContentCreation } from '../../services/creatorApi'

// Tipo de pack
type PackType = 'funny' | 'modular'

// Detectar tipo de pack basado en la receta
function detectPackType(recipe: Record<string, unknown>): PackType {
  // Si tiene body_modular o campos únicos de modular pack
  if (recipe.body === 'body_modular' || recipe.face || recipe.hairstyle || recipe.costume) {
    return 'modular'
  }
  return 'funny'
}

// Mapear receta de DB a NormalCharacterRecipe
function mapToNormalRecipe(dbRecipe: Record<string, string>): NormalCharacterRecipe {
  const recipe: NormalCharacterRecipe = {}

  // Mapeo de campos de DB a campos de NormalCharacterRecipe
  // DB tiene: body, face, hairstyle, hat, glasses, outwear, tshirt, pants, shoes, socks, gloves, costume, accessories
  // NormalCharacterRecipe usa: body, emotion, hair, hat, glasses, headphones, mustache, clown_nose, pacifier, outerwear, tshirt, pants, shorts, socks, shoe, gloves, costume

  // Body - siempre Body_010 para modular
  if (dbRecipe.body === 'body_modular') {
    recipe.body = 'Body_010'
  }

  // Face -> emotion
  const faceMap: Record<string, string> = {
    'face_usual': 'Male_emotion_usual_001',
    'face_happy': 'Male_emotion_happy_002',
    'face_angry': 'Male_emotion_angry_003',
  }
  if (dbRecipe.face && faceMap[dbRecipe.face]) {
    recipe.emotion = faceMap[dbRecipe.face]
  }

  // Hairstyle -> hair
  const hairMap: Record<string, string> = {
    'hair_10': 'Hairstyle_male_010',
    'hair_12': 'Hairstyle_male_012',
  }
  if (dbRecipe.hairstyle && hairMap[dbRecipe.hairstyle]) {
    recipe.hair = hairMap[dbRecipe.hairstyle]
  }

  // Hat
  const hatMap: Record<string, string> = {
    'hat_10': 'Hat_010',
    'hat_49': 'Hat_049',
    'hat_57': 'Hat_057',
  }
  if (dbRecipe.hat && hatMap[dbRecipe.hat]) {
    recipe.hat = hatMap[dbRecipe.hat]
  }

  // Glasses
  const glassesMap: Record<string, string> = {
    'glasses_4': 'Glasses_004',
    'glasses_6': 'Glasses_006',
  }
  if (dbRecipe.glasses && glassesMap[dbRecipe.glasses]) {
    recipe.glasses = glassesMap[dbRecipe.glasses]
  }

  // Outwear -> outerwear
  const outwearMap: Record<string, string> = {
    'outwear_29': 'Outwear_029',
    'outwear_36': 'Outwear_036',
  }
  if (dbRecipe.outwear && outwearMap[dbRecipe.outwear]) {
    recipe.outerwear = outwearMap[dbRecipe.outwear]
  }

  // Tshirt
  const tshirtMap: Record<string, string> = {
    'tshirt_9': 'T-Shirt_009',
  }
  if (dbRecipe.tshirt && tshirtMap[dbRecipe.tshirt]) {
    recipe.tshirt = tshirtMap[dbRecipe.tshirt]
  }

  // Pants
  const pantsMap: Record<string, string> = {
    'pants_10': 'Pants_010',
    'pants_14': 'Pants_014',
    'shorts_3': 'Shorts_003',
  }
  if (dbRecipe.pants && pantsMap[dbRecipe.pants]) {
    if (dbRecipe.pants.startsWith('shorts')) {
      recipe.shorts = pantsMap[dbRecipe.pants]
    } else {
      recipe.pants = pantsMap[dbRecipe.pants]
    }
  }

  // Shoes -> shoe
  const shoeMap: Record<string, string> = {
    'slippers_2': 'Shoe_Slippers_002',
    'slippers_5': 'Shoe_Slippers_005',
    'sneakers_9': 'Shoe_Sneakers_009',
  }
  if (dbRecipe.shoes && shoeMap[dbRecipe.shoes]) {
    recipe.shoe = shoeMap[dbRecipe.shoes]
  }

  // Socks
  const socksMap: Record<string, string> = {
    'socks_8': 'Socks_008',
  }
  if (dbRecipe.socks && socksMap[dbRecipe.socks]) {
    recipe.socks = socksMap[dbRecipe.socks]
  }

  // Gloves
  const glovesMap: Record<string, string> = {
    'gloves_6': 'Gloves_006',
    'gloves_14': 'Gloves_014',
  }
  if (dbRecipe.gloves && glovesMap[dbRecipe.gloves]) {
    recipe.gloves = glovesMap[dbRecipe.gloves]
  }

  // Costume
  const costumeMap: Record<string, string> = {
    'costume_6': 'Costume_6_001',
    'costume_10': 'Costume_10_001',
  }
  if (dbRecipe.costume && costumeMap[dbRecipe.costume]) {
    recipe.costume = costumeMap[dbRecipe.costume]
  }

  // Accessories -> varios campos
  const accessoriesMap: Record<string, { field: keyof NormalCharacterRecipe; value: string }> = {
    'moustache_1': { field: 'mustache', value: 'Moustache_001' },
    'moustache_2': { field: 'mustache', value: 'Moustache_002' },
    'headphones': { field: 'headphones', value: 'Headphones_002' },
    'clown_nose': { field: 'clown_nose', value: 'Clown_nose_001' },
    'pacifier': { field: 'pacifier', value: 'Pacifier_001' },
  }
  if (dbRecipe.accessories && accessoriesMap[dbRecipe.accessories]) {
    const mapping = accessoriesMap[dbRecipe.accessories]
    recipe[mapping.field] = mapping.value
  }

  return recipe
}

// Componente de carga
function Cargando() {
  return (
    <Html center>
      <div className="text-gray-600 text-sm animate-pulse">Cargando...</div>
    </Html>
  )
}

// Escena común (iluminación, controles, piso)
function EscenaBase({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fondo oscuro elegante */}
      <color attach="background" args={['#0f0f1a']} />

      {/* Iluminación uniforme 360° */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 5, 5]} intensity={0.6} />
      <directionalLight position={[0, 5, -5]} intensity={0.6} />
      <directionalLight position={[-5, 5, 0]} intensity={0.4} />
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

      {children}

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

// Escena para Funny Pack (SkinnedCharacter)
function EscenaFunnyPack({
  recipe,
  animation,
  onLoaded
}: {
  recipe: CharacterRecipe
  animation: keyof typeof ANIMATION_MAP
  onLoaded: () => void
}) {
  return (
    <EscenaBase>
      <SkinnedCharacter
        recipe={recipe}
        animation={animation}
        position={[0, 0, 0]}
        scale={1}
        onLoaded={onLoaded}
      />
    </EscenaBase>
  )
}

// Escena para Modular Pack (NormalCharacter)
function EscenaModularPack({
  recipe,
  animation,
  onLoaded
}: {
  recipe: NormalCharacterRecipe
  animation: keyof typeof NORMAL_ANIMATION_MAP
  onLoaded: () => void
}) {
  return (
    <EscenaBase>
      <NormalCharacter
        recipe={recipe}
        animation={animation}
        position={[0, 0, 0]}
        scale={1}
        onLoaded={onLoaded}
      />
    </EscenaBase>
  )
}

// Componente principal
export function ApprovedCharacters3D() {
  const [characters, setCharacters] = useState<ContentCreation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [funnyAnimation, setFunnyAnimation] = useState<keyof typeof ANIMATION_MAP>('idle')
  const [modularAnimation, setModularAnimation] = useState<keyof typeof NORMAL_ANIMATION_MAP>('idle')
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

  // Detectar tipo de pack del personaje seleccionado
  const packType: PackType = selectedCharacter
    ? detectPackType(selectedCharacter.recipe)
    : 'funny'

  // Convertir recipe de la DB al formato apropiado según el tipo de pack
  const funnyRecipe: CharacterRecipe | null = selectedCharacter && packType === 'funny' ? {
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

  // Receta para Modular Pack
  const modularRecipe: NormalCharacterRecipe | null = selectedCharacter && packType === 'modular'
    ? mapToNormalRecipe(selectedCharacter.recipe as Record<string, string>)
    : null

  // Animaciones principales para Funny Pack
  const mainFunnyAnimations: (keyof typeof ANIMATION_MAP)[] = [
    'idle', 'walk', 'run', 'dance_1', 'dance_2', 'win', 'attack_left'
  ]

  // Animaciones principales para Modular Pack
  const mainModularAnimations: (keyof typeof NORMAL_ANIMATION_MAP)[] = [
    'idle', 'walk', 'run', 'jump_start', 'attack_punch', 'attack_kick', 'death_forward'
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
                    {/* Ícono según tipo de pack */}
                    <span title={detectPackType(char.recipe) === 'modular' ? 'Modular Pack' : 'Funny Pack'}>
                      {detectPackType(char.recipe) === 'modular' ? '🧍' : (char.recipe.full_body ? '🎭' : '😄')}
                    </span>
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600">
                Animacion:
              </label>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                packType === 'modular' ? 'bg-agua text-white' : 'bg-coral text-white'
              }`}>
                {packType === 'modular' ? 'Modular Pack' : 'Funny Pack'}
              </span>
            </div>

            {/* Animaciones para Funny Pack */}
            {packType === 'funny' && (
              <>
                <div className="grid grid-cols-4 gap-1">
                  {mainFunnyAnimations.map(anim => (
                    <button
                      key={anim}
                      onClick={() => setFunnyAnimation(anim)}
                      className={`px-2 py-1.5 text-xs rounded transition-all ${
                        funnyAnimation === anim
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
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Mas animaciones ({Object.keys(ANIMATION_MAP).length})
                  </summary>
                  <select
                    value={funnyAnimation}
                    onChange={(e) => setFunnyAnimation(e.target.value as keyof typeof ANIMATION_MAP)}
                    className="w-full mt-2 text-xs bg-white border border-gray-200 rounded px-2 py-1"
                  >
                    {Object.entries(ANIMATION_MAP).map(([key, config]) => (
                      <option key={key} value={key}>
                        {key.replace(/_/g, ' ')} ({config.duration.toFixed(1)}s)
                      </option>
                    ))}
                  </select>
                </details>
              </>
            )}

            {/* Animaciones para Modular Pack */}
            {packType === 'modular' && (
              <>
                <div className="grid grid-cols-4 gap-1">
                  {mainModularAnimations.map(anim => (
                    <button
                      key={anim}
                      onClick={() => setModularAnimation(anim)}
                      className={`px-2 py-1.5 text-xs rounded transition-all ${
                        modularAnimation === anim
                          ? 'bg-agua text-white'
                          : 'bg-white border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {anim === 'idle' ? 'Quieto' :
                       anim === 'walk' ? 'Caminar' :
                       anim === 'run' ? 'Correr' :
                       anim === 'jump_start' ? 'Saltar' :
                       anim === 'attack_punch' ? 'Golpe' :
                       anim === 'attack_kick' ? 'Patada' :
                       anim === 'death_forward' ? 'Morir' : anim}
                    </button>
                  ))}
                </div>
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Mas animaciones ({Object.keys(NORMAL_ANIMATION_MAP).length})
                  </summary>
                  <select
                    value={modularAnimation}
                    onChange={(e) => setModularAnimation(e.target.value as keyof typeof NORMAL_ANIMATION_MAP)}
                    className="w-full mt-2 text-xs bg-white border border-gray-200 rounded px-2 py-1"
                  >
                    {Object.entries(NORMAL_ANIMATION_MAP).map(([key, config]) => (
                      <option key={key} value={key}>
                        {key.replace(/_/g, ' ')} {config.loop ? '(loop)' : ''}
                      </option>
                    ))}
                  </select>
                </details>
              </>
            )}
          </div>
        )}
      </div>

      {/* Panel derecho - Canvas 3D */}
      <div className="flex-1 flex flex-col">
        {/* Canvas con fondo claro igual a Character3DCreator */}
        <div className="flex-1 relative">
          {(funnyRecipe || modularRecipe) ? (
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
                {/* Escena para Funny Pack */}
                {packType === 'funny' && funnyRecipe && (
                  <EscenaFunnyPack
                    recipe={funnyRecipe}
                    animation={funnyAnimation}
                    onLoaded={() => setIsLoaded(true)}
                  />
                )}
                {/* Escena para Modular Pack */}
                {packType === 'modular' && modularRecipe && (
                  <EscenaModularPack
                    recipe={modularRecipe}
                    animation={modularAnimation}
                    onLoaded={() => setIsLoaded(true)}
                  />
                )}
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
          {(funnyRecipe || modularRecipe) && !isLoaded && (
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
              {packType === 'modular'
                ? modularAnimation.replace(/_/g, ' ')
                : funnyAnimation.replace(/_/g, ' ')
              }
            </div>
          )}
        </div>

        {/* Info adicional */}
        {selectedCharacter && (
          <div className="bg-white border-t border-gray-200 p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Creado por: {selectedCharacter.creator_name}</span>
              <span>
                {packType === 'modular'
                  ? `Modular: ${Object.values(selectedCharacter.recipe).filter(Boolean).length} partes`
                  : selectedCharacter.recipe.full_body
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
