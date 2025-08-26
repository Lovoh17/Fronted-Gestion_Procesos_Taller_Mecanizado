import api from '../../../api.js'

export default {
  name: 'AlertaReparacion',
  data() {
    return {
      loading: false,
      searchQuery: '',
      showNewAlertModal: false,
      selectedAlert: null,
      alertas: [],
      herramientas: [],
      tiposAlertas: [],
      usuarios: [],

      tableColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          width: '80px'
        },
        {
          label: 'Herramienta',
          field: 'herramienta',
          sortable: false
        },
        {
          label: 'Tipo de Alerta',
          field: 'tipo_alerta',
          sortable: false
        },
        {
          label: 'Fecha Generación',
          field: 'fecha_generacion_formatted',
          sortable: true
        },
        {
          label: 'Fecha Límite',
          field: 'fecha_limite_formatted',
          sortable: true
        },
        {
          label: 'Prioridad',
          field: 'prioridad_id'
        },
        {
          label: 'Estado',
          field: 'estado_reparacion'
        },
        {
          label: 'Descripción',
          field: 'descripcion'
        },
        {
          label: 'Resuelta por',
          field: 'resuelta_por'
        },
        {
          label: 'Fecha Resolución',
          field: 'fecha_resolucion_formatted',
          sortable: true
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '150px'
        }
      ]
    }
  },

  computed: {
    filteredAlertas() {
      // Transform the data to include formatted dates
      return this.alertas.map(alert => ({
        ...alert,
        fecha_generacion_formatted: this.formatDate(alert.fecha_generacion),
        fecha_limite_formatted: this.formatDate(alert.fecha_limite),
        fecha_resolucion_formatted: this.formatDate(alert.fecha_resolucion)
      }))
    },

    totalAlertas() {
      return this.alertas.length
    },

    alertasPendientes() {
      return this.alertas.filter(alert => alert.estado_reparacion === '1').length
    },

    alertasEnReparacion() {
      return this.alertas.filter(alert => alert.estado_reparacion === '2').length
    },

    alertasResueltas() {
      return this.alertas.filter(alert => alert.estado_reparacion === '5').length
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    // Método helper para mostrar notificaciones
    showToast(message, color = 'info') {
      // Verificar si $va está disponible
      if (this.$va && this.$va.toast) {
        this.$va.toast({
          message,
          color
        })
      } else {
        // Fallback a console.log si $va no está disponible
        console.log(`[${color.toUpperCase()}] ${message}`)
      }
    },

    // Método helper para confirmar acciones
    async showConfirm(title, message, okText = 'Confirmar', cancelText = 'Cancelar') {
      if (this.$va && this.$va.confirm) {
        return await this.$va.confirm({
          title,
          message,
          okText,
          cancelText
        })
      } else {
        // Fallback a confirm nativo del navegador
        return confirm(`${title}\n\n${message}`)
      }
    },

    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadAlertas(),
          this.loadHerramientas(),
          this.loadTiposAlertas(),
          this.loadUsuarios()
        ])
      } catch (error) {
        console.error('Error cargando datos:', error)
        this.showToast('Error al cargar los datos', 'danger')
      } finally {
        this.loading = false
      }
    },

    async loadAlertas() {
      try {
        this.alertas = await api.get('/AlertaReparacion')
      } catch (error) {
        console.error('Error cargando alertas:', error)
        this.showToast(`Error al cargar las alertas: ${error.message}`, 'danger')
      }
    },

    async loadHerramientas() {
      try {
        this.herramientas = await api.get('/Herramienta')
      } catch (error) {
        console.error('Error cargando herramientas:', error)
        this.showToast(`Error al cargar las herramientas: ${error.message}`, 'danger')
      }
    },

    async loadTiposAlertas() {
      try {
        this.tiposAlertas = await api.get('/Tipos_Alertas')
      } catch (error) {
        console.error('Error cargando tipos de alertas:', error)
        this.showToast(`Error al cargar los tipos de alertas: ${error.message}`, 'danger')
      }
    },

    async loadUsuarios() {
      try {
        this.usuarios = await api.get('/usuario')
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        this.showToast(`Error al cargar los usuarios: ${error.message}`, 'danger')
      }
    },

    getUsuarioNombre(id) {
      const usuario = this.usuarios.find(u => u.id === id)
      return usuario ? `${usuario.nombre} ${usuario.apellido}` : '-'
    },

    // Métodos de formateo
    getTipoAlerta(id) {
      const tipo = this.tiposAlertas.find(t => t.id === id)
      return tipo ? tipo.nombre_alertas : `Tipo ${id}`
    },

    getHerramientaNombre(id) {
      const herramienta = this.herramientas.find(h => h.id === id)
      return herramienta ? herramienta.nombre : `Herramienta ${id}`
    },

    getEstadoText(estado) {
      const estados = {
        '1': 'Pendiente',
        '2': 'En Progreso',
        '3': 'En Revisión',
        '4': 'Pausado',
        '5': 'Resuelto'
      }
      return estados[estado] || `Estado ${estado}`
    },

    getEstadoClass(estado) {
      const classes = {
        '1': 'badge-warning',
        '2': 'badge-info',
        '3': 'badge-primary',
        '4': 'badge-secondary',
        '5': 'badge-success'
      }
      return classes[estado] || 'badge-secondary'
    },

    getPrioridadText(prioridad) {
      const prioridades = {
        '1': 'Muy Baja',
        '2': 'Baja',
        '3': 'Media',
        '4': 'Alta',
        '5': 'Muy Alta',
        '6': 'Crítica'
      }
      return prioridades[prioridad] || `Prioridad ${prioridad}`
    },

    getPrioridadClass(prioridad) {
      const classes = {
        '1': 'badge-secondary',
        '2': 'badge-info',
        '3': 'badge-warning',
        '4': 'badge-danger',
        '5': 'badge-danger',
        '6': 'badge-dark'
      }
      return classes[prioridad] || 'badge-secondary'
    },

    formatDate(date) {
      if (!date) return '-'
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('Error formateando fecha:', error)
        return date
      }
    },

    getDaysLeft(fechaLimite) {
      if (!fechaLimite) return ''
      try {
        const today = new Date()
        const limite = new Date(fechaLimite)
        const diffTime = limite - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} días`
        if (diffDays === 0) return 'Vence hoy'
        if (diffDays === 1) return 'Vence mañana'
        return `${diffDays} días restantes`
      } catch (error) {
        console.error('Error calculando días restantes:', error)
        return ''
      }
    },

    getDaysLeftClass(fechaLimite) {
      if (!fechaLimite) return ''
      try {
        const today = new Date()
        const limite = new Date(fechaLimite)
        const diffTime = limite - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return 'text-danger'
        if (diffDays <= 2) return 'text-warning'
        return 'text-success'
      } catch (error) {
        console.error('Error obteniendo clase de días restantes:', error)
        return ''
      }
    },

    // Métodos de acciones simplificados
    viewAlert(alert) {
      this.selectedAlert = alert
      this.showToast(`Viendo detalles de alerta ${alert.id}`, 'info')
      // Aquí podrías abrir un modal o navegar a una vista de detalles
    },

    editAlert(alert) {
      this.selectedAlert = alert
      this.showToast(`Editando alerta ${alert.id}`, 'primary')
      // Aquí podrías abrir un modal de edición o navegar a una vista de edición
    },

    async deleteAlert(alertId) {
      try {
        const confirmed = await this.showConfirm(
          'Eliminar Alerta',
          '¿Está seguro de que desea eliminar esta alerta? Esta acción no se puede deshacer.',
          'Sí, eliminar',
          'Cancelar'
        )

        if (confirmed) {
          // Llamada a la API para eliminar la alerta
          await api.delete(`/AlertaReparacion/${alertId}`)

          // Actualizar la lista local
          this.alertas = this.alertas.filter(alert => alert.id !== alertId)
          this.showToast('Alerta eliminada correctamente', 'success')
        }
      } catch (error) {
        console.error('Error eliminando alerta:', error)
        this.showToast('Error al eliminar la alerta', 'danger')
      }
    },

    exportToCSV() {
      try {
        // Lógica básica para exportar a CSV
        const headers = ['ID', 'Herramienta', 'Tipo', 'Fecha Generación', 'Estado', 'Prioridad']
        const data = this.alertas.map(alert => [
          alert.id,
          this.getHerramientaNombre(alert.herramienta_id),
          this.getTipoAlerta(alert.tipo_alerta_id),
          this.formatDate(alert.fecha_generacion),
          this.getEstadoText(alert.estado_reparacion),
          this.getPrioridadText(alert.prioridad_id)
        ])

        let csvContent = "data:text/csv;charset=utf-8,"
        csvContent += headers.join(",") + "\n"
        data.forEach(row => {
          csvContent += row.join(",") + "\n"
        })

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "alertas_reparacion.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.showToast('Alertas exportadas a CSV exitosamente', 'success')
      } catch (error) {
        console.error('Error exportando CSV:', error)
        this.showToast('Error al exportar las alertas', 'danger')
      }
    }
  }
}