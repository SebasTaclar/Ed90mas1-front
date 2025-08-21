<template>
  <main class="home-main">
    <section class="section">
      <MainBanner />
    </section>
    <section id="ongoing_tournaments" class="section offset">
      <OngoingTournaments :tournaments="tournaments" :loading="loading" :error="error" @retry="loadTournaments" />
    </section>
    <section class="section offset">
      <TopTeams />
    </section>
    <section class="section offset">
      <UpcomingTournaments :tournaments="tournaments" :loading="loading" :error="error" @retry="loadTournaments" />
    </section>
    <section class="section offset">
      <TopPlayers />
    </section>
    <section id="our_work" class="section offset">
      <FinishedTournaments :tournaments="tournaments" :loading="loading" :error="error" @retry="loadTournaments" />
    </section>
    <section class="section offset">
      <Sponsors />
    </section>
    <section class="section offset">
      <Footer_ />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTournaments } from '@/composables/useTournaments'
import MainBanner from '@/components/MainBanner.vue';
import TopPlayers from '@/components/TopPlayers.vue';
import TopTeams from '@/components/TopTeams.vue';
import OngoingTournaments from '@/components/OngoingTournaments.vue';
import UpcomingTournaments from '@/components/UpcomingTournaments.vue';
import FinishedTournaments from '@/components/FinishedTournaments.vue';
import Sponsors from '@/components/Sponsors.vue';
import Footer_ from "@/components/Footer_.vue";

defineOptions({
  name: 'HomeView',
});

// Un solo llamado para todos los componentes de torneos
const { tournaments, loading, error, loadTournaments } = useTournaments()

// Cargar torneos una sola vez al montar el componente
onMounted(() => {
  loadTournaments()
})

</script>

<style scoped>
.home-main {
  padding-top: 60px;
  background-color: transparent;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

.section {
  padding: 0.1px 0 0 0;
  border-bottom: 1px solid #ccc;
  /* Light gray color for separation */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section:last-child {
  border-bottom: none;
}

.offset {
  padding-top: 60px;
  /* Adjust this value to match the height of your fixed navbar */
  margin-top: -60px;
  /* Negative margin to offset the added padding */
}

/* Mobile adjustments for tournaments section */
@media (max-width: 768px) {
  .offset {
    padding-top: 80px;
    margin-top: -70px;
  }

  #ongoing_tournaments {
    padding-top: 90px;
    margin-top: -80px;
  }
}
</style>
