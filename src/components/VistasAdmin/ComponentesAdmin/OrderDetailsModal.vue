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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #2c3e50;
  }
  
  .order-details {
    padding: 20px;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 15px;
  }
  
  .detail-label {
    font-weight: 500;
    width: 120px;
    color: #6c757d;
  }
  
  .detail-value {
    flex: 1;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .status-pending {
    background: #fff3cd;
    color: #d39e00;
  }
  
  .status-in-progress {
    background: #cce5ff;
    color: #0062cc;
  }
  
  .status-completed {
    background: #e6f7ee;
    color: #28a745;
  }
  
  .status-cancelled {
    background: #f8d7da;
    color: #dc3545;
  }
  
  .products-section {
    margin-top: 25px;
  }
  
  .products-section h4 {
    margin-bottom: 15px;
    color: #2c3e50;
  }
  
  .products-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .products-table th,
  .products-table td {
    padding: 10px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .products-table th {
    background: #f8f9fa;
    font-weight: 500;
  }
  
  .products-table tfoot {
    border-top: 2px solid #eee;
  }
  
  .total-label {
    text-align: right;
    font-weight: 500;
  }
  
  .total-value {
    font-weight: 500;
    color: #2c3e50;
  }
  
  .notes-section {
    margin-top: 25px;
  }
  
  .notes-section h4 {
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  .notes-section p {
    white-space: pre-line;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #eee;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .btn-primary {
    background: #3498db;
    color: white;
    border: none;
  }
  
  .btn-primary:hover {
    background: #2980b9;
  }
  </style>