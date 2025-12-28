// SimulationHUD.tsx - HUD overlay para la simulación
// Glass-morphism style como el mock premium
import React from 'react'
import {
  LocationConfig,
  GameTime,
  Weather,
  GameEvent,
  InventoryItem,
  formatGameTime,
  getAmPm,
} from './types'

interface SimulationHUDProps {
  location: LocationConfig
  time: GameTime
  weather: Weather
  dayNumber: number
  money: number
  reputation: number
  sales: number
  inventory: InventoryItem[]
  events: GameEvent[]
  playing: boolean
  speed: 1 | 2 | 5
  onPlayPause: () => void
  onSpeedChange: (speed: 1 | 2 | 5) => void
}

// Iconos de clima
const WEATHER_ICONS: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  stormy: '⛈️',
}

const WEATHER_LABELS: Record<Weather, string> = {
  sunny: 'Soleado',
  cloudy: 'Nublado',
  rainy: 'Lluvioso',
  stormy: 'Tormenta',
}

// Componente de ubicación (top-left)
const LocationPanel: React.FC<{
  location: LocationConfig
  dayNumber: number
  weather: Weather
}> = ({ location, dayNumber, weather }) => (
  <div className="glass-panel rounded-2xl p-3 flex gap-3 items-center">
    <div className="bg-blue-100 p-2 rounded-xl text-2xl">
      {location.icon}
    </div>
    <div>
      <h2 className="font-black text-gray-800">{location.name}</h2>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Día {dayNumber}</span>
        <span>•</span>
        <span>
          {WEATHER_ICONS[weather]} {WEATHER_LABELS[weather]}
        </span>
      </div>
    </div>
  </div>
)

// Componente de reloj (top-center)
const GameClock: React.FC<{ time: GameTime }> = ({ time }) => (
  <div className="glass-panel px-6 py-3 rounded-full shadow-xl">
    <div
      className="text-2xl font-black tracking-wide text-gray-800"
      style={{ fontFamily: "'Outfit', 'Nunito', sans-serif" }}
    >
      <span>{formatGameTime(time)}</span>
      <span className="text-sm text-gray-400 font-normal ml-1">
        {getAmPm(time.hour)}
      </span>
    </div>
  </div>
)

// Componente de stats (top-right)
const StatsPanel: React.FC<{
  money: number
  reputation: number
  sales: number
}> = ({ money, reputation, sales }) => (
  <div className="glass-panel rounded-2xl p-2 flex gap-2">
    <div className="bg-green-100 px-4 py-2 rounded-xl text-center">
      <div className="text-xs text-green-600 font-bold uppercase">Dinero</div>
      <div
        className="text-xl font-black text-green-700"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        ₡{money.toLocaleString()}
      </div>
    </div>
    <div className="bg-amber-100 px-4 py-2 rounded-xl text-center">
      <div className="text-xs text-amber-600 font-bold uppercase">Rep</div>
      <div
        className="text-xl font-black text-amber-700"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        ⭐ {reputation.toFixed(1)}
      </div>
    </div>
    <div className="bg-purple-100 px-4 py-2 rounded-xl text-center">
      <div className="text-xs text-purple-600 font-bold uppercase">Ventas</div>
      <div
        className="text-xl font-black text-purple-700"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {sales}
      </div>
    </div>
  </div>
)

// Componente de activity log (bottom-left)
const ActivityLog: React.FC<{ events: GameEvent[] }> = ({ events }) => (
  <div className="glass-panel rounded-2xl p-3 w-72 max-h-40 overflow-hidden">
    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
      📜 Actividad
    </h3>
    <div className="log-feed space-y-1 text-sm max-h-28 overflow-y-auto">
      {events.length === 0 ? (
        <div className="text-gray-400 italic text-xs">
          Esperando inicio del día...
        </div>
      ) : (
        events.map((event, i) => (
          <div
            key={i}
            className={`text-xs ${
              event.color === 'green'
                ? 'text-green-600'
                : event.color === 'blue'
                ? 'text-blue-600'
                : event.color === 'red'
                ? 'text-red-500'
                : event.color === 'yellow'
                ? 'text-amber-600'
                : 'text-purple-600'
            }`}
          >
            <span className="text-gray-400 font-mono">
              [{formatGameTime(event.timestamp)}]
            </span>{' '}
            {event.icon} {event.message}
          </div>
        ))
      )}
    </div>
  </div>
)

// Componente de controles (bottom-center)
const GameControls: React.FC<{
  playing: boolean
  speed: 1 | 2 | 5
  onPlayPause: () => void
  onSpeedChange: (speed: 1 | 2 | 5) => void
}> = ({ playing, speed, onPlayPause, onSpeedChange }) => (
  <div className="glass-panel p-3 rounded-2xl flex items-center gap-3">
    <button
      onClick={onPlayPause}
      className="btn-game text-white px-8 py-3 rounded-xl font-black text-lg shadow-lg flex items-center gap-2"
    >
      <span>{playing ? '⏸️' : '▶️'}</span>
      <span>{playing ? 'Pausar' : 'Iniciar Día'}</span>
    </button>

    <div className="w-px h-10 bg-gray-300" />

    <div className="flex gap-1">
      {([1, 2, 5] as const).map((s) => (
        <button
          key={s}
          onClick={() => onSpeedChange(s)}
          className={`speed-btn ${speed === s ? 'active' : ''}`}
        >
          {s}x
        </button>
      ))}
    </div>
  </div>
)

// Componente de inventario (bottom-right)
const InventoryPanel: React.FC<{ inventory: InventoryItem[] }> = ({
  inventory,
}) => (
  <div className="glass-panel rounded-2xl p-3 flex gap-4">
    {inventory.map((item) => (
      <div key={item.product.code} className="text-center relative">
        <div className="text-3xl emoji-shadow">{item.product.emoji}</div>
        <div className="text-xs font-bold text-gray-600">
          {item.product.name.slice(0, 6)}
        </div>
        <div
          className={`
            absolute -top-1 -right-1 text-white text-[10px] w-5 h-5
            rounded-full flex items-center justify-center font-bold
            ${
              item.quantity > 5
                ? 'bg-green-500'
                : item.quantity > 0
                ? 'bg-amber-500'
                : 'bg-red-500'
            }
          `}
        >
          {item.quantity}
        </div>
      </div>
    ))}
  </div>
)

// Componente principal del HUD
export const SimulationHUD: React.FC<SimulationHUDProps> = ({
  location,
  time,
  weather,
  dayNumber,
  money,
  reputation,
  sales,
  inventory,
  events,
  playing,
  speed,
  onPlayPause,
  onSpeedChange,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* TOP HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        <LocationPanel
          location={location}
          dayNumber={dayNumber}
          weather={weather}
        />
        <GameClock time={time} />
        <StatsPanel money={money} reputation={reputation} sales={sales} />
      </div>

      {/* CENTER: Notification zone (se usa desde fuera) */}
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        {/* Toasts/notifications appear here via portal */}
      </div>

      {/* BOTTOM HUD */}
      <div className="flex justify-between items-end pointer-events-auto">
        <ActivityLog events={events} />
        <GameControls
          playing={playing}
          speed={speed}
          onPlayPause={onPlayPause}
          onSpeedChange={onSpeedChange}
        />
        <InventoryPanel inventory={inventory} />
      </div>
    </div>
  )
}

export default SimulationHUD
