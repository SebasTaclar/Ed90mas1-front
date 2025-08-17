import { API_CONFIG } from '@/services/api/apiConfig'
import type {
  TournamentConfiguration,
  CreateTournamentConfigurationRequest,
  UpdateTournamentConfigurationRequest,
} from '@/types/TournamentType'

class TournamentConfigurationService {
  private baseUrl = `${API_CONFIG.baseURL}/tournaments`

  /**
   * Crear configuración de torneo
   */
  async createConfiguration(
    tournamentId: number,
    data: CreateTournamentConfigurationRequest,
  ): Promise<TournamentConfiguration> {
    try {
      const response = await fetch(`${this.baseUrl}/${tournamentId}/configuration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating tournament configuration:', error)
      throw error
    }
  }

  /**
   * Obtener configuración de torneo
   */
  async getConfiguration(tournamentId: number): Promise<TournamentConfiguration> {
    try {
      const response = await fetch(`${this.baseUrl}/${tournamentId}/configuration`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Configuración de torneo no encontrada')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching tournament configuration:', error)
      throw error
    }
  }

  /**
   * Actualizar configuración de torneo
   */
  async updateConfiguration(
    tournamentId: number,
    data: UpdateTournamentConfigurationRequest,
  ): Promise<TournamentConfiguration> {
    try {
      const response = await fetch(`${this.baseUrl}/${tournamentId}/configuration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating tournament configuration:', error)
      throw error
    }
  }

  /**
   * Eliminar configuración de torneo
   */
  async deleteConfiguration(tournamentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${tournamentId}/configuration`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting tournament configuration:', error)
      throw error
    }
  }

  /**
   * Verificar si un torneo tiene configuración
   */
  async hasConfiguration(tournamentId: number): Promise<boolean> {
    try {
      await this.getConfiguration(tournamentId)
      return true
    } catch (error) {
      return false
    }
  }
}

export default new TournamentConfigurationService()
