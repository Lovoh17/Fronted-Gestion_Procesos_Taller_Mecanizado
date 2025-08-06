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