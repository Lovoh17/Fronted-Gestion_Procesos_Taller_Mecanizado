<template>
  <div class="orders-card">
    <div class="card-header">
      <h2 class="card-title">Pedidos Recientes</h2>
      <div class="card-actions">
        <button class="btn btn-filter" @click="openFilters">
          <i class="icon-filter"></i>
          Filtrar
        </button>
        <button class="btn btn-primary" @click="createNewOrder">
          <i class="icon-add"></i>
          Nuevo Pedido
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>{{ order.client }}</td>
            <td>{{ formatDate(order.date) }}</td>
            <td>${{ formatCurrency(order.total) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </td>
            <td>
              <button class="btn-icon" @click="viewOrder(order.id)" title="Ver detalles">
                <i class="icon-view"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    orders: {
      type: Array,
      required: true,
      validator: orders => orders.every(order => 
        order.id && order.client && order.date && order.total && order.status
      )
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    },
    formatCurrency(value) {
      return Number(value).toLocaleString('es-ES')
    },
    getStatusText(status) {
      const statusMap = {
        'completed': 'Completado',
        'processing': 'Procesando',
        'pending': 'Pendiente',
        'cancelled': 'Cancelado'
      }
      return statusMap[status] || status
    },
    getStatusClass(status) {
      return `status-${status}`
    },
    viewOrder(orderId) {
      this.$emit('view-order', orderId)
    },
    openFilters() {
      this.$emit('open-filters')
    },
    createNewOrder() {
      this.$emit('create-order')
    }
  }
}
</script>