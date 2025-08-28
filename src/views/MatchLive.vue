<template>
  <div class="match-live">
    <!-- Contenido principal -->
    <div v-show="!loading" class="main-content">
      <!-- Header del partido -->
      <div class="match-header">
        <button @click="goBack" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Volver
        </button>

        <div class="match-info">
          <h1>{{ matchData?.homeTeam.teamName }} vs {{ matchData?.awayTeam.teamName }}</h1>
          <div class="match-score">
            <div class="score-display">
              <span class="home-score">{{ homeScore }}</span>
              <span class="score-separator">-</span>
              <span class="away-score">{{ awayScore }}</span>
            </div>
            <div class="match-time">
              <span class="period-display" :class="{ 'live': isMatchLive }">{{ currentPeriod }}</span>
              <span class="match-status">{{ matchStatus }}</span>
            </div>
          </div>
        </div>

        <!-- Controles del partido -->
        <div class="match-controls">
          <!-- No iniciado -->
          <button v-if="matchPeriod === 'not_started'" @click="startFirstHalf" class="control-btn start-btn">
            ⚽ Iniciar Primer Tiempo
          </button>

          <!-- Primer tiempo en curso -->
          <button v-if="matchPeriod === 'in_progress_1_half'" @click="endFirstHalf" class="control-btn pause-btn">
            ⏸️ Finalizar Primer Tiempo
          </button>

          <!-- Descanso -->
          <button v-if="matchPeriod === 'finished_1_half'" @click="startSecondHalf" class="control-btn start-btn">
            ⚽ Iniciar Segundo Tiempo
          </button>

          <!-- Segundo tiempo en curso -->
          <div v-if="matchPeriod === 'in_progress_2_half'" class="control-group">
            <button @click="endSecondHalf" class="control-btn pause-btn">
              ⏸️ Finalizar Segundo Tiempo
            </button>
            <button @click="finishMatch" class="control-btn finish-btn">
              ✅ Finalizar Partido
            </button>
          </div>

          <!-- Segundo tiempo finalizado -->
          <div v-if="matchPeriod === 'finished_2_half'" class="control-group">
            <button @click="finishMatch" class="control-btn finish-btn">
              ✅ Finalizar Partido
            </button>
            <button @click="startPenalties" class="control-btn penalty-btn">
              🥅 Ir a Penaltis
            </button>
          </div>

          <!-- Penaltis -->
          <button v-if="matchPeriod === 'penalties'" @click="finishMatch" class="control-btn finish-btn">
            ✅ Finalizar Partido
          </button>

          <!-- Finalizado -->
          <span v-if="matchPeriod === 'finished'" class="control-btn finished-btn">
            🏆 Partido Finalizado
          </span>

          <!-- Botón de reiniciar - siempre visible excepto cuando no iniciado -->
          <button v-if="matchPeriod !== 'not_started'" @click="showRestartConfirmation = true"
            class="control-btn restart-btn">
            🔄 Reiniciar Partido
          </button>
        </div>
      </div>

      <!-- Equipos y jugadores -->
      <div class="teams-container">
        <!-- Equipo Local -->
        <div class="team-panel home-team">
          <div class="team-header">
            <img :src="matchData?.homeTeam.teamLogo || '/images/logo.png'" :alt="matchData?.homeTeam.teamName"
              class="team-logo">
            <h2>{{ matchData?.homeTeam.teamName }}</h2>
            <span class="team-label">LOCAL</span>
          </div>

          <div class="players-list">
            <h3>Jugadores en Campo</h3>
            <div v-if="homeAttendingPlayers.length === 0" class="no-players">
              <p>No hay jugadores confirmados para este equipo</p>
            </div>
            <div v-else class="players-grid">
              <div v-for="player in homeAttendingPlayers" :key="player.id" class="player-card"
                @click="selectPlayer(player, 'home')"
                :class="{ 'selected': selectedPlayer?.id === player.id && selectedTeam === 'home' }">
                <div class="player-photo">
                  <img v-if="player.photoPath" :src="player.photoPath" :alt="getPlayerName(player)"
                    @error="handlePhotoError">
                  <div v-else class="player-initials">
                    {{ getPlayerInitials(player) }}
                  </div>
                  <div class="player-number">{{ player.jerseyNumber }}</div>
                </div>
                <div class="player-info">
                  <span class="player-name">{{ getPlayerName(player) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Eventos - Modal en móvil -->
        <div class="events-panel" :class="{ 'mobile-modal': selectedPlayer }">
          <!-- Overlay para cerrar modal en móvil -->
          <div v-if="selectedPlayer" class="modal-overlay" @click="closeEventsPanel"></div>

          <!-- Contenido del panel -->
          <div class="events-content">
            <!-- Header con botón cerrar para móvil -->
            <div class="events-header">
              <h3>Agregar Evento</h3>
              <button v-if="selectedPlayer" @click="closeEventsPanel" class="close-modal-btn">×</button>
            </div>

            <div class="event-controls">
              <div v-if="selectedPlayer" class="selected-player-info">
                <p>Jugador seleccionado:</p>
                <div class="selected-player-display">
                  <span class="player-name">{{ getPlayerName(selectedPlayer) }}</span>
                  <span class="team-name">({{ selectedTeam === 'home' ? matchData?.homeTeam.teamName :
                    matchData?.awayTeam.teamName
                  }})</span>
                </div>
              </div>

              <div class="event-buttons" v-if="selectedPlayer">
                <button @click="addEvent('goal')" class="event-btn goal-btn">
                  ⚽ Gol
                </button>
                <button @click="addEvent('yellow_card')" class="event-btn yellow-card-btn">
                  🟨 Tarjeta Amarilla
                </button>
                <button @click="addEvent('red_card')" class="event-btn red-card-btn">
                  🟥 Tarjeta Roja
                </button>
                <button @click="addEvent('substitution')" class="event-btn sub-btn">
                  🔄 Sustitución
                </button>
              </div>

              <div v-else class="no-player-selected">
                <p>Selecciona un jugador para agregar eventos</p>
              </div>
            </div>

            <!-- Lista de eventos - Visible en móvil cuando no hay jugador seleccionado -->
            <div v-if="!selectedPlayer" class="events-timeline mobile-events">
              <div class="events-header-controls">
                <h4>Eventos del Partido</h4>
              </div>
              <div v-if="matchEvents.length === 0" class="no-events">
                <p>No hay eventos registrados</p>
              </div>
              <div v-else class="events-list mobile-events-list">
                <div v-for="event in sortedEvents" :key="event.id" class="event-item" :class="event.type">
                  <div class="event-details">
                    <div class="event-type">
                      <span class="event-icon">{{ getEventIcon(event.type) }}</span>
                      <span class="event-label">{{ getEventLabel(event.type) }}</span>
                    </div>
                    <div class="event-player">
                      {{ event.playerName }}
                      <span class="event-team">({{ event.teamName }})</span>
                    </div>
                  </div>
                  <button @click="removeEvent(event.id)" class="remove-event-btn">×</button>
                </div>
              </div>
            </div>

            <!-- Lista de eventos - Solo visible en desktop -->
            <div class="events-timeline desktop-only">
              <div class="events-header-controls">
                <h4>Eventos del Partido</h4>
              </div>
              <div v-if="matchEvents.length === 0" class="no-events">
                <p>No hay eventos registrados</p>
              </div>
              <div v-else class="events-list">
                <div v-for="event in sortedEvents" :key="event.id" class="event-item" :class="event.type">
                  <div class="event-details">
                    <div class="event-type">
                      <span class="event-icon">{{ getEventIcon(event.type) }}</span>
                      <span class="event-label">{{ getEventLabel(event.type) }}</span>
                    </div>
                    <div class="event-player">
                      {{ event.playerName }}
                      <span class="event-team">({{ event.teamName }})</span>
                    </div>
                  </div>
                  <button @click="removeEvent(event.id)" class="remove-event-btn">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Equipo Visitante -->
        <div class="team-panel away-team">
          <div class="team-header">
            <img :src="matchData?.awayTeam.teamLogo || '/images/logo.png'" :alt="matchData?.awayTeam.teamName"
              class="team-logo">
            <h2>{{ matchData?.awayTeam.teamName }}</h2>
            <span class="team-label">VISITANTE</span>
          </div>

          <div class="players-list">
            <h3>Jugadores en Campo</h3>
            <div v-if="awayAttendingPlayers.length === 0" class="no-players">
              <p>No hay jugadores confirmados para este equipo</p>
            </div>
            <div v-else class="players-grid">
              <div v-for="player in awayAttendingPlayers" :key="player.id" class="player-card"
                @click="selectPlayer(player, 'away')"
                :class="{ 'selected': selectedPlayer?.id === player.id && selectedTeam === 'away' }">
                <div class="player-photo">
                  <img v-if="player.photoPath" :src="player.photoPath" :alt="getPlayerName(player)"
                    @error="handlePhotoError">
                  <div v-else class="player-initials">
                    {{ getPlayerInitials(player) }}
                  </div>
                  <div class="player-number">{{ player.jerseyNumber }}</div>
                </div>
                <div class="player-info">
                  <span class="player-name">{{ getPlayerName(player) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- Cierre de main-content -->

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Procesando...</p>
      </div>
    </div>

    <!-- Modal de confirmación para reiniciar -->
    <ConfirmationModal v-if="showRestartConfirmation" title="¿Reiniciar Partido?"
      message="Esta acción eliminará todos los eventos y reiniciará el partido al estado inicial. Esta acción no se puede deshacer."
      confirm-text="Sí, Reiniciar" cancel-text="Cancelar" :danger="true" @confirm="confirmRestartMatch"
      @cancel="showRestartConfirmation = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { matchesService } from '@/services/matchesService'
import { matchEventsService, MatchEventType } from '@/services/matchEventsService'
import { playerService } from '@/services/api/playerService'
import type { Player } from '@/types/PlayerType'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const router = useRouter()
const route = useRoute()

// Interfaces
interface MatchEvent {
  id: string | number // String para eventos locales temporales, number para eventos guardados en BD
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
  minute: number
  playerId: number
  playerName: string
  teamId: number
  teamName: string
  timestamp: Date
  dbId?: number // ID en la base de datos cuando se guarda
}

interface SimpleTeamData {
  teamId: number
  teamName: string
  teamLogo?: string
  players: Player[]
}

interface SimpleMatchData {
  matchId: number
  homeTeam: SimpleTeamData
  awayTeam: SimpleTeamData
  matchDate?: string
  stadium?: string
  attendingPlayers?: Record<string, number[]>
}

// Estado reactivo
const loading = ref(true)
const matchData = ref<SimpleMatchData | null>(null)
const homeScore = ref(0)
const awayScore = ref(0)
const matchPeriod = ref<'not_started' | 'in_progress_1_half' | 'finished_1_half' | 'in_progress_2_half' | 'finished_2_half' | 'penalties' | 'finished'>('not_started')
const matchEvents = ref<MatchEvent[]>([])
const selectedPlayer = ref<Player | null>(null)
const selectedTeam = ref<'home' | 'away' | null>(null)
const showRestartConfirmation = ref(false)

// Functions
const closeEventsPanel = () => {
  selectedPlayer.value = null
  selectedTeam.value = null
}

// Computed properties
const currentPeriod = computed(() => {
  switch (matchPeriod.value) {
    case 'not_started': return 'NO INICIADO'
    case 'in_progress_1_half': return '1er TIEMPO - EN JUEGO'
    case 'finished_1_half': return 'DESCANSO'
    case 'in_progress_2_half': return '2do TIEMPO - EN JUEGO'
    case 'finished_2_half': return '2do TIEMPO - FINALIZADO'
    case 'penalties': return 'PENALTIS'
    case 'finished': return 'FINALIZADO'
    default: return 'NO INICIADO'
  }
})

const matchStatus = computed(() => {
  switch (matchPeriod.value) {
    case 'not_started': return 'POR INICIAR'
    case 'in_progress_1_half':
    case 'in_progress_2_half':
    case 'penalties': return 'EN VIVO'
    case 'finished_1_half': return 'DESCANSO'
    case 'finished_2_half': return 'TIEMPO REGULAR FINALIZADO'
    case 'finished': return 'FINALIZADO'
    default: return 'POR INICIAR'
  }
})

const isMatchLive = computed(() => {
  return ['in_progress_1_half', 'in_progress_2_half', 'penalties'].includes(matchPeriod.value)
})

const homeAttendingPlayers = computed((): Player[] => {
  if (!matchData.value?.attendingPlayers) return []
  const homeTeamId = matchData.value.homeTeam.teamId
  const attendingPlayerIds = matchData.value.attendingPlayers[homeTeamId.toString()] || []

  return matchData.value.homeTeam.players.filter(player =>
    attendingPlayerIds.includes(player.id)
  )
})

const awayAttendingPlayers = computed((): Player[] => {
  if (!matchData.value?.attendingPlayers) return []
  const awayTeamId = matchData.value.awayTeam.teamId
  const attendingPlayerIds = matchData.value.attendingPlayers[awayTeamId.toString()] || []

  return matchData.value.awayTeam.players.filter(player =>
    attendingPlayerIds.includes(player.id)
  )
})

const sortedEvents = computed(() => {
  // Ordenar por createdAt/timestamp descendente (más reciente primero)
  return [...matchEvents.value].sort((a, b) => {
    const timeA = a.timestamp.getTime()
    const timeB = b.timestamp.getTime()
    return timeB - timeA // Más reciente primero
  })
})// Funciones de utilidad
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

const goBack = () => {
  router.back()
}

// Funciones de control del partido
const updateMatchStatus = async (status: string) => {
  if (!matchData.value) return false

  try {
    await matchesService.updateMatch(matchData.value.matchId, {
      status: status as 'not_started' | 'in_progress_1_half' | 'finished_1_half' | 'in_progress_2_half' | 'finished_2_half' | 'penalties' | 'finished',
    })
    return true
  } catch (error) {
    console.error('Error updating match status:', error)
    return false
  }
}

const startFirstHalf = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('in_progress_1_half')
    if (success) {
      // Recargar datos desde la BD para asegurar sincronización
      await loadMatchData()
    }
  } finally {
    loading.value = false
  }
}

const endFirstHalf = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('finished_1_half')
    if (success) {
      // Recargar datos desde la BD para asegurar sincronización
      await loadMatchData()
    }
  } finally {
    loading.value = false
  }
}

