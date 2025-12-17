import React, { useState } from 'react'

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
  productos: CatalogSection
  artefactos: CatalogSection
  sitios: CatalogSection
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
      { id: 'none', name: 'Calvo' }, { id: 'short', name: 'Corto' }, { id: 'spiky', name: 'Parado' },
      { id: 'long', name: 'Largo' }, { id: 'curly', name: 'Rizado' }, { id: 'afro', name: 'Afro' },
      { id: 'mohawk', name: 'Mohicano' }, { id: 'ponytail', name: 'Cola' }, { id: 'pigtails', name: 'Colitas' },
      { id: 'braids', name: 'Trenzas' }, { id: 'bun', name: 'Moño' }, { id: 'messy', name: 'Despeinado' },
      { id: 'mullet', name: 'Mullet' }, { id: 'wavy', name: 'Ondulado' }, { id: 'bob', name: 'Carré' },
      { id: 'dreads', name: 'Rastas' },
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
      { id: 'hat', name: 'Sombrero' }, { id: 'cowboy', name: 'Vaquero' }, { id: 'chef', name: 'Gorro Chef' },
      { id: 'beanie', name: 'Gorro Lana' }, { id: 'headband', name: 'Cintillo' }, { id: 'bandana', name: 'Bandana' },
      { id: 'crown', name: 'Corona' }, { id: 'flower', name: 'Flor' }, { id: 'bow', name: 'Lazo' },
      { id: 'helmet', name: 'Casco' }, { id: 'party_hat', name: 'Gorro Fiesta' }, { id: 'pirate', name: 'Pirata' },
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
  
  productos: {
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
  
  sitios: {
    type: [
      { id: 'plaza', name: 'Plaza', icon: '🏛️' }, { id: 'park', name: 'Parque', icon: '🌳' },
      { id: 'street', name: 'Calle', icon: '🛣️' }, { id: 'corner', name: 'Esquina', icon: '🏘️' },
      { id: 'avenue', name: 'Avenida', icon: '🚗' }, { id: 'beach', name: 'Playa', icon: '🏖️' },
      { id: 'pier', name: 'Muelle', icon: '⚓' }, { id: 'market', name: 'Mercado', icon: '🏪' },
      { id: 'fair', name: 'Feria', icon: '🎪' }, { id: 'stadium', name: 'Estadio', icon: '🏟️' },
      { id: 'university', name: 'Universidad', icon: '🎓' }, { id: 'hospital', name: 'Hospital', icon: '🏥' },
      { id: 'bus_stop', name: 'Parada Bus', icon: '🚏' }, { id: 'mall', name: 'Mall', icon: '🛒' },
      { id: 'downtown', name: 'Centro', icon: '🏙️' }, { id: 'neighborhood', name: 'Barrio', icon: '🏠' },
      { id: 'countryside', name: 'Campo', icon: '🌾' }, { id: 'mountain', name: 'Montaña', icon: '⛰️' },
      { id: 'river', name: 'Río', icon: '🏞️' }, { id: 'bridge', name: 'Puente', icon: '🌉' },
    ],
    time: [
      { id: 'dawn', name: 'Madrugada', color: '#FFE0B2' }, { id: 'morning', name: 'Mañana', color: '#FFF9C4' },
      { id: 'noon', name: 'Mediodía', color: '#FFECB3' }, { id: 'afternoon', name: 'Tarde', color: '#FFCC80' },
      { id: 'sunset', name: 'Atardecer', color: '#FFAB91' }, { id: 'evening', name: 'Anochecer', color: '#CE93D8' },
      { id: 'night', name: 'Noche', color: '#5C6BC0' }, { id: 'midnight', name: 'Medianoche', color: '#283593' },
    ],
    weather: [
      { id: 'sunny', name: 'Soleado', icon: '☀️' }, { id: 'partly_cloudy', name: 'Parcial Nublado', icon: '⛅' },
      { id: 'cloudy', name: 'Nublado', icon: '☁️' }, { id: 'light_rain', name: 'Llovizna', icon: '🌦️' },
      { id: 'rainy', name: 'Lluvioso', icon: '🌧️' }, { id: 'stormy', name: 'Tormenta', icon: '⛈️' },
      { id: 'foggy', name: 'Neblina', icon: '🌫️' }, { id: 'windy', name: 'Ventoso', icon: '💨' },
      { id: 'hot', name: 'Caluroso', icon: '🥵' },
    ],
    crowd: [
      { id: 'empty', name: 'Vacío' }, { id: 'few', name: 'Poca Gente' }, { id: 'moderate', name: 'Moderado' },
      { id: 'busy', name: 'Concurrido' }, { id: 'crowded', name: 'Lleno' }, { id: 'packed', name: 'Abarrotado' },
    ],
    vibe: [
      { id: 'peaceful', name: 'Tranquilo' }, { id: 'lively', name: 'Animado' }, { id: 'festive', name: 'Festivo' },
      { id: 'romantic', name: 'Romántico' }, { id: 'family', name: 'Familiar' }, { id: 'young', name: 'Juvenil' },
      { id: 'professional', name: 'Profesional' }, { id: 'touristy', name: 'Turístico' }, { id: 'local', name: 'Local' },
      { id: 'dangerous', name: 'Peligroso' }, { id: 'hipster', name: 'Hipster' },
    ],
    music: [
      { id: 'none', name: 'Sin Música' }, { id: 'salsa', name: 'Salsa', icon: '💃' },
      { id: 'reggaeton', name: 'Reggaetón', icon: '🎤' }, { id: 'cumbia', name: 'Cumbia', icon: '🪗' },
      { id: 'rock', name: 'Rock', icon: '🎸' }, { id: 'pop', name: 'Pop', icon: '🎵' },
      { id: 'traditional', name: 'Tradicional', icon: '🪘' }, { id: 'electronic', name: 'Electrónica', icon: '🎧' },
    ],
    special: [
      { id: 'none', name: 'Normal' }, { id: 'holiday', name: 'Feriado', icon: '🎉' },
      { id: 'christmas', name: 'Navidad', icon: '🎄' }, { id: 'independence', name: 'Independencia', icon: '🇨🇷' },
      { id: 'halloween', name: 'Halloween', icon: '🎃' }, { id: 'new_year', name: 'Año Nuevo', icon: '🎆' },
      { id: 'game_day', name: 'Día de Partido', icon: '⚽' }, { id: 'concert', name: 'Concierto', icon: '🎤' },
    ],
  },
}

// ==================== SVG COMPONENTS ====================

const PersonajeSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const skinColor = CATALOGS.personajes.skinTone.find(s => s.id === data.skinTone)?.color || '#E59866'
  const hairColor = CATALOGS.personajes.hairColor.find(h => h.id === data.hairColor)?.color || '#1C1C1C'
  const eyeColor = CATALOGS.personajes.eyeColor.find(e => e.id === data.eyeColor)?.color || '#5D4037'

  const faces: Record<string, JSX.Element> = {
    round: <circle cx="100" cy="100" r="65" fill={skinColor} stroke="#333" strokeWidth="2" />,
    oval: <ellipse cx="100" cy="105" rx="50" ry="68" fill={skinColor} stroke="#333" strokeWidth="2" />,
    square: <rect x="45" y="40" width="110" height="120" rx="12" fill={skinColor} stroke="#333" strokeWidth="2" />,
    triangle: <path d="M100 40 L160 160 L40 160 Z" fill={skinColor} stroke="#333" strokeWidth="2" />,
    heart: <path d="M100 165 C40 120 40 60 70 50 C90 45 100 60 100 60 C100 60 110 45 130 50 C160 60 160 120 100 165" fill={skinColor} stroke="#333" strokeWidth="2" />,
    long: <ellipse cx="100" cy="100" rx="40" ry="75" fill={skinColor} stroke="#333" strokeWidth="2" />,
    wide: <ellipse cx="100" cy="100" rx="70" ry="50" fill={skinColor} stroke="#333" strokeWidth="2" />,
    diamond: <polygon points="100,30 155,100 100,170 45,100" fill={skinColor} stroke="#333" strokeWidth="2" />,
  }

  const eyes: Record<string, JSX.Element> = {
    normal: <><ellipse cx="70" cy="90" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="2"/><ellipse cx="130" cy="90" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="92" r="5" fill={eyeColor}/><circle cx="130" cy="92" r="5" fill={eyeColor}/></>,
    big: <><ellipse cx="65" cy="90" rx="18" ry="20" fill="white" stroke="#333" strokeWidth="2"/><ellipse cx="135" cy="90" rx="18" ry="20" fill="white" stroke="#333" strokeWidth="2"/><circle cx="65" cy="92" r="9" fill={eyeColor}/><circle cx="135" cy="92" r="9" fill={eyeColor}/></>,
    small: <><circle cx="70" cy="90" r="5" fill="white" stroke="#333" strokeWidth="2"/><circle cx="130" cy="90" r="5" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="90" r="2" fill={eyeColor}/><circle cx="130" cy="90" r="2" fill={eyeColor}/></>,
    tired: <><ellipse cx="70" cy="95" rx="10" ry="6" fill="white" stroke="#333" strokeWidth="2"/><ellipse cx="130" cy="95" rx="10" ry="6" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="95" r="3" fill={eyeColor}/><circle cx="130" cy="95" r="3" fill={eyeColor}/><path d="M58 100 Q70 106 82 100" fill="none" stroke="#9E9E9E" strokeWidth="2"/><path d="M118 100 Q130 106 142 100" fill="none" stroke="#9E9E9E" strokeWidth="2"/></>,
    angry: <><ellipse cx="70" cy="92" rx="10" ry="10" fill="white" stroke="#333" strokeWidth="2"/><ellipse cx="130" cy="92" rx="10" ry="10" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="94" r="5" fill={eyeColor}/><circle cx="130" cy="94" r="5" fill={eyeColor}/><path d="M55 80 L85 88" stroke="#333" strokeWidth="3"/><path d="M145 80 L115 88" stroke="#333" strokeWidth="3"/></>,
    happy: <><path d="M58 90 Q70 82 82 90" fill="none" stroke="#333" strokeWidth="3"/><path d="M118 90 Q130 82 142 90" fill="none" stroke="#333" strokeWidth="3"/></>,
    wink: <><ellipse cx="70" cy="90" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="92" r="5" fill={eyeColor}/><path d="M118 92 Q130 86 142 92" fill="none" stroke="#333" strokeWidth="3"/></>,
    surprised: <><circle cx="70" cy="90" r="14" fill="white" stroke="#333" strokeWidth="2"/><circle cx="130" cy="90" r="14" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="90" r="7" fill={eyeColor}/><circle cx="130" cy="90" r="7" fill={eyeColor}/></>,
    sleepy: <><path d="M58 92 L82 92" stroke="#333" strokeWidth="3"/><path d="M118 92 L142 92" stroke="#333" strokeWidth="3"/></>,
    crying: <><ellipse cx="70" cy="90" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="2"/><ellipse cx="130" cy="90" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="92" r="5" fill={eyeColor}/><circle cx="130" cy="92" r="5" fill={eyeColor}/><path d="M65 102 Q62 120 65 140" fill="none" stroke="#4FC3F7" strokeWidth="3"/><path d="M135 102 Q138 120 135 140" fill="none" stroke="#4FC3F7" strokeWidth="3"/></>,
    hearts: <><path d="M70,85 C65,78 55,85 70,98 C85,85 75,78 70,85" fill="#E91E63"/><path d="M130,85 C125,78 115,85 130,98 C145,85 135,78 130,85" fill="#E91E63"/></>,
    stars: <><polygon points="70,80 73,90 83,90 75,96 78,106 70,100 62,106 65,96 57,90 67,90" fill="#FFD700"/><polygon points="130,80 133,90 143,90 135,96 138,106 130,100 122,106 125,96 117,90 127,90" fill="#FFD700"/></>,
    dizzy: <><path d="M60 82 L80 102 M60 102 L80 82" stroke="#333" strokeWidth="3"/><path d="M120 82 L140 102 M120 102 L140 82" stroke="#333" strokeWidth="3"/></>,
    suspicious: <><ellipse cx="70" cy="95" rx="10" ry="6" fill="white" stroke="#333" strokeWidth="2"/><ellipse cx="130" cy="95" rx="10" ry="6" fill="white" stroke="#333" strokeWidth="2"/><circle cx="74" cy="95" r="3" fill={eyeColor}/><circle cx="134" cy="95" r="3" fill={eyeColor}/></>,
    crazy: <><circle cx="65" cy="88" r="14" fill="white" stroke="#333" strokeWidth="2"/><circle cx="135" cy="92" r="10" fill="white" stroke="#333" strokeWidth="2"/><circle cx="68" cy="88" r="8" fill={eyeColor}/><circle cx="138" cy="92" r="5" fill={eyeColor}/></>,
  }

  const mouths: Record<string, JSX.Element> = {
    smile: <path d="M75 130 Q100 150 125 130" fill="none" stroke="#333" strokeWidth="3"/>,
    big_smile: <><path d="M70 128 Q100 160 130 128" fill="#8B0000" stroke="#333" strokeWidth="3"/><path d="M75 128 Q100 140 125 128" fill="white"/></>,
    tooth: <><path d="M75 130 Q100 150 125 130" fill="#8B0000" stroke="#333" strokeWidth="3"/><rect x="95" y="130" width="10" height="12" fill="white" stroke="#333" rx="2"/></>,
    missing_teeth: <><path d="M75 130 Q100 150 125 130" fill="#8B0000" stroke="#333" strokeWidth="3"/><rect x="78" y="130" width="8" height="10" fill="white" stroke="#333" rx="1"/><rect x="114" y="130" width="8" height="10" fill="white" stroke="#333" rx="1"/></>,
    open: <ellipse cx="100" cy="140" rx="18" ry="15" fill="#8B0000" stroke="#333" strokeWidth="3"/>,
    serious: <line x1="80" y1="138" x2="120" y2="138" stroke="#333" strokeWidth="3"/>,
    sad: <path d="M75 145 Q100 130 125 145" fill="none" stroke="#333" strokeWidth="3"/>,
    surprised: <ellipse cx="100" cy="142" rx="12" ry="14" fill="#8B0000" stroke="#333" strokeWidth="3"/>,
    tongue: <><path d="M75 130 Q100 150 125 130" fill="#8B0000" stroke="#333" strokeWidth="3"/><ellipse cx="100" cy="152" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="2"/></>,
    kiss: <circle cx="100" cy="140" r="8" fill="#E91E63" stroke="#333" strokeWidth="2"/>,
    drool: <><path d="M75 135 Q100 148 125 135" fill="none" stroke="#333" strokeWidth="3"/><path d="M115 140 Q118 155 115 170" fill="none" stroke="#4FC3F7" strokeWidth="3"/></>,
    vampire: <><path d="M75 135 Q100 150 125 135" fill="#8B0000" stroke="#333" strokeWidth="3"/><polygon points="85,135 88,150 82,150" fill="white"/><polygon points="115,135 118,150 112,150" fill="white"/></>,
    gold_tooth: <><path d="M75 130 Q100 150 125 130" fill="#8B0000" stroke="#333" strokeWidth="3"/><rect x="85" y="130" width="8" height="10" fill="white" stroke="#333" rx="1"/><rect x="95" y="130" width="10" height="12" fill="#FFD700" stroke="#333" rx="1"/><rect x="107" y="130" width="8" height="10" fill="white" stroke="#333" rx="1"/></>,
    braces: <><path d="M75 130 Q100 145 125 130" fill="white" stroke="#333" strokeWidth="2"/><line x1="78" y1="135" x2="122" y2="135" stroke="#1976D2" strokeWidth="2"/></>,
  }

  const hairs: Record<string, JSX.Element | null> = {
    none: null,
    short: <ellipse cx="100" cy="45" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/>,
    spiky: <><polygon points="100,8 88,42 112,42" fill={hairColor} stroke="#333" strokeWidth="2"/><polygon points="70,18 68,48 88,42" fill={hairColor} stroke="#333" strokeWidth="2"/><polygon points="130,18 132,48 112,42" fill={hairColor} stroke="#333" strokeWidth="2"/><polygon points="50,30 52,52 68,46" fill={hairColor} stroke="#333" strokeWidth="2"/><polygon points="150,30 148,52 132,46" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    long: <><ellipse cx="100" cy="42" rx="58" ry="25" fill={hairColor} stroke="#333" strokeWidth="2"/><rect x="40" y="42" width="16" height="95" fill={hairColor}/><rect x="144" y="42" width="16" height="95" fill={hairColor}/></>,
    curly: <><circle cx="55" cy="42" r="16" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="100" cy="30" r="20" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="145" cy="42" r="16" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="42" cy="62" r="14" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="158" cy="62" r="14" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    afro: <circle cx="100" cy="58" r="65" fill={hairColor} stroke="#333" strokeWidth="2"/>,
    mohawk: <><rect x="90" y="5" width="20" height="48" fill={hairColor} stroke="#333" strokeWidth="2"/><polygon points="100,0 85,12 115,12" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    ponytail: <><ellipse cx="100" cy="42" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="100" cy="22" r="12" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    pigtails: <><ellipse cx="100" cy="42" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="38" cy="52" r="10" fill={hairColor} stroke="#333" strokeWidth="2"/><ellipse cx="38" cy="75" rx="8" ry="18" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="162" cy="52" r="10" fill={hairColor} stroke="#333" strokeWidth="2"/><ellipse cx="162" cy="75" rx="8" ry="18" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    braids: <><ellipse cx="100" cy="42" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/><rect x="32" y="48" width="10" height="75" rx="4" fill={hairColor} stroke="#333" strokeWidth="2"/><rect x="158" y="48" width="10" height="75" rx="4" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    bun: <><ellipse cx="100" cy="42" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/><circle cx="100" cy="18" r="18" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    messy: <><ellipse cx="100" cy="45" rx="58" ry="25" fill={hairColor} stroke="#333" strokeWidth="2"/><path d="M50 38 Q45 20 60 28" fill={hairColor} stroke="#333" strokeWidth="2"/><path d="M150 38 Q155 20 140 28" fill={hairColor} stroke="#333" strokeWidth="2"/><path d="M80 28 Q85 10 95 22" fill={hairColor} stroke="#333" strokeWidth="2"/></>,
    mullet: <><ellipse cx="100" cy="45" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/><rect x="62" y="48" width="76" height="65" fill={hairColor}/></>,
    wavy: <><path d="M42 52 Q55 32 70 48 Q85 32 100 48 Q115 32 130 48 Q145 32 158 52" fill={hairColor} stroke="#333" strokeWidth="2"/><ellipse cx="100" cy="48" rx="58" ry="22" fill={hairColor}/></>,
    bob: <><ellipse cx="100" cy="48" rx="58" ry="25" fill={hairColor} stroke="#333" strokeWidth="2"/><rect x="42" y="45" width="116" height="48" rx="10" fill={hairColor}/></>,
    dreads: <><ellipse cx="100" cy="42" rx="52" ry="20" fill={hairColor} stroke="#333" strokeWidth="2"/><rect x="45" y="50" width="8" height="60" rx="3" fill={hairColor} stroke="#333" strokeWidth="1"/><rect x="65" y="50" width="8" height="60" rx="3" fill={hairColor} stroke="#333" strokeWidth="1"/><rect x="85" y="50" width="8" height="60" rx="3" fill={hairColor} stroke="#333" strokeWidth="1"/><rect x="105" y="50" width="8" height="60" rx="3" fill={hairColor} stroke="#333" strokeWidth="1"/><rect x="125" y="50" width="8" height="60" rx="3" fill={hairColor} stroke="#333" strokeWidth="1"/><rect x="145" y="50" width="8" height="60" rx="3" fill={hairColor} stroke="#333" strokeWidth="1"/></>,
  }

  const accessories: Record<string, JSX.Element | null> = {
    none: null,
    cap: <><ellipse cx="100" cy="38" rx="58" ry="16" fill="#E53935" stroke="#333" strokeWidth="2"/><rect x="100" y="28" width="52" height="10" rx="3" fill="#B71C1C" stroke="#333" strokeWidth="2"/></>,
    cap_back: <><ellipse cx="100" cy="38" rx="58" ry="16" fill="#1976D2" stroke="#333" strokeWidth="2"/><rect x="48" y="28" width="52" height="10" rx="3" fill="#0D47A1" stroke="#333" strokeWidth="2"/></>,
    hat: <><ellipse cx="100" cy="45" rx="72" ry="12" fill="#5D4037" stroke="#333" strokeWidth="2"/><path d="M58 45 L62 5 L138 5 L142 45" fill="#5D4037" stroke="#333" strokeWidth="2"/><rect x="62" y="32" width="76" height="8" fill="#FFA000"/></>,
    cowboy: <><ellipse cx="100" cy="48" rx="80" ry="14" fill="#8D6E63" stroke="#333" strokeWidth="2"/><path d="M55 48 Q55 20 100 15 Q145 20 145 48" fill="#8D6E63" stroke="#333" strokeWidth="2"/></>,
    chef: <><ellipse cx="100" cy="48" rx="48" ry="14" fill="white" stroke="#333" strokeWidth="2"/><circle cx="70" cy="25" r="18" fill="white" stroke="#333" strokeWidth="2"/><circle cx="100" cy="15" r="20" fill="white" stroke="#333" strokeWidth="2"/><circle cx="130" cy="25" r="18" fill="white" stroke="#333" strokeWidth="2"/></>,
    beanie: <><path d="M45 58 Q45 20 100 15 Q155 20 155 58" fill="#7B1FA2" stroke="#333" strokeWidth="2"/><ellipse cx="100" cy="58" rx="52" ry="10" fill="#9C27B0" stroke="#333" strokeWidth="2"/><circle cx="100" cy="8" r="7" fill="#9C27B0" stroke="#333" strokeWidth="2"/></>,
    headband: <path d="M38 58 Q100 48 162 58" fill="none" stroke="#E91E63" strokeWidth="8"/>,
    bandana: <><path d="M38 52 Q100 40 162 52 L158 65 Q100 52 42 65 Z" fill="#F44336" stroke="#333" strokeWidth="2"/><circle cx="90" cy="55" r="3" fill="white"/><circle cx="110" cy="55" r="3" fill="white"/></>,
    crown: <><rect x="55" y="32" width="90" height="28" fill="#FFD700" stroke="#333" strokeWidth="2"/><polygon points="55,32 70,8 85,32" fill="#FFD700" stroke="#333" strokeWidth="2"/><polygon points="85,32 100,2 115,32" fill="#FFD700" stroke="#333" strokeWidth="2"/><polygon points="115,32 130,8 145,32" fill="#FFD700" stroke="#333" strokeWidth="2"/><circle cx="70" cy="22" r="4" fill="#E53935"/><circle cx="100" cy="18" r="5" fill="#2196F3"/><circle cx="130" cy="22" r="4" fill="#4CAF50"/></>,
    flower: <><circle cx="45" cy="58" r="7" fill="#E91E63"/><circle cx="38" cy="52" r="5" fill="#F48FB1"/><circle cx="52" cy="52" r="5" fill="#F48FB1"/><circle cx="38" cy="64" r="5" fill="#F48FB1"/><circle cx="52" cy="64" r="5" fill="#F48FB1"/><circle cx="45" cy="58" r="3" fill="#FFEB3B"/></>,
    bow: <><ellipse cx="78" cy="32" rx="14" ry="9" fill="#E91E63" stroke="#333" strokeWidth="2"/><ellipse cx="122" cy="32" rx="14" ry="9" fill="#E91E63" stroke="#333" strokeWidth="2"/><circle cx="100" cy="32" r="7" fill="#C2185B" stroke="#333" strokeWidth="2"/></>,
    helmet: <path d="M42 68 Q42 15 100 10 Q158 15 158 68" fill="#FFA000" stroke="#333" strokeWidth="2"/>,
    party_hat: <><polygon points="100,0 62,62 138,62" fill="#9C27B0" stroke="#333" strokeWidth="2"/><circle cx="100" cy="0" r="7" fill="#FFEB3B"/><circle cx="80" cy="38" r="4" fill="#4CAF50"/><circle cx="110" cy="28" r="4" fill="#E91E63"/></>,
    pirate: <><path d="M45 58 Q100 42 155 58 L152 72 Q100 58 48 72 Z" fill="#333" stroke="#333" strokeWidth="2"/><text x="100" y="68" fontSize="16" textAnchor="middle" fill="white">☠️</text></>,
  }

  const glasses: Record<string, JSX.Element | null> = {
    none: null,
    normal: <><rect x="52" y="80" width="32" height="26" rx="4" fill="none" stroke="#333" strokeWidth="3"/><rect x="116" y="80" width="32" height="26" rx="4" fill="none" stroke="#333" strokeWidth="3"/><line x1="84" y1="92" x2="116" y2="92" stroke="#333" strokeWidth="3"/></>,
    round: <><circle cx="68" cy="92" r="16" fill="none" stroke="#333" strokeWidth="3"/><circle cx="132" cy="92" r="16" fill="none" stroke="#333" strokeWidth="3"/><line x1="84" y1="92" x2="116" y2="92" stroke="#333" strokeWidth="3"/></>,
    sunglasses: <><rect x="50" y="80" width="36" height="26" rx="4" fill="#333" stroke="#333" strokeWidth="2"/><rect x="114" y="80" width="36" height="26" rx="4" fill="#333" stroke="#333" strokeWidth="2"/><line x1="86" y1="92" x2="114" y2="92" stroke="#333" strokeWidth="3"/></>,
    nerd: <><rect x="48" y="78" width="38" height="36" rx="2" fill="none" stroke="#333" strokeWidth="4"/><rect x="114" y="78" width="38" height="36" rx="2" fill="none" stroke="#333" strokeWidth="4"/><line x1="86" y1="94" x2="114" y2="94" stroke="#333" strokeWidth="4"/></>,
    heart: <><path d="M68,88 C60,78 50,88 68,102 C86,88 76,78 68,88" fill="#E91E63" stroke="#333" strokeWidth="2"/><path d="M132,88 C124,78 114,88 132,102 C150,88 140,78 132,88" fill="#E91E63" stroke="#333" strokeWidth="2"/><line x1="82" y1="92" x2="118" y2="92" stroke="#E91E63" strokeWidth="3"/></>,
    eye_patch: <><ellipse cx="68" cy="92" rx="20" ry="16" fill="#333" stroke="#333" strokeWidth="2"/><line x1="48" y1="92" x2="32" y2="78" stroke="#333" strokeWidth="3"/><line x1="88" y1="92" x2="168" y2="78" stroke="#333" strokeWidth="3"/></>,
    monocle: <><circle cx="130" cy="92" r="18" fill="none" stroke="#FFD700" strokeWidth="3"/><line x1="130" y1="110" x2="130" y2="155" stroke="#FFD700" strokeWidth="2"/></>,
    aviator: <><path d="M50 82 Q50 110 68 110 Q86 110 86 82 Q68 78 50 82" fill="#333" opacity="0.7" stroke="#FFD700" strokeWidth="2"/><path d="M114 82 Q114 110 132 110 Q150 110 150 82 Q132 78 114 82" fill="#333" opacity="0.7" stroke="#FFD700" strokeWidth="2"/><line x1="86" y1="88" x2="114" y2="88" stroke="#FFD700" strokeWidth="2"/></>,
    cat_eye: <><path d="M50 98 L50 82 L45 75 L85 82 L85 98 Z" fill="none" stroke="#E91E63" strokeWidth="3"/><path d="M150 98 L150 82 L155 75 L115 82 L115 98 Z" fill="none" stroke="#E91E63" strokeWidth="3"/><line x1="85" y1="90" x2="115" y2="90" stroke="#E91E63" strokeWidth="2"/></>,
    star: <><polygon points="68,75 72,88 86,88 74,96 78,110 68,102 58,110 62,96 50,88 64,88" fill="#FFD700" stroke="#333" strokeWidth="2"/><polygon points="132,75 136,88 150,88 138,96 142,110 132,102 122,110 126,96 114,88 128,88" fill="#FFD700" stroke="#333" strokeWidth="2"/></>,
    square: <><rect x="48" y="78" width="36" height="30" fill="none" stroke="#333" strokeWidth="3"/><rect x="116" y="78" width="36" height="30" fill="none" stroke="#333" strokeWidth="3"/><line x1="84" y1="92" x2="116" y2="92" stroke="#333" strokeWidth="3"/></>,
    vr: <rect x="40" y="75" width="120" height="38" rx="8" fill="#333" stroke="#333" strokeWidth="2"/>,
  }

  const hasHat = ['cap','cap_back','hat','cowboy','chef','beanie','helmet','party_hat','pirate'].includes(data.accessory)
  const needsEars = !['afro'].includes(data.hair)

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {!hasHat && data.hair !== 'none' && ['long','braids','bob','dreads'].includes(data.hair) && hairs[data.hair]}
      {data.hair === 'afro' && hairs.afro}
      {faces[data.base] || faces.round}
      {needsEars && <><ellipse cx="32" cy="102" rx="7" ry="11" fill={skinColor} stroke="#333" strokeWidth="2"/><ellipse cx="168" cy="102" rx="7" ry="11" fill={skinColor} stroke="#333" strokeWidth="2"/></>}
      {!hasHat && data.hair !== 'none' && !['long','braids','bob','dreads','afro'].includes(data.hair) && hairs[data.hair]}
      {eyes[data.eyes] || eyes.normal}
      {mouths[data.mouth] || mouths.smile}
      {glasses[data.glasses]}
      {accessories[data.accessory]}
    </svg>
  )
}

const ProductoSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const colorVal = CATALOGS.productos.color.find(c => c.id === data.color)?.color || '#4CAF50'
  const icon = CATALOGS.productos.category.find(c => c.id === data.category)?.icon || '🥬'
  
  const shapes: Record<string, JSX.Element> = {
    whole: <ellipse cx="100" cy="105" rx="52" ry="48" fill={colorVal} stroke="#333" strokeWidth="2"/>,
    half: <><path d="M100 55 A48 48 0 0 1 100 153" fill={colorVal} stroke="#333" strokeWidth="2"/><ellipse cx="100" cy="104" rx="5" ry="44" fill={colorVal+'AA'}/></>,
    chopped: <>{[0,1,2,3,4,5,6,7].map(i=><rect key={i} x={48+(i%4)*28} y={65+Math.floor(i/4)*38} width="20" height="20" rx="3" fill={colorVal} stroke="#333" strokeWidth="2" transform={`rotate(${i*6-12} ${58+(i%4)*28} ${75+Math.floor(i/4)*38})`}/>)}</>,
    sliced: <>{[0,1,2,3,4].map(i=><ellipse key={i} cx="100" cy={60+i*20} rx="48" ry="12" fill={colorVal} stroke="#333" strokeWidth="2" opacity={1-i*0.12}/>)}</>,
    ground: <><ellipse cx="100" cy="118" rx="58" ry="26" fill={colorVal} stroke="#333" strokeWidth="2"/></>,
    liquid: <><path d="M68 52 L58 152 Q100 168 142 152 L132 52 Z" fill={colorVal} stroke="#333" strokeWidth="2" opacity="0.85"/><ellipse cx="100" cy="52" rx="32" ry="10" fill={colorVal} stroke="#333" strokeWidth="2"/></>,
    powder: <><ellipse cx="100" cy="128" rx="52" ry="20" fill={colorVal} stroke="#333" strokeWidth="2"/><ellipse cx="100" cy="122" rx="42" ry="14" fill={colorVal+'AA'}/></>,
    leaves: <>{[0,1,2,3,4].map(i=><g key={i} transform={`translate(${62+i*18},${82+(i%2)*18}) rotate(${-18+i*10})`}><ellipse rx="11" ry="24" fill={colorVal} stroke="#333" strokeWidth="1.5"/></g>)}</>,
    bunch: <><rect x="92" y="128" width="16" height="38" fill="#8D6E63" stroke="#333" strokeWidth="2" rx="3"/>{[-28,-14,0,14,28].map((a,i)=><g key={i} transform={`translate(100,128) rotate(${a})`}><ellipse cy="-38" rx="14" ry="32" fill={colorVal} stroke="#333" strokeWidth="2"/></g>)}</>,
    diced: <>{[0,1,2,3,4,5,6,7,8,9,10,11].map(i=><rect key={i} x={52+(i%4)*26} y={62+Math.floor(i/4)*26} width="16" height="16" rx="2" fill={colorVal} stroke="#333" strokeWidth="1.5" transform={`rotate(${i*4} ${60+(i%4)*26} ${70+Math.floor(i/4)*26})`}/>)}</>,
    julienne: <>{[0,1,2,3,4,5,6,7,8,9].map(i=><rect key={i} x={52+i*10} y={62+(i%3)*8} width="5" height="68" rx="2" fill={colorVal} stroke="#333" strokeWidth="1" transform={`rotate(${-4+i*2} ${55+i*10} 100)`}/>)}</>,
    shredded: <>{[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i=><path key={i} d={`M${48+i*8} ${72+(i%3)*4} Q${52+i*8} 100 ${48+i*8} ${138-(i%4)*4}`} fill="none" stroke={colorVal} strokeWidth="4" strokeLinecap="round"/>)}</>,
    mashed: <><ellipse cx="100" cy="112" rx="58" ry="32" fill={colorVal} stroke="#333" strokeWidth="2"/><path d="M62 98 Q82 88 100 98 Q118 88 138 98" fill="none" stroke={colorVal+'DD'} strokeWidth="3"/></>,
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#FAFAFA" rx="10"/>
      {shapes[data.shape] || shapes.whole}
      <text x="175" y="28" fontSize="22">{icon}</text>
    </svg>
  )
}

const ArtefactoSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const color = CATALOGS.artefactos.material.find(m => m.id === data.material)?.color || '#8D6E63'
  const icon = CATALOGS.artefactos.type.find(t => t.id === data.type)?.icon || '🪑'
  const sizeMap: Record<string, number> = {tiny:0.5, small:0.7, medium:1, large:1.2, huge:1.4}
  const s = sizeMap[data.size] || 1
  
  const items: Record<string, JSX.Element> = {
    table: <><rect x="12" y="30" width="76" height="8" fill={color} stroke="#333" strokeWidth="2" rx="2"/><rect x="16" y="38" width="6" height="52" fill={color} stroke="#333" strokeWidth="2"/><rect x="78" y="38" width="6" height="52" fill={color} stroke="#333" strokeWidth="2"/></>,
    chair: <><rect x="20" y="45" width="60" height="6" fill={color} stroke="#333" strokeWidth="2"/><rect x="22" y="51" width="5" height="40" fill={color} stroke="#333" strokeWidth="2"/><rect x="73" y="51" width="5" height="40" fill={color} stroke="#333" strokeWidth="2"/><rect x="20" y="10" width="60" height="38" fill={color} stroke="#333" strokeWidth="2" rx="3"/></>,
    bench: <><rect x="5" y="40" width="90" height="10" fill={color} stroke="#333" strokeWidth="2" rx="2"/><rect x="10" y="50" width="8" height="40" fill={color} stroke="#333" strokeWidth="2"/><rect x="82" y="50" width="8" height="40" fill={color} stroke="#333" strokeWidth="2"/><rect x="5" y="20" width="90" height="22" fill={color} stroke="#333" strokeWidth="2" rx="3"/></>,
    counter: <><rect x="5" y="25" width="90" height="12" fill={color} stroke="#333" strokeWidth="2" rx="2"/><rect x="10" y="37" width="80" height="55" fill={color} stroke="#333" strokeWidth="2" rx="3" opacity="0.9"/></>,
    plant: <><ellipse cx="50" cy="82" rx="28" ry="10" fill={color} stroke="#333" strokeWidth="2"/><path d="M50 72 L50 48" stroke="#5D4037" strokeWidth="4"/><ellipse cx="50" cy="32" rx="20" ry="16" fill="#4CAF50" stroke="#333" strokeWidth="2"/><ellipse cx="66" cy="48" rx="16" ry="12" fill="#66BB6A" stroke="#333" strokeWidth="2"/><ellipse cx="34" cy="50" rx="14" ry="10" fill="#81C784" stroke="#333" strokeWidth="2"/></>,
    grill: <><rect x="10" y="32" width="80" height="42" rx="5" fill="#333" stroke="#333" strokeWidth="2"/><rect x="15" y="28" width="70" height="10" rx="2" fill={color} stroke="#333" strokeWidth="2"/><rect x="20" y="78" width="8" height="14" fill="#333"/><rect x="72" y="78" width="8" height="14" fill="#333"/></>,
    cooler: <><rect x="15" y="28" width="70" height="52" rx="5" fill={color} stroke="#333" strokeWidth="2"/><rect x="15" y="18" width="70" height="14" rx="3" fill={color} stroke="#333" strokeWidth="2" opacity="0.9"/><rect x="40" y="10" width="20" height="10" rx="2" fill="#78909C" stroke="#333" strokeWidth="2"/><text x="50" y="62" fontSize="22" textAnchor="middle">❄️</text></>,
    umbrella: <><rect x="48" y="38" width="4" height="52" fill="#5D4037" stroke="#333" strokeWidth="1"/><path d="M10 42 Q50 8 90 42 Q50 52 10 42" fill={color} stroke="#333" strokeWidth="2"/><circle cx="50" cy="22" r="4" fill={color} stroke="#333" strokeWidth="1"/></>,
    sign: <><rect x="45" y="42" width="10" height="52" fill="#5D4037" stroke="#333" strokeWidth="2"/><rect x="15" y="8" width="70" height="38" rx="3" fill={color} stroke="#333" strokeWidth="2"/><line x1="25" y1="20" x2="75" y2="20" stroke="#333" strokeWidth="2" opacity="0.5"/><line x1="25" y1="30" x2="65" y2="30" stroke="#333" strokeWidth="2" opacity="0.5"/></>,
    lighting: <><path d="M50 8 L50 22" stroke="#333" strokeWidth="2"/><path d="M25 28 Q50 32 75 28 L70 68 Q50 72 30 68 Z" fill="#FFF9C4" stroke="#333" strokeWidth="2"/><ellipse cx="50" cy="68" rx="20" ry="5" fill={color} stroke="#333" strokeWidth="2"/></>,
    trash: <><path d="M20 28 L25 88 L75 88 L80 28 Z" fill={color} stroke="#333" strokeWidth="2"/><rect x="15" y="18" width="70" height="12" rx="2" fill={color} stroke="#333" strokeWidth="2"/><rect x="40" y="10" width="20" height="10" rx="5" fill="#78909C" stroke="#333" strokeWidth="2"/></>,
    shelf: <><rect x="15" y="15" width="70" height="6" fill={color} stroke="#333" strokeWidth="2"/><rect x="15" y="40" width="70" height="6" fill={color} stroke="#333" strokeWidth="2"/><rect x="15" y="65" width="70" height="6" fill={color} stroke="#333" strokeWidth="2"/><rect x="15" y="15" width="6" height="56" fill={color} stroke="#333" strokeWidth="2"/><rect x="79" y="15" width="6" height="56" fill={color} stroke="#333" strokeWidth="2"/></>,
    flower: <><rect x="45" y="48" width="10" height="42" fill="#5D4037" stroke="#333" strokeWidth="1" rx="2"/><ellipse cx="50" cy="88" rx="22" ry="8" fill={color} stroke="#333" strokeWidth="2"/><circle cx="50" cy="28" r="8" fill="#FFEB3B" stroke="#333" strokeWidth="1"/><ellipse cx="38" cy="22" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1"/><ellipse cx="62" cy="22" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1"/><ellipse cx="35" cy="35" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1"/><ellipse cx="65" cy="35" rx="10" ry="7" fill="#E91E63" stroke="#333" strokeWidth="1"/></>,
    banner: <><rect x="10" y="8" width="80" height="48" fill={color} stroke="#333" strokeWidth="2"/><polygon points="10,56 50,70 90,56 90,62 50,76 10,62" fill={color} stroke="#333" strokeWidth="2"/></>,
    flag: <><rect x="20" y="8" width="5" height="82" fill="#5D4037" stroke="#333" strokeWidth="2"/><polygon points="25,12 82,22 82,52 25,42" fill={color} stroke="#333" strokeWidth="2"/></>,
    fryer: <><rect x="15" y="22" width="70" height="58" rx="5" fill={color} stroke="#333" strokeWidth="2"/><rect x="20" y="28" width="26" height="38" rx="3" fill="#FFE082" stroke="#333" strokeWidth="1"/><rect x="52" y="28" width="26" height="38" rx="3" fill="#FFE082" stroke="#333" strokeWidth="1"/><rect x="15" y="12" width="70" height="12" rx="3" fill="#455A64" stroke="#333" strokeWidth="2"/></>,
    oven: <><rect x="15" y="18" width="70" height="68" rx="5" fill={color} stroke="#333" strokeWidth="2"/><rect x="22" y="32" width="56" height="38" rx="3" fill="#333" stroke="#333" strokeWidth="1"/><rect x="25" y="35" width="50" height="32" rx="2" fill="#1A1A1A"/><circle cx="35" cy="24" r="4" fill="#455A64" stroke="#333" strokeWidth="1"/><circle cx="50" cy="24" r="4" fill="#455A64" stroke="#333" strokeWidth="1"/><circle cx="65" cy="24" r="4" fill="#455A64" stroke="#333" strokeWidth="1"/></>,
    string_lights: <><path d="M5 28 Q25 38 50 28 Q75 38 95 28" fill="none" stroke="#333" strokeWidth="2"/><line x1="15" y1="30" x2="15" y2="40" stroke="#333" strokeWidth="1"/><ellipse cx="15" cy="46" rx="5" ry="7" fill="#F44336" stroke="#333" strokeWidth="1"/><line x1="35" y1="34" x2="35" y2="44" stroke="#333" strokeWidth="1"/><ellipse cx="35" cy="50" rx="5" ry="7" fill="#4CAF50" stroke="#333" strokeWidth="1"/><line x1="55" y1="30" x2="55" y2="40" stroke="#333" strokeWidth="1"/><ellipse cx="55" cy="46" rx="5" ry="7" fill="#FFEB3B" stroke="#333" strokeWidth="1"/><line x1="75" y1="34" x2="75" y2="44" stroke="#333" strokeWidth="1"/><ellipse cx="75" cy="50" rx="5" ry="7" fill="#2196F3" stroke="#333" strokeWidth="1"/></>,
    lantern: <><rect x="35" y="8" width="30" height="8" rx="2" fill="#333" stroke="#333" strokeWidth="1"/><rect x="30" y="18" width="40" height="58" rx="5" fill="#E53935" stroke="#333" strokeWidth="2" opacity="0.9"/><rect x="35" y="22" width="30" height="48" rx="3" fill="#FFEB3B" opacity="0.6"/><rect x="30" y="78" width="40" height="8" rx="2" fill="#333" stroke="#333" strokeWidth="1"/></>,
    awning: <><path d="M5 28 L95 28 L90 58 L10 58 Z" fill={color} stroke="#333" strokeWidth="2"/><path d="M12 58 Q23 68 34 58" fill="white" stroke="#333" strokeWidth="1"/><path d="M34 58 Q45 68 56 58" fill={color} stroke="#333" strokeWidth="1"/><path d="M56 58 Q67 68 78 58" fill="white" stroke="#333" strokeWidth="1"/><path d="M78 58 Q89 68 90 58" fill={color} stroke="#333" strokeWidth="1"/></>,
    speaker: <><rect x="25" y="12" width="50" height="72" rx="5" fill="#212121" stroke="#333" strokeWidth="2"/><circle cx="50" cy="52" r="18" fill="#333" stroke="#444" strokeWidth="2"/><circle cx="50" cy="52" r="7" fill="#555"/><circle cx="50" cy="26" r="7" fill="#333" stroke="#444" strokeWidth="1"/></>,
    radio: <><rect x="15" y="28" width="70" height="48" rx="8" fill={color} stroke="#333" strokeWidth="2"/><circle cx="40" cy="52" r="14" fill="#333" stroke="#444" strokeWidth="2"/><circle cx="40" cy="52" r="5" fill="#555"/><rect x="62" y="40" width="18" height="24" rx="2" fill="#FFEB3B" opacity="0.8"/></>,
    fan: <><circle cx="50" cy="42" r="32" fill="none" stroke={color} strokeWidth="4"/><circle cx="50" cy="42" r="7" fill="#333" stroke="#333" strokeWidth="2"/><ellipse cx="50" cy="42" rx="4" ry="26" fill={color} stroke="#333" strokeWidth="1" transform="rotate(0 50 42)" opacity="0.9"/><ellipse cx="50" cy="42" rx="4" ry="26" fill={color} stroke="#333" strokeWidth="1" transform="rotate(120 50 42)" opacity="0.9"/><ellipse cx="50" cy="42" rx="4" ry="26" fill={color} stroke="#333" strokeWidth="1" transform="rotate(240 50 42)" opacity="0.9"/><rect x="45" y="78" width="10" height="14" fill="#333" stroke="#333" strokeWidth="1"/></>,
    menu_board: <><rect x="15" y="8" width="70" height="78" rx="3" fill="#1B5E20" stroke="#333" strokeWidth="2"/><rect x="20" y="12" width="60" height="68" fill="#2E7D32"/><line x1="25" y1="22" x2="75" y2="22" stroke="#FFF9C4" strokeWidth="2" opacity="0.8"/><line x1="25" y1="36" x2="75" y2="36" stroke="#FFF9C4" strokeWidth="2" opacity="0.8"/><line x1="25" y1="50" x2="75" y2="50" stroke="#FFF9C4" strokeWidth="2" opacity="0.8"/><line x1="25" y1="64" x2="75" y2="64" stroke="#FFF9C4" strokeWidth="2" opacity="0.8"/></>,
    tip_jar: <><path d="M30 28 L25 82 Q50 92 75 82 L70 28 Z" fill="#80DEEA" stroke="#333" strokeWidth="2" opacity="0.7"/><ellipse cx="50" cy="28" rx="20" ry="7" fill="#80DEEA" stroke="#333" strokeWidth="2"/><text x="50" y="62" fontSize="16" textAnchor="middle">💰</text></>,
    condiments: <><rect x="15" y="58" width="70" height="28" rx="3" fill={color} stroke="#333" strokeWidth="2"/><rect x="20" y="28" width="14" height="34" rx="2" fill="#F44336" stroke="#333" strokeWidth="1"/><rect x="42" y="32" width="14" height="30" rx="2" fill="#FFEB3B" stroke="#333" strokeWidth="1"/><rect x="64" y="28" width="14" height="34" rx="2" fill="#795548" stroke="#333" strokeWidth="1"/></>,
    cash_register: <><rect x="15" y="28" width="70" height="58" rx="3" fill="#37474F" stroke="#333" strokeWidth="2"/><rect x="20" y="32" width="60" height="24" rx="2" fill="#4CAF50" stroke="#333" strokeWidth="1"/><rect x="25" y="62" width="50" height="20" rx="2" fill="#212121"/></>,
    blender: <><path d="M35 28 L30 78 Q50 88 70 78 L65 28 Z" fill="#80DEEA" stroke="#333" strokeWidth="2" opacity="0.7"/><ellipse cx="50" cy="28" rx="18" ry="6" fill="#37474F" stroke="#333" strokeWidth="2"/><rect x="35" y="78" width="30" height="14" rx="2" fill="#37474F" stroke="#333" strokeWidth="2"/></>,
    coffee_machine: <><rect x="20" y="18" width="60" height="68" rx="5" fill={color} stroke="#333" strokeWidth="2"/><rect x="30" y="28" width="40" height="30" rx="3" fill="#333"/><rect x="28" y="65" width="20" height="16" rx="2" fill="#5D4037" stroke="#333" strokeWidth="1"/><circle cx="60" cy="78" r="8" fill="#455A64" stroke="#333" strokeWidth="1"/></>,
    fire_extinguisher: <><ellipse cx="50" cy="80" rx="18" ry="8" fill={color}/><rect x="35" y="28" width="30" height="55" rx="5" fill="#F44336" stroke="#333" strokeWidth="2"/><rect x="42" y="12" width="16" height="18" rx="2" fill="#333" stroke="#333" strokeWidth="1"/><path d="M58 18 Q72 15 75 28" fill="none" stroke="#333" strokeWidth="3"/></>,
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#F5F5F5" rx="10"/>
      <g transform={`translate(${100-50*s},${100-50*s}) scale(${s})`}>{items[data.type] || items.table}</g>
      <text x="180" y="25" fontSize="20">{icon}</text>
    </svg>
  )
}

