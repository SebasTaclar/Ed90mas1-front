<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-container tournament-config-popup">
      <div class="popup-header">
        <h2>⚙️ Configurar Torneo</h2>
        <p>{{ tournamentData?.name }}</p>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>

      <div class="popup-body">
        <!-- Información del torneo -->
        <div class="tournament-info">
          <div class="info-card">
            <h3>📊 Información del Torneo</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Equipos registrados:</span>
                <span class="value">{{ registeredTeams.length }}</span>
              </div>
              <div class="info-item">
                <span class="label">Capacidad máxima:</span>
                <span class="value">{{ tournamentData?.maxTeams }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de grupos -->
        <div class="configuration-section">
          <h3>🏆 Configuración de Grupos</h3>

          <div class="config-form">
            <div class="form-row">
              <div class="input-group">
                <label for="numberOfGroups">Número de Grupos *</label>
                <select id="numberOfGroups" v-model="localConfiguration.numberOfGroups"
                  @change="updateGroupConfiguration" class="form-select" :disabled="loading || isCreatingConfiguration">
                  <option value="">Selecciona...</option>
                  <option v-for="num in availableGroupNumbers" :key="num" :value="num">
                    {{ num }} {{ num === 1 ? 'grupo' : 'grupos' }}
                  </option>
                </select>
              </div>

              <div class="input-group" v-if="localConfiguration.numberOfGroups">
                <label>Equipos por Grupo</label>
                <div class="teams-distribution">
                  {{ registeredTeams.length > 0 ? Math.ceil(registeredTeams.length / localConfiguration.numberOfGroups)
                    : 0 }} equipos aprox.
                </div>
              </div>
            </div> <!-- Vista previa de grupos -->
            <div v-if="localConfiguration.numberOfGroups && previewGroups.length > 0" class="groups-preview">
              <h4>👀 Vista Previa de Grupos</h4>

              <div class="preview-actions">
                <button @click="generateRandomGroups" class="btn-secondary">
                  🎲 Generar Aleatoriamente
                </button>
                <button @click="generateBalancedGroups" class="btn-secondary">
                  ⚖️ Distribución Balanceada
                </button>
              </div>

              <div class="groups-container">
                <div v-if="loading || isCreatingConfiguration" class="loading-state">
                  <Spinner />
                  <p>{{ isCreatingConfiguration ? 'Creando configuración...' : 'Cargando configuración...' }}</p>
                </div>

                <div v-else-if="previewGroups.length > 0" class="groups-content">
                  <div v-for="(group, index) in previewGroups" :key="group.id" class="group-card">
                    <div class="group-header">
                      <h5>{{ group.name }}</h5>
                      <span class="team-count">{{ group.teams.length }} equipos</span>
                    </div>

                    <div class="group-teams">
                      <div v-for="teamId in group.teams" :key="teamId" class="team-item"
                        :class="{ 'dragging': draggedTeam?.teamId === teamId }" draggable="true"
                        @dragstart="startDrag($event, teamId, index)" @dragover="allowDrop"
                        @drop="handleDrop($event, index)">
                        <span class="team-name">{{ getTeamName(teamId) }}</span>
                      </div>

                      <div v-if="group.teams.length === 0" class="empty-group"
                        :class="{ 'drag-over': dragOverGroup === index }" @dragover="allowDrop"
                        @dragenter="dragOverGroup = index" @dragleave="dragOverGroup = null"
                        @drop="handleDrop($event, index)">
                        <div class="empty-icon">📥</div>
                        <p>Arrastra equipos aquí</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Advertencias -->
        <div v-if="warnings.length > 0" class="warnings-section">
          <div class="warning-card">
            <h4>⚠️ Advertencias</h4>
            <ul>
              <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <!-- Mensaje informativo del botón -->
        <div class="save-button-status" :class="saveButtonStatus.type">
          <span class="status-icon">
            <span v-if="saveButtonStatus.type === 'loading'">⏳</span>
            <span v-else-if="saveButtonStatus.type === 'saving'">⏳</span>
            <span v-else-if="saveButtonStatus.type === 'creating'">⏳</span>
            <span v-else-if="saveButtonStatus.type === 'ready'">✅</span>
            <span v-else>ℹ️</span>
          </span>
          <span class="status-message">{{ saveButtonStatus.message }}</span>
        </div>

        <!-- Botones de acción -->
        <div class="footer-buttons">
          <button @click="$emit('close')" class="btn-secondary" :disabled="loading || isCreatingConfiguration">
            Cancelar
          </button>
          <button @click="saveConfiguration" class="btn-primary save-config-btn" :disabled="!saveButtonStatus.canSave"
            :class="{ 'btn-disabled': !saveButtonStatus.canSave }">
            <span v-if="isSaving">⏳ Guardando...</span>
            <span v-else>💾 Guardar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Tournament, TournamentConfiguration, TournamentGroup, TeamAssignment } from '@/types/TournamentType';
