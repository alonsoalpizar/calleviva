// Admin Page - CalleViva

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api, Parameter, CreateParameter } from '../services/api'
import { PersonajeSVG, IngredienteSVG, ArtefactoSVG } from '../components/creator/CalleVivaCreator'

type AdminTab = 'parameters' | 'users' | 'ai' | 'creator' | 'scenarios'

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
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'parameters'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
              }`}
          >
            📋 Parámetros
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'users'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
              }`}
          >
            👥 Usuarios
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'ai'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
              }`}
          >
            🤖 IA
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'creator'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
              }`}
          >
            🎨 Creator
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'scenarios'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
              }`}
          >
            🗺️ Escenarios
          </button>
        </div>

        {activeTab === 'parameters' && <ParametersSection />}
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'ai' && <AISection />}
        {activeTab === 'creator' && <CreatorSection />}
        {activeTab === 'scenarios' && <ScenariosSection />}
      </div>
    </div>
  )
}

// ========== Creator Section (NEW!) ==========
interface ContentCreation {
  id: string
  content_type: string
  name: string
  description: string
  recipe: Record<string, string>
  creator_name: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected' | 'needs_edit'
  review_notes?: string
  reviewed_at?: string
  times_used: number
}

type CreatorTab = 'pending' | 'approved' | 'rejected' | 'all'

function CreatorSection() {
  const [creations, setCreations] = useState<ContentCreation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<CreatorTab>('pending')

  // Modal state
  const [selectedCreation, setSelectedCreation] = useState<ContentCreation | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'needs_edit'>('approved')

  useEffect(() => {
    loadCreations()
  }, [activeTab])

  const loadCreations = async () => {
    setLoading(true)
    setError('')
    try {
      const status = activeTab === 'all' ? '' : activeTab
      const url = status
        ? `/api/v1/admin/creator/all?status=${status}`
        : '/api/v1/admin/creator/all'

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Error cargando creaciones')
      const data = await response.json()
      setCreations(data || [])
    } catch {
      setError('Error cargando creaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedCreation) return

    try {
      const response = await fetch(`/api/v1/admin/creator/${selectedCreation.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewAction,
          notes: reviewNotes,
        }),
      })

      if (!response.ok) throw new Error('Error al revisar')

      setSuccess(`Creación ${reviewAction === 'approved' ? 'aprobada' : reviewAction === 'rejected' ? 'rechazada' : 'marcada para edición'}`)
      setShowReviewModal(false)
      setSelectedCreation(null)
      setReviewNotes('')
      loadCreations()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al revisar la creación')
    }
  }

  const quickApprove = async (creation: ContentCreation) => {
    try {
      const response = await fetch(`/api/v1/admin/creator/${creation.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          notes: 'Aprobado rápidamente',
        }),
      })

      if (!response.ok) throw new Error('Error al aprobar')

      setSuccess(`"${creation.name}" aprobado ✓`)
      loadCreations()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al aprobar')
    }
  }

  const quickReject = async (creation: ContentCreation) => {
    if (!confirm(`¿Rechazar "${creation.name}"?`)) return

    try {
      const response = await fetch(`/api/v1/admin/creator/${creation.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          notes: 'Rechazado',
        }),
      })

      if (!response.ok) throw new Error('Error al rechazar')

      setSuccess(`"${creation.name}" rechazado`)
      loadCreations()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al rechazar')
    }
  }

  const openReviewModal = (creation: ContentCreation) => {
    setSelectedCreation(creation)
    setReviewNotes('')
    setReviewAction('approved')
    setShowReviewModal(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      personajes: '👤',
      ingredientes: '🥬',
      artefactos: '🪑',
      sitios: '📍',
    }
    return icons[type] || '📦'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      needs_edit: 'bg-orange-100 text-orange-700',
    }
    const labels: Record<string, string> = {
      pending: '⏳ Pendiente',
      approved: '✅ Aprobado',
      rejected: '❌ Rechazado',
      needs_edit: '✏️ Editar',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  // Stats
  const stats = {
    pending: creations.filter(c => c.status === 'pending').length,
    approved: creations.filter(c => c.status === 'approved').length,
    rejected: creations.filter(c => c.status === 'rejected').length,
    total: creations.length,
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Aprobados</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rechazados</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-agua">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-carbon">🎨 Creaciones de Nacho</h2>
          <button onClick={loadCreations} className="btn-ghost text-agua">
            🔄 Actualizar
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto bg-white">
          {(['pending', 'approved', 'rejected', 'all'] as CreatorTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === tab
                  ? 'text-coral border-b-2 border-coral bg-coral/5'
                  : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
                }`}
            >
              {tab === 'pending' && `⏳ Pendientes (${stats.pending})`}
              {tab === 'approved' && `✅ Aprobados (${stats.approved})`}
              {tab === 'rejected' && `❌ Rechazados (${stats.rejected})`}
              {tab === 'all' && `📋 Todos (${stats.total})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">🎨</div>
              <p className="text-gray-500">Cargando creaciones...</p>
            </div>
          ) : creations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500">
                {activeTab === 'pending'
                  ? 'No hay creaciones pendientes de revisión'
                  : 'No hay creaciones en esta categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creations.map(creation => (
                <div
                  key={creation.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTypeIcon(creation.content_type)}</span>
                      <div>
                        <h3 className="font-bold text-carbon">{creation.name}</h3>
                        <p className="text-xs text-gray-500">{creation.content_type}</p>
                      </div>
                    </div>
                    {getStatusBadge(creation.status)}
                  </div>

                  {/* Preview */}
                  <div className="bg-white rounded-lg p-3 mb-3 border">
                    <CreationPreview creation={creation} />
                  </div>

                  {/* Description */}
                  {creation.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {creation.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>👤 Por: <span className="font-semibold">{creation.creator_name}</span></div>
                    <div>📅 {formatDate(creation.created_at)}</div>
                    {creation.times_used > 0 && (
                      <div>🎮 Usado {creation.times_used} veces</div>
                    )}
                    {creation.review_notes && (
                      <div className="bg-yellow-50 p-2 rounded mt-2">
                        📝 {creation.review_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {creation.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => quickApprove(creation)}
                        className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => openReviewModal(creation)}
                        className="py-2 px-3 bg-gray-200 hover:bg-gray-300 text-carbon rounded-lg text-sm font-semibold transition-colors"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => quickReject(creation)}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openReviewModal(creation)}
                      className="w-full py-2 px-3 bg-gray-200 hover:bg-gray-300 text-carbon rounded-lg text-sm font-semibold transition-colors"
                    >
                      👁️ Ver Detalles
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedCreation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-carbon flex items-center gap-2">
                {getTypeIcon(selectedCreation.content_type)}
                {selectedCreation.name}
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Preview */}
              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <CreationPreview creation={selectedCreation} large />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tipo</label>
                  <p className="font-medium">{selectedCreation.content_type}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Creador</label>
                  <p className="font-medium">{selectedCreation.creator_name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Fecha</label>
                  <p className="font-medium">{formatDate(selectedCreation.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Estado</label>
                  <p>{getStatusBadge(selectedCreation.status)}</p>
                </div>
              </div>

              {selectedCreation.description && (
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600">Descripción</label>
                  <p className="text-gray-700">{selectedCreation.description}</p>
                </div>
              )}

              {/* Recipe/Attributes */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-600">Atributos</label>
                <div className="bg-gray-50 rounded-lg p-3 mt-1 max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedCreation.recipe || {}).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-white rounded border text-xs"
                      >
                        <span className="text-gray-500">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Form (only for pending) */}
              {selectedCreation.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Acción</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReviewAction('approved')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${reviewAction === 'approved'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => setReviewAction('needs_edit')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${reviewAction === 'needs_edit'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ✏️ Pedir Edición
                      </button>
                      <button
                        onClick={() => setReviewAction('rejected')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${reviewAction === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Notas para Nacho (opcional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder={
                        reviewAction === 'approved'
                          ? '¡Excelente trabajo!'
                          : reviewAction === 'needs_edit'
                            ? 'Por favor ajusta...'
                            : 'Motivo del rechazo...'
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReview}
                      className={`btn-primary ${reviewAction === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                          reviewAction === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                            'bg-orange-500 hover:bg-orange-600'
                        }`}
                    >
                      Confirmar
                    </button>
                  </div>
                </>
              )}

              {/* Previous notes if already reviewed */}
              {selectedCreation.status !== 'pending' && selectedCreation.review_notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="text-sm font-semibold text-yellow-800">📝 Notas de revisión</label>
                  <p className="text-yellow-700 mt-1">{selectedCreation.review_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-gradient-to-r from-mango/10 to-coral/10 rounded-2xl p-6">
        <h3 className="font-bold text-carbon mb-2">✨ Sobre el Creator</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Las creaciones de Nacho aparecen aquí para tu revisión</li>
          <li>• Al aprobar, el contenido queda disponible para el juego</li>
          <li>• Puedes pedir ediciones con notas específicas</li>
          <li>• El juego usa contenido aprobado en <code className="bg-gray-200 px-1 rounded">/api/v1/game/content</code></li>
        </ul>
      </div>
    </>
  )
}

// Preview component with actual SVG renders
function CreationPreview({ creation, large = false }: { creation: ContentCreation; large?: boolean }) {
  const size = large ? 'w-48 h-48' : 'w-24 h-24'
  const recipe = creation.recipe || {}

  const renderSVG = () => {
    const data = { ...recipe, name: creation.name, description: creation.description }

    switch (creation.content_type) {
      case 'personajes':
        return <PersonajeSVG data={data} />
      case 'ingredientes':
        return <IngredienteSVG data={data} />
      case 'artefactos':
        return <ArtefactoSVG data={data} />
      default:
        return <span className="text-4xl">📦</span>
    }
  }

  return (
    <div className={`${size} flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden`}>
      <div className={large ? 'scale-100' : 'scale-50'}>
        {renderSVG()}
      </div>
    </div>
  )
}

// ========== Scenarios Section (NEW!) ==========
interface Scenario {
  id: string
  code: string
  name: string
  zoneId?: string
  status: 'pending' | 'approved' | 'rejected'
  creatorName: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  timesUsed: number
  lastUsedAt?: string
  version: number
  createdAt: string
  updatedAt: string
}

type ScenarioTab = 'pending' | 'approved' | 'rejected' | 'all'

// Zone icons for display
const ZONE_ICONS: Record<string, string> = {
  playa: '🏖️',
  comercial: '🏪',
  financiera: '🏢',
  residencial: '🏠',
  parque: '🌳',
  centro: '🏛️',
}

function ScenariosSection() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<ScenarioTab>('pending')

  // Modal state
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved')

  useEffect(() => {
    loadScenarios()
  }, [activeTab])

  const loadScenarios = async () => {
    setLoading(true)
    setError('')
    try {
      const status = activeTab === 'all' ? '' : activeTab
      const url = status
        ? `/api/v1/scenarios?status=${status}`
        : '/api/v1/scenarios'

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (!response.ok) throw new Error('Error cargando escenarios')
      const data = await response.json()
      // Backend returns { scenarios: [...], total: N } or array directly
      const scenarioList = Array.isArray(data) ? data : (data.scenarios || [])
      setScenarios(scenarioList)
    } catch {
      setError('Error cargando escenarios')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedScenario) return

    try {
      const response = await fetch(`/api/v1/scenarios/${selectedScenario.code}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewAction,
          reviewNotes: reviewNotes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Error al revisar')

      setSuccess(`Escenario ${reviewAction === 'approved' ? 'aprobado' : 'rechazado'}`)
      setShowReviewModal(false)
      setSelectedScenario(null)
      setReviewNotes('')
      loadScenarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al revisar el escenario')
    }
  }

  const quickApprove = async (scenario: Scenario) => {
    try {
      const response = await fetch(`/api/v1/scenarios/${scenario.code}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          reviewNotes: 'Aprobado rápidamente',
        }),
      })

      if (!response.ok) throw new Error('Error al aprobar')

      setSuccess(`"${scenario.name}" aprobado ✓`)
      loadScenarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al aprobar')
    }
  }

  const quickReject = async (scenario: Scenario) => {
    if (!confirm(`¿Rechazar "${scenario.name}"?`)) return

    try {
      const response = await fetch(`/api/v1/scenarios/${scenario.code}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          reviewNotes: 'Rechazado',
        }),
      })

      if (!response.ok) throw new Error('Error al rechazar')

      setSuccess(`"${scenario.name}" rechazado`)
      loadScenarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al rechazar')
    }
  }

  const handleDelete = async (scenario: Scenario) => {
    if (!confirm(`¿Eliminar permanentemente "${scenario.name}"?`)) return

    try {
      const response = await fetch(`/api/v1/scenarios/${scenario.code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Error al eliminar')

      setSuccess(`"${scenario.name}" eliminado`)
      loadScenarios()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Error al eliminar')
    }
  }

  const openReviewModal = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setReviewNotes('')
    setReviewAction('approved')
    setShowReviewModal(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      pending: '⏳ Pendiente',
      approved: '✅ Aprobado',
      rejected: '❌ Rechazado',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getZoneBadge = (zoneId?: string) => {
    if (!zoneId) return null
    const icon = ZONE_ICONS[zoneId] || '📍'
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-agua/20 text-agua">
        {icon} {zoneId}
      </span>
    )
  }

  // Stats (computed from all scenarios, not just filtered)
  const stats = {
    pending: scenarios.filter(s => s.status === 'pending').length,
    approved: scenarios.filter(s => s.status === 'approved').length,
    rejected: scenarios.filter(s => s.status === 'rejected').length,
    total: scenarios.length,
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Aprobados</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rechazados</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="text-3xl font-bold text-agua">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-carbon">🗺️ Escenarios / Locaciones</h2>
          <button onClick={loadScenarios} className="btn-ghost text-agua">
            🔄 Actualizar
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto bg-white">
          {(['pending', 'approved', 'rejected', 'all'] as ScenarioTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === tab
                  ? 'text-coral border-b-2 border-coral bg-coral/5'
                  : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
                }`}
            >
              {tab === 'pending' && `⏳ Pendientes (${stats.pending})`}
              {tab === 'approved' && `✅ Aprobados (${stats.approved})`}
              {tab === 'rejected' && `❌ Rechazados (${stats.rejected})`}
              {tab === 'all' && `📋 Todos (${stats.total})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">🗺️</div>
              <p className="text-gray-500">Cargando escenarios...</p>
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500">
                {activeTab === 'pending'
                  ? 'No hay escenarios pendientes de revisión'
                  : 'No hay escenarios en esta categoría'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(scenario => (
                <div
                  key={scenario.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ZONE_ICONS[scenario.zoneId || ''] || '🗺️'}</span>
                      <div>
                        <h3 className="font-bold text-carbon">{scenario.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{scenario.code}</p>
                      </div>
                    </div>
                    {getStatusBadge(scenario.status)}
                  </div>

                  {/* Zone Badge */}
                  {scenario.zoneId && (
                    <div className="mb-3">
                      {getZoneBadge(scenario.zoneId)}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <div>👤 Por: <span className="font-semibold">{scenario.creatorName}</span></div>
                    <div>📅 {formatDate(scenario.createdAt)}</div>
                    <div>🔢 Versión {scenario.version}</div>
                    {scenario.timesUsed > 0 && (
                      <div>🎮 Usado {scenario.timesUsed} veces</div>
                    )}
                    {scenario.reviewNotes && (
                      <div className="bg-yellow-50 p-2 rounded mt-2">
                        📝 {scenario.reviewNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {scenario.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => quickApprove(scenario)}
                        className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => openReviewModal(scenario)}
                        className="py-2 px-3 bg-gray-200 hover:bg-gray-300 text-carbon rounded-lg text-sm font-semibold transition-colors"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => quickReject(scenario)}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openReviewModal(scenario)}
                        className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-carbon rounded-lg text-sm font-semibold transition-colors"
                      >
                        👁️ Ver Detalles
                      </button>
                      <button
                        onClick={() => handleDelete(scenario)}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-carbon flex items-center gap-2">
                {ZONE_ICONS[selectedScenario.zoneId || ''] || '🗺️'}
                {selectedScenario.name}
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Código</label>
                  <p className="font-mono text-sm">{selectedScenario.code}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Zona Base</label>
                  <p className="font-medium">{selectedScenario.zoneId || 'Sin zona'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Creador</label>
                  <p className="font-medium">{selectedScenario.creatorName}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Versión</label>
                  <p className="font-medium">v{selectedScenario.version}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Creado</label>
                  <p className="font-medium">{formatDate(selectedScenario.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Estado</label>
                  <p>{getStatusBadge(selectedScenario.status)}</p>
                </div>
              </div>

              {/* Review Form (only for pending) */}
              {selectedScenario.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Acción</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReviewAction('approved')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${reviewAction === 'approved'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ✅ Aprobar
                      </button>
                      <button
                        onClick={() => setReviewAction('rejected')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${reviewAction === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder={
                        reviewAction === 'approved'
                          ? '¡Excelente escenario!'
                          : 'Motivo del rechazo...'
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReview}
                      className={`btn-primary ${reviewAction === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      Confirmar
                    </button>
                  </div>
                </>
              )}

              {/* Previous notes if already reviewed */}
              {selectedScenario.status !== 'pending' && selectedScenario.reviewNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="text-sm font-semibold text-yellow-800">📝 Notas de revisión</label>
                  <p className="text-yellow-700 mt-1">{selectedScenario.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-gradient-to-r from-agua/10 to-mango/10 rounded-2xl p-6">
        <h3 className="font-bold text-carbon mb-2">🗺️ Sobre los Escenarios</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Los escenarios son locaciones 3D creadas en el editor <code className="bg-gray-200 px-1 rounded">/scene3d</code></li>
          <li>• Cada escenario pertenece a una <strong>zona base</strong> (playa, centro, comercial...)</li>
          <li>• Pueden existir múltiples escenarios para la misma zona con diferentes configuraciones</li>
          <li>• Solo los escenarios <strong>aprobados</strong> aparecen disponibles para gameplay</li>
          <li>• El contador "veces usado" se incrementa cada vez que se selecciona en juego</li>
        </ul>
      </div>
    </>
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

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50 bg-opacity-90 backdrop-blur-md">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-carbon">Parámetros del Sistema</h2>
            <p className="text-gray-500 text-sm mt-1">Configura las variables globales del juego</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-coral hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-coral/30 hover:shadow-coral/50 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
          >
            <span>✨</span> Nuevo
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50 p-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-white text-coral shadow-md scale-105 ring-1 ring-coral/20'
                  : 'text-gray-500 hover:text-carbon hover:bg-white/50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="p-8 bg-gray-50/30 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <div className="text-6xl mb-4 animate-bounce">🎲</div>
              <p className="font-bold text-gray-400">Cargando parámetros...</p>
            </div>
          ) : parameters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-60">
              <div className="text-6xl mb-4 grayscale">📭</div>
              <p className="font-bold text-gray-400">No hay parámetros en esta categoría</p>
              <button onClick={handleCreate} className="mt-4 text-agua font-bold hover:underline">
                Crear el primero
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {parameters.map(param => (
                <div
                  key={param.id}
                  className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:border-coral/20 transition-all duration-300 transform hover:-translate-y-2 relative"
                >
                  {/* Active Status Dot */}
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${param.is_active ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-300'}`} title={param.is_active ? 'Activo' : 'Inactivo'} />

                  {/* Icon & Name */}
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {param.icon || '📦'}
                    </div>
                    <h3 className="font-bold text-lg text-carbon leading-tight mb-1">{param.name}</h3>
                    <div className="inline-block bg-gray-100 text-gray-500 font-mono text-xs px-2 py-0.5 rounded-md border border-gray-200">
                      {param.code}
                    </div>
                  </div>

                  {/* Description */}
                  {param.description && (
                    <p className="text-sm text-gray-500 text-center mb-4 line-clamp-2 h-10">
                      {param.description}
                    </p>
                  )}

                  {/* Actions Overlay */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs font-bold text-gray-300">
                      #{param.sort_order}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(param)}
                        className="p-2 text-agua bg-agua/10 rounded-lg hover:bg-agua hover:text-white transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(param)}
                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-carbon/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all scale-100 border-4 border-white">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-carbon flex items-center gap-2">
                {editingParam ? '✏️ Editar' : '✨ Nuevo'} Parámetro
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {!editingParam && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none transition-all font-bold text-carbon"
                      required
                      placeholder="Ej: sistema"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Código (ID)</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none transition-all font-mono text-sm"
                      required
                      placeholder="SYSTEM_VAR"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Icono</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none transition-all text-center text-2xl"
                    placeholder="🌮"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre Visible</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none transition-all font-bold"
                    required
                    placeholder="Nombre amigable"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none transition-all text-sm"
                  rows={2}
                  placeholder="¿Para qué sirve este parámetro?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Orden de visualización</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-coral hover:bg-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-coral/30 hover:shadow-coral/50 transition-all transform hover:-translate-y-1 active:scale-95">
                  {editingParam ? 'Guardar Cambios' : 'Crear Parámetro'}
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
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_admin ? 'bg-agua/20 text-agua' : 'bg-gray-100 text-gray-600'
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
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
                <div className={`mt-4 p-4 rounded-xl ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
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
                className={`relative w-14 h-7 rounded-full transition-colors ${config.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${config.enabled ? 'translate-x-8' : 'translate-x-1'
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
                className={`relative w-14 h-7 rounded-full transition-colors ${config.cache_enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${config.cache_enabled ? 'translate-x-8' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            {/* Fallback Toggle */}
            <div className="flex items-center justify-between">
              <label className="font-semibold">Fallback (respuestas predefinidas)</label>
              <button
                onClick={() => handleUpdateConfig({ fallback_enabled: !config.fallback_enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${config.fallback_enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${config.fallback_enabled ? 'translate-x-8' : 'translate-x-1'
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
