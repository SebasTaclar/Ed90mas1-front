<template>
 <div class="section-content">
  <div class="section-header">
   <h2>⚽ Resultados</h2>
   <p class="section-description">Resultados de todos los partidos disputados</p>
  </div>

  <div class="results-container">
   <!-- Estadísticas generales -->
   <div class="stats-grid">
    <div class="stat-card">
     <div class="stat-icon">⚽</div>
     <div class="stat-content">
      <span class="stat-number">24</span>
      <span class="stat-label">Goles totales</span>
     </div>
    </div>
    <div class="stat-card">
     <div class="stat-icon">🥅</div>
     <div class="stat-content">
      <span class="stat-number">8</span>
      <span class="stat-label">Partidos jugados</span>
     </div>
    </div>
    <div class="stat-card">
     <div class="stat-icon">👤</div>
     <div class="stat-content">
      <span class="stat-number">12</span>
      <span class="stat-label">Goleadores</span>
     </div>
    </div>
    <div class="stat-card">
     <div class="stat-icon">🟨</div>
     <div class="stat-content">
      <span class="stat-number">5</span>
      <span class="stat-label">Tarjetas amarillas</span>
     </div>
    </div>
   </div>

   <!-- Resultados recientes -->
   <div class="recent-results">
    <h3>Resultados recientes</h3>
    <div class="results-list">
     <div class="result-card">
      <div class="match-info">
       <span class="match-date">10 Ago</span>
       <span class="match-round">Jornada 1</span>
      </div>
      <div class="match-result">
       <div class="team-result">
        <img src="/images/logo.png" alt="Drink Team" @error="handleTeamImageError">
        <span class="team-name">Drink Team</span>
        <span class="team-score winner">3</span>
       </div>
       <div class="result-separator">-</div>
       <div class="team-result">
        <span class="team-score">1</span>
        <span class="team-name">Tecno Stop</span>
        <img src="/images/logo.png" alt="Tecno Stop" @error="handleTeamImageError">
       </div>
      </div>
      <div class="match-actions">
       <button class="action-btn">Ver detalles</button>
      </div>
     </div>
    </div>
   </div>
  </div>
 </div>
</template>

<script setup lang="ts">
const handleTeamImageError = (event: Event) => {
 const img = event.target as HTMLImageElement
 img.src = '/images/logo.png'
}
</script>

<style scoped>
.section-content {
 width: 100%;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 max-width: 1200px;
 margin: 0 auto;
 padding: 2rem;
}

.section-header {
 margin-bottom: 3rem;
 text-align: center;
 width: 100%;
}

