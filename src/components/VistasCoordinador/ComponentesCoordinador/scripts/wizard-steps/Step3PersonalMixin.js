export default {
  data() {
    return {
      // Opciones para selects del paso 3
      supervisoresOptions: [
        { id: 1, nombre: 'Juan Pérez - Supervisor Senior' },
        { id: 2, nombre: 'María González - Supervisora de Calidad' },
        { id: 3, nombre: 'Carlos López - Supervisor de Producción' }
      ],
      tecnicosOptions: [
        { id: 1, nombre: 'Ana Martínez - Técnico Especialista' },
        { id: 2, nombre: 'Luis Rivera - Técnico Senior' },
        { id: 3, nombre: 'Pedro Jiménez - Técnico Junior' },
        { id: 4, nombre: 'Sofia Castro - Técnico Especialista' }
      ],
    }
  },

  computed: {
    totalHorasAsignadas() {
      return this.formData.tecnicos_asignados.reduce((total, asignacion) => {
        return total + (parseFloat(asignacion.horas_asignadas) || 0)
      }, 0)
    }
  },

  methods: {
    // === Métodos del Paso 3: Personal ===
    validateStep3() {
      if (!this.formData.supervisor_id) {
        this.showValidationError('Debe asignar un supervisor')
        return false
      }

      // Validar que al menos un técnico esté asignado
      const tecnicosValidos = this.formData.tecnicos_asignados.filter(
        t => t.tecnico_id && t.horas_asignadas > 0
      )
      if (tecnicosValidos.length === 0) {
        this.showValidationError('Debe asignar al menos un técnico con horas')
        return false
      }
      return true
    },

    addTecnico() {
      this.formData.tecnicos_asignados.push({
        tecnico_id: null,
        horas_asignadas: 0
      })
    },

    removeTecnico(index) {
      if (this.formData.tecnicos_asignados.length > 1) {
        this.formData.tecnicos_asignados.splice(index, 1)
      }
    },

    getSupervisorNombre() {
      const supervisor = this.supervisoresOptions.find(s => s.id === this.formData.supervisor_id)
      return supervisor ? supervisor.nombre : 'N/A'
    },

    getTecnicoNombre(tecnicoId) {
      const tecnico = this.tecnicosOptions.find(t => t.id === tecnicoId)
      return tecnico ? tecnico.nombre : 'Técnico no seleccionado'
    },

    getFechaInicioEstimada() {
      const hoy = new Date()
      const estimada = new Date(hoy.getTime() + (3 * 24 * 60 * 60 * 1000)) // +3 días
      return this.formatDate(estimada)
    },

    getDuracionEstimada() {
      // Estimación basada en horas totales
      const diasEstimados = Math.ceil(this.totalHorasAsignadas / 8)
      return diasEstimados
    }
  }
}
