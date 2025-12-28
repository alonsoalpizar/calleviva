// GameSimulationDemo.tsx - Demo completo de simulación estilo premium
// Incluye game loop, clientes, ventas, y toda la lógica del mock
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import PremiumLocationScene from './PremiumLocationScene'
import SimulationHUD from './SimulationHUD'
import { generateRandomCustomer } from './CustomerQueue'
import { UNIVERSIDAD_LOCATION, getLocation } from './locations'
import {
  SimulationState,
  Weather,
  GameEvent,
  Product,
  InventoryItem,
  TruckConfig,
  getTimeOfDay,
} from './types'

// Productos demo
const DEMO_PRODUCTS: Record<string, Product> = {
  gallo_pinto: {
    code: 'gallo_pinto',
    name: 'Pinto',
    emoji: '🍳',
    price: 2500,
    cost: 800,
    prepTime: 3,
  },
  empanada: {
    code: 'empanada',
    name: 'Empanada',
    emoji: '🥟',
    price: 1500,
    cost: 400,
    prepTime: 2,
  },
  agua_dulce: {
    code: 'agua_dulce',
    name: 'Agua Dulce',
    emoji: '☕',
    price: 1000,
    cost: 200,
    prepTime: 1,
  },
}

// Truck config demo
const DEMO_TRUCK: TruckConfig = {
  asset: { type: 'emoji', source: '🚚', scale: 1 },
  name: 'Mi Carrito',
  level: 1,
  capacity: 20,
  speed: 1.0,
  stats: { capacity: 25, speed: 50, appeal: 30 },
}

// Estado inicial
const INITIAL_STATE: SimulationState = {
  playing: false,
  speed: 5,
  time: { hour: 6, minute: 0 },
  dayNumber: 1,
  money: 18500,
  sales: 0,
  revenue: 0,
  customersServed: 0,
  customersLost: 0,
  inventory: {
    gallo_pinto: 8,
    empanada: 15,
    agua_dulce: 20,
  },
  customersInQueue: [],
  location: UNIVERSIDAD_LOCATION,
}

interface GameSimulationDemoProps {
  locationCode?: string
  initialMoney?: number
  dayNumber?: number
}

