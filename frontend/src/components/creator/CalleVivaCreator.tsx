import React, { useState, useEffect, lazy, Suspense } from 'react'

// Lazy load 3D Creators para mejor rendimiento
const Character3DCreator = lazy(() => import('./Character3DCreator'))
const GameScene3D = lazy(() => import('../game3d/GameScene3D'))
const ApprovedCharacters3D = lazy(() => import('./ApprovedCharacters3D'))

// ============================================
// CALLEVIVA CREATOR - VERSIÓN MEGA EXPANDIDA
// 4 Dimensiones con muchísimas opciones
// ============================================

// Types
interface CatalogOption {
  id: string
  name: string
  color?: string
  icon?: string
}

interface CatalogSection {
  [key: string]: CatalogOption[]
}

interface Catalogs {
  personajes: CatalogSection
  ingredientes: CatalogSection
  artefactos: CatalogSection
}

interface CreationData {
  name: string
  description: string
  [key: string]: string
}

interface Creation {
  type: string
  data: CreationData
  id: string
  creator: string
  createdAt: string
}

interface Section {
  id: keyof Catalogs
  name: string
  icon: string
  color: string
  catalog: CatalogSection
  svg: React.FC<{ data: CreationData }>
}

// ==================== CATÁLOGOS MEGA EXPANDIDOS ====================

const CATALOGS: Catalogs = {
  personajes: {
    base: [
      { id: 'round', name: 'Redonda' }, { id: 'oval', name: 'Ovalada' }, { id: 'square', name: 'Cuadrada' },
      { id: 'triangle', name: 'Triangular' }, { id: 'heart', name: 'Corazón' }, { id: 'long', name: 'Alargada' },
      { id: 'wide', name: 'Ancha' }, { id: 'diamond', name: 'Diamante' },
    ],
    skinTone: [
      { id: 'pale', name: 'Pálida', color: '#FFF0E6' }, { id: 'light', name: 'Clara', color: '#FDEBD0' },
      { id: 'medium', name: 'Media', color: '#E59866' }, { id: 'tan', name: 'Canela', color: '#CA6F1E' },
      { id: 'brown', name: 'Morena', color: '#A04000' }, { id: 'dark', name: 'Oscura', color: '#6E2C00' },
      { id: 'olive', name: 'Oliva', color: '#C5B358' }, { id: 'golden', name: 'Dorada', color: '#DAA520' },
      { id: 'pink', name: 'Rosada', color: '#FFB6C1' }, { id: 'zombie', name: 'Zombie', color: '#98D8AA' },
    ],
    eyes: [
      { id: 'normal', name: 'Normales' }, { id: 'big', name: 'Grandes' }, { id: 'small', name: 'Pequeños' },
      { id: 'tired', name: 'Cansados' }, { id: 'angry', name: 'Enojados' }, { id: 'happy', name: 'Felices' },
      { id: 'wink', name: 'Guiño' }, { id: 'surprised', name: 'Sorprendidos' }, { id: 'sleepy', name: 'Dormilones' },
      { id: 'crying', name: 'Llorando' }, { id: 'hearts', name: 'Corazones' }, { id: 'stars', name: 'Estrellas' },
      { id: 'dizzy', name: 'Mareados' }, { id: 'suspicious', name: 'Sospechosos' }, { id: 'crazy', name: 'Locos' },
    ],
    eyeColor: [
      { id: 'brown', name: 'Café', color: '#5D4037' }, { id: 'black', name: 'Negro', color: '#212121' },
      { id: 'blue', name: 'Azul', color: '#1976D2' }, { id: 'green', name: 'Verde', color: '#388E3C' },
      { id: 'hazel', name: 'Miel', color: '#FFA000' }, { id: 'gray', name: 'Gris', color: '#757575' },
      { id: 'red', name: 'Rojo', color: '#C62828' }, { id: 'purple', name: 'Morado', color: '#7B1FA2' },
    ],
    eyebrows: [
      { id: 'normal', name: 'Normales' }, { id: 'thick', name: 'Gruesas' }, { id: 'thin', name: 'Finas' },
      { id: 'angry', name: 'Enojadas' }, { id: 'worried', name: 'Preocupadas' }, { id: 'raised', name: 'Levantadas' },
      { id: 'unibrow', name: 'Uniceja' }, { id: 'none', name: 'Sin cejas' },
    ],
    nose: [
      { id: 'normal', name: 'Normal' }, { id: 'big', name: 'Grande' }, { id: 'small', name: 'Pequeña' },
      { id: 'pointed', name: 'Puntiaguda' }, { id: 'round', name: 'Redonda' }, { id: 'flat', name: 'Chata' },
      { id: 'pig', name: 'De Cerdo' }, { id: 'clown', name: 'De Payaso' },
    ],
    mouth: [
      { id: 'smile', name: 'Sonrisa' }, { id: 'big_smile', name: 'Sonrisota' }, { id: 'tooth', name: 'Un Diente' },
      { id: 'missing_teeth', name: 'Sin Dientes' }, { id: 'open', name: 'Abierta' }, { id: 'serious', name: 'Seria' },
      { id: 'sad', name: 'Triste' }, { id: 'surprised', name: 'Sorprendida' }, { id: 'tongue', name: 'Lengua Afuera' },
      { id: 'kiss', name: 'Besito' }, { id: 'drool', name: 'Babeando' }, { id: 'vampire', name: 'Vampiro' },
      { id: 'gold_tooth', name: 'Diente de Oro' }, { id: 'braces', name: 'Brackets' },
    ],
    hair: [
      { id: 'none', name: 'Calvo' }, { id: 'buzz', name: 'Rapado' }, { id: 'short', name: 'Corto' },
      { id: 'spiky', name: 'Parado' }, { id: 'fade', name: 'Degradado' }, { id: 'side_part', name: 'Raya Lado' },
      { id: 'slicked', name: 'Hacia Atrás' }, { id: 'long', name: 'Largo' }, { id: 'curly', name: 'Rizado' },
      { id: 'afro', name: 'Afro' }, { id: 'mohawk', name: 'Mohicano' }, { id: 'ponytail', name: 'Cola' },
      { id: 'pigtails', name: 'Colitas' }, { id: 'braids', name: 'Trenzas' }, { id: 'bun', name: 'Moño' },
      { id: 'man_bun', name: 'Moño Samurai' }, { id: 'messy', name: 'Despeinado' }, { id: 'mullet', name: 'Mullet' },
      { id: 'wavy', name: 'Ondulado' }, { id: 'bob', name: 'Carré' }, { id: 'pixie', name: 'Pixie' },
      { id: 'bangs', name: 'Flequillo' }, { id: 'space_buns', name: 'Moños Dobles' }, { id: 'dreads', name: 'Rastas' },
      { id: 'emo', name: 'Emo' }, { id: 'perm', name: 'Permanente' },
    ],
    hairColor: [
      { id: 'black', name: 'Negro', color: '#1C1C1C' }, { id: 'dark_brown', name: 'Café Oscuro', color: '#3E2723' },
      { id: 'brown', name: 'Café', color: '#5D4037' }, { id: 'light_brown', name: 'Café Claro', color: '#8D6E63' },
      { id: 'blonde', name: 'Rubio', color: '#F9A825' }, { id: 'platinum', name: 'Platino', color: '#ECEFF1' },
      { id: 'red', name: 'Rojo', color: '#C62828' }, { id: 'orange', name: 'Naranja', color: '#E65100' },
      { id: 'gray', name: 'Canoso', color: '#9E9E9E' }, { id: 'white', name: 'Blanco', color: '#FAFAFA' },
      { id: 'blue', name: 'Azul', color: '#1976D2' }, { id: 'pink', name: 'Rosado', color: '#E91E63' },
      { id: 'purple', name: 'Morado', color: '#7B1FA2' }, { id: 'green', name: 'Verde', color: '#388E3C' },
    ],
    facialHair: [
      { id: 'none', name: 'Ninguno' }, { id: 'stubble', name: 'Barba Corta' }, { id: 'beard', name: 'Barba' },
      { id: 'long_beard', name: 'Barba Larga' }, { id: 'mustache', name: 'Bigote' },
      { id: 'handlebar', name: 'Bigote Manubrio' }, { id: 'goatee', name: 'Candado' },
      { id: 'sideburns', name: 'Patillas' }, { id: 'santa', name: 'Santa Claus' },
    ],
    accessory: [
      { id: 'none', name: 'Ninguno' }, { id: 'cap', name: 'Gorra' }, { id: 'cap_back', name: 'Gorra al Revés' },
      { id: 'snapback', name: 'Snapback' }, { id: 'visor', name: 'Visera' }, { id: 'hat', name: 'Sombrero' },
      { id: 'cowboy', name: 'Vaquero' }, { id: 'sombrero_mx', name: 'Sombrero Mexicano' }, { id: 'straw_hat', name: 'Paja' },
      { id: 'chef', name: 'Gorro Chef' }, { id: 'hair_net', name: 'Redecilla' }, { id: 'beanie', name: 'Gorro Lana' },
      { id: 'beret', name: 'Boina' }, { id: 'turban', name: 'Turbante' }, { id: 'headband', name: 'Cintillo' },
      { id: 'headphones', name: 'Audífonos' }, { id: 'bandana', name: 'Bandana' }, { id: 'crown', name: 'Corona' },
      { id: 'tiara', name: 'Tiara' }, { id: 'flower', name: 'Flor' }, { id: 'bow', name: 'Lazo' },
      { id: 'helmet', name: 'Casco' }, { id: 'hard_hat', name: 'Casco Obra' }, { id: 'party_hat', name: 'Gorro Fiesta' },
      { id: 'santa_hat', name: 'Gorro Santa' }, { id: 'graduation', name: 'Birrete' }, { id: 'pirate', name: 'Pirata' },
    ],
    glasses: [
      { id: 'none', name: 'Ninguno' }, { id: 'normal', name: 'Normales' }, { id: 'round', name: 'Redondos' },
      { id: 'square', name: 'Cuadrados' }, { id: 'sunglasses', name: 'De Sol' }, { id: 'aviator', name: 'Aviador' },
      { id: 'cat_eye', name: 'Ojo de Gato' }, { id: 'monocle', name: 'Monóculo' }, { id: 'nerd', name: 'De Nerd' },
      { id: 'heart', name: 'Corazón' }, { id: 'star', name: 'Estrellas' }, { id: 'eye_patch', name: 'Parche' },
      { id: 'vr', name: 'Realidad Virtual' },
    ],
    earrings: [
      { id: 'none', name: 'Ninguno' }, { id: 'stud', name: 'Punto' }, { id: 'hoop', name: 'Aro' },
      { id: 'big_hoop', name: 'Aro Grande' }, { id: 'dangle', name: 'Colgante' }, { id: 'cross', name: 'Cruz' },
      { id: 'star', name: 'Estrella' }, { id: 'diamond', name: 'Diamante' }, { id: 'feather', name: 'Pluma' },
    ],
    extra: [
      { id: 'none', name: 'Ninguno' }, { id: 'freckles', name: 'Pecas' }, { id: 'blush', name: 'Rubor' },
      { id: 'scar', name: 'Cicatriz' }, { id: 'bandaid', name: 'Curita' }, { id: 'mole', name: 'Lunar' },
      { id: 'tattoo', name: 'Tatuaje' }, { id: 'makeup', name: 'Maquillaje' }, { id: 'sweat', name: 'Sudor' },
      { id: 'dirty', name: 'Sucio' }, { id: 'mask', name: 'Mascarilla' }, { id: 'bruise', name: 'Moretón' },
      { id: 'wrinkles', name: 'Arrugas' }, { id: 'dimples', name: 'Hoyuelos' },
    ],
    role: [
      { id: 'customer', name: 'Cliente', icon: '🧑' }, { id: 'regular', name: 'Cliente Frecuente', icon: '⭐' },
      { id: 'critic', name: 'Crítico', icon: '📝' }, { id: 'vendor', name: 'Vendedor', icon: '👨‍🍳' },
      { id: 'helper', name: 'Ayudante', icon: '🙋' }, { id: 'wanderer', name: 'Vagabundo', icon: '🚶' },
      { id: 'tourist', name: 'Turista', icon: '📸' }, { id: 'influencer', name: 'Influencer', icon: '📱' },
      { id: 'inspector', name: 'Inspector', icon: '🔍' }, { id: 'thief', name: 'Ladrón', icon: '🦹' },
      { id: 'musician', name: 'Músico', icon: '🎸' }, { id: 'delivery', name: 'Repartidor', icon: '🛵' },
      { id: 'competitor', name: 'Competidor', icon: '😈' }, { id: 'child', name: 'Niño', icon: '👶' },
      { id: 'elder', name: 'Abuelito', icon: '👴' }, { id: 'athlete', name: 'Deportista', icon: '🏃' },
    ],
    mood: [
      { id: 'happy', name: 'Feliz', icon: '😊' }, { id: 'hungry', name: 'Hambriento', icon: '🤤' },
      { id: 'angry', name: 'Enojado', icon: '😠' }, { id: 'sad', name: 'Triste', icon: '😢' },
      { id: 'excited', name: 'Emocionado', icon: '🤩' }, { id: 'tired', name: 'Cansado', icon: '😴' },
      { id: 'confused', name: 'Confundido', icon: '😕' }, { id: 'love', name: 'Enamorado', icon: '😍' },
      { id: 'scared', name: 'Asustado', icon: '😱' }, { id: 'cool', name: 'Cool', icon: '😎' },
    ],
  },

  ingredientes: {
    category: [
      { id: 'vegetable', name: 'Vegetal', icon: '🥬' }, { id: 'fruit', name: 'Fruta', icon: '🍎' },
      { id: 'protein', name: 'Carne', icon: '🥩' }, { id: 'chicken', name: 'Pollo', icon: '🍗' },
      { id: 'seafood', name: 'Mariscos', icon: '🦐' }, { id: 'fish', name: 'Pescado', icon: '🐟' },
      { id: 'dairy', name: 'Lácteo', icon: '🧀' }, { id: 'egg', name: 'Huevo', icon: '🥚' },
      { id: 'grain', name: 'Grano', icon: '🌾' }, { id: 'rice', name: 'Arroz', icon: '🍚' },
      { id: 'beans', name: 'Frijoles', icon: '🫘' }, { id: 'bread', name: 'Pan', icon: '🍞' },
      { id: 'tortilla', name: 'Tortilla', icon: '🫓' }, { id: 'spice', name: 'Especia', icon: '🌶️' },
      { id: 'herb', name: 'Hierba', icon: '🌿' }, { id: 'sauce', name: 'Salsa', icon: '🫙' },
      { id: 'oil', name: 'Aceite', icon: '🫒' }, { id: 'drink', name: 'Bebida', icon: '🥤' },
      { id: 'coffee', name: 'Café', icon: '☕' }, { id: 'alcohol', name: 'Licor', icon: '🍺' },
      { id: 'sweet', name: 'Dulce', icon: '🍬' }, { id: 'ice', name: 'Hielo', icon: '🧊' },
      { id: 'nut', name: 'Nuez', icon: '🥜' }, { id: 'mushroom', name: 'Hongo', icon: '🍄' },
    ],
    shape: [
      { id: 'whole', name: 'Entero' }, { id: 'half', name: 'Mitad' }, { id: 'chopped', name: 'Picado' },
      { id: 'diced', name: 'En Cubos' }, { id: 'sliced', name: 'Rodajas' }, { id: 'julienne', name: 'Juliana' },
      { id: 'shredded', name: 'Rallado' }, { id: 'ground', name: 'Molido' }, { id: 'mashed', name: 'Puré' },
      { id: 'liquid', name: 'Líquido' }, { id: 'powder', name: 'Polvo' }, { id: 'leaves', name: 'Hojas' },
      { id: 'bunch', name: 'Manojo' },
    ],
    color: [
      { id: 'green', name: 'Verde', color: '#4CAF50' }, { id: 'dark_green', name: 'Verde Oscuro', color: '#2E7D32' },
      { id: 'light_green', name: 'Verde Claro', color: '#8BC34A' }, { id: 'red', name: 'Rojo', color: '#F44336' },
      { id: 'dark_red', name: 'Rojo Oscuro', color: '#B71C1C' }, { id: 'yellow', name: 'Amarillo', color: '#FFEB3B' },
      { id: 'orange', name: 'Naranja', color: '#FF9800' }, { id: 'brown', name: 'Café', color: '#795548' },
      { id: 'tan', name: 'Beige', color: '#D7CCC8' }, { id: 'white', name: 'Blanco', color: '#FAFAFA' },
      { id: 'cream', name: 'Crema', color: '#FFF8E1' }, { id: 'purple', name: 'Morado', color: '#9C27B0' },
      { id: 'pink', name: 'Rosado', color: '#E91E63' }, { id: 'black', name: 'Negro', color: '#212121' },
      { id: 'golden', name: 'Dorado', color: '#FFD700' },
    ],
    flavor: [
      { id: 'savory', name: 'Salado' }, { id: 'sweet', name: 'Dulce' }, { id: 'spicy', name: 'Picante' },
      { id: 'very_spicy', name: 'Muy Picante' }, { id: 'sour', name: 'Ácido' }, { id: 'bitter', name: 'Amargo' },
      { id: 'umami', name: 'Umami' }, { id: 'fresh', name: 'Fresco' }, { id: 'smoky', name: 'Ahumado' },
      { id: 'herbal', name: 'Herbal' }, { id: 'tangy', name: 'Agridulce' }, { id: 'bland', name: 'Suave' },
    ],
    origin: [
      { id: 'local', name: 'Costa Rica', icon: '🇨🇷' }, { id: 'mexican', name: 'México', icon: '🇲🇽' },
      { id: 'american', name: 'USA', icon: '🇺🇸' }, { id: 'asian', name: 'Asia', icon: '🌏' },
      { id: 'european', name: 'Europa', icon: '🇪🇺' }, { id: 'caribbean', name: 'Caribe', icon: '🏝️' },
      { id: 'south_american', name: 'Sudamérica', icon: '🌎' },
    ],
    state: [
      { id: 'fresh', name: 'Fresco' }, { id: 'frozen', name: 'Congelado' }, { id: 'cooked', name: 'Cocido' },
      { id: 'fried', name: 'Frito' }, { id: 'grilled', name: 'A la Parrilla' }, { id: 'raw', name: 'Crudo' },
      { id: 'dried', name: 'Seco' }, { id: 'canned', name: 'Enlatado' }, { id: 'pickled', name: 'Encurtido' },
    ],
  },

  artefactos: {
    type: [
      { id: 'table', name: 'Mesa', icon: '🪵' }, { id: 'chair', name: 'Silla', icon: '💺' },
      { id: 'bench', name: 'Banca', icon: '🛋️' }, { id: 'counter', name: 'Mostrador', icon: '🧱' },
      { id: 'shelf', name: 'Estante', icon: '📚' }, { id: 'plant', name: 'Planta', icon: '🌱' },
      { id: 'flower', name: 'Flores', icon: '💐' }, { id: 'sign', name: 'Letrero', icon: '🪧' },
      { id: 'banner', name: 'Banner', icon: '🏳️' }, { id: 'flag', name: 'Bandera', icon: '🚩' },
      { id: 'grill', name: 'Parrilla', icon: '🔥' }, { id: 'fryer', name: 'Freidora', icon: '🍟' },
      { id: 'oven', name: 'Horno', icon: '🫕' }, { id: 'cooler', name: 'Hielera', icon: '🧊' },
      { id: 'trash', name: 'Basurero', icon: '🗑️' }, { id: 'lighting', name: 'Luz', icon: '💡' },
      { id: 'string_lights', name: 'Luces Serie', icon: '✨' }, { id: 'lantern', name: 'Farol', icon: '🏮' },
      { id: 'umbrella', name: 'Sombrilla', icon: '⛱️' }, { id: 'awning', name: 'Toldo', icon: '🎪' },
      { id: 'speaker', name: 'Parlante', icon: '🔊' }, { id: 'radio', name: 'Radio', icon: '📻' },
      { id: 'fan', name: 'Ventilador', icon: '🌀' }, { id: 'menu_board', name: 'Pizarra Menú', icon: '📋' },
      { id: 'tip_jar', name: 'Propinas', icon: '🫙' }, { id: 'condiments', name: 'Condimentos', icon: '🧂' },
      { id: 'cash_register', name: 'Caja', icon: '🧾' }, { id: 'blender', name: 'Licuadora', icon: '🫗' },
      { id: 'coffee_machine', name: 'Cafetera', icon: '☕' }, { id: 'fire_extinguisher', name: 'Extintor', icon: '🧯' },
    ],
    material: [
      { id: 'wood', name: 'Madera', color: '#8D6E63' }, { id: 'dark_wood', name: 'Madera Oscura', color: '#4E342E' },
      { id: 'light_wood', name: 'Madera Clara', color: '#D7CCC8' }, { id: 'bamboo', name: 'Bambú', color: '#A5D6A7' },
      { id: 'metal', name: 'Metal', color: '#78909C' }, { id: 'chrome', name: 'Cromado', color: '#CFD8DC' },
      { id: 'copper', name: 'Cobre', color: '#D84315' }, { id: 'gold', name: 'Dorado', color: '#FFD700' },
      { id: 'rusty', name: 'Oxidado', color: '#BF360C' },
      { id: 'plastic_red', name: 'Plástico Rojo', color: '#E53935' },
      { id: 'plastic_blue', name: 'Plástico Azul', color: '#1E88E5' },
      { id: 'plastic_green', name: 'Plástico Verde', color: '#43A047' },
      { id: 'plastic_yellow', name: 'Plástico Amarillo', color: '#FDD835' },
      { id: 'fabric_red', name: 'Tela Roja', color: '#C62828' },
      { id: 'fabric_blue', name: 'Tela Azul', color: '#1565C0' },
      { id: 'fabric_striped', name: 'Tela Rayas', color: '#FF8A65' },
      { id: 'glass', name: 'Vidrio', color: '#80DEEA' }, { id: 'ceramic', name: 'Cerámica', color: '#FFCCBC' },
      { id: 'neon', name: 'Neón', color: '#E040FB' },
    ],
    size: [
      { id: 'tiny', name: 'Diminuto' }, { id: 'small', name: 'Pequeño' }, { id: 'medium', name: 'Mediano' },
      { id: 'large', name: 'Grande' }, { id: 'huge', name: 'Enorme' },
    ],
    style: [
      { id: 'rustic', name: 'Rústico' }, { id: 'modern', name: 'Moderno' }, { id: 'vintage', name: 'Vintage' },
      { id: 'tropical', name: 'Tropical' }, { id: 'industrial', name: 'Industrial' }, { id: 'bohemian', name: 'Bohemio' },
      { id: 'minimalist', name: 'Minimalista' }, { id: 'colorful', name: 'Colorido' }, { id: 'elegant', name: 'Elegante' },
      { id: 'street', name: 'Callejero' }, { id: 'retro', name: 'Retro' }, { id: 'cozy', name: 'Acogedor' },
    ],
    condition: [
      { id: 'new', name: 'Nuevo' }, { id: 'good', name: 'Buen Estado' }, { id: 'used', name: 'Usado' },
      { id: 'worn', name: 'Desgastado' }, { id: 'broken', name: 'Roto' }, { id: 'shiny', name: 'Brillante' },
    ],
  },
}

