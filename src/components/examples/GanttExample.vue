<template>
  <!-- Header principal fuera del contenedor del calendario -->
  <div class="header-section">
    <div class="header-content">
      <div class="header-info">
        <div class="header-icon">
          <i class="fas fa-boxes-stacked"></i>
        </div>
        <div class="header-text">
          <h1 class="header-title">Calendario Gantt de producción</h1>
          <p class="header-subtitle">Calendario Gantt para la gestión de proyectos</p>
        </div>
      </div>
    </div>
    <br>

  <!-- Gantt Chart Component -->
  <GanttChartComponent :title="ganttTitle" :rows="ganttRows" :chart-start="chartStart" :chart-end="chartEnd"
    :precision="precision" :can-create-tasks="canCreateTasks" :can-edit-tasks="canEditTasks"
    :can-delete-tasks="canDeleteTasks" :show-controls="showControls" :task-types="taskTypes" :loading="loading"
    :show-current-time="showCurrentTime" @task-click="handleTaskClick" @task-create="handleTaskCreate"
    @task-edit="handleTaskEdit" @task-delete="handleTaskDelete" @task-drop="handleTaskDrop"
    @time-unit-change="handleTimeUnitChange" />

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import GanttChartComponent from '@/components/GlobalComponents/GanttChartComponent.vue'

