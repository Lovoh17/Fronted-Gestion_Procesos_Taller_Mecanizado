import api from '@/api.js'
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
}