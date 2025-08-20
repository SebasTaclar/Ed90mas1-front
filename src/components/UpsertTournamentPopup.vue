<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal tournament-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ mode === 'create' ? 'Crear Nuevo Torneo' : 'Editar Torneo' }}</h3>
        <button @click="handleCloseClick" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-row">
          <div class="input-group">
            <label for="tournamentName">Nombre del Torneo *</label>
            <input type="text" id="tournamentName" v-model="formData.name" required
              placeholder="Ej: Copa Ed90+1 Verano 2025" class="form-input" :class="{ 'error': errors.name }"
              @input="clearError('name')" />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="input-group">
            <label for="tournamentDescription">Descripción *</label>
            <textarea id="tournamentDescription" v-model="formData.description" required
              placeholder="Describe el torneo, modalidad, premios, etc." class="form-textarea"
              :class="{ 'error': errors.description }" @input="clearError('description')" rows="3"></textarea>
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label for="startDate">Fecha de Inicio *</label>
            <input type="date" id="startDate" v-model="formData.startDate" required class="form-input"
              :class="{ 'error': errors.startDate }" @input="clearError('startDate')" />
            <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
          </div>

          <div class="input-group">
            <label for="endDate">Fecha de Fin *</label>
            <input type="date" id="endDate" v-model="formData.endDate" required class="form-input"
              :class="{ 'error': errors.endDate }" @input="clearError('endDate')" />
            <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="input-group full-width">
            <label>Categorías Participantes *</label>
            <div class="categories-selection">
              <div v-if="categories.length === 0" class="no-categories-message">
                No hay categorías disponibles
              </div>
              <div v-else class="categories-checkboxes">
                <label v-for="category in categories" :key="category.id" class="category-checkbox">
                  <input type="checkbox" :value="category.id" v-model="formData.categoryIds"
                    @change="clearError('categories')" />
                  <span class="checkbox-text">
                    <strong>{{ category.name }}</strong>
                    <small>{{ category.description || 'Categoría de competencia' }}</small>
                  </span>
                </label>
              </div>
            </div>
            <span v-if="errors.categories" class="error-message">{{ errors.categories }}</span>
          </div>
        </div>

        <!-- Sección de Banner del Torneo -->
        <div class="form-row">
          <div class="input-group full-width">
            <label>Banner del Torneo</label>

            <!-- Input de archivo oculto -->
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden-file-input"
              autocomplete="off" />

            <div class="banner-upload-zone">
              <!-- Mostrar banner existente (modo edición) -->
              <div v-if="mode === 'edit' && currentBanner && !selectedFile" class="existing-banner-section">
                <div class="existing-banner">
                  <img :src="currentBanner" alt="Banner actual" class="current-banner-image" />
                  <div class="banner-actions">
                    <button type="button" @click="triggerFileInput" class="btn-change-banner">
                      <span class="icon">📷</span>
                      Cambiar Banner
                    </button>
                    <button type="button" @click="handleDeleteBanner" class="btn-delete-banner">
                      <span class="icon">🗑️</span>
                      Eliminar Banner
                    </button>
                  </div>
                </div>
              </div>

              <!-- Zona de subida (modo creación o sin banner) -->
              <div v-else-if="!selectedFile" class="upload-section">
                <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
                  <div class="upload-icon">📷</div>
                  <p class="upload-text-primary">Sube el banner del torneo</p>
                  <p class="upload-text-secondary">Arrastra y suelta una imagen aquí, o haz clic para seleccionar</p>
                  <span class="upload-button">Seleccionar Banner</span>
                </div>
              </div>

              <!-- Archivo seleccionado -->
              <div v-if="selectedFile" class="file-selected-section">
                <div class="preview-container">
                  <img :src="previewUrl" alt="Vista previa" class="preview-image-enhanced" />
                  <div class="preview-overlay">
                    <button type="button" @click="removeSelectedFile" class="btn-remove-file">
                      <span class="icon">❌</span>
                    </button>
                    <button type="button" @click="triggerFileInput" class="btn-change-file">
                      <span class="icon">🔄</span>
                    </button>
                  </div>
                </div>
                <div class="file-info">
                  <p class="file-name-enhanced">{{ selectedFile.name }}</p>
                  <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label for="maxTeams">Máximo de Equipos</label>
            <input type="number" id="maxTeams" v-model.number="formData.maxTeams" min="2" max="64" placeholder="16"
              class="form-input" :class="{ 'error': errors.maxTeams }" @input="clearError('maxTeams')" />
            <small class="input-help">Número máximo de equipos permitidos</small>
            <span v-if="errors.maxTeams" class="error-message">{{ errors.maxTeams }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="handleOverlayClick" class="btn-secondary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Guardando...' : (mode === 'create' ? 'Crear Torneo' : 'Actualizar Torneo') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-if="showConfirmation" title="¿Descartar cambios?"
      message="¿Estás seguro de que deseas cerrar el formulario? Los cambios no guardados se perderán."
      confirm-text="Descartar" cancel-text="Continuar editando" @confirm="confirmClose" @cancel="cancelClose" />
  </div>

  <Spinner v-if="loading" />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Tournament, CreateTournamentRequest } from '@/types/TournamentType'
