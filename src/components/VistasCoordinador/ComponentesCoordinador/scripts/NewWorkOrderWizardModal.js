export default {
  name: 'NewWorkOrderWizardModal',

  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'close', 'save', 'draft-saved'],

  data() {
    return {
      currentStep: 1,
      totalSteps: 7,
      codigoAutoGenerado: true,

      // Datos del formulario principal
      formData: {
        // Paso 1: Información Básica
        tipo_pedido_id: null,
        codigo_pedido: '',
        fecha_requerida: null,
        prioridad: null,
        proyecto_asociado: '',
        notas: '',

        // Paso 2: Plano y Especificaciones
        plano_id: null,
        version_plano: '',
        especificaciones_adicionales: '',

        // Paso 3: Personal
        supervisor_id: null,
        tecnicos_asignados: [
          {
            tecnico_id: null,
            horas_asignadas: 0
          }
        ],

        // Paso 4: Herramientas
        herramientas_adicionales: [],

        // Paso 5: Materiales
        materiales_adicionales: [],

        // Paso 6: Presupuesto
        costo_materiales: 0,
        costo_herramientas: 0,
        costo_mano_obra: 0,
        precio_final: 0,
        centro_costos: '',
        justificacion_ajustes: ''
      },

      // Datos de apoyo para herramientas y materiales del plano seleccionado
      herramientasSugeridas: [],
      materialesSugeridos: [],
      selectedPlano: null,

      // Alertas de stock
      alertasStock: [],

      // Auto-save en localStorage
      autoSaveInterval: null,
      autoSaveTimeout: null,
      lastSaved: null,

      // Opciones para selects (simulated data)
      tiposPedidoOptions: [
        { id: 1, nombre: 'Interno' },
        { id: 2, nombre: 'Externo' },
        { id: 3, nombre: 'Prácticas Académicas' },
        { id: 4, nombre: 'Investigación' }
      ],

      prioridadOptions: [
        { text: 'Alta (1)', value: 1 },
        { text: 'Media (2)', value: 2 },
        { text: 'Baja (3)', value: 3 }
      ],

      planosOptions: [
        {
          id: 1,
          nombre: 'Plano Motor V8',
          codigo: 'PLN-001',
          estado: 'aprobado',
          costo_estimado: 15000
        },
        {
          id: 2,
          nombre: 'Plano Chasis Deportivo',
          codigo: 'PLN-002',
          estado: 'aprobado',
          costo_estimado: 25000
        },
        {
          id: 3,
          nombre: 'Plano Sistema Frenos',
          codigo: 'PLN-003',
          estado: 'revision',
          costo_estimado: 8000
        }
      ],

      versionesPlanoOptions: [
        { text: 'v1.0 (Última)', value: 'v1.0' },
        { text: 'v0.9 (Beta)', value: 'v0.9' },
        { text: 'v0.8 (Alpha)', value: 'v0.8' }
      ],

      supervisoresOptions: [
        { id: 1, nombre: 'Juan Pérez - Supervisor Senior' },
        { id: 2, nombre: 'María González - Supervisora de Calidad' },
        { id: 3, nombre: 'Carlos López - Supervisor de Producción' }
      ],

      tecnicosOptions: [
        { id: 1, nombre: 'Ana Martínez - Técnico Especialista', capacidad_horas_semana: 40 },
        { id: 2, nombre: 'Luis Rivera - Técnico Senior', capacidad_horas_semana: 35 },
        { id: 3, nombre: 'Pedro Jiménez - Técnico Junior', capacidad_horas_semana: 30 },
        { id: 4, nombre: 'Sofia Castro - Técnico Especialista', capacidad_horas_semana: 40 }
      ],

      todasHerramientasOptions: [
        { id: 1, nombre: 'Torno CNC Haas ST-10', estado: 'disponible' },
        { id: 2, nombre: 'Fresadora Vertical Bridgeport', estado: 'disponible' },
        { id: 3, nombre: 'Taladro Radial', estado: 'mantenimiento' },
        { id: 4, nombre: 'Soldadora TIG Miller', estado: 'disponible' },
        { id: 5, nombre: 'Prensa Hidráulica 50T', estado: 'reservada' }
      ],

      todosMaterialesOptions: [
        {
          id: 1,
          nombre: 'Acero AISI 1045',
          stock_actual: 500,
          unidad_medida: 'kg',
          costo_unitario: 2.50,
          stock_minimo: 100
        },
        {
          id: 2,
          nombre: 'Aluminio 6061-T6',
          stock_actual: 200,
          unidad_medida: 'kg',
          costo_unitario: 3.80,
          stock_minimo: 50
        },
        {
          id: 3,
          nombre: 'Bronce Fosforoso',
          stock_actual: 25,
          unidad_medida: 'kg',
          costo_unitario: 8.20,
          stock_minimo: 10
        }
      ],

      unidadesMedidaOptions: [
        { id: 1, nombre: 'kg' },
        { id: 2, nombre: 'gramos' },
        { id: 3, nombre: 'metros' },
        { id: 4, nombre: 'centímetros' },
        { id: 5, nombre: 'unidades' },
        { id: 6, nombre: 'litros' }
      ],

      tiposStockOptions: [
        { text: 'Interno', value: 'interno' },
        { text: 'Externo', value: 'externo' },
        { text: 'Prácticas', value: 'practicas' }
      ],

      centrosCostosOptions: [
        { text: 'Departamento de Producción', value: 'produccion' },
        { text: 'Departamento de I+D', value: 'investigacion' },
        { text: 'Departamento de Calidad', value: 'calidad' },
        { text: 'Centro de Costos Externos', value: 'externos' }
      ]
    }
  },

  computed: {
    showModal: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },

    progressPercentage() {
      // Asegurar que currentStep esté en el rango correcto
      const step = Math.max(1, Math.min(this.currentStep, this.totalSteps))
      const percentage = Math.round((step / this.totalSteps) * 100)

      console.log(`Progress Debug - Step: ${step}/${this.totalSteps} = ${percentage}%`)
      return percentage
    },

    currentStepTitle() {
      const titles = [
        'Información Básica del Pedido',
        'Selección de Plano y Especificaciones',
        'Asignación de Personal',
        'Selección y Reserva de Herramientas',
        'Gestión de Materiales y Stock',
        'Presupuesto y Costos',
        'Revisión Final y Confirmación'
      ]
      return titles[this.currentStep - 1] || 'Paso no encontrado'
    },

    totalHorasAsignadas() {
      return this.formData.tecnicos_asignados.reduce((total, asignacion) => {
        return total + (parseFloat(asignacion.horas_asignadas) || 0)
      }, 0)
    },

    costoTotalEstimado() {
      return this.formData.costo_materiales + this.formData.costo_herramientas + this.formData.costo_mano_obra
    },

    presupuestoExcedeLimite() {
      const limitePresupuesto = 50000 // Límite simulado
      return this.formData.precio_final > limitePresupuesto
    },

    canCreateImmediately() {
      // Simular permisos del usuario para crear inmediatamente
      return true // En producción esto vendría del store/auth
    }
  },

  watch: {
    modelValue(newValue) {
      if (newValue) {
        this.initializeWizard()
      }
    },

    // Watcher específico para currentStep
    currentStep: {
      handler(newStep, oldStep) {
        console.log(`Cambio de paso: ${oldStep} → ${newStep}`)
        console.log(`Nuevo progreso: ${this.progressPercentage}%`)
      },
      immediate: true
    },

    // Auto-save cuando cambian los datos
    formData: {
      handler() {
        this.debouncedAutoSave()
      },
      deep: true
    }
  },

  mounted() {
    this.setupAutoSave()
    this.loadDraftFromStorage()
  },

  beforeUnmount() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }
  },

  methods: {
    // === Métodos de Navegación del Wizard (CORREGIDOS) ===
    nextStep() {
      if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
        console.log(`Antes: currentStep = ${this.currentStep}`)

        this.currentStep++

        console.log(`Después: currentStep = ${this.currentStep}`)
        console.log(`Nuevo progreso: ${this.progressPercentage}%`)

        // Forzar actualización del DOM
        this.$nextTick(() => {
          console.log(`Después de nextTick: ${this.progressPercentage}%`)
          this.updateStepData()
        })
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        console.log(`Antes: currentStep = ${this.currentStep}`)

        this.currentStep--

        console.log(`Después: currentStep = ${this.currentStep}`)
        console.log(`Nuevo progreso: ${this.progressPercentage}%`)

        // Forzar actualización del DOM
        this.$nextTick(() => {
          console.log(`Después de nextTick: ${this.progressPercentage}%`)
        })
      }
    },

    goToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        console.log(`Saltando de paso ${this.currentStep} a paso ${step}`)

        this.currentStep = step

        console.log(`Nuevo progreso: ${this.progressPercentage}%`)

        // Forzar actualización del DOM y datos
        this.$nextTick(() => {
          console.log(`Después de nextTick: ${this.progressPercentage}%`)
          this.updateStepData()
        })
      }
    },

    // === Método de Validación por Paso ===
    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          if (!this.formData.tipo_pedido_id) {
            this.showValidationError('Debe seleccionar un tipo de pedido')
            return false
          }
          if (!this.formData.fecha_requerida) {
            this.showValidationError('Debe seleccionar una fecha requerida')
            return false
          }
          if (!this.formData.prioridad) {
            this.showValidationError('Debe seleccionar una prioridad')
            return false
          }
          break

        case 2:
          if (!this.formData.plano_id) {
            this.showValidationError('Debe seleccionar un plano')
            return false
          }
          break

        case 3:
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
          break

        case 6:
          if (!this.formData.precio_final || this.formData.precio_final <= 0) {
            this.showValidationError('Debe establecer un precio final válido')
            return false
          }
          break
      }

      return true
    },

    // === Método para mostrar errores de validación ===
    showValidationError(message) {
      if (this.$vaToast) {
        this.$vaToast.init({
          message: message,
          color: 'danger',
          duration: 4000
        })
      } else {
        alert(message) // Fallback si no hay toast
      }
    },

    // === Métodos de Inicialización ===
    initializeWizard() {
      console.log('Inicializando wizard...')
      this.currentStep = 1
      this.generateOrderCode()
      this.loadDraftFromStorage()

      // Asegurar que la reactividad funcione
      this.$nextTick(() => {
        console.log(`Wizard inicializado - Paso: ${this.currentStep}, Progreso: ${this.progressPercentage}%`)
      })
    },

    generateOrderCode() {
      if (this.codigoAutoGenerado) {
        const fecha = new Date()
        const year = fecha.getFullYear()
        const month = String(fecha.getMonth() + 1).padStart(2, '0')
        const day = String(fecha.getDate()).padStart(2, '0')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

        this.formData.codigo_pedido = `ORD-${year}${month}${day}-${random}`
      }
    },

    updateStepData() {
      // Actualizar datos específicos según el paso actual
      switch (this.currentStep) {
        case 2:
          this.loadPlanoData()
          break
        case 4:
          this.loadHerramientasSugeridas()
          break
        case 5:
          this.loadMaterialesSugeridos()
          break
        case 6:
          this.calculateCosts()
          break
        case 7:
          this.prepareReview()
          break
      }
    },

    // === Métodos del Paso 2: Planos ===
    onPlanoSelected(planoId) {
      this.selectedPlano = this.planosOptions.find(p => p.id === planoId)
      this.loadPlanoData()
    },

    loadPlanoData() {
      if (this.selectedPlano) {
        // Simular carga de herramientas y materiales del plano
        this.loadHerramientasSugeridas()
        this.loadMaterialesSugeridos()
      }
    },

    // === Métodos del Paso 3: Personal ===
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

    // === Métodos del Paso 4: Herramientas ===
    loadHerramientasSugeridas() {
      // Simular carga de herramientas sugeridas del plano
      if (this.selectedPlano) {
        this.herramientasSugeridas = [
          {
            id: 1,
            nombre: 'Torno CNC Haas ST-10',
            estado: 'disponible',
            cantidad_sugerida: 1,
            cantidad_solicitada: 1,
            fecha_devolucion: null
          },
          {
            id: 2,
            nombre: 'Fresadora Vertical Bridgeport',
            estado: 'disponible',
            cantidad_sugerida: 1,
            cantidad_solicitada: 1,
            fecha_devolucion: null
          }
        ]
      }
    },

    addHerramientaAdicional() {
      this.formData.herramientas_adicionales.push({
        herramienta_id: null,
        cantidad_solicitada: 1,
        fecha_devolucion: null
      })
    },

    removeHerramientaAdicional(index) {
      this.formData.herramientas_adicionales.splice(index, 1)
    },

    getEstadoColor(estado) {
      const colors = {
        'disponible': 'success',
        'reservada': 'warning',
        'mantenimiento': 'danger',
        'en_uso': 'info'
      }
      return colors[estado] || 'medium'
    },

    // === Métodos del Paso 5: Materiales ===
    loadMaterialesSugeridos() {
      // Simular carga de materiales sugeridos del plano
      if (this.selectedPlano) {
        this.materialesSugeridos = [
          {
            id: 1,
            nombre: 'Acero AISI 1045',
            cantidad_sugerida: 50,
            cantidad_solicitada: 50,
            stock_actual: 500,
            stock_suficiente: true,
            unidad_medida: 'kg',
            unidad_medida_id: 1,
            tipo_stock_destino: 'interno',
            desperdicio_estimado: 5,
            costo_unitario: 2.50
          },
          {
            id: 2,
            nombre: 'Aluminio 6061-T6',
            cantidad_sugerida: 20,
            cantidad_solicitada: 20,
            stock_actual: 15,
            stock_suficiente: false,
            unidad_medida: 'kg',
            unidad_medida_id: 1,
            tipo_stock_destino: 'interno',
            desperdicio_estimado: 3,
            costo_unitario: 3.80
          }
        ]

        this.checkStockAlerts()
      }
    },

    addMaterialAdicional() {
      this.formData.materiales_adicionales.push({
        material_id: null,
        cantidad_solicitada: 0,
        unidad_medida_id: null
      })
    },

    removeMaterialAdicional(index) {
      this.formData.materiales_adicionales.splice(index, 1)
    },

    calculateMaterialCost(material) {
      const cantidad = parseFloat(material.cantidad_solicitada) || 0
      const desperdicio = (parseFloat(material.desperdicio_estimado) || 0) / 100
      const cantidadTotal = cantidad * (1 + desperdicio)
      const costo = cantidadTotal * material.costo_unitario

      return costo.toFixed(2)
    },

    checkStockAlerts() {
      this.alertasStock = []

      this.materialesSugeridos.forEach(material => {
        if (!material.stock_suficiente) {
          this.alertasStock.push({
            id: material.id,
            mensaje: `Stock insuficiente para ${material.nombre}. Disponible: ${material.stock_actual}, Requerido: ${material.cantidad_solicitada}`
          })
        }

        if (material.stock_actual <= material.stock_minimo) {
          this.alertasStock.push({
            id: `${material.id}_minimo`,
            mensaje: `${material.nombre} está cerca del stock mínimo (${material.stock_minimo})`
          })
        }
      })
    },

    // === Métodos del Paso 6: Costos ===
    calculateCosts() {
      // Calcular costos de materiales
      let costoMateriales = 0
      this.materialesSugeridos.forEach(material => {
        costoMateriales += parseFloat(this.calculateMaterialCost(material))
      })
      this.formData.costo_materiales = costoMateriales

      // Calcular costo de herramientas (depreciación)
      this.formData.costo_herramientas = (this.herramientasSugeridas.length + this.formData.herramientas_adicionales.length) * 50 // $50 por herramienta de depreciación

      // Calcular costo de mano de obra
      this.formData.costo_mano_obra = this.totalHorasAsignadas * 25 // $25 por hora promedio

      // Establecer precio final inicial
      if (!this.formData.precio_final) {
        this.formData.precio_final = this.costoTotalEstimado * 1.3 // Margen del 30%
      }
    },

    // === Métodos del Paso 7: Revisión ===
    prepareReview() {
      this.calculateCosts()
      // Cualquier preparación adicional para la revisión final
    },

    getTipoPedidoNombre() {
      const tipo = this.tiposPedidoOptions.find(t => t.id === this.formData.tipo_pedido_id)
      return tipo ? tipo.nombre : 'N/A'
    },

    getPrioridadTexto() {
      const prioridad = this.prioridadOptions.find(p => p.value === this.formData.prioridad)
      return prioridad ? prioridad.text : 'N/A'
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
    },

    formatDate(date) {
      if (!date) return 'N/A'

      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()

      return `${day}/${month}/${year}`
    },

    // === Métodos de Guardado ===
    setupAutoSave() {
      // Auto-save cada 30 segundos
      this.autoSaveInterval = setInterval(() => {
        this.autoSaveToStorage()
      }, 30000)
    },

    debouncedAutoSave() {
      // Debounce para evitar guardar en cada keystroke
      clearTimeout(this.autoSaveTimeout)
      this.autoSaveTimeout = setTimeout(() => {
        this.autoSaveToStorage()
      }, 2000)
    },

    autoSaveToStorage() {
      const draftData = {
        formData: this.formData,
        currentStep: this.currentStep,
        herramientasSugeridas: this.herramientasSugeridas,
        materialesSugeridos: this.materialesSugeridos,
        selectedPlano: this.selectedPlano,
        lastSaved: new Date().toISOString()
      }

      localStorage.setItem('workOrderWizardDraft', JSON.stringify(draftData))
      this.lastSaved = new Date()
    },

    loadDraftFromStorage() {
      const savedDraft = localStorage.getItem('workOrderWizardDraft')
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft)

          // Preguntar al usuario si quiere recuperar el borrador
          if (confirm('Se encontró un borrador guardado. ¿Desea recuperarlo?')) {
            this.formData = { ...this.formData, ...draftData.formData }
            this.currentStep = draftData.currentStep || 1
            this.herramientasSugeridas = draftData.herramientasSugeridas || []
            this.materialesSugeridos = draftData.materialesSugeridos || []
            this.selectedPlano = draftData.selectedPlano || null
            this.lastSaved = new Date(draftData.lastSaved)
          }
        } catch (error) {
          console.error('Error al cargar borrador:', error)
        }
      }
    },

    saveAsDraft() {
      this.autoSaveToStorage()
      this.$emit('draft-saved', this.formData)

      // Mostrar notificación
      if (this.$vaToast) {
        this.$vaToast.init({
          message: 'Borrador guardado exitosamente',
          color: 'success'
        })
      }
    },

    clearDraftFromStorage() {
      localStorage.removeItem('workOrderWizardDraft')
    },

    // === Métodos Finales ===
    sendForApproval() {
      const orderData = this.prepareOrderData('Pendiente Aprobación')

      this.$emit('save', {
        ...orderData,
        action: 'send_for_approval'
      })

      this.clearDraftFromStorage()
      this.close()

      if (this.$vaToast) {
        this.$vaToast.init({
          message: 'Pedido enviado para aprobación',
          color: 'success'
        })
      }
    },

    createImmediately() {
      const orderData = this.prepareOrderData('Aprobado')

      this.$emit('save', {
        ...orderData,
        action: 'create_immediately'
      })

      this.clearDraftFromStorage()
      this.close()

      if (this.$vaToast) {
        this.$vaToast.init({
          message: 'Pedido creado exitosamente',
          color: 'success'
        })
      }
    },

    prepareOrderData(estado) {
      return {
        ...this.formData,
        estado: estado,
        herramientas_sugeridas: this.herramientasSugeridas,
        materiales_sugeridos: this.materialesSugeridos,
        plano_seleccionado: this.selectedPlano,
        costo_total_estimado: this.costoTotalEstimado,
        fecha_creacion: new Date().toISOString(),
        creado_por: 'Usuario Actual' // En producción vendría del store/auth
      }
    },

    close() {
      this.showModal = false
      this.$emit('close')

      // Reset del wizard después de un delay para evitar flickering
      setTimeout(() => {
        this.resetWizard()
      }, 300)
    },

    resetWizard() {
      this.currentStep = 1
      this.formData = {
        tipo_pedido_id: null,
        codigo_pedido: '',
        fecha_requerida: null,
        prioridad: null,
        proyecto_asociado: '',
        notas: '',
        plano_id: null,
        version_plano: '',
        especificaciones_adicionales: '',
        supervisor_id: null,
        tecnicos_asignados: [{
          tecnico_id: null,
          horas_asignadas: 0
        }],
        herramientas_adicionales: [],
        materiales_adicionales: [],
        costo_materiales: 0,
        costo_herramientas: 0,
        costo_mano_obra: 0,
        precio_final: 0,
        centro_costos: '',
        justificacion_ajustes: ''
      }

      this.herramientasSugeridas = []
      this.materialesSugeridos = []
      this.selectedPlano = null
      this.alertasStock = []
    }
  }
}