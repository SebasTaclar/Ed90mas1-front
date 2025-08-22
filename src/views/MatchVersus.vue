<template>
  <div class="match-versus">
    <!-- Header con información del partido -->
    <div class="match-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Volver
        </button>
        <div class="match-info">
          <h1>{{ matchData?.homeTeam.teamName }} <span class="vs-mini">vs</span> {{ matchData?.awayTeam.teamName }}</h1>
          <div class="match-details" v-if="matchData?.matchDate">
            <span class="match-date">{{ formatMatchDate(matchData.matchDate) }}</span>
            <span class="match-stadium" v-if="matchData.stadium">{{ matchData.stadium }}</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <!-- <div class="teams-status" v-if="matchData">
          <span class="team-chip" :class="{ ok: homeTeamHasPlayers }" :title="homeTeamHasPlayers ? 'Mínimo cumplido' : 'Faltan jugadores'">
            🏠 {{ matchData.homeTeam.teamName }}: <strong>{{ (matchData.attendingPlayers?.[homeTeamId]?.length)||0 }}</strong>
          </span>
          <span class="team-chip" :class="{ ok: awayTeamHasPlayers }" :title="awayTeamHasPlayers ? 'Mínimo cumplido' : 'Faltan jugadores'">
            ✈️ {{ matchData.awayTeam.teamName }}: <strong>{{ (matchData.attendingPlayers?.[awayTeamId]?.length)||0 }}</strong>
          </span>
        </div> -->
        <button @click="checkAndStartMatch" class="btn-start-match compact" :disabled="!canStartMatch">
          <span class="match-icon">⚽</span>
          <span>{{ canStartMatch ? 'Ir a Iniciar Partido' : 'Faltan Jugadores' }}</span>
          <span class="match-arrow" v-if="canStartMatch">→</span>
        </button>
      </div>
    </div>

    <!-- Controles de navegación entre equipos -->
    <div class="team-navigation">
      <button @click="currentTeam = 'home'" :class="['team-nav-btn', { active: currentTeam === 'home' }]">
        <img v-if="matchData?.homeTeam.teamLogo" :src="matchData.homeTeam.teamLogo" :alt="matchData.homeTeam.teamName"
          class="team-logo-small">
        {{ matchData?.homeTeam.teamName }}
      </button>

      <div class="vs-indicator">VS</div>

      <button @click="currentTeam = 'away'" :class="['team-nav-btn', { active: currentTeam === 'away' }]">
        <img v-if="matchData?.awayTeam.teamLogo" :src="matchData.awayTeam.teamLogo" :alt="matchData.awayTeam.teamName"
          class="team-logo-small">
        {{ matchData?.awayTeam.teamName }}
      </button>
    </div>

  <!-- Botón removido de posición inferior; ahora en header -->

    <!-- Modal de confirmación -->
    <div v-if="showConfirmationModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <span class="warning-icon">⚠️</span>
            Falta confirmación de jugadores
          </h3>
        </div>
        <div class="modal-body">
          <p class="modal-message">{{ confirmationMessage }}</p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-modal-close">Entendido</button>
        </div>
      </div>
    </div>

    <!-- Vista principal del equipo -->
    <div class="team-lineup-container" v-if="!loading">
      <div class="team-card">
        <div class="team-header">
          <img v-if="currentTeamLineup?.teamLogo" :src="currentTeamLineup.teamLogo" :alt="currentTeamLineup.teamName"
            class="team-logo-header">
          <div class="team-info">
            <h2>{{ currentTeamLineup?.teamName }}</h2>
            <p class="probable-xi">PLANTILLA COMPLETA</p>
          </div>
        </div>

        <!-- Mostrar mensaje si no hay jugadores -->
        <div v-if="!currentTeamLineup?.players || currentTeamLineup.players.length === 0" class="no-players">
          <div class="no-players-icon">⚽</div>
          <h3>No hay jugadores registrados</h3>
          <p>Este equipo no tiene jugadores registrados en el sistema.</p>
          <p class="team-info-text">
            <strong>Equipo:</strong> {{ currentTeamLineup?.teamName || 'Sin nombre' }}<br>
            <strong>ID del equipo:</strong> {{ currentTeamLineup?.teamId || 'No disponible' }}
          </p>
        </div>

        <!-- Alineación visual simple -->
        <div v-else class="field-view">
          <div class="field-background">
            <!-- Líneas básicas del campo -->
            <div class="field-center-line"></div>
            <div class="field-center-circle"></div>
            <!-- Porterías -->
            <div class="goal-top"></div>
            <div class="goal-bottom"></div>
            <!-- Puntos de penalti -->
            <div class="penalty-spot-top"></div>
            <div class="penalty-spot-bottom"></div>
          </div>

          <!-- Jugadores distribuidos en formación simple -->
          <div class="players-formation" :class="{ 'locked': !canEditCurrentTeam }">
            <div v-for="(player, index) in currentTeamLineup?.players" :key="player.id" class="player-item"
              :class="{ 'player-selected': selectedPlayers.includes(player.id), 'disabled': !canEditCurrentTeam }" :style="getPlayerPosition(index)"
              @click="togglePlayerSelection(player.id)"
              :title="!canEditCurrentTeam ? 'Plantilla confirmada. Pulsa Editar Plantilla para modificar.' : 'Click para (des)seleccionar'">
              <div class="player-photo-container">
                <img v-if="player.photoPath" :src="player.photoPath" :alt="getPlayerName(player)" class="player-photo"
                  @error="handlePhotoError">
                <div v-else class="player-initials">
                  {{ getPlayerInitials(player) }}
                </div>
                <div class="player-number">{{ player.jerseyNumber }}</div>
              </div>
              <div class="player-name">{{ getPlayerName(player) }}</div>
            </div>
          </div>
        </div>

        <!-- Lista de jugadores seleccionados -->
    <div class="selection-summary" v-if="selectedPlayers.length > 0">
          <h3>Jugadores Convocados ({{ selectedPlayers.length }})</h3>
          <div class="selected-players-list">
            <div v-for="playerId in selectedPlayers" :key="playerId" class="selected-player-chip">
              <span>{{ getSelectedPlayerName(playerId) }}</span>
      <button @click="togglePlayerSelection(playerId)" class="remove-player-btn" :disabled="!canEditCurrentTeam">×</button>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="match-actions">
          <!-- Botones de flujo edición / confirmación -->
          <div class="lineup-buttons">
            <template v-if="!currentTeamConfirmed">
              <button v-if="selectedPlayers.length > 0" @click="confirmTeamLineup" :disabled="isConfirmingLineup" class="btn-confirm-lineup">
                <span v-if="isConfirmingLineup">⏳ Confirmando...</span>
                <span v-else>✅ Confirmar Plantilla ({{ selectedPlayers.length }} jugadores)</span>
              </button>
            </template>
            <template v-else>
              <button v-if="!editingCurrentTeam" class="btn-edit-lineup" @click="startEditingLineup">✏️ Editar Plantilla</button>
              <div v-else class="edit-actions">
                <button class="btn-cancel-edit" @click="cancelEditingLineup">↩️ Cancelar</button>
                <button class="btn-confirm-lineup" @click="confirmTeamLineup" :disabled="isConfirmingLineup || selectedPlayers.length === 0">
                  <span v-if="isConfirmingLineup">⏳ Guardando...</span>
                  <span v-else>💾 Guardar Cambios ({{ selectedPlayers.length }})</span>
                </button>
              </div>
            </template>
          </div>

          <div v-if="attendingPlayersStatus" class="lineup-status" :class="attendingPlayersStatus.type">
            <span class="status-icon">{{ attendingPlayersStatus.icon }}</span>
            <span>{{ attendingPlayersStatus.message }}</span>
          </div>

          <!-- Mensaje informativo sobre el estado de confirmación de plantillas -->
          <div v-if="!canStartMatch && matchData" class="match-info-status">
            <div class="team-status-info">
              <div class="team-status" :class="{ 'confirmed': homeTeamHasPlayers }">
                <span class="team-indicator">🏠</span>
                <span>{{ matchData.homeTeam.teamName }}:
                  {{ homeTeamHasPlayers ? 'Plantilla confirmada' : 'Sin plantilla confirmada' }}</span>
              </div>
              <div class="team-status" :class="{ 'confirmed': awayTeamHasPlayers }">
                <span class="team-indicator">✈️</span>
                <span>{{ matchData.awayTeam.teamName }}:
                  {{ awayTeamHasPlayers ? 'Plantilla confirmada' : 'Sin plantilla confirmada' }}</span>
              </div>
            </div>
            <p class="info-text">Confirma la plantilla de ambos equipos para poder iniciar el partido</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información del partido...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { matchesService } from '@/services/matchesService'
