// LocationScenes.tsx
// Escenarios SVG para cada locación de Costa Rica
// Cada escena tiene: cielo, fondo, elementos característicos, zona del truck

import React from 'react'

interface SceneProps {
  timeOfDay?: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'
  weather?: 'sunny' | 'cloudy' | 'rainy'
  showTruck?: boolean
  truckColor?: string
}

// Colores de cielo según hora
const skyGradients = {
  morning: ['#87CEEB', '#E0F4FF'],
  noon: ['#4A90D9', '#87CEEB'],
  afternoon: ['#FF9966', '#FFE5B4'],
  evening: ['#FF6B6B', '#4A4A8A'],
  night: ['#1a1a2e', '#16213e'],
}

// Componente base del cielo
const Sky: React.FC<{ time: string; weather: string }> = ({ time, weather }) => {
  const [color1, color2] = skyGradients[time as keyof typeof skyGradients] || skyGradients.noon
  const isNight = time === 'night' || time === 'evening'

  return (
    <>
      <defs>
        <linearGradient id={`sky-${time}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <rect width="100%" height="70%" fill={`url(#sky-${time})`} />

      {/* Sol o Luna */}
      {!isNight && weather !== 'rainy' && (
        <circle cx="85%" cy="15%" r="30" fill="#FFD93D" opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      {isNight && (
        <>
          <circle cx="85%" cy="12%" r="20" fill="#F5F5DC" />
          <circle cx="10%" cy="8%" r="2" fill="white" opacity="0.8" />
          <circle cx="25%" cy="15%" r="1.5" fill="white" opacity="0.6" />
          <circle cx="40%" cy="5%" r="2" fill="white" opacity="0.7" />
          <circle cx="60%" cy="12%" r="1" fill="white" opacity="0.5" />
          <circle cx="75%" cy="8%" r="1.5" fill="white" opacity="0.6" />
        </>
      )}

      {/* Nubes */}
      {weather === 'cloudy' && (
        <>
          <ellipse cx="20%" cy="20%" rx="40" ry="20" fill="white" opacity="0.8" />
          <ellipse cx="25%" cy="18%" rx="30" ry="18" fill="white" opacity="0.9" />
          <ellipse cx="70%" cy="25%" rx="45" ry="22" fill="white" opacity="0.7" />
        </>
      )}

      {/* Lluvia */}
      {weather === 'rainy' && (
        <>
          <ellipse cx="30%" cy="15%" rx="50" ry="25" fill="#708090" opacity="0.8" />
          <ellipse cx="60%" cy="20%" rx="60" ry="28" fill="#778899" opacity="0.85" />
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1={`${5 + i * 5}%`}
              y1="30%"
              x2={`${3 + i * 5}%`}
              y2="100%"
              stroke="#6B8E9F"
              strokeWidth="1"
              opacity="0.4"
            >
              <animate attributeName="y1" values="30%;35%;30%" dur={`${0.5 + Math.random()}s`} repeatCount="indefinite" />
            </line>
          ))}
        </>
      )}
    </>
  )
}

// Food Truck genérico
const FoodTruck: React.FC<{ x: number; y: number; color?: string; scale?: number }> = ({
  x, y, color = '#FF6B6B', scale = 1
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Cuerpo del truck */}
    <rect x="0" y="20" width="120" height="60" rx="5" fill={color} stroke="#333" strokeWidth="2" />
    {/* Ventana de servicio */}
    <rect x="60" y="30" width="40" height="35" fill="#87CEEB" stroke="#333" strokeWidth="2" />
    {/* Toldo */}
    <path d="M55 25 L105 25 L110 30 L50 30 Z" fill="#FFE66D" stroke="#333" strokeWidth="1" />
    {/* Cabina */}
    <rect x="100" y="35" width="35" height="45" rx="3" fill={color} stroke="#333" strokeWidth="2" />
    <rect x="108" y="42" width="20" height="18" fill="#87CEEB" stroke="#333" strokeWidth="1" />
    {/* Ruedas */}
    <circle cx="25" cy="85" r="12" fill="#333" />
    <circle cx="25" cy="85" r="6" fill="#666" />
    <circle cx="110" cy="85" r="12" fill="#333" />
    <circle cx="110" cy="85" r="6" fill="#666" />
    {/* Detalles */}
    <text x="15" y="55" fontSize="12" fill="white" fontWeight="bold">FOOD</text>
  </g>
)

// ============================================
// ESCENARIOS ESPECÍFICOS
// ============================================

// 1. Mercado Central - Arquitectura colonial, puestos, mucha gente
export const MercadoCentralScene: React.FC<SceneProps> = ({
  timeOfDay = 'noon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Piso de adoquín */}
    <rect x="0" y="280" width="800" height="120" fill="#8B7355" />
    <pattern id="adoquin" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="38" height="38" fill="#9C8B6E" stroke="#7A6B55" strokeWidth="2" />
    </pattern>
    <rect x="0" y="280" width="800" height="120" fill="url(#adoquin)" opacity="0.5" />

    {/* Edificio del Mercado - fondo */}
    <rect x="50" y="100" width="700" height="180" fill="#E8DCC8" stroke="#333" strokeWidth="2" />
    <rect x="50" y="100" width="700" height="30" fill="#8B4513" />
    <text x="400" y="122" fontSize="18" fill="white" textAnchor="middle" fontWeight="bold">MERCADO CENTRAL</text>

    {/* Arcos de entrada */}
    {[150, 350, 550].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 280 L${x} 180 Q${x + 50} 140 ${x + 100} 180 L${x + 100} 280`} fill="#5D4E37" stroke="#333" strokeWidth="2" />
        <rect x={x + 10} y={190} width="80" height="90" fill="#2D2D2D" opacity="0.8" />
      </g>
    ))}

    {/* Puestos laterales */}
    <rect x="0" y="200" width="60" height="80" fill="#CD853F" stroke="#333" strokeWidth="2" />
    <rect x="740" y="200" width="60" height="80" fill="#CD853F" stroke="#333" strokeWidth="2" />

    {/* Frutas en puestos */}
    <circle cx="30" cy="220" r="8" fill="#FF6347" />
    <circle cx="45" cy="225" r="8" fill="#FFD700" />
    <circle cx="770" cy="220" r="8" fill="#32CD32" />

    {/* Personas caminando */}
    <ellipse cx="200" cy="350" rx="10" ry="20" fill="#333" opacity="0.6" />
    <circle cx="200" cy="325" r="8" fill="#333" opacity="0.6" />
    <ellipse cx="600" cy="355" rx="10" ry="20" fill="#333" opacity="0.5" />
    <circle cx="600" cy="330" r="8" fill="#333" opacity="0.5" />

    {showTruck && <FoodTruck x={300} y={270} color={truckColor} scale={0.9} />}
  </svg>
)

// 2. Parque La Sabana - Árboles, pista, lago al fondo
export const SabanaScene: React.FC<SceneProps> = ({
  timeOfDay = 'morning',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Montañas al fondo */}
    <polygon points="0,200 150,120 300,180 450,100 600,160 800,140 800,280 0,280" fill="#228B22" opacity="0.3" />

    {/* Lago */}
    <ellipse cx="650" cy="250" rx="120" ry="40" fill="#4A90D9" opacity="0.6" />

    {/* Césped */}
    <rect x="0" y="280" width="800" height="120" fill="#7CB342" />

    {/* Pista de correr */}
    <path d="M0 320 Q200 300 400 320 Q600 340 800 320" fill="none" stroke="#D2691E" strokeWidth="15" opacity="0.7" />

    {/* Árboles */}
    {[50, 180, 650, 750].map((x, i) => (
      <g key={i}>
        <rect x={x} y={180} width="15" height="100" fill="#8B4513" />
        <ellipse cx={x + 7} cy={160} rx="40" ry="50" fill="#228B22" />
      </g>
    ))}

    {/* Bancas */}
    <rect x="100" y="330" width="40" height="8" fill="#8B4513" />
    <rect x="500" y="335" width="40" height="8" fill="#8B4513" />

    {/* Corredores */}
    <ellipse cx="250" cy="315" rx="6" ry="15" fill="#FF6B6B" opacity="0.7" />
    <ellipse cx="550" cy="325" rx="6" ry="15" fill="#4A90D9" opacity="0.7" />

    {showTruck && <FoodTruck x={320} y={280} color={truckColor} />}
  </svg>
)

// 3. Campus UCR - Edificios universitarios, estudiantes
export const UCRScene: React.FC<SceneProps> = ({
  timeOfDay = 'noon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Edificios de la U */}
    <rect x="50" y="120" width="150" height="160" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
    <rect x="60" y="130" width="30" height="40" fill="#87CEEB" stroke="#333" />
    <rect x="100" y="130" width="30" height="40" fill="#87CEEB" stroke="#333" />
    <rect x="60" y="180" width="30" height="40" fill="#87CEEB" stroke="#333" />
    <rect x="100" y="180" width="30" height="40" fill="#87CEEB" stroke="#333" />

    <rect x="600" y="100" width="180" height="180" fill="#D3D3D3" stroke="#333" strokeWidth="2" />
    <text x="690" y="150" fontSize="14" fill="#333" textAnchor="middle">BIBLIOTECA</text>
    {[620, 670, 720].map((x, i) => (
      <rect key={i} x={x} y={160} width="25" height="50" fill="#87CEEB" stroke="#333" />
    ))}

    {/* Pretiles / área verde */}
    <rect x="0" y="280" width="800" height="120" fill="#7CB342" />

    {/* Camino */}
    <rect x="250" y="280" width="300" height="120" fill="#C0C0C0" />

    {/* Logo UCR estilizado */}
    <circle cx="400" cy="200" r="30" fill="#003366" />
    <text x="400" y="205" fontSize="12" fill="white" textAnchor="middle">UCR</text>

    {/* Estudiantes */}
    {[150, 500, 650].map((x, i) => (
      <g key={i}>
        <ellipse cx={x} cy={350} rx="8" ry="18" fill="#333" opacity="0.5" />
        <circle cx={x} cy={328} r="7" fill="#333" opacity="0.5" />
        <rect cx={x - 5} cy={340} width="10" height="15" fill="#003366" opacity="0.3" />
      </g>
    ))}

    {showTruck && <FoodTruck x={350} y={270} color={truckColor} scale={0.95} />}
  </svg>
)

// 4. Barrio Escalante - Casas coloridas, restaurantes, ambiente hipster
export const EscalanteScene: React.FC<SceneProps> = ({
  timeOfDay = 'afternoon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Casas coloridas */}
    <rect x="30" y="150" width="120" height="130" fill="#FF6B6B" stroke="#333" strokeWidth="2" />
    <polygon points="30,150 90,100 150,150" fill="#8B4513" stroke="#333" />
    <rect x="60" y="200" width="30" height="40" fill="#FFE4C4" stroke="#333" />
    <rect x="100" y="180" width="20" height="25" fill="#87CEEB" stroke="#333" />

    <rect x="170" y="140" width="100" height="140" fill="#FFE66D" stroke="#333" strokeWidth="2" />
    <polygon points="170,140 220,95 270,140" fill="#D2691E" stroke="#333" />
    <rect x="200" y="210" width="25" height="40" fill="#8B4513" stroke="#333" />

    <rect x="550" y="130" width="130" height="150" fill="#98D8AA" stroke="#333" strokeWidth="2" />
    <polygon points="550,130 615,80 680,130" fill="#8B4513" stroke="#333" />
    <rect x="580" y="200" width="30" height="50" fill="#DEB887" stroke="#333" />

    <rect x="700" y="145" width="100" height="135" fill="#DDA0DD" stroke="#333" strokeWidth="2" />
    <polygon points="700,145 750,105 800,145" fill="#A0522D" stroke="#333" />

    {/* Calle */}
    <rect x="0" y="280" width="800" height="120" fill="#4A4A4A" />
    <line x1="0" y1="340" x2="800" y2="340" stroke="#FFD700" strokeWidth="3" strokeDasharray="30,20" />

    {/* Acera */}
    <rect x="0" y="270" width="800" height="15" fill="#C0C0C0" />

    {/* Mesas de café afuera */}
    <circle cx="320" cy="265" r="15" fill="#8B4513" />
    <circle cx="360" cy="265" r="15" fill="#8B4513" />

    {/* Letrero "gastro" */}
    <rect x="290" y="180" width="80" height="30" fill="#333" />
    <text x="330" y="200" fontSize="12" fill="#FFE66D" textAnchor="middle">GASTRO</text>

    {showTruck && <FoodTruck x={450} y={270} color={truckColor} scale={0.9} />}
  </svg>
)

// 5. Estadio Saprissa - El Monstruo morado
export const SaprissaScene: React.FC<SceneProps> = ({
  timeOfDay = 'evening',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Estadio */}
    <path d="M100 280 L100 150 Q400 80 700 150 L700 280 Z" fill="#4B0082" stroke="#333" strokeWidth="3" />

    {/* Gradas */}
    <path d="M150 250 L150 170 Q400 120 650 170 L650 250 Z" fill="#6A0DAD" opacity="0.8" />

    {/* Cancha (se ve parte) */}
    <ellipse cx="400" cy="200" rx="150" ry="40" fill="#228B22" />
    <ellipse cx="400" cy="200" rx="50" ry="15" fill="none" stroke="white" strokeWidth="2" />

    {/* Luces del estadio */}
    {[200, 400, 600].map((x, i) => (
      <g key={i}>
        <rect x={x - 5} y={80} width="10" height="100" fill="#555" />
        <rect x={x - 15} y={70} width="30" height="15" fill="#FFD700" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
        </rect>
      </g>
    ))}

    {/* Texto SAPRISSA */}
    <text x="400" y="140" fontSize="32" fill="#FFD700" textAnchor="middle" fontWeight="bold">SAPRISSA</text>

    {/* Aficionados morados */}
    <rect x="0" y="280" width="800" height="120" fill="#333" />
    {[...Array(15)].map((_, i) => (
      <g key={i}>
        <ellipse cx={50 + i * 50} cy={350} rx="12" ry="25" fill="#4B0082" opacity="0.7" />
        <circle cx={50 + i * 50} cy={318} r="10" fill="#DDA0DD" opacity="0.7" />
      </g>
    ))}

    {/* Banderas moradas */}
    <rect x="100" y={300} width="5" height="40" fill="#333" />
    <polygon points="105,300 140,310 105,320" fill="#4B0082">
      <animate attributeName="points" values="105,300 140,310 105,320;105,302 138,310 105,318;105,300 140,310 105,320" dur="0.5s" repeatCount="indefinite" />
    </polygon>

    {showTruck && <FoodTruck x={550} y={270} color={truckColor || '#4B0082'} scale={0.85} />}
  </svg>
)

// 6. Estadio Morera Soto - La Liga
export const MoreraSotoScene: React.FC<SceneProps> = ({
  timeOfDay = 'evening',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Estadio - rojo y negro */}
    <path d="M100 280 L100 150 Q400 80 700 150 L700 280 Z" fill="#8B0000" stroke="#333" strokeWidth="3" />

    {/* Gradas con patrón rojinegro */}
    <path d="M150 250 L150 170 Q400 120 650 170 L650 250 Z" fill="#1C1C1C" opacity="0.9" />
    <path d="M200 240 L200 180 Q400 140 600 180 L600 240 Z" fill="#8B0000" opacity="0.7" />

    {/* Cancha */}
    <ellipse cx="400" cy="200" rx="150" ry="40" fill="#228B22" />
    <ellipse cx="400" cy="200" rx="50" ry="15" fill="none" stroke="white" strokeWidth="2" />

    {/* Luces */}
    {[200, 400, 600].map((x, i) => (
      <g key={i}>
        <rect x={x - 5} y={80} width="10" height="100" fill="#555" />
        <rect x={x - 15} y={70} width="30" height="15" fill="#FFD700" opacity="0.8" />
      </g>
    ))}

    {/* Texto LA LIGA */}
    <text x="400" y="140" fontSize="28" fill="#FFD700" textAnchor="middle" fontWeight="bold">LA LIGA</text>
    <text x="400" y="160" fontSize="12" fill="white" textAnchor="middle">ALAJUELA</text>

    {/* Aficionados rojinegros */}
    <rect x="0" y="280" width="800" height="120" fill="#333" />
    {[...Array(15)].map((_, i) => (
      <g key={i}>
        <ellipse cx={50 + i * 50} cy={350} rx="12" ry="25" fill={i % 2 === 0 ? '#8B0000' : '#1C1C1C'} opacity="0.7" />
        <circle cx={50 + i * 50} cy={318} r="10" fill="#FFDAB9" opacity="0.7" />
      </g>
    ))}

    {/* León estilizado */}
    <text x="700" y="150" fontSize="40">🦁</text>

    {showTruck && <FoodTruck x={550} y={270} color={truckColor || '#8B0000'} scale={0.85} />}
  </svg>
)

// 7. Playa Jacó - Playa, surf, fiesta
export const JacoScene: React.FC<SceneProps> = ({
  timeOfDay = 'afternoon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Mar */}
    <rect x="0" y="180" width="800" height="100" fill="#1E90FF" />
    <path d="M0 200 Q100 180 200 200 Q300 220 400 200 Q500 180 600 200 Q700 220 800 200 L800 280 L0 280 Z" fill="#4169E1" opacity="0.6">
      <animate attributeName="d"
        values="M0 200 Q100 180 200 200 Q300 220 400 200 Q500 180 600 200 Q700 220 800 200 L800 280 L0 280 Z;
                M0 200 Q100 220 200 200 Q300 180 400 200 Q500 220 600 200 Q700 180 800 200 L800 280 L0 280 Z;
                M0 200 Q100 180 200 200 Q300 220 400 200 Q500 180 600 200 Q700 220 800 200 L800 280 L0 280 Z"
        dur="3s" repeatCount="indefinite" />
    </path>

    {/* Arena */}
    <rect x="0" y="280" width="800" height="120" fill="#F4D03F" />

    {/* Palmeras */}
    {[100, 700].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 280 Q${x + 10} 200 ${x + 5} 150`} fill="none" stroke="#8B4513" strokeWidth="8" />
        <ellipse cx={x + 5} cy={140} rx="40" ry="20" fill="#228B22" transform={`rotate(-30 ${x + 5} 140)`} />
        <ellipse cx={x + 5} cy={140} rx="40" ry="20" fill="#228B22" transform={`rotate(30 ${x + 5} 140)`} />
        <ellipse cx={x + 5} cy={140} rx="40" ry="20" fill="#32CD32" transform={`rotate(0 ${x + 5} 140)`} />
      </g>
    ))}

    {/* Sombrillas de playa */}
    <polygon points="250,320 280,260 310,320" fill="#FF6B6B" />
    <line x1="280" y1="260" x2="280" y2="340" stroke="#8B4513" strokeWidth="3" />
    <polygon points="550,330 580,270 610,330" fill="#4169E1" />
    <line x1="580" y1="270" x2="580" y2="350" stroke="#8B4513" strokeWidth="3" />

    {/* Surfistas */}
    <ellipse cx="300" cy="220" rx="20" ry="5" fill="#DEB887" />
    <ellipse cx="500" cy="210" rx="20" ry="5" fill="#FF6347" />

    {/* Texto Jacó */}
    <text x="400" y="380" fontSize="24" fill="#8B4513" textAnchor="middle" fontWeight="bold">JACÓ BEACH</text>

    {showTruck && <FoodTruck x={350} y={275} color={truckColor || '#FF6347'} scale={0.9} />}
  </svg>
)

