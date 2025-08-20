<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Crear Nuevo Partido</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form-content">
        <div class="form-group">
          <label class="form-label">Fase</label>
          <div class="form-input">
            <select v-model="formData.phase" required>
              <option value="">Seleccionar fase</option>
              <option value="Dieciseisavos de Final">Dieciseisavos de Final</option>
              <option value="Octavos de Final">Octavos de Final</option>
              <option value="Cuartos de Final">Cuartos de Final</option>
              <option value="Semifinales">Semifinales</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Equipo Local</label>
            <div class="form-input">
              <select v-model="formData.homeTeam" required>
                <option value="">Seleccionar equipo</option>
                <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Equipo Visitante</label>
            <div class="form-input">
              <select v-model="formData.awayTeam" required>
                <option value="">Seleccionar equipo</option>
                <option v-for="team in availableTeams" :key="team.id" :value="team.id"
                  :disabled="team.id.toString() === formData.homeTeam">
                  {{ team.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha</label>
            <input type="date" v-model="formData.date" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Hora</label>
            <input type="time" v-model="formData.time" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Lugar</label>
          <input type="text" v-model="formData.location" class="form-input" placeholder="Ingrese el lugar del partido"
            required />
        </div>

        <!-- Mensaje de error para equipos iguales -->
        <div v-if="sameTeamError" class="error-message">
          ⚠️ No se puede enfrentar el mismo equipo. Por favor seleccione equipos diferentes.
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid">
            Crear Partido
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface SimpleTeam {
  id: number
  name: string
  logoPath?: string | null
}

interface CreateMatchForm {
  phase: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  location: string
}

interface Props {
  isVisible: boolean
  availableTeams: SimpleTeam[]
}const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [formData: CreateMatchForm]
}>()

const formData = ref<CreateMatchForm>({
  phase: '',
  homeTeam: '',
  awayTeam: '',
  date: '',
  time: '',
  location: ''
})

// Computed para detectar si se seleccionó el mismo equipo
const sameTeamError = computed(() => {
  return formData.value.homeTeam &&
    formData.value.awayTeam &&
    formData.value.homeTeam === formData.value.awayTeam
})

const isFormValid = computed(() => {
  return formData.value.phase &&
    formData.value.homeTeam &&
    formData.value.awayTeam &&
    formData.value.date &&
    formData.value.time &&
    formData.value.location &&
    formData.value.homeTeam !== formData.value.awayTeam
})

const handleSubmit = () => {
  if (isFormValid.value) {
    emit('submit', { ...formData.value })
    resetForm()
  }
}

const resetForm = () => {
  formData.value = {
    phase: '',
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    location: ''
  }
}

// Reset form when modal is opened
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    resetForm()
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--app-border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--app-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--app-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color var(--transition-normal);
}

.close-btn:hover {
  color: var(--app-text-primary);
}

.form-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--app-text-primary);
  font-weight: 500;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  transition: border-color var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Estilos específicos para select en form */
.form-input select {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--app-text-primary);
  font-size: inherit;
  width: 100%;
  cursor: pointer;
}

.form-input select:focus {
  outline: none;
}

.form-input select option {
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}

.form-input select option:hover {
  background: var(--primary-blue);
  color: var(--white);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--border-radius-md);
  color: #ef4444;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border-color);
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: none;
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-blue-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--app-text-secondary);
  border: 2px solid var(--app-border-color);
}

.btn-secondary:hover {
  background: var(--app-hover-bg);
  color: var(--app-text-primary);
}

@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
