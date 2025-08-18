<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-container tournament-fixtures-popup">
      <div class="popup-header">
        <h2>📅 Cronograma de Partidos</h2>
        <p>{{ tournamentData?.name }}</p>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>

      <div class="popup-body">
        <!-- Información del torneo -->
        <div class="tournament-info">
          <div class="info-card">
            <h3>📊 Información del Cronograma</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Tipo de fixture:</span>
                <span class="value">{{ fixtureType === 'round_robin' ? 'Todos vs Todos' : 'Eliminación' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Total de partidos:</span>
                <span class="value">{{ fixtures.length }}</span>
              </div>

            </div>
          </div>
        </div>

        <!-- Configuración del cronograma -->
        <div class="fixtures-config-section">
          <h3>⚙️ Configuración del Cronograma</h3>

          <div class="config-form">
            <div class="form-row">
              <div class="input-group">
                <label for="fixtureType">Tipo de Torneo *</label>
                <select id="fixtureType" v-model="fixtureType" @change="generateFixtures" class="form-select">
                  <option value="group_stage">Fase de Grupos</option>
                  <option value="round_robin">Todos vs Todos (Round Robin)</option>
                  <option value="knockout">Eliminación Directa</option>
                </select>
                <div class="fixture-type-info" v-if="props.tournamentData?.groups">
                  <small class="info-text">
                    <span v-if="props.tournamentData.groups.length > 1" class="text-success">
                      ✅ Fase de grupos detectada automáticamente ({{ props.tournamentData.groups.length }} grupos)
                    </span>
                    <span v-else-if="props.tournamentData.groups.length === 1" class="text-info">
                      🔄 Round Robin sugerido ({{ props.tournamentData.groups.length }} grupo)
                    </span>
                    <span v-else class="text-warning">
                      ⚡ Eliminación directa sugerida (sin grupos configurados)
                    </span>
                  </small>
                </div>
              </div>

              <div class="input-group">
                <label for="startDate">Fecha de Inicio *</label>
                <input type="date" id="startDate" v-model="startDate" @change="updateDates" class="form-input" />
              </div>

              <div class="input-group">
                <label for="venue">Lugar (Opcional)</label>
                <input type="text" id="venue" v-model="venue" placeholder="Ej: Estadio Principal" class="form-input" />
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje informativo -->
        <div class="info-message" v-if="!loading">
          <div v-if="tournamentTeams.length === 0" class="info-card error">
            <h4>⚠️ Sin Equipos Disponibles</h4>
            <p>Este torneo no tiene equipos disponibles para generar cronograma. Esto puede pasar por:</p>
            <ul>
              <li><strong>Torneo sin configurar:</strong> Ve a configuración del torneo y asigna equipos a grupos.</li>
              <li><strong>No hay equipos inscritos:</strong> Los equipos deben estar registrados en el torneo.</li>
            </ul>
            <p><small>Revisa la consola del navegador (F12) para más detalles técnicos.</small></p>
          </div>
          <div v-else-if="tournamentTeams.length < 2" class="info-card error">
            <h4>⚠️ Equipos Insuficientes</h4>
            <p>Se necesitan al menos 2 equipos para generar un cronograma. Actualmente hay {{ tournamentTeams.length }}
              equipo
              asignado.</p>
          </div>
          <div v-else-if="fixtures.length === 0" class="info-card warning">
            <h4>📋 Listo para Generar Cronograma</h4>
            <p>Este torneo tiene {{ tournamentTeams.length }} equipos disponibles:
              <strong>{{tournamentTeams.map(t => t.name).join(', ')}}</strong>
            </p>
            <p>Haz clic en <strong>"🔄 Regenerar Cronograma"</strong> para generar los partidos automáticamente.
              Luego podrás revisar, editar fechas/horarios y <strong>guardar cuando estés conforme</strong>.</p>
          </div>
          <div v-else-if="fixtures.length > 0" class="info-card success">
            <h4>✅ Cronograma Cargado</h4>
            <p>Se muestran {{ fixtures.length }} partidos programados. Puedes reordenar, editar fechas/horarios y
              guardar los
              cambios.</p>
          </div>
        </div>

        <!-- Lista de partidos -->
        <div class="fixtures-list-section" v-if="fixtures.length > 0">
          <h3>🏆 Lista de Partidos</h3>

          <div class="fixtures-container">
            <!-- Para group_stage, mostrar agrupado por grupo -->
            <template v-if="fixtureType === 'group_stage'">
              <div v-for="(groupFixtures, groupName) in groupedFixtures" :key="groupName" class="group-section">
                <h4 class="group-title">{{ groupName }}</h4>
                <div v-for="(fixture, index) in groupFixtures" :key="`${groupName}-${index}`" class="fixture-card"
                  :class="{ 'dragging': draggedFixture === fixtures.indexOf(fixture) }">

                  <div class="fixture-header">
                    <span class="fixture-number">
                      Partido {{ fixtures.indexOf(fixture) + 1 }}
                    </span>
                    <button @click="moveFixture(fixtures.indexOf(fixture), -1)"
                      :disabled="fixtures.indexOf(fixture) === 0" class="move-btn up">⬆</button>
                    <button @click="moveFixture(fixtures.indexOf(fixture), 1)"
                      :disabled="fixtures.indexOf(fixture) === fixtures.length - 1" class="move-btn down">⬇</button>
                  </div>

                  <div class="fixture-content">
                    <div class="teams">
                      <div class="team home">
                        <span class="team-name">{{ fixture.homeTeam?.name || 'Equipo Local' }}</span>
                      </div>
                      <div class="vs">VS</div>
                      <div class="team away">
                        <span class="team-name">{{ fixture.awayTeam?.name || 'Equipo Visitante' }}</span>
                      </div>
                    </div>

                    <div class="fixture-details">
                      <div class="input-group">
                        <label>Fecha</label>
                        <input type="date" :value="formatScheduledDateTime(fixture.scheduledDate).date"
                          @input="(e) => fixture.scheduledDate = createScheduledDate((e.target as HTMLInputElement).value, formatScheduledDateTime(fixture.scheduledDate).time || '09:00')"
                          class="form-input-small" />
                      </div>
                      <div class="input-group">
                        <label>Hora</label>
                        <input type="time" :value="formatScheduledDateTime(fixture.scheduledDate).time"
                          @input="(e) => fixture.scheduledDate = createScheduledDate(formatScheduledDateTime(fixture.scheduledDate).date || new Date().toISOString().split('T')[0], (e.target as HTMLInputElement).value)"
                          class="form-input-small" />
                      </div>
                      <div class="input-group">
                        <label>Sede</label>
                        <input type="text" v-model="fixture.venue" placeholder="Sede del partido"
                          class="form-input-small" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Para otros tipos, mostrar lista normal -->
            <template v-else>
              <div v-for="(fixture, index) in fixtures" :key="index" class="fixture-card"
                :class="{ 'dragging': draggedFixture === index }">

                <div class="fixture-header">
                  <span class="fixture-number">
                    Partido {{ index + 1 }}
                  </span>
                  <button @click="moveFixture(index, -1)" :disabled="index === 0" class="move-btn up">⬆</button>
                  <button @click="moveFixture(index, 1)" :disabled="index === fixtures.length - 1"
                    class="move-btn down">⬇</button>
                </div>

                <div class="fixture-content">
                  <div class="teams">
                    <div class="team home">
                      <span class="team-name">{{ fixture.homeTeam?.name || 'Equipo Local' }}</span>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team away">
                      <span class="team-name">{{ fixture.awayTeam?.name || 'Equipo Visitante' }}</span>
                    </div>
                  </div>

                  <div class="fixture-details">
                    <div class="input-group">
                      <label>Fecha</label>
                      <input type="date" :value="formatScheduledDateTime(fixture.scheduledDate).date"
                        @input="(e) => fixture.scheduledDate = createScheduledDate((e.target as HTMLInputElement).value, formatScheduledDateTime(fixture.scheduledDate).time || '09:00')"
                        class="form-input-small" />
                    </div>
                    <div class="input-group">
                      <label>Hora</label>
                      <input type="time" :value="formatScheduledDateTime(fixture.scheduledDate).time"
                        @input="(e) => fixture.scheduledDate = createScheduledDate(formatScheduledDateTime(fixture.scheduledDate).date || new Date().toISOString().split('T')[0], (e.target as HTMLInputElement).value)"
                        class="form-input-small" />
                    </div>
                    <div class="input-group">
                      <label>Sede</label>
                      <input type="text" v-model="fixture.venue" placeholder="Sede del partido"
                        class="form-input-small" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="popup-actions">
          <div class="action-buttons">
            <button @click="regenerateFixtures" class="btn-secondary" :disabled="loading || tournamentTeams.length < 2">
              🔄 Regenerar Cronograma
            </button>
            <button @click="setWeeklySchedule" class="btn-secondary" :disabled="loading || fixtures.length === 0">
              📅 Programar Sábados
            </button>
            <button @click="clearFixtures" class="btn-warning" :disabled="loading || fixtures.length === 0">
              🗑️ Limpiar Cronograma
            </button>
            <button @click="saveFixtures" class="btn-primary" :disabled="loading || fixtures.length === 0">
              <span v-if="loading">⏳ Guardando...</span>
              <span v-else>💾 Guardar Cronograma</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Tournament } from '@/types/TournamentType'
import type { Team } from '@/types/TeamType'
import { useFixtures } from '@/composables/useFixtures'
import type { FixtureConfiguration } from '@/types/FixtureType'
import type { Match } from '@/services/matchesService'
import { useTeams } from '@/composables/useTeams'

// Tipo simplificado para equipos en fixtures
interface SimpleTeam {
  id: number
  name: string
  groupId?: number
  groupName?: string
}// Tipo extendido para fixtures con información de equipos
interface FixtureWithTeams extends Match {
  homeTeam?: SimpleTeam
  awayTeam?: SimpleTeam
}

interface Props {
  tournamentData: Tournament | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [fixtures: FixtureConfiguration]
}>()

// Router para navegación
const router = useRouter()

// Composable para matches
const { loadTournamentMatches, saveFixtures: saveApiFixtures } = useFixtures()

// Composable para equipos
const { teams: allTeams, loadTeams } = useTeams()

// Estado reactivo
const loading = ref(false)
const startDate = ref('')
const venue = ref('')
const fixtures = ref<FixtureWithTeams[]>([])
const draggedFixture = ref<number | null>(null)

// Detectar automáticamente el tipo de fixture basado en la cantidad de grupos
const suggestedFixtureType = computed(() => {
  const numberOfGroups = props.tournamentData?.groups?.length || 0
  if (numberOfGroups > 1) {
    return 'group_stage'
  } else if (numberOfGroups === 1) {
    return 'round_robin'
  } else {
    return 'knockout'
  }
})

const fixtureType = ref<'group_stage' | 'round_robin' | 'knockout'>(suggestedFixtureType.value)

// Obtener equipos del torneo configurado
const tournamentTeams = computed(() => {
  // Usar teamAssignments directamente del torneo (no de configuration)
  if (props.tournamentData?.teamAssignments && props.tournamentData.teamAssignments.length > 0) {
    const assignedTeamIds = props.tournamentData.teamAssignments.map(assignment => assignment.teamId)
    const realTeams = allTeams.value.filter(team => assignedTeamIds.includes(team.id))

    if (realTeams.length > 0) {
      const formattedTeams = realTeams.map(team => {
        const assignment = props.tournamentData?.teamAssignments?.find(ta => ta.teamId === team.id)
        const group = props.tournamentData?.groups?.find(g => g.id === assignment?.groupId)
        return {
          id: team.id,
          name: team.name,
          groupId: assignment?.groupId,
          groupName: group?.groupName
        }
      })
      return formattedTeams
    }
  }

  return []
})

// Agrupar fixtures por grupo (solo para group_stage)
const groupedFixtures = computed(() => {
  if (fixtureType.value !== 'group_stage') {
    return { 'all': fixtures.value }
  }

  const grouped: { [key: string]: FixtureWithTeams[] } = {}
  fixtures.value.forEach(fixture => {
    const groupName = fixture.groupId ? getGroupName(fixture.groupId) : 'Sin Grupo'
    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(fixture)
  })

  return grouped
})

// Generar fixtures automáticamente
const generateFixtures = () => {
  if (tournamentTeams.value.length < 2) {
    return
  }

  fixtures.value = []

  if (fixtureType.value === 'group_stage') {
    generateGroupStageFixtures()
  } else if (fixtureType.value === 'round_robin') {
    generateRoundRobinFixtures()
  } else {
    generateKnockoutFixtures()
  }

  updateDates()
}

const generateRoundRobinFixtures = () => {
  const teams = [...tournamentTeams.value]
  const newFixtures: FixtureWithTeams[] = []

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      newFixtures.push({
        tournamentId: props.tournamentData?.id || 0,
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        scheduledDate: '',
        venue: venue.value || 'Por definir',
        homeTeam: teams[i],
        awayTeam: teams[j],
        status: 'scheduled'
      })
    }
  }

  fixtures.value = newFixtures
}

