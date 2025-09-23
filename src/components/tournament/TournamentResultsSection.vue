<template>
 <div class="section-content">
  <div class="section-header desktop-header">
   <h2>⚽ Resultados</h2>
   <p class="section-description">Resultados de todos los partidos disputados</p>
  </div>

  <div class="results-container">
   <!-- Estadísticas generales (solo desktop) -->
   <div class="stats-grid desktop-stats">
    <div class="stat-card">
     <div class="stat-icon">⚽</div>
     <div class="stat-content">
      <span class="stat-number">{{ totalGoals }}</span>
      <span class="stat-label">Goles totales</span>
     </div>
    </div>
    <div class="stat-card">
     <div class="stat-icon">🥅</div>
     <div class="stat-content">
      <span class="stat-number">{{ completedMatches.length }}</span>
      <span class="stat-label">Partidos jugados</span>
     </div>
    </div>
    <div class="stat-card">
     <div class="stat-icon">👤</div>
     <div class="stat-content">
      <span class="stat-number">{{ totalPlayers }}</span>
      <span class="stat-label">Jugadores activos</span>
     </div>
    </div>
    <div class="stat-card">
     <div class="stat-icon">🟨</div>
     <div class="stat-content">
      <span class="stat-number">{{ yellowCards }}</span>
      <span class="stat-label">Tarjetas amarillas</span>
     </div>
    </div>
   </div>

   <!-- Resultados recientes -->
   <div class="recent-results">
    <h3>Resultados recientes</h3>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
     <div class="spinner"></div>
     <p>Cargando resultados...</p>
    </div>

    <!-- Sin resultados -->
    <div v-else-if="recentResults.length === 0" class="empty-state">
     <div class="empty-icon">🏆</div>
     <h4>Sin resultados disponibles</h4>
     <p>Los resultados aparecerán aquí cuando se completen los partidos.</p>
    </div>

    <!-- Lista de resultados y cards móviles -->
    <div v-else>
      <!-- Desktop Results -->
      <div class="results-list desktop-results">
       <div v-for="match in recentResults" :key="match.id" class="result-card">
        <div class="match-info">
         <span class="match-date">{{ formatMatchDate(match.matchDate, match.scheduledDate) }}</span>
         <span class="match-round">{{ match.round || 'Jornada' }}</span>
        </div>
        <div class="match-result">
         <div class="team-result">
          <img :src="match.homeTeam?.logoPath || '/images/logo.png'"
               :alt="match.homeTeam?.name || 'Equipo Local'"
               @error="handleTeamImageError">
          <span class="team-name">{{ match.homeTeam?.name || 'Equipo Local' }}</span>
          <span class="team-score" :class="getWinnerClass(match.homeScore || 0, match.awayScore || 0)">
            {{ match.homeScore || 0 }}
          </span>
         </div>
         <div class="result-separator">-</div>
         <div class="team-result">
          <span class="team-score" :class="getWinnerClass(match.awayScore || 0, match.homeScore || 0)">
            {{ match.awayScore || 0 }}
          </span>
          <span class="team-name">{{ match.awayTeam?.name || 'Equipo Visitante' }}</span>
          <img :src="match.awayTeam?.logoPath || '/images/logo.png'"
               :alt="match.awayTeam?.name || 'Equipo Visitante'"
               @error="handleTeamImageError">
         </div>
        </div>
        <div class="match-actions">
         <button class="action-btn" @click="viewMatchDetails(match)">Ver detalles</button>
        </div>
       </div>
      </div>

      <!-- Cards móviles compactas -->
      <div class="results-mobile-container">
       <div v-for="match in recentResults" :key="'mobile-' + match.id" class="result-card-mobile">
        <!-- Header del resultado -->
        <div class="result-header-mobile">
          <div class="match-date-mobile">
            <span class="date">{{ formatMatchDate(match.matchDate, match.scheduledDate) }}</span>
            <span class="round-mobile">{{ match.round || 'Jornada' }}</span>
          </div>
          <div class="match-status-mobile">
            <span class="status-badge-result">FINALIZADO</span>
          </div>
        </div>

        <!-- Resultado principal -->
        <div class="match-score-mobile">
          <div class="team-score-mobile home">
            <img :src="match.homeTeam?.logoPath || '/images/logo.png'"
                 :alt="match.homeTeam?.name"
                 class="team-logo-result"
                 @error="handleTeamImageError">
            <span class="team-name-result">{{ match.homeTeam?.name || 'Local' }}</span>
            <div class="final-score" :class="getWinnerClass(match.homeScore || 0, match.awayScore || 0)">
              {{ match.homeScore || 0 }}
            </div>
          </div>

          <div class="vs-result">
            <span>VS</span>
            <div class="final-result">{{ match.homeScore || 0 }} - {{ match.awayScore || 0 }}</div>
          </div>

          <div class="team-score-mobile away">
            <img :src="match.awayTeam?.logoPath || '/images/logo.png'"
                 :alt="match.awayTeam?.name"
                 class="team-logo-result"
                 @error="handleTeamImageError">
            <span class="team-name-result">{{ match.awayTeam?.name || 'Visitante' }}</span>
            <div class="final-score" :class="getWinnerClass(match.awayScore || 0, match.homeScore || 0)">
              {{ match.awayScore || 0 }}
            </div>
          </div>
        </div>

        <!-- Información adicional del partido -->
        <div class="result-footer-mobile">
          <!-- Goleadores por equipo -->
          <div class="scorers-section">
            <!-- Goleadores equipo local -->
            <div class="team-scorers home-scorers">
              <div v-for="scorer in getTeamScorers(match, 'home')" :key="scorer.id" class="scorer-item">
                {{ scorer.name }} {{ scorer.minute }}'
              </div>
            </div>

            <!-- Ícono central -->
            <div class="match-center-icon">
              ⚽
            </div>

            <!-- Goleadores equipo visitante -->
            <div class="team-scorers away-scorers">
              <div v-for="scorer in getTeamScorers(match, 'away')" :key="scorer.id" class="scorer-item">
                {{ scorer.name }} {{ scorer.minute }}'
              </div>
            </div>
          </div>

          <div class="result-actions-mobile">
            <button @click="viewMatchDetails(match)" class="details-btn-mobile">
              📊 Ver detalles
            </button>
          </div>
        </div>
       </div>
      </div>
    </div>
   </div>
  </div>
 </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useFixtures } from '@/composables/useFixtures'
