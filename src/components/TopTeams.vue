<template>
  <section class="top-teams-section">
    <div class="section-title">
      <h2>Top 10 Mejores Equipos</h2>
      <p>Los equipos más destacados de la temporada</p>
    </div>
    <div class="top-teams-container">
      <div class="teams-scroll">
        <div v-for="(team, index) in topTeams" :key="index" class="team-card">
          <div class="team-rank">{{ index + 1 }}</div>
          <div class="team-logo" :style="{ backgroundImage: `url(${team.logo})` }">
            <div class="team-overlay"></div>
          </div>
          <div class="team-info">
            <span class="team-name">{{ team.name }}</span>
            <span class="team-stats">{{ team.stats }}</span>
            <div class="team-achievements">
              <span class="achievement wins">{{ team.wins }}G</span>
              <span class="achievement draws">{{ team.draws }}E</span>
              <span class="achievement losses">{{ team.losses }}P</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const topTeams = ref([
  {
    name: 'FC Barcelona',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '28 Pts • Liga Líder',
    wins: 9,
    draws: 1,
    losses: 0
  },
  {
    name: 'Real Madrid',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '25 Pts • Subcampeón',
    wins: 8,
    draws: 1,
    losses: 1
  },
  {
    name: 'Atlético Madrid',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '22 Pts • 3er Lugar',
    wins: 7,
    draws: 1,
    losses: 2
  },
  {
    name: 'Manchester City',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '21 Pts • Premier League',
    wins: 7,
    draws: 0,
    losses: 3
  },
  {
    name: 'Bayern Munich',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '20 Pts • Bundesliga',
    wins: 6,
    draws: 2,
    losses: 2
  },
  {
    name: 'PSG',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '19 Pts • Ligue 1',
    wins: 6,
    draws: 1,
    losses: 3
  },
  {
    name: 'Liverpool',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '18 Pts • Premier League',
    wins: 6,
    draws: 0,
    losses: 4
  },
  {
    name: 'Juventus',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '17 Pts • Serie A',
    wins: 5,
    draws: 2,
    losses: 3
  },
  {
    name: 'Chelsea',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '16 Pts • Premier League',
    wins: 5,
    draws: 1,
    losses: 4
  },
  {
    name: 'AC Milan',
    logo: '/images/logo.png', // Imagen temporal hasta tener los logos reales
    stats: '15 Pts • Serie A',
    wins: 5,
    draws: 0,
    losses: 5
  }
])
</script>

<style scoped>
.top-teams-section {
  padding: 4rem 0;
  background: var(--bg-color);
  color: var(--text-color);
}

.section-title {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-title p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.top-teams-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  overflow: hidden;
}

.teams-scroll {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  padding: 1rem 0.5rem;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.teams-scroll::-webkit-scrollbar {
  display: none;
}

.team-card {
  flex: 0 0 auto;
  width: 140px;
  text-align: center;
  transition: transform 0.3s ease;
  padding: 1.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  position: relative;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px var(--shadow-primary);
}

.team-rank {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.team-logo {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  margin: 0 auto;
  background-size: cover;
  background-position: center;
  background-color: #f8f9fa;
  border: 2px solid var(--primary-blue);
  position: relative;
  overflow: hidden;
}

.team-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.2) 100%);
}

.team-info {
  margin-top: 1rem;
}

.team-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.team-stats {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.8rem;
}

.team-achievements {
  display: flex;
  justify-content: space-between;
  gap: 0.3rem;
}

.achievement {
  flex: 1;
  font-size: 0.7rem;
  padding: 0.3rem;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
}

.achievement.wins {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.achievement.draws {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.achievement.losses {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

@media (max-width: 768px) {
  .section-title h2 {
    font-size: 2rem;
  }

  .team-card {
    width: 120px;
    padding: 1rem 0.8rem;
  }

  .team-logo {
    width: 70px;
    height: 70px;
  }

  .team-name {
    font-size: 0.8rem;
  }

  .team-stats {
    font-size: 0.7rem;
  }

  .achievement {
    font-size: 0.65rem;
    padding: 0.25rem;
  }
}

@media (max-width: 480px) {
  .teams-scroll {
    gap: 1rem;
  }

  .team-card {
    width: 100px;
    padding: 0.8rem 0.6rem;
  }

  .team-logo {
    width: 60px;
    height: 60px;
  }

  .team-rank {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
}
</style>
