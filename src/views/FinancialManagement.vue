<template>
  <div class="financial-management">
    <div class="page-header">
      <div class="header-content">
        <h1>💰 Gestión Financiera</h1>
        <p>Administra pagos, multas y estados de cuenta de los equipos</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddPaymentModal = true">
          <i class="fas fa-plus"></i>
          Nuevo Pago
        </button>
        <button class="btn-secondary" @click="generateFinancialReport">
          <i class="fas fa-file-pdf"></i>
          Reporte
        </button>
      </div>
    </div>

    <!-- Dashboard financiero -->
    <div class="financial-dashboard">
      <div class="stats-grid">
        <div class="stat-card income">
          <div class="stat-icon">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="stat-content">
            <h3>Ingresos del Mes</h3>
            <span class="amount">{{ formatCurrency(monthlyIncome) }}</span>
            <span class="change positive">+15%</span>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>Pagos Pendientes</h3>
            <span class="amount">{{ formatCurrency(pendingPayments) }}</span>
            <span class="count">{{ pendingCount }} equipos</span>
          </div>
        </div>

        <div class="stat-card fines">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <h3>Multas Activas</h3>
            <span class="amount">{{ formatCurrency(activeFines) }}</span>
            <span class="count">{{ finesCount }} multas</span>
          </div>
        </div>

        <div class="stat-card balance">
          <div class="stat-icon">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="stat-content">
            <h3>Balance Total</h3>
            <span class="amount">{{ formatCurrency(totalBalance) }}</span>
            <span class="change" :class="{ positive: totalBalance > 0, negative: totalBalance < 0 }">
              {{ totalBalance > 0 ? '+' : '' }}{{ ((totalBalance / 1000000) * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-filters">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar equipos..."
            @input="filterTeams"
          >
        </div>

        <div class="filter-group">
          <select v-model="statusFilter" @change="filterTeams">
            <option value="">Todos los estados</option>
            <option value="paid">Al día</option>
            <option value="pending">Pagos pendientes</option>
            <option value="overdue">Atrasados</option>
            <option value="fined">Con multas</option>
          </select>

          <select v-model="tournamentFilter" @change="filterTeams">
            <option value="">Todos los torneos</option>
            <option v-for="tournament in tournaments" :key="tournament.id" :value="tournament.id">
              {{ tournament.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de equipos con estado financiero -->
    <div class="teams-financial-list">
      <div class="list-header">
        <h2>Estado Financiero por Equipo</h2>
        <span class="total-teams">{{ filteredTeams.length }} equipos</span>
      </div>

      <div class="teams-grid">
        <div
          v-for="team in filteredTeams"
          :key="team.id"
          class="team-financial-card"
          :class="getTeamStatusClass(team)"
          @click="openTeamDetail(team)"
        >
          <div class="team-header">
            <div class="team-info">
              <img
                v-if="team.logoPath"
                :src="team.logoPath"
                :alt="team.name"
                class="team-logo"
              >
              <div class="team-identity">
                <h3>{{ team.name }}</h3>
                <span class="team-category">{{ team.category }}</span>
              </div>
            </div>
            <div class="financial-status">
              <span class="status-badge" :class="team.paymentStatus">
                {{ getStatusText(team.paymentStatus) }}
              </span>
            </div>
          </div>

          <div class="financial-summary">
            <div class="summary-item">
              <span class="label">Balance:</span>
              <span class="value" :class="{ negative: team.balance < 0 }">
                {{ formatCurrency(team.balance) }}
              </span>
            </div>

            <div class="summary-item">
              <span class="label">Último pago:</span>
              <span class="value">{{ formatDate(team.lastPayment) }}</span>
            </div>

            <div v-if="team.pendingAmount > 0" class="summary-item pending">
              <span class="label">Pendiente:</span>
              <span class="value">{{ formatCurrency(team.pendingAmount) }}</span>
            </div>

            <div v-if="team.fines && team.fines.length > 0" class="summary-item fines">
              <span class="label">Multas:</span>
              <span class="value">{{ team.fines.length }} activas</span>
            </div>
          </div>

          <div class="quick-actions">
            <button
              class="action-btn payment"
              @click.stop="registerPayment(team)"
              :disabled="team.pendingAmount === 0"
            >
              <i class="fas fa-money-bill"></i>
              Registrar Pago
            </button>

            <button
              class="action-btn fine"
              @click.stop="addFine(team)"
            >
              <i class="fas fa-exclamation-circle"></i>
              Multa
            </button>

            <button
              class="action-btn statement"
              @click.stop="viewStatement(team)"
            >
              <i class="fas fa-file-invoice"></i>
              Estado
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <PaymentRegistrationModal
      v-if="showPaymentModal && selectedTeam"
      :team="selectedTeam"
      @close="closePaymentModal"
      @payment-registered="onPaymentRegistered"
    />

    <div v-if="showAddPaymentModal" class="modal-overlay" @click="showAddPaymentModal = false">
      <div class="modal-content" @click.stop>
        <h3>Registrar Nuevo Pago</h3>
        <p>Modal de pago - Por implementar</p>
        <button @click="showAddPaymentModal = false">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TeamFinancialInfo, Tournament } from '@/types/FinancialTypes'
import type { Payment } from '@/types/FinancialTypes'
import PaymentRegistrationModal from '@/components/PaymentRegistrationModal.vue'

defineOptions({
  name: 'FinancialManagement'
})

// Estado reactivo
const searchQuery = ref('')
const statusFilter = ref('')
const tournamentFilter = ref('')
const showAddPaymentModal = ref(false)
const showPaymentModal = ref(false)
const selectedTeam = ref<TeamFinancialInfo | null>(null)

// Datos mock para desarrollo (después se conectará con el backend)
const monthlyIncome = ref(2500000) // $2,500,000
const pendingPayments = ref(450000) // $450,000
const activeFines = ref(120000) // $120,000
const totalBalance = ref(8750000) // $8,750,000

const pendingCount = ref(5)
const finesCount = ref(3)

const tournaments = ref<Tournament[]>([
  { id: 1, name: 'Torneo Primavera 2024', isActive: true },
  { id: 2, name: 'Copa Verano 2024', isActive: true },
  { id: 3, name: 'Liga Otoño 2024', isActive: false }
])

// Datos mock de equipos con información financiera
const teamsData = ref<TeamFinancialInfo[]>([
  {
    id: 1,
    name: 'Real Madrid FC',
    category: 'Primera División',
    logoPath: '/images/teams/real-madrid.png',
    balance: 150000,
    lastPayment: new Date('2024-02-15'),
    pendingAmount: 0,
    paymentStatus: 'paid',
    fines: [],
    tournamentId: 1
  },
  {
    id: 2,
    name: 'Barcelona SC',
    category: 'Primera División',
    logoPath: '/images/teams/barcelona.png',
    balance: -75000,
    lastPayment: new Date('2024-01-20'),
    pendingAmount: 100000,
    paymentStatus: 'pending',
    fines: [],
    tournamentId: 1
  },
  {
    id: 3,
    name: 'Atlético Nacional',
    category: 'Segunda División',
    logoPath: '/images/teams/nacional.png',
    balance: -200000,
    lastPayment: new Date('2023-12-10'),
    pendingAmount: 150000,
    paymentStatus: 'overdue',
    fines: [
      { id: 1, type: 'tarjeta_amarilla', amount: 50000, date: new Date('2024-02-01'), isPaid: false }
    ],
    tournamentId: 2
  },
  {
    id: 4,
    name: 'Millonarios FC',
    category: 'Primera División',
    logoPath: '/images/teams/millonarios.png',
    balance: 300000,
    lastPayment: new Date('2024-02-28'),
    pendingAmount: 0,
    paymentStatus: 'paid',
    fines: [],
    tournamentId: 1
  },
  {
    id: 5,
    name: 'Independiente Santa Fe',
    category: 'Segunda División',
    logoPath: '/images/teams/santafe.png',
    balance: -120000,
    lastPayment: new Date('2024-01-15'),
    pendingAmount: 80000,
    paymentStatus: 'fined',
    fines: [
      { id: 2, type: 'comportamiento', amount: 100000, date: new Date('2024-02-05') },
      { id: 3, type: 'tarjeta_roja', amount: 80000, date: new Date('2024-02-10') }
    ],
    tournamentId: 3
  }
])

// Computed properties
const filteredTeams = computed(() => {
  let filtered = teamsData.value

  // Filtro por búsqueda
  if (searchQuery.value) {
    filtered = filtered.filter(team =>
      team.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filtro por estado
  if (statusFilter.value) {
    filtered = filtered.filter(team => team.paymentStatus === statusFilter.value)
  }

  // Filtro por torneo
  if (tournamentFilter.value) {
    filtered = filtered.filter(team => team.tournamentId === parseInt(tournamentFilter.value))
  }

  return filtered
})

// Métodos
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const getTeamStatusClass = (team: TeamFinancialInfo): string => {
  return `status-${team.paymentStatus}`
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    paid: 'Al día',
    pending: 'Pendiente',
    overdue: 'Atrasado',
    fined: 'Con multas'
  }
  return statusMap[status] || status
}

const filterTeams = () => {
  // La función se ejecuta automáticamente por los computed properties
}

const openTeamDetail = (team: TeamFinancialInfo) => {
  console.log('Abrir detalle del equipo:', team.name)
  // Aquí se implementará la navegación al detalle del equipo
}

const registerPayment = (team: TeamFinancialInfo) => {
  selectedTeam.value = team
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  selectedTeam.value = null
}

const onPaymentRegistered = (payment: Payment) => {
  console.log('Pago registrado:', payment)

  // Actualizar los datos del equipo localmente
  const teamIndex = teamsData.value.findIndex(t => t.id === payment.teamId)
  if (teamIndex !== -1) {
    const team = teamsData.value[teamIndex]
    team.balance += payment.amount
    team.pendingAmount = Math.max(0, team.pendingAmount - payment.amount)
    team.lastPayment = payment.date

    // Actualizar estado de pago si el equipo está al día
    if (team.pendingAmount === 0 && team.fines.length === 0) {
      team.paymentStatus = 'paid'
    }
  }

  // Aquí se haría la llamada al backend para actualizar los datos
  // await paymentsService.createPayment(payment)
}

const addFine = (team: TeamFinancialInfo) => {
  console.log('Agregar multa a:', team.name)
  // Implementar modal de multa
}

const viewStatement = (team: TeamFinancialInfo) => {
  console.log('Ver estado de cuenta de:', team.name)
  // Implementar modal de estado de cuenta
}

const generateFinancialReport = () => {
  console.log('Generar reporte financiero')
  // Implementar generación de PDF
}

onMounted(() => {
  console.log('Módulo financiero cargado')
})
</script>

<style scoped>
.financial-management {
  padding: 2rem;
  padding-top: 80px;
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  gap: 2rem;
}

.header-content h1 {
  color: var(--primary-blue);
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

/* Título blanco en modo oscuro */
:root[data-theme='dark'] .header-content h1 {
  color: var(--white);
}

.header-content p {
  color: var(--app-text-secondary);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-lg);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 94, 180, 0.3);
}

.btn-secondary {
  background: var(--app-bg-secondary);
  color: var(--app-text-primary);
  border: 1px solid var(--app-border-color);
}

.btn-secondary:hover {
  background: var(--app-hover-bg);
  transform: translateY(-2px);
}

/* Dashboard financiero */
.financial-dashboard {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--app-border-color);
  transition: all var(--transition-normal);
  box-shadow: var(--app-shadow);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 94, 180, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--white);
}

.stat-card.income .stat-icon {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.stat-card.fines .stat-icon {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.stat-card.balance .stat-icon {
  background: linear-gradient(135deg, var(--primary-blue), var(--dark-blue));
}

.stat-content h3 {
  font-size: 0.9rem;
  color: var(--app-text-secondary);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary-blue);
  display: block;
  margin-bottom: 0.25rem;
}

/* Números blancos en modo oscuro */
:root[data-theme='dark'] .amount {
  color: var(--white);
}

.change {
  font-size: 0.8rem;
  font-weight: 600;
}

.change.positive {
  color: #4caf50;
}

.change.negative {
  color: #f44336;
}

.count {
  font-size: 0.85rem;
  color: var(--app-text-secondary);
}

/* Filtros */
.filters-section {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  margin-bottom: 3rem;
  border: 1px solid var(--app-border-color);
  box-shadow: var(--app-shadow);
}

.search-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--app-text-secondary);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-lg);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  transition: all var(--transition-normal);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.filter-group {
  display: flex;
  gap: 1rem;
}

.filter-group select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-lg);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  min-width: 180px;
  font-family: 'Montserrat', sans-serif;
  transition: all var(--transition-normal);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

