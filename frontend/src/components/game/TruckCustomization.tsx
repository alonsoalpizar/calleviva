// TruckCustomization.tsx
// Pantalla de personalización premium del Food Truck

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, GameSession, Parameter } from '../../services/api'
import { labApi, PlayerDish } from '../../services/labApi'
import { TruckViewer3D, TruckCustomization as TruckConfig3D } from './CustomizableTruck3D'

type TabType = 'vehicle' | 'equipment' | 'appearance' | 'menu'

interface TruckConfig {
  type: string
  name: string
  products: string[]
  theme: string
  decorations: string[]
  equipment: string[]
  style: string
}

interface TruckStats {
  capacity: number
  speed: number
  appeal: number
  weatherProtection: number
}

export function TruckCustomization() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()

  const [game, setGame] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('vehicle')

  // Parameters from DB
  const [truckTypes, setTruckTypes] = useState<Parameter[]>([])
  const [equipment, setEquipment] = useState<Parameter[]>([])
  const [decorations, setDecorations] = useState<Parameter[]>([])
  const [colors, setColors] = useState<Parameter[]>([])
  const [styles, setStyles] = useState<Parameter[]>([])
  const [products, setProducts] = useState<Parameter[]>([])
  const [, setRecipeUpgrades] = useState<Parameter[]>([])
  const [labDishes, setLabDishes] = useState<PlayerDish[]>([])

  // Current config
  const [config, setConfig] = useState<TruckConfig>({
    type: 'cart',
    name: 'Mi Food Truck',
    products: [],
    theme: 'coral',
    decorations: [],
    equipment: [],
    style: 'classic',
  })

  useEffect(() => {
    if (gameId) loadData()
  }, [gameId])

  const loadData = async () => {
    try {
      const gameData = await api.games.get(gameId!)
      setGame(gameData)

      // Load all parameters in parallel
      const worldSuffix = gameData.world_type === 'costa_rica' ? 'cr' :
                          gameData.world_type === 'mexico' ? 'mx' : 'us'

      const [typesRes, equipRes, decoRes, colorsRes, stylesRes, productsRes, recipesRes] = await Promise.all([
        api.parameters.list('truck_types'),
        api.parameters.list('equipment'),
        api.parameters.list('decorations'),
        api.parameters.list('colors'),
        api.parameters.list('styles'),
        api.parameters.list(`products_${worldSuffix}`),
        api.parameters.list('recipe_upgrades'),
      ])

      setTruckTypes(typesRes.parameters)
      setEquipment(equipRes.parameters)
      setDecorations(decoRes.parameters.filter(d => {
        const cfg = d.config as { country?: string }
        return !cfg.country || cfg.country === gameData.world_type
      }))
      setColors(colorsRes.parameters)
      setStyles(stylesRes.parameters)
      setProducts(productsRes.parameters)
      setRecipeUpgrades(recipesRes.parameters.filter(r => {
        const cfg = r.config as { country?: string }
        return cfg.country === gameData.world_type
      }))

      // Load existing config from game stats
      const stats = gameData.stats as { truck?: TruckConfig } | null
      if (stats?.truck) {
        setConfig({
          type: stats.truck.type || 'cart',
          name: stats.truck.name || 'Mi Food Truck',
          products: stats.truck.products || [],
          theme: stats.truck.theme || 'coral',
          decorations: stats.truck.decorations || [],
          equipment: stats.truck.equipment || [],
          style: stats.truck.style || 'classic',
        })
      }

      // Load lab dishes
      try {
        const dishes = await labApi.getDishes(gameId!)
        setLabDishes(dishes)
      } catch (labErr) {
        console.log('No lab dishes yet:', labErr)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (): TruckStats => {
    const vehicleType = truckTypes.find(t => t.code === config.type)
    const vehicleConfig = vehicleType?.config as { capacity?: number; speed?: number; appeal_base?: number } || {}

    let capacity = vehicleConfig.capacity || 20
    let speed = (vehicleConfig.speed || 1) * 100
    let appeal = vehicleConfig.appeal_base || 30
    let weatherProtection = 0

    // Add equipment bonuses
    config.equipment.forEach(eqCode => {
      const eq = equipment.find(e => e.code === eqCode)
      const eqConfig = eq?.config as { capacity_bonus?: number; speed_bonus?: number; weather_protection?: number } || {}
      capacity += (eqConfig.capacity_bonus || 0) * capacity / 100
      speed += eqConfig.speed_bonus || 0
      weatherProtection += eqConfig.weather_protection || 0
    })

    // Add decoration bonuses
    config.decorations.forEach(decCode => {
      const dec = decorations.find(d => d.code === decCode)
      const decConfig = dec?.config as { appeal_bonus?: number } || {}
      appeal += decConfig.appeal_bonus || 0
    })

    // Add style bonus
    const styleParam = styles.find(s => s.code === config.style)
    const styleConfig = styleParam?.config as { appeal_bonus?: number } || {}
    appeal += styleConfig.appeal_bonus || 0

    return {
      capacity: Math.round(capacity),
      speed: Math.min(Math.round(speed), 200),
      appeal: Math.min(Math.round(appeal), 100),
      weatherProtection: Math.min(Math.round(weatherProtection), 100),
    }
  }

  const calculateValue = (): number => {
    let value = 0

    // Vehicle cost
    const vehicleType = truckTypes.find(t => t.code === config.type)
    value += (vehicleType?.config as { cost?: number })?.cost || 0

    // Equipment costs
    config.equipment.forEach(eqCode => {
      const eq = equipment.find(e => e.code === eqCode)
      value += (eq?.config as { cost?: number })?.cost || 0
    })

    // Decoration costs
    config.decorations.forEach(decCode => {
      const dec = decorations.find(d => d.code === decCode)
      value += (dec?.config as { cost?: number })?.cost || 0
    })

    // Style cost
    const styleParam = styles.find(s => s.code === config.style)
    value += (styleParam?.config as { cost?: number })?.cost || 0

    // Color cost
    const colorParam = colors.find(c => c.code === config.theme)
    value += (colorParam?.config as { cost?: number })?.cost || 0

    return value
  }

  const canAfford = (cost: number): boolean => {
    return (game?.money || 0) >= cost
  }

  const meetsReputation = (required?: number): boolean => {
    if (!required) return true
    return (game?.reputation || 0) >= required * 20
  }

  const handlePurchase = async (type: 'vehicle' | 'equipment' | 'decoration' | 'style' | 'color', code: string, cost: number) => {
    if (!canAfford(cost) || saving) return

    setSaving(true)
    try {
      let newConfig = { ...config }

      if (type === 'vehicle') {
        newConfig.type = code
      } else if (type === 'equipment') {
        if (!newConfig.equipment.includes(code)) {
          newConfig.equipment = [...newConfig.equipment, code]
        }
      } else if (type === 'decoration') {
        if (newConfig.decorations.includes(code)) {
          newConfig.decorations = newConfig.decorations.filter(d => d !== code)
        } else {
          newConfig.decorations = [...newConfig.decorations, code]
        }
      } else if (type === 'style') {
        newConfig.style = code
      } else if (type === 'color') {
        newConfig.theme = code
      }

      // Update game
      const currentStats = (game?.stats || {}) as Record<string, unknown>
      const newMoney = (game?.money || 0) - cost

      await api.games.update(gameId!, {
        money: newMoney,
        stats: { ...currentStats, truck: newConfig },
      })

      setConfig(newConfig)
      setGame(g => g ? { ...g, money: newMoney, stats: { ...currentStats, truck: newConfig } } : null)
    } catch (err) {
      console.error('Error purchasing:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleNameChange = async (name: string) => {
    setConfig(c => ({ ...c, name }))
  }

  const toggleLabDishMenu = async (dish: PlayerDish) => {
    try {
      await labApi.updateDish(gameId!, dish.id, { is_in_menu: !dish.is_in_menu })
      setLabDishes(prev => prev.map(d =>
        d.id === dish.id ? { ...d, is_in_menu: !d.is_in_menu } : d
      ))
    } catch (err) {
      console.error('Error toggling dish:', err)
    }
  }

  const saveConfig = async () => {
    if (saving) return
    setSaving(true)
    try {
      const currentStats = (game?.stats || {}) as Record<string, unknown>
      await api.games.update(gameId!, {
        stats: { ...currentStats, truck: config },
      })
    } catch (err) {
      console.error('Error saving:', err)
    } finally {
      setSaving(false)
    }
  }

  const stats = calculateStats()
  const truckValue = calculateValue()

  const getCurrency = () => game?.world_type === 'costa_rica' ? '₡' : '$'
  const formatMoney = (amount: number) => `${getCurrency()}${amount.toLocaleString()}`

  const getThemeColor = (): string => {
    const colorParam = colors.find(c => c.code === config.theme)
    return (colorParam?.config as { hex?: string })?.hex || '#FF6B6B'
  }

  // Genera configuración 3D basada en las opciones del usuario
  const get3DConfig = (): Partial<TruckConfig3D> => {
    const mainColor = getThemeColor()
    // Generar color de acento complementario
    const accentColor = config.theme === 'coral' ? '#4ECDC4' :
                       config.theme === 'agua' ? '#FF6B6B' :
                       config.theme === 'mango' ? '#FF6B6B' :
                       config.theme === 'verde' ? '#FFE66D' :
                       config.theme === 'purple' ? '#FFE66D' : '#4ECDC4'

    // Detectar bandera por país
    const hasFlag = config.decorations.some(d => d.startsWith('flag_'))
    const flagCountry = config.decorations.includes('flag_cr') ? 'cr' as const :
                       config.decorations.includes('flag_mx') ? 'mx' as const :
                       config.decorations.includes('flag_us') ? 'us' as const : undefined

    return {
      bodyColor: mainColor,
      accentColor: accentColor,
      awningColor: config.theme === 'mango' ? '#FF6B6B' : '#FFE66D',
      awningStyle: config.decorations.includes('umbrella') ? 'none' : 'striped',
      windowOpen: true,
      // Decoraciones mapeadas desde la DB
      hasSign: config.decorations.includes('sign'),
      hasLights: config.decorations.includes('lights'),
      hasPlants: config.decorations.includes('plants'),
      hasBalloon: config.decorations.includes('balloon'),
      hasUmbrella: config.decorations.includes('umbrella'),
      hasMenuBoard: config.decorations.includes('menu_board'),
      hasSpeaker: config.decorations.includes('music'),
      hasNeon: config.decorations.includes('neon'),
      hasStar: config.decorations.includes('star'),
      hasFlag: hasFlag,
      flagCountry: flagCountry,
      signText: config.name.substring(0, 8).toUpperCase(),
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-rose-400 to-amber-300 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
          <div className="text-6xl mb-4 animate-bounce">🚚</div>
          <p className="text-gray-600 font-bold">Cargando Taller Creativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-rose-400 to-amber-300 p-4 lg:p-6">
      {/* Container */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6 h-[95vh]">

        {/* Premium Header */}
        <header className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-coral rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🚚
            </div>
            <div>
              <h1 className="font-black text-2xl text-gray-800">
                Taller <span className="text-coral">Creativo</span>
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Personalización de Flota</p>
            </div>
          </div>

          {/* Header Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fondos Disponibles</div>
              <div className="text-2xl font-black text-green-600">{formatMoney(game?.money || 0)}</div>
            </div>
            <button
              onClick={() => navigate(`/game/${gameId}/play`)}
              className="bg-gray-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all hover:-translate-y-0.5 shadow-lg flex items-center gap-2"
            >
              <span>←</span> Regresar
            </button>
          </div>
        </header>

        {/* Content - Vertical Layout with scroll */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">

          {/* Top: Preview Panel with 3D Viewer */}
          <div className="glass-panel rounded-2xl overflow-hidden shrink-0">
            <div className="flex flex-col lg:flex-row">
              {/* Visor 3D Premium - responsive height */}
              <div className="h-[280px] sm:h-[320px] lg:h-[380px] lg:flex-1 relative bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100 rounded-xl m-1 overflow-hidden">
                <TruckViewer3D
                  config={get3DConfig()}
                  showControls={true}
                />
              </div>

              {/* Stats Panel - al lado en desktop, abajo en mobile */}
              <div className="lg:w-72 p-4 flex flex-col justify-center">
                {/* Live Stats - 2x2 grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <StatBar label="Capacidad" value={stats.capacity} max={150} color="coral" />
                  <StatBar label="Velocidad" value={stats.speed} max={200} color="agua" />
                  <StatBar label="Atractivo" value={stats.appeal} max={100} color="mango" />
                  <StatBar label="Protección" value={stats.weatherProtection} max={100} color="purple" />
                </div>

                {/* Value */}
                <div className="pt-3 border-t border-gray-100 text-center">
                  <div className="text-xs text-gray-500 font-bold uppercase">Valor del Negocio</div>
                  <div className="text-xl font-black text-green-600">{formatMoney(truckValue)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Configuration Panel */}
          <main className="flex flex-col gap-3 shrink-0">

            {/* Navigation Tabs */}
            <nav className="glass-panel p-2 rounded-2xl flex gap-1 shrink-0">
              {[
                { id: 'vehicle', icon: '🚛', label: 'Vehículo' },
                { id: 'equipment', icon: '🔧', label: 'Equipo' },
                { id: 'appearance', icon: '🎨', label: 'Apariencia' },
                { id: 'menu', icon: '🍽️', label: 'Menú' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`menu-btn flex-1 py-3 rounded-xl font-bold transition-all text-center ${
                    activeTab === tab.id
                      ? 'bg-white text-coral shadow-md active'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <div className="glass-panel rounded-3xl p-6 lg:p-8">

              {/* Vehicle Tab */}
              {activeTab === 'vehicle' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-800">Elige tu Carrocería</h2>
                    <p className="text-gray-500">La base de tu imperio móvil.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {truckTypes.map(type => {
                      const typeConfig = type.config as {
                        capacity?: number
                        speed?: number
                        cost?: number
                        requires_reputation?: number
                        emoji?: string
                      }
                      const isOwned = config.type === type.code
                      const cost = typeConfig.cost || 0
                      const canBuy = canAfford(cost) && meetsReputation(typeConfig.requires_reputation)
                      const isLocked = typeConfig.requires_reputation && !meetsReputation(typeConfig.requires_reputation)

                      return (
                        <div
                          key={type.code}
                          className={`upgrade-card rounded-2xl p-6 relative transition-all ${
                            isOwned
                              ? 'owned'
                              : isLocked
                              ? 'locked'
                              : canBuy
                              ? 'hover:shadow-xl cursor-pointer'
                              : ''
                          }`}
                        >
                          {/* Locked Overlay */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                              <div className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                                🔒 Rep. {typeConfig.requires_reputation} Requerida
                              </div>
                            </div>
                          )}

                          {/* Status Badge */}
                          {isOwned && (
                            <span className="absolute top-4 right-4 bg-agua/20 text-agua px-3 py-1 rounded-full text-xs font-bold">
                              EN PROPIEDAD
                            </span>
                          )}
                          {!isOwned && !isLocked && cost === 0 && (
                            <span className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                              ¡GRATIS!
                            </span>
                          )}

                          <div className="text-6xl mb-4">{typeConfig.emoji || type.icon}</div>
                          <h3 className="font-bold text-xl mb-1">{type.name}</h3>
                          <p className="text-sm text-gray-500 mb-4">{type.description}</p>

                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded">Cap: {typeConfig.capacity}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">Vel: {(typeConfig.speed || 1) * 100}%</span>
                          </div>

                          {!isOwned && !isLocked && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <div className="text-xl font-black text-coral">
                                {cost === 0 ? '¡Gratis!' : formatMoney(cost)}
                              </div>
                              <button
                                onClick={() => handlePurchase('vehicle', type.code, cost)}
                                disabled={!canBuy || saving}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                                  canBuy
                                    ? 'bg-coral text-white hover:bg-red-500'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {saving ? '...' : 'Comprar'}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Equipment Tab */}
              {activeTab === 'equipment' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-800">Equipamiento</h2>
                    <p className="text-gray-500">Mejora tu cocina y capacidad operativa.</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.filter(e => !(e.config as { included?: boolean })?.included).map(eq => {
                      const eqConfig = eq.config as { cost?: number; description?: string }
                      const isOwned = config.equipment.includes(eq.code)
                      const cost = eqConfig.cost || 0
                      const canBuy = canAfford(cost) && !isOwned

                      return (
                        <div
                          key={eq.code}
                          className={`upgrade-card rounded-2xl p-5 text-center transition-all ${
                            isOwned ? 'owned' : canBuy ? '' : 'opacity-60'
                          }`}
                        >
                          <div className="text-5xl mb-3">{eq.icon}</div>
                          <h3 className="font-bold text-lg">{eq.name}</h3>

                          {isOwned ? (
                            <span className="inline-block mt-2 bg-agua/20 text-agua px-3 py-1 rounded-full text-xs font-bold">
                              COMPRADO
                            </span>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500 mt-2 mb-3">{eqConfig.description}</p>
                              <div className="text-xl font-black text-coral mb-2">{formatMoney(cost)}</div>
                              <button
                                onClick={() => canBuy && handlePurchase('equipment', eq.code, cost)}
                                disabled={!canBuy || saving}
                                className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${
                                  canBuy
                                    ? 'bg-coral text-white hover:bg-red-500'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                Comprar
                              </button>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-800">Identidad Visual</h2>
                    <p className="text-gray-500">Dale personalidad única a tu negocio.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Input */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        Nombre del Negocio
                      </label>
                      <input
                        type="text"
                        value={config.name}
                        onChange={e => handleNameChange(e.target.value)}
                        onBlur={saveConfig}
                        maxLength={20}
                        className="w-full text-2xl font-black text-gray-800 border-b-2 border-gray-200 focus:border-coral outline-none py-2 bg-transparent transition-colors"
                        placeholder="Mi Food Truck"
                      />
                      <p className="text-xs text-gray-400 mt-2">{config.name.length}/20 caracteres</p>
                    </div>

                    {/* Paint Job */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                        Color de Tema
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {colors.map(color => {
                          const colorConfig = color.config as { hex?: string; cost?: number }
                          const isSelected = config.theme === color.code
                          const cost = colorConfig.cost || 0

                          return (
                            <button
                              key={color.code}
                              onClick={() => !isSelected && handlePurchase('color', color.code, cost)}
                              className={`w-11 h-11 rounded-full transition-all hover:scale-110 border-2 ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-gray-800 scale-110 border-white'
                                  : 'border-transparent hover:border-white'
                              }`}
                              style={{ backgroundColor: colorConfig.hex }}
                              title={`${color.name} - ${cost === 0 ? 'Gratis' : formatMoney(cost)}`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Accessories Grid */}
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Accesorios y Decoración</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                      {decorations.map(dec => {
                        const decConfig = dec.config as { cost?: number }
                        const isSelected = config.decorations.includes(dec.code)
                        const cost = isSelected ? 0 : (decConfig.cost || 0)

                        return (
                          <button
                            key={dec.code}
                            onClick={() => handlePurchase('decoration', dec.code, cost)}
                            className={`accessory-btn p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group ${
                              isSelected
                                ? 'border-coral bg-coral/10 shadow-md'
                                : 'border-gray-100 bg-white hover:border-coral hover:shadow-lg'
                            }`}
                          >
                            <span className="text-3xl group-hover:scale-110 transition-transform">
                              {dec.icon}
                            </span>
                            <span className="text-xs font-bold text-gray-500 truncate w-full text-center">
                              {dec.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Styles */}
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4">Estilo Visual</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {styles.map(style => {
                        const styleConfig = style.config as { cost?: number; requires_reputation?: number }
                        const isSelected = config.style === style.code
                        const canBuy = meetsReputation(styleConfig.requires_reputation)

                        return (
                          <button
                            key={style.code}
                            onClick={() => canBuy && !isSelected && handlePurchase('style', style.code, styleConfig.cost || 0)}
                            disabled={!canBuy}
                            className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                              isSelected
                                ? 'border-coral bg-coral/10'
                                : canBuy
                                ? 'border-gray-200 hover:border-coral bg-white'
                                : 'border-gray-100 bg-gray-100 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{style.icon}</span>
                            {style.name}
                            {!canBuy && (
                              <span className="block text-xs text-gray-400 mt-1">
                                🔒 Rep. {styleConfig.requires_reputation}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Tab */}
              {activeTab === 'menu' && (
                <div className="animate-fadeIn">
                  <div className="mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-800">Tu Menú</h2>
                    <p className="text-gray-500">Configura qué productos ofreces a tus clientes.</p>
                  </div>

                  {/* Active Products */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 border border-green-200">
                    <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                      <span className="text-xl">✅</span>
                      Productos Activos
                      <span className="ml-auto bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs">
                        {config.products.length}/5
                      </span>
                    </h3>

                    {config.products.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No tienes productos activos. Agrega algunos del catálogo.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {config.products.map(prodCode => {
                          const prod = products.find(p => p.code === prodCode)
                          const prodConfig = prod?.config as { base_price?: number; base_cost?: number }

                          return (
                            <div key={prodCode} className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
                              <span className="text-3xl">{prod?.icon}</span>
                              <div className="flex-1">
                                <div className="font-bold">{prod?.name}</div>
                                <div className="text-sm text-gray-500">
                                  Costo: {formatMoney(prodConfig?.base_cost || 0)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-black text-lg text-green-600">
                                  {formatMoney(prodConfig?.base_price || 0)}
                                </div>
                              </div>
                              <button
                                onClick={() => setConfig(c => ({
                                  ...c,
                                  products: c.products.filter(p => p !== prodCode)
                                }))}
                                className="w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors flex items-center justify-center font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Available Products */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-700 mb-4">📋 Catálogo de Productos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {products.filter(p => !config.products.includes(p.code)).map(prod => {
                        const prodConfig = prod.config as { base_cost?: number; base_price?: number }
                        const canAdd = config.products.length < 5

                        return (
                          <button
                            key={prod.code}
                            onClick={() => canAdd && setConfig(c => ({
                              ...c,
                              products: [...c.products, prod.code]
                            }))}
                            disabled={!canAdd}
                            className={`flex items-center gap-3 bg-white rounded-xl p-3 text-left border-2 transition-all ${
                              canAdd
                                ? 'border-transparent hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-3xl">{prod.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate">{prod.name}</div>
                              <div className="text-xs text-gray-500">
                                Venta: {formatMoney(prodConfig?.base_price || 0)}
                              </div>
                            </div>
                            {canAdd && (
                              <span className="text-green-500 font-bold text-xl">+</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Lab Dishes Section */}
                  {labDishes.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 mt-6 border border-purple-200">
                      <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                        <span className="text-xl">🧪</span>
                        Platillos del Laboratorio
                        <span className="ml-auto bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {labDishes.filter(d => d.is_in_menu).length} en menú
                        </span>
                      </h3>
                      <div className="space-y-2">
                        {labDishes.map(dish => (
                          <div
                            key={dish.id}
                            className={`flex items-center gap-4 rounded-xl p-3 transition-all ${
                              dish.is_in_menu
                                ? 'bg-white shadow-md border-2 border-purple-300'
                                : 'bg-white/50 border-2 border-transparent'
                            }`}
                          >
                            <span className="text-3xl">🍽️</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate">{dish.name}</div>
                              <div className="text-xs text-gray-500 truncate">
                                {dish.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-black text-lg ${dish.is_in_menu ? 'text-purple-600' : 'text-gray-400'}`}>
                                {formatMoney(dish.player_price || dish.suggested_price)}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleLabDishMenu(dish)}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                dish.is_in_menu
                                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                                  : 'bg-gray-200 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                              }`}
                            >
                              {dish.is_in_menu ? '✓ En Menú' : '+ Agregar'}
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate(`/game/${gameId}/lab`)}
                        className="mt-4 w-full py-3 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>🧪</span>
                        Ir al Laboratorio para crear más platillos
                      </button>
                    </div>
                  )}

                  {/* Link to Lab if no dishes yet */}
                  {labDishes.length === 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mt-6 border border-purple-200 text-center">
                      <div className="text-4xl mb-3">🧪</div>
                      <h3 className="font-bold text-purple-700 mb-2">Laboratorio de Sabores</h3>
                      <p className="text-purple-600 text-sm mb-4">
                        Crea platillos únicos combinando ingredientes con IA
                      </p>
                      <button
                        onClick={() => navigate(`/game/${gameId}/lab`)}
                        className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
                      >
                        Ir al Laboratorio
                      </button>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : '💾 Guardar Menú'}
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        }

        .preview-stage {
          background: radial-gradient(circle at center bottom, #87CEEB 0%, #E0F6FF 60%, #fff 100%);
        }

        .upgrade-card {
          background: white;
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .upgrade-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 107, 107, 0.3);
        }

        .upgrade-card.owned {
          border-color: #4ECDC4;
          background: linear-gradient(145deg, #F0FFF9, #FFFFFF);
        }

        .upgrade-card.locked {
          opacity: 0.7;
          filter: grayscale(60%);
        }

        .menu-btn {
          position: relative;
        }

        .menu-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40%;
          height: 3px;
          background: #FF6B6B;
          border-radius: 3px 3px 0 0;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .accessory-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

// Helper Component - Premium Stats Bar
function StatBar({ label, value, max, color }: {
  label: string
  value: number
  max: number
  color: 'coral' | 'agua' | 'mango' | 'purple'
}) {
  const percent = Math.min((value / max) * 100, 100)
  const colorClasses = {
    coral: 'bg-coral',
    agua: 'bg-agua',
    mango: 'bg-mango',
    purple: 'bg-purple-400'
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-gray-500">
        <span>{label}</span>
        <span className={`text-${color === 'purple' ? 'purple-400' : color}`}>{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