const startSecondHalf = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('in_progress_2_half')
    if (success) {
      // Recargar datos desde la BD para asegurar sincronización
      await loadMatchData()
    }
  } finally {
    loading.value = false
  }
}

const endSecondHalf = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('finished_2_half')
    if (success) {
      // Recargar datos desde la BD para asegurar sincronización
      await loadMatchData()
    }
  } finally {
    loading.value = false
  }
}

const startPenalties = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('penalties')
    if (success) {
      // Recargar datos desde la BD para asegurar sincronización
      await loadMatchData()
    }
  } finally {
    loading.value = false
  }
}

const finishMatch = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('finished')
    if (success) {
      // Recargar datos desde la BD para asegurar sincronización
      await loadMatchData()
    }
  } finally {
    loading.value = false
  }
}

const confirmRestartMatch = async () => {
  loading.value = true
  try {
    const success = await updateMatchStatus('not_started')
    if (success) {
      // Eliminar todos los eventos del partido de la base de datos
      try {
        for (const event of matchEvents.value) {
          if (event.dbId && typeof event.dbId === 'number' && matchData.value) {
            await matchEventsService.deleteMatchEvent(matchData.value.matchId, event.dbId)
          }
        }
      } catch (error) {
        console.error('Error deleting match events:', error)
      }

      // Recargar datos desde la BD para asegurar sincronización completa
      await loadMatchData()
    }
    showRestartConfirmation.value = false
  } finally {
    loading.value = false
  }
}