const SitioSVG: React.FC<{ data: CreationData }> = ({ data }) => {
  const timeColor = CATALOGS.sitios.time.find(t => t.id === data.time)?.color || '#FFECB3'
  const weatherIcon = CATALOGS.sitios.weather.find(w => w.id === data.weather)?.icon || '☀️'
  const typeIcon = CATALOGS.sitios.type.find(t => t.id === data.type)?.icon || '🏛️'
  const isNight = ['night','midnight','evening'].includes(data.time)
  const sky1 = isNight ? '#1a237e' : timeColor
  const sky2 = isNight ? '#311B92' : '#87CEEB'
  const grounds: Record<string, string> = { plaza:'#BDBDBD', park:'#81C784', street:'#616161', corner:'#757575', avenue:'#424242', beach:'#FFE0B2', pier:'#8D6E63', market:'#A1887F', fair:'#BCAAA4', stadium:'#4CAF50', university:'#90A4AE', hospital:'#B0BEC5', bus_stop:'#78909C', mall:'#CFD8DC', downtown:'#9E9E9E', neighborhood:'#A5D6A7', countryside:'#AED581', mountain:'#8D6E63', river:'#4FC3F7', bridge:'#9E9E9E' }
  const ground = grounds[data.type] || '#9E9E9E'

  const scenes: Record<string, JSX.Element> = {
    plaza: <><rect x="0" y="130" width="200" height="70" fill={ground}/><rect x="80" y="90" width="40" height="55" fill="#8D6E63" stroke="#333" strokeWidth="2"/><ellipse cx="100" cy="85" rx="28" ry="10" fill="#4DB6AC" stroke="#333" strokeWidth="2"/></>,
    park: <><rect x="0" y="130" width="200" height="70" fill={ground}/><ellipse cx="40" cy="130" rx="25" ry="40" fill="#2E7D32"/><rect x="35" y="130" width="10" height="35" fill="#5D4037"/><ellipse cx="160" cy="135" rx="22" ry="35" fill="#388E3C"/><rect x="155" y="135" width="10" height="30" fill="#5D4037"/></>,
    street: <><rect x="0" y="120" width="200" height="80" fill={ground}/><rect x="0" y="145" width="200" height="20" fill="#FFC107"/><rect x="20" y="153" width="25" height="4" fill="white"/><rect x="60" y="153" width="25" height="4" fill="white"/><rect x="100" y="153" width="25" height="4" fill="white"/><rect x="140" y="153" width="25" height="4" fill="white"/><rect x="180" y="153" width="15" height="4" fill="white"/></>,
    beach: <><rect x="0" y="130" width="200" height="70" fill={ground}/><path d="M0 120 Q50 110 100 120 Q150 130 200 115 L200 200 L0 200 Z" fill="#4FC3F7"/><ellipse cx="160" cy="135" rx="12" ry="22" fill="#FF7043"/><line x1="160" y1="115" x2="160" y2="140" stroke="#5D4037" strokeWidth="3"/></>,
    market: <><rect x="0" y="130" width="200" height="70" fill={ground}/><rect x="15" y="90" width="50" height="55" fill="#E57373" stroke="#333" strokeWidth="2"/><polygon points="15,90 40,65 65,90" fill="#FFCDD2" stroke="#333" strokeWidth="2"/><rect x="135" y="95" width="50" height="50" fill="#64B5F6" stroke="#333" strokeWidth="2"/><polygon points="135,95 160,70 185,95" fill="#BBDEFB" stroke="#333" strokeWidth="2"/></>,
    stadium: <><rect x="0" y="130" width="200" height="70" fill="#455A64"/><ellipse cx="100" cy="145" rx="75" ry="30" fill="#4CAF50" stroke="white" strokeWidth="2"/><ellipse cx="100" cy="145" rx="35" ry="15" fill="none" stroke="white" strokeWidth="2"/></>,
    downtown: <><rect x="0" y="150" width="200" height="50" fill={ground}/><rect x="10" y="90" width="35" height="65" fill="#78909C" stroke="#333" strokeWidth="1"/><rect x="55" y="70" width="40" height="85" fill="#90A4AE" stroke="#333" strokeWidth="1"/><rect x="105" y="60" width="45" height="95" fill="#607D8B" stroke="#333" strokeWidth="1"/><rect x="160" y="85" width="35" height="70" fill="#546E7A" stroke="#333" strokeWidth="1"/></>,
    neighborhood: <><rect x="0" y="140" width="200" height="60" fill={ground}/><rect x="20" y="100" width="45" height="50" fill="#FFCCBC" stroke="#333" strokeWidth="2"/><polygon points="20,100 42,75 65,100" fill="#8D6E63" stroke="#333" strokeWidth="2"/><rect x="135" y="95" width="50" height="55" fill="#C8E6C9" stroke="#333" strokeWidth="2"/><polygon points="135,95 160,70 185,95" fill="#795548" stroke="#333" strokeWidth="2"/></>,
    mountain: <><rect x="0" y="150" width="200" height="50" fill={ground}/><polygon points="0,150 60,70 120,150" fill="#8D6E63" stroke="#333" strokeWidth="2"/><polygon points="80,150 150,50 200,150" fill="#795548" stroke="#333" strokeWidth="2"/><polygon points="60,70 60,85 75,85" fill="white"/><polygon points="150,50 145,70 160,70" fill="white"/></>,
    countryside: <><rect x="0" y="135" width="200" height="65" fill={ground}/><path d="M0 140 Q50 130 100 140 Q150 150 200 135" fill="#8BC34A"/><rect x="140" y="100" width="35" height="45" fill="#8D6E63" stroke="#333" strokeWidth="2"/><polygon points="140,100 157,75 175,100" fill="#5D4037" stroke="#333" strokeWidth="2"/></>,
    river: <><rect x="0" y="120" width="200" height="80" fill={ground}/><path d="M0 140 Q50 160 100 145 Q150 130 200 155 L200 200 L0 200 Z" fill="#4FC3F7"/></>,
    bridge: <><rect x="0" y="160" width="200" height="40" fill="#4FC3F7"/><rect x="0" y="140" width="200" height="20" fill={ground}/><path d="M0 130 Q50 115 100 130 Q150 145 200 130" fill="none" stroke="#5D4037" strokeWidth="12"/><path d="M0 130 Q50 115 100 130 Q150 145 200 130" fill="none" stroke="#333" strokeWidth="2"/></>,
    corner: <><rect x="0" y="130" width="200" height="70" fill={ground}/><rect x="0" y="80" width="80" height="70" fill="#8D6E63" stroke="#333" strokeWidth="2"/></>,
    avenue: <><rect x="0" y="100" width="200" height="100" fill={ground}/><rect x="0" y="130" width="200" height="40" fill="#424242"/><line x1="0" y1="150" x2="200" y2="150" stroke="#FFC107" strokeWidth="3" strokeDasharray="20,10"/></>,
    pier: <><rect x="0" y="150" width="200" height="50" fill="#4FC3F7"/><rect x="60" y="100" width="80" height="60" fill="#8D6E63" stroke="#333" strokeWidth="2"/></>,
    fair: <><rect x="0" y="130" width="200" height="70" fill={ground}/><polygon points="100,40 130,100 70,100" fill="#E91E63" stroke="#333" strokeWidth="2"/><ellipse cx="100" cy="100" rx="40" ry="12" fill="#FFC107" stroke="#333" strokeWidth="2"/></>,
    university: <><rect x="0" y="140" width="200" height="60" fill={ground}/><rect x="50" y="80" width="100" height="70" fill="#ECEFF1" stroke="#333" strokeWidth="2"/><polygon points="50,80 100,50 150,80" fill="#90A4AE" stroke="#333" strokeWidth="2"/></>,
    hospital: <><rect x="0" y="140" width="200" height="60" fill={ground}/><rect x="40" y="70" width="120" height="80" fill="#ECEFF1" stroke="#333" strokeWidth="2"/><rect x="90" y="85" width="20" height="6" fill="#F44336"/><rect x="97" y="78" width="6" height="20" fill="#F44336"/></>,
    bus_stop: <><rect x="0" y="140" width="200" height="60" fill={ground}/><rect x="70" y="90" width="60" height="60" fill="#455A64" stroke="#333" strokeWidth="2"/><rect x="75" y="80" width="50" height="15" fill="#1976D2" stroke="#333" strokeWidth="2"/></>,
    mall: <><rect x="0" y="145" width="200" height="55" fill={ground}/><rect x="25" y="75" width="150" height="75" fill="#ECEFF1" stroke="#333" strokeWidth="2"/><rect x="25" y="75" width="150" height="15" fill="#FF7043"/></>,
  }

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs><linearGradient id={`sky${data.time}`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={sky1}/><stop offset="100%" stopColor={sky2}/></linearGradient></defs>
      <rect width="200" height="200" fill={`url(#sky${data.time})`} rx="10"/>
      {!isNight && <circle cx="160" cy="35" r="20" fill="#FFEB3B" opacity="0.9"/>}
      {isNight && <><circle cx="160" cy="35" r="18" fill="#FFF9C4"/><circle cx="165" cy="30" r="15" fill={sky1}/><circle cx="30" cy="20" r="1.5" fill="white"/><circle cx="80" cy="40" r="1" fill="white"/><circle cx="50" cy="60" r="1.5" fill="white"/><circle cx="120" cy="25" r="1" fill="white"/></>}
      {data.weather==='cloudy' && <><ellipse cx="50" cy="45" rx="30" ry="18" fill="white" opacity="0.85"/><ellipse cx="140" cy="55" rx="35" ry="20" fill="white" opacity="0.8"/></>}
      {data.weather==='rainy' && <><line x1="20" y1="10" x2="15" y2="35" stroke="#90CAF9" strokeWidth="2"/><line x1="50" y1="15" x2="45" y2="40" stroke="#90CAF9" strokeWidth="2"/><line x1="80" y1="10" x2="75" y2="35" stroke="#90CAF9" strokeWidth="2"/><line x1="110" y1="15" x2="105" y2="40" stroke="#90CAF9" strokeWidth="2"/><line x1="140" y1="10" x2="135" y2="35" stroke="#90CAF9" strokeWidth="2"/><line x1="170" y1="15" x2="165" y2="40" stroke="#90CAF9" strokeWidth="2"/></>}
      {scenes[data.type] || scenes.plaza}
      <text x="10" y="25" fontSize="20">{weatherIcon}</text>
      <text x="170" y="190" fontSize="20">{typeIcon}</text>
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
          {showColor && cur.color && <span className="w-3 h-3 rounded-full border border-gray-300" style={{backgroundColor: cur.color}}/>}
          <span className="font-medium text-gray-700 text-xs truncate">{cur.name}</span>
        </div>
        <button onClick={next} className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 text-gray-600 font-bold text-sm shadow flex items-center justify-center">▶</button>
      </div>
    </div>
  )
}

