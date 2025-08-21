<template>
  <section class="tournaments-section">
    <!-- Background decorativo -->
    <div class="background-decoration">
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>
    </div>

    <div class="container">
      <div class="section-header">

        <h2>Torneos en Curso</h2>
        <p class="section-subtitle">
          Únete a la competencia más emocionante. Descubre torneos activos y forma parte de la acción.
        </p>
      </div>

      <!-- Spinner de carga -->
      <div v-if="props.loading" class="loading-container">
        <div class="modern-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p>Cargando torneos...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="props.error" class="error-container">
        <div class="error-icon">
          <span>⚠️</span>
        </div>
        <h3>Oops! Algo salió mal</h3>
        <p>{{ props.error }}</p>
        <button @click="emit('retry')" class="retry-button">
          <span>🔄</span>
          Reintentar
        </button>
      </div>

      <!-- Mensaje cuando no hay torneos activos -->
      <div v-else-if="activeTournaments.length === 0" class="no-tournaments">
        <div class="empty-state">
          <div class="empty-icon">
            <span>📅</span>
          </div>
          <h3>No hay torneos en curso actualmente</h3>
          <p>Mantente atento, pronto habrán nuevas competencias que iniciarán</p>
        </div>
      </div>

      <!-- Grid de torneos en curso (que ya han iniciado) -->
      <div v-else class="tournaments-grid">
        <div
          v-for="tournament in activeTournaments"
          :key="tournament.id"
          class="tournament-card"
        >
          <div class="card-glow"></div>
          <div class="tournament-image">
            <img
              :src="tournament.bannerPath ?? '/images/torneo_encurso_M.jpg'"
              :alt="tournament.name"
              @error="handleImageError"
            >
            <div class="image-overlay"></div>
            <div class="tournament-category">
              <span>⚽</span>
            </div>

          </div>

          <div class="tournament-content">
            <div class="tournament-header">
              <h3>{{ tournament.name }}</h3>
              <div class="tournament-badge">
                <span>ACTIVO</span>
              </div>
            </div>

            <div class="tournament-info">
              <div class="info-item">
                <div class="info-icon">
                  <span>👥</span>
                </div>
                <div class="info-text">
                  <span class="info-label">Equipos</span>
                  <span class="info-value">{{ tournament.maxTeams }} máx</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <span>📅</span>
                </div>
                <div class="info-text">
                  <span class="info-label">Período</span>
                  <span class="info-value">{{ formatDateRange(tournament.startDate, tournament.endDate) }}</span>
                </div>
              </div>
            </div>

            <div class="tournament-progress">
              <div class="progress-header">
                <span class="progress-label">{{ getTournamentPhase(tournament) }}</span>
                <span class="progress-percentage">{{ getTournamentProgress(tournament) }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress"
                  :style="{ width: getTournamentProgress(tournament) + '%' }"
                ></div>
              </div>
            </div>

            <button class="view-details" @click="goToTournamentDetail(tournament)">
              <span>Ver Detalles</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Tournament } from '@/types/TournamentType'

defineOptions({
  name: 'OngoingTournaments'
});

// Props recibidas del componente padre (Home.vue)
const props = defineProps<{
  tournaments: Tournament[]
  loading: boolean
  error: string | null
}>()

// Emit para notificar al padre
const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()

// Computed para filtrar solo torneos que ya han iniciado (no futuros)
const activeTournaments = computed(() => {
  const now = new Date()
  return props.tournaments
    .filter(tournament => {
      const startDate = new Date(tournament.startDate)
      const endDate = new Date(tournament.endDate)
      // Solo mostrar torneos que ya han comenzado Y que no hayan terminado
      return startDate <= now && endDate >= now
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
})

// Función para navegar al detalle del torneo
const goToTournamentDetail = (tournament: Tournament) => {
  router.push(`/tournament/${tournament.id}`)
  // Desplazar al top después de navegar
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// Función para formatear el rango de fechas
const formatDateRange = (startDate: string, endDate: string): string => {
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

// Función para calcular el progreso del torneo
const getTournamentProgress = (tournament: Tournament): number => {
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

// Función para determinar la fase del torneo
const getTournamentPhase = (tournament: Tournament): string => {
  const progress = getTournamentProgress(tournament)

  if (progress === 0) {
    return 'Por comenzar'
  } else if (progress < 30) {
    return 'Fase de grupos'
  } else if (progress < 70) {
    return 'Fase intermedia'
  } else if (progress < 100) {
    return 'Fase final'
  } else {
    return 'Finalizado'
  }
}

// Función para manejar errores de imagen
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/torneo_encurso_M.jpg'
}
</script>

<style scoped>
.tournaments-section {
  position: relative;
  padding: 80px 0;
  background: linear-gradient(135deg, #001122 0%, #003366 50%, #001122 100%);
  overflow: hidden;
}

/* Background decorativo */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
  background: rgba(255, 193, 7, 0.05);
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 2s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 4s;
  background: rgba(0, 123, 255, 0.05);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* Header moderno */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 193, 7, 0.3);
  padding: 8px 20px;
  border-radius: 25px;
  color: #FFC107;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.section-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Grid de torneos */
.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

/* Cards de torneos */
.tournament-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(7, 12, 25, 0.98) 100%);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tournament-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 193, 7, 0.3);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  background: linear-gradient(45deg, rgba(255, 193, 7, 0.2), rgba(0, 123, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(10px);
  transform: scale(1.05);
}

.tournament-card:hover .card-glow {
  opacity: 0.3;
}

/* Imagen del torneo */
.tournament-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.tournament-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.tournament-card:hover .tournament-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
}

.tournament-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.tournament-category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007bff;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Contenido del torneo */
.tournament-content {
  padding: 2rem;
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.tournament-content h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.tournament-badge {
  background: linear-gradient(135deg, #FFC107, #FFD54F);
  color: #1a1a1a;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 1rem;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

/* Información del torneo */
.tournament-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
}

.info-text {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #ffffff;
  font-weight: 600;
}

/* Progreso del torneo */
.tournament-progress {
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 600;
}

.progress-percentage {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #FFC107);
  border-radius: 4px;
  transition: width 0.6s ease;
  position: relative;
}

.progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Botón de detalles */
.view-details {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.view-details::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.view-details:hover::before {
  left: 100%;
}

.view-details:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
  background: linear-gradient(135deg, #0056b3, #004085);
}

/* Estados de carga y error */
.loading-container {
  text-align: center;
  padding: 6rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.modern-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #FFC107;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: #007bff;
  animation-delay: -0.1s;
}

.spinner-ring:nth-child(3) {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: rgba(255, 255, 255, 0.6);
  animation-delay: -0.2s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 6rem 0;
  color: white;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: rgba(220, 53, 69, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: #dc3545;
  font-size: 2rem;
}

.error-container h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.retry-button {
  margin-top: 2rem;
  padding: 12px 24px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
}

.no-tournaments {
  text-align: center;
  padding: 6rem 0;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 2.5rem;
  border: 2px solid rgba(255, 193, 7, 0.3);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 1024px) {
  .tournaments-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header h2 {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .tournaments-section {
    padding: 60px 0;
  }

  .tournaments-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  .tournament-card {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .tournament-content {
    padding: 1.5rem;
  }

  .tournament-header {
    flex-direction: column;
    gap: 1rem;
  }

  .tournament-badge {
    margin-left: 0;
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .tournament-image {
    height: 180px;
  }

  .tournament-content {
    padding: 1.25rem;
  }

  .tournament-card {
    max-width: 100%;
    min-width: 280px;
  }
}
</style>
