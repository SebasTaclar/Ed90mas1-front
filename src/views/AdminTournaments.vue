<template>
  <main class="admin-main">
    <div class="admin-container">
      <!-- Header de Administración -->
      <div class="admin-header">
        <h1>Administración de Torneos</h1>
        <p>Gestiona los torneos del sistema Ed90+1</p>
      </div>

      <!-- Lista de Torneos -->
      <div class="tournaments-section">
        <div class="section-header">
          <h2>Gestionar Torneos</h2>
          <button @click="openCreateModal" class="btn-primary create-btn">
            <span class="btn-icon">🏆</span>
            Crear Nuevo Torneo
          </button>
        </div>

        <!-- Filtros -->
        <div class="filters">
          <div class="filter-group">
            <label for="statusFilter">Filtrar por estado:</label>
            <select id="statusFilter" v-model="selectedStatusFilter" class="form-select">
              <option value="">Todos los torneos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="categoryFilter">Filtrar por categoría:</label>
            <select id="categoryFilter" v-model="selectedCategoryFilter" class="form-select">
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de torneos existentes -->
      <div class="tournaments-list-section">
        <div class="section-header">
          <h2>Torneos Registrados</h2>
          <div class="tournaments-count">{{ tournaments?.length || 0 }} torneos</div>
        </div>

        <!-- Tabla de torneos -->
        <div class="tournaments-table-container">
          <table class="tournaments-table">
            <thead>
              <tr>
                <th>Torneo</th>
                <th>Descripción</th>
                <th>Categorías</th>
                <th>Fechas</th>
                <th>Equipos</th>
                <th>Configuración</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tournament in filteredTournaments" :key="tournament.id"
                :class="{ 'inactive': !tournament.isActive }">
                <td class="tournament-name">{{ tournament.name }}</td>
                <td class="description">{{ tournament.description }}</td>
                <td class="categories">
                  <div class="categories-list">
                    <span v-for="tournamentCategory in tournament.tournamentCategories" :key="tournamentCategory.id"
                      class="category-badge">
                      {{ tournamentCategory.category.name }}
                    </span>
                    <span v-if="!tournament.tournamentCategories || tournament.tournamentCategories.length === 0"
                      class="no-categories">
                      Sin categorías
                    </span>
                  </div>
                </td>
                <td class="dates">
                  <div class="date-range">
                    <div class="start-date">
                      <strong>Inicio:</strong> {{ formatDate(tournament.startDate) }}
                    </div>
                    <div class="end-date">
                      <strong>Fin:</strong> {{ formatDate(tournament.endDate) }}
                    </div>
                  </div>
                </td>
                <td class="teams-count">
                  <span class="teams-badge">
                    {{ getRegisteredTeamsCount(tournament.id) }} equipos
                  </span>
                </td>
                <td class="configuration-status">
                  <div v-if="tournament.configuration?.isConfigured" class="config-badge configured">
                    <span class="config-icon">⚙️</span>
                    <div class="config-details">
                      <div class="config-text">Configurado</div>
                      <div class="config-groups">{{ tournament.configuration.numberOfGroups }} grupo{{
                        tournament.configuration.numberOfGroups > 1 ? 's' : '' }}</div>
                    </div>
                  </div>
                  <div v-else class="config-badge not-configured">
                    <span class="config-icon">❌</span>
                    <div class="config-details">
                      <div class="config-text">Sin configurar</div>
                      <div class="config-groups">Requerido para cronogramas</div>
                    </div>
                  </div>
                </td>
                <td class="status">
                  <span class="status-badge" :class="tournament.isActive ? 'active' : 'inactive'">
                    {{ tournament.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="actions">
                  <button @click="openConfigModal(tournament)" class="btn-action config" title="Configurar torneo"
                    :class="{
                      'configured': tournament.configuration?.isConfigured,
                      'loading': loading && selectedTournament?.id === tournament.id
                    }" :disabled="loading && selectedTournament?.id === tournament.id">
                    <span v-if="loading && selectedTournament?.id === tournament.id">⏳ Cargando...</span>
                    <span v-else-if="tournament.configuration?.isConfigured">⚙️ Reconfigurar</span>
                    <span v-else>⚙️ Configurar</span>
                  </button>
                  <button @click="openEditModal(tournament)" class="btn-action edit" title="Editar torneo">
                    Editar
                  </button>
                  <button @click="toggleTournamentStatus(tournament)" class="btn-action"
                    :class="tournament.isActive ? 'deactivate' : 'activate'"
                    :title="tournament.isActive ? 'Desactivar torneo' : 'Activar torneo'">
                    {{ tournament.isActive ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button @click="confirmDelete(tournament)" class="btn-action delete" title="Eliminar torneo">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="(filteredTournaments?.length || 0) === 0" class="no-tournaments">
            <div class="no-tournaments-icon">🏆</div>
            <p>No hay torneos registrados {{ selectedStatusFilter
              || selectedCategoryFilter ? ' con los filtros aplicados' : ''
              }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar torneo -->
    <UpsertTournamentPopup v-if="showUpsertModal" :tournament-data="selectedTournament" :mode="modalMode"
      @close="closeUpsertModal" @save="handleTournamentSave" />

    <!-- Modal para configurar torneo -->
    <TournamentConfigurationPopup v-if="showConfigModal" :key="`tournament-${selectedTournament?.id || 'new'}`"
      :tournament-data="selectedTournament" :registered-teams="getRegisteredTeamsByTournament(selectedTournament?.id)"
      @close="closeConfigModal" @save="handleConfigurationSave" />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal v-if="showDeleteModal" :title="'Eliminar Torneo'"
      :message="`¿Estás seguro de que deseas eliminar el torneo '${tournamentToDelete?.name}'?`"
      :confirmText="'Eliminar'" :cancelText="'Cancelar'" @confirm="handleDelete" @cancel="closeDeleteModal" />

    <Spinner v-if="loading" />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Tournament, TournamentConfiguration } from '@/types/TournamentType'
import { useTournaments } from '@/composables/useTournaments'
import { useCategories } from '@/composables/useCategories'
import { useTeams } from '@/composables/useTeams'
import { useTournamentConfiguration } from '@/composables/useTournamentConfiguration'
import { useNotifications } from '@/utils/notifications'
import Spinner from '@/components/Spinner.vue'
import UpsertTournamentPopup from '@/components/UpsertTournamentPopup.vue'
import TournamentConfigurationPopup from '@/components/TournamentConfigurationPopup.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

defineOptions({
  name: 'AdminTournamentsView',
})

// Estado de la aplicación
const { tournaments, loadTournaments, deleteTournament, deleteTournamentBanner } = useTournaments()
const { categories, loadCategories } = useCategories()
const { teams, loadTeams } = useTeams()
const {
  createConfiguration,
  updateConfiguration,
} = useTournamentConfiguration()
const { success, error } = useNotifications()
const loading = ref(false)
const selectedStatusFilter = ref<string>('')
const selectedCategoryFilter = ref<string>('')

// Modal de creación/edición
const showUpsertModal = ref(false)
const selectedTournament = ref<Tournament | null>(null)
const modalMode = ref<'create' | 'edit'>('create')

// Modal de configuración
const showConfigModal = ref(false)

// Modal de eliminación
const showDeleteModal = ref(false)
const tournamentToDelete = ref<Tournament | null>(null)

// Computed properties
const filteredTournaments = computed(() => {
  let filtered = tournaments.value || []

  // Filtrar por estado
  if (selectedStatusFilter.value) {
    if (selectedStatusFilter.value === 'active') {
      filtered = filtered.filter(tournament => tournament.isActive)
    } else if (selectedStatusFilter.value === 'inactive') {
      filtered = filtered.filter(tournament => !tournament.isActive)
    }
  }

  // Filtrar por categoría
  if (selectedCategoryFilter.value) {
    filtered = filtered.filter(tournament =>
      tournament.tournamentCategories?.some(tc =>
        tc.categoryId.toString() === selectedCategoryFilter.value
      )
    )
  }

  return filtered
})

// Funciones
const loadData = async () => {
  await loadTournaments()
  await loadCategories()
  await loadTeams() // Agregamos la carga de equipos
}

const openCreateModal = () => {
  selectedTournament.value = null
  modalMode.value = 'create'
  showUpsertModal.value = true
}

const openEditModal = (tournament: Tournament) => {
  selectedTournament.value = { ...tournament }
  modalMode.value = 'edit'
  showUpsertModal.value = true
}

const closeUpsertModal = () => {
  showUpsertModal.value = false
  selectedTournament.value = null
}

const handleTournamentSave = async () => {
  await loadData() // Recargar la lista
  closeUpsertModal()
}

// Funciones para configuración de torneo
const openConfigModal = async (tournament: Tournament) => {
  // Limpiar selección anterior
  selectedTournament.value = null

  // Pequeña pausa para asegurar que el estado se limpia
  await new Promise(resolve => setTimeout(resolve, 10))

  // Asignar el nuevo torneo
  selectedTournament.value = { ...tournament }

  // El torneo seleccionado ya contiene toda la información necesaria
  // El popup se encargará de cargar la configuración existente si está presente

  showConfigModal.value = true
}

const closeConfigModal = () => {
  showConfigModal.value = false
  selectedTournament.value = null
}

const handleConfigurationSave = async (configuration: TournamentConfiguration) => {
  if (selectedTournament.value && selectedTournament.value.id) {
    try {
      loading.value = true
      let savedConfiguration: TournamentConfiguration

      // Determinar si es una configuración nueva o una actualización
      const isUpdating = selectedTournament.value.configuration?.isConfigured

      if (isUpdating) {
        savedConfiguration = await updateConfiguration(selectedTournament.value.id, {
          numberOfGroups: configuration.numberOfGroups,
          teamsPerGroup: configuration.teamsPerGroup,
          teamAssignments: configuration.teamAssignments || [],
          isConfigured: true
        })

        success(
          'Configuración actualizada',
          `Se actualizó la configuración del torneo "${selectedTournament.value.name}" con ${configuration.numberOfGroups} grupo${configuration.numberOfGroups > 1 ? 's' : ''}.`
        )
      } else {
        savedConfiguration = await createConfiguration(selectedTournament.value.id, {
          numberOfGroups: configuration.numberOfGroups,
          teamsPerGroup: configuration.teamsPerGroup,
          teamAssignments: configuration.teamAssignments || []
        })

        success(
          'Configuración creada',
          `Se configuró el torneo "${selectedTournament.value.name}" con ${configuration.numberOfGroups} grupo${configuration.numberOfGroups > 1 ? 's' : ''}.`
        )
      }

      // Actualizar el torneo local con la configuración guardada
      selectedTournament.value.configuration = savedConfiguration

      // Recargar la lista para reflejar los cambios
      await loadData()

    } catch (err) {
      console.error('Error saving configuration:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'

      error(
        'Error al guardar',
        `No se pudo guardar la configuración del torneo: ${errorMessage}`
      )
    } finally {
      loading.value = false
    }
  }
  closeConfigModal()
}

// Funciones para eliminación
const confirmDelete = (tournament: Tournament) => {
  tournamentToDelete.value = tournament
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  tournamentToDelete.value = null
}

const handleDelete = async () => {
  if (!tournamentToDelete.value) return

  try {
    loading.value = true

    // Primero intentar eliminar el banner si existe
    if (tournamentToDelete.value.bannerPath) {
      try {
        await deleteTournamentBanner(tournamentToDelete.value.id)
      } catch (bannerError) {
        console.warn('No se pudo eliminar el banner del torneo:', bannerError)
        // Continuamos con la eliminación del torneo aunque falle el banner
      }
    }

    // Luego eliminar el torneo
    await deleteTournament(tournamentToDelete.value.id)
    closeDeleteModal()
    await loadData() // Recargar la lista
  } catch (error) {
    console.error('Error deleting tournament:', error)
  } finally {
    loading.value = false
  }
}

const getRegisteredTeamsByTournament = (tournamentId: number | undefined) => {
  if (!tournamentId || !teams.value) return [];

  const registeredTeams = teams.value.filter(team => {
    return team.teamTournaments?.some(relation => relation.tournamentId === tournamentId) ||
      team.tournaments?.some(tournament => tournament.id === tournamentId);
  });

  return registeredTeams;
}

const getRegisteredTeamsCount = (tournamentId: number | undefined) => {
  if (!tournamentId || !teams.value) return 0;

  // Contar equipos reales registrados en este torneo específico
  const count = teams.value.filter(team => {
    return team.teamTournaments?.some(relation => relation.tournamentId === tournamentId) ||
      team.tournaments?.some(tournament => tournament.id === tournamentId);
  }).length;

  return count;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.admin-main {
  padding-top: 80px;
  min-height: 100vh;
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.5rem;
}

.admin-header p {
  font-size: 1.1rem;
  color: var(--app-text-secondary);
}

.create-tournament-section {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--app-border-color);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--app-text-primary);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 1.2rem;
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-primary:hover:not(:disabled) {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
  box-shadow: var(--app-shadow);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--app-text-primary);
  white-space: nowrap;
}

.form-select {
  padding: 0.5rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  min-width: 150px;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.tournaments-list-section {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
}

.tournaments-count {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-xl);
  font-size: 0.8rem;
  font-weight: 600;
}

.tournaments-table-container {
  overflow-x: auto;
}

.tournaments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.tournaments-table th,
.tournaments-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--app-border-color);
  color: var(--app-text-primary);
}

.tournaments-table th {
  background: var(--app-table-header-bg);
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tournaments-table tr:hover {
  background: var(--app-hover-bg);
}

.tournaments-table tr.inactive {
  opacity: 0.6;
}

.tournament-name {
  font-weight: 600;
  color: var(--primary-blue);
  min-width: 150px;
}

.description {
  max-width: 200px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.category-badge {
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-xl);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-badge.adultos_masculino {
  background: #3498db;
  color: var(--white);
}

.category-badge.adultos_femenino {
  background: #e91e63;
  color: var(--white);
}

.category-badge.infantil {
  background: #4caf50;
  color: var(--white);
}

.dates {
  min-width: 140px;
}

.date-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.start-date,
.end-date {
  color: var(--app-text-primary);
}

.teams-badge {
  background: var(--secondary-blue);
  color: var(--white);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.configuration-status {
  min-width: 150px;
}

.config-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
}

.config-badge.configured {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

:root[data-theme='dark'] .config-badge.configured {
  background: rgba(40, 167, 69, 0.15);
  border-color: rgba(40, 167, 69, 0.3);
}

.config-badge.not-configured {
  background: #f8d7da;
  border: 1px solid #f1aeb5;
}

:root[data-theme='dark'] .config-badge.not-configured {
  background: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.3);
}

.config-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.config-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.config-text {
  font-weight: 600;
  color: var(--app-text-primary);
}

.config-groups {
  font-size: 0.7rem;
  opacity: 0.8;
  color: var(--app-text-secondary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-xl);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-action.edit {
  background: var(--secondary-blue);
  color: var(--white);
}

.btn-action.edit:hover {
  background: var(--primary-blue);
}

.btn-action.deactivate {
  background: #f8d7da;
  color: #721c24;
}

.btn-action.activate {
  background: #d4edda;
  color: #155724;
}

.btn-action.config {
  background: #e2e6ea;
  color: #495057;
}

.btn-action.config.configured {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.btn-action.config.loading {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  cursor: wait;
}

.btn-action.config:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.no-tournaments {
  text-align: center;
  padding: 3rem;
  color: var(--app-text-secondary);
}

.no-tournaments-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .filters {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .tournaments-table th,
  .tournaments-table td {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-action {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
