<template>
  <div class="dashboard-tecnico">
    <!-- Header Mejorado -->
    <div class="header">
      <div class="header-content">
        <div class="brand-section">
          <h1>UNIVO<strong>Técnico</strong></h1>
          <h2>PANEL TÉCNICO AVANZADO</h2>
        </div>
        <div class="header-actions">
          <div class="time-display">
            <div class="current-date">{{ currentDate }}</div>
            <div class="current-time">{{ currentTime }}</div>
          </div>
          <va-button @click="refreshData" class="refresh-btn" :class="{ 'refreshing': isRefreshing }"    >
        
            <span class="material-icons">refresh</span>
          
      </va-button>
          <div class="notification-bell" @click="toggleNotifications">
            <span class="material-icons">notifications</span>
            <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
          </div>
        </div>
      </div>
      
      <!-- Barra de búsqueda -->
      <div class="search-section">
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar equipos, reportes, órdenes de trabajo..."
            @input="handleSearch"
          >
        </div>
        <va-button class="filter-btn" @click="toggleFilters"    >
        
          <span class="material-icons">tune</span>
          Filtros
        
      </va-button>
      </div>
    </div>

    <!-- Dashboard Grid Mejorado -->
    <div class="dashboard-grid">
      
      <!-- Panel de Control Principal -->
      <div class="card control-panel">
        <div class="card-header">
          <span class="material-icons">dashboard</span>
          <h3>Resumen General</h3>
          <div class="header-actions">
            <span class="last-update">Actualizado: {{ lastUpdate }}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="status-cards">
            <div 
              class="status-card" 
              v-for="(stat, index) in statusStats" 
              :key="index"
              :class="stat.type"
            >
              <div class="stat-icon">
                <span class="material-icons">{{ stat.icon }}</span>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-trend" :class="stat.trendType">
                  <span class="material-icons">{{ stat.trendIcon }}</span>
                  {{ stat.trend }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Acciones Rápidas Mejoradas -->
          <div class="quick-actions-section">
            <h4>Acciones Rápidas</h4>
            <div class="quick-actions">
              <va-button v-for="(action, index) in quickActions" 
                :key="index" 
                @click="executeAction(action)"
                class="action-btn"
                :class="action.type"
                  >
        
                <span class="material-icons">{{ action.icon }}</span>
                <span class="action-text">{{ action.label }}</span>
                <span class="action-shortcut">{{ action.shortcut }}</span>
              
      </va-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas y Notificaciones Mejoradas -->
      <div class="card notifications">
        <div class="card-header">
          <span class="material-icons">notifications_active</span>
          <h3>Centro de Alertas</h3>
          <div class="header-actions">
            <span class="badge priority-high">{{ urgentAlerts }}</span>
            <va-button @click="markAllAsRead" class="mark-read-btn"    >
        
              <span class="material-icons">done_all</span>
            
      </va-button>
          </div>
        </div>
        <div class="card-body">
          <div class="alert-filters">
            <va-button v-for="filter in alertFilters" 
              :key="filter.type"
              @click="setAlertFilter(filter.type)"
              class="filter-chip"
              :class="{ active: activeAlertFilter === filter.type }"
               >
        {{ filter.label }}
      </va-button>
          </div>
          <div class="alerts-list">
            <div 
              class="alert-item" 
              v-for="(alert, index) in filteredAlerts" 
              :key="index"
              :class="[alert.type, { 'unread': !alert.read }]"
            >
              <div class="alert-icon">
                <span class="material-icons">{{ alert.icon }}</span>
              </div>
              <div class="alert-content">
                <div class="alert-header">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-priority">{{ alert.priority }}</div>
                </div>
                <div class="alert-description">{{ alert.description }}</div>
                <div class="alert-meta">
                  <span class="alert-time">{{ alert.time }}</span>
                  <span class="alert-location">{{ alert.location }}</span>
                </div>
              </div>
              <div class="alert-actions">
                <va-button @click="acknowledgeAlert(index)" class="alert-action-btn"    >
        
                  <span class="material-icons">check</span>
                
      </va-button>
                <va-button @click="viewAlertDetails(alert)" class="alert-action-btn"    >
        
                  <span class="material-icons">visibility</span>
                
      </va-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipos Asignados Mejorado -->
      <div class="card assigned-equipment">
        <div class="card-header">
          <span class="material-icons">precision_manufacturing</span>
          <h3>Equipos Bajo Supervisión</h3>
          <div class="header-actions">
            <select v-model="equipmentFilter" class="equipment-filter">
              <option value="all">Todos</option>
              <option value="activo">Activos</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div class="equipment-grid">
            <div 
              class="equipment-item" 
              v-for="(equipment, index) in filteredEquipment" 
              :key="index"
              @click="viewEquipmentDetails(equipment)"
            >
              <div class="equipment-header">
                <div class="equipment-icon" :class="equipment.status">
                  <span class="material-icons">{{ equipment.icon }}</span>
                </div>
                <div class="equipment-status-badge" :class="equipment.status">
                  {{ equipment.statusText }}
                </div>
              </div>
              <div class="equipment-info">
                <div class="equipment-name">{{ equipment.name }}</div>
                <div class="equipment-location">{{ equipment.location }}</div>
              </div>
              <div class="equipment-metrics">
                <div class="metric">
                  <span class="metric-label">Eficiencia</span>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: equipment.efficiency + '%' }"
                      :class="getEfficiencyClass(equipment.efficiency)"
                    ></div>
                  </div>
                  <span class="metric-value">{{ equipment.efficiency }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Próximo Mantenimiento</span>
                  <span class="metric-value">{{ equipment.nextMaintenance }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nuevas secciones -->
      <!-- Gráfico de Rendimiento -->
      <div class="card performance-chart">
        <div class="card-header">
          <span class="material-icons">analytics</span>
          <h3>Rendimiento del Día</h3>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas ref="performanceChart" id="performanceChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Tareas Pendientes -->
      <div class="card pending-tasks">
        <div class="card-header">
          <span class="material-icons">assignment</span>
          <h3>Tareas Pendientes</h3>
          <span class="badge">{{ pendingTasks.length }}</span>
        </div>
        <div class="card-body">
          <div class="tasks-list">
            <div 
              class="task-item" 
              v-for="(task, index) in pendingTasks" 
              :key="index"
              @click="selectTask(task)"
            >
              <div class="task-checkbox">
                <input 
                  type="checkbox" 
                  :id="'task-' + index"
                  @change="completeTask(index)"
                >
                <label :for="'task-' + index"></label>
              </div>
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-meta">
                  <span class="task-priority" :class="task.priority">{{ task.priority }}</span>
                  <span class="task-due">{{ task.dueTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Notificaciones -->
    <div v-if="showNotificationModal" class="modal-overlay" @click="closeNotificationModal">
      <div class="notification-modal" @click.stop>
        <div class="modal-header">
          <h3>Todas las Notificaciones</h3>
          <va-button @click="closeNotificationModal" class="close-btn"    >
        
            <span class="material-icons">close</span>
          
      </va-button>
        </div>
        <div class="modal-body">
          <!-- Contenido del modal de notificaciones -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estados reactivos
const currentTime = ref('')
const currentDate = ref('')
const isRefreshing = ref(false)
const searchQuery = ref('')
const showNotificationModal = ref(false)
const activeAlertFilter = ref('all')
const equipmentFilter = ref('all')
const lastUpdate = ref('')
const unreadNotifications = ref(5)

// Datos mejorados
const statusStats = ref([
  { 
    value: '8', 
    label: 'Órdenes Pendientes', 
    icon: 'assignment',
    type: 'primary',
    trend: '+15%',
    trendType: 'positive',
    trendIcon: 'trending_up'
  },
  { 
    value: '3', 
    label: 'Mantenimientos Hoy', 
    icon: 'build',
    type: 'warning',
    trend: '2 en progreso',
    trendType: 'neutral',
    trendIcon: 'schedule'
  },
  { 
    value: '2', 
    label: 'Equipos Críticos', 
    icon: 'warning',
    type: 'danger',
    trend: '-1 desde ayer',
    trendType: 'positive',
    trendIcon: 'trending_down'
  },
  { 
    value: '94%', 
    label: 'Eficiencia General', 
    icon: 'speed',
    type: 'success',
    trend: '+2.5%',
    trendType: 'positive',
    trendIcon: 'trending_up'
  }
])

const quickActions = ref([
  { 
    icon: 'add_circle', 
    label: 'Nuevo Reporte', 
    type: 'primary', 
    action: 'newReport',
    shortcut: 'Ctrl+N'
  },
  { 
    icon: 'build_circle', 
    label: 'Registrar Mantenimiento', 
    type: 'secondary', 
    action: 'registerMaintenance',
    shortcut: 'Ctrl+M'
  },
  { 
    icon: 'report_problem', 
    label: 'Reportar Emergencia', 
    type: 'danger', 
    action: 'reportEmergency',
    shortcut: 'Ctrl+E'
  },
  { 
    icon: 'monitoring', 
    label: 'Monitoreo en Vivo', 
    type: 'info', 
    action: 'liveMonitoring',
    shortcut: 'Ctrl+L'
  }
])

const alerts = ref([
  { 
    type: 'urgent', 
    icon: 'error', 
    title: 'Sobrecalentamiento Crítico', 
    description: 'Temperatura de 95°C detectada en CNC-04',
    time: 'Hace 15 min',
    location: 'Planta A - Sector 2',
    priority: 'CRÍTICA',
    read: false
  },
  { 
    type: 'warning', 
    icon: 'schedule', 
    title: 'Mantenimiento Preventivo Vencido', 
    description: 'Prensa H-12 requiere servicio inmediato',
    time: 'Hace 2 horas',
    location: 'Planta B - Línea 3',
    priority: 'ALTA',
    read: false
  },
  { 
    type: 'info', 
    icon: 'info', 
    title: 'Nueva Orden Asignada', 
    description: 'Inspección rutinaria programada',
    time: 'Hoy, 08:30',
    location: 'Área de producción',
    priority: 'MEDIA',
    read: true
  }
])

const assignedEquipment = ref([
  { 
    name: 'Torno CNC-04', 
    status: 'activo', 
    statusText: 'Operativo',
    efficiency: 98,
    nextMaintenance: '5 días',
    location: 'Sector A1',
    icon: 'precision_manufacturing'
  },
  { 
    name: 'Prensa Hidráulica H-12', 
    status: 'mantenimiento', 
    statusText: 'Mantenimiento',
    efficiency: 0,
    nextMaintenance: 'En proceso',
    location: 'Sector B2',
    icon: 'compress'
  },
  { 
    name: 'Cortadora Láser CL-7', 
    status: 'activo', 
    statusText: 'Operativo',
    efficiency: 87,
    nextMaintenance: '12 días',
    location: 'Sector C1',
    icon: 'content_cut'
  },
  { 
    name: 'Soldadora Automática SA-3', 
    status: 'inactivo', 
    statusText: 'Detenido',
    efficiency: 0,
    nextMaintenance: 'Pendiente',
    location: 'Sector A3',
    icon: 'whatshot'
  }
])

const pendingTasks = ref([
  {
    title: 'Inspección visual CNC-04',
    priority: 'alta',
    dueTime: '10:30 AM'
  },
  {
    title: 'Cambio de filtros línea 2',
    priority: 'media',
    dueTime: '2:00 PM'
  },
  {
    title: 'Calibración sensores',
    priority: 'baja',
    dueTime: 'Mañana'
  }
])

const alertFilters = ref([
  { type: 'all', label: 'Todas' },
  { type: 'urgent', label: 'Urgentes' },
  { type: 'warning', label: 'Advertencias' },
  { type: 'info', label: 'Información' }
])

// Computed properties
const filteredAlerts = computed(() => {
  if (activeAlertFilter.value === 'all') {
    return alerts.value
  }
  return alerts.value.filter(alert => alert.type === activeAlertFilter.value)
})

const filteredEquipment = computed(() => {
  if (equipmentFilter.value === 'all') {
    return assignedEquipment.value
  }
  return assignedEquipment.value.filter(equipment => equipment.status === equipmentFilter.value)
})

const urgentAlerts = computed(() => {
  return alerts.value.filter(alert => alert.type === 'urgent' && !alert.read).length
})

// Métodos
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-ES')
  currentDate.value = now.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  lastUpdate.value = now.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const refreshData = async () => {
  isRefreshing.value = true
  // Simular carga de datos
  await new Promise(resolve => setTimeout(resolve, 1500))
  updateTime()
  isRefreshing.value = false
}

const toggleNotifications = () => {
  showNotificationModal.value = !showNotificationModal.value
}

const closeNotificationModal = () => {
  showNotificationModal.value = false
}

const toggleFilters = () => {
  console.log('Toggleando filtros')
}

const handleSearch = () => {
  console.log('Buscando:', searchQuery.value)
}

const setAlertFilter = (filterType) => {
  activeAlertFilter.value = filterType
}

const markAllAsRead = () => {
  alerts.value.forEach(alert => alert.read = true)
  unreadNotifications.value = 0
}

const acknowledgeAlert = (index) => {
  alerts.value[index].read = true
  if (unreadNotifications.value > 0) {
    unreadNotifications.value--
  }
}

const viewAlertDetails = (alert) => {
  console.log('Ver detalles de alerta:', alert)
}

const viewEquipmentDetails = (equipment) => {
  console.log('Ver detalles de equipo:', equipment)
}

const getEfficiencyClass = (efficiency) => {
  if (efficiency >= 90) return 'high'
  if (efficiency >= 70) return 'medium'
  return 'low'
}

const executeAction = (action) => {
  switch(action.action) {
    case 'newReport':
      router.push('/technician/new-report')
      break
    case 'registerMaintenance':
      router.push('/technician/register-maintenance')
      break
    case 'reportEmergency':
      router.push('/technician/emergency')
      break
    case 'liveMonitoring':
      router.push('/technician/monitoring')
      break
  }
}

const selectTask = (task) => {
  console.log('Tarea seleccionada:', task)
}

const completeTask = (index) => {
  pendingTasks.value.splice(index, 1)
}

// Lifecycle hooks
let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>\

<style src="src/assets/DashboardTecnico.css"></style>