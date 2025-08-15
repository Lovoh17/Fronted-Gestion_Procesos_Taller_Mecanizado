import api from '@/api.js'

export default {
  data() {
    return {
      // Opciones para selects del paso 2
      planosOptions: [],
      versionesPlanoOptions: [
        { text: 'v1.0 (Última)', value: 'v1.0' },
        { text: 'v0.9 (Beta)', value: 'v0.9' },
        { text: 'v0.8 (Alpha)', value: 'v0.8' }
      ],
      selectedPlano: null,
    }
  },

  methods: {
    // === Métodos del Paso 2: Planos ===
    validateStep2() {
      if (!this.formData.plano_id) {
        this.showValidationError('Debe seleccionar un plano')
        return false
      }
      return true
    },

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
    }
  }
}
