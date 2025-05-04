// stores/production.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductionStore = defineStore('production', () => {
  // Datos fijos de ejemplo
  const machines = ref([
    {
      id: 'm-001',
      name: 'Torno CNC HAAS ST-20',
      type: 'cnc',
      status: 'running',
      uptime: 95,
      downtime: 5,
      lastMaintenance: '2023-05-10',
      nextMaintenance: '2023-06-15',
      utilization: 88,
      currentOrder: 'ORD-1001'
    },
    {
      id: 'm-002',
      name: 'Fresadora Vertical Mazak',
      type: 'milling',
      status: 'idle',
      uptime: 85,
      downtime: 15,
      lastMaintenance: '2023-05-05',
      nextMaintenance: '2023-06-10',
      utilization: 75,
      currentOrder: null
    },
    {
      id: 'm-003',
      name: 'Soldadora Lincoln Electric',
      type: 'welder',
      status: 'maintenance',
      uptime: 70,
      downtime: 30,
      lastMaintenance: '2023-05-20',
      nextMaintenance: '2023-05-25',
      utilization: 65,
      currentOrder: null
    }
  ])

  const orders = ref([
    {
      id: 'ORD-1001',
      client: 'MetalWorks Inc.',
      product: 'Eje de transmisión',
      quantity: 50,
      status: 'in_progress',
      dueDate: '2023-06-10',
      progress: 65,
      machineId: 'm-001',
      priority: 'high'
    },
    {
      id: 'ORD-1002',
      client: 'AutoParts SA',
      product: 'Bracket de suspensión',
      quantity: 120,
      status: 'pending',
      dueDate: '2023-06-15',
      progress: 0,
      machineId: null,
      priority: 'medium'
    }
  ])

  const alerts = ref([
    {
      id: 'alert-1',
      machineId: 'm-003',
      message: 'Reemplazo de boquilla requerido',
      level: 'critical',
      timestamp: '2023-05-22T10:30:00'
    },
    {
      id: 'alert-2',
      machineId: 'm-001',
      message: 'Nivel de aceite bajo',
      level: 'warning',
      timestamp: '2023-05-22T09:15:00'
    }
  ])

  const inventory = ref([
    {
      id: 'inv-001',
      name: 'Varilla de acero 1/2"',
      quantity: 120,
      minThreshold: 200,
      location: 'Almacén A'
    },
    {
      id: 'inv-002',
      name: 'Boquillas soldadura TIG',
      quantity: 8,
      minThreshold: 10,
      location: 'Almacén B'
    }
  ])

  // Estado computado
  const productionStatus = computed(() => {
    const hasStoppedMachines = machines.value.some(m => m.status === 'maintenance' && m.downtime > 20)
    const delayedOrders = orders.value.filter(o => 
      new Date(o.dueDate) < new Date() && o.status !== 'completed'
    ).length

    return hasStoppedMachines ? 'stopped' : 
           delayedOrders > 2 ? 'delayed' : 'normal'
  })

  // Getters
  const activeOrders = computed(() => 
    orders.value.filter(o => ['pending', 'in_progress'].includes(o.status))
  )

  const criticalAlerts = computed(() =>
    alerts.value.filter(a => a.level === 'critical')
  )

  const machineStatus = computed(() =>
    machines.value.map(machine => ({
      ...machine,
      statusLabel: getMachineStatusLabel(machine.status),
      oee: calculateOEE(machine)
    }))
  )

  const lowStockItems = computed(() =>
    inventory.value.filter(item => item.quantity < item.minThreshold)
  )

  // Métodos
  const calculateOEE = (machine) => {
    const availability = (machine.uptime / (machine.uptime + machine.downtime)) * 100
    const performance = machine.utilization
    const quality = 98 // Asumimos 98% de calidad (valor fijo para ejemplo)
    return Math.round((availability * performance * quality) / 10000) // Normalizado a 0-100
  }

  const getMachineStatusLabel = (status) => {
    const statusMap = {
      running: 'En operación',
      idle: 'Inactiva',
      maintenance: 'En mantenimiento',
      down: 'Detenida'
    }
    return statusMap[status] || 'Desconocido'
  }

  // Simular carga asíncrona
  const fetchProductionData = async () => {
    return new Promise(resolve => {
      setTimeout(resolve, 500) // Simula delay de red
    })
  }

  // Simular solicitud de mantenimiento
  const requestMaintenance = (machineId, issue) => {
    const machine = machines.value.find(m => m.id === machineId)
    if (machine) {
      machine.status = 'maintenance'
      alerts.value.push({
        id: `alert-${Date.now()}`,
        machineId,
        message: issue,
        level: 'info',
        timestamp: new Date().toISOString()
      })
      return Promise.resolve()
    }
    return Promise.reject('Máquina no encontrada')
  }

  return {
    // Estado
    machines,
    orders,
    alerts,
    inventory,
    productionStatus,
    
    // Getters
    activeOrders,
    criticalAlerts,
    machineStatus,
    lowStockItems,
    
    // Acciones
    fetchProductionData,
    requestMaintenance
  }
})