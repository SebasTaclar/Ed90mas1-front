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
        <p>Cargando clasificación...</p>
      </div>

      <!-- Grupos dinámicos -->
      <div v-if="groupedTeams.length > 0" class="groups-grid">
        <div v-for="group in groupedTeams" :key="group.groupId" class="group-card">
          <div class="group-header">Grupo {{ group.groupName }}</div>
          <div class="classification-table">
            <div class="table-header">
              <div class="pos">#</div>
              <div class="team">Equipo</div>
              <div class="points">PTS</div>
              <div class="games">PJ</div>
              <div class="wins">G</div>
              <div class="draws">E</div>
              <div class="losses">P</div>
              <div class="goals-for">GF</div>
              <div class="goals-against">GC</div>
              <div class="goal-diff">DG</div>
            </div>
            <div class="table-body">
              <div v-for="(team, index) in group.teams" :key="team.teamId"
                   class="table-row" :class="getRowClass(index, group.teams.length)">
                <div class="pos">{{ index + 1 }}</div>
                <div class="team">
                  <img :src="getTeamLogoPath(team.teamId)"
                       :alt="team.teamName"
                       @error="handleTeamImageError"
                       class="team-logo">
                  <span class="team-name">{{ team.teamName }}</span>
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
      <div v-else-if="!loading" class="empty-state">
        <p>No hay equipos configurados para este torneo</p>
        <p><small>Revisa la configuración de grupos y equipos</small></p>
      </div>

      <!-- Leyenda y siglas -->
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

        <div class="classification-legend-siglas" aria-label="Significado de siglas">
          <h3>Significado de las siglas</h3>
          <ul class="siglas-list">
            <li><strong>PJ</strong> — Partidos Jugados</li>
            <li><strong>G</strong> — Partidos Ganados</li>
            <li><strong>E</strong> — Partidos Empatados</li>
            <li><strong>P</strong> — Partidos Perdidos</li>
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
import type { TeamStatistics } from '@/services/api/tournamentService'
import type { Tournament } from '@/types/TournamentType'

// Interface para equipo con información de grupo
interface TeamWithGroup {
  id: number
  name: string
  logoPath?: string | null
  groupId?: number
  groupName?: string
}

// Props
interface Props {
  tournament?: Tournament | null
  tournamentTeams?: TeamWithGroup[]
}

const props = defineProps<Props>()

// Composables
const { getTournamentTeamStatistics } = useTournaments()

// State
const teamStatistics = ref<TeamStatistics[]>([])
const loading = ref(false)

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
  if (!props.tournamentTeams || props.tournamentTeams.length === 0) {
    return []
  }

  // Agrupar equipos por groupId
  const groupsMap = new Map<number, GroupWithTeams>()

  props.tournamentTeams.forEach(teamInfo => {
    const groupId = teamInfo.groupId
    const groupName = teamInfo.groupName || `Grupo ${groupId}`

    if (!groupId) {
      return
    }

    // Inicializar grupo si no existe
    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        groupId,
        groupName,
        teams: []
      })
    }

    // Buscar estadísticas del equipo (OPCIONAL - puede no existir si no ha jugado)
    const stats = teamStatistics.value.find(stat => stat.teamId === teamInfo.id)

    // Crear equipo con estadísticas (usar stats si existen, sino todo en 0)
    const teamWithStats: TeamWithStats = stats ? {
      ...stats,
      teamName: teamInfo.name // Asegurar que usamos el nombre correcto
    } : {
      // Equipo sin estadísticas = no ha jugado = todo en 0
      teamId: teamInfo.id,
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

    groupsMap.get(groupId)!.teams.push(teamWithStats)
  })

  // Convertir Map a Array y ordenar por groupId
  const result = Array.from(groupsMap.values()).sort((a, b) => a.groupId - b.groupId)

  // Ordenar equipos dentro de cada grupo por puntos, diferencia de goles, goles a favor
  result.forEach(group => {
    group.teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.teamName.localeCompare(b.teamName)
    })
  })

  return result
})

// Methods
const handleTeamImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/logo.png'
}

const getTeamLogoPath = (teamId: number): string => {
  const team = props.tournamentTeams?.find(t => t.id === teamId)
  // Usar exactamente el mismo patrón que cronograma y resultados
  return team?.logoPath || '/images/logo.png'
}

const getRowClass = (index: number, totalTeams: number): string => {
  if (index < Math.max(1, totalTeams - 1)) {
    return 'qualify'
  }
  return 'elimination'
}

const loadStatistics = async () => {
  if (!props.tournament?.id) return

  loading.value = true

  try {
    const result = await getTournamentTeamStatistics(props.tournament.id)
    if (result.success && result.statistics) {
      teamStatistics.value = result.statistics
    } else {
      teamStatistics.value = []
    }
  } catch (err) {
    teamStatistics.value = []
    console.error('Error loading statistics:', err)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await loadStatistics()
  } catch (error) {
    console.error('Error in component mounting:', error)
  }
})

