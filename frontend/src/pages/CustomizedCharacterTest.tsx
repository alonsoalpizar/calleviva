import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import {
  CustomizedAnimatedCharacter,
  ANIMATION_MAP,
  BODY_COLORS,
  CharacterRecipe
} from '../components/game3d/CustomizedAnimatedCharacter'

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white bg-black/50 px-4 py-2 rounded">
        Cargando personaje...
      </div>
    </Html>
  )
}

// Opciones de assets para probar
const ASSET_OPTIONS = {
  body: ['body_blue_1', 'body_red_1', 'body_orange_1', 'body_white_1', 'body_yellow_1', 'body_brown_1'],
  hair: Array.from({ length: 10 }, (_, i) => `hair_${i + 1}`),
  hat: Array.from({ length: 10 }, (_, i) => `hat_${i + 1}`),
  glasses: Array.from({ length: 10 }, (_, i) => `glasses_${i + 1}`),
  eyebrow: Array.from({ length: 5 }, (_, i) => `eyebrow_${i + 1}`),
  mustache: ['mustache_black_1', 'mustache_black_2', 'mustache_brown_1', 'mustache_white_1'],
  outerwear: ['outerwear_black_1', 'outerwear_blue_1', 'outerwear_red_1', 'outerwear_green_1'],
  pants: ['pants_black_1', 'pants_blue_1', 'pants_brown_1', 'pants_green_1'],
  shoe: ['shoe_sneaker_1', 'shoe_sneaker_2', 'shoe_boot_1', 'shoe_slipper_1'],
  backpack: ['backpack_1', 'backpack_2', 'backpack_3'],
}

export default function CustomizedCharacterTest() {
  const [animation, setAnimation] = useState<keyof typeof ANIMATION_MAP>('idle')
  const [isLoaded, setIsLoaded] = useState(false)
  const [recipe, setRecipe] = useState<CharacterRecipe>({
    body: 'body_blue_1',
    hair: 'hair_5',
    hat: undefined,
    glasses: undefined,
    outerwear: 'outerwear_black_1',
    pants: 'pants_blue_1',
    shoe: 'shoe_sneaker_1',
    backpack: 'backpack_1',
  })

  const updateRecipe = (key: keyof CharacterRecipe, value: string | undefined) => {
    setRecipe(prev => ({ ...prev, [key]: value }))
  }

  // Key para forzar re-render cuando cambia la receta
  const characterKey = JSON.stringify(recipe)

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex">
      {/* Panel de control */}
      <div className="w-96 bg-gray-800 p-4 overflow-y-auto text-white">
        <h1 className="text-xl font-bold mb-2 text-coral">
          Personaje Customizado Animado
        </h1>

        <p className="text-xs text-gray-400 mb-4">
          Prueba de concepto: base animada + accesorios del Creator.
          Los accesorios de cabeza siguen el movimiento.
        </p>

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

        {/* Botones rápidos de animación */}
        <div className="mb-4 grid grid-cols-3 gap-1">
          {['idle', 'walk', 'run', 'dance_1', 'win', 'jump_idle_start'].map(anim => (
            <button
              key={anim}
              onClick={() => setAnimation(anim as keyof typeof ANIMATION_MAP)}
              className={`px-2 py-1 text-xs rounded ${
                animation === anim
                  ? 'bg-coral text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {anim.replace(/_/g, ' ').slice(0, 8)}
            </button>
          ))}
        </div>

        <hr className="border-gray-600 my-4" />

        <h2 className="text-lg font-semibold mb-3 text-mango">Customización</h2>

        {/* Color del cuerpo */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Color del Cuerpo:</label>
          <div className="grid grid-cols-6 gap-1">
            {ASSET_OPTIONS.body.map(body => {
              const colorName = body.replace('body_', '').split('_')[0]
              const hex = BODY_COLORS[colorName] || '#888'
              return (
                <button
                  key={body}
                  onClick={() => updateRecipe('body', body)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    recipe.body === body ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={colorName}
                />
              )
            })}
          </div>
        </div>

        {/* Hair */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Peinado:</label>
          <select
            value={recipe.hair || ''}
            onChange={(e) => updateRecipe('hair', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.hair.map(h => (
              <option key={h} value={h}>Hair {h.split('_')[1]}</option>
            ))}
          </select>
        </div>

        {/* Hat */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Sombrero:</label>
          <select
            value={recipe.hat || ''}
            onChange={(e) => updateRecipe('hat', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.hat.map(h => (
              <option key={h} value={h}>Hat {h.split('_')[1]}</option>
            ))}
          </select>
        </div>

        {/* Glasses */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Lentes:</label>
          <select
            value={recipe.glasses || ''}
            onChange={(e) => updateRecipe('glasses', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.glasses.map(g => (
              <option key={g} value={g}>Glasses {g.split('_')[1]}</option>
            ))}
          </select>
        </div>

        {/* Mustache */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Bigote:</label>
          <select
            value={recipe.mustache || ''}
            onChange={(e) => updateRecipe('mustache', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.mustache.map(m => (
              <option key={m} value={m}>{m.replace('mustache_', '').replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-600 my-3" />

        {/* Outerwear */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Ropa (estática):</label>
          <select
            value={recipe.outerwear || ''}
            onChange={(e) => updateRecipe('outerwear', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.outerwear.map(o => (
              <option key={o} value={o}>{o.replace('outerwear_', '').replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Pants */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Pantalón (estático):</label>
          <select
            value={recipe.pants || ''}
            onChange={(e) => updateRecipe('pants', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.pants.map(p => (
              <option key={p} value={p}>{p.replace('pants_', '').replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Shoes */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Zapatos (estático):</label>
          <select
            value={recipe.shoe || ''}
            onChange={(e) => updateRecipe('shoe', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.shoe.map(s => (
              <option key={s} value={s}>{s.replace('shoe_', '').replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Backpack */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Mochila:</label>
          <select
            value={recipe.backpack || ''}
            onChange={(e) => updateRecipe('backpack', e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            <option value="">Ninguno</option>
            {ASSET_OPTIONS.backpack.map(b => (
              <option key={b} value={b}>Backpack {b.split('_')[1]}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-600 my-4" />

        {/* Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p><strong>Estado:</strong> {isLoaded ? '✅ Cargado' : '⏳ Cargando...'}</p>
          <p className="text-yellow-400 mt-2">
            Nota: La ropa (Outerwear, Pants, Shoes) es estática.
            Solo los accesorios de cabeza siguen la animación.
          </p>
        </div>
      </div>

      {/* Canvas 3D */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ position: [3, 2, 5], fov: 50 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#1a1a2e']} />

          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff6b6b" />

          <Suspense fallback={<LoadingFallback />}>
            <CustomizedAnimatedCharacter
              key={characterKey}
              recipe={recipe}
              animation={animation}
              position={[0, 0, 0]}
              scale={1}
              onLoaded={() => setIsLoaded(true)}
            />
          </Suspense>

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />

          <gridHelper args={[10, 10, '#444', '#333']} />

          <OrbitControls
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2}
            enableDamping
            dampingFactor={0.05}
          />

          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  )
}
