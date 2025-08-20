<template>
  <div class="tournament-detail">
    <!-- Header principal con imagen mejorada -->
    <header class="tournament-hero">
      <div class="hero-background">
        <img :src="selectedTournament?.bannerPath ?? '/images/torneo_encurso_M.jpg'" :alt="selectedTournament?.name"
          @error="handleImageError">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="tournament-logo-hero">
          <img :src="selectedTournament?.bannerPath ?? '/images/torneo_encurso_M.jpg'" :alt="selectedTournament?.name"
            @error="handleImageError">
          <div class="logo-badge">
            <span>2ª ED.</span>
          </div>
        </div>
        <div class="tournament-info-hero">
          <div class="status-badge live">
            <span class="status-dot"></span>
            <span>EN VIVO</span>
          </div>
          <h1>{{ selectedTournament?.name }}</h1>
          <div class="tournament-meta-hero">
            <div class="meta-item">
              <span class="meta-icon">👥</span>
              <span>{{ selectedTournament?.maxTeams || 16 }} equipos</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span>{{ formatDateRange(selectedTournament?.startDate, selectedTournament?.endDate) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span>{{ getTournamentPhase(selectedTournament) }}</span>
            </div>
          </div>
          <div class="progress-hero">
            <div class="progress-info">
              <span>Progreso del torneo</span>
              <span>{{ getTournamentProgress(selectedTournament) }}%</span>
            </div>
            <div class="progress-bar-hero">
              <div class="progress-fill" :style="{ width: getTournamentProgress(selectedTournament) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Navegación horizontal moderna -->
    <nav class="tournament-navigation">
      <div class="nav-cards-container">
        <div class="nav-cards-scroll">
          <div v-for="section in navigationSections" :key="section.id"
            :class="['nav-card', { active: activeSection === section.id }]" @click="setActiveSection(section.id)">
            <div class="nav-card-glow"></div>
            <div class="nav-card-icon">
              <span>{{ section.icon }}</span>
            </div>
            <div class="nav-card-content">
              <h3>{{ section.label }}</h3>
              <p>{{ getNavigationDescription(section.id) }}</p>
            </div>
            <div class="nav-card-indicator"></div>
          </div>
        </div>

        <!-- Controles de navegación -->
        <div class="nav-scroll-controls">
          <button class="nav-scroll-btn nav-scroll-left" @click="scrollNavLeft" :disabled="isNavScrollAtStart">
            <span>←</span>
          </button>
          <button class="nav-scroll-btn nav-scroll-right" @click="scrollNavRight" :disabled="isNavScrollAtEnd">
            <span>→</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="tournament-main">
      <!-- Contenido dinámico según la sección -->
      <section class="content-section">
        <div class="container">
          <!-- Sección: Cronograma -->
          <div v-if="activeSection === 'cronograma'" class="section-content">
            <div class="section-header">
              <h2>📅 Cronograma</h2>
              <p class="section-description">Calendario completo de partidos programados</p>
            </div>

            <div class="schedule-container">
              <!-- Estado de carga -->
              <div v-if="matchesLoading" class="loading-state-centered">
                <div class="spinner"></div>
                <p>Cargando cronograma...</p>
              </div>

              <!-- Sin partidos programados -->
              <div v-else-if="tournamentMatches.length === 0" class="empty-state-centered">
                <span>📅</span>
                <h3>Sin partidos programados</h3>
                <p>Este torneo aún no tiene partidos en el cronograma.</p>
              </div>

              <!-- Cronograma con partidos reales -->
              <div v-else class="schedule-timeline">
                <div class="schedule-stats">
                  <div class="stat-mini">
                    <span class="stat-label">Total partidos</span>
                    <span class="stat-value">{{ tournamentMatches.length }}</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-label">Por jugar</span>
                    <span class="stat-value">{{ getMatchesByStatus('scheduled').length }}</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-label">Completados</span>
                    <span class="stat-value">{{ getMatchesByStatus('completed').length }}</span>
                  </div>
                </div>

                <!-- Lista de partidos agrupados por fecha -->
                <div v-for="(dayMatches, date) in matchesByDate" :key="date" class="match-day">
                  <div class="day-header">
                    <h3>{{ formatMatchDate(date.toString()) }}</h3>
                    <span class="day-date">{{ dayMatches.length }} partido{{ dayMatches.length !== 1 ? 's' : ''
                      }}</span>
                  </div>
                  <div class="matches-list">
                    <div v-for="match in dayMatches" :key="match.id" class="match-card">
                      <div class="match-time">
                        {{ formatMatchTime(match.matchDate || match.scheduledDate) }}
                      </div>
                      <div class="match-teams">
                        <div class="team">
                          <img :src="match.homeTeam?.logoPath || '/images/logo.png'" :alt="match.homeTeam?.name"
                            @error="handleTeamImageError">
                          <span>{{ match.homeTeam?.name || 'Equipo Local' }}</span>
                        </div>
                        <div class="vs">
                          {{ getMatchScore(match) }}
                        </div>
                        <div class="team">
                          <img :src="match.awayTeam?.logoPath || '/images/logo.png'" :alt="match.awayTeam?.name"
                            @error="handleTeamImageError">
                          <span>{{ match.awayTeam?.name || 'Equipo Visitante' }}</span>
                        </div>
                      </div>
                      <div class="match-status" :class="getMatchStatusClass(match.status)">
                        {{ getMatchStatusText(match.status) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Resultados -->
          <div v-else-if="activeSection === 'resultados'" class="section-content">
            <div class="section-header">
              <h2>⚽ Resultados</h2>
              <p class="section-description">Resultados de todos los partidos disputados</p>
            </div>

            <div class="results-container">
              <!-- Estadísticas generales -->
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">⚽</div>
                  <div class="stat-content">
                    <span class="stat-number">24</span>
                    <span class="stat-label">Goles totales</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🥅</div>
                  <div class="stat-content">
                    <span class="stat-number">8</span>
                    <span class="stat-label">Partidos jugados</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">👤</div>
                  <div class="stat-content">
                    <span class="stat-number">12</span>
                    <span class="stat-label">Goleadores</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🟨</div>
                  <div class="stat-content">
                    <span class="stat-number">5</span>
                    <span class="stat-label">Tarjetas amarillas</span>
                  </div>
                </div>
              </div>

              <!-- Resultados recientes -->
              <div class="recent-results">
                <h3>Resultados recientes</h3>
                <div class="results-list">
                  <div class="result-card">
                    <div class="match-info">
                      <span class="match-date">10 Ago</span>
                      <span class="match-round">Jornada 1</span>
                    </div>
                    <div class="match-result">
                      <div class="team-result">
                        <img src="/images/logo.png" alt="Drink Team" @error="handleTeamImageError">
                        <span class="team-name">Drink Team</span>
                        <span class="team-score winner">3</span>
                      </div>
                      <div class="result-separator">-</div>
                      <div class="team-result">
                        <span class="team-score">1</span>
                        <span class="team-name">Tecno Stop</span>
                        <img src="/images/logo.png" alt="Tecno Stop" @error="handleTeamImageError">
                      </div>
                    </div>
                    <div class="match-actions">
                      <button class="action-btn">Ver detalles</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Clasificación -->
          <div v-else-if="activeSection === 'clasificacion'" class="section-content">
            <div class="section-header">
              <h2>🏆 Tabla de Clasificación</h2>
              <p class="section-description">Posiciones actuales de todos los equipos</p>
            </div>

            <div class="classification-container">
              <!-- Leyenda -->
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

              <!-- Tabla de posiciones -->
              <div class="classification-table">
                <div class="table-header">
                  <div class="pos">#</div>
                  <div class="team">Equipo</div>
                  <div class="games">PJ</div>
                  <div class="wins">PG</div>
                  <div class="draws">PE</div>
                  <div class="losses">PP</div>
                  <div class="goals-for">GF</div>
                  <div class="goals-against">GC</div>
                  <div class="goal-diff">DG</div>
                  <div class="points">PTS</div>
                </div>

                <div class="table-body">
                  <div class="table-row qualify">
                    <div class="pos">1</div>
                    <div class="team">
                      <img src="/images/logo.png" alt="Drink Team" @error="handleTeamImageError">
                      <span>Drink Team</span>
                    </div>
                    <div class="games">3</div>
                    <div class="wins">3</div>
                    <div class="draws">0</div>
                    <div class="losses">0</div>
                    <div class="goals-for">8</div>
                    <div class="goals-against">2</div>
                    <div class="goal-diff">+6</div>
                    <div class="points">9</div>
                  </div>

                  <div class="table-row qualify">
                    <div class="pos">2</div>
                    <div class="team">
                      <img src="/images/logo.png" alt="Olympia FC" @error="handleTeamImageError">
                      <span>Olympia FC</span>
                    </div>
                    <div class="games">3</div>
                    <div class="wins">2</div>
                    <div class="draws">1</div>
                    <div class="losses">0</div>
                    <div class="goals-for">6</div>
                    <div class="goals-against">3</div>
                    <div class="goal-diff">+3</div>
                    <div class="points">7</div>
                  </div>

                  <div class="table-row">
                    <div class="pos">3</div>
                    <div class="team">
                      <img src="/images/logo.png" alt="La Fábrica" @error="handleTeamImageError">
                      <span>La Fábrica</span>
                    </div>
                    <div class="games">3</div>
                    <div class="wins">2</div>
                    <div class="draws">0</div>
                    <div class="losses">1</div>
                    <div class="goals-for">5</div>
                    <div class="goals-against">4</div>
                    <div class="goal-diff">+1</div>
                    <div class="points">6</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección: Rankings y encuestas -->
          <div v-else-if="activeSection === 'rankings'" class="section-content">
            <div class="section-header">
              <h2>Rankings y encuestas</h2>
            </div>
            <div class="coming-soon">
              <span>📊</span>
              <h3>Próximamente</h3>
              <p>Los rankings y encuestas estarán disponibles durante el torneo</p>
            </div>
          </div>

          <!-- Sección: Fotos, videos y noticias -->
          <div v-else-if="activeSection === 'fotos'" class="section-content">
            <div class="section-header">
              <h2>Fotos, videos y noticias</h2>
            </div>
            <div class="coming-soon">
              <span>📸</span>
              <h3>Próximamente</h3>
              <p>Las fotos, videos y noticias del torneo se publicarán aquí</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTournaments } from '@/composables/useTournaments'
import { useTeams } from '@/composables/useTeams'
import { useFixtures } from '@/composables/useFixtures'
import type { Tournament } from '@/types/TournamentType'
import type { Team } from '@/types/TeamType'
import type { Match } from '@/services/matchesService'

const route = useRoute()
const router = useRouter()
const { tournaments, loadTournaments } = useTournaments()
const { teams, loadTeams } = useTeams()
const { loadTournamentMatches } = useFixtures()

// Estado reactivo
const activeSection = ref('cronograma')
const tournamentTeams = ref<Team[]>([])
const selectedTournament = ref<Tournament | null>(null)
const tournamentMatches = ref<Match[]>([]) // Matches reales del torneo
const matchesLoading = ref(false) // Estado de carga de matches
const isNavScrollAtStart = ref(true)
const isNavScrollAtEnd = ref(false)

// Secciones de navegación
const navigationSections = [
  { id: 'cronograma', label: 'Cronograma', icon: '📅' },
  { id: 'resultados', label: 'Resultados', icon: '⚽' },
  { id: 'clasificacion', label: 'Clasificación', icon: '🏆' },
  { id: 'rankings', label: 'Rankings y encuestas', icon: '📊' },
  { id: 'fotos', label: 'Fotos, vídeos y noticias', icon: '📸' }
]

// Función para cambiar sección activa
const setActiveSection = (sectionId: string) => {
  activeSection.value = sectionId
}

// Función para obtener descripción de navegación
const getNavigationDescription = (sectionId: string): string => {
  const descriptions: { [key: string]: string } = {
    'cronograma': 'Calendario de partidos',
    'resultados': 'Marcadores y estadísticas',
    'clasificacion': 'Tabla de posiciones',
    'rankings': 'Estadísticas y encuestas',
    'fotos': 'Multimedia y noticias'
  }
  return descriptions[sectionId] || 'Información del torneo'
}

// Funciones de scroll para navegación
const scrollNavLeft = () => {
  const container = document.querySelector('.nav-cards-scroll') as HTMLElement
  if (container) {
    // Calcular el ancho de desplazamiento basado en el ancho de una card (260px + gap)
    const scrollAmount = 276 // 260px card + 16px gap
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    // Actualizar estado después del scroll
    setTimeout(updateScrollButtons, 300)
  }
}

const scrollNavRight = () => {
  const container = document.querySelector('.nav-cards-scroll') as HTMLElement
  if (container) {
    // Calcular el ancho de desplazamiento basado en el ancho de una card (260px + gap)
    const scrollAmount = 276 // 260px card + 16px gap
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    // Actualizar estado después del scroll
    setTimeout(updateScrollButtons, 300)
  }
}

// Función para actualizar el estado de los botones de scroll
const updateScrollButtons = () => {
  const container = document.querySelector('.nav-cards-scroll') as HTMLElement
  if (container) {
    isNavScrollAtStart.value = container.scrollLeft <= 0
    isNavScrollAtEnd.value = container.scrollLeft >= container.scrollWidth - container.clientWidth
  }
}

// Inicializar scroll listeners cuando el componente se monta
onMounted(() => {
  const container = document.querySelector('.nav-cards-scroll') as HTMLElement
  if (container) {
    // Configurar scroll listener
    container.addEventListener('scroll', updateScrollButtons)
    // Inicializar estado
    setTimeout(updateScrollButtons, 100)
  }
})

// Función para formatear rango de fechas
const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate || !endDate) return ''

  const start = new Date(startDate)
  const end = new Date(endDate)

  const startMonth = start.toLocaleDateString('es-ES', { month: 'short' })
  const endMonth = end.toLocaleDateString('es-ES', { month: 'short' })
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${year}`
  }

  return `${startMonth} - ${endMonth} ${year}`
}

// Función para determinar la fase del torneo
const getTournamentPhase = (tournament?: Tournament | null): string => {
  if (!tournament) return ''

  const now = new Date()
  const start = new Date(tournament.startDate)
  const end = new Date(tournament.endDate)

  if (now < start) {
    return 'Por comenzar'
  } else if (now > end) {
    return 'Finalizado'
  } else {
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    const progress = Math.round((elapsed / totalDuration) * 100)

    if (progress < 30) {
      return 'Fase de grupos'
    } else if (progress < 70) {
      return 'Fase intermedia'
    } else {
      return 'Fase final'
    }
  }
}

// Función para calcular el progreso del torneo
const getTournamentProgress = (tournament?: Tournament | null): number => {
  if (!tournament) return 0

  const now = new Date()
  const start = new Date(tournament.startDate)
  const end = new Date(tournament.endDate)

  if (now < start) {
    return 0 // No ha comenzado
  } else if (now > end) {
    return 100 // Ha terminado
  } else {
    // Calcular progreso basado en fechas
    const totalDuration = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / totalDuration) * 100)
  }
}

// Funciones para manejar errores de imagen
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/torneo_encurso_M.jpg'
}

const handleTeamImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/logo.png'
}

// Cargar datos del torneo
const loadTournamentData = async () => {
  const tournamentId = route.params.id

  if (!tournamentId) {
    router.push('/')
    return
  }

  // Buscar el torneo específico
  const tournament = tournaments.value.find(t => t.id.toString() === tournamentId)

  if (tournament) {
    selectedTournament.value = tournament
    // Cargar equipos reales del torneo
    await loadTournamentTeams()
    // Cargar matches del torneo
    await loadTournamentMatchesData()
  } else {
    // Si no se encuentra el torneo, redirigir al home
    router.push('/')
  }
}

// Cargar equipos del torneo específico
const loadTournamentTeams = async () => {
  if (!selectedTournament.value) {
    return
  }

  try {
    // Asegurarse de que los equipos estén cargados
    if (teams.value.length === 0) {
      await loadTeams()
    }

    // Filtrar equipos que pertenezcan a este torneo específico
    const tournamentId = selectedTournament.value.id
    const teamsInTournament = teams.value.filter(team =>
      team.tournaments.some(tournament => tournament.id === tournamentId)
    )

    tournamentTeams.value = teamsInTournament

    console.log(`Equipos encontrados para el torneo ${selectedTournament.value.name}:`, teamsInTournament.length)
  } catch (err) {
    console.error('Error al cargar equipos del torneo:', err)
    // En caso de error, usar equipos de ejemplo
    loadMockTeams()
  }
}

// Cargar matches del torneo específico
const loadTournamentMatchesData = async () => {
  if (!selectedTournament.value) {
    return
  }

  matchesLoading.value = true

  try {
    const matches = await loadTournamentMatches(selectedTournament.value.id)

    if (matches && matches.length > 0) {
      tournamentMatches.value = matches
      console.log(`Matches cargados para el torneo ${selectedTournament.value.name}:`, matches.length)
    } else {
      tournamentMatches.value = []
      console.log('No hay matches para este torneo')
    }
  } catch (err) {
    console.error('Error al cargar matches del torneo:', err)
    tournamentMatches.value = []
  } finally {
    matchesLoading.value = false
  }
}

// Cargar equipos de ejemplo (como fallback)
const loadMockTeams = () => {
  console.warn('Usando equipos de ejemplo como fallback')
  tournamentTeams.value = [
    {
      id: 1,
      name: 'Drink Team',
      logoPath: '/images/logo.png',
      userId: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 1, email: 'test@test.com', name: 'Test User' },
      teamTournaments: [],
      tournaments: []
    },
    {
      id: 2,
      name: 'Tecno Stop',
      logoPath: '/images/logo.png',
      userId: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 2, email: 'test2@test.com', name: 'Test User 2' },
      teamTournaments: [],
      tournaments: []
    },
    {
      id: 3,
      name: 'Olympia FC',
      logoPath: '/images/logo.png',
      userId: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 3, email: 'test3@test.com', name: 'Test User 3' },
      teamTournaments: [],
      tournaments: []
    }
  ]
}

// Funciones para manejar matches
const matchesByDate = computed(() => {
  const grouped: { [key: string]: Match[] } = {}

  tournamentMatches.value.forEach(match => {
    const date = match.matchDate || match.scheduledDate
    if (date) {
      const dateKey = date.split('T')[0] // Obtener solo la fecha (YYYY-MM-DD)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(match)
    }
  })

  // Ordenar fechas cronológicamente
  const sortedDates = Object.keys(grouped).sort()
  const sortedGrouped: { [key: string]: Match[] } = {}

  sortedDates.forEach(date => {
    // Ordenar matches por hora dentro de cada fecha
    sortedGrouped[date] = grouped[date].sort((a, b) => {
      const timeA = a.matchDate || a.scheduledDate || ''
      const timeB = b.matchDate || b.scheduledDate || ''
      return timeA.localeCompare(timeB)
    })
  })

  return sortedGrouped
})

const getMatchesByStatus = (status: string) => {
  return tournamentMatches.value.filter(match => match.status === status)
}

const formatMatchDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatMatchTime = (dateString?: string) => {
  if (!dateString) return '--:--'
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMatchScore = (match: Match) => {
  if (match.status === 'completed' && match.homeScore !== null && match.awayScore !== null) {
    return `${match.homeScore} - ${match.awayScore}`
  }
  return 'VS'
}

const getMatchStatusClass = (status?: string) => {
  switch (status) {
    case 'scheduled':
      return 'pending'
    case 'in_progress':
      return 'live'
    case 'completed':
      return 'finished'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}

const getMatchStatusText = (status?: string) => {
  switch (status) {
    case 'scheduled':
      return 'Por jugar'
    case 'in_progress':
      return 'En juego'
    case 'completed':
      return 'Finalizado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Por jugar'
  }
}

// Montar componente
onMounted(async () => {
  // Scroll to top para navegación móvil
  window.scrollTo({ top: 0, behavior: 'smooth' })

  await loadTournaments()
  await loadTournamentData()
})
</script>

<style scoped>
/* ESTILOS BASE */
.tournament-detail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #212529;
  transition: all 0.3s ease;
  padding-top: 60px;
  /* Compensar header fijo en desktop */
}

/* MODO OSCURO - Compatible con ThemeToggle */
[data-theme="dark"] .tournament-detail {
  background: linear-gradient(135deg, #0d1421 0%, #1a2332 100%);
  color: #ffffff;
}

[data-theme="dark"] .tournament-navigation {
  background: #1e293b;
  border-bottom: 1px solid #475569;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Cards de navegación en dark mode */
[data-theme="dark"] .nav-card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
}

[data-theme="dark"] .nav-card:hover {
  background: linear-gradient(145deg, #334155 0%, #1e293b 100%);
  border-color: #3b82f6;
}

[data-theme="dark"] .nav-card.active {
  background: linear-gradient(145deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

/* Contenido de las tarjetas de navegación en dark mode */
[data-theme="dark"] .nav-card-content h3 {
  color: #ffffff !important;
}

[data-theme="dark"] .nav-card-content p {
  color: #cbd5e1 !important;
}

/* Contenido principal en dark mode */
[data-theme="dark"] .tournament-main {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Secciones en dark mode */
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

/* Tarjetas generales en dark mode */
[data-theme="dark"] .about-card,
[data-theme="dark"] .contact-card,
[data-theme="dark"] .stat-card,
[data-theme="dark"] .schedule-container,
[data-theme="dark"] .match-card,
[data-theme="dark"] .team-card,
[data-theme="dark"] .ranking-card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Títulos y textos en dark mode */
[data-theme="dark"] .about-card h3,
[data-theme="dark"] .contact-card h3,
[data-theme="dark"] .stat-label,
[data-theme="dark"] .match-team,
[data-theme="dark"] .team-name,
[data-theme="dark"] .ranking-team {
  color: #ffffff;
}

[data-theme="dark"] .detail-label,
[data-theme="dark"] .detail-value,
[data-theme="dark"] .stat-number {
  color: #e2e8f0;
}

/* Botones en dark mode */
[data-theme="dark"] .filter-btn {
  background: #1e293b;
  border-color: #475569;
  color: #e2e8f0;
}

[data-theme="dark"] .filter-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

[data-theme="dark"] .nav-scroll-btn,
[data-theme="dark"] .theme-toggle-btn {
  background: #1e293b;
  border-color: #475569;
  color: #4dabf7;
}

/* Hero section en dark mode */
[data-theme="dark"] .tournament-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

[data-theme="dark"] .hero-overlay {
  background: linear-gradient(45deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
}

[data-theme="dark"] .tournament-info-hero h1 {
  color: #ffffff;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
}

[data-theme="dark"] .status-badge.live {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

[data-theme="dark"] .meta-item {
  color: #e2e8f0;
}

[data-theme="dark"] .progress-info {
  color: #cbd5e1;
}

/* Elementos específicos adicionales en dark mode */
[data-theme="dark"] .about-card-main {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .about-card-main h3,
[data-theme="dark"] .about-card-main h4 {
  color: #ffffff;
}

[data-theme="dark"] .about-card-main p,
[data-theme="dark"] .about-card-main span {
  color: #e2e8f0;
}

/* Tarjetas de equipos modernas en dark mode */
[data-theme="dark"] .team-card-modern {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .team-card-modern:hover {
  background: linear-gradient(145deg, #334155 0%, #475569 100%);
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .team-logo-modern {
  border-color: #475569;
  background: #0f172a;
}

[data-theme="dark"] .team-name-modern,
[data-theme="dark"] .team-info-modern {
  color: #ffffff;
}

[data-theme="dark"] .team-stats-modern {
  color: #cbd5e1;
}

/* Grid de equipos centrado */
[data-theme="dark"] .teams-grid-centered {
  background: transparent;
}

/* Textos generales faltantes */
[data-theme="dark"] .detail-item {
  background: #0f172a;
  border-color: #475569;
}

[data-theme="dark"] .detail-item:hover {
  background: #1e293b;
}

/* Títulos de secciones en dark mode */
[data-theme="dark"] .section-header h2 {
  color: #ffffff !important;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

/* Cronograma y otras secciones - textos blancos */
[data-theme="dark"] .schedule-container h3,
[data-theme="dark"] .results-container h3,
[data-theme="dark"] .classification-container h3,
[data-theme="dark"] .rankings-container h3 {
  color: #ffffff !important;
}

[data-theme="dark"] .schedule-container p,
[data-theme="dark"] .results-container p,
[data-theme="dark"] .classification-container p,
[data-theme="dark"] .rankings-container p {
  color: #e2e8f0 !important;
}

/* Sección de contacto en dark mode */
[data-theme="dark"] .contact-card h3,
[data-theme="dark"] .contact-card h4 {
  color: #ffffff !important;
}

[data-theme="dark"] .contact-card p,
[data-theme="dark"] .contact-card span,
[data-theme="dark"] .contact-details {
  color: #e2e8f0 !important;
}

/* Cifras y estadísticas - equipos participantes */
[data-theme="dark"] .tournament-stats,
[data-theme="dark"] .participant-count,
[data-theme="dark"] .tournament-info {
  color: #ffffff !important;
}

[data-theme="dark"] .participant-count .number,
[data-theme="dark"] .stats-number {
  color: #3b82f6 !important;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

/* Headers de tarjetas en dark mode */
[data-theme="dark"] .about-header h3,
[data-theme="dark"] .contact-header h3 {
  color: #ffffff !important;
}

/* Todos los textos de labels en dark mode */
[data-theme="dark"] .label,
[data-theme="dark"] .title,
[data-theme="dark"] .subtitle {
  color: #ffffff !important;
}

/* Contact items en dark mode */
[data-theme="dark"] .contact-item {
  background: #0f172a;
  border-color: #475569;
  color: #e2e8f0;
}

[data-theme="dark"] .contact-item:hover {
  background: #1e293b;
  border-color: #3b82f6;
}

[data-theme="dark"] .contact-item h4,
[data-theme="dark"] .contact-item .contact-title {
  color: #ffffff !important;
}

[data-theme="dark"] .contact-item p,
[data-theme="dark"] .contact-item span,
[data-theme="dark"] .contact-item .contact-value {
  color: #e2e8f0 !important;
}

/* Stat mini en dark mode */
[data-theme="dark"] .stat-mini {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .stat-mini:hover {
  background: linear-gradient(145deg, #334155 0%, #475569 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .stat-mini .stat-number,
[data-theme="dark"] .stat-mini .stat-value {
  color: #3b82f6 !important;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

[data-theme="dark"] .stat-mini .stat-label,
[data-theme="dark"] .stat-mini .stat-title {
  color: #ffffff !important;
}

/* Classification legend en dark mode */
[data-theme="dark"] .classification-legend {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
}

[data-theme="dark"] .classification-legend h4,
[data-theme="dark"] .classification-legend .legend-title {
  color: #ffffff !important;
}

[data-theme="dark"] .classification-legend p,
[data-theme="dark"] .classification-legend span,
[data-theme="dark"] .classification-legend .legend-item {
  color: #e2e8f0 !important;
}

/* Coming soon en dark mode */
[data-theme="dark"] .coming-soon {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .coming-soon h3,
[data-theme="dark"] .coming-soon h4 {
  color: #ffffff !important;
}

[data-theme="dark"] .coming-soon p,
[data-theme="dark"] .coming-soon span {
  color: #cbd5e1 !important;
}

[data-theme="dark"] .coming-soon .icon,
[data-theme="dark"] .coming-soon .emoji {
  filter: brightness(1.2);
}

/* Tabla de clasificación completa en dark mode */
[data-theme="dark"] .classification-table {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
  border-color: #475569;
  color: #e2e8f0;
}

[data-theme="dark"] .classification-table thead {
  background: #0f172a;
  border-bottom: 2px solid #475569;
}

[data-theme="dark"] .classification-table th {
  color: #ffffff !important;
  border-color: #475569;
  background: #1e293b;
}

[data-theme="dark"] .classification-table td {
  color: #e2e8f0 !important;
  border-color: #475569;
  background: transparent;
}

[data-theme="dark"] .classification-table tbody tr {
  background: transparent;
  border-bottom: 1px solid #475569;
}

[data-theme="dark"] .classification-table tbody tr:hover {
  background: #334155;
}

[data-theme="dark"] .classification-table tbody tr:nth-child(even) {
  background: rgba(15, 23, 42, 0.3);
}

[data-theme="dark"] .classification-table tbody tr:nth-child(even):hover {
  background: #334155;
}

/* Posiciones y números en la tabla */
[data-theme="dark"] .position-number,
[data-theme="dark"] .team-position {
  color: #3b82f6 !important;
  font-weight: bold;
}

[data-theme="dark"] .team-name-table {
  color: #ffffff !important;
}

[data-theme="dark"] .team-stats-table {
  color: #cbd5e1 !important;
}

/* Contenedor de clasificación */
[data-theme="dark"] .classification-container {
  background: transparent;
}

[data-theme="dark"] .classification-header {
  color: #ffffff !important;
}

/* Tabla de clasificación en móvil - dark mode */
@media (max-width: 768px) {
  [data-theme="dark"] .classification-table {
    border: 1px solid #475569;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  }

  [data-theme="dark"] .classification-table th {
    padding: 8px 4px;
    font-size: 0.8rem;
    border-right: 1px solid #475569;
    text-align: center;
  }

  [data-theme="dark"] .classification-table th:last-child {
    border-right: none;
  }

  [data-theme="dark"] .classification-table td {
    padding: 10px 4px;
    font-size: 0.85rem;
    border-right: 1px solid #475569;
    text-align: center;
    vertical-align: middle;
  }

  [data-theme="dark"] .classification-table td:last-child {
    border-right: none;
  }

  [data-theme="dark"] .classification-table tbody tr {
    border-bottom: 1px solid #475569;
  }

  [data-theme="dark"] .classification-table tbody tr:last-child {
    border-bottom: none;
  }

  /* Texto más pequeño en móvil */
  [data-theme="dark"] .team-name-table {
    font-size: 0.8rem !important;
    font-weight: 600;
  }

  [data-theme="dark"] .position-number {
    font-size: 0.9rem !important;
    font-weight: bold;
  }

  [data-theme="dark"] .team-stats-table {
    font-size: 0.75rem !important;
  }
}

/* Hero Section Mejorado */
.tournament-hero {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.hero-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(0, 17, 34, 0.8) 0%,
      rgba(0, 34, 68, 0.6) 50%,
      rgba(0, 17, 34, 0.8) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  gap: 3rem;
}

.tournament-logo-hero {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid #FFC107;
  box-shadow: 0 10px 30px rgba(255, 193, 7, 0.4);
}

.tournament-logo-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(1);
}

.logo-badge {
  position: absolute;
  bottom: -10px;
  right: -10px;
  background: #FFC107;
  color: #001122;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tournament-info-hero {
  flex: 1;
  color: white;
}

.status-badge.live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.tournament-info-hero h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.tournament-meta-hero {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.meta-icon {
  font-size: 1.2rem;
}

.progress-hero {
  max-width: 400px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar-hero {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFC107, #FFD54F);
  border-radius: 4px;
  transition: width 0.6s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

/* Navegación Horizontal Moderna */
.tournament-navigation {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  overflow: visible;
  margin: 0;
  padding: 0;
}

.nav-cards-container {
  position: relative;
  padding: 2rem 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow: visible;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-cards-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0.5rem 3rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-width: 100%;
}

.nav-cards-scroll::-webkit-scrollbar {
  display: none;
}

/* Cards de Navegación */
.nav-card {
  position: relative;
  min-width: 260px;
  max-width: 260px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #dee2e6;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-shrink: 0;
}

.nav-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 123, 255, 0.15);
  border-color: #007bff;
}

.nav-card.active {
  background: linear-gradient(145deg, #007bff 0%, #0056b3 100%);
  color: white;
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 123, 255, 0.3);
  border-color: #007bff;
}

.nav-card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(45deg, #007bff, #FFC107);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(20px);
  transform: scale(1.1);
}

.nav-card:hover .nav-card-glow {
  opacity: 0.1;
}

.nav-card.active .nav-card-glow {
  opacity: 0.2;
}

.nav-card-icon {
  width: 44px;
  height: 44px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.nav-card.active .nav-card-icon {
  background: rgba(255, 255, 255, 0.2);
}

.nav-card:hover .nav-card-icon {
  transform: scale(1.1) rotate(5deg);
}

.nav-card-content h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #212529;
  line-height: 1.3;
}

.nav-card.active .nav-card-content h3 {
  color: white;
}

.nav-card-content p {
  font-size: 0.8rem;
  color: #f0f3f5;
  margin: 0;
  line-height: 1.4;
}

.nav-card.active .nav-card-content p {
  color: rgba(255, 255, 255, 0.9);
}

.nav-card-indicator {
  width: 100%;
  height: 3px;
  background: #e9ecef;
  border-radius: 2px;
  margin-top: auto;
  transition: all 0.3s ease;
}

.nav-card.active .nav-card-indicator {
  background: #FFC107;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

/* Controles de scroll de navegación */
.nav-scroll-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.nav-scroll-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #dee2e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: all;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
  color: #007bff;
}

.nav-scroll-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.nav-scroll-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-scroll-left {
  margin-left: 10px;
}

.nav-scroll-right {
  margin-right: 10px;
}

/* Botón de toggle de tema */
.theme-toggle-btn {
  position: absolute;
  top: -60px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #dee2e6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;
}

.theme-toggle-btn:hover {
  background: linear-gradient(145deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-color: #007bff;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

/* Contenido principal */
.tournament-main {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.content-section {
  padding-top: 3rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
}

/* Contenido de secciones */
.content-section {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

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

/* Layout centrado para sección inicio */
.inicio-layout {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.section-header-centered {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header-centered h2 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #007bff, #0056b3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header-centered .section-description {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

/* Sección Acerca de */
.about-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-content-stacked {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
  max-width: 800px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.about-card-main,
.contact-card-below {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.about-card:hover,
.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 123, 255, 0.15);
}

.about-header,
.contact-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.about-icon,
.contact-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 10px;
  color: white;
}

.about-header h3,
.contact-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.about-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.detail-item:hover {
  background: #e9ecef;
}

.detail-icon {
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.contact-phone {
  font-size: 1rem;
  color: #212529;
  font-weight: 500;
  text-decoration: none;
}

/* Estilos para layout horizontal de contactos */
.contact-list-horizontal {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-list-horizontal .contact-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  min-width: 200px;
  justify-content: center;
}

.contact-list-horizontal .contact-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  border-color: #007bff;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.1);
}

/* Sección Grupos */
.groups-section {
  width: 100%;
  margin-bottom: 4rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.group-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.group-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
}

.group-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.group-badge {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.group-teams {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.team-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  transform: translateX(5px);
}

.team-logo {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.team-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-logo-placeholder {
  font-size: 0.9rem;
  font-weight: 700;
  color: #6c757d;
}

.team-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.empty-group {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}

.empty-group i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-groups {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.no-groups i {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
  color: #3498db;
}

.no-groups h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #495057;
}

/* Modo oscuro para grupos */
[data-theme="dark"] .group-card {
  background: #2c3e50;
  border-color: #4a5a6b;
}

[data-theme="dark"] .group-header h3 {
  color: #ecf0f1;
}

[data-theme="dark"] .team-item {
  background: #34495e;
  border-color: #4a5a6b;
}

[data-theme="dark"] .team-item:hover {
  background: #3d566e;
  border-color: #5dade2;
}

[data-theme="dark"] .team-name {
  color: #ecf0f1;
}

[data-theme="dark"] .empty-group {
  background: #34495e;
  border-color: #4a5a6b;
  color: #bdc3c7;
}

[data-theme="dark"] .no-groups {
  background: #2c3e50;
  border-color: #4a5a6b;
  color: #bdc3c7;
}

[data-theme="dark"] .no-groups h3 {
  color: #ecf0f1;
}

/* Sección Equipos */
.teams-section {
  width: 100%;
}

.loading-state-centered,
.error-state-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.empty-state-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  color: #6c757d;
}

.empty-state-centered span {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state-centered h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.empty-state-centered p {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.teams-grid-centered {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.team-card-modern {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.team-card-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007bff, #0056b3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.team-card-modern:hover::before {
  opacity: 1;
}

.team-card-modern:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 123, 255, 0.15);
}

.team-logo-modern {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem auto;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f8f9fa;
  transition: border-color 0.3s ease;
}

.team-card-modern:hover .team-logo-modern {
  border-color: #007bff;
}

.team-logo-modern img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-name-modern {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 1rem 0;
}

.team-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 50px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  color: #007bff;
  font-weight: 700;
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

/* Estilos para Cronograma */
.schedule-container {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: 0 10px 30px var(--shadow-color);
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border: 1px solid var(--border-color);
}

.schedule-filters {
  display: flex;
  gap: 1rem;
  padding: 2rem 2rem 0;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.filter-btn {
  padding: 12px 24px;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  border-radius: 25px;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.filter-btn.active {
  background: linear-gradient(135deg, var(--accent-blue), var(--accent-blue-dark));
  border-color: var(--accent-blue);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow-color);
}

.schedule-timeline {
  padding: 2rem;
}

.schedule-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.schedule-stats .stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  min-width: 120px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.schedule-stats .stat-mini:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.schedule-stats .stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-align: center;
}

.schedule-stats .stat-value {
  font-size: 1.5rem;
  color: #007bff;
  font-weight: 700;
}

.match-day {
  margin-bottom: 2rem;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f9fa;
}

.day-header h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #212529;
  margin: 0;
}

.day-date {
  color: #6c757d;
  font-weight: 500;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 15px;
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
}

.match-card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow-color);
}

.match-time {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-blue);
  min-width: 60px;
}

.match-teams {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 150px;
}

.team img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.team span {
  font-weight: 600;
  color: var(--text-primary);
}

.vs {
  font-weight: 700;
  color: var(--text-secondary);
  padding: 0 1rem;
}

.match-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 100px;
  text-align: center;
}

.match-status.pending {
  background: #FFC107;
  color: #212529;
}

.match-status.live {
  background: #dc3545;
  color: white;
  animation: pulse 2s infinite;
}

.match-status.finished {
  background: #28a745;
  color: white;
}

.match-status.cancelled {
  background: #6c757d;
  color: white;
}

/* Estilos para Resultados */
.results-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

/* Estilos para Clasificación */
.classification-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.classification-legend {
  display: flex;
  gap: 2rem;
  padding: 2rem 2rem 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-item.qualify .legend-color {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.legend-item.elimination .legend-color {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.classification-table {
  overflow-x: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 60px 60px 60px 60px 60px 60px 80px 80px;
  gap: 1rem;
  align-items: center;
  padding: 1rem 2rem;
  font-size: 0.9rem;
}

.table-header {
  background: #f8f9fa;
  font-weight: 700;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.table-row {
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.qualify {
  border-left: 4px solid #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.table-row.elimination {
  border-left: 4px solid #dc3545;
  background: rgba(220, 53, 69, 0.05);
}

.pos {
  font-weight: 700;
  color: #007bff;
  text-align: center;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #212529;
}

.team img {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
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
}

.points {
  color: #007bff;
  font-size: 1.1rem;
}

.about-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.about-text p {
  font-size: 1.1rem;
  color: #495057;
  margin-bottom: 2rem;
}

.contact-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1rem;
}

.contact-info p {
  font-size: 1rem;
  color: #6c757d;
  margin: 0.5rem 0;
}

/* Grid de equipos */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.team-card {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-color);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px var(--shadow-color);
}

.team-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* Estados de carga y error */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
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

.error-state span {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

/* Coming soon */
.coming-soon {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.coming-soon span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.coming-soon h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.coming-soon p {
  color: #6c757d;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding: 2rem 1rem;
  }

  .tournament-info-hero h1 {
    font-size: 2.5rem;
  }

  .tournament-meta-hero {
    justify-content: center;
  }

  .nav-card {
    min-width: 200px;
    max-width: 200px;
    padding: 1.25rem;
  }

  .nav-scroll-controls {
    display: none;
  }
}

@media (max-width: 768px) {
  .tournament-detail {
    padding-top: 70px;
    /* Compensar header fijo en móvil */
  }

  .tournament-hero {
    height: 300px;
  }

  .hero-content {
    padding: 1.5rem 1rem;
  }

  /* Grupos responsive */
  .groups-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .group-card {
    padding: 1.5rem;
    margin: 0 1rem;
  }

  .group-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .group-header h3 {
    font-size: 1.2rem;
  }

  .team-item {
    padding: 0.8rem;
  }

  .team-logo {
    width: 40px;
    height: 40px;
  }

  .team-name {
    font-size: 0.9rem;
  }

  .tournament-logo-hero {
    width: 80px;
    height: 80px;
  }

  .tournament-info-hero h1 {
    font-size: 2rem;
  }

  /* Responsividad para el nuevo diseño centrado */
  .about-content-stacked {
    max-width: 100%;
    gap: 1.5rem;
  }

  .contact-list-horizontal {
    flex-direction: column;
    gap: 1rem;
  }

  .contact-list-horizontal .contact-item {
    min-width: auto;
    width: 100%;
  }

  .section-header-centered h2 {
    font-size: 1.8rem;
  }

  .about-card-main,
  .contact-card-below {
    padding: 1.5rem;
  }

  .teams-grid-centered {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .team-card-modern {
    padding: 1.25rem;
  }

  .inicio-layout {
    gap: 2.5rem;
  }

  .tournament-meta-hero {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-cards-container {
    padding: 1.5rem 0.25rem;
    max-width: 100vw;
  }

  .nav-cards-scroll {
    padding: 0.5rem 2rem;
  }

  .nav-card {
    min-width: 200px;
    max-width: 200px;
    padding: 1.25rem;
  }

  .nav-card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .nav-card-content h3 {
    font-size: 1rem;
  }

  .nav-card-content p {
    font-size: 0.8rem;
  }

  .container {
    padding: 0 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .match-card {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }

  .match-teams {
    flex-direction: column;
    gap: 1rem;
  }

  .team {
    justify-content: center;
    min-width: auto;
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

  .table-header,
  .table-row {
    grid-template-columns: 40px 1fr 50px 50px 50px 50px 50px 50px 60px 60px;
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .tournament-hero {
    height: 250px;
  }

  .hero-content {
    padding: 1rem;
    gap: 1.5rem;
  }

  .tournament-logo-hero {
    width: 60px;
    height: 60px;
  }

  .tournament-info-hero h1 {
    font-size: 1.5rem;
  }

  .status-badge.live {
    font-size: 0.75rem;
    padding: 6px 12px;
  }

  .nav-cards-container {
    padding: 1rem 0;
  }

  .nav-card {
    min-width: 160px;
    max-width: 160px;
    padding: 0.875rem;
  }

  .nav-card-icon {
    width: 35px;
    height: 35px;
    font-size: 1.125rem;
  }

  .nav-card-content h3 {
    font-size: 0.9rem;
  }

  .nav-card-content p {
    font-size: 0.75rem;
  }

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

  .schedule-timeline,
  .recent-results {
    padding: 1rem;
  }

  .match-card,
  .result-card {
    padding: 1rem;
  }

  .team img {
    width: 30px;
    height: 30px;
  }

  .table-header,
  .table-row {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .classification-legend {
    padding: 1rem;
    gap: 1rem;
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
