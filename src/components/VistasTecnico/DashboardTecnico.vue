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
          <button @click="refreshData" class="refresh-btn" :class="{ 'refreshing': isRefreshing }">
            <span class="material-icons">refresh</span>
          </button>
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
        <button class="filter-btn" @click="toggleFilters">
          <span class="material-icons">tune</span>
          Filtros
        </button>
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
              <button 
                v-for="(action, index) in quickActions" 
                :key="index" 
                @click="executeAction(action)"
                class="action-btn"
                :class="action.type"
              >
                <span class="material-icons">{{ action.icon }}</span>
                <span class="action-text">{{ action.label }}</span>
                <span class="action-shortcut">{{ action.shortcut }}</span>
              </button>
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
            <button @click="markAllAsRead" class="mark-read-btn">
              <span class="material-icons">done_all</span>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="alert-filters">
            <button 
              v-for="filter in alertFilters" 
              :key="filter.type"
              @click="setAlertFilter(filter.type)"
              class="filter-chip"
              :class="{ active: activeAlertFilter === filter.type }"
            >
              {{ filter.label }}
            </button>
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
                <button @click="acknowledgeAlert(index)" class="alert-action-btn">
                  <span class="material-icons">check</span>
                </button>
                <button @click="viewAlertDetails(alert)" class="alert-action-btn">
                  <span class="material-icons">visibility</span>
                </button>
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
          <button @click="closeNotificationModal" class="close-btn">
            <span class="material-icons">close</span>
          </button>
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
</script>

<style scoped>
/* Variables CSS para consistencia */
:root {
  --primary-color: #42b983;
  --secondary-color: #3498db;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --success-color: #27ae60;
  --info-color: #8e44ad;
  --dark-color: #2c3e50;
  --light-color: #ecf0f1;
  --border-radius: 12px;
  --shadow-light: 0 2px 10px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.12);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estilos base mejorados */
.dashboard-tecnico {
  padding: 24px;
  max-width: auto;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

/* Header mejorado */
.header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px 32px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
}

.brand-section h1 {
  font-size: 3rem;
  color: var(--dark-color);
  margin-bottom: 8px;
  font-weight: 700;
}

.brand-section h1 strong {
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color), #27ae60);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-section h2 {
  font-size: 1.4rem;
  color: #6c757d;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time-display {
  text-align: right;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.current-date {
  font-size: 0.9rem;
  color: #6c757d;
  text-transform: capitalize;
}

.current-time {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark-color);
  font-family: 'Courier New', monospace;
}

.refresh-btn {
  padding: 12px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.refresh-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.refresh-btn.refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.notification-bell {
  position: relative;
  padding: 12px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.notification-bell:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Barra de búsqueda */
.search-section {
  display: flex;
  gap: 16px;
  background: white;
  padding: 20px 32px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
}

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar .material-icons {
  position: absolute;
  left: 16px;
  color: #6c757d;
  z-index: 1;
}

.search-bar input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.filter-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Grid del dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Cards mejoradas */
.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: var(--transition);
  border: 1px solid #f1f3f4;
}

.card:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-2px);
}

.card-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--dark-color);
  font-weight: 600;
}

.card-header .material-icons {
  color: var(--primary-color);
  font-size: 24px;
}

.card-header .header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-body {
  padding: 24px;
}

/* Panel de control */
.control-panel {
  grid-column: span 8;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.status-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: var(--border-radius);
  padding: 24px;
  border-left: 4px solid;
  transition: var(--transition);
  cursor: pointer;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.status-card.primary { border-left-color: var(--primary-color); }
.status-card.warning { border-left-color: var(--warning-color); }
.status-card.danger { border-left-color: var(--danger-color); }
.status-card.success { border-left-color: var(--success-color); }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: rgba(66, 185, 131, 0.1);
}

.stat-icon .material-icons {
  font-size: 24px;
  color: var(--primary-color);
}

.stat-content .stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark-color);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-content .stat-label {
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-trend.positive { color: var(--success-color); }
.stat-trend.negative { color: var(--danger-color); }
.stat-trend.neutral { color: var(--warning-color); }

.stat-trend .material-icons {
  font-size: 16px;
}

/* Acciones rápidas */
.quick-actions-section {
  border-top: 1px solid #e9ecef;
  padding-top: 24px;
}

.quick-actions-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: var(--dark-color);
  font-weight: 600;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary-color), #27ae60);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, var(--secondary-color), #2980b9);
  color: white;
}

