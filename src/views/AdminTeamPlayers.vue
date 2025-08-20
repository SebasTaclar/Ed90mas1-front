<template>
  <div class="admin-team-players">
    <div class="header">
      <h1>Gestión de Jugadores</h1>
      <p v-if="userTeam" class="team-info">Equipo: {{ userTeam.name }}</p>
    </div>

    <!-- Botón para agregar jugador -->
    <div class="action-bar">
      <button @click="openCreateModal" class="btn-primary" :disabled="loading || !canCreatePlayers">
        <i class="fas fa-plus"></i> Agregar Jugador
      </button>
    </div>

    <!-- Spinner de carga -->
    <Spinner v-if="loading" />

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Tabla de jugadores -->
    <div v-if="!loading && players.length > 0" class="players-table-container">
      <table class="players-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nombre Completo</th>
            <th>Número</th>
            <th>Fecha de Nacimiento</th>
            <th>Cédula</th>
            <th>Teléfono</th>
            <th>EPS</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player.id">
            <td>
              <div class="player-photo">
                <img v-if="player.profilePhotoPath" :src="player.profilePhotoPath"
                  :alt="`Foto de ${player.firstName} ${player.lastName}`" class="photo-thumbnail"
                  @click="showPhotoModal(player)" />
                <div v-else class="no-photo">
                  <i class="fas fa-user"></i>
                </div>
              </div>
            </td>
            <td>{{ player.firstName }} {{ player.lastName }}</td>
            <td class="jersey-number">{{ player.jerseyNumber }}</td>
            <td>{{ formatDate(player.dateOfBirth) }}</td>
            <td>{{ player.identificationNumber || 'No registrado' }}</td>
            <td class="phone-number">{{ player.phone || 'No registrado' }}</td>
            <td class="eps-provider">{{ player.epsProvider || 'No registrado' }}</td>
            <td>
              <div class="action-buttons">
                <button @click="openEditModal(player)" class="btn-edit" title="Editar jugador">
                  <img src="/icons/edit.svg" alt="Editar" />
                </button>
                <button @click="confirmDelete(player)" class="btn-delete" title="Eliminar jugador">
                  <img src="/icons/trash.svg" alt="Eliminar" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensaje cuando no hay jugadores -->
    <div v-if="!loading && players.length === 0" class="no-players">
      <i class="fas fa-users"></i>
      <h3>No hay jugadores registrados</h3>
      <p>Agrega el primer jugador a tu equipo</p>
    </div>

    <!-- Modal para crear/editar jugador -->
    <UpsertPlayerPopup v-if="showPlayerModal" :player="selectedPlayer"
      :team-id="userTeam?.id || getCurrentTeamId() || undefined" @close="closePlayerModal" @save="handlePlayerSave" />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal v-if="showDeleteModal" title="Eliminar Jugador"
      :message="`¿Estás seguro que deseas eliminar al jugador ${playerToDelete?.firstName} ${playerToDelete?.lastName}?`"
      confirm-text="Eliminar" cancel-text="Cancelar" @confirm="handleDeletePlayer" @cancel="closeDeleteModal" />

    <!-- Modal para ver foto ampliada -->
    <div v-if="showPhotoViewer" class="photo-viewer-modal" @click="closePhotoViewer">
      <div class="photo-viewer-content" @click.stop>
        <button class="close-photo-viewer" @click="closePhotoViewer">
          <i class="fas fa-times"></i>
        </button>
        <img v-if="selectedPlayerPhoto?.profilePhotoPath" :src="selectedPlayerPhoto.profilePhotoPath"
          :alt="`Foto de ${selectedPlayerPhoto.firstName} ${selectedPlayerPhoto.lastName}`" class="photo-enlarged" />
        <p class="photo-player-name">{{ selectedPlayerPhoto?.firstName }} {{ selectedPlayerPhoto?.lastName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePlayers } from '@/composables/usePlayers'
import { useTeams } from '@/composables/useTeams'
import { getUserRole, getUserTeamId } from '@/utils/auth'
import { authService } from '@/services/api'
import type { Player } from '@/types/PlayerType'
import type { Team } from '@/types/TeamType'
import Spinner from '@/components/Spinner.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import UpsertPlayerPopup from '../components/UpsertPlayerPopup.vue'

// Composables
const {
  players,
  loading,
  error,
  loadPlayersByTeam,
  deletePlayer,
  clearError
} = usePlayers()

const { teams, loadTeams } = useTeams()

// Estados locales
const selectedPlayer = ref<Player | null>(null)
const showPlayerModal = ref(false)
const showDeleteModal = ref(false)
const playerToDelete = ref<Player | null>(null)
const showPhotoViewer = ref(false)
const selectedPlayerPhoto = ref<Player | null>(null)

// Computed para obtener el equipo del usuario
const userTeam = computed(() => {
  const teamId = getUserTeamId()
  return teamId ? teams.value.find(team => team.id === teamId) : null
})

// Computed para verificar si el usuario puede crear jugadores
const canCreatePlayers = computed(() => {
  const userRole = getUserRole()
  return userRole === 'team' || userRole === 'admin'
})

const getCurrentTeamId = () => {
  return getUserTeamId() || userTeam.value?.id || null
}

/**
 * Inicializar datos
 */
onMounted(async () => {
  const userRole = getUserRole()
  const teamId = getUserTeamId()

  // Solo cargar equipos una vez
  await loadTeams()

  // Si el usuario tiene rol 'team' y un teamId válido, cargar jugadores
  if (userRole === 'team' && teamId)
    await loadPlayersByTeam(teamId)
})

/**
 * Formatear fecha
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Abrir modal para crear jugador
 */
const openCreateModal = () => {
  selectedPlayer.value = null
  showPlayerModal.value = true
  clearError()
}

/**
 * Abrir modal para editar jugador
 */
const openEditModal = (player: Player) => {
  selectedPlayer.value = player
  showPlayerModal.value = true
  clearError()
}

/**
 * Cerrar modal de jugador
 */
const closePlayerModal = () => {
  showPlayerModal.value = false
  selectedPlayer.value = null
}

/**
 * Manejar guardado de jugador
 */
const handlePlayerSave = async () => {
  closePlayerModal()

  // Recargar jugadores para mostrar los cambios
  const teamId = getCurrentTeamId()
  if (teamId) {
    await loadPlayersByTeam(teamId)
  }
}

/**
 * Confirmar eliminación de jugador
 */
const confirmDelete = (player: Player) => {
  playerToDelete.value = player
  showDeleteModal.value = true
}

/**
 * Cerrar modal de confirmación de eliminación
 */
const closeDeleteModal = () => {
  showDeleteModal.value = false
  playerToDelete.value = null
}

/**
 * Eliminar jugador
 */
const handleDeletePlayer = async () => {
  if (!playerToDelete.value) return

  const result = await deletePlayer(playerToDelete.value.id)

  if (result.success) {
    // Recargar jugadores después de eliminar
    const teamId = getCurrentTeamId()
    if (teamId) {
      await loadPlayersByTeam(teamId)
    }
  }

  closeDeleteModal()
}

/**
 * Mostrar modal de foto ampliada
 */
const showPhotoModal = (player: Player) => {
  if (player.profilePhotoPath) {
    selectedPlayerPhoto.value = player
    showPhotoViewer.value = true
  }
}

/**
 * Cerrar modal de foto
 */
const closePhotoViewer = () => {
  showPhotoViewer.value = false
  selectedPlayerPhoto.value = null
}
</script>

<style scoped>
.admin-team-players {
  padding: 80px 20px 20px 20px;
  /* Padding superior para evitar que se tape con la barra */
  max-width: 1200px;
  margin: 0 auto;
  background: var(--app-bg-primary);
  min-height: 100vh;
}

.header h1 {
  color: var(--app-primary);
  margin-bottom: 10px;
}

.team-info {
  color: var(--app-text-muted);
  font-size: 1.1em;
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--app-primary);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: var(--app-primary-dark);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: var(--app-error);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.players-table-container {
  background: var(--app-surface);
  border-radius: 12px;
  box-shadow: var(--app-shadow);
  overflow: hidden;
  border: 1px solid var(--app-border);
}

.players-table {
  width: 100%;
  border-collapse: collapse;
}

.players-table th {
  background: var(--app-primary);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
}

.players-table td {
  padding: 16px;
  border-bottom: 1px solid var(--app-border);
  vertical-align: middle;
  color: var(--app-text-primary);
}

.players-table tr:hover {
  background: var(--app-hover-bg);
}

.player-photo {
  display: flex;
  justify-content: center;
  align-items: center;
}

.photo-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid var(--app-border);
  transition: all 0.3s ease;
}

