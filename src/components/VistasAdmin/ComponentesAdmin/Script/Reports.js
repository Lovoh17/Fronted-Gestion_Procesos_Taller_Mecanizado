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

      // Filtros adicionales
      filters: {
        estado: '',
        prioridad: '',
        herramienta: '',
        tipo_alerta: '',
        fecha_desde: '',
        fecha_hasta: ''
      },

      // Paginación
      currentPage: 1,
      itemsPerPage: 10,

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

      // Validaciones del formulario
      formRules: {
        herramienta_id: [
          { required: true, message: 'La herramienta es obligatoria' }
        ],
        tipo_alerta_id: [
          { required: true, message: 'El tipo de alerta es obligatorio' }
        ],
        prioridad_id: [
          { required: true, message: 'La prioridad es obligatoria' }
        ],
        descripcion: [
          { required: true, message: 'La descripción es obligatoria' },
          { min: 10, message: 'La descripción debe tener al menos 10 caracteres' }
        ],
        fecha_limite: [
          { required: true, message: 'La fecha límite es obligatoria' }
        ]
      },

      tableColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          width: '80px',
          sortable: true
        },
        {
          label: 'Herramienta',
          field: 'herramienta_nombre',
          sortable: true
        },
        {
          label: 'Tipo de Alerta',
          field: 'tipo_alerta_nombre',
          sortable: true
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
          field: 'prioridad_texto',
          sortable: true
        },
        {
          label: 'Estado',
          field: 'estado_texto',
          sortable: true
        },
        {
          label: 'Días Restantes',
          field: 'dias_restantes',
          sortable: true
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '180px'
        }
      ]
    }
  },

  computed: {
    filteredAlertas() {
      let filtered = [...this.alertas]

      // Filtro por búsqueda de texto
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(alert =>
          alert.descripcion?.toLowerCase().includes(query) ||
          this.getHerramientaNombre(alert.herramienta_id).toLowerCase().includes(query) ||
          this.getTipoAlerta(alert.tipo_alerta_id).toLowerCase().includes(query)
        )
      }

      // Aplicar filtros adicionales
      if (this.filters.estado) {
        filtered = filtered.filter(alert => alert.estado_reparacion === this.filters.estado)
      }

      if (this.filters.prioridad) {
        filtered = filtered.filter(alert => alert.prioridad_id === this.filters.prioridad)
      }

      if (this.filters.herramienta) {
        filtered = filtered.filter(alert => alert.herramienta_id === parseInt(this.filters.herramienta))
      }

      if (this.filters.tipo_alerta) {
        filtered = filtered.filter(alert => alert.tipo_alerta_id === parseInt(this.filters.tipo_alerta))
      }

      if (this.filters.fecha_desde) {
        filtered = filtered.filter(alert =>
          new Date(alert.fecha_generacion) >= new Date(this.filters.fecha_desde)
        )
      }

      if (this.filters.fecha_hasta) {
        filtered = filtered.filter(alert =>
          new Date(alert.fecha_generacion) <= new Date(this.filters.fecha_hasta)
        )
      }

      // Enriquecer datos para la tabla
      return filtered.map(alert => ({
        ...alert,
        herramienta_nombre: this.getHerramientaNombre(alert.herramienta_id),
        tipo_alerta_nombre: this.getTipoAlerta(alert.tipo_alerta_id),
        prioridad_texto: this.getPrioridadText(alert.prioridad_id),
        estado_texto: this.getEstadoText(alert.estado_reparacion),
        fecha_generacion_formatted: this.formatDate(alert.fecha_generacion),
        fecha_limite_formatted: this.formatDate(alert.fecha_limite),
        fecha_resolucion_formatted: this.formatDate(alert.fecha_resolucion),
        dias_restantes: this.getDaysLeft(alert.fecha_limite),
        dias_restantes_class: this.getDaysLeftClass(alert.fecha_limite),
        estado_class: this.getEstadoClass(alert.estado_reparacion),
        prioridad_class: this.getPrioridadClass(alert.prioridad_id)
      }))
    },

    paginatedAlertas() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredAlertas.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.filteredAlertas.length / this.itemsPerPage)
    },

    // Estadísticas
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

    alertasVencidas() {
      return this.alertas.filter(alert => {
        if (!alert.fecha_limite || alert.estado_reparacion === '5') return false
        return new Date(alert.fecha_limite) < new Date()
      }).length
    },

    alertasCriticas() {
      return this.alertas.filter(alert =>
        alert.prioridad_id === '6' && alert.estado_reparacion !== '5'
      ).length
    },

    // Opciones para los selects
    herramientaOptions() {
      return this.herramientas.map(h => ({
        value: h.id,
        text: h.nombre
      }))
    },

    tipoAlertaOptions() {
      return this.tiposAlertas.map(t => ({
        value: t.id,
        text: t.nombre_alertas
      }))
    },

    usuarioOptions() {
      return this.usuarios.map(user => ({
        value: user.id,
        text: `${user.nombre} ${user.apellido}`,
        nombre_completo: `${user.nombre} ${user.apellido}`
      }))
    },

    prioridadOptions() {
      return [
        { value: '1', text: 'Muy Baja' },
        { value: '2', text: 'Baja' },
        { value: '3', text: 'Media' },
        { value: '4', text: 'Alta' },
        { value: '5', text: 'Muy Alta' },
        { value: '6', text: 'Crítica' }
      ]
    },

    estadoOptions() {
      return [
        { value: '1', text: 'Pendiente' },
        { value: '2', text: 'En Progreso' },
        { value: '3', text: 'En Revisión' },
        { value: '4', text: 'Pausado' },
        { value: '5', text: 'Resuelto' }
      ]
    }
  },

  async mounted() {
    await this.initializeComponent()
  },

  methods: {
    async initializeComponent() {
      await this.loadData()
      this.setupEventListeners()
    },

    setupEventListeners() {
      // Aquí puedes agregar listeners para eventos específicos
      console.log('Componente AlertaReparacion inicializado correctamente')
    },

    // Método helper para mostrar notificaciones
    showToast(message, type = 'info') {
      if (this.$toast) {
        this.$toast[type](message)
      } else if (this.$va && this.$va.toast) {
        this.$va.toast({
          message,
          color: type === 'error' ? 'danger' : type
        })
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`)
      }
    },

    // Carga de datos
    async loadData() {
      this.loading = true
      try {
        const promises = [
          this.loadAlertas(),
          this.loadHerramientas(),
          this.loadTiposAlertas(),
          this.loadUsuarios()
        ]

        await Promise.allSettled(promises)
      } catch (error) {
        console.error('Error cargando datos:', error)
        this.showToast('Error al cargar los datos', 'error')
      } finally {
        this.loading = false
      }
    },

    async loadAlertas() {
      try {
        const response = await api.get('/AlertaReparacion')
        this.alertas = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando alertas:', error)
        this.showToast(`Error al cargar las alertas: ${error.message}`, 'error')
        this.alertas = []
      }
    },

    async loadHerramientas() {
      try {
        const response = await api.get('/Herramienta')
        this.herramientas = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando herramientas:', error)
        this.showToast(`Error al cargar las herramientas: ${error.message}`, 'error')
        this.herramientas = []
      }
    },

    async loadTiposAlertas() {
      try {
        const response = await api.get('/Tipos_Alertas')
        this.tiposAlertas = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando tipos de alertas:', error)
        this.showToast(`Error al cargar los tipos de alertas: ${error.message}`, 'error')
        this.tiposAlertas = []
      }
    },

    async loadUsuarios() {
      try {
        const response = await api.get('/usuario')
        this.usuarios = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        this.showToast(`Error al cargar los usuarios: ${error.message}`, 'error')
        this.usuarios = []
      }
    },

    // Métodos para buscar alertas específicas
    async searchAlertaById(id) {
      try {
        return await api.get(`/AlertaReparacion/${id}`)
      } catch (error) {
        console.error('Error buscando alerta por ID:', error)
        throw error
      }
    },

    async searchAlertaByDescription(descripcion) {
      try {
        return await api.get(`/AlertaReparacion/descripcion/${encodeURIComponent(descripcion)}`)
      } catch (error) {
        console.error('Error buscando alerta por descripción:', error)
        throw error
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

    duplicateAlert(alert) {
      const duplicatedAlert = { ...alert }
      delete duplicatedAlert.id
      duplicatedAlert.fecha_generacion = new Date().toISOString().split('T')[0]
      duplicatedAlert.descripcion = `COPIA: ${duplicatedAlert.descripcion}`

      this.isEditing = false
      this.populateForm(duplicatedAlert)
      this.showEditModal = true
    },

    confirmDeleteAlert(alertId) {
      this.alertToDelete = alertId
      this.showDeleteModal = true
    },

    // Métodos del formulario
    openNewAlertModal() {
      this.isEditing = false
      this.resetForm()
      this.showEditModal = true
    },

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
      // Validar formulario
      if (!this.validateForm()) {
        this.showToast('Por favor, complete todos los campos requeridos correctamente', 'warning')
        return
      }

      this.saving = true
      try {
        const alertData = this.prepareAlertData()

        if (this.isEditing) {
          await this.updateAlert(alertData)
        } else {
          await this.createAlert(alertData)
        }

        this.cancelEdit()
      } catch (error) {
        console.error('Error guardando alerta:', error)
        this.showToast(`Error al guardar la alerta: ${error.message}`, 'error')
      } finally {
        this.saving = false
      }
    },

    validateForm() {
      return !!(
        this.alertForm.herramienta_id &&
        this.alertForm.tipo_alerta_id &&
        this.alertForm.prioridad_id &&
        this.alertForm.descripcion &&
        this.alertForm.descripcion.length >= 10 &&
        this.alertForm.fecha_limite
      )
    },

    prepareAlertData() {
      const alertData = { ...this.alertForm }

      // Convertir fechas al formato DATEONLY (YYYY-MM-DD) que espera la DB
      if (alertData.fecha_generacion) {
        alertData.fecha_generacion = alertData.fecha_generacion
      }
      if (alertData.fecha_limite) {
        alertData.fecha_limite = alertData.fecha_limite
      }
      if (alertData.fecha_resolucion) {
        alertData.fecha_resolucion = alertData.fecha_resolucion
      }

      // Convertir IDs a números
      alertData.herramienta_id = parseInt(alertData.herramienta_id)
      alertData.tipo_alerta_id = parseInt(alertData.tipo_alerta_id)
      alertData.prioridad_id = parseInt(alertData.prioridad_id)
      if (alertData.resuelta_por) {
        alertData.resuelta_por = parseInt(alertData.resuelta_por)
      }

      return alertData
    },

    async createAlert(alertData) {
      const newAlert = await api.post('/AlertaReparacion', alertData)
      this.alertas.unshift(newAlert)
      this.showToast('Alerta creada correctamente', 'success')
    },

    async updateAlert(alertData) {
      const updatedAlert = await api.put(`/AlertaReparacion/${alertData.id}`, alertData)

      const index = this.alertas.findIndex(a => a.id === alertData.id)
      if (index !== -1) {
        this.alertas.splice(index, 1, updatedAlert)
      }

      this.showToast('Alerta actualizada correctamente', 'success')
    },

    async deleteAlert() {
      if (!this.alertToDelete) return

      this.deleting = true
      try {
        await api.delete(`/AlertaReparacion/${this.alertToDelete}`)

        this.alertas = this.alertas.filter(alert => alert.id !== this.alertToDelete)

        this.showToast('Alerta eliminada correctamente', 'success')
        this.showDeleteModal = false
        this.alertToDelete = null
      } catch (error) {
        console.error('Error eliminando alerta:', error)
        this.showToast(`Error al eliminar la alerta: ${error.message}`, 'error')
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
      if (!id) return '-'
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
      if (!id) return '-'
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
        // Para fechas DATEONLY de Sequelize, no necesitamos conversión de zona horaria
        const dateObj = new Date(date + 'T00:00:00')
        return dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Error formateando fecha:', error)
        return date
      }
    },

    formatDateShort(date) {
      if (!date) return '-'
      try {
        const dateObj = new Date(date + 'T00:00:00')
        return dateObj.toLocaleDateString('es-ES')
      } catch (error) {
        return date
      }
    },

    getDaysLeft(fechaLimite) {
      if (!fechaLimite) return ''
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const limite = new Date(fechaLimite)
        limite.setHours(0, 0, 0, 0)

        const diffTime = limite - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return `Vencido (${Math.abs(diffDays)}d)`
        if (diffDays === 0) return 'Vence hoy'
        if (diffDays === 1) return 'Mañana'
        return `${diffDays} días`
      } catch (error) {
        console.error('Error calculando días restantes:', error)
        return ''
      }
    },

    getDaysLeftClass(fechaLimite) {
      if (!fechaLimite) return ''
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const limite = new Date(fechaLimite)
        limite.setHours(0, 0, 0, 0)

        const diffTime = limite - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return 'text-danger fw-bold'
        if (diffDays <= 2) return 'text-warning fw-bold'
        if (diffDays <= 7) return 'text-info'
        return 'text-success'
      } catch (error) {
        return ''
      }
    },

    // Métodos de filtrado y búsqueda
    clearFilters() {
      this.filters = {
        estado: '',
        prioridad: '',
        herramienta: '',
        tipo_alerta: '',
        fecha_desde: '',
        fecha_hasta: ''
      }
      this.searchQuery = ''
      this.currentPage = 1
    },

    applyQuickFilter(filterType, value) {
      this.clearFilters()
      this.filters[filterType] = value
    },

    // Paginación
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    // Método para exportar a CSV
    exportToCSV() {
      try {
        const headers = [
          'ID', 'Herramienta', 'Tipo de Alerta', 'Prioridad', 'Estado',
          'Fecha Generación', 'Fecha Límite', 'Fecha Resolución',
          'Resuelta Por', 'Descripción', 'Observaciones'
        ]

        const data = this.filteredAlertas.map(alert => [
          alert.id,
          this.getHerramientaNombre(alert.herramienta_id),
          this.getTipoAlerta(alert.tipo_alerta_id),
          this.getPrioridadText(alert.prioridad_id),
          this.getEstadoText(alert.estado_reparacion),
          this.formatDateShort(alert.fecha_generacion),
          this.formatDateShort(alert.fecha_limite),
          this.formatDateShort(alert.fecha_resolucion),
          this.getUsuarioNombre(alert.resuelta_por),
          alert.descripcion || '',
          alert.observaciones || ''
        ])

        const csvContent = this.generateCSV(headers, data)
        this.downloadCSV(csvContent, `alertas_reparacion_${new Date().toISOString().split('T')[0]}.csv`)

        this.showToast('Alertas exportadas a CSV exitosamente', 'success')
      } catch (error) {
        console.error('Error exportando CSV:', error)
        this.showToast('Error al exportar las alertas', 'error')
      }
    },

    generateCSV(headers, data) {
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += headers.join(",") + "\n"

      data.forEach(row => {
        const escapedRow = row.map(field => {
          const stringField = String(field || '').replace(/"/g, '""')
          return `"${stringField}"`
        })
        csvContent += escapedRow.join(",") + "\n"
      })

      return csvContent
    },

    downloadCSV(csvContent, filename) {
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // Método para refrescar datos
    async refreshData() {
      await this.loadData()
      this.showToast('Datos actualizados correctamente', 'success')
    },

    // Método para manejar errores de la API
    handleApiError(error, action = 'realizar la operación') {
      console.error(`Error al ${action}:`, error)

      let message = `Error al ${action}`
      if (error.response && error.response.data && error.response.data.message) {
        message += `: ${error.response.data.message}`
      } else if (error.message) {
        message += `: ${error.message}`
      }

      this.showToast(message, 'error')
    }
  },

  watch: {
    showNewAlertModal(newVal) {
      if (newVal) {
        this.openNewAlertModal()
        this.showNewAlertModal = false
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
    },

    // Reset página cuando cambian los filtros
    searchQuery() {
      this.currentPage = 1
    },

    filters: {
      handler() {
        this.currentPage = 1
      },
      deep: true
    }
  }
}