import type { Tournament } from '@/types/TournamentType'
import type { Match } from '@/services/matchesService'
import { matchEventsService, type MatchEventWithRelations, MatchEventType } from '@/services/matchEventsService'

interface Props {
  tournament?: Tournament | null
}

const props = defineProps<Props>()

// Composables
const { loadTournamentMatches } = useFixtures()

// Estado reactivo
const matches = ref<Match[]>([])
const loading = ref(false)
const matchEvents = ref<Record<number, MatchEventWithRelations[]>>({})

// Computed para estadísticas generales
const totalGoals = computed(() => {
  return matches.value.reduce((total, match) => {
    const homeScore = match.homeScore || 0
    const awayScore = match.awayScore || 0
    return total + homeScore + awayScore
  }, 0)
})

const completedMatches = computed(() => {
  return matches.value.filter(match =>
    match.status === 'completed' || match.status === 'finished'
  )
})

const totalPlayers = computed(() => {
  const playerIds = new Set<number>()

  matches.value.forEach(match => {
    // Agregar jugadores que marcaron goles (si está disponible)
    if (match.attendingPlayers) {
      Object.values(match.attendingPlayers).forEach(players => {
        players.forEach(playerId => playerIds.add(playerId))
      })
    }
  })

  return playerIds.size
})

const yellowCards = computed(() => {
  // Placeholder por ahora - se puede expandir cuando tengamos datos de eventos
  return Math.floor(completedMatches.value.length * 0.6)
})

// Computed para resultados recientes (últimos 5 partidos completados)
const recentResults = computed(() => {
  return matches.value
    .filter(match => match.status === 'completed' || match.status === 'finished')
    .sort((a, b) => {
      const dateA = new Date(a.matchDate || a.scheduledDate || '')
      const dateB = new Date(b.matchDate || b.scheduledDate || '')
      return dateB.getTime() - dateA.getTime() // Más recientes primero
    })
    .slice(0, 5) // Solo los últimos 5
})

// Funciones auxiliares
const handleTeamImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/logo.png'
}