export default {
  name: 'GanttExample',
  components: {
    GanttChartComponent
  },

  setup() {
    // Estados reactivos
    const ganttTitle = ref('Proyecto de Desarrollo de Software')
    const loading = ref(false)
    const canCreateTasks = ref(true)
    const canEditTasks = ref(true)
    const canDeleteTasks = ref(true)
    const showControls = ref(true)
    const showCurrentTime = ref(true)
    const precision = ref('day')

    // Configuración de fechas
    const today = new Date()
    const chartStart = ref(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0])
    const chartEnd = ref(new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString().split('T')[0])

    // Tipos de tareas
    const taskTypes = ref([
      { value: 'planning', label: 'Planificación' },
      { value: 'development', label: 'Desarrollo' },
      { value: 'testing', label: 'Pruebas' },
      { value: 'design', label: 'Diseño' },
      { value: 'deployment', label: 'Despliegue' },
      { value: 'maintenance', label: 'Mantenimiento' }
    ])

    // Datos iniciales del Gantt
    const ganttRows = ref([
      {
        id: 'row1',
        label: 'Frontend Development',
        bars: [
          {
            id: 'task1',
            label: 'Configuración inicial',
            start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0],
            progress: 1.0,
            status: 'completed',
            type: 'planning',
            assignee: 'Juan Pérez',
            description: 'Configuración del entorno de desarrollo y herramientas iniciales',
            ganttBarConfig: {
              id: 'task1',
              hasHandles: true,
              immobile: false,
              bundle: 'frontend'
            }
          },
          {
            id: 'task2',
            label: 'Desarrollo de componentes',
            start: new Date(today.getFullYear(), today.getMonth(), 6).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0],
            progress: 0.6,
            status: 'in-progress',
            type: 'development',
            assignee: 'María García',
            description: 'Desarrollo de componentes principales de la interfaz de usuario'
          },
          {
            id: 'task3',
            label: 'Integración con API',
            start: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 25).toISOString().split('T')[0],
            progress: 0.3,
            status: 'in-progress',
            type: 'development',
            assignee: 'Carlos López',
            description: 'Integración del frontend con los servicios de backend'
          }
        ]
      },
      {
        id: 'row2',
        label: 'Backend Development',
        bars: [
          {
            id: 'task4',
            label: 'API Design',
            start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().split('T')[0],
            progress: 1.0,
            status: 'completed',
            type: 'design',
            assignee: 'Ana Rodríguez',
            description: 'Diseño de la arquitectura y endpoints de la API'
          },
          {
            id: 'task5',
            label: 'Database Setup',
            start: new Date(today.getFullYear(), today.getMonth(), 9).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0],
            progress: 0.8,
            status: 'in-progress',
            type: 'development',
            assignee: 'Pedro Martínez',
            description: 'Configuración y setup de la base de datos'
          },
          {
            id: 'task6',
            label: 'API Implementation',
            start: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 30).toISOString().split('T')[0],
            progress: 0.4,
            status: 'in-progress',
            type: 'development',
            assignee: 'Luis Hernández',
            description: 'Implementación de los endpoints y lógica de negocio'
          }
        ]
      },
      {
        id: 'row3',
        label: 'Testing & QA',
        bars: [
          {
            id: 'task7',
            label: 'Unit Testing',
            start: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth() + 1, 5).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'testing',
            assignee: 'Elena Sánchez',
            description: 'Creación y ejecución de pruebas unitarias'
          },
          {
            id: 'task8',
            label: 'Integration Testing',
            start: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth() + 1, 10).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'testing',
            assignee: 'Roberto Torres',
            description: 'Pruebas de integración entre componentes'
          }
        ]
      },
      {
        id: 'row4',
        label: 'Deployment',
        bars: [
          {
            id: 'task9',
            label: 'Production Setup',
            start: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth() + 1, 20).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'deployment',
            assignee: 'Diego Morales',
            description: 'Configuración del entorno de producción'
          },
          {
            id: 'task10',
            label: 'Launch',
            start: new Date(today.getFullYear(), today.getMonth() + 1, 25).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth() + 1, 28).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'deployment',
            assignee: 'Todo el equipo',
            description: 'Lanzamiento oficial del producto'
          }
        ]
      }
    ])

    // Event handlers
    const handleTaskClick = (task) => {
      console.log('Task clicked:', task)
    }

    const handleTaskCreate = (data) => {
      console.log('Task create:', data)
      // Lógica para crear nueva tarea
      const newTask = {
        id: `task_${Date.now()}`,
        label: 'Nueva Tarea',
        start: data.time ? data.time.toISOString().split('T')[0] : chartStart.value,
        end: data.time ? new Date(data.time.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : chartEnd.value,
        progress: 0.0,
        status: 'not-started',
        type: 'development',
        assignee: 'Sin asignar',
        description: 'Nueva tarea creada desde el diagrama'
      }

      // Agregar a la primera fila disponible o crear una nueva
      if (ganttRows.value.length > 0) {
        ganttRows.value[0].bars.push(newTask)
      }
    }

    const handleTaskEdit = (task) => {
      console.log('Task edit:', task)
      // Aquí podrías abrir un modal de edición
    }

    const handleTaskDelete = (task) => {
      console.log('Task delete:', task)
      // Buscar y eliminar la tarea de las filas
      ganttRows.value.forEach(row => {
        row.bars = row.bars.filter(bar => bar.id !== task.id)
      })
    }

    const handleTaskDrop = ({ bar, event }) => {
      console.log('Task dropped:', bar, event)
      // Lógica para manejar el drop de tareas
    }

    const handleTimeUnitChange = (unit) => {
      console.log('Time unit changed:', unit)
      precision.value = unit
    }

    return {
      ganttTitle,
      ganttRows,
      chartStart,
      chartEnd,
      precision,
      canCreateTasks,
      canEditTasks,
      canDeleteTasks,
      showControls,
      taskTypes,
      loading,
      showCurrentTime,

      // Event handlers
      handleTaskClick,
      handleTaskCreate,
      handleTaskEdit,
      handleTaskDelete,
      handleTaskDrop,
      handleTimeUnitChange
    }
  }
}
</script>

<style scoped>
.gantt-example {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.example-header {
  text-align: center;
  margin-bottom: 2rem;
}

.example-header h1 {
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.example-header p {
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive design */
@media (max-width: 768px) {
  .gantt-example {
    padding: 1rem;
  }

  .example-header h1 {
    font-size: 2rem;
  }
}
</style>
<style src="src/assets/EstiloBase.css" scoped></style>