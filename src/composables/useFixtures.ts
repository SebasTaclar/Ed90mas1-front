import { ref } from 'vue'
import { matchesService, type Match, type CreateMatchRequest } from '@/services/matchesService'
import { fixturesService } from '@/services/fixturesService'
import type { FixtureConfiguration, Fixture } from '@/types/FixtureType'

// Función para convertir Fixture a Match
const fixtureToMatch = (fixture: Fixture): Match => ({
  id: fixture.id,
  tournamentId: fixture.tournamentId,
  groupId: fixture.groupId ? parseInt(fixture.groupId.toString()) : undefined,
  homeTeamId: fixture.homeTeamId,
  awayTeamId: fixture.awayTeamId,
  scheduledDate: `${fixture.date}T${fixture.time}`,
  venue: fixture.venue,
  status:
    fixture.status === 'scheduled'
      ? 'scheduled'
      : fixture.status === 'completed'
        ? 'completed'
        : fixture.status === 'cancelled'
          ? 'cancelled'
          : 'scheduled',
  homeScore: fixture.homeScore,
  awayScore: fixture.awayScore,
  createdAt: fixture.createdAt,
  updatedAt: fixture.updatedAt,
})

export const useFixtures = () => {
  const matches = ref<Match[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createMultipleMatches = async (
    matchesData: CreateMatchRequest[],
  ): Promise<Match[] | null> => {
    loading.value = true
    error.value = null

    try {
      const createdMatches = await matchesService.createMultipleMatches(matchesData)
      matches.value = createdMatches
      return createdMatches
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creando partidos'
      console.error('Error creating matches:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const loadTournamentMatches = async (tournamentId: number): Promise<Match[] | null> => {
    loading.value = true
    error.value = null

    try {
      // Usar directamente el servicio de matches (fixtures GET no existe)
      const tournamentMatches = await matchesService.getTournamentMatches(tournamentId)
      matches.value = tournamentMatches
      return tournamentMatches
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error cargando partidos'
      console.error('Error loading matches:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const saveFixtures = async (configuration: FixtureConfiguration): Promise<Match[] | null> => {
    loading.value = true
    error.value = null

    try {
      // Usar el endpoint de fixtures POST para guardar la configuración completa
      const fixtureResponse = await fixturesService.saveFixtures(configuration)

      // Convertir la respuesta de fixtures a matches para mantener compatibilidad
      const convertedMatches = fixtureResponse.fixtures.map(fixtureToMatch)
      matches.value = convertedMatches
      return convertedMatches
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error guardando cronograma'
      console.error('Error saving fixtures:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteMatches = async (tournamentId: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      // Usar el endpoint de fixtures DELETE
      await fixturesService.deleteFixtures(tournamentId)
      matches.value = []
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error eliminando partidos'
      console.error('Error deleting matches:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    matches,
    loading,
    error,
    createMultipleMatches,
    loadTournamentMatches,
    saveFixtures,
    deleteMatches,
  }
}
