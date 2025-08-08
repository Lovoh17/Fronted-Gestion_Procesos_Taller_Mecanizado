import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/GlobalComponents/SidebarCoordinador.vue'

export default {
  name: 'PedidosCalendario',
  components: {
    Sidebar
  },
  setup() {
    const currentDate = ref(new Date())
    const pedidos = ref([])
    const loading = ref(true)
    const error = ref(null)

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    const estados = {
      1: { nombre: 'Pendiente', class: 'estado-pendiente' },
      2: { nombre: 'En Proceso', class: 'estado-proceso' },
      3: { nombre: 'Completado', class: 'estado-completado' },
      4: { nombre: 'Cancelado', class: 'estado-cancelado' }
    }

    const prioridades = {
      1: { nombre: 'Alta', class: 'prioridad-alta' },
      2: { nombre: 'Media', class: 'prioridad-media' },
      3: { nombre: 'Baja', class: 'prioridad-baja' }
    }

    // Computed properties
    const fechaFormateada = computed(() => {
      return currentDate.value.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
      })
    })

    const primerDiaDelMes = computed(() => {
      return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
    })

    const ultimoDiaDelMes = computed(() => {
      return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
    })

    const primerDiaDeLaSemana = computed(() => {
      return primerDiaDelMes.value.getDay()
    })

    const diasCalendario = computed(() => {
      const days = []
      const totalDays = ultimoDiaDelMes.value.getDate()

      // Días vacíos al inicio
      for (let i = 0; i < primerDiaDeLaSemana.value; i++) {
        days.push(null)
      }

      // Días del mes
      for (let day = 1; day <= totalDays; day++) {
        days.push(day)
      }

      return days
    })

    // Methods
    const cargarPedidos = async () => {
      try {
        loading.value = true
        error.value = null

        const response = await fetch('/api/Pedido')
        if (!response.ok) {
          throw new Error(`Error al cargar los pedidos: ${response.status}`)
        }

        const data = await response.json()
        pedidos.value = data
      } catch (err) {
        console.error('Error al cargar pedidos:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const navegarMes = (direccion) => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + direccion,
        1
      )
    }

    const irHoy = () => {
      currentDate.value = new Date()
    }

    const esHoy = (day) => {
      if (!day) return false
      const today = new Date()
      return day === today.getDate() &&
        currentDate.value.getMonth() === today.getMonth() &&
        currentDate.value.getFullYear() === today.getFullYear()
    }

    const getPedidosDelDia = (day) => {
      if (!day) return []

      const fecha = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
      const fechaStr = fecha.toISOString().split('T')[0]

      return pedidos.value.filter(pedido => {
        const fechaSolicitud = new Date(pedido.fecha_solicitud).toISOString().split('T')[0]
        const fechaRequerida = pedido.fecha_requerida
        const fechaEstimada = pedido.fecha_estimada_entrega
        const fechaCompletado = pedido.fecha_completado ?
          new Date(pedido.fecha_completado).toISOString().split('T')[0] : null

        return fechaSolicitud === fechaStr ||
          fechaRequerida === fechaStr ||
          fechaEstimada === fechaStr ||
          fechaCompletado === fechaStr
      })
    }

    const obtenerIconoEstado = (estadoId) => {
      switch (estadoId) {
        case 1: return 'fas fa-clock'
        case 2: return 'fas fa-box'
        case 3: return 'fas fa-check-circle'
        case 4: return 'fas fa-times-circle'
        default: return 'fas fa-calendar'
      }
    }

    const obtenerTooltip = (pedido) => {
      return `${pedido.codigo_pedido} - ${pedido.notas || 'Sin notas'}`
    }

    const contarPedidosPorEstado = (estadoId) => {
      return pedidos.value.filter(p => p.estado_id === estadoId).length
    }

    // Lifecycle
    onMounted(() => {
      cargarPedidos()
    })

    return {
      currentDate,
      pedidos,
      loading,
      error,
      diasSemana,
      estados,
      prioridades,
      fechaFormateada,
      diasCalendario,
      cargarPedidos,
      navegarMes,
      irHoy,
      esHoy,
      getPedidosDelDia,
      obtenerIconoEstado,
      obtenerTooltip,
      contarPedidosPorEstado
    }
  }
}