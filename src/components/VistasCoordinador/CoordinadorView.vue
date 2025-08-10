<template>
  <div class="">
    <Sidebar :role="'coordinator'" />
    <main class="">
      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="header-text">
              <h1 class="header-title">Panel del Coordinador</h1>
              <p class="header-subtitle">Gestiona usuarios, asignaciones y el flujo de trabajo del equipo</p>
            </div>
          </div>

          <!-- Métricas rápidas en el header -->
          <div class="header-metrics">
            <div class="metric-card">
              <div class="metric-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="metric-info">
                <span class="metric-value">{{ uptime }}</span>
                <span class="metric-label">Tiempo Activo</span>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon efficiency">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="metric-info">
                <span class="metric-value">{{ efficiency }}%</span>
                <span class="metric-label">Eficiencia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="user-menu">
        <QuickAccessMenu :items="quickActions" @action-selected="handleQuickAction" />
        <UserProfileDropdown :user="currentUser" :badge="pendingTasksCount" />
      </div>

      <!-- Sección principal -->
      <div class="coordinator-dashboard">
        <!-- Widgets superiores -->
        <div class="stats-row">
          <LiveProductionStats :orders="activeOrders" :machines="machineStatus" />
          <UrgentTasksWidget :tasks="pendingTasks" @task-click="openTaskDetail" />
          
          <!-- Nuevo widget de alertas críticas -->
          <div class="critical-alerts-widget">
            <div class="widget-header">
              <h3>
                <i class="fas fa-exclamation-triangle"></i>
                Alertas Críticas
              </h3>
              <span class="alert-count" :class="{ 'has-alerts': criticalAlerts.length > 0 }">
                {{ criticalAlerts.length }}
              </span>
            </div>
            <div class="alerts-list">
              <div v-for="alert in criticalAlerts" :key="alert.id" class="alert-item">
                <div class="alert-icon">
                  <i :class="getAlertIcon(alert.type)"></i>
                </div>
                <div class="alert-content">
                  <span class="alert-title">{{ alert.title }}</span>
                  <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Segunda fila de widgets -->
        <div class="secondary-widgets">
          <!-- Widget de rendimiento del equipo -->
          <div class="team-performance-widget">
            <div class="widget-header">
              <h3>
                <i class="fas fa-users"></i>
                Rendimiento del Equipo
              </h3>
            </div>
            <div class="performance-grid">
              <div v-for="member in teamMembers" :key="member.id" class="member-card">
                <div class="member-avatar">
                  <img 
                    :src="member.avatar" 
                    :alt="member.name" 
                    @error="setDefaultAvatar"
                  >
                </div>
                <div class="member-info">
                  <span class="member-name">{{ member.name }}</span>
                  <div class="member-stats">
                    <span class="stat">{{ member.tasksCompleted }} tareas</span>
                    <div class="efficiency-bar">
                      <div class="efficiency-fill" :style="{ width: member.efficiency + '%' }"></div>
                    </div>
                  </div>
                </div>
                <div class="member-status" :class="member.status">
                  <span :class="'status-badge ' + member.status"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Widget de próximos mantenimientos -->
          <div class="maintenance-schedule-widget">
            <div class="widget-header">
              <h3>
                <i class="fas fa-wrench"></i>
                Mantenimientos Programados
              </h3>
            </div>
            <div class="maintenance-list">
              <div v-for="maintenance in upcomingMaintenance" :key="maintenance.id" class="maintenance-item">
                <div class="maintenance-date">
                  <span class="day">{{ getDayFromDate(maintenance.date) }}</span>
                  <span class="month">{{ getMonthFromDate(maintenance.date) }}</span>
                </div>
                <div class="maintenance-details">
                  <span class="machine-name">{{ maintenance.machineName }}</span>
                  <span class="maintenance-type">{{ maintenance.type }}</span>
                  <span class="time-remaining" :class="getUrgencyClass(maintenance.daysRemaining)">
                    {{ maintenance.daysRemaining }} días restantes
                  </span>
                </div>
                <div class="maintenance-priority" :class="maintenance.priority">
                  <i class="fas fa-flag"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Área de trabajo principal -->
        <div class="main-grid">
          <div class="production-section">
            <OrderGanttChart :orders="filteredOrders" @order-selected="showOrderDetails" />
            <MachineStatusGrid :machines="machines" @maintenance-request="openMaintenanceForm" />
            
            <!-- Nuevo componente de análisis de producción -->
            <div class="production-analytics">
              <div class="widget-header">
                <h3>
                  <i class="fas fa-chart-area"></i>
                  Análisis de Producción
                </h3>
                <div class="time-filters">
                  <button 
                    v-for="period in timePeriods" 
                    :key="period.value"
                    :class="['filter-btn', { active: selectedPeriod === period.value }]"
                    @click="selectedPeriod = period.value"
                  >
                    {{ period.label }}
                  </button>
                </div>
              </div>
              <div class="analytics-content">
                <div class="production-chart">
                  <!-- Aquí iría el componente del gráfico -->
                  <div class="chart-placeholder">
                    <i class="fas fa-chart-bar"></i>
                    <span>Gráfico de Producción</span>
                  </div>
                </div>
                <div class="production-insights">
                  <div class="insight-item">
                    <span class="insight-label">Pico de Producción</span>
                    <span class="insight-value trend-up">{{ peakProduction }}</span>
                  </div>
                  <div class="insight-item">
                    <span class="insight-label">Promedio Diario</span>
                    <span class="insight-value">{{ averageDaily }}</span>
                  </div>
                  <div class="insight-item">
                    <span class="insight-label">Tendencia</span>
                    <span class="insight-value trend-down">-5.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="secondary-section">
            <InventoryAlerts :items="lowStockItems" @reorder="initReorderProcess" />
            <QualityChecklist :pending-checks="qualityChecks" @complete-check="recordQualityCheck" />
            
            <!-- Nuevo widget de comunicaciones -->
            <div class="communications-widget">
              <div class="widget-header">
                <h3>
                  <i class="fas fa-comments"></i>
                  Comunicaciones
                </h3>
                <button class="new-message-btn" @click="openNewMessage">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="communications-list">
                <div v-for="message in recentMessages" :key="message.id" class="message-item">
                  <div class="message-avatar">
                    <img 
                      :src="message.sender.avatar" 
                      :alt="message.sender.name"
                      @error="setDefaultAvatar"
                    >
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="sender-name">{{ message.sender.name }}</span>
                      <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    <p class="message-text">{{ message.preview }}</p>
                  </div>
                  <div class="message-status" :class="{ unread: !message.read }">
                    <i class="fas fa-circle"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Widget de calendario de eventos -->
            <div class="events-calendar-widget">
              <div class="widget-header">
                <h3>
                  <i class="fas fa-calendar-alt"></i>
                  Eventos Próximos
                </h3>
              </div>
              <div class="events-list">
                <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
                  <div class="event-time">
                    <span class="time">{{ formatEventTime(event.startTime) }}</span>
                    <span class="duration">{{ event.duration }}</span>
                  </div>
                  <div class="event-details">
                    <span class="event-title">{{ event.title }}</span>
                    <span class="event-location">{{ event.location }}</span>
                  </div>
                  <div class="event-type" :class="event.type">
                    <i :class="getEventIcon(event.type)"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modales contextuales -->
      <OrderDetailModal v-if="selectedOrder" :order="selectedOrder" @close="selectedOrder = null" />
      <NewMessageModal v-if="showNewMessageModal" @close="showNewMessageModal = false" />
    </main>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'

