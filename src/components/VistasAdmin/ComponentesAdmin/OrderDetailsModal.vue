<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalles del Pedido #{{ order.id }}</h3>
          <button @click="close" class="btn-icon">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="order-details">
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
          
          <div class="products-section">
            <h4>Productos</h4>
            <table class="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in order.products" :key="index">
                  <td>{{ product.name }}</td>
                  <td>{{ product.quantity }}</td>
                  <td>${{ product.price.toLocaleString() }}</td>
                  <td>${{ (product.price * product.quantity).toLocaleString() }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="total-label">Total:</td>
                  <td class="total-value">${{ order.total.toLocaleString() }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="notes-section" v-if="order.notes">
            <h4>Notas</h4>
            <p>{{ order.notes }}</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="close" class="btn btn-primary">
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
        required: true
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
      getStatusClass(status) {
        return {
          'pending': 'status-pending',
          'in_progress': 'status-in-progress',
          'completed': 'status-completed',
          'cancelled': 'status-cancelled'
        }[status]
      },
      getStatusText(status) {
        return {
          'pending': 'Pendiente',
          'in_progress': 'En curso',
          'completed': 'Completado',
          'cancelled': 'Cancelado'
        }[status]
      }
    }
  }
  </script>
  
  <style scoped>

  </style>