import { playerService } from '@/services/api/playerService'
import type { Player } from '@/types/PlayerType'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const router = useRouter()
const route = useRoute()

// Tipos simplificados para esta vista
interface SimpleTeamLineup {
  teamId: number
  teamName: string
  teamLogo?: string
  players: Player[]
}

interface SimpleMatchVersus {
  matchId: number
  homeTeam: SimpleTeamLineup
  awayTeam: SimpleTeamLineup
  matchDate?: string
  stadium?: string
  attendingPlayers?: { [teamId: string]: number[] }
}

// Estado reactivo
const loading = ref(true)
const currentTeam = ref<'home' | 'away'>('home')
const matchData = ref<SimpleMatchVersus | null>(null)
const selectedPlayers = ref<number[]>([])
// Modo edición de la plantilla del equipo actual
const editingCurrentTeam = ref(false)
const isConfirmingLineup = ref(false)
const attendingPlayersStatus = ref<{
  type: 'success' | 'error' | 'info'
  icon: string
  message: string
} | null>(null)

// Variables para el modal de confirmación
const showConfirmationModal = ref(false)
const confirmationMessage = ref('')

// Computed para obtener la alineación del equipo actual
const currentTeamLineup = computed((): SimpleTeamLineup | null => {
  if (!matchData.value) return null
  return currentTeam.value === 'home' ? matchData.value.homeTeam : matchData.value.awayTeam
})

