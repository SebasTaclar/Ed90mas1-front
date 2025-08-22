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

      <div v-if="showAdminActions" class="actions-row">
        <button @click="openCreateMatchModal" class="btn-create-match">
          <span class="btn-icon">⚽</span>
          <span class="btn-text">Agregar Partido Eliminatorio</span>
        </button>
      </div>
    </div>

    <!-- Botón flotante para partidos en vivo -->
    <div v-if="liveMatches.length > 0" class="live-matches-button-container">
      <button
        @click="toggleLiveModal"
        class="live-matches-button"
        :class="{ 'active': showLiveModal }"
      >
        <span class="live-button-indicator">🔴</span>
        <span class="live-button-text">Partidos en Vivo</span>
        <span class="live-button-count">{{ liveMatches.length }}</span>
      </button>
    </div>

    <!-- Modal de partidos en vivo -->
    <div v-if="showLiveModal && liveMatches.length > 0" class="live-modal-overlay" @click="closeLiveModal">
      <div class="live-modal" @click.stop>
        <div class="live-modal-header">
          <div class="live-modal-title">
            <span class="live-indicator-modal">🔴</span>
            <h3>Partidos en Vivo</h3>
            <span class="live-auto-refresh">
              <span class="refresh-icon">🔄</span>
              Actualiza cada 15s
            </span>
          </div>
          <button @click="closeLiveModal" class="close-modal-btn">✕</button>
        </div>

        <div class="live-modal-content">
          <div
            v-for="match in liveMatches"
            :key="match.id"
            class="live-modal-match"
            @click="selectAndGoToLive(match)"
          >
            <div class="live-modal-teams">
              <div class="live-modal-team home">
                <img :src="match.homeTeam?.logoPath || '/images/logo.png'"
                     :alt="match.homeTeam?.name"
                     class="live-modal-logo"
                     @error="handleImageError">
                <div class="team-info">
                  <span class="team-name">{{ match.homeTeam?.name || 'TBD' }}</span>
                  <span class="team-score">{{ match.homeScore || 0 }}</span>
                </div>
              </div>

              <div class="live-modal-vs">
                <span class="vs-text">VS</span>
                <div class="match-status">
                  <span class="status-pulse"></span>
                  {{ getStatusText(match.status) }}
                </div>
              </div>

              <div class="live-modal-team away">
                <div class="team-info">
                  <span class="team-score">{{ match.awayScore || 0 }}</span>
                  <span class="team-name">{{ match.awayTeam?.name || 'TBD' }}</span>
                </div>
                <img :src="match.awayTeam?.logoPath || '/images/logo.png'"
                     :alt="match.awayTeam?.name"
                     class="live-modal-logo"
                     @error="handleImageError">
              </div>
            </div>

            <div class="live-modal-info">
              <span class="match-time">⏰ {{ formatTime(match.matchDate || match.scheduledDate) }}</span>
              <span class="match-location">📍 {{ match.location || 'Sin ubicación' }}</span>
              <span v-if="match.round" class="match-round">🏆 {{ match.round }}</span>
            </div>

            <div class="live-modal-action">
              <span class="action-text">👁️ Ver en vivo</span>
            </div>
          </div>
        </div>
      </div>
    </div>    <!-- Tabla de partidos agrupados por fecha -->
    <div class="matches-table-container">
      <div v-if="matchesLoading" class="loading">
        <div class="spinner"></div>
        <p>Cargando partidos...</p>
      </div>

      <div v-else-if="filteredMatches.length === 0" class="no-matches">
        <p>No hay partidos{{ hasActiveFilters ? ' que coincidan con los filtros' : '' }}</p>
      </div>

      <!-- Partidos agrupados por fecha -->
      <div v-else class="matches-grouped">
        <div v-for="(matchesForDate, date) in matchesByDate" :key="date" class="date-group">
          <!-- Encabezado de fecha simplificado -->
          <div class="date-header-simple">
            <h4 class="date-simple">{{ formatDateGroupHeader(String(date)) }}</h4>
            <span class="matches-count-simple">{{ matchesForDate.length }}</span>
          </div>

          <!-- Tabla para esta fecha -->
          <div class="matches-table">
            <div class="table-header">
              <div class="col-time">Hora</div>
              <div class="col-teams">Equipos</div>
              <div class="col-round">Fase</div>
              <div class="col-location">Lugar</div>
              <div class="col-status">Estado</div>
              <div v-if="showAdminActions" class="col-actions">Acciones</div>
            </div>

            <div v-for="match in matchesForDate" :key="match.id" class="table-row" :class="getRowClass(match)">
              <div class="col-time">
                <div v-if="isEditing(match.id!, 'date')" class="edit-time-container">
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
                <div v-else class="time-info">
                  <span class="time-display">{{ formatTime(match.matchDate || match.scheduledDate) }}</span>
                </div>
              </div>

              <div class="col-teams">
                <div class="teams-info">
                  <div class="team home">
                    <img :src="match.homeTeam?.logoPath || '/images/logo.png'" :alt="match.homeTeam?.name"
                      class="team-logo" @error="handleImageError">
                    <span class="team-name">{{ match.homeTeam?.name || 'TBD' }}</span>
                  </div>
                  <span class="vs">VS</span>
                  <div class="team away">
                    <img :src="match.awayTeam?.logoPath || '/images/logo.png'" :alt="match.awayTeam?.name"
                      class="team-logo" @error="handleImageError">
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

              <div v-if="showAdminActions" class="col-actions">
                <div class="action-buttons">
                  <button @click="goToMatchVersus(match)" class="edit-btn match-versus"
                    :disabled="!match.homeTeam || !match.awayTeam" title="Confirmar jugadores del partido">
                    👥
                  </button>
                  <button @click="attemptStartMatch(match)" class="edit-btn start-match-btn"
                    :disabled="!match.homeTeam || !match.awayTeam" title="Iniciar partido">
                    ⚽
                  </button>
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
      </div>
    </div>

    <!-- Modal para crear partido eliminatorio -->
    <CreateMatchPopup :is-visible="showCreateMatchModal" :available-teams="tournamentTeams"
      @close="closeCreateMatchModal" @submit="handleCreateMatch" />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal v-if="showDeleteConfirm" :title="deleteModalTitle" :message="deleteModalMessage"
      @confirm="handleDeleteConfirm" @cancel="cancelDelete" />

    <!-- Modal de validación para iniciar partido -->
    <ConfirmationModal v-if="showValidationModal" title="Plantillas sin confirmar" :message="validationMessage"
      :danger="true" @confirm="handleValidationConfirm" @cancel="handleValidationConfirm" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
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

