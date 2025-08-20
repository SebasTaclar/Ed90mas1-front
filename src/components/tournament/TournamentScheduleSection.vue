<template>
  <div class="tournament-schedule">
    <div class="section-header">
      <h2> Cronograma de Partidos</h2>
      <p>Calendario completo ordenado por fecha</p>
    </div>

    <!-- Filtros simplificados -->
    <div class="filters-container">
      <div class="filter-group">
        <label>Equipo:</label>
        <div class="filter-select">
          <select v-model="selectedTeam">
            <option value="">Todos los equipos</option>
            <option v-for="team in availableTeams" :key="team" :value="team">{{ team }}</option>
          </select>
        </div>
      </div>

      <div class="filter-group">
        <label>Fecha:</label>
        <div class="filter-select date-select">
          <select v-model="selectedDate">
            <option value="">Todas las fechas</option>
            <option v-for="date in availableDates" :key="date" :value="date">
              {{ formatDateForSelect(date) }}
            </option>
          </select>
        </div>
      </div>

      <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">
        Limpiar
      </button>
    </div>

    <!-- Estadísticas rápidas y acciones -->
    <div class="stats-and-actions">
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-number">{{ filteredMatches.length }}</span>
          <span class="stat-label">Partidos{{ hasActiveFilters ? ' filtrados' : '' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pendingMatches }}</span>
          <span class="stat-label">Por jugar</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ completedMatches }}</span>
          <span class="stat-label">Finalizados</span>
        </div>
      </div>

      <div class="actions-row">
        <button @click="openCreateMatchModal" class="btn-create-match">
          <span class="btn-icon">⚽</span>
          <span class="btn-text">Agregar Partido Eliminatorio</span>
        </button>
      </div>
    </div>

    <!-- Tabla de partidos -->
    <div class="matches-table-container">
      <div v-if="matchesLoading" class="loading">
        <div class="spinner"></div>
        <p>Cargando partidos...</p>
      </div>

      <div v-else-if="filteredMatches.length === 0" class="no-matches">
        <p>No hay partidos{{ hasActiveFilters ? ' que coincidan con los filtros' : '' }}</p>
      </div>

      <div v-else class="matches-table">
        <div class="table-header">
          <div class="col-date">Fecha</div>
          <div class="col-teams">Equipos</div>
          <div class="col-round">Fase</div>
          <div class="col-location">Lugar</div>
          <div class="col-status">Estado</div>
          <div class="col-actions">Acciones</div>
        </div>

        <div v-for="match in filteredMatches" :key="match.id" class="table-row" :class="getRowClass(match)">
          <div class="col-date">
            <div v-if="isEditing(match.id!, 'date')" class="edit-date-container">
              <div class="edit-inputs">
                <input v-model="editValues.date" type="date" class="edit-input date-input" :disabled="isUpdating" />
                <input v-model="editValues.time" type="time" class="edit-input time-input" :disabled="isUpdating" />
              </div>
              <div class="edit-actions">
                <button @click="saveChanges" class="save-btn" :disabled="isUpdating">
                  <span v-if="isUpdating">⏳</span>
                  <span v-else>✓</span>
                </button>
                <button @click="cancelEditing" class="cancel-btn" :disabled="isUpdating">✕</button>
              </div>
            </div>
            <div v-else class="date-info">
              <span class="date">{{ formatDate(match.matchDate || match.scheduledDate) }}</span>
              <span class="time">{{ formatTime(match.matchDate || match.scheduledDate) }}</span>
            </div>
          </div>

          <div class="col-teams">
            <div class="teams-info">
              <div class="team home">
                <img :src="match.homeTeam?.logoPath || '/images/logo.png'" :alt="match.homeTeam?.name" class="team-logo"
                  @error="handleImageError">
                <span class="team-name">{{ match.homeTeam?.name || 'TBD' }}</span>
              </div>
              <span class="vs">VS</span>
              <div class="team away">
                <img :src="match.awayTeam?.logoPath || '/images/logo.png'" :alt="match.awayTeam?.name" class="team-logo"
                  @error="handleImageError">
                <span class="team-name">{{ match.awayTeam?.name || 'TBD' }}</span>
              </div>
            </div>
          </div>

          <div class="col-round">
            <div class="round-info">
              <span v-if="match.round" class="round-badge" :class="getRoundClass(match.round)">
                {{ match.round }}
              </span>
              <span v-else class="round-default">Fase de Grupos</span>
            </div>
          </div>

          <div class="col-location">
            <div v-if="isEditing(match.id!, 'location')" class="edit-location-container">
              <div class="edit-inputs">
                <input v-model="editValues.location" type="text" placeholder="Ingrese el lugar"
                  class="edit-input location-input" :disabled="isUpdating" />
              </div>
              <div class="edit-actions">
                <button @click="saveChanges" class="save-btn" :disabled="isUpdating">
                  <span v-if="isUpdating">⏳</span>
                  <span v-else>✓</span>
                </button>
                <button @click="cancelEditing" class="cancel-btn" :disabled="isUpdating">✕</button>
              </div>
            </div>
            <div v-else class="location-info">
              <span class="location-text">{{ match.location || 'Por definir' }}</span>
            </div>
          </div>

          <div class="col-status">
            <span class="status-badge" :class="getStatusClass(match.status)">
              {{ getStatusText(match.status) }}
            </span>
          </div>

          <div class="col-actions">
            <div class="action-buttons">
              <button @click="startEditing(match.id!, 'date')" class="edit-btn date-edit"
                :disabled="editingMatch !== null" title="Editar fecha y hora">
                📅
              </button>
              <button @click="startEditing(match.id!, 'location')" class="edit-btn location-edit"
                :disabled="editingMatch !== null" title="Editar lugar">
                📍
              </button>
              <!-- Botón eliminar solo para partidos de fase eliminatoria (NO Fase de grupos) -->
              <button v-if="match.round && match.round.trim() !== '' && match.round !== 'Fase de grupos'"
                @click="confirmDeleteMatch(match)" class="edit-btn delete-btn"
                :disabled="editingMatch !== null || isDeletingMatch" title="Eliminar partido eliminatorio">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear partido eliminatorio -->
    <CreateMatchPopup :is-visible="showCreateMatchModal" :available-teams="tournamentTeams"
      @close="closeCreateMatchModal" @submit="handleCreateMatch" />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal v-if="showDeleteConfirm" :title="deleteModalTitle" :message="deleteModalMessage"
      @confirm="handleDeleteConfirm" @cancel="cancelDelete" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Match } from '@/services/matchesService'
