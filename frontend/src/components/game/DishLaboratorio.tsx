// DishLaboratorio.tsx
// Laboratorio de Sabores - Create dishes with AI

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { labApi, Ingredient, PlayerDish, GenerateDishResponse } from '../../services/labApi'

export function DishLaboratorio() {
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()

  // State
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [ingredients, setIngredients] = useState<{ default: Ingredient[]; from_creator: Ingredient[] }>({
    default: [],
    from_creator: [],
  })
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([])
  const [playerPrompt, setPlayerPrompt] = useState('')
  const [dishes, setDishes] = useState<PlayerDish[]>([])
  const [generatedDish, setGeneratedDish] = useState<GenerateDishResponse | null>(null)
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const [hitsRemaining, setHitsRemaining] = useState<number | null>(null)
  const [isUnlimited, setIsUnlimited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'dishes'>('create')
  const [editingDishId, setEditingDishId] = useState<string | null>(null)
  const [editingDishPrice, setEditingDishPrice] = useState<number>(0)
  const [addToMenuOnConfirm, setAddToMenuOnConfirm] = useState(true)

  useEffect(() => {
    if (gameId) {
      loadData()
    }
  }, [gameId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ingredientsData, dishesData, usageData] = await Promise.all([
        labApi.getIngredients(gameId!),
        labApi.getDishes(gameId!),
        labApi.getUsage(gameId!),
      ])
      setIngredients(ingredientsData)
      setDishes(dishesData)
      setHitsRemaining(usageData.hits_remaining)
      setIsUnlimited(usageData.is_unlimited)
    } catch (err) {
      console.error(err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(prev => {
      const exists = prev.find(i => i.id === ingredient.id)
      if (exists) {
        return prev.filter(i => i.id !== ingredient.id)
      }
      return [...prev, ingredient]
    })
  }

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      setError('Selecciona al menos un ingrediente')
      return
    }

    if (!isUnlimited && hitsRemaining !== null && hitsRemaining <= 0) {
      setError('Has alcanzado el límite de generaciones')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      const result = await labApi.generateDish(gameId!, {
        ingredients: selectedIngredients,
        player_prompt: playerPrompt,
      })
      setGeneratedDish(result)
      setEditingPrice(result.suggested_price)
      setHitsRemaining(result.hits_remaining)

      // Reset form
      setSelectedIngredients([])
      setPlayerPrompt('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar platillo'
      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const handleToggleMenu = async (dish: PlayerDish) => {
    try {
      await labApi.updateDish(gameId!, dish.id, { is_in_menu: !dish.is_in_menu })
      setDishes(prev => prev.map(d =>
        d.id === dish.id ? { ...d, is_in_menu: !d.is_in_menu } : d
      ))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm('¿Eliminar este platillo?')) return
    try {
      await labApi.deleteDish(gameId!, dishId)
      setDishes(prev => prev.filter(d => d.id !== dishId))
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmDish = async () => {
    if (!generatedDish || editingPrice === null) return
    try {
      // Update the dish with the player's chosen price and optionally add to menu
      await labApi.updateDish(gameId!, generatedDish.id, {
        player_price: editingPrice,
        is_in_menu: addToMenuOnConfirm,
      })

      // Refresh dishes list
      const dishesData = await labApi.getDishes(gameId!)
      setDishes(dishesData)

      // Clear the generated dish modal
      setGeneratedDish(null)
      setEditingPrice(null)
      setAddToMenuOnConfirm(true) // Reset for next time
    } catch (err) {
      console.error(err)
      setError('Error al guardar el platillo')
    }
  }

  const handleDiscardDish = async () => {
    if (!generatedDish) return
    try {
      // Delete the dish from the database
      await labApi.deleteDish(gameId!, generatedDish.id)
      setGeneratedDish(null)
      setEditingPrice(null)
      setAddToMenuOnConfirm(true)
    } catch (err) {
      console.error(err)
      // Even if delete fails, clear the UI
      setGeneratedDish(null)
      setEditingPrice(null)
    }
  }

  const handleEditDishPrice = async (dishId: string, newPrice: number) => {
    try {
      await labApi.updateDish(gameId!, dishId, { player_price: newPrice })
      setDishes(prev => prev.map(d =>
        d.id === dishId ? { ...d, player_price: newPrice } : d
      ))
      setEditingDishId(null)
    } catch (err) {
      console.error(err)
    }
  }

  const difficultyColors: Record<string, string> = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🧪</div>
          <p className="text-gray-600">Cargando laboratorio...</p>
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
              <span>🧪</span>
              Laboratorio de Sabores
            </h1>
            <div className="text-sm text-gray-500">
              {isUnlimited ? (
                <span className="text-green-600 font-medium">Ilimitado</span>
              ) : (
                <span>Intentos: <strong className={hitsRemaining === 0 ? 'text-red-500' : 'text-coral'}>{hitsRemaining}</strong></span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-coral text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Crear Platillo
          </button>
          <button
            onClick={() => setActiveTab('dishes')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              activeTab === 'dishes'
                ? 'bg-coral text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mis Platillos ({dishes.length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Generated Dish Success - Editable */}
        {generatedDish && (
          <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-5xl animate-bounce">🎉</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-800">{generatedDish.name}</h3>
                <div className="text-green-700 mt-2 whitespace-pre-line text-sm leading-relaxed bg-white/50 p-3 rounded-lg">
                  {generatedDish.description}
                </div>

                {/* Editable Price Section */}
                <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    💰 Precio de venta (podés ajustarlo)
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-500">₡</span>
                    <input
                      type="number"
                      value={editingPrice || 0}
                      onChange={e => setEditingPrice(Math.max(500, Math.min(50000, parseInt(e.target.value) || 0)))}
                      className="flex-1 px-4 py-2 text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
                      min={500}
                      max={50000}
                      step={100}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Sugerido: ₡{generatedDish.suggested_price.toLocaleString()}</span>
                    <span>Rango: ₡500 - ₡50,000</span>
                  </div>
                </div>

                {/* Other Stats */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium border">
                    ⭐ Popularidad: {generatedDish.suggested_popularity}%
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${difficultyColors[generatedDish.suggested_difficulty]}`}>
                    Dificultad: {generatedDish.suggested_difficulty}
                  </span>
                  {generatedDish.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Add to Menu Checkbox */}
                <label className="flex items-center gap-3 mt-4 p-3 bg-white rounded-xl border border-green-200 cursor-pointer hover:bg-green-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={addToMenuOnConfirm}
                    onChange={e => setAddToMenuOnConfirm(e.target.checked)}
                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="font-medium text-gray-700">
                    📋 Agregar directamente al menú
                  </span>
                </label>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleConfirmDish}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    ✓ {addToMenuOnConfirm ? 'Confirmar y Agregar al Menú' : 'Guardar Platillo'}
                  </button>
                  <button
                    onClick={handleDiscardDish}
                    className="py-3 px-6 bg-red-100 text-red-600 font-medium rounded-xl hover:bg-red-200 transition-colors"
                  >
                    🗑️ Descartar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Ingredients Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🥗</span> Ingredientes Disponibles
              </h2>

              {/* Default Ingredients */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Productos Base</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ingredients.default.map(ing => (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedIngredients.find(i => i.id === ing.id)
                          ? 'border-coral bg-coral/10 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{ing.icon || '🍽️'}</div>
                      <div className="text-sm font-medium truncate">{ing.name}</div>
                      {ing.base_cost && (
                        <div className="text-xs text-gray-400">₡{ing.base_cost}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Ingredients */}
              {ingredients.from_creator.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <span>✨</span> Del Creator
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {ingredients.from_creator.map(ing => (
                      <button
                        key={ing.id}
                        onClick={() => toggleIngredient(ing)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedIngredients.find(i => i.id === ing.id)
                            ? 'border-agua bg-agua/10 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{ing.icon || '🌟'}</div>
                        <div className="text-sm font-medium truncate">{ing.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected & Prompt */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📝</span> Tu Creación
              </h2>

              {/* Selected Ingredients */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-500">
                  Ingredientes seleccionados ({selectedIngredients.length})
                </label>
                <div className="mt-2 min-h-[60px] p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  {selectedIngredients.length === 0 ? (
                    <p className="text-gray-400 text-sm">Selecciona ingredientes arriba...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedIngredients.map(ing => (
                        <span
                          key={ing.id}
                          onClick={() => toggleIngredient(ing)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-coral/10 text-coral rounded-full text-sm cursor-pointer hover:bg-coral/20"
                        >
                          {ing.icon || '🍽️'} {ing.name}
                          <span className="ml-1 text-coral/60">×</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-500">
                  Describí tu platillo (opcional)
                </label>
                <textarea
                  value={playerPrompt}
                  onChange={e => setPlayerPrompt(e.target.value)}
                  placeholder="Ej: Un casado con toque callejero y picante..."
                  className="mt-2 w-full p-4 border-2 border-gray-200 rounded-xl focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {playerPrompt.length}/200
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating || selectedIngredients.length === 0 || (!isUnlimited && hitsRemaining === 0)}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  generating || selectedIngredients.length === 0 || (!isUnlimited && hitsRemaining === 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-coral to-papaya text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {generating ? (
                  <>
                    <div className="animate-spin">🧪</div>
                    <span>Creando magia...</span>
                  </>
                ) : (
                  <>
                    <span>🧪</span>
                    <span>Crear Platillo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Dishes Tab */}
        {activeTab === 'dishes' && (
          <div className="space-y-4">
            {dishes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Sin platillos aún</h3>
                <p className="text-gray-500 mb-6">Crea tu primer platillo en el laboratorio</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-3 bg-coral text-white rounded-xl font-medium hover:bg-coral/90"
                >
                  Crear Platillo
                </button>
              </div>
            ) : (
              dishes.map(dish => (
                <div
                  key={dish.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${
                    dish.is_in_menu ? 'border-l-green-500' : 'border-l-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">{dish.name}</h3>
                        {dish.is_in_menu && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            En Menú
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm mb-3 whitespace-pre-line leading-relaxed bg-gray-50 p-2 rounded-lg max-h-32 overflow-y-auto">
                        {dish.description}
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        {editingDishId === dish.id ? (
                          <div className="flex items-center gap-2 bg-mango/20 px-3 py-1 rounded-lg">
                            <span className="text-amber-700 font-medium">₡</span>
                            <input
                              type="number"
                              value={editingDishPrice}
                              onChange={e => setEditingDishPrice(parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-sm font-bold border rounded focus:border-coral outline-none"
                              min={500}
                              max={50000}
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditDishPrice(dish.id, editingDishPrice)}
                              className="text-green-600 hover:text-green-800 font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingDishId(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingDishId(dish.id)
                              setEditingDishPrice(dish.player_price || dish.suggested_price)
                            }}
                            className="px-3 py-1 bg-mango/20 text-amber-700 rounded-lg text-sm font-medium hover:bg-mango/30 transition-colors flex items-center gap-1"
                          >
                            💰 ₡{(dish.player_price || dish.suggested_price).toLocaleString()}
                            <span className="text-xs opacity-60">✏️</span>
                          </button>
                        )}
                        <span className="px-3 py-1 bg-agua/20 text-teal-700 rounded-lg text-sm font-medium">
                          ⭐ {dish.suggested_popularity}%
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${difficultyColors[dish.suggested_difficulty]}`}>
                          {dish.suggested_difficulty}
                        </span>
                        {dish.times_sold > 0 && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                            📈 {dish.times_sold} vendidos
                          </span>
                        )}
                      </div>

                      {/* Ingredients */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(dish.ingredients as Ingredient[]).map((ing, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                            {ing.icon || '🍽️'} {ing.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleToggleMenu(dish)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          dish.is_in_menu
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {dish.is_in_menu ? 'Quitar del Menú' : 'Agregar al Menú'}
                      </button>
                      <button
                        onClick={() => handleDeleteDish(dish.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DishLaboratorio
