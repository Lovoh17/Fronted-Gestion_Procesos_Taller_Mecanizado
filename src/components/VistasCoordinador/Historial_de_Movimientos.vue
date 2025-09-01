<template>
  <Sidebar :role="'coordinator'" />
  <!-- Encabezado Principal -->
  <div class="header-section">
    <div class="header-content">
      <div class="header-info">
        <div class="header-icon">
          <i class="fas fa-exchange-alt"></i>
        </div>
        <div class="header-text">
          <h1 class="header-title">Historial de Movimientos</h1>
          <p class="header-subtitle">Registra y supervisa todas las transferencias, préstamos y devoluciones del
            inventario</p>
        </div>
      </div>
      <div class="header-actions">
        <va-button @click="exportMovimientos" color="primary" icon="download">
          Exportar Historial
        </va-button>
      </div>
    </div>
  </div>

  <!-- Estadísticas Expandidas -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">
        <i class="fas fa-list-alt"></i>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.total }}</div>
        <div class="stat-label">Total Movimientos</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon info">
        <i class="fas fa-hand-holding"></i>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.prestamos }}</div>
        <div class="stat-label">Entradas</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon success">
        <i class="fas fa-undo"></i>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.devoluciones }}</div>
        <div class="stat-label">Devoluciones</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon warning">
        <i class="fas fa-exchange-alt"></i>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.activos }}</div>
        <div class="stat-label">Transferencias</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon danger">
        <i class="fas fa-tools"></i>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.vencidos }}</div>
        <div class="stat-label">Ajustes</div>
      </div>
    </div>
    <div class="stat-card cost-stat">
      <div class="stat-icon">
        <i class="fas fa-calculator"></i>
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ stats.totalHoras }}</div>
        <div class="stat-sublabel">{{ stats.totalCosto }}</div>
        <div class="stat-label">Entrada / Salida</div>
      </div>
    </div>
  </div>

  <!-- Controles de tabla -->
  <div class="table-controls">
    <div class="search-box">
      <input type="text" v-model="searchTerm" placeholder="Buscar movimientos por material, usuario o pedido..."
        class="search-input" />
      <i class="fas fa-search search-icon"></i>
    </div>
    <div class="table-actions">
      <va-button @click="exportMovimientos" color="primary" icon="download">
        Exportar CSV
      </va-button>
    </div>
  </div>

  <!-- Tabla con vue-good-table-next -->
  <div class="table-container">
    <vue-good-table :columns="columns" :rows="filteredData" max-height="45vh" :pagination-options="paginationOptions"
      :sort-options="{ enabled: true, initialSortBy: sortOption }" :search-options="{
        enabled: true,
        externalQuery: searchTerm
      }" :loading="isLoading" theme="rinoh" compactMode styleClass="vgt-table striped condensed fixed-header">
      <!-- Slot para Tipo de Movimiento -->
      <template #table-row="params">
        <span v-if="params.column.field === 'tipoMovimiento'"
          :class="getTipoMovimientoBadgeClass(params.row.tipoMovimiento)">
          {{ params.row.tipoMovimiento }}
        </span>

        <!-- Slot para Estado -->
        <span v-else-if="params.column.field === 'estado'" :class="getStatusBadgeClass(params.row.estado)">
          {{ params.row.estado }}
        </span>

        <!-- Slot para Fecha de Devolución -->
        <template v-else-if="params.column.field === 'fechaDevolucion'">
          <span v-if="params.row.fechaDevolucion">
            {{ formatDateTime(params.row.fechaDevolucion) }}
          </span>
          <span v-else class="fecha-pendiente">Pendiente</span>
        </template>

        <!-- Slot para Horas de Uso -->
        <span v-else-if="params.column.field === 'horasUso'" class="hours-badge">{{ params.row.horasUso }}h</span>

        <!-- Slot para Costo -->
        <span v-else-if="params.column.field === 'costo'" class="currency">{{ formatCurrency(params.row.costo)
        }}</span>

        <!-- Slot para Acciones -->
        <div v-else-if="params.column.field === 'acciones'" class="action-buttons">
          <va-button size="small" color="info" icon="visibility" @click="viewDetails(params.row)"
            title="Ver detalles" />
        </div>

        <!-- Contenido por defecto para otras columnas -->
        <span v-else>{{ params.formattedRow[params.column.field] }}</span>
      </template>

      <!-- Slot personalizado para mensaje vacío -->
      <template #emptystate>
        <div class="empty-state">
          <i class="fas fa-exchange-alt empty-icon"></i>
          <h3>No hay movimientos</h3>
          <p>No se encontraron movimientos que coincidan con los filtros aplicados.</p>
        </div>
      </template>
    </vue-good-table>
  </div>

  <!-- Modal de detalles mejorado -->
  <va-modal v-model="showDetailsModal" title="Detalles del Movimiento" size="large"
    :before-close="() => { showDetailsModal = false; return true; }">
    <div v-if="selectedMovimiento" class="modal-form">
      <div class="detail-sections">
        <!-- Información General -->
        <div class="detail-section">
          <h4><i class="fas fa-info-circle"></i> Información General</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID Movimiento:</label>
              <span>{{ selectedMovimiento.id }}</span>
            </div>
            <div class="detail-item">
              <label>Tipo:</label>
              <span :class="getTipoMovimientoBadgeClass(selectedMovimiento.tipoMovimiento)">
                {{ selectedMovimiento.tipoMovimiento }}
              </span>
            </div>
            <div class="detail-item">
              <label>Motivo:</label>
              <span>{{ selectedMovimiento.motivo }}</span>
            </div>
            <div class="detail-item">
              <label>Documento:</label>
              <span>{{ selectedMovimiento.documentoReferencia }}</span>
            </div>
          </div>
        </div>

        <!-- Material y Cantidad -->
        <div class="detail-section">
          <h4><i class="fas fa-cube"></i> Material y Cantidad</h4>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <label>Material:</label>
              <span>{{ selectedMovimiento.materialNombre }}</span>
            </div>
            <div class="detail-item">
              <label>Cantidad:</label>
              <span>{{ selectedMovimiento.cantidad }} {{ selectedMovimiento.unidadNombre }}</span>
            </div>
          </div>
        </div>

        <!-- Stock Origen y Destino -->
        <div class="detail-section">
          <h4><i class="fas fa-warehouse"></i> Movimiento de Stock</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Origen:</label>
              <span>{{ selectedMovimiento.origenNombre }}</span>
            </div>
            <div class="detail-item">
              <label>Destino:</label>
              <span>{{ selectedMovimiento.destinoNombre }}</span>
            </div>
          </div>
        </div>

        <!-- Usuario y Pedido -->
        <div class="detail-section">
          <h4><i class="fas fa-user"></i> Usuario y Pedido</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Usuario:</label>
              <span>{{ selectedMovimiento.usuarioNombre }}</span>
            </div>
            <div class="detail-item">
              <label>Pedido:</label>
              <span>{{ selectedMovimiento.pedidoCodigo }}</span>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="detail-section">
          <h4><i class="fas fa-calendar"></i> Información de Fecha</h4>
          <div class="detail-grid">
            <div class="detail-item full-width">
              <label>Fecha Movimiento:</label>
              <span>{{ formatDateTime(selectedMovimiento.fechaMovimiento) }}</span>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="detail-section" v-if="selectedMovimiento.observaciones">
          <h4><i class="fas fa-comment"></i> Observaciones</h4>
          <div class="detail-content">
            <p>{{ selectedMovimiento.observaciones }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <va-button color="secondary" @click="showDetailsModal = false">
        Cerrar
      </va-button>
    </template>
  </va-modal>
</template>

<script>
import HistorialMovimientosScript from './scripts/HistorialMovimientosScript.js';
export default HistorialMovimientosScript;
</script>
<style src="./styles/ToolUsageHistoryView.css" ></style>
<style src="/src/assets/EstiloBase.css" ></style>