const router = useRouter()
const { isAdmin, initAuth, currentUser, userRole, isAuthenticated } = useAuth()

// Asegurar que el auth esté inicializado
initAuth()

// Debug: verificar el estado de autenticación
console.log('🔐 Auth Debug:', {
  isAuthenticated: isAuthenticated.value,
  isAdmin: isAdmin.value,
  currentUser: currentUser.value,
  userRole: userRole.value
})

// Control de acceso real basado en autenticación
const showAdminActions = computed(() => {
  // Múltiples verificaciones para asegurar que solo admin vea las acciones
  const hasUser = currentUser.value !== null
  const isLoggedIn = isAuthenticated.value
  const hasAdminRole = userRole.value === 'admin'
  const isAdminByService = isAdmin.value

  console.log('🔒 Access Control:', { hasUser, isLoggedIn, hasAdminRole, isAdminByService })

  // Solo mostrar si TODAS las condiciones se cumplen
  return hasUser && isLoggedIn && (hasAdminRole || isAdminByService)
})

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

// Agrupar partidos por fecha
const matchesByDate = computed(() => {
  const grouped: { [key: string]: Match[] } = {}

  filteredMatches.value.forEach(match => {
    const matchDate = match.matchDate || match.scheduledDate
    if (!matchDate) return

    const date = new Date(matchDate)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(match)
  })

  // Ordenar partidos dentro de cada fecha por hora
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      const dateA = a.matchDate || a.scheduledDate || ''
      const dateB = b.matchDate || b.scheduledDate || ''
      return dateA.localeCompare(dateB)
    })
  })

  return grouped
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

