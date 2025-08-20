<template>
  <div class="supervisor-container">
    <div class="page-header">
      <h1>👨‍💼 MÓDULO SUPERVISOR</h1>
      <p>Gestión de supervisión y aprobación de procesos</p>
    </div>

    <!-- Tabla de Aprobación de Empleados -->
    <div class="approval-section">
      <div class="approval-card">
        <h3>📋 Aprobación de Unidades por Empleado</h3>
        <div class="table-container">
          <!-- Vista de tabla para desktop -->
          <table class="approval-table desktop-view">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Rol</th>
                <th>Fecha/Hora</th>
                <th>Tipo Producto</th>
                <th>Cantidad</th>
                <th>Turno</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in pendingEntries" :key="entry.id" class="table-row">
                <td class="employee-info">
                  <span class="employee-name">{{ entry.employeeName }}</span>
                </td>
                <td>
                  <span class="role-badge" :class="entry.employeeRole">{{ entry.employeeRole.toUpperCase() }}</span>
                </td>
                <td class="date-time">{{ formatDateTime(entry.entryDateTime) }}</td>
                <td>
                  <span class="product-type">{{ getProductTypeName(entry.type) }}</span>
                </td>
                <td class="quantity">{{ entry.quantity }} unidades</td>
                <td>
                  <span class="shift-badge" :class="entry.shift">{{ entry.shift === 'am' ? 'Mañana' : 'Tarde' }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="entry.status">{{ getStatusName(entry.status) }}</span>
                </td>
                <td class="actions">
                  <button v-if="entry.status === 'pending'" @click="approveEntry(entry.id)" class="approve-btn">
                    ✓
                  </button>
                  <button v-if="entry.status === 'pending'" @click="rejectEntry(entry.id)" class="reject-btn">
                    ✕
                  </button>
                  <span v-if="entry.status !== 'pending'" class="action-completed">
                    {{ entry.status === 'approved' ? '✓' : '✕' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Vista de cards para mobile -->
          <div class="mobile-cards-view">
            <div v-for="entry in pendingEntries" :key="entry.id" class="mobile-card">
              <div class="mobile-card-header">
                <span class="mobile-employee-name">{{ entry.employeeName }}</span>
                <span class="mobile-status-badge" :class="entry.status">{{ getStatusName(entry.status) }}</span>
              </div>

              <div class="mobile-card-content">
                <div class="mobile-info-row">
                  <span class="mobile-label">Rol:</span>
                  <span class="mobile-role-badge">{{ entry.employeeRole.toUpperCase() }}</span>
                </div>

                <div class="mobile-info-row">
                  <span class="mobile-label">Fecha:</span>
                  <span class="mobile-value">{{ formatDateTime(entry.entryDateTime) }}</span>
                </div>

                <div class="mobile-info-row">
                  <span class="mobile-label">Producto:</span>
                  <span class="mobile-product-type">{{ getProductTypeName(entry.type) }}</span>
                </div>

                <div class="mobile-info-row">
                  <span class="mobile-label">Cantidad:</span>
                  <span class="mobile-value">{{ entry.quantity }} unidades</span>
                </div>

                <div class="mobile-info-row">
                  <span class="mobile-label">Turno:</span>
                  <span class="mobile-shift-badge" :class="entry.shift">{{ entry.shift === 'am' ? 'Mañana' : 'Tarde'
                    }}</span>
                </div>
              </div>

              <div class="mobile-card-actions" v-if="entry.status === 'pending'">
                <button @click="approveEntry(entry.id)" class="mobile-approve-btn">
                  ✓ Aprobar
                </button>
                <button @click="rejectEntry(entry.id)" class="mobile-reject-btn">
                  ✕ Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header">
          <h3>📋 Proyectos Activos</h3>
        </div>
        <div class="card-content">
          <div class="metric">
            <span class="value">24</span>
            <span class="label">En progreso</span>
          </div>
          <div class="status-indicator active"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>✅ Proyectos Completados</h3>
        </div>
        <div class="card-content">
          <div class="metric">
            <span class="value">156</span>
            <span class="label">Este año</span>
          </div>
          <div class="status-indicator completed"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>⏳ Pendientes</h3>
        </div>
        <div class="card-content">
          <div class="metric">
            <span class="value">8</span>
            <span class="label">Por iniciar</span>
          </div>
          <div class="status-indicator pending"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>📊 Eficiencia</h3>
        </div>
        <div class="card-content">
          <div class="metric">
            <span class="value">92%</span>
            <span class="label">Promedio</span>
          </div>
          <div class="progress-bar">
            <div class="progress" style="width: 92%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="operations-section">
      <div class="operations-card">
        <h3>🔄 Procesos Operativos</h3>
        <div class="process-list">
          <div class="process-item">
            <div class="process-icon">🏗️</div>
            <div class="process-info">
              <h4>Construcción de Software</h4>
              <p>Desarrollo y implementación de soluciones tecnológicas</p>
              <div class="process-status active">En Ejecución</div>
            </div>
          </div>

          <div class="process-item">
            <div class="process-icon">🔧</div>
            <div class="process-info">
              <h4>Mantenimiento de Sistemas</h4>
              <p>Soporte técnico y mantenimiento preventivo</p>
              <div class="process-status completed">Completado</div>
            </div>
          </div>

          <div class="process-item">
            <div class="process-icon">📱</div>
            <div class="process-info">
              <h4>Desarrollo Mobile</h4>
              <p>Aplicaciones móviles para iOS y Android</p>
              <div class="process-status pending">Planificado</div>
            </div>
          </div>

          <div class="process-item">
            <div class="process-icon">☁️</div>
            <div class="process-info">
              <h4>Migración a la Nube</h4>
              <p>Implementación de infraestructura cloud</p>
              <div class="process-status active">En Progreso</div>
            </div>
          </div>
        </div>
      </div>

      <div class="operations-card">
        <h3>📈 Métricas Operativas</h3>
        <div class="metrics-grid">
          <div class="metric-item">
            <span class="metric-number">98.5%</span>
            <span class="metric-label">Uptime</span>
          </div>
          <div class="metric-item">
            <span class="metric-number">4.2s</span>
            <span class="metric-label">Tiempo Respuesta</span>
          </div>
          <div class="metric-item">
            <span class="metric-number">99.1%</span>
            <span class="metric-label">Satisfacción Cliente</span>
          </div>
          <div class="metric-item">
            <span class="metric-number">24/7</span>
            <span class="metric-label">Soporte</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'SupervisorView',
});

// Datos de ejemplo para las entradas pendientes de aprobación
const pendingEntries = ref([
  {
    id: 1,
    employeeName: 'Carlos Rodriguez',
    employeeRole: 'admin',
    entryDateTime: '2025-07-30T09:30:00',
    type: 'toma',
    quantity: 45,
    shift: 'am',
    status: 'pending'
  },
  {
    id: 2,
    employeeName: 'Ana Martinez',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T14:15:00',
    type: 'doble',
    quantity: 38,
    shift: 'pm',
    status: 'pending'
  },
  {
    id: 3,
    employeeName: 'Luis Garcia',
    employeeRole: 'supervisor',
    entryDateTime: '2025-07-30T08:45:00',
    type: 'fulcro_fijo',
    quantity: 42,
    shift: 'am',
    status: 'approved'
  },
  {
    id: 4,
    employeeName: 'Maria Lopez',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-29T15:20:00',
    type: 'toma',
    quantity: 35,
    shift: 'pm',
    status: 'rejected'
  },
  {
    id: 5,
    employeeName: 'Pedro Silva',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T10:00:00',
    type: 'doble',
    quantity: 48,
    shift: 'am',
    status: 'pending'
  },
  {
    id: 6,
    employeeName: 'Sofia Ramirez',
    employeeRole: 'supervisor',
    entryDateTime: '2025-07-30T11:20:00',
    type: 'fulcro_fijo',
    quantity: 52,
    shift: 'am',
    status: 'approved'
  },
  {
    id: 7,
    employeeName: 'Diego Morales',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T16:45:00',
    type: 'toma',
    quantity: 41,
    shift: 'pm',
    status: 'pending'
  },
  {
    id: 8,
    employeeName: 'Carmen Ruiz',
    employeeRole: 'admin',
    entryDateTime: '2025-07-29T13:30:00',
    type: 'doble',
    quantity: 33,
    shift: 'pm',
    status: 'approved'
  },
  {
    id: 9,
    employeeName: 'Roberto Fernandez',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T07:15:00',
    type: 'fulcro_fijo',
    quantity: 47,
    shift: 'am',
    status: 'rejected'
  },
  {
    id: 10,
    employeeName: 'Patricia Delgado',
    employeeRole: 'supervisor',
    entryDateTime: '2025-07-30T15:00:00',
    type: 'toma',
    quantity: 39,
    shift: 'pm',
    status: 'pending'
  },
  {
    id: 11,
    employeeName: 'Miguel Torres',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T12:10:00',
    type: 'doble',
    quantity: 44,
    shift: 'pm',
    status: 'pending'
  },
  {
    id: 12,
    employeeName: 'Valentina Castro',
    employeeRole: 'admin',
    entryDateTime: '2025-07-29T10:30:00',
    type: 'fulcro_fijo',
    quantity: 50,
    shift: 'am',
    status: 'approved'
  },
  {
    id: 13,
    employeeName: 'Andres Gutierrez',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T13:45:00',
    type: 'toma',
    quantity: 36,
    shift: 'pm',
    status: 'pending'
  },
  {
    id: 14,
    employeeName: 'Isabella Vargas',
    employeeRole: 'supervisor',
    entryDateTime: '2025-07-30T08:20:00',
    type: 'doble',
    quantity: 43,
    shift: 'am',
    status: 'approved'
  },
  {
    id: 15,
    employeeName: 'Fernando Ortiz',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-29T14:50:00',
    type: 'fulcro_fijo',
    quantity: 40,
    shift: 'pm',
    status: 'rejected'
  },
  {
    id: 16,
    employeeName: 'Claudia Mendez',
    employeeRole: 'admin',
    entryDateTime: '2025-07-30T11:15:00',
    type: 'toma',
    quantity: 46,
    shift: 'am',
    status: 'pending'
  },
  {
    id: 17,
    employeeName: 'Ricardo Jimenez',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-30T17:30:00',
    type: 'doble',
    quantity: 37,
    shift: 'pm',
    status: 'pending'
  },
  {
    id: 18,
    employeeName: 'Natalia Herrera',
    employeeRole: 'empleado',
    entryDateTime: '2025-07-29T09:40:00',
    type: 'fulcro_fijo',
    quantity: 51,
    shift: 'am',
    status: 'approved'
  }
])

// Funciones auxiliares
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getProductTypeName = (type: string) => {
  const types: { [key: string]: string } = {
    'toma': 'Toma Doble',
    'doble': 'Fulcro',
    'fulcro_fijo': 'Fijo'
  }
  return types[type] || type
}

const getStatusName = (status: string) => {
  const statuses: { [key: string]: string } = {
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'rejected': 'Rechazado'
  }
  return statuses[status] || status
}

// Funciones de aprobación
const approveEntry = (entryId: number) => {
  const entry = pendingEntries.value.find(e => e.id === entryId)
  if (entry) {
    entry.status = 'approved'
  }
}

const rejectEntry = (entryId: number) => {
  const entry = pendingEntries.value.find(e => e.id === entryId)
  if (entry) {
    entry.status = 'rejected'
  }
}
</script>

<style scoped>
.supervisor-container {
  padding: 2rem;
  padding-top: 120px;
  /* Offset aumentado para navbar fija y menú hamburguesa */
  background-color: var(--bg-color, #f8f9fa);
  color: var(--text-color, #031633);
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: var(--text-color, #031633);
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.page-header p {
  color: var(--text-secondary, #666);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.card {
  background: var(--bg-color, white);
  color: var(--text-color, #031633);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(3, 22, 51, 0.1);
  border: 1px solid var(--border-color, rgba(255, 165, 0, 0.1));
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(3, 22, 51, 0.15);
}

.card-header {
  background: linear-gradient(135deg, #031633 0%, #0a2a5c 100%);
  color: white;
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
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-color, #031633);
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.label {
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  top: 1rem;
  right: 1rem;
  animation: pulse 2s infinite;
}

.status-indicator.active {
  background-color: #28a745;
}

.status-indicator.completed {
  background-color: #007bff;
}

.status-indicator.pending {
  background-color: #ffc107;
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

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #FFA500 0%, #FFB733 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.operations-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.operations-card {
  background: var(--bg-color, white);
  color: var(--text-color, #031633);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(3, 22, 51, 0.1);
  border: 1px solid var(--border-color, rgba(255, 165, 0, 0.1));
  padding: 2rem;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.operations-card h3 {
  color: var(--text-color, #031633);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.process-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.process-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--card-bg, #f8f9fa);
  border: 1px solid var(--border-color, rgba(255, 165, 0, 0.1));
  transition: all 0.3s ease;
}

.process-item:hover {
  background-color: var(--card-hover-bg, #e9ecef);
  transform: translateX(4px);
}

.process-icon {
  font-size: 2rem;
  width: 60px;
  text-align: center;
}

.process-info {
  flex: 1;
}

.process-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color, #031633);
  font-size: 1.1rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.process-info p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.process-status {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.process-status.active {
  background-color: #d4edda;
  color: #155724;
}

.process-status.completed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.process-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.metric-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #FFA500 0%, #FFB733 100%);
  color: white;
}

.metric-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .supervisor-container {
    padding: 1rem;
    padding-top: 110px;
    /* Padding superior para mobile con menú hamburguesa */
    max-width: 100vw;
    overflow-x: hidden;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .operations-section {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}

/* Estilos para la tabla de aprobación */
.approval-section {
  margin-bottom: 3rem;
}

.approval-card {
  background: var(--bg-color, white);
  color: var(--text-color, #031633);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(3, 22, 51, 0.1);
  border: 1px solid var(--border-color, rgba(255, 165, 0, 0.15));
  transition: background-color 0.3s ease, color 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.approval-card h3 {
  color: var(--text-color, #031633);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  transition: color 0.3s ease;
}

.table-container {
  width: 100%;
  max-width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(255, 165, 0, 0.2));
  overflow: hidden;
  box-sizing: border-box;
}

.approval-table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  table-layout: fixed;
  box-sizing: border-box;
}

.approval-table thead {
  background: linear-gradient(135deg, #031633 0%, #0a2a5c 100%);
  color: white;
}

.approval-table th,
.approval-table td {
  padding: 0 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color, rgba(255, 165, 0, 0.1));
  vertical-align: middle;
  height: 50px;
  display: table-cell;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
}

/* Definir anchos específicos para las columnas - Optimizados */
.approval-table th:nth-child(1),
.approval-table td:nth-child(1) {
  width: 16%;
  max-width: 16%;
}

/* Empleado */
.approval-table th:nth-child(2),
.approval-table td:nth-child(2) {
  width: 8%;
  max-width: 8%;
}

/* Rol */
.approval-table th:nth-child(3),
.approval-table td:nth-child(3) {
  width: 13%;
  max-width: 13%;
}

/* Fecha/Hora */
.approval-table th:nth-child(4),
.approval-table td:nth-child(4) {
  width: 11%;
  max-width: 11%;
}

/* Tipo Producto */
.approval-table th:nth-child(5),
.approval-table td:nth-child(5) {
  width: 9%;
  max-width: 9%;
}

/* Cantidad */
.approval-table th:nth-child(6),
.approval-table td:nth-child(6) {
  width: 8%;
  max-width: 8%;
}

/* Turno */
.approval-table th:nth-child(7),
.approval-table td:nth-child(7) {
  width: 9%;
  max-width: 9%;
}

/* Estado */
.approval-table th:nth-child(8),
.approval-table td:nth-child(8) {
  width: 16%;
  max-width: 16%;
}

/* Acciones */

.approval-table th {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 0.8rem 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-row {
  background: var(--bg-color, white);
  color: var(--text-color, #031633);
  transition: background-color 0.2s ease, color 0.3s ease;
}

.table-row:hover {
  background-color: var(--card-hover-bg, rgba(255, 165, 0, 0.05));
}

.employee-info {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0.75rem 0;
}

.employee-name {
  font-weight: 600;
  color: var(--text-color, #031633);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.role-badge {
  background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
  padding: 0.15rem 0.3rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 500;
  border: 1px solid rgba(255, 165, 0, 0.3);
  color: var(--text-color, #031633);
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

.date-time {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  color: var(--text-secondary, #666);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-type {
  background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
  padding: 0.15rem 0.3rem;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 500;
  border: 1px solid rgba(255, 165, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

.quantity {
  font-weight: 600;
  color: var(--text-color, #031633);
  font-size: 0.75rem;
  white-space: nowrap;
}

.shift-badge {
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.shift-badge.am {
  background-color: #d4edda;
  color: #155724;
}

.shift-badge.pm {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge {
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.2rem;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}

.approve-btn,
.reject-btn {
  background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
  padding: 0.3rem 0.4rem;
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color, #031633);
  min-width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.approve-btn:hover,
.reject-btn:hover {
  background-color: rgba(255, 165, 0, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);
}

.action-completed {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
  background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
}

@media (max-width: 1024px) {
  .approval-table {
    font-size: 0.8rem;
  }

  .approval-table th,
  .approval-table td {
    padding: 0.5rem 0.3rem;
    height: 50px;
  }

  .approval-table th {
    font-size: 0.75rem;
  }

  /* Ajustar anchos para pantallas medianas */
  .approval-table th:nth-child(1),
  .approval-table td:nth-child(1) {
    width: 14%;
  }

  /* Empleado */
  .approval-table th:nth-child(2),
  .approval-table td:nth-child(2) {
    width: 8%;
  }

  /* Rol */
  .approval-table th:nth-child(3),
  .approval-table td:nth-child(3) {
    width: 14%;
  }

  /* Fecha/Hora */
  .approval-table th:nth-child(4),
  .approval-table td:nth-child(4) {
    width: 10%;
  }

  /* Tipo Producto */
  .approval-table th:nth-child(5),
  .approval-table td:nth-child(5) {
    width: 8%;
  }

  /* Cantidad */
  .approval-table th:nth-child(6),
  .approval-table td:nth-child(6) {
    width: 8%;
  }

  /* Turno */
  .approval-table th:nth-child(7),
  .approval-table td:nth-child(7) {
    width: 8%;
  }

  /* Estado */
  .approval-table th:nth-child(8),
  .approval-table td:nth-child(8) {
    width: 20%;
  }

  /* Acciones */

  .employee-name {
    font-size: 0.8rem;
  }

  .date-time {
    font-size: 0.7rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.2rem;
  }

  .approve-btn,
  .reject-btn {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
    min-width: 25px;
    height: 25px;
  }
}

/* Estilos para vista mobile */
.mobile-cards-view {
  display: none;
}

.desktop-view {
  display: table;
}

@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-cards-view {
    display: block;
  }

  .mobile-card {
    background: var(--bg-color, white);
    border: 1px solid var(--border-color, rgba(255, 165, 0, 0.2));
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(3, 22, 51, 0.1);
    transition: all 0.3s ease;
  }

  .mobile-card:hover {
    box-shadow: 0 4px 16px rgba(3, 22, 51, 0.15);
    transform: translateY(-2px);
  }

  .mobile-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color, rgba(255, 165, 0, 0.1));
  }

  .mobile-employee-name {
    font-weight: 600;
    color: var(--text-color, #031633);
    font-size: 1rem;
  }

  .mobile-status-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .mobile-status-badge.pending {
    background-color: #fff3cd;
    color: #856404;
  }

  .mobile-status-badge.approved {
    background-color: #d4edda;
    color: #155724;
  }

  .mobile-status-badge.rejected {
    background-color: #f8d7da;
    color: #721c24;
  }

  .mobile-card-content {
    margin-bottom: 1rem;
  }

  .mobile-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0;
  }

  .mobile-info-row:last-child {
    margin-bottom: 0;
  }

  .mobile-label {
    font-size: 0.8rem;
    color: var(--text-secondary, #666);
    font-weight: 500;
    min-width: 70px;
  }

  .mobile-value {
    font-size: 0.8rem;
    color: var(--text-color, #031633);
    font-weight: 500;
    text-align: right;
  }

  .mobile-role-badge {
    background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
    padding: 0.2rem 0.5rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    border: 1px solid rgba(255, 165, 0, 0.3);
    color: var(--text-color, #031633);
    text-transform: uppercase;
  }

  .mobile-product-type {
    background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
    padding: 0.2rem 0.5rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    border: 1px solid rgba(255, 165, 0, 0.3);
    color: var(--text-color, #031633);
  }

  .mobile-shift-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .mobile-shift-badge.am {
    background-color: #d4edda;
    color: #155724;
  }

  .mobile-shift-badge.pm {
    background-color: #d1ecf1;
    color: #0c5460;
  }

  .mobile-card-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color, rgba(255, 165, 0, 0.1));
  }

  .mobile-approve-btn,
  .mobile-reject-btn {
    flex: 1;
    background-color: var(--card-bg, rgba(255, 165, 0, 0.1));
    border: 1px solid rgba(255, 165, 0, 0.3);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-color, #031633);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .mobile-approve-btn:hover,
  .mobile-reject-btn:hover {
    background-color: rgba(255, 165, 0, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);
  }

  .mobile-approve-btn:active,
  .mobile-reject-btn:active {
    transform: translateY(0);
  }
}
</style>
