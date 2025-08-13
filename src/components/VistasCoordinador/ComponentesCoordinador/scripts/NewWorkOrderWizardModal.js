import api from '@/api.js'

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

      // Opciones para selects
      tiposPedidoOptions: [],

      prioridadOptions: [
        { text: 'Alta (1)', value: 1 },
        { text: 'Media (2)', value: 2 },
        { text: 'Baja (3)', value: 3 }
      ],

      planosOptions: [],

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
        { id: 1, nombre: 'Ana Martínez - Técnico Especialista' },
        { id: 2, nombre: 'Luis Rivera - Técnico Senior' },
        { id: 3, nombre: 'Pedro Jiménez - Técnico Junior' },
        { id: 4, nombre: 'Sofia Castro - Técnico Especialista' }
      ],

      todasHerramientasOptions: [],

      todosMaterialesOptions: [],

      unidadesMedidaOptions: [],

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
    // === Métodos de Navegación del Wizard (CORREGIDOS) ===
    nextStep() {
      if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
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
    async initializeWizard() {
      this.currentStep = 1
      this.generateOrderCode()
      //this.loadDraftFromStorage()
      await Promise.all([
        this.loadHerramientasFromAPI(),
        this.loadMateriasPrimasFromAPI(),
        this.loadTiposPedidoFromAPI(),
        this.loadPlanosFromAPI(),
        this.loadUnidadesMedidaFromAPI()
      ])
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
        // Simular carga de materiales del plano
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
      // Si no hay plano seleccionado o no hay materiales cargados, no hacer nada
      if (!this.selectedPlano || this.todosMaterialesOptions.length === 0) {
        return;
      }

      // Usar los dos primeros materiales de la lista como sugeridos (simulación)
      // En un sistema real, estos vendrían de la relación plano-materiales
      const materialesSugeridos = this.todosMaterialesOptions.slice(0, 2).map((material, index) => {
        const cantidad = index === 0 ? 50 : 20;
        return {
          id: material.id,
          nombre: material.nombre,
          cantidad_sugerida: cantidad,
          cantidad_solicitada: cantidad,
          stock_actual: parseFloat(material.stock_total) || 0,
          stock_suficiente: (parseFloat(material.stock_total) || 0) >= cantidad,
          unidad_medida: this.getUnidadMedida(material.unidad_base_id),
          unidad_medida_id: material.unidad_base_id,
          tipo_stock_destino: 'interno',
          desperdicio_estimado: index === 0 ? 5 : 3,
          costo_unitario: parseFloat(material.costo_unitario) || 0
        };
      });

      this.materialesSugeridos = materialesSugeridos;
      this.checkStockAlerts();
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

    // === Métodos de carga de datos desde API ===
    async loadHerramientasFromAPI() {
      try {
        const response = await api.get('/Herramienta')
        this.todasHerramientasOptions = response.map(herramienta => ({
          id: herramienta.id,
          nombre: herramienta.nombre,
          modelo: herramienta.modelo,
          fabricante: herramienta.fabricante,
          numero_serie: herramienta.numero_serie,
          codigo_inventario: herramienta.codigo_inventario,
          estado: this.mapEstadoHerramienta(herramienta.estado_herramienta_id),
          estado_id: herramienta.estado_herramienta_id,
          vida_util_horas: parseFloat(herramienta.vida_util_horas) || 0,
          horas_uso_actual: parseFloat(herramienta.horas_uso_actual) || 0,
          zona_trabajo_id: herramienta.zonas_trabajo_id,
          fecha_adquisicion: herramienta.fecha_adquisicion,
          costo_adquisicion: parseFloat(herramienta.costo_adquisicion) || 0,
          valor_actual: parseFloat(herramienta.valor_actual) || 0,
          especificaciones_tecnicas: herramienta.especificaciones_tecnicas,
          imagen_ruta: herramienta.imagen_ruta,
          fecha_ultimo_mantenimiento: herramienta.fecha_ultimo_mantenimiento,
          fecha_proximo_mantenimiento: herramienta.fecha_proximo_mantenimiento,
          notas: herramienta.notas,
          // Campos calculados útiles
          porcentaje_uso: herramienta.vida_util_horas > 0
            ? Math.round((herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100)
            : 0,
          disponible_para_uso: this.isHerramientaDisponible(herramienta.estado_herramienta_id),
          requiere_mantenimiento: this.requiresMantenimiento(herramienta.fecha_proximo_mantenimiento)
        }))
      } catch (error) {
        console.error('Error al cargar herramientas:', error)
        this.showValidationError('Error al cargar las herramientas disponibles')
        // Mantener array vacío como fallback
        this.todasHerramientasOptions = []
      }
    },

    mapEstadoHerramienta(estadoId) {
      // Mapear estado_herramienta_id a texto legible
      const estados = {
        1: 'disponible',
        2: 'en_uso',
        3: 'mantenimiento',
        4: 'reservada',
        5: 'fuera_servicio'
      }
      return estados[estadoId] || 'desconocido'
    },

    isHerramientaDisponible(estadoId) {
      // Solo disponible si el estado es 'disponible' (id: 1)
      return estadoId === 1
    },

    requiresMantenimiento(fechaProximoMantenimiento) {
      if (!fechaProximoMantenimiento) return false

      const hoy = new Date()
      const fechaMantenimiento = new Date(fechaProximoMantenimiento)
      const diasHastaMantenimiento = Math.ceil((fechaMantenimiento - hoy) / (1000 * 60 * 60 * 24))

      // Requiere mantenimiento si faltan menos de 30 días o ya pasó la fecha
      return diasHastaMantenimiento <= 30
    },

    // === Métodos para cargar materias primas desde API ===
    async loadMateriasPrimasFromAPI() {
      try {
        const response = await api.get('/MateriaPrima')
        this.todosMaterialesOptions = response.map(materiaPrima => ({
          id: materiaPrima.id,
          codigo: materiaPrima.codigo,
          nombre: materiaPrima.nombre,
          descripcion: materiaPrima.descripcion,
          tipo_materia_prima_id: materiaPrima.tipo_materia_prima_id,
          unidad_base_id: materiaPrima.unidad_base_id,
          stock_minimo: parseFloat(materiaPrima.stock_minimo) || 0,
          stock_maximo: parseFloat(materiaPrima.stock_maximo) || 0,
          unidades_completas: parseFloat(materiaPrima.unidades_completas) || 0,
          fracciones: parseFloat(materiaPrima.fracciones) || 0,
          stock_total: parseFloat(materiaPrima.stock_total) || 0,
          fraccion_unidad_id: materiaPrima.fraccion_unidad_id,
          permite_fraccion: materiaPrima.permite_fraccion,
          pertenece_a_stock_id: materiaPrima.pertenece_a_stock_id,
          costo_unitario: parseFloat(materiaPrima.costo_unitario) || 0,
          proveedor_principal: materiaPrima.proveedor_principal,
          tiempo_reposicion: parseInt(materiaPrima.tiempo_reposicion) || 0,
          es_controlado: materiaPrima.es_controlado,
          // Campos calculados
          stock_suficiente: parseFloat(materiaPrima.stock_total) > parseFloat(materiaPrima.stock_minimo),
          necesita_reposicion: parseFloat(materiaPrima.stock_total) <= parseFloat(materiaPrima.stock_minimo)
        }))

        // Si ya estamos en el paso de materiales, recargar los materiales sugeridos
        if (this.currentStep === 5) {
          this.loadMaterialesSugeridos()
        }
      } catch (error) {
        console.error('Error al cargar materias primas:', error)
        this.showValidationError('Error al cargar las materias primas disponibles')
        // Mantener array vacío como fallback
        this.todosMaterialesOptions = []
      }
    },

    getUnidadMedida(unidadId) {
      const unidad = this.unidadesMedidaOptions.find(u => u.id === parseInt(unidadId))
      return unidad ? unidad.nombre : 'unidad'
    },

    // === Métodos para cargar tipos de pedido desde API ===
    async loadTiposPedidoFromAPI() {
      try {
        const response = await api.get('/Tipo_Pedido')
        this.tiposPedidoOptions = response.map(tipo => ({
          id: tipo.id,
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          requiere_aprobacion: tipo.requiere_aprobacion,
          // Campos adicionales para lógica del componente
          es_interno: tipo.nombre.toLowerCase().includes('interno'),
          es_externo: tipo.nombre.toLowerCase().includes('externo'),
          es_urgente: tipo.nombre.toLowerCase().includes('urgente'),
          es_practicas: tipo.nombre.toLowerCase().includes('práctica') || tipo.nombre.toLowerCase().includes('estudiante')
        }))
      } catch (error) {
        console.error('Error al cargar tipos de pedido:', error)
        this.showValidationError('Error al cargar los tipos de pedido disponibles')
        // Fallback con datos básicos
        this.tiposPedidoOptions = [
          { id: 1, nombre: 'Interno', descripcion: 'Pedido interno', requiere_aprobacion: false },
          { id: 2, nombre: 'Externo', descripcion: 'Pedido externo', requiere_aprobacion: true }
        ]
      }
    },

    // === Métodos para cargar planos desde API ===
    async loadPlanosFromAPI() {
      try {
        const response = await api.get('/plano')
        this.planosOptions = response
          .filter(plano => plano.estado === 'aprobado') // Solo mostrar planos aprobados
          .map(plano => ({
            id: parseInt(plano.id),
            nombre: plano.nombre,
            descripcion: plano.descripcion,
            version: plano.version,
            notas: plano.notas,
            tipo_pedidos_id: parseInt(plano.tipo_pedidos_id),
            creado_por: plano.creado_por,
            estado: plano.estado,
            archivo_ruta: plano.archivo_ruta,
            timestamp: plano.timestamp,
            // Campos calculados para compatibilidad
            codigo: this.generatePlanoCode(plano),
            costo_estimado: this.estimatePlanoCost(plano),
            // Campos adicionales útiles
            version_display: `v${plano.version}`,
            es_aprobado: plano.estado === 'aprobado',
            tiene_archivo: plano.archivo_ruta && plano.archivo_ruta.trim() !== '',
            extension_archivo: this.getFileExtension(plano.archivo_ruta)
          }))

        // Ordenar por nombre para mejor UX
        this.planosOptions.sort((a, b) => a.nombre.localeCompare(b.nombre))
        
      } catch (error) {
        console.error('Error al cargar planos:', error)
        this.showValidationError('Error al cargar los planos disponibles')
        // Fallback con datos básicos
        this.planosOptions = [
          {
            id: 1,
            nombre: 'Plano Básico',
            descripcion: 'Plano por defecto',
            version: '1.0',
            estado: 'aprobado',
            codigo: 'PLN-001',
            costo_estimado: 5000
          }
        ]
      }
    },

    // Métodos auxiliares para planos
    generatePlanoCode(plano) {
      // Generar código basado en el ID y versión
      const id = String(plano.id).padStart(3, '0')
      const versionClean = plano.version.replace(/[^\d.]/g, '')
      return `PLN-${id}-v${versionClean}`
    },

    estimatePlanoCost(plano) {
      // Estimación básica de costo basada en el tipo de pedido
      const baseCosts = {
        1: 8000,   // Proyecto Interno
        2: 15000,  // Proyecto Externo  
        3: 5000,   // Prácticas Estudiantes
        4: 12000,  // Reparación Urgente
        5: 7000    // Pruebas Calidad
      }
      
      const tipoCosto = baseCosts[parseInt(plano.tipo_pedidos_id)] || 8000
      
      // Ajuste por versión (versiones más altas = más refinadas = más costosas)
      const versionMultiplier = Math.max(1, parseFloat(plano.version) || 1)
      
      return Math.round(tipoCosto * versionMultiplier)
    },

    getFileExtension(filePath) {
      if (!filePath) return ''
      const parts = filePath.split('.')
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
    },

    // === Métodos para cargar unidades de medida desde API ===
    async loadUnidadesMedidaFromAPI() {
      try {
        const response = await api.get('/Unidad_Medida')
        this.unidadesMedidaOptions = response.map(unidad => ({
          id: unidad.id,
          nombre: unidad.nombre,
          abreviatura: unidad.abreviatura,
          tipo: unidad.tipo,
          // Campos adicionales útiles
          nombre_completo: `${unidad.nombre} (${unidad.abreviatura})`,
          es_longitud: unidad.tipo === 'longitud',
          es_peso: unidad.tipo === 'peso',
          es_volumen: unidad.tipo === 'volumen',
          es_cantidad: unidad.tipo === 'cantidad'
        }))

        // Ordenar por tipo y luego por nombre
        this.unidadesMedidaOptions.sort((a, b) => {
          if (a.tipo === b.tipo) {
            return a.nombre.localeCompare(b.nombre)
          }
          return a.tipo.localeCompare(b.tipo)
        })

        // Si ya estamos en el paso de materiales, recargar los materiales sugeridos
        if (this.currentStep === 5) {
          this.loadMaterialesSugeridos()
        }
      } catch (error) {
        console.error('Error al cargar unidades de medida:', error)
        this.showValidationError('Error al cargar las unidades de medida disponibles')
        // Fallback con unidades básicas
        this.unidadesMedidaOptions = [
          { id: 1, nombre: 'Metro', abreviatura: 'm', tipo: 'longitud' },
          { id: 2, nombre: 'Kilogramo', abreviatura: 'kg', tipo: 'peso' },
          { id: 3, nombre: 'Litro', abreviatura: 'L', tipo: 'volumen' },
          { id: 4, nombre: 'Unidad', abreviatura: 'u', tipo: 'cantidad' }
        ]
      }
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