<template>
 <nav class="tournament-navigation">
  <div class="nav-cards-container">
   <div class="nav-cards-scroll" ref="navCardsScroll">
    <div v-for="section in navigationSections" :key="section.id"
     :class="['nav-card', { active: activeSection === section.id }]" @click="selectSection(section.id)">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface NavigationSection {
 id: string
 label: string
 icon: string
}

interface Props {
 activeSection: string
}

interface Emits {
 (e: 'section-change', sectionId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const navCardsScroll = ref<HTMLElement | null>(null)
const isNavScrollAtStart = ref(true)
const isNavScrollAtEnd = ref(false)

// Secciones de navegación
const navigationSections: NavigationSection[] = [
 { id: 'cronograma', label: 'Cronograma', icon: '📅' },
 { id: 'resultados', label: 'Resultados', icon: '⚽' },
 { id: 'clasificacion', label: 'Clasificación', icon: '🏆' },
 { id: 'rankings', label: 'Rankings y encuestas', icon: '📊' },
 { id: 'fotos', label: 'Fotos, vídeos y noticias', icon: '📸' }
]

// Función para cambiar sección activa
const selectSection = (sectionId: string) => {
 emit('section-change', sectionId)
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
 const container = navCardsScroll.value
 if (container) {
  // Calcular el ancho de desplazamiento basado en el ancho de una card (260px + gap)
  const scrollAmount = 276 // 260px card + 16px gap
  container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  // Actualizar estado después del scroll
  setTimeout(updateScrollButtons, 300)
 }
}

const scrollNavRight = () => {
 const container = navCardsScroll.value
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
 const container = navCardsScroll.value
 if (container) {
  isNavScrollAtStart.value = container.scrollLeft <= 0
  isNavScrollAtEnd.value = container.scrollLeft >= container.scrollWidth - container.clientWidth
 }
}

// Inicializar scroll listeners cuando el componente se monta
onMounted(() => {
 const container = navCardsScroll.value
 if (container) {
  // Configurar scroll listener
  container.addEventListener('scroll', updateScrollButtons)
  // Inicializar estado
  setTimeout(updateScrollButtons, 100)
 }
})
</script>

<style scoped>
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
 color: #6c757d;
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

/* Dark mode support */
[data-theme="dark"] .tournament-navigation {
 background: #1e293b;
 border-bottom: 1px solid #475569;
 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

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

[data-theme="dark"] .nav-card-content h3 {
 color: #ffffff !important;
}

[data-theme="dark"] .nav-card-content p {
 color: #cbd5e1 !important;
}

[data-theme="dark"] .nav-scroll-btn {
 background: #1e293b;
 border-color: #475569;
 color: #4dabf7;
}

/* Responsive */
@media (max-width: 1024px) {
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
}

@media (max-width: 480px) {
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
}
</style>