export const GameSimulationDemo: React.FC<GameSimulationDemoProps> = ({
  locationCode: propLocationCode,
  initialMoney = 18500,
  dayNumber = 1,
}) => {
  // Obtener locationCode de URL o props
  const params = useParams<{ locationCode?: string }>()
  const locationCode = propLocationCode || params.locationCode || 'ucr'

  // Estado del juego
  const [state, setState] = useState<SimulationState>({
    ...INITIAL_STATE,
    location: getLocation(locationCode),
    money: initialMoney,
    dayNumber,
  })

  // Eventos del log
  const [events, setEvents] = useState<GameEvent[]>([])

  // Clima (podría variar durante el día)
  const [weather] = useState<Weather>('sunny')

  // Ref para el game loop
  const loopRef = useRef<number | null>(null)

  // Agregar evento al log
  const addEvent = useCallback((event: Omit<GameEvent, 'timestamp'>) => {
    setState((prev) => {
      const newEvent: GameEvent = {
        ...event,
        timestamp: prev.time,
      }
      setEvents((prevEvents) => [newEvent, ...prevEvents.slice(0, 14)])
      return prev
    })
  }, [])

  // Toggle play/pause
  const toggleGame = useCallback(() => {
    setState((prev) => {
      const newPlaying = !prev.playing

      if (newPlaying) {
        addEvent({
          type: 'special',
          message: '¡El día comienza!',
          icon: '🌅',
          color: 'green',
        })
      } else {
        addEvent({
          type: 'special',
          message: 'Día pausado',
          icon: '⏸️',
          color: 'yellow',
        })
      }

      return { ...prev, playing: newPlaying }
    })
  }, [addEvent])

  // Cambiar velocidad
  const setSpeed = useCallback((speed: 1 | 2 | 5) => {
    setState((prev) => ({ ...prev, speed }))
  }, [])

  // Calcular spawn rate según hora
  const getSpawnChance = useCallback(
    (hour: number): number => {
      let chance = state.location.baseCustomerRate

      // Aplicar multiplicadores de rush hours
      for (const rush of state.location.rushHours) {
        if (hour >= rush.start && hour <= rush.end) {
          chance *= rush.multiplier
          break
        }
      }

      return chance
    },
    [state.location]
  )

  // Spawn customer
  const spawnCustomer = useCallback(() => {
    setState((prev) => {
      if (prev.customersInQueue.length >= 6) return prev

      const newCustomer = generateRandomCustomer()
      newCustomer.state = 'waiting'

      addEvent({
        type: 'customer_arrived',
        message: `${newCustomer.type.name} llegó`,
        icon: newCustomer.type.emoji,
        color: 'blue',
      })

      return {
        ...prev,
        customersInQueue: [...prev.customersInQueue, newCustomer],
      }
    })
  }, [addEvent])

  // Servir cliente
  const serveCustomer = useCallback(() => {
    setState((prev) => {
      if (prev.customersInQueue.length === 0) return prev

      const customer = prev.customersInQueue[0]
      const pref = customer.preferredProduct

      // Buscar producto disponible
      let productCode: string | null = null
      if (prev.inventory[pref] > 0) {
        productCode = pref
      } else {
        // Buscar alternativa
        const available = Object.keys(prev.inventory).filter(
          (k) => prev.inventory[k] > 0
        )
        if (available.length > 0) {
          productCode = available[Math.floor(Math.random() * available.length)]
        }
      }

      if (productCode) {
        // Venta exitosa
        const product = DEMO_PRODUCTS[productCode]
        const saleAmount = Math.round(
          product.price * prev.location.priceMultiplier
        )

        addEvent({
          type: 'sale',
          message: `compró ${product.emoji} ${product.name}`,
          icon: customer.type.emoji,
          color: 'green',
        })

        return {
          ...prev,
          money: prev.money + saleAmount,
          sales: prev.sales + 1,
          revenue: prev.revenue + saleAmount,
          customersServed: prev.customersServed + 1,
          inventory: {
            ...prev.inventory,
            [productCode]: prev.inventory[productCode] - 1,
          },
          customersInQueue: prev.customersInQueue
            .slice(1)
            .map((c, i) => (i === 0 ? { ...c, state: 'waiting' as const } : c)),
        }
      } else {
        // Sin stock
        addEvent({
          type: 'out_of_stock',
          message: 'se fue (sin stock)',
          icon: customer.type.emoji,
          color: 'red',
        })

        return {
          ...prev,
          customersLost: prev.customersLost + 1,
          customersInQueue: prev.customersInQueue.slice(1),
        }
      }
    })
  }, [addEvent])

  // Fin del día
  const endDay = useCallback(() => {
    setState((prev) => {
      addEvent({
        type: 'special',
        message: `Resumen: ${prev.customersServed} clientes, ${prev.customersLost} perdidos`,
        icon: '📊',
        color: 'purple',
      })
      addEvent({
        type: 'special',
        message: `Ganancia del día: ₡${prev.revenue.toLocaleString()}`,
        icon: '💰',
        color: 'green',
      })

      return { ...prev, playing: false }
    })
  }, [addEvent])

  // Game loop
  useEffect(() => {
    if (!state.playing) {
      if (loopRef.current) {
        clearTimeout(loopRef.current)
        loopRef.current = null
      }
      return
    }

    const tick = () => {
      setState((prev) => {
        // Avanzar tiempo
        let newMinute = prev.time.minute + 1
        let newHour = prev.time.hour

        if (newMinute >= 60) {
          newMinute = 0
          newHour++
        }

        // Fin del día (6 PM)
        if (newHour >= 18) {
          endDay()
          return { ...prev, time: { hour: 18, minute: 0 } }
        }

        return {
          ...prev,
          time: { hour: newHour, minute: newMinute },
        }
      })

      // Spawn customers
      const spawnChance = getSpawnChance(state.time.hour)
      if (Math.random() < spawnChance * Math.sqrt(state.speed)) {
        spawnCustomer()
      }

      // Serve customers
      if (
        state.customersInQueue.length > 0 &&
        Math.random() < 0.08 * Math.sqrt(state.speed)
      ) {
        serveCustomer()
      }

      // Próximo tick
      const delay = 80 / state.speed
      loopRef.current = window.setTimeout(tick, delay)
    }

    loopRef.current = window.setTimeout(tick, 80 / state.speed)

    return () => {
      if (loopRef.current) {
        clearTimeout(loopRef.current)
      }
    }
  }, [
    state.playing,
    state.speed,
    state.time.hour,
    state.customersInQueue.length,
    getSpawnChance,
    spawnCustomer,
    serveCustomer,
    endDay,
  ])

  // Convertir inventory a InventoryItem[]
  const inventoryItems: InventoryItem[] = Object.entries(state.inventory).map(
    ([code, quantity]) => ({
      product: DEMO_PRODUCTS[code],
      quantity,
    })
  )

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Escena de juego */}
      <PremiumLocationScene
        location={state.location}
        time={state.time}
        weather={weather}
        truck={DEMO_TRUCK}
        customers={state.customersInQueue}
        onTruckClick={() => console.log('Truck clicked!')}
      />

      {/* HUD overlay */}
      <SimulationHUD
        location={state.location}
        time={state.time}
        weather={weather}
        dayNumber={state.dayNumber}
        money={state.money}
        reputation={3.5}
        sales={state.sales}
        inventory={inventoryItems}
        events={events}
        playing={state.playing}
        speed={state.speed}
        onPlayPause={toggleGame}
        onSpeedChange={setSpeed}
      />

      {/* Debug info (opcional) */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel-dark text-white text-xs px-3 py-1 rounded-full">
          TimeOfDay: {getTimeOfDay(state.time.hour)} | Customers:{' '}
          {state.customersInQueue.length} | SpawnRate:{' '}
          {(getSpawnChance(state.time.hour) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  )
}

export default GameSimulationDemo
