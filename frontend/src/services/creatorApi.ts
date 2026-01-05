const API_BASE = import.meta.env.VITE_API_URL || ''

// Tipos para configuración de agentes
export interface AgentOption {
    id: string
    category_id: string
    key: string
    label: string
    description: string
    icon: string
    value_type: string
    min_value?: number
    max_value?: number
    default_value?: string
    sort_order: number
    metadata: Record<string, unknown>
}

export interface AgentOptionCategory {
    id: string
    name: string
    description: string
    icon: string
    sort_order: number
    options: AgentOption[]
}

export interface ContentCreation {
    id: string
    content_type: string
    name: string
    description: string
    recipe: Record<string, string>
    creator_name: string
    created_at: string
    status: 'pending' | 'approved' | 'rejected' | 'needs_edit'
    times_used: number
}

export const creatorApi = {
    // Enviar nueva creación
    async submit(data: {
        content_type: string
        name: string
        description: string
        recipe: Record<string, string>
        creator_name?: string
    }): Promise<{ id: string }> {
        const res = await fetch(`${API_BASE}/api/v1/creator/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
                creator_name: data.creator_name || 'Nacho'
            })
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Error al enviar creación')
        }

        return res.json()
    },

    // Obtener mis creaciones
    async getMyCreations(creator = 'Nacho'): Promise<ContentCreation[]> {
        const res = await fetch(`${API_BASE}/api/v1/creator/my-creations?creator=${creator}`)
        if (!res.ok) throw new Error('Error al cargar creaciones')
        return res.json()
    },

    // Eliminar creación
    async deleteCreation(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/api/v1/creator/creations/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Error al eliminar')
        }
    },

    // Obtener opciones de configuración de agentes
    async getAgentOptions(): Promise<AgentOptionCategory[]> {
        const res = await fetch(`${API_BASE}/api/v1/creator/agent-options`)
        if (!res.ok) throw new Error('Error al cargar opciones de agente')
        return res.json()
    }
}
