<template>
  <div class="">
    <Sidebar :role="'coordinator'" />

    <!-- Header principal fuera del contenedor del calendario -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Planificación de Producción</h1>
            <p class="header-subtitle">Gestiona la producción con vista de calendario y diagrama de Gantt</p>
          </div>
        </div>
        
        <!-- Selector de vista -->
        <div class="view-selector-tabs">
          <button 
            :class="['tab-btn', { active: currentView === 'calendar' }]"
            @click="switchView('calendar')"
          >
            <i class="fas fa-calendar"></i>
            <span>Calendario</span>
          </button>
          <button 
            :class="['tab-btn', { active: currentView === 'gantt' }]"
            @click="switchView('gantt')"
          >
            <i class="fas fa-chart-gantt"></i>
            <span>Gantt</span>
          </button>
        </div>
      </div>
    </div>

    <main class="">
      <!-- Vista de Calendario -->
      <div v-show="currentView === 'calendar'" class="calendar-view">
        <div class="calendario-container">
          <FullCalendarComponent 
            :title="calendarTitle" 
            :events="events" 
            :initial-view="selectedView"
            :can-create-events="true" 
            :can-edit-events="true" 
            :can-delete-events="true" 
            :show-controls="true"
            :event-types="eventTypes" 
            :loading="isLoading" 
            height="600px" 
            @event-click="handleEventClick"
            @event-create="handleEventCreate" 
            @event-edit="handleEventEdit" 
            @event-delete="handleEventDelete"
            @date-click="handleDateClick" 
            @view-change="handleViewChange" 
          />
        </div>
      </div>

      <!-- Vista de Gantt -->
      <div v-show="currentView === 'gantt'" class="gantt-view">
        <div class="gantt-container">
          <GanttChartComponent 
            :title="ganttTitle" 
            :rows="ganttRows" 
            :chart-start="chartStart" 
            :chart-end="chartEnd"
            :precision="precision" 
            :can-create-tasks="canCreateTasks" 
            :can-edit-tasks="canEditTasks"
            :can-delete-tasks="canDeleteTasks" 
            :show-controls="showControls" 
            :task-types="taskTypes" 
            :loading="ganttLoading"
            :show-current-time="showCurrentTime" 
            @task-click="handleTaskClick" 
            @task-create="handleTaskCreate"
            @task-edit="handleTaskEdit" 
            @task-delete="handleTaskDelete" 
            @task-drop="handleTaskDrop"
            @time-unit-change="handleTimeUnitChange" 
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style src="src/assets/EstiloBase.css" scoped></style>