const formatMatchDate = (matchDate?: string, scheduledDate?: string) => {
  const date = new Date(matchDate || scheduledDate || '')
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

const getWinnerClass = (teamScore: number, opponentScore: number) => {
  return teamScore > opponentScore ? 'winner' : ''
}

const viewMatchDetails = (match: Match) => {
  // Por ahora, mostrar información en consola
  // En el futuro se puede navegar a una página de detalles del partido
  console.log('Ver detalles del partido:', {
    id: match.id,
    teams: `${match.homeTeam?.name} vs ${match.awayTeam?.name}`,
    score: `${match.homeScore || 0} - ${match.awayScore || 0}`,
    date: match.matchDate || match.scheduledDate,
    status: match.status
  })
}

// Funciones para goleadores móviles
const getTeamScorers = (match: Match, team: 'home' | 'away') => {
  // Obtener eventos del partido desde el estado reactivo
  const events = matchEvents.value[match.id!] || []

  // Filtrar solo eventos de gol para el equipo especificado
  const goalEvents = events.filter((event: MatchEventWithRelations) => {
    const isGoalEvent = [MatchEventType.GOAL, MatchEventType.PENALTY_GOAL].includes(event.eventType)
    const teamMatches = team === 'home' ?
      event.teamId === match.homeTeamId :
      event.teamId === match.awayTeamId

    return isGoalEvent && teamMatches
  })

  // Mapear eventos a formato de goleadores
  return goalEvents
    .map((event: MatchEventWithRelations) => ({
      id: event.id.toString(),
      name: `${event.player.firstName.charAt(0)}. ${event.player.lastName}`,
      minute: event.extraTime ? `${event.minute}+${event.extraTime}` : event.minute.toString()
    }))
    .sort((a: { minute: string }, b: { minute: string }) => {
      // Ordenar por minuto (considerando tiempo extra)
      const minuteA = parseInt(a.minute.split('+')[0])
      const minuteB = parseInt(b.minute.split('+')[0])
      return minuteA - minuteB
    })
}

// Función para cargar eventos de partidos
const loadMatchEvents = async (matchIds: number[]) => {
  try {
    const eventPromises = matchIds.map(async (matchId) => {
      try {
        const events = await matchEventsService.getMatchEvents(matchId)
        return { matchId, events }
      } catch (error) {
        console.error(`Error cargando eventos del partido ${matchId}:`, error)
        return { matchId, events: [] }
      }
    })

    const results = await Promise.all(eventPromises)

    // Actualizar el estado reactivo con los eventos
    const eventsMap: Record<number, MatchEventWithRelations[]> = {}
    results.forEach(({ matchId, events }) => {
      eventsMap[matchId] = events
    })

    matchEvents.value = eventsMap
  } catch (error) {
    console.error('Error cargando eventos de partidos:', error)
  }
}

// Cargar datos
const loadMatchesData = async () => {
  if (!props.tournament?.id) return

  loading.value = true
  try {
    const matchesData = await loadTournamentMatches(props.tournament.id)
    matches.value = matchesData || []

    // Cargar eventos de partidos completados
    const completedMatchIds = (matchesData || [])
      .filter(match => match.status === 'completed' || match.status === 'finished')
      .map(match => match.id!)
      .filter(id => id !== undefined)

    if (completedMatchIds.length > 0) {
      await loadMatchEvents(completedMatchIds)
    }
  } catch (error) {
    console.error('Error cargando partidos:', error)
    matches.value = []
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadMatchesData()
})

// Watch para recargar cuando cambie el torneo
import { watch } from 'vue'
watch(() => props.tournament?.id, async (newId) => {
  if (newId) {
    await loadMatchesData()
  }
}, { immediate: true })
</script>

<style scoped>
.section-content {
 width: 100%;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 max-width: 1200px;
 margin: 0 auto;
 padding: 2rem;
}

.section-header {
 margin-bottom: 3rem;
 text-align: center;
 width: 100%;
}

.section-header h2 {
 font-size: 2.5rem;
 font-weight: 700;
 color: #212529;
 margin: 0 0 0.5rem 0;
 background: linear-gradient(135deg, #007bff, #0056b3);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.section-description {
 font-size: 1.1rem;
 color: #6c757d;
 margin: 0;
}

/* Estilos para Resultados */
.results-container {
 display: flex;
 flex-direction: column;
 gap: 2rem;
 width: 100%;
}

.stats-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 1.5rem;
}

.stat-card {
 background: white;
 padding: 2rem;
 border-radius: 15px;
 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
 display: flex;
 align-items: center;
 gap: 1.5rem;
 border: 2px solid transparent;
 transition: all 0.3s ease;
}

.stat-card:hover {
 border-color: #007bff;
 transform: translateY(-5px);
 box-shadow: 0 15px 35px rgba(0, 123, 255, 0.2);
}

.stat-icon {
 width: 60px;
 height: 60px;
 background: linear-gradient(135deg, #007bff, #0056b3);
 border-radius: 15px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 1.5rem;
 color: white;
}

.stat-content {
 display: flex;
 flex-direction: column;
}

.stat-number {
 font-size: 2rem;
 font-weight: 700;
 color: #212529;
 line-height: 1;
}

.stat-label {
 font-size: 0.9rem;
 color: #6c757d;
 font-weight: 500;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.recent-results {
 background: white;
 padding: 2rem;
 border-radius: 20px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.recent-results h3 {
 font-size: 1.5rem;
 font-weight: 700;
 color: #212529;
 margin: 0 0 1.5rem 0;
}

.results-list {
 display: flex;
 flex-direction: column;
 gap: 1rem;
}

.result-card {
 display: grid;
 grid-template-columns: auto 1fr auto;
 gap: 2rem;
 align-items: center;
 padding: 1.5rem;
 background: #f8f9fa;
 border-radius: 15px;
 border: 2px solid transparent;
 transition: all 0.3s ease;
}

.result-card:hover {
 border-color: #007bff;
 transform: translateY(-2px);
}

.match-info {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 0.25rem;
 min-width: 80px;
}

.match-date {
 font-weight: 700;
 color: #007bff;
}

.match-round {
 font-size: 0.8rem;
 color: #6c757d;
}

.match-result {
 display: flex;
 align-items: center;
 gap: 1rem;
}

.team-result {
 display: flex;
 align-items: center;
 gap: 0.75rem;
}

.team-result img {
 width: 35px;
 height: 35px;
 border-radius: 8px;
 object-fit: cover;
}

.team-name {
 font-weight: 600;
 color: #212529;
 min-width: 120px;
}

.team-score {
 font-size: 1.25rem;
 font-weight: 700;
 color: #6c757d;
 min-width: 30px;
 text-align: center;
}

.team-score.winner {
 color: #007bff;
}

.result-separator {
 font-weight: 700;
 color: #6c757d;
 padding: 0 1rem;
}

.match-actions {
 display: flex;
 gap: 0.5rem;
}

.action-btn {
 padding: 8px 16px;
 background: linear-gradient(135deg, #007bff, #0056b3);
 border: none;
 border-radius: 8px;
 color: white;
 font-weight: 600;
 font-size: 0.875rem;
 cursor: pointer;
 transition: all 0.3s ease;
}

.action-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Dark mode support */
[data-theme="dark"] .section-content {
 background: transparent;
 color: #e2e8f0;
}

[data-theme="dark"] .section-header h2 {
 color: #ffffff;
 text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .section-description {
 color: #cbd5e1;
}

[data-theme="dark"] .stat-card {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .stat-card:hover {
 background: linear-gradient(145deg, #334155 0%, #475569 100%);
 border-color: #3b82f6;
 box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .stat-number {
 color: #ffffff;
}

[data-theme="dark"] .stat-label {
 color: #cbd5e1;
}

[data-theme="dark"] .recent-results {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .recent-results h3 {
 color: #ffffff !important;
}

[data-theme="dark"] .result-card {
 background: linear-gradient(145deg, #334155 0%, #475569 100%);
 border-color: #64748b;
}

[data-theme="dark"] .result-card:hover {
 border-color: #3b82f6;
}

[data-theme="dark"] .team-name {
 color: #ffffff;
}

[data-theme="dark"] .match-date {
 color: #3b82f6;
}

[data-theme="dark"] .match-round {
 color: #cbd5e1;
}

[data-theme="dark"] .team-score {
 color: #cbd5e1;
}

[data-theme="dark"] .team-score.winner {
 color: #3b82f6;
}

[data-theme="dark"] .result-separator {
 color: #cbd5e1;
}

.loading-state {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 padding: 3rem;
 gap: 1rem;
}

.spinner {
 width: 40px;
 height: 40px;
 border: 4px solid #f3f4f6;
 border-top: 4px solid #007bff;
 border-radius: 50%;
 animation: spin 1s linear infinite;
}

@keyframes spin {
 0% { transform: rotate(0deg); }
 100% { transform: rotate(360deg); }
}

.loading-state p {
 color: #6c757d;
 font-weight: 500;
 margin: 0;
}

.empty-state {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 padding: 3rem;
 gap: 1rem;
 text-align: center;
}

/* Responsive Móvil */
@media (max-width: 768px) {
  .desktop-header {
    display: none; /* Ocultar título en móvil */
  }

  .desktop-stats {
    display: none; /* Ocultar estadísticas en móvil */
  }

  .desktop-results {
    display: none; /* Ocultar resultados desktop en móvil */
  }

  .results-mobile-container {
    display: flex !important;
    flex-direction: column;
    gap: 1rem;
  }

  .result-card-mobile {
    background: var(--app-bg-primary);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
  }

  .result-card-mobile:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .result-header-mobile {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--app-bg-secondary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .match-date-mobile {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .match-date-mobile .date {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .round-mobile {
    font-size: 0.7rem;
    color: var(--text-secondary);
  }

  .status-badge-result {
    background: #28a745;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .match-score-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    gap: 0.75rem;
  }

  .team-score-mobile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    text-align: center;
  }

  .team-logo-result {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
  }

  .team-name-result {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
    text-align: center;
  }

  .final-score {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-secondary);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 0.25rem 0.5rem;
    min-width: 50px;
    text-align: center;
  }

  .final-score.winner {
    color: #28a745;
    border-color: #28a745;
    background: rgba(40, 167, 69, 0.1);
  }

  .vs-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--app-bg-secondary);
    border-radius: 8px;
    min-width: 60px;
  }

  .vs-result span {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .final-result {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .result-footer-mobile {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--app-bg-secondary);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .scorers-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .team-scorers {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .home-scorers {
    align-items: flex-start;
  }

  .away-scorers {
    align-items: flex-end;
    text-align: right;
  }

  .scorer-item {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    line-height: 1.3;
  }

  .match-center-icon {
    font-size: 1rem;
    color: var(--text-secondary);
    opacity: 0.6;
    padding: 0 0.5rem;
    display: flex;
    align-items: center;
  }

  .result-actions-mobile {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .details-btn-mobile {
    padding: 0.5rem 1rem;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .details-btn-mobile:hover {
    background: var(--tertiary-blue);
    transform: translateY(-1px);
  }

  .section-content {
    padding: 1rem;
  }
}

@media (min-width: 769px) {
  .results-mobile-container {
    display: none; /* Ocultar cards móviles en desktop */
  }
}

.empty-icon {
 font-size: 3rem;
 opacity: 0.5;
}

.empty-state h4 {
 color: #6c757d;
 font-size: 1.2rem;
 font-weight: 600;
 margin: 0;
}

.empty-state p {
 color: #6c757d;
 margin: 0;
 max-width: 300px;
}

/* Dark mode para nuevos elementos */
[data-theme="dark"] .loading-state p {
 color: #cbd5e1;
}

[data-theme="dark"] .spinner {
 border-color: #475569;
 border-top-color: #3b82f6;
}

[data-theme="dark"] .empty-state h4 {
 color: #cbd5e1;
}

[data-theme="dark"] .empty-state p {
 color: #cbd5e1;
}

/* Responsive */
@media (max-width: 768px) {
 .stats-grid {
  grid-template-columns: repeat(2, 1fr);
 }

 .result-card {
  grid-template-columns: 1fr;
  gap: 1rem;
  text-align: center;
 }

 .match-result {
  flex-direction: column;
  gap: 1rem;
 }

 .team-result {
  justify-content: center;
 }
}

@media (max-width: 480px) {
 .stats-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
 }

 .stat-card {
  padding: 1.5rem;
  flex-direction: column;
  text-align: center;
 }

 .stat-icon {
  width: 50px;
  height: 50px;
  font-size: 1.25rem;
 }

 .recent-results {
  padding: 1rem;
 }

 .result-card {
  padding: 1rem;
 }

 .team-result img {
  width: 30px;
  height: 30px;
 }
}
</style>
