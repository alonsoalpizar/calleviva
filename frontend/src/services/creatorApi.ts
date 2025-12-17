const API_BASE = import.meta.env.VITE_API_URL || ''

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
        const res = await fetch(`${API_BASE}/api/creator/submit`, {
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
        const res = await fetch(`${API_BASE}/api/creator/my-creations?creator=${creator}`)
        if (!res.ok) throw new Error('Error al cargar creaciones')
        return res.json()
    }
}