interface EditorProps {
  type: keyof Catalogs
  catalog: CatalogSection
  SVGComponent: React.FC<{ data: CreationData }>
  onSave: (item: { type: string; data: CreationData }) => void
}

const Editor: React.FC<EditorProps> = ({ type, catalog, SVGComponent, onSave }) => {
  const defaults = Object.fromEntries(Object.entries(catalog).map(([k, v]) => [k, v[0]?.id || '']))
  const [data, setData] = useState<CreationData>({ name: '', description: '', ...defaults })
  const update = (k: string, v: string) => setData(p => ({ ...p, [k]: v }))
  
  const groups: Record<string, [string, string[]][]> = {
    personajes: [
      ['Cara', ['base', 'skinTone', 'nose']],
      ['Ojos', ['eyes', 'eyeColor', 'eyebrows']],
      ['Boca', ['mouth', 'facialHair']],
      ['Pelo', ['hair', 'hairColor']],
      ['Accesorios', ['accessory', 'glasses', 'earrings', 'extra']],
      ['Personalidad', ['role', 'mood']],
    ],
    productos: [
      ['Tipo', ['category', 'origin']],
      ['Apariencia', ['shape', 'color']],
      ['Sabor', ['flavor', 'state']],
    ],
    artefactos: [
      ['Tipo', ['type', 'material']],
      ['Estilo', ['size', 'style', 'condition']],
    ],
    sitios: [
      ['Lugar', ['type', 'time', 'weather']],
      ['Ambiente', ['crowd', 'vibe', 'music', 'special']],
    ],
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg">
        <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">Vista Previa</h3>
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg p-2 flex justify-center">
          <SVGComponent data={data}/>
        </div>
        <input type="text" value={data.name} onChange={e => update('name', e.target.value)}
          placeholder="Nombre..." className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 text-sm"/>
        <textarea value={data.description} onChange={e => update('description', e.target.value)}
          placeholder="Descripción..." className="w-full mt-2 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" rows={2}/>
        <button onClick={() => data.name && onSave({ type, data })}
          className="w-full mt-2 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-sm">
          💾 Guardar
        </button>
      </div>
      <div className="bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg overflow-y-auto max-h-96">
        <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">🎨 Personalizar</h3>
        {(groups[type] || []).map(([groupName, keys]) => (
          <div key={groupName} className="mb-2">
            <div className="text-xs font-bold text-gray-500 mb-1">{groupName}</div>
            <div className="space-y-1">
              {keys.filter(k => catalog[k]).map(k => (
                <Selector key={k} label={k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}
                  options={catalog[k]} value={data[k]} onChange={v => update(k, v)}
                  showColor={!!catalog[k][0]?.color} showIcon={!!catalog[k][0]?.icon}/>
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
}

const Gallery: React.FC<GalleryProps> = ({ items, onClear }) => {
  if (!items.length) return null
  const icons: Record<string, string> = { personajes: '👤', productos: '🥬', artefactos: '🪑', sitios: '📍' }
  return (
    <div className="mt-4 bg-white/80 backdrop-blur rounded-xl p-3 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-700 text-sm">📦 Creaciones ({items.length})</h3>
        <button onClick={onClear} className="text-red-500 text-xs hover:underline">Limpiar</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-100 rounded px-2 py-1 text-xs flex items-center gap-1">
            <span>{icons[item.type]}</span>
            <span className="font-medium">{item.data.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== MAIN APP ====================

const SECTIONS: Section[] = [
  { id: 'personajes', name: 'Personajes', icon: '👤', color: 'from-orange-400 to-amber-400', catalog: CATALOGS.personajes, svg: PersonajeSVG },
  { id: 'productos', name: 'Productos', icon: '🥬', color: 'from-green-400 to-emerald-400', catalog: CATALOGS.productos, svg: ProductoSVG },
  { id: 'artefactos', name: 'Artefactos', icon: '🪑', color: 'from-amber-500 to-yellow-400', catalog: CATALOGS.artefactos, svg: ArtefactoSVG },
  { id: 'sitios', name: 'Sitios', icon: '📍', color: 'from-blue-400 to-cyan-400', catalog: CATALOGS.sitios, svg: SitioSVG },
]

export default function CalleVivaCreator() {
  const [active, setActive] = useState<keyof Catalogs>('personajes')
  const [creations, setCreations] = useState<Creation[]>([])
  const [toast, setToast] = useState(false)
  
  const section = SECTIONS.find(s => s.id === active)!
  
  const save = (item: { type: string; data: CreationData }) => {
    const creation: Creation = {
      ...item,
      id: `${item.type}_${Date.now()}`,
      creator: 'Nacho',
      createdAt: new Date().toISOString()
    }
    setCreations(p => [...p, creation])
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${section.color} p-3 transition-all duration-500`}>
      <div className="text-center mb-3">
        <h1 className="text-2xl font-black text-white drop-shadow-lg">🚚 CalleViva Creator</h1>
        <p className="text-white/80 text-xs">Crea contenido para el juego</p>
      </div>
      
      <div className="flex justify-center gap-1 mb-3 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`px-3 py-1.5 rounded-full font-bold text-sm transition-all ${
              active === s.id ? 'bg-white text-gray-800 shadow-lg scale-105' : 'bg-white/30 text-white hover:bg-white/50'
            }`}>
            {s.icon} {s.name}
          </button>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Editor type={section.id} catalog={section.catalog} SVGComponent={section.svg} onSave={save}/>
        <Gallery items={creations} onClear={() => setCreations([])}/>
      </div>
      
      {toast && <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce text-sm">✅ ¡Guardado!</div>}
      
      <div className="text-center mt-4 text-white/60 text-xs">Hecho con 🧡 para CalleViva.club</div>
    </div>
  )
}