.section-header h2 {
 font-size: 2.5rem;
 font-weight: 700;
 color: #212529;
 margin: 0 0 0.5rem 0;
 background: linear-gradient(135deg, #007bff, #0056b3);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
}

.section-description {
 font-size: 1.1rem;
 color: #6c757d;
 margin: 0;
}

/* Estilos para Resultados */
.results-container {
 display: flex;
 flex-direction: column;
 gap: 2rem;
 width: 100%;
}

.stats-grid {
 display: grid;
 grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
 gap: 1.5rem;
}

.stat-card {
 background: white;
 padding: 2rem;
 border-radius: 15px;
 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
 display: flex;
 align-items: center;
 gap: 1.5rem;
 border: 2px solid transparent;
 transition: all 0.3s ease;
}

.stat-card:hover {
 border-color: #007bff;
 transform: translateY(-5px);
 box-shadow: 0 15px 35px rgba(0, 123, 255, 0.2);
}

.stat-icon {
 width: 60px;
 height: 60px;
 background: linear-gradient(135deg, #007bff, #0056b3);
 border-radius: 15px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 1.5rem;
 color: white;
}

.stat-content {
 display: flex;
 flex-direction: column;
}

.stat-number {
 font-size: 2rem;
 font-weight: 700;
 color: #212529;
 line-height: 1;
}

.stat-label {
 font-size: 0.9rem;
 color: #6c757d;
 font-weight: 500;
 text-transform: uppercase;
 letter-spacing: 0.5px;
}

.recent-results {
 background: white;
 padding: 2rem;
 border-radius: 20px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.recent-results h3 {
 font-size: 1.5rem;
 font-weight: 700;
 color: #212529;
 margin: 0 0 1.5rem 0;
}

.results-list {
 display: flex;
 flex-direction: column;
 gap: 1rem;
}

.result-card {
 display: grid;
 grid-template-columns: auto 1fr auto;
 gap: 2rem;
 align-items: center;
 padding: 1.5rem;
 background: #f8f9fa;
 border-radius: 15px;
 border: 2px solid transparent;
 transition: all 0.3s ease;
}

.result-card:hover {
 border-color: #007bff;
 transform: translateY(-2px);
}

.match-info {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 0.25rem;
 min-width: 80px;
}

.match-date {
 font-weight: 700;
 color: #007bff;
}

.match-round {
 font-size: 0.8rem;
 color: #6c757d;
}

.match-result {
 display: flex;
 align-items: center;
 gap: 1rem;
}

.team-result {
 display: flex;
 align-items: center;
 gap: 0.75rem;
}

.team-result img {
 width: 35px;
 height: 35px;
 border-radius: 8px;
 object-fit: cover;
}

.team-name {
 font-weight: 600;
 color: #212529;
 min-width: 120px;
}

.team-score {
 font-size: 1.25rem;
 font-weight: 700;
 color: #6c757d;
 min-width: 30px;
 text-align: center;
}

.team-score.winner {
 color: #007bff;
}

.result-separator {
 font-weight: 700;
 color: #6c757d;
 padding: 0 1rem;
}

.match-actions {
 display: flex;
 gap: 0.5rem;
}

.action-btn {
 padding: 8px 16px;
 background: linear-gradient(135deg, #007bff, #0056b3);
 border: none;
 border-radius: 8px;
 color: white;
 font-weight: 600;
 font-size: 0.875rem;
 cursor: pointer;
 transition: all 0.3s ease;
}

.action-btn:hover {
 transform: translateY(-2px);
 box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* Dark mode support */
[data-theme="dark"] .section-content {
 background: transparent;
 color: #e2e8f0;
}

[data-theme="dark"] .section-header h2 {
 color: #ffffff;
 text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .section-description {
 color: #cbd5e1;
}

[data-theme="dark"] .stat-card {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .stat-card:hover {
 background: linear-gradient(145deg, #334155 0%, #475569 100%);
 border-color: #3b82f6;
 box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

[data-theme="dark"] .stat-number {
 color: #ffffff;
}

[data-theme="dark"] .stat-label {
 color: #cbd5e1;
}

[data-theme="dark"] .recent-results {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .recent-results h3 {
 color: #ffffff !important;
}

[data-theme="dark"] .result-card {
 background: linear-gradient(145deg, #334155 0%, #475569 100%);
 border-color: #64748b;
}

[data-theme="dark"] .result-card:hover {
 border-color: #3b82f6;
}

[data-theme="dark"] .team-name {
 color: #ffffff;
}

[data-theme="dark"] .match-date {
 color: #3b82f6;
}

[data-theme="dark"] .match-round {
 color: #cbd5e1;
}

[data-theme="dark"] .team-score {
 color: #cbd5e1;
}

[data-theme="dark"] .team-score.winner {
 color: #3b82f6;
}

[data-theme="dark"] .result-separator {
 color: #cbd5e1;
}

/* Responsive */
@media (max-width: 768px) {
 .stats-grid {
  grid-template-columns: repeat(2, 1fr);
 }

 .result-card {
  grid-template-columns: 1fr;
  gap: 1rem;
  text-align: center;
 }

 .match-result {
  flex-direction: column;
  gap: 1rem;
 }

 .team-result {
  justify-content: center;
 }
}

@media (max-width: 480px) {
 .stats-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
 }

 .stat-card {
  padding: 1.5rem;
  flex-direction: column;
  text-align: center;
 }

 .stat-icon {
  width: 50px;
  height: 50px;
  font-size: 1.25rem;
 }

 .recent-results {
  padding: 1rem;
 }

 .result-card {
  padding: 1rem;
 }

 .team-result img {
  width: 30px;
  height: 30px;
 }
}
</style>
