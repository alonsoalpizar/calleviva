// TruckSetup.tsx
// Pantalla de personalización del Food Truck

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, GameSession, Parameter } from '../../services/api'

type SetupStep = 'type' | 'name' | 'products' | 'confirm'

interface TruckConfig {
  type: string
  name: string
  products: string[]
  theme: string
}

export function TruckSetup() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()

  const [game, setGame] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [step, setStep] = useState<SetupStep>('type')
  const [truckTypes, setTruckTypes] = useState<Parameter[]>([])
  const [products, setProducts] = useState<Parameter[]>([])

  const [config, setConfig] = useState<TruckConfig>({
    type: 'cart',
    name: '',
    products: [],
    theme: 'coral',
  })

  // Load game and parameters
  useEffect(() => {
    if (gameId) {
      loadData()
    }
  }, [gameId])

  const loadData = async () => {
    try {
      const [gameData, typesData] = await Promise.all([
        api.games.get(gameId!),
        api.parameters.list('truck_types'),
      ])

      setGame(gameData)
      setTruckTypes(typesData.parameters)

      // Load products based on world type
      const worldSuffix = gameData.world_type === 'costa_rica' ? 'cr' :
                          gameData.world_type === 'mexico' ? 'mx' : 'us'
      const worldProducts = await api.parameters.list(`products_${worldSuffix}`)
      setProducts(worldProducts.parameters)

      // If truck already configured, redirect to game
      const stats = gameData.stats as { truck?: TruckConfig } | null
      if (stats?.truck?.type) {
        navigate(`/game/${gameId}/play`)
        return
      }

      // Pre-fill name from game
      if (gameData.name) {
        setConfig(c => ({ ...c, name: gameData.name || '' }))
      }
    } catch (err) {
      setError('Error cargando datos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 'type') setStep('name')
    else if (step === 'name') setStep('products')
    else if (step === 'products') setStep('confirm')
  }

  const handleBack = () => {
    if (step === 'name') setStep('type')
    else if (step === 'products') setStep('name')
    else if (step === 'confirm') setStep('products')
  }

  const handleSelectProduct = (code: string) => {
    setConfig(c => {
      if (c.products.includes(code)) {
        return { ...c, products: c.products.filter(p => p !== code) }
      }
      if (c.products.length >= 5) return c // Max 5 products
      return { ...c, products: [...c.products, code] }
    })
  }

  const handleSave = async () => {
    if (!gameId) return
    setSaving(true)
    setError('')

    try {
      const currentStats = (game?.stats || {}) as Record<string, unknown>
      await api.games.update(gameId, {
        name: config.name || game?.name,
        stats: {
          ...currentStats,
          truck: config,
        },
      })
      navigate(`/game/${gameId}/play`)
    } catch (err) {
      setError('Error guardando configuración')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const getSelectedType = () => truckTypes.find(t => t.code === config.type)
  const getSelectedProducts = () => products.filter(p => config.products.includes(p.code))

  const canProceed = () => {
    if (step === 'type') return !!config.type
    if (step === 'name') return config.name.length >= 2
    if (step === 'products') return config.products.length >= 3
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mango via-papaya to-coral flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <div className="text-4xl mb-4">🚚</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const countryInfo = {
    costa_rica: { flag: '🇨🇷', name: 'Costa Rica' },
    mexico: { flag: '🇲🇽', name: 'México' },
    usa: { flag: '🇺🇸', name: 'Estados Unidos' },
  }[game?.world_type || 'costa_rica'] || { flag: '🌍', name: 'Mundo' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mango via-papaya to-coral p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/game')}
            className="btn-ghost text-white/80 hover:text-white"
          >
            ← Salir
          </button>
          <div className="text-white font-semibold bg-black/20 px-4 py-2 rounded-full">
            {countryInfo.flag} {countryInfo.name}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-white/20 rounded-full p-1">
          {['type', 'name', 'products', 'confirm'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-colors ${
                step === s
                  ? 'bg-white text-coral'
                  : ['type', 'name', 'products', 'confirm'].indexOf(step) > i
                  ? 'text-white'
                  : 'text-white/50'
              }`}
            >
              {s === 'type' && '1. Tipo'}
              {s === 'name' && '2. Nombre'}
              {s === 'products' && '3. Menú'}
              {s === 'confirm' && '4. Listo'}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Truck Type */}
          {step === 'type' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-carbon mb-2">
                  ¿Qué tipo de negocio querés?
                </h2>
                <p className="text-gray-600">
                  Empezá pequeño y crecé con el tiempo
                </p>
              </div>

              <div className="grid gap-3">
                {truckTypes.map(type => {
                  const typeConfig = type.config as { capacity?: number; cost?: number }
                  const isSelected = config.type === type.code
                  const canAfford = (typeConfig?.cost || 0) <= (game?.money || 0)

                  return (
                    <button
                      key={type.code}
                      onClick={() => canAfford && setConfig(c => ({ ...c, type: type.code }))}
                      disabled={!canAfford}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-coral bg-coral/10'
                          : canAfford
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-4xl">{type.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{type.name}</div>
                        <div className="text-sm text-gray-600">
                          Capacidad: {typeConfig?.capacity || 20} productos
                        </div>
                      </div>
                      <div className="text-right">
                        {(typeConfig?.cost || 0) > 0 ? (
                          <div className={`font-bold ${canAfford ? 'text-hoja' : 'text-red-500'}`}>
                            ${(typeConfig?.cost || 0).toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-hoja font-bold">¡Gratis!</div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Name */}
          {step === 'name' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{getSelectedType()?.icon || '🚚'}</div>
                <h2 className="text-2xl font-bold text-carbon mb-2">
                  ¿Cómo se llama tu negocio?
                </h2>
                <p className="text-gray-600">
                  Elegí un nombre memorable para tu {getSelectedType()?.name?.toLowerCase()}
                </p>
              </div>

              <input
                type="text"
                value={config.name}
                onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
                placeholder={`Mi ${getSelectedType()?.name || 'Food Truck'}`}
                className="input text-center text-xl"
                maxLength={30}
                autoFocus
              />

              <div className="flex justify-center gap-2">
                {['coral', 'agua', 'mango', 'hoja', 'terracota'].map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig(c => ({ ...c, theme: color }))}
                    className={`w-10 h-10 rounded-full transition-transform ${
                      config.theme === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{
                      backgroundColor: {
                        coral: '#FF6B6B',
                        agua: '#2EC4B6',
                        mango: '#FFE66D',
                        hoja: '#5C8A4D',
                        terracota: '#E17055',
                      }[color],
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Products */}
          {step === 'products' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-carbon mb-2">
                  ¿Qué vas a vender?
                </h2>
                <p className="text-gray-600">
                  Elegí entre 3 y 5 productos para tu menú inicial
                </p>
                <div className="mt-2 text-sm font-semibold text-coral">
                  {config.products.length}/5 seleccionados
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {products.map(product => {
                  const isSelected = config.products.includes(product.code)
                  const productConfig = product.config as { base_price?: number }

                  return (
                    <button
                      key={product.code}
                      onClick={() => handleSelectProduct(product.code)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-coral bg-coral/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{product.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          ${productConfig?.base_price || 0}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-coral text-xl">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{getSelectedType()?.icon || '🚚'}</div>
                <h2 className="text-2xl font-bold text-carbon mb-2">
                  {config.name || 'Tu Negocio'}
                </h2>
                <p className="text-gray-600">
                  ¡Todo listo para abrir!
                </p>
              </div>

              <div className="bg-crema rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-semibold">{getSelectedType()?.icon} {getSelectedType()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">País:</span>
                  <span className="font-semibold">{countryInfo.flag} {countryInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capital inicial:</span>
                  <span className="font-semibold text-hoja">
                    {game?.world_type === 'costa_rica' ? '₡' : '$'}
                    {game?.money?.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="text-gray-600 mb-2">Menú ({config.products.length} productos):</div>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedProducts().map(p => (
                      <span key={p.code} className="bg-white px-3 py-1 rounded-full text-sm">
                        {p.icon} {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step !== 'type' && (
              <button onClick={handleBack} className="btn-outline flex-1">
                ← Atrás
              </button>
            )}
            {step !== 'confirm' ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary flex-1"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-success flex-1"
              >
                {saving ? 'Abriendo...' : '🎉 ¡Abrir Negocio!'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-white/70 text-sm">
          ✨ ¡La calle te espera! ✨
        </p>
      </div>
    </div>
  )
}