// Funciones de jugadores y eventos
const selectPlayer = (player: Player, team: 'home' | 'away') => {
  selectedPlayer.value = player
  selectedTeam.value = team
}

// Función para mapear tipos de evento local a tipos de BD
const mapEventTypeToDb = (eventType: string): MatchEventType => {
  switch (eventType) {
    case 'goal': return MatchEventType.GOAL
    case 'yellow_card': return MatchEventType.YELLOW_CARD
    case 'red_card': return MatchEventType.RED_CARD
    case 'substitution': return MatchEventType.SUBSTITUTION
    default: return MatchEventType.GOAL
  }
}

// Función para guardar evento en la base de datos
const saveEventToDatabase = async (event: MatchEvent): Promise<number | null> => {
  if (!matchData.value) return null

  try {
    const eventData = {
      matchId: matchData.value.matchId,
      playerId: event.playerId,
      teamId: event.teamId,
      eventType: mapEventTypeToDb(event.type),
      minute: event.minute,
      description: `${event.playerName} - ${event.teamName}`
    }

    const savedEvent = await matchEventsService.createMatchEvent(eventData)
    return savedEvent.id
  } catch (error) {
    console.error('Error saving event to database:', error)
    return null
  }
}

// Función para eliminar evento de la base de datos
const deleteEventFromDatabase = async (dbEventId: number): Promise<boolean> => {
  if (!matchData.value) return false

  try {
    await matchEventsService.deleteMatchEvent(matchData.value.matchId, dbEventId)
    return true
  } catch (error) {
    console.error('Error deleting event from database:', error)
    return false
  }
}

