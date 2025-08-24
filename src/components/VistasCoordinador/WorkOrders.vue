<template>
  <div class="pedidos-container">
    <!-- Header con icono y descripción -->
    <div class="header-section">
      <div class="header-icon">
        <span class="material-icons">shopping_cart</span>
      </div>
      <div class="header-content">
        <h1>Gestión de Pedidos</h1>
        <p>Administra y supervisa todos los pedidos del sistema</p>
      </div>
      <div class="header-actions">
        <button class="btn secondary" @click="actualizarDatos">
          <span class="material-icons">refresh</span>
          Actualizar
        </button>
        <button class="btn primary" @click="abrirModalAsignar">
          <span class="material-icons">assignment</span>
          Asignar Pedidos
        </button>
        <button class="btn primary" @click="nuevoPedido">
          <span class="material-icons">add</span>
          Nuevo Pedido
        </button>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section">
      <div class="search-box">
        <span class="material-icons">search</span>
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Buscar por código, proyecto o solicitante..."
        >
      </div>
      
      <div class="filter-group">
        <select v-model="filtroEstado">
          <option value="">Todos los estados</option>
          <option v-for="estado in estados" :key="estado.id" :value="estado.id">
            {{ estado.nombre }}
          </option>
        </select>
        
        <select v-model="filtroPrioridad">
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

    <!-- Información de resultados -->
    <div class="results-info" v-if="!loading && pedidos.length > 0">
      <p class="results-text">
        Mostrando {{ pedidos.length }} de {{ totalPedidos }} pedidos
      </p>
    </div>

    <!-- Lista de pedidos con vue-good-table -->
    <div class="pedidos-list">
      <div v-if="loading" class="loading-section">
        <span class="material-icons spin">refresh</span>
        <p>Cargando pedidos...</p>
      </div>

      <div v-else-if="pedidos.length === 0" class="empty-state">
        <span class="material-icons">inbox</span>
        <h3>No se encontraron pedidos</h3>
        <p>No hay pedidos que coincidan con los filtros aplicados</p>
      </div>

      <div v-else class="table-container">
        <vue-good-table
          :columns="columns"
          :rows="pedidos"
          :search-options="{
            enabled: true,
            placeholder: 'Buscar en pedidos...',
            externalQuery: searchTerm
          }"
          :pagination-options="{
            enabled: true,
            perPage: itemsPorPagina,
            position: 'bottom',
            perPageDropdown: [10, 20, 50],
            dropdownAllowAll: false,
            nextLabel: 'Siguiente',
            prevLabel: 'Anterior',
            rowsPerPageLabel: 'Filas por página',
            ofLabel: 'de',
            allLabel: 'Todos'
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: {field: 'fecha_requerida', type: 'desc'}
          }"
          styleClass="vgt-table pedidos-table"
          :line-numbers="false"
        >
          <template #table-row="props">
            <span v-if="props.column.field === 'codigo_pedido'">
              <span class="codigo-pedido">{{ props.row.codigo_pedido }}</span>
            </span>
            
            <span v-else-if="props.column.field === 'tipo_pedido_id'">
              <span class="tipo-pedido">{{ getTipoPedidoName(props.row.tipo_pedido_id) }}</span>
            </span>
            
            <span v-else-if="props.column.field === 'solicitante'">
              <div class="solicitante-info">
                <span class="solicitante-nombre">
                  {{ props.row.solicitante?.nombre }} {{ props.row.solicitante?.apellido }}
                </span>
                <span class="solicitante-email">{{ props.row.solicitante?.email }}</span>
              </div>
            </span>
            
            <span v-else-if="props.column.field === 'fecha_requerida'">
              <span class="fecha">{{ formatDate(props.row.fecha_requerida) }}</span>
            </span>
            
            <span v-else-if="props.column.field === 'prioridad'">
              <span class="priority-badge" :class="`priority-${props.row.prioridad}`">
                {{ getPriorityName(props.row.prioridad) }}
              </span>
            </span>
            
            <span v-else-if="props.column.field === 'estado_id'">
              <span class="status-badge" :class="getStatusClass(props.row.estado_id)">
                {{ getStatusName(props.row.estado_id) }}
              </span>
            </span>
            
            <span v-else-if="props.column.field === 'precio_final'">
              <span class="price">${{ props.row.precio_final?.toLocaleString('es-GT', {minimumFractionDigits: 2}) || '0.00' }}</span>
            </span>
            
            <span v-else-if="props.column.field === 'acciones'">
              <div class="action-buttons">
                <button class="icon-btn small" @click="verDetalles(props.row)" title="Ver detalles">
                  <span class="material-icons">visibility</span>
                </button>
                <button class="icon-btn small" @click="editarPedido(props.row)" title="Editar">
                  <span class="material-icons">edit</span>
                </button>
              </div>
            </span>
            
            <span v-else>
              {{ props.formattedRow[props.column.field] }}
            </span>
          </template>
          
          <template #pagination-bottom="props">
            <div class="pagination">
              <div class="pagination-info">
                Mostrando {{ props.pageFrom }} a {{ props.pageTo }} de {{ props.total }} registros
              </div>
              <div class="pagination-controls">
                <button 
                  class="pagination-btn" 
                  :disabled="!props.prevPageEnabled" 
                  @click="props.prevPage"
                >
                  <span class="material-icons">chevron_left</span>
                </button>
                
                <span class="pagination-pages">
                  Página {{ props.currentPage }} de {{ props.totalPages }}
                </span>
                
                <button 
                  class="pagination-btn" 
                  :disabled="!props.nextPageEnabled" 
                  @click="props.nextPage"
                >
                  <span class="material-icons">chevron_right</span>
                </button>
              </div>
            </div>
          </template>
        </vue-good-table>
      </div>
    </div>

    <!-- Modal de detalles -->
    <PedidoDetalleModal 
      v-if="pedidoSeleccionado && modalMode === 'detalle'"
      :pedido="pedidoSeleccionado"
      @close="cerrarModal"
    />

      <AsignarPedidosModal 
        :show="showAsignarModal" 
        :pedidos="pedidosDisponibles"
        :usuarios="usuarios"
        :show-error="showError"
        :show-success="showSuccess"
        @close="cerrarModalAsignar"
        @asignacion-completada="onAsignacionConfirmada"
      />

    <!-- Modal de edición -->
    <PedidoEditarModal 
      v-if="pedidoSeleccionado && modalMode === 'edicion'"
      :pedido="pedidoSeleccionado"
      @close="cerrarModal"
      @saved="onPedidoGuardado"
    />
  </div>
</template>

<script src="./scripts/WorkOrders.js"></script>
<style src="./styles/WorkOrdersView.css" scoped></style>

<style scoped>
/* Estilos adicionales para la tabla vue-good-table 
.vgt-table.pedidos-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.vgt-table.pedidos-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  padding: 12px 16px;
}

.vgt-table.pedidos-table td {
  padding: 12px 16px;
  vertical-align: middle;
}

.vgt-table.pedidos-table tr:hover {
  background-color: #f5f7ff;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-pages {
  margin: 0 15px;
  font-size: 14px;
  color: #666;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}*/
</style>