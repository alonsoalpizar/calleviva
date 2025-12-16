// TruckSVG.tsx
// Componente SVG del Food Truck con capas personalizables - VERSIÓN MEJORADA
// Incluye: múltiples tipos de vehículos, más accesorios, mejor detalle visual

import { useMemo } from 'react'

interface TruckSVGProps {
  // Vehicle type determines base shape
  vehicleType?: 'cart' | 'stand' | 'food_truck' | 'bus' | 'restaurant'
  // Main color (hex)
  color?: string
  // Secondary color for accents (hex)
  accentColor?: string
  // Equipment codes from backend
  equipment?: string[]
  // Decoration codes from backend
  decorations?: string[]
  // Truck name to display
  name?: string
  // Size
  width?: number
  height?: number
  // Animation
  animated?: boolean
  // Show smoke (when grill is active)
  showSmoke?: boolean
  // Time of day affects lighting
  timeOfDay?: 'morning' | 'day' | 'evening' | 'night'
  // Custom class
  className?: string
}

// Map parameter codes to SVG layer IDs - EXPANDED
const EQUIPMENT_LAYERS: Record<string, string> = {
  // Cocina/Grill
  'improved_kitchen': 'grill',
  'cocina_mejorada': 'grill',
  'grill': 'grill',
  'parrilla': 'grill',
  // Refrigerador
  'refrigerator': 'fridge',
  'refrigerador': 'fridge',
  'fridge': 'fridge',
  // Generador
  'generator': 'generator',
  'generador': 'generator',
  // Caja registradora
  'digital_register': 'register',
  'caja_digital': 'register',
  'register': 'register',
  // Sistema de sonido
  'sound_system': 'speaker',
  'sistema_sonido': 'speaker',
  'speaker': 'speaker',
  'bocina': 'speaker',
  // Extras
  'fryer': 'fryer',
  'freidora': 'fryer',
  'coffee_machine': 'coffee',
  'cafetera': 'coffee',
  'ice_machine': 'ice',
  'maquina_hielo': 'ice',
  'ventilation': 'vent',
  'ventilacion': 'vent',
  'extractor': 'vent',
}

const DECORATION_LAYERS: Record<string, string> = {
  // Toldo
  'awning': 'awning',
  'toldo': 'awning',
  'toldo_grande': 'awning',
  'umbrella': 'awning',
  'sombrilla': 'awning',
  // Luces
  'lights': 'lights',
  'luces': 'lights',
  'luces_neon': 'lights',
  'neon': 'lights',
  // Plantas
  'plants': 'plants',
  'plantas': 'plants',
  'jardinera': 'plants',
  'macetas': 'plants',
  // Banderas
  'flag': 'flag',
  'flag_cr': 'flag',
  'bandera': 'flag',
  'bandera_cr': 'flag',
  'flag_mx': 'flag-mx',
  'bandera_mx': 'flag-mx',
  // Pizarra
  'menu_board': 'menu-board',
  'pizarra': 'menu-board',
  'pizarra_menu': 'menu-board',
  'chalkboard': 'menu-board',
  // Mesas
  'tables': 'tables',
  'mesas': 'tables',
  'seating': 'tables',
  // Extras
  'balloons': 'balloons',
  'globos': 'balloons',
  'banner': 'banner',
  'letrero': 'banner',
  'flowers': 'flowers',
  'flores': 'flowers',
  'chili_lights': 'chili-lights',
  'luces_chile': 'chili-lights',
  'surfboard': 'surfboard',
  'tabla_surf': 'surfboard',
  'antenna': 'antenna',
  'antena': 'antenna',
  'stickers': 'stickers',
  'calcas': 'stickers',
  'vinyl': 'stickers',
}

