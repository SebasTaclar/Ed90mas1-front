<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal upsert-team-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ mode === 'create' ? 'Crear Nuevo Equipo' : 'Editar Equipo' }}</h3>
        <button @click="handleCloseClick" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="team-form">
          <!-- Información básica del equipo -->
          <div class="form-section">
            <h4>Información del Equipo</h4>

            <div class="form-row">
              <div class="input-group">
                <label for="teamName">Nombre del Equipo *</label>
                <input type="text" id="teamName" v-model="formData.name" required placeholder="Ej: Deportivo La Cantera"
                  class="form-input" :class="{ 'error': errors.name }" @input="clearError('name')"
                  autocomplete="organization" />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>

              <div class="input-group">
                <label for="logoFile">Logo del Equipo</label>

                <!-- Zona de carga de archivos mejorada -->
                <div class="logo-upload-zone"
                  :class="{ 'has-file': selectedFile || (props.teamData?.logoPath && props.mode === 'edit') }">

                  <!-- Si hay logo existente en modo edición -->
                  <div v-if="!selectedFile && props.teamData?.logoPath && props.mode === 'edit'"
                    class="existing-logo-section">
                    <div class="existing-logo">
                      <img :src="props.teamData.logoPath" alt="Logo actual" class="current-logo-image" />
                      <div class="logo-actions">
                        <button type="button" @click="handleLogoDelete" class="btn-delete-logo" :disabled="loading">
                          <span class="icon">🗑️</span>
                          Eliminar Logo
                        </button>
                        <button type="button" @click="triggerFileInput" class="btn-change-logo">
                          <span class="icon">📷</span>
                          Cambiar Logo
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Zona de subida/previsualización -->
                  <div v-else class="upload-section">

                    <!-- Si no hay archivo seleccionado -->
                    <div v-if="!selectedFile" class="upload-area" @click="triggerFileInput" @drop="handleDrop"
                      @dragover="handleDragOver" @dragleave="handleDragLeave">
                      <div class="upload-icon">📁</div>
                      <p class="upload-text-primary">Arrastra una imagen aquí o haz clic para seleccionar</p>
                      <p class="upload-text-secondary">JPG, PNG, GIF hasta 5MB</p>
                      <div class="upload-button">
                        <span class="icon">📷</span>
                        Seleccionar Imagen
                      </div>
                    </div>

                    <!-- Si hay archivo seleccionado -->
                    <div v-else class="file-selected-section">
                      <div class="preview-container">
                        <img :src="previewImageUrl" alt="Vista previa del logo" class="preview-image-enhanced" />
                        <div class="preview-overlay">
                          <button type="button" @click="clearFile" class="btn-remove-file">
                            <span class="icon">❌</span>
                            Quitar
                          </button>
                          <button type="button" @click="triggerFileInput" class="btn-change-file">
                            <span class="icon">🔄</span>
                            Cambiar
                          </button>
                        </div>
                      </div>
                      <div class="file-info">
                        <p class="file-name-enhanced">{{ selectedFileName }}</p>
                        <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Input oculto -->
                <input type="file" id="logoFile" ref="logoFileInput" accept="image/*" class="hidden-file-input"
                  @change="handleFileChange" />

                <span v-if="errors.logoFile" class="error-message">{{ errors.logoFile }}</span>
              </div>
            </div>
          </div>

          <!-- Información del capitán (solo en modo crear) -->
          <div v-if="mode === 'create'" class="form-section">
            <h4>Información del Capitán</h4>

            <div class="form-row">
              <div class="input-group">
                <label for="userName">Nombre del Capitán *</label>
                <input type="text" id="userName" v-model="formData.userName" required placeholder="Ej: Carlos León"
                  class="form-input" :class="{ 'error': errors.userName }" @input="clearError('userName')"
                  autocomplete="name" />
                <span v-if="errors.userName" class="error-message">{{ errors.userName }}</span>
              </div>

              <div class="input-group">
                <label for="userEmail">Email del Capitán *</label>
                <input type="email" id="userEmail" v-model="formData.userEmail" required
                  placeholder="capitan@ejemplo.com" class="form-input" :class="{ 'error': errors.userEmail }"
                  @input="clearError('userEmail')" autocomplete="email" />
                <span v-if="errors.userEmail" class="error-message">{{ errors.userEmail }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="input-group">
                <label for="userPassword">Contraseña del Capitán *</label>
                <input type="password" id="userPassword" v-model="formData.userPassword" required placeholder="••••••••"
                  class="form-input" :class="{ 'error': errors.userPassword }" @input="clearError('userPassword')"
                  autocomplete="new-password" />
                <span v-if="errors.userPassword" class="error-message">{{ errors.userPassword }}</span>
              </div>
            </div>
          </div>

          <!-- Información del capitán (solo en modo editar - solo lectura) -->
          <div v-else class="form-section">
            <h4>Información del Capitán</h4>
            <div class="readonly-info">
              <div class="info-item">
                <strong>Nombre:</strong> {{ teamData?.user.name }}
              </div>
              <div class="info-item">
                <strong>Email:</strong> {{ teamData?.user.email }}
              </div>
            </div>
          </div>

          <!-- Torneos asociados -->
          <div class="form-section">
            <h4>Torneos Asociados</h4>

            <!-- Indicador de carga para partidos -->
            <div v-if="loadingMatches" class="loading-matches">
              <span class="loading-icon">⏳</span>
              Verificando partidos existentes...
            </div>

            <div class="tournaments-selection">
              <div v-if="availableTournaments.length === 0" class="no-tournaments-message">
                No hay torneos disponibles
              </div>
              <div v-else class="tournaments-checkboxes">
                <label v-for="tournament in availableTournaments" :key="tournament.id" class="tournament-checkbox"
                  :class="{ 'locked': lockedTournamentIds.includes(tournament.id) }">
                  <input type="checkbox" :value="tournament.id" v-model="formData.tournamentIds"
                    :disabled="lockedTournamentIds.includes(tournament.id)" @change="clearError('tournamentIds')" />
                  <span class="checkbox-text">
                    <strong>{{ tournament.name }}</strong>
                    <small v-if="tournament.description">{{ tournament.description }}</small>
                    <span class="tournament-dates">
                      {{ formatDate(tournament.startDate) }} - {{ formatDate(tournament.endDate) }}
                    </span>
                    <!-- Mensaje informativo si está bloqueado -->
                    <div v-if="lockedTournamentIds.includes(tournament.id)" class="locked-message">
                      {{ getLockMessage(tournament.id) }}
                    </div>
                  </span>
                </label>
              </div>
            </div>
            <span v-if="errors.tournamentIds" class="error-message">{{ errors.tournamentIds }}</span>
          </div>

          <!-- Error general -->
          <div v-if="errors.general" class="error-message general-error">
            {{ errors.general }}
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <button type="button" @click="handleCloseClick" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="loading || !isFormValid" class="btn-primary">
              {{ loading ? 'Guardando...' : (mode === 'create' ? 'Crear Equipo' : 'Actualizar Equipo') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-if="showConfirmation" title="¿Descartar cambios?"
      message="¿Estás seguro de que deseas cerrar el formulario? Los cambios no guardados se perderán."
      confirm-text="Descartar" cancel-text="Continuar editando" @confirm="confirmClose" @cancel="cancelClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTeams } from '@/composables/useTeams'
import { useTournaments } from '@/composables/useTournaments'
import { matchesService } from '@/services/matchesService'
import type { Team, CreateTeamRequest, UpdateTeamRequest } from '@/types/TeamType'
import type { Tournament } from '@/types/TournamentType'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

interface Props {
  teamData?: Team | null
  mode: 'create' | 'edit'
}

interface Emits {
  (e: 'close'): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { createTeam, updateTeam, uploadTeamLogo, deleteTeamLogo, loading } = useTeams()
const { tournaments, loadTournaments } = useTournaments()

// Referencias para el archivo
const logoFileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string>('')
const previewImageUrl = ref<string>('')

// Estado del formulario
const formData = ref<CreateTeamRequest>({
  name: '',
  logoPath: '',
  userEmail: '',
  userPassword: '',
  userName: '',
  tournamentIds: []
})

const errors = ref<Record<string, string>>({})

// Variables para confirmación de cambios
const showConfirmation = ref(false)
const initialFormData = ref<string>('')

// Estado para validar partidos existentes
const tournamentMatchesMap = ref<Map<number, any[]>>(new Map())
const loadingMatches = ref(false)
const availableTournaments = computed(() => {
  const now = new Date()
  return (tournaments.value || []).filter(tournament => {
    const endDate = new Date(tournament.endDate)
    // Solo mostrar torneos que no hayan terminado (vigentes o futuros)
    return endDate >= now
  })
})

// Computed para detectar cambios
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== initialFormData.value
})

const isFormValid = computed(() => {
  if (props.mode === 'create') {
    return formData.value.name &&
      formData.value.userName &&
      formData.value.userEmail &&
      formData.value.userPassword
  } else {
    return formData.value.name
  }
})

// Métodos
const clearError = (field: string) => {
  delete errors.value[field]
}

// Función para cargar partidos existentes de un torneo específico
const loadTournamentMatches = async (tournamentId: number) => {
  try {
    const matches = await matchesService.getTournamentMatches(tournamentId)
    tournamentMatchesMap.value.set(tournamentId, matches || [])
  } catch (error) {
    console.error(`Error cargando partidos del torneo ${tournamentId}:`, error)
    tournamentMatchesMap.value.set(tournamentId, [])
  }
}

// Función para verificar si un torneo tiene partidos con el equipo actual
const tournamentHasMatchesWithTeam = (tournamentId: number): boolean => {
  if (!props.teamData?.id) return false

  const matches = tournamentMatchesMap.value.get(tournamentId) || []
  return matches.some(match =>
    match.homeTeamId === props.teamData!.id ||
    match.awayTeamId === props.teamData!.id
  )
}

// Función para verificar si un torneo tiene partidos en general (cualquier equipo)
const tournamentHasAnyMatches = (tournamentId: number): boolean => {
  const matches = tournamentMatchesMap.value.get(tournamentId) || []
  return matches.length > 0
}

// Computed para obtener tournamentIds que no se pueden modificar
const lockedTournamentIds = computed(() => {
  return availableTournaments.value
    .filter(tournament => {
      // En modo crear: bloquear torneos que ya tienen partidos
      if (props.mode === 'create') {
        return tournamentHasAnyMatches(tournament.id)
      }

      // En modo editar: bloquear torneos donde el equipo ya tiene partidos
      // O torneos que tienen partidos en general (para evitar agregar nuevos equipos)
      return tournamentHasMatchesWithTeam(tournament.id) ||
        (tournamentHasAnyMatches(tournament.id) && !formData.value.tournamentIds.includes(tournament.id))
    })
    .map(tournament => tournament.id)
})

// Función para obtener el mensaje de bloqueo específico por torneo
const getLockMessage = (tournamentId: number): string => {
  if (props.mode === 'create') {
    return '🚫 No se puede agregar: el torneo ya tiene partidos creados'
  }

  // Modo editar
  if (tournamentHasMatchesWithTeam(tournamentId)) {
    return '🚫 No se puede remover: ya existen partidos con este equipo'
  } else if (tournamentHasAnyMatches(tournamentId)) {
    return '🚫 No se puede agregar: el torneo ya tiene partidos creados'
  }

  return '🚫 No se puede modificar'
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      errors.value.logoFile = 'Por favor selecciona una imagen válida'
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.logoFile = 'El archivo no puede ser mayor a 5MB'
      return
    }

    selectedFile.value = file
    selectedFileName.value = file.name

    // Generar URL de previsualización
    if (previewImageUrl.value) {
      URL.revokeObjectURL(previewImageUrl.value) // Limpiar URL anterior
    }
    previewImageUrl.value = URL.createObjectURL(file)

    clearError('logoFile')
  }
}