import { matchesService } from '@/services/matchesService'
import CreateMatchPopup from '@/components/CreateMatchPopup.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

interface Props {
  matches: Match[]
  matchesLoading: boolean
  tournamentId: number
  tournamentTeams: Array<{
    id: number
    name: string
    logoPath?: string | null
  }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'match-updated': []
}>()

// Estado de filtros
const selectedTeam = ref('')
const selectedDate = ref('')

// Estado de edición
const editingMatch = ref<number | null>(null)
const editingField = ref<'date' | 'location' | null>(null)
const editValues = ref({
  date: '',
  time: '',
  location: ''
})
const isUpdating = ref(false)
const isDeletingMatch = ref(false)

// Estado de resaltado
const highlightedMatch = ref<number | null>(null)

// Estado del modal de creación de partidos
const showCreateMatchModal = ref(false)

// Estado del modal de confirmación para eliminar
const showDeleteConfirm = ref(false)
const deleteModalTitle = ref('Confirmar Eliminación')
const deleteModalMessage = ref('¿Está seguro de que desea eliminar este elemento?')
const matchToDelete = ref<number | null>(null)

// Computed properties
const availableTeams = computed(() => {
  const teams = new Set<string>()
  props.matches.forEach(match => {
    if (match.homeTeam?.name) teams.add(match.homeTeam.name)
    if (match.awayTeam?.name) teams.add(match.awayTeam.name)
  })
  return Array.from(teams).sort()
})

