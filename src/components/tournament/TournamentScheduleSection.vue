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
        <select v-model="selectedTeam" class="filter-select">
          <option value="">Todos los equipos</option>
          <option v-for="team in availableTeams" :key="team" :value="team">{{ team }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Fecha:</label>
        <select v-model="selectedDate" class="filter-select date-select">
          <option value="">Todas las fechas</option>
          <option v-for="date in availableDates" :key="date" :value="date">
            {{ formatDateForSelect(date) }}
          </option>
        </select>
      </div>

      <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">
        Limpiar
      </button>
    </div>

    <!-- Estadísticas rápidas -->
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
          <div class="col-location">Lugar</div>
          <div class="col-status">Estado</div>
        </div>

        <div v-for="match in filteredMatches" :key="match.id" class="table-row" :class="getRowClass(match.status)">
          <div class="col-date">
            <div class="date-info">
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

          <div class="col-location">
            <div class="location-info">
              <span class="location-text">{{ match.location || 'Por definir' }}</span>
            </div>
          </div>

          <div class="col-status">
            <span class="status-badge" :class="getStatusClass(match.status)">
              {{ getStatusText(match.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Match } from '@/services/matchesService'

interface Props {
  matches: Match[]
  matchesLoading: boolean
}

const props = defineProps<Props>()

// Estado de filtros
const selectedTeam = ref('')
const selectedDate = ref('')

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

const minDate = computed(() => {
  if (props.matches.length === 0) return ''
  const dates = props.matches
    .map(match => match.matchDate || match.scheduledDate)
    .filter((date): date is string => Boolean(date))
    .map(date => {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
    .sort()
  return dates[0] || ''
})

const maxDate = computed(() => {
  if (props.matches.length === 0) return ''
  const dates = props.matches
    .map(match => match.matchDate || match.scheduledDate)
    .filter((date): date is string => Boolean(date))
    .map(date => {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })
    .sort()
  return dates[dates.length - 1] || ''
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

// Funciones
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

const getRowClass = (status?: string) => {
  switch (status) {
    case 'in_progress':
      return 'row-live'
    case 'completed':
      return 'row-completed'
    default:
      return ''
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/logo.png'
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
}

.filter-select:focus,
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

/* Estilos específicos para el select (dropdown) */
.filter-select {
  cursor: pointer;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  padding-right: 2.5rem;
  min-width: 240px;
}

/* Icono personalizado para el dropdown de fecha */
.filter-select.date-select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3e%3c/rect%3e%3cline x1='16' y1='2' x2='16' y2='6'%3e%3c/line%3e%3cline x1='8' y1='2' x2='8' y2='6'%3e%3c/line%3e%3cline x1='3' y1='10' x2='21' y2='10'%3e%3c/line%3e%3c/svg%3e") !important;
}

/* Override para fondos más atractivos en lugar del blanco/transparente */
.filter-select {
  background-color: var(--primary-blue) !important;
  color: var(--white) !important;
  border-color: var(--tertiary-blue);
}

.filter-select:focus {
  background-color: var(--tertiary-blue) !important;
  border-color: var(--secondary-blue);
  color: var(--white) !important;
}

.filter-select:hover {
  background-color: var(--tertiary-blue) !important;
  transform: translateY(-1px);
}

/* Flecha para dropdown normal */
.filter-select:not(.date-select) {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
}

.filter-select option {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.75rem;
  border: none;
  font-weight: 500;
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

/* Estadísticas */
.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
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
  grid-template-columns: 200px 1fr 160px 140px;
  background: var(--primary-blue);
  color: var(--white);
  font-weight: 600;
  padding: 1rem;
  gap: 1rem;
}

.table-row {
  display: grid;
  grid-template-columns: 200px 1fr 160px 140px;
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

/* Columnas */
.col-date,
.col-teams,
.col-location,
.col-status {
  display: flex;
  align-items: center;
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
    grid-template-columns: 150px 1fr 140px 120px;
  }

  .team-name {
    font-size: 0.8rem;
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
