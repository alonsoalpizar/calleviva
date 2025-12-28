// Game3DDemo.tsx - Complete 3D game demo with isometric view
// Combines truck, customers, environment, and game loop

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import { FoodTruck3D } from './FoodTruck3D'
import { Customer3D } from './Customer3D'
import { Environment3D } from './Environment3D'
import { AnimatedCustomer, Parrot } from './GLTFModels'
import { generateCustomer3D, Game3DState } from './types'

// Loading component
const Loader = () => (
  <Html center>
    <div className="text-white text-xl font-bold animate-pulse">Cargando...</div>
  </Html>
)

// HUD Overlay
const GameHUD: React.FC<{
  state: Game3DState
  playing: boolean
  speed: number
  onPlayPause: () => void
  onSpeedChange: (speed: number) => void
}> = ({ state, playing, speed, onPlayPause, onSpeedChange }) => (
  <div className="absolute inset-0 pointer-events-none">
    {/* Top bar */}
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
      {/* Stats */}
      <div className="glass-panel rounded-xl px-4 py-3">
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
            <span className="font-semibold">
              {Math.floor(state.time)}:{String(Math.floor((state.time % 1) * 60)).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="glass-panel rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <span className="text-2xl">🏫</span>
          <span className="font-bold">Universidad</span>
        </div>
      </div>
    </div>

    {/* Bottom controls */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="glass-panel rounded-full w-14 h-14 flex items-center justify-center text-2xl hover:bg-white/30 transition-colors"
      >
        {playing ? '⏸️' : '▶️'}
      </button>

      {/* Speed controls */}
      <div className="glass-panel rounded-full px-2 py-2 flex gap-1">
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

    {/* Customer queue indicator */}
    <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-3 pointer-events-auto">
      <div className="flex items-center gap-2 text-white">
        <span className="text-2xl">👥</span>
        <span className="font-bold">{state.customers.length} en cola</span>
      </div>
    </div>
  </div>
)

// Main 3D Scene
const Scene: React.FC<{
  state: Game3DState
  onCustomerReachTarget: (id: string) => void
  onTruckClick: () => void
  useGLTFModels: boolean
}> = ({ state, onCustomerReachTarget, onTruckClick, useGLTFModels }) => (
  <>
    {/* Camera with isometric-like angle */}
    <PerspectiveCamera
      makeDefault
      position={[10, 8, 10]}
      fov={50}
    />

    {/* Orbit controls for exploration */}
    <OrbitControls
      target={[0, 0, 0]}
      minDistance={5}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 6}
    />

    {/* Environment */}
    <Environment3D timeOfDay={state.time} weather={state.weather} />

    {/* Food Truck */}
    <FoodTruck3D
      position={[state.truck.position.x, state.truck.position.y, state.truck.position.z]}
      rotation={state.truck.rotation}
      color={state.truck.color}
      name={state.truck.name}
      open={state.truck.open}
      onTruckClick={onTruckClick}
    />

    {/* Parrot - GLTF Model flying around */}
    {useGLTFModels && <Parrot position={[0, 4, 0]} scale={0.02} />}

    {/* Customers - GLTF or Geometry based */}
    {state.customers.map((customer) =>
      useGLTFModels ? (
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
      ) : (
        <Customer3D
          key={customer.id}
          customer={customer}
          onReachTarget={onCustomerReachTarget}
        />
      )
    )}
  </>
)

// Main Demo Component
export const Game3DDemo: React.FC = () => {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [useGLTFModels, setUseGLTFModels] = useState(true) // Toggle GLTF models
  const [state, setState] = useState<Game3DState>({
    customers: [],
    truck: {
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      color: '#FF6B6B',
      name: 'Mi Carrito',
      open: true,
    },
    time: 8, // 8 AM
    weather: 'sunny',
    money: 18500,
    dayNumber: 1,
  })

  const customerIdCounter = useRef(0)

  // Game loop
  useEffect(() => {
    if (!playing) return

    const interval = setInterval(() => {
      setState((prev) => {
        let newTime = prev.time + (0.01 * speed) // Time advances

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
      if (state.customers.length < 6 && Math.random() < 0.3) {
        customerIdCounter.current += 1
        const newId = customerIdCounter.current
        setState((prevState) => ({
          ...prevState,
          customers: [
            ...prevState.customers,
            generateCustomer3D(`customer-${newId}`),
          ],
        }))
      }
    }, 2000 / speed)

    return () => clearInterval(spawnInterval)
  }, [playing, speed, state.customers.length])

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

        const saleAmount = 2500 + Math.floor(Math.random() * 1500)

        return {
          ...prev,
          money: prev.money + saleAmount,
          customers: prev.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  state: 'leaving' as const,
                  targetPosition: { x: (Math.random() - 0.5) * 10, y: 0, z: 10 },
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

  const handleTruckClick = useCallback(() => {
    console.log('Truck clicked!')
  }, [])

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={<Loader />}>
          <Scene
            state={state}
            onCustomerReachTarget={handleCustomerReachTarget}
            onTruckClick={handleTruckClick}
            useGLTFModels={useGLTFModels}
          />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <GameHUD
        state={state}
        playing={playing}
        speed={speed}
        onPlayPause={() => setPlaying(!playing)}
        onSpeedChange={setSpeed}
      />

      {/* GLTF Toggle */}
      <div className="absolute top-20 left-4 pointer-events-auto">
        <button
          onClick={() => setUseGLTFModels(!useGLTFModels)}
          className={`glass-panel rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            useGLTFModels ? 'bg-green-500/50 text-white' : 'text-white/70'
          }`}
        >
          {useGLTFModels ? '🎮 GLTF Models' : '📦 Geometry'}
        </button>
      </div>

      {/* Instructions */}
      {!playing && state.time === 8 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="glass-panel rounded-2xl p-8 max-w-md text-center text-white">
            <h1 className="text-3xl font-bold mb-4">CalleViva 3D</h1>
            <p className="text-lg mb-2">Arrastrá para rotar la cámara</p>
            <p className="text-lg mb-6">Scroll para zoom</p>
            <button
              onClick={() => setPlaying(true)}
              className="bg-coral hover:bg-coral/80 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors"
            >
              ▶️ Iniciar Día
            </button>
          </div>
        </div>
      )}

      {/* Day end screen */}
      {!playing && state.time >= 18 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="glass-panel rounded-2xl p-8 max-w-md text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Fin del Día {state.dayNumber}</h1>
            <p className="text-2xl mb-2">💰 ₡{state.money.toLocaleString()}</p>
            <button
              onClick={() => {
                setState((prev) => ({
                  ...prev,
                  time: 8,
                  dayNumber: prev.dayNumber + 1,
                  customers: [],
                }))
                setPlaying(true)
              }}
              className="mt-6 bg-coral hover:bg-coral/80 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors"
            >
              Siguiente Día →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Game3DDemo