const generateKnockoutFixtures = () => {
  const teams = [...tournamentTeams.value]
  const newFixtures: FixtureWithTeams[] = []

  // Para eliminación directa, emparejar equipos de a pares
  for (let i = 0; i < teams.length; i += 2) {
    if (i + 1 < teams.length) {
      newFixtures.push({
        tournamentId: props.tournamentData?.id || 0,
        homeTeamId: teams[i].id,
        awayTeamId: teams[i + 1].id,
        scheduledDate: '',
        venue: venue.value || 'Por definir',
        homeTeam: teams[i],
        awayTeam: teams[i + 1],
        status: 'scheduled'
      })
    }
  }

  fixtures.value = newFixtures
}

const generateGroupStageFixtures = () => {
  const newFixtures: FixtureWithTeams[] = []

  // Obtener todos los grupos únicos
  const groups = [...new Set(tournamentTeams.value.map(team => team.groupId))]

  groups.forEach(groupId => {
    // Obtener equipos de este grupo
    const groupTeams = tournamentTeams.value.filter(team => team.groupId === groupId)

    // Generar todos contra todos dentro del grupo
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        newFixtures.push({
          tournamentId: props.tournamentData?.id || 0,
          homeTeamId: groupTeams[i].id,
          awayTeamId: groupTeams[j].id,
          scheduledDate: '',
          venue: venue.value || 'Por definir',
          homeTeam: groupTeams[i],
          awayTeam: groupTeams[j],
          status: 'scheduled',
          groupId: groupId ? parseInt(groupId.toString()) : undefined // Convertir a número para que coincida con Match interface
        })
      }
    }
  })

  fixtures.value = newFixtures
}