const addEvent = async (eventType: 'goal' | 'yellow_card' | 'red_card' | 'substitution') => {
  if (!selectedPlayer.value || !selectedTeam.value || !matchData.value) return

  // Mostrar spinner y deshabilitar pantalla
  loading.value = true

  try {
    // Calcular el minuto basado en el período actual
    let currentMinute = 0
    switch (matchPeriod.value) {
      case 'in_progress_1_half':
        currentMinute = Math.floor(Math.random() * 45) + 1 // 1-45 minutos
        break
      case 'in_progress_2_half':
        currentMinute = Math.floor(Math.random() * 45) + 46 // 46-90 minutos
        break
      case 'penalties':
        currentMinute = 120 // Penaltis se registran en minuto 120
        break
      default:
        currentMinute = 1
    }

    const teamData = selectedTeam.value === 'home' ? matchData.value.homeTeam : matchData.value.awayTeam

    const event: MatchEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type: eventType,
      minute: currentMinute,
      playerId: selectedPlayer.value.id,
      playerName: getPlayerName(selectedPlayer.value),
      teamId: teamData.teamId,
      teamName: teamData.teamName,
      timestamp: new Date()
    }

    // Verificar si es segunda amarilla antes de agregar el evento
    if (eventType === 'yellow_card') {
      const previousYellows = matchEvents.value.filter(e =>
        e.playerId === selectedPlayer.value!.id && e.type === 'yellow_card'
      )

      // Si ya tiene una amarilla, agregar la segunda amarilla y luego automáticamente una roja
      if (previousYellows.length === 1) {

        // Luego crear y guardar automáticamente la tarjeta roja
        const redCardEvent: MatchEvent = {
          id: `${Date.now() + 1}-${Math.random()}`,
          type: 'red_card',
          minute: currentMinute,
          playerId: selectedPlayer.value.id,
          playerName: getPlayerName(selectedPlayer.value),
          teamId: teamData.teamId,
          teamName: teamData.teamName,
          timestamp: new Date()
        }

        // Guardar la tarjeta roja en BD
        await saveEventToDatabase(redCardEvent)

        // Recargar datos desde la BD
        await loadMatchData()

        // Limpiar selección después de agregar eventos
        selectedPlayer.value = null
        selectedTeam.value = null
        return
      }
    }

    // Guardar en la base de datos
    await saveEventToDatabase(event)

    // Recargar datos completos desde la base de datos
    await loadMatchData()

    // Limpiar selección después de agregar evento
    selectedPlayer.value = null
    selectedTeam.value = null

  } catch (error) {
    console.error('Error adding event:', error)
  } finally {
    loading.value = false
  }
}