// Watchers
watch(() => props.tournament?.id, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    await loadStatistics()
  }
})
</script>

<style scoped>
/* Section header */
.section-content {
  padding: 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.section-description {
  color: var(--app-text-secondary);
  font-size: 1rem;
  margin: 0;
}

/* Tournament info */
.tournament-info {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  border-radius: var(--border-radius-lg);
  color: white;
  box-shadow: var(--shadow-medium);
}

.tournament-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.tournament-phase {
  font-size: 1rem;
  opacity: 0.9;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--app-border-color);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Groups grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  padding: 0;
  max-width: 100%;
}

/* Group card */
.group-card {
  background: var(--app-bg-secondary);
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-medium);
  transition: var(--transition-normal);
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-heavy);
}

.group-header {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--tertiary-blue) 100%);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 1.25rem;
  text-align: center;
}

/* Classification table */
.classification-table {
  background: var(--app-card-bg);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--app-border-color);
}

.table-header {
  display: grid;
  grid-template-columns: 50px 1fr 60px 50px 50px 50px 50px 60px 60px 60px;
  background: var(--primary-blue);
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
}

.table-header > div {
  padding: 1rem 0.5rem;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.table-header > div:last-child {
  border-right: none;
}

.table-body {
  background: var(--app-card-bg);
}

.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 60px 50px 50px 50px 50px 60px 60px 60px;
  align-items: center;
  border-bottom: 1px solid var(--app-border-color);
  transition: var(--transition-fast);
}

.table-row:hover {
  background: var(--app-hover-bg);
}

.table-row:last-child {
  border-bottom: none;
}

/* Position */
.pos {
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  color: var(--app-text-primary);
  padding: 0.75rem 0.5rem;
}

/* Team info */
.team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
}

.team-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--app-border-color);
  background: var(--app-bg-primary);
}

.team-name {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.95rem;
}

/* Stats cells */
.points,
.games,
.wins,
.draws,
.losses,
.goals-for,
.goals-against,
.goal-diff {
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.75rem 0.5rem;
  color: var(--app-text-primary);
}

.points {
  background: var(--primary-blue);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 6px;
  margin: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

.goal-diff {
  font-weight: 700;
}

.goal-diff.positive {
  color: var(--success);
}

.goal-diff.negative {
  color: var(--danger);
}

.goal-diff.zero {
  color: var(--app-text-secondary);
}

/* Row position indicators */
.table-row.qualify {
  border-left: 4px solid var(--success);
}

.table-row.elimination {
  border-left: 4px solid var(--danger);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--app-text-secondary);
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--app-text-primary);
}

/* Dark theme adjustments */
:root[data-theme='dark'] .group-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

:root[data-theme='dark'] .table-header {
  background: rgba(255, 255, 255, 0.03);
}

:root[data-theme='dark'] .team-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

:root[data-theme='dark'] .team-logo {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Mobile responsive */
/* Tablet styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .groups-grid {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .classification-container {
    padding: 0.5rem 0;
  }

  .groups-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin: 0;
    padding: 0 0.25rem;
  }
  
  .group-card {
    margin: 0;
    border-radius: var(--border-radius-md);
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 25px 1fr 35px 25px 25px 25px 25px 30px 30px 35px;
    font-size: 0.65rem;
  }
  
  .table-header > div,
  .table-row > div {
    padding: 0.4rem 0.1rem;
  }
  
  .team-logo {
    width: 20px;
    height: 20px;
  }
  
  .team-name {
    font-size: 0.65rem;
    padding-left: 0.2rem;
  }

  .pos {
    font-size: 0.6rem;
    font-weight: 600;
  }

  .points {
    font-size: 0.7rem;
    font-weight: 700;
  }

  .group-header {
    font-size: 0.9rem;
    padding: 0.6rem;
  }
}

@media (max-width: 480px) {
  .section-header h2 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  .tournament-info {
    margin: 0 0.25rem 1rem 0.25rem;
    padding: 0.5rem;
  }
  
  .tournament-name {
    font-size: 1rem;
  }

  .groups-grid {
    padding: 0 0.1rem;
    gap: 0.75rem;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 20px 1fr 30px 22px 22px 22px 22px 28px 28px 30px;
    font-size: 0.55rem;
  }
  
  .table-header > div,
  .table-row > div {
    padding: 0.3rem 0.05rem;
  }

  .team-logo {
    width: 16px;
    height: 16px;
  }
  
  .team-name {
    font-size: 0.55rem;
    padding-left: 0.15rem;
    line-height: 1.2;
  }

  .pos {
    font-size: 0.5rem;
    font-weight: 600;
  }
  
  .points {
    font-size: 0.6rem;
    font-weight: 700;
  }

  .group-header {
    font-size: 0.8rem;
    padding: 0.5rem;
  }

  /* Hacer las columnas numéricas más compactas */
  .games, .wins, .draws, .losses {
    font-size: 0.5rem;
  }

  .goals-for, .goals-against, .goal-diff {
    font-size: 0.5rem;
  }
}
</style>