// Fechas disponibles (fechas que tienen partidos)
const availableDates = computed(() => {
  const dates = new Set<string>()
  props.matches.forEach(match => {
    const matchDate = match.matchDate || match.scheduledDate
    if (matchDate) {
      const d = new Date(matchDate)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      dates.add(dateStr)
    }
  })
  return Array.from(dates).sort()
})

const filteredMatches = computed(() => {
  let filtered = [...props.matches]

  // Filtro por equipo
  if (selectedTeam.value) {
    filtered = filtered.filter(match =>
      match.homeTeam?.name === selectedTeam.value ||
      match.awayTeam?.name === selectedTeam.value
    )
  }

  // Filtro por fecha
  if (selectedDate.value) {
    filtered = filtered.filter(match => {
      const matchDate = match.matchDate || match.scheduledDate
      if (!matchDate) return false

      // Formatear la fecha del partido para comparar
      const matchLocalDate = new Date(matchDate)
      const matchDateStr = `${matchLocalDate.getFullYear()}-${String(matchLocalDate.getMonth() + 1).padStart(2, '0')}-${String(matchLocalDate.getDate()).padStart(2, '0')}`

      return matchDateStr === selectedDate.value
    })
  }

  // Ordenar por fecha (más próximo primero)
  return filtered.sort((a, b) => {
    const dateA = a.matchDate || a.scheduledDate || ''
    const dateB = b.matchDate || b.scheduledDate || ''
    return dateA.localeCompare(dateB)
  })
})

const hasActiveFilters = computed(() => {
  return selectedTeam.value !== '' || selectedDate.value !== ''
})

const pendingMatches = computed(() => {
  return filteredMatches.value.filter(match =>
    match.status === 'scheduled' || !match.status
  ).length
})

const completedMatches = computed(() => {
  return filteredMatches.value.filter(match =>
    match.status === 'completed'
  ).length
})

const clearFilters = () => {
  selectedTeam.value = ''
  selectedDate.value = ''
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Fecha TBD'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatTime = (dateString?: string) => {
  if (!dateString) return '--:--'
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateForSelect = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  const formatted = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return isToday ? `${formatted} (Hoy)` : formatted
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'scheduled':
      return 'Programado'
    case 'in_progress':
      return 'En juego'
    case 'completed':
      return 'Finalizado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Programado'
  }
}

const getStatusClass = (status?: string) => {
  switch (status) {
    case 'scheduled':
      return 'status-scheduled'
    case 'in_progress':
      return 'status-live'
    case 'completed':
      return 'status-completed'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'status-scheduled'
  }
}

const getRowClass = (match: Match) => {
  const classes: string[] = []

  // Clases basadas en el estado
  switch (match.status) {
    case 'in_progress':
      classes.push('row-live')
      break
    case 'completed':
      classes.push('row-completed')
      break
  }

  // Clase de resaltado
  if (highlightedMatch.value === match.id) {
    classes.push('row-highlighted')
  }

  return classes.join(' ')
}

