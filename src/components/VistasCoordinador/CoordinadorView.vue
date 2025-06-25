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

<style scoped>
.coordinator-dashboard {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: #003366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #003366, #003366);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}

.header-metrics {
  display: flex;
  gap: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 40px;
  height: 40px;
  background: #003366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.metric-icon.efficiency {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2D3748;
}

.metric-label {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
}

.stats-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.secondary-widgets {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1.5rem;
}

/* Widgets específicos */
.critical-alerts-widget,
.team-performance-widget,
.maintenance-schedule-widget,
.communications-widget,
.events-calendar-widget,
.production-analytics {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.critical-alerts-widget:hover,
.team-performance-widget:hover,
.maintenance-schedule-widget:hover,
.communications-widget:hover,
.events-calendar-widget:hover,
.production-analytics:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f0f0f0;
}

.widget-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.widget-header h3 i {
  color: #003366;
}

.alert-count {
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.alert-count.has-alerts {
  background: #fed7d7;
  color: #c53030;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #f56565;
}

.alert-icon {
  width: 32px;
  height: 32px;
  background: #fed7d7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c53030;
  font-size: 0.9rem;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.alert-time {
  font-size: 0.8rem;
  color: #718096;
}

.performance-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.member-card:hover {
  background: #e8f4f8;
}

.member-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.member-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.member-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat {
  font-size: 0.8rem;
  color: #718096;
}

.efficiency-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.efficiency-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.member-status {
  display: flex;
  align-items: center;
}

.status-badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-badge.active {
  background: #4CAF50;
}

.status-badge.busy {
  background: #FFC107;
}

.status-badge.offline {
  background: #9E9E9E;
}

.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.maintenance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  border-left: 4px solid #003366;
}

.maintenance-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.day {
  font-size: 1.2rem;
  font-weight: 700;
  color: #003366;
}

.month {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 600;
}

.maintenance-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.machine-name {
  font-weight: 600;
  color: #2d3748;
}

.maintenance-type {
  font-size: 0.85rem;
  color: #718096;
}

.time-remaining {
  font-size: 0.8rem;
  font-weight: 600;
}

.time-remaining.urgent {
  color: #e53e3e;
}

.time-remaining.warning {
  color: #dd6b20;
}

.time-remaining.normal {
  color: #38a169;
}

.maintenance-priority {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.maintenance-priority.high {
  background: #fed7d7;
  color: #c53030;
}

.maintenance-priority.medium {
  background: #feebc8;
  color: #c05621;
}

.maintenance-priority.low {
  background: #c6f6d5;
  color: #2f855a;
}

.time-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f8f9fa;
}

.filter-btn.active {
  background: #003366;
  color: white;
  border-color: #003366;
}

.analytics-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f8f9fa;
  border-radius: 0.5rem;
  color: #718096;
}

.chart-placeholder i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.production-insights {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.insight-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.insight-value {
  font-weight: 700;
  color: #2d3748;
}

.trend-up {
  color: #38a169;
}

.trend-down {
  color: #e53e3e;
}

.new-message-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #003366;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-message-btn:hover {
  background: #004080;
  transform: scale(1.05);
}

.communications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.message-item:hover {
  background: #e8f4f8;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sender-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.8rem;
  color: #718096;
}

.message-text {
  margin: 0;
  font-size: 0.85rem;
  color: #4a5568;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-status {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-status.unread {
  opacity: 1;
}

.message-status i {
  font-size: 0.6rem;
  color: #3182ce;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  border-left: 4px solid #003366;
  transition: all 0.2s ease;
}

.event-item:hover {
  background: #e8f4f8;
  transform: translateX(2px);
}

.event-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.time {
  font-weight: 700;
  color: #003366;
  font-size: 0.95rem;
}

.duration {
  font-size: 0.75rem;
  color: #718096;
}

.event-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.event-location {
  font-size: 0.8rem;
  color: #718096;
}

.event-type {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 50%;
}

.event-type.meeting {
  background: #bee3f8;
  color: #2b6cb0;
}

.event-type.maintenance {
  background: #feebc8;
  color: #c05621;
}

.event-type.deadline {
  background: #fed7d7;
  color: #c53030;
}

.production-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.secondary-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Estados de producción */
.status-badge {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-badge.production {
  background-color: var(--status-color);
}

.production.normal {
  --status-color: #4CAF50;
}

.production.delayed {
  --status-color: #FFC107;
}

.production.stopped {
  --status-color: #F44336;
}

.notification-badge.critical {
  background-color: #F44336;
  color: white;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .secondary-widgets {
    grid-template-columns: 1fr;
  }
  
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-metrics {
    justify-content: center;
  }
  
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .coordinator-dashboard {
    padding: 0.5rem;
  }
  
  .widget-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .time-filters {
    align-self: stretch;
    justify-content: space-between;
  }
}
</style>