// 8. Puerto Viejo - Caribe, reggae, relax
export const PuertoViejoScene: React.FC<SceneProps> = ({
  timeOfDay = 'afternoon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Mar caribe más turquesa */}
    <rect x="0" y="180" width="800" height="100" fill="#40E0D0" />
    <path d="M0 210 Q200 190 400 210 Q600 230 800 210 L800 280 L0 280 Z" fill="#48D1CC" opacity="0.7">
      <animate attributeName="d"
        values="M0 210 Q200 190 400 210 Q600 230 800 210 L800 280 L0 280 Z;
                M0 210 Q200 230 400 210 Q600 190 800 210 L800 280 L0 280 Z;
                M0 210 Q200 190 400 210 Q600 230 800 210 L800 280 L0 280 Z"
        dur="4s" repeatCount="indefinite" />
    </path>

    {/* Arena oscura (caribeña) */}
    <rect x="0" y="280" width="800" height="120" fill="#DAA520" />

    {/* Palmeras caribeñas */}
    {[80, 720].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 280 Q${x + 15} 180 ${x + 10} 120`} fill="none" stroke="#6B4423" strokeWidth="10" />
        <ellipse cx={x + 10} cy={100} rx="50" ry="25" fill="#228B22" transform={`rotate(-45 ${x + 10} 100)`} />
        <ellipse cx={x + 10} cy={100} rx="50" ry="25" fill="#228B22" transform={`rotate(45 ${x + 10} 100)`} />
        <ellipse cx={x + 10} cy={100} rx="50" ry="25" fill="#2E8B57" />
      </g>
    ))}

    {/* Casita caribeña colorida */}
    <rect x="550" y="200" width="100" height="80" fill="#FF4500" stroke="#333" strokeWidth="2" />
    <polygon points="550,200 600,160 650,200" fill="#228B22" stroke="#333" />
    <rect x="580" y="230" width="25" height="40" fill="#8B4513" />

    {/* Hamaca */}
    <path d="M200 320 Q250 350 300 320" fill="none" stroke="#8B4513" strokeWidth="3" />
    <path d="M200 320 Q250 340 300 320" fill="#FFD700" opacity="0.5" />

    {/* Bicicleta */}
    <circle cx="400" cy="340" r="15" fill="none" stroke="#333" strokeWidth="2" />
    <circle cx="440" cy="340" r="15" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M400 340 L420 320 L440 340" fill="none" stroke="#333" strokeWidth="2" />

    {/* Colores rasta */}
    <rect x="650" y="280" width="5" height="30" fill="#FF0000" />
    <rect x="655" y="280" width="5" height="30" fill="#FFD700" />
    <rect x="660" y="280" width="5" height="30" fill="#228B22" />

    {showTruck && <FoodTruck x={250} y={275} color={truckColor || '#FFD700'} scale={0.85} />}
  </svg>
)

// 9. Plaza de la Cultura - Teatro Nacional, turistas
export const PlazaCulturaScene: React.FC<SceneProps> = ({
  timeOfDay = 'noon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Teatro Nacional */}
    <rect x="200" y="80" width="400" height="200" fill="#E8DCC8" stroke="#333" strokeWidth="2" />
    <rect x="220" y="100" width="360" height="30" fill="#D4AF37" />
    <text x="400" y="122" fontSize="16" fill="#333" textAnchor="middle" fontWeight="bold">TEATRO NACIONAL</text>

    {/* Columnas */}
    {[250, 330, 410, 490, 570].map((x, i) => (
      <rect key={i} x={x} y={130} width="20" height="100" fill="#F5F5DC" stroke="#333" />
    ))}

    {/* Puertas */}
    <rect x="340" y="180" width="50" height="70" fill="#8B4513" stroke="#333" strokeWidth="2" />
    <rect x="410" y="180" width="50" height="70" fill="#8B4513" stroke="#333" strokeWidth="2" />

    {/* Escalinatas */}
    <polygon points="200,280 250,250 550,250 600,280" fill="#C0C0C0" stroke="#333" />

    {/* Plaza / piso */}
    <rect x="0" y="280" width="800" height="120" fill="#A0A0A0" />
    <pattern id="baldosa" width="50" height="50" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="#B8B8B8" stroke="#888" strokeWidth="2" />
    </pattern>
    <rect x="0" y="280" width="800" height="120" fill="url(#baldosa)" opacity="0.4" />

    {/* Turistas */}
    <text x="150" y="330" fontSize="30">📸</text>
    <text x="650" y="350" fontSize="25">🎒</text>

    {/* Palomas */}
    <text x="300" y="320" fontSize="15">🕊️</text>
    <text x="500" y="330" fontSize="12">🕊️</text>

    {showTruck && <FoodTruck x={50} y={275} color={truckColor} scale={0.85} />}
  </svg>
)

// 10. Estadio Nacional - Eventos grandes
export const EstadioNacionalScene: React.FC<SceneProps> = ({
  timeOfDay = 'evening',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Estadio moderno */}
    <ellipse cx="400" cy="180" rx="350" ry="120" fill="#E8E8E8" stroke="#333" strokeWidth="3" />
    <ellipse cx="400" cy="180" rx="280" ry="90" fill="#228B22" />
    <ellipse cx="400" cy="180" rx="100" ry="35" fill="none" stroke="white" strokeWidth="2" />

    {/* Techo característico */}
    <path d="M50 160 Q400 50 750 160" fill="none" stroke="#4A4A4A" strokeWidth="8" />

    {/* Luces potentes */}
    {[150, 300, 500, 650].map((x, i) => (
      <g key={i}>
        <rect x={x - 3} y={60} width="6" height="100" fill="#555" />
        <rect x={x - 12} y={50} width="24" height="12" fill="#FFD700">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="0.5s" repeatCount="indefinite" />
        </rect>
      </g>
    ))}

    {/* Texto */}
    <text x="400" y="130" fontSize="20" fill="white" textAnchor="middle" fontWeight="bold">ESTADIO NACIONAL</text>

    {/* Parqueo/explanada */}
    <rect x="0" y="280" width="800" height="120" fill="#4A4A4A" />

    {/* Gente entrando */}
    {[...Array(12)].map((_, i) => (
      <g key={i}>
        <ellipse cx={60 + i * 60} cy={340} rx="10" ry="22" fill="#333" opacity="0.6" />
        <circle cx={60 + i * 60} cy={312} r="8" fill="#DEB887" opacity="0.6" />
      </g>
    ))}

    {showTruck && <FoodTruck x={550} y={270} color={truckColor} scale={0.9} />}
  </svg>
)

// 11. Feria del Agricultor - Puestos, frutas, ambiente de feria
export const FeriaAgricultorScene: React.FC<SceneProps> = ({
  timeOfDay = 'morning',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Toldos de colores */}
    {[
      { x: 50, color: '#FF6B6B' },
      { x: 200, color: '#4ECDC4' },
      { x: 350, color: '#FFE66D' },
      { x: 500, color: '#95E1D3' },
      { x: 650, color: '#F38181' },
    ].map((toldo, i) => (
      <g key={i}>
        <polygon points={`${toldo.x},180 ${toldo.x + 60},150 ${toldo.x + 120},180`} fill={toldo.color} stroke="#333" strokeWidth="2" />
        <rect x={toldo.x} y={180} width="120" height="100" fill="#DEB887" stroke="#333" strokeWidth="2" />

        {/* Productos en cada puesto */}
        <circle cx={toldo.x + 30} cy={220} r="12" fill={['#FF6347', '#FFD700', '#32CD32', '#FFA500', '#FF69B4'][i]} />
        <circle cx={toldo.x + 60} cy={225} r="10" fill={['#FFD700', '#32CD32', '#FF6347', '#FF69B4', '#FFA500'][i]} />
        <circle cx={toldo.x + 90} cy={220} r="12" fill={['#32CD32', '#FF6347', '#FFD700', '#FFA500', '#FF69B4'][i]} />
      </g>
    ))}

    {/* Piso de feria */}
    <rect x="0" y="280" width="800" height="120" fill="#A9A9A9" />

    {/* Letrero */}
    <rect x="300" y="100" width="200" height="40" fill="#228B22" />
    <text x="400" y="127" fontSize="16" fill="white" textAnchor="middle" fontWeight="bold">FERIA DEL AGRICULTOR</text>

    {/* Compradores con bolsas */}
    {[100, 280, 450, 620].map((x, i) => (
      <g key={i}>
        <ellipse cx={x} cy={340} rx="10" ry="20" fill="#333" opacity="0.5" />
        <circle cx={x} cy={315} r="8" fill="#DEB887" opacity="0.5" />
        <rect x={x + 8} y={325} width="8" height="12" fill="#8B4513" opacity="0.5" />
      </g>
    ))}

    {showTruck && <FoodTruck x={750} y={275} color={truckColor || '#228B22'} scale={0.8} />}
  </svg>
)

// 12. Aeropuerto Juan Santamaría
export const AeropuertoScene: React.FC<SceneProps> = ({
  timeOfDay = 'noon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Terminal */}
    <rect x="100" y="100" width="600" height="180" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
    <rect x="100" y="100" width="600" height="40" fill="#003366" />
    <text x="400" y="128" fontSize="18" fill="white" textAnchor="middle" fontWeight="bold">AEROPUERTO JUAN SANTAMARÍA</text>

    {/* Ventanales */}
    <rect x="150" y="150" width="500" height="80" fill="#87CEEB" stroke="#333" opacity="0.7" />

    {/* Torre de control */}
    <rect x="650" y="60" width="40" height="120" fill="#C0C0C0" stroke="#333" strokeWidth="2" />
    <rect x="640" y="50" width="60" height="20" fill="#333" />
    <rect x="655" y="70" width="20" height="30" fill="#87CEEB" stroke="#333" />

    {/* Avión despegando */}
    <g transform="translate(100, 80) rotate(-15)">
      <ellipse cx="0" cy="0" rx="40" ry="8" fill="white" stroke="#333" />
      <polygon points="-20,-5 -50,0 -20,5" fill="#E8E8E8" stroke="#333" />
      <polygon points="20,-3 40,-15 40,0" fill="#E8E8E8" stroke="#333" />
    </g>

    {/* Pista / estacionamiento */}
    <rect x="0" y="280" width="800" height="120" fill="#4A4A4A" />
    <line x1="0" y1="340" x2="800" y2="340" stroke="white" strokeWidth="2" strokeDasharray="30,20" />

    {/* Taxis */}
    <rect x="150" y={310} width="40" height="25" fill="#FF4500" rx="5" />
    <rect x="210" y={310} width="40" height="25" fill="#FF4500" rx="5" />

    {/* Turistas con maletas */}
    <text x="500" y="330" fontSize="25">🧳</text>
    <text x="550" y="340" fontSize="20">🎒</text>

    {showTruck && <FoodTruck x={350} y={275} color={truckColor} scale={0.9} />}
  </svg>
)

// 13. Manuel Antonio - Playa premium, monos
export const ManuelAntonioScene: React.FC<SceneProps> = ({
  timeOfDay = 'noon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Montañas verdes de fondo */}
    <polygon points="0,200 100,120 200,180 350,100 500,150 650,90 800,160 800,280 0,280" fill="#228B22" />
    <polygon points="0,220 150,160 300,200 450,140 600,180 800,150 800,280 0,280" fill="#2E8B57" opacity="0.8" />

    {/* Mar cristalino */}
    <rect x="0" y="200" width="800" height="80" fill="#00CED1" />
    <path d="M0 220 Q200 200 400 220 Q600 240 800 220 L800 280 L0 280 Z" fill="#20B2AA" opacity="0.6">
      <animate attributeName="d"
        values="M0 220 Q200 200 400 220 Q600 240 800 220 L800 280 L0 280 Z;
                M0 220 Q200 240 400 220 Q600 200 800 220 L800 280 L0 280 Z;
                M0 220 Q200 200 400 220 Q600 240 800 220 L800 280 L0 280 Z"
        dur="3s" repeatCount="indefinite" />
    </path>

    {/* Arena blanca */}
    <rect x="0" y="280" width="800" height="120" fill="#FFF8DC" />

    {/* Palmeras */}
    {[50, 750].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 280 Q${x + 10} 180 ${x + 5} 130`} fill="none" stroke="#8B4513" strokeWidth="10" />
        <ellipse cx={x + 5} cy={110} rx="45" ry="22" fill="#228B22" transform={`rotate(-30 ${x + 5} 110)`} />
        <ellipse cx={x + 5} cy={110} rx="45" ry="22" fill="#228B22" transform={`rotate(30 ${x + 5} 110)`} />
        <ellipse cx={x + 5} cy={110} rx="45" ry="22" fill="#32CD32" />
      </g>
    ))}

    {/* Mono! */}
    <text x="680" y="200" fontSize="35">🐒</text>

    {/* Letrero del parque */}
    <rect x="280" y="300" width="240" height="35" fill="#228B22" rx="5" />
    <text x="400" y="323" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">PARQUE MANUEL ANTONIO</text>

    {/* Turistas en la playa */}
    <ellipse cx="200" cy="330" rx="20" ry="8" fill="#FFD700" /> {/* toalla */}
    <ellipse cx="550" cy="340" rx="25" ry="10" fill="#FF6347" /> {/* toalla */}

    {showTruck && <FoodTruck x={350} y={275} color={truckColor || '#20B2AA'} scale={0.85} />}
  </svg>
)

