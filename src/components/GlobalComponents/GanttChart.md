# GanttChartComponent - Documentación

## Descripción

El `GanttChartComponent` es un componente Vue 3 que encapsula la funcionalidad de `vue-ganttastic` con un diseño moderno, inspirado en el `FullCalendarComponent` y adaptado para el sistema de gestión de procesos del taller mecanizado.

## Características Principales

- 🎨 **Interfaz moderna** con header personalizado y controles intuitivos
- 📱 **Completamente responsive** para dispositivos móviles y desktop
- 🔧 **Altamente configurable** con múltiples props y opciones
- 🎯 **Sistema de tareas** completo con modales informativos
- 🔒 **Control de permisos** para crear, editar y eliminar tareas
- 🎨 **Estilos personalizados** para diferentes tipos y estados de tareas
- ⚡ **Optimizado** para Vue 3 con Composition API

## Instalación

El componente ya está incluido en el proyecto con todas las dependencias de `vue-ganttastic` instaladas:

```bash
# Dependencias ya incluidas en package.json
vue-ganttastic
```

## Uso Básico

```vue
<template>
  <GanttChartComponent
    :rows="ganttRows"
    chart-start="2024-01-01"
    chart-end="2024-12-31"
    title="Mi Diagrama de Gantt"
    @task-click="handleTaskClick"
  />
</template>

<script>
import GanttChartComponent from '@/components/GlobalComponents/GanttChartComponent.vue'

export default {
  components: {
    GanttChartComponent
  },
  setup() {
    const ganttRows = ref([
      {
        id: 'project-1',
        label: 'Mi Proyecto',
        bars: [
          {
            id: 'task-1',
            label: 'Tarea 1',
            start: '2024-01-15',
            end: '2024-01-30'
          }
        ]
      }
    ])

    const handleTaskClick = (task) => {
      console.log('Tarea clickeada:', task)
    }

    return { ganttRows, handleTaskClick }
  }
}
</script>
```

## Props

### Configuración Básica

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `title` | String | 'Diagrama de Gantt' | Título mostrado en el header del Gantt |
| `rows` | Array | [] | Array de filas con tareas a mostrar |
| `chartStart` | String | Requerido | Fecha de inicio del gráfico (YYYY-MM-DD) |
| `chartEnd` | String | Requerido | Fecha de fin del gráfico (YYYY-MM-DD) |
| `loading` | Boolean | false | Muestra overlay de carga |

### Configuración de Tiempo

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `precision` | String | 'day' | Precisión de la escala de tiempo ('hour', 'day', 'week', 'month') |
| `dateFormat` | String | 'DD/MM/YYYY' | Formato de fecha a mostrar |

### Control de Permisos

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `canCreateTasks` | Boolean | false | Permite crear nuevas tareas |
| `canEditTasks` | Boolean | false | Permite editar tareas existentes |
| `canDeleteTasks` | Boolean | false | Permite eliminar tareas |
| `showControls` | Boolean | true | Muestra controles adicionales |

### Filtrado y Tipos

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `taskTypes` | Array | [] | Tipos de tareas para filtrado |

**Formato de tipos de tareas:**
```javascript
[
  { value: 'development', label: 'Desarrollo' },
  { value: 'testing', label: 'Pruebas' }
]
```

### Configuración Avanzada

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `ganttConfig` | Object | {} | Configuraciones adicionales de `vue-ganttastic` |

## Eventos (Emits)

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `task-click` | task | Se dispara al hacer clic en una tarea |
| `task-create` | - | Se dispara al solicitar crear una nueva tarea |
| `task-edit` | task | Se dispara al solicitar editar una tarea |
| `task-delete` | task | Se dispara al solicitar eliminar una tarea |
| `task-drop` | task | Se dispara al soltar una tarea (arrastrar y soltar) |
| `time-unit-change`| unit | Se dispara al cambiar la escala de tiempo |

## Formato de Tareas

Cada fila en el prop `rows` debe contener un array de `bars` (tareas):

```javascript
{
  id: 'project-id',
  label: 'Nombre del Proyecto',
  bars: [
    {
      id: 'task-id',
      label: 'Nombre de la tarea',
      start: '2024-01-15', // Fecha de inicio (YYYY-MM-DD)
      end: '2024-01-30', // Fecha de fin (YYYY-MM-DD)
      status: 'in-progress',
      type: 'development',
      progress: 0.5, // 0 a 1
      assignee: 'Juan Pérez',
      description: 'Descripción de la tarea',
      bundle: 'project-id' // Agrupa tareas para arrastrar juntas
      // Cualquier propiedad personalizada...
    }
  ]
}
```

## Estilos Personalizados

El componente incluye estilos automáticos basados en el estado de la tarea:

- `not-started` - Gris
- `in-progress` - Azul
- `completed` - Verde
- `on-hold` - Naranja
- `cancelled` - Rojo

## Ejemplos Avanzados

### Gantt Completo con Permisos y Filtrado

```vue
<template>
  <GanttChartComponent
    title="Planificación de Proyectos"
    :rows="projectRows"
    chart-start="2024-01-01"
    chart-end="2024-12-31"
    :loading="isLoading"
    :can-create-tasks="userRole === 'admin'"
    :can-edit-tasks="canEdit"
    :can-delete-tasks="canDelete"
    :task-types="taskTypes"
    @task-create="showCreateModal"
    @task-edit="showEditModal"
    @task-delete="handleDeleteTask"
  />
</template>
```

## Mejores Prácticas

1. **Gestión de Estado**: Usa un store (Pinia) para manejar tareas compartidas entre componentes
2. **Optimización**: Evita recrear el array de filas innecesariamente
3. **Validación**: Valida siempre los datos de tareas antes de pasarlos al componente

## Compatibilidad

- **Vue**: 3.x
- **vue-ganttastic**: 1.x
- **Navegadores**: Modernos (Chrome, Firefox, Safari, Edge)

## Contribuciones

Para contribuir al componente:

1. Mantén la compatibilidad con la API existente
2. Añade tests para nuevas funcionalidades
3. Actualiza la documentación
4. Sigue las convenciones de código del proyecto

