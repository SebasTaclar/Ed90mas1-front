<template>
 <div class="section-content">
  <div class="section-header">
   <h2>🏆 Tabla de Clasificación</h2>
   <p class="section-description">Posiciones actuales de todos los equipos</p>
  </div>

  <div class="classification-container">
   <!-- Leyenda -->
   <div class="classification-legend">
    <div class="legend-item qualify">
     <span class="legend-color"></span>
     <span>Clasifican a playoff</span>
    </div>
    <div class="legend-item elimination">
     <span class="legend-color"></span>
     <span>Zona de eliminación</span>
    </div>
   </div>

   <!-- Tabla de posiciones -->
   <div class="classification-table">
    <div class="table-header">
     <div class="pos">#</div>
     <div class="team">Equipo</div>
     <div class="games">PJ</div>
     <div class="wins">PG</div>
     <div class="draws">PE</div>
     <div class="losses">PP</div>
     <div class="goals-for">GF</div>
     <div class="goals-against">GC</div>
     <div class="goal-diff">DG</div>
     <div class="points">PTS</div>
    </div>

    <div class="table-body">
     <div class="table-row qualify">
      <div class="pos">1</div>
      <div class="team">
       <img src="/images/logo.png" alt="Drink Team" @error="handleTeamImageError">
       <span>Drink Team</span>
      </div>
      <div class="games">3</div>
      <div class="wins">3</div>
      <div class="draws">0</div>
      <div class="losses">0</div>
      <div class="goals-for">8</div>
      <div class="goals-against">2</div>
      <div class="goal-diff">+6</div>
      <div class="points">9</div>
     </div>

     <div class="table-row qualify">
      <div class="pos">2</div>
      <div class="team">
       <img src="/images/logo.png" alt="Olympia FC" @error="handleTeamImageError">
       <span>Olympia FC</span>
      </div>
      <div class="games">3</div>
      <div class="wins">2</div>
      <div class="draws">1</div>
      <div class="losses">0</div>
      <div class="goals-for">6</div>
      <div class="goals-against">3</div>
      <div class="goal-diff">+3</div>
      <div class="points">7</div>
     </div>

     <div class="table-row">
      <div class="pos">3</div>
      <div class="team">
       <img src="/images/logo.png" alt="La Fábrica" @error="handleTeamImageError">
       <span>La Fábrica</span>
      </div>
      <div class="games">3</div>
      <div class="wins">2</div>
      <div class="draws">0</div>
      <div class="losses">1</div>
      <div class="goals-for">5</div>
      <div class="goals-against">4</div>
      <div class="goal-diff">+1</div>
      <div class="points">6</div>
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

/* Estilos para Clasificación */
.classification-container {
 background: white;
 border-radius: 20px;
 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
 overflow: hidden;
 width: 100%;
}

.classification-legend {
 display: flex;
 gap: 2rem;
 padding: 2rem 2rem 1rem;
 flex-wrap: wrap;
}

.legend-item {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 font-size: 0.9rem;
 font-weight: 500;
 color: #6c757d;
}

.legend-color {
 width: 16px;
 height: 16px;
 border-radius: 3px;
}

.legend-item.qualify .legend-color {
 background: linear-gradient(135deg, #28a745, #20c997);
}

.legend-item.elimination .legend-color {
 background: linear-gradient(135deg, #dc3545, #c82333);
}

.classification-table {
 overflow-x: auto;
}

.table-header,
.table-row {
 display: grid;
 grid-template-columns: 50px 1fr 60px 60px 60px 60px 60px 60px 80px 80px;
 gap: 1rem;
 align-items: center;
 padding: 1rem 2rem;
 font-size: 0.9rem;
}

.table-header {
 background: #f8f9fa;
 font-weight: 700;
 color: #495057;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 border-bottom: 2px solid #e9ecef;
}

.table-row {
 border-bottom: 1px solid #f1f3f4;
 transition: all 0.3s ease;
}

.table-row:hover {
 background: #f8f9fa;
}

.table-row.qualify {
 border-left: 4px solid #28a745;
 background: rgba(40, 167, 69, 0.05);
}

.table-row.elimination {
 border-left: 4px solid #dc3545;
 background: rgba(220, 53, 69, 0.05);
}

.pos {
 font-weight: 700;
 color: #007bff;
 text-align: center;
}

.team {
 display: flex;
 align-items: center;
 gap: 0.75rem;
 font-weight: 600;
 color: #212529;
}

.team img {
 width: 30px;
 height: 30px;
 border-radius: 6px;
 object-fit: cover;
}

.games,
.wins,
.draws,
.losses,
.goals-for,
.goals-against,
.goal-diff,
.points {
 text-align: center;
 font-weight: 600;
}

.points {
 color: #007bff;
 font-size: 1.1rem;
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

[data-theme="dark"] .classification-container {
 background: transparent;
}

[data-theme="dark"] .classification-legend {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
}

[data-theme="dark"] .classification-legend .legend-item {
 color: #e2e8f0 !important;
}

[data-theme="dark"] .classification-table {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
}

[data-theme="dark"] .table-header {
 background: #0f172a;
 border-bottom: 2px solid #475569;
 color: #ffffff !important;
}

[data-theme="dark"] .table-row {
 border-bottom: 1px solid #475569;
}

[data-theme="dark"] .table-row:hover {
 background: #334155;
}

[data-theme="dark"] .table-row:nth-child(even) {
 background: rgba(15, 23, 42, 0.3);
}

[data-theme="dark"] .table-row:nth-child(even):hover {
 background: #334155;
}

[data-theme="dark"] .pos {
 color: #3b82f6 !important;
 font-weight: bold;
}

[data-theme="dark"] .team span {
 color: #ffffff !important;
}

[data-theme="dark"] .games,
[data-theme="dark"] .wins,
[data-theme="dark"] .draws,
[data-theme="dark"] .losses,
[data-theme="dark"] .goals-for,
[data-theme="dark"] .goals-against,
[data-theme="dark"] .goal-diff {
 color: #cbd5e1 !important;
}

[data-theme="dark"] .points {
 color: #3b82f6 !important;
}

/* Responsive */
@media (max-width: 768px) {

 .table-header,
 .table-row {
  grid-template-columns: 40px 1fr 50px 50px 50px 50px 50px 50px 60px 60px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
 }

 .classification-table {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
 }

 [data-theme="dark"] .classification-table {
  border: 1px solid #475569;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
 }
}

@media (max-width: 480px) {

 .table-header,
 .table-row {
  padding: 0.5rem;
  font-size: 0.75rem;
 }

 .classification-legend {
  padding: 1rem;
  gap: 1rem;
 }

 .team span {
  font-size: 0.8rem !important;
  font-weight: 600;
 }
}
</style>
