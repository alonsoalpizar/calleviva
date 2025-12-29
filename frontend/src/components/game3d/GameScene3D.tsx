// GameScene3D.tsx - Complete 3D game scene with location and gameplay
// Combines Location3D, Customers, and game loop

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html, Sky, useGLTF } from '@react-three/drei'
import { LOCATIONS, LocationConfig } from './Location3D'
import { AnimatedCustomer } from './GLTFModels'
import { Customer3DState } from './types'

// Complete City Scene Model
const CityScene: React.FC<{
  position?: [number, number, number]
  scale?: number
}> = ({ position = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF('/assets/models/City/Cartoon_City_Free.glb')

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
    />
  )
}

// Loading component
const Loader = () => (
  <Html center>
    <div className="bg-black/80 text-white text-xl font-bold px-6 py-4 rounded-xl animate-pulse">
      Cargando escena...
    </div>
  </Html>
)

// Game state
interface GameState {
  money: number
  dayNumber: number
  time: number // 8-18 (8am to 6pm)
  weather: 'sunny' | 'cloudy' | 'rainy'
  customers: Customer3DState[]
  sales: number
}

// Generate customer at spawn point
const generateCustomer = (id: string, spawnPoints: [number, number, number][], targetPoint: [number, number, number]): Customer3DState => {
  const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)]
  return {
    id,
    position: { x: spawnPoint[0], y: spawnPoint[1], z: spawnPoint[2] },
    targetPosition: { x: targetPoint[0], y: targetPoint[1], z: targetPoint[2] },
    state: 'walking',
    satisfaction: 0.5 + Math.random() * 0.5,
    order: null,
  }
}

// HUD Component
const GameHUD: React.FC<{
  state: GameState
  location: LocationConfig
  playing: boolean
  speed: number
  onPlayPause: () => void
  onSpeedChange: (speed: number) => void
}> = ({ state, location, playing, speed, onPlayPause, onSpeedChange }) => {
  const formatTime = (time: number) => {
    const hours = Math.floor(time)
    const minutes = Math.floor((time % 1) * 60)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Stats */}
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3">
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-lg">₡{state.money.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="font-semibold">Día {state.dayNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              <span className="font-semibold">{formatTime(state.time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <span className="font-semibold">{state.sales} ventas</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">📍</span>
            <div>
              <div className="font-bold">{location.name}</div>
              <div className="text-xs text-gray-300">{location.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="bg-black/60 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center text-2xl hover:bg-black/80 transition-colors text-white"
        >
          {playing ? '⏸️' : '▶️'}
        </button>

        {/* Speed controls */}
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-2 flex gap-1">
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-4 py-2 rounded-full font-bold transition-colors ${
                speed === s
                  ? 'bg-coral text-white'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Customer queue */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 pointer-events-auto">
        <div className="flex items-center gap-2 text-white">
          <span className="text-2xl">👥</span>
          <span className="font-bold">{state.customers.length} en cola</span>
        </div>
      </div>
    </div>
  )
}

// 3D Scene
const Scene: React.FC<{
  locationId: string
  state: GameState
  onCustomerReachTarget: (id: string) => void
}> = ({ locationId, state, onCustomerReachTarget }) => {
  const config = LOCATIONS[locationId] || LOCATIONS.universidad

  // Calculate sun position based on time
  const sunPosition = React.useMemo(() => {
    const progress = (state.time - 6) / 12 // 6am to 6pm
    const angle = progress * Math.PI
    return [
      Math.cos(angle) * 50,
      Math.sin(angle) * 40 + 10,
      30
    ] as [number, number, number]
  }, [state.time])

  // Sky color based on time
  const skyParams = React.useMemo(() => {
    if (state.time < 7) return { turbidity: 10, rayleigh: 3 } // Dawn
    if (state.time < 10) return { turbidity: 8, rayleigh: 2 } // Morning
    if (state.time < 16) return { turbidity: 10, rayleigh: 0.5 } // Midday
    if (state.time < 18) return { turbidity: 10, rayleigh: 3 } // Evening
    return { turbidity: 10, rayleigh: 4 } // Dusk
  }, [state.time])

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[80, 60, 80]}
        fov={60}
      />

      {/* Controls */}
      <OrbitControls
        target={[0, 0, 0]}
        minDistance={5}
        maxDistance={300}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 10}
      />

      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={sunPosition}
        turbidity={skyParams.turbidity}
        rayleigh={skyParams.rayleigh}
      />

      {/* Lighting */}
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={sunPosition}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <hemisphereLight
        args={['#87CEEB', '#3d5c3d', 0.3]}
      />

      {/* Complete City Scene */}
      <Suspense fallback={null}>
        <CityScene position={[0, 0, 0]} scale={1} />
      </Suspense>

      {/* Customers */}
      {state.customers.map((customer) => (
        <AnimatedCustomer
          key={customer.id}
          id={customer.id}
          position={[customer.position.x, customer.position.y, customer.position.z]}
          targetPosition={[
            customer.targetPosition.x,
            customer.targetPosition.y,
            customer.targetPosition.z,
          ]}
          state={customer.state}
          onReachTarget={onCustomerReachTarget}
        />
      ))}
    </>
  )
}