const clearFile = () => {
  selectedFile.value = null
  selectedFileName.value = ''
  if (logoFileInput.value) {
    logoFileInput.value.value = ''
  }
  // Limpiar URL de previsualización
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
  clearError('logoFile')
}

// Nuevas funciones para la UI mejorada
const triggerFileInput = () => {
  logoFileInput.value?.click()
}

const handleLogoDelete = async () => {
  if (!props.teamData?.id) return

  const result = await deleteTeamLogo(props.teamData.id)
  if (result.success) {
    // El logo se eliminó exitosamente
    // El estado local ya se actualiza automáticamente en el composable
  } else {
    errors.value.logoFile = result.message || 'Error al eliminar el logo'
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      const mockEvent = { target: { files: [file] } }
      handleFileChange(mockEvent as any)
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const resetForm = () => {
  formData.value = {
    name: '',
    logoPath: '',
    userEmail: '',
    userPassword: '',
    userName: '',
    tournamentIds: []
  }
  errors.value = {}
  selectedFile.value = null
  selectedFileName.value = ''
  if (logoFileInput.value) {
    logoFileInput.value.value = ''
  }
  // Limpiar URL de previsualización
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
}

const loadFormData = () => {
  if (props.mode === 'edit' && props.teamData) {
    formData.value = {
      name: props.teamData.name,
      logoPath: props.teamData.logoPath || '',
      userEmail: props.teamData.user.email,
      userPassword: '', // No cargar contraseña en edición
      userName: props.teamData.user.name,
      tournamentIds: props.teamData.tournaments.map(t => t.id)
    }
  } else {
    resetForm()
  }

  // Guardar estado inicial para detectar cambios
  initialFormData.value = JSON.stringify(formData.value)
}

const handleSubmit = async () => {
  errors.value = {}

  try {
    let result

    if (props.mode === 'create') {
      // Paso 1: Crear el equipo
      result = await createTeam(formData.value)

      if (result?.success && selectedFile.value && result.data) {
        // Paso 2: Subir el logo si hay un archivo seleccionado
        try {
          const logoResult = await uploadTeamLogo(result.data.id, selectedFile.value)
          if (!logoResult.success) {
            // Si falla la subida del logo, mostrar advertencia pero no fallar completamente
            errors.value.general = `Equipo creado correctamente, pero hubo un error al subir el logo: ${logoResult.message}`
          }
        } catch (logoError) {
          console.warn('Error uploading logo after team creation:', logoError)
          errors.value.general = 'Equipo creado correctamente, pero hubo un error al subir el logo.'
        }
      }
    } else if (props.teamData) {
      const updateData: UpdateTeamRequest = {
        name: formData.value.name,
        logoPath: formData.value.logoPath,
        tournamentIds: formData.value.tournamentIds
      }
      result = await updateTeam(props.teamData.id, updateData)

      // Si hay un archivo seleccionado en modo edición, subir el logo
      if (result?.success && selectedFile.value) {
        try {
          const logoResult = await uploadTeamLogo(props.teamData.id, selectedFile.value)
          if (!logoResult.success) {
            errors.value.general = `Equipo actualizado correctamente, pero hubo un error al subir el logo: ${logoResult.message}`
          }
        } catch (logoError) {
          console.warn('Error uploading logo after team update:', logoError)
          errors.value.general = 'Equipo actualizado correctamente, pero hubo un error al subir el logo.'
        }
      }
    }

    if (result?.success) {
      emit('save')
    } else {
      errors.value.general = result?.message || 'Error al guardar el equipo'
    }
  } catch (error) {
    console.error('Error saving team:', error)
    errors.value.general = 'Error interno del sistema'
  }
}

// Funciones de confirmación de cambios
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

// Watchers
watch(() => props.teamData, loadFormData, { immediate: true })
watch(() => props.mode, loadFormData)

// Watcher para cargar partidos cuando cambien los torneos disponibles
watch(() => availableTournaments.value, async (newTournaments) => {
  if (newTournaments.length > 0) {
    loadingMatches.value = true
    try {
      // Cargar partidos para todos los torneos disponibles (tanto en crear como editar)
      await Promise.all(
        newTournaments.map(tournament => loadTournamentMatches(tournament.id))
      )
    } catch (error) {
      console.error('Error cargando partidos de torneos:', error)
    } finally {
      loadingMatches.value = false
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await loadTournaments()
  loadFormData()
})

onUnmounted(() => {
  // Limpiar URL de previsualización para evitar memory leaks
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.upsert-team-modal {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--app-shadow);
  border: 1px solid var(--app-border-color);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--app-border-color);
  background: var(--app-bg-primary);
}

.modal-header h3 {
  margin: 0;
  color: var(--primary-blue);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--app-text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--app-hover-bg);
  color: var(--app-text-primary);
}

.modal-body {
  padding: 2rem;
}

.team-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  border: 1px solid var(--app-border-color);
}

.form-section h4 {
  margin: 0 0 1.5rem 0;
  color: var(--app-text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-section h4::before {
  content: '●';
  color: var(--primary-blue);
  font-size: 0.8rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  transition: all var(--transition-normal);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.form-input.error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.readonly-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--app-input-bg);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
}

.info-item {
  color: var(--app-text-secondary);
}

.info-item strong {
  color: var(--app-text-primary);
}

.tournaments-selection {
  margin-top: 1rem;
}

.loading-matches {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--app-bg-secondary);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--app-border-color);
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.loading-icon {
  font-size: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.no-tournaments-message {
  color: var(--app-text-secondary);
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.tournaments-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tournament-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--app-input-bg);
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.tournament-checkbox:hover {
  background: var(--app-hover-bg);
  border-color: var(--primary-blue);
}

.tournament-checkbox.locked {
  opacity: 0.6;
  background: var(--app-bg-secondary);
  border-color: #dc3545;
  cursor: not-allowed;
}

.tournament-checkbox.locked:hover {
  background: var(--app-bg-secondary);
  border-color: #dc3545;
}

.tournament-checkbox.locked input[type="checkbox"] {
  cursor: not-allowed;
}

.tournament-checkbox input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.checkbox-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-text strong {
  color: var(--app-text-primary);
  font-weight: 600;
}

.checkbox-text small {
  color: var(--app-text-secondary);
  font-size: 0.85rem;
}

.tournament-dates {
  color: var(--primary-blue);
  font-size: 0.8rem;
  font-weight: 500;
}

.error-message {
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 500;
}

.general-error {
  background: rgba(220, 53, 69, 0.1);
  padding: 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--danger);
  text-align: center;
}

.locked-message {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(220, 53, 69, 0.3);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border-color);
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary-blue);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--tertiary-blue);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  border: 1px solid var(--app-border-color);
}