const getRoundClass = (round: string) => {
  const roundLower = round.toLowerCase()

  if (roundLower.includes('final') && !roundLower.includes('semi') && !roundLower.includes('cuart') && !roundLower.includes('octav') && !roundLower.includes('dieciseis')) {
    return 'round-final'
  } else if (roundLower.includes('semifinal')) {
    return 'round-semifinal'
  } else if (roundLower.includes('cuart')) {
    return 'round-quarterfinal'
  } else if (roundLower.includes('octav')) {
    return 'round-octavos'
  } else if (roundLower.includes('dieciseis')) {
    return 'round-dieciseisavos'
  } else {
    return 'round-default'
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/logo.png'
}

// Funciones del modal de creación
const openCreateMatchModal = () => {
  showCreateMatchModal.value = true
}

const closeCreateMatchModal = () => {
  showCreateMatchModal.value = false
}

interface CreateMatchForm {
  phase: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  location: string
}

const handleCreateMatch = async (formData: CreateMatchForm) => {
  try {
    // Crear objeto Date a partir de la fecha y hora
    const matchDateTime = new Date(`${formData.date}T${formData.time}:00`)

    // Generar número de partido único (podría basarse en la cantidad actual + 1)
    const matchNumber = props.matches.length + 1

    const matchData = {
      tournamentId: props.tournamentId,
      homeTeamId: parseInt(formData.homeTeam),
      awayTeamId: parseInt(formData.awayTeam),
      matchDate: matchDateTime,
      location: formData.location || undefined,
      round: formData.phase,
      matchNumber: matchNumber
    }

    await matchesService.createMatch(matchData)
    emit('match-updated')
    closeCreateMatchModal()

  } catch (error) {
    console.error('Error creating match:', error)
    alert('Error al crear el partido: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  }
}

// Funciones de edición
const startEditing = (matchId: number, field: 'date' | 'location') => {
  const match = props.matches.find(m => m.id === matchId)
  if (!match) return

  editingMatch.value = matchId
  editingField.value = field

  if (field === 'date') {
    const matchDate = new Date(match.matchDate || match.scheduledDate || '')

    // Extraer fecha local sin conversión UTC para evitar desfase de día
    const year = matchDate.getFullYear()
    const month = String(matchDate.getMonth() + 1).padStart(2, '0')
    const day = String(matchDate.getDate()).padStart(2, '0')
    const hours = String(matchDate.getHours()).padStart(2, '0')
    const minutes = String(matchDate.getMinutes()).padStart(2, '0')

    editValues.value.date = `${year}-${month}-${day}`
    editValues.value.time = `${hours}:${minutes}`
  } else if (field === 'location') {
    editValues.value.location = match.location || ''
  }
}

const cancelEditing = () => {
  editingMatch.value = null
  editingField.value = null
  editValues.value = { date: '', time: '', location: '' }
}

const saveChanges = async () => {
  if (!editingMatch.value || !editingField.value) return

  const match = props.matches.find(m => m.id === editingMatch.value)
  if (!match?.id) {
    alert('Error: No se pudo identificar el partido a actualizar')
    return
  }

  // Guardar el ID del match para resaltarlo después
  const matchIdToHighlight = match.id

  try {
    isUpdating.value = true

    const updateData: Partial<Match> = {}

    if (editingField.value === 'date') {
      // Combinar fecha y hora para crear el datetime completo
      const dateTime = `${editValues.value.date}T${editValues.value.time || '00:00'}:00`
      updateData.matchDate = dateTime
    } else if (editingField.value === 'location') {
      updateData.location = editValues.value.location
    }

    await matchesService.updateMatch(match.id, updateData)

    // Emitir evento para recargar los datos
    emit('match-updated')

    cancelEditing()

    // Activar resaltado después de un pequeño delay para permitir que se recarguen los datos
    setTimeout(() => {
      highlightedMatch.value = matchIdToHighlight
      // Remover resaltado después de 2 segundos
      setTimeout(() => {
        highlightedMatch.value = null
      }, 2000)
    }, 100)

  } catch (error) {
    console.error('Error updating match:', error)
    alert('Error al actualizar el partido: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    isUpdating.value = false
  }
}

const isEditing = (matchId: number, field: 'date' | 'location') => {
  return editingMatch.value === matchId && editingField.value === field
}

// Funciones de eliminación
const confirmDeleteMatch = (match: Match) => {
  const teamNames = `${match.homeTeam?.name || 'TBD'} vs ${match.awayTeam?.name || 'TBD'}`

  deleteModalTitle.value = `Eliminar Partido - ${match.round || 'Fase Eliminatoria'}`
  deleteModalMessage.value = `¿Está seguro de que desea eliminar este partido?\n\n${teamNames}\n\nEsta acción no se puede deshacer.`
  matchToDelete.value = match.id!
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (matchToDelete.value) {
    await deleteMatch(matchToDelete.value)
  }
  showDeleteConfirm.value = false
  matchToDelete.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  matchToDelete.value = null
}

const deleteMatch = async (matchId: number) => {
  try {
    isDeletingMatch.value = true

    await matchesService.deleteMatch(matchId)

    emit('match-updated')
  } catch (error) {
    console.error('Error deleting match:', error)
    alert('Error al eliminar el partido: ' + (error instanceof Error ? error.message : 'Error desconocido'))
  } finally {
    isDeletingMatch.value = false
  }
}
</script>

<style scoped>
.tournament-schedule {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
}

.section-header {
  margin-bottom: 2rem;
  text-align: center;
}

.section-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--app-text-primary);
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--app-text-secondary);
  font-size: 1rem;
}

/* Filtros */
.filters-container {
  display: flex;
  gap: 1.5rem;
  align-items: end;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--tertiary-blue);
  box-shadow: var(--shadow-medium);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 200px;
}

