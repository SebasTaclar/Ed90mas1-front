<template>
  <div class="tournament-detail">
    <!-- Header principal -->
    <TournamentDetailHeader :tournament="selectedTournament" />

    <!-- Navegación horizontal moderna -->
    <TournamentDetailNavigation :active-section="activeSection" @section-change="setActiveSection" />

    <!-- Contenido principal -->
    <main class="tournament-main">
      <section class="content-section">
        <div class="container">
          <!-- Sección: Cronograma -->
          <TournamentScheduleSection v-if="activeSection === 'cronograma'" :matches="tournamentMatches"
            :matches-loading="matchesLoading" :tournament-id="selectedTournament?.id || 0"
            :tournament-teams="tournamentTeams" @match-updated="loadTournamentMatchesData" />

          <!-- Sección: Resultados -->
          <TournamentResultsSection v-else-if="activeSection === 'resultados'" :tournament="selectedTournament" />

          <!-- Sección: Clasificación -->
          <TournamentClassificationSection v-else-if="activeSection === 'clasificacion'"
            :tournament="selectedTournament" />

          <!-- Sección: Rankings y encuestas -->
          <TournamentRankingsSection v-else-if="activeSection === 'rankings'" />

          <!-- Sección: Fotos, videos y noticias -->
          <TournamentMediaSection v-else-if="activeSection === 'fotos'" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTournaments } from '@/composables/useTournaments'
import { useTeams } from '@/composables/useTeams'
import { useFixtures } from '@/composables/useFixtures'
import type { Tournament } from '@/types/TournamentType'
import type { Team } from '@/types/TeamType'
import type { Match } from '@/services/matchesService'

// Importar componentes
import TournamentDetailHeader from '@/components/tournament/TournamentDetailHeader.vue'
import TournamentDetailNavigation from '@/components/tournament/TournamentDetailNavigation.vue'
import TournamentScheduleSection from '@/components/tournament/TournamentScheduleSection.vue'
import TournamentResultsSection from '@/components/tournament/TournamentResultsSection.vue'
import TournamentClassificationSection from '@/components/tournament/TournamentClassificationSection.vue'
import TournamentRankingsSection from '@/components/tournament/TournamentRankingsSection.vue'
import TournamentMediaSection from '@/components/tournament/TournamentMediaSection.vue'

const route = useRoute()
const router = useRouter()
const { tournaments, loadTournaments } = useTournaments()
const { teams, loadTeams } = useTeams()
const { loadTournamentMatches } = useFixtures()

// Estado reactivo
const activeSection = ref('cronograma')
const tournamentTeams = ref<Team[]>([])
const selectedTournament = ref<Tournament | null>(null)
const tournamentMatches = ref<Match[]>([])
const matchesLoading = ref(false)

// Función para cambiar sección activa
const setActiveSection = (sectionId: string) => {
  activeSection.value = sectionId
}

// Cargar datos del torneo
const loadTournamentData = async () => {
  const tournamentId = route.params.id

  if (!tournamentId) {
    router.push('/')
    return
  }

  const tournament = tournaments.value.find(t => t.id.toString() === tournamentId)

  if (tournament) {
    selectedTournament.value = tournament
    await loadTournamentTeams()
    await loadTournamentMatchesData()
  } else {
    router.push('/')
  }
}

// Cargar equipos del torneo específico
const loadTournamentTeams = async () => {
  if (!selectedTournament.value) {
    return
  }

  try {
    await loadTeams()
    // Filtrar equipos por torneo usando la relación teamTournaments
    tournamentTeams.value = teams.value.filter(team =>
      team.teamTournaments?.some(tt => tt.tournamentId === selectedTournament.value?.id)
    )
  } catch (error) {
    console.error('Error cargando equipos del torneo:', error)
  }
}// Cargar matches del torneo específico
const loadTournamentMatchesData = async () => {
  if (!selectedTournament.value) {
    return
  }

  matchesLoading.value = true

  try {
    const matches = await loadTournamentMatches(selectedTournament.value.id)
    tournamentMatches.value = matches || []
  } catch (error) {
    console.error('Error cargando matches del torneo:', error)
    tournamentMatches.value = []
  } finally {
    matchesLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadTournaments()
  await loadTournamentData()
})
</script>

<style scoped>
.tournament-detail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #212529;
  transition: all 0.3s ease;
  padding-top: 60px;
}

[data-theme="dark"] .tournament-detail {
  background: linear-gradient(135deg, #0d1421 0%, #1a2332 100%);
  color: #ffffff;
}

.tournament-main {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

[data-theme="dark"] .tournament-main {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.content-section {
  padding-top: 3rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .tournament-detail {
    padding-top: 70px;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
