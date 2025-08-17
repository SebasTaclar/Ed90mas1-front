# Configuración de Torneos - Ed90+1

## 🏆 Funcionalidad de Configuración de Torneos

Esta nueva funcionalidad permite a los administradores configurar torneos antes de generar cronogramas, resultados y estadísticas.

### ✨ Características Principales

1. **Configuración Flexible de Grupos**

   - Selecciona entre 1 y 8 grupos
   - Distribución automática de equipos
   - Vista previa en tiempo real

2. **Distribución de Equipos**

   - **Aleatoria**: Mezcla equipos al azar
   - **Balanceada**: Distribución uniforme
   - **Drag & Drop**: Reorganización manual

3. **Estado Visual**
   - Indicador en la tabla de torneos
   - Estados claros: "Configurado" vs "Sin configurar"
   - Notificaciones de éxito/error

### 📋 Cómo Usar

#### Paso 1: Acceder a la Configuración

1. Ve a **Admin → Administrar Torneos**
2. Busca el torneo que deseas configurar
3. Haz clic en el botón **"⚙️ Configurar"**

#### Paso 2: Configurar Grupos

1. **Selecciona el número de grupos** (1-8)
2. **Revisa la distribución automática** de equipos
3. **Ajusta manualmente** arrastrando equipos si es necesario

#### Paso 3: Finalizar

1. Revisa que todos los grupos tengan equipos
2. Haz clic en **"💾 Guardar Configuración"**
3. ✅ ¡Listo! El torneo está configurado

### 🎯 Beneficios

- **Prerequisito para cronogramas**: Los cronogramas requieren configuración previa
- **Organización clara**: Visualiza cómo se organizan los equipos
- **Flexibilidad**: Permite ajustes manuales después de la distribución automática
- **Estado visible**: Fácil identificación de torneos configurados vs pendientes

### 🔧 Para Desarrolladores

#### Nuevos Tipos TypeScript

```typescript
interface TournamentConfiguration {
  numberOfGroups: number
  teamsPerGroup: number
  groups: TournamentGroup[]
  isConfigured: boolean
}

interface TournamentGroup {
  id: string
  name: string
  teams: number[] // Array de IDs de equipos
}
```

#### Componentes Agregados

- `TournamentConfigurationPopup.vue`: Modal principal de configuración
- `NotificationContainer.vue`: Sistema de notificaciones
- `useNotifications()`: Composable para manejar notificaciones

#### API Endpoints Requeridos

```typescript
// TODO: Implementar en el backend
POST / api / tournaments / { id } / configure
PUT / api / tournaments / { id } / configure
GET / api / tournaments / { id } / configuration
```

### 🚀 Próximas Funcionalidades

Una vez que los torneos estén configurados, se habilitarán:

1. **📅 Generador de Cronogramas**

   - Fechas automáticas basadas en grupos
   - Configuración de rounds y eliminatorias

2. **📊 Tabla de Estadísticas**

   - Puntos por equipo y grupo
   - Goles a favor/en contra

3. **🏅 Clasificaciones**

   - Ranking automático por grupo
   - Clasificados a siguientes rondas

4. **📈 Resultados en Tiempo Real**
   - Actualización de partidos
   - Impacto en clasificaciones

---

> **Nota**: Esta implementación es frontend-only. Se requiere implementación backend para persistir la configuración en la base de datos.
