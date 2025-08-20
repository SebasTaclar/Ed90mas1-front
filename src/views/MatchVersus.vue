<template>
  <div class="match-versus">
    <!-- Header con información del partido -->
    <div class="match-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Volver
      </button>

      <div class="match-info">
        <h1>{{ matchData?.homeTeam.teamName }} vs {{ matchData?.awayTeam.teamName }}</h1>
        <div class="match-details" v-if="matchData?.matchDate">
          <span class="match-date">{{ formatMatchDate(matchData.matchDate) }}</span>
          <span class="match-stadium" v-if="matchData.stadium">{{ matchData.stadium }}</span>
        </div>
      </div>
    </div>

    <!-- Controles de navegación entre equipos -->
    <div class="team-navigation">
      <button
        @click="currentTeam = 'home'"
        :class="['team-nav-btn', { active: currentTeam === 'home' }]"
      >
        <img
          v-if="matchData?.homeTeam.teamLogo"
          :src="matchData.homeTeam.teamLogo"
          :alt="matchData.homeTeam.teamName"
          class="team-logo-small"
        >
        {{ matchData?.homeTeam.teamName }}
      </button>

      <div class="vs-indicator">VS</div>

      <button
        @click="currentTeam = 'away'"
        :class="['team-nav-btn', { active: currentTeam === 'away' }]"
      >
        <img
          v-if="matchData?.awayTeam.teamLogo"
          :src="matchData.awayTeam.teamLogo"
          :alt="matchData.awayTeam.teamName"
          class="team-logo-small"
        >
        {{ matchData?.awayTeam.teamName }}
      </button>
    </div>

    <!-- Vista principal del equipo -->
    <div class="team-lineup-container" v-if="!loading">
      <div class="team-card">
        <div class="team-header">
          <img
            v-if="currentTeamLineup?.teamLogo"
            :src="currentTeamLineup.teamLogo"
            :alt="currentTeamLineup.teamName"
            class="team-logo-header"
          >
          <div class="team-info">
            <h2>{{ currentTeamLineup?.teamName }}</h2>
            <p class="probable-xi">FORMACIÓN 1-3-3</p>
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
          </div>

          <!-- Jugadores distribuidos en formación simple -->
          <div class="players-formation">
            <div
              v-for="(player, index) in currentTeamLineup?.players"
              :key="player.id"
              class="player-item"
              :class="{ 'player-selected': selectedPlayers.includes(player.id) }"
              :style="getPlayerPosition(index, currentTeamLineup?.players.length || 0)"
              @click="togglePlayerSelection(player.id)"
            >
              <div class="player-photo-container">
                <img
                  v-if="player.photoPath"
                  :src="player.photoPath"
                  :alt="getPlayerName(player)"
                  class="player-photo"
                  @error="handlePhotoError"
                >
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
            <div
              v-for="playerId in selectedPlayers"
              :key="playerId"
              class="selected-player-chip"
            >
              <span>{{ getSelectedPlayerName(playerId) }}</span>
              <button @click="togglePlayerSelection(playerId)" class="remove-player-btn">×</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { matchesService } from '@/services/matchesService'
import { playerService } from '@/services/api/playerService'
import type { Player } from '@/types/PlayerType'

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
}

// Estado reactivo
const loading = ref(true)
const currentTeam = ref<'home' | 'away'>('home')
const matchData = ref<SimpleMatchVersus | null>(null)
const selectedPlayers = ref<number[]>([])

