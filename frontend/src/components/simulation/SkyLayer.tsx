// SkyLayer.tsx - Cielo dinámico con nubes animadas y sol/luna
import React from 'react'
import { TimeOfDay, Weather, SKY_GRADIENTS } from './types'

interface SkyLayerProps {
  timeOfDay: TimeOfDay
  weather: Weather
  showClouds?: boolean
  cloudCount?: number
}

// Posición del sol según hora
const SUN_POSITIONS: Record<TimeOfDay, { top: string; right: string }> = {
  dawn: { top: '20%', right: '70%' },
  morning: { top: '12%', right: '50%' },
  noon: { top: '8%', right: '40%' },
  afternoon: { top: '10%', right: '25%' },
  evening: { top: '25%', right: '10%' },
  night: { top: '15%', right: '20%' },
}

export const SkyLayer: React.FC<SkyLayerProps> = ({
  timeOfDay,
  weather,
  showClouds = true,
  cloudCount = 3,
}) => {
  const [color1, color2] = SKY_GRADIENTS[timeOfDay] || SKY_GRADIENTS.noon
  const sunPos = SUN_POSITIONS[timeOfDay]
  const isNight = timeOfDay === 'night'
  const isEvening = timeOfDay === 'evening'
  const showSun = !isNight && weather !== 'stormy'
  const showMoon = isNight

  // Generar nubes con diferentes velocidades y posiciones
  const clouds = Array.from({ length: cloudCount }, (_, i) => ({
    id: i,
    width: [160, 200, 140, 180, 120][i % 5],
    height: [56, 64, 48, 60, 44][i % 5],
    top: `${8 + (i * 5) % 15}%`,
    duration: 35 + i * 10,
    delay: -(i * 15),
    opacity: 0.5 + (i % 3) * 0.1,
  }))

  return (
    <div
      className="absolute inset-0 sky-container overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${color1}, ${color2})`,
      }}
    >
      {/* Sol */}
      {showSun && (
        <div
          className="absolute text-7xl transition-all duration-1000 ease-out sun-glow"
          style={{ top: sunPos.top, right: sunPos.right }}
        >
          {weather === 'cloudy' ? '🌤️' : '☀️'}
        </div>
      )}

      {/* Luna y estrellas */}
      {showMoon && (
        <>
          <div
            className="absolute text-6xl moon-glow"
            style={{ top: '12%', right: '15%' }}
          >
            🌙
          </div>
          {/* Estrellas */}
          <div className="absolute text-sm opacity-60" style={{ top: '8%', left: '10%' }}>✨</div>
          <div className="absolute text-xs opacity-50" style={{ top: '15%', left: '25%' }}>⭐</div>
          <div className="absolute text-sm opacity-40" style={{ top: '5%', left: '40%' }}>✨</div>
          <div className="absolute text-xs opacity-60" style={{ top: '12%', left: '60%' }}>⭐</div>
          <div className="absolute text-sm opacity-50" style={{ top: '8%', left: '75%' }}>✨</div>
        </>
      )}

      {/* Atardecer - colores extra */}
      {isEvening && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(255,107,107,0.3), transparent)',
          }}
        />
      )}

      {/* Nubes */}
      {showClouds && weather !== 'stormy' && (
        <>
          {clouds.map((cloud) => (
            <div
              key={cloud.id}
              className="cloud"
              style={{
                width: cloud.width,
                height: cloud.height,
                top: cloud.top,
                opacity: weather === 'cloudy' ? cloud.opacity + 0.2 : cloud.opacity,
                animationDuration: `${cloud.duration}s`,
                animationDelay: `${cloud.delay}s`,
                background: weather === 'rainy' ? '#9ca3af' : 'white',
              }}
            />
          ))}
        </>
      )}

      {/* Nubes de tormenta */}
      {weather === 'stormy' && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              background: 'linear-gradient(to bottom, #374151, #6b7280)',
              opacity: 0.9,
            }}
          />
          {/* Relámpago ocasional - esto se anima con CSS */}
          <div className="absolute inset-0 bg-white opacity-0 animate-pulse" />
        </>
      )}

      {/* Lluvia */}
      {(weather === 'rainy' || weather === 'stormy') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 bg-blue-300 opacity-30"
              style={{
                height: '20px',
                left: `${(i * 3.5) % 100}%`,
                top: '-20px',
                animation: `fall ${0.5 + Math.random() * 0.5}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* CSS para lluvia */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }
      `}</style>
    </div>
  )
}

export default SkyLayer
