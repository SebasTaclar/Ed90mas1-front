<template>
  <div class="admin-container">
    <div class="page-header">
      <h1>🛠️ MÓDULO ADMINISTRACIÓN</h1>
      <p v-if="userRole === 'admin'">Gestión completa del sistema Ed90+1 - Equipos y Torneos</p>
      <p v-else-if="userRole === 'team'">Gestión de tu equipo - Administra tus jugadores</p>
    </div>

    <!-- Spinner mientras carga -->
    <Spinner v-if="isLoading" />

    <!-- Dashboard principal -->
    <div v-else class="dashboard-grid">
      <!-- Cards solo para administradores -->
      <template v-if="userRole === 'admin'">
        <div class="card" @click="navigateTo('/admin/teams')">
          <div class="card-header">
            <h3>⚽ Administrar Equipos</h3>
          </div>
          <div class="card-content">
            <div class="metric">
              <span class="value">{{ teamsCount }}</span>
              <span class="label">Equipos registrados</span>
            </div>
            <div class="admin-indicator teams"></div>
            <div class="card-description">
              <p>Crear, editar y gestionar equipos del sistema. Asignar torneos y controlar accesos.</p>
            </div>
          </div>
        </div>

        <div class="card" @click="navigateTo('/admin/tournaments')">
          <div class="card-header">
            <h3>🏆 Administrar Torneos</h3>
          </div>
          <div class="card-content">
            <div class="metric">
              <span class="value">{{ tournamentsCount }}</span>
              <span class="label">Torneos activos</span>
            </div>
            <div class="admin-indicator tournaments"></div>
            <div class="card-description">
              <p>Crear y gestionar torneos. Configurar categorías, fechas y reglas de participación.</p>
            </div>
          </div>
        </div>

        <div class="card" @click="navigateTo('/admin/categories')">
          <div class="card-header">
            <h3>🏷️ Administrar Categorías</h3>
          </div>
          <div class="card-content">
            <div class="metric">
              <span class="value">{{ categoriesCount }}</span>
              <span class="label">Categorías disponibles</span>
            </div>
            <div class="admin-indicator categories"></div>
            <div class="card-description">
              <p>Crear y gestionar categorías para clasificar equipos según edad, género y nivel.</p>
            </div>
          </div>
        </div>

        <div class="card" @click="navigateTo('/admin/finances')">
          <div class="card-header">
            <h3>💰 Gestión Financiera</h3>
          </div>
          <div class="card-content">
            <div class="metric">
              <span class="value">{{ paymentsCount }}</span>
              <span class="label">Pagos pendientes</span>
            </div>
            <div class="admin-indicator finances"></div>
            <div class="card-description">
              <p>Administrar pagos de equipos, multas, estados de cuenta y finanzas del torneo.</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Card para equipos -->
      <template v-if="userRole === 'team'">
        <div class="card" @click="navigateTo('/admin/team-players')">
          <div class="card-header">
            <h3>👥 Administrar Jugadores</h3>
          </div>
          <div class="card-content">
            <div class="metric">
              <span class="value">{{ playersCount }}</span>
              <span class="label">Jugadores registrados</span>
            </div>
            <div class="admin-indicator players"></div>
            <div class="card-description">
              <p>Gestiona los jugadores de tu equipo. Agrega información personal y fotos de identificación.</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCategories } from '@/composables/useCategories';
import { useTournaments } from '@/composables/useTournaments';
import { useTeams } from '@/composables/useTeams';
import { usePlayers } from '@/composables/usePlayers';
import { getUserRole, getUserTeamId } from '@/utils/auth';
import Spinner from '@/components/Spinner.vue';

defineOptions({
  name: 'AdminView',
})

const router = useRouter();

// Obtener el rol del usuario
const userRole = ref<string | null>(getUserRole());

// Estado de loading
const isLoading = ref(false);

// Usar los composables
const { categories, loadCategories } = useCategories();
const { tournaments, loadTournaments } = useTournaments();
const { teams, loadTeams } = useTeams();
const { players, loadPlayersByTeam } = usePlayers();

// Computed properties para estadísticas
const teamsCount = computed(() => isLoading.value ? '...' : (teams.value?.length || 0));
const tournamentsCount = computed(() => isLoading.value ? '...' : (tournaments.value?.length || 0));
const categoriesCount = computed(() => isLoading.value ? '...' : (categories.value?.length || 0));
const playersCount = computed(() => isLoading.value ? '...' : (players.value?.length || 0));
const paymentsCount = computed(() => isLoading.value ? '...' : '15'); // Datos mock por ahora
// Funciones
const loadData = async () => {
  try {
    isLoading.value = true;

    if (userRole.value === 'admin') {
      // Cargar datos secuencialmente para evitar múltiples conexiones simultáneas
      await loadTeams();
      await loadTournaments();
      await loadCategories();
    } else if (userRole.value === 'team') {
      const teamId = getUserTeamId();
      if (teamId) {
        await loadPlayersByTeam(teamId);
      }
    }
  } catch (error) {
    console.error('Error loading admin data:', error);
  } finally {
    isLoading.value = false;
  }
};

const navigateTo = (path: string) => {
  router.push(path);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  padding-top: 80px;
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: var(--primary-blue);
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

/* Título blanco en modo oscuro */
:root[data-theme='dark'] .page-header h1 {
  color: var(--white);
}

.page-header p {
  color: var(--app-text-secondary);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.card {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--app-shadow);
  overflow: hidden;
  transition: all var(--transition-normal);
  cursor: pointer;
  border: 1px solid var(--app-border-color);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 94, 180, 0.15);
}

.card.stats-card,
.card.activities-card {
  cursor: default;
}

.card.stats-card:hover,
.card.activities-card:hover {
  transform: translateY(-2px);
}

.card-header {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
  padding: 1.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.card-content {
  padding: 2rem;
  position: relative;
}

.metric {
  text-align: center;
  margin-bottom: 1rem;
}

.value {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-blue);
  margin-bottom: 0.5rem;
}

/* Números blancos en modo oscuro */
:root[data-theme='dark'] .value {
  color: var(--white);
}

.label {
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  top: 1rem;
  right: 1rem;
  animation: pulse 2s infinite;
}

.admin-indicator.teams {
  background-color: var(--secondary-blue);
}

.admin-indicator.tournaments {
  background-color: var(--tertiary-blue);
}

.admin-indicator.categories {
  background-color: #4caf50;
}

.admin-indicator.finances {
  background-color: #ffa726;
}

.admin-indicator.players {
  background-color: #ff9800;
}

.card-description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border-color);
}

.card-description p {
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--app-input-bg);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin-bottom: 0.3rem;
}

/* Números de estadísticas blancos en modo oscuro */
:root[data-theme='dark'] .stat-value {
  color: var(--white);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--app-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--app-input-bg);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  border: 1px solid var(--app-border-color);
}

.activity-item:hover {
  background: var(--app-hover-bg);
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
  align-self: flex-start;
  margin-top: 0.2rem;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 0.3rem 0;
  color: var(--app-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.activity-content p {
  margin: 0 0 0.3rem 0;
  color: var(--app-text-secondary);
  font-size: 0.9rem;
}

.activity-time {
  color: var(--app-text-secondary);
  font-size: 0.8rem;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 1rem;
    padding-top: 110px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