// 14. Heredia Centro - Ciudad de las flores
export const HerediaCentroScene: React.FC<SceneProps> = ({
  timeOfDay = 'noon',
  weather = 'sunny',
  showTruck = true,
  truckColor
}) => (
  <svg viewBox="0 0 800 400" className="w-full h-full">
    <Sky time={timeOfDay} weather={weather} />

    {/* Iglesia / Catedral de fondo */}
    <rect x="300" y="100" width="200" height="180" fill="#F5F5DC" stroke="#333" strokeWidth="2" />
    <polygon points="300,100 400,40 500,100" fill="#8B4513" stroke="#333" strokeWidth="2" />
    <rect x="380" y="50" width="40" height="50" fill="#F5F5DC" stroke="#333" strokeWidth="2" />
    <polygon points="380,50 400,20 420,50" fill="#8B4513" stroke="#333" />

    {/* Cruz */}
    <line x1="400" y1="25" x2="400" y2="45" stroke="#333" strokeWidth="3" />
    <line x1="392" y1="32" x2="408" y2="32" stroke="#333" strokeWidth="3" />

    {/* Puerta de iglesia */}
    <path d="M370 280 L370 200 Q400 170 430 200 L430 280" fill="#8B4513" stroke="#333" strokeWidth="2" />

    {/* Ventanas de iglesia */}
    <ellipse cx="340" cy="180" rx="15" ry="25" fill="#87CEEB" stroke="#333" />
    <ellipse cx="460" cy="180" rx="15" ry="25" fill="#87CEEB" stroke="#333" />

    {/* Edificios coloniales a los lados */}
    <rect x="50" y="150" width="120" height="130" fill="#FFE4B5" stroke="#333" strokeWidth="2" />
    <rect x="630" y="140" width="120" height="140" fill="#DEB887" stroke="#333" strokeWidth="2" />

    {/* Parque central */}
    <rect x="0" y="280" width="800" height="120" fill="#7CB342" />

    {/* Kiosco */}
    <polygon points="600,280 650,240 700,280" fill="#8B0000" stroke="#333" strokeWidth="2" />
    <rect x="620" y="280" width="60" height="40" fill="#F5F5DC" stroke="#333" />

    {/* Bancas */}
    <rect x="150" y="310" width="50" height="10" fill="#8B4513" />
    <rect x="500" y="320" width="50" height="10" fill="#8B4513" />

    {/* Flores (ciudad de las flores) */}
    <text x="100" y="300" fontSize="20">🌸</text>
    <text x="200" y="350" fontSize="18">🌺</text>
    <text x="700" y="310" fontSize="20">🌷</text>
    <text x="750" y="350" fontSize="16">🌻</text>

    {/* Estudiantes de la UNA */}
    <text x="250" y="350" fontSize="20">📚</text>

    {showTruck && <FoodTruck x={350} y={275} color={truckColor || '#7CB342'} scale={0.9} />}
  </svg>
)