const removeEvent = async (eventId: string | number) => {
  // Mostrar spinner y deshabilitar pantalla
  loading.value = true

  try {
    const eventIndex = matchEvents.value.findIndex(e => e.id === eventId)
    if (eventIndex === -1) return

    const event = matchEvents.value[eventIndex]

    // Si el evento tiene dbId, eliminarlo de la base de datos
    if (event.dbId && typeof event.dbId === 'number') {
      const deleted = await deleteEventFromDatabase(event.dbId)
      if (!deleted) {
        console.error('No se pudo eliminar el evento de la base de datos')
        return // No eliminar localmente si no se pudo eliminar de la BD
      }
    }

    // Recargar datos completos desde la base de datos
    await loadMatchData()

  } catch (error) {
    console.error('Error removing event:', error)
  } finally {
    loading.value = false
  }
}

const getEventIcon = (eventType: string): string => {
  switch (eventType) {
    case 'goal': return '⚽'
    case 'yellow_card': return '🟨'
    case 'red_card': return '🟥'
    case 'substitution': return '🔄'
    default: return '❓'
  }
}

const getEventLabel = (eventType: string): string => {
  switch (eventType) {
    case 'goal': return 'Gol'
    case 'yellow_card': return 'Tarjeta Amarilla'
    case 'red_card': return 'Tarjeta Roja'
    case 'substitution': return 'Sustitución'
    default: return 'Evento'
  }
}