// Computed para partidos en vivo
const liveMatches = computed(() => {
  return props.matches.filter(match => {
    return match.status === 'in_progress' ||
           match.status === 'in_progress_1_half' ||
           match.status === 'in_progress_2_half' ||
           match.status === 'finished_1_half' ||
           match.status === 'finished_2_half' ||
           match.status === 'penalties'
  })
})

const clearFilters = () => {
  selectedTeam.value = ''
  selectedDate.value = ''
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

const formatDateGroupHeader = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  if (isToday) {
    return `Hoy, ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`
  } else if (isTomorrow) {
    return `Mañana, ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`
  } else {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'scheduled':
    case 'not_started':
      return 'Programado'
    case 'in_progress':
    case 'in_progress_1_half':
      return 'En juego - 1er Tiempo'
    case 'finished_1_half':
      return 'Descanso'
    case 'in_progress_2_half':
      return 'En juego - 2do Tiempo'
    case 'finished_2_half':
      return 'Tiempo Reglamentario'
    case 'penalties':
      return 'Penales'
    case 'completed':
    case 'finished':
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
    case 'not_started':
      return 'status-scheduled'
    case 'in_progress':
    case 'in_progress_1_half':
    case 'in_progress_2_half':
    case 'finished_1_half':
    case 'finished_2_half':
    case 'penalties':
      return 'status-live'
    case 'completed':
    case 'finished':
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

// Función para redirigir a la página de confirmación de jugadores del partido
const goToMatchVersus = (match: Match) => {
  if (!match.id) {
    console.error('No se puede navegar: el partido no tiene ID')
    return
  }

  // Navegar a la vista matchVersus con el ID del partido
  router.push(`/match-versus/${match.id}`)
}

// Función para ir al partido en vivo
const goToMatchLive = (match: Match) => {
  if (!match.id) {
    console.error('No se puede navegar: el partido no tiene ID')
    return
  }

  // Navegar a la vista de partido en vivo
  router.push(`/match-live/${match.id}`)
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

// Estado para el modal de validación de inicio de partido
const showValidationModal = ref(false)
const validationMessage = ref('')

// Estado del modal de partidos en vivo
const showLiveModal = ref(false)
const refreshInterval = ref<number | null>(null)

// Función para intentar iniciar un partido con validación
const attemptStartMatch = async (match: Match) => {
  if (!match.id) {
    console.error('No se puede iniciar: el partido no tiene ID')
    return
  }

  try {
    // Obtener información actualizada del partido con jugadores confirmados
    const matchDetails = await matchesService.getMatchById(match.id)

    if (!matchDetails) {
      validationMessage.value = 'Error al cargar los detalles del partido.'
      showValidationModal.value = true
      return
    }

    // Verificar si ambos equipos tienen jugadores confirmados
    // attendingPlayers es un objeto con teamId como clave y array de playerIds como valor
    const homeTeamId = match.homeTeam?.id?.toString() || ''
    const awayTeamId = match.awayTeam?.id?.toString() || ''

    const homePlayersCount = matchDetails.attendingPlayers?.[homeTeamId]?.length || 0
    const awayPlayersCount = matchDetails.attendingPlayers?.[awayTeamId]?.length || 0

    const homeTeamHasPlayers = homePlayersCount > 0
    const awayTeamHasPlayers = awayPlayersCount > 0

    if (!homeTeamHasPlayers || !awayTeamHasPlayers) {
      // Mostrar modal de validación
      const missingTeams = []
      if (!homeTeamHasPlayers) missingTeams.push(match.homeTeam?.name || 'Equipo local')
      if (!awayTeamHasPlayers) missingTeams.push(match.awayTeam?.name || 'Equipo visitante')

      validationMessage.value = `No se puede iniciar el partido. Los siguientes equipos necesitan confirmar su plantilla:\n\n• ${missingTeams.join('\n• ')}\n\nPor favor, usa el botón "👥" para confirmar las plantillas antes de iniciar el partido.`
      showValidationModal.value = true
      return
    }

    // Si ambos equipos tienen plantillas confirmadas, iniciar el partido
    router.push(`/match-live/${match.id}`)

  } catch (error) {
    console.error('Error checking match details:', error)
    validationMessage.value = 'Error al verificar el estado del partido. Por favor, inténtalo de nuevo.'
    showValidationModal.value = true
  }
}// Función para manejar la confirmación del modal de validación
const handleValidationConfirm = () => {
  showValidationModal.value = false
  validationMessage.value = ''
}

// Funciones para el modal de partidos en vivo
const toggleLiveModal = () => {
  showLiveModal.value = !showLiveModal.value
  if (showLiveModal.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const closeLiveModal = () => {
  showLiveModal.value = false
  stopAutoRefresh()
}

const selectAndGoToLive = (match: Match) => {
  if (!match.id) {
    console.error('No se puede navegar: el partido no tiene ID')
    return
  }
  closeLiveModal()
  router.push(`/match-live/${match.id}`)
}

// Auto-refresh cada 15 segundos
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  refreshInterval.value = setInterval(() => {
    if (showLiveModal.value) {
      // Emitir evento para actualizar los datos
      emit('match-updated')
    }
  }, 15000) // 15 segundos
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Lifecycle hooks para limpiar el interval
onMounted(() => {
  // Se iniciará cuando se abra el modal
})

onUnmounted(() => {
  stopAutoRefresh()
})
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

/* Botón flotante para partidos en vivo */
.live-matches-button-container {
  position: fixed;
  bottom: 500px;
  right: 80px;
  z-index: 999;
}

.live-matches-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  color: var(--white);
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 20px rgba(60, 154, 240, 0.3);
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  animation: slideInFromBottom 0.5s ease-out;
}

.live-matches-button:hover {
  background: linear-gradient(135deg, var(--tertiary-blue) 0%, var(--secondary-blue) 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(60, 154, 240, 0.4);
  border-color: white;
}

.live-matches-button.active {
  background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);
  box-shadow: 0 6px 25px rgba(60, 154, 240, 0.5);
  border-color: white;
}

@keyframes slideInFromBottom {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.live-button-indicator {
  font-size: 0.8rem;
  animation: liveBlink 2s ease-in-out infinite;
}

.live-button-text {
  font-weight: 600;
  white-space: nowrap;
}

.live-button-count {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary-blue);
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-full);
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 20px;
  text-align: center;
}

/* Modal de partidos en vivo */
.live-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.live-modal {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--primary-blue);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideInModal 0.3s ease-out;
}

@keyframes slideInModal {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.live-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  color: var(--white);
  border-bottom: 2px solid var(--tertiary-blue);
}

.live-modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.live-indicator-modal {
  font-size: 1rem;
  animation: liveBlink 2s ease-in-out infinite;
}

.live-modal-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.live-auto-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-full);
  font-size: 0.8rem;
  font-weight: 500;
}

