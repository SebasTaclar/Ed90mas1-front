import { ref, computed } from 'vue'
import type {
  TournamentConfiguration,
  CreateTournamentConfigurationRequest,
  UpdateTournamentConfigurationRequest,
  TeamAssignment,
} from '@/types/TournamentType'
import tournamentConfigurationService from '@/utils/tournamentConfigurationService'
import { useNotifications } from '@/utils/notifications'

export const useTournamentConfiguration = () => {
  const configuration = ref<TournamentConfiguration | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get notifications composable
  const { addNotification } = useNotifications()

  // Computed properties
  const hasConfiguration = computed(() => configuration.value?.isConfigured ?? false)
  const numberOfGroups = computed(() => configuration.value?.numberOfGroups ?? 0)
  const teamsPerGroup = computed(() => configuration.value?.teamsPerGroup ?? 0)

  /**
   * Cargar configuración de un torneo
   */
  const loadConfiguration = async (tournamentId: number) => {
    loading.value = true
    error.value = null

    try {
      configuration.value = await tournamentConfigurationService.getConfiguration(tournamentId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      configuration.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear configuración de torneo
   */
  const createConfiguration = async (
    tournamentId: number,
    data: CreateTournamentConfigurationRequest,
  ) => {
    loading.value = true
    error.value = null

    try {
      configuration.value = await tournamentConfigurationService.createConfiguration(
        tournamentId,
        data,
      )

      addNotification({
        type: 'success',
        title: 'Configuración Creada',
        message: 'La configuración del torneo se creó exitosamente',
      })

      return configuration.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear configuración'
      error.value = errorMessage

      addNotification({
        type: 'error',
        title: 'Error de Configuración',
        message: errorMessage,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar configuración de torneo
   */
  const updateConfiguration = async (
    tournamentId: number,
    data: UpdateTournamentConfigurationRequest,
  ) => {
    loading.value = true
    error.value = null

    try {
      configuration.value = await tournamentConfigurationService.updateConfiguration(
        tournamentId,
        data,
      )

      addNotification({
        type: 'success',
        title: 'Configuración Actualizada',
        message: 'La configuración del torneo se actualizó exitosamente',
      })

      return configuration.value
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar configuración'
      error.value = errorMessage

      addNotification({
        type: 'error',
        title: 'Error de Actualización',
        message: errorMessage,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Eliminar configuración de torneo
   */
  const deleteConfiguration = async (tournamentId: number) => {
    loading.value = true
    error.value = null

    try {
      await tournamentConfigurationService.deleteConfiguration(tournamentId)
      configuration.value = null

      addNotification({
        type: 'success',
        title: 'Configuración Eliminada',
        message: 'La configuración del torneo se eliminó exitosamente',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar configuración'
      error.value = errorMessage

      addNotification({
        type: 'error',
        title: 'Error de Eliminación',
        message: errorMessage,
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Generar asignaciones automáticas de equipos a grupos
   */
  const generateAutoAssignments = (teamIds: number[], numberOfGroups: number): TeamAssignment[] => {
    const assignments: TeamAssignment[] = []
    const groupNames = Array.from({ length: numberOfGroups }, (_, i) => String.fromCharCode(65 + i)) // A, B, C, etc.

    teamIds.forEach((teamId, index) => {
      const groupIndex = index % numberOfGroups
      assignments.push({
        teamId,
        groupName: groupNames[groupIndex],
      })
    })

    return assignments
  }

  /**
   * Generar asignaciones aleatorias de equipos a grupos
   */
  const generateRandomAssignments = (
    teamIds: number[],
    numberOfGroups: number,
  ): TeamAssignment[] => {
    const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5)
    return generateAutoAssignments(shuffledTeams, numberOfGroups)
  }

  /**
   * Validar configuración antes de enviar
   */
  const validateConfiguration = (
    data: CreateTournamentConfigurationRequest,
    totalTeams: number,
  ): string[] => {
    const errors: string[] = []

    if (data.numberOfGroups < 1) {
      errors.push('El número de grupos debe ser mayor a 0')
    }

    if (data.numberOfGroups > totalTeams) {
      errors.push('El número de grupos no puede ser mayor al número de equipos')
    }

    if (data.teamsPerGroup < 1) {
      errors.push('El número de equipos por grupo debe ser mayor a 0')
    }

    if (data.numberOfGroups > 8) {
      errors.push('El número máximo de grupos es 8')
    }

    if (data.teamAssignments && data.teamAssignments.length > totalTeams) {
      errors.push('No se pueden asignar más equipos de los que están registrados')
    }

    return errors
  }

  /**
   * Resetear estado
   */
  const reset = () => {
    configuration.value = null
    loading.value = false
    error.value = null
  }

  return {
    // Estado
    configuration,
    loading,
    error,

    // Computed
    hasConfiguration,
    numberOfGroups,
    teamsPerGroup,

    // Métodos
    loadConfiguration,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    generateAutoAssignments,
    generateRandomAssignments,
    validateConfiguration,
    reset,
  }
}