export function TruckSVG({
  vehicleType: _vehicleType = 'food_truck',
  color = '#FF6B6B',
  accentColor,
  equipment = [],
  decorations = [],
  name = 'CalleViva',
  width = 380,
  height = 260,
  animated = true,
  showSmoke = true,
  timeOfDay = 'day',
  className = '',
}: TruckSVGProps) {
  // vehicleType reserved for future vehicle variants
  void _vehicleType

  // Compute which layers to show
  const visibleEquipment = useMemo(() => {
    const layers = new Set<string>()
    equipment.forEach(code => {
      const layer = EQUIPMENT_LAYERS[code.toLowerCase()]
      if (layer) layers.add(layer)
    })
    return layers
  }, [equipment])

  const visibleDecorations = useMemo(() => {
    const layers = new Set<string>()
    decorations.forEach(code => {
      const layer = DECORATION_LAYERS[code.toLowerCase()]
      if (layer) layers.add(layer)
    })
    return layers
  }, [decorations])

  // Color utilities
  const lighterColor = useMemo(() => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const lighter = (c: number) => Math.min(255, Math.floor(c + (255 - c) * 0.35))
    return `rgb(${lighter(r)}, ${lighter(g)}, ${lighter(b)})`
  }, [color])

  const darkerColor = useMemo(() => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const darker = (c: number) => Math.floor(c * 0.65)
    return `rgb(${darker(r)}, ${darker(g)}, ${darker(b)})`
  }, [color])

  const accent = accentColor || darkerColor

  // Time-based lighting
  const ambientOpacity = timeOfDay === 'night' ? 0.3 : timeOfDay === 'evening' ? 0.15 : 0
  const windowGlow = timeOfDay === 'night' || timeOfDay === 'evening'

  return (
    <div className={`truck-svg-container ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 380 260"
        className={animated ? 'truck-animated' : ''}
        role="img"
        aria-label={`Food truck llamado ${name}`}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lighterColor} />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={darkerColor} />
          </linearGradient>
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={windowGlow ? '#FFE66D' : '#87CEEB'} stopOpacity={windowGlow ? 0.9 : 1} />
            <stop offset="100%" stopColor={windowGlow ? '#FFA500' : '#5BA3C6'} stopOpacity={windowGlow ? 0.7 : 1} />
          </linearGradient>
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="50%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#A0A0A0" />
          </linearGradient>
          <linearGradient id="counterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#6B3510" />
          </linearGradient>
          {/* Filters */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Patterns */}
          <pattern id="stripePattern" patternUnits="userSpaceOnUse" width="20" height="48">
            <rect width="10" height="48" fill="white" opacity="0.25" />
          </pattern>
        </defs>

        {/* === AMBIENT OVERLAY (night mode) === */}
        {ambientOpacity > 0 && (
          <rect x="0" y="0" width="380" height="260" fill="#1a1a2e" opacity={ambientOpacity} />
        )}

        {/* === LAYER 0: GROUND SHADOW === */}
        <ellipse
          cx="190" cy="248" rx="145" ry="10"
          fill="black" opacity="0.12"
          className={animated ? 'shadow-pulse' : ''}
        />

        {/* === LAYER 1: TABLES (behind truck) === */}
        <g id="tables" className={visibleDecorations.has('tables') ? '' : 'hidden'}>
          {/* Table 1 with umbrella */}
          <g transform="translate(0, 0)">
            <rect x="8" y="198" width="48" height="5" rx="2" fill="#8B4513" />
            <rect x="30" y="203" width="4" height="32" fill="#8B4513" />
            <line x1="32" y1="168" x2="32" y2="203" stroke="#555" strokeWidth="3" />
            <path d="M8 172 Q32 148 56 172" fill={color} />
            <path d="M8 172 Q32 152 56 172" fill="none" stroke={darkerColor} strokeWidth="1.5" />
          </g>
          {/* Table 2 (smaller, no umbrella) */}
          <g transform="translate(345, 10)">
            <rect x="0" y="188" width="30" height="4" rx="2" fill="#8B4513" />
            <rect x="13" y="192" width="4" height="25" fill="#8B4513" />
          </g>
        </g>

        {/* === LAYER 2: PLANTS === */}
        <g id="plants" className={visibleDecorations.has('plants') ? '' : 'hidden'}>
          {/* Pot 1 */}
          <g transform="translate(5, 0)">
            <path d="M5 190 L8 210 L28 210 L31 190 Z" fill="#6B4423" />
            <ellipse cx="18" cy="190" rx="13" ry="4" fill="#7D5030" />
            <circle cx="18" cy="178" r="14" fill="#228B22" />
            <circle cx="12" cy="183" r="9" fill="#32CD32" />
            <circle cx="24" cy="180" r="10" fill="#2E8B2E" />
            <circle cx="18" cy="170" r="7" fill="#228B22" />
          </g>
          {/* Pot 2 (smaller) */}
          <g transform="translate(350, 15)">
            <path d="M0 185 L2 200 L18 200 L20 185 Z" fill="#6B4423" />
            <circle cx="10" cy="177" r="9" fill="#228B22" />
            <circle cx="7" cy="180" r="6" fill="#32CD32" />
          </g>
        </g>

        {/* === LAYER 3: FLOWERS === */}
        <g id="flowers" className={visibleDecorations.has('flowers') ? '' : 'hidden'}>
          <g transform="translate(355, 5)">
            <path d="M5 185 L7 200 L18 200 L20 185 Z" fill="#8B4513" />
            <circle cx="10" cy="175" r="5" fill="#FF69B4" />
            <circle cx="16" cy="178" r="4" fill="#FFB6C1" />
            <circle cx="8" cy="180" r="4" fill="#FF1493" />
            <circle cx="12" cy="172" r="3" fill="#FFE66D" />
          </g>
        </g>

        {/* === LAYER 4: WHEELS === */}
        <g id="wheels">
          {/* Rear wheel */}
          <circle cx="85" cy="218" r="26" fill="#2D2D2D" />
          <circle cx="85" cy="218" r="20" fill="#3D3D3D" />
          <circle cx="85" cy="218" r="14" fill="#4A4A4A" />
          {/* Wheel spokes */}
          <g stroke="#5A5A5A" strokeWidth="2">
            <line x1="85" y1="204" x2="85" y2="232" />
            <line x1="71" y1="218" x2="99" y2="218" />
            <line x1="75" y1="208" x2="95" y2="228" />
            <line x1="75" y1="228" x2="95" y2="208" />
          </g>
          <circle cx="85" cy="218" r="6" fill="#666" />
          <circle cx="85" cy="218" r="3" fill="#888" />

          {/* Front wheel */}
          <circle cx="275" cy="218" r="26" fill="#2D2D2D" />
          <circle cx="275" cy="218" r="20" fill="#3D3D3D" />
          <circle cx="275" cy="218" r="14" fill="#4A4A4A" />
          <g stroke="#5A5A5A" strokeWidth="2">
            <line x1="275" y1="204" x2="275" y2="232" />
            <line x1="261" y1="218" x2="289" y2="218" />
            <line x1="265" y1="208" x2="285" y2="228" />
            <line x1="265" y1="228" x2="285" y2="208" />
          </g>
          <circle cx="275" cy="218" r="6" fill="#666" />
          <circle cx="275" cy="218" r="3" fill="#888" />
        </g>

        {/* === LAYER 5: TRUCK BODY === */}
        <g id="truck-body" filter="url(#dropShadow)">
          {/* Main body */}
          <rect
            id="body-main"
            x="45" y="80"
            width="290" height="128"
            rx="10"
            fill="url(#bodyGradient)"
          />
          {/* Body top highlight */}
          <rect
            x="45" y="80"
            width="290" height="20"
            rx="10"
            fill="white"
            opacity="0.25"
          />
          {/* Body horizontal stripe */}
          <rect
            x="45" y="140"
            width="290" height="8"
            fill={accent}
            opacity="0.4"
          />
          {/* Body bottom trim */}
          <rect
            x="45" y="193"
            width="290" height="12"
            fill={darkerColor}
            rx="3"
          />
          {/* Wheel wells */}
          <path d="M58 208 Q85 178 112 208" fill="#1a1a1a" />
          <path d="M248 208 Q275 178 302 208" fill="#1a1a1a" />
          {/* Rivets/details */}
          <circle cx="55" cy="90" r="2" fill={darkerColor} opacity="0.5" />
          <circle cx="55" cy="200" r="2" fill={darkerColor} opacity="0.5" />
          <circle cx="325" cy="90" r="2" fill={darkerColor} opacity="0.5" />
          <circle cx="325" cy="200" r="2" fill={darkerColor} opacity="0.5" />
        </g>

        {/* === LAYER 6: STICKERS/VINYL === */}
        <g id="stickers" className={visibleDecorations.has('stickers') ? '' : 'hidden'}>
          {/* Flame sticker */}
          <g transform="translate(120, 155)">
            <path d="M0 30 Q5 15 10 25 Q15 10 20 20 Q25 5 30 15 Q35 0 40 20 L40 35 L0 35 Z"
                  fill="#FF4500" opacity="0.8" />
            <path d="M5 30 Q8 20 12 27 Q16 15 20 22 Q24 10 28 18 L28 32 L5 32 Z"
                  fill="#FFD700" opacity="0.9" />
          </g>
          {/* Star stickers */}
          <text x="260" y="175" fontSize="16" opacity="0.8">&#11088;</text>
          <text x="245" y="165" fontSize="12" opacity="0.6">&#11088;</text>
        </g>

        {/* === LAYER 7: CABIN === */}
        <g id="cabin">
          {/* Cabin body */}
          <path
            id="cabin-main"
            d="M275 80 L332 80 Q350 80 350 98 L350 193 L275 193 Z"
            fill="url(#bodyGradient)"
          />
          {/* Cabin highlight */}
          <path
            d="M275 80 L332 80 Q350 80 350 98 L350 105 L275 105 Z"
            fill="white"
            opacity="0.2"
          />
          {/* Windshield */}
          <path
            d="M283 90 L328 90 Q340 90 340 102 L340 155 L283 155 Z"
            fill="url(#windowGradient)"
            opacity="0.9"
          />
          {/* Windshield frame */}
          <path
            d="M283 90 L328 90 Q340 90 340 102 L340 155 L283 155 Z"
            fill="none"
            stroke={darkerColor}
            strokeWidth="2"
          />
          {/* Windshield reflection */}
          <path
            d="M288 95 L310 95 L288 130 Z"
            fill="white"
            opacity="0.35"
          />
          {/* Windshield wiper */}
          <line x1="300" y1="150" x2="335" y2="135" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          {/* Headlight */}
          <ellipse cx="345" cy="165" rx="6" ry="10" fill="#FFE66D" filter={windowGlow ? 'url(#glow)' : ''} />
          <ellipse cx="345" cy="165" rx="3" ry="6" fill="white" opacity="0.7" />
          {/* Turn signal */}
          <rect x="343" y="180" width="5" height="8" rx="1" fill="#FFA500" />
          {/* Door handle */}
          <rect x="318" y="138" width="14" height="4" rx="2" fill={darkerColor} />
          {/* Side mirror */}
          <rect x="275" y="105" width="8" height="18" rx="2" fill="#333" />
          <rect x="273" y="108" width="4" height="12" rx="1" fill="#87CEEB" opacity="0.7" />
        </g>

        {/* === LAYER 8: SERVICE WINDOW === */}
        <g id="service-window">
          {/* Window frame */}
          <rect x="82" y="98" width="120" height="82" rx="6" fill="#2D2D2D" />
          {/* Window interior */}
          <rect x="87" y="103" width="110" height="72" rx="4" fill="#1a1a2e" />
          {/* Interior warm glow */}
          <rect x="92" y="108" width="100" height="62" rx="3" fill="#FFE66D" opacity={windowGlow ? 0.25 : 0.1} />
          {/* Shelf inside */}
          <rect x="92" y="145" width="100" height="3" fill="#444" />
          {/* Counter */}
          <rect x="77" y="175" width="130" height="15" rx="3" fill="url(#counterGradient)" />
          {/* Counter edge highlight */}
          <rect x="77" y="175" width="130" height="4" rx="2" fill="#B8860B" opacity="0.5" />
          {/* Window awning mini */}
          <path d="M82 98 L202 98 L207 88 L77 88 Z" fill={darkerColor} />
        </g>

        {/* === LAYER 9: AWNING === */}
        <g id="awning" className={visibleDecorations.has('awning') ? '' : 'hidden'}>
          {/* Support poles */}
          <rect x="68" y="42" width="4" height="48" fill="#666" rx="1" />
          <rect x="218" y="42" width="4" height="48" fill="#666" rx="1" />
          {/* Awning fabric */}
          <rect
            id="awning-fabric"
            x="63" y="35"
            width="165" height="52"
            rx="5"
            fill={color}
          />
          {/* Stripes */}
          <rect x="63" y="35" width="165" height="52" rx="5" fill="url(#stripePattern)" />
          {/* Scalloped edge */}
          <path
            d="M63 87 Q73 97 83 87 Q93 97 103 87 Q113 97 123 87 Q133 97 143 87 Q153 97 163 87 Q173 97 183 87 Q193 97 203 87 Q213 97 228 87"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Awning shadow on truck */}
          <rect x="63" y="85" width="165" height="8" fill="black" opacity="0.1" />
        </g>

        {/* === LAYER 10: GRILL/PARRILLA === */}
        <g id="grill" className={visibleEquipment.has('grill') ? '' : 'hidden'}>
          <rect x="212" y="106" width="52" height="42" rx="4" fill="#3D3D3D" />
          <rect x="217" y="111" width="42" height="32" rx="3" fill="#1a1a1a" />
          {/* Grill grates */}
          <g stroke="#555" strokeWidth="2.5">
            <line x1="222" y1="118" x2="254" y2="118" />
            <line x1="222" y1="127" x2="254" y2="127" />
            <line x1="222" y1="136" x2="254" y2="136" />
          </g>
          {/* Fire glow */}
          <rect x="220" y="114" width="36" height="26" rx="2" fill="#FF4500" opacity="0.15" />
          {/* Control knobs */}
          <circle cx="218" cy="152" r="4" fill="#333" />
          <circle cx="230" cy="152" r="4" fill="#333" />
          <circle cx="218" cy="152" r="2" fill="#FF4500" />
          {/* Smoke */}
          {showSmoke && (
            <g className="smoke-animation">
              <circle cx="228" cy="95" r="6" fill="#E8E8E8" opacity="0.5" />
              <circle cx="238" cy="88" r="8" fill="#E8E8E8" opacity="0.4" />
              <circle cx="248" cy="92" r="5" fill="#E8E8E8" opacity="0.3" />
            </g>
          )}
        </g>

        {/* === LAYER 11: FRYER === */}
        <g id="fryer" className={visibleEquipment.has('fryer') ? '' : 'hidden'}>
          <rect x="212" y="150" width="30" height="30" rx="3" fill="url(#metalGradient)" />
          <rect x="215" y="153" width="24" height="20" rx="2" fill="#8B7355" />
          <rect x="217" y="155" width="20" height="16" rx="1" fill="#DAA520" opacity="0.6" />
          {/* Basket handle */}
          <rect x="224" y="148" width="8" height="4" rx="1" fill="#333" />
          {/* Bubbles */}
          <circle cx="222" cy="163" r="2" fill="#FFD700" opacity="0.5" />
          <circle cx="230" cy="166" r="1.5" fill="#FFD700" opacity="0.4" />
        </g>

        {/* === LAYER 12: REFRIGERATOR === */}
        <g id="fridge" className={visibleEquipment.has('fridge') ? '' : 'hidden'}>
          <rect x="215" y="150" width="38" height="45" rx="4" fill="url(#metalGradient)" />
          <rect x="218" y="153" width="32" height="19" rx="2" fill="#FAFAFA" />
          <rect x="218" y="175" width="32" height="17" rx="2" fill="#FAFAFA" />
          {/* Handles */}
          <rect x="245" y="158" width="3" height="10" rx="1" fill="#888" />
          <rect x="245" y="180" width="3" height="8" rx="1" fill="#888" />
          {/* Snowflake */}
          <text x="225" y="167" fontSize="10" fill="#4ECDC4">&#10052;</text>
          {/* Temperature indicator */}
          <circle cx="223" cy="184" r="3" fill="#4ADE80" />
        </g>

        {/* === LAYER 13: ICE MACHINE === */}
        <g id="ice" className={visibleEquipment.has('ice') ? '' : 'hidden'}>
          <rect x="245" y="150" width="22" height="25" rx="3" fill="url(#metalGradient)" />
          <rect x="248" y="153" width="16" height="12" rx="2" fill="#E0F7FA" />
          <text x="252" y="163" fontSize="8" fill="#00BCD4">&#129482;</text>
          {/* Dispenser */}
          <rect x="253" y="168" width="6" height="5" rx="1" fill="#333" />
        </g>

        {/* === LAYER 14: COFFEE MACHINE === */}
        <g id="coffee" className={visibleEquipment.has('coffee') ? '' : 'hidden'}>
          <rect x="250" y="108" width="18" height="28" rx="2" fill="#4A4A4A" />
          <rect x="253" y="111" width="12" height="10" rx="1" fill="#333" />
          {/* Coffee pot */}
          <path d="M254 124 L254 132 Q254 135 257 135 L261 135 Q264 135 264 132 L264 124 Z" fill="#8B4513" opacity="0.8" />
          {/* Steam */}
          <path d="M258 105 Q260 100 258 95" fill="none" stroke="#E8E8E8" strokeWidth="1.5" opacity="0.5" />
        </g>

        {/* === LAYER 15: GENERATOR === */}
        <g id="generator" className={visibleEquipment.has('generator') ? '' : 'hidden'}>
          <rect x="48" y="172" width="28" height="23" rx="3" fill="#4A4A4A" />
          <rect x="51" y="175" width="10" height="10" rx="2" fill="#333" />
          {/* Exhaust */}
          <rect x="64" y="176" width="4" height="8" rx="1" fill="#2D2D2D" />
          {/* Power indicator */}
          <circle cx="70" cy="188" r="4" fill="#4ADE80" className="power-blink" />
          {/* Cord */}
          <path d="M76 185 Q85 190 90 185" fill="none" stroke="#333" strokeWidth="2" />
        </g>

        {/* === LAYER 16: VENTILATION === */}
        <g id="vent" className={visibleEquipment.has('vent') ? '' : 'hidden'}>
          <rect x="140" y="70" width="35" height="12" rx="2" fill="#4A4A4A" />
          <g stroke="#333" strokeWidth="2">
            <line x1="147" y1="72" x2="147" y2="80" />
            <line x1="155" y1="72" x2="155" y2="80" />
            <line x1="163" y1="72" x2="163" y2="80" />
          </g>
          {/* Vent steam */}
          <path d="M155 65 Q157 58 155 52" fill="none" stroke="#E8E8E8" strokeWidth="2" opacity="0.3" />
        </g>

        {/* === LAYER 17: LIGHTS STRING === */}
        <g id="lights" className={visibleDecorations.has('lights') ? '' : 'hidden'}>
          {/* String */}
          <path
            d="M52 76 Q95 66 140 76 Q185 66 230 76 Q265 68 285 76"
            fill="none"
            stroke="#333"
            strokeWidth="2"
          />
          {/* Bulbs */}
          <circle cx="70" cy="73" r="5" fill="#FFE66D" className="light-glow" filter={windowGlow ? 'url(#glow)' : ''} />
          <circle cx="105" cy="69" r="5" fill="#FF6B6B" className="light-glow" style={{ animationDelay: '0.15s' }} filter={windowGlow ? 'url(#glow)' : ''} />
          <circle cx="140" cy="73" r="5" fill="#4ECDC4" className="light-glow" style={{ animationDelay: '0.3s' }} filter={windowGlow ? 'url(#glow)' : ''} />
          <circle cx="175" cy="69" r="5" fill="#E879F9" className="light-glow" style={{ animationDelay: '0.45s' }} filter={windowGlow ? 'url(#glow)' : ''} />
          <circle cx="210" cy="73" r="5" fill="#FFE66D" className="light-glow" style={{ animationDelay: '0.6s' }} filter={windowGlow ? 'url(#glow)' : ''} />
          <circle cx="245" cy="70" r="5" fill="#FF6B6B" className="light-glow" style={{ animationDelay: '0.75s' }} filter={windowGlow ? 'url(#glow)' : ''} />
          <circle cx="275" cy="74" r="5" fill="#4ECDC4" className="light-glow" style={{ animationDelay: '0.9s' }} filter={windowGlow ? 'url(#glow)' : ''} />
        </g>

        {/* === LAYER 18: CHILI LIGHTS === */}
        <g id="chili-lights" className={visibleDecorations.has('chili-lights') ? '' : 'hidden'}>
          <path
            d="M52 76 Q140 62 230 76 Q270 68 285 76"
            fill="none"
            stroke="#2D5016"
            strokeWidth="2"
          />
          {/* Chili peppers */}
          <text x="65" y="78" fontSize="14" className="chili-swing">&#127798;</text>
          <text x="100" y="72" fontSize="14" className="chili-swing" style={{ animationDelay: '0.2s' }}>&#127798;</text>
          <text x="135" y="78" fontSize="14" className="chili-swing" style={{ animationDelay: '0.4s' }}>&#127798;</text>
          <text x="170" y="72" fontSize="14" className="chili-swing" style={{ animationDelay: '0.6s' }}>&#127798;</text>
          <text x="205" y="78" fontSize="14" className="chili-swing" style={{ animationDelay: '0.8s' }}>&#127798;</text>
          <text x="240" y="73" fontSize="14" className="chili-swing" style={{ animationDelay: '1s' }}>&#127798;</text>
        </g>

        {/* === LAYER 19: SPEAKER === */}
        <g id="speaker" className={visibleEquipment.has('speaker') ? '' : 'hidden'}>
          <rect x="258" y="93" width="26" height="20" rx="3" fill="#2D2D2D" />
          <circle cx="271" cy="103" r="7" fill="#444" />
          <circle cx="271" cy="103" r="4" fill="#555" />
          <circle cx="271" cy="103" r="1.5" fill="#666" />
          {/* Sound waves */}
          <g className="sound-wave">
            <path d="M287 98 Q293 103 287 108" fill="none" stroke="#4ECDC4" strokeWidth="2" opacity="0.6" />
            <path d="M292 94 Q301 103 292 112" fill="none" stroke="#4ECDC4" strokeWidth="2" opacity="0.4" />
          </g>
        </g>

        {/* === LAYER 20: FLAG CR === */}
        <g id="flag" className={visibleDecorations.has('flag') ? '' : 'hidden'}>
          {/* Pole */}
          <rect x="328" y="32" width="4" height="52" fill="#8B4513" rx="1" />
          <circle cx="330" cy="30" r="4" fill="#DAA520" />
          {/* Costa Rica flag */}
          <g className="flag-wave">
            <rect x="334" y="34" width="38" height="7" fill="#002B7F" />
            <rect x="334" y="41" width="38" height="5" fill="#FFFFFF" />
            <rect x="334" y="46" width="38" height="9" fill="#CE1126" />
            <rect x="334" y="55" width="38" height="5" fill="#FFFFFF" />
            <rect x="334" y="60" width="38" height="7" fill="#002B7F" />
          </g>
        </g>

        {/* === LAYER 21: FLAG MX === */}
        <g id="flag-mx" className={visibleDecorations.has('flag-mx') ? '' : 'hidden'}>
          <rect x="328" y="32" width="4" height="52" fill="#8B4513" rx="1" />
          <circle cx="330" cy="30" r="4" fill="#DAA520" />
          <g className="flag-wave">
            <rect x="334" y="34" width="13" height="33" fill="#006341" />
            <rect x="347" y="34" width="12" height="33" fill="#FFFFFF" />
            <rect x="359" y="34" width="13" height="33" fill="#CE1126" />
            {/* Escudo simplified */}
            <circle cx="353" cy="50" r="5" fill="#8B4513" opacity="0.7" />
          </g>
        </g>

        {/* === LAYER 22: BALLOONS === */}
        <g id="balloons" className={visibleDecorations.has('balloons') ? '' : 'hidden'}>
          {/* Strings */}
          <path d="M55 85 Q52 50 55 30" fill="none" stroke="#888" strokeWidth="1" />
          <path d="M65 85 Q68 55 65 35" fill="none" stroke="#888" strokeWidth="1" />
          <path d="M75 85 Q72 60 78 40" fill="none" stroke="#888" strokeWidth="1" />
          {/* Balloons */}
          <ellipse cx="55" cy="22" rx="12" ry="15" fill="#FF6B6B" className="balloon-float" />
          <ellipse cx="65" cy="27" rx="12" ry="15" fill="#4ECDC4" className="balloon-float" style={{ animationDelay: '0.3s' }} />
          <ellipse cx="78" cy="32" rx="12" ry="15" fill="#FFE66D" className="balloon-float" style={{ animationDelay: '0.6s' }} />
          {/* Highlights */}
          <ellipse cx="51" cy="18" rx="4" ry="5" fill="white" opacity="0.4" />
          <ellipse cx="61" cy="23" rx="4" ry="5" fill="white" opacity="0.4" />
          <ellipse cx="74" cy="28" rx="4" ry="5" fill="white" opacity="0.4" />
        </g>

        {/* === LAYER 23: BANNER === */}
        <g id="banner" className={visibleDecorations.has('banner') ? '' : 'hidden'}>
          {/* Banner shape */}
          <path
            d="M90 55 L200 55 L205 70 L200 85 L90 85 L95 70 Z"
            fill={color}
            filter="url(#dropShadow)"
          />
          <path
            d="M90 55 L200 55 L205 70 L200 85 L90 85 L95 70 Z"
            fill="none"
            stroke={darkerColor}
            strokeWidth="2"
          />
          {/* Banner text */}
          <text
            x="147" y="75"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="white"
            fontFamily="system-ui"
          >
            ¡ABIERTO!
          </text>
        </g>

        {/* === LAYER 24: SURFBOARD === */}
        <g id="surfboard" className={visibleDecorations.has('surfboard') ? '' : 'hidden'}>
          <ellipse
            cx="35" cy="140" rx="8" ry="45"
            fill="#FFE66D"
            transform="rotate(-15, 35, 140)"
          />
          <ellipse
            cx="35" cy="140" rx="5" ry="35"
            fill="#FF6B6B"
            opacity="0.6"
            transform="rotate(-15, 35, 140)"
          />
          {/* Stripe */}
          <line x1="30" y1="100" x2="40" y2="180" stroke="#4ECDC4" strokeWidth="3" transform="rotate(-15, 35, 140)" />
        </g>

        {/* === LAYER 25: ANTENNA === */}
        <g id="antenna" className={visibleDecorations.has('antenna') ? '' : 'hidden'}>
          <line x1="320" y1="80" x2="320" y2="40" stroke="#444" strokeWidth="2" />
          <circle cx="320" cy="38" r="4" fill="#FF4444" className="antenna-blink" />
          {/* Signal waves */}
          <path d="M325 45 Q330 38 325 31" fill="none" stroke="#FF4444" strokeWidth="1" opacity="0.5" />
          <path d="M329 48 Q336 38 329 28" fill="none" stroke="#FF4444" strokeWidth="1" opacity="0.3" />
        </g>

        {/* === LAYER 26: MENU BOARD === */}
        <g id="menu-board" className={visibleDecorations.has('menu-board') ? '' : 'hidden'}>
          {/* Frame */}
          <rect x="32" y="92" width="42" height="60" rx="3" fill="#3D2817" />
          {/* Chalkboard */}
          <rect x="35" y="95" width="36" height="54" rx="2" fill="#1a1a1a" />
          {/* Header */}
          <text x="38" y="109" fontSize="8" fill="#FFE66D" fontWeight="bold">MENU</text>
          <line x1="38" y1="113" x2="67" y2="113" stroke="#FFE66D" strokeWidth="0.5" />
          {/* Items */}
          <text x="38" y="124" fontSize="6" fill="#FFFFFF">Pinto   2500</text>
          <text x="38" y="134" fontSize="6" fill="#FFFFFF">Empan.  1500</text>
          <text x="38" y="144" fontSize="6" fill="#FFFFFF">Agua D. 1000</text>
          {/* Chalk effect */}
          <circle cx="60" cy="142" r="1" fill="#FFFFFF" opacity="0.3" />
          <circle cx="45" cy="138" r="0.5" fill="#FFFFFF" opacity="0.2" />
        </g>

        {/* === LAYER 27: REGISTER (on counter) === */}
        <g id="register" className={visibleEquipment.has('register') ? '' : 'hidden'}>
          <rect x="168" y="162" width="25" height="18" rx="2" fill="#333" />
          <rect x="170" y="164" width="21" height="9" rx="1" fill="#1a1a1a" />
          {/* Screen glow */}
          <rect x="171" y="165" width="19" height="7" rx="1" fill="#4ADE80" opacity="0.8" />
          {/* Amount display */}
          <text x="173" y="171" fontSize="5" fill="#1a1a1a" fontWeight="bold" fontFamily="monospace">2,500</text>
          {/* Buttons */}
          <rect x="170" y="175" width="5" height="3" rx="0.5" fill="#666" />
          <rect x="177" y="175" width="5" height="3" rx="0.5" fill="#666" />
          <rect x="184" y="175" width="5" height="3" rx="0.5" fill="#4ADE80" />
        </g>

        {/* === LAYER 28: TRUCK NAME === */}
        <g id="truck-name">
          {/* Name plate background */}
          <rect
            x="102" y="152"
            width="84" height="26"
            rx="6"
            fill="white"
            opacity="0.97"
            filter="url(#dropShadow)"
          />
          {/* Decorative border */}
          <rect
            x="104" y="154"
            width="80" height="22"
            rx="4"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.5"
          />
          {/* Name text */}
          <text
            id="name-text"
            x="144" y="170"
            textAnchor="middle"
            fontSize="12"
            fontWeight="900"
            fill="#333"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {name.length > 11 ? name.substring(0, 11) + '...' : name}
          </text>
        </g>
      </svg>

      <style>{`
        .truck-svg-container {
          display: inline-block;
          line-height: 0;
        }

        .truck-animated {
          animation: truckFloat 4s ease-in-out infinite;
        }

        @keyframes truckFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .shadow-pulse {
          animation: shadowPulse 4s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.12; }
          50% { transform: scaleX(0.92); opacity: 0.08; }
        }

        .smoke-animation circle {
          animation: smokeRise 2.5s ease-out infinite;
        }

        .smoke-animation circle:nth-child(1) { animation-delay: 0s; }
        .smoke-animation circle:nth-child(2) { animation-delay: 0.8s; }
        .smoke-animation circle:nth-child(3) { animation-delay: 1.6s; }

        @keyframes smokeRise {
          0% { opacity: 0.5; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.8); }
        }

        .light-glow {
          animation: lightPulse 1.2s ease-in-out infinite;
        }

        @keyframes lightPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .power-blink {
          animation: powerBlink 2s ease-in-out infinite;
        }

        @keyframes powerBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }

        .antenna-blink {
          animation: antennaBlink 1s ease-in-out infinite;
        }

        @keyframes antennaBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .sound-wave path {
          animation: soundPulse 1.5s ease-out infinite;
        }

        .sound-wave path:nth-child(2) {
          animation-delay: 0.3s;
        }

        @keyframes soundPulse {
          0% { opacity: 0.6; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(5px); }
        }

        .flag-wave {
          animation: flagWave 3s ease-in-out infinite;
          transform-origin: left center;
        }

        @keyframes flagWave {
          0%, 100% { transform: skewY(0deg); }
          25% { transform: skewY(2deg); }
          75% { transform: skewY(-2deg); }
        }

        .balloon-float {
          animation: balloonFloat 3s ease-in-out infinite;
        }

        @keyframes balloonFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
        }

        .chili-swing {
          animation: chiliSwing 2s ease-in-out infinite;
          transform-origin: top center;
        }

        @keyframes chiliSwing {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .hidden {
          display: none;
        }
      `}</style>
    </div>
  )
}

export default TruckSVG