.photo-thumbnail:hover {
  transform: scale(1.1);
  border-color: var(--app-primary);
}

.no-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--app-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-muted);
  font-size: 20px;
}

.jersey-number {
  font-weight: bold;
  color: var(--app-primary);
  text-align: center;
}

.phone-number {
  color: var(--app-text-primary);
  font-size: 0.9em;
}

.eps-provider {
  color: var(--app-text-primary);
  font-size: 0.9em;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-edit,
.btn-delete {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-edit {
  background: rgba(33, 150, 243, 0.1);
}

.btn-edit:hover {
  background: rgba(33, 150, 243, 0.2);
  transform: translateY(-2px);
}

.btn-delete {
  background: rgba(244, 67, 54, 0.1);
}

.btn-delete:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

.btn-edit img,
.btn-delete img {
  width: 20px;
  height: 20px;
  filter: var(--icon-filter, none);
}

/* Filtro para iconos en modo oscuro */
:root[data-theme='dark'] .btn-edit img {
  filter: brightness(0) saturate(100%) invert(54%) sepia(98%) saturate(991%) hue-rotate(186deg) brightness(101%) contrast(101%);
}

:root[data-theme='dark'] .btn-delete img {
  filter: brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(4456%) hue-rotate(346deg) brightness(99%) contrast(86%);
}

.no-players {
  text-align: center;
  padding: 60px 20px;
  color: var(--app-text-muted);
  background: var(--app-surface);
  border-radius: 12px;
  border: 1px solid var(--app-border);
}

.no-players i {
  font-size: 4em;
  margin-bottom: 20px;
  color: var(--app-text-muted);
  opacity: 0.5;
}

.no-players h3 {
  margin-bottom: 10px;
  color: var(--app-text-primary);
}

.no-players p {
  color: var(--app-text-muted);
}

/* Modal de foto ampliada */
.photo-viewer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.photo-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  text-align: center;
}

.close-photo-viewer {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: background 0.3s ease;
}

.close-photo-viewer:hover {
  background: rgba(255, 255, 255, 0.3);
}

.photo-enlarged {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.photo-player-name {
  color: white;
  font-size: 1.2em;
  margin-top: 15px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-team-players {
    padding: 70px 15px 15px 15px;
    /* Menos padding en móvil */
  }

  .players-table-container {
    overflow-x: auto;
  }

  .players-table {
    min-width: 800px;
  }

  .players-table th,
  .players-table td {
    padding: 12px 8px;
  }

  .photo-thumbnail {
    width: 40px;
    height: 40px;
  }

  .no-photo {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* Mejoras específicas para el contraste en modo oscuro */
:root[data-theme='dark'] .players-table th {
  background: var(--app-primary);
  color: white;
}

:root[data-theme='dark'] .players-table td {
  color: var(--app-text-primary);
}

:root[data-theme='dark'] .jersey-number {
  color: var(--app-primary-light);
}
</style>
