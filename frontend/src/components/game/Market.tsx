// Market.tsx
// Mercado - Buy ingredients for your recipes

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marketApi, MarketIngredient, CatalogStats } from '../../services/marketApi'

const tierConfig = {
  basic: { label: 'Básico', color: 'bg-green-100 text-green-700', badge: '🌱' },
  common: { label: 'Común', color: 'bg-blue-100 text-blue-700', badge: '🍳' },
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-700', badge: '⭐' },
  special: { label: 'Especial', color: 'bg-amber-100 text-amber-700', badge: '👑' },
}

export function Market() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()

  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [ingredients, setIngredients] = useState<MarketIngredient[]>([])
  const [playerMoney, setPlayerMoney] = useState(0)
  const [stats, setStats] = useState<CatalogStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'owned' | 'available'>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')

  useEffect(() => {
    if (gameId) {
      loadCatalog()
    }
  }, [gameId])

  const loadCatalog = async () => {
    try {
      setLoading(true)
      const data = await marketApi.getCatalog(gameId!)
      setIngredients(data.ingredients)
      setPlayerMoney(data.player_money)
      setStats(data.stats)
    } catch (err) {
      console.error(err)
      setError('Error al cargar el mercado')
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (ingredient: MarketIngredient) => {
    if (ingredient.owned) return
    if (playerMoney < ingredient.cost) {
      setError(`No tenés suficiente dinero. Necesitás ₡${ingredient.cost.toLocaleString()}`)
      return
    }

    try {
      setBuying(ingredient.code)
      setError(null)
      const result = await marketApi.buyIngredient(gameId!, ingredient.code)
      setSuccess(result.message)
      setPlayerMoney(result.new_balance)

      // Update ingredient as owned
      setIngredients(prev => prev.map(ing =>
        ing.code === ingredient.code ? { ...ing, owned: true } : ing
      ))

      // Update stats
      if (stats) {
        const tierKey = `${ingredient.tier}_owned` as keyof CatalogStats
        setStats({
          ...stats,
          owned: stats.owned + 1,
          [tierKey]: (stats[tierKey] as number) + 1,
        })
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al comprar')
    } finally {
      setBuying(null)
    }
  }

  const filteredIngredients = ingredients.filter(ing => {
    if (filter === 'owned' && !ing.owned) return false
    if (filter === 'available' && ing.owned) return false
    if (tierFilter !== 'all' && ing.tier !== tierFilter) return false
    return true
  })

  // Group by tier
  const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
    const tier = ing.tier
    if (!acc[tier]) acc[tier] = []
    acc[tier].push(ing)
    return acc
  }, {} as Record<string, MarketIngredient[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏪</div>
          <p className="text-gray-600">Cargando mercado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crema to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/game/${gameId}/play`)}
              className="flex items-center gap-2 text-gray-600 hover:text-coral transition-colors"
            >
              <span>←</span>
              <span>Volver</span>
            </button>
            <h1 className="text-xl font-bold text-coral flex items-center gap-2">
              <span>🏪</span>
              Mercado
            </h1>
            <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              ₡{playerMoney.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Stats */}
        {stats && (
          <div className="mb-4 grid grid-cols-4 gap-2">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-coral">{stats.owned}</div>
              <div className="text-xs text-gray-500">Tenés</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.basic_owned}/31</div>
              <div className="text-xs text-gray-500">Básicos</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.common_owned + stats.premium_owned}/19</div>
              <div className="text-xs text-gray-500">Comprados</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-amber-600">{stats.special_owned}/2</div>
              <div className="text-xs text-gray-500">Especiales</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
          >
            <option value="all">Todos</option>
            <option value="owned">Mis ingredientes</option>
            <option value="available">Por comprar</option>
          </select>
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
          >
            <option value="all">Todas las categorías</option>
            <option value="basic">🌱 Básicos (gratis)</option>
            <option value="common">🍳 Comunes</option>
            <option value="premium">⭐ Premium</option>
            <option value="special">👑 Especiales</option>
          </select>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            {success}
          </div>
        )}

        {/* Ingredients Grid by Tier */}
        {['basic', 'common', 'premium', 'special'].map(tier => {
          const tierIngredients = groupedIngredients[tier]
          if (!tierIngredients || tierIngredients.length === 0) return null

          const config = tierConfig[tier as keyof typeof tierConfig]

          return (
            <div key={tier} className="mb-6">
              <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>{config.badge}</span>
                {config.label}
                {tier === 'basic' && <span className="text-sm font-normal text-green-600">(incluidos gratis)</span>}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tierIngredients.map(ingredient => (
                  <div
                    key={ingredient.code}
                    className={`relative bg-white rounded-xl p-3 shadow-sm border-2 transition-all ${
                      ingredient.owned
                        ? 'border-green-300 bg-green-50/30'
                        : playerMoney >= ingredient.cost
                          ? 'border-gray-200 hover:border-coral hover:shadow-md cursor-pointer'
                          : 'border-gray-200 opacity-60'
                    }`}
                    onClick={() => !ingredient.owned && handleBuy(ingredient)}
                  >
                    {/* Owned badge */}
                    {ingredient.owned && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}

                    {/* Content */}
                    <div className="text-center">
                      <div className="text-2xl mb-1">{ingredient.icon || '🥘'}</div>
                      <div className="font-medium text-gray-800 text-sm truncate">{ingredient.name}</div>

                      {/* Price or status */}
                      {ingredient.owned ? (
                        <div className="text-xs text-green-600 mt-1">En tu inventario</div>
                      ) : (
                        <div className="mt-2">
                          <div className={`text-sm font-bold ${playerMoney >= ingredient.cost ? 'text-coral' : 'text-gray-400'}`}>
                            ₡{ingredient.cost.toLocaleString()}
                          </div>
                          {buying === ingredient.code ? (
                            <div className="text-xs text-gray-500 animate-pulse">Comprando...</div>
                          ) : playerMoney >= ingredient.cost ? (
                            <div className="text-xs text-coral">Toca para comprar</div>
                          ) : (
                            <div className="text-xs text-red-400">Sin fondos</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>No hay ingredientes que mostrar</p>
          </div>
        )}

        {/* Call to action */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/game/${gameId}/laboratorio`)}
            className="bg-coral text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-coral/90 transition-all flex items-center gap-2 mx-auto"
          >
            <span>🧪</span>
            Ir al Laboratorio
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Usa tus ingredientes para crear platillos únicos
          </p>
        </div>
      </div>
    </div>
  )
}
