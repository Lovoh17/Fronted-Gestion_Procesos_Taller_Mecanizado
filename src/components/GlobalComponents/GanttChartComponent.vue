<template>
  <div class="gantt-chart-container">
    <!-- Header personalizado -->
    <div class="gantt-header">
      <div class="header-left">
        <div class="gantt-title">
          <i class="fas fa-tasks"></i>
          <h2>{{ title || 'Diagrama de Gantt' }}</h2>
        </div>
        
        <div class="view-selector">
          <button 
            v-for="scale in availableScales" 
            :key="scale.value"
            :class="['view-btn', { active: currentTimeUnit === scale.value }]"
            @click="changeTimeUnit(scale.value)"
          >
            <i :class="scale.icon"></i>
            <span>{{ scale.label }}</span>
          </button>
        </div>
      </div>
      
      <div class="header-controls">
        <div class="navigation-controls">
          <button class="nav-btn" @click="goToPrevious" title="Anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="nav-btn today-btn" @click="goToToday">
            Hoy
          </button>
          <button class="nav-btn" @click="goToNext" title="Siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <!-- Controles adicionales -->
        <div v-if="showControls" class="additional-controls">
          <button v-if="canCreateTasks" class="create-btn" @click="createTask">
            <i class="fas fa-plus"></i>
            <span>Nueva Tarea</span>
          </button>
          
          <div class="filter-controls">
            <select v-if="taskTypes.length > 0" v-model="selectedTaskType" @change="filterTasks">
              <option value="">Todos los tipos</option>
              <option v-for="type in taskTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" title="Alejar">
              <i class="fas fa-search-minus"></i>
            </button>
            <button class="zoom-btn" @click="zoomIn" title="Acercar">
              <i class="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando diagrama...</span>
      </div>
    </div>

    <!-- Custom Gantt Chart -->
    <div class="gantt-wrapper">
      <div class="gantt-container">
        <!-- Labels column -->
        <div class="gantt-labels">
          <div class="label-header">Tareas</div>
          <div 
            v-for="row in filteredRows" 
            :key="row.id"
            class="gantt-row-label"
            :style="{ height: rowHeight + 'px' }"
          >
            {{ row.label }}
          </div>
        </div>
        
        <!-- Timeline and content -->
        <div class="gantt-timeline-container" ref="timelineContainer">
          <!-- Timeline header -->
          <div class="gantt-timeline-header">
            <div 
              v-for="(period, index) in timelinePeriods" 
              :key="index"
              class="timeline-period"
              :style="{ width: periodWidth + 'px' }"
            >
              {{ formatTimelinePeriod(period) }}
            </div>
          </div>
          
          <!-- Gantt content -->
          <div class="gantt-content" @click="handleTimelineClick">
            <!-- Grid lines -->
            <div class="gantt-grid">
              <div 
                v-for="(period, index) in timelinePeriods" 
                :key="index"
                class="grid-line"
                :style="{ left: (index * periodWidth) + 'px' }"
              ></div>
            </div>
            
            <!-- Current time line -->
            <div 
              v-if="showCurrentTime && currentTimePosition > 0"
              class="current-time-line"
              :style="{ left: currentTimePosition + 'px' }"
            >
              <div class="current-time-label">Ahora</div>
            </div>
            
            <!-- Gantt rows -->
            <div 
              v-for="(row, rowIndex) in filteredRows" 
              :key="row.id"
              class="gantt-row"
              :style="{ 
                height: rowHeight + 'px',
                top: (rowIndex * rowHeight) + 'px'
              }"
            >
              <!-- Bars for this row -->
              <div 
                v-for="bar in row.bars" 
                :key="bar.id"
                class="gantt-bar"
                :class="[
                  `status-${bar.status || 'default'}`,
                  `type-${bar.type || 'default'}`
                ]"
                :style="getBarStyle(bar)"
                @click="handleBarClick(bar, $event)"
                @mouseenter="handleBarMouseEnter(bar, $event)"
                @mouseleave="handleBarMouseLeave(bar, $event)"
                :title="getBarTooltip(bar)"
              >
                <!-- Progress overlay -->
                <div 
                  v-if="bar.progress !== undefined"
                  class="progress-overlay"
                  :style="{ width: ((bar.progress || 0) * 100) + '%' }"
                ></div>
                
                <!-- Bar content -->
                <div class="bar-content">
                  <div class="bar-title">{{ bar.label }}</div>
                  <div v-if="bar.progress !== undefined" class="bar-progress">
                    {{ Math.round((bar.progress || 0) * 100) }}%
                  </div>
                </div>
                
                <!-- Resize handles -->
                <div 
                  v-if="canEditTasks"
                  class="resize-handle left"
                  @mousedown="startResize(bar, 'left', $event)"
                ></div>
                <div 
                  v-if="canEditTasks"
                  class="resize-handle right"
                  @mousedown="startResize(bar, 'right', $event)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task details modal -->
    <div v-if="showTaskModal" class="task-modal-overlay" @click.self="closeTaskModal">
      <div class="task-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-info-circle"></i>
            Detalles de la Tarea
          </h3>
          <button class="close-btn" @click="closeTaskModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedTask" class="task-details">
            <div class="detail-item">
              <label>Título:</label>
              <span>{{ selectedTask.label }}</span>
            </div>
            
            <div class="detail-item">
              <label>Fecha de Inicio:</label>
              <span>{{ formatDate(selectedTask.start) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Fecha de Fin:</label>
              <span>{{ formatDate(selectedTask.end) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Duración:</label>
              <span>{{ calculateDuration(selectedTask.start, selectedTask.end) }} días</span>
            </div>
            
            <div v-if="selectedTask.progress !== undefined" class="detail-item">
              <label>Progreso:</label>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: ((selectedTask.progress || 0) * 100) + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ Math.round((selectedTask.progress || 0) * 100) }}%</span>
              </div>
            </div>
            
            <div v-if="selectedTask.status" class="detail-item">
              <label>Estado:</label>
              <span class="status-badge" :class="`status-${selectedTask.status}`">
                {{ getStatusLabel(selectedTask.status) }}
              </span>
            </div>
            
            <div v-if="selectedTask.assignee" class="detail-item">
              <label>Asignado a:</label>
              <span>{{ selectedTask.assignee }}</span>
            </div>
            
            <div v-if="selectedTask.description" class="detail-item">
              <label>Descripción:</label>
              <p>{{ selectedTask.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="canEditTasks" class="edit-btn" @click="editTask(selectedTask)">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button v-if="canDeleteTasks" class="delete-btn" @click="deleteTask(selectedTask)">
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
          <button class="cancel-btn" @click="closeTaskModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
</script>

<style scoped>
.gantt-chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header personalizado - siguiendo el mismo estilo del calendario */
.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #FFFFFF;
  color: var(--univo-primary);
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.gantt-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.gantt-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--univo-primary);
}

.gantt-title i {
  font-size: 1.25rem;
}

.view-selector {
  display: flex;
  gap: 0.5rem;
  background: var(--gray-light);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--univo-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.view-btn.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--univo-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.today-btn {
  width: auto;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.period-display {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--univo-primary);
}

.additional-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #28a745;
  border: 1px solid #28a745;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.create-btn:hover {
  background: #218838;
  border-color: #218838;
  transform: translateY(-1px);
}

.filter-controls select {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--univo-primary);
  font-size: 0.875rem;
}

.filter-controls select option {
  background: #003366;
  color: var(--univo-primary);
}

.zoom-controls {
  display: flex;
  gap: 0.25rem;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: var(--univo-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #003366;
}

.loading-spinner i {
  font-size: 2rem;
}

/* Gantt content wrapper */
.gantt-wrapper {
  padding: 1.5rem;
  position: relative;
  min-height: 400px;
}

.gantt-container {
  display: flex;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.gantt-labels {
  flex-shrink: 0;
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.label-header {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.gantt-row-label {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid #dee2e6;
  font-weight: 500;
  color: #495057;
  background: #f8f9fa;
}

.gantt-timeline-container {
  flex: 1;
  overflow-x: auto;
  position: relative;
}

.gantt-timeline-header {
  display: flex;
  height: 50px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.timeline-period {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #dee2e6;
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  padding: 0.5rem;
}

.gantt-content {
  position: relative;
  min-height: 300px;
}

.gantt-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #dee2e6;
}

.gantt-row {
  position: relative;
  border-bottom: 1px solid #dee2e6;
}

.gantt-bar {
  position: absolute;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  min-width: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gantt-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bar-content {
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  height: 100%;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.bar-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-progress {
  font-size: 0.6rem;
  opacity: 0.9;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  z-index: 1;
  transition: width 0.3s ease;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: rgba(255, 255, 255, 0.3);
  cursor: ew-resize;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gantt-bar:hover .resize-handle {
  opacity: 1;
}

.resize-handle.left {
  left: 0;
  border-radius: 4px 0 0 4px;
}

.resize-handle.right {
  right: 0;
  border-radius: 0 4px 4px 0;
}

/* Status colors - siguiendo la colorimetría del calendario */
.gantt-bar.status-not-started {
  background: #6c757d !important;
  color: white !important;
}

.gantt-bar.status-in-progress {
  background: #17a2b8 !important;
  color: white !important;
}

.gantt-bar.status-completed {
  background: #28a745 !important;
  color: white !important;
}

.gantt-bar.status-on-hold {
  background: #ffc107 !important;
  color: #212529 !important;
}

.gantt-bar.status-cancelled {
  background: #6c757d !important;
  color: white !important;
  opacity: 0.7;
}

.gantt-bar.status-default {
  background: #003366 !important;
  color: white !important;
}

/* Type colors siguiendo el patrón del calendario con border-left */
.gantt-bar.type-development {
  border-left: 4px solid #17a2b8;
}

.gantt-bar.type-testing {
  border-left: 4px solid #ffc107;
}

.gantt-bar.type-design {
  border-left: 4px solid #e83e8c;
}

.gantt-bar.type-planning {
  border-left: 4px solid #6f42c1;
}

.gantt-bar.type-deployment {
  border-left: 4px solid #28a745;
}

.gantt-bar.type-maintenance {
  border-left: 4px solid #6c757d;
}

/* Current time line */
.current-time-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dc3545;
  z-index: 10;
  pointer-events: none;
}

.current-time-label {
  position: absolute;
  top: -25px;
  left: -20px;
  background: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Modal styles siguiendo el patrón del calendario */
.task-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.task-modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: var(--univo-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-header .modal-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #003366;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
  transform: translateY(-1px);
}

.modal-body {
  padding: 1rem 2rem;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.detail-item span,
.detail-item p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  min-width: 35px;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  width: fit-content;
}

.status-badge.status-not-started {
  background-color: #6c757d;
  color: white;
}

.status-badge.status-in-progress {
  background-color: #17a2b8;
  color: white;
}

.status-badge.status-completed {
  background-color: #28a745;
  color: white;
}

.status-badge.status-on-hold {
  background-color: #ffc107;
  color: #212529;
}

.status-badge.status-cancelled {
  background-color: #6c757d;
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.modal-footer button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 6rem;
}

.edit-btn {
  background: #17a2b8;
  color: white;
}

.edit-btn:hover {
  background: #138496;
  transform: translateY(-1px);
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .gantt-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-left,
  .header-controls {
    justify-content: center;
  }
  
  .view-selector {
    justify-content: center;
  }
  
  .view-btn span {
    display: none;
  }
  
  .additional-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .gantt-wrapper {
    padding: 1rem;
  }
  
  .gantt-container {
    flex-direction: column;
  }
  
  .gantt-labels {
    width: 100%;
    order: -1;
  }
  
  .gantt-timeline-container {
    overflow-x: scroll;
  }
  
  .task-modal {
    margin: 0;
    border-radius: 0;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .view-selector {
    flex-wrap: wrap;
  }
  
  .navigation-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .gantt-header {
    padding: 0.75rem;
  }
  
  .gantt-wrapper {
    padding: 0.75rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .additional-controls {
    gap: 0.5rem;
  }
  
  .zoom-controls {
    order: -1;
  }
  
  .gantt-labels {
    width: 150px;
  }
  
  .label-header,
  .gantt-row-label {
    padding: 0 0.5rem;
    font-size: 0.875rem;
  }
  
  .modal-header h3 {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}

/* Hover effects consistentes */
.gantt-header button:hover,
.nav-btn:hover,
.view-btn:hover,
.zoom-btn:hover {
  transform: translateY(-1px);
}

/* Focus states */
.nav-btn:focus,
.view-btn:focus,
.create-btn:focus,
.close-btn:focus,
.zoom-btn:focus {
  outline: 2px solid rgba(0, 51, 102, 0.2);
  outline-offset: 2px;
}

/* Scrollbar styling */
.gantt-timeline-container::-webkit-scrollbar {
  height: 8px;
}

.gantt-timeline-container::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.gantt-timeline-container::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 4px;
}

.gantt-timeline-container::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>