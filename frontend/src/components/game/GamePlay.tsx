// GamePlay.tsx
// Pantalla principal del juego (placeholder)

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, GameSession } from '../../services/api'

interface TruckConfig {
  type: string
  name: string
  products: string[]
  theme: string
}

export function GamePlay() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()

  const [game, setGame] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [truckConfig, setTruckConfig] = useState<TruckConfig | null>(null)

  useEffect(() => {
    if (gameId) {
      loadGame()
    }
  }, [gameId])

  const loadGame = async () => {
    try {
      const gameData = await api.games.get(gameId!)
      setGame(gameData)

      // Check if truck is configured
      const stats = gameData.stats as { truck?: TruckConfig } | null
      if (!stats?.truck?.type) {
        // Redirect to setup if not configured
        navigate(`/game/${gameId}/setup`)
        return
      }
      setTruckConfig(stats.truck)
    } catch (err) {
      console.error(err)
      navigate('/game')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚚</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const countryInfo = {
    costa_rica: { flag: '🇨🇷', currency: '₡' },
    mexico: { flag: '🇲🇽', currency: '$' },
    usa: { flag: '🇺🇸', currency: '$' },
  }[game?.world_type || 'costa_rica'] || { flag: '🌍', currency: '$' }

  const weatherIcons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Game Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back + Truck Name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/game')}
                className="btn-ghost text-gray-600"
              >
                ←
              </button>
              <div>
                <h1 className="font-bold text-lg text-carbon">
                  {truckConfig?.name || game?.name || 'Mi Food Truck'}
                </h1>
                <p className="text-xs text-gray-500">
                  {countryInfo.flag} Día {game?.game_day}
                </p>
              </div>
            </div>

            {/* Center: Weather */}
            <div className="text-center">
              <div className="text-2xl">{weatherIcons[game?.weather || 'sunny']}</div>
              <div className="text-xs text-gray-500 capitalize">{game?.weather}</div>
            </div>

            {/* Right: Money + Reputation */}
            <div className="text-right">
              <div className="font-bold text-hoja">
                {countryInfo.currency}{game?.money?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                ⭐ {game?.reputation || 0} rep
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Placeholder Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-carbon mb-2">
            ¡Próximamente!
          </h2>
          <p className="text-gray-600 mb-6">
            La pantalla de gameplay está en desarrollo.
            <br />
            Tu {truckConfig?.name} está listo para operar.
          </p>

          <div className="bg-crema rounded-xl p-4 mb-6 inline-block">
            <div className="text-4xl mb-2">
              {truckConfig?.type === 'cart' && '🛒'}
              {truckConfig?.type === 'stand' && '🏪'}
              {truckConfig?.type === 'truck' && '🚚'}
              {truckConfig?.type === 'restaurant' && '🍽️'}
            </div>
            <div className="font-bold">{truckConfig?.name}</div>
            <div className="text-sm text-gray-600">
              {truckConfig?.products?.length || 0} productos en menú
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Funcionalidades que vendrán:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-mango/20 text-carbon px-3 py-1 rounded-full text-sm">
                📍 Elegir ubicación
              </span>
              <span className="bg-mango/20 text-carbon px-3 py-1 rounded-full text-sm">
                🛒 Comprar ingredientes
              </span>
              <span className="bg-mango/20 text-carbon px-3 py-1 rounded-full text-sm">
                💰 Configurar precios
              </span>
              <span className="bg-mango/20 text-carbon px-3 py-1 rounded-full text-sm">
                ▶️ Simular día
              </span>
              <span className="bg-mango/20 text-carbon px-3 py-1 rounded-full text-sm">
                📊 Ver resultados
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-2xl font-bold text-carbon">{game?.game_day}</div>
            <div className="text-xs text-gray-500">Día</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-2xl font-bold text-hoja">
              {countryInfo.currency}{((game?.money || 0) / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-gray-500">Capital</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-2xl font-bold text-mango">{game?.reputation || 0}</div>
            <div className="text-xs text-gray-500">Reputación</div>
          </div>
        </div>
      </main>
    </div>
  )
}
