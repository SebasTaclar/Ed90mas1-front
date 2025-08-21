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
        <h2>Torneos Finalizados</h2>
        <p class="section-subtitle">
          Celebrando nuestros campeones y momentos épicos de las competencias pasadas.
        </p>
      </div>

      <!-- Spinner de carga -->
      <div v-if="props.loading" class="loading-container">
        <div class="modern-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p>Cargando torneos finalizados...</p>
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

      <!-- Mensaje cuando no hay torneos finalizados -->
      <div v-else-if="finishedTournaments.length === 0" class="no-tournaments">
        <div class="empty-state">
          <div class="empty-icon">
            <span>🏆</span>
          </div>
          <h3>No hay torneos finalizados</h3>
          <p>Aún no hay torneos que hayan concluido. ¡Mantente atento a nuestras próximas competencias!</p>
        </div>
      </div>

      <!-- Grid de torneos finalizados -->
      <div v-else class="tournaments-grid">
        <div
          v-for="tournament in finishedTournaments"
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
              <span>🏆</span>
            </div>
          </div>

          <div class="tournament-content">
            <div class="tournament-header">
              <h3>{{ tournament.name }}</h3>
              <div class="tournament-badge finished">
                <span>FINALIZADO</span>
              </div>
            </div>

            <div class="tournament-info">
              <div class="info-item">
                <div class="info-icon">
                  <span>👥</span>
                </div>
                <div class="info-text">
                  <span class="info-label">Equipos</span>
                  <span class="info-value">{{ tournament.maxTeams }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <span>🏁</span>
                </div>
                <div class="info-text">
                  <span class="info-label">Finalizó</span>
                  <span class="info-value">{{ formatDate(tournament.endDate) }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <span>⏱️</span>
                </div>
                <div class="info-text">
                  <span class="info-label">Duración</span>
                  <span class="info-value">{{ calculateDuration(tournament.startDate, tournament.endDate) }}</span>
                </div>
              </div>
            </div>

            <div class="tournament-results">
              <div class="results-header">
                <span class="results-label">Período del torneo</span>
              </div>
              <div class="results-content">
                <div class="result-item">
                  <span class="result-label">Inicio:</span>
                  <span class="result-value">{{ formatDate(tournament.startDate) }}</span>
                </div>
                <div class="result-divider">-</div>
                <div class="result-item">
                  <span class="result-label">Final:</span>
                  <span class="result-value">{{ formatDate(tournament.endDate) }}</span>
                </div>
              </div>
            </div>

            <button class="view-details" @click="goToTournamentDetail(tournament)">
              <span>Ver Resultados</span>
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
  name: 'FinishedTournaments'
})

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

// Computed para filtrar solo torneos que ya han finalizado
const finishedTournaments = computed(() => {
  const now = new Date()
  return props.tournaments
    .filter(tournament => {
      const endDate = new Date(tournament.endDate)
      // Solo mostrar torneos que ya han finalizado (fecha de fin < fecha actual)
      return endDate < now
    })
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()) // Más recientes primero
})

// Función para navegar al detalle del torneo
const goToTournamentDetail = (tournament: Tournament) => {
  router.push(`/tournament/${tournament.id}`)
}

// Función para manejar errores de imagen
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/torneo_encurso_M.jpg'
}

// Función para formatear fecha
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Fecha no disponible'
  }
}

// Función para calcular duración del torneo
const calculateDuration = (startDate: string, endDate: string): string => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) {
      return `${diffDays} días`
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} sem`
    } else {
      const months = Math.floor(diffDays / 30)
      return `${months} mes${months > 1 ? 'es' : ''}`
    }
  } catch {
    return 'N/A'
  }
}
</script>

<style scoped>
/* Estilos base - igual que OngoingTournaments pero con tema dorado para finalizados */
.tournaments-section {
  position: relative;
  padding: 80px 0;
  background: linear-gradient(135deg, #001122 0%, #003366 50%, #001122 100%);
  overflow: hidden;
  color: white;
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
  background: rgba(0, 123, 255, 0.05);
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
  background: rgba(108, 117, 125, 0.05);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

/* Header moderno */
.section-header {
  text-align: center;
  margin-bottom: 4rem;
  animation: fadeInUp 1s ease-out;
}

.section-header h2 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: white;
  line-height: 1.2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.section-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Grid de torneos */
.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  animation: fadeIn 1s ease-out 0.3s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Cards de torneos */
.tournament-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(7, 12, 25, 0.98) 100%);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.tournament-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 123, 255, 0.4);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0, 123, 255, 0.2), rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  border-radius: 24px;
  filter: blur(10px);
  transform: scale(1.05);
}

.tournament-card:hover .card-glow {
  opacity: 0.3;
}

/* Imagen del torneo */
.tournament-image {
  position: relative;
  height: 160px;
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
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
}

.tournament-category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 50px;
  height: 50px;
  background: rgba(108, 117, 125, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

/* Contenido del torneo */
.tournament-content {
  padding: 1.5rem;
  position: relative;
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.tournament-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.3;
  margin: 0;
  flex: 1;
}

.tournament-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #28a745;
  color: white;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.tournament-badge.finished {
  background: #6c757d;
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

/* Información del torneo */
.tournament-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-icon {
  width: 40px;
  height: 40px;
  background: rgba(108, 117, 125, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6c757d;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

/* Resultados específico para torneos finalizados */
.tournament-results {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 123, 255, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(0, 123, 255, 0.3);
}

.results-header {
  text-align: center;
  margin-bottom: 1rem;
}

.results-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.results-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.result-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
}

.result-divider {
  font-size: 1.2rem;
  font-weight: 700;
  color: #007bff;
}

/* Botón de ver detalles */
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
  border-top: 3px solid #6c757d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: #495057;
  animation-delay: -0.1s;
}

.spinner-ring:nth-child(3) {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: white;
  animation-delay: -0.2s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 6rem 0;
  color: rgba(255, 255, 255, 0.8);
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
  border: 2px solid rgba(220, 53, 69, 0.3);
}

.retry-button {
  margin-top: 2rem;
  padding: 14px 28px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
  border-radius: 12px;
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
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: rgba(108, 117, 125, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: #6c757d;
  font-size: 2.5rem;
  border: 2px solid rgba(108, 117, 125, 0.3);
}

.empty-state h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: white;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .tournaments-section {
    padding: 4rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .section-header h2 {
    font-size: 2.5rem;
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

  .results-content {
    gap: 0.5rem;
  }

  .result-value {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .section-header h2 {
    font-size: 2rem;
  }

  .tournament-content {
    padding: 1.5rem;
  }

  .tournament-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tournament-results {
    padding: 1rem;
  }

  .tournament-card {
    max-width: 100%;
    min-width: 280px;
  }
}
</style>
