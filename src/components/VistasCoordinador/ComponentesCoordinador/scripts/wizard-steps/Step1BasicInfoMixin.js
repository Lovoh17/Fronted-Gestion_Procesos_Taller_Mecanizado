import api from '@/api.js'

export default {
  data() {
    return {
      // Opciones para selects del paso 1
      tiposPedidoOptions: [],
      prioridadOptions: [
        { text: 'Alta (1)', value: 1 },
        { text: 'Media (2)', value: 2 },
        { text: 'Baja (3)', value: 3 }
      ],
    }
  },

  watch: {
    // Regenerar código cuando cambien los campos clave del paso 1
    'formData.tipo_pedido_id': {
      handler() {
        if (this.currentStep === 1 && this.formData.tipo_pedido_id && this.formData.prioridad && this.formData.fecha_requerida) {
          this.generateOrderCode()
        }
      }
    },
    'formData.prioridad': {
      handler() {
        if (this.currentStep === 1 && this.formData.tipo_pedido_id && this.formData.prioridad && this.formData.fecha_requerida) {
          this.generateOrderCode()
        }
      }
    },
    'formData.fecha_requerida': {
      handler() {
        if (this.currentStep === 1 && this.formData.tipo_pedido_id && this.formData.prioridad && this.formData.fecha_requerida) {
          this.generateOrderCode()
        }
      }
    }
  },

  methods: {
    // === Métodos del Paso 1: Información Básica ===
    validateStep1() {
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
      return true
    },

    generateOrderCode() {
      if (this.codigoAutoGenerado && this.formData.tipo_pedido_id && this.formData.prioridad && this.formData.fecha_requerida) {
        // Obtener información del tipo de pedido
        const tipoPedido = this.tiposPedidoOptions.find(t => t.id === this.formData.tipo_pedido_id)
        const tipoCodigo = this.getTipoCodigoPrefix(tipoPedido)
        
        // Obtener código de prioridad
        const prioridadCodigo = this.getPrioridadPrefix(this.formData.prioridad)
        
        // Formatear fecha requerida
        const fechaRequerida = new Date(this.formData.fecha_requerida)
        const year = fechaRequerida.getFullYear().toString().slice(-2) // Últimos 2 dígitos del año
        const month = String(fechaRequerida.getMonth() + 1).padStart(2, '0')
        const day = String(fechaRequerida.getDate()).padStart(2, '0')
        
        // Generar número secuencial único
        const timestamp = Date.now().toString().slice(-4) // Últimos 4 dígitos del timestamp
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
        const secuencial = timestamp + random
        
        // Formato: TIPO-PRIORIDAD-YYMMDD-SECUENCIAL
        // Ejemplo: INT-P1-251225-123456 (Interno, Prioridad 1, 25 dic 2025, secuencial)
        this.formData.codigo_pedido = `${tipoCodigo}-${prioridadCodigo}-${year}${month}${day}-${secuencial}`
      }
    },

    getTipoCodigoPrefix(tipoPedido) {
      if (!tipoPedido) return 'GEN' // Genérico
      
      // Mapear tipos específicos a códigos
      const tipoMap = {
        'Proyecto Interno': 'INT',
        'Proyecto Externo': 'EXT', 
        'Prácticas Estudiantes': 'EST',
        'Reparación Urgente': 'URG',
        'Pruebas Calidad': 'CAL'
      }
      
      // Buscar coincidencia exacta primero
      if (tipoMap[tipoPedido.nombre]) {
        return tipoMap[tipoPedido.nombre]
      }
      
      // Si no hay coincidencia exacta, usar lógica basada en palabras clave
      const nombre = tipoPedido.nombre.toLowerCase()
      if (nombre.includes('interno')) return 'INT'
      if (nombre.includes('externo')) return 'EXT'
      if (nombre.includes('práctica') || nombre.includes('estudiante')) return 'EST'
      if (nombre.includes('urgente') || nombre.includes('reparación')) return 'URG'
      if (nombre.includes('calidad') || nombre.includes('prueba')) return 'CAL'
      
      // Fallback: usar las primeras 3 letras del nombre
      return tipoPedido.nombre.substring(0, 3).toUpperCase()
    },

    getPrioridadPrefix(prioridad) {
      switch (prioridad) {
        case 1: return 'P1' // Alta
        case 2: return 'P2' // Media  
        case 3: return 'P3' // Baja
        default: return 'P2' // Por defecto media
      }
    },

    getTipoPedidoNombre() {
      const tipo = this.tiposPedidoOptions.find(t => t.id === this.formData.tipo_pedido_id)
      return tipo ? tipo.nombre : 'N/A'
    },

    getPrioridadTexto() {
      const prioridad = this.prioridadOptions.find(p => p.value === this.formData.prioridad)
      return prioridad ? prioridad.text : 'N/A'
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
    }
  }
}
