<template>
  <section class="categories-section">
    <!-- Background decorativo -->
    <div class="background-decoration">
      <div class="floating-shapes">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
      </div>
    </div>

    <div class="container">
      <div class="section-header">
        <div class="header-badge">
          <span>🎯</span>
          <span>Categorías</span>
        </div>
        <h2>Modalidades de Competencia</h2>
        <p class="section-subtitle">
          Descubre las diferentes categorías disponibles en nuestros torneos
        </p>
      </div>

      <!-- Spinner de carga -->
      <div v-if="loading" class="loading-container">
        <div class="modern-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p>Cargando categorías...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">
          <span>⚠️</span>
        </div>
        <h3>Error al cargar categorías</h3>
        <p>{{ error }}</p>
        <button @click="loadCategories" class="retry-button">
          <span>🔄</span>
          Reintentar
        </button>
      </div>

      <!-- Mensaje cuando no hay categorías -->
      <div v-else-if="categories.length === 0" class="no-categories">
        <div class="empty-state">
          <div class="empty-icon">
            <span>🎯</span>
          </div>
          <h3>No hay categorías disponibles</h3>
          <p>Pronto agregaremos nuevas modalidades de competencia</p>
        </div>
      </div>

      <!-- Grid horizontal de categorías -->
      <div v-else class="categories-container">
        <div class="categories-scroll">
          <div v-for="category in categories" :key="category.id" class="category-card">
            <div class="card-glow"></div>
            <div class="category-icon">
              <span>{{ getCategoryIcon(category.name) }}</span>
            </div>
            <div class="category-content">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description || 'Modalidad de competencia' }}</p>
              <div class="category-stats">
                <div class="stat">
                  <span class="stat-value">{{ getTournamentsCount(category.id) }}</span>
                  <span class="stat-label">Torneos</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ getTeamsCount(category.id) }}</span>
                  <span class="stat-label">Equipos</span>
                </div>
              </div>
            </div>
            <div class="category-action">
              <button class="explore-btn">
                <span>Explorar</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Controles de navegación -->
        <div class="scroll-controls">
          <button class="scroll-btn scroll-left" @click="scrollLeft" :disabled="isScrollAtStart">
            <span>←</span>
          </button>
          <button class="scroll-btn scroll-right" @click="scrollRight" :disabled="isScrollAtEnd">
            <span>→</span>
          </button>
        </div>
      </div>

      <!-- Indicadores de progreso -->
      <div v-if="categories.length > 0" class="scroll-indicators">
        <div v-for="(category, index) in categories" :key="`indicator-${category.id}`"
          :class="['indicator', { active: index === activeIndicator }]" @click="scrollToCategory(index)"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useCategories } from '@/composables/useCategories'
import type { Category } from '@/types/CategoryType'

defineOptions({
  name: 'CategoriesSection'
});

// Composable para gestión de categorías
const { categories, loading, error, loadCategories } = useCategories()

// Referencias para el scroll
const scrollContainer = ref<HTMLElement>()
const isScrollAtStart = ref(true)
const isScrollAtEnd = ref(false)
const activeIndicator = ref(0)

// Función para obtener el icono de la categoría
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Masculino': '👨',
    'Femenino': '👩',
    'Mixto': '👥',
    'Juvenil': '🧒',
    'Senior': '🧔',
    'Veteranos': '👴',
    'Amateur': '⚽',
    'Profesional': '🏆',
    'F7': '⚽',
    'F11': '🥅',
    'F5': '🏐'
  }

  // Buscar coincidencias parciales
  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }

  return '🎯' // Icono por defecto
}

// Función para obtener el conteo de torneos por categoría
const getTournamentsCount = (_categoryId: number): number => {
  // Aquí integrarías con tu API para obtener el conteo real
  return Math.floor(Math.random() * 5) + 1
}