// Computed para obtener la alineación del equipo actual
const currentTeamLineup = computed((): SimpleTeamLineup | null => {
  if (!matchData.value) return null
  return currentTeam.value === 'home' ? matchData.value.homeTeam : matchData.value.awayTeam
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

// Función para calcular posición del jugador en formación 1-3-3
const getPlayerPosition = (index: number, totalPlayers: number): Record<string, string> => {
  // Formación 1-3-3 definida con mejor espaciado: 1 portero, 3 defensas, 3 delanteros
  const formation133 = [
    // Portero - más atrás
    { x: 50, y: 88 },
    // Línea defensiva (3 jugadores) - mejor espaciados
    { x: 20, y: 65 }, { x: 50, y: 65 }, { x: 80, y: 65 },
    // Línea ofensiva (3 jugadores) - mejor espaciados
    { x: 20, y: 25 }, { x: 50, y: 25 }, { x: 80, y: 25 }
  ]

  // Si hay menos jugadores de los esperados, usar las primeras posiciones
  if (index < formation133.length) {
    const position = formation133[index]
    return {
      position: 'absolute',
      top: position.y + '%',
      left: position.x + '%',
      transform: 'translate(-50%, -50%)'
    }
  }

  // Si hay más de 7 jugadores, distribuir los extras en líneas adicionales
  const extraIndex = index - formation133.length
  const extraRow = Math.floor(extraIndex / 3)
  const extraCol = extraIndex % 3

  return {
    position: 'absolute',
    top: (45 + extraRow * 20) + '%', // Más espacio vertical entre filas extras
    left: (20 + extraCol * 30) + '%', // Más espacio horizontal
    transform: 'translate(-50%, -50%)'
  }
}

// Funciones para manejar la selección de jugadores
const togglePlayerSelection = (playerId: number) => {
  const index = selectedPlayers.value.indexOf(playerId)
  if (index === -1) {
    selectedPlayers.value.push(playerId)
  } else {
    selectedPlayers.value.splice(index, 1)
  }
}

const getSelectedPlayerName = (playerId: number): string => {
  const player = currentTeamLineup.value?.players.find(p => p.id === playerId)
  return player ? getPlayerName(player) : ''
}

const goBack = () => {
  router.back()
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

    // Cargar jugadores de ambos equipos
    console.log(`Cargando jugadores del equipo local (${match.homeTeamId}) y visitante (${match.awayTeamId})...`)

    const [homePlayersResponse, awayPlayersResponse] = await Promise.all([
      playerService.getPlayersByTeam(match.homeTeamId).catch(err => {
        console.error(`Error cargando jugadores del equipo local ${match.homeTeamId}:`, err)
        return { success: false, data: [], message: err.message }
      }),
      playerService.getPlayersByTeam(match.awayTeamId).catch(err => {
        console.error(`Error cargando jugadores del equipo visitante ${match.awayTeamId}:`, err)
        return { success: false, data: [], message: err.message }
      })
    ])

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
      stadium: match.location || match.venue
    }

    console.log('Datos del partido procesados correctamente:', matchData.value)

  } catch (error) {
    console.error('Error loading match data:', error)

    // En lugar de datos mock, mostrar un mensaje de error al usuario
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
      },
      matchDate: new Date().toISOString(),
      stadium: 'Error cargando datos'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadMatchData()
})
</script>

<style scoped>
.match-versus {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  padding: 1rem;
}

.match-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
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
  gap: 2rem;
  margin-bottom: 2rem;
}

.team-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: 600;
}

.team-nav-btn.active {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
}

.team-nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.team-logo-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.vs-indicator {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #22c55e, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.team-lineup-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.team-card {
  max-width: 800px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.team-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  justify-content: center;
}

.team-logo-header {
  width: 60px;
  height: 60px;
  border-radius: 50%;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem !important;
}

.field-view {
  position: relative;
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
  border-radius: 1rem;
  aspect-ratio: 3/2;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  min-height: 400px;
}

.field-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.field-center-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-50%);
}

.field-center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.players-formation {
  position: absolute;
  inset: 0;
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
  filter: brightness(1.3);
}

.player-item.player-selected .player-photo-container {
  background: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
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
  border: 3px solid #1e40af;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  color: #1e40af;
}

.player-number {
  position: absolute;
  bottom: -8px;
  right: -8px;
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
  border: 2px solid white;
}

.player-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  background: rgba(30, 64, 175, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 0.3rem;
  min-width: fit-content;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selection-summary {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.selection-summary h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #22c55e;
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
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid #22c55e;
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
  to { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .match-versus {
    padding: 0.5rem;
  }

  .match-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .match-info h1 {
    font-size: 1.5rem;
  }

  .team-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .team-nav-btn {
    width: 100%;
    justify-content: center;
  }

  .team-card {
    padding: 1rem;
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
    aspect-ratio: 5/4;
    min-height: 320px;
  }
}

@media (max-width: 480px) {
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
    aspect-ratio: 4/3;
    min-height: 280px;
  }
}
</style>
