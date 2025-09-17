<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>💰 Registrar Pago</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="team-info">
          <img
            v-if="team.logoPath"
            :src="team.logoPath"
            :alt="team.name"
            class="team-logo"
          >
          <div>
            <h4>{{ team.name }}</h4>
            <p>{{ team.category }}</p>
          </div>
        </div>

        <div class="payment-summary">
          <div class="summary-item">
            <span>Balance actual:</span>
            <span :class="{ negative: team.balance < 0 }">
              {{ formatCurrency(team.balance) }}
            </span>
          </div>
          <div class="summary-item">
            <span>Monto pendiente:</span>
            <span class="pending">{{ formatCurrency(team.pendingAmount) }}</span>
          </div>
        </div>

        <form @submit.prevent="submitPayment">
          <div class="form-group">
            <label for="amount">Monto del pago *</label>
            <input
              id="amount"
              v-model.number="paymentForm.amount"
              type="number"
              min="0"
              step="1000"
              required
              placeholder="Ej: 50000"
            >
            <small>Máximo pendiente: {{ formatCurrency(team.pendingAmount) }}</small>
          </div>

          <div class="form-group">
            <label for="concept">Concepto *</label>
            <select id="concept" v-model="paymentForm.concept" required>
              <option value="">Seleccionar concepto</option>
              <option value="inscripcion">Inscripción</option>
              <option value="mensualidad">Mensualidad</option>
              <option value="multa">Pago de multa</option>
              <option value="uniforme">Uniforme</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div class="form-group">
            <label for="method">Método de pago *</label>
            <select id="method" v-model="paymentForm.method" required>
              <option value="">Seleccionar método</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia bancaria</option>
              <option value="tarjeta">Tarjeta de crédito/débito</option>
            </select>
          </div>

          <div v-if="paymentForm.method === 'transferencia'" class="form-group">
            <label for="reference">Número de referencia</label>
            <input
              id="reference"
              v-model="paymentForm.reference"
              type="text"
              placeholder="Número de transacción"
            >
          </div>

          <div class="form-group">
            <label for="date">Fecha del pago *</label>
            <input
              id="date"
              v-model="paymentForm.date"
              type="date"
              :max="maxDate"
              required
            >
          </div>

          <div class="form-group">
            <label for="description">Descripción adicional</label>
            <textarea
              id="description"
              v-model="paymentForm.description"
              rows="3"
              placeholder="Observaciones sobre el pago..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="!isFormValid || isSubmitting"
            >
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              {{ isSubmitting ? 'Registrando...' : 'Registrar Pago' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TeamFinancialInfo, Payment } from '@/types/FinancialTypes'

defineOptions({
  name: 'PaymentRegistrationModal'
})

interface Props {
  team: TeamFinancialInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  paymentRegistered: [payment: Payment]
}>()

const isSubmitting = ref(false)

const paymentForm = ref({
  amount: 0,
  concept: '',
  method: '',
  reference: '',
  date: '',
  description: ''
})

const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return paymentForm.value.amount > 0 &&
         paymentForm.value.concept &&
         paymentForm.value.method &&
         paymentForm.value.date &&
         paymentForm.value.amount <= props.team.pendingAmount
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

const submitPayment = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Simular llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1500))

    const payment: Payment = {
      id: Date.now(),
      teamId: props.team.id,
      amount: paymentForm.value.amount,
      date: new Date(paymentForm.value.date),
      concept: paymentForm.value.concept,
      method: paymentForm.value.method as 'efectivo' | 'transferencia' | 'tarjeta',
      reference: paymentForm.value.reference,
      createdBy: 1 // ID del usuario actual (se obtendrá del contexto de autenticación)
    }

    emit('paymentRegistered', payment)
    emit('close')

    // Notificación de éxito (se puede integrar con el sistema de notificaciones)
    console.log('Pago registrado exitosamente:', payment)

  } catch (error) {
    console.error('Error registrando pago:', error)
    // Manejar error
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // Establecer fecha actual por defecto
  paymentForm.value.date = new Date().toISOString().split('T')[0]

  // Si hay un monto pendiente, sugerirlo como monto del pago
  if (props.team.pendingAmount > 0) {
    paymentForm.value.amount = props.team.pendingAmount
  }
})
</script>

<style scoped>
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--app-border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid var(--app-border-color);
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: var(--white);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  opacity: 0.8;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--app-hover-bg);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--app-border-color);
}

.team-logo {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-lg);
  object-fit: cover;
}

.team-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--app-text-primary);
  font-size: 1.1rem;
  font-weight: 700;
}

.team-info p {
  margin: 0;
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-summary {
  background: var(--app-input-bg);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--app-border-color);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item span:first-child {
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-item span:last-child {
  color: var(--app-text-primary);
  font-weight: 700;
  font-size: 1rem;
}

.summary-item .negative {
  color: #f44336;
}

.summary-item .pending {
  color: #ff9800;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--app-text-primary);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-lg);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  transition: all var(--transition-normal);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  color: var(--app-text-secondary);
  font-size: 0.8rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--app-border-color);
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-lg);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 94, 180, 0.3);
}

.btn-primary:disabled {
  background: var(--app-text-secondary);
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
}

.btn-secondary {
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  border: 1px solid var(--app-border-color);
}

.btn-secondary:hover {
  background: var(--app-hover-bg);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .team-info {
    padding: 1rem;
  }

  .payment-summary {
    padding: 1rem;
  }
}
</style>
