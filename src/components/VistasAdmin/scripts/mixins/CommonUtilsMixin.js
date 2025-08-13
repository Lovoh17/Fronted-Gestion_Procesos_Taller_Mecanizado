export const CommonUtilsMixin = {
  data() {
    return {
      // Control de vistas
      currentView: 'Inventory', // 'Inventory' para inventario, 'InventoryMovements' para movimientos
      
      // Modal de movimientos
      showMovementModal: false,
      selectedMovement: null,
    }
  },

  methods: {
    // =========== MÉTODOS DE CAMBIO DE VISTA ===========

    // Cambiar entre vista de inventario y movimientos
    switchView(view) {
      console.log(`Cambiando vista a: ${view}`)
      this.currentView = view

      // Cargar datos según la vista seleccionada
      if (view === 'InventoryMovements' && this.movements.length === 0) {
        this.fetchMovements()
      }
    },

    // =========== MÉTODOS DE MODAL DE MOVIMIENTOS ===========

    // Abrir modal de detalles de movimiento
    openMovementModal(movement) {
      console.log('Abriendo modal de movimiento:', movement)
      this.selectedMovement = movement
      this.showMovementModal = true
    },

    // Cerrar modal de detalles de movimiento
    closeMovementModal() {
      console.log('Cerrando modal de movimiento')
      this.showMovementModal = false
      this.selectedMovement = null
    },

    // Ver producto desde modal de movimiento
    viewProductFromMovement(productId) {
      console.log('Ver producto desde movimiento:', productId)
      // Cambiar a la vista de inventario
      this.switchView('Inventory')
      // Buscar el producto en la lista de productos
      const product = this.products.find(p => p.id === productId)
      if (product) {
        // Abrir el modal de detalles del producto
        setTimeout(() => {
          this.openProductModal(product)
        }, 100)
      } else {
        this.showToast('Producto no encontrado en la lista actual', 'warning')
      }
    },
  }

}
