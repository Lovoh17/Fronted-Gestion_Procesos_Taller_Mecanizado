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