import { useTournaments } from '@/composables/useTournaments'
import { useCategories } from '@/composables/useCategories'
import Spinner from '@/components/Spinner.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const { tournamentData, mode } = defineProps<{
  tournamentData: Tournament | null
  mode: 'edit' | 'create'
}>()

const emit = defineEmits(['close', 'save'])

// Estado del formulario
const formData = ref<CreateTournamentRequest>({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  categoryIds: [], // Cambiado de categories a categoryIds
  maxTeams: 0
})

// Estado de la aplicación
const { categories, loadCategories } = useCategories()
const { createTournament, updateTournament, uploadTournamentBanner, deleteTournamentBanner } = useTournaments()
const loading = ref(false)
const errors = ref<Record<string, string>>({})
const showConfirmation = ref(false)

// Estado del banner
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const currentBanner = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Estado inicial del formulario para detectar cambios
const initialFormData = ref<string>('')

// Computed para detectar cambios
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== initialFormData.value
})

const initializeForm = () => {
  if (mode === 'edit' && tournamentData) {
    // Extraer los IDs de categorías de la estructura anidada
    const categoryIds = tournamentData.tournamentCategories?.map(tc => tc.categoryId) || [];

    formData.value = {
      name: tournamentData.name,
      description: tournamentData.description,
      startDate: tournamentData.startDate.split('T')[0], // Solo la fecha
      endDate: tournamentData.endDate.split('T')[0], // Solo la fecha
      categoryIds: categoryIds,
      maxTeams: tournamentData.maxTeams || 16
    }

    // Inicializar banner existente
    currentBanner.value = tournamentData.bannerPath || null
  } else {
    // Valores por defecto para crear
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    formData.value = {
      name: '',
      description: '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      categoryIds: [],
      maxTeams: 16 // Valor por defecto
    }

    // Limpiar banner
    currentBanner.value = null
  }

  // Limpiar archivo seleccionado
  selectedFile.value = null
  previewUrl.value = ''

  // Guardar estado inicial
  initialFormData.value = JSON.stringify(formData.value)
}

const clearError = (field: string) => {
  delete errors.value[field]
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = 'El nombre del torneo es requerido'
  }

  if (!formData.value.description.trim()) {
    errors.value.description = 'La descripción es requerida'
  }

  if (!formData.value.startDate) {
    errors.value.startDate = 'La fecha de inicio es requerida'
  }

  if (!formData.value.endDate) {
    errors.value.endDate = 'La fecha de fin es requerida'
  }

  if (formData.value.startDate && formData.value.endDate) {
    if (new Date(formData.value.startDate) >= new Date(formData.value.endDate)) {
      errors.value.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  }

  if (formData.value.categoryIds.length === 0) {
    errors.value.categories = 'Debe seleccionar al menos una categoría'
  }

  if (formData.value.maxTeams < 2) {
    errors.value.maxTeams = 'El máximo de equipos debe ser al menos 2'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    let result

    if (mode === 'create') {
      // Convertir las fechas al formato ISO completo
      const formDataForApi = {
        ...formData.value,
        startDate: new Date(formData.value.startDate + 'T09:00:00.000Z').toISOString(),
        endDate: new Date(formData.value.endDate + 'T18:00:00.000Z').toISOString()
      };

      result = await createTournament(formDataForApi)
    } else {
      // Para actualización (cuando esté implementado)
      const formDataForApi = {
        ...formData.value,
        startDate: new Date(formData.value.startDate + 'T09:00:00.000Z').toISOString(),
        endDate: new Date(formData.value.endDate + 'T18:00:00.000Z').toISOString()
      };

      result = await updateTournament(tournamentData!.id, formDataForApi)
    }

    if (result.success) {
      // Si hay un archivo seleccionado, subirlo
      if (selectedFile.value && result.tournament?.id) {
        try {
          await uploadTournamentBanner(result.tournament.id, selectedFile.value)
        } catch (bannerError) {
          console.warn('Error al subir banner:', bannerError)
        }
      }

      emit('save')
    } else {
      errors.value.general = result.message || 'Error al guardar el torneo'
    }
  } catch (error) {
    errors.value.general = 'Error interno del sistema'
    console.error('Error en handleSubmit:', error)
  } finally {
    loading.value = false
  }
}

const handleOverlayClick = (event: MouseEvent) => {
  // Solo cerrar si el click fue exactamente en el overlay, no en sus elementos hijos
  if (event.target === event.currentTarget) {
    if (hasChanges.value) {
      showConfirmation.value = true
    } else {
      emit('close')
    }
  }
}

const handleCloseClick = () => {
  if (hasChanges.value) {
    showConfirmation.value = true
  } else {
    emit('close')
  }
}

