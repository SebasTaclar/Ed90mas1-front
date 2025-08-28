import { ApiClient } from '@/services/api/apiConfig'
import type {
  TournamentConfiguration,
  CreateTournamentConfigurationRequest,
  UpdateTournamentConfigurationRequest,
} from '@/types/TournamentType'

class TournamentConfigurationService {
  private api = new ApiClient()

  /**
   * Crear configuración de torneo
   */
  async createConfiguration(
    tournamentId: number,
    data: CreateTournamentConfigurationRequest,
  ): Promise<TournamentConfiguration> {
    try {
      const response = await this.api.post<TournamentConfiguration>(
        `/tournaments/${tournamentId}/configuration`,
        data,
      )
      return response.data
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
      const response = await this.api.get<TournamentConfiguration>(
        `/tournaments/${tournamentId}/configuration`,
      )
      return response.data
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
      const response = await this.api.put<TournamentConfiguration>(
        `/tournaments/${tournamentId}/configuration`,
        data,
      )
      return response.data
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
      await this.api.delete(`/tournaments/${tournamentId}/configuration`)
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
    } catch {
      return false
    }
  }
}

export default new TournamentConfigurationService()