.refresh-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.close-modal-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: var(--white);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background var(--transition-normal);
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.live-modal-content {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.live-modal-match {
  background: var(--app-bg-secondary);
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.live-modal-match:last-child {
  margin-bottom: 0;
}

.live-modal-match:hover {
  background: var(--app-bg-primary);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(60, 154, 240, 0.15);
}

.live-modal-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.live-modal-team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.live-modal-team.away {
  flex-direction: row-reverse;
}

.live-modal-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--app-border-color);
}

.team-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.live-modal-team.away .team-info {
  text-align: right;
}

.team-name {
  font-weight: 700;
  color: var(--app-text-primary);
  font-size: 1rem;
}

.team-score {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary-blue);
}

.live-modal-vs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
}

.vs-text {
  font-weight: 800;
  color: var(--app-text-secondary);
  font-size: 0.9rem;
}

.match-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.4rem 0.8rem;
  border-radius: var(--border-radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pulse {
  width: 6px;
  height: 6px;
  background: var(--white);
  border-radius: 50%;
  animation: pulseCompact 1.5s ease-in-out infinite;
}

.live-modal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: var(--app-text-secondary);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.match-time,
.match-location,
.match-round {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.live-modal-action {
  text-align: center;
  color: var(--primary-blue);
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.8;
  transition: opacity var(--transition-normal);
}

.live-modal-match:hover .live-modal-action {
  opacity: 1;
}

/* Sección de partidos en vivo - Diseño flotante compacto */
.live-matches-floating {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: var(--app-bg-primary);
  border: 2px solid var(--primary-blue);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(10px);
  min-width: 280px;
  max-width: 320px;
  animation: slideInFromRight 0.5s ease-out;
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.live-compact-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  color: var(--white);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid var(--tertiary-blue);
}

.live-compact-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  flex: 1;
  letter-spacing: 0.5px;
}

.live-indicator {
  font-size: 0.8rem;
  animation: liveBlink 2s ease-in-out infinite;
}

@keyframes liveBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.live-count {
  background: rgba(255, 255, 255, 0.2);
  color: var(--white);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-full);
  font-weight: 700;
  font-size: 0.75rem;
  min-width: 20px;
  text-align: center;
}