.btn-secondary:hover {
  background: var(--app-hover-bg);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

/* Responsive Design */
@media (max-width: 768px) {
  .upsert-team-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-section {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-header h3 {
    font-size: 1.1rem;
  }

  .form-input {
    font-size: 0.9rem;
  }
}

/* =================================================
   ESTILOS MEJORADOS PARA CARGA DE ARCHIVOS
   ================================================= */

/* Input oculto */
.hidden-file-input {
  display: none;
}

/* Zona principal de carga */
.logo-upload-zone {
  margin-top: 0.5rem;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

/* Sección de logo existente (modo edición) */
.existing-logo-section {
  background: var(--app-input-bg);
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
}

.existing-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.current-logo-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 3px solid var(--app-border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-delete-logo,
.btn-change-logo {
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

.btn-delete-logo {
  background: rgba(220, 53, 69, 0.1);
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-delete-logo:hover:not(:disabled) {
  background: var(--danger);
  color: var(--white);
  transform: translateY(-1px);
}

.btn-change-logo {
  background: var(--primary-blue);
  color: var(--white);
}

.btn-change-logo:hover {
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
  width: 120px;
  height: 120px;
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

/* Responsive para upload */
@media (max-width: 768px) {
  .file-selected-section {
    flex-direction: column;
    text-align: center;
  }

  .logo-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-delete-logo,
  .btn-change-logo {
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
