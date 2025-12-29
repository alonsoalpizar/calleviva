// Character3DCreator.tsx - Creador de Personajes 3D para CalleViva
// Soporta dos packs: Funny Characters (543 assets) y Modular Pack

import React, { useState, Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei'
import { creatorApi } from '../../services/creatorApi'

// ==================== PATHS DE ASSETS ====================
const ASSET_PATH_FUNNY = '/assets/models/funny_characters_pack/Assets_glb'
const ASSET_PATH_MODULAR = '/assets/models/character_pack/Separate_assets_glb'

type PackType = 'funny' | 'modular'

// ==================== CATÁLOGO DE ASSETS 3D ====================

interface Asset3D {
  id: string
  nombre: string
  archivo: string
}

interface Categoria3D {
  id: string
  nombre: string
  icono: string
  assets: Asset3D[]
  requerido?: boolean
}

// Catálogo completo - 543 assets del pack Funny Characters
const CATEGORIAS_FUNNY: Categoria3D[] = [
  {
    id: 'body',
    nombre: 'Cuerpo',
    icono: '🧍',
    requerido: true,
    assets: [
      { id: 'body_blue_1', nombre: 'Azul 1', archivo: 'Body/Body_Blue_001.glb' },
      { id: 'body_blue_2', nombre: 'Azul 2', archivo: 'Body/Body_Blue_002.glb' },
      { id: 'body_blue_3', nombre: 'Azul 3', archivo: 'Body/Body_Blue_003.glb' },
      { id: 'body_brown_1', nombre: 'Café 1', archivo: 'Body/Body_Brown_001.glb' },
      { id: 'body_brown_2', nombre: 'Café 2', archivo: 'Body/Body_Brown_002.glb' },
      { id: 'body_brown_3', nombre: 'Café 3', archivo: 'Body/Body_Brown_003.glb' },
      { id: 'body_orange_1', nombre: 'Naranja 1', archivo: 'Body/Body_Orange_001.glb' },
      { id: 'body_orange_2', nombre: 'Naranja 2', archivo: 'Body/Body_Orange_002.glb' },
      { id: 'body_orange_3', nombre: 'Naranja 3', archivo: 'Body/Body_Orange_003.glb' },
      { id: 'body_red_1', nombre: 'Rojo 1', archivo: 'Body/Body_Red_001.glb' },
      { id: 'body_red_2', nombre: 'Rojo 2', archivo: 'Body/Body_Red_002.glb' },
      { id: 'body_red_3', nombre: 'Rojo 3', archivo: 'Body/Body_Red_003.glb' },
      { id: 'body_white_1', nombre: 'Blanco 1', archivo: 'Body/Body_White_001.glb' },
      { id: 'body_white_2', nombre: 'Blanco 2', archivo: 'Body/Body_White_002.glb' },
      { id: 'body_white_3', nombre: 'Blanco 3', archivo: 'Body/Body_White_003.glb' },
      { id: 'body_yellow_1', nombre: 'Amarillo 1', archivo: 'Body/Body_Yellow_001.glb' },
      { id: 'body_yellow_2', nombre: 'Amarillo 2', archivo: 'Body/Body_Yellow_002.glb' },
      { id: 'body_yellow_3', nombre: 'Amarillo 3', archivo: 'Body/Body_Yellow_003.glb' },
    ],
  },
  {
    id: 'full_body',
    nombre: 'Disfraz',
    icono: '🎭',
    assets: [
      { id: 'action_figure', nombre: 'Figura Acción', archivo: 'Full_Body/Action_figure_001.glb' },
      { id: 'alien', nombre: 'Alien', archivo: 'Full_Body/Alien_001.glb' },
      { id: 'astronaut', nombre: 'Astronauta', archivo: 'Full_Body/Astronaut_001.glb' },
      { id: 'banana', nombre: 'Banana', archivo: 'Full_Body/Banana_001.glb' },
      { id: 'crayfish', nombre: 'Langosta', archivo: 'Full_Body/Crayfish_001.glb' },
      { id: 'demon', nombre: 'Demonio', archivo: 'Full_Body/Demon_001.glb' },
      { id: 'eggplant', nombre: 'Berenjena', archivo: 'Full_Body/Eggplant_001.glb' },
      { id: 'flower', nombre: 'Flor', archivo: 'Full_Body/Flower_001.glb' },
      { id: 'ghost', nombre: 'Fantasma', archivo: 'Full_Body/Ghost_001.glb' },
      { id: 'gift', nombre: 'Regalo', archivo: 'Full_Body/Gift_001.glb' },
      { id: 'hot_dog', nombre: 'Hot Dog', archivo: 'Full_Body/Hot_dog_001.glb' },
      { id: 'lego', nombre: 'Lego', archivo: 'Full_Body/Lego_001.glb' },
      { id: 'mushroom', nombre: 'Hongo', archivo: 'Full_Body/Mushroom_001.glb' },
      { id: 'nightstand', nombre: 'Mesita', archivo: 'Full_Body/Nightstand_001.glb' },
      { id: 'ostrich', nombre: 'Avestruz', archivo: 'Full_Body/Ostrich_001.glb' },
      { id: 'palm', nombre: 'Palmera', archivo: 'Full_Body/Palm_001.glb' },
      { id: 'fall_guys', nombre: 'Fall Guys', archivo: 'Full_Body/Red_Fall_Guys_001.glb' },
      { id: 'sausage', nombre: 'Salchicha', archivo: 'Full_Body/Sausage_001.glb' },
      { id: 'shark', nombre: 'Tiburón', archivo: 'Full_Body/Shark_001.glb' },
      { id: 'snake', nombre: 'Serpiente', archivo: 'Full_Body/Snake_001.glb' },
      { id: 'snowman', nombre: 'Muñeco Nieve', archivo: 'Full_Body/Snowman_001.glb' },
      { id: 'sushi', nombre: 'Sushi', archivo: 'Full_Body/Sushi_001.glb' },
      { id: 'tooth', nombre: 'Diente', archivo: 'Full_Body/Tooth_001.glb' },
      { id: 'trash_can', nombre: 'Basurero', archivo: 'Full_Body/Trash_can_001.glb' },
      { id: 'ufo', nombre: 'OVNI', archivo: 'Full_Body/UFO_001.glb' },
    ],
  },
  {
    id: 'hair',
    nombre: 'Peinado',
    icono: '💇',
    assets: Array.from({ length: 27 }, (_, i) => ({
      id: `hair_${i + 1}`,
      nombre: `Peinado ${i + 1}`,
      archivo: `Hair/Hair_${String(i + 1).padStart(3, '0')}.glb`,
    })),
  },
  {
    id: 'hat',
    nombre: 'Sombrero',
    icono: '🎩',
    assets: Array.from({ length: 101 }, (_, i) => ({
      id: `hat_${i + 1}`,
      nombre: `Sombrero ${i + 1}`,
      archivo: `Hat/Hat_${String(i + 1).padStart(3, '0')}.glb`,
    })),
  },
  {
    id: 'glasses',
    nombre: 'Lentes',
    icono: '👓',
    assets: Array.from({ length: 25 }, (_, i) => ({
      id: `glasses_${i + 1}`,
      nombre: `Lentes ${i + 1}`,
      archivo: `Glasses/Glasses_${String(i + 1).padStart(3, '0')}.glb`,
    })),
  },
  {
    id: 'eyebrow',
    nombre: 'Cejas',
    icono: '🤨',
    assets: Array.from({ length: 12 }, (_, i) => ({
      id: `eyebrow_${i + 1}`,
      nombre: `Cejas ${i + 1}`,
      archivo: `Eyebrow/Eyebrow_${String(i + 1).padStart(3, '0')}.glb`,
    })),
  },
  {
    id: 'mustache',
    nombre: 'Bigote',
    icono: '🥸',
    assets: [
      ...['Black', 'Brown', 'White'].flatMap(color =>
        Array.from({ length: 12 }, (_, i) => ({
          id: `mustache_${color.toLowerCase()}_${i + 1}`,
          nombre: `${color === 'Black' ? 'Negro' : color === 'Brown' ? 'Café' : 'Blanco'} ${i + 1}`,
          archivo: `Mustache/Mustache_${color}_${String(i + 1).padStart(3, '0')}.glb`,
        }))
      ),
    ],
  },
  {
    id: 'outerwear',
    nombre: 'Ropa',
    icono: '👕',
    assets: [
      // Sample of outerwear - grouped by color
      ...['Black', 'Blue', 'Brown', 'Green', 'Light_Blue', 'Orange', 'Pink', 'Red', 'White', 'Yellow'].flatMap(color =>
        Array.from({ length: 16 }, (_, i) => ({
          id: `outerwear_${color.toLowerCase()}_${i + 1}`,
          nombre: `${color.replace('_', ' ')} ${i + 1}`,
          archivo: `Outerwear/Outerwear_${color}_${String(i + 1).padStart(3, '0')}.glb`,
        }))
      ),
    ],
  },
  {
    id: 'pants',
    nombre: 'Pantalón',
    icono: '👖',
    assets: [
      ...['Black', 'Blue', 'Brown', 'Green', 'Light_Blue', 'Orange', 'Pink', 'Red', 'White', 'Yellow'].flatMap(color =>
        Array.from({ length: 6 }, (_, i) => ({
          id: `pants_${color.toLowerCase()}_${i + 1}`,
          nombre: `${color.replace('_', ' ')} ${i + 1}`,
          archivo: `Pants/Pants_${color}_${String(i + 1).padStart(3, '0')}.glb`,
        }))
      ),
    ],
  },
  {
    id: 'shoe',
    nombre: 'Zapatos',
    icono: '👟',
    assets: [
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `shoe_boot_${i + 1}`,
        nombre: `Bota ${i + 1}`,
        archivo: `Shoe/Shoe_Boot_${String(i + 1).padStart(3, '0')}.glb`,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `shoe_skate_${i + 1}`,
        nombre: `Patín ${i + 1}`,
        archivo: `Shoe/Shoe_Skate_${String(i + 1).padStart(3, '0')}.glb`,
      })),
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `shoe_slipper_${i + 1}`,
        nombre: `Chancla ${i + 1}`,
        archivo: `Shoe/Shoe_Slipper_${String(i + 1).padStart(3, '0')}.glb`,
      })),
      ...Array.from({ length: 21 }, (_, i) => ({
        id: `shoe_sneaker_${i + 1}`,
        nombre: `Tenis ${i + 1}`,
        archivo: `Shoe/Shoe_Sneaker_${String(i + 1).padStart(3, '0')}.glb`,
      })),
    ],
  },
  {
    id: 'glove',
    nombre: 'Guantes',
    icono: '🧤',
    assets: Array.from({ length: 20 }, (_, i) => ({
      id: `glove_${i + 1}`,
      nombre: `Guante ${i + 1}`,
      archivo: `Glove/Glove_${String(i + 1).padStart(3, '0')}.glb`,
    })),
  },
  {
    id: 'backpack',
    nombre: 'Mochila',
    icono: '🎒',
    assets: Array.from({ length: 25 }, (_, i) => ({
      id: `backpack_${i + 1}`,
      nombre: `Mochila ${i + 1}`,
      archivo: `Backpack/Backpack_${String(i + 1).padStart(3, '0')}.glb`,
    })),
  },
]

