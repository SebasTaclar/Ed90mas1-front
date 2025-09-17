<template>
  <header class="tournament-hero">
    <div class="hero-background">
      <img :src="tournament?.bannerPath ?? '/images/torneo_encurso_M.jpg'" :alt="tournament?.name"
        @error="handleImageError">
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <div class="tournament-logo-hero desktop-logo">
        <img :src="tournament?.bannerPath ?? '/images/torneo_encurso_M.jpg'" :alt="tournament?.name"
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
        <h1>{{ tournament?.name }}</h1>
      </div>
    </div>

    <!-- Footer con información detallada del torneo -->
    <div class="tournament-footer">
      <div class="footer-content">
        <div class="tournament-meta-footer">
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span>{{ tournament?.maxTeams || 16 }} equipos</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span>{{ formatDateRange(tournament?.startDate, tournament?.endDate) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <span>{{ getTournamentPhase(tournament) }}</span>
          </div>
        </div>
        <div class="progress-footer">
          <div class="progress-info">
            <span>Progreso del torneo</span>
            <span>{{ getTournamentProgress(tournament) }}%</span>
          </div>
          <div class="progress-bar-footer">
            <div class="progress-fill" :style="{ width: getTournamentProgress(tournament) + '%' }"></div>
          </div>
        </div>
        <div class="tournament-logo-hero mobile-logo">
          <img :src="tournament?.bannerPath ?? '/images/torneo_encurso_M.jpg'" :alt="tournament?.name"
            @error="handleImageError">
          <div class="logo-badge">
            <span>2ª ED.</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Tournament } from '@/types/TournamentType'

interface Props {
  tournament?: Tournament | null
}

const props = defineProps<Props>()

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

// Función para manejar errores de imagen
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/torneo_encurso_M.jpg'
}
</script>

<style scoped>
/* Hero Section Compacto */
.tournament-hero {
  position: relative;
  height: 200px; /* Reducido para dar más espacio al calendario */
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

.mobile-logo {
  display: none; /* Oculto por defecto en desktop */
}

.desktop-logo {
  display: block; /* Visible por defecto en desktop */
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
  font-size: 2.5rem; /* Reducido para header compacto */
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

/* Footer con información detallada */
.tournament-footer {
  background: var(--app-bg-primary);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tournament-meta-footer {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.meta-icon {
  font-size: 1.2rem;
}

.progress-footer {
  max-width: 500px;
  margin: 0 auto;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.progress-bar-footer {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
.progress-bar-footer {
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

/* Dark mode support */
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
}

@media (max-width: 768px) {
  .tournament-hero {
    height: 150px; /* Más compacto en móvil */
  }

  .hero-content {
    padding: 1rem;
  }

  .desktop-logo {
    display: none; /* Ocultar logo en móvil */
  }

  .tournament-info-hero h1 {
    font-size: 1.8rem;
  }

  .tournament-footer {
    margin-top: 1rem;
    padding: 1.5rem 0;
  }

  .footer-content {
    padding: 0 1rem;
    text-align: center;
  }

  .mobile-logo {
    display: block; /* Mostrar logo en el footer móvil */
    margin: 0 auto;
  }

  .tournament-logo-hero {
    width: 80px;
    height: 80px;
  }

  .tournament-meta-footer {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .tournament-hero {
    height: 120px; /* Muy compacto en móvil pequeño */
  }

  .hero-content {
    padding: 0.75rem;
    gap: 1rem;
  }

  .desktop-logo {
    display: none;
  }

  .tournament-info-hero h1 {
    font-size: 1.5rem;
  }

  .status-badge.live {
    font-size: 0.75rem;
    padding: 6px 12px;
  }

  .tournament-footer {
    padding: 1rem 0;
  }

  .mobile-logo {
    display: block;
    margin: 0 auto;
  }

  .tournament-logo-hero {
    width: 60px;
    height: 60px;
  }
  }
}

@keyframes pulse {  0%,
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
