<template>
 <div class="match-live">
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
      <span class="time-display" :class="{ 'live': isMatchLive }">{{ formattedTime }}</span>
      <span class="match-status">{{ matchStatus }}</span>
     </div>
    </div>
   </div>

   <!-- Controles del partido -->
   <div class="match-controls">
    <button v-if="!isMatchLive && !isMatchFinished" @click="startMatch" class="control-btn start-btn">
     ▶️ Iniciar
    </button>
    <button v-if="isMatchLive" @click="pauseMatch" class="control-btn pause-btn">
     ⏸️ Pausar
    </button>
    <button v-if="isMatchLive" @click="endMatch" class="control-btn end-btn">
     🏁 Finalizar
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
        <img v-if="player.photoPath" :src="player.photoPath" :alt="getPlayerName(player)" @error="handlePhotoError">
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

   <!-- Panel de Eventos -->
   <div class="events-panel">
    <div class="event-controls">
     <h3>Agregar Evento</h3>

     <div v-if="selectedPlayer" class="selected-player-info">
      <p>Jugador seleccionado:</p>
      <div class="selected-player-display">
       <span class="player-name">{{ getPlayerName(selectedPlayer) }}</span>
       <span class="team-name">({{ selectedTeam === 'home' ? matchData?.homeTeam.teamName : matchData?.awayTeam.teamName
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

    <!-- Lista de eventos -->
    <div class="events-timeline">
     <h4>Eventos del Partido</h4>
     <div v-if="matchEvents.length === 0" class="no-events">
      <p>No hay eventos registrados</p>
     </div>
     <div v-else class="events-list">
      <div v-for="event in sortedEvents" :key="event.id" class="event-item" :class="event.type">
       <div class="event-time">{{ event.minute }}'</div>
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
        <img v-if="player.photoPath" :src="player.photoPath" :alt="getPlayerName(player)" @error="handlePhotoError">
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

  <!-- Loading state -->
  <div v-if="loading" class="loading-container">
   <div class="spinner"></div>
   <p>Cargando información del partido...</p>
  </div>
 </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { matchesService } from '@/services/matchesService'
import { playerService } from '@/services/api/playerService'
import type { Player } from '@/types/PlayerType'
import type { Match } from '@/services/matchesService'

const router = useRouter()
const route = useRoute()

// Interfaces
interface MatchEvent {
 id: string
 type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
 minute: number
 playerId: number
 playerName: string
 teamId: number
 teamName: string
 timestamp: Date
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
const matchTime = ref(0) // en segundos
const isMatchLive = ref(false)
const isMatchFinished = ref(false)
const matchEvents = ref<MatchEvent[]>([])
const selectedPlayer = ref<Player | null>(null)
const selectedTeam = ref<'home' | 'away' | null>(null)

// Timer para el tiempo del partido
let matchTimer: ReturnType<typeof setInterval> | null = null

// Computed properties
const formattedTime = computed(() => {
 const minutes = Math.floor(matchTime.value / 60)
 const seconds = matchTime.value % 60
 return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const matchStatus = computed(() => {
 if (isMatchFinished.value) return 'FINALIZADO'
 if (isMatchLive.value) return 'EN VIVO'
 return 'NO INICIADO'
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
 return [...matchEvents.value].sort((a, b) => a.minute - b.minute)
})

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

const goBack = () => {
 if (matchTimer) {
  clearInterval(matchTimer)
 }
 router.back()
}

// Funciones del partido
const startMatch = () => {
 isMatchLive.value = true
 matchTimer = setInterval(() => {
  matchTime.value++
 }, 1000)
}

const pauseMatch = () => {
 isMatchLive.value = false
 if (matchTimer) {
  clearInterval(matchTimer)
  matchTimer = null
 }
}

const endMatch = () => {
 isMatchLive.value = false
 isMatchFinished.value = true
 if (matchTimer) {
  clearInterval(matchTimer)
  matchTimer = null
 }
}

// Funciones de jugadores y eventos
const selectPlayer = (player: Player, team: 'home' | 'away') => {
 selectedPlayer.value = player
 selectedTeam.value = team
}

const addEvent = (eventType: 'goal' | 'yellow_card' | 'red_card' | 'substitution') => {
 if (!selectedPlayer.value || !selectedTeam.value || !matchData.value) return

 const currentMinute = Math.floor(matchTime.value / 60)
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

 matchEvents.value.push(event)

 // Actualizar puntaje si es gol
 if (eventType === 'goal') {
  if (selectedTeam.value === 'home') {
   homeScore.value++
  } else {
   awayScore.value++
  }
 }

 // Limpiar selección después de agregar evento
 selectedPlayer.value = null
 selectedTeam.value = null
}

const removeEvent = (eventId: string) => {
 const eventIndex = matchEvents.value.findIndex(e => e.id === eventId)
 if (eventIndex === -1) return

 const event = matchEvents.value[eventIndex]

 // Si es un gol, actualizar el puntaje
 if (event.type === 'goal') {
  const isHomeTeam = event.teamId === matchData.value?.homeTeam.teamId
  if (isHomeTeam) {
   homeScore.value = Math.max(0, homeScore.value - 1)
  } else {
   awayScore.value = Math.max(0, awayScore.value - 1)
  }
 }

 matchEvents.value.splice(eventIndex, 1)
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

  // Cargar jugadores de ambos equipos
  const [homePlayersResponse, awayPlayersResponse] = await Promise.all([
   playerService.getPlayersByTeam(match.homeTeamId).catch(() => ({ success: false, data: [] })),
   playerService.getPlayersByTeam(match.awayTeamId).catch(() => ({ success: false, data: [] }))
  ])

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
 if (matchTimer) {
  clearInterval(matchTimer)
 }
})
</script>

<style scoped>
.match-live {
 min-height: 100vh;
 background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
 color: white;
 padding: 2rem;
}

.match-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 2rem;
 padding: 1.5rem;
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

.time-display.live {
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
}

.control-btn {
 padding: 0.75rem 1rem;
 border: none;
 border-radius: 0.5rem;
 font-weight: 600;
 cursor: pointer;
 transition: all 0.3s ease;
 font-size: 0.9rem;
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
 padding: 2rem;
 opacity: 0.6;
}

.events-timeline {
 flex: 1;
 overflow-y: auto;
}

.events-timeline h4 {
 margin: 0 0 1rem 0;
 text-align: center;
 font-size: 1.1rem;
 opacity: 0.9;
}

.events-list {
 display: flex;
 flex-direction: column;
 gap: 0.75rem;
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
  padding: 1rem;
 }

 .match-header {
  flex-direction: column;
  gap: 1rem;
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
}
</style>
