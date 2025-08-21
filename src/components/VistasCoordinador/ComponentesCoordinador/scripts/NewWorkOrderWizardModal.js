/*import api from '@/api.js'
import Step1BasicInfoMixin from './wizard-steps/Step1BasicInfoMixin.js'
import Step2PlanosMixin from './wizard-steps/Step2PlanosMixin.js'
import Step3PersonalMixin from './wizard-steps/Step3PersonalMixin.js'
import Step4HerramientasMixin from './wizard-steps/Step4HerramientasMixin.js'
import Step5MaterialesMixin from './wizard-steps/Step5MaterialesMixin.js'
import Step6PresupuestoMixin from './wizard-steps/Step6PresupuestoMixin.js'
import Step7RevisionMixin from './wizard-steps/Step7RevisionMixin.js'

export default {
  name: 'NewWorkOrderWizardModal',

  mixins: [
    Step1BasicInfoMixin,
    Step2PlanosMixin,
    Step3PersonalMixin,
    Step4HerramientasMixin,
    Step5MaterialesMixin,
    Step6PresupuestoMixin,
    Step7RevisionMixin
  ],

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

      // Auto-save en localStorage
      autoSaveInterval: null,
      autoSaveTimeout: null,
      lastSaved: null
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
        // Se podría agregar lógica adicional aquí si es necesario
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
    //this.loadDraftFromStorage()
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
    // === Métodos de Navegación del Wizard ===
    nextStep() {
      if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
        // Si estamos saliendo del paso 1, generar código automáticamente
        if (this.currentStep === 1) {
          this.generateOrderCode()
        }
        
        this.currentStep++
        this.$nextTick(() => {
          this.updateStepData()
        })
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    goToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step
        this.$nextTick(() => {
          this.updateStepData()
        })
      }
    },

    // === Método de Validación por Paso ===
    validateCurrentStep() {
      switch (this.currentStep) {
        case 1: return this.validateStep1()
        case 2: return this.validateStep2()
        case 3: return this.validateStep3()
        case 4: return this.validateStep4()
        case 5: return this.validateStep5()
        case 6: return this.validateStep6()
        case 7: return this.validateStep7()
        default: return true
      }
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
    async initializeWizard() {
      this.currentStep = 1
      // No generar código al inicializar, solo cuando se complete el paso 1
      //this.loadDraftFromStorage()
      await Promise.all([
        this.loadHerramientasFromAPI(),
        this.loadMateriasPrimasFromAPI(),
        this.loadTiposPedidoFromAPI(),
        this.loadPlanosFromAPI(),
        this.loadUnidadesMedidaFromAPI()
      ])
    },

    updateStepData() {
      // Actualizar datos específicos según el paso actual
      switch (this.currentStep) {
        case 2:
          this.loadPlanoData()
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

    /**
     *     loadDraftFromStorage() {
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
     */

/*
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

      // Reset data from mixins
      if (this.herramientasSugeridas) this.herramientasSugeridas = []
      if (this.materialesSugeridos) this.materialesSugeridos = []
      if (this.selectedPlano) this.selectedPlano = null
      if (this.alertasStock) this.alertasStock = []
    }
  }
}*/

