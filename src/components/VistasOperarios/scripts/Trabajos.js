import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  setup() {
    // Store
    const authStore = useAuthStore()

    // Reactive data
    const loading = ref(false)
    const trabajos = ref([])
    const filtroEstado = ref('')
    const showModal = ref(false)
    const trabajoSeleccionado = ref(null)

    // Computed properties
    const trabajosPendientes = computed(() => 
      trabajos.value.filter(t => t.estado === 'pendiente').length
    )

    const trabajosEnProceso = computed(() => 
      trabajos.value.filter(t => t.estado === 'en_proceso').length
    )

    const trabajosCompletados = computed(() => 
      trabajos.value.filter(t => t.estado === 'completado' && isToday(t.fechaCompletado)).length
    )

    const trabajosFiltrados = computed(() => {
      if (!filtroEstado.value) return trabajos.value
      return trabajos.value.filter(t => t.estado === filtroEstado.value)
    })

    const estadisticasTotales = computed(() => ({
      total: trabajos.value.length,
      pendientes: trabajosPendientes.value,
      enProceso: trabajosEnProceso.value,
      completados: trabajosCompletados.value,
      porcentajeCompletados: trabajos.value.length > 0 
        ? Math.round((trabajosCompletados.value / trabajos.value.length) * 100) 
        : 0
    }))

    const trabajosUrgentes = computed(() => 
      trabajos.value.filter(t => t.prioridad === 'alta' && t.estado !== 'completado')
    )

    // Methods - API calls
    const loadTrabajos = async () => {
      try {
        loading.value = true
        const operarioId = authStore.user?.id

        if (!operarioId) {
          console.warn('No hay usuario autenticado')
          loadMockData()
          return
        }

        const response = await fetch(`/api/Trabajos/Operario/${operarioId}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        trabajos.value = data || []
        
        console.log(`Cargados ${trabajos.value.length} trabajos para operario ${operarioId}`)
      } catch (error) {
        console.error('Error cargando trabajos:', error)
        console.log('Cargando datos de ejemplo para desarrollo...')
        loadMockData()
      } finally {
        loading.value = false
      }
    }

    const loadMockData = () => {
      // Datos de ejemplo más completos para desarrollo
      trabajos.value = [
        {
          id: 1,
          titulo: 'Reparación de Motor Principal',
          descripcion: 'Revisar y reparar motor de vehículo modelo 2020. Incluye cambio de componentes defectuosos y ajuste de parámetros.',
          estado: 'pendiente',
          prioridad: 'alta',
          fechaAsignacion: '2024-06-20',
          tiempoEstimado: 4.5,
          cliente: 'Juan Pérez García',
          herramientasRequeridas: [
            { id: 1, nombre: 'Llave inglesa set completo' },
            { id: 2, nombre: 'Destornillador de precisión' },
            { id: 3, nombre: 'Multímetro digital' }
          ],
          notas: 'Cliente reporta ruidos extraños y pérdida de potencia'
        },
        {
          id: 2,
          titulo: 'Cambio de Aceite y Filtros',
          descripcion: 'Cambio de aceite motor, filtro de aceite, filtro de aire y revisión general del sistema',
          estado: 'en_proceso',
          prioridad: 'media',
          fechaAsignacion: '2024-06-21',
          fechaInicio: '2024-06-21T08:30:00',
          tiempoEstimado: 1.5,
          cliente: 'María González López',
          herramientasRequeridas: [
            { id: 4, nombre: 'Llave de filtro' },
            { id: 5, nombre: 'Bandeja de drenaje' }
          ],
          progreso: 60
        },
        {
          id: 3,
          titulo: 'Revisión Sistema Eléctrico',
          descripcion: 'Diagnóstico completo del sistema eléctrico del vehículo, revisión de batería, alternador y sistema de luces',
          estado: 'completado',
          prioridad: 'media',
          fechaAsignacion: '2024-06-19',
          fechaInicio: '2024-06-19T09:00:00',
          fechaCompletado: new Date().toISOString(),
          tiempoEstimado: 2,
          tiempoReal: 1.8,
          cliente: 'Carlos Rodríguez',
          herramientasRequeridas: [
            { id: 6, nombre: 'Multímetro' },
            { id: 7, nombre: 'Probador de batería' }
          ],
          calificacionCliente: 5
        },
        {
          id: 4,
          titulo: 'Reparación Sistema de Frenos',
          descripcion: 'Cambio de pastillas de freno delanteras y revisión del sistema hidráulico completo',
          estado: 'pendiente',
          prioridad: 'alta',
          fechaAsignacion: '2024-06-22',
          tiempoEstimado: 3,
          cliente: 'Ana Martín',
          herramientasRequeridas: [
            { id: 8, nombre: 'Gato hidráulico' },
            { id: 9, nombre: 'Llave de ruedas' },
            { id: 10, nombre: 'Sangrador de frenos' }
          ],
          notas: 'URGENTE: Cliente reporta ruidos al frenar'
        },
        {
          id: 5,
          titulo: 'Mantenimiento Preventivo Básico',
          descripcion: 'Mantenimiento rutinario de 10,000 km: aceite, filtros, revisión general',
          estado: 'pendiente',
          prioridad: 'baja',
          fechaAsignacion: '2024-06-23',
          tiempoEstimado: 2,
          cliente: 'Roberto Silva',
          herramientasRequeridas: [
            { id: 11, nombre: 'Kit básico de herramientas' }
          ]
        }
      ]
    }

    const iniciarTrabajo = async (trabajoId) => {
      try {
        const trabajo = trabajos.value.find(t => t.id === trabajoId)
        if (!trabajo) {
          console.error('Trabajo no encontrado:', trabajoId)
          return
        }

        console.log(`Iniciando trabajo ${trabajoId}: ${trabajo.titulo}`)

        const response = await fetch(`/api/Trabajos/${trabajoId}/iniciar`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            fechaInicio: new Date().toISOString(),
            operarioId: authStore.user?.id
          })
        })

        if (response.ok) {
          trabajo.estado = 'en_proceso'
          trabajo.fechaInicio = new Date().toISOString()
          console.log(`Trabajo ${trabajoId} iniciado exitosamente`)
        } else {
          throw new Error(`Error ${response.status}: No se pudo iniciar el trabajo`)
        }
      } catch (error) {
        console.error('Error iniciando trabajo:', error)
        // Para desarrollo, actualizar el estado localmente
        const trabajo = trabajos.value.find(t => t.id === trabajoId)
        if (trabajo) {
          trabajo.estado = 'en_proceso'
          trabajo.fechaInicio = new Date().toISOString()
        }
      }
    }

    const completarTrabajo = async (trabajoId) => {
      try {
        const trabajo = trabajos.value.find(t => t.id === trabajoId)
        if (!trabajo) {
          console.error('Trabajo no encontrado:', trabajoId)
          return
        }

        console.log(`Completando trabajo ${trabajoId}: ${trabajo.titulo}`)

        const response = await fetch(`/api/Trabajos/${trabajoId}/completar`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify({
            fechaCompletado: new Date().toISOString(),
            operarioId: authStore.user?.id,
            notas: 'Trabajo completado satisfactoriamente'
          })
        })

        if (response.ok) {
          trabajo.estado = 'completado'
          trabajo.fechaCompletado = new Date().toISOString()
          if (trabajo.fechaInicio) {
            const inicio = new Date(trabajo.fechaInicio)
            const fin = new Date()
            trabajo.tiempoReal = ((fin - inicio) / (1000 * 60 * 60)).toFixed(1) // Horas
          }
          console.log(`Trabajo ${trabajoId} completado exitosamente`)
        } else {
          throw new Error(`Error ${response.status}: No se pudo completar el trabajo`)
        }
      } catch (error) {
        console.error('Error completando trabajo:', error)
        // Para desarrollo, actualizar el estado localmente
        const trabajo = trabajos.value.find(t => t.id === trabajoId)
        if (trabajo) {
          trabajo.estado = 'completado'
          trabajo.fechaCompletado = new Date().toISOString()
        }
      }
    }

    const pausarTrabajo = async (trabajoId) => {
      try {
        const trabajo = trabajos.value.find(t => t.id === trabajoId)
        if (!trabajo) return

        const response = await fetch(`/api/Trabajos/${trabajoId}/pausar`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          trabajo.estado = 'pausado'
          console.log(`Trabajo ${trabajoId} pausado`)
        }
      } catch (error) {
        console.error('Error pausando trabajo:', error)
      }
    }

    const reanudarTrabajo = async (trabajoId) => {
      try {
        const trabajo = trabajos.value.find(t => t.id === trabajoId)
        if (!trabajo) return

        const response = await fetch(`/api/Trabajos/${trabajoId}/reanudar`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        if (response.ok) {
          trabajo.estado = 'en_proceso'
          console.log(`Trabajo ${trabajoId} reanudado`)
        }
      } catch (error) {
        console.error('Error reanudando trabajo:', error)
      }
    }

    // Methods - UI interactions
    const verDetalles = (trabajo) => {
      trabajoSeleccionado.value = { ...trabajo } // Crear copia para evitar mutaciones
      showModal.value = true
      console.log('Mostrando detalles del trabajo:', trabajo.titulo)
    }

    const closeModal = () => {
      showModal.value = false
      trabajoSeleccionado.value = null
    }

    const filtrarTrabajos = () => {
      console.log('Filtrando trabajos por estado:', filtroEstado.value)
      // La filtración se maneja automáticamente por el computed property
    }

    const resetFiltros = () => {
      filtroEstado.value = ''
      console.log('Filtros reseteados')
    }

    // Utility methods
    const getEstadoText = (estado) => {
      const estados = {
        pendiente: 'Pendiente',
        en_proceso: 'En Proceso',
        pausado: 'Pausado',
        completado: 'Completado',
        cancelado: 'Cancelado'
      }
      return estados[estado] || estado
    }

    const getEstadoClass = (estado) => {
      const clases = {
        pendiente: 'status-pending',
        en_proceso: 'status-progress',
        pausado: 'status-paused',
        completado: 'status-completed',
        cancelado: 'status-cancelled'
      }
      return clases[estado] || 'status-default'
    }

    const getPrioridadText = (prioridad) => {
      const prioridades = {
        baja: 'Baja',
        media: 'Media',
        alta: 'Alta',
        critica: 'Crítica'
      }
      return prioridades[prioridad] || prioridad
    }

    const getPrioridadClass = (prioridad) => {
      const clases = {
        baja: 'priority-low',
        media: 'priority-medium',
        alta: 'priority-high',
        critica: 'priority-critical'
      }
      return clases[prioridad] || 'priority-default'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No definida'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Error formateando fecha:', error)
        return 'Fecha inválida'
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'No definida'
      
      try {
        const date = new Date(dateString)
        return date.toLocaleString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('Error formateando fecha y hora:', error)
        return 'Fecha inválida'
      }
    }

    const formatDuration = (hours) => {
      if (!hours) return '0h'
      
      const h = Math.floor(hours)
      const m = Math.round((hours - h) * 60)
      
      if (h === 0) return `${m}min`
      if (m === 0) return `${h}h`
      return `${h}h ${m}min`
    }

    const isToday = (dateString) => {
      if (!dateString) return false
      
      try {
        const today = new Date().toDateString()
        const date = new Date(dateString).toDateString()
        return today === date
      } catch (error) {
        return false
      }
    }

    const isOverdue = (trabajo) => {
      if (!trabajo.fechaLimite || trabajo.estado === 'completado') return false
      
      try {
        const limite = new Date(trabajo.fechaLimite)
        const ahora = new Date()
        return ahora > limite
      } catch (error) {
        return false
      }
    }

    const getTimeRemaining = (trabajo) => {
      if (!trabajo.fechaLimite || trabajo.estado === 'completado') return null
      
      try {
        const limite = new Date(trabajo.fechaLimite)
        const ahora = new Date()
        const diff = limite - ahora
        
        if (diff <= 0) return 'Vencido'
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        if (days > 0) return `${days}d ${hours}h`
        return `${hours}h`
      } catch (error) {
        return null
      }
    }

    const getProgressPercentage = (trabajo) => {
      if (trabajo.estado === 'completado') return 100
      if (trabajo.estado === 'pendiente') return 0
      if (trabajo.progreso) return trabajo.progreso
      
      // Calcular progreso basado en tiempo transcurrido vs tiempo estimado
      if (trabajo.fechaInicio && trabajo.tiempoEstimado) {
        const inicio = new Date(trabajo.fechaInicio)
        const ahora = new Date()
        const tiempoTranscurrido = (ahora - inicio) / (1000 * 60 * 60) // horas
        const progreso = Math.min((tiempoTranscurrido / trabajo.tiempoEstimado) * 100, 95)
        return Math.round(progreso)
      }
      
      return 25 // Progreso por defecto para trabajos en proceso
    }

    // Refresh and auto-update
    const refreshTrabajos = async () => {
      console.log('Refrescando lista de trabajos...')
      await loadTrabajos()
    }

    const startAutoRefresh = () => {
      // Actualizar cada 5 minutos
      setInterval(() => {
        if (!loading.value) {
          refreshTrabajos()
        }
      }, 5 * 60 * 1000)
    }

    // Lifecycle
    onMounted(async () => {
      console.log('Componente Trabajos montado')
      await loadTrabajos()
      startAutoRefresh()
    })

    // Return all reactive data and methods for the template
    return {
      // Reactive data
      loading,
      trabajos,
      filtroEstado,
      showModal,
      trabajoSeleccionado,
      
      // Computed properties
      trabajosPendientes,
      trabajosEnProceso,
      trabajosCompletados,
      trabajosFiltrados,
      estadisticasTotales,
      trabajosUrgentes,
      
      // API methods
      loadTrabajos,
      iniciarTrabajo,
      completarTrabajo,
      pausarTrabajo,
      reanudarTrabajo,
      refreshTrabajos,
      
      // UI methods
      verDetalles,
      closeModal,
      filtrarTrabajos,
      resetFiltros,
      
      // Utility methods
      getEstadoText,
      getEstadoClass,
      getPrioridadText,
      getPrioridadClass,
      formatDate,
      formatDateTime,
      formatDuration,
      isToday,
      isOverdue,
      getTimeRemaining,
      getProgressPercentage
    }
  }
}
