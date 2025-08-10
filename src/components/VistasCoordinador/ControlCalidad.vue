<template>
  <div class="produccion-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Control de Calidad</h1>
            <p class="header-subtitle">Gestiona y supervisa la calidad de los planos de producción</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" @click="refreshData" :disabled="loading" icon="refresh">
            {{ loading ? 'Cargando...' : 'Actualizar' }}
          </va-button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border" role="status">
        <span class="sr-only">Cargando planos...</span>
      </div>
    </div>

    <!-- Resumen estadístico en cards -->
    <va-row v-if="!loading" class="qc-stats">
      <va-col cols="12" sm="6" md="4" lg="2">
        <va-card class="stat-card pending h-100" @click="setFilter('status', 'pending')" hover stripe
          stripe-color="warning">

          <va-card-content class="d-flex align-items-center">
            <va-icon name="hourglass_empty" size="2rem" color="warning" class="mr-3" />
            <div class="stat-content">
              <div class="stat-value text-h4 font-weight-bold">{{ stats.pending }}</div>
              <div class="stat-label text-secondary">Pendientes</div>
            </div>
          </va-card-content>
        </va-card>
      </va-col>

      <va-col cols="12" sm="6" md="4" lg="2">
        <va-card class="stat-card in-progress h-100" @click="setFilter('status', 'in-progress')" hover stripe
          stripe-color="info">
          <va-card-content class="d-flex align-items-center">
            <va-icon name="settings" size="2rem" color="info" class="mr-3" />
            <div class="stat-content">
              <div class="stat-value text-h4 font-weight-bold">{{ stats.inProgress }}</div>
              <div class="stat-label text-secondary">En Inspección</div>
            </div>
          </va-card-content>
        </va-card>
      </va-col>

      <va-col cols="12" sm="6" md="4" lg="2">
        <va-card class="stat-card approved h-100" @click="setFilter('status', 'approved')" hover stripe
          stripe-color="success">
          <va-card-content class="d-flex align-items-center">
            <va-icon name="check_circle" size="2rem" color="success" class="mr-3" />
            <div class="stat-content">
              <div class="stat-value text-h4 font-weight-bold">{{ stats.approved }}</div>
              <div class="stat-label text-secondary">Aprobados</div>
            </div>
          </va-card-content>
        </va-card>
      </va-col>

      <va-col cols="12" sm="6" md="4" lg="2">
        <va-card class="stat-card rejected h-100" @click="setFilter('status', 'rejected')" hover stripe
          stripe-color="danger">
          <va-card-content class="d-flex align-items-center">
            <va-icon name="cancel" size="2rem" color="danger" class="mr-3" />
            <div class="stat-content">
              <div class="stat-value text-h4 font-weight-bold">{{ stats.rejected }}</div>
              <div class="stat-label text-secondary">Rechazados</div>
            </div>
          </va-card-content>
        </va-card>
      </va-col>

      <va-col cols="12" sm="6" md="4" lg="2">
        <va-card class="stat-card highlight h-100" hover stripe stripe-color="primary">
          <va-card-content class="d-flex align-items-center">
            <va-icon name="trending_up" size="2rem" color="primary" class="mr-3" />
            <div class="stat-content">
              <div class="stat-value text-h4 font-weight-bold">{{ stats.qualityRate }}%</div>
              <div class="stat-label text-secondary">Tasa Calidad</div>
            </div>
          </va-card-content>
        </va-card>
      </va-col>
    </va-row>

    <!-- Tabs Container -->
    <div class="tabs-container mb-4" v-if="!loading">
      <ul class="flex border-b border-gray-200">
        <li class="mr-1">
          <a @click="activeTab = 'inspecciones'" :class="{
            'bg-white border-l border-t border-r border-gray-200 text-blue-600': activeTab === 'inspecciones',
            'text-gray-500 hover:text-gray-700': activeTab !== 'inspecciones'
          }" class="inline-block py-2 px-4 font-semibold text-sm flex items-center">
            <i class="fas fa-search mr-2"></i>
            Inspecciones
          </a>
        </li>
        <li class="mr-1">
          <a @click="activeTab = 'reportes'" :class="{
            'bg-white border-l border-t border-r border-gray-200 text-blue-600': activeTab === 'reportes',
            'text-gray-500 hover:text-gray-700': activeTab !== 'reportes'
          }" class="inline-block py-2 px-4 font-semibold text-sm flex items-center">
            <i class="fas fa-chart-bar mr-2"></i>
            Reportes
          </a>
        </li>
      </ul>
    </div>

    <!-- Filtros compactos -->
    <div class="bg-white rounded-lg shadow-sm mb-4" v-if="!loading">
      <!-- Encabezado del panel -->
      <div class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
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
      <div v-if="showFilters" class="p-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-3">
          <!-- Filtro Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-tasks mr-1 text-gray-500"></i>
              Estado
            </label>
            <select v-model="filters.status"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="in-progress">En Inspección</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
          <!-- Filtro Inspector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-user-cog mr-1 text-gray-500"></i>
              Inspector
            </label>
            <select v-model="filters.inspector"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Todos</option>
              <option v-for="inspector in inspectors" :key="inspector.id" :value="inspector.id">
                {{ inspector.nombre }}
              </option>
            </select>
          </div>
          <!-- Filtro Fecha -->
          <div class="xl:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>
              Período
            </label>
            <div class="flex items-center space-x-2">
              <select v-model="filters.dateRange"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Todas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
            </div>
          </div>
          <!-- Filtro Búsqueda -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-search mr-1 text-gray-500"></i>
              Buscar
            </label>
            <div class="relative">
              <input v-model="searchQuery" placeholder="Número de plano, nombre..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                @keyup.enter="applyFilters">
              <button class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
                @click="applyFilters">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <!-- Acciones -->
        <div class="flex justify-end items-center space-x-2 pt-2 border-t border-gray-100">
          <va-button color="primary" size="small" @click="applyFilters" icon="check" class="text-xs px-3 py-1">
            Aplicar Filtros
          </va-button>
          <va-button preset="outline" color="secondary" size="small" @click="resetFilters" icon="refresh"
            class="text-xs px-3 py-1">
            Limpiar
          </va-button>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-container">
      <i class="material-icons">error</i>
      <p>{{ error }}</p>
      <button class="btn primary" @click="fetchPlanos">Reintentar</button>
    </div>

    <!-- Contenido de pestañas -->
    <div class="tab-content" v-if="!loading && !error">
      <!-- Pestaña Inspecciones -->
      <div v-if="activeTab === 'inspecciones'" class="tab-pane active">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th @click="sortBy('numeroPlano')">
                      Plano # <i class="material-icons sort-icon">{{ sortIcon('numeroPlano') }}</i>
                    </th>
                    <th @click="sortBy('nombrePlano')">Nombre</th>
                    <th @click="sortBy('descripcion')">Descripción</th>
                    <th @click="sortBy('fechaCreacion')">Fecha Creación</th>
                    <th @click="sortBy('version')">Versión</th>
                    <th>Archivo</th>
                    <th @click="sortBy('status')">Estado QC</th>
                    <th @click="sortBy('inspector')">Inspector</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="plano in filteredWorkOrders" :key="plano.idPlano" :class="getPlanoStatus(plano)">
                    <td>{{ plano.numeroPlano }}</td>
                    <td>{{ plano.nombrePlano }}</td>
                    <td class="description-cell">{{ plano.descripcion || '--' }}</td>
                    <td>{{ formatDate(plano.fechaCreacion) }}</td>
                    <td>{{ plano.version }}</td>
                    <td>
                      <button class="btn btn-sm btn-icon" @click="downloadPlano(plano)" v-if="plano.rutaArchivo">
                        <i class="material-icons">picture_as_pdf</i>
                        {{ getFileExtension(plano.rutaArchivo) }}
                      </button>
                      <span v-else>--</span>
                    </td>
                    <td>
                      <span :class="['badge', getPlanoStatusClass(plano)]">
                        {{ getStatusLabel(getPlanoStatus(plano)) }}
                      </span>
                    </td>
                    <td>{{ getInspector(plano) || '--' }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn btn-sm btn-icon btn-success" @click="startInspection(plano)"
                          v-if="getPlanoStatus(plano) === 'pending'" title="Iniciar Inspección">
                          <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-primary" @click="openInspection(plano)"
                          v-if="getPlanoStatus(plano) === 'in-progress'" title="Continuar Inspección">
                          <i class="fas fa-cogs"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-info" @click="viewReport(plano)"
                          v-if="['approved', 'rejected'].includes(getPlanoStatus(plano))" title="Ver Reporte">
                          <i class="fas fa-file-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-icon" @click="viewBlueprint(plano)" v-if="plano.rutaArchivo"
                          title="Ver Plano">
                          <i class="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestaña Reportes -->
      <div v-if="activeTab === 'reportes'" class="tab-pane active">
        <div class="card">
          <div class="card-body">
            <div class="reports-section">
              <div class="reports-grid">
                <div class="report-card">
                  <div class="report-icon">
                    <i class="fas fa-chart-pie"></i>
                  </div>
                  <div class="report-content">
                    <h3>Distribución por Estado</h3>
                    <p>Visualiza la distribución de planos por estado de calidad</p>
                    <button class="btn btn-primary btn-sm">Ver Reporte</button>
                  </div>
                </div>
                <div class="report-card">
                  <div class="report-icon">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div class="report-content">
                    <h3>Tendencias de Calidad</h3>
                    <p>Análisis de tendencias de calidad en el tiempo</p>
                    <button class="btn btn-primary btn-sm">Ver Reporte</button>
                  </div>
                </div>
                <div class="report-card">
                  <div class="report-icon">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="report-content">
                    <h3>Rendimiento por Inspector</h3>
                    <p>Estadísticas de rendimiento de cada inspector</p>
                    <button class="btn btn-primary btn-sm">Ver Reporte</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Inspección -->
    <div class="modal-overlay" v-if="showInspectionModal" @click.self="closeInspectionModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Inspección de Calidad - {{ currentPlano.numeroPlano }}</h2>
          <button class="close-btn" @click="closeInspectionModal">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body">
          <div class="inspection-sections">
            <!-- Sección de detalles del plano -->
            <div class="inspection-section">
              <h3><i class="material-icons">info</i> Detalles del Plano</h3>
              <div class="detail-row">
                <span class="detail-label">Nombre:</span>
                <span>{{ currentPlano.nombrePlano }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Descripción:</span>
                <span>{{ currentPlano.descripcion || 'Sin descripción' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Versión:</span>
                <span>{{ currentPlano.version }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha Creación:</span>
                <span>{{ formatDate(currentPlano.fechaCreacion) }}</span>
              </div>
              <div class="detail-row" v-if="currentPlano.rutaArchivo">
                <span class="detail-label">Archivo:</span>
                <button class="btn secondary small" @click="downloadPlano(currentPlano)">
                  <i class="material-icons">download</i> Descargar Plano
                </button>
              </div>
            </div>

            <!-- Sección de checklist -->
            <div class="inspection-section">
              <h3><i class="material-icons">checklist</i> Checklist de Calidad</h3>
              <div class="checklist-items">
                <div class="checklist-item" v-for="(item, index) in qualityChecklist" :key="index">
                  <label class="checkbox-container">
                    {{ item.name }}
                    <input type="checkbox" v-model="item.checked">
                    <span class="checkmark"></span>
                  </label>
                  <textarea v-model="item.notes" placeholder="Notas/observaciones" class="checklist-notes"></textarea>
                </div>
              </div>
            </div>

            <!-- Sección de mediciones -->
            <div class="inspection-section">
              <h3><i class="material-icons">straighten</i> Mediciones</h3>
              <table class="measurements-table">
                <thead>
                  <tr>
                    <th>Parámetro</th>
                    <th>Valor Esperado</th>
                    <th>Valor Medido</th>
                    <th>Tolerancia</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(measure, index) in measurements" :key="index">
                    <td>{{ measure.parameter }}</td>
                    <td>{{ measure.expected }} {{ measure.unit }}</td>
                    <td>
                      <input type="number" v-model="measure.actual" :step="measure.step || 0.01">
                    </td>
                    <td>±{{ measure.tolerance }} {{ measure.unit }}</td>
                    <td>
                      <span class="measure-result" :class="getMeasureClass(measure)">
                        {{ getMeasureResult(measure) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Sección de decisión final -->
            <div class="inspection-section decision-section">
              <h3><i class="material-icons">gavel</i> Decisión Final</h3>
              <div class="decision-options">
                <div class="decision-option">
                  <label class="radio-container">
                    Aprobar plano
                    <input type="radio" name="decision" value="approved" v-model="inspectionDecision">
                    <span class="radiomark"></span>
                  </label>
                </div>
                <div class="decision-option">
                  <label class="radio-container">
                    Rechazar plano
                    <input type="radio" name="decision" value="rejected" v-model="inspectionDecision">
                    <span class="radiomark"></span>
                  </label>
                  <textarea v-model="rejectionReason" placeholder="Motivo del rechazo" class="rejection-reason"
                    v-if="inspectionDecision === 'rejected'"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <va-button preset="outline" color="secondary" @click="closeInspectionModal">Cancelar</va-button>
          <va-button color="primary" @click="submitInspection" :disabled="!inspectionDecision" icon="save">
            Guardar Inspección
          </va-button>
        </div>
      </div>
    </div>

    <!-- Modal de Reportes -->
    <div class="modal-overlay" v-if="showReportModal" @click.self="closeReportModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Reporte de Calidad - {{ currentPlano.numeroPlano }}</h2>
          <button class="close-btn" @click="closeReportModal">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body report-body">
          <div class="report-section">
            <h3>Detalles de la Inspección</h3>
            <div class="report-details">
              <div class="report-row">
                <span class="report-label">Estado:</span>
                <span class="report-value" :class="getPlanoStatus(currentPlano)">{{
                  getStatusLabel(getPlanoStatus(currentPlano)) }}</span>
              </div>
              <div class="report-row">
                <span class="report-label">Inspector:</span>
                <span class="report-value">{{ getInspector(currentPlano) }}</span>
              </div>
              <div class="report-row">
                <span class="report-label">Fecha Inspección:</span>
                <span class="report-value">{{ formatDate(currentPlano.inspectionDate) }}</span>
              </div>
              <div class="report-row" v-if="getPlanoStatus(currentPlano) === 'rejected'">
                <span class="report-label">Motivo Rechazo:</span>
                <span class="report-value">{{ currentPlano.rejectionReason }}</span>
              </div>
            </div>
          </div>

          <div class="report-section">
            <h3>Resultados de Mediciones</h3>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Esperado</th>
                  <th>Medido</th>
                  <th>Tolerancia</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(measure, index) in currentPlano.measurements || []" :key="index">
                  <td>{{ measure.parameter }}</td>
                  <td>{{ measure.expected }} {{ measure.unit }}</td>
                  <td>{{ measure.actual }} {{ measure.unit }}</td>
                  <td>±{{ measure.tolerance }} {{ measure.unit }}</td>
                  <td :class="getMeasureClass(measure)">
                    {{ getMeasureResult(measure) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="report-actions">
            <va-button preset="outline" color="secondary" @click="printReport" icon="print">
              Imprimir Reporte
            </va-button>
            <va-button color="primary" @click="downloadReport" icon="download">
              Descargar PDF
            </va-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de vista de plano -->
    <div class="modal-overlay" v-if="showBlueprintModal" @click.self="closeBlueprintModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h2>Plano - {{ selectedPlano.numeroPlano }}</h2>
          <button class="close-btn" @click="closeBlueprintModal">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body">
          <div class="blueprint-viewer">
            <p>Archivo: {{ selectedPlano.rutaArchivo }}</p>
            <p>Versión: {{ selectedPlano.version }}</p>
            <div class="blueprint-actions">
              <va-button color="primary" @click="downloadPlano(selectedPlano)" icon="download">
                Descargar
              </va-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./scripts/ControlCalidad.js"></script>
<style scoped>
.qc-stats {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 90%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-value {
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.qc-stats .va-col {
  display: flex;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stat-card {
    min-height: 60px;
  }
}
</style>
<style src="src/assets/EstiloBase.css"></style>