.action-btn.danger {
  background: linear-gradient(135deg, var(--danger-color), #c0392b);
  color: white;
}

.action-btn.info {
  background: linear-gradient(135deg, var(--info-color), #7d3c98);
  color: white;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.action-btn .material-icons {
  font-size: 28px;
}

.action-text {
  font-weight: 600;
  font-size: 0.95rem;
  text-align: center;
}

.action-shortcut {
  font-size: 0.75rem;
  opacity: 0.8;
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

/* Notificaciones */
.notifications {
  grid-column: span 6;
}

.alert-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 6px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
}

.filter-chip.active,
.filter-chip:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.alerts-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: var(--transition);
  cursor: pointer;
  border-left: 4px solid transparent;
}

.alert-item.unread {
  background: #f8f9ff;
  border-left-color: var(--primary-color);
}

.alert-item:hover {
  background: #f1f3f4;
  transform: translateX(4px);
}

.alert-item.urgent {
  border-left-color: var(--danger-color);
}

.alert-item.warning {
  border-left-color: var(--warning-color);
}

.alert-item.info {
  border-left-color: var(--info-color);
}

.alert-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-item.urgent .alert-icon {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.alert-item.warning .alert-icon {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.alert-item.info .alert-icon {
  background: rgba(142, 68, 173, 0.1);
  color: var(--info-color);
}

.alert-content {
  flex: 1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.alert-title {
  font-weight: 600;
  color: var(--dark-color);
  font-size: 1rem;
  line-height: 1.3;
}

.alert-priority {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  background: var(--danger-color);
  color: white;
}

.alert-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 8px;
  line-height: 1.4;
}

.alert-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #6c757d;
}

.alert-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #f1f3f4;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-action-btn:hover {
  background: var(--primary-color);
  color: white;
}

.mark-read-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  transition: var(--transition);
}

.mark-read-btn:hover {
  color: var(--primary-color);
}

/* Equipos asignados */
.assigned-equipment {
  grid-column: span 6;
}

.equipment-filter {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.equipment-grid {
  display: grid;
  gap: 16px;
}

.equipment-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e9ecef;
  border-radius: var(--border-radius);
  padding: 20px;
  cursor: pointer;
  transition: var(--transition);
}

.equipment-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
  border-color: var(--primary-color);
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.equipment-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.equipment-icon.activo {
  background: rgba(39, 174, 96, 0.1);
  color: var(--success-color);
}

.equipment-icon.mantenimiento {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.equipment-icon.inactivo {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.equipment-status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.equipment-status-badge.activo {
  background: rgba(39, 174, 96, 0.1);
  color: var(--success-color);
}

.equipment-status-badge.mantenimiento {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.equipment-status-badge.inactivo {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.equipment-info {
  margin-bottom: 16px;
}

.equipment-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--dark-color);
  margin-bottom: 4px;
}

.equipment-location {
  color: #6c757d;
  font-size: 0.9rem;
}

.equipment-metrics {
  space-y: 12px;
}

.metric {
  margin-bottom: 12px;
}

.metric-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 4px;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-fill.high {
  background: linear-gradient(90deg, var(--success-color), #2ecc71);
}

.progress-fill.medium {
  background: linear-gradient(90deg, var(--warning-color), #f1c40f);
}

.progress-fill.low {
  background: linear-gradient(90deg, var(--danger-color), #e67e22);
}

.metric-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--dark-color);
}

/* Nuevas secciones */
.performance-chart {
  grid-column: span 8;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  color: #6c757d;
  font-style: italic;
}

.pending-tasks {
  grid-column: span 4;
}

.tasks-list {
  max-height: 300px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: var(--transition);
  cursor: pointer;
  background: #f8f9fa;
}

.task-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.task-checkbox {
  position: relative;
}

.task-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: var(--dark-color);
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-priority {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.task-priority.alta {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.task-priority.media {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.task-priority.baja {
  background: rgba(52, 152, 219, 0.1);
  color: var(--secondary-color);
}

.task-due {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Modal */
.modal-overlay {
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
  backdrop-filter: blur(4px);
}

.notification-modal {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--dark-color);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
}

.close-btn:hover {
  background: #e9ecef;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* Badges y elementos pequeños */
.badge {
  background: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.priority-high {
  background: var(--danger-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.last-update {
  font-size: 0.8rem;
  color: #6c757d;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .control-panel {
    grid-column: span 8;
  }
  
  .notifications,
  .assigned-equipment {
    grid-column: span 4;
  }
  
  .performance-chart {
    grid-column: span 8;
  }
  
  .pending-tasks {
    grid-column: span 4;
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .control-panel,
  .notifications,
  .assigned-equipment,
  .performance-chart,
  .pending-tasks {
    grid-column: span 1;
  }
  
  .status-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .search-section {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .dashboard-tecnico {
    padding: 16px;
  }
  
  .status-cards,
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    padding: 20px;
  }
  
  .brand-section h1 {
    font-size: 2.5rem;
  }
  
  .time-display {
    order: -1;
  }
  
  .alert-filters {
    justify-content: center;
  }
  
  .equipment-grid {
    grid-template-columns: 1fr;
  }
  
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .alert-actions {
    flex-direction: row;
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .brand-section h1 {
    font-size: 2rem;
  }
  
  .brand-section h2 {
    font-size: 1.1rem;
  }
  
  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
}

/* Animaciones adicionales */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: slideInUp 0.5s ease-out;
}

.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }

/* Estados de carga */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--primary-color);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Utilidades */
.text-center { text-align: center; }
.text-right { text-align: right; }
.mt-0 { margin-top: 0; }
.mb-0 { margin-bottom: 0; }
.hidden { display: none; }
.visible { display: block; }

/* Scrollbar personalizado */
.alerts-list::-webkit-scrollbar,
.tasks-list::-webkit-scrollbar {
  width: 6px;
}

.alerts-list::-webkit-scrollbar-track,
.tasks-list::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 3px;
}

.alerts-list::-webkit-scrollbar-thumb,
.tasks-list::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

.alerts-list::-webkit-scrollbar-thumb:hover,
.tasks-list::-webkit-scrollbar-thumb:hover {
  background: #27ae60;
}
</style>