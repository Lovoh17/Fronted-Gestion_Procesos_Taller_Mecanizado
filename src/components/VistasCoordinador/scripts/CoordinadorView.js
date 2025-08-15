import { ref, computed, onMounted } from 'vue'

// Componentes
import Sidebar from '@/components/GlobalComponents/SidebarCoordinador.vue'
import LiveProductionStats from '@/components/VistasCoordinador/ComponentesCoordinador/LiveProductionStats.vue'
import OrderGanttChart from '@/components/VistasCoordinador/ComponentesCoordinador/OrderGanttChart.vue'
import MachineStatusGrid from '@/components/VistasCoordinador/ComponentesCoordinador/MachineStatusGrid.vue'

export default {
  components: {
    Sidebar,
    LiveProductionStats,
    OrderGanttChart,
    MachineStatusGrid
  },
  
  setup() {
    // Reactive data
    const selectedOrder = ref(null)
    const selectedPeriod = ref('today')
    const showNewMessageModal = ref(false)

    // Datos simulados - Métricas principales
    const uptime = ref('24h 15m')
    const efficiency = ref(87)
    const peakProduction = ref('142 unidades')
    const averageDaily = ref('98 unidades')

    // Alertas críticas
    const criticalAlerts = ref([
      { 
        id: 1, 
        type: 'machine', 
        title: 'Máquina 03 requiere mantenimiento', 
        timestamp: new Date() 
      },
      { 
        id: 2, 
        type: 'quality', 
        title: 'Falla en control de calidad Línea B', 
        timestamp: new Date() 
      }
    ])

    // Miembros del equipo
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
      },
      { 
        id: 3, 
        name: 'María Fernández', 
        avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg',
        tasksCompleted: 12, 
        efficiency: 95, 
        status: 'active' 
      }
    ])

    // Mantenimientos próximos
    const upcomingMaintenance = ref([
      { 
        id: 1, 
        machineName: 'Línea de Producción A', 
        type: 'Mantenimiento Preventivo',
        date: new Date(2025, 5, 26),
        priority: 'high',
        daysRemaining: 2
      },
      { 
        id: 2, 
        machineName: 'Máquina CNC-02', 
        type: 'Calibración',
        date: new Date(2025, 5, 28),
        priority: 'medium',
        daysRemaining: 4
      },
      { 
        id: 3, 
        machineName: 'Sistema de Transporte', 
        type: 'Inspección',
        date: new Date(2025, 6, 2),
        priority: 'low',
        daysRemaining: 9
      }
    ])

    // Mensajes recientes
    const recentMessages = ref([
      {
        id: 1,
        sender: { 
          name: 'María Rodríguez', 
          avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg' 
        },
        preview: 'Necesitamos revisar el cronograma de producción para la próxima semana...',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        sender: { 
          name: 'Pedro Martínez', 
          avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg' 
        },
        preview: 'Reporte de calidad completado. Todo en orden.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        read: true
      },
      {
        id: 3,
        sender: { 
          name: 'Ana García', 
          avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg' 
        },
        preview: '¿Podemos agendar una reunión para revisar los nuevos protocolos?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        read: false
      }
    ])

    // Eventos próximos
    const upcomingEvents = ref([
      {
        id: 1,
        title: 'Reunión de Coordinación',
        location: 'Sala de Juntas A',
        startTime: new Date(2025, 5, 24, 14, 30),
        duration: '1h 30m',
        type: 'meeting'
      },
      {
        id: 2,
        title: 'Mantenimiento Preventivo',
        location: 'Planta de Producción',
        startTime: new Date(2025, 5, 25, 8, 0),
        duration: '4h',
        type: 'maintenance'
      },
      {
        id: 3,
        title: 'Entrega Cliente Premium',
        location: 'Almacén Principal',
        startTime: new Date(2025, 5, 26, 16, 0),
        duration: '2h',
        type: 'deadline'
      }
    ])

    // Períodos de tiempo para filtros
    const timePeriods = ref([
      { label: 'Hoy', value: 'today' },
      { label: '7 días', value: 'week' },
      { label: '30 días', value: 'month' },
      { label: '3 meses', value: 'quarter' }
    ])

    // Datos simulados adicionales
    const activeOrders = ref([])
    const machineStatus = ref([])
    const pendingTasks = ref([])
    const machines = ref([])
    const filteredOrders = ref([])
    const lowStockItems = ref([])
    const qualityChecks = ref([])
    const currentUser = ref({
      name: 'Coordinador Principal',
      avatar: 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg',
      role: 'coordinator'
    })
    const pendingTasksCount = ref(5)
    const quickActions = ref([
      { id: 1, label: 'Nuevo Pedido', icon: 'fas fa-plus', action: 'new-order' },
      { id: 2, label: 'Asignar Tarea', icon: 'fas fa-tasks', action: 'assign-task' },
      { id: 3, label: 'Ver Reportes', icon: 'fas fa-chart-bar', action: 'view-reports' }
    ])

    // Computed properties
    const unreadMessagesCount = computed(() => {
      return recentMessages.value.filter(message => !message.read).length
    })

    const urgentMaintenanceCount = computed(() => {
      return upcomingMaintenance.value.filter(m => m.daysRemaining <= 3).length
    })

    const teamEfficiencyAverage = computed(() => {
      if (teamMembers.value.length === 0) return 0
      const total = teamMembers.value.reduce((sum, member) => sum + member.efficiency, 0)
      return Math.round(total / teamMembers.value.length)
    })

    // Methods
    const showOrderDetails = (order) => {
      selectedOrder.value = order
      console.log('Showing order details for:', order)
    }

    const openMaintenanceForm = (machine) => {
      console.log('Opening maintenance form for machine:', machine)
      // Lógica para abrir formulario de mantenimiento
      // Aquí se podría abrir un modal o navegar a una nueva vista
    }

    const setDefaultAvatar = (event) => {
      event.target.src = 'https://cdnjs.cloudflare.com/ajax/libs/heroicons/2.0.18/24/solid/user-circle.svg'
    }

    const getAlertIcon = (type) => {
      const icons = {
        machine: 'fas fa-cog',
        quality: 'fas fa-shield-alt',
        inventory: 'fas fa-boxes',
        deadline: 'fas fa-clock',
        maintenance: 'fas fa-wrench',
        safety: 'fas fa-hard-hat'
      }
      return icons[type] || 'fas fa-exclamation-triangle'
    }

    const formatTime = (timestamp) => {
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp)
    }

    const formatDateTime = (timestamp) => {
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(timestamp)
    }

    const getDayFromDate = (date) => {
      return date.getDate()
    }

    const getMonthFromDate = (date) => {
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
      return months[date.getMonth()]
    }

    const getUrgencyClass = (days) => {
      if (days <= 1) return 'urgent'
      if (days <= 3) return 'warning'
      if (days <= 7) return 'normal'
      return 'low-priority'
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
        deadline: 'fas fa-flag',
        training: 'fas fa-graduation-cap',
        inspection: 'fas fa-search'
      }
      return icons[type] || 'fas fa-calendar'
    }

    const openNewMessage = () => {
      showNewMessageModal.value = true
    }

    const closeNewMessage = () => {
      showNewMessageModal.value = false
    }

    const handleQuickAction = (action) => {
      console.log('Quick action triggered:', action)
      switch (action) {
        case 'new-order':
          // Lógica para crear nuevo pedido
          break
        case 'assign-task':
          // Lógica para asignar tarea
          break
        case 'view-reports':
          // Lógica para ver reportes
          break
        default:
          console.log('Unknown action:', action)
      }
    }

    const openTaskDetail = (task) => {
      console.log('Opening task detail:', task)
      // Lógica para abrir detalle de tarea
    }

    const initReorderProcess = (item) => {
      console.log('Initiating reorder process for:', item)
      // Lógica para proceso de reorden
    }

    const recordQualityCheck = (check) => {
      console.log('Recording quality check:', check)
      // Lógica para registrar verificación de calidad
    }

    const refreshDashboard = () => {
      console.log('Refreshing dashboard data...')
      // Lógica para refrescar datos del dashboard
      // Aquí se harían llamadas a APIs para obtener datos actualizados
    }

    const updateSelectedPeriod = (period) => {
      selectedPeriod.value = period
      console.log('Updated time period to:', period)
      // Aquí se actualizarían los datos según el período seleccionado
    }

    // Lifecycle hooks
    onMounted(() => {
      console.log('CoordinadorView mounted')
      refreshDashboard()
      
      // Configurar actualizaciones automáticas cada 30 segundos
      setInterval(() => {
        refreshDashboard()
      }, 30000)
    })

    // Return all reactive data and methods for the template
    return {
      // Reactive data
      selectedOrder,
      selectedPeriod,
      showNewMessageModal,
      uptime,
      efficiency,
      peakProduction,
      averageDaily,
      criticalAlerts,
      teamMembers,
      upcomingMaintenance,
      recentMessages,
      upcomingEvents,
      timePeriods,
      activeOrders,
      machineStatus,
      pendingTasks,
      machines,
      filteredOrders,
      lowStockItems,
      qualityChecks,
      currentUser,
      pendingTasksCount,
      quickActions,
      
      // Computed properties
      unreadMessagesCount,
      urgentMaintenanceCount,
      teamEfficiencyAverage,
      
      // Methods
      showOrderDetails,
      openMaintenanceForm,
      setDefaultAvatar,
      getAlertIcon,
      formatTime,
      formatDateTime,
      getDayFromDate,
      getMonthFromDate,
      getUrgencyClass,
      formatEventTime,
      getEventIcon,
      openNewMessage,
      closeNewMessage,
      handleQuickAction,
      openTaskDetail,
      initReorderProcess,
      recordQualityCheck,
      refreshDashboard,
      updateSelectedPeriod
    }
  }
}