// Catálogo del pack Modular (ithappy Modular Pack)
const CATEGORIAS_MODULAR: Categoria3D[] = [
  {
    id: 'body',
    nombre: 'Cuerpo',
    icono: '📦',
    requerido: true,
    assets: [{ id: 'body_modular', nombre: 'Cuerpo Base', archivo: 'Body_010.glb' }],
  },
  {
    id: 'face',
    nombre: 'Cara',
    icono: '😀',
    requerido: true,
    assets: [
      { id: 'face_usual', nombre: 'Normal', archivo: 'Male_emotion_usual_001.glb' },
      { id: 'face_happy', nombre: 'Feliz', archivo: 'Male_emotion_happy_002.glb' },
      { id: 'face_angry', nombre: 'Enojado', archivo: 'Male_emotion_angry_003.glb' },
    ],
  },
  {
    id: 'hairstyle',
    nombre: 'Peinado',
    icono: '💇',
    assets: [
      { id: 'hair_10', nombre: 'Peinado 1', archivo: 'Hairstyle_male_010.glb' },
      { id: 'hair_12', nombre: 'Peinado 2', archivo: 'Hairstyle_male_012.glb' },
    ],
  },
  {
    id: 'hat',
    nombre: 'Sombrero',
    icono: '🎩',
    assets: [
      { id: 'hat_10', nombre: 'Sombrero 1', archivo: 'Hat_010.glb' },
      { id: 'hat_49', nombre: 'Sombrero 2', archivo: 'Hat_049.glb' },
      { id: 'hat_57', nombre: 'Sombrero 3', archivo: 'Hat_057.glb' },
    ],
  },
  {
    id: 'glasses',
    nombre: 'Lentes',
    icono: '👓',
    assets: [
      { id: 'glasses_4', nombre: 'Lentes 1', archivo: 'Glasses_004.glb' },
      { id: 'glasses_6', nombre: 'Lentes 2', archivo: 'Glasses_006.glb' },
    ],
  },
  {
    id: 'outwear',
    nombre: 'Abrigo',
    icono: '🧥',
    assets: [
      { id: 'outwear_29', nombre: 'Abrigo 1', archivo: 'Outwear_029.glb' },
      { id: 'outwear_36', nombre: 'Abrigo 2', archivo: 'Outwear_036.glb' },
    ],
  },
  {
    id: 'tshirt',
    nombre: 'Camiseta',
    icono: '👕',
    assets: [{ id: 'tshirt_9', nombre: 'Camiseta 1', archivo: 'T-Shirt_009.glb' }],
  },
  {
    id: 'pants',
    nombre: 'Pantalón',
    icono: '👖',
    assets: [
      { id: 'pants_10', nombre: 'Pantalón 1', archivo: 'Pants_010.glb' },
      { id: 'pants_14', nombre: 'Pantalón 2', archivo: 'Pants_014.glb' },
      { id: 'shorts_3', nombre: 'Shorts', archivo: 'Shorts_003.glb' },
    ],
  },
  {
    id: 'shoes',
    nombre: 'Zapatos',
    icono: '👟',
    assets: [
      { id: 'slippers_2', nombre: 'Chanclas 1', archivo: 'Shoe_Slippers_002.glb' },
      { id: 'slippers_5', nombre: 'Chanclas 2', archivo: 'Shoe_Slippers_005.glb' },
      { id: 'sneakers_9', nombre: 'Tenis', archivo: 'Shoe_Sneakers_009.glb' },
    ],
  },
  {
    id: 'socks',
    nombre: 'Calcetines',
    icono: '🧦',
    assets: [{ id: 'socks_8', nombre: 'Calcetines', archivo: 'Socks_008.glb' }],
  },
  {
    id: 'gloves',
    nombre: 'Guantes',
    icono: '🧤',
    assets: [
      { id: 'gloves_6', nombre: 'Guantes 1', archivo: 'Gloves_006.glb' },
      { id: 'gloves_14', nombre: 'Guantes 2', archivo: 'Gloves_014.glb' },
    ],
  },
  {
    id: 'costume',
    nombre: 'Disfraz',
    icono: '🎭',
    assets: [
      { id: 'costume_6', nombre: 'Disfraz 1', archivo: 'Costume_6_001.glb' },
      { id: 'costume_10', nombre: 'Disfraz 2', archivo: 'Costume_10_001.glb' },
    ],
  },
  {
    id: 'accessories',
    nombre: 'Accesorios',
    icono: '🎪',
    assets: [
      { id: 'moustache_1', nombre: 'Bigote 1', archivo: 'Moustache_001.glb' },
      { id: 'moustache_2', nombre: 'Bigote 2', archivo: 'Moustache_002.glb' },
      { id: 'headphones', nombre: 'Audífonos', archivo: 'Headphones_002.glb' },
      { id: 'clown_nose', nombre: 'Nariz Payaso', archivo: 'Clown_nose_001.glb' },
      { id: 'pacifier', nombre: 'Chupón', archivo: 'Pacifier_001.glb' },
    ],
  },
]

