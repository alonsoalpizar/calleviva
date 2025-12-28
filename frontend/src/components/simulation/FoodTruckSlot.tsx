// FoodTruckSlot.tsx - Slot flexible para el food truck
// Soporta: emoji default, SVG personalizado, imagen, o componente React
import React from 'react'
import { TruckConfig, TruckAsset } from './types'

interface FoodTruckSlotProps {
  config?: TruckConfig
  asset?: TruckAsset
  onClick?: () => void
  showInfoOnHover?: boolean
  className?: string
}

// Default truck asset (emoji)
const DEFAULT_ASSET: TruckAsset = {
  type: 'emoji',
  source: '🚚',
  scale: 1,
}

// Default config
const DEFAULT_CONFIG: TruckConfig = {
  asset: DEFAULT_ASSET,
  name: 'Mi Carrito',
  level: 1,
  capacity: 20,
  speed: 1.0,
  stats: {
    capacity: 25,
    speed: 50,
    appeal: 30,
  },
}

export const FoodTruckSlot: React.FC<FoodTruckSlotProps> = ({
  config = DEFAULT_CONFIG,
  asset,
  onClick,
  showInfoOnHover = true,
  className = '',
}) => {
  const truckAsset = asset || config.asset || DEFAULT_ASSET

  // Render del asset según tipo
  const renderAsset = () => {
    switch (truckAsset.type) {
      case 'emoji':
        return (
          <div
            className="text-[160px] leading-none truck-body select-none"
            style={{ transform: `scale(${truckAsset.scale || 1})` }}
          >
            {truckAsset.source}
          </div>
        )

      case 'svg':
        // SVG inline o referencia
        return (
          <div
            className="truck-body"
            style={{ transform: `scale(${truckAsset.scale || 1})` }}
            dangerouslySetInnerHTML={{ __html: truckAsset.source }}
          />
        )

      case 'image':
        return (
          <img
            src={truckAsset.source}
            alt={config.name}
            className="truck-body max-w-[200px] h-auto"
            style={{ transform: `scale(${truckAsset.scale || 1})` }}
          />
        )

      case 'component':
        // Para componentes personalizados del creador
        // El source sería el ID del componente registrado
        return (
          <div className="truck-body text-[160px]">
            {/* Fallback a emoji mientras no se cargue el componente */}
            🚚
          </div>
        )

      default:
        return <div className="text-[160px] truck-body">🚚</div>
    }
  }

  // Calcular porcentaje de progreso para la barra
  const levelProgress = Math.min(100, (config.level / 10) * 100)

  return (
    <div
      className={`
        relative group cursor-pointer
        transform hover:-translate-y-2 transition-transform duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {/* Asset del truck */}
      {renderAsset()}

      {/* Brand name overlay */}
      <div
        className="
          absolute top-[42%] left-[52%]
          transform -translate-x-1/2 -translate-y-1/2
          bg-white/95 px-3 py-1 rounded-md
          text-xs font-black text-gray-800
          shadow border border-gray-100
          rotate-1 group-hover:rotate-0 transition-transform
          pointer-events-none
        "
      >
        CalleViva
      </div>

      {/* Hover info card */}
      {showInfoOnHover && (
        <div
          className="
            absolute -right-36 top-1/2 -translate-y-1/2
            bg-white p-3 rounded-xl shadow-xl
            opacity-0 group-hover:opacity-100
            transition-all duration-300
            transform translate-x-2 group-hover:translate-x-0
            text-sm w-40 pointer-events-none z-10
          "
        >
          <div className="font-bold text-gray-800 flex items-center gap-1">
            <span>🚛</span>
            <span>{config.name}</span>
            <span className="text-xs text-gray-400">Nvl.{config.level}</span>
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Capacidad: {config.capacity}
          </div>
          <div className="text-xs text-gray-500">
            Velocidad: {config.speed.toFixed(1)}x
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>

          {/* Stats mini */}
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>⚡ {config.stats.speed}%</span>
            <span>📦 {config.stats.capacity}%</span>
            <span>✨ {config.stats.appeal}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodTruckSlot
