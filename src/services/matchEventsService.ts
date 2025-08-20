import { API_CONFIG } from './api/apiConfig'

// Interfaz para la respuesta estándar de la API
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface MatchEvent {
  id: number
  matchId: number
  playerId: number
  teamId: number
  eventType: MatchEventType
  minute: number
  extraTime?: number
  description?: string
  assistPlayerId?: number
  createdAt: Date
}

export enum MatchEventType {
  GOAL = 'goal',
  YELLOW_CARD = 'yellow_card',
  RED_CARD = 'red_card',
  SUBSTITUTION = 'substitution',
  OWN_GOAL = 'own_goal',
  PENALTY_GOAL = 'penalty_goal',
  PENALTY_MISS = 'penalty_miss',
}

export interface CreateMatchEventRequest {
  matchId: number
  playerId: number
  teamId: number
  eventType: MatchEventType
  minute: number
  extraTime?: number
  description?: string
  assistPlayerId?: number
}

export interface UpdateMatchEventRequest {
  eventType?: MatchEventType
  minute?: number
  extraTime?: number
  description?: string
  assistPlayerId?: number
}

export interface MatchEventWithRelations extends MatchEvent {
  match?: {
    id: number
    homeTeamId: number
    awayTeamId: number
  }
  player: {
    id: number
    firstName: string
    lastName: string
    jerseyNumber?: number
  }
  team: {
    id: number
    name: string
  }
  assistPlayer?: {
    id: number
    firstName: string
    lastName: string
    jerseyNumber?: number
  }
}

class MatchEventsService {
  private baseUrl = API_CONFIG.baseURL

  // Obtener todos los eventos de un partido
  async getMatchEvents(matchId: number): Promise<MatchEventWithRelations[]> {
    const response = await fetch(`${this.baseUrl}/matches/${matchId}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error getting match events: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    // La API devuelve los datos envueltos en ApiResponseBuilder.success()
    // Estructura: { success: boolean, data: any, message: string }
    if (apiResponse.success && apiResponse.data) {
      // Asegurar que data sea un array
      if (Array.isArray(apiResponse.data)) {
        return apiResponse.data
      } else {
        console.warn('API data is not an array:', apiResponse.data)
        return []
      }
    } else {
      // Si no hay éxito o no hay data, retornar array vacío
      console.warn('API response does not contain successful data:', apiResponse)
      return []
    }
  }

  // Crear un nuevo evento de partido
  async createMatchEvent(eventData: CreateMatchEventRequest): Promise<MatchEvent> {
    const response = await fetch(`${this.baseUrl}/matches/${eventData.matchId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error creating match event: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    // La API devuelve los datos envueltos en ApiResponseBuilder.success()
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data
    } else {
      throw new Error(`Failed to create match event: ${apiResponse.message || 'Unknown error'}`)
    }
  }

  // Actualizar un evento existente
  async updateMatchEvent(
    matchId: number,
    eventId: number,
    eventData: UpdateMatchEventRequest,
  ): Promise<MatchEvent> {
    const response = await fetch(`${this.baseUrl}/matches/${matchId}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error updating match event: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    // La API devuelve los datos envueltos en ApiResponseBuilder.success()
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data
    } else {
      throw new Error(`Failed to update match event: ${apiResponse.message || 'Unknown error'}`)
    }
  }

  // Eliminar un evento
  async deleteMatchEvent(matchId: number, eventId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/matches/${matchId}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error deleting match event: ${errorData.message || response.statusText}`)
    }

    // Para DELETE, la API podría devolver solo un mensaje de éxito
    // No es necesario procesar el contenido de la respuesta
  }

  // Obtener eventos por tipo
  async getEventsByType(
    eventType: MatchEventType,
    matchId: number,
  ): Promise<MatchEventWithRelations[]> {
    const response = await fetch(
      `${this.baseUrl}/matches/${matchId}/events?eventType=${eventType}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error getting events by type: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    if (apiResponse.success && apiResponse.data) {
      return Array.isArray(apiResponse.data) ? apiResponse.data : []
    } else {
      return []
    }
  }

  // Obtener eventos por jugador
  async getEventsByPlayer(playerId: number, matchId: number): Promise<MatchEventWithRelations[]> {
    const response = await fetch(`${this.baseUrl}/matches/${matchId}/events?playerId=${playerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error getting events by player: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    if (apiResponse.success && apiResponse.data) {
      return Array.isArray(apiResponse.data) ? apiResponse.data : []
    } else {
      return []
    }
  }

  // Obtener eventos por equipo
  async getEventsByTeam(teamId: number): Promise<MatchEventWithRelations[]> {
    const response = await fetch(`${this.baseUrl}/matches/events?teamId=${teamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error getting events by team: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    if (apiResponse.success && apiResponse.data) {
      return Array.isArray(apiResponse.data) ? apiResponse.data : []
    } else {
      return []
    }
  }

  // Obtener eventos en un rango de tiempo
  async getEventsInTimeRange(
    matchId: number,
    startMinute: number,
    endMinute: number,
  ): Promise<MatchEventWithRelations[]> {
    const response = await fetch(
      `${this.baseUrl}/matches/${matchId}/events?startMinute=${startMinute}&endMinute=${endMinute}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(
        `Error getting events in time range: ${errorData.message || response.statusText}`,
      )
    }

    const apiResponse = await response.json()

    if (apiResponse.success && apiResponse.data) {
      return Array.isArray(apiResponse.data) ? apiResponse.data : []
    } else {
      return []
    }
  }

  // Obtener un evento específico
  async getMatchEvent(matchId: number, eventId: number): Promise<MatchEventWithRelations> {
    const response = await fetch(`${this.baseUrl}/matches/${matchId}/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(`Error getting match event: ${errorData.message || response.statusText}`)
    }

    const apiResponse = await response.json()

    // La API devuelve los datos envueltos en ApiResponseBuilder.success()
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data
    } else {
      throw new Error(`Failed to get match event: ${apiResponse.message || 'Unknown error'}`)
    }
  }
}

export const matchEventsService = new MatchEventsService()
