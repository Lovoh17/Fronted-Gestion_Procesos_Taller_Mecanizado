import { ref, computed, onMounted, nextTick } from 'vue'

export default {
  name: 'GanttChartComponent',
  props: {
    title: {
      type: String,
      default: 'Diagrama de Gantt'
    },
    rows: {
      type: Array,
      default: () => []
    },
    chartStart: {
      type: String,
      required: true
    },
    chartEnd: {
      type: String,
      required: true
    },
    precision: {
      type: String,
      default: 'day'
    },
    canCreateTasks: {
      type: Boolean,
      default: false
    },
    canEditTasks: {
      type: Boolean,
      default: false
    },
    canDeleteTasks: {
      type: Boolean,
      default: false
    },
    showControls: {
      type: Boolean,
      default: true
    },
    taskTypes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showCurrentTime: {
      type: Boolean,
      default: true
    }
  },
  
  emits: [
    'task-click',
    'task-create',
    'task-edit',
    'task-delete',
    'task-drop',
    'time-unit-change'
  ],
  
  setup(props, { emit }) {
    // Estados reactivos
    const currentTimeUnit = ref(props.precision || 'day')
    const selectedTaskType = ref('')
    const showTaskModal = ref(false)
    const selectedTask = ref(null)
    const zoomLevel = ref(1)
    const timelineContainer = ref(null)
    const isDragging = ref(false)
    const isResizing = ref(false)
    const draggedBar = ref(null)
    
    // Escalas de tiempo disponibles
    const availableScales = computed(() => [
      { value: 'day', label: 'Días', icon: 'fas fa-calendar-day' },
      { value: 'week', label: 'Semanas', icon: 'fas fa-calendar-week' },
      { value: 'month', label: 'Meses', icon: 'fas fa-calendar-alt' }
    ])
    
    // Configuraciones del Gantt
    const rowHeight = computed(() => Math.max(40, 40 * zoomLevel.value))
    const periodWidth = computed(() => {
      const baseWidth = {
        day: 40,
        week: 80,
        month: 120
      }
      return baseWidth[currentTimeUnit.value] * zoomLevel.value
    })
    
    // Timeline periods
    const timelinePeriods = computed(() => {
      const start = new Date(props.chartStart)
      const end = new Date(props.chartEnd)
      const periods = []
      
      const current = new Date(start)
      
      while (current <= end) {
        periods.push(new Date(current))
        
        switch (currentTimeUnit.value) {
          case 'day':
            current.setDate(current.getDate() + 1)
            break
          case 'week':
            current.setDate(current.getDate() + 7)
            break
          case 'month':
            current.setMonth(current.getMonth() + 1)
            break
        }
      }
      
      return periods
    })
    
    // Current time position
    const currentTimePosition = computed(() => {
      const now = new Date()
      const start = new Date(props.chartStart)
      
      if (now < start || now > new Date(props.chartEnd)) return -1
      
      const diffTime = now - start
      const totalTime = new Date(props.chartEnd) - start
      const progress = diffTime / totalTime
      
      return progress * (timelinePeriods.value.length * periodWidth.value)
    })
    
    // Filas filtradas
    const filteredRows = computed(() => {
      if (!selectedTaskType.value) return props.rows
      
      return props.rows.map(row => ({
        ...row,
        bars: row.bars.filter(bar => 
          bar.type === selectedTaskType.value || !bar.type
        )
      })).filter(row => row.bars.length > 0)
    })
    
    // Métodos de utilidad
    const formatTimelinePeriod = (date) => {
      switch (currentTimeUnit.value) {
        case 'day':
          return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        case 'week':
          const weekEnd = new Date(date)
          weekEnd.setDate(weekEnd.getDate() + 6)
          return `${date.getDate()}/${date.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
        case 'month':
          return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        default:
          return date.toLocaleDateString('es-ES')
      }
    }
    
    const getBarStyle = (bar) => {
      const startDate = new Date(bar.start)
      const endDate = new Date(bar.end)
      const chartStartDate = new Date(props.chartStart)
      
      // Calcular posición
      const startDiff = startDate - chartStartDate
      const duration = endDate - startDate
      
      const msPerPeriod = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000 // Aproximado
      }
      
      const startPosition = (startDiff / msPerPeriod[currentTimeUnit.value]) * periodWidth.value
      const width = (duration / msPerPeriod[currentTimeUnit.value]) * periodWidth.value
      
      return {
        left: Math.max(0, startPosition) + 'px',
        width: Math.max(20, width) + 'px',
        height: (rowHeight.value - 8) + 'px',
        top: '4px'
      }
    }
    
    const getBarTooltip = (bar) => {
      return `${bar.label}\nInicio: ${formatDate(bar.start)}\nFin: ${formatDate(bar.end)}`
    }
    
    // Event handlers
    const handleBarClick = (bar, event) => {
      if (isDragging.value || isResizing.value) return
      
      selectedTask.value = bar
      showTaskModal.value = true
      emit('task-click', bar)
    }
    
    const handleBarMouseEnter = (bar, event) => {
      // Mostrar tooltip o cambiar estado visual
    }
    
    const handleBarMouseLeave = (bar, event) => {
      // Ocultar tooltip o restaurar estado visual
    }
    
    const handleBarDrop = (bar, event) => {
      emit('task-drop', { bar, event })
    }
    
    const handleTimelineClick = (event) => {
      if (!props.canCreateTasks) return
      
      // Lógica para crear tarea en la posición clickeada
      emit('task-create', {
        position: event.offsetX,
        time: calculateTimeFromPosition(event.offsetX)
      })
    }
    
    const calculateTimeFromPosition = (x) => {
      const periodIndex = Math.floor(x / periodWidth.value)
      if (periodIndex >= 0 && periodIndex < timelinePeriods.value.length) {
        return timelinePeriods.value[periodIndex]
      }
      return new Date()
    }
    
    // Drag & Drop
    const startDrag = (bar, event) => {
      if (!props.canEditTasks) return
      
      isDragging.value = true
      draggedBar.value = bar
      
      const handleMouseMove = (e) => {
        // Lógica de arrastre
      }
      
      const handleMouseUp = () => {
        isDragging.value = false
        draggedBar.value = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    const startResize = (bar, handle, event) => {
      if (!props.canEditTasks) return
      
      isResizing.value = true
      // Lógica de redimensionamiento
    }
    
    // Navigation methods
    const goToPrevious = () => {
      console.log('Navigate to previous period')
    }
    
    const goToNext = () => {
      console.log('Navigate to next period')
    }
    
    const goToToday = () => {
      console.log('Navigate to today')
    }
    
    const changeTimeUnit = (unit) => {
      currentTimeUnit.value = unit
      emit('time-unit-change', unit)
    }
    
    const zoomIn = () => {
      if (zoomLevel.value < 2) {
        zoomLevel.value += 0.2
      }
    }
    
    const zoomOut = () => {
      if (zoomLevel.value > 0.6) {
        zoomLevel.value -= 0.2
      }
    }
    
    const filterTasks = () => {
      // Las tareas se filtran automáticamente a través del computed
    }
    
    // Modal methods
    const closeTaskModal = () => {
      showTaskModal.value = false
      selectedTask.value = null
    }
    
    const createTask = () => {
      emit('task-create')
    }
    
    const editTask = (task) => {
      emit('task-edit', task)
      closeTaskModal()
    }
    
    const deleteTask = (task) => {
      if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
        emit('task-delete', task)
        closeTaskModal()
      }
    }
    
    // Utility methods
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const calculateDuration = (start, end) => {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    
    const getStatusLabel = (status) => {
      const statusLabels = {
        'not-started': 'No Iniciado',
        'in-progress': 'En Progreso',
        'completed': 'Completado',
        'on-hold': 'En Espera',
        'cancelled': 'Cancelado'
      }
      return statusLabels[status] || status
    }
    
    return {
      // Estados
      currentTimeUnit,
      selectedTaskType,
      showTaskModal,
      selectedTask,
      zoomLevel,
      timelineContainer,
      
      // Propiedades para vue-ganttastic
      barStart: 'start',
      barEnd: 'end',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      grid: true,
      pushOnOverlap: false,
      noOverlap: false,
      
      // Computados
      availableScales,
      filteredRows,
      rowHeight,
      periodWidth,
      timelinePeriods,
      currentTimePosition,
      
      // Métodos
      formatTimelinePeriod,
      getBarStyle,
      getBarTooltip,
      handleBarClick,
      handleBarMouseEnter,
      handleBarMouseLeave,
      handleBarDrop,
      handleTimelineClick,
      startDrag,
      startResize,
      goToPrevious,
      goToNext,
      goToToday,
      changeTimeUnit,
      zoomIn,
      zoomOut,
      filterTasks,
      closeTaskModal,
      createTask,
      editTask,
      deleteTask,
      formatDate,
      calculateDuration,
      getStatusLabel
    }
  }
}