import { useTournamentConfiguration } from '@/composables/useTournamentConfiguration';
import Spinner from '@/components/Spinner.vue';

interface Props {
  tournamentData: Tournament | null;
  registeredTeams: any[];
}

interface Emits {
  close: [];
  save: [configuration: TournamentConfiguration];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Composable para manejar la configuración
const {
  generateAutoAssignments,
  generateRandomAssignments,
  validateConfiguration
} = useTournamentConfiguration();

// Estado local del componente
const loading = ref(false);

// Estado reactivo local
const localConfiguration = ref<{
  numberOfGroups: number;
  teamsPerGroup: number;
  groups: TournamentGroup[];
  isConfigured: boolean;
}>({
  numberOfGroups: 0,
  teamsPerGroup: 0,
  groups: [],
  isConfigured: false
});

const previewGroups = ref<TournamentGroup[]>([]);
const draggedTeam = ref<{ teamId: number; fromGroup: number } | null>(null);
const dragOverGroup = ref<number | null>(null);
const isCreatingConfiguration = ref(false);
const isSaving = ref(false);
const isConfigurationLoaded = ref(false); // Nueva variable para evitar cargas múltiples

// Computed properties
const availableGroupNumbers = computed(() => {
  // Si no hay equipos registrados, permitir configuración de 1 a 8 grupos
  if (props.registeredTeams.length === 0) {
    return Array.from({ length: 8 }, (_, i) => i + 1);
  }

  // Si hay equipos, limitar el número de grupos al número de equipos (máximo 8)
  const maxGroups = Math.min(props.registeredTeams.length, 8);
  return Array.from({ length: maxGroups }, (_, i) => i + 1);
});

const warnings = computed(() => {
  const warns: string[] = [];

  if (props.registeredTeams.length === 0) {
    warns.push('No hay equipos registrados en este torneo');
  }

  if (localConfiguration.value.numberOfGroups > props.registeredTeams.length) {
    warns.push('El número de grupos es mayor que el número de equipos');
  }

  if (props.registeredTeams.length < 4) {
    warns.push('Se recomienda tener al menos 4 equipos para un torneo');
  }

  return warns;
});

// Computed para mensajes informativos del botón
const saveButtonStatus = computed(() => {
  if (loading.value) {
    return { canSave: false, message: 'Cargando configuración...', type: 'loading' };
  }

  if (isSaving.value) {
    return { canSave: false, message: 'Guardando configuración...', type: 'saving' };
  }

  if (isCreatingConfiguration.value) {
    return { canSave: false, message: 'Creando configuración...', type: 'creating' };
  }

  if (localConfiguration.value.numberOfGroups <= 0) {
    return { canSave: false, message: 'Selecciona el número de grupos', type: 'no-groups' };
  }

  if (previewGroups.value.length === 0) {
    return { canSave: false, message: 'No hay grupos creados', type: 'no-preview' };
  }

  const groupsWithTeams = previewGroups.value.filter(group => group.teams.length > 0).length;
  if (groupsWithTeams === 0) {
    return { canSave: false, message: 'Asigna equipos a los grupos arrastrándolos', type: 'no-teams' };
  }

  return { canSave: true, message: 'Listo para guardar configuración', type: 'ready' };
});// Métodos
const updateGroupConfiguration = () => {
  if (localConfiguration.value.numberOfGroups > 0) {
    localConfiguration.value.teamsPerGroup = Math.ceil(props.registeredTeams.length / localConfiguration.value.numberOfGroups);
    initializeGroups();
  }
};

const initializeGroups = () => {
  previewGroups.value = [];

  for (let i = 0; i < localConfiguration.value.numberOfGroups; i++) {
    previewGroups.value.push({
      id: `group-${i + 1}`,
      name: `Grupo ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      teams: []
    });
  }

  // Distribución inicial equilibrada
  generateBalancedGroups();
};

const generateRandomGroups = () => {
  // Usar el método del composable para generar asignaciones aleatorias
  const teamIds = props.registeredTeams.map(team => team.id);
  const assignments = generateRandomAssignments(teamIds, localConfiguration.value.numberOfGroups);

  // Aplicar las asignaciones a los grupos de vista previa
  applyAssignmentsToPreview(assignments);
};

const generateBalancedGroups = () => {
  // Usar el método del composable para generar asignaciones equilibradas
  const teamIds = props.registeredTeams.map(team => team.id);
  const assignments = generateAutoAssignments(teamIds, localConfiguration.value.numberOfGroups);

  // Aplicar las asignaciones a los grupos de vista previa
  applyAssignmentsToPreview(assignments);
};

const applyAssignmentsToPreview = (assignments: TeamAssignment[]) => {
  // Limpiar grupos
  previewGroups.value.forEach(group => {
    group.teams = [];
  });

  // Aplicar asignaciones
  assignments.forEach(assignment => {
    const group = previewGroups.value.find(g => g.name === `Grupo ${assignment.groupName}`);
    if (group) {
      group.teams.push(assignment.teamId);
    }
  });
};

const getTeamName = (teamId: number) => {
  const team = props.registeredTeams.find(t => t.id === teamId);
  return team?.name || `Equipo ${teamId}`;
};

// Drag and Drop
const startDrag = (event: DragEvent, teamId: number, groupIndex: number) => {
  draggedTeam.value = { teamId, fromGroup: groupIndex };
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
  }
};

const allowDrop = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'move';
};

const handleDrop = (event: DragEvent, toGroupIndex: number) => {
  event.preventDefault();
  dragOverGroup.value = null;

  if (!draggedTeam.value) return;

  const { teamId, fromGroup } = draggedTeam.value;

  if (fromGroup === toGroupIndex) {
    resetDragStyles();
    draggedTeam.value = null;
    return;
  }

  // Remover del grupo origen
  const fromGroupTeams = previewGroups.value[fromGroup].teams;
  const teamIndex = fromGroupTeams.indexOf(teamId);
  if (teamIndex > -1) {
    fromGroupTeams.splice(teamIndex, 1);
  }

  // Agregar al grupo destino
  previewGroups.value[toGroupIndex].teams.push(teamId);

  resetDragStyles();
  draggedTeam.value = null;
};

const resetDragStyles = () => {
  const draggedElements = document.querySelectorAll('.team-item[draggable="true"]');
  draggedElements.forEach(el => {
    (el as HTMLElement).style.opacity = '';
  });
};

const saveConfiguration = async () => {
  // Prevenir llamadas múltiples
  if (!props.tournamentData || isSaving.value) return;

  isSaving.value = true;

  try {
    // Convertir la configuración de grupos a asignaciones de equipos
    const teamAssignments: TeamAssignment[] = [];

    previewGroups.value.forEach(group => {
      const groupLetter = group.name.replace('Grupo ', '');

      group.teams.forEach(teamId => {
        teamAssignments.push({
          teamId,
          groupName: groupLetter
        });
      });
    });

    // Validar que hay asignaciones de equipos
    if (teamAssignments.length === 0) {
      throw new Error('No hay equipos asignados a los grupos. Por favor, asigna equipos antes de guardar.');
    }

    // Preparar datos para la API
    const configData = {
      numberOfGroups: localConfiguration.value.numberOfGroups,
      teamsPerGroup: localConfiguration.value.teamsPerGroup,
      teamAssignments
    };

    // Validar configuración
    const validationErrors = validateConfiguration(configData, props.registeredTeams.length);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    // Crear o actualizar configuración - preparar datos para emitir
    const configurationToSave: TournamentConfiguration = {
      numberOfGroups: localConfiguration.value.numberOfGroups,
      teamsPerGroup: localConfiguration.value.teamsPerGroup,
      teamAssignments,
      isConfigured: true,
      groups: []
    };

    emit('save', configurationToSave);
  } catch (error) {
    console.error('Error saving configuration:', error);
  } finally {
    isSaving.value = false;
  }
};

// Función para convertir teamAssignments a grupos de vista previa
const loadExistingConfiguration = (config: any) => {
  // Evitar cargas múltiples
  if (isConfigurationLoaded.value) {
    return;
  }

  // Actualizar configuración local
  localConfiguration.value = {
    numberOfGroups: config.numberOfGroups,
    teamsPerGroup: config.teamsPerGroup,
    groups: config.groups || [],
    isConfigured: config.isConfigured || false
  };

  // Inicializar grupos de vista previa basados en numberOfGroups
  previewGroups.value = [];
  for (let i = 0; i < config.numberOfGroups; i++) {
    previewGroups.value.push({
      id: `group-${i + 1}`,
      name: `Grupo ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      teams: []
    });
  }

  // Si hay teamAssignments, aplicar la distribución existente
  if (config.teamAssignments && Array.isArray(config.teamAssignments)) {

    // Crear un mapa de groupId a groupName usando la información de groups
    const groupIdToName: { [key: number]: string } = {};
    if (config.groups && Array.isArray(config.groups)) {
      config.groups.forEach((group: any) => {
        groupIdToName[group.id] = group.groupName;
      });
    }

    config.teamAssignments.forEach((assignment: any) => {
      // Buscar el nombre del grupo usando el groupId
      const groupName = groupIdToName[assignment.groupId];
      if (groupName) {
        const group = previewGroups.value.find(g => g.name === `Grupo ${groupName}`);
        if (group && assignment.teamId) {
          group.teams.push(assignment.teamId);
        }
      }
    });

  } else {
    // Si no hay asignaciones, generar una distribución equilibrada
    generateBalancedGroups();
  }

  // Marcar como cargada para evitar cargas múltiples
  isConfigurationLoaded.value = true;
};// Inicialización
onMounted(async () => {
  // El watcher se encarga de toda la inicialización
  loading.value = false;
});

// Watcher principal para manejar la configuración del torneo
watch(() => props.tournamentData, (newTournament, oldTournament) => {
  // Resetear el estado cuando cambia el torneo
  if (newTournament?.id !== oldTournament?.id) {
    isConfigurationLoaded.value = false;
    loading.value = false;

    // Limpiar configuración anterior
    localConfiguration.value = {
      numberOfGroups: 0,
      teamsPerGroup: 0,
      groups: [],
      isConfigured: false
    };
    previewGroups.value = [];
  }

  // Cargar configuración si existe
  if (newTournament?.configuration?.isConfigured && !isConfigurationLoaded.value) {
    const tournament = newTournament as any;

    if (tournament.groups && tournament.teamAssignments) {
      const fullConfiguration = {
        ...tournament.configuration,
        groups: tournament.groups,
        teamAssignments: tournament.teamAssignments
      };

      loadExistingConfiguration(fullConfiguration);
    }
  } else if (newTournament && !newTournament.configuration?.isConfigured) {
    // Si es un torneo nuevo sin configuración, inicializar valores por defecto
    localConfiguration.value = {
      numberOfGroups: 2,
      teamsPerGroup: Math.ceil(props.registeredTeams.length / 2),
      groups: [],
      isConfigured: false
    };
    updateGroupConfiguration();
  }

}, { immediate: true, deep: true });
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.tournament-config-popup {
  max-width: 1000px;
  max-height: 90vh;
  width: 100%;
  background: var(--app-bg-primary);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 94, 180, 0.2);
  border: 1px solid var(--app-border-color);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.popup-header {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
  padding: 2rem;
  position: relative;
  text-align: center;
  flex-shrink: 0;
}

.popup-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.popup-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.popup-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: var(--white);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.popup-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.popup-body::-webkit-scrollbar {
  width: 6px;
}

.popup-body::-webkit-scrollbar-track {
  background: var(--app-input-bg);
  border-radius: 10px;
}

.popup-body::-webkit-scrollbar-thumb {
  background: var(--primary-blue);
  border-radius: 10px;
}

.tournament-info {
  margin-bottom: 2.5rem;
}

.info-card {
  background: linear-gradient(135deg, var(--app-input-bg) 0%, rgba(0, 94, 180, 0.02) 100%);
  border: 2px solid var(--app-border-color);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-blue), var(--secondary-blue), var(--tertiary-blue));
}

