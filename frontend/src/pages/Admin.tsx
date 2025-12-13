// Admin Page - CalleViva

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api, Parameter, CreateParameter } from '../services/api'

export function Admin() {
  const navigate = useNavigate()
  const { player } = useAuthStore()

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

  // Redirect if not admin
  useEffect(() => {
    if (player && !player.is_admin) {
      navigate('/game')
    }
  }, [player, navigate])

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Load parameters when category changes
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
    } catch (err) {
      setError('Error loading categories')
    }
  }

  const loadParameters = async (category: string) => {
    setLoading(true)
    try {
      const data = await api.admin.parameters.list(category)
      setParameters(data.parameters)
    } catch (err) {
      setError('Error loading parameters')
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
    } catch (err) {
      setError('Error deleting parameter')
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
      setError(err instanceof Error ? err.message : 'Error saving parameter')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/game')}
              className="text-white/80 hover:text-white"
            >
              ← Volver
            </button>
            <h1 className="text-2xl font-bold">Admin Console</h1>
          </div>
          <span className="text-purple-200">{player?.email}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="float-right">&times;</button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Parameters</h2>
            <button
              onClick={handleCreate}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              + Nuevo
            </button>
          </div>
          <div className="flex border-b overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Parameters Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : parameters.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hay parámetros</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Icon</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Active</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parameters.map(param => (
                    <tr key={param.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-2xl">{param.icon || '-'}</td>
                      <td className="px-4 py-3 font-mono text-sm">{param.code}</td>
                      <td className="px-4 py-3">{param.name}</td>
                      <td className="px-4 py-3">{param.sort_order}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          param.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {param.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(param)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(param)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingParam ? 'Editar Parameter' : 'Nuevo Parameter'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingParam && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full border rounded px-3 py-2 font-mono"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  {editingParam ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