// Helper para obtener categorías según el pack
const getCategorias = (pack: PackType): Categoria3D[] => {
  return pack === 'funny' ? CATEGORIAS_FUNNY : CATEGORIAS_MODULAR
}

const getAssetPath = (pack: PackType): string => {
  return pack === 'funny' ? ASSET_PATH_FUNNY : ASSET_PATH_MODULAR
}

// ==================== TIPOS ====================

interface RecetaPersonaje3D {
  [categoriaId: string]: string | null
}

interface CreacionPersonaje3D {
  id: string
  nombre: string
  descripcion: string
  receta: RecetaPersonaje3D
  creador: string
  creadoEn: string
  enviado: boolean
}

const STORAGE_KEY = 'calleviva_personajes_3d'
const CURRENT_KEY = 'calleviva_personaje_actual'

// ==================== COMPONENTES 3D ====================

const Modelo3D: React.FC<{ archivo: string; basePath: string }> = ({ archivo, basePath }) => {
  const { scene } = useGLTF(`${basePath}/${archivo}`)
  return <primitive object={scene.clone()} />
}

const Cargando = () => (
  <Html center>
    <div className="text-coral text-lg font-bold animate-pulse">Cargando...</div>
  </Html>
)

interface EscenaProps {
  receta: RecetaPersonaje3D
  pack: PackType
}

