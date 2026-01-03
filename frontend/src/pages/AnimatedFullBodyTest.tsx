import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import {
  AnimatedFullBody,
  ANIMATION_MAP,
  FULL_BODY_CHARACTERS
} from '../components/game3d/AnimatedFullBody'

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white bg-black/50 px-4 py-2 rounded">
        Cargando personaje...
      </div>
    </Html>
  )
}

export default function AnimatedFullBodyTest() {
  const [animation, setAnimation] = useState<keyof typeof ANIMATION_MAP>('idle')
  const [character, setCharacter] = useState('Alien_001')
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex">
      {/* Panel de control */}
      <div className="w-80 bg-gray-800 p-4 overflow-y-auto text-white">
        <h1 className="text-xl font-bold mb-4 text-green-400">
          Full Body Animated Test
        </h1>

        <p className="text-sm text-gray-400 mb-4">
          Personajes Full_Body con animaciones transferidas.
          Estos modelos tienen skinning + las animaciones filtradas de DEF- bones.
        </p>

        {/* Selector de personaje */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Personaje:</label>
          <select
            value={character}
            onChange={(e) => {
              setIsLoaded(false)
              setCharacter(e.target.value)
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {FULL_BODY_CHARACTERS.map(char => (
              <option key={char} value={char}>{char.replace('_001', '').replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Grid de personajes */}
        <div className="mb-4 grid grid-cols-4 gap-1">
          {FULL_BODY_CHARACTERS.slice(0, 8).map(char => (
            <button
              key={char}
              onClick={() => {
                setIsLoaded(false)
                setCharacter(char)
              }}
              className={`px-1 py-1 text-xs rounded truncate ${
                character === char
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={char}
            >
              {char.split('_')[0].slice(0, 6)}
            </button>
          ))}
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
                  ? 'bg-green-500 text-white'
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
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {anim.split('_')[0]}
            </button>
          ))}
        </div>

        <hr className="border-gray-600 my-4" />

        {/* Info */}
        <div className="text-xs text-gray-400">
          <p className="mb-2">
            <strong>Estado:</strong> {isLoaded ? 'Cargado' : 'Cargando...'}
          </p>
          <p className="mb-2">
            <strong>Personaje:</strong> {character}
          </p>
          <p className="mb-2">
            <strong>Metodo:</strong> Full_Body + animaciones DEF- filtradas
          </p>
          <p className="text-yellow-400 mt-4">
            Si funciona, estos personajes tienen su apariencia unica
            con todas las 24 animaciones del pack.
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
          <color attach="background" args={['#1a2e1a']} />

          {/* Luces */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00ff99" />

          {/* Personaje Animado Full Body */}
          <Suspense fallback={<LoadingFallback />}>
            <AnimatedFullBody
              key={character} // Re-montar al cambiar personaje
              character={character}
              animation={animation}
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
          <gridHelper args={[10, 10, '#446644', '#335533']} />

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
          <Environment preset="forest" />
        </Canvas>
      </div>
    </div>
  )
}