// ==================== SVG COMPONENTS ====================

const PersonajeSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const skinColor = CATALOGS.personajes.skinTone.find(s => s.id === data.skinTone)?.color || '#E59866'
  const hairColor = CATALOGS.personajes.hairColor.find(h => h.id === data.hairColor)?.color || '#1C1C1C'
  const eyeColor = CATALOGS.personajes.eyeColor.find(e => e.id === data.eyeColor)?.color || '#5D4037'

  // Generate lighter/darker variations for gradients
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
    const B = Math.min(255, (num & 0x0000FF) + amt)
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
  }
  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, (num >> 16) - amt)
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
    const B = Math.max(0, (num & 0x0000FF) - amt)
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
  }

  const skinLight = lightenColor(skinColor, 15)
  const skinDark = darkenColor(skinColor, 15)
  const hairLight = lightenColor(hairColor, 20)
  const hairDark = darkenColor(hairColor, 15)
  const uid = `p${data.skinTone}${data.hairColor}`.replace(/[^a-zA-Z0-9]/g, '')

  // Reusable defs for this character
  const defs = (
    <defs>
      {/* Skin gradient */}
      <radialGradient id={`skin${uid}`} cx="40%" cy="30%" r="70%">
        <stop offset="0%" stopColor={skinLight} />
        <stop offset="100%" stopColor={skinColor} />
      </radialGradient>
      {/* Hair gradient */}
      <linearGradient id={`hair${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={hairLight} />
        <stop offset="50%" stopColor={hairColor} />
        <stop offset="100%" stopColor={hairDark} />
      </linearGradient>
      {/* Drop shadow */}
      <filter id={`shadow${uid}`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
      </filter>
      {/* Soft inner shadow for depth */}
      <filter id={`innerShadow${uid}`}>
        <feOffset dx="0" dy="2" />
        <feGaussianBlur stdDeviation="2" result="shadow" />
        <feComposite in="SourceGraphic" in2="shadow" operator="over" />
      </filter>
      {/* Eye shine */}
      <radialGradient id={`eyeShine${uid}`} cx="30%" cy="30%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      {/* Lip gloss */}
      <linearGradient id={`lips${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C62828" />
        <stop offset="50%" stopColor="#8B0000" />
        <stop offset="100%" stopColor="#5D0000" />
      </linearGradient>
    </defs>
  )

  const faces: Record<string, JSX.Element> = {
    round: <circle cx="100" cy="100" r="65" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    oval: <ellipse cx="100" cy="105" rx="50" ry="68" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    square: <rect x="45" y="40" width="110" height="120" rx="15" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    triangle: <path d="M100 40 Q165 165 100 165 Q35 165 100 40" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    heart: <path d="M100 165 C40 120 40 60 70 50 C90 45 100 60 100 60 C100 60 110 45 130 50 C160 60 160 120 100 165" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    long: <ellipse cx="100" cy="100" rx="40" ry="75" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    wide: <ellipse cx="100" cy="100" rx="70" ry="50" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
    diamond: <polygon points="100,30 155,100 100,170 45,100" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="2.5" filter={`url(#shadow${uid})`} />,
  }

  // Eye with shine helper
  const eyeWithShine = (cx: number, cy: number, rx: number, ry: number, irisR: number, pupilR: number) => (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white" stroke="#555" strokeWidth="2" />
      <ellipse cx={cx} cy={cy} rx={rx-1} ry={ry-1} fill={`url(#eyeShine${uid})`} />
      <circle cx={cx} cy={cy+2} r={irisR} fill={eyeColor} />
      <circle cx={cx} cy={cy+2} r={pupilR} fill="#111" />
      <circle cx={cx-irisR/3} cy={cy-irisR/3} r={pupilR/2} fill="white" opacity="0.9" />
      <circle cx={cx+irisR/3} cy={cy+irisR/3} r={pupilR/4} fill="white" opacity="0.5" />
    </>
  )

  const eyes: Record<string, JSX.Element> = {
    normal: <>{eyeWithShine(70, 90, 12, 14, 7, 4)}{eyeWithShine(130, 90, 12, 14, 7, 4)}</>,
    big: <>{eyeWithShine(65, 90, 18, 20, 11, 6)}{eyeWithShine(135, 90, 18, 20, 11, 6)}</>,
    small: <>{eyeWithShine(70, 90, 7, 8, 4, 2)}{eyeWithShine(130, 90, 7, 8, 4, 2)}</>,
    tired: <><ellipse cx="70" cy="95" rx="12" ry="7" fill="white" stroke="#555" strokeWidth="2" /><circle cx="70" cy="96" r="4" fill={eyeColor} /><circle cx="70" cy="96" r="2" fill="#111" /><ellipse cx="130" cy="95" rx="12" ry="7" fill="white" stroke="#555" strokeWidth="2" /><circle cx="130" cy="96" r="4" fill={eyeColor} /><circle cx="130" cy="96" r="2" fill="#111" /><path d="M56 100 Q70 107 84 100" fill="none" stroke="#9E9E9E" strokeWidth="2" /><path d="M116 100 Q130 107 144 100" fill="none" stroke="#9E9E9E" strokeWidth="2" /></>,
    angry: <>{eyeWithShine(70, 92, 11, 11, 6, 3)}{eyeWithShine(130, 92, 11, 11, 6, 3)}<path d="M55 78 L88 88" stroke="#333" strokeWidth="4" strokeLinecap="round" /><path d="M145 78 L112 88" stroke="#333" strokeWidth="4" strokeLinecap="round" /></>,
    happy: <><path d="M56 90 Q70 80 84 90" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" /><path d="M116 90 Q130 80 144 90" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" /></>,
    wink: <>{eyeWithShine(70, 90, 12, 14, 7, 4)}<path d="M116 92 Q130 84 144 92" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" /></>,
    surprised: <>{eyeWithShine(70, 90, 16, 18, 9, 5)}{eyeWithShine(130, 90, 16, 18, 9, 5)}</>,
    sleepy: <><path d="M56 92 L84 92" stroke="#333" strokeWidth="4" strokeLinecap="round" /><path d="M116 92 L144 92" stroke="#333" strokeWidth="4" strokeLinecap="round" /></>,
    crying: <>{eyeWithShine(70, 90, 12, 14, 7, 4)}{eyeWithShine(130, 90, 12, 14, 7, 4)}<path d="M65 104 Q60 125 65 145" fill="none" stroke="#4FC3F7" strokeWidth="4" strokeLinecap="round" opacity="0.8" /><path d="M135 104 Q140 125 135 145" fill="none" stroke="#4FC3F7" strokeWidth="4" strokeLinecap="round" opacity="0.8" /></>,
    hearts: <><path d="M70,82 C62,72 48,82 70,100 C92,82 78,72 70,82" fill="url(#lips${uid})" filter={`url(#shadow${uid})`} /><path d="M130,82 C122,72 108,82 130,100 C152,82 138,72 130,82" fill="url(#lips${uid})" filter={`url(#shadow${uid})`} /></>,
    stars: <><polygon points="70,78 74,90 86,90 76,98 80,110 70,102 60,110 64,98 54,90 66,90" fill="#FFD700" stroke="#FFA000" strokeWidth="1" filter={`url(#shadow${uid})`} /><polygon points="130,78 134,90 146,90 136,98 140,110 130,102 120,110 124,98 114,90 126,90" fill="#FFD700" stroke="#FFA000" strokeWidth="1" filter={`url(#shadow${uid})`} /></>,
    dizzy: <><path d="M58 80 L82 104" stroke="#333" strokeWidth="4" strokeLinecap="round" /><path d="M58 104 L82 80" stroke="#333" strokeWidth="4" strokeLinecap="round" /><path d="M118 80 L142 104" stroke="#333" strokeWidth="4" strokeLinecap="round" /><path d="M118 104 L142 80" stroke="#333" strokeWidth="4" strokeLinecap="round" /></>,
    suspicious: <><ellipse cx="70" cy="95" rx="12" ry="6" fill="white" stroke="#555" strokeWidth="2" /><circle cx="76" cy="95" r="4" fill={eyeColor} /><circle cx="76" cy="95" r="2" fill="#111" /><ellipse cx="130" cy="95" rx="12" ry="6" fill="white" stroke="#555" strokeWidth="2" /><circle cx="136" cy="95" r="4" fill={eyeColor} /><circle cx="136" cy="95" r="2" fill="#111" /></>,
    crazy: <>{eyeWithShine(65, 88, 16, 16, 10, 5)}{eyeWithShine(135, 92, 10, 10, 6, 3)}</>,
  }

  const noses: Record<string, JSX.Element> = {
    normal: <><ellipse cx="100" cy="115" rx="7" ry="5" fill={skinDark} opacity="0.3" /><ellipse cx="100" cy="114" rx="6" ry="4" fill={skinColor} /><ellipse cx="98" cy="113" rx="2" ry="1" fill={skinLight} opacity="0.5" /></>,
    big: <><ellipse cx="100" cy="116" rx="14" ry="10" fill={skinDark} opacity="0.3" /><ellipse cx="100" cy="115" rx="13" ry="9" fill={skinColor} /><ellipse cx="96" cy="112" rx="4" ry="2" fill={skinLight} opacity="0.5" /></>,
    small: <><circle cx="100" cy="115" r="4" fill={skinDark} opacity="0.3" /><circle cx="100" cy="114" r="3" fill={skinColor} /></>,
    pointed: <><path d="M100 105 L94 122 L106 122 Z" fill={skinDark} opacity="0.3" /><path d="M100 106 L95 120 L105 120 Z" fill={skinColor} /><path d="M98 110 L100 108 L102 110" fill={skinLight} opacity="0.4" /></>,
    round: <><circle cx="100" cy="116" r="10" fill={skinDark} opacity="0.3" /><circle cx="100" cy="115" r="9" fill={skinColor} /><ellipse cx="96" cy="112" rx="3" ry="2" fill={skinLight} opacity="0.5" /></>,
    flat: <><ellipse cx="100" cy="119" rx="12" ry="4" fill={skinDark} opacity="0.3" /><ellipse cx="100" cy="118" rx="11" ry="3" fill={skinColor} /></>,
    pig: <><ellipse cx="100" cy="116" rx="12" ry="10" fill={skinDark} opacity="0.3" /><ellipse cx="100" cy="115" rx="11" ry="9" fill={skinColor} /><circle cx="94" cy="116" r="3" fill={skinDark} /><circle cx="106" cy="116" r="3" fill={skinDark} /></>,
    clown: <><circle cx="100" cy="116" r="12" fill="#B71C1C" /><circle cx="100" cy="115" r="11" fill="#E53935" /><ellipse cx="96" cy="112" rx="4" ry="3" fill="#EF5350" opacity="0.7" /></>,
  }

  const eyebrows: Record<string, JSX.Element | null> = {
    none: null,
    normal: <><path d="M55 75 Q70 70 85 75" fill="none" stroke="#333" strokeWidth="3" /><path d="M115 75 Q130 70 145 75" fill="none" stroke="#333" strokeWidth="3" /></>,
    thick: <><path d="M52 75 Q70 65 88 75" fill="#333" stroke="#333" strokeWidth="5" /><path d="M112 75 Q130 65 148 75" fill="#333" stroke="#333" strokeWidth="5" /></>,
    thin: <><path d="M58 78 Q70 74 82 78" fill="none" stroke="#333" strokeWidth="1" /><path d="M118 78 Q130 74 142 78" fill="none" stroke="#333" strokeWidth="1" /></>,
    angry: <><path d="M55 82 L85 72" stroke="#333" strokeWidth="4" /><path d="M145 82 L115 72" stroke="#333" strokeWidth="4" /></>,
    worried: <><path d="M55 72 L85 82" stroke="#333" strokeWidth="3" /><path d="M145 72 L115 82" stroke="#333" strokeWidth="3" /></>,
    raised: <><path d="M55 68 Q70 62 85 70" fill="none" stroke="#333" strokeWidth="3" /><path d="M115 70 Q130 62 145 68" fill="none" stroke="#333" strokeWidth="3" /></>,
    unibrow: <path d="M52 75 Q70 68 100 72 Q130 68 148 75" fill="none" stroke="#333" strokeWidth="4" />,
  }

  const facialHairs: Record<string, JSX.Element | null> = {
    none: null,
    stubble: <><circle cx="75" cy="145" r="1" fill="#333" /><circle cx="85" cy="148" r="1" fill="#333" /><circle cx="95" cy="150" r="1" fill="#333" /><circle cx="105" cy="150" r="1" fill="#333" /><circle cx="115" cy="148" r="1" fill="#333" /><circle cx="125" cy="145" r="1" fill="#333" /><circle cx="80" cy="155" r="1" fill="#333" /><circle cx="100" cy="158" r="1" fill="#333" /><circle cx="120" cy="155" r="1" fill="#333" /></>,
    beard: <path d="M60 135 Q60 165 100 170 Q140 165 140 135 L140 145 Q100 158 60 145 Z" fill={hairColor} stroke="#333" strokeWidth="2" />,
    long_beard: <path d="M55 125 Q50 190 100 200 Q150 190 145 125 L145 135 Q100 160 55 135 Z" fill={hairColor} stroke="#333" strokeWidth="2" />,
    goatee: <ellipse cx="100" cy="158" rx="12" ry="10" fill={hairColor} stroke="#333" strokeWidth="2" />,
    mustache: <><path d="M70 128 Q85 138 100 128 Q115 138 130 128" fill={hairColor} stroke="#333" strokeWidth="2" /><circle cx="70" cy="128" r="3" fill={hairColor} /><circle cx="130" cy="128" r="3" fill={hairColor} /></>,
    handlebar: <><path d="M70 128 Q85 140 100 128 Q115 140 130 128" fill={hairColor} stroke="#333" strokeWidth="3" /><path d="M68 128 Q50 120 45 135" fill="none" stroke={hairColor} strokeWidth="4" /><path d="M132 128 Q150 120 155 135" fill="none" stroke={hairColor} strokeWidth="4" /></>,
    sideburns: <><rect x="35" y="85" width="12" height="45" rx="4" fill={hairColor} stroke="#333" strokeWidth="2" /><rect x="153" y="85" width="12" height="45" rx="4" fill={hairColor} stroke="#333" strokeWidth="2" /></>,
    santa: <><path d="M50 125 Q45 185 100 195 Q155 185 150 125 L150 140 Q100 165 50 140 Z" fill="white" stroke="#333" strokeWidth="2" /><path d="M70 128 Q85 140 100 128 Q115 140 130 128" fill="white" stroke="#333" strokeWidth="2" /></>,
  }

  const mouths: Record<string, JSX.Element> = {
    smile: <path d="M75 130 Q100 152 125 130" fill="none" stroke="#5D4037" strokeWidth="3.5" strokeLinecap="round" />,
    big_smile: <><path d="M68 128 Q100 165 132 128" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><path d="M73 130 Q100 145 127 130" fill="white" /><ellipse cx="100" cy="150" rx="12" ry="5" fill="#D32F2F" opacity="0.5" /></>,
    tooth: <><path d="M73 130 Q100 155 127 130" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><rect x="94" y="130" width="12" height="14" fill="white" stroke="#DDD" rx="2" /></>,
    missing_teeth: <><path d="M73 130 Q100 155 127 130" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><rect x="76" y="130" width="10" height="12" fill="white" stroke="#DDD" rx="1" /><rect x="114" y="130" width="10" height="12" fill="white" stroke="#DDD" rx="1" /></>,
    open: <><ellipse cx="100" cy="142" rx="20" ry="17" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><ellipse cx="100" cy="148" rx="12" ry="6" fill="#D32F2F" /></>,
    serious: <path d="M78 138 L122 138" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />,
    sad: <path d="M75 147 Q100 132 125 147" fill="none" stroke="#5D4037" strokeWidth="3.5" strokeLinecap="round" />,
    surprised: <><ellipse cx="100" cy="144" rx="14" ry="16" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><ellipse cx="100" cy="148" rx="8" ry="6" fill="#D32F2F" /></>,
    tongue: <><path d="M73 130 Q100 155 127 130" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><ellipse cx="100" cy="154" rx="12" ry="9" fill="#F48FB1" stroke="#E91E63" strokeWidth="2" /><path d="M95 154 L105 154" stroke="#E91E63" strokeWidth="1" /></>,
    kiss: <><circle cx="100" cy="140" r="10" fill="#E91E63" stroke="#C2185B" strokeWidth="2" /><ellipse cx="97" cy="137" rx="3" ry="2" fill="#F8BBD9" opacity="0.6" /></>,
    drool: <><path d="M75 135 Q100 150 125 135" fill="none" stroke="#5D4037" strokeWidth="3.5" strokeLinecap="round" /><path d="M115 142 Q120 158 116 175" fill="none" stroke="#4FC3F7" strokeWidth="4" strokeLinecap="round" opacity="0.7" /></>,
    vampire: <><path d="M73 135 Q100 155 127 135" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><polygon points="84,135 88,152 80,152" fill="white" stroke="#DDD" /><polygon points="116,135 120,152 112,152" fill="white" stroke="#DDD" /></>,
    gold_tooth: <><path d="M73 130 Q100 155 127 130" fill={`url(#lips${uid})`} stroke="#5D4037" strokeWidth="2.5" /><rect x="83" y="130" width="10" height="12" fill="white" stroke="#DDD" rx="1" /><rect x="94" y="130" width="12" height="14" fill="#FFD700" stroke="#FFA000" rx="1" /><rect x="107" y="130" width="10" height="12" fill="white" stroke="#DDD" rx="1" /></>,
    braces: <><path d="M73 130 Q100 148 127 130" fill="white" stroke="#DDD" strokeWidth="2" /><line x1="76" y1="136" x2="124" y2="136" stroke="#1976D2" strokeWidth="2.5" /><circle cx="82" cy="136" r="2" fill="#1976D2" /><circle cx="100" cy="138" r="2" fill="#1976D2" /><circle cx="118" cy="136" r="2" fill="#1976D2" /></>,
  }

  const hairs: Record<string, JSX.Element | null> = {
    none: null,
    short: <><ellipse cx="100" cy="46" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="45" rx="52" ry="20" fill={`url(#hair${uid})`} /><ellipse cx="85" cy="38" rx="15" ry="6" fill={hairLight} opacity="0.4" /></>,
    spiky: <><polygon points="100,5 85,44 115,44" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><polygon points="68,15 64,50 88,42" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><polygon points="132,15 136,50 112,42" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><polygon points="48,28 48,54 68,46" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><polygon points="152,28 152,54 132,46" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /></>,
    long: <><ellipse cx="100" cy="43" rx="60" ry="27" fill={hairDark} /><ellipse cx="100" cy="42" rx="58" ry="25" fill={`url(#hair${uid})`} /><rect x="38" y="42" width="18" height="98" fill={`url(#hair${uid})`} rx="4" /><rect x="144" y="42" width="18" height="98" fill={`url(#hair${uid})`} rx="4" /><ellipse cx="85" cy="36" rx="18" ry="8" fill={hairLight} opacity="0.3" /></>,
    curly: <><circle cx="55" cy="44" r="18" fill={hairDark} /><circle cx="55" cy="42" r="17" fill={`url(#hair${uid})`} /><circle cx="100" cy="32" r="22" fill={hairDark} /><circle cx="100" cy="30" r="21" fill={`url(#hair${uid})`} /><circle cx="145" cy="44" r="18" fill={hairDark} /><circle cx="145" cy="42" r="17" fill={`url(#hair${uid})`} /><circle cx="40" cy="65" r="16" fill={`url(#hair${uid})`} /><circle cx="160" cy="65" r="16" fill={`url(#hair${uid})`} /></>,
    afro: <><circle cx="100" cy="60" r="68" fill={hairDark} /><circle cx="100" cy="58" r="66" fill={`url(#hair${uid})`} /><ellipse cx="75" cy="35" rx="20" ry="15" fill={hairLight} opacity="0.25" /></>,
    mohawk: <><rect x="88" y="3" width="24" height="52" fill={hairDark} rx="3" /><rect x="90" y="5" width="20" height="48" fill={`url(#hair${uid})`} rx="2" /><polygon points="100,-2 83,14 117,14" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /></>,
    ponytail: <><ellipse cx="100" cy="43" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="42" rx="52" ry="20" fill={`url(#hair${uid})`} /><circle cx="100" cy="23" r="14" fill={hairDark} /><circle cx="100" cy="22" r="13" fill={`url(#hair${uid})`} /></>,
    pigtails: <><ellipse cx="100" cy="43" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="42" rx="52" ry="20" fill={`url(#hair${uid})`} /><circle cx="36" cy="54" r="12" fill={`url(#hair${uid})`} /><ellipse cx="36" cy="78" rx="10" ry="22" fill={`url(#hair${uid})`} /><circle cx="164" cy="54" r="12" fill={`url(#hair${uid})`} /><ellipse cx="164" cy="78" rx="10" ry="22" fill={`url(#hair${uid})`} /></>,
    braids: <><ellipse cx="100" cy="43" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="42" rx="52" ry="20" fill={`url(#hair${uid})`} /><rect x="30" y="48" width="12" height="80" rx="5" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="158" y="48" width="12" height="80" rx="5" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /></>,
    bun: <><ellipse cx="100" cy="43" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="42" rx="52" ry="20" fill={`url(#hair${uid})`} /><circle cx="100" cy="19" r="20" fill={hairDark} /><circle cx="100" cy="18" r="19" fill={`url(#hair${uid})`} /><ellipse cx="94" cy="12" rx="6" ry="4" fill={hairLight} opacity="0.4" /></>,
    messy: <><ellipse cx="100" cy="46" rx="60" ry="27" fill={hairDark} /><ellipse cx="100" cy="45" rx="58" ry="25" fill={`url(#hair${uid})`} /><path d="M48 38 Q42 18 60 26" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><path d="M152 38 Q158 18 140 26" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><path d="M78 26 Q82 6 96 20" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /></>,
    mullet: <><ellipse cx="100" cy="46" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="45" rx="52" ry="20" fill={`url(#hair${uid})`} /><rect x="60" y="48" width="80" height="68" fill={`url(#hair${uid})`} rx="4" /></>,
    wavy: <><path d="M40 54 Q54 30 70 50 Q86 30 100 50 Q114 30 130 50 Q146 30 160 54" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="2" /><ellipse cx="100" cy="50" rx="60" ry="24" fill={`url(#hair${uid})`} /></>,
    bob: <><ellipse cx="100" cy="50" rx="60" ry="27" fill={hairDark} /><ellipse cx="100" cy="48" rx="58" ry="25" fill={`url(#hair${uid})`} /><rect x="40" y="45" width="120" height="52" rx="12" fill={`url(#hair${uid})`} /></>,
    dreads: <><ellipse cx="100" cy="43" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="42" rx="52" ry="20" fill={`url(#hair${uid})`} /><rect x="43" y="50" width="10" height="65" rx="4" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="63" y="50" width="10" height="65" rx="4" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="83" y="50" width="10" height="65" rx="4" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="103" y="50" width="10" height="65" rx="4" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="123" y="50" width="10" height="65" rx="4" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="143" y="50" width="10" height="65" rx="4" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /></>,
    // New hair styles
    buzz: <><ellipse cx="100" cy="52" rx="50" ry="18" fill={hairDark} opacity="0.7" /><ellipse cx="100" cy="50" rx="48" ry="16" fill={`url(#hair${uid})`} opacity="0.5" /></>,
    fade: <><ellipse cx="100" cy="48" rx="52" ry="20" fill={hairDark} /><ellipse cx="100" cy="46" rx="50" ry="18" fill={`url(#hair${uid})`} /><ellipse cx="100" cy="52" rx="55" ry="10" fill={hairColor} opacity="0.3" /><ellipse cx="85" cy="40" rx="12" ry="5" fill={hairLight} opacity="0.4" /></>,
    side_part: <><ellipse cx="100" cy="46" rx="56" ry="24" fill={hairDark} /><ellipse cx="100" cy="44" rx="54" ry="22" fill={`url(#hair${uid})`} /><path d="M60 44 Q70 38 80 44" fill={hairLight} opacity="0.3" /><rect x="38" y="44" width="20" height="45" fill={`url(#hair${uid})`} rx="4" /></>,
    slicked: <><ellipse cx="100" cy="48" rx="56" ry="22" fill={hairDark} /><ellipse cx="100" cy="46" rx="54" ry="20" fill={`url(#hair${uid})`} /><path d="M50 46 Q75 38 100 46 Q125 38 150 46" fill={hairLight} opacity="0.25" /></>,
    man_bun: <><ellipse cx="100" cy="48" rx="52" ry="18" fill={hairDark} /><ellipse cx="100" cy="46" rx="50" ry="16" fill={`url(#hair${uid})`} /><circle cx="100" cy="22" r="16" fill={hairDark} /><circle cx="100" cy="20" r="15" fill={`url(#hair${uid})`} /><ellipse cx="100" cy="52" rx="48" ry="6" fill={hairDark} opacity="0.3" /></>,
    pixie: <><ellipse cx="100" cy="48" rx="54" ry="22" fill={hairDark} /><ellipse cx="100" cy="46" rx="52" ry="20" fill={`url(#hair${uid})`} /><path d="M55 42 Q65 30 85 40" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><ellipse cx="80" cy="38" rx="12" ry="6" fill={hairLight} opacity="0.4" /></>,
    bangs: <><ellipse cx="100" cy="46" rx="56" ry="24" fill={hairDark} /><ellipse cx="100" cy="44" rx="54" ry="22" fill={`url(#hair${uid})`} /><path d="M55 52 Q70 70 85 52 Q100 70 115 52 Q130 70 145 52" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="38" y="44" width="18" height="70" fill={`url(#hair${uid})`} rx="4" /><rect x="144" y="44" width="18" height="70" fill={`url(#hair${uid})`} rx="4" /></>,
    space_buns: <><ellipse cx="100" cy="46" rx="54" ry="20" fill={hairDark} /><ellipse cx="100" cy="44" rx="52" ry="18" fill={`url(#hair${uid})`} /><circle cx="55" cy="35" r="16" fill={hairDark} /><circle cx="55" cy="33" r="15" fill={`url(#hair${uid})`} /><circle cx="145" cy="35" r="16" fill={hairDark} /><circle cx="145" cy="33" r="15" fill={`url(#hair${uid})`} /></>,
    emo: <><ellipse cx="100" cy="48" rx="56" ry="24" fill={hairDark} /><ellipse cx="100" cy="46" rx="54" ry="22" fill={`url(#hair${uid})`} /><path d="M45 70 Q60 45 90 75 Q70 50 55 80" fill={`url(#hair${uid})`} stroke={hairDark} strokeWidth="1" /><rect x="40" y="44" width="20" height="55" fill={`url(#hair${uid})`} rx="4" /></>,
    perm: <><circle cx="55" cy="40" r="16" fill={hairDark} /><circle cx="55" cy="38" r="15" fill={`url(#hair${uid})`} /><circle cx="85" cy="30" r="18" fill={hairDark} /><circle cx="85" cy="28" r="17" fill={`url(#hair${uid})`} /><circle cx="115" cy="30" r="18" fill={hairDark} /><circle cx="115" cy="28" r="17" fill={`url(#hair${uid})`} /><circle cx="145" cy="40" r="16" fill={hairDark} /><circle cx="145" cy="38" r="15" fill={`url(#hair${uid})`} /><circle cx="45" cy="65" r="14" fill={`url(#hair${uid})`} /><circle cx="155" cy="65" r="14" fill={`url(#hair${uid})`} /></>,
  }

  const accessories: Record<string, JSX.Element | null> = {
    none: null,
    cap: <><ellipse cx="100" cy="38" rx="58" ry="16" fill="#E53935" stroke="#333" strokeWidth="2" /><rect x="100" y="28" width="52" height="10" rx="3" fill="#B71C1C" stroke="#333" strokeWidth="2" /></>,
    cap_back: <><ellipse cx="100" cy="38" rx="58" ry="16" fill="#1976D2" stroke="#333" strokeWidth="2" /><rect x="48" y="28" width="52" height="10" rx="3" fill="#0D47A1" stroke="#333" strokeWidth="2" /></>,
    hat: <><ellipse cx="100" cy="45" rx="72" ry="12" fill="#5D4037" stroke="#333" strokeWidth="2" /><path d="M58 45 L62 5 L138 5 L142 45" fill="#5D4037" stroke="#333" strokeWidth="2" /><rect x="62" y="32" width="76" height="8" fill="#FFA000" /></>,
    cowboy: <><ellipse cx="100" cy="48" rx="80" ry="14" fill="#8D6E63" stroke="#333" strokeWidth="2" /><path d="M55 48 Q55 20 100 15 Q145 20 145 48" fill="#8D6E63" stroke="#333" strokeWidth="2" /></>,
    chef: <><ellipse cx="100" cy="48" rx="48" ry="14" fill="white" stroke="#333" strokeWidth="2" /><circle cx="70" cy="25" r="18" fill="white" stroke="#333" strokeWidth="2" /><circle cx="100" cy="15" r="20" fill="white" stroke="#333" strokeWidth="2" /><circle cx="130" cy="25" r="18" fill="white" stroke="#333" strokeWidth="2" /></>,
    beanie: <><path d="M45 58 Q45 20 100 15 Q155 20 155 58" fill="#7B1FA2" stroke="#333" strokeWidth="2" /><ellipse cx="100" cy="58" rx="52" ry="10" fill="#9C27B0" stroke="#333" strokeWidth="2" /><circle cx="100" cy="8" r="7" fill="#9C27B0" stroke="#333" strokeWidth="2" /></>,
    headband: <path d="M38 58 Q100 48 162 58" fill="none" stroke="#E91E63" strokeWidth="8" />,
    bandana: <><path d="M38 52 Q100 40 162 52 L158 65 Q100 52 42 65 Z" fill="#F44336" stroke="#333" strokeWidth="2" /><circle cx="90" cy="55" r="3" fill="white" /><circle cx="110" cy="55" r="3" fill="white" /></>,
    crown: <><rect x="55" y="32" width="90" height="28" fill="#FFD700" stroke="#333" strokeWidth="2" /><polygon points="55,32 70,8 85,32" fill="#FFD700" stroke="#333" strokeWidth="2" /><polygon points="85,32 100,2 115,32" fill="#FFD700" stroke="#333" strokeWidth="2" /><polygon points="115,32 130,8 145,32" fill="#FFD700" stroke="#333" strokeWidth="2" /><circle cx="70" cy="22" r="4" fill="#E53935" /><circle cx="100" cy="18" r="5" fill="#2196F3" /><circle cx="130" cy="22" r="4" fill="#4CAF50" /></>,
    flower: <><circle cx="45" cy="58" r="7" fill="#E91E63" /><circle cx="38" cy="52" r="5" fill="#F48FB1" /><circle cx="52" cy="52" r="5" fill="#F48FB1" /><circle cx="38" cy="64" r="5" fill="#F48FB1" /><circle cx="52" cy="64" r="5" fill="#F48FB1" /><circle cx="45" cy="58" r="3" fill="#FFEB3B" /></>,
    bow: <><ellipse cx="78" cy="32" rx="14" ry="9" fill="#E91E63" stroke="#333" strokeWidth="2" /><ellipse cx="122" cy="32" rx="14" ry="9" fill="#E91E63" stroke="#333" strokeWidth="2" /><circle cx="100" cy="32" r="7" fill="#C2185B" stroke="#333" strokeWidth="2" /></>,
    helmet: <path d="M42 68 Q42 15 100 10 Q158 15 158 68" fill="#FFA000" stroke="#333" strokeWidth="2" />,
    party_hat: <><polygon points="100,0 62,62 138,62" fill="#9C27B0" stroke="#333" strokeWidth="2" /><circle cx="100" cy="0" r="7" fill="#FFEB3B" /><circle cx="80" cy="38" r="4" fill="#4CAF50" /><circle cx="110" cy="28" r="4" fill="#E91E63" /></>,
    pirate: <><path d="M45 58 Q100 42 155 58 L152 72 Q100 58 48 72 Z" fill="#333" stroke="#333" strokeWidth="2" /><text x="100" y="68" fontSize="16" textAnchor="middle" fill="white">☠️</text></>,
    // New accessories
    snapback: <><ellipse cx="100" cy="40" rx="58" ry="18" fill="#2196F3" stroke="#333" strokeWidth="2" /><path d="M50 40 Q50 18 100 12 Q150 18 150 40" fill="#2196F3" stroke="#333" strokeWidth="2" /><rect x="100" y="28" width="55" height="12" rx="2" fill="#1976D2" stroke="#333" strokeWidth="2" /><rect x="58" y="38" width="84" height="6" fill="#0D47A1" /></>,
    visor: <><ellipse cx="100" cy="48" rx="62" ry="10" fill="#4CAF50" stroke="#333" strokeWidth="2" /><rect x="100" y="38" width="58" height="10" rx="3" fill="#388E3C" stroke="#333" strokeWidth="2" /></>,
    sombrero_mx: <><ellipse cx="100" cy="55" rx="90" ry="16" fill="#FFB300" stroke="#333" strokeWidth="2" /><path d="M55 55 Q55 20 100 10 Q145 20 145 55" fill="#FFB300" stroke="#333" strokeWidth="2" /><ellipse cx="100" cy="55" rx="45" ry="8" fill="#FF8F00" /><path d="M60 52 Q80 48 100 52 Q120 48 140 52" fill="none" stroke="#E65100" strokeWidth="3" /><circle cx="75" cy="50" r="3" fill="#E53935" /><circle cx="100" cy="48" r="3" fill="#4CAF50" /><circle cx="125" cy="50" r="3" fill="#E53935" /></>,
    straw_hat: <><ellipse cx="100" cy="52" rx="78" ry="14" fill="#DEB887" stroke="#8B7355" strokeWidth="2" /><path d="M58 52 Q58 22 100 15 Q142 22 142 52" fill="#DEB887" stroke="#8B7355" strokeWidth="2" /><ellipse cx="100" cy="52" rx="42" ry="8" fill="#D2B48C" /><line x1="60" y1="30" x2="140" y2="30" stroke="#C4A67C" strokeWidth="1" /><line x1="58" y1="38" x2="142" y2="38" stroke="#C4A67C" strokeWidth="1" /></>,
    hair_net: <><ellipse cx="100" cy="42" rx="52" ry="20" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="3,3" /><path d="M48 42 Q48 18 100 12 Q152 18 152 42" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="3,3" /><line x1="60" y1="25" x2="60" y2="55" stroke="#333" strokeWidth="1" strokeDasharray="2,2" /><line x1="80" y1="18" x2="80" y2="58" stroke="#333" strokeWidth="1" strokeDasharray="2,2" /><line x1="100" y1="15" x2="100" y2="60" stroke="#333" strokeWidth="1" strokeDasharray="2,2" /><line x1="120" y1="18" x2="120" y2="58" stroke="#333" strokeWidth="1" strokeDasharray="2,2" /><line x1="140" y1="25" x2="140" y2="55" stroke="#333" strokeWidth="1" strokeDasharray="2,2" /></>,
    beret: <><ellipse cx="100" cy="48" rx="52" ry="14" fill="#333" stroke="#222" strokeWidth="2" /><path d="M52 48 Q45 28 100 22 Q155 28 148 48" fill="#333" stroke="#222" strokeWidth="2" /><circle cx="100" cy="18" r="5" fill="#333" stroke="#222" strokeWidth="2" /></>,
    turban: <><ellipse cx="100" cy="52" rx="55" ry="18" fill="#9C27B0" stroke="#333" strokeWidth="2" /><path d="M48 52 Q48 15 100 8 Q152 15 152 52" fill="#9C27B0" stroke="#333" strokeWidth="2" /><path d="M55 42 Q75 52 100 38 Q125 52 145 42" fill="#7B1FA2" /><path d="M52 55 Q75 45 100 55 Q125 45 148 55" fill="#7B1FA2" /><ellipse cx="100" cy="28" rx="12" ry="8" fill="#FFD700" stroke="#333" strokeWidth="1" /></>,
    headphones: <><path d="M35 85 Q35 35 100 30 Q165 35 165 85" fill="none" stroke="#333" strokeWidth="6" /><ellipse cx="38" cy="88" rx="12" ry="18" fill="#333" stroke="#222" strokeWidth="2" /><ellipse cx="162" cy="88" rx="12" ry="18" fill="#333" stroke="#222" strokeWidth="2" /><ellipse cx="38" cy="88" rx="8" ry="12" fill="#E91E63" /><ellipse cx="162" cy="88" rx="8" ry="12" fill="#E91E63" /></>,
    tiara: <><path d="M55 58 Q55 52 65 52 L70 42 L80 52 L90 38 L100 52 L110 38 L120 52 L130 42 L135 52 Q145 52 145 58" fill="none" stroke="#FFD700" strokeWidth="3" /><circle cx="70" cy="42" r="3" fill="#E91E63" /><circle cx="100" cy="35" r="4" fill="#00BCD4" /><circle cx="130" cy="42" r="3" fill="#E91E63" /></>,
    hard_hat: <><ellipse cx="100" cy="52" rx="62" ry="12" fill="#FFEB3B" stroke="#333" strokeWidth="2" /><path d="M42 52 Q42 22 100 15 Q158 22 158 52" fill="#FFEB3B" stroke="#333" strokeWidth="2" /><rect x="50" y="38" width="100" height="6" fill="#FBC02D" stroke="#333" strokeWidth="1" /></>,
    santa_hat: <><path d="M45 60 Q60 25 100 55 Q140 25 155 60" fill="#D32F2F" stroke="#B71C1C" strokeWidth="2" /><path d="M100 55 Q140 35 165 75 Q170 90 165 100" fill="#D32F2F" stroke="#B71C1C" strokeWidth="2" /><ellipse cx="45" cy="62" rx="18" ry="10" fill="white" stroke="#EEE" strokeWidth="1" /><ellipse cx="155" cy="62" rx="18" ry="10" fill="white" stroke="#EEE" strokeWidth="1" /><circle cx="168" cy="102" r="10" fill="white" stroke="#EEE" strokeWidth="1" /></>,
    graduation: <><rect x="60" y="35" width="80" height="8" fill="#333" stroke="#222" strokeWidth="2" /><path d="M60 43 Q60 25 100 18 Q140 25 140 43" fill="#333" stroke="#222" strokeWidth="2" /><polygon points="60,35 100,20 140,35 100,50" fill="#333" stroke="#222" strokeWidth="2" /><line x1="100" y1="35" x2="100" y2="55" stroke="#FFD700" strokeWidth="2" /><circle cx="100" cy="58" r="5" fill="#FFD700" /><path d="M100 63 L95 80 L100 78 L105 80 Z" fill="#FFD700" /></>,
  }

  const glasses: Record<string, JSX.Element | null> = {
    none: null,
    normal: <><rect x="52" y="80" width="32" height="26" rx="4" fill="none" stroke="#333" strokeWidth="3" /><rect x="116" y="80" width="32" height="26" rx="4" fill="none" stroke="#333" strokeWidth="3" /><line x1="84" y1="92" x2="116" y2="92" stroke="#333" strokeWidth="3" /></>,
    round: <><circle cx="68" cy="92" r="16" fill="none" stroke="#333" strokeWidth="3" /><circle cx="132" cy="92" r="16" fill="none" stroke="#333" strokeWidth="3" /><line x1="84" y1="92" x2="116" y2="92" stroke="#333" strokeWidth="3" /></>,
    sunglasses: <><rect x="50" y="80" width="36" height="26" rx="4" fill="#333" stroke="#333" strokeWidth="2" /><rect x="114" y="80" width="36" height="26" rx="4" fill="#333" stroke="#333" strokeWidth="2" /><line x1="86" y1="92" x2="114" y2="92" stroke="#333" strokeWidth="3" /></>,
    nerd: <><rect x="48" y="78" width="38" height="36" rx="2" fill="none" stroke="#333" strokeWidth="4" /><rect x="114" y="78" width="38" height="36" rx="2" fill="none" stroke="#333" strokeWidth="4" /><line x1="86" y1="94" x2="114" y2="94" stroke="#333" strokeWidth="4" /></>,
    heart: <><path d="M68,88 C60,78 50,88 68,102 C86,88 76,78 68,88" fill="#E91E63" stroke="#333" strokeWidth="2" /><path d="M132,88 C124,78 114,88 132,102 C150,88 140,78 132,88" fill="#E91E63" stroke="#333" strokeWidth="2" /><line x1="82" y1="92" x2="118" y2="92" stroke="#E91E63" strokeWidth="3" /></>,
    eye_patch: <><ellipse cx="68" cy="92" rx="20" ry="16" fill="#333" stroke="#333" strokeWidth="2" /><line x1="48" y1="92" x2="32" y2="78" stroke="#333" strokeWidth="3" /><line x1="88" y1="92" x2="168" y2="78" stroke="#333" strokeWidth="3" /></>,
    monocle: <><circle cx="130" cy="92" r="18" fill="none" stroke="#FFD700" strokeWidth="3" /><line x1="130" y1="110" x2="130" y2="155" stroke="#FFD700" strokeWidth="2" /></>,
    aviator: <><path d="M50 82 Q50 110 68 110 Q86 110 86 82 Q68 78 50 82" fill="#333" opacity="0.7" stroke="#FFD700" strokeWidth="2" /><path d="M114 82 Q114 110 132 110 Q150 110 150 82 Q132 78 114 82" fill="#333" opacity="0.7" stroke="#FFD700" strokeWidth="2" /><line x1="86" y1="88" x2="114" y2="88" stroke="#FFD700" strokeWidth="2" /></>,
    cat_eye: <><path d="M50 98 L50 82 L45 75 L85 82 L85 98 Z" fill="none" stroke="#E91E63" strokeWidth="3" /><path d="M150 98 L150 82 L155 75 L115 82 L115 98 Z" fill="none" stroke="#E91E63" strokeWidth="3" /><line x1="85" y1="90" x2="115" y2="90" stroke="#E91E63" strokeWidth="2" /></>,
    star: <><polygon points="68,75 72,88 86,88 74,96 78,110 68,102 58,110 62,96 50,88 64,88" fill="#FFD700" stroke="#333" strokeWidth="2" /><polygon points="132,75 136,88 150,88 138,96 142,110 132,102 122,110 126,96 114,88 128,88" fill="#FFD700" stroke="#333" strokeWidth="2" /></>,
    square: <><rect x="48" y="78" width="36" height="30" fill="none" stroke="#333" strokeWidth="3" /><rect x="116" y="78" width="36" height="30" fill="none" stroke="#333" strokeWidth="3" /><line x1="84" y1="92" x2="116" y2="92" stroke="#333" strokeWidth="3" /></>,
    vr: <rect x="40" y="75" width="120" height="38" rx="8" fill="#333" stroke="#333" strokeWidth="2" />,
  }

  const earrings: Record<string, JSX.Element | null> = {
    none: null,
    stud: <><circle cx="28" cy="105" r="3" fill="#FFD700" stroke="#333" strokeWidth="1" /><circle cx="172" cy="105" r="3" fill="#FFD700" stroke="#333" strokeWidth="1" /></>,
    hoop: <><circle cx="26" cy="110" r="6" fill="none" stroke="#FFD700" strokeWidth="2" /><circle cx="174" cy="110" r="6" fill="none" stroke="#FFD700" strokeWidth="2" /></>,
    big_hoop: <><circle cx="22" cy="115" r="12" fill="none" stroke="#FFD700" strokeWidth="2" /><circle cx="178" cy="115" r="12" fill="none" stroke="#FFD700" strokeWidth="2" /></>,
    dangle: <><line x1="28" y1="105" x2="28" y2="125" stroke="#FFD700" strokeWidth="2" /><circle cx="28" cy="128" r="4" fill="#E91E63" /><line x1="172" y1="105" x2="172" y2="125" stroke="#FFD700" strokeWidth="2" /><circle cx="172" cy="128" r="4" fill="#E91E63" /></>,
    cross: <><path d="M25 108 L31 108 M28 105 L28 115" stroke="#C0C0C0" strokeWidth="2" /><path d="M169 108 L175 108 M172 105 L172 115" stroke="#C0C0C0" strokeWidth="2" /></>,
    star: <><polygon points="28,102 29,106 33,106 30,109 31,113 28,110 25,113 26,109 23,106 27,106" fill="#FFD700" /><polygon points="172,102 173,106 177,106 174,109 175,113 172,110 169,113 170,109 167,106 171,106" fill="#FFD700" /></>,
    diamond: <><polygon points="28,102 32,108 28,114 24,108" fill="#00BCD4" stroke="#333" strokeWidth="1" /><polygon points="172,102 176,108 172,114 168,108" fill="#00BCD4" stroke="#333" strokeWidth="1" /></>,
    feather: <><path d="M28 105 Q20 120 28 135" fill="none" stroke="#8D6E63" strokeWidth="2" /><path d="M172 105 Q180 120 172 135" fill="none" stroke="#8D6E63" strokeWidth="2" /></>,
  }

  const extras: Record<string, JSX.Element | null> = {
    none: null,
    freckles: <>{[0,1,2,3,4,5,6,7,8].map(i => <circle key={i} cx={70 + (i%3)*15 + Math.random()*5} cy={105 + Math.floor(i/3)*8} r="2" fill="#A1887F" opacity="0.7" />)}</>,
    blush: <><ellipse cx="55" cy="110" rx="12" ry="8" fill="#FFAB91" opacity="0.5" /><ellipse cx="145" cy="110" rx="12" ry="8" fill="#FFAB91" opacity="0.5" /></>,
    scar: <path d="M140 85 Q145 95 140 105" fill="none" stroke="#D7CCC8" strokeWidth="3" />,
    bandaid: <><rect x="135" y="100" width="20" height="10" rx="2" fill="#FFCC80" stroke="#FFB74D" strokeWidth="1" /><line x1="140" y1="100" x2="140" y2="110" stroke="#FFB74D" strokeWidth="1" /><line x1="150" y1="100" x2="150" y2="110" stroke="#FFB74D" strokeWidth="1" /></>,
    mole: <circle cx="125" cy="125" r="3" fill="#5D4037" />,
    tattoo: <path d="M55 140 Q60 135 65 140 Q60 145 55 140" fill="none" stroke="#1565C0" strokeWidth="2" />,
    makeup: <><path d="M55 82 Q70 78 85 82" fill="none" stroke="#7B1FA2" strokeWidth="2" /><path d="M115 82 Q130 78 145 82" fill="none" stroke="#7B1FA2" strokeWidth="2" /></>,
    sweat: <><path d="M150 70 Q155 80 150 90" fill="#4FC3F7" stroke="#29B6F6" strokeWidth="1" /></>,
    dirty: <><circle cx="60" cy="120" r="4" fill="#795548" opacity="0.4" /><circle cx="140" cy="95" r="3" fill="#795548" opacity="0.4" /><circle cx="95" cy="140" r="5" fill="#795548" opacity="0.3" /></>,
    mask: <path d="M60 115 Q100 130 140 115 L140 145 Q100 160 60 145 Z" fill="#90CAF9" stroke="#64B5F6" strokeWidth="2" />,
    bruise: <ellipse cx="65" cy="95" rx="10" ry="8" fill="#7E57C2" opacity="0.4" />,
    wrinkles: <><path d="M55 115 Q60 118 65 115" fill="none" stroke="#BDBDBD" strokeWidth="1" /><path d="M135 115 Q140 118 145 115" fill="none" stroke="#BDBDBD" strokeWidth="1" /><path d="M85 145 Q100 148 115 145" fill="none" stroke="#BDBDBD" strokeWidth="1" /></>,
    dimples: <><circle cx="65" cy="130" r="3" fill={skinColor} stroke="#BDBDBD" strokeWidth="1" /><circle cx="135" cy="130" r="3" fill={skinColor} stroke="#BDBDBD" strokeWidth="1" /></>,
  }

  const hasHat = ['cap', 'cap_back', 'snapback', 'visor', 'hat', 'cowboy', 'sombrero_mx', 'straw_hat', 'chef', 'hair_net', 'beanie', 'beret', 'turban', 'helmet', 'hard_hat', 'party_hat', 'santa_hat', 'graduation', 'pirate'].includes(data.accessory)
  const needsEars = !['afro'].includes(data.hair)

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {defs}
      {/* Back hair (long styles go behind face) */}
      {!hasHat && data.hair !== 'none' && ['long', 'braids', 'bob', 'dreads'].includes(data.hair) && hairs[data.hair]}
      {data.hair === 'afro' && hairs.afro}
      {/* Face */}
      {faces[data.base] || faces.round}
      {/* Ears with gradient */}
      {needsEars && <>
        <ellipse cx="31" cy="103" rx="8" ry="12" fill={skinDark} opacity="0.3" />
        <ellipse cx="30" cy="102" rx="8" ry="12" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="1.5" />
        <ellipse cx="169" cy="103" rx="8" ry="12" fill={skinDark} opacity="0.3" />
        <ellipse cx="170" cy="102" rx="8" ry="12" fill={`url(#skin${uid})`} stroke="#8B7355" strokeWidth="1.5" />
      </>}
      {/* Earrings */}
      {earrings[data.earrings]}
      {/* Front hair */}
      {!hasHat && data.hair !== 'none' && !['long', 'braids', 'bob', 'dreads', 'afro'].includes(data.hair) && hairs[data.hair]}
      {/* Eyebrows */}
      {eyebrows[data.eyebrows]}
      {/* Eyes */}
      {eyes[data.eyes] || eyes.normal}
      {/* Extras (freckles, blush, etc) */}
      {extras[data.extra]}
      {/* Nose */}
      {noses[data.nose] || noses.normal}
      {/* Mouth */}
      {mouths[data.mouth] || mouths.smile}
      {/* Facial hair */}
      {facialHairs[data.facialHair]}
      {/* Glasses */}
      {glasses[data.glasses]}
      {/* Accessories */}
      {accessories[data.accessory]}
    </svg>
  )
}

const IngredienteSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const colorVal = CATALOGS.ingredientes.color.find(c => c.id === data.color)?.color || '#4CAF50'
  const icon = CATALOGS.ingredientes.category.find(c => c.id === data.category)?.icon || '🥬'

  // Generate lighter/darker for gradients
  const lighten = (c: string, p: number) => {
    const n = parseInt(c.replace('#', ''), 16)
    const a = Math.round(2.55 * p)
    return `#${(1 << 24 | Math.min(255, (n >> 16) + a) << 16 | Math.min(255, ((n >> 8) & 0xFF) + a) << 8 | Math.min(255, (n & 0xFF) + a)).toString(16).slice(1)}`
  }
  const darken = (c: string, p: number) => {
    const n = parseInt(c.replace('#', ''), 16)
    const a = Math.round(2.55 * p)
    return `#${(1 << 24 | Math.max(0, (n >> 16) - a) << 16 | Math.max(0, ((n >> 8) & 0xFF) - a) << 8 | Math.max(0, (n & 0xFF) - a)).toString(16).slice(1)}`
  }
  const light = lighten(colorVal, 25)
  const dark = darken(colorVal, 20)
  const uid = `prod${data.color}`.replace(/[^a-zA-Z0-9]/g, '')

  const defs = (
    <defs>
      <radialGradient id={`pg${uid}`} cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor={light} />
        <stop offset="100%" stopColor={colorVal} />
      </radialGradient>
      <linearGradient id={`pgl${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={light} />
        <stop offset="100%" stopColor={dark} />
      </linearGradient>
      <filter id={`ps${uid}`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.2" />
      </filter>
      <linearGradient id="plateBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E8E8E8" />
      </linearGradient>
    </defs>
  )

  const shapes: Record<string, JSX.Element> = {
    whole: <><ellipse cx="100" cy="108" rx="55" ry="52" fill={dark} opacity="0.3" /><ellipse cx="100" cy="105" rx="54" ry="50" fill={`url(#pg${uid})`} filter={`url(#ps${uid})`} /><ellipse cx="82" cy="85" rx="18" ry="12" fill={light} opacity="0.4" /></>,
    half: <><path d="M100 53 A50 50 0 0 1 100 155" fill={dark} opacity="0.3" /><path d="M100 55 A48 48 0 0 1 100 153" fill={`url(#pg${uid})`} filter={`url(#ps${uid})`} /><ellipse cx="100" cy="104" rx="6" ry="46" fill={dark} opacity="0.5" /><ellipse cx="112" cy="80" rx="10" ry="8" fill={light} opacity="0.4" /></>,
    chopped: <>{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={i} x={48 + (i % 4) * 28} y={65 + Math.floor(i / 4) * 38} width="22" height="22" rx="4" fill={`url(#pg${uid})`} stroke={dark} strokeWidth="1.5" transform={`rotate(${i * 6 - 12} ${59 + (i % 4) * 28} ${76 + Math.floor(i / 4) * 38})`} filter={`url(#ps${uid})`} />)}</>,
    sliced: <>{[0, 1, 2, 3, 4].map(i => <><ellipse key={`s${i}`} cx="100" cy={62 + i * 20} rx="50" ry="14" fill={dark} opacity="0.2" /><ellipse key={i} cx="100" cy={60 + i * 20} rx="49" ry="13" fill={`url(#pgl${uid})`} stroke={dark} strokeWidth="1" opacity={1 - i * 0.1} /></>)}</>,
    ground: <><ellipse cx="100" cy="122" rx="62" ry="30" fill={dark} opacity="0.3" /><ellipse cx="100" cy="118" rx="60" ry="28" fill={`url(#pg${uid})`} filter={`url(#ps${uid})`} /><ellipse cx="80" cy="108" rx="20" ry="10" fill={light} opacity="0.3" /></>,
    liquid: <><path d="M66 50 L56 154 Q100 172 144 154 L134 50 Z" fill={dark} opacity="0.3" /><path d="M68 52 L58 152 Q100 168 142 152 L132 52 Z" fill={`url(#pgl${uid})`} opacity="0.85" filter={`url(#ps${uid})`} /><ellipse cx="100" cy="52" rx="34" ry="12" fill={colorVal} stroke={dark} strokeWidth="1.5" /><ellipse cx="90" cy="50" rx="10" ry="4" fill={light} opacity="0.5" /></>,
    powder: <><ellipse cx="100" cy="132" rx="56" ry="24" fill={dark} opacity="0.3" /><ellipse cx="100" cy="128" rx="54" ry="22" fill={`url(#pg${uid})`} filter={`url(#ps${uid})`} /><ellipse cx="100" cy="120" rx="44" ry="16" fill={light} opacity="0.4" /></>,
    leaves: <>{[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${62 + i * 18},${82 + (i % 2) * 18}) rotate(${-18 + i * 10})`}><ellipse rx="13" ry="28" fill={dark} opacity="0.3" /><ellipse rx="12" ry="26" fill={`url(#pgl${uid})`} /><path d={`M0 -20 L0 20`} stroke={dark} strokeWidth="1.5" opacity="0.5" /></g>)}</>,
    bunch: <><rect x="90" y="130" width="20" height="42" fill="#6D4C41" stroke="#5D4037" strokeWidth="2" rx="4" />{[-28, -14, 0, 14, 28].map((a, i) => <g key={i} transform={`translate(100,128) rotate(${a})`}><ellipse cy="-40" rx="16" ry="36" fill={dark} opacity="0.2" /><ellipse cy="-38" rx="15" ry="34" fill={`url(#pgl${uid})`} stroke={dark} strokeWidth="1" /></g>)}</>,
    diced: <>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => <rect key={i} x={52 + (i % 4) * 26} y={62 + Math.floor(i / 4) * 26} width="18" height="18" rx="3" fill={`url(#pg${uid})`} stroke={dark} strokeWidth="1" transform={`rotate(${i * 4} ${61 + (i % 4) * 26} ${71 + Math.floor(i / 4) * 26})`} />)}</>,
    julienne: <>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <rect key={i} x={52 + i * 10} y={62 + (i % 3) * 8} width="6" height="72" rx="2" fill={`url(#pgl${uid})`} stroke={dark} strokeWidth="0.5" transform={`rotate(${-4 + i * 2} ${55 + i * 10} 100)`} />)}</>,
    shredded: <>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => <path key={i} d={`M${48 + i * 8} ${72 + (i % 3) * 4} Q${52 + i * 8} 100 ${48 + i * 8} ${138 - (i % 4) * 4}`} fill="none" stroke={`url(#pgl${uid})`} strokeWidth="5" strokeLinecap="round" />)}</>,
    mashed: <><ellipse cx="100" cy="116" rx="62" ry="36" fill={dark} opacity="0.3" /><ellipse cx="100" cy="112" rx="60" ry="34" fill={`url(#pg${uid})`} filter={`url(#ps${uid})`} /><path d="M60 96 Q80 84 100 96 Q120 84 140 96" fill="none" stroke={light} strokeWidth="4" opacity="0.6" /></>,
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {defs}
      <rect width="200" height="200" fill="url(#plateBg)" rx="12" />
      <ellipse cx="100" cy="105" rx="85" ry="75" fill="white" opacity="0.5" />
      {shapes[data.shape] || shapes.whole}
      <text x="175" y="28" fontSize="22">{icon}</text>
    </svg>
  )
}

const ArtefactoSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const color = CATALOGS.artefactos.material.find(m => m.id === data.material)?.color || '#8D6E63'
  const icon = CATALOGS.artefactos.type.find(t => t.id === data.type)?.icon || '🪑'
  const sizeMap: Record<string, number> = { tiny: 0.5, small: 0.7, medium: 1, large: 1.2, huge: 1.4 }
  const s = sizeMap[data.size] || 1

  // Color helpers
  const lighten = (c: string, p: number) => {
    const n = parseInt(c.replace('#', ''), 16)
    const a = Math.round(2.55 * p)
    return `#${(1 << 24 | Math.min(255, (n >> 16) + a) << 16 | Math.min(255, ((n >> 8) & 0xFF) + a) << 8 | Math.min(255, (n & 0xFF) + a)).toString(16).slice(1)}`
  }
  const darken = (c: string, p: number) => {
    const n = parseInt(c.replace('#', ''), 16)
    const a = Math.round(2.55 * p)
    return `#${(1 << 24 | Math.max(0, (n >> 16) - a) << 16 | Math.max(0, ((n >> 8) & 0xFF) - a) << 8 | Math.max(0, (n & 0xFF) - a)).toString(16).slice(1)}`
  }
  const light = lighten(color, 25)
  const dark = darken(color, 20)
  const uid = `art${data.material}`.replace(/[^a-zA-Z0-9]/g, '')

  const defs = (
    <defs>
      <linearGradient id={`ag${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={light} />
        <stop offset="100%" stopColor={color} />
      </linearGradient>
      <linearGradient id={`agv${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={light} />
        <stop offset="100%" stopColor={dark} />
      </linearGradient>
      <filter id={`as${uid}`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.25" />
      </filter>
      <linearGradient id="floorG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#EEEEEE" />
        <stop offset="100%" stopColor="#BDBDBD" />
      </linearGradient>
    </defs>
  )

  const items: Record<string, JSX.Element> = {
    table: <><rect x="10" y="31" width="80" height="10" fill={dark} opacity="0.3" rx="3" /><rect x="12" y="30" width="76" height="9" fill={`url(#ag${uid})`} rx="3" filter={`url(#as${uid})`} /><rect x="16" y="39" width="7" height="52" fill={`url(#agv${uid})`} rx="2" /><rect x="77" y="39" width="7" height="52" fill={`url(#agv${uid})`} rx="2" /></>,
    chair: <><rect x="20" y="46" width="60" height="7" fill={`url(#ag${uid})`} rx="2" filter={`url(#as${uid})`} /><rect x="22" y="53" width="6" height="38" fill={`url(#agv${uid})`} rx="2" /><rect x="72" y="53" width="6" height="38" fill={`url(#agv${uid})`} rx="2" /><rect x="20" y="11" width="60" height="37" fill={`url(#agv${uid})`} rx="5" filter={`url(#as${uid})`} /><ellipse cx="50" cy="28" rx="20" ry="8" fill={light} opacity="0.3" /></>,
    bench: <><rect x="5" y="40" width="90" height="10" fill={color} stroke="#333" strokeWidth="2" rx="2" /><rect x="10" y="50" width="8" height="40" fill={color} stroke="#333" strokeWidth="2" /><rect x="82" y="50" width="8" height="40" fill={color} stroke="#333" strokeWidth="2" /><rect x="5" y="20" width="90" height="22" fill={color} stroke="#333" strokeWidth="2" rx="3" /></>,
    counter: <><rect x="5" y="25" width="90" height="12" fill={color} stroke="#333" strokeWidth="2" rx="2" /><rect x="10" y="37" width="80" height="55" fill={color} stroke="#333" strokeWidth="2" rx="3" opacity="0.9" /></>,
    plant: <><ellipse cx="50" cy="82" rx="28" ry="10" fill={color} stroke="#333" strokeWidth="2" /><path d="M50 72 L50 48" stroke="#5D4037" strokeWidth="4" /><ellipse cx="50" cy="32" rx="20" ry="16" fill="#4CAF50" stroke="#333" strokeWidth="2" /><ellipse cx="66" cy="48" rx="16" ry="12" fill="#66BB6A" stroke="#333" strokeWidth="2" /><ellipse cx="34" cy="50" rx="14" ry="10" fill="#81C784" stroke="#333" strokeWidth="2" /></>,
    grill: <><rect x="10" y="32" width="80" height="42" rx="5" fill="#333" stroke="#333" strokeWidth="2" /><rect x="15" y="28" width="70" height="10" rx="2" fill={color} stroke="#333" strokeWidth="2" /><rect x="20" y="78" width="8" height="14" fill="#333" /><rect x="72" y="78" width="8" height="14" fill="#333" /></>,
    cooler: <><rect x="15" y="28" width="70" height="52" rx="5" fill={color} stroke="#333" strokeWidth="2" /><rect x="15" y="18" width="70" height="14" rx="3" fill={color} stroke="#333" strokeWidth="2" opacity="0.9" /><rect x="40" y="10" width="20" height="10" rx="2" fill="#78909C" stroke="#333" strokeWidth="2" /><text x="50" y="62" fontSize="22" textAnchor="middle">❄️</text></>,
    umbrella: <><rect x="48" y="38" width="4" height="52" fill="#5D4037" stroke="#333" strokeWidth="1" /><path d="M10 42 Q50 8 90 42 Q50 52 10 42" fill={color} stroke="#333" strokeWidth="2" /><circle cx="50" cy="22" r="4" fill={color} stroke="#333" strokeWidth="1" /></>,
    sign: <><rect x="45" y="42" width="10" height="52" fill="#5D4037" stroke="#333" strokeWidth="2" /><rect x="15" y="8" width="70" height="38" rx="3" fill={color} stroke="#333" strokeWidth="2" /><line x1="25" y1="20" x2="75" y2="20" stroke="#333" strokeWidth="2" opacity="0.5" /><line x1="25" y1="30" x2="65" y2="30" stroke="#333" strokeWidth="2" opacity="0.5" /></>,
    lighting: <><path d="M50 8 L50 22" stroke="#333" strokeWidth="2" /><path d="M25 28 Q50 32 75 28 L70 68 Q50 72 30 68 Z" fill="#FFF9C4" stroke="#333" strokeWidth="2" /><ellipse cx="50" cy="68" rx="20" ry="5" fill={color} stroke="#333" strokeWidth="2" /></>,
    trash: <><path d="M20 28 L25 88 L75 88 L80 28 Z" fill={color} stroke="#333" strokeWidth="2" /><rect x="15" y="18" width="70" height="12" rx="2" fill={color} stroke="#333" strokeWidth="2" /><rect x="40" y="10" width="20" height="10" rx="5" fill="#78909C" stroke="#333" strokeWidth="2" /></>,
    shelf: <><rect x="15" y="15" width="70" height="6" fill={color} stroke="#333" strokeWidth="2" /><rect x="15" y="40" width="70" height="6" fill={color} stroke="#333" strokeWidth="2" /><rect x="15" y="65" width="70" height="6" fill={color} stroke="#333" strokeWidth="2" /><rect x="15" y="15" width="6" height="56" fill={color} stroke="#333" strokeWidth="2" /><rect x="79" y="15" width="6" height="56" fill={color} stroke="#333" strokeWidth="2" /></>,
    flower: <><rect x="45" y="48" width="10" height="42" fill="#5D4037" stroke="#333" strokeWidth="1" rx="2" /><ellipse cx="50" cy="88" rx="22" ry="8" fill={color} stroke="#333" strokeWidth="2" /><circle cx="50" cy="28" r="8" fill="#FFEB3B" stroke="#333" strokeWidth="1" /><ellipse cx="38" cy="22" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1" /><ellipse cx="62" cy="22" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1" /><ellipse cx="35" cy="35" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1" /><ellipse cx="65" cy="35" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1" /></>,
    banner: <><rect x="10" y="8" width="80" height="48" fill={color} stroke="#333" strokeWidth="2" /><polygon points="10,56 50,70 90,56 90,62 50,76 10,62" fill={color} stroke="#333" strokeWidth="2" /></>,
    flag: <><rect x="20" y="8" width="5" height="82" fill="#5D4037" stroke="#333" strokeWidth="2" /><polygon points="25,12 82,22 82,52 25,42" fill={color} stroke="#333" strokeWidth="2" /></>,
    fryer: <><rect x="15" y="22" width="70" height="58" rx="5" fill={color} stroke="#333" strokeWidth="2" /><rect x="20" y="28" width="26" height="38" rx="3" fill="#FFE082" stroke="#333" strokeWidth="1" /><rect x="52" y="28" width="26" height="38" rx="3" fill="#FFE082" stroke="#333" strokeWidth="1" /><rect x="15" y="12" width="70" height="12" rx="3" fill="#455A64" stroke="#333" strokeWidth="2" /></>,
    oven: <><rect x="15" y="18" width="70" height="68" rx="5" fill={color} stroke="#333" strokeWidth="2" /><rect x="22" y="32" width="56" height="38" rx="3" fill="#333" stroke="#333" strokeWidth="1" /><rect x="25" y="35" width="50" height="32" rx="2" fill="#1A1A1A" /><circle cx="35" cy="24" r="4" fill="#455A64" stroke="#333" strokeWidth="1" /><circle cx="50" cy="24" r="4" fill="#455A64" stroke="#333" strokeWidth="1" /><circle cx="65" cy="24" r="4" fill="#455A64" stroke="#333" strokeWidth="1" /></>,
    string_lights: <><path d="M5 28 Q25 38 50 28 Q75 38 95 28" fill="none" stroke="#333" strokeWidth="2" /><line x1="15" y1="30" x2="15" y2="40" stroke="#333" strokeWidth="1" /><ellipse cx="15" cy="46" rx="5" ry="7" fill="#F44336" stroke="#333" strokeWidth="1" /><line x1="35" y1="34" x2="35" y2="44" stroke="#333" strokeWidth="1" /><ellipse cx="35" cy="50" rx="5" ry="7" fill="#4CAF50" stroke="#333" strokeWidth="1" /><line x1="55" y1="30" x2="55" y2="40" stroke="#333" strokeWidth="1" /><ellipse cx="55" cy="46" rx="5" ry="7" fill="#FFEB3B" stroke="#333" strokeWidth="1" /><line x1="75" y1="34" x2="75" y2="44" stroke="#333" strokeWidth="1" /><ellipse cx="75" cy="50" rx="5" ry="7" fill="#2196F3" stroke="#333" strokeWidth="1" /></>,
    lantern: <><rect x="35" y="8" width="30" height="8" rx="2" fill="#333" stroke="#333" strokeWidth="1" /><rect x="30" y="18" width="40" height="58" rx="5" fill="#E53935" stroke="#333" strokeWidth="2" opacity="0.9" /><rect x="35" y="22" width="30" height="48" rx="3" fill="#FFEB3B" opacity="0.6" /><rect x="30" y="78" width="40" height="8" rx="2" fill="#333" stroke="#333" strokeWidth="1" /></>,
    awning: <><path d="M5 28 L95 28 L90 58 L10 58 Z" fill={color} stroke="#333" strokeWidth="2" /><path d="M12 58 Q23 68 34 58" fill="white" stroke="#333" strokeWidth="1" /><path d="M34 58 Q45 68 56 58" fill={color} stroke="#333" strokeWidth="1" /><path d="M56 58 Q67 68 78 58" fill="white" stroke="#333" strokeWidth="1" /><path d="M78 58 Q89 68 90 58" fill={color} stroke="#333" strokeWidth="1" /></>,
    speaker: <><rect x="25" y="12" width="50" height="72" rx="5" fill="#212121" stroke="#333" strokeWidth="2" /><circle cx="50" cy="52" r="18" fill="#333" stroke="#444" strokeWidth="2" /><circle cx="50" cy="52" r="7" fill="#555" /><circle cx="50" cy="26" r="7" fill="#333" stroke="#444" strokeWidth="1" /></>,
    radio: <><rect x="15" y="28" width="70" height="48" rx="8" fill={color} stroke="#333" strokeWidth="2" /><circle cx="40" cy="52" r="14" fill="#333" stroke="#444" strokeWidth="2" /><circle cx="40" cy="52" r="5" fill="#555" /><rect x="62" y="40" width="18" height="24" rx="2" fill="#FFEB3B" opacity="0.8" /></>,
    fan: <><circle cx="50" cy="42" r="32" fill="none" stroke={color} strokeWidth="4" /><circle cx="50" cy="42" r="7" fill="#333" stroke="#333" strokeWidth="2" /><ellipse cx="50" cy="42" rx="4" ry="26" fill={color} stroke="#333" strokeWidth="1" transform="rotate(0 50 42)" opacity="0.9" /><ellipse cx="50" cy="42" rx="4" ry="26" fill={color} stroke="#333" strokeWidth="1" transform="rotate(120 50 42)" opacity="0.9" /><ellipse cx="50" cy="42" rx="4" ry="26" fill={color} stroke="#333" strokeWidth="1" transform="rotate(240 50 42)" opacity="0.9" /><rect x="45" y="78" width="10" height="14" fill="#333" stroke="#333" strokeWidth="1" /></>,
    menu_board: <><rect x="15" y="8" width="70" height="78" rx="3" fill="#1B5E20" stroke="#333" strokeWidth="2" /><rect x="20" y="12" width="60" height="68" fill="#2E7D32" /><line x1="25" y1="22" x2="75" y2="22" stroke="#FFF9C4" strokeWidth="2" opacity="0.8" /><line x1="25" y1="36" x2="75" y2="36" stroke="#FFF9C4" strokeWidth="2" opacity="0.8" /><line x1="25" y1="50" x2="75" y2="50" stroke="#FFF9C4" strokeWidth="2" opacity="0.8" /><line x1="25" y1="64" x2="75" y2="64" stroke="#FFF9C4" strokeWidth="2" opacity="0.8" /></>,
    tip_jar: <><path d="M30 28 L25 82 Q50 92 75 82 L70 28 Z" fill="#80DEEA" stroke="#333" strokeWidth="2" opacity="0.7" /><ellipse cx="50" cy="28" rx="20" ry="7" fill="#80DEEA" stroke="#333" strokeWidth="2" /><text x="50" y="62" fontSize="16" textAnchor="middle">💰</text></>,
    condiments: <><rect x="15" y="58" width="70" height="28" rx="3" fill={color} stroke="#333" strokeWidth="2" /><rect x="20" y="28" width="14" height="34" rx="2" fill="#F44336" stroke="#333" strokeWidth="1" /><rect x="42" y="32" width="14" height="30" rx="2" fill="#FFEB3B" stroke="#333" strokeWidth="1" /><rect x="64" y="28" width="14" height="34" rx="2" fill="#795548" stroke="#333" strokeWidth="1" /></>,
    cash_register: <><rect x="15" y="28" width="70" height="58" rx="3" fill="#37474F" stroke="#333" strokeWidth="2" /><rect x="20" y="32" width="60" height="24" rx="2" fill="#4CAF50" stroke="#333" strokeWidth="1" /><rect x="25" y="62" width="50" height="20" rx="2" fill="#212121" /></>,
    blender: <><path d="M35 28 L30 78 Q50 88 70 78 L65 28 Z" fill="#80DEEA" stroke="#333" strokeWidth="2" opacity="0.7" /><ellipse cx="50" cy="28" rx="18" ry="6" fill="#37474F" stroke="#333" strokeWidth="2" /><rect x="35" y="78" width="30" height="14" rx="2" fill="#37474F" stroke="#333" strokeWidth="2" /></>,
    coffee_machine: <><rect x="20" y="18" width="60" height="68" rx="5" fill={color} stroke="#333" strokeWidth="2" /><rect x="30" y="28" width="40" height="30" rx="3" fill="#333" /><rect x="28" y="65" width="20" height="16" rx="2" fill="#5D4037" stroke="#333" strokeWidth="1" /><circle cx="60" cy="78" r="8" fill="#455A64" stroke="#333" strokeWidth="1" /></>,
    fire_extinguisher: <><ellipse cx="50" cy="80" rx="18" ry="8" fill={color} /><rect x="35" y="28" width="30" height="55" rx="5" fill="#F44336" stroke="#333" strokeWidth="2" /><rect x="42" y="12" width="16" height="18" rx="2" fill="#333" stroke="#333" strokeWidth="1" /><path d="M58 18 Q72 15 75 28" fill="none" stroke="#333" strokeWidth="3" /></>,
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {defs}
      <rect width="200" height="200" fill="url(#floorG)" rx="12" />
      <ellipse cx="100" cy="185" rx="70" ry="10" fill="#00000022" />
      <g transform={`translate(${100 - 50 * s},${100 - 50 * s}) scale(${s})`}>{items[data.type] || items.table}</g>
      <text x="180" y="25" fontSize="20">{icon}</text>
    </svg>
  )
}

// ==================== UI COMPONENTS ====================

interface SelectorProps {
  label: string
  options: CatalogOption[]
  value: string
  onChange: (value: string) => void
  showColor?: boolean
  showIcon?: boolean
}

const Selector: React.FC<SelectorProps> = ({ label, options, value, onChange, showColor, showIcon }) => {
  const idx = options.findIndex(o => o.id === value)
  const prev = () => onChange(options[idx <= 0 ? options.length - 1 : idx - 1].id)
  const next = () => onChange(options[idx >= options.length - 1 ? 0 : idx + 1].id)
  const cur = options[idx] || options[0]

  return (
    <div className="flex items-center justify-between bg-white/50 rounded-lg p-2 border border-white/30">
      <span className="font-semibold text-gray-700 w-20 text-xs">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={prev} className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold text-sm shadow flex items-center justify-center">◀</button>
        <div className="w-24 text-center flex items-center justify-center gap-1">
          {showIcon && cur.icon && <span className="text-sm">{cur.icon}</span>}
          {showColor && cur.color && <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: cur.color }} />}
          <span className="font-medium text-gray-700 text-xs truncate">{cur.name}</span>
        </div>
        <button onClick={next} className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold text-sm shadow flex items-center justify-center">▶</button>
      </div>
    </div>
  )
}