export default {
  name: 'WorkOrderModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create' // 'create' or 'edit'
    },
    pedido: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      saving: false,
      formData: {
        codigo_pedido: '',
        tipo_pedido_id: '',
        plano_id: '',
        solicitante_id: '',
        aprobador_id: '',
        supervisor_id: '',
        fecha_requerida: '',
        fecha_estimada_entrega: '',
        prioridad: 3,
        proyecto_asociado: '',
        costo_estimado: '',
        precio_final: '',
        notas: ''
      },
      errors: {},
      validationAlerts: [],
      uploadedFiles: [],
      
      // Datos de catálogos
      tiposPedido: [],
      planos: [],
      usuarios: [],
      usuariosAprobadores: [],
      usuariosSupervisores: [],
      
      // Estados de carga
      loadingCatalogs: false
    }
  },
  computed: {
    minDate() {
      return new Date().toISOString().split('T')[0]
    },
    isFormValid() {
      return this.formData.tipo_pedido_id && 
             this.formData.plano_id && 
             this.formData.solicitante_id && 
             this.formData.fecha_requerida && 
             this.formData.precio_final &&
             parseFloat(this.formData.precio_final) > 0
    },
    canCreateImmediately() {
      // Simular permisos del usuario para crear inmediatamente
      return true // En producción esto vendría del store/auth
    },
    priceValidationMessage() {
      if (!this.formData.precio_final || !this.formData.costo_estimado) {
        return null
      }
      
      const precioFinal = parseFloat(this.formData.precio_final)
      const costoEstimado = parseFloat(this.formData.costo_estimado)
      
      if (precioFinal <= costoEstimado) {
        return 'El precio final debe ser mayor que el costo estimado'
      }
      
      const margen = ((precioFinal - costoEstimado) / costoEstimado * 100).toFixed(1)
      return `Margen de ganancia: ${margen}%`
    },
    priceValidationClass() {
      if (!this.priceValidationMessage) return ''
      return this.priceValidationMessage.includes('debe ser mayor') ? 'error' : 'success'
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.initializeForm()
        this.loadCatalogs()
      }
    }
  },
  methods: {
    initializeForm() {
      if (this.mode === 'edit' && this.pedido) {
        this.formData = { ...this.pedido }
      } else {
        this.formData = {
          codigo_pedido: '',
          tipo_pedido_id: '',
          plano_id: '',
          solicitante_id: '',
          aprobador_id: '',
          supervisor_id: '',
          fecha_requerida: '',
          fecha_estimada_entrega: '',
          prioridad: 3,
          proyecto_asociado: '',
          costo_estimado: '',
          precio_final: '',
          notas: ''
        }
      }
      this.errors = {}
      this.validationAlerts = []
    },
    
    async loadCatalogs() {
      this.loadingCatalogs = true
      try {
        // Cargar todos los catálogos necesarios
        const [tiposResponse, planosResponse, usuariosResponse] = await Promise.all([
          fetch('/api/TipoPedido'),
          fetch('/api/Plano'),
          fetch('/api/Usuario')
        ])
        
        this.tiposPedido = await tiposResponse.json()
        this.planos = await planosResponse.json()
        this.usuarios = await usuariosResponse.json()
        
        // Filtrar usuarios por rol para aprobadores y supervisores
        this.usuariosAprobadores = this.usuarios.filter(u => 
          u.roles?.includes('aprobador') || u.puesto?.permisos?.includes('aprobar_pedidos')
        )
        this.usuariosSupervisores = this.usuarios.filter(u => 
          u.roles?.includes('supervisor') || u.puesto?.permisos?.includes('supervisar_proyectos')
        )
        
      } catch (error) {
        console.error('Error cargando catálogos:', error)
        this.showError('Error al cargar los datos necesarios')
      } finally {
        this.loadingCatalogs = false
      }
    },
    
    validateForm() {
      this.errors = {}
      this.validationAlerts = []
      
      // Validar campos obligatorios
      if (!this.formData.tipo_pedido_id) {
        this.errors.tipo_pedido_id = 'El tipo de pedido es obligatorio'
      }
      
      if (!this.formData.plano_id) {
        this.errors.plano_id = 'Debe seleccionar un plano'
      }
      
      if (!this.formData.solicitante_id) {
        this.errors.solicitante_id = 'Debe seleccionar un solicitante'
      }
      
      if (!this.formData.fecha_requerida) {
        this.errors.fecha_requerida = 'La fecha requerida es obligatoria'
      } else {
        const fechaRequerida = new Date(this.formData.fecha_requerida)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        if (fechaRequerida < hoy) {
          this.errors.fecha_requerida = 'La fecha requerida no puede ser anterior a hoy'
        }
      }
      
      if (!this.formData.precio_final) {
        this.errors.precio_final = 'El precio final es obligatorio'
      } else {
        const precioFinal = parseFloat(this.formData.precio_final)
        if (precioFinal <= 0) {
          this.errors.precio_final = 'El precio final debe ser mayor a 0'
        }
        
        if (this.formData.costo_estimado) {
          const costoEstimado = parseFloat(this.formData.costo_estimado)
          if (precioFinal <= costoEstimado) {
            this.errors.precio_final = 'El precio final debe ser mayor que el costo estimado'
          }
        }
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    validatePrices() {
      // Validación en tiempo real de precios
      this.$nextTick(() => {
        if (this.formData.precio_final && this.formData.costo_estimado) {
          const precioFinal = parseFloat(this.formData.precio_final)
          const costoEstimado = parseFloat(this.formData.costo_estimado)
          
          if (precioFinal <= costoEstimado) {
            this.addValidationAlert({
              type: 'warning',
              title: 'Advertencia de Precios',
              message: 'El precio final debe ser mayor que el costo estimado para asegurar rentabilidad.'
            })
          }
        }
      })
    },
    
    async sendForApproval() {
      if (!this.validateForm()) {
        this.showError('Por favor, complete todos los campos obligatorios')
        return
      }
      
      this.saving = true
      try {
        const orderData = this.prepareOrderData('Pendiente Aprobación')
        
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            ...orderData,
            action: 'send_for_approval'
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id,
          action: 'send_for_approval'
        })
        
        this.clearDraftFromStorage()
        this.close()
        this.showSuccess('Pedido enviado para aprobación exitosamente')
        
      } catch (error) {
        console.error('Error al enviar para aprobación:', error)
        this.showError(`Error al enviar el pedido: ${error.message}`)
      } finally {
        this.saving = false
      }
    },
    
    async createImmediately() {
      if (!this.validateForm()) {
        this.showError('Por favor, complete todos los campos obligatorios')
        return
      }
      
      this.saving = true
      try {
        const orderData = this.prepareOrderData('Aprobado')
        
        const response = await fetch('/api/Pedido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            ...orderData,
            action: 'create_immediately'
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
        
        const result = await response.json()
        
        this.$emit('save', {
          ...orderData,
          id: result.id,
          action: 'create_immediately'
        })
        
        this.clearDraftFromStorage()
        this.close()
        this.showSuccess('Pedido creado exitosamente')
        
      } catch (error) {
        console.error('Error al crear pedido:', error)
        this.showError(`Error al crear el pedido: ${error.message}`)
      } finally {
        this.saving = false
      }
    },
    
    async saveDraft() {
      this.saving = true
      try {
        const orderData = {
          codigo_pedido: this.formData.codigo_pedido || this.generateOrderCode(),
          tipo_pedido_id: this.formData.tipo_pedido_id ? parseInt(this.formData.tipo_pedido_id) : null,
          plano_id: this.formData.plano_id ? parseInt(this.formData.plano_id) : null,
          solicitante_id: this.formData.solicitante_id ? parseInt(this.formData.solicitante_id) : null,
          aprobador_id: this.formData.aprobador_id ? parseInt(this.formData.aprobador_id) : null,
          supervisor_id: this.formData.supervisor_id ? parseInt(this.formData.supervisor_id) : null,
          fecha_requerida: this.formData.fecha_requerida || null,
          fecha_estimada_entrega: this.formData.fecha_estimada_entrega || null,
          estado_id: this.getEstadoId('Borrador'),
          prioridad: parseInt(this.formData.prioridad) || 3,
          proyecto_asociado: this.formData.proyecto_asociado || null,
          costo_estimado: this.formData.costo_estimado ? parseFloat(this.formData.costo_estimado) : null,
          precio_final: this.formData.precio_final ? parseFloat(this.formData.precio_final) : null,
          notas: this.formData.notas || null
        }
        
        const response = await fetch('/api/Pedido/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(orderData)
        })
        
        if (response.ok) {
          const result = await response.json()
          this.showSuccess('Borrador guardado exitosamente')
          return result.id
        } else {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error al guardar borrador:', error)
        this.showError(`Error al guardar borrador: ${error.message}`)
      } finally {
        this.saving = false
      }
    },
    
    prepareOrderData(estado) {
      // Usar el método corregido del script anterior
      const formatDateForAPI = (date) => {
        if (!date) return null
        const d = new Date(date)
        return d.toISOString().split('T')[0]
      }
      
      const formatDateTimeForAPI = (date) => {
        if (!date) return null
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
      }
      
      const requiredFields = {
        tipo_pedido_id: this.formData.tipo_pedido_id,
        plano_id: this.formData.plano_id,
        solicitante_id: this.formData.solicitante_id,
        fecha_requerida: this.formData.fecha_requerida,
        precio_final: this.formData.precio_final
      }
      
      for (const [field, value] of Object.entries(requiredFields)) {
        if (!value || value === '' || value === null || value === undefined) {
          throw new Error(`El campo ${field} es obligatorio`)
        }
      }
      
      const orderData = {
        codigo_pedido: this.formData.codigo_pedido || this.generateOrderCode(),
        tipo_pedido_id: parseInt(this.formData.tipo_pedido_id),
        plano_id: parseInt(this.formData.plano_id),
        solicitante_id: parseInt(this.formData.solicitante_id),
        estado_id: this.getEstadoId(estado),
        
        ...(this.formData.aprobador_id && { 
          aprobador_id: parseInt(this.formData.aprobador_id) 
        }),
        ...(this.formData.supervisor_id && { 
          supervisor_id: parseInt(this.formData.supervisor_id) 
        }),
        
        fecha_solicitud: formatDateTimeForAPI(new Date()),
        fecha_requerida: formatDateForAPI(this.formData.fecha_requerida),
        
        ...(estado === 'Aprobado' && { 
          fecha_aprobacion: formatDateTimeForAPI(new Date()) 
        }),
        ...(this.formData.fecha_estimada_entrega && { 
          fecha_estimada_entrega: formatDateForAPI(this.formData.fecha_estimada_entrega) 
        }),
        
        contador_pausas: 0,
        tiempo_total_pausado: 0,
        prioridad: parseInt(this.formData.prioridad) || 3,
        
        ...(this.formData.proyecto_asociado && { 
          proyecto_asociado: this.formData.proyecto_asociado 
        }),
        ...(this.formData.costo_estimado && { 
          costo_estimado: parseFloat(this.formData.costo_estimado) 
        }),
        
        precio_final: parseFloat(this.formData.precio_final),
        
        ...(this.formData.notas && { 
          notas: this.formData.notas 
        }),
        
        createdAt: formatDateTimeForAPI(new Date()),
        updatedAt: formatDateTimeForAPI(new Date())
      }
      
      if (orderData.costo_estimado && orderData.precio_final <= orderData.costo_estimado) {
        throw new Error('El precio final debe ser mayor que el costo estimado')
      }
      
      return orderData
    },
    
    // Métodos auxiliares
    generateOrderCode() {
      const timestamp = new Date().getTime()
      return `PED-${timestamp}`
    },
    
    getEstadoId(estadoNombre) {
      const estadosMap = {
        'Borrador': 1,
        'Pendiente Aprobación': 2,
        'Aprobado': 3,
        'En Proceso': 4,
        'Completado': 5,
        'Cancelado': 6
      }
      return estadosMap[estadoNombre] || 1
    },
    
    getAuthToken() {
      return localStorage.getItem('authToken') || ''
    },
    
    // Métodos de utilidad para mostrar nombres
    getTipoPedidoName(id) {
      const tipo = this.tiposPedido.find(t => t.id == id)
      return tipo ? tipo.nombre : 'N/A'
    },
    
    getPlanoName(id) {
      const plano = this.planos.find(p => p.id == id)
      return plano ? `${plano.nombre} - ${plano.codigo}` : 'N/A'
    },
    
    getUsuarioName(id) {
      const usuario = this.usuarios.find(u => u.id == id)
      return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'N/A'
    },
    
    getPriorityName(priority) {
      const priorities = {
        1: 'Alta',
        2: 'Media-Alta', 
        3: 'Media',
        4: 'Media-Baja',
        5: 'Baja'
      }
      return priorities[priority] || 'Media'
    },
    
    // Manejo de archivos
    handleFileChange(event) {
      this.processFiles(event.target.files)
    },
    
    handleFileDrop(event) {
      this.processFiles(event.dataTransfer.files)
    },
    
    processFiles(files) {
      for (let file of files) {
        if (this.validateFile(file)) {
          this.uploadedFiles.push(file)
        }
      }
    },
    
    validateFile(file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/dwg',
        'application/dxf'
      ]
      
      if (file.size > maxSize) {
        this.showError(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`)
        return false
      }
      
      if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
        this.showError(`El archivo ${file.name} no tiene un formato válido.`)
        return false
      }
      
      return true
    },
    
    removeFile(index) {
      this.uploadedFiles.splice(index, 1)
    },
    
    getFileIcon(fileType) {
      if (fileType.includes('pdf')) return 'picture_as_pdf'
      if (fileType.includes('image')) return 'image'
      if (fileType.includes('dwg') || fileType.includes('dxf')) return 'architecture'
      return 'description'
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    },
    
    // Manejo de alertas
    addValidationAlert(alert) {
      const id = Date.now()
      this.validationAlerts.push({
        id,
        ...alert
      })
      
      // Auto-dismiss después de 5 segundos
      setTimeout(() => {
        this.dismissAlert(id)
      }, 5000)
    },
    
    dismissAlert(alertId) {
      const index = this.validationAlerts.findIndex(a => a.id === alertId)
      if (index > -1) {
        this.validationAlerts.splice(index, 1)
      }
    },
    
    getAlertIcon(type) {
      const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
      return icons[type] || 'info'
    },
    
    // Notificaciones
    showSuccess(message) {
      if (this.$vaToast) {
        this.$vaToast.init({
          message: message,
          color: 'success',
          duration: 3000
        })
      } else {
        alert(message)
      }
    },
    
    showError(message) {
      if (this.$vaToast) {
        this.$vaToast.init({
          message: message,
          color: 'danger',
          duration: 5000
        })
      } else {
        alert(message)
      }
    },
    
    clearDraftFromStorage() {
      localStorage.removeItem('pedido_draft')
    },
    
    close() {
      this.$emit('close')
    }
  },
  
  // Guardar borrador automáticamente cada 30 segundos si hay cambios
  mounted() {
    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveDraftToStorage()
      }
    }, 30000)
  },
  
  beforeDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
  },
  
  methods: {
  
    
    hasUnsavedChanges() {
      // Verificar si hay cambios sin guardar
      const currentData = JSON.stringify(this.formData)
      const savedData = localStorage.getItem('pedido_draft')
      return currentData !== savedData
    },
    
    saveDraftToStorage() {
      localStorage.setItem('pedido_draft', JSON.stringify(this.formData))
    },
    
    loadDraftFromStorage() {
      const savedData = localStorage.getItem('pedido_draft')
      if (savedData && this.mode === 'create') {
        this.formData = JSON.parse(savedData)
        this.addValidationAlert({
          type: 'info',
          title: 'Borrador Recuperado',
          message: 'Se ha recuperado un borrador guardado anteriormente.'
        })
      }
    }
  }
}