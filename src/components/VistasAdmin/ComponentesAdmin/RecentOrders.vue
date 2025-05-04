<template>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Pedidos Recientes</h2>
        <div class="card-actions">
          <button class="btn btn-outline" @click="openFilters">
            <span class="material-icons">filter_list</span>
            Filtrar
          </button>
          <button class="btn btn-primary" @click="createNewOrder">
            <span class="material-icons">add</span>
            Nuevo
          </button>
        </div>
      </div>
      
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(order, index) in orders" :key="index">
              <td>{{ order.id }}</td>
              <td>{{ order.client }}</td>
              <td>{{ order.date }}</td>
              <td>{{ order.total }}</td>
              <td>
                <span class="status" :class="`status-${order.status}`">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td>
                <span 
                  class="material-icons action-icon"
                  @click="viewOrder(order.id)"
                >visibility</span>
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
        required: true
      }
    },
    methods: {
      getStatusText(status) {
        const statusMap = {
          'completed': 'Completado',
          'processing': 'Procesando',
          'pending': 'Pendiente',
          'cancelled': 'Cancelado'
        }
        return statusMap[status] || status
      },
      viewOrder(orderId) {
        console.log('Ver pedido:', orderId)
        // Navegar a vista de detalle
      },
      openFilters() {
        console.log('Abrir filtros')
        // Lógica para abrir filtros
      },
      createNewOrder() {
        console.log('Crear nuevo pedido')
        // Navegar a creación de pedido
      }
    }
  }
  </script>
  
  <style scoped>

</style>