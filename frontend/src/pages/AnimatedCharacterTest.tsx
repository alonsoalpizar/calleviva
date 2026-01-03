import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import {
  AnimatedCharacter,
  ANIMATION_MAP,
  ATTACHMENT_BONES,
  BODY_COLORS
} from '../components/game3d/AnimatedCharacter'

// Lista de accesorios disponibles para prueba
const AVAILABLE_ACCESSORIES = {
  hats: [
    'Hat_001', 'Hat_002', 'Hat_003', 'Hat_004', 'Hat_005',
    'Hat_010', 'Hat_020', 'Hat_030', 'Hat_040', 'Hat_050'
  ],
  glasses: [
    'Glasses_001', 'Glasses_002', 'Glasses_003', 'Glasses_004', 'Glasses_005'
  ],
  backpacks: [
    'Backpack_001', 'Backpack_002', 'Backpack_003', 'Backpack_004', 'Backpack_005'
  ]
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white bg-black/50 px-4 py-2 rounded">
        Cargando personaje...
      </div>
    </Html>
  )
}

export default function AnimatedCharacterTest() {
  const [animation, setAnimation] = useState<keyof typeof ANIMATION_MAP>('idle')
  const [bodyColor, setBodyColor] = useState('blue')
  const [selectedHat, setSelectedHat] = useState<string | null>(null)
  const [selectedGlasses, setSelectedGlasses] = useState<string | null>(null)
  const [selectedBackpack, setSelectedBackpack] = useState<string | null>(null)
  const [hatOffset, setHatOffset] = useState<[number, number, number]>([0, 0.5, 0])
  const [isLoaded, setIsLoaded] = useState(false)

  // Construir lista de accesorios
  const accessories = []
  if (selectedHat) {
    accessories.push({
      slot: 'head' as const,
      modelPath: `/assets/models/funny_characters_pack/Assets_glb/Hat/${selectedHat}.glb`,
      offset: hatOffset,
      scale: 1
    })
  }
  if (selectedGlasses) {
    accessories.push({
      slot: 'head' as const,
      modelPath: `/assets/models/funny_characters_pack/Assets_glb/Glasses/${selectedGlasses}.glb`,
      offset: [0, 0.3, 0.2] as [number, number, number],
      scale: 1
    })
  }
  if (selectedBackpack) {
    accessories.push({
      slot: 'back' as const,
      modelPath: `/assets/models/funny_characters_pack/Assets_glb/Backpack/${selectedBackpack}.glb`,
      offset: [0, 0, -0.3] as [number, number, number],
      scale: 1
    })
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex">
      {/* Panel de control */}
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto text-white">
        <h1 className="text-xl font-bold mb-4 text-orange-400">
          Animated Character Test
        </h1>

        <p className="text-sm text-gray-400 mb-4">
          Personaje animado con 24 animaciones.
          Cambia el color y agrega accesorios.
        </p>

        {/* Selector de color del cuerpo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Color del cuerpo:</label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(BODY_COLORS).map(([name, hex]) => (
              <button
                key={name}
                onClick={() => setBodyColor(name)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  bodyColor === name
                    ? 'border-white scale-110'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                style={{ backgroundColor: hex }}
                title={name}
              />
            ))}
          </div>
        </div>

        <hr className="border-gray-600 my-4" />

        {/* Selector de animacion */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Animacion:</label>
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

        {/* Botones rapidos de animacion */}
        <div className="mb-4 grid grid-cols-3 gap-1">
          {['idle', 'walk', 'run', 'dance_1', 'dance_2', 'win'].map(anim => (
            <button
              key={anim}
              onClick={() => setAnimation(anim as keyof typeof ANIMATION_MAP)}
              className={`px-2 py-1 text-xs rounded ${
                animation === anim
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {anim.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-1">
          {['jump_idle_start', 'attack_left', 'death_idle'].map(anim => (
            <button
              key={anim}
              onClick={() => setAnimation(anim as keyof typeof ANIMATION_MAP)}
              className={`px-2 py-1 text-xs rounded ${
                animation === anim
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {anim.split('_')[0]}
            </button>
          ))}
        </div>

        <hr className="border-gray-600 my-4" />

        {/* Accesorios */}
        <h2 className="text-lg font-semibold mb-3 text-orange-300">Accesorios</h2>

        {/* Hat */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Sombrero:</label>
          <select
            value={selectedHat || ''}
            onChange={(e) => setSelectedHat(e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Ninguno</option>
            {AVAILABLE_ACCESSORIES.hats.map(hat => (
              <option key={hat} value={hat}>{hat}</option>
            ))}
          </select>
        </div>

        {/* Offset del sombrero */}
        {selectedHat && (
          <div className="mb-3 pl-2 border-l-2 border-orange-500">
            <label className="block text-xs text-gray-400 mb-1">Offset Y del sombrero:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hatOffset[1]}
              onChange={(e) => setHatOffset([0, parseFloat(e.target.value), 0])}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{hatOffset[1].toFixed(2)}</span>
          </div>
        )}

        {/* Glasses */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Lentes:</label>
          <select
            value={selectedGlasses || ''}
            onChange={(e) => setSelectedGlasses(e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Ninguno</option>
            {AVAILABLE_ACCESSORIES.glasses.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Backpack */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Mochila:</label>
          <select
            value={selectedBackpack || ''}
            onChange={(e) => setSelectedBackpack(e.target.value || null)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Ninguno</option>
            {AVAILABLE_ACCESSORIES.backpacks.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <hr className="border-gray-600 my-4" />

        {/* Info */}
        <div className="text-xs text-gray-400">
          <p className="mb-2">
            <strong>Estado:</strong> {isLoaded ? 'Cargado' : 'Cargando...'}
          </p>
          <p className="mb-2">
            <strong>Huesos disponibles:</strong>
          </p>
          <ul className="list-disc pl-4">
            {Object.entries(ATTACHMENT_BONES).map(([slot, bone]) => (
              <li key={slot}>{slot}: {bone}</li>
            ))}
          </ul>
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

          {/* Luces */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff9900" />

          {/* Personaje Animado */}
          <Suspense fallback={<LoadingFallback />}>
            <AnimatedCharacter
              key={bodyColor} // Re-montar al cambiar color
              animation={animation}
              bodyColor={bodyColor}
              accessories={accessories}
              position={[0, 0, 0]}
              scale={1}
              onLoaded={() => setIsLoaded(true)}
            />
          </Suspense>

          {/* Piso con sombra */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />

          {/* Grid de referencia */}
          <gridHelper args={[10, 10, '#444', '#333']} />

          {/* Controles de camara */}
          <OrbitControls
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2}
            enableDamping
            dampingFactor={0.05}
          />

          {/* Ambiente */}
          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  )
}
