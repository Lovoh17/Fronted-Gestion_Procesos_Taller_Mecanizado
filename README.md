# Fronted-Gestion_Procesos_Taller_Mecanizado

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Pinia](https://img.shields.io/badge/Pinia-2B2D42?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

Sistema completo para la gestión de producción, mantenimiento y órdenes de trabajo en talleres industriales.

## Características Principales

### 🏭 Módulo de Producción
- Planificación visual de recursos (máquinas, operarios)
- Vista semanal y diaria de asignaciones
- Gestión de capacidad y carga de trabajo
- Alertas de sobrecarga de recursos

### 🔧 Módulo de Mantenimiento
- Programación de mantenimientos preventivos y correctivos
- Gestión de repuestos e insumos
- Registro de tareas realizadas
- Galería de evidencias fotográficas
- Historial completo de intervenciones

### 📝 Módulo de Órdenes de Trabajo
- Creación y seguimiento de órdenes
- Asignación de prioridades (Alta/Media/Baja)
- Control de materiales y recursos
- Estados personalizables (Pendiente, En Progreso, Completado)
- Filtros avanzados y exportación a Excel

### 👤 Sistema de Autenticación
- Roles: Administrador, Coordinador, Técnico
- Perfiles de usuario personalizables

## Tecnologías Utilizadas

- **Frontend**: Vue 3 (Composition API), Pinia, Vue Router
- **Estilos**: CSS3, Flexbox, Grid Layout
- **Iconos**: Material Icons
- **Bundler**: Vite
- **Visualización**: Chart.js (para reportes)


## Módulos Principales

### 👨‍💻 Administración
- Gestión de usuarios y roles
- Reportes y estadísticas
- Configuración del sistema
- Componentes:
  - `adminView.vue`
  - `Usuarios.vue`
  - `Reports.vue`
  - `StatsCards.vue`

### 🛠️ Coordinación de Producción
- Planificación de órdenes de trabajo
- Monitoreo de máquinas
- Asignación de recursos
- Componentes:
  - `CoordinatorView.vue`
  - `ProductionPlanning.vue`
  - `MachineStatusGrid.vue`
  - `OrderGanttChart.vue`

### 🔧 Mantenimiento
- Registro de intervenciones
- Programación preventiva
- Gestión de repuestos
- Componentes:
  - `Maintenance.vue`
  - `MaintenanceModal.vue`
  - `MaintenanceDetailsModal.vue`

### 📋 Órdenes de Trabajo
- Creación y seguimiento
- Asignación de prioridades
- Componentes:
  - `WorkOrders.vue`
  - `WorkOrderModal.vue`
  - `OrderDetailsModal.vue`