// Actualizar fechas automáticamente
const updateDates = () => {
  if (!startDate.value || fixtures.value.length === 0) return

  const start = new Date(startDate.value)

  fixtures.value.forEach((fixture, index) => {
    const fixtureDate = new Date(start)
    fixtureDate.setDate(start.getDate() + (index * 7)) // Una semana entre partidos
    fixtureDate.setHours(15, 0, 0, 0) // 15:00 por defecto
    fixture.scheduledDate = fixtureDate.toISOString()
  })
}

// Programar partidos los sábados
const setWeeklySchedule = () => {
  if (!startDate.value || fixtures.value.length === 0) return

  const start = new Date(startDate.value)

  // Encontrar el primer sábado desde la fecha de inicio
  const nextSaturday = new Date(start)
  const daysUntilSaturday = (6 - start.getDay()) % 7
  nextSaturday.setDate(start.getDate() + daysUntilSaturday)

  fixtures.value.forEach((fixture, index) => {
    const fixtureDate = new Date(nextSaturday)
    fixtureDate.setDate(nextSaturday.getDate() + (index * 7)) // Cada sábado
    fixtureDate.setHours(15, 0, 0, 0) // 15:00 los sábados
    fixture.scheduledDate = fixtureDate.toISOString()
  })
}

// Mover fixture en la lista
const moveFixture = (fromIndex: number, direction: number) => {
  const toIndex = fromIndex + direction
  if (toIndex < 0 || toIndex >= fixtures.value.length) return

  const temp = fixtures.value[fromIndex]
  fixtures.value[fromIndex] = fixtures.value[toIndex]
  fixtures.value[toIndex] = temp
}