<style scoped>
/* Estilos para el selector de vista */
.view-selector-tabs {
  display: flex;
  background: var(--gray-light);
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--univo-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: var(--univo-primary);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn i {
  font-size: 1.1rem;
}

/* Estilos para las vistas */
.calendar-view,
.gantt-view {
  width: 100%;
  min-height: 600px;
}

.calendario-container,
.gantt-container {
  margin: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Responsive design para tablets */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .view-selector-tabs {
    order: -1;
    justify-content: center;
    width: 100%;
    max-width: 400px;
  }
  
  .tab-btn {
    flex: 1;
    justify-content: center;
  }
}

/* Responsive design para móviles */
@media (max-width: 480px) {
  .tab-btn span {
    display: none;
  }
  
  .tab-btn {
    padding: 0.75rem;
    min-width: 48px;
  }
  
  .calendario-container,
  .gantt-container {
    margin: 0.5rem;
  }
}

/* Animaciones de transición */
.calendar-view,
.gantt-view {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>

<script>
import { ref, onMounted } from 'vue'
import FullCalendarComponent from '@/components/GlobalComponents/FullCalendarComponent.vue'
import GanttChartComponent from '@/components/GlobalComponents/GanttChartComponent.vue'

export default {
  name: 'ProductionPlanning',
  components: {
    FullCalendarComponent,
    GanttChartComponent
  },
  setup() {
    // Estado de vista actual
    const currentView = ref('calendar') // 'calendar' o 'gantt'

    // Estados reactivos para Calendar
    const calendarTitle = ref('Calendario de Producción')
    const selectedView = ref('dayGridMonth')
    const isLoading = ref(false)

    // Estados reactivos para Gantt
    const ganttTitle = ref('Diagrama de Gantt - Producción')
    const ganttLoading = ref(false)
    const canCreateTasks = ref(true)
    const canEditTasks = ref(true)
    const canDeleteTasks = ref(true)
    const showControls = ref(true)
    const showCurrentTime = ref(true)
    const precision = ref('day')
    
    // Configuración de fechas para Gantt
    const today = new Date()
    const chartStart = ref(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0])
    const chartEnd = ref(new Date(today.getFullYear(), today.getMonth() + 3, 0).toISOString().split('T')[0])

    // Tipos de eventos para el filtro (Calendar)
    const eventTypes = ref([
      { value: 'meeting', label: 'Reuniones' },
      { value: 'task', label: 'Tareas' },
      { value: 'personal', label: 'Personal' },
      { value: 'holiday', label: 'Vacaciones' }
    ])

    // Tipos de tareas para el Gantt
    const taskTypes = ref([
      { value: 'production', label: 'Producción' },
      { value: 'maintenance', label: 'Mantenimiento' },
      { value: 'quality', label: 'Control de Calidad' },
      { value: 'logistics', label: 'Logística' },
      { value: 'planning', label: 'Planificación' },
      { value: 'assembly', label: 'Ensamblaje' }
    ])

    // Datos del Gantt - Producción
    const ganttRows = ref([
      {
        id: 'row1',
        label: 'Línea de Producción A',
        bars: [
          {
            id: 'prod1',
            label: 'Fabricación Pieza X1',
            start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().split('T')[0],
            progress: 0.8,
            status: 'in-progress',
            type: 'production',
            assignee: 'Equipo A - Turno Mañana',
            description: 'Fabricación de 1000 unidades de la pieza X1 para el proyecto Delta'
          },
          {
            id: 'maint1',
            label: 'Mantenimiento Preventivo',
            start: new Date(today.getFullYear(), today.getMonth(), 9).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'maintenance',
            assignee: 'Equipo Mantenimiento',
            description: 'Mantenimiento preventivo mensual de la línea A'
          },
          {
            id: 'prod2',
            label: 'Fabricación Pieza Y2',
            start: new Date(today.getFullYear(), today.getMonth(), 11).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'production',
            assignee: 'Equipo A - Turno Tarde',
            description: 'Fabricación de 750 unidades de la pieza Y2'
          }
        ]
      },
      {
        id: 'row2',
        label: 'Línea de Producción B',
        bars: [
          {
            id: 'prod3',
            label: 'Ensamblaje Producto Z',
            start: new Date(today.getFullYear(), today.getMonth(), 2).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0],
            progress: 0.6,
            status: 'in-progress',
            type: 'assembly',
            assignee: 'Equipo B - Ensamblaje',
            description: 'Ensamblaje de 500 unidades del producto Z'
          },
          {
            id: 'quality1',
            label: 'Control de Calidad',
            start: new Date(today.getFullYear(), today.getMonth(), 16).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 18).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'quality',
            assignee: 'Inspector QC-1',
            description: 'Inspección de calidad del lote de producto Z'
          }
        ]
      },
      {
        id: 'row3',
        label: 'Centro de Logística',
        bars: [
          {
            id: 'log1',
            label: 'Recepción Materiales',
            start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 3).toISOString().split('T')[0],
            progress: 1.0,
            status: 'completed',
            type: 'logistics',
            assignee: 'Equipo Almacén',
            description: 'Recepción y clasificación de materias primas'
          },
          {
            id: 'log2',
            label: 'Distribución Interna',
            start: new Date(today.getFullYear(), today.getMonth(), 4).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 25).toISOString().split('T')[0],
            progress: 0.4,
            status: 'in-progress',
            type: 'logistics',
            assignee: 'Equipo Distribución',
            description: 'Distribución de materiales a líneas de producción'
          },
          {
            id: 'log3',
            label: 'Envío Productos',
            start: new Date(today.getFullYear(), today.getMonth(), 22).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 28).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'logistics',
            assignee: 'Equipo Envíos',
            description: 'Preparación y envío de productos terminados'
          }
        ]
      },
      {
        id: 'row4',
        label: 'Planificación y Mejoras',
        bars: [
          {
            id: 'plan1',
            label: 'Análisis de Eficiencia',
            start: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0],
            progress: 0.3,
            status: 'in-progress',
            type: 'planning',
            assignee: 'Ingeniero Industrial',
            description: 'Análisis de eficiencia de procesos productivos'
          },
          {
            id: 'plan2',
            label: 'Implementación Mejoras',
            start: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0],
            end: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString().split('T')[0],
            progress: 0.0,
            status: 'not-started',
            type: 'planning',
            assignee: 'Equipo Mejora Continua',
            description: 'Implementación de mejoras propuestas en el análisis'
          }
        ]
      }
    ])

    // Eventos del calendario
    const events = ref([
      {
        id: '1',
        title: 'Reunión de equipo',
        start: '2025-08-12T10:00:00',
        end: '2025-08-12T11:00:00',
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        extendedProps: {
          description: 'Reunión semanal del equipo de desarrollo',
          location: 'Sala de conferencias A',
          status: 'pending',
          type: 'meeting',
          priority: 'high'
        }
      },
      {
        id: '2',
        title: 'Completar proyecto X',
        start: '2025-08-13',
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        extendedProps: {
          description: 'Finalizar la implementación del proyecto X',
          status: 'in-progress',
          type: 'task',
          priority: 'medium'
        }
      },
      {
        id: '3',
        title: 'Cita médica',
        start: '2025-08-15T15:30:00',
        end: '2025-08-15T16:30:00',
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        extendedProps: {
          description: 'Consulta médica anual',
          location: 'Hospital Central',
          status: 'pending',
          type: 'personal',
          priority: 'high'
        }
      }
    ])

    // Event handlers
    const handleEventClick = (event) => {
      console.log('Evento clickeado:', event)
      // Aquí puedes manejar el click del evento
      // Por ejemplo, abrir un modal personalizado o navegar a otra página
    }

    const handleEventCreate = () => {
      console.log('Crear nuevo evento')
      // Aquí puedes abrir un formulario para crear eventos
      // Por ejemplo:
      // router.push('/eventos/crear')
      // o abrir un modal
    }

    const handleEventEdit = (event) => {
      console.log('Editar evento:', event)
      // Aquí puedes abrir un formulario de edición
      // Por ejemplo:
      // router.push(`/eventos/editar/${event.id}`)
    }

    const handleEventDelete = (event) => {
      console.log('Eliminar evento:', event)
      // Aquí puedes hacer la llamada a la API para eliminar
      deleteEventFromAPI(event.id)
    }

    const handleDateClick = (dateInfo) => {
      console.log('Fecha clickeada:', dateInfo)
      // Aquí puedes crear un evento en la fecha seleccionada
      const newEvent = {
        id: Date.now().toString(),
        title: 'Nuevo evento',
        start: dateInfo.dateStr,
        backgroundColor: '#6b7280',
        borderColor: '#6b7280',
        extendedProps: {
          status: 'pending',
          type: 'task'
        }
      }
      events.value.push(newEvent)
    }

    const handleViewChange = (viewName) => {
      console.log('Vista cambiada a:', viewName)
      selectedView.value = viewName
    }

    // Métodos para API (ejemplos)
    const deleteEventFromAPI = async (eventId) => {
      try {
        isLoading.value = true
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Eliminar del array local
        events.value = events.value.filter(event => event.id !== eventId)

        console.log(`Evento ${eventId} eliminado correctamente`)
      } catch (error) {
        console.error('Error al eliminar evento:', error)
      } finally {
        isLoading.value = false
      }
    }

    const loadEventsFromAPI = async () => {
      try {
        isLoading.value = true
        // Simular carga de eventos desde API
        await new Promise(resolve => setTimeout(resolve, 1500))

        // En una aplicación real, aquí harías:
        // const response = await api.get('/eventos')
        // events.value = response.data

        console.log('Eventos cargados desde API')
      } catch (error) {
        console.error('Error al cargar eventos:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Gantt Event handlers
    const handleTaskClick = (task) => {
      console.log('Task clicked:', task)
      // Aquí puedes abrir un modal con detalles de la tarea de producción
    }

    const handleTaskCreate = (data) => {
      console.log('Task create:', data)
      // Lógica para crear nueva tarea de producción
      const newTask = {
        id: `task_${Date.now()}`,
        label: 'Nueva Tarea de Producción',
        start: data.time ? data.time.toISOString().split('T')[0] : chartStart.value,
        end: data.time ? new Date(data.time.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : chartEnd.value,
        progress: 0.0,
        status: 'not-started',
        type: 'production',
        assignee: 'Sin asignar',
        description: 'Nueva tarea de producción creada desde el diagrama'
      }

      // Agregar a la primera fila disponible
      if (ganttRows.value.length > 0) {
        ganttRows.value[0].bars.push(newTask)
      }
    }

    const handleTaskEdit = (task) => {
      console.log('Task edit:', task)
      // Aquí podrías abrir un modal de edición para la tarea
    }

    const handleTaskDelete = (task) => {
      console.log('Task delete:', task)
      // Buscar y eliminar la tarea de producción de las filas
      ganttRows.value.forEach(row => {
        row.bars = row.bars.filter(bar => bar.id !== task.id)
      })
    }

    const handleTaskDrop = ({ bar, event }) => {
      console.log('Task dropped:', bar, event)
      // Lógica para manejar el drop de tareas de producción
    }

    const handleTimeUnitChange = (unit) => {
      console.log('Time unit changed:', unit)
      precision.value = unit
    }

    // Método para cambiar de vista
    const switchView = (view) => {
      console.log(`Cambiando a vista: ${view}`)
      currentView.value = view
    }

    // Lifecycle
    onMounted(() => {
      // Cargar eventos al montar el componente
      loadEventsFromAPI()
    })

    return {
      // Vista actual
      currentView,
      switchView,
      
      // Calendar
      calendarTitle,
      selectedView,
      isLoading,
      eventTypes,
      events,
      handleEventClick,
      handleEventCreate,
      handleEventEdit,
      handleEventDelete,
      handleDateClick,
      handleViewChange,
      
      // Gantt
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
      ganttLoading,
      showCurrentTime,
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
