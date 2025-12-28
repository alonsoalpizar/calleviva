// PremiumLocationScene.tsx - Componente base para escenas de simulación premium
// Arquitectura en capas: Sky -> Background -> Street -> Game Area
import React from 'react'
import {
  LocationConfig,
  GameTime,
  Weather,
  Customer,
  TruckConfig,
  BackgroundElement,
  getTimeOfDay,
  EMOJI_SIZES,
} from './types'
import SkyLayer from './SkyLayer'
import FoodTruckSlot from './FoodTruckSlot'
import CustomerQueue from './CustomerQueue'

interface PremiumLocationSceneProps {
  location: LocationConfig
  time: GameTime
  weather: Weather
  truck?: TruckConfig
  customers?: Customer[]
  onCustomerClick?: (customer: Customer) => void
  onTruckClick?: () => void
  children?: React.ReactNode
}

// Mapeo de profundidad a opacidad
const DEPTH_OPACITY: Record<string, string> = {
  far: 'opacity-30',
  mid: 'opacity-50',
  near: 'opacity-70',
}

// Componente para elementos de fondo
const BackgroundElements: React.FC<{ elements: BackgroundElement[] }> = ({ elements }) => (
  <div className="absolute bottom-32 w-full flex justify-around items-end pointer-events-none px-10">
    {elements.map((element, index) => (
      <div
        key={index}
        className={`
          ${EMOJI_SIZES[element.size] || 'text-6xl'}
          ${DEPTH_OPACITY[element.depth] || 'opacity-50'}
          emoji-shadow
          transform
        `}
        style={{
          transform: `translateY(${element.offsetY || 0}px)`,
        }}
      >
        {element.emoji}
      </div>
    ))}
  </div>
)

// Componente de calle
const Street: React.FC = () => (
  <div className="street absolute bottom-0 w-full h-32">
    <div className="road-lines" />
  </div>
)

// Área de juego (customers + truck + exit)
const GameArea: React.FC<{
  customers: Customer[]
  truck?: TruckConfig
  onCustomerClick?: (customer: Customer) => void
  onTruckClick?: () => void
}> = ({ customers, truck, onCustomerClick, onTruckClick }) => (
  <div className="absolute bottom-20 w-full flex items-end justify-center gap-8 px-10">
    {/* Cola de clientes (izquierda del truck) */}
    <CustomerQueue
      customers={customers}
      maxVisible={6}
      onCustomerClick={onCustomerClick}
    />

    {/* Food Truck (centro) */}
    <FoodTruckSlot
      config={truck}
      onClick={onTruckClick}
      showInfoOnHover
    />

    {/* Zona de salida (derecha del truck) */}
    <div className="min-w-[100px] h-24">
      {/* Los clientes salen por aquí (animación) */}
    </div>
  </div>
)

export const PremiumLocationScene: React.FC<PremiumLocationSceneProps> = ({
  location,
  time,
  weather,
  truck,
  customers = [],
  onCustomerClick,
  onTruckClick,
  children,
}) => {
  const timeOfDay = getTimeOfDay(time.hour)

  return (
    <div className="game-world relative w-full h-full overflow-hidden">
      {/* Layer 0: Sky */}
      <SkyLayer
        timeOfDay={timeOfDay}
        weather={weather}
        showClouds={weather !== 'stormy'}
        cloudCount={weather === 'cloudy' ? 5 : 3}
      />

      {/* Layer 1: Background Elements (parallax feel) */}
      <BackgroundElements elements={location.backgroundElements} />

      {/* Layer 2: Street */}
      <Street />

      {/* Layer 3: Game Area */}
      <GameArea
        customers={customers}
        truck={truck}
        onCustomerClick={onCustomerClick}
        onTruckClick={onTruckClick}
      />

      {/* Layer 4: Extra content (HUD se renderiza aparte) */}
      {children}
    </div>
  )
}

export default PremiumLocationScene
