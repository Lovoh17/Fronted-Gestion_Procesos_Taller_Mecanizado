import api from '@/api.js'

export default {
  name: 'AlertaReparacion',
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      searchQuery: '',
      showNewAlertModal: false,
      showViewModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedAlert: null,
      isEditing: false,
      alertToDelete: null,
      alertas: [],
      herramientas: [],
      tiposAlertas: [],
      usuarios: [],
      
      // Formulario para nueva/editar alerta
      alertForm: {
        herramienta_id: null,
        tipo_alerta_id: null,
        prioridad_id: null,
        estado_reparacion: '1',
        fecha_generacion: new Date().toISOString().split('T')[0],
        fecha_limite: null,
        fecha_resolucion: null,
        resuelta_por: null,
        descripcion: '',
        observaciones: ''
      },

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
    },

    // Opciones para los selects
    herramientaOptions() {
      return this.herramientas
    },

    tipoAlertaOptions() {
      return this.tiposAlertas
    },

    usuarioOptions() {
      return this.usuarios.map(user => ({
        ...user,
        nombre_completo: `${user.nombre} ${user.apellido}`
      }))
    },

    prioridadOptions() {
      return [
        { id: '1', text: 'Muy Baja' },
        { id: '2', text: 'Baja' },
        { id: '3', text: 'Media' },
        { id: '4', text: 'Alta' },
        { id: '5', text: 'Muy Alta' },
        { id: '6', text: 'Crítica' }
      ]
    },

    estadoOptions() {
      return [
        { id: '1', text: 'Pendiente' },
        { id: '2', text: 'En Progreso' },
        { id: '3', text: 'En Revisión' },
        { id: '4', text: 'Pausado' },
        { id: '5', text: 'Resuelto' }
      ]
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    // Regla de validación
    required(value) {
      return !!value || 'Este campo es obligatorio'
    },

    // Método helper para mostrar notificaciones
    showToast(message, color = 'info') {
      if (this.$va && this.$va.toast) {
        this.$va.toast({
          message,
          color
        })
      } else {
        console.log(`[${color.toUpperCase()}] ${message}`)
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

    // Métodos de acciones de la tabla
    viewAlert(alert) {
      this.selectedAlert = { ...alert }
      this.showViewModal = true
    },

    editAlert(alert) {
      this.selectedAlert = { ...alert }
      this.isEditing = true
      this.populateForm(alert)
      this.showEditModal = true
    },

    editCurrentAlert() {
      this.showViewModal = false
      this.editAlert(this.selectedAlert)
    },

    confirmDeleteAlert(alertId) {
      this.alertToDelete = alertId
      this.showDeleteModal = true
    },

    // Métodos del formulario
    populateForm(alert) {
      this.alertForm = {
        id: alert.id,
        herramienta_id: alert.herramienta_id,
        tipo_alerta_id: alert.tipo_alerta_id,
        prioridad_id: alert.prioridad_id,
        estado_reparacion: alert.estado_reparacion,
        fecha_generacion: alert.fecha_generacion ? alert.fecha_generacion.split('T')[0] : '',
        fecha_limite: alert.fecha_limite ? alert.fecha_limite.split('T')[0] : '',
        fecha_resolucion: alert.fecha_resolucion ? alert.fecha_resolucion.split('T')[0] : '',
        resuelta_por: alert.resuelta_por,
        descripcion: alert.descripcion || '',
        observaciones: alert.observaciones || ''
      }
    },

    resetForm() {
      this.alertForm = {
        herramienta_id: null,
        tipo_alerta_id: null,
        prioridad_id: null,
        estado_reparacion: '1',
        fecha_generacion: new Date().toISOString().split('T')[0],
        fecha_limite: null,
        fecha_resolucion: null,
        resuelta_por: null,
        descripcion: '',
        observaciones: ''
      }
    },

    cancelEdit() {
      this.showEditModal = false
      this.isEditing = false
      this.selectedAlert = null
      this.resetForm()
    },

    async saveAlert() {
      if (!this.$refs.alertForm.validate()) {
        this.showToast('Por favor, complete todos los campos requeridos', 'warning')
        return
      }

      this.saving = true
      try {
        const alertData = { ...this.alertForm }
        
        // Convertir fechas al formato correcto
        if (alertData.fecha_generacion) {
          alertData.fecha_generacion = new Date(alertData.fecha_generacion).toISOString()
        }
        if (alertData.fecha_limite) {
          alertData.fecha_limite = new Date(alertData.fecha_limite).toISOString()
        }
        if (alertData.fecha_resolucion) {
          alertData.fecha_resolucion = new Date(alertData.fecha_resolucion).toISOString()
        }

        if (this.isEditing) {
          // Actualizar alerta existente
          await api.put(`/AlertaReparacion/${alertData.id}`, alertData)
          
          // Actualizar en la lista local
          const index = this.alertas.findIndex(a => a.id === alertData.id)
          if (index !== -1) {
            this.alertas[index] = { ...this.alertas[index], ...alertData }
          }
          
          this.showToast('Alerta actualizada correctamente', 'success')
        } else {
          // Crear nueva alerta
          const newAlert = await api.post('/AlertaReparacion', alertData)
          this.alertas.unshift(newAlert)
          this.showToast('Alerta creada correctamente', 'success')
        }

        this.cancelEdit()
      } catch (error) {
        console.error('Error guardando alerta:', error)
        this.showToast('Error al guardar la alerta', 'danger')
      } finally {
        this.saving = false
      }
    },

    async deleteAlert() {
      if (!this.alertToDelete) return

      this.deleting = true
      try {
        await api.delete(`/AlertaReparacion/${this.alertToDelete}`)
        
        // Remover de la lista local
        this.alertas = this.alertas.filter(alert => alert.id !== this.alertToDelete)
        
        this.showToast('Alerta eliminada correctamente', 'success')
        this.showDeleteModal = false
        this.alertToDelete = null
      } catch (error) {
        console.error('Error eliminando alerta:', error)
        this.showToast('Error al eliminar la alerta', 'danger')
      } finally {
        this.deleting = false
      }
    },

    // Métodos de formateo y helpers
    getUsuarioNombre(id) {
      if (!id) return '-'
      const usuario = this.usuarios.find(u => u.id === id)
      return usuario ? `${usuario.nombre} ${usuario.apellido}` : `Usuario ${id}`
    },

    getTipoAlerta(id) {
      const tipo = this.tiposAlertas.find(t => t.id === id)
      return tipo ? tipo.nombre_alertas : `Tipo ${id}`
    },

    getTipoAlertaClass(id) {
      const classes = {
        '1': 'badge-warning',
        '2': 'badge-danger', 
        '3': 'badge-info',
        '4': 'badge-primary',
        '5': 'badge-secondary',
        '6': 'badge-dark'
      }
      return classes[id] || 'badge-light'
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
        '1': 'badge-light',
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

    // Método para exportar a CSV
    exportToCSV() {
      try {
        const headers = ['ID', 'Herramienta', 'Tipo', 'Fecha Generación', 'Fecha Límite', 'Estado', 'Prioridad', 'Descripción']
        const data = this.alertas.map(alert => [
          alert.id,
          this.getHerramientaNombre(alert.herramienta_id),
          this.getTipoAlerta(alert.tipo_alerta_id),
          this.formatDate(alert.fecha_generacion),
          this.formatDate(alert.fecha_limite),
          this.getEstadoText(alert.estado_reparacion),
          this.getPrioridadText(alert.prioridad_id),
          alert.descripcion || ''
        ])

        let csvContent = "data:text/csv;charset=utf-8,"
        csvContent += headers.join(",") + "\n"
        data.forEach(row => {
          csvContent += row.map(field => `"${field}"`).join(",") + "\n"
        })

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `alertas_reparacion_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.showToast('Alertas exportadas a CSV exitosamente', 'success')
      } catch (error) {
        console.error('Error exportando CSV:', error)
        this.showToast('Error al exportar las alertas', 'danger')
      }
    },

    // Método para manejar el watch del showNewAlertModal
    handleNewAlertModal() {
      if (this.showNewAlertModal) {
        this.isEditing = false
        this.resetForm()
        this.showEditModal = true
        this.showNewAlertModal = false
      }
    }
  },

  watch: {
    showNewAlertModal(newVal) {
      if (newVal) {
        this.handleNewAlertModal()
      }
    },

    // Watch para actualizar campos cuando cambia el estado
    'alertForm.estado_reparacion'(newVal) {
      if (newVal === '5') { // Si es "Resuelto"
        if (!this.alertForm.fecha_resolucion) {
          this.alertForm.fecha_resolucion = new Date().toISOString().split('T')[0]
        }
      } else {
        this.alertForm.fecha_resolucion = null
        this.alertForm.resuelta_por = null
      }
    }
  }
}