import { API_CONFIG } from './api/apiConfig'

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

    return response.json()
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

    return response.json()
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

    return response.json()
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

    return response.json()
  }
}

export const matchEventsService = new MatchEventsService()