// Templates/Presets for each type
const TEMPLATES: Record<string, { name: string; icon: string; data: Partial<CreationData> }[]> = {
  personajes: [
    { name: 'Taquero', icon: '🌮', data: { role: 'vendor', mood: 'happy', skinTone: 'tan', hair: 'short', accessory: 'apron', facialHair: 'mustache' } },
    { name: 'Abuelita', icon: '👵', data: { role: 'customer', mood: 'happy', skinTone: 'light', hair: 'bun', glasses: 'reading', extra: 'wrinkles' } },
    { name: 'Hipster', icon: '🧔', data: { role: 'customer', mood: 'cool', hair: 'man_bun', facialHair: 'beard', glasses: 'round', accessory: 'headphones' } },
    { name: 'Chef', icon: '👨‍🍳', data: { role: 'vendor', mood: 'proud', hair: 'short', accessory: 'chef_hat', facialHair: 'stubble' } },
    { name: 'Turista', icon: '📸', data: { role: 'customer', mood: 'excited', skinTone: 'pale', hair: 'short', accessory: 'cap', glasses: 'sunglasses' } },
    { name: 'Niño', icon: '👦', data: { role: 'customer', mood: 'excited', base: 'round', hair: 'messy', extra: 'freckles' } },
  ],
  ingredientes: [
    { name: 'Taco', icon: '🌮', data: { category: 'taco', origin: 'mexican', shape: 'folded', flavor: 'savory', state: 'hot' } },
    { name: 'Elote', icon: '🌽', data: { category: 'snack', origin: 'mexican', shape: 'long', flavor: 'savory', state: 'hot' } },
    { name: 'Agua Fresca', icon: '🥤', data: { category: 'drink', origin: 'mexican', shape: 'tall', flavor: 'sweet', state: 'cold' } },
    { name: 'Churro', icon: '🥖', data: { category: 'dessert', origin: 'spanish', shape: 'long', flavor: 'sweet', state: 'hot' } },
    { name: 'Burrito', icon: '🌯', data: { category: 'main', origin: 'mexican', shape: 'wrapped', flavor: 'savory', state: 'hot' } },
    { name: 'Helado', icon: '🍦', data: { category: 'dessert', origin: 'american', shape: 'cone', flavor: 'sweet', state: 'frozen' } },
  ],
  artefactos: [
    { name: 'Silla Plástica', icon: '🪑', data: { type: 'chair', material: 'plastic', size: 'medium', style: 'simple', condition: 'used' } },
    { name: 'Mesa Plegable', icon: '🪑', data: { type: 'table', material: 'metal', size: 'large', style: 'folding', condition: 'good' } },
    { name: 'Sombrilla', icon: '⛱️', data: { type: 'umbrella', material: 'fabric', size: 'large', style: 'colorful', condition: 'good' } },
    { name: 'Comal', icon: '🍳', data: { type: 'griddle', material: 'metal', size: 'large', style: 'traditional', condition: 'seasoned' } },
    { name: 'Letrero', icon: '📋', data: { type: 'sign', material: 'wood', size: 'medium', style: 'handmade', condition: 'weathered' } },
    { name: 'Tanque Gas', icon: '🔥', data: { type: 'tank', material: 'metal', size: 'large', style: 'industrial', condition: 'good' } },
  ],
}