const EscenaPersonaje: React.FC<EscenaProps> = ({ receta, pack }) => {
  const categorias = getCategorias(pack)
  const basePath = getAssetPath(pack)
  const archivosSeleccionados: string[] = []

  categorias.forEach((categoria) => {
    const assetId = receta[categoria.id]
    if (assetId) {
      const asset = categoria.assets.find((a) => a.id === assetId)
      if (asset) {
        archivosSeleccionados.push(asset.archivo)
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Environment preset="city" />

      <OrbitControls
        minDistance={1.5}
        maxDistance={4}
        target={[0, 1, 0]}
        enablePan={false}
      />

      {/* Partes del personaje */}
      <group position={[0, 0, 0]}>
        {archivosSeleccionados.map((archivo) => (
          <Suspense key={archivo} fallback={null}>
            <Modelo3D archivo={archivo} basePath={basePath} />
          </Suspense>
        ))}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
    </>
  )
}

// ==================== COMPONENTE PRINCIPAL ====================

export const Character3DCreator: React.FC = () => {
  const [pack, setPack] = useState<PackType>('funny')
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [receta, setReceta] = useState<RecetaPersonaje3D>({
    body: 'body_blue_1',
  })
  const [galeria, setGaleria] = useState<CreacionPersonaje3D[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [enviando, setEnviando] = useState<Set<string>>(new Set())
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  const [categoriaActiva, setCategoriaActiva] = useState('body')
  const [busqueda, setBusqueda] = useState('')

  // Categorías actuales según el pack seleccionado
  const categorias = getCategorias(pack)

  // Cargar galería y personaje actual al iniciar
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      if (guardado) {
        setGaleria(JSON.parse(guardado))
      }
      // Cargar personaje actual (auto-guardado)
      const actual = localStorage.getItem(CURRENT_KEY)
      if (actual) {
        const data = JSON.parse(actual)
        setReceta(data.receta || { body: 'body_blue_1' })
        setNombre(data.nombre || '')
        setDescripcion(data.descripcion || '')
      }
    } catch (e) {
      console.error('Error cargando:', e)
    }
  }, [])

  // Auto-guardar personaje actual cuando cambia
  useEffect(() => {
    const dataActual = { nombre, descripcion, receta }
    localStorage.setItem(CURRENT_KEY, JSON.stringify(dataActual))
  }, [receta, nombre, descripcion])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galeria))
  }, [galeria])

  const toggleAsset = (categoriaId: string, assetId: string) => {
    setReceta((prev) => ({
      ...prev,
      [categoriaId]: prev[categoriaId] === assetId ? null : assetId,
    }))
  }

  const aleatorio = () => {
    const nueva: RecetaPersonaje3D = {}

    categorias.forEach((cat) => {
      if (cat.requerido || Math.random() > 0.6) {
        nueva[cat.id] = cat.assets[Math.floor(Math.random() * cat.assets.length)].id
      }
    })

    // Si hay disfraz completo, quitar ropa individual
    if (nueva.full_body) {
      delete nueva.outerwear
      delete nueva.pants
    }
    // Para modular, si hay costume quitar ropa
    if (nueva.costume) {
      delete nueva.outwear
      delete nueva.tshirt
    }

    setReceta(nueva)
  }

  const getDefaultReceta = (): RecetaPersonaje3D => {
    if (pack === 'funny') {
      return { body: 'body_blue_1' }
    } else {
      return { body: 'body_modular', face: 'face_usual' }
    }
  }

  const limpiar = () => {
    setReceta(getDefaultReceta())
    setNombre('')
    setDescripcion('')
    setEditandoId(null)
    localStorage.removeItem(CURRENT_KEY)
  }

  const cambiarPack = (nuevoPack: PackType) => {
    if (nuevoPack !== pack) {
      setPack(nuevoPack)
      setCategoriaActiva('body')
      setBusqueda('')
      // Resetear receta con valores por defecto del nuevo pack
      if (nuevoPack === 'funny') {
        setReceta({ body: 'body_blue_1' })
      } else {
        setReceta({ body: 'body_modular', face: 'face_usual' })
      }
    }
  }

  const guardar = () => {
    if (!nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Dale un nombre a tu personaje' })
      setTimeout(() => setMensaje(null), 3000)
      return
    }

    const personaje: CreacionPersonaje3D = {
      id: editandoId || `personaje_${Date.now()}`,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      receta: { ...receta },
      creador: 'Nacho',
      creadoEn: new Date().toISOString(),
      enviado: false,
    }

    if (editandoId) {
      setGaleria((prev) => prev.map((p) => (p.id === editandoId ? personaje : p)))
      setMensaje({ tipo: 'exito', texto: '¡Personaje actualizado!' })
    } else {
      setGaleria((prev) => [...prev, personaje])
      setMensaje({ tipo: 'exito', texto: '¡Personaje guardado!' })
    }

    limpiar()
    setTimeout(() => setMensaje(null), 3000)
  }

  const editar = (personaje: CreacionPersonaje3D) => {
    setNombre(personaje.nombre)
    setDescripcion(personaje.descripcion)
    setReceta(personaje.receta)
    setEditandoId(personaje.id)
  }

  const eliminar = (id: string) => {
    if (confirm('¿Eliminar este personaje?')) {
      setGaleria((prev) => prev.filter((p) => p.id !== id))
      if (editandoId === id) {
        limpiar()
      }
    }
  }

  const enviarAlAdmin = async (personaje: CreacionPersonaje3D) => {
    if (enviando.has(personaje.id)) return

    setEnviando((prev) => new Set(prev).add(personaje.id))

    try {
      await creatorApi.submit({
        content_type: 'personaje_3d',
        name: personaje.nombre,
        description: personaje.descripcion || 'Personaje 3D',
        recipe: personaje.receta as Record<string, string>,
        creator_name: personaje.creador,
      })

      setGaleria((prev) =>
        prev.map((p) => (p.id === personaje.id ? { ...p, enviado: true } : p))
      )
      setMensaje({ tipo: 'exito', texto: '¡Enviado para aprobación!' })
    } catch (error) {
      console.error('Error enviando:', error)
      setMensaje({ tipo: 'error', texto: 'Error al enviar. Intenta de nuevo.' })
    } finally {
      setEnviando((prev) => {
        const nuevo = new Set(prev)
        nuevo.delete(personaje.id)
        return nuevo
      })
      setTimeout(() => setMensaje(null), 3000)
    }
  }

  const categoriaSeleccionada = categorias.find((c) => c.id === categoriaActiva)
  const assetsFiltrados = categoriaSeleccionada?.assets.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || []

  return (
    <div className="flex flex-col lg:flex-row h-full bg-crema">
      {/* Panel izquierdo - Vista 3D */}
      <div className="lg:w-1/2 flex flex-col">
        {/* Título y selector de pack */}
        <div className="bg-gray-900 text-white p-3">
          <h1 className="text-xl font-bold text-center mb-2">Personajes</h1>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => cambiarPack('funny')}
              className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                pack === 'funny'
                  ? 'bg-coral text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Funny Pack (543)
            </button>
            <button
              onClick={() => cambiarPack('modular')}
              className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${
                pack === 'modular'
                  ? 'bg-agua text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Modular Pack
            </button>
          </div>
        </div>

        {/* Canvas 3D - área principal */}
        <div className="h-[280px] lg:flex-1 relative bg-gradient-to-b from-sky-100 to-sky-200">
          <Canvas shadows camera={{ position: [2, 1.5, 2], fov: 45 }}>
            <Suspense fallback={<Cargando />}>
              <EscenaPersonaje receta={receta} pack={pack} />
            </Suspense>
          </Canvas>

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`absolute top-4 left-4 right-4 py-2 px-4 rounded-lg text-center font-bold ${
                mensaje.tipo === 'exito' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          {/* Contador de partes */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {Object.values(receta).filter(Boolean).length} partes
          </div>
        </div>

        {/* Controles debajo del canvas */}
        <div className="bg-gray-800 p-3">
          <div className="flex justify-center gap-2">
            <button
              onClick={aleatorio}
              className="bg-coral hover:bg-coral/80 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors text-sm"
            >
              🎲 Aleatorio
            </button>
            <button
              onClick={limpiar}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors text-sm"
            >
              🗑️ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Panel derecho - Controles */}
      <div className="lg:w-1/2 flex flex-col">
        {/* Formulario */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nombre del personaje..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral"
            />
            <button
              onClick={guardar}
              className="bg-agua hover:bg-agua/80 text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              {editandoId ? '💾 Actualizar' : '💾 Guardar'}
            </button>
          </div>
          <input
            type="text"
            placeholder="Descripción (opcional)..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>

        {/* Tabs de categorías */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategoriaActiva(cat.id); setBusqueda('') }}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                categoriaActiva === cat.id
                  ? 'bg-coral text-white'
                  : receta[cat.id]
                  ? 'bg-agua/20 text-agua'
                  : 'bg-white text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icono} {cat.nombre}
              {receta[cat.id] && <span className="ml-1">✓</span>}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="p-2 bg-white border-b">
          <input
            type="text"
            placeholder={`Buscar en ${categoriaSeleccionada?.nombre}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>

        {/* Grid de assets */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1">
            {/* Opción de ninguno */}
            {!categoriaSeleccionada?.requerido && (
              <button
                onClick={() => toggleAsset(categoriaActiva, '')}
                className={`p-2 rounded text-xs font-medium transition-all ${
                  !receta[categoriaActiva]
                    ? 'bg-gray-300 text-gray-700'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border'
                }`}
              >
                ❌ Ninguno
              </button>
            )}
            {assetsFiltrados.map((asset) => {
              const seleccionado = receta[categoriaActiva] === asset.id
              return (
                <button
                  key={asset.id}
                  onClick={() => toggleAsset(categoriaActiva, asset.id)}
                  className={`p-2 rounded text-xs font-medium transition-all truncate ${
                    seleccionado
                      ? 'bg-coral text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                  title={asset.nombre}
                >
                  {asset.nombre}
                </button>
              )
            })}
          </div>
          <div className="text-center text-xs text-gray-400 mt-2">
            {assetsFiltrados.length} opciones en {categoriaSeleccionada?.nombre}
          </div>
        </div>

        {/* Galería */}
        {galeria.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-2 max-h-36 overflow-y-auto">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">📦 Mi Galería ({galeria.length})</h3>
            <div className="grid grid-cols-2 gap-1">
              {galeria.map((personaje) => (
                <div
                  key={personaje.id}
                  className="bg-white rounded p-2 shadow-sm border border-gray-200 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="truncate flex-1">
                      <p className="font-semibold truncate">{personaje.nombre}</p>
                      <p className="text-gray-500">
                        {personaje.enviado ? '✅ Enviado' : '📝 Borrador'}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-1">
                      <button
                        onClick={() => editar(personaje)}
                        className="bg-gray-200 hover:bg-gray-300 px-1.5 py-0.5 rounded"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      {!personaje.enviado && (
                        <button
                          onClick={() => enviarAlAdmin(personaje)}
                          disabled={enviando.has(personaje.id)}
                          className="bg-agua hover:bg-agua/80 text-white px-1.5 py-0.5 rounded disabled:opacity-50"
                          title="Enviar"
                        >
                          {enviando.has(personaje.id) ? '...' : '📤'}
                        </button>
                      )}
                      <button
                        onClick={() => eliminar(personaje.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-1.5 py-0.5 rounded"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Character3DCreator
