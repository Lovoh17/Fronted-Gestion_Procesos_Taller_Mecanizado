import { ref, computed, onMounted } from 'vue'
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
    const currentView = ref('calendar')

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

    // Sistema de Alertas
    const alerts = ref([
      {
        id: 'overload_1',
        type: 'critical',
        icon: 'fas fa-exclamation-triangle',
        message: 'Línea de Producción A sobrecargada (>80%) - Ver recomendaciones',
        actionButton: 'Ver Recomendaciones'
      },
      {
        id: 'maintenance_due',
        type: 'warning',
        icon: 'fas fa-wrench',
        message: 'Mantenimiento preventivo programado para mañana en Línea B',
        actionButton: null
      },
      {
        id: 'staff_shortage',
        type: 'urgent',
        icon: 'fas fa-users',
        message: 'Centro de Logística requiere contratación - Personal insuficiente',
        actionButton: 'Solicitar Personal'
      }
    ])

    // Capacidades máximas por departamento (horas por día)
    const departmentCapacities = ref({
      'Línea de Producción A': 16, // 2 turnos de 8 horas
      'Línea de Producción B': 16,
      'Centro de Logística': 12, // 1.5 turnos
      'Planificación y Mejoras': 8, // 1 turno
      'Administración': 8
    })

    // Códigos de color para carga de trabajo
    const workloadColors = {
      free: '#22c55e',      // Verde - Libre (0-20%)
      light: '#84cc16',     // Verde claro (20-40%)
      moderate: '#eab308',  // Amarillo (40-60%) 
      heavy: '#f97316',     // Naranja (60-80%)
      critical: '#ef4444',  // Rojo (80-100%)
      overloaded: '#8b5cf6' // Morado - Requiere contratación (>100%)
    }

    // Tipos unificados para ambas vistas
    const activityTypes = ref([
      { value: 'production', label: 'Producción', color: '#3b82f6', calendarColor: '#3b82f6' },
      { value: 'maintenance', label: 'Mantenimiento', color: '#f59e0b', calendarColor: '#f59e0b' },
      { value: 'quality', label: 'Control de Calidad', color: '#10b981', calendarColor: '#10b981' },
      { value: 'logistics', label: 'Logística', color: '#8b5cf6', calendarColor: '#8b5cf6' },
      { value: 'planning', label: 'Planificación', color: '#06b6d4', calendarColor: '#06b6d4' },
      { value: 'assembly', label: 'Ensamblaje', color: '#ef4444', calendarColor: '#ef4444' },
      { value: 'meeting', label: 'Reunión', color: '#6b7280', calendarColor: '#6b7280' }
    ])

    // Tipos de eventos para compatibilidad con FullCalendar
    const eventTypes = computed(() => activityTypes.value)
    
    // Tipos de tareas para compatibilidad con GanttChart
    const taskTypes = computed(() => activityTypes.value)

    // Estructura de datos unificada con estimaciones de horas
    const productionActivities = ref([
      {
        id: 'prod1',
        title: 'Fabricación Pieza X1',
        start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        end: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().split('T')[0],
        type: 'production',
        progress: 0.8,
        status: 'in-progress',
        assignee: 'Equipo A - Turno Mañana',
        department: 'Línea de Producción A',
        description: 'Fabricación de 1000 unidades de la pieza X1 para el proyecto Delta',
        location: 'Línea A - Sector 1',
        priority: 'high',
        estimatedHours: 64 // 8 horas por día durante 8 días
      },
      {
        id: 'maint1',
        title: 'Mantenimiento Preventivo Línea A',
        start: new Date(today.getFullYear(), today.getMonth(), 9).toISOString().split('T')[0] + 'T08:00:00',
        end: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0] + 'T17:00:00',
        type: 'maintenance',
        progress: 0.0,
        status: 'not-started',
        assignee: 'Equipo Mantenimiento',
        department: 'Línea de Producción A',
        description: 'Mantenimiento preventivo mensual de la línea A',
        location: 'Línea A - Completa',
        priority: 'medium',
        estimatedHours: 16
      },
      {
        id: 'prod2',
        title: 'Fabricación Pieza Y2',
        start: new Date(today.getFullYear(), today.getMonth(), 11).toISOString().split('T')[0],
        end: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0],
        type: 'production',
        progress: 0.0,
        status: 'not-started',
        assignee: 'Equipo A - Turno Tarde',
        department: 'Línea de Producción A',
        description: 'Fabricación de 750 unidades de la pieza Y2',
        location: 'Línea A - Sector 2',
        priority: 'medium',
        estimatedHours: 80
      },
      {
        id: 'log2',
        title: 'Distribución Interna',
        start: new Date(today.getFullYear(), today.getMonth(), 4).toISOString().split('T')[0],
        end: new Date(today.getFullYear(), today.getMonth(), 25).toISOString().split('T')[0],
        type: 'logistics',
        progress: 0.4,
        status: 'in-progress',
        assignee: 'Equipo Distribución',
        department: 'Centro de Logística',
        description: 'Distribución de materiales a líneas de producción',
        location: 'Toda la planta',
        priority: 'medium',
        estimatedHours: 168 // Sobrecarga del centro de logística
      }
    ])

    // Calcular carga de trabajo por departamento
    const calculateWorkload = (department, date) => {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const activitiesForDay = productionActivities.value.filter(activity => {
        if (activity.department !== department) return false
        
        const activityStart = new Date(activity.start)
        const activityEnd = new Date(activity.end)
        
        return activityStart <= dayEnd && activityEnd >= dayStart
      })

      const totalHoursUsed = activitiesForDay.reduce((sum, activity) => {
        const activityDays = Math.ceil((new Date(activity.end) - new Date(activity.start)) / (1000 * 60 * 60 * 24))
        return sum + (activity.estimatedHours / Math.max(activityDays, 1))
      }, 0)

      const capacity = departmentCapacities.value[department] || 8
      return Math.round((totalHoursUsed / capacity) * 100)
    }

    // Obtener color según porcentaje de carga
    const getWorkloadColor = (percentage) => {
      if (percentage <= 20) return workloadColors.free
      if (percentage <= 40) return workloadColors.light
      if (percentage <= 60) return workloadColors.moderate
      if (percentage <= 80) return workloadColors.heavy
      if (percentage <= 100) return workloadColors.critical
      return workloadColors.overloaded
    }

    // Obtener etiqueta de estado de carga
    const getWorkloadLabel = (percentage) => {
      if (percentage <= 20) return 'Libre'
      if (percentage <= 40) return 'Carga Ligera'
      if (percentage <= 60) return 'Carga Moderada'
      if (percentage <= 80) return 'Carga Pesada'
      if (percentage <= 100) return 'Crítico'
      return 'Requiere Contratación'
    }

    // Función para obtener color por carga de trabajo
    const getColorByType = (type, department = null, date = null) => {
      // Si estamos en vista Gantt y tenemos departamento, usar color por carga
      if (currentView.value === 'gantt' && department && date) {
        const workloadPercentage = calculateWorkload(department, date)
        return getWorkloadColor(workloadPercentage)
      }
      
      // Si no, usar color por tipo de actividad
      const typeConfig = activityTypes.value.find(t => t.value === type)
      return typeConfig ? typeConfig.color : '#6b7280'
    }

    // Verificar y actualizar alertas basadas en carga de trabajo
    const checkAndUpdateAlerts = () => {
      const newAlerts = []
      const today = new Date()

      // Verificar sobrecarga por departamento
      Object.keys(departmentCapacities.value).forEach(department => {
        const workloadPercentage = calculateWorkload(department, today)
        
        if (workloadPercentage > 100) {
          newAlerts.push({
            id: `overload_${department.toLowerCase().replace(/\s+/g, '_')}`,
            type: 'urgent',
            icon: 'fas fa-users-slash',
            message: `${department} requiere contratación - Sobrecarga del ${workloadPercentage}%`,
            actionButton: 'Solicitar Personal'
          })
        } else if (workloadPercentage > 80) {
          newAlerts.push({
            id: `heavy_load_${department.toLowerCase().replace(/\s+/g, '_')}`,
            type: 'critical',
            icon: 'fas fa-exclamation-triangle',
            message: `${department} sobrecargado (${workloadPercentage}%) - Ver recomendaciones`,
            actionButton: 'Ver Recomendaciones'
          })
        }
      })

      alerts.value = newAlerts
    }

    // Función utilitaria para eliminar actividad
    const deleteActivityFromUnified = (activityId) => {
      const index = productionActivities.value.findIndex(activity => activity.id === activityId)
      if (index !== -1) {
        productionActivities.value.splice(index, 1)
        console.log(`Actividad ${activityId} eliminada`)
        checkAndUpdateAlerts()
      }
    }

    // Función utilitaria para actualizar actividad
    const updateActivityInUnified = (activityId, updates) => {
      const index = productionActivities.value.findIndex(activity => activity.id === activityId)
      if (index !== -1) {
        productionActivities.value[index] = { ...productionActivities.value[index], ...updates }
        console.log(`Actividad ${activityId} actualizada`)
        checkAndUpdateAlerts()
      }
    }

    // Conversión a formato Calendar
    const events = computed(() => {
      return productionActivities.value.map(activity => {
        const color = getColorByType(activity.type, activity.department, activity.start)
        const workloadPercentage = calculateWorkload(activity.department, activity.start)

        return {
          id: activity.id,
          title: activity.title,
          start: activity.start,
          end: activity.end,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            description: activity.description,
            location: activity.location,
            status: activity.status,
            type: activity.type,
            priority: activity.priority,
            assignee: activity.assignee,
            department: activity.department,
            progress: activity.progress,
            estimatedHours: activity.estimatedHours,
            workloadPercentage,
            workloadLabel: getWorkloadLabel(workloadPercentage)
          }
        }
      })
    })

    // Conversión a formato Gantt con información de carga
    const ganttRows = computed(() => {
      const departments = ['Línea de Producción A', 'Línea de Producción B', 'Centro de Logística', 'Planificación y Mejoras', 'Administración']
      
      return departments.map(dept => {
        const workloadPercentage = calculateWorkload(dept, today)
        const workloadColor = getWorkloadColor(workloadPercentage)
        const workloadLabel = getWorkloadLabel(workloadPercentage)
        
        return {
          id: dept.toLowerCase().replace(/\s+/g, '_'),
          label: `${dept} (${workloadLabel} - ${workloadPercentage}%)`,
          workloadPercentage,
          workloadColor,
          bars: productionActivities.value
            .filter(activity => activity.department === dept)
            .map(activity => ({
              id: activity.id,
              label: activity.title,
              start: activity.start.split('T')[0],
              end: activity.end.split('T')[0],
              progress: activity.progress,
              status: activity.status,
              type: activity.type,
              assignee: activity.assignee,
              description: activity.description,
              color: getWorkloadColor(workloadPercentage)
            }))
        }
      }).filter(row => row.bars.length > 0)
    })

    // Handlers para alertas
    const dismissAlert = (alertId) => {
      alerts.value = alerts.value.filter(alert => alert.id !== alertId)
    }

    const handleAlertAction = (alert) => {
      if (alert.actionButton === 'Solicitar Personal' || alert.actionButton === 'Ver Recomendaciones') {
        openSolicitarEventualModal()
      }
    }

    // Handler para abrir modal de solicitud eventual
    const openSolicitarEventualModal = () => {
      console.log('Abriendo modal para solicitar personal eventual')
      
      // Determinar departamento más sobrecargado
      let mostOverloadedDept = ''
      let maxOverload = 0
      
      Object.keys(departmentCapacities.value).forEach(dept => {
        const workload = calculateWorkload(dept, today)
        if (workload > maxOverload) {
          maxOverload = workload
          mostOverloadedDept = dept
        }
      })
      
      const message = `Modal de Solicitud de Personal Eventual\n\nDepartamento más crítico: ${mostOverloadedDept} (${maxOverload}%)\n\nEsta funcionalidad abrirá un formulario para:\n- Especificar departamento sobrecargado\n- Definir período de contratación\n- Seleccionar perfil requerido\n- Justificar necesidad basada en carga de trabajo`
      
      alert(message)
    }

    // Event handlers
    const handleEventClick = (event) => {
      console.log('Evento clickeado:', event)
      const info = `Departamento: ${event.extendedProps.department}\nCarga actual: ${event.extendedProps.workloadPercentage}%\nEstado: ${event.extendedProps.workloadLabel}`
      console.log('Información de carga:', info)
    }

    const handleEventCreate = () => {
      console.log('Crear nuevo evento')
    }

    const handleEventEdit = (event) => {
      console.log('Editar evento:', event)
    }

    const handleEventDelete = (event) => {
      console.log('Eliminar evento:', event)
      deleteActivityFromUnified(event.id)
    }

    const handleDateClick = (dateInfo) => {
      console.log('Fecha clickeada:', dateInfo)
      const newActivity = {
        id: `activity_${Date.now()}`,
        title: 'Nueva Actividad de Producción',
        start: dateInfo.dateStr + 'T08:00:00',
        end: dateInfo.dateStr + 'T17:00:00',
        type: 'production',
        progress: 0.0,
        status: 'not-started',
        assignee: 'Sin asignar',
        department: 'Línea de Producción A',
        description: 'Nueva actividad creada desde calendario',
        location: 'Por definir',
        priority: 'medium',
        estimatedHours: 8
      }
      productionActivities.value.push(newActivity)
      checkAndUpdateAlerts()
    }

    const handleViewChange = (viewName) => {
      console.log('Vista cambiada a:', viewName)
      selectedView.value = viewName
    }

    // Gantt Event handlers
    const handleTaskClick = (task) => {
      console.log('Task clicked:', task)
    }

    const handleTaskCreate = (data) => {
      console.log('Task create:', data)
      const newActivity = {
        id: `task_${Date.now()}`,
        title: 'Nueva Tarea de Producción',
        start: data.time ? data.time.toISOString().split('T')[0] + 'T08:00:00' : chartStart.value + 'T08:00:00',
        end: data.time ? new Date(data.time.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T17:00:00' : chartEnd.value + 'T17:00:00',
        type: 'production',
        progress: 0.0,
        status: 'not-started',
        assignee: 'Sin asignar',
        department: 'Línea de Producción A',
        description: 'Nueva tarea de producción creada desde el diagrama de Gantt',
        location: 'Por definir',
        priority: 'medium',
        estimatedHours: 56
      }
      productionActivities.value.push(newActivity)
      checkAndUpdateAlerts()
    }

    const handleTaskEdit = (task) => {
      console.log('Task edit:', task)
    }

    const handleTaskDelete = (task) => {
      console.log('Task delete:', task)
      deleteActivityFromUnified(task.id)
    }

    const handleTaskDrop = ({ bar, event }) => {
      console.log('Task dropped:', bar, event)
      if (bar && bar.id) {
        const updates = {
          start: bar.start + 'T08:00:00',
          end: bar.end + 'T17:00:00'
        }
        updateActivityInUnified(bar.id, updates)
      }
    }

    const handleTimeUnitChange = (unit) => {
      console.log('Time unit changed:', unit)
      precision.value = unit
    }

    const switchView = (view) => {
      console.log(`Cambiando a vista: ${view}`)
      currentView.value = view
    }

    const loadEventsFromAPI = async () => {
      try {
        isLoading.value = true
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('Eventos cargados desde API')
      } catch (error) {
        console.error('Error al cargar eventos:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Lifecycle
    onMounted(() => {
      loadEventsFromAPI()
      checkAndUpdateAlerts()
    })

    return {
      // Vista actual
      currentView,
      switchView,

      // Sistema de alertas
      alerts,
      dismissAlert,
      handleAlertAction,
      openSolicitarEventualModal,

      // Carga de trabajo
      calculateWorkload,
      getWorkloadColor,
      getWorkloadLabel,
      workloadColors,

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