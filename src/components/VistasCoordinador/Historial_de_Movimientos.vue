<template>
  <Sidebar :role="'coordinator'" />
  <div class="historial-movimientos-container">
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
          <div class="stat-label">Préstamos</div>
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
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.activos }}</div>
          <div class="stat-label">Activos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon danger">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.vencidos }}</div>
          <div class="stat-label">Vencidos</div>
        </div>
      </div>
      <div class="stat-card cost-stat">
        <div class="stat-icon">
          <i class="fas fa-calculator"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalHoras }}h</div>
          <div class="stat-sublabel">S/ {{ stats.totalCosto }}</div>
          <div class="stat-label">Horas / Costo Total</div>
        </div>
      </div>
    </div>

    <!-- Controles de tabla -->
    <div class="table-controls">
      <div class="search-box">
        <input type="text" v-model="searchTerm" placeholder="Buscar movimientos por herramienta, usuario o proyecto..."
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
      <vue-good-table :columns="columns" :rows="filteredData" max-height="45vh" :fixedHeader="true"
        :pagination-options="paginationOptions" :sort-options="{ enabled: true, initialSortBy: sortOption }"
        :search-options="{
          enabled: true,
          externalQuery: searchTerm
        }" :loading="isLoading" theme="nocturnal" compactMode styleClass="vgt-table striped condensed fixed-header">
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
                <label>Estado:</label>
                <span :class="getStatusBadgeClass(selectedMovimiento.estado)">
                  {{ selectedMovimiento.estado }}
                </span>
              </div>
              <div class="detail-item">
                <label>Departamento:</label>
                <span>{{ selectedMovimiento.departamento }}</span>
              </div>
            </div>
          </div>

          <!-- Herramienta -->
          <div class="detail-section">
            <h4><i class="fas fa-tools"></i> Herramienta</h4>
            <div class="detail-grid">
              <div class="detail-item full-width">
                <label>Nombre:</label>
                <span>{{ selectedMovimiento.herramienta }}</span>
              </div>
            </div>
          </div>

          <!-- Usuario y Proyecto -->
          <div class="detail-section">
            <h4><i class="fas fa-user"></i> Usuario y Proyecto</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Usuario:</label>
                <span>{{ selectedMovimiento.usuario }}</span>
              </div>
              <div class="detail-item full-width">
                <label>Proyecto:</label>
                <span>{{ selectedMovimiento.proyecto }}</span>
              </div>
            </div>
          </div>

          <!-- Fechas y Tiempos -->
          <div class="detail-section">
            <h4><i class="fas fa-calendar"></i> Fechas y Tiempos</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Fecha Movimiento:</label>
                <span>{{ formatDateTime(selectedMovimiento.fechaMovimiento) }}</span>
              </div>
              <div class="detail-item">
                <label>Fecha Devolución:</label>
                <span v-if="selectedMovimiento.fechaDevolucion">
                  {{ formatDateTime(selectedMovimiento.fechaDevolucion) }}
                </span>
                <span v-else class="fecha-pendiente">Pendiente</span>
              </div>
              <div class="detail-item">
                <label>Duración:</label>
                <span>{{ calcularDuracionPrestamo(selectedMovimiento.fechaMovimiento,
                  selectedMovimiento.fechaDevolucion)
                  }}</span>
              </div>
              <div class="detail-item">
                <label>Horas de Uso:</label>
                <span class="hours-badge">{{ selectedMovimiento.horasUso }}h</span>
              </div>
            </div>
          </div>

          <!-- Costos -->
          <div class="detail-section">
            <h4><i class="fas fa-dollar-sign"></i> Información de Costos</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Costo Total:</label>
                <span class="currency">{{ formatCurrency(selectedMovimiento.costo) }}</span>
              </div>
              <div class="detail-item">
                <label>Costo por Hora:</label>
                <span class="currency">{{ formatCurrency(selectedMovimiento.costo / selectedMovimiento.horasUso)
                  }}</span>
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

          <!-- Aprobación -->
          <div class="detail-section">
            <h4><i class="fas fa-check"></i> Aprobación</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Aprobado por:</label>
                <span>{{ selectedMovimiento.aprobadoPor }}</span>
              </div>
              <div class="detail-item">
                <label>Ubicación Origen:</label>
                <span>{{ selectedMovimiento.ubicacionOrigen }}</span>
              </div>
              <div class="detail-item">
                <label>Ubicación Destino:</label>
                <span>{{ selectedMovimiento.ubicacionDestino }}</span>
              </div>
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
  </div>
</template>

<script>
import HistorialMovimientosScript from './scripts/HistorialMovimientosScript.js';
export default HistorialMovimientosScript;
</script>
<style src="./styles/ToolUsageHistoryView.css" scoped></style>
<style src="src/assets/EstiloBase.css"></style>
