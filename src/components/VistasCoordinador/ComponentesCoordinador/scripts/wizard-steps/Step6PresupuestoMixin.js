export default {
  data() {
    return {
      // Opciones para presupuesto
      centrosCostosOptions: [
        { text: 'Departamento de Producción', value: 'produccion' },
        { text: 'Departamento de I+D', value: 'investigacion' },
        { text: 'Departamento de Calidad', value: 'calidad' },
        { text: 'Centro de Costos Externos', value: 'externos' }
      ]
    }
  },

  computed: {
    costoTotalEstimado() {
      return this.formData.costo_materiales + this.formData.costo_herramientas + this.formData.costo_mano_obra
    },

    presupuestoExcedeLimite() {
      const limitePresupuesto = 50000 // Límite simulado
      return this.formData.precio_final > limitePresupuesto
    }
  },

  methods: {
    // === Métodos del Paso 6: Costos ===
    validateStep6() {
      if (!this.formData.precio_final || this.formData.precio_final <= 0) {
        this.showValidationError('Debe establecer un precio final válido')
        return false
      }
      return true
    },

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
    }
  }
}