// Función para formatear fecha y hora para display
const formatScheduledDateTime = (scheduledDate?: string) => {
  if (!scheduledDate) return { date: '', time: '' }

  const date = new Date(scheduledDate)
  return {
    date: date.toISOString().split('T')[0],
    time: date.toTimeString().slice(0, 5)
  }
}

// Función para crear scheduledDate desde fecha y hora
const createScheduledDate = (date: string, time: string) => {
  if (!date || !time) return new Date().toISOString()
  return `${date}T${time}:00.000Z`
}

// Función para obtener el nombre del grupo por ID
const getGroupName = (groupId: number) => {
  const group = props.tournamentData?.groups?.find(g => g.id === groupId)
  return group?.groupName || groupId.toString()
}

// Regenerar fixtures
const regenerateFixtures = () => {
  generateFixtures()
}

// Limpiar cronograma
const clearFixtures = () => {
  fixtures.value = []
}

// Guardar cronograma
const saveFixtures = async () => {
  if (fixtures.value.length === 0 || !props.tournamentData?.id) return

  loading.value = true

  try {
    // Crear configuración completa para el composable
    const fixtureConfiguration: FixtureConfiguration = {
      tournamentId: props.tournamentData.id,
      fixtureType: fixtureType.value,
      startDate: startDate.value,
      venue: venue.value,
      fixtures: fixtures.value.map(fixture => ({
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        date: fixture.scheduledDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        time: fixture.scheduledDate?.split('T')[1]?.slice(0, 8) || '15:00:00',
        venue: fixture.venue || venue.value || 'Estadio Principal',
        groupId: fixture.groupId ? fixture.groupId.toString() : undefined,
        status: (fixture.status === 'scheduled' || fixture.status === 'completed' || fixture.status === 'cancelled')
          ? fixture.status : 'scheduled'
      }))
    }

    await saveApiFixtures(fixtureConfiguration)
    emit('save', fixtureConfiguration)
  } catch (error) {
    console.error('Error saving fixtures:', error)
  } finally {
    loading.value = false
  }
}