// IDs útiles
const homeTeamId = computed(() => matchData.value?.homeTeam.teamId.toString() || '')
const awayTeamId = computed(() => matchData.value?.awayTeam.teamId.toString() || '')

// Confirmación por equipo basada en attendingPlayers (mínimo 5 jugadores)
const MIN_PLAYERS = 5
const homeTeamHasPlayers = computed(() => {
  if (!matchData.value) return false
  const list = matchData.value.attendingPlayers?.[homeTeamId.value]
  return Array.isArray(list) && list.length >= MIN_PLAYERS
})
const awayTeamHasPlayers = computed(() => {
  if (!matchData.value) return false
  const list = matchData.value.attendingPlayers?.[awayTeamId.value]
  return Array.isArray(list) && list.length >= MIN_PLAYERS
})

// Equipo actual confirmado
const currentTeamConfirmed = computed(() => currentTeam.value === 'home' ? homeTeamHasPlayers.value : awayTeamHasPlayers.value)

// ¿Se puede iniciar partido? (ambos con mínimo requerido)
const canStartMatch = computed(() => homeTeamHasPlayers.value && awayTeamHasPlayers.value)

// ¿Se puede editar plantilla (si no confirmada o en modo edición)?
const canEditCurrentTeam = computed(() => !currentTeamConfirmed.value || editingCurrentTeam.value)

// Funciones de utilidad
const getPlayerName = (player: Player): string => {
  return `${player.firstName} ${player.lastName}`
}