// Función para cargar eventos existentes del partido
const loadMatchEvents = async (matchId: number) => {
  try {
    const events = await matchEventsService.getMatchEvents(matchId)

    // Verificar que events sea un array
    if (!Array.isArray(events)) {
      console.warn('Match events response is not an array:', events)
      matchEvents.value = []
      return
    }

    // Mapear eventos de la BD al formato local
    const localEvents: MatchEvent[] = events.map(event => ({
      id: event.id,
      dbId: event.id,
      type: mapDbEventTypeToLocal(event.eventType),
      minute: event.minute,
      playerId: event.playerId,
      playerName: `${event.player.firstName} ${event.player.lastName}`,
      teamId: event.teamId,
      teamName: event.team.name,
      timestamp: new Date(event.createdAt)
    }))

    matchEvents.value = localEvents

    // Calcular puntaje basado en eventos de goles
    homeScore.value = localEvents.filter(e =>
      e.type === 'goal' && e.teamId === matchData.value?.homeTeam.teamId
    ).length

    awayScore.value = localEvents.filter(e =>
      e.type === 'goal' && e.teamId === matchData.value?.awayTeam.teamId
    ).length

  } catch (error) {
    console.error('Error loading match events:', error)
    matchEvents.value = []
  }
}

// Función para mapear tipos de evento de BD a tipos locales
const mapDbEventTypeToLocal = (dbEventType: MatchEventType): 'goal' | 'yellow_card' | 'red_card' | 'substitution' => {
  switch (dbEventType) {
    case MatchEventType.GOAL:
    case MatchEventType.PENALTY_GOAL:
    case MatchEventType.OWN_GOAL:
      return 'goal'
    case MatchEventType.YELLOW_CARD:
      return 'yellow_card'
    case MatchEventType.RED_CARD:
      return 'red_card'
    case MatchEventType.SUBSTITUTION:
      return 'substitution'
    default:
      return 'goal'
  }
}