// Componentes
import Sidebar from '@/components/GlobalComponents/SidebarCoordinador.vue'
import LiveProductionStats from '@/components/VistasCoordinador/ComponentesCoordinador/LiveProductionStats.vue'
import OrderGanttChart from '@/components/VistasCoordinador/ComponentesCoordinador/OrderGanttChart.vue'
import MachineStatusGrid from '@/components/VistasCoordinador/ComponentesCoordinador/MachineStatusGrid.vue'

// Data
const selectedOrder = ref(null)
const selectedPeriod = ref('today')
const showNewMessageModal = ref(false)

// Datos simulados
const uptime = ref('24h 15m')
const efficiency = ref(87)
const peakProduction = ref('142 unidades')
const averageDaily = ref('98 unidades')

const criticalAlerts = ref([
  { id: 1, type: 'machine', title: 'Máquina 03 requiere mantenimiento', timestamp: new Date() },
  { id: 2, type: 'quality', title: 'Falla en control de calidad Línea B', timestamp: new Date() }
])

const teamMembers = ref([
  { 
    id: 1, 
    name: 'Ana García', 
    avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg',
    tasksCompleted: 8, 
    efficiency: 92, 
    status: 'active' 
  },
  { 
    id: 2, 
    name: 'Carlos López', 
    avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg',
    tasksCompleted: 6, 
    efficiency: 78, 
    status: 'busy' 
  }
])

const upcomingMaintenance = ref([
  { 
    id: 1, 
    machineName: 'Línea de Producción A', 
    type: 'Mantenimiento Preventivo',
    date: new Date(2025, 5, 26),
    priority: 'high',
    daysRemaining: 2
  }
])

const recentMessages = ref([
  {
    id: 1,
    sender: { 
      name: 'María Rodríguez', 
      avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg' 
    },
    preview: 'Necesitamos revisar el cronograma de producción...',
    timestamp: new Date(),
    read: false
  }
])

const upcomingEvents = ref([
  {
    id: 1,
    title: 'Reunión de Coordinación',
    location: 'Sala de Juntas A',
    startTime: new Date(2025, 5, 24, 14, 30),
    duration: '1h 30m',
    type: 'meeting'
  }
])

const timePeriods = ref([
  { label: 'Hoy', value: 'today' },
  { label: '7 días', value: 'week' },
  { label: '30 días', value: 'month' }
])

// Métodos
const showOrderDetails = (order) => {
  selectedOrder.value = order
}

const openMaintenanceForm = (machine) => {
  // Lógica para formulario de mantenimiento
}

const setDefaultAvatar = (event) => {
  event.target.src = 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg'
}

const getAlertIcon = (type) => {
  const icons = {
    machine: 'fas fa-cog',
    quality: 'fas fa-shield-alt',
    inventory: 'fas fa-boxes',
    deadline: 'fas fa-clock'
  }
  return icons[type] || 'fas fa-exclamation-triangle'
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

const getDayFromDate = (date) => {
  return date.getDate()
}

const getMonthFromDate = (date) => {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN']
  return months[date.getMonth()]
}

const getUrgencyClass = (days) => {
  if (days <= 1) return 'urgent'
  if (days <= 3) return 'warning'
  return 'normal'
}

const formatEventTime = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getEventIcon = (type) => {
  const icons = {
    meeting: 'fas fa-users',
    maintenance: 'fas fa-wrench',
    deadline: 'fas fa-flag'
  }
  return icons[type] || 'fas fa-calendar'
}

const openNewMessage = () => {
  showNewMessageModal.value = true
}
</script>

<style src="./styles/Dashboard.css" scoped></style>
