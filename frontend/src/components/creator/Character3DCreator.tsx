// Character3DCreator.tsx - Creador de Personajes 3D para CalleViva
// Pack: Modular Funny Characters (543 assets)

import React, { useState, Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei'
import { creatorApi } from '../../services/creatorApi'

const ASSET_PATH = '/assets/models/funny_characters_pack/Assets_glb'

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
const CATEGORIAS_3D: Categoria3D[] = [
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

// ==================== COMPONENTES 3D ====================

const Modelo3D: React.FC<{ archivo: string }> = ({ archivo }) => {
  const { scene } = useGLTF(`${ASSET_PATH}/${archivo}`)
  return <primitive object={scene.clone()} />
}

const Cargando = () => (
  <Html center>
    <div className="text-coral text-lg font-bold animate-pulse">Cargando...</div>
  </Html>
)

const EscenaPersonaje: React.FC<{ receta: RecetaPersonaje3D }> = ({ receta }) => {
  const archivosSeleccionados: string[] = []

  CATEGORIAS_3D.forEach((categoria) => {
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

      <group position={[0, 0, 0]}>
        {archivosSeleccionados.map((archivo) => (
          <Suspense key={archivo} fallback={null}>
            <Modelo3D archivo={archivo} />
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

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      if (guardado) {
        setGaleria(JSON.parse(guardado))
      }
    } catch (e) {
      console.error('Error cargando galería:', e)
    }
  }, [])

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

    CATEGORIAS_3D.forEach((cat) => {
      if (cat.requerido || Math.random() > 0.6) {
        nueva[cat.id] = cat.assets[Math.floor(Math.random() * cat.assets.length)].id
      }
    })

    // Si hay disfraz completo, quitar ropa individual
    if (nueva.full_body) {
      delete nueva.outerwear
      delete nueva.pants
    }

    setReceta(nueva)
  }

  const limpiar = () => {
    setReceta({ body: 'body_blue_1' })
    setNombre('')
    setDescripcion('')
    setEditandoId(null)
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

  const categoriaSeleccionada = CATEGORIAS_3D.find((c) => c.id === categoriaActiva)
  const assetsFiltrados = categoriaSeleccionada?.assets.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || []

  return (
    <div className="flex flex-col lg:flex-row h-full bg-crema">
      {/* Panel izquierdo - Vista 3D */}
      <div className="lg:w-1/2 h-[350px] lg:h-full relative bg-gradient-to-b from-sky-100 to-sky-200">
        <Canvas shadows camera={{ position: [2, 1.5, 2], fov: 45 }}>
          <Suspense fallback={<Cargando />}>
            <EscenaPersonaje receta={receta} />
          </Suspense>
        </Canvas>

        {/* Controles flotantes */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
          <button
            onClick={aleatorio}
            className="bg-coral hover:bg-coral/80 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            🎲 Aleatorio
          </button>
          <button
            onClick={limpiar}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
          >
            🗑️ Limpiar
          </button>
        </div>

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
          {CATEGORIAS_3D.map((cat) => (
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