// Cargar datos del partido
const loadMatchData = async () => {
  try {
    loading.value = true

    const matchId = parseInt(route.params.matchId as string)
    if (!matchId) {
      throw new Error('ID del partido no proporcionado')
    }

    // Obtener datos del partido
    const match = await matchesService.getMatchById(matchId)
    if (!match) {
      throw new Error(`Partido no encontrado para ID: ${matchId}`)
    }

    // Cargar jugadores de ambos equipos secuencialmente
    const homePlayersResponse = await playerService.getPlayersByTeam(match.homeTeamId).catch(() => ({ success: false, data: [] }));
    const awayPlayersResponse = await playerService.getPlayersByTeam(match.awayTeamId).catch(() => ({ success: false, data: [] }));

    const homePlayers = homePlayersResponse.success ? homePlayersResponse.data : []
    const awayPlayers = awayPlayersResponse.success ? awayPlayersResponse.data : []

    // Procesar jugadores
    const processPlayers = (players: Player[]) => {
      return players.map(player => ({
        ...player,
        photoPath: player.profilePhotoPath || player.photoPath
      }))
    }

    // Construir datos del partido
    matchData.value = {
      matchId: match.id || matchId,
      homeTeam: {
        teamId: match.homeTeamId,
        teamName: match.homeTeam?.name || 'Equipo Local',
        teamLogo: match.homeTeam?.logoPath || '/images/logo.png',
        players: processPlayers(homePlayers)
      },
      awayTeam: {
        teamId: match.awayTeamId,
        teamName: match.awayTeam?.name || 'Equipo Visitante',
        teamLogo: match.awayTeam?.logoPath || '/images/logo.png',
        players: processPlayers(awayPlayers)
      },
      matchDate: match.matchDate || match.scheduledDate,
      stadium: match.location || match.venue,
      attendingPlayers: match.attendingPlayers
    }

    // Establecer el período del partido basado en el estado de la BD
    if (match.status === 'finished') {
      matchPeriod.value = 'finished'
    } else if (match.status === 'in_progress_1_half') {
      matchPeriod.value = 'in_progress_1_half'
    } else if (match.status === 'finished_1_half') {
      matchPeriod.value = 'finished_1_half'
    } else if (match.status === 'in_progress_2_half') {
      matchPeriod.value = 'in_progress_2_half'
    } else if (match.status === 'finished_2_half') {
      matchPeriod.value = 'finished_2_half'
    } else if (match.status === 'penalties') {
      matchPeriod.value = 'penalties'
    } else if (match.status === 'completed') {
      matchPeriod.value = 'finished'
    } else if (match.status === 'in_progress') {
      // Fallback para compatibilidad con estados genéricos antiguos
      matchPeriod.value = 'in_progress_2_half'
    } else {
      matchPeriod.value = 'not_started'
    }

    // Cargar eventos existentes del partido
    await loadMatchEvents(matchId)

  } catch (error) {
    console.error('Error loading match data:', error)
    // Mostrar datos de error
    matchData.value = {
      matchId: parseInt(route.params.matchId as string) || 0,
      homeTeam: {
        teamId: 0,
        teamName: 'Error cargando equipo local',
        teamLogo: '/images/logo.png',
        players: []
      },
      awayTeam: {
        teamId: 0,
        teamName: 'Error cargando equipo visitante',
        teamLogo: '/images/logo.png',
        players: []
      }
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadMatchData()
})

onUnmounted(() => {
  // Ya no hay timer que limpiar
})
</script>

<style scoped>
.match-live {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 3rem 2rem 2rem 2rem;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 2rem;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.match-info h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  text-align: center;
}

.match-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.score-display {
  font-size: 3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home-score,
.away-score {
  color: #22c55e;
}

.score-separator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 2rem;
}

.match-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.time-display {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: monospace;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.period-display {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.period-display.live {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.match-status {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

.match-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 160px;
  white-space: nowrap;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.control-btn:disabled:hover {
  background: inherit;
  transform: none;
  box-shadow: none;
}

.start-btn {
  background: #22c55e;
  color: white;
}

.start-btn:hover {
  background: #16a34a;
}

.pause-btn {
  background: #f59e0b;
  color: white;
}

.pause-btn:hover {
  background: #d97706;
}

.end-btn {
  background: #ef4444;
  color: white;
}

.end-btn:hover {
  background: #dc2626;
}

.finish-btn {
  background: #059669;
  color: white;
}

.finish-btn:hover {
  background: #047857;
}

.penalty-btn {
  background: #7c3aed;
  color: white;
}

.penalty-btn:hover {
  background: #6d28d9;
}

.finished-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 2px solid #22c55e;
  cursor: default;
}

.finished-btn:hover {
  background: rgba(34, 197, 94, 0.2);
}

.restart-btn {
  background: #f59e0b;
  color: white;
  border: 2px solid transparent;
}

.restart-btn:hover:not(:disabled) {
  background: #d97706;
  border-color: #92400e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.teams-container {
  display: grid;
  grid-template-columns: 1fr 400px 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);
}

.team-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.team-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.team-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.team-header h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  text-align: center;
}

.team-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

.players-list {
  flex: 1;
  overflow-y: auto;
}

.players-list h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-align: center;
  opacity: 0.9;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.player-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
}

.player-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.player-card.selected {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.2);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.player-photo {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.player-initials {
  font-size: 1.2rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
}

.player-number {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  background: #1e40af;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.player-name {
  font-size: 0.85rem;
  font-weight: 600;
  display: block;
}

.events-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Modal styles for mobile */
.events-panel.mobile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 0;
  background: transparent;
  border: none;
  backdrop-filter: none;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1001;
}

.events-content {
  position: relative;
  z-index: 1002;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem 1rem 0 0;
  padding: 1rem;
  margin-top: 30vh;
  height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-modal-btn {
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-modal-btn:hover {
  background: rgba(239, 68, 68, 0.4);
}

.event-controls h3 {
  margin: 0 0 1rem 0;
  text-align: center;
  font-size: 1.2rem;
}

.selected-player-info {
  text-align: center;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 0.5rem;
  border: 1px solid #22c55e;
  margin-bottom: 1rem;
}

.selected-player-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.selected-player-display .player-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.selected-player-display .team-name {
  opacity: 0.8;
  font-size: 0.9rem;
}

.event-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.event-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.goal-btn {
  background: #22c55e;
  color: white;
}

.goal-btn:hover {
  background: #16a34a;
}

.yellow-card-btn {
  background: #fbbf24;
  color: #1f2937;
}

.yellow-card-btn:hover {
  background: #f59e0b;
}

.red-card-btn {
  background: #ef4444;
  color: white;
}

.red-card-btn:hover {
  background: #dc2626;
}

.sub-btn {
  background: #6366f1;
  color: white;
  grid-column: 1 / -1;
}

.sub-btn:hover {
  background: #4f46e5;
}

.no-player-selected {
  text-align: center;
  padding: 0.5rem 1rem;
  opacity: 0.6;
  font-size: 0.9rem;
}

.events-timeline {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.desktop-only {
  display: block;
}

.mobile-events {
  display: none;
}

.events-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.events-timeline h4 {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.toggle-events-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid #22c55e;
  border-radius: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-events-btn:hover {
  background: rgba(34, 197, 94, 0.3);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1rem;
  max-height: none;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  border-left: 4px solid transparent;
}

.event-item.goal {
  border-left-color: #22c55e;
}

.event-item.yellow_card {
  border-left-color: #fbbf24;
}

.event-item.red_card {
  border-left-color: #ef4444;
}

.event-item.substitution {
  border-left-color: #6366f1;
}

.event-time {
  font-weight: bold;
  font-family: monospace;
  font-size: 1.1rem;
  min-width: 40px;
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.event-icon {
  font-size: 1.2rem;
}

.event-player {
  font-size: 0.9rem;
  opacity: 0.8;
}

.event-team {
  opacity: 0.6;
}

.remove-event-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #ef4444;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.remove-event-btn:hover {
  background: #ef4444;
  color: white;
}

.no-players,
.no-events {
  text-align: center;
  padding: 2rem;
  opacity: 0.6;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  gap: 1rem;
  color: white;
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.3);
  border-left-color: #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (min-width: 1201px) {
  .match-header {
    display: grid;
    grid-template-columns: 1fr 400px 1fr;
    justify-items: center;
  }

  .match-info {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .back-button {
    grid-column: 1;
    justify-self: start;
  }

  .match-controls {
    grid-column: 3;
    justify-self: end;
  }
}

@media (max-width: 1200px) {
  .teams-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .events-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .match-live {
    padding: 2rem 1rem 1rem 1rem;
  }

  .match-header {
    flex-direction: column;
    gap: 1rem;
    padding: 2rem 1rem 1rem 1rem;
    margin-top: 1.5rem;
  }

  .controls-row {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .control-btn {
    width: 100%;
    min-width: auto;
  }

  .match-controls {
    width: 100%;
    justify-content: center;
  }

  .teams-container {
    height: auto;
  }

  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .event-buttons {
    grid-template-columns: 1fr;
  }

  .sub-btn {
    grid-column: auto;
  }

  /* Panel de eventos en móvil sin modal */
  .events-panel {
    margin-top: 1rem;
    padding: 1rem;
    min-height: 200px;
  }

  .events-content {
    padding: 0;
    margin-top: 0;
    height: auto;
    position: static;
    background: transparent;
    border: none;
    overflow-y: visible;
  }

  .events-header {
    margin-bottom: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .events-header h3 {
    font-size: 1.1rem;
    margin: 0;
    text-align: center;
  }

  .close-modal-btn {
    display: none;
  }

  .selected-player-info {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .event-buttons {
    gap: 0.75rem;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 1rem;
  }

  .event-btn {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .sub-btn {
    grid-column: 1 / -1;
  }

  .desktop-only {
    display: none;
  }

  /* Lista de eventos visible en móvil */
  .mobile-events {
    display: block;
    margin-top: 1rem;
  }

  .mobile-events-list {
    max-height: 300px;
    overflow-y: auto;
  }

  /* Estilos específicos para el modal de eventos cuando se selecciona jugador */
  .events-panel.mobile-modal .events-content {
    padding: 1rem;
    gap: 1rem;
    margin-top: 50vh;
    height: 50vh;
    position: relative;
    z-index: 1002;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1rem 1rem 0 0;
    overflow-y: auto;
  }

  .events-panel.mobile-modal .close-modal-btn {
    display: flex;
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .events-panel.mobile-modal .desktop-only {
    display: none;
  }
}

/* Desktop styles - disable modal behavior */
@media (min-width: 769px) {
  .events-panel.mobile-modal {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    z-index: auto;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  }

  .modal-overlay {
    display: none;
  }

  .events-content {
    position: static;
    z-index: auto;
    background: transparent;
    backdrop-filter: none;
    border: none;
    border-radius: 0;
    padding: 0;
    margin-top: 0;
    height: auto;
    overflow-y: visible;
  }

  .close-modal-btn {
    display: none;
  }
}
</style>
