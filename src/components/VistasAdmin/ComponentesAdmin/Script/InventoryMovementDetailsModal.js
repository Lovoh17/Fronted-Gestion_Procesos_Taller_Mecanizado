export default {
  name: 'InventoryMovementDetailsModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    movement: {
      type: Object,
      default: null
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
  emits: ['update:isVisible', 'close', 'view-product', 'show-toast'],
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

    // Ver producto relacionado
    viewProduct() {
      if (this.movement && this.movement.producto_id) {
        this.$emit('view-product', this.movement.producto_id)
        this.closeModal()
      }
    },

    // Imprimir detalle del movimiento
    printMovement() {
      if (this.movement) {
        this.generateMovementReport()
      }
    },

    // Generar reporte imprimible
    generateMovementReport() {
      const printWindow = window.open('', '_blank')
      const movementHtml = this.generateMovementHtml()
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Detalle de Movimiento de Inventario - ${this.movement.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333; 
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .section { 
              margin-bottom: 25px; 
              border: 1px solid #ddd; 
              border-radius: 5px; 
              overflow: hidden;
            }
            .section-title { 
              background-color: #f8f9fa; 
              padding: 12px 15px; 
              margin: 0; 
              font-weight: bold; 
              border-bottom: 1px solid #ddd;
            }
            .section-content { 
              padding: 15px; 
            }
            .info-row { 
              display: flex; 
              margin-bottom: 10px; 
            }
            .label { 
              font-weight: bold; 
              min-width: 150px; 
              color: #666;
            }
            .value { 
              flex: 1; 
            }
            .movement-badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 0.85em;
              font-weight: bold;
            }
            .movement-entry { background-color: #d4edda; color: #155724; }
            .movement-exit { background-color: #f8d7da; color: #721c24; }
            .movement-adjustment { background-color: #fff3cd; color: #856404; }
            .movement-transfer { background-color: #d1ecf1; color: #0c5460; }
            .reason-box {
              background-color: #f8f9fa;
              border-left: 4px solid #007bff;
              padding: 15px;
              font-style: italic;
              border-radius: 0 4px 4px 0;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${movementHtml}
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
        </html>
      `)
      
      printWindow.document.close()
    },

    // Generar HTML del reporte
    generateMovementHtml() {
      if (!this.movement) return ''

      return `
        <div class="header">
          <h1>Detalle de Movimiento de Inventario</h1>
          <p><strong>ID del Movimiento:</strong> ${this.movement.id}</p>
          <p><strong>Fecha de Generación:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
        </div>

        <div class="section">
          <h3 class="section-title">Información del Movimiento</h3>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Tipo de Movimiento:</span>
              <span class="value">
                <span class="movement-badge ${this.getMovementTypeClass(this.movement.tipo_movimiento.toLowerCase())}">
                  ${this.movement.tipo_movimiento}
                </span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Fecha del Movimiento:</span>
              <span class="value">${this.movement.fecha_movimiento_formatted}</span>
            </div>
            <div class="info-row">
              <span class="label">Usuario Responsable:</span>
              <span class="value">${this.movement.usuario_nombre || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Producto Afectado</h3>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Código del Producto:</span>
              <span class="value">${this.movement.producto_codigo}</span>
            </div>
            <div class="info-row">
              <span class="label">Nombre del Producto:</span>
              <span class="value">${this.movement.producto_nombre}</span>
            </div>
            ${this.movement.producto_descripcion ? `
            <div class="info-row">
              <span class="label">Descripción:</span>
              <span class="value">${this.movement.producto_descripcion}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Detalles de Cantidad</h3>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Cantidad Movida:</span>
              <span class="value">${this.movement.tipo_movimiento.toLowerCase() === 'entrada' ? '+' : ''}${this.movement.cantidad_display}</span>
            </div>
            ${this.movement.stock_anterior !== null ? `
            <div class="info-row">
              <span class="label">Stock Anterior:</span>
              <span class="value">${this.movement.stock_anterior}</span>
            </div>
            ` : ''}
            ${this.movement.stock_actual !== null ? `
            <div class="info-row">
              <span class="label">Stock Resultante:</span>
              <span class="value">${this.movement.stock_actual}</span>
            </div>
            ` : ''}
          </div>
        </div>

        ${this.movement.pedido_id ? `
        <div class="section">
          <h3 class="section-title">Información del Pedido</h3>
          <div class="section-content">
            <div class="info-row">
              <span class="label">ID del Pedido:</span>
              <span class="value">${this.movement.pedido_id}</span>
            </div>
          </div>
        </div>
        ` : ''}

        ${this.movement.motivo ? `
        <div class="section">
          <h3 class="section-title">Motivo del Movimiento</h3>
          <div class="section-content">
            <div class="reason-box">
              ${this.movement.motivo}
            </div>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <h3 class="section-title">Información de Registro</h3>
          <div class="section-content">
            ${this.movement.created_at ? `
            <div class="info-row">
              <span class="label">Fecha de Registro:</span>
              <span class="value">${this.formatDate(this.movement.created_at)}</span>
            </div>
            ` : ''}
            ${this.movement.updated_at && this.movement.updated_at !== this.movement.created_at ? `
            <div class="info-row">
              <span class="label">Última Modificación:</span>
              <span class="value">${this.formatDate(this.movement.updated_at)}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `
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

    // Obtener clase CSS para el tipo de movimiento
    getMovementTypeClass(type) {
      switch (type.toLowerCase()) {
        case 'entrada':
          return 'movement-entry'
        case 'salida':
          return 'movement-exit'
        case 'ajuste':
          return 'movement-adjustment'
        case 'transferencia':
          return 'movement-transfer'
        default:
          return 'movement-entry'
      }
    },

    // Obtener ícono para el tipo de movimiento
    getMovementIcon(type) {
      switch (type.toLowerCase()) {
        case 'entrada':
          return 'fas fa-arrow-down'
        case 'salida':
          return 'fas fa-arrow-up'
        case 'ajuste':
          return 'fas fa-adjust'
        case 'transferencia':
          return 'fas fa-exchange-alt'
        default:
          return 'fas fa-arrow-down'
      }
    },

    // Obtener ícono para la cantidad
    getQuantityIcon(type) {
      switch (type.toLowerCase()) {
        case 'entrada':
          return 'fas fa-plus-circle'
        case 'salida':
          return 'fas fa-minus-circle'
        case 'ajuste':
          return 'fas fa-edit'
        case 'transferencia':
          return 'fas fa-exchange-alt'
        default:
          return 'fas fa-circle'
      }
    }
  }
}
