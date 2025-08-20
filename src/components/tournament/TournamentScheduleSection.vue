<template>
 <div class="section-content">
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
   <div v-else-if="matches.length === 0" class="empty-state-centered">
    <span>📅</span>
    <h3>Sin partidos programados</h3>
    <p>Este torneo aún no tiene partidos en el cronograma.</p>
   </div>

   <!-- Cronograma con partidos reales -->
   <div v-else class="schedule-timeline">
    <div class="schedule-stats">
     <div class="stat-mini">
      <span class="stat-label">Total partidos</span>
      <span class="stat-value">{{ matches.length }}</span>
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
      <span class="day-date">{{ dayMatches.length }} partido{{ dayMatches.length !== 1 ? 's' : '' }}</span>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Match } from '@/services/matchesService'

interface Props {
 matches: Match[]
 matchesLoading: boolean
}

const props = defineProps<Props>()

// Funciones para manejar matches
const matchesByDate = computed(() => {
 const grouped: { [key: string]: Match[] } = {}

 props.matches.forEach(match => {
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
 return props.matches.filter(match => match.status === status)
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

const handleTeamImageError = (event: Event) => {
 const img = event.target as HTMLImageElement
 img.src = '/images/logo.png'
}
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

/* Estilos para Cronograma */
.schedule-container {
 background: white;
 border-radius: 20px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
 overflow: hidden;
 width: 100%;
 max-width: 1000px;
 margin: 0 auto;
 border: 1px solid #e9ecef;
}

.loading-state-centered,
.empty-state-centered {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 padding: 3rem;
}

.empty-state-centered {
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

.spinner {
 width: 40px;
 height: 40px;
 border: 4px solid #e9ecef;
 border-top: 4px solid #007bff;
 border-radius: 50%;
 animation: spin 1s linear infinite;
 margin: 0 auto 1rem;
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

.stat-mini {
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

.stat-mini:hover {
 border-color: #007bff;
 transform: translateY(-2px);
}

.stat-label {
 font-size: 0.85rem;
 color: #6c757d;
 font-weight: 500;
 margin-bottom: 0.5rem;
 text-align: center;
}

.stat-value {
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
 background: #f8f9fa;
 border-radius: 15px;
 border: 2px solid #e9ecef;
 transition: all 0.3s ease;
}

.match-card:hover {
 border-color: #007bff;
 transform: translateY(-2px);
 box-shadow: 0 8px 20px rgba(0, 123, 255, 0.1);
}

.match-time {
 font-size: 1.1rem;
 font-weight: 700;
 color: #007bff;
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
 color: #212529;
}

.vs {
 font-weight: 700;
 color: #6c757d;
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

[data-theme="dark"] .schedule-container {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

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

[data-theme="dark"] .stat-value {
 color: #3b82f6 !important;
 text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

[data-theme="dark"] .stat-label {
 color: #ffffff !important;
}

[data-theme="dark"] .day-header h3 {
 color: #ffffff !important;
}

[data-theme="dark"] .match-card {
 background: linear-gradient(145deg, #334155 0%, #475569 100%);
 border-color: #64748b;
}

[data-theme="dark"] .team span {
 color: #ffffff;
}

[data-theme="dark"] .match-time {
 color: #3b82f6;
}

[data-theme="dark"] .vs {
 color: #cbd5e1;
}

/* Responsive */
@media (max-width: 768px) {
 .schedule-stats {
  gap: 1rem;
 }

 .stat-mini {
  min-width: 100px;
  padding: 0.8rem 1rem;
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
}

@media (max-width: 480px) {
 .schedule-timeline {
  padding: 1rem;
 }

 .match-card {
  padding: 1rem;
 }

 .team img {
  width: 30px;
  height: 30px;
 }
}

@keyframes spin {
 0% {
  transform: rotate(0deg);
 }

 100% {
  transform: rotate(360deg);
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
</style>