// Main Component
export const GameScene3D: React.FC<{
  locationId?: string
  initialMoney?: number
  initialDay?: number
}> = ({
  locationId = 'universidad',
  initialMoney = 15000,
  initialDay = 1,
}) => {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [state, setState] = useState<GameState>({
    customers: [],
    time: 8,
    weather: 'sunny',
    money: initialMoney,
    dayNumber: initialDay,
    sales: 0,
  })

  const customerIdCounter = useRef(0)
  const config = LOCATIONS[locationId] || LOCATIONS.universidad

  // Game loop - advance time
  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      setState((prev) => {
        let newTime = prev.time + (0.01 * speed)

        // End day at 6 PM
        if (newTime >= 18) {
          setPlaying(false)
          return { ...prev, time: 18 }
        }

        return { ...prev, time: newTime }
      })
    }, 50)

    return () => clearInterval(interval)
  }, [playing, speed])

  // Spawn customers
  useEffect(() => {
    if (!playing) return

    const spawnInterval = setInterval(() => {
      if (state.customers.length < 8 && Math.random() < 0.4) {
        customerIdCounter.current += 1
        const newId = customerIdCounter.current

        setState((prevState) => ({
          ...prevState,
          customers: [
            ...prevState.customers,
            generateCustomer(
              `customer-${newId}`,
              config.customerSpawnPoints,
              config.customerTargetPoint
            ),
          ],
        }))
      }
    }, 2000 / speed)

    return () => clearInterval(spawnInterval)
  }, [playing, speed, state.customers.length, config])

  // Handle customer reaching truck
  const handleCustomerReachTarget = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === id ? { ...c, state: 'ordering' as const } : c
      ),
    }))

    // Serve customer after delay
    setTimeout(() => {
      setState((prev) => {
        const customer = prev.customers.find((c) => c.id === id)
        if (!customer || customer.state !== 'ordering') return prev

        const saleAmount = 2000 + Math.floor(Math.random() * 2000)

        return {
          ...prev,
          money: prev.money + saleAmount,
          sales: prev.sales + 1,
          customers: prev.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  state: 'leaving' as const,
                  targetPosition: {
                    x: (Math.random() - 0.5) * 20,
                    y: 0,
                    z: 15
                  },
                }
              : c
          ),
        }
      })

      // Remove customer after leaving
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          customers: prev.customers.filter((c) => c.id !== id),
        }))
      }, 3000)
    }, 2000 / speed)
  }, [speed])

  // Start next day
  const startNextDay = () => {
    setState((prev) => ({
      ...prev,
      time: 8,
      dayNumber: prev.dayNumber + 1,
      customers: [],
      sales: 0,
    }))
    setPlaying(true)
  }

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <Scene
            locationId={locationId}
            state={state}
            onCustomerReachTarget={handleCustomerReachTarget}
          />
        </Suspense>
      </Canvas>

      {/* HUD */}
      <GameHUD
        state={state}
        location={config}
        playing={playing}
        speed={speed}
        onPlayPause={() => setPlaying(!playing)}
        onSpeedChange={setSpeed}
      />

      {/* Start screen */}
      {!playing && state.time === 8 && state.dayNumber === initialDay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-md text-center text-white">
            <div className="text-6xl mb-4">📍</div>
            <h1 className="text-3xl font-bold mb-2">{config.name}</h1>
            <p className="text-gray-300 mb-6">{config.description}</p>
            <div className="text-sm text-gray-400 mb-6">
              Arrastrá para rotar • Scroll para zoom
            </div>
            <button
              onClick={() => setPlaying(true)}
              className="bg-coral hover:bg-coral/80 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors"
            >
              ▶️ Iniciar Día {state.dayNumber}
            </button>
          </div>
        </div>
      )}

      {/* Pause menu */}
      {!playing && state.time > 8 && state.time < 18 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-md text-center text-white">
            <h1 className="text-3xl font-bold mb-4">⏸️ Pausado</h1>
            <button
              onClick={() => setPlaying(true)}
              className="bg-coral hover:bg-coral/80 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors"
            >
              ▶️ Continuar
            </button>
          </div>
        </div>
      )}

      {/* Day end screen */}
      {!playing && state.time >= 18 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 max-w-md text-center text-white">
            <div className="text-6xl mb-4">🌅</div>
            <h1 className="text-3xl font-bold mb-4">Fin del Día {state.dayNumber}</h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-1">💰</div>
                <div className="text-2xl font-bold">₡{state.money.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-1">🛒</div>
                <div className="text-2xl font-bold">{state.sales}</div>
                <div className="text-xs text-gray-400">Ventas hoy</div>
              </div>
            </div>
            <button
              onClick={startNextDay}
              className="bg-coral hover:bg-coral/80 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors"
            >
              Siguiente Día →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Preload city scene
useGLTF.preload('/assets/models/City/Cartoon_City_Free.glb')

export default GameScene3D
