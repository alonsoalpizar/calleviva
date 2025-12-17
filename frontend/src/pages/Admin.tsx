// Admin Page - CalleViva

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api, Parameter, CreateParameter } from '../services/api'

type AdminTab = 'parameters' | 'users' | 'ai' | 'creator'

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

  const [activeTab, setActiveTab] = useState&lt;AdminTab&gt;('parameters')

  // Redirect if not admin
  useEffect(() => {
    if (player &amp;&amp; !player.is_admin) {
      navigate('/game')
    }
  }, [player, navigate])

  return (
    &lt;div className="min-h-screen bg-crema"&gt;
      {/* Header */}
      &lt;header className="bg-gradient-to-r from-coral to-terracota text-white shadow-lg"&gt;
        &lt;div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"&gt;
          &lt;div className="flex items-center gap-4"&gt;
            &lt;button
              onClick={() =&gt; navigate('/game')}
              className="btn-ghost text-white/80 hover:text-white hover:bg-white/10"
            &gt;
              ← Volver
            &lt;/button&gt;
            &lt;h1 className="text-2xl font-bold"&gt;🛠️ Admin Console&lt;/h1&gt;
          &lt;/div&gt;
          &lt;span className="text-white/80"&gt;{player?.email}&lt;/span&gt;
        &lt;/div&gt;
      &lt;/header&gt;

      {/* Main Tabs */}
      &lt;div className="max-w-7xl mx-auto px-4 py-6"&gt;
        &lt;div className="flex gap-2 mb-6 flex-wrap"&gt;
          &lt;button
            onClick={() =&gt; setActiveTab('parameters')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'parameters'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          &gt;
            📋 Parámetros
          &lt;/button&gt;
          &lt;button
            onClick={() =&gt; setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          &gt;
            👥 Usuarios
          &lt;/button&gt;
          &lt;button
            onClick={() =&gt; setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'ai'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          &gt;
            🤖 IA
          &lt;/button&gt;
          &lt;button
            onClick={() =&gt; setActiveTab('creator')}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === 'creator'
                ? 'bg-coral text-white shadow-md'
                : 'bg-white text-carbon hover:bg-gray-100'
            }`}
          &gt;
            🎨 Creator
          &lt;/button&gt;
        &lt;/div&gt;

        {activeTab === 'parameters' &amp;&amp; &lt;ParametersSection /&gt;}
        {activeTab === 'users' &amp;&amp; &lt;UsersSection /&gt;}
        {activeTab === 'ai' &amp;&amp; &lt;AISection /&gt;}
        {activeTab === 'creator' &amp;&amp; &lt;CreatorSection /&gt;}
      &lt;/div&gt;
    &lt;/div&gt;
  )
}

// ========== Creator Section (NEW!) ==========
interface ContentCreation {
  id: string
  content_type: string
  name: string
  description: string
  recipe: Record&lt;string, string&gt;
  creator_name: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected' | 'needs_edit'
  review_notes?: string
  reviewed_at?: string
  times_used: number
}

type CreatorTab = 'pending' | 'approved' | 'rejected' | 'all'

function CreatorSection() {
  const [creations, setCreations] = useState&lt;ContentCreation[]&gt;([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState&lt;CreatorTab&gt;('pending')
  
  // Modal state
  const [selectedCreation, setSelectedCreation] = useState&lt;ContentCreation | null&gt;(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState&lt;'approved' | 'rejected' | 'needs_edit'&gt;('approved')

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
    const icons: Record&lt;string, string&gt; = {
      personajes: '👤',
      productos: '🥬',
      artefactos: '🪑',
      sitios: '📍',
    }
    return icons[type] || '📦'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record&lt;string, string&gt; = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      needs_edit: 'bg-orange-100 text-orange-700',
    }
    const labels: Record&lt;string, string&gt; = {
      pending: '⏳ Pendiente',
      approved: '✅ Aprobado',
      rejected: '❌ Rechazado',
      needs_edit: '✏️ Editar',
    }
    return (
      &lt;span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}&gt;
        {labels[status] || status}
      &lt;/span&gt;
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
    &lt;&gt;
      {error &amp;&amp; (
        &lt;div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center"&gt;
          &lt;span&gt;{error}&lt;/span&gt;
          &lt;button onClick={() =&gt; setError('')} className="text-red-700 hover:text-red-900 font-bold"&gt;×&lt;/button&gt;
        &lt;/div&gt;
      )}

      {success &amp;&amp; (
        &lt;div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4"&gt;
          {success}
        &lt;/div&gt;
      )}

      {/* Stats Cards */}
      &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"&gt;
        &lt;div className="bg-white rounded-xl p-4 shadow-md"&gt;
          &lt;div className="text-3xl font-bold text-yellow-600"&gt;{stats.pending}&lt;/div&gt;
          &lt;div className="text-sm text-gray-600"&gt;Pendientes&lt;/div&gt;
        &lt;/div&gt;
        &lt;div className="bg-white rounded-xl p-4 shadow-md"&gt;
          &lt;div className="text-3xl font-bold text-green-600"&gt;{stats.approved}&lt;/div&gt;
          &lt;div className="text-sm text-gray-600"&gt;Aprobados&lt;/div&gt;
        &lt;/div&gt;
        &lt;div className="bg-white rounded-xl p-4 shadow-md"&gt;
          &lt;div className="text-3xl font-bold text-red-600"&gt;{stats.rejected}&lt;/div&gt;
          &lt;div className="text-sm text-gray-600"&gt;Rechazados&lt;/div&gt;
        &lt;/div&gt;
        &lt;div className="bg-white rounded-xl p-4 shadow-md"&gt;
          &lt;div className="text-3xl font-bold text-agua"&gt;{stats.total}&lt;/div&gt;
          &lt;div className="text-sm text-gray-600"&gt;Total&lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="bg-white rounded-2xl shadow-lg overflow-hidden"&gt;
        {/* Header */}
        &lt;div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between"&gt;
          &lt;h2 className="text-lg font-bold text-carbon"&gt;🎨 Creaciones de Nacho&lt;/h2&gt;
          &lt;button onClick={loadCreations} className="btn-ghost text-agua"&gt;
            🔄 Actualizar
          &lt;/button&gt;
        &lt;/div&gt;

        {/* Sub Tabs */}
        &lt;div className="flex border-b border-gray-200 overflow-x-auto bg-white"&gt;
          {(['pending', 'approved', 'rejected', 'all'] as CreatorTab[]).map(tab =&gt; (
            &lt;button
              key={tab}
              onClick={() =&gt; setActiveTab(tab)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-coral border-b-2 border-coral bg-coral/5'
                  : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
              }`}
            &gt;
              {tab === 'pending' &amp;&amp; `⏳ Pendientes (${stats.pending})`}
              {tab === 'approved' &amp;&amp; `✅ Aprobados (${stats.approved})`}
              {tab === 'rejected' &amp;&amp; `❌ Rechazados (${stats.rejected})`}
              {tab === 'all' &amp;&amp; `📋 Todos (${stats.total})`}
            &lt;/button&gt;
          ))}
        &lt;/div&gt;

        {/* Content */}
        &lt;div className="p-6"&gt;
          {loading ? (
            &lt;div className="text-center py-12"&gt;
              &lt;div className="text-4xl mb-4 animate-bounce"&gt;🎨&lt;/div&gt;
              &lt;p className="text-gray-500"&gt;Cargando creaciones...&lt;/p&gt;
            &lt;/div&gt;
          ) : creations.length === 0 ? (
            &lt;div className="text-center py-12"&gt;
              &lt;div className="text-4xl mb-4"&gt;📭&lt;/div&gt;
              &lt;p className="text-gray-500"&gt;
                {activeTab === 'pending' 
                  ? 'No hay creaciones pendientes de revisión' 
                  : 'No hay creaciones en esta categoría'}
              &lt;/p&gt;
            &lt;/div&gt;
          ) : (
            &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"&gt;
              {creations.map(creation =&gt; (
                &lt;div 
                  key={creation.id} 
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                &gt;
                  {/* Header */}
                  &lt;div className="flex items-start justify-between mb-3"&gt;
                    &lt;div className="flex items-center gap-2"&gt;
                      &lt;span className="text-2xl"&gt;{getTypeIcon(creation.content_type)}&lt;/span&gt;
                      &lt;div&gt;
                        &lt;h3 className="font-bold text-carbon"&gt;{creation.name}&lt;/h3&gt;
                        &lt;p className="text-xs text-gray-500"&gt;{creation.content_type}&lt;/p&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                    {getStatusBadge(creation.status)}
                  &lt;/div&gt;

                  {/* Preview */}
                  &lt;div className="bg-white rounded-lg p-3 mb-3 border"&gt;
                    &lt;CreationPreview creation={creation} /&gt;
                  &lt;/div&gt;

                  {/* Description */}
                  {creation.description &amp;&amp; (
                    &lt;p className="text-sm text-gray-600 mb-3 line-clamp-2"&gt;
                      {creation.description}
                    &lt;/p&gt;
                  )}

                  {/* Meta */}
                  &lt;div className="text-xs text-gray-500 mb-3 space-y-1"&gt;
                    &lt;div&gt;👤 Por: &lt;span className="font-semibold"&gt;{creation.creator_name}&lt;/span&gt;&lt;/div&gt;
                    &lt;div&gt;📅 {formatDate(creation.created_at)}&lt;/div&gt;
                    {creation.times_used &gt; 0 &amp;&amp; (
                      &lt;div&gt;🎮 Usado {creation.times_used} veces&lt;/div&gt;
                    )}
                    {creation.review_notes &amp;&amp; (
                      &lt;div className="bg-yellow-50 p-2 rounded mt-2"&gt;
                        📝 {creation.review_notes}
                      &lt;/div&gt;
                    )}
                  &lt;/div&gt;

                  {/* Actions */}
                  {creation.status === 'pending' ? (
                    &lt;div className="flex gap-2"&gt;
                      &lt;button
                        onClick={() =&gt; quickApprove(creation)}
                        className="flex-1 py-2 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      &gt;
                        ✅ Aprobar
                      &lt;/button&gt;
                      &lt;button
                        onClick={() =&gt; openReviewModal(creation)}
                        className="py-2 px-3 bg-gray-200 hover:bg-gray-300 text-carbon rounded-lg text-sm font-semibold transition-colors"
                      &gt;
                        📝
                      &lt;/button&gt;
                      &lt;button
                        onClick={() =&gt; quickReject(creation)}
                        className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                      &gt;
                        ❌
                      &lt;/button&gt;
                    &lt;/div&gt;
                  ) : (
                    &lt;button
                      onClick={() =&gt; openReviewModal(creation)}
                      className="w-full py-2 px-3 bg-gray-200 hover:bg-gray-300 text-carbon rounded-lg text-sm font-semibold transition-colors"
                    &gt;
                      👁️ Ver Detalles
                    &lt;/button&gt;
                  )}
                &lt;/div&gt;
              ))}
            &lt;/div&gt;
          )}
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Review Modal */}
      {showReviewModal &amp;&amp; selectedCreation &amp;&amp; (
        &lt;div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"&gt;
          &lt;div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"&gt;
            &lt;div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white"&gt;
              &lt;h3 className="text-lg font-bold text-carbon flex items-center gap-2"&gt;
                {getTypeIcon(selectedCreation.content_type)}
                {selectedCreation.name}
              &lt;/h3&gt;
              &lt;button onClick={() =&gt; setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl"&gt;
                ×
              &lt;/button&gt;
            &lt;/div&gt;
            
            &lt;div className="p-6"&gt;
              {/* Preview */}
              &lt;div className="bg-gray-100 rounded-xl p-4 mb-4"&gt;
                &lt;CreationPreview creation={selectedCreation} large /&gt;
              &lt;/div&gt;

              {/* Details */}
              &lt;div className="grid grid-cols-2 gap-4 mb-4"&gt;
                &lt;div&gt;
                  &lt;label className="text-sm font-semibold text-gray-600"&gt;Tipo&lt;/label&gt;
                  &lt;p className="font-medium"&gt;{selectedCreation.content_type}&lt;/p&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="text-sm font-semibold text-gray-600"&gt;Creador&lt;/label&gt;
                  &lt;p className="font-medium"&gt;{selectedCreation.creator_name}&lt;/p&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="text-sm font-semibold text-gray-600"&gt;Fecha&lt;/label&gt;
                  &lt;p className="font-medium"&gt;{formatDate(selectedCreation.created_at)}&lt;/p&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="text-sm font-semibold text-gray-600"&gt;Estado&lt;/label&gt;
                  &lt;p&gt;{getStatusBadge(selectedCreation.status)}&lt;/p&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {selectedCreation.description &amp;&amp; (
                &lt;div className="mb-4"&gt;
                  &lt;label className="text-sm font-semibold text-gray-600"&gt;Descripción&lt;/label&gt;
                  &lt;p className="text-gray-700"&gt;{selectedCreation.description}&lt;/p&gt;
                &lt;/div&gt;
              )}

              {/* Recipe/Attributes */}
              &lt;div className="mb-4"&gt;
                &lt;label className="text-sm font-semibold text-gray-600"&gt;Atributos&lt;/label&gt;
                &lt;div className="bg-gray-50 rounded-lg p-3 mt-1 max-h-40 overflow-y-auto"&gt;
                  &lt;div className="flex flex-wrap gap-2"&gt;
                    {Object.entries(selectedCreation.recipe || {}).map(([key, value]) =&gt; (
                      &lt;span 
                        key={key}
                        className="px-2 py-1 bg-white rounded border text-xs"
                      &gt;
                        &lt;span className="text-gray-500"&gt;{key}:&lt;/span&gt; {value}
                      &lt;/span&gt;
                    ))}
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;

              {/* Review Form (only for pending) */}
              {selectedCreation.status === 'pending' &amp;&amp; (
                &lt;&gt;
                  &lt;div className="mb-4"&gt;
                    &lt;label className="block text-sm font-semibold text-gray-600 mb-2"&gt;Acción&lt;/label&gt;
                    &lt;div className="flex gap-2"&gt;
                      &lt;button
                        onClick={() =&gt; setReviewAction('approved')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          reviewAction === 'approved'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        ✅ Aprobar
                      &lt;/button&gt;
                      &lt;button
                        onClick={() =&gt; setReviewAction('needs_edit')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          reviewAction === 'needs_edit'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        ✏️ Pedir Edición
                      &lt;/button&gt;
                      &lt;button
                        onClick={() =&gt; setReviewAction('rejected')}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                          reviewAction === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      &gt;
                        ❌ Rechazar
                      &lt;/button&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;

                  &lt;div className="mb-4"&gt;
                    &lt;label className="block text-sm font-semibold text-gray-600 mb-1"&gt;
                      Notas para Nacho (opcional)
                    &lt;/label&gt;
                    &lt;textarea
                      value={reviewNotes}
                      onChange={e =&gt; setReviewNotes(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder={
                        reviewAction === 'approved' 
                          ? '¡Excelente trabajo!' 
                          : reviewAction === 'needs_edit'
                          ? 'Por favor ajusta...'
                          : 'Motivo del rechazo...'
                      }
                    /&gt;
                  &lt;/div&gt;

                  &lt;div className="flex justify-end gap-3"&gt;
                    &lt;button 
                      onClick={() =&gt; setShowReviewModal(false)} 
                      className="btn-outline"
                    &gt;
                      Cancelar
                    &lt;/button&gt;
                    &lt;button 
                      onClick={handleReview}
                      className={`btn-primary ${
                        reviewAction === 'approved' ? 'bg-green-500 hover:bg-green-600' :
                        reviewAction === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                        'bg-orange-500 hover:bg-orange-600'
                      }`}
                    &gt;
                      Confirmar
                    &lt;/button&gt;
                  &lt;/div&gt;
                &lt;/&gt;
              )}

              {/* Previous notes if already reviewed */}
              {selectedCreation.status !== 'pending' &amp;&amp; selectedCreation.review_notes &amp;&amp; (
                &lt;div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"&gt;
                  &lt;label className="text-sm font-semibold text-yellow-800"&gt;📝 Notas de revisión&lt;/label&gt;
                  &lt;p className="text-yellow-700 mt-1"&gt;{selectedCreation.review_notes}&lt;/p&gt;
                &lt;/div&gt;
              )}
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}

      {/* Info */}
      &lt;div className="mt-6 bg-gradient-to-r from-mango/10 to-coral/10 rounded-2xl p-6"&gt;
        &lt;h3 className="font-bold text-carbon mb-2"&gt;✨ Sobre el Creator&lt;/h3&gt;
        &lt;ul className="text-sm text-gray-600 space-y-1"&gt;
          &lt;li&gt;• Las creaciones de Nacho aparecen aquí para tu revisión&lt;/li&gt;
          &lt;li&gt;• Al aprobar, el contenido queda disponible para el juego&lt;/li&gt;
          &lt;li&gt;• Puedes pedir ediciones con notas específicas&lt;/li&gt;
          &lt;li&gt;• El juego usa contenido aprobado en &lt;code className="bg-gray-200 px-1 rounded"&gt;/api/v1/game/content&lt;/code&gt;&lt;/li&gt;
        &lt;/ul&gt;
      &lt;/div&gt;
    &lt;/&gt;
  )
}

// Simple preview component (renders basic info since SVGs are complex)
function CreationPreview({ creation, large = false }: { creation: ContentCreation; large?: boolean }) {
  const size = large ? 'h-48' : 'h-24'
  const recipe = creation.recipe || {}
  
  const getPreviewColor = () => {
    // Try to get a meaningful color from recipe
    if (recipe.skinTone) {
      const tones: Record&lt;string, string&gt; = {
        pale: '#FFF0E6', light: '#FDEBD0', medium: '#E59866', tan: '#CA6F1E',
        brown: '#A04000', dark: '#6E2C00', olive: '#C5B358', golden: '#DAA520',
      }
      return tones[recipe.skinTone] || '#E59866'
    }
    if (recipe.color) {
      const colors: Record&lt;string, string&gt; = {
        green: '#4CAF50', red: '#F44336', yellow: '#FFEB3B', orange: '#FF9800',
        brown: '#795548', white: '#FAFAFA', purple: '#9C27B0', pink: '#E91E63',
      }
      return colors[recipe.color] || '#4CAF50'
    }
    if (recipe.material) {
      const materials: Record&lt;string, string&gt; = {
        wood: '#8D6E63', metal: '#78909C', plastic_red: '#E53935', plastic_blue: '#1E88E5',
      }
      return materials[recipe.material] || '#8D6E63'
    }
    return '#9E9E9E'
  }

  const typeIcons: Record&lt;string, string&gt; = {
    personajes: '👤',
    productos: '🥬',
    artefactos: '🪑',
    sitios: '📍',
  }

  return (
    &lt;div className={`${size} flex items-center justify-center rounded-lg`} style={{ backgroundColor: getPreviewColor() + '33' }}&gt;
      &lt;div className="text-center"&gt;
        &lt;div className={large ? 'text-6xl mb-2' : 'text-3xl'}&gt;
          {typeIcons[creation.content_type] || '📦'}
        &lt;/div&gt;
        {large &amp;&amp; (
          &lt;div className="text-sm font-medium text-gray-700"&gt;
            {Object.entries(recipe).slice(0, 3).map(([k, v]) =&gt; (
              &lt;span key={k} className="inline-block bg-white/80 px-2 py-0.5 rounded m-0.5 text-xs"&gt;
                {v}
              &lt;/span&gt;
            ))}
          &lt;/div&gt;
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  )
}

// ========== Parameters Section ==========
function ParametersSection() {
  const [categories, setCategories] = useState&lt;string[]&gt;([])
  const [selectedCategory, setSelectedCategory] = useState&lt;string&gt;('')
  const [parameters, setParameters] = useState&lt;Parameter[]&gt;([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingParam, setEditingParam] = useState&lt;Parameter | null&gt;(null)
  const [formData, setFormData] = useState&lt;CreateParameter&gt;({
    category: '',
    code: '',
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
  })

  useEffect(() =&gt; {
    loadCategories()
  }, [])

  useEffect(() =&gt; {
    if (selectedCategory) {
      loadParameters(selectedCategory)
    }
  }, [selectedCategory])

  const loadCategories = async () =&gt; {
    try {
      const data = await api.admin.parameters.list()
      const uniqueCategories = [...new Set(data.parameters.map(p =&gt; p.category))]
      setCategories(uniqueCategories)
      if (uniqueCategories.length &gt; 0 &amp;&amp; !selectedCategory) {
        setSelectedCategory(uniqueCategories[0])
      }
    } catch {
      setError('Error cargando categorías')
    }
  }

  const loadParameters = async (category: string) =&gt; {
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

  const handleCreate = () =&gt; {
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

  const handleEdit = (param: Parameter) =&gt; {
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

  const handleDelete = async (param: Parameter) =&gt; {
    if (!confirm(`Eliminar "${param.name}"?`)) return
    try {
      await api.admin.parameters.delete(param.id)
      loadParameters(selectedCategory)
    } catch {
      setError('Error eliminando parámetro')
    }
  }

  const handleSubmit = async (e: React.FormEvent) =&gt; {
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
    &lt;&gt;
      {error &amp;&amp; (
        &lt;div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center"&gt;
          &lt;span&gt;{error}&lt;/span&gt;
          &lt;button onClick={() =&gt; setError('')} className="text-red-700 hover:text-red-900 font-bold"&gt;×&lt;/button&gt;
        &lt;/div&gt;
      )}

      &lt;div className="bg-white rounded-2xl shadow-lg overflow-hidden"&gt;
        {/* Header */}
        &lt;div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50"&gt;
          &lt;h2 className="text-lg font-bold text-carbon"&gt;Parámetros del Sistema&lt;/h2&gt;
          &lt;button onClick={handleCreate} className="btn-primary-sm"&gt;
            + Nuevo
          &lt;/button&gt;
        &lt;/div&gt;

        {/* Category Tabs */}
        &lt;div className="flex border-b border-gray-200 overflow-x-auto bg-white"&gt;
          {categories.map(cat =&gt; (
            &lt;button
              key={cat}
              onClick={() =&gt; setSelectedCategory(cat)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'text-coral border-b-2 border-coral bg-coral/5'
                  : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
              }`}
            &gt;
              {cat}
            &lt;/button&gt;
          ))}
        &lt;/div&gt;

        {/* Table */}
        &lt;div className="overflow-x-auto"&gt;
          {loading ? (
            &lt;div className="p-8 text-center text-gray-500"&gt;Cargando...&lt;/div&gt;
          ) : parameters.length === 0 ? (
            &lt;div className="p-8 text-center text-gray-500"&gt;No hay parámetros en esta categoría&lt;/div&gt;
          ) : (
            &lt;table className="w-full"&gt;
              &lt;thead className="bg-gray-50 border-b"&gt;
                &lt;tr&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Icon&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Code&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Nombre&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Orden&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Activo&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-right text-sm font-semibold text-gray-600"&gt;Acciones&lt;/th&gt;
                &lt;/tr&gt;
              &lt;/thead&gt;
              &lt;tbody className="divide-y divide-gray-100"&gt;
                {parameters.map(param =&gt; (
                  &lt;tr key={param.id} className="hover:bg-gray-50 transition-colors"&gt;
                    &lt;td className="px-4 py-3 text-2xl"&gt;{param.icon || '—'}&lt;/td&gt;
                    &lt;td className="px-4 py-3 font-mono text-sm text-gray-600"&gt;{param.code}&lt;/td&gt;
                    &lt;td className="px-4 py-3 font-medium"&gt;{param.name}&lt;/td&gt;
                    &lt;td className="px-4 py-3 text-gray-600"&gt;{param.sort_order}&lt;/td&gt;
                    &lt;td className="px-4 py-3"&gt;
                      &lt;span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        param.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}&gt;
                        {param.is_active ? 'Sí' : 'No'}
                      &lt;/span&gt;
                    &lt;/td&gt;
                    &lt;td className="px-4 py-3 text-right"&gt;
                      &lt;button
                        onClick={() =&gt; handleEdit(param)}
                        className="btn-ghost text-agua hover:text-agua/80 mr-2"
                      &gt;
                        Editar
                      &lt;/button&gt;
                      &lt;button
                        onClick={() =&gt; handleDelete(param)}
                        className="btn-ghost text-red-500 hover:text-red-700"
                      &gt;
                        Eliminar
                      &lt;/button&gt;
                    &lt;/td&gt;
                  &lt;/tr&gt;
                ))}
              &lt;/tbody&gt;
            &lt;/table&gt;
          )}
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Modal */}
      {showModal &amp;&amp; (
        &lt;div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"&gt;
          &lt;div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"&gt;
            &lt;div className="border-b px-6 py-4 flex items-center justify-between"&gt;
              &lt;h3 className="text-lg font-bold text-carbon"&gt;
                {editingParam ? 'Editar Parámetro' : 'Nuevo Parámetro'}
              &lt;/h3&gt;
              &lt;button onClick={() =&gt; setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl"&gt;
                ×
              &lt;/button&gt;
            &lt;/div&gt;
            &lt;form onSubmit={handleSubmit} className="p-6 space-y-4"&gt;
              {!editingParam &amp;&amp; (
                &lt;&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Categoría&lt;/label&gt;
                    &lt;input
                      type="text"
                      value={formData.category}
                      onChange={e =&gt; setFormData({ ...formData, category: e.target.value })}
                      className="input"
                      required
                    /&gt;
                  &lt;/div&gt;
                  &lt;div&gt;
                    &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Código&lt;/label&gt;
                    &lt;input
                      type="text"
                      value={formData.code}
                      onChange={e =&gt; setFormData({ ...formData, code: e.target.value })}
                      className="input font-mono"
                      required
                    /&gt;
                  &lt;/div&gt;
                &lt;/&gt;
              )}
              &lt;div&gt;
                &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Nombre&lt;/label&gt;
                &lt;input
                  type="text"
                  value={formData.name}
                  onChange={e =&gt; setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                /&gt;
              &lt;/div&gt;
              &lt;div&gt;
                &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Icon (emoji)&lt;/label&gt;
                &lt;input
                  type="text"
                  value={formData.icon}
                  onChange={e =&gt; setFormData({ ...formData, icon: e.target.value })}
                  className="input"
                  placeholder="🌮"
                /&gt;
              &lt;/div&gt;
              &lt;div&gt;
                &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Descripción&lt;/label&gt;
                &lt;textarea
                  value={formData.description}
                  onChange={e =&gt; setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={2}
                /&gt;
              &lt;/div&gt;
              &lt;div&gt;
                &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Orden&lt;/label&gt;
                &lt;input
                  type="number"
                  value={formData.sort_order}
                  onChange={e =&gt; setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="input"
                /&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-end gap-3 pt-4"&gt;
                &lt;button type="button" onClick={() =&gt; setShowModal(false)} className="btn-outline-sm"&gt;
                  Cancelar
                &lt;/button&gt;
                &lt;button type="submit" className="btn-primary-sm"&gt;
                  {editingParam ? 'Guardar' : 'Crear'}
                &lt;/button&gt;
              &lt;/div&gt;
            &lt;/form&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      )}
    &lt;/&gt;
  )
}

// ========== Users Section ==========
function UsersSection() {
  const [users, setUsers] = useState&lt;Player[]&gt;([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() =&gt; {
    loadUsers()
  }, [])

  const loadUsers = async () =&gt; {
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

  const toggleAdmin = async (user: Player) =&gt; {
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

  const formatDate = (dateStr: string) =&gt; {
    return new Date(dateStr).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    &lt;&gt;
      {error &amp;&amp; (
        &lt;div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center"&gt;
          &lt;span&gt;{error}&lt;/span&gt;
          &lt;button onClick={() =&gt; setError('')} className="text-red-700 hover:text-red-900 font-bold"&gt;×&lt;/button&gt;
        &lt;/div&gt;
      )}

      &lt;div className="bg-white rounded-2xl shadow-lg overflow-hidden"&gt;
        &lt;div className="border-b border-gray-200 px-6 py-4 bg-gray-50"&gt;
          &lt;h2 className="text-lg font-bold text-carbon"&gt;Usuarios Registrados&lt;/h2&gt;
        &lt;/div&gt;

        &lt;div className="overflow-x-auto"&gt;
          {loading ? (
            &lt;div className="p-8 text-center text-gray-500"&gt;Cargando...&lt;/div&gt;
          ) : users.length === 0 ? (
            &lt;div className="p-8 text-center text-gray-500"&gt;
              {error ? 'El backend necesita implementar /admin/players' : 'No hay usuarios'}
            &lt;/div&gt;
          ) : (
            &lt;table className="w-full"&gt;
              &lt;thead className="bg-gray-50 border-b"&gt;
                &lt;tr&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Email&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Nombre&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Registro&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-left text-sm font-semibold text-gray-600"&gt;Admin&lt;/th&gt;
                  &lt;th className="px-4 py-3 text-right text-sm font-semibold text-gray-600"&gt;Acciones&lt;/th&gt;
                &lt;/tr&gt;
              &lt;/thead&gt;
              &lt;tbody className="divide-y divide-gray-100"&gt;
                {users.map(user =&gt; (
                  &lt;tr key={user.id} className="hover:bg-gray-50 transition-colors"&gt;
                    &lt;td className="px-4 py-3 font-medium"&gt;{user.email}&lt;/td&gt;
                    &lt;td className="px-4 py-3 text-gray-600"&gt;{user.display_name || '—'}&lt;/td&gt;
                    &lt;td className="px-4 py-3 text-gray-600"&gt;{formatDate(user.created_at)}&lt;/td&gt;
                    &lt;td className="px-4 py-3"&gt;
                      &lt;span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.is_admin ? 'bg-agua/20 text-agua' : 'bg-gray-100 text-gray-600'
                      }`}&gt;
                        {user.is_admin ? 'Admin' : 'Usuario'}
                      &lt;/span&gt;
                    &lt;/td&gt;
                    &lt;td className="px-4 py-3 text-right"&gt;
                      &lt;button
                        onClick={() =&gt; toggleAdmin(user)}
                        className={`btn-ghost ${user.is_admin ? 'text-red-500' : 'text-agua'}`}
                      &gt;
                        {user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                      &lt;/button&gt;
                    &lt;/td&gt;
                  &lt;/tr&gt;
                ))}
              &lt;/tbody&gt;
            &lt;/table&gt;
          )}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/&gt;
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
  const [config, setConfig] = useState&lt;AIConfig | null&gt;(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testResult, setTestResult] = useState&lt;TestResult | null&gt;(null)

  // Form state
  const [newApiKey, setNewApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState&lt;ProviderKey&gt;('anthropic')
  const [customUrl, setCustomUrl] = useState('')
  const [customModel, setCustomModel] = useState('')

  // Determine which provider preset to show based on current URL
  const detectProvider = (url: string): ProviderKey =&gt; {
    if (url.includes('anthropic.com')) return 'anthropic'
    if (url.includes('openai.com')) return 'openai'
    if (url.includes('groq.com')) return 'groq'
    if (url.includes('together.xyz')) return 'together'
    if (url.includes('localhost:11434')) return 'ollama'
    return 'custom'
  }

  // Get current models list based on provider
  const getCurrentModels = () =&gt; {
    if (selectedProvider === 'custom') return []
    return PROVIDER_PRESETS[selectedProvider].models
  }

  useEffect(() =&gt; {
    loadConfig()
  }, [])

  const loadConfig = async () =&gt; {
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

  const handleUpdateConfig = async (updates: Partial&lt;AIConfig&gt;) =&gt; {
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
      setTimeout(() =&gt; setSuccess(''), 3000)
    } catch {
      setError('Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  // Handle provider preset change
  const handleProviderChange = async (providerKey: ProviderKey) =&gt; {
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
  const handleSaveCustomUrl = async () =&gt; {
    if (!customUrl.trim()) return
    const providerType = customUrl.includes('anthropic.com') ? 'anthropic' : 'openai'
    await handleUpdateConfig({
      provider_type: providerType,
      provider_url: customUrl,
      model: customModel || 'custom-model',
    })
  }

  const handleSaveApiKey = async () =&gt; {
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
      setTimeout(() =&gt; setSuccess(''), 3000)
    } catch {
      setError('Error guardando API key')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () =&gt; {
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
      &lt;div className="bg-white rounded-2xl shadow-lg p-8 text-center"&gt;
        &lt;div className="text-4xl mb-4 animate-pulse"&gt;🤖&lt;/div&gt;
        &lt;p className="text-gray-500"&gt;Cargando configuración de IA...&lt;/p&gt;
      &lt;/div&gt;
    )
  }

  if (!config) {
    return (
      &lt;div className="bg-white rounded-2xl shadow-lg p-8 text-center"&gt;
        &lt;div className="text-4xl mb-4"&gt;❌&lt;/div&gt;
        &lt;p className="text-red-500"&gt;No se pudo cargar la configuración&lt;/p&gt;
        &lt;button onClick={loadConfig} className="btn-primary mt-4"&gt;Reintentar&lt;/button&gt;
      &lt;/div&gt;
    )
  }

  return (
    &lt;&gt;
      {error &amp;&amp; (
        &lt;div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center"&gt;
          &lt;span&gt;{error}&lt;/span&gt;
          &lt;button onClick={() =&gt; setError('')} className="text-red-700 hover:text-red-900 font-bold"&gt;×&lt;/button&gt;
        &lt;/div&gt;
      )}

      {success &amp;&amp; (
        &lt;div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4"&gt;
          {success}
        &lt;/div&gt;
      )}

      &lt;div className="grid grid-cols-1 lg:grid-cols-2 gap-6"&gt;
        {/* Status Card */}
        &lt;div className="bg-white rounded-2xl shadow-lg overflow-hidden"&gt;
          &lt;div className="border-b border-gray-200 px-6 py-4 bg-gray-50"&gt;
            &lt;h2 className="text-lg font-bold text-carbon"&gt;Estado del Sistema&lt;/h2&gt;
          &lt;/div&gt;
          &lt;div className="p-6"&gt;
            &lt;div className="flex items-center justify-between mb-6"&gt;
              &lt;div className="flex items-center gap-3"&gt;
                &lt;div className={`w-4 h-4 rounded-full ${config.is_ready ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} /&gt;
                &lt;span className="font-semibold text-lg"&gt;
                  {config.is_ready ? 'IA Lista' : 'IA No Configurada'}
                &lt;/span&gt;
              &lt;/div&gt;
              &lt;span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                config.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}&gt;
                {config.enabled ? 'Habilitada' : 'Deshabilitada'}
              &lt;/span&gt;
            &lt;/div&gt;

            &lt;div className="space-y-3 text-sm"&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;span className="text-gray-600"&gt;Proveedor:&lt;/span&gt;
                &lt;span className="font-semibold"&gt;
                  {PROVIDER_PRESETS[selectedProvider]?.name || 'Personalizado'}
                &lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;span className="text-gray-600"&gt;Modelo:&lt;/span&gt;
                &lt;span className="font-mono text-xs"&gt;{config.model}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;span className="text-gray-600"&gt;API Key:&lt;/span&gt;
                &lt;span className={config.has_api_key ? 'text-green-600' : 'text-red-600'}&gt;
                  {config.has_api_key ? '✓ Configurada' : '✗ No configurada'}
                &lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;span className="text-gray-600"&gt;Cache:&lt;/span&gt;
                &lt;span&gt;{config.cache_enabled ? `✓ ${config.cache_ttl_minutes} min` : '✗ Deshabilitado'}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex justify-between"&gt;
                &lt;span className="text-gray-600"&gt;Fallback:&lt;/span&gt;
                &lt;span&gt;{config.fallback_enabled ? '✓ Habilitado' : '✗ Deshabilitado'}&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="mt-6 pt-4 border-t"&gt;
              &lt;button
                onClick={handleTest}
                disabled={testing || !config.is_ready}
                className="btn-primary w-full"
              &gt;
                {testing ? '🔄 Probando...' : '🧪 Probar Conexión'}
              &lt;/button&gt;

              {testResult &amp;&amp; (
                &lt;div className={`mt-4 p-4 rounded-xl ${
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}&gt;
                  &lt;div className="flex items-center gap-2 mb-2"&gt;
                    &lt;span className="text-xl"&gt;{testResult.success ? '✅' : '❌'}&lt;/span&gt;
                    &lt;span className="font-semibold"&gt;{testResult.success ? 'Éxito' : 'Error'}&lt;/span&gt;
                  &lt;/div&gt;
                  &lt;p className="text-sm"&gt;{testResult.message}&lt;/p&gt;
                  {testResult.response_ms &amp;&amp; (
                    &lt;p className="text-xs text-gray-500 mt-1"&gt;Tiempo: {testResult.response_ms}ms&lt;/p&gt;
                  )}
                &lt;/div&gt;
              )}
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        {/* Configuration Card */}
        &lt;div className="bg-white rounded-2xl shadow-lg overflow-hidden"&gt;
          &lt;div className="border-b border-gray-200 px-6 py-4 bg-gray-50"&gt;
            &lt;h2 className="text-lg font-bold text-carbon"&gt;Configuración&lt;/h2&gt;
          &lt;/div&gt;
          &lt;div className="p-6 space-y-4"&gt;
            {/* Enable/Disable */}
            &lt;div className="flex items-center justify-between"&gt;
              &lt;label className="font-semibold"&gt;Habilitar IA&lt;/label&gt;
              &lt;button
                onClick={() =&gt; handleUpdateConfig({ enabled: !config.enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              &gt;
                &lt;div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.enabled ? 'translate-x-8' : 'translate-x-1'
                }`} /&gt;
              &lt;/button&gt;
            &lt;/div&gt;

            {/* Provider Selector */}
            &lt;div&gt;
              &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Proveedor&lt;/label&gt;
              &lt;select
                value={selectedProvider}
                onChange={e =&gt; handleProviderChange(e.target.value as ProviderKey)}
                disabled={saving}
                className="input"
              &gt;
                {Object.entries(PROVIDER_PRESETS).map(([key, preset]) =&gt; (
                  &lt;option key={key} value={key}&gt;{preset.name}&lt;/option&gt;
                ))}
              &lt;/select&gt;
            &lt;/div&gt;

            {/* Custom URL (only for custom provider) */}
            {selectedProvider === 'custom' &amp;&amp; (
              &lt;div className="space-y-2"&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;URL del API&lt;/label&gt;
                  &lt;input
                    type="text"
                    value={customUrl}
                    onChange={e =&gt; setCustomUrl(e.target.value)}
                    placeholder="https://api.example.com/v1/chat/completions"
                    className="input font-mono text-sm"
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Nombre del Modelo&lt;/label&gt;
                  &lt;input
                    type="text"
                    value={customModel}
                    onChange={e =&gt; setCustomModel(e.target.value)}
                    placeholder="model-name"
                    className="input font-mono text-sm"
                  /&gt;
                &lt;/div&gt;
                &lt;button
                  onClick={handleSaveCustomUrl}
                  disabled={saving || !customUrl.trim()}
                  className="btn-primary-sm w-full"
                &gt;
                  {saving ? 'Guardando...' : 'Guardar URL Personalizada'}
                &lt;/button&gt;
              &lt;/div&gt;
            )}

            {/* Model (for preset providers) */}
            {selectedProvider !== 'custom' &amp;&amp; (
              &lt;div&gt;
                &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;Modelo&lt;/label&gt;
                &lt;select
                  value={config.model}
                  onChange={e =&gt; handleUpdateConfig({ model: e.target.value })}
                  disabled={saving}
                  className="input"
                &gt;
                  {getCurrentModels().map(m =&gt; (
                    &lt;option key={m.value} value={m.value}&gt;{m.label}&lt;/option&gt;
                  ))}
                  {/* Also show current model if not in list */}
                  {!getCurrentModels().find(m =&gt; m.value === config.model) &amp;&amp; (
                    &lt;option value={config.model}&gt;{config.model} (actual)&lt;/option&gt;
                  )}
                &lt;/select&gt;
              &lt;/div&gt;
            )}

            {/* Max Tokens */}
            &lt;div&gt;
              &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;
                Max Tokens: {config.max_tokens}
              &lt;/label&gt;
              &lt;input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={config.max_tokens}
                onChange={e =&gt; handleUpdateConfig({ max_tokens: parseInt(e.target.value) })}
                disabled={saving}
                className="w-full"
              /&gt;
            &lt;/div&gt;

            {/* Temperature */}
            &lt;div&gt;
              &lt;label className="block text-sm font-semibold text-carbon mb-1"&gt;
                Temperatura: {config.temperature.toFixed(2)}
              &lt;/label&gt;
              &lt;input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={e =&gt; handleUpdateConfig({ temperature: parseFloat(e.target.value) })}
                disabled={saving}
                className="w-full"
              /&gt;
              &lt;div className="flex justify-between text-xs text-gray-500"&gt;
                &lt;span&gt;Preciso&lt;/span&gt;
                &lt;span&gt;Creativo&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;

            {/* API Key */}
            &lt;div className="pt-4 border-t"&gt;
              &lt;label className="block text-sm font-semibold text-carbon mb-2"&gt;API Key&lt;/label&gt;
              {showApiKeyInput ? (
                &lt;div className="space-y-2"&gt;
                  &lt;input
                    type="password"
                    value={newApiKey}
                    onChange={e =&gt; setNewApiKey(e.target.value)}
                    placeholder="sk-ant-api..."
                    className="input font-mono text-sm"
                  /&gt;
                  &lt;div className="flex gap-2"&gt;
                    &lt;button
                      onClick={handleSaveApiKey}
                      disabled={saving || !newApiKey.trim()}
                      className="btn-primary-sm flex-1"
                    &gt;
                      {saving ? 'Guardando...' : 'Guardar'}
                    &lt;/button&gt;
                    &lt;button
                      onClick={() =&gt; { setShowApiKeyInput(false); setNewApiKey('') }}
                      className="btn-outline-sm"
                    &gt;
                      Cancelar
                    &lt;/button&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              ) : (
                &lt;button
                  onClick={() =&gt; setShowApiKeyInput(true)}
                  className="btn-outline w-full"
                &gt;
                  {config.has_api_key ? '🔑 Cambiar API Key' : '🔑 Configurar API Key'}
                &lt;/button&gt;
              )}
            &lt;/div&gt;

            {/* Cache Toggle */}
            &lt;div className="flex items-center justify-between pt-4 border-t"&gt;
              &lt;label className="font-semibold"&gt;Cache&lt;/label&gt;
              &lt;button
                onClick={() =&gt; handleUpdateConfig({ cache_enabled: !config.cache_enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.cache_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              &gt;
                &lt;div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.cache_enabled ? 'translate-x-8' : 'translate-x-1'
                }`} /&gt;
              &lt;/button&gt;
            &lt;/div&gt;

            {/* Fallback Toggle */}
            &lt;div className="flex items-center justify-between"&gt;
              &lt;label className="font-semibold"&gt;Fallback (respuestas predefinidas)&lt;/label&gt;
              &lt;button
                onClick={() =&gt; handleUpdateConfig({ fallback_enabled: !config.fallback_enabled })}
                disabled={saving}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config.fallback_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              &gt;
                &lt;div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  config.fallback_enabled ? 'translate-x-8' : 'translate-x-1'
                }`} /&gt;
              &lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Info Card */}
      &lt;div className="mt-6 bg-gradient-to-r from-agua/10 to-mango/10 rounded-2xl p-6"&gt;
        &lt;h3 className="font-bold text-carbon mb-2"&gt;💡 Información&lt;/h3&gt;
        &lt;ul className="text-sm text-gray-600 space-y-1"&gt;
          &lt;li&gt;• &lt;strong&gt;Multi-proveedor:&lt;/strong&gt; Soporta OpenAI, Anthropic, Groq, Together, Ollama y más&lt;/li&gt;
          &lt;li&gt;• La API Key se almacena &lt;strong&gt;encriptada&lt;/strong&gt; en la base de datos&lt;/li&gt;
          &lt;li&gt;• El cache reduce costos reutilizando respuestas idénticas&lt;/li&gt;
          &lt;li&gt;• El fallback proporciona respuestas predefinidas si la IA falla&lt;/li&gt;
          &lt;li&gt;• &lt;strong&gt;Groq:&lt;/strong&gt; Ultra rápido y gratuito para desarrollo&lt;/li&gt;
          &lt;li&gt;• &lt;strong&gt;Ollama:&lt;/strong&gt; Ejecuta modelos localmente sin costo&lt;/li&gt;
        &lt;/ul&gt;
      &lt;/div&gt;
    &lt;/&gt;
  )
}
