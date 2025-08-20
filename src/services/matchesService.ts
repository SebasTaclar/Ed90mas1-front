import { API_CONFIG } from '@/services/api/apiConfig'

export interface Match {
  id?: number
  tournamentId: number
  groupId?: number
  homeTeamId: number
  awayTeamId: number
  matchDate?: string // Campo del backend
  scheduledDate?: string // Campo para la UI
  location?: string // Campo del backend
  venue?: string // Campo para la UI
  status?: 'not_started' | 'in_progress_1_half' | 'finished_1_half' | 'in_progress_2_half' | 'finished_2_half' | 'penalties' | 'finished' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  homeScore?: number
  awayScore?: number
  round?: string
  matchNumber?: number
  startTime?: string
  endTime?: string
  createdAt?: string
  updatedAt?: string
  // Jugadores asistentes - formato: { "teamId": [playerId1, playerId2, ...] }
  attendingPlayers?: Record<string, number[]>
  // Objetos completos que vienen del backend
  tournament?: {
    id: number
    name: string
  }
  group?: {
    id: number
    groupName: string
  }
  homeTeam?: {
    id: number
    name: string
    logoPath?: string
  }
  awayTeam?: {
    id: number
    name: string
    logoPath?: string
  }
  matchEvents?: any[]
}

export interface CreateMatchRequest {
  tournamentId: number
  groupId?: number
  homeTeamId: number
  awayTeamId: number
  matchDate: Date
  location?: string
  round?: string
  matchNumber: number
}

export interface MatchesResponse {
  matches: Match[]
  total: number
}

const API_BASE = API_CONFIG.baseURL

export const matchesService = {
  // Crear un partido individual
  async createMatch(match: CreateMatchRequest): Promise<Match> {
    try {
      const response = await fetch(`${API_BASE}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(match),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error creating match')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
    }
  },

  // Crear múltiples partidos (fixture masivo)
  async createMultipleMatches(matches: CreateMatchRequest[]): Promise<Match[]> {
    try {
      const createdMatches: Match[] = []

      // Crear partidos uno por uno (por ahora, hasta que el backend tenga endpoint masivo)
      for (const match of matches) {
        const createdMatch = await this.createMatch(match)
        createdMatches.push(createdMatch)
      }

      return createdMatches
    } catch (error) {
      console.error('Error creating multiple matches:', error)
      throw error
    }
  },

  // Obtener partidos de un torneo
  async getTournamentMatches(tournamentId: number): Promise<Match[]> {
    try {
      const url = `${API_BASE}/matches?tournamentId=${tournamentId}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Si es 404, devolver array vacío en lugar de error
        if (response.status === 404) {
          return []
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error fetching matches')
      }

      const data = await response.json()

      // El backend puede devolver { success, message, data, timestamp, statusCode } o directamente un array
      const matches = data.data || data || []

      return matches
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        // Error de red, devolver array vacío
        return []
      }
      console.error('Error fetching matches:', error)
      throw error
    }
  },

  // Obtener un partido específico por ID
  async getMatchById(matchId: number): Promise<Match | null> {
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error fetching match')
      }

      const data = await response.json()
      return data.data || data
    } catch (error) {
      console.error('Error fetching match:', error)
      return null
    }
  },

  // Actualizar un partido
  async updateMatch(matchId: number, updates: Partial<Match>): Promise<Match> {
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error updating match')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating match:', error)
      throw error
    }
  },

  // Eliminar un partido
  async deleteMatch(matchId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error deleting match')
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      throw error
    }
  },

  // Eliminar todos los partidos de un torneo
  async deleteTournamentMatches(tournamentId: number): Promise<void> {
    try {
      const matches = await this.getTournamentMatches(tournamentId)

      // Eliminar cada partido individualmente
      for (const match of matches) {
        if (match.id) {
          await this.deleteMatch(match.id)
        }
      }
    } catch (error) {
      console.error('Error deleting tournament matches:', error)
      throw error
    }
  },
}
