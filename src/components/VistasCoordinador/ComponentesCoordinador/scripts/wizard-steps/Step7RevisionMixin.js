export default {
  computed: {
    canCreateImmediately() {
      // Simular permisos del usuario para crear inmediatamente
      return true // En producción esto vendría del store/auth
    }
  },

  methods: {
    // === Métodos del Paso 7: Revisión ===
    validateStep7() {
      // El paso 7 no tiene validaciones obligatorias
      return true
    },

    prepareReview() {
      this.calculateCosts()
      // Cualquier preparación adicional para la revisión final
    },

    formatDate(date) {
      if (!date) return 'N/A'

      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()

      return `${day}/${month}/${year}`
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
    }
  }
}