.filter-group label {
  font-weight: 600;
  color: var(--white);
  font-size: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.filter-select,
.filter-input {
  padding: 0.75rem;
  border: 2px solid var(--tertiary-blue);
  border-radius: var(--border-radius-md);
  background-color: var(--primary-blue) !important;
  color: var(--white) !important;
  font-size: 0.9rem;
  transition: all var(--transition-normal);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  padding-right: 2.5rem;
  min-width: 240px;
}

/* Estilos específicos para select dentro del contenedor filter-select */
.filter-select select {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--white);
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  width: 100%;
  cursor: pointer;
  appearance: none;
}

.filter-select select:focus {
  outline: none;
}

.filter-select select option {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}

.filter-select select option:hover {
  background: var(--tertiary-blue);
  color: var(--white);
}

.filter-select:focus-within,
.filter-input:focus {
  outline: none;
  border-color: var(--secondary-blue);
  box-shadow: 0 0 0 3px rgba(60, 154, 240, 0.2);
  background-color: var(--tertiary-blue) !important;
  transform: translateY(-1px);
}

.filter-select:hover,
.filter-input:hover {
  background-color: var(--tertiary-blue) !important;
  transform: translateY(-1px);
  border-color: var(--secondary-blue);
}

/* Icono personalizado para el dropdown de fecha */
.filter-select.date-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3e%3c/rect%3e%3cline x1='16' y1='2' x2='16' y2='6'%3e%3c/line%3e%3cline x1='8' y1='2' x2='8' y2='6'%3e%3c/line%3e%3cline x1='3' y1='10' x2='21' y2='10'%3e%3c/line%3e%3c/svg%3e") !important;
}

/* Flecha para dropdown normal */
.filter-select:not(.date-select) {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
}

.clear-btn {
  padding: 0.75rem 1.5rem;
  background: var(--secondary-blue);
  color: var(--white);
  border: 2px solid var(--secondary-blue);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  height: fit-content;
}

.clear-btn:hover {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

/* Estadísticas y acciones */
.stats-and-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.stat-item {
  text-align: center;
  padding: 1rem 1.5rem;
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-blue);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--app-text-secondary);
  margin-top: 0.25rem;
}

.actions-row {
  display: flex;
  justify-content: center;
}

.btn-create-match {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-light);
}

.btn-create-match:hover {
  background: linear-gradient(135deg, var(--tertiary-blue) 0%, var(--secondary-blue) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text {
  font-size: 0.95rem;
}

/* Tabla */
.matches-table-container {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
  overflow: hidden;
}

.matches-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 250px 1fr 180px 200px 180px 140px;
  background: var(--primary-blue);
  color: var(--white);
  font-weight: 600;
  padding: 1rem;
  gap: 1rem;
}

.table-row {
  display: grid;
  grid-template-columns: 250px 1fr 180px 200px 180px 140px;
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px solid var(--app-border-color);
  transition: background-color var(--transition-normal);
}

.table-row:hover {
  background: var(--app-bg-secondary);
}

.table-row:last-child {
  border-bottom: none;
}

.row-live {
  background: rgba(239, 68, 68, 0.05);
  border-left: 4px solid #ef4444;
}

.row-completed {
  background: rgba(16, 185, 129, 0.05);
}

.row-highlighted {
  background: rgba(59, 130, 246, 0.15) !important;
  border-left: 4px solid #3b82f6 !important;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2) !important;
  animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
  0% {
    background: rgba(59, 130, 246, 0.25);
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.3);
  }

  50% {
    background: rgba(59, 130, 246, 0.15);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
  }

  100% {
    background: rgba(59, 130, 246, 0.15);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
  }
}

