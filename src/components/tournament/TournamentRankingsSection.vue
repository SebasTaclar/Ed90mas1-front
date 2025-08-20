<template>
 <div class="section-content">
  <div class="section-header">
   <h2>📊 Rankings y encuestas</h2>
   <p class="section-description">Estadísticas y encuestas del torneo</p>
  </div>
  <div class="coming-soon">
   <span>📊</span>
   <h3>Próximamente</h3>
   <p>Los rankings y encuestas estarán disponibles durante el torneo</p>
  </div>
 </div>
</template>

<script setup lang="ts">
// Componente placeholder para rankings y encuestas
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

/* Coming soon */
.coming-soon {
 text-align: center;
 padding: 4rem 2rem;
 background: white;
 border-radius: 12px;
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
 width: 100%;
 max-width: 600px;
}

.coming-soon span {
 font-size: 3rem;
 display: block;
 margin-bottom: 1rem;
}

.coming-soon h3 {
 font-size: 1.5rem;
 font-weight: 600;
 color: #495057;
 margin-bottom: 0.5rem;
}

.coming-soon p {
 color: #6c757d;
 font-size: 1rem;
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

[data-theme="dark"] .coming-soon {
 background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
 border-color: #475569;
 color: #e2e8f0;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .coming-soon h3 {
 color: #ffffff !important;
}

[data-theme="dark"] .coming-soon p {
 color: #cbd5e1 !important;
}

[data-theme="dark"] .coming-soon span {
 filter: brightness(1.2);
}
</style>