// Cargar configuración existente si la hay
const loadExistingFixtures = async () => {
  if (!props.tournamentData?.id) return

  loading.value = true

  try {
    const existingMatches = await loadTournamentMatches(props.tournamentData.id)

    if (existingMatches && existingMatches.length > 0) {
      // Los matches ya vienen con homeTeam y awayTeam desde el backend
      fixtures.value = existingMatches.map(match => ({
        ...match,
        scheduledDate: match.matchDate, // Usar matchDate como scheduledDate para la UI
        venue: match.location || 'Por definir', // Usar location como venue
        homeTeam: match.homeTeam ? {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          groupId: match.groupId || undefined,
          groupName: match.group?.groupName
        } : undefined,
        awayTeam: match.awayTeam ? {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          groupId: match.groupId || undefined,
          groupName: match.group?.groupName
        } : undefined
      })).filter(match => match.homeTeam && match.awayTeam) as FixtureWithTeams[]

      // Inferir configuración desde los matches existentes
      if (fixtures.value.length > 0) {
        const firstMatch = fixtures.value[0]
        startDate.value = firstMatch.scheduledDate?.split('T')[0] || ''
        venue.value = firstMatch.venue || ''
      }
    } else {
      // Configurar valores por defecto
      const today = new Date()
      startDate.value = today.toISOString().split('T')[0]
      venue.value = 'Estadio Principal'
    }
  } catch (error) {
    console.error('Error cargando matches:', error)
    // Configurar valores por defecto en caso de error
    const today = new Date()
    startDate.value = today.toISOString().split('T')[0]
    venue.value = 'Estadio Principal'
  } finally {
    loading.value = false
  }
}

// Watcher para regenerar cuando cambie el torneo
watch(() => props.tournamentData, async (newTournament) => {
  if (newTournament) {
    await loadTeams()
    await loadExistingFixtures()
  }
}, { immediate: true })

// Watcher para actualizar automáticamente el tipo de fixture basado en grupos
watch(() => props.tournamentData?.groups?.length, (numberOfGroups) => {
  if (numberOfGroups !== undefined) {
    fixtureType.value = suggestedFixtureType.value
  }
}, { immediate: true })
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
  z-index: 1000;
}

.tournament-fixtures-popup {
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-lg);
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--app-shadow-xl);
  border: 1px solid var(--app-border-color);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.popup-header {
  position: relative;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--app-border-color);
  background: var(--app-gradient);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.popup-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--app-text-primary);
  margin-bottom: 0.5rem;
}

.popup-header p {
  color: var(--app-text-secondary);
  font-size: 1rem;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--app-text-secondary);
  transition: color var(--transition-normal);
}

.close-button:hover {
  color: var(--app-text-primary);
}

.popup-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tournament-info {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  border: 1px solid var(--app-border-color);
}

.info-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--app-bg-secondary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--app-border-color);
}

.info-item .label {
  font-weight: 500;
  color: var(--app-text-secondary);
}

.info-item .value {
  font-weight: 600;
  color: var(--primary-blue);
}

.info-message {
  margin: 1rem 0;
}

.info-card.warning {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: var(--border-radius-md);
  padding: 1rem;
}

.info-card.warning h4 {
  color: #92400e;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.info-card.warning p {
  color: #92400e;
  margin: 0;
  line-height: 1.5;
}

.info-card.success {
  background: #d1fae5;
  border: 2px solid #10b981;
  border-radius: var(--border-radius-md);
  padding: 1rem;
}

