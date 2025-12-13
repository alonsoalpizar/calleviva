// Admin Page - CalleViva

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api, Parameter, CreateParameter } from '../services/api'

type AdminTab = 'parameters' | 'users'

interface Player {
  id: string
  email: string
  display_name?: string
  is_admin: boolean
  created_at: string
}

export function Admin() {
  const navigate = useNavigate()
  const { player } = useAuthStore()

  const [activeTab, setActiveTab] = useState<AdminTab>('parameters')

  // Redirect if not admin
  useEffect(() => {
    if (player && !player.is_admin) {
      navigate('/game')
    }
  }, [player, navigate])

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <header className="bg-gradient-to-r from-coral to-terracota text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/game')}
              className="btn-ghost text-white/80 hover:text-white hover:bg-white/10"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-bold">🛠️ Admin Console</h1>
          </div>
          <span className="text-white/80">{player?.email}</span>
        </div>
      </header>

      {/* Main Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'parameters'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          >
            📋 Parámetros
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          >
            👥 Usuarios
          </button>
        </div>

        {activeTab === 'parameters' ? (
          <ParametersSection />
        ) : (
          <UsersSection />
        )}
      </div>
    </div>
  )
}

// ========== Parameters Section ==========
function ParametersSection() {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingParam, setEditingParam] = useState<Parameter | null>(null)
  const [formData, setFormData] = useState<CreateParameter>({
    category: '',
    code: '',
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadParameters(selectedCategory)
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const data = await api.admin.parameters.list()
      const uniqueCategories = [...new Set(data.parameters.map(p => p.category))]
      setCategories(uniqueCategories)
      if (uniqueCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(uniqueCategories[0])
      }
    } catch {
      setError('Error cargando categorías')
    }
  }

  const loadParameters = async (category: string) => {
    setLoading(true)
    try {
      const data = await api.admin.parameters.list(category)
      setParameters(data.parameters)
    } catch {
      setError('Error cargando parámetros')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingParam(null)
    setFormData({
      category: selectedCategory,
      code: '',
      name: '',
      description: '',
      icon: '',
      sort_order: parameters.length + 1,
    })
    setShowModal(true)
  }

  const handleEdit = (param: Parameter) => {
    setEditingParam(param)
    setFormData({
      category: param.category,
      code: param.code,
      name: param.name,
      description: param.description || '',
      icon: param.icon || '',
      sort_order: param.sort_order,
    })
    setShowModal(true)
  }

  const handleDelete = async (param: Parameter) => {
    if (!confirm(`Eliminar "${param.name}"?`)) return
    try {
      await api.admin.parameters.delete(param.id)
      loadParameters(selectedCategory)
    } catch {
      setError('Error eliminando parámetro')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editingParam) {
        await api.admin.parameters.update(editingParam.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          sort_order: formData.sort_order,
        })
      } else {
        await api.admin.parameters.create(formData)
      }
      setShowModal(false)
      loadParameters(selectedCategory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando')
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold">×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-carbon">Parámetros del Sistema</h2>
          <button onClick={handleCreate} className="btn-primary-sm">
            + Nuevo
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto bg-white">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'text-coral border-b-2 border-coral bg-coral/5'
                  : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : parameters.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay parámetros en esta categoría</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Icon</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Orden</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Activo</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parameters.map(param => (
                  <tr key={param.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-2xl">{param.icon || '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{param.code}</td>
                    <td className="px-4 py-3 font-medium">{param.name}</td>
                    <td className="px-4 py-3 text-gray-600">{param.sort_order}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        param.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {param.is_active ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(param)}
                        className="btn-ghost text-agua hover:text-agua/80 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(param)}
                        className="btn-ghost text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-carbon">
                {editingParam ? 'Editar Parámetro' : 'Nuevo Parámetro'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingParam && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-carbon mb-1">Categoría</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-carbon mb-1">Código</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="input font-mono"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-carbon mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-carbon mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  className="input"
                  placeholder="🌮"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-carbon mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-carbon mb-1">Orden</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-sm">
                  {editingParam ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ========== Users Section ==========
function UsersSection() {
  const [users, setUsers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/admin/players', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) {
        if (response.status === 501) {
          setError('Endpoint de usuarios no implementado aún')
          setUsers([])
          return
        }
        throw new Error('Error cargando usuarios')
      }
      const data = await response.json()
      setUsers(data.players || [])
    } catch {
      setError('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (user: Player) => {
    if (!confirm(`${user.is_admin ? 'Quitar' : 'Dar'} permisos de admin a "${user.email}"?`)) return
    try {
      const response = await fetch(`/api/v1/admin/players/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_admin: !user.is_admin }),
      })
      if (!response.ok) throw new Error('Error actualizando usuario')
      loadUsers()
    } catch {
      setError('Error actualizando usuario')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold">×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-bold text-carbon">Usuarios Registrados</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {error ? 'El backend necesita implementar /admin/players' : 'No hay usuarios'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Registro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Admin</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.display_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.is_admin ? 'bg-agua/20 text-agua' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.is_admin ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleAdmin(user)}
                        className={`btn-ghost ${user.is_admin ? 'text-red-500' : 'text-agua'}`}
                      >
                        {user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
