// LocationsPreview.tsx
// Página de preview para ver todos los escenarios de locaciones

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LocationScene } from '../components/game/LocationScenes'

const locations = [
  { code: 'mercado_central', name: 'Mercado Central', icon: '🏛️' },
  { code: 'sabana', name: 'Parque La Sabana', icon: '🌳' },
  { code: 'ucr', name: 'Campus UCR', icon: '🎓' },
  { code: 'escalante', name: 'Barrio Escalante', icon: '🏘️' },
  { code: 'saprissa', name: 'Estadio Saprissa', icon: '💜' },
  { code: 'morera_soto', name: 'Estadio Morera Soto', icon: '❤️' },
  { code: 'jaco', name: 'Playa Jacó', icon: '🏖️' },
  { code: 'puerto_viejo', name: 'Puerto Viejo', icon: '🌴' },
  { code: 'plaza_cultura', name: 'Plaza de la Cultura', icon: '🎭' },
  { code: 'estadio_nacional', name: 'Estadio Nacional', icon: '🏟️' },
  { code: 'feria_agricultor', name: 'Feria del Agricultor', icon: '🥬' },
  { code: 'aeropuerto', name: 'Aeropuerto', icon: '✈️' },
  { code: 'manuel_antonio', name: 'Manuel Antonio', icon: '🐒' },
  { code: 'heredia_centro', name: 'Heredia Centro', icon: '🌸' },
]

const timeOptions = ['morning', 'noon', 'afternoon', 'evening', 'night'] as const
const weatherOptions = ['sunny', 'cloudy', 'rainy'] as const

export function LocationsPreview() {
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState(locations[0].code)
  const [timeOfDay, setTimeOfDay] = useState<typeof timeOptions[number]>('noon')
  const [weather, setWeather] = useState<typeof weatherOptions[number]>('sunny')
  const [showTruck, setShowTruck] = useState(true)
  const [truckColor, setTruckColor] = useState('#FF6B6B')

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral via-papaya to-mango">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver
            </button>
            <h1 className="text-xl font-bold text-carbon">
              🗺️ Preview de Locaciones
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            {locations.length} escenarios
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Time of Day */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hora</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as typeof timeOptions[number])}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="morning">🌅 Mañana</option>
                <option value="noon">☀️ Mediodía</option>
                <option value="afternoon">🌤️ Tarde</option>
                <option value="evening">🌆 Atardecer</option>
                <option value="night">🌙 Noche</option>
              </select>
            </div>

            {/* Weather */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Clima</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as typeof weatherOptions[number])}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="sunny">☀️ Soleado</option>
                <option value="cloudy">☁️ Nublado</option>
                <option value="rainy">🌧️ Lluvioso</option>
              </select>
            </div>

            {/* Truck Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Color Truck</label>
              <input
                type="color"
                value={truckColor}
                onChange={(e) => setTruckColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>

            {/* Show Truck */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Truck</label>
              <button
                onClick={() => setShowTruck(!showTruck)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showTruck ? 'bg-hoja text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {showTruck ? '🚚 Visible' : '🚚 Oculto'}
              </button>
            </div>

            {/* Quick presets */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Preset</label>
              <div className="flex gap-1">
                <button
                  onClick={() => { setTimeOfDay('noon'); setWeather('sunny'); }}
                  className="flex-1 px-2 py-2 bg-yellow-100 rounded-lg text-xs"
                >
                  ☀️
                </button>
                <button
                  onClick={() => { setTimeOfDay('evening'); setWeather('sunny'); }}
                  className="flex-1 px-2 py-2 bg-orange-100 rounded-lg text-xs"
                >
                  🌆
                </button>
                <button
                  onClick={() => { setTimeOfDay('night'); setWeather('cloudy'); }}
                  className="flex-1 px-2 py-2 bg-indigo-100 rounded-lg text-xs"
                >
                  🌙
                </button>
                <button
                  onClick={() => { setTimeOfDay('afternoon'); setWeather('rainy'); }}
                  className="flex-1 px-2 py-2 bg-blue-100 rounded-lg text-xs"
                >
                  🌧️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Location List */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="font-bold text-gray-700 mb-3">Locaciones</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {locations.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => setSelectedLocation(loc.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    selectedLocation === loc.code
                      ? 'bg-coral text-white'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{loc.icon}</span>
                  <span className="font-medium text-sm">{loc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Area */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-700">
                {locations.find(l => l.code === selectedLocation)?.icon}{' '}
                {locations.find(l => l.code === selectedLocation)?.name}
              </h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {selectedLocation}
              </span>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden">
              <LocationScene
                locationCode={selectedLocation}
                timeOfDay={timeOfDay}
                weather={weather}
                showTruck={showTruck}
                truckColor={truckColor}
              />
            </div>
          </div>
        </div>

        {/* Grid Preview - All locations */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Todas las Locaciones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.code}
                onClick={() => setSelectedLocation(loc.code)}
                className={`bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 ${
                  selectedLocation === loc.code ? 'ring-4 ring-coral' : ''
                }`}
              >
                <div className="aspect-video">
                  <LocationScene
                    locationCode={loc.code}
                    timeOfDay={timeOfDay}
                    weather={weather}
                    showTruck={false}
                  />
                </div>
                <div className="p-2 text-center">
                  <span className="text-lg">{loc.icon}</span>
                  <p className="text-xs font-semibold text-gray-700 truncate">{loc.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