.info-card h3 {
  margin: 0 0 1.5rem 0;
  color: var(--app-text-primary);
  font-size: 1.3rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-item {
  background: var(--app-bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--app-border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 94, 180, 0.1);
}

.info-item .label {
  color: var(--app-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.info-item .value {
  color: var(--primary-blue);
  font-weight: 700;
  font-size: 2rem;
}

.configuration-section h3 {
  color: var(--app-text-primary);
  margin-bottom: 2rem;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-group label {
  color: var(--app-text-primary);
  font-weight: 600;
  font-size: 0.95rem;
}

.form-select {
  padding: 1rem;
  border: 2px solid var(--app-border-color);
  border-radius: 12px;
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* Estilos específicos para tema oscuro */
:root[data-theme='dark'] .form-select option {
  background: var(--app-input-bg);
  color: var(--white);
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.teams-distribution {
  background: linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-blue) 100%);
  color: var(--white);
  border: none;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}

.groups-preview {
  margin-top: 3rem;
}

.groups-preview h4 {
  color: var(--app-text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.btn-secondary {
  background: linear-gradient(135deg, var(--app-input-bg) 0%, var(--app-bg-secondary) 100%);
  border: 2px solid var(--app-border-color);
  color: var(--app-text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
  color: var(--white);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 94, 180, 0.2);
}

.groups-container {
  margin-top: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--primary-text);
  gap: 1rem;
}

.loading-state p {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.groups-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.group-card {
  background: var(--app-bg-secondary);
  border: 2px solid var(--app-border-color);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 94, 180, 0.15);
  border-color: var(--primary-blue);
}

.group-header {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--dark-blue) 100%);
  color: var(--white);
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.group-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.group-header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.team-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.group-teams {
  padding: 1.25rem;
  min-height: 120px;
  position: relative;
}

.team-item {
  background: linear-gradient(135deg, var(--app-input-bg) 0%, var(--app-bg-secondary) 100%);
  border: 2px solid var(--app-border-color);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: grab;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-item:active {
  cursor: grabbing;
}

.team-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
  border-color: var(--primary-blue);
  box-shadow: 0 8px 25px rgba(0, 94, 180, 0.3);
}

.team-item::before {
  content: '⋮⋮';
  color: var(--app-text-secondary);
  font-size: 0.8rem;
  opacity: 0.6;
  flex-shrink: 0;
}

.team-name {
  flex: 1;
}

.team-item:hover {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
  color: var(--white);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 94, 180, 0.2);
}

.team-item:hover::before {
  color: rgba(255, 255, 255, 0.8);
}

.team-item:last-child {
  margin-bottom: 0;
}

.empty-group {
  border: 3px dashed var(--app-border-color);
  border-radius: 12px;
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--app-text-secondary);
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: repeating-linear-gradient(45deg,
      transparent,
      transparent 10px,
      var(--app-input-bg) 10px,
      var(--app-input-bg) 20px);
  opacity: 0.7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-group.drag-over {
  border-color: var(--primary-blue);
  background: linear-gradient(135deg, rgba(0, 94, 180, 0.1) 0%, rgba(60, 154, 240, 0.1) 100%);
  opacity: 1;
  transform: scale(1.02);
  border-style: solid;
}

.empty-group:hover {
  border-color: var(--primary-blue);
  background: var(--app-hover-bg);
  opacity: 1;
  transform: scale(1.02);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

.empty-group p {
  margin: 0;
  font-weight: 500;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }

  60% {
    transform: translateY(-5px);
  }
}

.warnings-section {
  margin-top: 2.5rem;
}

.warning-card {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 2px solid #ffeaa7;
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.warning-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f39c12, #e67e22, #d35400);
}

:root[data-theme='dark'] .warning-card {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.1) 100%);
  border-color: rgba(255, 193, 7, 0.4);
}

.warning-card h4 {
  margin: 0 0 1rem 0;
  color: #856404;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:root[data-theme='dark'] .warning-card h4 {
  color: #ffc107;
}

.warning-card ul {
  margin: 0;
  padding-left: 1.5rem;
}

.warning-card li {
  color: #856404;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

:root[data-theme='dark'] .warning-card li {
  color: #ffc107;
}

/* Estilos para tema oscuro - Save Button Status */
:root[data-theme='dark'] .save-button-status {
  background: #2d3748;
  color: #e2e8f0;
}

:root[data-theme='dark'] .save-button-status.loading,
:root[data-theme='dark'] .save-button-status.saving,
:root[data-theme='dark'] .save-button-status.creating {
  border-color: #ffc107;
  background: #2d3748;
}

:root[data-theme='dark'] .save-button-status.ready {
  border-color: #28a745;
  background: #2d3748;
}

:root[data-theme='dark'] .save-button-status.no-groups,
:root[data-theme='dark'] .save-button-status.no-preview,
:root[data-theme='dark'] .save-button-status.no-teams {
  border-color: #6c757d;
  background: #2d3748;
}

:root[data-theme='dark'] .btn-primary:disabled,
:root[data-theme='dark'] .btn-primary.btn-disabled {
  background: #2d3748 !important;
  border-color: #4a5568 !important;
  color: #a0aec0 !important;
}

.popup-footer {
  background: var(--app-input-bg);
  padding: 2rem;
  border-top: 2px solid var(--app-border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-shrink: 0;
}

.save-button-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-button-status.loading,
.save-button-status.saving,
.save-button-status.creating {
  background: var(--app-bg-secondary);
  border: 2px solid #ffc107;
  color: var(--primary-text);
}

.save-button-status.ready {
  background: var(--app-bg-secondary);
  border: 2px solid #28a745;
  color: var(--primary-text);
}

.save-button-status.no-groups,
.save-button-status.no-preview,
.save-button-status.no-teams {
  background: var(--app-bg-secondary);
  border: 2px solid #6c757d;
  color: var(--primary-text);
}

.status-icon {
  font-size: 1.1rem;
  min-width: 20px;
  text-align: center;
}

.status-message {
  flex: 1;
  text-align: left;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
  border: none;
  color: var(--white);
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 94, 180, 0.3);
}

.btn-primary:disabled,
.btn-primary.btn-disabled {
  background: var(--app-bg-secondary) !important;
  border: 2px solid var(--app-border-color) !important;
  color: var(--app-text-secondary) !important;
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary:disabled:hover,
.btn-primary.btn-disabled:hover {
  background: var(--app-bg-secondary) !important;
  transform: none;
  box-shadow: none;
}

.popup-footer .btn-secondary {
  background: var(--app-bg-secondary);
  border: 2px solid var(--app-border-color);
  color: var(--app-text-primary);
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.popup-footer .btn-secondary:hover {
  background: var(--app-hover-bg);
  border-color: var(--primary-blue);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .tournament-config-popup {
    max-width: 95vw;
    margin: 0.5rem;
    border-radius: 16px;
  }

  .popup-header {
    padding: 1.5rem;
  }

  .popup-header h2 {
    font-size: 1.5rem;
  }

  .popup-body {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .groups-container {
    grid-template-columns: 1fr;
  }

  .preview-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .popup-footer {
    padding: 1.5rem;
    flex-direction: column-reverse;
  }

  .popup-footer button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .popup-overlay {
    padding: 0.5rem;
  }

  .info-item .value {
    font-size: 1.5rem;
  }

  .group-teams {
    padding: 1rem;
  }

  .team-item {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}
</style>
