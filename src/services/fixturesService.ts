import { API_CONFIG } from '@/services/api/apiConfig'
import type {
  Fixture,
  FixtureConfiguration,
  FixtureGenerationRequest,
  FixtureResponse,
} from '@/types/FixtureType'

const API_BASE = API_CONFIG.baseURL

export const fixturesService = {
  // Generar fixtures para un torneo
  async generateFixtures(request: FixtureGenerationRequest): Promise<FixtureResponse> {
    try {
      const response = await fetch(
        `${API_BASE}/tournaments/${request.tournamentId}/matches/fixtures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error generating fixtures')
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating fixtures:', error)
      throw error
    }
  },

  // Guardar/actualizar fixtures personalizados
  async saveFixtures(configuration: FixtureConfiguration): Promise<FixtureResponse> {
    try {
      const response = await fetch(
        `${API_BASE}/tournaments/${configuration.tournamentId}/matches/fixtures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(configuration),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error saving fixtures')
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving fixtures:', error)
      throw error
    }
  },

  // Eliminar fixtures de un torneo
  async deleteFixtures(tournamentId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/tournaments/${tournamentId}/matches/fixtures`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error deleting fixtures')
      }
    } catch (error) {
      console.error('Error deleting fixtures:', error)
      throw error
    }
  },
}