const confirmClose = () => {
  showConfirmation.value = false
  emit('close')
}

const cancelClose = () => {
  showConfirmation.value = false
}

// ===== FUNCIONES DEL BANNER =====

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  selectedFile.value = file

  // Crear URL de previsualización
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // Limpiar input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeSelectedFile = () => {
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleDeleteBanner = async () => {
  if (!tournamentData?.id) return

  try {
    loading.value = true
    const result = await deleteTournamentBanner(tournamentData.id)

    if (result.success)
      currentBanner.value = null

  } catch (error) {
    console.error('Error al eliminar banner:', error)
  } finally {
    loading.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  loadCategories()
  initializeForm()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  overflow-y: auto;
  padding: 1rem;
}

.tournament-modal {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
  margin: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--app-border-color);
}

.modal-header h3 {
  color: var(--primary-blue);
  font-size: 1.4rem;
  margin: 0;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--app-text-secondary);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background var(--transition-normal);
}

.close-btn:hover {
  background: var(--app-hover-bg);
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.input-group label {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-normal);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--danger);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.input-help {
  font-size: 0.8rem;
  color: var(--app-text-secondary);
  margin-top: -0.25rem;
}

.error-message {
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 500;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500 !important;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
}

.categories-selection {
  margin-top: 0.5rem;
}

.no-categories-message {
  padding: 1rem;
  background: var(--app-input-bg);
  border-radius: var(--border-radius-md);
  color: var(--app-text-secondary);
  font-style: italic;
  text-align: center;
  border: 1px solid var(--app-border-color);
}

.categories-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--app-input-bg);
}

.category-checkbox:hover {
  border-color: var(--primary-blue);
  background: var(--app-hover-bg);
}

.category-checkbox input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.checkbox-text strong {
  color: var(--app-text-primary);
  font-size: 0.95rem;
  font-weight: 600;
}

.checkbox-text small {
  color: var(--app-text-secondary);
  font-size: 0.85rem;
  line-height: 1.3;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border-color);
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
  box-shadow: var(--app-shadow);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: var(--app-text-primary);
  border: 2px solid var(--app-border-color);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex: 1;
}

.btn-secondary:hover {
  background: var(--app-hover-bg);
  border-color: var(--primary-blue);
}

/* =================================================
   ESTILOS PARA CARGA DE BANNER
   ================================================= */

/* Input oculto */
.hidden-file-input {
  display: none;
}

/* Zona principal de carga */
.banner-upload-zone {
  margin-top: 0.5rem;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

/* Sección de banner existente (modo edición) */
.existing-banner-section {
  background: var(--app-input-bg);
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
}

.existing-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.current-banner-image {
  max-width: 300px;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 3px solid var(--app-border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-delete-banner,
.btn-change-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-delete-banner {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-delete-banner:hover:not(:disabled) {
  background: var(--danger);
  color: var(--white);
  transform: translateY(-1px);
}

.btn-change-banner {
  background: var(--primary-blue);
  color: var(--white);
}

.btn-change-banner:hover {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
}

/* Zona de subida */
.upload-section {
  min-height: 200px;
}

.upload-area {
  background: var(--app-input-bg);
  border: 2px dashed var(--app-border-color);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--primary-blue);
  background: rgba(0, 94, 180, 0.05);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.upload-text-primary {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin: 0 0 0.5rem 0;
}

.upload-text-secondary {
  font-size: 0.9rem;
  color: var(--app-text-secondary);
  margin: 0 0 1.5rem 0;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-blue);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  transition: all var(--transition-normal);
}

.upload-button:hover {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
}

/* Sección de archivo seleccionado */
.file-selected-section {
  background: var(--app-input-bg);
  border: 2px solid var(--primary-blue);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.preview-container {
  position: relative;
  flex-shrink: 0;
}

.preview-image-enhanced {
  max-width: 200px;
  max-height: 150px;
  width: auto;
  height: auto;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 3px solid var(--primary-blue);
  box-shadow: 0 4px 12px rgba(0, 94, 180, 0.2);
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--border-radius-md);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.btn-remove-file,
.btn-change-file {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  color: var(--white);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.4rem 0.7rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-remove-file:hover {
  background: rgba(220, 53, 69, 0.8);
}

.btn-change-file:hover {
  background: rgba(0, 94, 180, 0.8);
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-name-enhanced {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin: 0;
  word-break: break-all;
}

.file-size {
  font-size: 0.9rem;
  color: var(--app-text-secondary);
  margin: 0;
}

.icon {
  font-size: 1em;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .tournament-modal {
    max-width: 100%;
    margin: 0;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .file-selected-section {
    flex-direction: column;
    text-align: center;
  }

  .banner-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-delete-banner,
  .btn-change-banner {
    width: 100%;
    justify-content: center;
  }

  .upload-area {
    padding: 1.5rem 1rem;
  }

  .upload-text-primary {
    font-size: 1rem;
  }
}
</style>
