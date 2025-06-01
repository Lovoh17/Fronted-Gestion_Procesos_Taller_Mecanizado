<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Detalles del Pedido #{{ order.id }}</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      
      <div class="order-details">
        <!-- Información básica del pedido -->
        <div class="detail-row">
          <span class="detail-label">Cliente:</span>
          <span class="detail-value">{{ order.client }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ formatDate(order.date) }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="status-badge" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        
        <!-- Lista de productos -->
        <div class="products-section">
          <h4>Productos</h4>
          <div class="products-table">
            <div class="table-header">
              <div>Producto</div>
              <div>Cantidad</div>
              <div>Precio Unitario</div>
              <div>Subtotal</div>
            </div>
            <div class="table-row" v-for="(product, index) in order.products" :key="index">
              <div>{{ product.name }}</div>
              <div>{{ product.quantity }}</div>
              <div>${{ formatNumber(product.price) }}</div>
              <div>${{ formatNumber(product.price * product.quantity) }}</div>
            </div>
            <div class="table-footer">
              <div class="total-label">Total:</div>
              <div class="total-value">${{ formatNumber(order.total) }}</div>
            </div>
          </div>
        </div>
        
        <!-- Notas adicionales -->
        <div class="notes-section" v-if="order.notes">
          <h4>Notas</h4>
          <p>{{ order.notes }}</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="close" class="btn-primary">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true,
      validator: value => {
        return value.id && value.client && value.date && value.products
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    },
    formatNumber(value) {
      return Number(value).toLocaleString('es-ES')
    },
    getStatusClass(status) {
      const statusClasses = {
        'pending': 'status-pending',
        'in_progress': 'status-in-progress',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      }
      return statusClasses[status] || ''
    },
    getStatusText(status) {
      const statusTexts = {
        'pending': 'Pendiente',
        'in_progress': 'En curso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
      }
      return statusTexts[status] || status
    }
  }
}
</script>