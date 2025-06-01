<template>
  <div class="reports-dashboard">
    <div class="content-wrapper">
      <main>
        <!-- Encabezado -->
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-clipboard-list"></i> Gestión de Reportes
          </h1>
        </div>
        
        <div class="reports-container">
          <!-- Panel de filtros -->
          <div class="filters-panel">
            <div class="panel-header">
              <h3><i class="fas fa-filter"></i> Filtros Avanzados</h3>
              <button class="btn btn-link" @click="toggleFilters">
                {{ showFilters ? 'Ocultar' : 'Mostrar' }} filtros
              </button>
            </div>
            
            <transition name="slide-fade">
              <div class="report-filters" v-if="showFilters">
                <!-- Filtros de reporte -->
                <div class="filter-row">
                  <div class="filter-group">
                    <label>Tipo de Reporte:</label>
                    <select v-model="reportType" class="form-select">
                      <option value="all">Todos los Reportes</option>
                      <option value="materiales">Materiales</option>
                      <option value="herramientas">Herramientas</option>
                      <option value="incidentes">Incidentes</option>
                    </select>
                  </div>
                  
                  <div class="filter-group">
                    <label>Rango de Fechas:</label>
                    <date-range-picker v-model="dateRange" />
                  </div>
                </div>
                
                <!-- Filtros adicionales -->
                <div class="filter-row">
                  <div class="filter-group">
                    <label>Estado:</label>
                    <div class="status-filters">
                      <label class="status-filter">
                        <input type="checkbox" v-model="statusFilters.pending" />
                        <span class="status-badge pending">Pendiente</span>
                      </label>
                      <label class="status-filter">
                        <input type="checkbox" v-model="statusFilters.in_progress" />
                        <span class="status-badge in-progress">En Progreso</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="filter-group">
                    <label>Búsqueda:</label>
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="Buscar en reportes..."
                    />
                  </div>
                </div>
                
                <!-- Acciones de filtros -->
                <div class="filter-actions">
                  <button class="btn btn-primary" @click="applyFilters">
                    Aplicar Filtros
                  </button>
                  <button class="btn btn-outline-secondary" @click="resetFilters">
                    Restablecer
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- Resumen estadístico -->
          <div class="reports-summary">
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-icon total">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="stat-info">
                  <h4>Total Reportes</h4>
                  <p class="stat-value">0</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon pending">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                  <h4>Pendientes</h4>
                  <p class="stat-value">0</p>
                </div>
              </div>
            </div>
            
            <div class="summary-chart">
              <h4>Tendencia de Reportes</h4>
              <!-- Gráfico se cargará aquí -->
            </div>
          </div>
          
          <!-- Controles de vista -->
          <div class="view-controls">
            <div class="view-options">
              <button class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'list' }" 
                      @click="viewMode = 'list'">
                <i class="fas fa-list"></i> Lista
              </button>
              <button class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'table' }" 
                      @click="viewMode = 'table'">
                <i class="fas fa-table"></i> Tabla
              </button>
            </div>
          </div>
          
          <!-- Vista de reportes -->
          <div class="reports-view">
            <!-- Vista de lista -->
            <div class="reports-list" v-if="viewMode === 'list'">
              <div class="no-results">
                <i class="fas fa-inbox"></i>
                <h4>No hay reportes</h4>
                <p>No hay reportes que mostrar</p>
              </div>
            </div>
            
            <!-- Vista de tabla -->
            <div class="reports-table" v-else-if="viewMode === 'table'">
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Datos se cargarán aquí -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Modales -->
    <ReportDetailModal 
      v-if="selectedReport"
      :report="selectedReport"
      @close="selectedReport = null"
    />
    
    <NewReportModal 
      v-if="showNewReportModal"
      @close="showNewReportModal = false"
    />
  </div>
</template>

<script>
export default {
  name: 'ReportsDashboard',
  data() {
    return {
      reportType: 'all',
      dateRange: {
        start: null,
        end: null
      },
      statusFilters: {
        pending: true,
        in_progress: true,
        resolved: true
      },
      searchQuery: '',
      showFilters: true,
      viewMode: 'list',
      selectedReport: null,
      showNewReportModal: false
    }
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    applyFilters() {
      // Lógica para aplicar filtros
    },
    resetFilters() {
      // Lógica para resetear filtros
    }
  }
}
</script>