const getPlayerInitials = (player: Player): string => {
  return `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase()
}

const handlePhotoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const parent = img.parentElement
  if (parent) {
    img.style.display = 'none'
  }
}

const formatMatchDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para calcular posición del jugador en formación completa
const getPlayerPosition = (index: number): Record<string, string> => {
  // Formación completa para 15 jugadores distribuidos en 5 líneas
  const completeFormation = [
    // Portero (1 jugador)
    { x: 50, y: 90 },

    // Línea defensiva (4 jugadores)
    { x: 15, y: 75 }, { x: 38, y: 75 }, { x: 62, y: 75 }, { x: 85, y: 75 },

    // Línea de mediocampo defensivo (3 jugadores)
    { x: 25, y: 60 }, { x: 50, y: 60 }, { x: 75, y: 60 },

    // Línea de mediocampo ofensivo (4 jugadores)
    { x: 15, y: 40 }, { x: 38, y: 40 }, { x: 62, y: 40 }, { x: 85, y: 40 },

    // Línea delantera (3 jugadores)
    { x: 25, y: 20 }, { x: 50, y: 20 }, { x: 75, y: 20 }
  ]

  // Si hay menos jugadores de los esperados, usar las primeras posiciones
  if (index < completeFormation.length) {
    const position = completeFormation[index]
    return {
      position: 'absolute',
      top: position.y + '%',
      left: position.x + '%',
      transform: 'translate(-50%, -50%)'
    }
  }

  // Si hay más de 15 jugadores, distribuir los extras en las bandas
  const extraIndex = index - completeFormation.length
  const extraRow = Math.floor(extraIndex / 2)
  const isLeft = extraIndex % 2 === 0

  return {
    position: 'absolute',
    top: (30 + extraRow * 15) + '%',
    left: isLeft ? '5%' : '95%',
    transform: 'translate(-50%, -50%)'
  }
}

// Funciones para manejar la selección de jugadores
const togglePlayerSelection = (playerId: number) => {
  if (!canEditCurrentTeam.value) return
  const i = selectedPlayers.value.indexOf(playerId)
  if (i === -1) selectedPlayers.value.push(playerId)
  else selectedPlayers.value.splice(i, 1)
}

const startEditingLineup = () => {
  if (!matchData.value) return
  const teamId = currentTeam.value === 'home' ? homeTeamId.value : awayTeamId.value
  const existing = matchData.value.attendingPlayers?.[teamId] || []
  selectedPlayers.value = [...existing]
  editingCurrentTeam.value = true
}

const cancelEditingLineup = () => {
  if (!matchData.value) return
  const teamId = currentTeam.value === 'home' ? homeTeamId.value : awayTeamId.value
  const existing = matchData.value.attendingPlayers?.[teamId] || []
  selectedPlayers.value = [...existing]
  editingCurrentTeam.value = false
}

const getSelectedPlayerName = (playerId: number): string => {
  const player = currentTeamLineup.value?.players.find(p => p.id === playerId)
  return player ? getPlayerName(player) : ''
}

const goBack = () => {
  router.back()
}

// Función para navegar a la vista de partido en vivo
const goToMatchLive = () => {
  if (!matchData.value) return
  router.push(`/match-live/${matchData.value.matchId}`)
}

// Validar e iniciar partido
const checkAndStartMatch = () => {
  if (!matchData.value) return
  if (canStartMatch.value) {
    goToMatchLive()
    return
  }
  const homeCount = matchData.value.attendingPlayers?.[homeTeamId.value]?.length || 0
  const awayCount = matchData.value.attendingPlayers?.[awayTeamId.value]?.length || 0
  if (homeCount < MIN_PLAYERS && awayCount < MIN_PLAYERS) {
    confirmationMessage.value = `Ambos equipos necesitan al menos ${MIN_PLAYERS} jugadores confirmados (Actual: ${homeCount} y ${awayCount})`
  } else if (homeCount < MIN_PLAYERS) {
    confirmationMessage.value = `${matchData.value.homeTeam.teamName} necesita mínimo ${MIN_PLAYERS} jugadores (actual: ${homeCount})`
  } else if (awayCount < MIN_PLAYERS) {
    confirmationMessage.value = `${matchData.value.awayTeam.teamName} necesita mínimo ${MIN_PLAYERS} jugadores (actual: ${awayCount})`
  } else {
    confirmationMessage.value = 'Falta confirmación de plantillas.'
  }
  showConfirmationModal.value = true
}

// Función para cerrar el modal de confirmación
const closeModal = () => {
  showConfirmationModal.value = false
  confirmationMessage.value = ''
}

// Función para intentar iniciar el partido (con validación)
// Función para confirmar la plantilla de jugadores asistentes
const confirmTeamLineup = async () => {
  if (!matchData.value || selectedPlayers.value.length === 0) return

  isConfirmingLineup.value = true
  attendingPlayersStatus.value = null

  try {
    const currentTeamId = currentTeam.value === 'home'
      ? matchData.value.homeTeam.teamId
      : matchData.value.awayTeam.teamId

    // Obtener los jugadores asistentes actuales (si existen)
    const match = await matchesService.getMatchById(matchData.value.matchId)
    const existingAttendingPlayers = match?.attendingPlayers || {}

    // Preparar el objeto de jugadores asistentes
    const updatedAttendingPlayers = {
      ...existingAttendingPlayers,
      [currentTeamId.toString()]: [...selectedPlayers.value]
    }

  // Actualizar backend
  await matchesService.updateMatch(matchData.value.matchId, { attendingPlayers: updatedAttendingPlayers })
  // Actualizar local
  matchData.value.attendingPlayers = updatedAttendingPlayers
  editingCurrentTeam.value = false

  attendingPlayersStatus.value = { type: 'success', icon: '✅', message: `Plantilla de ${currentTeam.value === 'home' ? matchData.value.homeTeam.teamName : matchData.value.awayTeam.teamName} confirmada` }

    // Limpiar el mensaje después de 3 segundos
    setTimeout(() => {
      attendingPlayersStatus.value = null
    }, 3000)

  } catch (error) {
    console.error('Error confirming lineup:', error)

    attendingPlayersStatus.value = {
      type: 'error',
      icon: '❌',
      message: 'Error al confirmar la plantilla. Inténtalo de nuevo.'
    }

    // Limpiar el mensaje de error después de 5 segundos
    setTimeout(() => {
      attendingPlayersStatus.value = null
    }, 5000)
  } finally {
    isConfirmingLineup.value = false
  }
}

// Función para cargar los jugadores asistentes existentes
const loadExistingAttendingPlayers = async () => {
  if (!matchData.value) return
  try {
    // obtener datos frescos para sincronizar
    const match = await matchesService.getMatchById(matchData.value.matchId)
    if (match?.attendingPlayers) matchData.value.attendingPlayers = match.attendingPlayers
    const teamId = currentTeam.value === 'home' ? homeTeamId.value : awayTeamId.value
    const existing = matchData.value.attendingPlayers?.[teamId] || []
    selectedPlayers.value = [...existing]
    editingCurrentTeam.value = false
  } catch (e) {
    console.error('Error loading existing attending players:', e)
  }
}

// Cargar datos reales del partido
const loadMatchData = async () => {
  try {
    loading.value = true

    // Obtener el ID del partido desde la ruta
    const matchId = parseInt(route.params.matchId as string)
    if (!matchId) {
      console.error('Match ID not provided')
      throw new Error('ID del partido no proporcionado')
    }

    console.log(`Cargando datos del partido ${matchId}...`)

    // Obtener datos del partido desde la API
    const match = await matchesService.getMatchById(matchId)
    if (!match) {
      console.error(`Match not found for ID: ${matchId}`)
      throw new Error(`Partido no encontrado para ID: ${matchId}`)
    }

    console.log('Datos del partido obtenidos:', match)

    // Cargar jugadores de ambos equipos secuencialmente
    console.log(`Cargando jugadores del equipo local (${match.homeTeamId}) y visitante (${match.awayTeamId})...`)

    const homePlayersResponse = await playerService.getPlayersByTeam(match.homeTeamId).catch(err => {
      console.error(`Error cargando jugadores del equipo local ${match.homeTeamId}:`, err)
      return { success: false, data: [], message: err.message }
    });

    const awayPlayersResponse = await playerService.getPlayersByTeam(match.awayTeamId).catch(err => {
      console.error(`Error cargando jugadores del equipo visitante ${match.awayTeamId}:`, err)
      return { success: false, data: [], message: err.message }
    });

    // Procesar respuestas de jugadores
    const homePlayers = homePlayersResponse.success ? homePlayersResponse.data : []
    const awayPlayers = awayPlayersResponse.success ? awayPlayersResponse.data : []

    console.log(`Jugadores cargados - Local: ${homePlayers.length}, Visitante: ${awayPlayers.length}`)

    // Asegurar que los jugadores tengan el campo photoPath
    const processPlayers = (players: Player[]) => {
      return players.map(player => ({
        ...player,
        photoPath: player.profilePhotoPath || player.photoPath
      }))
    }

    // Construir el objeto de datos del partido
    matchData.value = {
      matchId: match.id || matchId,
      homeTeam: { teamId: match.homeTeamId, teamName: match.homeTeam?.name || 'Equipo Local', teamLogo: match.homeTeam?.logoPath || '/images/logo.png', players: processPlayers(homePlayers) },
      awayTeam: { teamId: match.awayTeamId, teamName: match.awayTeam?.name || 'Equipo Visitante', teamLogo: match.awayTeam?.logoPath || '/images/logo.png', players: processPlayers(awayPlayers) },
      matchDate: match.matchDate || match.scheduledDate,
      stadium: match.location || match.venue,
      attendingPlayers: match.attendingPlayers || {}
    }

    console.log('Datos del partido procesados correctamente:', matchData.value)

  } catch (error) {
    console.error('Error loading match data:', error)

    // En lugar de datos mock, mostrar un mensaje de error al usuario
    matchData.value = {
      matchId: parseInt(route.params.matchId as string) || 0,
      homeTeam: { teamId: 0, teamName: 'Error cargando equipo local', teamLogo: '/images/logo.png', players: [] },
      awayTeam: { teamId: 0, teamName: 'Error cargando equipo visitante', teamLogo: '/images/logo.png', players: [] },
      matchDate: new Date().toISOString(),
      stadium: 'Error cargando datos',
      attendingPlayers: {}
    }
  } finally {
    loading.value = false
  }
}

// Funciones del modal de validación
onMounted(async () => {
  await loadMatchData()
})

// Watcher para cargar jugadores asistentes cuando cambie el equipo
watch(currentTeam, async () => {
  // Limpiar selección actual
  selectedPlayers.value = []
  attendingPlayersStatus.value = null

  // Cargar jugadores asistentes del equipo actual
  await loadExistingAttendingPlayers()
}, { immediate: true })
</script>

<style scoped>
.match-versus {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 0;
}

.match-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 6rem 2rem 1rem 2rem;
  background: transparent;
  backdrop-filter: none;
  border-bottom: none;
  position: relative;
}

.header-left { display: flex; align-items: flex-start; gap: 1.45rem; }
.header-right { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.match-info h1 { font-size: 1.6rem; margin: 0 0 .35rem 0; letter-spacing: .5px; }
.vs-mini { font-size: 0.9rem; font-weight: 600; opacity: .8; margin: 0 .35rem; }

.teams-status { display: flex; gap: .5rem; flex-wrap: wrap; }
.team-chip {
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255,255,255,0.15);
  padding: .45rem .75rem;
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .5px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  gap: .4rem;
  line-height: 1;
  position: relative;

}
.team-chip strong { font-size: .8rem; }
.team-chip.ok { background: rgba(0, 94, 180, 0.55); border-color: rgba(0,94,180,0.5); box-shadow: 0 0 0 1px rgba(0,94,180,0.25), 0 0 10px rgba(0,94,180,0.35); }

.btn-start-match.compact {
  padding: 0.85rem 1.4rem;
  min-width: unset;
  font-size: 0.95rem;
  border-radius: 0.9rem;
  display: flex;
  gap: .55rem;
  box-shadow: 0 4px 18px rgba(0,94,180,0.35);
}
.btn-start-match.compact:disabled {
  background: linear-gradient(135deg, #475569 0%, #334155 100%);
  box-shadow: none;
  cursor: not-allowed;
  opacity: .65;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(30, 41, 59, 0);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
    margin-top: 1.3rem;
}

.back-button:hover {
  background: rgba(51, 65, 85, 0.9);
  border-color: rgba(71, 85, 105, 0.7);
}

.match-info h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.match-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.team-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

.team-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(71, 85, 105, 0.5);
  color: white;
  padding: 2rem 1.5rem;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  font-weight: 700;
  min-width: 200px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.3);
}

.team-nav-btn.active {
  background: rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
}

.team-nav-btn:hover {
  background: rgba(51, 65, 85, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 10px 36px rgba(15, 23, 42, 0.4);
}

.team-logo-small {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.vs-indicator {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 1rem;
  border-radius: 50%;
  background-color: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(59, 130, 246, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  animation: pulse 2s infinite;
}

.team-lineup-container {
  display: flex;
  justify-content: center;
  padding: 0 2rem 2rem;
}

.team-card {
  max-width: 900px;
  width: 100%;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 2rem;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.5);
}

.team-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  text-align: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(51, 65, 85, 0.4);
  border-radius: 1.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.team-logo-header {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.team-info h2 {
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
  text-transform: uppercase;
}

.probable-xi {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.no-players {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 1rem;
  margin: 2rem 0;
  border: 1px solid rgba(71, 85, 105, 0.3);
  backdrop-filter: blur(10px);
}

.no-players-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-players h3 {
  font-size: 1.5rem;
  color: #fbbf24;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.no-players p {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.team-info-text {
  background: rgba(51, 65, 85, 0.6);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem !important;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.field-view {
  position: relative;
  background:
    linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%),
    radial-gradient(ellipse at center, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.15) 30%, rgba(30, 41, 59, 0.3) 70%, rgba(30, 41, 59, 0.5) 100%);
  border-radius: 1rem;
  aspect-ratio: 5/4;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow:
    0 20px 40px rgba(15, 23, 42, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 60px rgba(34, 197, 94, 0.1);
  min-height: 550px;
  border: 3px solid rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
}

.field-view::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg,
      transparent 0px,
      transparent 28px,
      rgba(255, 255, 255, 0.1) 28px,
      rgba(255, 255, 255, 0.1) 30px),
    radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 60%);
  pointer-events: none;
  z-index: 1;
}

.field-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.field-center-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 10%, rgba(34, 197, 94, 0.4) 50%, rgba(255, 255, 255, 0.9) 90%, transparent 100%);
  transform: translateY(-50%);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.field-center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow:
    0 0 20px rgba(34, 197, 94, 0.3),
    inset 0 0 20px rgba(34, 197, 94, 0.1);
}

.field-center-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
}

/* Áreas de penalti */
.field-background::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 30%;
  right: 30%;
  height: 25%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.25);
}

.field-background::after {
  content: '';
  position: absolute;
  bottom: 20%;
  left: 30%;
  right: 30%;
  height: 25%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.25);
}

/* Porterías */
.field-view .goal-top,
.field-view .goal-bottom {
  position: absolute;
  left: 45%;
  right: 45%;
  height: 6px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(34, 197, 94, 0.6), rgba(255, 255, 255, 0.9));
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
  border-radius: 2px;
}

.field-view .goal-top {
  top: 0;
}

.field-view .goal-bottom {
  bottom: 0;
}

/* Círculos de penalti */
.field-view .penalty-spot-top,
.field-view .penalty-spot-bottom {
  position: absolute;
  left: 50%;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}

.field-view .penalty-spot-top {
  top: 30%;
}

.field-view .penalty-spot-bottom {
  bottom: 30%;
}

.players-formation {
  position: absolute;
  inset: 0;
  z-index: 10;
}

.players-formation.locked .player-item {
  cursor: not-allowed;
  opacity: 0.55;
  filter: grayscale(35%) brightness(0.9);
}

.players-formation.locked .player-item.player-selected {
  opacity: 1 !important;
  filter: none !important;
}

.player-item.disabled:hover {
  transform: translate(-50%, -50%) !important;
}

.player-item {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.player-item:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.player-item.player-selected {
  filter: brightness(1.35) saturate(1.25);
  transform: translate(-50%, -50%) scale(1.18) !important;
  z-index: 20;
}

.player-item.player-selected::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 105px;
  height: 105px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(rgba(56, 189, 248, 0.55), rgba(59,130,246,0) 70%);
  box-shadow: 0 0 35px 10px rgba(56, 189, 248, 0.35), 0 0 60px rgba(37,99,235,0.4);
  animation: pulseHalo 2.4s ease-in-out infinite;
  pointer-events: none;
}

.player-item.player-selected .player-photo-container {
  background: linear-gradient(140deg, rgba(14, 165, 233, 0.95) 0%, rgba(59, 130, 246, 0.92) 55%, rgba(147, 197, 253, 0.85) 100%);
  border-color: #38bdf8;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.9), 0 0 35px rgba(59,130,246,0.7), 0 0 55px rgba(30,64,175,0.6);
  position: relative;
}

.player-item.player-selected .player-number {
  background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #60a5fa 100%);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.9), 0 0 25px rgba(59,130,246,0.6);
}

.player-item.player-selected .player-name {
  background: rgba(0,0,0,0.55);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(56,189,248,0.8), 0 0 25px rgba(59,130,246,0.7);
  text-shadow: 0 0 6px rgba(255,255,255,0.9), 0 0 12px rgba(56,189,248,0.8);
  font-weight: 600;
}

@keyframes pulseHalo {
  0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.9); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
  100% { opacity: 0.65; transform: translate(-50%, -50%) scale(0.9); }
}

.player-photo-container {
  position: relative;
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(59, 130, 246, 0.8);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.player-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.player-initials {
  font-size: 0.8rem;
  font-weight: bold;
  color: #1e3a8a;
}

.player-number {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
}

.player-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%);
  padding: 0.25rem 0.5rem;
  border-radius: 0.3rem;
  min-width: fit-content;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid rgba(147, 197, 253, 0.3);
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
}

.selection-summary {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  backdrop-filter: blur(10px);
}

.selection-summary h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #60a5fa;
}

.selected-players-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-player-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
}

.remove-player-btn {
  background: rgba(239, 68, 68, 0.8);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
}

.remove-player-btn:hover {
  background: #ef4444;
}

.match-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.btn-confirm-lineup {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 280px;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
}

.btn-confirm-lineup:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-confirm-lineup:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.btn-edit-lineup {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border: 2px solid rgba(100,116,139,0.4);
  color: #fff;
  padding: 0.85rem 1.6rem;
  border-radius: 0.9rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .3s ease;
  display: flex;
  gap: .5rem;
  align-items: center;
  box-shadow: 0 4px 15px rgba(100,116,139,0.35);
}
.btn-edit-lineup:hover { filter: brightness(1.08); transform: translateY(-2px); }

.btn-cancel-edit {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: 2px solid rgba(220,38,38,0.5);
  color: #fff;
  padding: 0.75rem 1.4rem;
  border-radius: 0.9rem;
  font-size: .95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all .3s ease;
  display: flex;
  align-items: center;
  gap: .4rem;
  box-shadow: 0 4px 15px rgba(220,38,38,0.35);
}
.btn-cancel-edit:hover { filter: brightness(1.05); transform: translateY(-2px); }

.edit-actions { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: center; }
.lineup-buttons { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

.btn-start-match {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  border: 2px solid rgba(0, 94, 180, 0.5);
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 1.2rem;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 320px;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0, 94, 180, 0.4);
  backdrop-filter: blur(10px);
  animation: pulseGlow 2s infinite;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.btn-start-match::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-start-match:hover::before {
  left: 100%;
}

.btn-start-match:hover {
  background: linear-gradient(135deg, var(--tertiary-blue) 0%, var(--dark-blue) 100%);
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 94, 180, 0.6);
  border-color: var(--secondary-blue);
}

.btn-start-match .match-icon {
  font-size: 1.8rem;
  animation: bounce 1s infinite;
}

.btn-start-match .match-arrow {
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.btn-start-match:hover .match-arrow {
  transform: translateX(4px);
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(0, 94, 180, 0.4);
  }
  50% {
    box-shadow: 0 8px 30px rgba(0, 94, 180, 0.7);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.match-info-status {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  max-width: 500px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.team-status-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.team-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: rgba(51, 65, 85, 0.4);
  border: 1px solid rgba(71, 85, 105, 0.3);
  transition: all 0.3s ease;
}

.team-status.confirmed {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #60a5fa;
}

.team-status:not(.confirmed) {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

.team-indicator {
  font-size: 1.1rem;
  min-width: 24px;
}

.info-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

.lineup-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-align: center;
  max-width: 400px;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lineup-status.success {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
  color: #60a5fa;
}

.lineup-status.error {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #ef4444;
}

.lineup-status.info {
  background: rgba(4, 46, 114, 0.2);
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.status-icon {
  font-size: 1.1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .match-versus {
    padding: 0;
  }

  .match-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 3rem 1rem 1rem 1rem;
    margin-bottom: 1.5rem;
  }

  .match-info h1 {
    font-size: 1.5rem;
  }

  .team-navigation {
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
    margin-bottom: 2rem;
  }

  .team-nav-btn {
    width: 100%;
    justify-content: center;
    min-width: unset;
    padding: 1.5rem;
    flex-direction: row;
    gap: 1rem;
  }

  .team-logo-small {
    width: 40px;
    height: 40px;
  }

  .vs-indicator {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .team-lineup-container {
    padding: 0 1rem 1rem;
  }

  .team-card {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }

  .team-header {
    padding: 1.5rem;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .team-logo-header {
    width: 60px;
    height: 60px;
  }

  .team-info h2 {
    font-size: 1.5rem;
  }

  .player-photo-container {
    width: 55px;
    height: 55px;
  }

  .player-name {
    font-size: 0.8rem;
  }

  .field-view {
    aspect-ratio: 4/3;
    min-height: 420px;
  }

  .btn-confirm-lineup {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
    min-width: 250px;
  }

  .btn-start-match {
    font-size: 1.1rem;
    padding: 1rem 2rem;
    min-width: 280px;
  }

  .btn-start-match .match-icon {
    font-size: 1.5rem;
  }

  .btn-start-match .match-arrow {
    font-size: 1.2rem;
  }

  .lineup-status {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .team-nav-btn {
    padding: 1.25rem;
    font-size: 1rem;
  }

  .team-logo-small {
    width: 36px;
    height: 36px;
  }

  .vs-indicator {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .team-header {
    padding: 1rem;
    gap: 1rem;
    flex-direction: column;
  }

  .team-logo-header {
    width: 50px;
    height: 50px;
  }

  .player-photo-container {
    width: 45px;
    height: 45px;
  }

  .player-name {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    max-width: 100px;
  }

  .player-number {
    width: 18px;
    height: 18px;
    font-size: 0.6rem;
  }

  .field-view {
    aspect-ratio: 3/2;
    min-height: 380px;
  }

  .btn-confirm-lineup {
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
    min-width: 220px;
  }

  .btn-start-match {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
    min-width: 260px;
    gap: 0.75rem;
  }

  .btn-start-match .match-icon {
    font-size: 1.3rem;
  }

  .btn-start-match .match-arrow {
    font-size: 1.1rem;
  }

  .match-actions {
    margin-top: 1.5rem;
  }

  .lineup-status {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    max-width: 300px;
  }
}

/* Estilos para la sección de inicio de partido */
.match-start-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-start-match {
  background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 94, 180, 0.3);
  text-decoration: none;
  min-width: 280px;
  justify-content: center;
}

.btn-start-match:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 94, 180, 0.4);
  background: linear-gradient(135deg, var(--tertiary-blue) 0%, var(--dark-blue) 100%);
}

.btn-start-match:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0, 94, 180, 0.3);
}

.match-icon {
  font-size: 1.4rem;
}

.match-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-start-match:hover .match-arrow {
  transform: translateX(3px);
}

/* Estilos para el modal de confirmación */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  text-align: center;
  position: relative;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  margin-bottom: 1.5rem;
}

.modal-title {
  color: #dc3545;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.warning-icon {
  font-size: 1.5rem;
  color: #ffc107;
}

.modal-body {
  margin-bottom: 2rem;
}

.modal-message {
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.btn-modal-close {
  background: #6c757d;
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn-modal-close:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-modal-close:active {
  transform: translateY(0);
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .match-start-section {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .btn-start-match {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    min-width: 260px;
  }

  .modal-content {
    padding: 1.5rem;
    margin: 1rem;
  }

  .modal-title {
    font-size: 1.2rem;
  }

  .modal-message {
    font-size: 0.95rem;
  }
}
</style>
