<template>
  <div class="tool-usage-view">
<div class="header-section">
  <div class="header-content">
    <div class="header-info">
      <div class="header-icon">
        <i class="fas fa-exchange-alt"></i>
      </div>
      <div class="header-text">
        <h1 class="header-title">Gestión de Movimientos</h1>
        <p class="header-subtitle">Registra y supervisa las transferencias, entradas y salidas del inventario</p>
      </div>
    </div>
  </div>
</div>

    <div class="stats-bar" v-if="!loading && !error">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="material-icons">construction</i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ filteredItems.length }}</div>
          <div class="stat-label">Usos Registrados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="material-icons">timer</i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalHours }} hrs</div>
          <div class="stat-label">Horas Totales</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="material-icons">check_circle</i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ completedReturns }}</div>
          <div class="stat-label">Devoluciones Completadas</div>
        </div>
      </div>
    </div>

    <div class="loading-state" v-if="loading">
      <div class="loading-spinner">
        <i class="material-icons spin">autorenew</i>
      </div>
      <p class="loading-text">Cargando historial...</p>
    </div>

    <div class="error-state" v-if="error">
      <div class="error-icon">
        <i class="material-icons">error_outline</i>
      </div>
      <p class="error-text">{{ error }}</p>
      <button @click="fetchData" class="retry-button">
        <i class="material-icons">refresh</i>
        Reintentar
      </button>
    </div>

    <div class="content-wrapper" v-if="!loading && !error">
      <div class="table-container">
        <div class="table-responsive">
          <table class="usage-table">
            <thead>
              <tr>
                <th @click="sortBy('herramienta.nombre')">
                  Herramienta
                  <i class="material-icons sort-icon" v-if="sortField === 'herramienta.nombre'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th @click="sortBy('usuario.nombre')">
                  Usuario
                  <i class="material-icons sort-icon" v-if="sortField === 'usuario.nombre'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th @click="sortBy('proyecto.nombre')">
                  Proyecto
                  <i class="material-icons sort-icon" v-if="sortField === 'proyecto.nombre'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th @click="sortBy('fecha_uso')">
                  Fecha Uso
                  <i class="material-icons sort-icon" v-if="sortField === 'fecha_uso'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th @click="sortBy('fecha_devolucion')">
                  Fecha Devolución
                  <i class="material-icons sort-icon" v-if="sortField === 'fecha_devolucion'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th @click="sortBy('horas_utilizada')">
                  Horas
                  <i class="material-icons sort-icon" v-if="sortField === 'horas_utilizada'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th @click="sortBy('estado_devolucion.nombre')">
                  Estado
                  <i class="material-icons sort-icon" v-if="sortField === 'estado_devolucion.nombre'">
                    {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </i>
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedItems" :key="item.id" class="usage-row">
                <td>
                  <div class="tool-info">
                    <strong>{{ item.herramienta?.nombre || 'N/A' }}</strong>
                    <small v-if="item.herramienta?.codigo">Código: {{ item.herramienta.codigo }}</small>
                  </div>
                </td>
                <td>
                  <div class="user-info">
                    <i class="material-icons">person</i>
                    {{ item.usuario?.nombre || 'N/A' }}
                  </div>
                </td>
                <td>
                  {{ item.proyecto?.nombre || 'N/A' }}
                </td>
                <td>
                  {{ formatDateTime(item.fecha_uso) }}
                </td>
                <td>
                  {{ item.fecha_devolucion ? formatDateTime(item.fecha_devolucion) : 'Pendiente' }}
                </td>
                <td>
                  <span class="hours-badge">{{ item.horas_utilizada }} hrs</span>
                </td>
                <td>
                  <span class="status-badge" :class="item.estado_devolucion?.nombre.toLowerCase()">
                    {{ item.estado_devolucion?.nombre || 'N/A' }}
                  </span>
                </td>
                <td>
                  <button class="action-btn" @click="viewDetails(item)">
                    <i class="material-icons">visibility</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
            <i class="material-icons">chevron_left</i>
          </button>

          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>

          <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
            <i class="material-icons">chevron_right</i>
          </button>
        </div>

        <div class="empty-state" v-if="filteredItems.length === 0 && !loading">
          <div class="empty-icon">
            <i class="material-icons">search_off</i>
          </div>
          <h3>No se encontraron registros</h3>
          <p>No hay usos de herramientas que coincidan con los filtros aplicados</p>
          <button class="btn-clear" @click="clearFilters">
            <i class="material-icons">clear_all</i>
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="selectedItem" class="usage-modal" @click.self="selectedItem = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detalles del Uso #{{ selectedItem.id }}</h3>
          <button @click="selectedItem = null" class="close-button">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-card">
              <h4><i class="material-icons">construction</i> Herramienta</h4>
              <div class="detail-content">
                <p><strong>Nombre:</strong> {{ selectedItem.herramienta?.nombre || 'N/A' }}</p>
                <p><strong>Código:</strong> {{ selectedItem.herramienta?.codigo || 'N/A' }}</p>
                <p v-if="selectedItem.herramienta?.descripcion">
                  <strong>Descripción:</strong> {{ selectedItem.herramienta.descripcion }}
                </p>
              </div>
            </div>

            <div class="detail-card">
              <h4><i class="material-icons">person</i> Usuario</h4>
              <div class="detail-content">
                <p><strong>Nombre:</strong> {{ selectedItem.usuario?.nombre || 'N/A' }}</p>
                <p><strong>Departamento:</strong> {{ selectedItem.usuario?.departamento || 'N/A' }}</p>
                <p><strong>Contacto:</strong> {{ selectedItem.usuario?.email || selectedItem.usuario?.telefono || 'N/A'
                  }}</p>
              </div>
            </div>

            <div class="detail-card">
              <h4><i class="material-icons">assignment</i> Proyecto</h4>
              <div class="detail-content">
                <p><strong>Nombre:</strong> {{ selectedItem.proyecto?.nombre || 'N/A' }}</p>
                <p><strong>Código:</strong> {{ selectedItem.proyecto?.codigo || 'N/A' }}</p>
                <p v-if="selectedItem.proyecto?.descripcion">
                  <strong>Descripción:</strong> {{ selectedItem.proyecto.descripcion }}
                </p>
              </div>
            </div>

            <div class="detail-card">
              <h4><i class="material-icons">schedule</i> Tiempo de Uso</h4>
              <div class="detail-content">
                <p><strong>Fecha de préstamo:</strong> {{ formatDateTime(selectedItem.fecha_uso) }}</p>
                <p><strong>Fecha de devolución:</strong>
                  {{ selectedItem.fecha_devolucion ? formatDateTime(selectedItem.fecha_devolucion) : 'Pendiente' }}
                </p>
                <p><strong>Horas utilizadas:</strong> {{ selectedItem.horas_utilizada }} hrs</p>
              </div>
            </div>

            <div class="detail-card">
              <h4><i class="material-icons">check_circle</i> Estado</h4>
              <div class="detail-content">
                <p><strong>Estado de devolución:</strong>
                  <span class="status-badge" :class="selectedItem.estado_devolucion?.nombre.toLowerCase()">
                    {{ selectedItem.estado_devolucion?.nombre || 'N/A' }}
                  </span>
                </p>
                <p><strong>Aprobado por:</strong> {{ selectedItem.aprobado_por_nombre || 'N/A' }}</p>
                <p><strong>Notas:</strong> {{ selectedItem.notas || 'Sin notas adicionales' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./scripts/ToolUsageHistoryView.js"></script>
<style src="./styles/ToolUsageHistoryView.css" scoped></style>