interface EditorProps {
  type: keyof Catalogs
  catalog: CatalogSection
  SVGComponent: React.FC<{ data: CreationData }>
  onSave: (item: { type: string; data: CreationData }) => void
  onSaveToGallery: (item: { type: string; data: CreationData }) => void
  loadedData?: CreationData | null
}

const Editor: React.FC<EditorProps> = ({ type, catalog, SVGComponent, onSave, onSaveToGallery, loadedData }) => {
  const defaults = Object.fromEntries(Object.entries(catalog).map(([k, v]) => [k, v[0]?.id || '']))
  const [data, setData] = useState<CreationData>({ name: '', description: '', ...defaults })
  const update = (k: string, v: string) => setData(p => ({ ...p, [k]: v }))

  // Load data when loadedData changes
  useEffect(() => {
    if (loadedData) {
      setData({ ...defaults, ...loadedData })
    }
  }, [loadedData])

  // Randomize function
  const randomize = () => {
    const randomData: CreationData = { name: '', description: '' }
    Object.entries(catalog).forEach(([key, options]) => {
      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length)
        randomData[key] = options[randomIndex].id
      }
    })
    setData(randomData)
  }

  // Apply template
  const applyTemplate = (template: { name: string; data: Partial<CreationData> }) => {
    setData(prev => ({ ...defaults, ...prev, ...template.data, name: template.name, description: '' }))
  }

  const templates = TEMPLATES[type] || []

  const groups: Record<string, [string, string[]][]> = {
    personajes: [
      ['Cara', ['base', 'skinTone', 'nose']],
      ['Ojos', ['eyes', 'eyeColor', 'eyebrows']],
      ['Boca', ['mouth', 'facialHair']],
      ['Pelo', ['hair', 'hairColor']],
      ['Accesorios', ['accessory', 'glasses', 'earrings', 'extra']],
      ['Personalidad', ['role', 'mood']],
    ],
    ingredientes: [
      ['Tipo', ['category', 'origin']],
      ['Apariencia', ['shape', 'color']],
      ['Sabor', ['flavor', 'state']],
    ],
    artefactos: [
      ['Tipo', ['type', 'material']],
      ['Estilo', ['size', 'style', 'condition']],
    ],
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg">
        <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">Vista Previa</h3>
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg p-2 flex justify-center">
          <SVGComponent data={data} />
        </div>
        <input type="text" value={data.name} onChange={e => update('name', e.target.value)}
          placeholder="Nombre..." className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
        <textarea value={data.description} onChange={e => update('description', e.target.value)}
          placeholder="Descripción..." className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" rows={2} />
        <div className="flex gap-2 mt-2">
          <button onClick={() => data.name && onSaveToGallery({ type, data })}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-sm">
            📁 Galería
          </button>
          <button onClick={() => data.name && onSave({ type, data })}
            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-sm">
            🚀 Enviar
          </button>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg overflow-y-auto max-h-[500px]">
        {/* Random & Templates */}
        <div className="mb-3">
          <button onClick={randomize} className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg text-sm mb-2">
            🎲 Aleatorio
          </button>
          {templates.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {templates.map((t, i) => (
                <button key={i} onClick={() => applyTemplate(t)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium">
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">🎨 Personalizar</h3>
        {(groups[type] || []).map(([groupName, keys]) => (
          <div key={groupName} className="mb-2">
            <div className="text-xs font-bold text-gray-500 mb-1">{groupName}</div>
            <div className="space-y-1">
              {keys.filter(k => catalog[k]).map(k => (
                <Selector key={k} label={k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}
                  options={catalog[k]} value={data[k]} onChange={v => update(k, v)}
                  showColor={!!catalog[k][0]?.color} showIcon={!!catalog[k][0]?.icon} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface GalleryProps {
  items: Creation[]
  onClear: () => void
  onLoad: (item: Creation) => void
  onDelete: (index: number) => void
  onSubmit: (item: Creation) => void
}

const Gallery: React.FC<GalleryProps> = ({ items, onClear, onLoad, onDelete, onSubmit }) => {
  if (!items.length) return null

  const SVGComponents: Record<string, React.FC<{ data: CreationData }>> = {
    personajes: PersonajeSVG,
    ingredientes: IngredienteSVG,
    artefactos: ArtefactoSVG,
  }

  return (
    <div className="mt-4 bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-700 text-sm">📁 Mi Galería ({items.length})</h3>
        <button onClick={onClear} className="text-red-500 text-xs hover:underline">Limpiar Todo</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {items.map((item, i) => {
          const SVG = SVGComponents[item.type]
          return (
            <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-blue-400 transition-all group">
              <div className="w-full aspect-square flex items-center justify-center bg-white rounded mb-1 overflow-hidden">
                <div className="transform scale-50">
                  <SVG data={item.data} />
                </div>
              </div>
              <div className="text-xs font-medium text-gray-700 truncate text-center">{item.data.name}</div>
              <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onLoad(item)} className="flex-1 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs" title="Editar">✏️</button>
                <button onClick={() => onSubmit(item)} className="flex-1 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs" title="Enviar">🚀</button>
                <button onClick={() => onDelete(i)} className="flex-1 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs" title="Borrar">🗑️</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== MAIN APP ====================

const SECTIONS: Section[] = [
  // Personajes 2D desactivado - usar tab 3D en su lugar
  // { id: 'personajes', name: 'Personajes', icon: '👤', color: 'from-orange-400 to-amber-400', catalog: CATALOGS.personajes, svg: PersonajeSVG },
  { id: 'ingredientes', name: 'Ingredientes', icon: '🥬', color: 'from-green-400 to-emerald-400', catalog: CATALOGS.ingredientes, svg: IngredienteSVG },
  { id: 'artefactos', name: 'Artefactos', icon: '🪑', color: 'from-amber-500 to-yellow-400', catalog: CATALOGS.artefactos, svg: ArtefactoSVG },
]

import { creatorApi } from '../../services/creatorApi'

const GALLERY_STORAGE_KEY = 'calleviva_creator_gallery'

const CalleVivaCreator = () => {
  const [activeTab, setActiveTab] = useState('personajes3d') // 3D por defecto
  const [toast, setToast] = useState<string | null>(null)
  const [loadedData, setLoadedData] = useState<CreationData | null>(null)
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set())

  // Load gallery from localStorage on mount
  const [gallery, setGallery] = useState<Creation[]>(() => {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save gallery to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(gallery))
  }, [gallery])

  const section = SECTIONS.find(s => s.id === activeTab)
  const bgColor = activeTab === 'personajes3d' ? 'from-sky-400 to-cyan-400' : activeTab === 'locaciones3d' ? 'from-emerald-400 to-teal-400' : activeTab === 'animados' ? 'from-coral to-mango' : (section?.color || 'from-orange-400 to-amber-400')

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  // Save to gallery (local only)
  const saveToGallery = (item: { type: string; data: CreationData }) => {
    const newCreation: Creation = {
      type: item.type,
      data: item.data,
      id: `${item.type}_${Date.now()}`,
      creator: 'Nacho',
      createdAt: new Date().toISOString()
    }
    setGallery(prev => [...prev, newCreation])
    showToast('📁 Guardado en galería')
  }

  // Submit to server (with duplicate prevention)
  const submitToServer = async (item: { type: string; data: CreationData }, itemId?: string) => {
    // Create a unique key for this submission
    const submissionKey = itemId || JSON.stringify({ type: item.type, name: item.data.name })

    // Prevent double submission
    if (submittingIds.has(submissionKey)) {
      showToast('⏳ Ya se está enviando...')
      return
    }

    setSubmittingIds(prev => new Set(prev).add(submissionKey))

    try {
      await creatorApi.submit({
        content_type: item.type,
        name: item.data.name || `${item.type} sin nombre`,
        description: item.data.description || '',
        recipe: item.data as any
      })
      showToast('🚀 ¡Enviado para revisión!')
    } catch (err) {
      console.error(err)
      showToast('❌ Error al enviar')
    } finally {
      // Keep the ID blocked for 3 seconds to prevent rapid re-clicks
      setTimeout(() => {
        setSubmittingIds(prev => {
          const next = new Set(prev)
          next.delete(submissionKey)
          return next
        })
      }, 3000)
    }
  }

  // Load item into editor
  const loadIntoEditor = (item: Creation) => {
    setActiveTab(item.type)
    setLoadedData({ ...item.data })
    showToast('✏️ Cargado en editor')
  }

  // Delete from gallery
  const deleteFromGallery = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
    showToast('🗑️ Eliminado')
  }

  // Clear gallery
  const clearGallery = () => {
    if (window.confirm('¿Borrar toda la galería?')) {
      setGallery([])
      showToast('🗑️ Galería limpiada')
    }
  }

  // Submit from gallery
  const submitFromGallery = async (item: Creation) => {
    await submitToServer({ type: item.type, data: item.data })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgColor} p-3 transition-all duration-500`}>
      <div className="text-center mb-3">
        <h1 className="text-2xl font-black text-white drop-shadow-lg">🚚 CalleViva Creator</h1>
        <p className="text-white/80 text-xs">Crea contenido para el juego</p>
      </div>

      <div className="flex justify-center gap-1 mb-3 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => { setActiveTab(s.id); setLoadedData(null) }}
            className={`px-3 py-1.5 rounded-full font-bold text-sm transition-all ${activeTab === s.id ? 'bg-white text-gray-800 shadow-lg scale-105' : 'bg-white/30 text-white hover:bg-white/50'}`}>
            {s.icon} {s.name}
          </button>
        ))}
        {/* Tab especial para Personajes 3D */}
        <button
          onClick={() => { setActiveTab('personajes3d'); setLoadedData(null) }}
          className={`px-3 py-1.5 rounded-full font-bold text-sm transition-all ${activeTab === 'personajes3d' ? 'bg-white text-gray-800 shadow-lg scale-105' : 'bg-white/30 text-white hover:bg-white/50'}`}
        >
          🧍 Personajes 3D
        </button>
        {/* Tab especial para Locaciones 3D */}
        <button
          onClick={() => { setActiveTab('locaciones3d'); setLoadedData(null) }}
          className={`px-3 py-1.5 rounded-full font-bold text-sm transition-all ${activeTab === 'locaciones3d' ? 'bg-white text-gray-800 shadow-lg scale-105' : 'bg-white/30 text-white hover:bg-white/50'}`}
        >
          🏙️ Locaciones 3D
        </button>
        {/* Tab especial para Personajes Animados (aprobados) */}
        <button
          onClick={() => { setActiveTab('animados'); setLoadedData(null) }}
          className={`px-3 py-1.5 rounded-full font-bold text-sm transition-all ${activeTab === 'animados' ? 'bg-white text-gray-800 shadow-lg scale-105' : 'bg-white/30 text-white hover:bg-white/50'}`}
        >
          🎬 Animados
        </button>
      </div>

      <div className={activeTab === 'locaciones3d' ? 'max-w-7xl mx-auto' : 'max-w-5xl mx-auto'}>
        {activeTab === 'personajes3d' ? (
          <Suspense fallback={
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="animate-pulse text-xl">Cargando editor 3D...</div>
            </div>
          }>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '80vh' }}>
              <Character3DCreator />
            </div>
          </Suspense>
        ) : activeTab === 'locaciones3d' ? (
          <Suspense fallback={
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="animate-pulse text-xl">Cargando editor de locaciones...</div>
            </div>
          }>
            <div className="rounded-xl shadow-lg overflow-hidden" style={{ height: '85vh' }}>
              <GameScene3D />
            </div>
          </Suspense>
        ) : activeTab === 'animados' ? (
          <Suspense fallback={
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="animate-pulse text-xl">Cargando personajes animados...</div>
            </div>
          }>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '80vh' }}>
              <ApprovedCharacters3D />
            </div>
          </Suspense>
        ) : section ? (
          <>
            <Editor
              key={activeTab}
              type={section.id}
              catalog={section.catalog}
              SVGComponent={section.svg}
              onSave={submitToServer}
              onSaveToGallery={saveToGallery}
              loadedData={loadedData}
            />
            <Gallery
              items={gallery}
              onClear={clearGallery}
              onLoad={loadIntoEditor}
              onDelete={deleteFromGallery}
              onSubmit={submitFromGallery}
            />
          </>
        ) : null}
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          {toast}
        </div>
      )}

      <div className="text-center mt-4 text-white/60 text-xs">Hecho con 🧡 para CalleViva.club</div>
    </div>
  )
}

export default CalleVivaCreator
export { PersonajeSVG, IngredienteSVG, ArtefactoSVG }
