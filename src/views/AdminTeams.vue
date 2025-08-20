<template>
  <main class="admin-main">
    <div class="admin-container">
      <!-- Header de Administración -->
      <div class="admin-header">
        <h1>Administración de Equipos</h1>
        <p>Gestiona los equipos registrados en el torneo</p>
      </div>

      <!-- Sección de gestión de equipos -->
      <div class="create-team-section">
        <div class="section-header">
          <h2>Gestionar Equipos</h2>
          <div class="section-icon">⚽</div>
        </div>

        <!-- Acciones -->
        <div class="actions-section">
          <button @click="openCreateModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            Nuevo Equipo
          </button>
        </div>
      </div>

      <!-- Lista de equipos existentes -->
      <div class="teams-list-section">
        <div class="section-header">
          <h2>Equipos Registrados</h2>
          <div class="teams-count">{{ teams.length }} equipos</div>
        </div>

        <!-- Filtros -->
        <div class="filters">
          <div class="filter-group">
            <span>Total: {{ teams.length }} equipos</span>
          </div>
        </div>

        <!-- Tabla de equipos -->
        <div class="teams-table-container">
          <table class="teams-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Capitán</th>
                <th>Email</th>
                <th>Torneos</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in filteredTeams" :key="team.id" :class="{ 'inactive': !team.isActive }">
                <td class="team-name">
                  <div class="team-info">
                    <img v-if="team.logoPath" :src="team.logoPath" alt="Logo" class="team-logo" />
                    <span class="team-name-text">{{ team.name }}</span>
                  </div>
                </td>
                <td class="captain">{{ team.user.name }}</td>
                <td class="email">{{ team.user.email }}</td>
                <td class="tournaments">
                  <div class="tournaments-list">
                    <span v-if="team.tournaments.length === 0" class="no-tournaments">Sin torneos</span>
                    <span v-else v-for="tournament in team.tournaments" :key="tournament.id" class="tournament-badge"
                      :title="tournament.name">
                      {{ tournament.name }}
                    </span>
                  </div>
                </td>
                <td class="status">
                  <span class="status-badge" :class="team.isActive ? 'active' : 'inactive'">
                    {{ team.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="date">{{ formatDate(team.createdAt) }}</td>
                <td class="actions">
                  <div class="actions-group">
                    <button @click="openEditModal(team)" class="btn-action edit" title="Editar equipo">
                      Editar
                    </button>
                    <button @click="confirmDelete(team)" class="btn-action delete" title="Eliminar equipo">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredTeams.length === 0" class="no-teams">
            <div class="no-teams-icon">🏆</div>
            <p>No hay equipos registrados{{ selectedCategoryFilter ? ' en esta categoría' : '' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar equipo --> <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal v-if="showDeleteModal" :title="'Eliminar Equipo'"
      :message="`¿Estás seguro de que deseas eliminar el equipo '${teamToDelete?.name}'?`" :confirmText="'Eliminar'"
      :cancelText="'Cancelar'" @confirm="handleDelete" @cancel="closeDeleteModal" />

    <!-- Modal para crear/editar equipo -->
    <UpsertTeamPopup v-if="showUpsertModal" :team-data="selectedTeam" :mode="modalMode" @close="closeUpsertModal"
      @save="handleTeamSave" />

    <Spinner v-if="loading" />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Team, CreateTeamRequest } from '@/types/TeamType'
import type { Category } from '@/types/CategoryType'
import type { Tournament } from '@/types/TournamentType'
import { useTeams } from '@/composables/useTeams'
import { useCategories } from '@/composables/useCategories'
import { useTournaments } from '@/composables/useTournaments'
import Spinner from '@/components/Spinner.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import UpsertTeamPopup from '@/components/UpsertTeamPopup.vue'

defineOptions({
  name: 'AdminTeamsView',
})

// Estado de la aplicación
const { teams, loadTeams, createTeam, updateTeam, deleteTeam, deleteTeamLogo, loading } = useTeams()
const { categories, loadCategories } = useCategories()
const { tournaments, loadTournaments } = useTournaments()
const selectedCategoryFilter = ref<string>('')

// Modal de creación/edición
const showUpsertModal = ref(false)
const selectedTeam = ref<Team | null>(null)
const modalMode = ref<'create' | 'edit'>('create')

// Modal de eliminación
const showDeleteModal = ref(false)
const teamToDelete = ref<Team | null>(null)

// Computed properties
const filteredTeams = computed(() => {
  if (!selectedCategoryFilter.value) {
    return teams.value
  }
  // TODO: Filtrar por categoría cuando implementemos categorías en teams
  return teams.value
})

const availableTournaments = computed(() => {
  return tournaments.value || []
})

// Funciones
const loadData = async () => {
  await Promise.all([
    loadTeams(),
    loadCategories(),
    loadTournaments()
  ])
}

const openCreateModal = () => {
  selectedTeam.value = null
  modalMode.value = 'create'
  showUpsertModal.value = true
}

const openEditModal = (team: Team) => {
  selectedTeam.value = { ...team }
  modalMode.value = 'edit'
  showUpsertModal.value = true
}

const closeUpsertModal = () => {
  showUpsertModal.value = false
  selectedTeam.value = null
}

const handleTeamSave = async () => {
  await loadData() // Recargar la lista
  closeUpsertModal()
}

const confirmDelete = (team: Team) => {
  teamToDelete.value = team
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  teamToDelete.value = null
}

const handleDelete = async () => {
  if (!teamToDelete.value) return

  try {
    // Primero intentar eliminar el logo si existe
    if (teamToDelete.value.logoPath) {
      try {
        await deleteTeamLogo(teamToDelete.value.id)
      } catch (logoError) {
        console.warn('No se pudo eliminar el logo del equipo:', logoError)
        // Continuamos con la eliminación del equipo aunque falle el logo
      }
    }

    // Luego eliminar el equipo
    const result = await deleteTeam(teamToDelete.value.id)
    if (!result.success)
      alert('Error al eliminar el equipo: ' + result.message)

  } catch (error) {
    console.error('Error deleting team:', error)
    alert('Error interno al eliminar el equipo')
  } finally {
    closeDeleteModal()
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadData()
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

.create-team-section {
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

.actions-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.section-icon {
  font-size: 1.5rem;
  background: var(--secondary-blue);
  color: var(--white);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.create-team-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-normal);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: var(--danger);
}

.error-message {
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Botones específicos para este componente */
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

.btn-secondary {
  background: transparent;
  color: var(--app-text-primary);
  border: 2px solid var(--app-border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-secondary:hover {
  background: var(--app-hover-bg);
  border-color: var(--primary-blue);
}

.teams-list-section {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
}

.teams-count {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-xl);
  font-size: 0.8rem;
  font-weight: 600;
}

.filters {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--app-input-bg);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--app-text-primary);
}

.teams-table-container {
  overflow-x: auto;
}

.teams-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  min-width: 1200px;
  /* Ancho mínimo para asegurar espaciado adecuado */
}

.teams-table th,
.teams-table td {
  padding: 0.75rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--app-border-color);
  color: var(--app-text-primary);
  white-space: nowrap;
}

/* Definir anchos específicos para las columnas */
.teams-table th:nth-child(1),
.teams-table td:nth-child(1) {
  width: 20%;
  min-width: 200px;
}

/* Capitán */
.teams-table th:nth-child(2),
.teams-table td:nth-child(2) {
  width: 15%;
  min-width: 120px;
}

/* Email */
.teams-table th:nth-child(3),
.teams-table td:nth-child(3) {
  width: 18%;
  min-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Torneos */
.teams-table th:nth-child(4),
.teams-table td:nth-child(4) {
  width: 15%;
  min-width: 150px;
}

/* Estado */
.teams-table th:nth-child(5),
.teams-table td:nth-child(5) {
  width: 10%;
  min-width: 100px;
}

/* Fecha */
.teams-table th:nth-child(6),
.teams-table td:nth-child(6) {
  width: 12%;
  min-width: 110px;
}

/* Acciones */
.teams-table th:nth-child(7),
.teams-table td:nth-child(7) {
  width: 10%;
  min-width: 120px;
}

.teams-table th {
  background: var(--app-table-header-bg);
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.teams-table tr:hover {
  background: var(--app-hover-bg);
}

.teams-table tr.inactive {
  opacity: 0.6;
}

.team-name {
  font-weight: 600;
  color: var(--primary-blue);
}

.username {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.password {
  font-family: 'Courier New', monospace;
  position: relative;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity var(--transition-normal);
}

.toggle-password:hover {
  opacity: 1;
}

.category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-xl);
  font-size: 0.8rem;
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

.no-teams {
  text-align: center;
  padding: 3rem;
  color: var(--app-text-secondary);
}

.no-teams-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--app-border-color);
}

.modal-header h3 {
  color: var(--primary-blue);
  font-size: 1.3rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--app-text-secondary);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background var(--transition-normal);
}

.close-btn:hover {
  background: var(--app-hover-bg);
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.credentials {
  background: var(--app-input-bg);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  margin: 1rem 0;
  text-align: left;
  border: 1px solid var(--app-border-color);
}

.credential-item {
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
  color: var(--app-text-primary);
}

.note {
  font-size: 0.9rem;
  color: var(--app-text-secondary);
  font-style: italic;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid var(--app-border-color);
  text-align: center;
}

/* Estilos para torneos */
.tournaments-group {
  grid-column: 1 / -1;
  /* Ocupa toda la fila */
}

.tournaments-selection {
  margin-top: 0.5rem;
}

.no-tournaments-message {
  padding: 1rem;
  background: var(--app-input-bg);
  border-radius: var(--border-radius-md);
  color: var(--app-text-secondary);
  font-style: italic;
  text-align: center;
  border: 1px solid var(--app-border-color);
}

.tournaments-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tournament-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--app-input-bg);
}

.tournament-checkbox:hover {
  border-color: var(--primary-blue);
  background: var(--app-hover-bg);
}

.tournament-checkbox input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.checkbox-text strong {
  color: var(--app-text-primary);
  font-size: 0.95rem;
  font-weight: 600;
}

.checkbox-text small {
  color: var(--app-text-secondary);
  font-size: 0.85rem;
  line-height: 1.3;
}

.tournament-dates {
  font-size: 0.8rem;
  color: var(--app-text-primary);
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Estilos para la columna de torneos en la tabla */
.tournaments {
  max-width: 150px;
}

.tournaments-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 80px;
  overflow-y: auto;
}

.tournament-badge {
  display: inline-block;
  padding: 0.15rem 0.4rem;
  background: var(--primary-blue);
  color: var(--white);
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  box-shadow: var(--app-shadow);
}

.no-tournaments {
  color: var(--app-text-secondary);
  font-style: italic;
  font-size: 0.75rem;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.team-logo {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  object-fit: cover;
  border: 2px solid var(--app-border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.team-name-text {
  font-weight: 600;
  color: var(--app-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-action {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin: 0.1rem;
  display: inline-block;
}

.btn-action.delete {
  background: var(--danger);
  color: var(--white);
}

.btn-action.delete:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.btn-action.edit {
  background: var(--secondary-purple);
  color: white;
}

.btn-action.edit:hover {
  background: #6f42c1;
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-container {
    max-width: 100%;
    padding: 1rem;
  }

  .teams-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .teams-table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .teams-table {
    min-width: 800px;
  }

  .teams-table th,
  .teams-table td {
    padding: 0.4rem 0.3rem;
    font-size: 0.75rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .team-logo {
    width: 40px;
    height: 40px;
  }

  .actions-group {
    flex-direction: row;
    gap: 0.25rem;
  }

  .btn-action {
    font-size: 0.65rem;
    padding: 0.25rem 0.4rem;
  }
}
</style>
