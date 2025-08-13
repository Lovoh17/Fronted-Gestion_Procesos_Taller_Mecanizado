export default {
  name: 'ProductDetailsModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    },
    materialTypes: {
      type: Array,
      default: () => []
    },
    units: {
      type: Object,
      default: () => ({
        1: { nombre: 'metros', abreviatura: 'm' },
        2: { nombre: 'litros', abreviatura: 'l' },
        3: { nombre: 'kilogramos', abreviatura: 'kg' }
      })
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.isVisible
      },
      set(value) {
        this.$emit('update:isVisible', value)
      }
    }
  },
  emits: ['update:isVisible', 'close', 'edit', 'stock-updated', 'show-toast'],
  data() {
    return {
      // Variables para gestión de inventario
      addQuantity: null,
      addReason: '',
      reduceQuantity: null,
      reduceReason: '',
      isProcessingInventory: false,
      currentAction: null // 'add' o 'reduce'
    }
  },
  methods: {
    // Cerrar modal
    closeModal() {
      this.isOpen = false
      this.$emit('close')
    },

    // Manejar cambios en el modal
    handleModalChange(isOpen) {
      if (!isOpen) {
        this.$emit('close')
      }
    },

    // Editar producto
    editProduct() {
      if (this.product && this.canEdit) {
        this.$emit('edit', this.product)
        this.closeModal()
      }
    },

    // Calcular valor total del stock
    calculateTotalValue(product) {
      if (!product) return '0.00'
      const total = Number(product.stock_total) * Number(product.costo_unitario)
      return this.formatPrice(total)
    },

    // Formatear precio
    formatPrice(price) {
      return Number(price).toFixed(2)
    },

    // Formatear fechas
    formatDate(dateString) {
      if (!dateString) return 'No disponible'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'Fecha inválida'
      }
    },

    // Obtener nombre del tipo de materia prima
    getMaterialTypeName(typeId) {
      if (!this.materialTypes || !typeId) return 'N/A'
      const type = this.materialTypes.find(t => t.id == typeId)
      return type ? type.nombre : 'N/A'
    },

    // Obtener nombre de la unidad
    getUnitName(unitId) {
      return this.units[unitId]?.abreviatura || 'unid.'
    },

    // Obtener nombre completo de la unidad
    getUnitDisplayName(unitId) {
      return this.units[unitId]?.nombre || 'No definida'
    },

    // Obtener color de chip según estado de stock (para componentes Vuestic)
    getStockChipColor(product) {
      if (!product) return 'success'
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)

      if (stock === 0) return 'danger'
      if (stock < minStock) return 'warning'
      return 'success'
    },

    // Obtener estado del producto
    getProductStatus(product) {
      if (!product) return 'available'
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)

      if (stock === 0) return 'out'
      if (stock < minStock) return 'low'
      return 'available'
    },

    // Clase CSS para estado de stock
    stockStatusClass(product) {
      if (!product) return 'in-stock'
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)

      if (stock === 0) return 'out-of-stock'
      if (stock < minStock) return 'low-stock'
      return 'in-stock'
    },

    // Texto del estado de stock
    stockStatusText(product) {
      if (!product) return 'Disponible'
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)

      if (stock === 0) return 'Agotado'
      if (stock < minStock) return 'Bajo stock'
      return 'Disponible'
    },

    // Clase CSS para badge de estado
    statusBadgeClass(product) {
      const status = this.stockStatusClass(product)
      return `status-badge ${status}`
    },

    // =========== MÉTODOS DE GESTIÓN DE INVENTARIO ===========

    // Agregar stock
    async addStock() {
      if (!this.addQuantity || this.addQuantity <= 0) {
        this.$emit('show-toast', 'Por favor ingrese una cantidad válida', 'warning')
        return
      }

      this.isProcessingInventory = true
      this.currentAction = 'add'

      try {
        const transactionData = {
          producto_id: this.product.id,
          tipo_transaccion: 'entrada',
          cantidad: Number(this.addQuantity),
          motivo: this.addReason || 'Adición manual de stock',
          fecha: new Date().toISOString(),
          usuario_id: this.getCurrentUserId() // Necesitarás implementar esto
        }

        // Emitir evento para que el componente padre maneje la actualización
        this.$emit('stock-updated', {
          action: 'add',
          quantity: Number(this.addQuantity),
          reason: this.addReason,
          product: this.product,
          transactionData
        })

        // Limpiar campos
        this.addQuantity = null
        this.addReason = ''
        
        this.$emit('show-toast', 'Stock agregado exitosamente', 'success')
      } catch (error) {
        console.error('Error al agregar stock:', error)
        this.$emit('show-toast', 'Error al agregar stock', 'error')
      } finally {
        this.isProcessingInventory = false
        this.currentAction = null
      }
    },

    // Reducir stock
    async reduceStock() {
      if (!this.reduceQuantity || this.reduceQuantity <= 0) {
        this.$emit('show-toast', 'Por favor ingrese una cantidad válida', 'warning')
        return
      }

      if (!this.reduceReason) {
        this.$emit('show-toast', 'El motivo es requerido para reducir stock', 'warning')
        return
      }

      if (Number(this.reduceQuantity) > Number(this.product.stock_total)) {
        this.$emit('show-toast', 'La cantidad no puede exceder el stock disponible', 'warning')
        return
      }

      this.isProcessingInventory = true
      this.currentAction = 'reduce'

      try {
        const transactionData = {
          producto_id: this.product.id,
          tipo_transaccion: 'salida',
          cantidad: Number(this.reduceQuantity),
          motivo: this.reduceReason,
          fecha: new Date().toISOString(),
          usuario_id: this.getCurrentUserId()
        }

        // Emitir evento para que el componente padre maneje la actualización
        this.$emit('stock-updated', {
          action: 'reduce',
          quantity: Number(this.reduceQuantity),
          reason: this.reduceReason,
          product: this.product,
          transactionData
        })

        // Limpiar campos
        this.reduceQuantity = null
        this.reduceReason = ''
        
        this.$emit('show-toast', 'Stock reducido exitosamente', 'success')
      } catch (error) {
        console.error('Error al reducir stock:', error)
        this.$emit('show-toast', 'Error al reducir stock', 'error')
      } finally {
        this.isProcessingInventory = false
        this.currentAction = null
      }
    },

    // Obtener ID del usuario actual (placeholder - implementar según tu sistema de autenticación)
    getCurrentUserId() {
      // Aquí deberías obtener el ID del usuario autenticado
      // Por ejemplo, desde Vuex, localStorage, o un servicio de autenticación
      return 1 // Placeholder
    },

    // Limpiar formularios de inventario cuando se cierra el modal
    resetInventoryForms() {
      this.addQuantity = null
      this.addReason = ''
      this.reduceQuantity = null
      this.reduceReason = ''
      this.isProcessingInventory = false
      this.currentAction = null
    }
  },
  watch: {
    // Resetear formularios cuando se cierra el modal
    isVisible(newValue) {
      if (!newValue) {
        this.resetInventoryForms()
      }
    }
  }
}
