<template>
 <div class="section-content">
  <div class="section-header">
   <h2>🏆 Tabla de Clasificación</h2>
   <p class="section-description">Posiciones actuales de todos los equipos</p>
  </div>

  <div class="classification-container">
  <!-- Info del torneo (nombre + fase de grupos) -->
  <div class="tournament-info">
   <div class="tournament-name">Nombre del Torneo</div>
   <div class="tournament-phase">Fase de Grupos</div>
  </div>

   <!-- Grupos: 3 columnas con 9 equipos cada uno -->
   <div class="groups-grid">
      <div class="group-card">
       <div class="group-header">Grupo A</div>
       <div class="classification-table">
         <div class="table-header">
          <div class="pos">#</div>
          <div class="team">Equipo</div>
          <div class="points">PTS</div>
          <div class="games">PJ</div>
          <div class="wins">PG</div>
          <div class="draws">PE</div>
          <div class="losses">PP</div>
          <div class="goals-for">GF</div>
          <div class="goals-against">GC</div>
          <div class="goal-diff">DG</div>
         </div>
         <div class="table-body">
  <div class="table-row qualify">
   <div class="pos">1</div>
   <div class="team"><img src="/images/logo.png" alt="Equipo 1" @error="handleTeamImageError"><span>Equipo 1</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div>
  </div>
  <div class="table-row qualify">
   <div class="pos">2</div>
   <div class="team"><img src="/images/logo.png" alt="Equipo 2" @error="handleTeamImageError"><span>Equipo 2</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div>
  </div>
  <div class="table-row qualify"><div class="pos">3</div><div class="team"><img src="/images/logo.png" alt="Equipo 3" @error="handleTeamImageError"><span>Equipo 3</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">4</div><div class="team"><img src="/images/logo.png" alt="Equipo 4" @error="handleTeamImageError"><span>Equipo 4</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">5</div><div class="team"><img src="/images/logo.png" alt="Equipo 5" @error="handleTeamImageError"><span>Equipo 5</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">6</div><div class="team"><img src="/images/logo.png" alt="Equipo 6" @error="handleTeamImageError"><span>Equipo 6</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">7</div><div class="team"><img src="/images/logo.png" alt="Equipo 7" @error="handleTeamImageError"><span>Equipo 7</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">8</div><div class="team"><img src="/images/logo.png" alt="Equipo 8" @error="handleTeamImageError"><span>Equipo 8</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row elimination"><div class="pos">9</div><div class="team"><img src="/images/logo.png" alt="Equipo 9" @error="handleTeamImageError"><span>Equipo 9</span></div>
   <div class="points">0</div>
   <div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div>
   <div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
         </div>
       </div>
      </div>

      <div class="group-card">
       <div class="group-header">Grupo B</div>
       <div class="classification-table">
         <div class="table-header">
          <div class="pos">#</div>
          <div class="team">Equipo</div>
          <div class="points">PTS</div>
          <div class="games">PJ</div>
          <div class="wins">PG</div>
          <div class="draws">PE</div>
          <div class="losses">PP</div>
          <div class="goals-for">GF</div>
          <div class="goals-against">GC</div>
          <div class="goal-diff">DG</div>
         </div>
         <div class="table-body">
          <!-- Reutilizamos plantillas de filas: 9 equipos -->
  <div class="table-row qualify"><div class="pos">1</div><div class="team"><img src="/images/logo.png" alt="Equipo 10" @error="handleTeamImageError"><span>Equipo 10</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">2</div><div class="team"><img src="/images/logo.png" alt="Equipo 11" @error="handleTeamImageError"><span>Equipo 11</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">3</div><div class="team"><img src="/images/logo.png" alt="Equipo 12" @error="handleTeamImageError"><span>Equipo 12</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">4</div><div class="team"><img src="/images/logo.png" alt="Equipo 13" @error="handleTeamImageError"><span>Equipo 13</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">5</div><div class="team"><img src="/images/logo.png" alt="Equipo 14" @error="handleTeamImageError"><span>Equipo 14</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">6</div><div class="team"><img src="/images/logo.png" alt="Equipo 15" @error="handleTeamImageError"><span>Equipo 15</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">7</div><div class="team"><img src="/images/logo.png" alt="Equipo 16" @error="handleTeamImageError"><span>Equipo 16</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row qualify"><div class="pos">8</div><div class="team"><img src="/images/logo.png" alt="Equipo 17" @error="handleTeamImageError"><span>Equipo 17</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
  <div class="table-row elimination"><div class="pos">9</div><div class="team"><img src="/images/logo.png" alt="Equipo 18" @error="handleTeamImageError"><span>Equipo 18</span></div><div class="points">0</div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div></div>
         </div>
       </div>
      </div>

      <div class="group-card">
       <div class="group-header">Grupo C</div>
       <div class="classification-table">
         <div class="table-header">
          <div class="pos">#</div>
          <div class="team">Equipo</div>
          <div class="points">PTS</div>
          <div class="games">PJ</div>
          <div class="wins">PG</div>
          <div class="draws">PE</div>
          <div class="losses">PP</div>
          <div class="goals-for">GF</div>
          <div class="goals-against">GC</div>
          <div class="goal-diff">DG</div>
         </div>
         <div class="table-body">
      <div class="table-row qualify"><div class="pos">1</div><div class="team"><img src="/images/logo.png" alt="Equipo 19" @error="handleTeamImageError"><span>Equipo 19</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">2</div><div class="team"><img src="/images/logo.png" alt="Equipo 20" @error="handleTeamImageError"><span>Equipo 20</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">3</div><div class="team"><img src="/images/logo.png" alt="Equipo 21" @error="handleTeamImageError"><span>Equipo 21</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">4</div><div class="team"><img src="/images/logo.png" alt="Equipo 22" @error="handleTeamImageError"><span>Equipo 22</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">5</div><div class="team"><img src="/images/logo.png" alt="Equipo 23" @error="handleTeamImageError"><span>Equipo 23</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">6</div><div class="team"><img src="/images/logo.png" alt="Equipo 24" @error="handleTeamImageError"><span>Equipo 24</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">7</div><div class="team"><img src="/images/logo.png" alt="Equipo 25" @error="handleTeamImageError"><span>Equipo 25</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row qualify"><div class="pos">8</div><div class="team"><img src="/images/logo.png" alt="Equipo 26" @error="handleTeamImageError"><span>Equipo 26</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
      <div class="table-row elimination"><div class="pos">9</div><div class="team"><img src="/images/logo.png" alt="Equipo 27" @error="handleTeamImageError"><span>Equipo 27</span></div><div class="games">0</div><div class="wins">0</div><div class="draws">0</div><div class="losses">0</div><div class="goals-for">0</div><div class="goals-against">0</div><div class="goal-diff">0</div><div class="points">0</div></div>
         </div>
       </div>
      </div>
    </div>
            <!-- Significado de las siglas y leyenda de clasificación -->
            <div class="classification-bottom">
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

             <div class="classification-legend-siglas" aria-label="Significado de siglas">
               <h3>Significado de las siglas</h3>
               <ul class="siglas-list">
                <li><strong>PJ</strong> — Partidos Jugados</li>
                <li><strong>PG</strong> — Partidos Ganados</li>
                <li><strong>PE</strong> — Partidos Empatados</li>
                <li><strong>PP</strong> — Partidos Perdidos</li>
                <li><strong>GF</strong> — Goles a Favor</li>
                <li><strong>GC</strong> — Goles en Contra</li>
                <li><strong>DG</strong> — Diferencia de Gol</li>
                <li><strong>PTS</strong> — Puntos</li>
               </ul>
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
 color: #ffffff;
 margin: 0 0 0.5rem 0;
 background: linear-gradient(135deg, #3498db, #2980b9);
 -webkit-background-clip: text;
 -webkit-text-fill-color: transparent;
 background-clip: text;
 text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.section-description {
 font-size: 1.1rem;
 color: #bdc3c7;
 margin: 0;
}

/* Estilos para Clasificación */
/* Contenedor principal: full-bleed para ocupar todo el ancho de la página
   pero manteniendo el contenido interno centrado y con máximo ancho. */
.classification-container {
  background: #2c3e50;
  /* full-bleed trick */
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  box-sizing: border-box;
  padding: 2rem 0; /* control del padding vertical, el interno gestiona horizontales */
  border-top: 2px solid #34495e;
  border-bottom: 2px solid #34495e;
  overflow-x: hidden; /* evitar scroll horizontal global */
}

/* Contenedor de grupos */
.groups-grid {
 display: grid;
 grid-template-columns: repeat(2, 1fr);
 gap: 2rem;
 padding: 0 2rem; /* mantener separación lateral */
 width: 100%;
 max-width: none; /* ocupar todo el ancho del contenedor full-bleed */
 margin: 0;
 overflow-x: hidden; /* evitar scroll horizontal en la cuadrícula */
}

.group-card {
 background: #1e3a5f;
 border-radius: 12px;
 overflow: hidden;
 box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
 border: 1px solid #2c5282;
 width: 100%;
 min-width: 0; /* evita overflow en grids flexibles */
 display: flex;
 flex-direction: column;
 padding: 0.75rem 1rem; /* espacio interno para que no se vean montados */
}

.group-header {
 background: #2563eb;
 color: white;
 font-weight: 700;
 font-size: 1.1rem;
 padding: 1rem 1.25rem;
 text-align: center;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 border-top-left-radius: 18px;
 border-top-right-radius: 18px;
}

/* Info del torneo centrada */
.tournament-info {
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 text-align: center;
 gap: 0.15rem;
 padding: 0 1rem 1rem;
 width: calc(100% - 4rem);
 max-width: 1200px;
 margin: 0 auto 1rem auto;
 color: #ffffff;
}
.tournament-info .tournament-name {
 font-size: 1.25rem;
 font-weight: 800;
}
.tournament-info .tournament-phase {
 font-size: 0.95rem;
 color: #cbd5e1;
}

.classification-legend {
 display: flex;
 gap: 2rem;
 padding: 2rem 2rem 1rem;
 flex-wrap: wrap;
 background: #2c3e50;
}

.legend-item {
 display: flex;
 align-items: center;
 gap: 0.5rem;
 font-size: 0.9rem;
 font-weight: 500;
 color: #ecf0f1;
}

.legend-color {
 width: 16px;
 height: 16px;
 border-radius: 3px;
}

.legend-item.qualify .legend-color {
 background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.legend-item.elimination .legend-color {
 background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.classification-table {
 overflow-x: hidden; /* quitar scroll horizontal interno */
 background: #1e3a5f;
}

.table-header,
.table-row {
 display: grid;
 grid-template-columns: 40px 2fr 50px 50px 50px 50px 60px 60px 70px 60px;
 gap: 0.5rem;
 align-items: center;
 padding: 0.75rem 1rem;
 font-size: 0.85rem;
 min-width: 0; /* permitir que las celdas se encojan sin overflow */
}

.table-header {
 background: #2563eb;
 font-weight: 700;
 color: #ffffff;
 text-transform: uppercase;
 letter-spacing: 0.5px;
 border-bottom: 2px solid #1d4ed8;
}

.table-header .points {
 padding: 0 0.4rem; /* mayor espacio para la columna PTS */
}

.table-row {
 border-bottom: 1px solid #334155;
 transition: all 0.3s ease;
 background: #1e3a5f;
 color: #f8fafc;
}

.table-row:nth-child(even) {
 background: #1e293b;
}

.table-row:hover {
 background: #2563eb !important;
 transform: scale(1.02);
}

.table-row.qualify {
 border-left: 4px solid #10b981;
}

.table-row.elimination {
 border-left: 4px solid #ef4444;
}

.pos {
 font-weight: 700;
 color: #ffffff;
 text-align: center;
 background: rgba(37, 99, 235, 0.3);
 border-radius: 6px;
 padding: 0.25rem;
}

.team {
 display: flex;
 align-items: center;
 gap: 0.75rem;
 font-weight: 600;
 color: #ffffff;
}

.team img {
 width: 25px;
 height: 25px;
 border-radius: 4px;
 object-fit: cover;
 border: 2px solid #2563eb;
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
 color: #f8fafc;
}

.points {
 color: #fbbf24;
 font-size: 1rem;
 font-weight: 800;
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
 .groups-grid {
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1rem;
 }

 .table-header,
 .table-row {
  grid-template-columns: 35px 1.5fr 45px 45px 45px 45px 50px 50px 55px 50px;
  padding: 0.6rem 0.8rem;
  font-size: 0.75rem;
 }

 .classification-table {
  border: 2px solid #2563eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
 }

 .table-header {
  background: #1d4ed8;
 }

 .pos {
  padding: 0.15rem;
  font-size: 0.75rem;
 }

 .team img {
  width: 20px;
  height: 20px;
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

/* Leyenda de siglas */
.classification-legend-siglas {
 padding: 1.25rem 2rem 2rem;
 background: transparent;
 color: #ecf0f1;
 width: 100%;
 box-sizing: border-box;
 border-top: 1px solid rgba(255,255,255,0.04);
}
.classification-legend-siglas h3 {
 margin: 0 0 0.5rem 0;
 font-size: 1.05rem;
 color: #ffffff;
 font-weight: 700;
}
.siglas-list {
 list-style: none;
 padding: 0;
 margin: 0;
 display: grid;
 grid-template-columns: repeat(2, minmax(0, 1fr));
 gap: 0.5rem 1.5rem;
}
.siglas-list li {
 color: #cbd5e1;
 font-size: 0.95rem;
}
.siglas-list li strong {
 color: #f1c40f; /* resaltar sigla en amarillo */
 margin-right: 0.4rem;
}

@media (max-width: 480px) {
 .siglas-list {
  grid-template-columns: 1fr;
 }
 .classification-legend-siglas {
  padding: 0.75rem 1rem 1rem;
 }
}
</style>