.info-card.success h4 {
  color: #047857;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.info-card.success p {
  color: #047857;
  margin: 0;
  line-height: 1.5;
}

.info-card.info {
  background: #dbeafe;
  border: 2px solid #3b82f6;
  border-radius: var(--border-radius-md);
  padding: 1rem;
}

.info-card.info h4 {
  color: #1d4ed8;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.info-card.info p {
  color: #1d4ed8;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.info-card.info ul {
  color: #1d4ed8;
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.info-card.info li {
  margin: 0.25rem 0;
}

.info-card.error {
  background: #fee2e2;
  border: 2px solid #dc2626;
  border-radius: var(--border-radius-md);
  padding: 1rem;
}

.info-card.error h4 {
  color: #b91c1c;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.info-card.error p {
  color: #b91c1c;
  margin: 0;
  line-height: 1.5;
}

.fixtures-config-section {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  border: 1px solid var(--app-border-color);
}

.fixtures-config-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 1rem;
}

.config-form .form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  color: var(--app-text-primary);
  font-size: 0.9rem;
}

.form-select,
.form-input {
  padding: 0.75rem;
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  font-size: 0.9rem;
  transition: border-color var(--transition-normal);
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 94, 180, 0.1);
}

.fixture-type-info {
  margin-top: 0.5rem;
}

.info-text {
  display: block;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
}

.text-success {
  color: #047857;
  background: #d1fae5;
  border: 1px solid #10b981;
}

.text-info {
  color: #1d4ed8;
  background: #dbeafe;
  border: 1px solid #3b82f6;
}

.text-warning {
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

.fixtures-list-section {
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  border: 1px solid var(--app-border-color);
}

.fixtures-list-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 1rem;
}

.fixtures-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.group-section {
  margin-bottom: 2rem;
}

.group-title {
  color: var(--primary-blue);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: var(--app-bg-primary);
  border: 2px solid var(--primary-blue);
  border-radius: 8px;
  text-align: center;
}

.fixture-card {
  background: var(--app-bg-secondary);
  border: 2px solid var(--app-border-color);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  transition: all var(--transition-normal);
}

.fixture-card:hover {
  border-color: var(--primary-blue);
  box-shadow: var(--app-shadow);
}

.fixture-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.fixture-number {
  font-weight: 600;
  color: var(--primary-blue);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-badge {
  background: #10b981;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.move-btn {
  background: var(--app-bg-primary);
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-sm);
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--app-text-primary);
  transition: all var(--transition-normal);
}

.move-btn:hover:not(:disabled) {
  background: var(--primary-blue);
  color: var(--white);
}

.move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fixture-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--app-bg-primary);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--app-border-color);
}

.team {
  flex: 1;
  text-align: center;
}

.team-name {
  font-weight: 600;
  color: var(--app-text-primary);
  font-size: 1rem;
}

.vs {
  margin: 0 1rem;
  font-weight: 700;
  color: var(--primary-blue);
  font-size: 1.1rem;
}

.fixture-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.form-input-small {
  padding: 0.5rem;
  border: 1px solid var(--app-border-color);
  border-radius: var(--border-radius-sm);
  background: var(--app-input-bg);
  color: var(--app-text-primary);
  font-size: 0.85rem;
}

.form-input-small:focus {
  outline: none;
  border-color: var(--primary-blue);
}

.popup-actions {
  border-top: 2px solid var(--app-border-color);
  padding-top: 1.5rem;
  margin-top: auto;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-info {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-md);
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
  box-shadow: var(--app-shadow);
}

.btn-secondary {
  background: var(--app-bg-primary);
  color: var(--app-text-primary);
  border: 2px solid var(--app-border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--secondary-blue);
  color: var(--white);
  border-color: var(--secondary-blue);
}

.btn-info {
  background: #3b82f6;
  color: var(--white);
}

.btn-info:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: var(--app-shadow);
}

.btn-warning {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  background: #f59e0b;
  color: white;
  border: 2px solid #f59e0b;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
  border-color: #d97706;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-warning:disabled,
.btn-info:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .tournament-fixtures-popup {
    width: 98%;
    max-height: 95vh;
  }

  .popup-header,
  .popup-body {
    padding: 1rem;
  }

  .config-form .form-row {
    grid-template-columns: 1fr;
  }

  .fixture-details {
    grid-template-columns: 1fr;
  }

  .teams {
    flex-direction: column;
    gap: 0.5rem;
  }

  .vs {
    margin: 0.5rem 0;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
