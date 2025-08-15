export default {
  name: 'MaintenanceDetailsModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    maintenance: {
      type: Object,
      default: null
    },
    herramientas: {
      type: Array,
      default: () => []
    },
    tipoMantenimientos: {
      type: Array,
      default: () => []
    },
    estadosMantenimiento: {
      type: Array,
      default: () => []
    },
    prioridadesMantenimiento: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'edit'],
  data() {
    return {
      showAdditionalDetails: false
    }
  },
  methods: {
    closeModal() {
      this.showAdditionalDetails = false
      this.$emit('close')
    },

    editMaintenance() {
      this.$emit('edit', this.maintenance)
      this.closeModal()
    },

    formatDate(dateString) {
      if (!dateString) return 'No especificada'
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    formatStatus(statusId) {
      if (!statusId) return 'Sin estado'

      const estado = this.estadosMantenimiento.find(e => e.id === parseInt(statusId))
      return estado?.nombre_estado || 'Estado desconocido'
    },

    formatPriority(priorityId) {
      if (!priorityId) return 'Sin prioridad'

      const prioridad = this.prioridadesMantenimiento.find(p => p.id === parseInt(priorityId))
      return prioridad?.nombre_prioridad || 'Prioridad desconocida'
    },

    getPriorityClass(priorityId) {
      const prioridad = this.prioridadesMantenimiento.find(p => p.id === parseInt(priorityId))
      const priorityMap = {
        'Crítica': 'critica',
        'Alta': 'alta',
        'Media': 'media',
        'Baja': 'baja',
        'Programada': 'programada'
      }
      return priorityMap[prioridad?.nombre_prioridad] || 'baja'
    },

    getStatusClass(statusId) {
      const estado = this.estadosMantenimiento.find(e => e.id === parseInt(statusId))
      const statusMap = {
        'Pendiente': 'programado',
        'En Proceso': 'en_progreso',
        'Completado': 'completado',
        'Cancelado': 'cancelado',
        'Reprogramado': 'programado'
      }
      return statusMap[estado?.nombre_estado] || 'programado'
    },

    getHerramientaNombre(herramientaId) {
      const herramienta = this.herramientas.find(h => h.id === herramientaId)
      return herramienta?.nombre || 'Herramienta desconocida'
    },

    getTipoMantenimientoNombre(tipoId) {
      const tipo = this.tipoMantenimientos.find(t => t.id === tipoId)
      return tipo?.nombre || 'Tipo desconocido'
    },

    // Métodos para colores de badges de Vuestic
    getPriorityColor(priorityId) {
      const prioridad = this.prioridadesMantenimiento.find(p => p.id === parseInt(priorityId))
      const colorMap = {
        'Crítica': 'danger',
        'Alta': 'danger',
        'Media': 'warning',
        'Baja': 'success',
        'Programada': 'info'
      }
      return colorMap[prioridad?.nombre_prioridad] || 'success'
    },

    getStatusColor(statusId) {
      const estado = this.estadosMantenimiento.find(e => e.id === parseInt(statusId))
      const colorMap = {
        'Pendiente': 'info',
        'En Proceso': 'warning',
        'Completado': 'success',
        'Cancelado': 'danger',
        'Reprogramado': 'info'
      }
      return colorMap[estado?.nombre_estado] || 'info'
    }
  },

  watch: {
    visible(newVal) {
      if (newVal) {
        // Reset additional details when modal opens
        this.showAdditionalDetails = false
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden'
      } else {
        // Restore body scrolling when modal closes
        document.body.style.overflow = 'auto'
      }
    }
  },

  beforeUnmount() {
    // Ensure body scrolling is restored if component is destroyed
    document.body.style.overflow = 'auto'
  }
}
