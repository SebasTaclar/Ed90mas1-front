<template>
  <div class="section-content">
    <div class="section-header">
      <h2>🏆 Tabla de Clasificación</h2>
      <p class="section-description">Posiciones actuales de todos los equipos</p>
    </div>

    <div class="classification-container">
      <!-- Info del torneo -->
      <div class="tournament-info">
        <div class="tournament-name">{{ tournament?.name || 'Torneo' }}</div>
        <div class="tournament-phase">Fase de Grupos</div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-container">
        <p>{{ error }}</p>
        <button @click="loadStatistics" class="retry-btn">Reintentar</button>
      </div>

      <!-- Groups -->
      <div v-else-if="groupedTeams.length > 0" class="groups-grid">
        <div v-for="group in groupedTeams" :key="group.groupId" class="group-card">
          <div class="group-header">Grupo {{ group.groupName }}</div>
          <div class="classification-table">
            <div class="table-header">
              <div class="pos">#</div>
              <div class="team">Equipo</div>
              <div class="points">PTS</div>
              <div class="games">PJ</div>
              <div class="wins">PG</div>
              <div class="draws">PE</div>
              <div class="losses">PP</div>
              <div class="goals-for">GF</div>
              <div class="goals-against">GC</div>
              <div class="goal-diff">DG</div>
            </div>
            <div class="table-body">
              <div v-for="(team, index) in group.teams" :key="team.teamId" class="table-row"
                :class="getRowClass(index, group.teams.length)">
                <div class="pos">{{ index + 1 }}</div>
                <div class="team">
                  <img :src="`/images/teams/${team.teamId}.png`" :alt="team.teamName" @error="handleTeamImageError">
                  <span>{{ team.teamName }}</span>
                </div>
                <div class="points">{{ team.points }}</div>
                <div class="games">{{ team.matchesPlayed }}</div>
                <div class="wins">{{ team.wins }}</div>
                <div class="draws">{{ team.draws }}</div>
                <div class="losses">{{ team.losses }}</div>
                <div class="goals-for">{{ team.goalsFor }}</div>
                <div class="goals-against">{{ team.goalsAgainst }}</div>
                <div class="goal-diff">{{ team.goalDifference >= 0 ? '+' : '' }}{{ team.goalDifference }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <p>No hay equipos configurados para este torneo</p>
      </div>

      <!-- Leyenda -->
      <div class="classification-bottom">
        <div class="classification-legend">
          <div class="legend-item qualify">
            <span class="legend-color"></span>
            <span>Clasifican a playoff</span>
          </div>
          <div class="legend-item elimination">
            <span class="legend-color"></span>
            <span>Zona de eliminación</span>
          </div>
        </div>

        <div class="classification-legend-siglas">
          <h3>Significado de las siglas</h3>
          <ul class="siglas-list">
            <li><strong>PJ</strong> — Partidos Jugados</li>
            <li><strong>PG</strong> — Partidos Ganados</li>
            <li><strong>PE</strong> — Partidos Empatados</li>
            <li><strong>PP</strong> — Partidos Perdidos</li>
            <li><strong>GF</strong> — Goles a Favor</li>
            <li><strong>GC</strong> — Goles en Contra</li>
            <li><strong>DG</strong> — Diferencia de Gol</li>
            <li><strong>PTS</strong> — Puntos</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTournaments } from '@/composables/useTournaments'
import { useTeams } from '@/composables/useTeams'
import type { TeamStatistics } from '@/services/api/tournamentService'
import type { Tournament } from '@/types/TournamentType'
import type { Team } from '@/types/TeamType'

// Props
interface Props {
  tournament?: Tournament | null
}

const props = defineProps<Props>()

// Composables
const { getTournamentTeamStatistics } = useTournaments()
const { teams, loadTeams } = useTeams()

