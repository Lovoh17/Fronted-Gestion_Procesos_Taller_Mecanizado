<template>
  <div class="reports-dashboard">
    <div class="content-wrapper">
      <main>
        <!-- Encabezado -->
        <div class="header-section">
          <div class="header-content">
            <div class="header-info">
              <div class="header-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="header-text">
                <h1 class="header-title">Reportes</h1>
                <p class="header-subtitle">Consulta el rendimiento, movimientos e indicadores clave del sistema</p>
              </div>
            </div>
            <div class="header-actions">
              <va-button color="#003366" @click="showNewReportModal = true" icon="add">
                Nuevo Reporte
              </va-button>
            </div>
          </div>
        </div>

        <!-- Resumen estadístico mejorado -->
        <div class="reports-summary mb-6">
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-icon total">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="stat-info">
                <h4>Total Reportes</h4>
                <p class="stat-value">{{ totalReports }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h4>Pendientes</h4>
                <p class="stat-value">{{ pendingReports }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon progress">
                <i class="fas fa-tasks"></i>
              </div>
              <div class="stat-info">
                <h4>En Proceso</h4>
                <p class="stat-value">{{ inProgressReports }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon completed">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <h4>Generados</h4>
                <p class="stat-value">{{ generatedReports }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros avanzados -->
        <div class="bg-white rounded-lg shadow-sm mb-4">
          <!-- Encabezado del panel -->
          <div class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="toggleFilters">
            <div class="flex items-center text-gray-700 font-medium">
              <i class="fas fa-filter mr-2 text-gray-500"></i>
              <span>Filtros de Búsqueda</span>
              <div v-if="hasActiveFilters"
                class="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
                {{ activeFiltersCount }}
              </div>
            </div>
            <button class="text-gray-500 hover:text-gray-700">
              <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
          </div>

          <!-- Contenido de filtros -->
          <div v-if="showFilters" class="p-4 border-t border-gray-200">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
              <!-- Filtro Tipo de Reporte -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-file-alt mr-1 text-gray-500"></i>
                  Tipo
                </label>
                <va-select v-model="reportType" :options="[
                  { text: 'Todos', value: 'all' },
                  { text: 'Producción', value: 'produccion' },
                  { text: 'Control de Calidad', value: 'calidad' },
                  { text: 'Mantenimiento', value: 'mantenimiento' },
                  { text: 'Inventario', value: 'inventario' },
                  { text: 'Costos', value: 'costos' },
                  { text: 'Performance', value: 'performance' }
                ]" class="w-full" placeholder="Seleccionar tipo" clearable />
              </div>

              <!-- Filtro Prioridad -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-exclamation-triangle mr-1 text-gray-500"></i>
                  Prioridad
                </label>
                <va-select v-model="priorityFilter" :options="[
                  { text: 'Todas', value: 'all' },
                  { text: 'Baja', value: 'baja' },
                  { text: 'Media', value: 'media' },
                  { text: 'Alta', value: 'alta' },
                  { text: 'Crítica', value: 'critica' }
                ]" class="w-full" placeholder="Seleccionar prioridad" clearable />
              </div>

              <!-- Filtros de Estado -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-toggle-on mr-1 text-gray-500"></i>
                  Estados
                </label>
                <div class="space-y-1">
                  <va-checkbox v-model="statusFilters.pending" label="Pendiente" class="text-sm" />
                  <va-checkbox v-model="statusFilters.in_progress" label="En Proceso" class="text-sm" />
                  <va-checkbox v-model="statusFilters.generated" label="Generado" class="text-sm" />
                </div>
              </div>

              <!-- Filtro Fecha Inicio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>
                  Fecha Desde
                </label>
                <va-input type="date" v-model="dateRange.start" class="w-full" />
              </div>

              <!-- Filtro Fecha Fin -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>
                  Fecha Hasta
                </label>
                <va-input type="date" v-model="dateRange.end" class="w-full" />
              </div>
            </div>

            <!-- Barra de búsqueda -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-search mr-1 text-gray-500"></i>
                Búsqueda Global
              </label>
              <va-input v-model="searchQuery" placeholder="Buscar por título, descripción o solicitante..." 
                class="w-full" clearable>
                <template #prependInner>
                  <va-icon name="search" class="text-gray-500" />
                </template>
              </va-input>
            </div>

            <!-- Acciones de filtros -->
            <div class="flex justify-end items-center space-x-3 pt-4 border-t border-gray-100">
              <va-button preset="outline" color="secondary" size="medium" @click="resetFilters" icon="refresh">
                Limpiar Filtros
              </va-button>
              <va-button color="primary" size="medium" @click="applyFilters" icon="check">
                Aplicar Filtros
              </va-button>
            </div>
          </div>
        </div>

        <!-- Tabla de reportes con vue-good-table-next -->
        <div class="card">
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin fa-2x"></i>
              <p>Cargando reportes...</p>
            </div>

            <div v-else>
              <vue-good-table
                ref="vueGoodTable"
                :columns="tableColumns"
                :rows="filteredReports"
                :fixedHeader="true"
                max-height="45vh"
                :search-options="{
                  enabled: true,
                  placeholder: 'Buscar reportes...',
                  externalQuery: searchQuery
                }"
                :pagination-options="{
                  enabled: true,
                  mode: 'records',
                  perPage: 15,
                  perPageDropdown: [10, 15, 25, 50],
                  dropdownAllowAll: false,
                  nextLabel: 'Siguiente',
                  prevLabel: 'Anterior',
                  rowsPerPageLabel: 'Filas por página',
                  ofLabel: 'de',
                  pageLabel: 'página',
                  allLabel: 'Todos'
                }"
                :sort-options="{
                  enabled: true,
                  initialSortBy: { field: 'fecha_solicitud', type: 'desc' }
                }"
                :select-options="{
                  enabled: false
                }"
                styleClass="vgt-table striped bordered"
                theme="nocturnal"
              >
                <!-- Slot personalizado para cada celda -->
                <template #table-row="props">
                  <!-- Columna de Tipo -->
                  <span v-if="props.column.field === 'tipo'">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-blue-100 text-blue-800': props.row.tipo === 'produccion',
                        'bg-green-100 text-green-800': props.row.tipo === 'calidad',
                        'bg-yellow-100 text-yellow-800': props.row.tipo === 'mantenimiento',
                        'bg-purple-100 text-purple-800': props.row.tipo === 'inventario',
                        'bg-red-100 text-red-800': props.row.tipo === 'costos',
                        'bg-indigo-100 text-indigo-800': props.row.tipo === 'performance'
                      }">
                      {{ formatReportType(props.row.tipo) }}
                    </span>
                  </span>
                  
                  <!-- Columna de Estado -->
                  <span v-else-if="props.column.field === 'estado'">
                    <span :class="['badge', statusClass(props.row.estado)]">
                      {{ formatStatus(props.row.estado) }}
                    </span>
                  </span>
                  
                  <!-- Columna de Prioridad -->
                  <span v-else-if="props.column.field === 'prioridad'">
                    <span :class="['badge', priorityClass(props.row.prioridad)]">
                      {{ formatPriority(props.row.prioridad) }}
                    </span>
                  </span>
                  
                  <!-- Columna de Fecha de Solicitud -->
                  <span v-else-if="props.column.field === 'fecha_solicitud'">
                    {{ formatDate(props.row.fecha_solicitud) }}
                  </span>
                  
                  <!-- Columna de Fecha de Entrega -->
                  <span v-else-if="props.column.field === 'fecha_entrega_estimada'">
                    {{ formatDate(props.row.fecha_entrega_estimada) }}
                  </span>
                  
                  <!-- Columna de Progreso -->
                  <span v-else-if="props.column.field === 'progreso'">
                    <div class="flex items-center">
                      <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-blue-600 h-2 rounded-full" 
                          :style="{ width: props.row.progreso + '%' }"></div>
                      </div>
                      <span class="text-xs font-medium">{{ props.row.progreso }}%</span>
                    </div>
                  </span>
                  
                  <!-- Columna de Acciones -->
                  <span v-else-if="props.column.field === 'actions'">
                    <div class="action-buttons">
                      <va-button 
                        size="small" 
                        preset="plain" 
                        color="info" 
                        @click="viewReport(props.row)" 
                        icon="visibility"
                        class="mr-1"
                      ></va-button>
                      <va-button 
                        v-if="props.row.archivo_url"
                        size="small" 
                        preset="plain" 
                        color="success" 
                        @click="downloadReport(props.row)" 
                        icon="download"
                        class="mr-1"
                      ></va-button>
                      <va-button 
                        v-if="props.row.estado === 'pending' || props.row.estado === 'in_progress'"
                        size="small" 
                        preset="plain" 
                        color="warning" 
                        @click="generateReport(props.row)" 
                        icon="play_arrow"
                        class="mr-1"
                      ></va-button>
                      <va-button 
                        size="small" 
                        preset="plain" 
                        color="danger" 
                        @click="deleteReport(props.row.id)" 
                        icon="delete"
                      ></va-button>
                    </div>
                  </span>
                  
                  <!-- Contenido por defecto -->
                  <span v-else>
                    {{ props.formattedRow[props.column.field] }}
                  </span>
                </template>

                <!-- Slot para acciones en la parte superior de la tabla -->
                <template #table-actions>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="table-info">
                      <span class="text-muted">Reportes: {{ filteredReports.length }} de {{ totalReports }}</span>
                    </div>
                    <div class="table-actions-buttons">
                      <va-button 
                        color="success" 
                        size="small" 
                        @click="exportToCSV" 
                        icon="download"
                        class="mr-2"
                      >
                        Exportar CSV
                      </va-button>
                      <va-button 
                        color="primary" 
                        size="small" 
                        @click="loadReports" 
                        icon="refresh"
                        :loading="loading"
                      >
                        Recargar
                      </va-button>
                    </div>
                  </div>
                </template>

                <!-- Mensaje cuando no hay datos -->
                <template #emptystate>
                  <div class="text-center py-4">
                    <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay reportes disponibles</h5>
                    <p class="text-muted">Los reportes generados aparecerán aquí</p>
                    <va-button color="primary" @click="showNewReportModal = true" icon="add">
                      Crear Primer Reporte
                    </va-button>
                  </div>
                </template>
              </vue-good-table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modales (opcional - para futuras implementaciones) -->
    <!-- <ReportDetailModal v-if="selectedReport" :report="selectedReport" @close="selectedReport = null" /> -->
    <!-- <NewReportModal v-if="showNewReportModal" @close="showNewReportModal = false" @save="addReport" /> -->
  </div>
</template>

<script>
import ReportsScript from './ComponentesAdmin/Script/Reports.js'

export default ReportsScript
</script>
<style src="src/assets/EstiloBase.css" scoped></style>
