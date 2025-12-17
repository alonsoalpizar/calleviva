// Admin Page - CalleViva

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api, Parameter, CreateParameter } from '../services/api'

type AdminTab = 'parameters' | 'users' | 'ai'

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
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'ai'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          >
            🤖 IA
          </button>
        </div>

        {activeTab === 'parameters' && <ParametersSection />}
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'ai' && <AISection />}
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

// ========== AI Section ==========
interface AIConfig {
  enabled: boolean
  provider_type: string
  provider_url: string
  model: string
  max_tokens: number
  temperature: number
  timeout_seconds: number
  cache_enabled: boolean
  cache_ttl_minutes: number
  max_requests_per_minute: number
  fallback_enabled: boolean
  has_api_key: boolean
  is_ready: boolean
}

interface TestResult {
  success: boolean
  message: string
  model?: string
  response_ms?: number
}

// Provider presets with default URLs and suggested models
const PROVIDER_PRESETS = {
  anthropic: {
    name: 'Anthropic (Claude)',
    url: 'https://api.anthropic.com/v1/messages',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Recomendado)' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Económico)' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Premium)' },
    ],
  },
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (Recomendado)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Económico)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
  },
  groq: {
    name: 'Groq (Rápido)',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Recomendado)' },
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Ultra rápido)' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    ],
  },
  together: {
    name: 'Together AI',
    url: 'https://api.together.xyz/v1/chat/completions',
    models: [
      { value: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo' },
      { value: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo', label: 'Llama 3.2 11B Vision' },
      { value: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B' },
    ],
  },
  ollama: {
    name: 'Ollama (Local)',
    url: 'http://localhost:11434/v1/chat/completions',
    models: [
      { value: 'llama3.2', label: 'Llama 3.2' },
      { value: 'mistral', label: 'Mistral' },
      { value: 'codellama', label: 'Code Llama' },
    ],
  },
  custom: {
    name: 'Personalizado',
    url: '',
    models: [],
  },
}

type ProviderKey = keyof typeof PROVIDER_PRESETS

function AISection() {
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // Form state
  const [newApiKey, setNewApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('anthropic')
  const [customUrl, setCustomUrl] = useState('')
  const [customModel, setCustomModel] = useState('')

  // Determine which provider preset to show based on current URL
  const detectProvider = (url: string): ProviderKey => {
    if (url.includes('anthropic.com')) return 'anthropic'
    if (url.includes('openai.com')) return 'openai'
    if (url.includes('groq.com')) return 'groq'
    if (url.includes('together.xyz')) return 'together'
    if (url.includes('localhost:11434')) return 'ollama'
    return 'custom'
  }

  // Get current models list based on provider
  const getCurrentModels = () => {
    if (selectedProvider === 'custom') return []
    return PROVIDER_PRESETS[selectedProvider].models
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/admin/ai/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Error cargando configuración')
      const data = await response.json()
      setConfig(data)

      // Detect and set provider based on URL
      const detected = detectProvider(data.provider_url || '')
      setSelectedProvider(detected)
      if (detected === 'custom') {
        setCustomUrl(data.provider_url || '')
        setCustomModel(data.model || '')
      }
    } catch {
      setError('Error cargando configuración de IA')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = async (updates: Partial<AIConfig>) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/v1/admin/ai/config', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error('Error guardando configuración')
      const data = await response.json()
      setConfig(data)
      setSuccess('Configuración guardada')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  // Handle provider preset change
  const handleProviderChange = async (providerKey: ProviderKey) => {
    setSelectedProvider(providerKey)

    if (providerKey === 'custom') {
      // Don't auto-update for custom - user needs to set URL and model manually
      return
    }

    const preset = PROVIDER_PRESETS[providerKey]
    const providerType = providerKey === 'anthropic' ? 'anthropic' : 'openai'

    // Update config with preset values
    await handleUpdateConfig({
      provider_type: providerType,
      provider_url: preset.url,
      model: preset.models[0]?.value || '',
    })
  }

  // Handle saving custom URL
  const handleSaveCustomUrl = async () => {
    if (!customUrl.trim()) return
    const providerType = customUrl.includes('anthropic.com') ? 'anthropic' : 'openai'
    await handleUpdateConfig({
      provider_type: providerType,
      provider_url: customUrl,
      model: customModel || 'custom-model',
    })
  }

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/v1/admin/ai/apikey', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ api_key: newApiKey }),
      })
      if (!response.ok) throw new Error('Error guardando API key')
      setNewApiKey('')
      setShowApiKeyInput(false)
      setSuccess('API Key guardada y encriptada')
      loadConfig()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error guardando API key')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    setError('')
    try {
      const response = await fetch('/api/v1/admin/ai/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      setTestResult(data)
    } catch {
      setError('Error probando conexión')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4 animate-pulse">🤖</div>
        <p className="text-gray-500">Cargando configuración de IA...</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-500">No se pudo cargar la configuración</p>
        <button onClick={loadConfig} className="btn-primary mt-4">Reintentar</button>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h2 className="text-lg font-bold text-carbon">Estado del Sistema</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${config.is_ready ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-semibold text-lg">
                  {config.is_ready ? 'IA Lista' : 'IA No Configurada'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                config.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {config.enabled ? 'Habilitada' : 'Deshabilitada'}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Proveedor:</span>
                <span className="font-semibold">
                  {PROVIDER_PRESETS[selectedProvider]?.name || 'Personalizado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modelo:</span>
                <span className="font-mono text-xs">{config.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Key:</span>
                <span className={config.has_api_key ? 'text-green-600' : 'text-red-600'}>
                  {config.has_api_key ? '✓ Configurada' : '✗ No configurada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache:</span>
                <span>{config.cache_enabled ? `✓ ${config.cache_ttl_minutes} min` : '✗ Deshabilitado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fallback:</span>
                <span>{config.fallback_enabled ? '✓ Habilitado' : '✗ Deshabilitado'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={handleTest}
                disabled={testing || !config.is_ready}
                className="btn-primary w-full"
              >
                {testing ? '🔄 Probando...' : '🧪 Probar Conexión'}
              </button>

              {testResult && (
                <div className={`mt-4 p-4 rounded-xl ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{testResult.success ? '✅' : '❌'}</span>
                    <span className="font-semibold">{testResult.success ? 'Éxito' : 'Error'}</span>
                  </div>
                  <p className="text-sm">{testResult.message}</p>
                  {testResult.response_ms && (
                    <p className="text-xs text-gray-500 mt-1">Tiempo: {testResult.response_ms}ms</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h2 className="text-lg font-bold text-carbon">Configuración</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <label className="font-semibold">Habilitar IA</label>
              <button
                onClick={() => handleUpdateConfig({ enabled: !config.enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.enabled ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Provider Selector */}
            <div>
              <label className="block text-sm font-semibold text-carbon mb-1">Proveedor</label>
              <select
                value={selectedProvider}
                onChange={e => handleProviderChange(e.target.value as ProviderKey)}
                disabled={saving}
                className="input"
              >
                {Object.entries(PROVIDER_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
            </div>

            {/* Custom URL (only for custom provider) */}
            {selectedProvider === 'custom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-semibold text-carbon mb-1">URL del API</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    placeholder="https://api.example.com/v1/chat/completions"
                    className="input font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-carbon mb-1">Nombre del Modelo</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={e => setCustomModel(e.target.value)}
                    placeholder="model-name"
                    className="input font-mono text-sm"
                  />
                </div>
                <button
                  onClick={handleSaveCustomUrl}
                  disabled={saving || !customUrl.trim()}
                  className="btn-primary-sm w-full"
                >
                  {saving ? 'Guardando...' : 'Guardar URL Personalizada'}
                </button>
              </div>
            )}

            {/* Model (for preset providers) */}
            {selectedProvider !== 'custom' && (
              <div>
                <label className="block text-sm font-semibold text-carbon mb-1">Modelo</label>
                <select
                  value={config.model}
                  onChange={e => handleUpdateConfig({ model: e.target.value })}
                  disabled={saving}
                  className="input"
                >
                  {getCurrentModels().map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                  {/* Also show current model if not in list */}
                  {!getCurrentModels().find(m => m.value === config.model) && (
                    <option value={config.model}>{config.model} (actual)</option>
                  )}
                </select>
              </div>
            )}

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-semibold text-carbon mb-1">
                Max Tokens: {config.max_tokens}
              </label>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={config.max_tokens}
                onChange={e => handleUpdateConfig({ max_tokens: parseInt(e.target.value) })}
                disabled={saving}
                className="w-full"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-semibold text-carbon mb-1">
                Temperatura: {config.temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={e => handleUpdateConfig({ temperature: parseFloat(e.target.value) })}
                disabled={saving}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Preciso</span>
                <span>Creativo</span>
              </div>
            </div>

            {/* API Key */}
            <div className="pt-4 border-t">
              <label className="block text-sm font-semibold text-carbon mb-2">API Key</label>
              {showApiKeyInput ? (
                <div className="space-y-2">
                  <input
                    type="password"
                    value={newApiKey}
                    onChange={e => setNewApiKey(e.target.value)}
                    placeholder="sk-ant-api..."
                    className="input font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveApiKey}
                      disabled={saving || !newApiKey.trim()}
                      className="btn-primary-sm flex-1"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => { setShowApiKeyInput(false); setNewApiKey('') }}
                      className="btn-outline-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  className="btn-outline w-full"
                >
                  {config.has_api_key ? '🔑 Cambiar API Key' : '🔑 Configurar API Key'}
                </button>
              )}
            </div>

            {/* Cache Toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <label className="font-semibold">Cache</label>
              <button
                onClick={() => handleUpdateConfig({ cache_enabled: !config.cache_enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.cache_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.cache_enabled ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Fallback Toggle */}
            <div className="flex items-center justify-between">
              <label className="font-semibold">Fallback (respuestas predefinidas)</label>
              <button
                onClick={() => handleUpdateConfig({ fallback_enabled: !config.fallback_enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.fallback_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.fallback_enabled ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-r from-agua/10 to-mango/10 rounded-2xl p-6">
        <h3 className="font-bold text-carbon mb-2">💡 Información</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Multi-proveedor:</strong> Soporta OpenAI, Anthropic, Groq, Together, Ollama y más</li>
          <li>• La API Key se almacena <strong>encriptada</strong> en la base de datos</li>
          <li>• El cache reduce costos reutilizando respuestas idénticas</li>
          <li>• El fallback proporciona respuestas predefinidas si la IA falla</li>
          <li>• <strong>Groq:</strong> Ultra rápido y gratuito para desarrollo</li>
          <li>• <strong>Ollama:</strong> Ejecuta modelos localmente sin costo</li>
        </ul>
      </div>
    </>
  )
}