// State
const teamStatistics = ref<TeamStatistics[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Interface para equipo con estadísticas
interface TeamWithStats extends TeamStatistics {
  teamName: string
}

// Interface para grupo con equipos
interface GroupWithTeams {
  groupId: number
  groupName: string
  teams: TeamWithStats[]
}

// Computed
const groupedTeams = computed((): GroupWithTeams[] => {
  if (!props.tournament?.groups || !props.tournament?.teamAssignments) {
    return []
  }

  return props.tournament.groups.map(group => {
    // Obtener los equipos asignados a este grupo
    const groupTeamIds = props.tournament!.teamAssignments
      ?.filter(assignment => assignment.groupId === group.id)
      .map(assignment => assignment.teamId) || []

    // Crear estadísticas para cada equipo del grupo
    const groupTeams: TeamWithStats[] = groupTeamIds.map(teamId => {
      // Buscar estadísticas del equipo
      const stats = teamStatistics.value.find(stat => stat.teamId === teamId)

      // Buscar información del equipo
      const teamInfo = teams.value.find(team => team.id === teamId)

      // Solo incluir equipos que existen en la lista de equipos
      if (!teamInfo) {
        return null
      }

      if (stats) {
        // Si tiene estadísticas, usar las reales
        return {
          ...stats,
          teamName: teamInfo.name
        }
      } else {
        // Si no tiene estadísticas, crear estadísticas vacías
        return {
          teamId,
          teamName: teamInfo.name,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        }
      }
    }).filter(team => team !== null) as TeamWithStats[]

    // Ordenar equipos por puntos, diferencia de goles, goles a favor
    groupTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    return {
      groupId: Number(group.id),
      groupName: group.groupName || group.name,
      teams: groupTeams
    }
  })
})

// Methods
const handleTeamImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/logo.png'
}

const getRowClass = (index: number, totalTeams: number): string => {
  // Los primeros equipos clasifican, el último es eliminación
  if (index < Math.max(1, totalTeams - 1)) {
    return 'qualify'
  }
  return 'elimination'
}

const loadStatistics = async () => {
  if (!props.tournament?.id) return

  loading.value = true
  error.value = null

  try {
    const result = await getTournamentTeamStatistics(props.tournament.id)
    if (result.success && result.statistics) {
      teamStatistics.value = result.statistics
    } else {
      teamStatistics.value = []
      error.value = result.message
    }
  } catch (err) {
    teamStatistics.value = []
    error.value = 'Error al cargar las estadísticas'
    console.error('Error loading statistics:', err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadTeams() // Cargar equipos para obtener nombres
  await loadStatistics()
})

// Watchers
watch(() => props.tournament?.id, (newId) => {
  if (newId) {
    loadStatistics()
  }
})
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
  padding: 2rem 2rem 4rem 2rem;
}

.section-header {
  margin-bottom: 3rem;
  text-align: center;
  width: 100%;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #3498db, #2980b9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.section-description {
  font-size: 1.1rem;
  color: #bdc3c7;
  margin: 0;
}

.classification-container {
  background: var(--bg-secondary);
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  box-sizing: border-box;
  padding: 2rem 0;
  border-top: 1px solid var(--border-primary);
  border-bottom: 1px solid var(--border-primary);
  overflow-x: hidden;
}

.tournament-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.15rem;
  padding: 0 1rem 1rem;
  width: calc(100% - 4rem);
  max-width: 1200px;
  margin: 0 auto 1rem auto;
  color: var(--text-primary);
}

.tournament-info .tournament-name {
  font-size: 1.25rem;
  font-weight: 800;
}

.tournament-info .tournament-phase {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.loading-container,
.error-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: var(--text-primary);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-primary);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: var(--primary-color-dark);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  padding: 0 2rem 3rem 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.group-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px var(--shadow-medium);
  border: 1px solid var(--border-primary);
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.group-header {
  background: var(--primary-gradient);
  color: var(--white);
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 1.25rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.classification-table {
  background: var(--card-bg);
  overflow: visible;
}

.table-body {
  background: var(--card-bg);
}

.classification-table::-webkit-scrollbar {
  display: none;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 40px 1fr 45px 40px 40px 40px 45px 45px 50px 45px;
  gap: 0.25rem;
  align-items: center;
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  min-width: 0;
  width: 100%;
}

.table-header {
  background: var(--primary-color);
  font-weight: 700;
  color: var(--white);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--primary-color-dark);
  font-size: 0.75rem;
}

.table-row {
  border-bottom: 1px solid var(--border-primary);
  transition: all 0.2s ease;
  background: var(--card-bg);
  color: #ffffff;
}

.table-row:nth-child(even) {
  background: var(--bg-secondary);
}