// Mapa de escenas por código de locación
export const LocationScenes: Record<string, React.FC<SceneProps>> = {
  mercado_central: MercadoCentralScene,
  sabana: SabanaScene,
  ucr: UCRScene,
  escalante: EscalanteScene,
  saprissa: SaprissaScene,
  morera_soto: MoreraSotoScene,
  jaco: JacoScene,
  puerto_viejo: PuertoViejoScene,
  plaza_cultura: PlazaCulturaScene,
  estadio_nacional: EstadioNacionalScene,
  feria_agricultor: FeriaAgricultorScene,
  aeropuerto: AeropuertoScene,
  manuel_antonio: ManuelAntonioScene,
  heredia_centro: HerediaCentroScene,
}

// Componente wrapper que selecciona la escena correcta
export const LocationScene: React.FC<SceneProps & { locationCode: string }> = ({
  locationCode,
  ...props
}) => {
  const Scene = LocationScenes[locationCode]

  if (!Scene) {
    // Escena genérica de fallback
    return (
      <svg viewBox="0 0 800 400" className="w-full h-full">
        <rect width="100%" height="100%" fill="#87CEEB" />
        <rect x="0" y="280" width="800" height="120" fill="#7CB342" />
        <text x="400" y="200" fontSize="24" fill="#333" textAnchor="middle">
          {locationCode}
        </text>
        {props.showTruck && <FoodTruck x={350} y={275} color={props.truckColor} />}
      </svg>
    )
  }

  return <Scene {...props} />
}

export default LocationScene