// Función para obtener el conteo de equipos por categoría
const getTeamsCount = (_categoryId: number): number => {
  // Aquí integrarías con tu API para obtener el conteo real
  return Math.floor(Math.random() * 20) + 8
}

// Funciones de scroll
const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -320, behavior: 'smooth' })
  }
}

const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 320, behavior: 'smooth' })
  }
}

const scrollToCategory = (index: number) => {
  if (scrollContainer.value) {
    const cardWidth = 320
    const scrollPosition = index * cardWidth
    scrollContainer.value.scrollTo({ left: scrollPosition, behavior: 'smooth' })
  }
}

// Actualizar estado del scroll
const updateScrollState = () => {
  if (scrollContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
    isScrollAtStart.value = scrollLeft <= 10
    isScrollAtEnd.value = scrollLeft >= scrollWidth - clientWidth - 10

    // Actualizar indicador activo
    const cardWidth = 320
    activeIndicator.value = Math.round(scrollLeft / cardWidth)
  }
}

// Configurar scroll listener
onMounted(async () => {
  await loadCategories()

  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', updateScrollState)
      updateScrollState()
    }
  })
})
</script>

<style scoped>
.categories-section {
  position: relative;
  padding: 6rem 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.08);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: 10%;
  animation-delay: 0s;
  background: rgba(255, 193, 7, 0.05);
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 5%;
  animation-delay: 3s;
}

.shape-3 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 30%;
  animation-delay: 6s;
  background: rgba(0, 123, 255, 0.04);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-15px) rotate(3deg);
  }
}

.container {
  max-width: 1400px;
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
  gap: 10px;
  background: rgba(255, 193, 7, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 193, 7, 0.3);
  padding: 12px 24px;
  border-radius: 30px;
  color: #FFC107;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(255, 193, 7, 0.2);
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

/* Container de categorías */
.categories-container {
  position: relative;
  margin-bottom: 2rem;
}

.categories-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 1rem 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

/* Cards de categorías */
.category-card {
  position: relative;
  min-width: 300px;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.3);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  background: linear-gradient(45deg, #FFC107, #FF8F00);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(20px);
  transform: scale(1.1);
}

.category-card:hover .card-glow {
  opacity: 0.15;
}

/* Icono de categoría */
.category-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FFC107, #FF8F00);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #212529;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  transition: transform 0.3s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Contenido de categoría */
.category-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.category-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

/* Estadísticas de categoría */
.category-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 12px;
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFC107;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* Botón de acción */
.category-action {
  margin-top: auto;
}

.explore-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #FFC107, #FF8F00);
  border: none;
  border-radius: 12px;
  color: #212529;
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
}

.explore-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.explore-btn:hover::before {
  left: 100%;
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
}

/* Controles de scroll */
.scroll-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 10;
}

.scroll-btn {
  width: 50px;
  height: 50px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: all;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-size: 1.2rem;
  color: #007bff;
}

.scroll-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
}

.scroll-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.scroll-left {
  margin-left: -25px;
}

.scroll-right {
  margin-right: -25px;
}

/* Indicadores de scroll */
.scroll-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #007bff;
  transform: scale(1.2);
}

.indicator:hover {
  background: #6c757d;
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
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: #FF8F00;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  padding: 6rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.error-icon {
  width: 80px;
  height: 80px;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: #dc3545;
  font-size: 2rem;
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

.no-categories {
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
  background: rgba(255, 193, 7, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: #FFC107;
  font-size: 2.5rem;
  border: 2px solid rgba(255, 193, 7, 0.3);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .categories-section {
    padding: 60px 0;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .category-card {
    min-width: 280px;
    max-width: 280px;
    padding: 1.5rem;
  }

  .category-icon {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .category-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .scroll-controls {
    display: none;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .category-card {
    min-width: 260px;
    max-width: 260px;
    padding: 1.25rem;
  }

  .section-header {
    margin-bottom: 3rem;
  }
}
</style>