.table-row:hover {
  background: var(--card-hover-bg);
  transform: translateX(2px);
}

.table-row.qualify {
  border-left: 4px solid #22c55e;
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.05), var(--card-bg));
}

.table-row.qualify::after {
  content: '';
}

.table-row.elimination {
  border-left: 4px solid #ef4444;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.05), var(--card-bg));
}

.table-row.elimination::after {
  content: '';
}

.pos {
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  background: var(--primary-color-alpha-30);
  border-radius: 6px;
  padding: 0.3rem 0.1rem;
  font-size: 0.8rem;
  border: 1px solid var(--border-primary);
}

.team {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #ffffff;
  padding: 0.2rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team img {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid var(--border-primary);
  flex-shrink: 0;
}

.team span {
  font-size: 0.8rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.games,
.wins,
.draws,
.losses,
.goals-for,
.goals-against,
.goal-diff,
.points {
  text-align: center;
  font-weight: 600;
  color: #ffffff;
  padding: 0.2rem 0.1rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.wins {
  color: #ffffff;
}

.draws {
  color: #ffffff;
}

.losses {
  color: #ffffff;
}

.goals-for {
  color: #ffffff;
}

.goals-against {
  color: #ffffff;
}

.goal-diff {
  color: #ffffff;
  font-weight: 700;
}

.goal-diff::before {
  display: none;
}

.points {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 900;
}

.classification-legend {
  display: flex;
  gap: 2rem;
  padding: 2rem 2rem 1rem;
  flex-wrap: wrap;
  background: var(--bg-secondary);
  justify-content: center;
  margin-top: 2rem;
  border-top: 2px solid var(--border-primary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-item.qualify .legend-color {
  background: #22c55e;
}

.legend-item.elimination .legend-color {
  background: #ef4444;
}

.classification-legend-siglas {
  padding: 1.25rem 2rem 2rem;
  background: transparent;
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
  border-top: 1px solid var(--border-primary);
}

.classification-legend-siglas h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  color: var(--text-primary);
  font-weight: 700;
  text-align: center;
}

.siglas-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.siglas-list li {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.siglas-list li strong {
  color: var(--primary-color);
  margin-right: 0.4rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .groups-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .groups-grid {
    padding: 0.5rem;
  }

  .table-header,
  .table-row {
    grid-template-columns: 35px 1fr 40px 35px 35px 35px 40px 40px 45px 40px;
    padding: 0.5rem 0.6rem;
    font-size: 0.75rem;
    gap: 0.2rem;
  }

  .team img {
    width: 20px;
    height: 20px;
  }

  .team span {
    font-size: 0.75rem;
  }

  .pos {
    padding: 0.25rem 0.1rem;
    font-size: 0.75rem;
  }

  .games,
  .wins,
  .draws,
  .losses,
  .goals-for,
  .goals-against,
  .goal-diff,
  .points {
    font-size: 0.75rem;
    padding: 0.2rem 0.05rem;
    min-height: 20px;
  }

  .points {
    font-size: 0.8rem;
  }

  .siglas-list {
    grid-template-columns: 1fr;
  }

  .classification-legend-siglas {
    padding: 0.75rem 1rem 1rem;
  }
}

@media (max-width: 480px) {
  .classification-container {
    padding: 1rem 0;
  }

  .table-header,
  .table-row {
    grid-template-columns: 30px 1fr 35px 30px 30px 30px 35px 35px 40px 35px;
    padding: 0.4rem 0.5rem;
    font-size: 0.7rem;
    gap: 0.15rem;
  }

  .team img {
    width: 18px;
    height: 18px;
  }

  .team span {
    font-size: 0.7rem;
  }

  .pos {
    padding: 0.2rem 0.05rem;
    font-size: 0.7rem;
  }

  .games,
  .wins,
  .draws,
  .losses,
  .goals-for,
  .goals-against,
  .goal-diff,
  .points {
    font-size: 0.7rem;
    padding: 0.15rem 0.03rem;
    min-height: 18px;
  }

  .points {
    font-size: 0.75rem;
  }

  .classification-legend {
    padding: 1rem;
    gap: 1rem;
  }

  .group-header {
    font-size: 1rem;
    padding: 0.8rem 1rem;
  }
}
</style>
