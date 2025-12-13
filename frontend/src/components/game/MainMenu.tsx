// MainMenu.tsx
// Pantalla principal de CalleViva

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { api, GameSession, Parameter } from '../../services/api'

export function MainMenu() {
  const navigate = useNavigate()
  const { player, logout } = useAuthStore()

  const [games, setGames] = useState<GameSession[]>([])
  const [countries, setCountries] = useState<Parameter[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewGame, setShowNewGame] = useState(false)
  const [newGameName, setNewGameName] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('costa_rica')
  const [creating, setCreating] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [gamesData, paramsData] = await Promise.all([
        api.games.list(),
        api.parameters.list('countries'),
      ])
      setGames(gamesData.games)
      setCountries(paramsData.parameters)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGame = async () => {
    if (creating) return
    setCreating(true)
    try {
      const game = await api.games.create({
        world_type: selectedCountry,
        name: newGameName || undefined,
      })
      // Navigate to truck setup
      navigate(`/game/${game.id}/setup`)
    } catch (err) {
      console.error('Error creating game:', err)
      setCreating(false)
    }
  }

  const handlePlayGame = (game: GameSession) => {
    // Check if truck is configured
    const stats = game.stats as { truck?: { type?: string } } | null
    if (stats?.truck?.type) {
      navigate(`/game/${game.id}/play`)
    } else {
      navigate(`/game/${game.id}/setup`)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('¿Eliminar esta partida?')) return
    try {
      await api.games.delete(gameId)
      setGames(games.filter(g => g.id !== gameId))
    } catch (err) {
      console.error('Error deleting game:', err)
    }
  }

  const getCountryInfo = (code: string) => {
    return countries.find(c => c.code === code)
  }

  const formatMoney = (amount: number, countryCode: string) => {
    const country = getCountryInfo(countryCode)
    const currency = (country?.config as Record<string, string>)?.currency || '₡'
    return `${currency}${amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mango via-papaya to-coral flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Header con usuario */}
      <div className="absolute top-5 right-5 flex items-center gap-3">
        {player?.is_admin && (
          <button
            onClick={() => navigate('/admin')}
            className="btn-secondary-sm"
          >
            ⚙️ Admin
          </button>
        )}
        <span className="text-white font-semibold bg-black/20 px-4 py-2 rounded-full">
          👤 {player?.display_name || player?.email}
        </span>
        <button
          onClick={handleLogout}
          className="btn-outline-sm"
        >
          Salir
        </button>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute top-[10%] left-[5%] text-7xl opacity-30 -rotate-12 select-none">🌮</div>
      <div className="absolute bottom-[15%] right-[8%] text-6xl opacity-30 rotate-12 select-none">🍦</div>
      <div className="absolute top-[20%] right-[15%] text-5xl opacity-30 select-none">☀️</div>

      {/* Logo */}
      <div className="bg-white rounded-3xl px-12 py-8 shadow-2xl text-center mb-8">
        <div className="text-5xl mb-2">🚚</div>
        <h1 className="font-nunito text-4xl font-black text-carbon mb-1 tracking-tight">
          Calle<span className="text-coral">Viva</span>
        </h1>
        <p className="font-nunito text-md font-bold text-terracota">
          ¡La calle está viva!
        </p>
      </div>

      {/* Content */}
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl w-full max-w-md p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : showNewGame ? (
          // New Game Form
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-carbon text-center">Nueva Partida</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={newGameName}
                onChange={e => setNewGameName(e.target.value)}
                placeholder="Mi Food Truck"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mundo
              </label>
              <div className="grid grid-cols-1 gap-2">
                {countries.map(country => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                      selectedCountry === country.code
                        ? 'border-coral bg-coral/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{country.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{country.name}</div>
                      <div className="text-sm text-gray-500">
                        Inicio: {(country.config as Record<string, string>)?.currency}
                        {(country.config as Record<string, number>)?.starting_money?.toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowNewGame(false)}
                className="flex-1 btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGame}
                disabled={creating}
                className="flex-1 btn-primary"
              >
                {creating ? 'Creando...' : '🚚 Crear'}
              </button>
            </div>
          </div>
        ) : (
          // Games List
          <div className="space-y-4">
            <button
              onClick={() => setShowNewGame(true)}
              className="w-full btn-primary-lg"
            >
              🎮 Nueva Partida
            </button>

            {games.length > 0 && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Continuar</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {games.map(game => {
                      const country = getCountryInfo(game.world_type)
                      return (
                        <div
                          key={game.id}
                          className="flex items-center gap-3 p-3 bg-crema rounded-xl hover:bg-crema/80 transition-colors group"
                        >
                          <span className="text-2xl">{country?.icon || '🌍'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">
                              {game.name || `Partida ${game.world_type}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              Día {game.game_day} • {formatMoney(game.money, game.world_type)}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleDeleteGame(game.id)}
                              className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                            <button
                              onClick={() => handlePlayGame(game)}
                              className="btn-primary-sm"
                            >
                              Jugar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <button className="w-full btn-warning">
              ⚙️ Opciones
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-5 text-center">
        <p className="text-white font-semibold opacity-90">
          🇨🇷 Hecho en Costa Rica
        </p>
        <p className="text-white font-semibold opacity-70 text-sm mt-1">
          ✨ Inspirado por Nacho ✨
        </p>
      </div>
    </div>
  )
}