/* Columnas */
.col-date,
.col-teams,
.col-round,
.col-location,
.col-status,
.col-actions {
  display: flex;
  align-items: center;
}

/* Elementos de edición */
.edit-date-container,
.edit-location-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.edit-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.edit-input {
  padding: 0.4rem;
  border: 2px solid var(--primary-blue);
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
  transition: border-color var(--transition-normal);
}

.edit-input:focus {
  outline: none;
  border-color: var(--tertiary-blue);
  box-shadow: 0 0 0 2px rgba(60, 154, 240, 0.2);
}

.edit-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.date-input,
.time-input {
  width: 100%;
}

.location-input {
  width: 100%;
  min-width: 140px;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.save-btn,
.cancel-btn {
  padding: 0.3rem;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 0.8rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.save-btn {
  background: #10b981;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
  transform: scale(1.05);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #ef4444;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #dc2626;
  transform: scale(1.05);
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.edit-btn {
  padding: 0.4rem;
  background: var(--app-bg-secondary);
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.edit-btn:hover:not(:disabled) {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.edit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.edit-btn.date-edit:hover:not(:disabled) {
  background: #f59e0b;
  border-color: #f59e0b;
}

.edit-btn.location-edit:hover:not(:disabled) {
  background: #10b981;
  border-color: #10b981;
}

.edit-btn.delete-btn {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.edit-btn.delete-btn:hover:not(:disabled) {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date {
  font-weight: 600;
  color: var(--app-text-primary);
}

.time {
  font-size: 0.875rem;
  color: var(--app-text-secondary);
}

.teams-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.team.away {
  flex-direction: row-reverse;
  text-align: right;
}

.team-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--app-border-color);
}

.team-name {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
}

.vs {
  font-weight: 700;
  color: var(--app-text-secondary);
  font-size: 0.8rem;
}

/* Columna de fase/ronda */
.col-round {
  justify-content: center;
}

.round-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.round-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  min-width: 80px;
}

.round-final {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: var(--white);
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.round-semifinal {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: var(--white);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.round-quarterfinal {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: var(--white);
  box-shadow: 0 2px 4px rgba(6, 182, 212, 0.3);
}

.round-octavos {
  background: linear-gradient(135deg, #10b981, #059669);
  color: var(--white);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.round-dieciseisavos {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: var(--white);
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
}

.round-default {
  background: var(--app-bg-secondary);
  color: var(--app-text-secondary);
  border: 1px solid var(--app-border-color);
  font-size: 0.7rem;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.location-text {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--app-border-color);
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.status-scheduled {
  background: #fef3c7;
  color: #d97706;
}

.status-live {
  background: #fecaca;
  color: #dc2626;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

/* Estados de carga */
.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--app-border-color);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.no-matches {
  text-align: center;
  padding: 3rem;
  color: var(--app-text-secondary);
}

/* Responsive */
@media (max-width: 1024px) {

  .table-header,
  .table-row {
    grid-template-columns: 180px 1fr 150px 160px 130px 120px;
  }

  .team-name {
    font-size: 0.8rem;
  }

  .edit-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .tournament-schedule {
    padding: 1rem;
  }

  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .stats-row {
    flex-wrap: wrap;
  }

  .actions-row {
    margin-top: 1rem;
  }

  .btn-create-match {
    width: 100%;
    justify-content: center;
  }

  .modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header {
    display: none;
  }

  .table-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem;
  }

  .col-actions {
    justify-content: center;
    border-top: 1px solid var(--app-border-color);
    padding-top: 1rem;
  }

  .edit-date-container,
  .edit-location-container {
    align-items: center;
  }

  .edit-inputs {
    align-items: center;
    width: 100%;
  }

  .edit-input {
    max-width: 200px;
  }

  .teams-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .team.away {
    flex-direction: row;
    text-align: left;
  }

  .vs {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .team-logo {
    width: 28px;
    height: 28px;
  }

  .team-name {
    font-size: 0.8rem;
  }

  .stat-item {
    padding: 0.75rem 1rem;
  }
}
</style>