.live-matches-compact {
  padding: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-blue) var(--app-bg-secondary);
}

.live-matches-compact::-webkit-scrollbar {
  width: 4px;
}

.live-matches-compact::-webkit-scrollbar-track {
  background: var(--app-bg-secondary);
  border-radius: 2px;
}

.live-matches-compact::-webkit-scrollbar-thumb {
  background: var(--primary-blue);
  border-radius: 2px;
}

.live-match-compact {
  background: var(--app-bg-secondary);
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
}

.live-match-compact:last-child {
  margin-bottom: 0;
}

.live-match-compact:hover {
  background: var(--app-bg-primary);
  border-color: var(--primary-blue);
  transform: translateX(-2px);
  box-shadow: 0 2px 12px rgba(60, 154, 240, 0.15);
}

.live-teams-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.live-team-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}

.live-logo-compact {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--app-border-color);
  flex-shrink: 0;
}

.live-name-compact {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.live-score-compact {
  font-size: 1.2rem;
  font-weight: 900;
  color: var(--primary-blue);
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.live-vs-compact {
  font-weight: 700;
  color: var(--app-text-secondary);
  font-size: 0.8rem;
  padding: 0 0.25rem;
  flex-shrink: 0;
}

.live-status-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: center;
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-full);
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.live-pulse-compact {
  width: 6px;
  height: 6px;
  background: var(--white);
  border-radius: 50%;
  animation: pulseCompact 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulseCompact {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

/* Tabla */
.matches-table-container {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
  overflow: hidden;
}

/* Agrupación por fechas */
.matches-grouped {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.date-group {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--app-border-color);
  box-shadow: var(--shadow-light);
}

.date-header {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  color: var(--white);
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--tertiary-blue);
}

.date-header-simple {
  background: var(--app-bg-secondary);
  border-bottom: 2px solid var(--app-border-color);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
}

.date-simple {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: var(--app-text-primary);
  text-transform: capitalize;
}

.matches-count-simple {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.25rem 0.6rem;
  border-radius: var(--border-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.date-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.date-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  text-transform: capitalize;
}

.matches-count {
  background: rgba(255, 255, 255, 0.2);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-full);
  font-size: 0.875rem;
  font-weight: 600;
}

.matches-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 180px 200px 180px 200px;
  background: var(--primary-blue);
  color: var(--white);
  font-weight: 600;
  padding: 1rem;
  gap: 1rem;
}

/* Grid sin columna de acciones (para usuarios no admin) */
.table-header:not(:has(.col-actions)) {
  grid-template-columns: 100px 1fr 180px 200px 180px;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 180px 200px 180px 200px;
  padding: 1rem;
  gap: 1rem;
  border-bottom: 1px solid var(--app-border-color);
  transition: background-color var(--transition-normal);
}

/* Grid sin columna de acciones (para usuarios no admin) */
.table-row:not(:has(.col-actions)) {
  grid-template-columns: 100px 1fr 180px 200px 180px;
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
.col-time,
.col-teams,
.col-round,
.col-location,
.col-status,
.col-actions {
  display: flex;
  align-items: center;
}

/* Columna de hora */
.col-time {
  justify-content: center;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-display {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 1rem;
  background: var(--app-bg-secondary);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
}

.edit-time-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
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

.edit-btn.match-versus {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.1);
}

.edit-btn.match-versus:hover:not(:disabled) {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.edit-btn.start-match-btn {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.1);
}

.edit-btn.start-match-btn:hover:not(:disabled) {
  background: #10b981;
  border-color: #10b981;
  color: white;
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
  white-space: nowrap;
  border: 2px solid transparent;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-scheduled {
  background: #fef3c7;
  color: #d97706;
  border-color: #f59e0b;
}

.status-live {
  background: #fecaca;
  color: #dc2626;
  border-color: #ef4444;
  animation: livePulse 2s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(239, 68, 68, 0.2);
  }
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
  border-color: #10b981;
}

.status-cancelled {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #9ca3af;
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
    grid-template-columns: 80px 1fr 150px 160px 130px 180px;
  }

  /* Grid sin columna de acciones en tablets */
  .table-header:not(:has(.col-actions)),
  .table-row:not(:has(.col-actions)) {
    grid-template-columns: 80px 1fr 150px 160px 130px;
  }

  .team-name {
    font-size: 0.8rem;
  }

  .edit-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .action-buttons {
    gap: 0.25rem;
  }
}

@media (max-width: 768px) {
  .tournament-schedule {
    padding: 0.75rem;
  }

  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-group {
    min-width: auto;
  }

  .stats-row {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .stat-item {
    flex: 1;
    min-width: calc(50% - 0.375rem);
    padding: 1rem;
    font-size: 0.9rem;
  }

  .actions-row {
    margin-top: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .btn-create-match {
    width: 100%;
    justify-content: center;
    padding: 1rem;
    font-size: 1rem;
  }

  /* Optimización de tabla para mobile */
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
    margin-bottom: 1rem;
    border-radius: 12px;
    border: 1px solid var(--app-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .table-row:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  /* Mejorar visualización de equipos en mobile */
  .match-teams {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    padding: 1rem;
    background: var(--app-bg-secondary);
    border-radius: 8px;
  }

  .team-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    justify-content: center;
  }

  .team-logo {
    width: 32px;
    height: 32px;
  }

  .team-name {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .vs {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary-blue);
    margin: 0.5rem 0;
  }

  /* Información del partido más legible */
  .match-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .match-date,
  .match-location {
    padding: 0.5rem;
    background: var(--app-bg-primary);
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .match-status {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    text-align: center;
    font-size: 0.9rem;
  }

  .col-actions {
    justify-content: center;
    border-top: 1px solid var(--app-border-color);
    padding-top: 1rem;
    gap: 0.75rem;
  }

  .col-actions .btn {
    flex: 1;
    min-width: auto;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  /* Estilos responsivos para botón y modal de partidos en vivo */
  .live-matches-button-container {
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }

  .live-matches-button {
    padding: 0.8rem 1.2rem;
    font-size: 0.85rem;
    min-width: auto;
    box-shadow: 0 4px 20px rgba(60, 154, 240, 0.4);
  }

  .live-button-text {
    display: none;
  }

  .live-button-count {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .live-modal {
    margin: 1rem;
    max-width: none;
    width: calc(100% - 2rem);
    max-height: calc(100vh - 2rem);
    border-radius: 16px;
  }

  .live-modal-header {
    padding: 1.25rem;
    text-align: center;
  }

  .live-modal-header h3 {
    font-size: 1.2rem;
  }

  .live-modal-content {
    padding: 0 1.25rem 1.25rem;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .live-match-item {
    padding: 1.25rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }

  .edit-date-container,
  .edit-location-container {
    align-items: center;
  }
}

  .live-modal-title h3 {
    font-size: 1.1rem;
  }

  .live-auto-refresh {
    display: none;
  }

  .live-modal-teams {
    flex-direction: column;
    gap: 0.75rem;
  }

  .live-modal-team {
    justify-content: center;
  }

  .live-modal-team.away {
    flex-direction: row;
  }

  .live-modal-vs {
    min-width: auto;
  }

  .live-modal-logo {
    width: 32px;
    height: 32px;
  }

  .team-score {
    font-size: 1.25rem;
  }

  .live-modal-info {
    justify-content: center;
    text-align: center;
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

  /* En móviles tanto admin como no admin usan el mismo grid */
  .table-header:not(:has(.col-actions)),
  .table-row:not(:has(.col-actions)) {
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

/* Optimizaciones adicionales para experiencia móvil */
@media (max-width: 768px) {
  /* Mejorar área de toque para botones */
  .btn {
    min-height: 44px; /* Estándar de área de toque móvil */
    touch-action: manipulation; /* Evita zoom en doble tap */
  }

  /* Scroll suave en contenedores */
  .live-modal-content {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  /* Mejorar legibilidad de texto */
  .match-teams {
    line-height: 1.4;
  }

  /* Espaciado consistente */
  .table-row + .table-row {
    margin-top: 0.75rem;
  }

  /* Feedback visual mejorado para interacciones */
  .table-row:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .live-matches-button:active {
    transform: scale(0.95);
  }

  /* Mejor contraste para texto pequeño */
  .match-date,
  .match-location {
    color: var(--app-text-primary);
    font-weight: 500;
  }
}

/* Optimizaciones para orientación horizontal en móviles */
@media (max-width: 768px) and (orientation: landscape) {
  .live-modal {
    max-height: calc(100vh - 40px);
    margin: 20px;
    width: calc(100% - 40px);
  }

  .live-modal-content {
    max-height: calc(100vh - 120px);
  }

  .stats-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .stat-item {
    min-width: calc(25% - 0.75rem);
  }
}

@media (max-width: 480px) {
  .tournament-schedule {
    padding: 0.5rem;
  }

  .filters-container {
    gap: 0.75rem;
  }

  .stats-row {
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-item {
    min-width: 100%;
    padding: 1rem;
    text-align: center;
  }

  .table-row {
    padding: 1.25rem 0.75rem;
    margin-bottom: 0.75rem;
  }

  .team-logo {
    width: 28px;
    height: 28px;
  }

  .team-name {
    font-size: 0.85rem;
    text-align: center;
  }

  .vs {
    font-size: 1rem;
    margin: 0.25rem 0;
  }

  .match-date,
  .match-location {
    font-size: 0.8rem;
    padding: 0.5rem;
  }

  .match-status {
    font-size: 0.8rem;
    padding: 0.5rem;
  }

  .col-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .col-actions .btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  /* Botón de partidos en vivo más compacto */
  .live-matches-button-container {
    bottom: 15px;
    right: 15px;
  }

  .live-matches-button {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    gap: 0.25rem;
  }

  .live-button-indicator {
    font-size: 0.8rem;
  }

  .live-button-count {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Modal optimizado para pantallas muy pequeñas */
  .live-modal {
    margin: 0.5rem;
    width: calc(100% - 1rem);
    max-height: calc(100vh - 1rem);
    border-radius: 12px;
  }

  .live-modal-header {
    padding: 1rem;
  }

  .live-modal-header h3 {
    font-size: 1.1rem;
  }

  .live-modal-content {
    padding: 0 1rem 1rem;
    max-height: calc(100vh - 150px);
  }

  .live-match-item {
    padding: 1rem;
    margin-bottom: 0.75rem;
    border-radius: 10px;
  }

  .live-match-teams {
    gap: 0.5rem;
  }

  .live-match-team {
    font-size: 0.8rem;
  }

  .live-match-score {
    font-size: 1.1rem;
  }

  .live-match-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }

  /* Formularios más compactos */
  .form-row {
    gap: 0.75rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input,
  .form-group select {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .btn-create-match {
    padding: 1rem;
    font-size: 0.95rem;
  }
}
</style>
