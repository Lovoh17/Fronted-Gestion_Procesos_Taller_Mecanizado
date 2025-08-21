<template>
  <div class="pedidos-container">
    <div class="header-section">
      <h1>Gestión de Pedidos</h1>
      <button class="btn primary" @click="nuevoPedido">
        <span class="material-icons">add</span>
        Nuevo Pedido
      </button>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-box">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar por código, proyecto o solicitante..."
          @input="filtrarPedidos"
        >
      </div>
      
      <div class="filter-group">
        <select v-model="filtroEstado" @change="filtrarPedidos">
          <option value="">Todos los estados</option>
          <option v-for="estado in estados" :key="estado.id" :value="estado.id">
            {{ estado.nombre }}
          </option>
        </select>
        
        <select v-model="filtroPrioridad" @change="filtrarPedidos">
          <option value="">Todas las prioridades</option>
          <option value="1">Alta</option>
          <option value="2">Media-Alta</option>
          <option value="3">Media</option>
          <option value="4">Media-Baja</option>
          <option value="5">Baja</option>
        </select>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in estadisticas" :key="stat.label">
        <div class="stat-icon" :class="stat.color">
          <span class="material-icons">{{ stat.icon }}</span>
        </div>
        <div class="stat-content">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Lista de pedidos -->
    <div class="pedidos-list">
      <div v-if="loading" class="loading-section">
        <span class="material-icons spin">refresh</span>
        <p>Cargando pedidos...</p>
      </div>

      <div v-else-if="pedidosFiltrados.length === 0" class="empty-state">
        <span class="material-icons">inbox</span>
        <h3>No se encontraron pedidos</h3>
        <p>No hay pedidos que coincidan con los filtros aplicados</p>
      </div>

      <div v-else class="table-container">
        <table class="pedidos-table">
          <thead>
            <tr>
              <th @click="ordenarPor('codigo_pedido')">
                Código
                <span class="material-icons sort-icon">
                  {{ ordenCampo === 'codigo_pedido' ? (ordenAscendente ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                </span>
              </th>
              <th>Tipo</th>
              <th>Solicitante</th>
              <th @click="ordenarPor('fecha_requerida')">
                Fecha Requerida
                <span class="material-icons sort-icon">
                  {{ ordenCampo === 'fecha_requerida' ? (ordenAscendente ? 'arrow_upward' : 'arrow_downward') : 'unfold_more' }}
                </span>
              </th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidosFiltrados" :key="pedido.id" class="pedido-row">
              <td>
                <span class="codigo-pedido">{{ pedido.codigo_pedido }}</span>
              </td>
              <td>
                <span class="tipo-pedido">{{ pedido.tipo_pedido?.nombre || 'N/A' }}</span>
              </td>
              <td>
                <div class="solicitante-info">
                  <span class="solicitante-nombre">
                    {{ pedido.solicitante?.nombres }} {{ pedido.solicitante?.apellidos }}
                  </span>
                  <span class="solicitante-email">{{ pedido.solicitante?.email }}</span>
                </div>
              </td>
              <td>
                <span class="fecha">{{ formatDate(pedido.fecha_requerida) }}</span>
              </td>
              <td>
                <span class="priority-badge" :class="`priority-${pedido.prioridad}`">
                  {{ getPriorityName(pedido.prioridad) }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(pedido.estado_id)">
                  {{ getStatusName(pedido.estado_id) }}
                </span>
              </td>
              <td>
                <span class="price">${{ pedido.precio_final?.toLocaleString('es-GT', {minimumFractionDigits: 2}) || '0.00' }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="icon-btn small" @click="verDetalles(pedido)" title="Ver detalles">
                    <span class="material-icons">visibility</span>
                  </button>
                  <button class="icon-btn small" @click="editarPedido(pedido)" title="Editar">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="icon-btn small danger" @click="eliminarPedido(pedido)" title="Eliminar">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="pedidosFiltrados.length > 0" class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="paginaActual === 1" 
          @click="cambiarPagina(paginaActual - 1)"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        
        <span class="pagination-info">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
        
        <button 
          class="pagination-btn" 
          :disabled="paginaActual === totalPaginas" 
          @click="cambiarPagina(paginaActual + 1)"
        >
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Modal de detalles -->
    <PedidoDetalleModal 
      v-if="pedidoSeleccionado"
      :pedido="pedidoSeleccionado"
      @close="pedidoSeleccionado = null"
    />
  </div>
</template>

<script>
import PedidoDetalleModal from './ComponentesCoordinador/OrderDetailsModal.vue'

export default {
  name: 'ListadoPedidos',
  components: {
    PedidoDetalleModal
  },
  data() {
    return {
      pedidos: [],
      pedidosFiltrados: [],
      loading: false,
      searchQuery: '',
      filtroEstado: '',
      filtroPrioridad: '',
      ordenCampo: 'fecha_requerida',
      ordenAscendente: false,
      paginaActual: 1,
      itemsPorPagina: 10,
      pedidoSeleccionado: null,
      estados: [
        { id: 1, nombre: 'Borrador' },
        { id: 2, nombre: 'Pendiente Aprobación' },
        { id: 3, nombre: 'Aprobado' },
        { id: 4, nombre: 'En Proceso' },
        { id: 5, nombre: 'Completado' },
        { id: 6, nombre: 'Cancelado' }
      ]
    }
  },
  computed: {
    estadisticas() {
      const total = this.pedidos.length
      const pendientes = this.pedidos.filter(p => p.estado_id === 2).length
      const enProceso = this.pedidos.filter(p => p.estado_id === 4).length
      const completados = this.pedidos.filter(p => p.estado_id === 5).length

      return [
        {
          icon: 'assignment',
          label: 'Total Pedidos',
          value: total,
          color: 'blue'
        },
        {
          icon: 'schedule',
          label: 'Pendientes',
          value: pendientes,
          color: 'orange'
        },
        {
          icon: 'build',
          label: 'En Proceso',
          value: enProceso,
          color: 'purple'
        },
        {
          icon: 'check_circle',
          label: 'Completados',
          value: completados,
          color: 'green'
        }
      ]
    },
    totalPaginas() {
      return Math.ceil(this.pedidosFiltrados.length / this.itemsPorPagina)
    },
    pedidosPaginados() {
      const start = (this.paginaActual - 1) * this.itemsPorPagina
      const end = start + this.itemsPorPagina
      return this.pedidosFiltrados.slice(start, end)
    }
  },
  mounted() {
    this.cargarPedidos()
  },
  methods: {
    async cargarPedidos() {
      this.loading = true
      try {
        const response = await fetch('/api/Pedido', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Error al cargar los pedidos')
        }
        
        this.pedidos = await response.json()
        this.filtrarPedidos()
      } catch (error) {
        console.error('Error:', error)
        this.showError('No se pudieron cargar los pedidos')
      } finally {
        this.loading = false
      }
    },
    
    filtrarPedidos() {
      let filtered = this.pedidos
      
      // Filtrar por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(pedido => 
          pedido.codigo_pedido?.toLowerCase().includes(query) ||
          pedido.proyecto_asociado?.toLowerCase().includes(query) ||
          pedido.solicitante?.nombres?.toLowerCase().includes(query) ||
          pedido.solicitante?.apellidos?.toLowerCase().includes(query)
        )
      }
      
      // Filtrar por estado
      if (this.filtroEstado) {
        filtered = filtered.filter(pedido => pedido.estado_id == this.filtroEstado)
      }
      
      // Filtrar por prioridad
      if (this.filtroPrioridad) {
        filtered = filtered.filter(pedido => pedido.prioridad == this.filtroPrioridad)
      }
      
      // Ordenar
      filtered.sort((a, b) => {
        let valueA = a[this.ordenCampo]
        let valueB = b[this.ordenCampo]
        
        if (this.ordenCampo === 'fecha_requerida') {
          valueA = new Date(valueA)
          valueB = new Date(valueB)
        }
        
        if (valueA < valueB) return this.ordenAscendente ? -1 : 1
        if (valueA > valueB) return this.ordenAscendente ? 1 : -1
        return 0
      })
      
      this.pedidosFiltrados = filtered
      this.paginaActual = 1
    },
    
    ordenarPor(campo) {
      if (this.ordenCampo === campo) {
        this.ordenAscendente = !this.ordenAscendente
      } else {
        this.ordenCampo = campo
        this.ordenAscendente = false
      }
      this.filtrarPedidos()
    },
    
    cambiarPagina(pagina) {
      this.paginaActual = pagina
    },
    
    nuevoPedido() {
      this.$router.push('/pedidos/nuevo')
    },
    
    verDetalles(pedido) {
      this.pedidoSeleccionado = pedido
    },
    
    editarPedido(pedido) {
      this.$router.push(`/pedidos/editar/${pedido.id}`)
    },
    
    async eliminarPedido(pedido) {
      if (!confirm(`¿Estás seguro de eliminar el pedido ${pedido.codigo_pedido}?`)) {
        return
      }
      
      try {
        const response = await fetch(`/api/Pedido/${pedido.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        })
        
        if (response.ok) {
          this.showSuccess('Pedido eliminado correctamente')
          this.cargarPedidos()
        } else {
          throw new Error('Error al eliminar el pedido')
        }
      } catch (error) {
        console.error('Error:', error)
        this.showError('No se pudo eliminar el pedido')
      }
    },
    
    getPriorityName(priority) {
      const priorityMap = {
        '1': 'Alta',
        '2': 'Media-Alta',
        '3': 'Media',
        '4': 'Media-Baja',
        '5': 'Baja'
      }
      return priorityMap[priority] || 'Media'
    },
    
    getStatusName(estadoId) {
      const estado = this.estados.find(e => e.id === estadoId)
      return estado ? estado.nombre : 'Desconocido'
    },
    
    getStatusClass(estadoId) {
      const statusClasses = {
        1: 'draft',
        2: 'pending',
        3: 'approved',
        4: 'in-progress',
        5: 'completed',
        6: 'cancelled'
      }
      return statusClasses[estadoId] || 'unknown'
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-GT')
    },
    
    getAuthToken() {
      return localStorage.getItem('authToken') || ''
    },
    
    showError(message) {
      alert('Error: ' + message)
    },
    
    showSuccess(message) {
      alert('Éxito: ' + message)
    }
  }
}
</script>

<style scoped>
.pedidos-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-section h1 {
  color: #333;
  margin: 0;
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue {
  background: #e3f2fd;
  color: #1976d2;
}

.stat-icon.orange {
  background: #fff3e0;
  color: #f57c00;
}

.stat-icon.purple {
  background: #f3e5f5;
  color: #7b1fa2;
}

.stat-icon.green {
  background: #e8f5e8;
  color: #2e7d32;
}

.stat-content h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.loading-section {
  text-align: center;
  padding: 60px 20px;
}

.spin {
  animation: spin 1s linear infinite;
  font-size: 40px;
  color: #007bff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state .material-icons {
  font-size: 60px;
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.pedidos-table {
  width: 100%;
  border-collapse: collapse;
}

.pedidos-table th {
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e5e5e5;
  cursor: pointer;
  user-select: none;
}

.pedidos-table th:hover {
  background: #e9ecef;
}

.sort-icon {
  font-size: 16px;
  vertical-align: middle;
}

.pedidos-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #e5e5e5;
}

.pedido-row:hover {
  background: #f8f9fa;
}

.codigo-pedido {
  font-weight: 600;
  color: #007bff;
}

.tipo-pedido {
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #1976d2;
}

.solicitante-info {
  display: flex;
  flex-direction: column;
}

.solicitante-nombre {
  font-weight: 500;
}

.solicitante-email {
  font-size: 12px;
  color: #666;
}

.fecha {
  font-family: monospace;
}

.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-1 {
  background: #dc3545;
  color: white;
}

.priority-2 {
  background: #fd7e14;
  color: white;
}

.priority-3 {
  background: #ffc107;
  color: #212529;
}

.priority-4 {
  background: #20c997;
  color: white;
}

.priority-5 {
  background: #6c757d;
  color: white;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.draft {
  background: #6c757d;
  color: white;
}

.status-badge.pending {
  background: #ffc107;
  color: #212529;
}

.status-badge.approved {
  background: #17a2b8;
  color: white;
}

.status-badge.in-progress {
  background: #007bff;
  color: white;
}

.status-badge.completed {
  background: #28a745;
  color: white;
}

.status-badge.cancelled {
  background: #dc3545;
  color: white;
}

.price {
  font-weight: 600;
  color: #28a745;
  font-family: monospace;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background: #e9ecef;
}

.icon-btn.danger:hover {
  background: #f8d7da;
}

.icon-btn.small .material-icons {
  font-size: 18px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
}

.pagination-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pagination-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background: #0056b3;
}

.pagination-info {
  color: #666;
  font-weight: 500;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .pedidos-table {
    font-size: 14px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>