/* Lista de equipos */
.teams-financial-list {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--app-border-color);
  overflow: hidden;
  box-shadow: var(--app-shadow);
}

.list-header {
  padding: 2rem;
  border-bottom: 1px solid var(--app-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
}

.list-header h2 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
}

.total-teams {
  font-size: 0.9rem;
  opacity: 0.9;
}

.teams-grid {
  display: grid;
  gap: 1px;
  background: var(--app-border-color);
}

.team-financial-card {
  background: var(--app-bg-secondary);
  padding: 2rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  border-left: 4px solid transparent;
}

.team-financial-card:hover {
  background: var(--app-hover-bg);
  transform: translateY(-2px);
}

.team-financial-card.status-paid {
  border-left-color: #4caf50;
}

.team-financial-card.status-pending {
  border-left-color: #ff9800;
}

.team-financial-card.status-overdue {
  border-left-color: #f44336;
}

.team-financial-card.status-fined {
  border-left-color: #9c27b0;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team-logo {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-lg);
  object-fit: cover;
}

.team-identity h3 {
  color: var(--app-text-primary);
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 700;
}

.team-category {
  color: var(--app-text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.paid {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.pending {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-badge.overdue {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.status-badge.fined {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
  border: 1px solid rgba(156, 39, 176, 0.3);
}

.financial-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-item .label {
  color: var(--app-text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item .value {
  color: var(--app-text-primary);
  font-weight: 700;
  font-size: 0.9rem;
}

.summary-item .value.negative {
  color: #f44336;
}

.summary-item.pending .value {
  color: #ff9800;
}

.summary-item.fines .value {
  color: #9c27b0;
}

.quick-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.payment {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.action-btn.payment:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.action-btn.fine {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.action-btn.fine:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

.action-btn.statement {
  background: rgba(0, 94, 180, 0.1);
  color: var(--primary-blue);
  border: 1px solid rgba(0, 94, 180, 0.3);
}

.action-btn.statement:hover {
  background: rgba(0, 94, 180, 0.2);
  transform: translateY(-2px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: var(--backdrop-blur);
}

.modal-content {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--app-border-color);
}

/* Animaciones */
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

/* Responsive */
@media (max-width: 768px) {
  .financial-management {
    padding: 1rem;
    padding-top: 80px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-group {
    flex-direction: column;
  }

  .financial-summary {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    justify-content: center;
  }
}
</style>
