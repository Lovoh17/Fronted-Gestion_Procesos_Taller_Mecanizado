<template>
  <div class="reports-dashboard">
    <div class="content-wrapper">
      <main>
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-clipboard-list"></i> Gestión de Reportes
          </h1>
        </div>
        
        <div class="reports-container">
          <div class="filters-panel">
            <div class="panel-header">
              <h3><i class="fas fa-filter"></i> Filtros Avanzados</h3>
              <button class="btn btn-link" @click="toggleFilters">
                {{ showFilters ? 'Ocultar' : 'Mostrar' }} filtros
                <i class="fas" :class="showFilters ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>
            </div>
            <transition name="slide-fade">
              <div class="report-filters" v-if="showFilters">
                <div class="filter-row">
                  <div class="filter-group">
                    <label><i class="fas fa-file-alt"></i> Tipo de Reporte:</label>
                    <select v-model="reportType" class="form-select" @change="loadReports">
                      <option value="all">Todos los Reportes</option>
                      <option value="materiales">Falta de Materiales</option>
                      <option value="herramientas">Mantenimiento de Herramientas</option>
                      <option value="incidentes">Incidentes de Seguridad</option>
                      <option value="produccion">Retrasos en Producción</option>
                      <option value="calidad">Problemas de Calidad</option>
                    </select>
                  </div>
                  
                  <div class="filter-group">
                    <label><i class="fas fa-calendar-alt"></i> Rango de Fechas:</label>
                    <date-range-picker 
                      v-model="dateRange" 
                      :ranges="dateRanges"
                      :locale="datePickerLocale"
                    />
                  </div>
                  
                  <div class="filter-group">
                    <label><i class="fas fa-user-tag"></i> Reportado por:</label>
                    <select v-model="selectedEmployee" class="form-select">
                      <option value="all">Todos los empleados</option>
                      <option v-for="emp in employees" :value="emp.id">{{ emp.name }}</option>
                    </select>
                  </div>
                </div>
                
                <div class="filter-row">
                  <div class="filter-group">
                    <label><i class="fas fa-flag"></i> Estado:</label>
                    <div class="status-filters">
                      <label class="status-filter">
                        <input type="checkbox" v-model="statusFilters.pending" /> 
                        <span class="status-badge pending">Pendiente</span>
                      </label>
                      <label class="status-filter">
                        <input type="checkbox" v-model="statusFilters.in_progress" /> 
                        <span class="status-badge in-progress">En Progreso</span>
                      </label>
                      <label class="status-filter">
                        <input type="checkbox" v-model="statusFilters.resolved" /> 
                        <span class="status-badge resolved">Resuelto</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="filter-group">
                    <label><i class="fas fa-search"></i> Búsqueda:</label>
                    <div class="search-input">
                      <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Buscar en reportes..."
                        @keyup.enter="applyFilters"
                      />
                      <button class="search-btn" @click="applyFilters">
                        <i class="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="filter-actions">
                  <button class="btn btn-primary" @click="applyFilters">
                    <i class="fas fa-filter"></i> Aplicar Filtros
                  </button>
                  <button class="btn btn-outline-secondary" @click="resetFilters">
                    <i class="fas fa-undo"></i> Restablecer
                  </button>
                  <button class="btn btn-success" @click="generateReport">
                    <i class="fas fa-file-export"></i> Exportar Reporte
                  </button>
                  <button class="btn btn-info" @click="showNewReportModal = true">
                    <i class="fas fa-plus"></i> Nuevo Reporte
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- Resumen y estadísticas -->
          <div class="reports-summary">
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-icon total">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="stat-info">
                  <h4>Total Reportes</h4>
                  <p class="stat-value">{{ totalReports }}</p>
                  <p class="stat-change" :class="reportsChange >= 0 ? 'positive' : 'negative'">
                    <i class="fas" :class="reportsChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
                    {{ Math.abs(reportsChange) }}% vs último mes
                  </p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon pending">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-info">
                  <h4>Pendientes</h4>
                  <p class="stat-value">{{ pendingCount }}</p>
                  <div class="progress">
                    <div class="progress-bar bg-warning" 
                         :style="{ width: (pendingCount / totalReports * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon resolved">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                  <h4>Resueltos</h4>
                  <p class="stat-value">{{ resolvedCount }}</p>
                  <div class="progress">
                    <div class="progress-bar bg-success" 
                         :style="{ width: (resolvedCount / totalReports * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon critical">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-info">
                  <h4>Críticos</h4>
                  <p class="stat-value">{{ criticalReportsCount }}</p>
                  <p class="stat-subtext">Últimos 7 días</p>
                </div>
              </div>
            </div>
            
            <div class="summary-chart">
              <h4>Tendencia de Reportes</h4>
              <reports-trend-chart :data="reportsTrendData" />
            </div>
          </div>
          
          <!-- Controles de vista y ordenamiento -->
          <div class="view-controls">
            <div class="view-options">
              <button class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'list' }" 
                      @click="viewMode = 'list'">
                <i class="fas fa-list"></i> Lista
              </button>
              <button class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'grid' }" 
                      @click="viewMode = 'grid'">
                <i class="fas fa-th-large"></i> Cuadrícula
              </button>
              <button class="btn btn-sm" :class="{ 'btn-primary': viewMode === 'table' }" 
                      @click="viewMode = 'table'">
                <i class="fas fa-table"></i> Tabla
              </button>
            </div>
            
            <div class="sort-options">
              <label>Ordenar por:</label>
              <select v-model="sortBy" class="form-select-sm">
                <option value="date-desc">Fecha (más reciente)</option>
                <option value="date-asc">Fecha (más antigua)</option>
                <option value="priority">Prioridad</option>
                <option value="status">Estado</option>
              </select>
              
              <label>Mostrar:</label>
              <select v-model="itemsPerPage" class="form-select-sm">
                <option value="10">10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </select>
            </div>
          </div>
          
          <!-- Vista de reportes según modo seleccionado -->
          <div class="reports-view">
            <!-- Vista de lista (tarjetas) -->
            <div class="reports-list" v-if="viewMode === 'list'">
              <div class="report-card" v-for="report in paginatedReports" :key="report.id" 
                   :class="'priority-' + report.priority">
                <div class="report-header">
                  <div class="report-title">
                    <h3>
                      <i class="fas" :class="getReportIcon(report.type)"></i>
                      {{ report.title }}
                      <span class="badge bg-secondary" v-if="report.priority === 'high'">
                        <i class="fas fa-exclamation"></i> Urgente
                      </span>
                    </h3>
                    <div class="report-meta">
                      <span class="report-id">#{{ report.id }}</span>
                      <span class="report-date">
                        <i class="far fa-clock"></i> {{ formatDate(report.date) }}
                      </span>
                    </div>
                  </div>
                  <span class="report-status" :class="'status-' + report.status">
                    {{ formatStatus(report.status) }}
                  </span>
                </div>
                
                <div class="report-body">
                  <p class="report-description">{{ report.description }}</p>
                  
                  <div class="report-details">
                    <div class="detail-item">
                      <i class="fas fa-user"></i>
                      <strong>Reportado por:</strong> {{ report.employee }}
                      <span class="badge bg-light text-dark" v-if="report.department">
                        {{ report.department }}
                      </span>
                    </div>
                    
                    <div class="detail-item" v-if="report.assignedTo">
                      <i class="fas fa-user-tie"></i>
                      <strong>Asignado a:</strong> {{ report.assignedTo }}
                    </div>
                    
                    <div class="detail-item" v-if="report.dueDate">
                      <i class="fas fa-calendar-check"></i>
                      <strong>Fecha límite:</strong> {{ formatDate(report.dueDate) }}
                    </div>
                    
                    <div v-if="report.type === 'materiales'" class="material-details">
                      <div class="detail-item">
                        <i class="fas fa-box-open"></i>
                        <strong>Material faltante:</strong> {{ report.material }}
                      </div>
                      <div class="detail-item">
                        <i class="fas fa-ruler-combined"></i>
                        <strong>Cantidad:</strong> {{ report.quantity }} {{ report.unit }}
                      </div>
                      <div class="detail-item" v-if="report.supplier">
                        <i class="fas fa-truck"></i>
                        <strong>Proveedor:</strong> {{ report.supplier }}
                      </div>
                    </div>
                    
                    <div v-else-if="report.type === 'herramientas'" class="tool-details">
                      <div class="detail-item">
                        <i class="fas fa-tools"></i>
                        <strong>Herramienta:</strong> {{ report.tool }}
                      </div>
                      <div class="detail-item">
                        <i class="fas fa-exclamation-circle"></i>
                        <strong>Problema:</strong> {{ report.issue }}
                      </div>
                      <div class="detail-item" v-if="report.estimatedRepairTime">
                        <i class="fas fa-hourglass-half"></i>
                        <strong>Tiempo estimado de reparación:</strong> {{ report.estimatedRepairTime }}
                      </div>
                    </div>
                    
                    <div v-else-if="report.type === 'incidentes'" class="incident-details">
                      <div class="detail-item">
                        <i class="fas fa-shield-alt"></i>
                        <strong>Tipo de incidente:</strong> {{ report.incidentType }}
                      </div>
                      <div class="detail-item">
                        <i class="fas fa-info-circle"></i>
                        <strong>Severidad:</strong> 
                        <span class="badge" :class="'severity-' + report.severity">
                          {{ report.severity }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="report-tags" v-if="report.tags && report.tags.length">
                    <span class="tag" v-for="tag in report.tags" :key="tag">
                      #{{ tag }}
                    </span>
                  </div>
                  
                  <div class="report-attachments" v-if="report.attachments && report.attachments.length">
                    <h5><i class="fas fa-paperclip"></i> Adjuntos:</h5>
                    <div class="attachments-list">
                      <a v-for="(att, index) in report.attachments" :key="index" 
                         :href="att.url" target="_blank" class="attachment-item">
                        <i class="fas" :class="getFileIcon(att.type)"></i> {{ att.name }}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div class="report-footer">
                  <div class="report-actions">
                    <button class="btn btn-sm btn-outline-primary" @click="viewDetails(report)">
                      <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button class="btn btn-sm btn-outline-success" 
                            @click="markAsResolved(report)" 
                            v-if="report.status === 'pending' || report.status === 'in_progress'">
                      <i class="fas fa-check"></i> Resolver
                    </button>
                    <button class="btn btn-sm btn-outline-warning" 
                            @click="assignToMe(report)"
                            v-if="report.status === 'pending'">
                      <i class="fas fa-user-check"></i> Asignarme
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteReport(report)">
                      <i class="fas fa-trash"></i> Eliminar
                    </button>
                  </div>
                  <div class="report-updated" v-if="report.updatedAt">
                    <small>
                      <i class="fas fa-sync-alt"></i> Actualizado: {{ formatDateTime(report.updatedAt) }}
                    </small>
                  </div>
                </div>
              </div>
              
              <div class="no-results" v-if="filteredReports.length === 0">
                <i class="fas fa-inbox"></i>
                <h4>No se encontraron reportes</h4>
                <p>No hay reportes que coincidan con tus criterios de búsqueda</p>
                <button class="btn btn-primary" @click="resetFilters">
                  <i class="fas fa-undo"></i> Restablecer filtros
                </button>
              </div>
            </div>
            
            <!-- Vista de tabla -->
            <div class="reports-table" v-else-if="viewMode === 'table'">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Título</th>
                    <th>Reportado por</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="report in paginatedReports" :key="report.id" 
                      :class="['status-' + report.status, 'priority-' + report.priority]">
                    <td>#{{ report.id }}</td>
                    <td>
                      <i class="fas" :class="getReportIcon(report.type)"></i>
                      {{ formatReportType(report.type) }}
                    </td>
                    <td>
                      <a href="#" @click.prevent="viewDetails(report)">{{ report.title }}</a>
                      <div class="text-muted small">{{ report.description.substring(0, 50) }}...</div>
                    </td>
                    <td>{{ report.employee }}</td>
                    <td>{{ formatDate(report.date) }}</td>
                    <td>
                      <span class="badge" :class="'status-' + report.status">
                        {{ formatStatus(report.status) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="'priority-' + report.priority">
                        {{ formatPriority(report.priority) }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-sm btn-outline-primary" @click="viewDetails(report)">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" 
                                @click="markAsResolved(report)" 
                                v-if="report.status === 'pending' || report.status === 'in_progress'">
                          <i class="fas fa-check"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div class="no-results" v-if="filteredReports.length === 0">
                <i class="fas fa-inbox"></i>
                <h4>No se encontraron reportes</h4>
                <p>No hay reportes que coincidan con tus criterios de búsqueda</p>
                <button class="btn btn-primary" @click="resetFilters">
                  <i class="fas fa-undo"></i> Restablecer filtros
                </button>
              </div>
            </div>
            
            <!-- Vista de cuadrícula -->
            <div class="reports-grid" v-else-if="viewMode === 'grid'">
              <div class="grid-item" v-for="report in paginatedReports" :key="report.id"
                   :class="['status-' + report.status, 'priority-' + report.priority]">
                <div class="grid-header">
                  <div class="grid-icon">
                    <i class="fas" :class="getReportIcon(report.type)"></i>
                  </div>
                  <div class="grid-title">
                    <h4>{{ report.title }}</h4>
                    <span class="badge" :class="'status-' + report.status">
                      {{ formatStatus(report.status) }}
                    </span>
                  </div>
                </div>
                
                <div class="grid-body">
                  <p class="grid-description">{{ report.description.substring(0, 80) }}...</p>
                  
                  <div class="grid-details">
                    <div class="detail">
                      <i class="fas fa-user"></i> {{ report.employee }}
                    </div>
                    <div class="detail">
                      <i class="fas fa-calendar"></i> {{ formatDate(report.date) }}
                    </div>
                  </div>
                </div>
                
                <div class="grid-footer">
                  <button class="btn btn-sm btn-primary" @click="viewDetails(report)">
                    <i class="fas fa-eye"></i> Ver
                  </button>
                </div>
              </div>
              
              <div class="no-results" v-if="filteredReports.length === 0">
                <i class="fas fa-inbox"></i>
                <h4>No se encontraron reportes</h4>
                <p>No hay reportes que coincidan con tus criterios de búsqueda</p>
                <button class="btn btn-primary" @click="resetFilters">
                  <i class="fas fa-undo"></i> Restablecer filtros
                </button>
              </div>
            </div>
          </div>
          
          <!-- Paginación -->
          <div class="pagination-container" v-if="filteredReports.length > 0">
            <div class="pagination-info">
              Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredReports.length }} reportes
            </div>
            <nav aria-label="Page navigation">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="prevPage">
                    <i class="fas fa-chevron-left"></i>
                  </a>
                </li>
                
                <li class="page-item" v-for="page in pages" :key="page" 
                    :class="{ active: page === currentPage }">
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">
                    {{ page }}
                  </a>
                </li>
                
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="nextPage">
                    <i class="fas fa-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Modal para detalles del reporte -->
    <ReportDetailModal 
      v-if="selectedReport"
      :report="selectedReport"
      @close="selectedReport = null"
      @resolve="markAsResolved"
      @assign="assignReport"
      @comment="addComment"
    />
    
    <!-- Modal para nuevo reporte -->
    <NewReportModal 
      v-if="showNewReportModal"
      @close="showNewReportModal = false"
      @save="saveNewReport"
      :employees="employees"
    />
    
    <!-- Notificación toast -->
    <ToastNotification 
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script>
import Sidebar from '@/components/VistasAdmin/ComponentesAdmin/Sidebar.vue'
import TopBar from '@/components/VistasAdmin/ComponentesAdmin/TopBar.vue'
import ReportDetailModal from '@/components/VistasAdmin/ComponentesAdmin/ReportDetailModal.vue'
import NewReportModal from '@/components/VistasAdmin/ComponentesAdmin/NewReportModal.vue'
import ReportsTrendChart from '@/components/VistasAdmin/ComponentesAdmin/ReportsTrendChart.vue'
import ToastNotification from '@/components/VistasAdmin/ComponentesAdmin/ToastNotification.vue'
import DateRangePicker from '@/components/VistasAdmin/ComponentesAdmin/DateRangePicker.vue'

export default {
  name: 'ReportsDashboard',
  components: {
    Sidebar,
    TopBar,
    ReportDetailModal,
    NewReportModal,
    ReportsTrendChart,
    ToastNotification,
    DateRangePicker
  },
  data() {
    return {
      reportType: 'all',
      dateRange: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date()
      },
      dateRanges: {
        'Hoy': [new Date(), new Date()],
        'Ayer': [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))],
        'Últimos 7 días': [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
        'Últimos 30 días': [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
        'Este mes': [new Date(new Date().setDate(1)), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)],
        'Mes pasado': [new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
      },
      datePickerLocale: {
        format: 'dd/MM/yyyy',
        separator: ' - ',
        applyLabel: 'Aplicar',
        cancelLabel: 'Cancelar',
        fromLabel: 'Desde',
        toLabel: 'Hasta',
        customRangeLabel: 'Personalizado',
        daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        firstDay: 1
      },
      selectedEmployee: 'all',
      employees: [
        { id: 1, name: 'Juan Pérez', department: 'Producción' },
        { id: 2, name: 'María Gómez', department: 'Mantenimiento' },
        { id: 3, name: 'Carlos Ruiz', department: 'Calidad' },
        { id: 4, name: 'Ana López', department: 'Seguridad' }
      ],
      statusFilters: {
        pending: true,
        in_progress: true,
        resolved: true
      },
      searchQuery: '',
      reports: [
        {
          id: 1,
          type: 'materiales',
          title: 'Falta de varillas de acero',
          employee: 'Juan Pérez',
          department: 'Producción',
          date: '2023-06-15',
          updatedAt: '2023-06-16T10:30:00',
          status: 'pending',
          priority: 'high',
          description: 'Se requiere material urgente para completar el pedido #7841 que debe entregarse el viernes. Sin este material no podemos avanzar con el ensamblaje de las estructuras principales.',
          material: 'Varilla de acero 1/2"',
          quantity: 50,
          unit: 'unidades',
          supplier: 'Aceros del Norte',
          tags: ['urgente', 'pedido-7841', 'estructuras'],
          attachments: [
            { name: 'pedido.pdf', type: 'pdf', url: '#' },
            { name: 'foto.jpg', type: 'image', url: '#' }
          ]
        },
        {
          id: 2,
          type: 'herramientas',
          title: 'Sierra circular desgastada',
          employee: 'María Gómez',
          department: 'Mantenimiento',
          date: '2023-06-10',
          updatedAt: '2023-06-12T15:45:00',
          status: 'resolved',
          priority: 'medium',
          description: 'La sierra no corta adecuadamente, necesita afilado o cambio de disco. Se nota un desgaste irregular en los dientes del disco actual.',
          tool: 'Sierra circular Makita',
          issue: 'Disco de corte desgastado',
          estimatedRepairTime: '2 horas',
          assignedTo: 'Técnico Mantenimiento',
          tags: ['herramientas', 'reparación'],
          attachments: [
            { name: 'foto_disco.jpg', type: 'image', url: '#' }
          ]
        },
        {
          id: 3,
          type: 'incidentes',
          title: 'Casi accidente en área de carga',
          employee: 'Carlos Ruiz',
          department: 'Seguridad',
          date: '2023-06-08',
          updatedAt: '2023-06-09T09:15:00',
          status: 'in_progress',
          priority: 'high',
          description: 'Un montacargas casi golpea a un operario en el área de carga. El operario no llevaba chaleco reflectante y el conductor del montacargas no vio la señal de stop.',
          incidentType: 'Seguridad',
          severity: 'Alta',
          assignedTo: 'Jefe de Seguridad',
          tags: ['seguridad', 'montacargas'],
          attachments: []
        },
        {
          id: 4,
          type: 'produccion',
          title: 'Retraso en línea de ensamblaje B',
          employee: 'Ana López',
          department: 'Producción',
          date: '2023-06-05',
          updatedAt: '2023-06-07T14:20:00',
          status: 'pending',
          priority: 'medium',
          description: 'La línea B lleva 2 horas de retraso por problemas de sincronización entre las estaciones 3 y 4. Esto está afectando la productividad general.',
          tags: ['producción', 'línea-b'],
          attachments: [
            { name: 'reporte_produccion.xlsx', type: 'excel', url: '#' }
          ]
        },
        {
          id: 5,
          type: 'calidad',
          title: 'Defectos en lote #4572',
          employee: 'Roberto Sánchez',
          department: 'Calidad',
          date: '2023-06-03',
          updatedAt: '2023-06-04T11:10:00',
          status: 'resolved',
          priority: 'low',
          description: 'Se detectaron 12 unidades con defectos de pintura en el lote #4572. El problema parece ser de aplicación irregular en la cabina de pintura.',
          tags: ['calidad', 'pintura'],
          attachments: [
            { name: 'fotos_defectos.zip', type: 'archive', url: '#' },
            { name: 'reporte_calidad.pdf', type: 'pdf', url: '#' }
          ]
        }
      ],
      selectedReport: null,
      showNewReportModal: false,
      showFilters: true,
      viewMode: 'list', // 'list', 'grid', 'table'
      sortBy: 'date-desc',
      itemsPerPage: 10,
      currentPage: 1,
      showToast: false,
      toastMessage: '',
      toastType: 'success',
      lastMonthReportsCount: 42, // Ejemplo: conteo de reportes del mes anterior para comparación
      reportsTrendData: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Reportes',
            data: [12, 19, 15, 27, 34, 23],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2
          },
          {
            label: 'Resueltos',
            data: [8, 14, 10, 20, 28, 18],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2
          }
        ]
      }
    }
  },
  computed: {
    filteredReports() {
      let filtered = this.reports.filter(report => {
        // Filtro por tipo
        const matchesType = this.reportType === 'all' || report.type === this.reportType
        
        // Filtro por fecha
        const reportDate = new Date(report.date)
        const matchesDate = reportDate >= new Date(this.dateRange.start) && 
                          reportDate <= new Date(this.dateRange.end)
        
        // Filtro por empleado
        const matchesEmployee = this.selectedEmployee === 'all' || 
                              report.employee === this.employees.find(e => e.id === this.selectedEmployee)?.name
        
        // Filtro por estado
        const matchesStatus = (this.statusFilters.pending && report.status === 'pending') ||
                             (this.statusFilters.in_progress && report.status === 'in_progress') ||
                             (this.statusFilters.resolved && report.status === 'resolved')
        
        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
                             report.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             report.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             (report.tags && report.tags.some(tag => 
                               tag.toLowerCase().includes(this.searchQuery.toLowerCase())))
        
        return matchesType && matchesDate && matchesEmployee && matchesStatus && matchesSearch
      })
      
      // Ordenamiento
      switch (this.sortBy) {
        case 'date-asc':
          return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
        case 'date-desc':
          return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
        case 'priority':
          const priorityOrder = { high: 1, medium: 2, low: 3 }
          return filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'status':
          const statusOrder = { pending: 1, in_progress: 2, resolved: 3 }
          return filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        default:
          return filtered
      }
    },
    paginatedReports() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredReports.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredReports.length / this.itemsPerPage)
    },
    pages() {
      const pages = []
      const maxVisiblePages = 5
      
      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        let start = Math.max(1, this.currentPage - 2)
        let end = Math.min(this.totalPages, start + maxVisiblePages - 1)
        
        if (end - start + 1 < maxVisiblePages) {
          start = end - maxVisiblePages + 1
        }
        
        if (start > 1) {
          pages.push(1)
          if (start > 2) {
            pages.push('...')
          }
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        if (end < this.totalPages) {
          if (end < this.totalPages - 1) {
            pages.push('...')
          }
          pages.push(this.totalPages)
        }
      }
      
      return pages
    },
    showingFrom() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    showingTo() {
      const to = this.currentPage * this.itemsPerPage
      return to > this.filteredReports.length ? this.filteredReports.length : to
    },
    totalReports() {
      return this.reports.length
    },
    pendingCount() {
      return this.reports.filter(r => r.status === 'pending').length
    },
    resolvedCount() {
      return this.reports.filter(r => r.status === 'resolved').length
    },
    inProgressCount() {
      return this.reports.filter(r => r.status === 'in_progress').length
    },
    materialReports() {
      return this.reports.filter(r => r.type === 'materiales')
    },
    criticalReportsCount() {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      return this.reports.filter(r => 
        new Date(r.date) >= lastWeek && 
        r.priority === 'high'
      ).length
    },
    reportsChange() {
      const change = ((this.totalReports - this.lastMonthReportsCount) / this.lastMonthReportsCount) * 100
      return Math.round(change * 10) / 10
    }
  },
  methods: {
    loadReports() {
      console.log(`Cargando reportes de tipo: ${this.reportType}`)
      // Aquí iría la llamada a la API para cargar reportes
    },
    applyFilters() {
      this.currentPage = 1 // Resetear a la primera página al aplicar nuevos filtros
      this.loadReports()
    },
    resetFilters() {
      this.reportType = 'all'
      this.dateRange = {
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date()
      }
      this.selectedEmployee = 'all'
      this.statusFilters = {
        pending: true,
        in_progress: true,
        resolved: true
      }
      this.searchQuery = ''
      this.sortBy = 'date-desc'
      this.applyFilters()
    },
    generateReport() {
      console.log('Generando reporte...', this.dateRange)
      this.showToastMessage('Reporte generado con éxito', 'success')
    },
    viewDetails(report) {
      this.selectedReport = report
    },
    markAsResolved(report) {
      report.status = 'resolved'
      report.updatedAt = new Date().toISOString()
      this.showToastMessage(`Reporte #${report.id} marcado como resuelto`, 'success')
    },
    assignToMe(report) {
      report.assignedTo = 'Yo' // En una app real, sería el nombre del usuario actual
      report.status = 'in_progress'
      report.updatedAt = new Date().toISOString()
      this.showToastMessage(`Reporte #${report.id} asignado a ti`, 'info')
    },
    assignReport(report, assignee) {
      report.assignedTo = assignee
      report.status = 'in_progress'
      report.updatedAt = new Date().toISOString()
      this.showToastMessage(`Reporte #${report.id} asignado a ${assignee}`, 'info')
    },
    addComment(report, comment) {
      if (!report.comments) {
        report.comments = []
      }
      report.comments.push({
        text: comment,
        author: 'Usuario Actual', // En una app real, sería el usuario autenticado
        date: new Date().toISOString()
      })
      report.updatedAt = new Date().toISOString()
      this.showToastMessage('Comentario añadido', 'success')
    },
    deleteReport(report) {
      if (confirm(`¿Estás seguro de eliminar el reporte "${report.title}"?`)) {
        const index = this.reports.findIndex(r => r.id === report.id)
        if (index !== -1) {
          this.reports.splice(index, 1)
          this.showToastMessage('Reporte eliminado', 'success')
        }
      }
    },
    saveNewReport(newReport) {
      // Generar un ID único (en una app real, esto lo haría el backend)
      const newId = Math.max(...this.reports.map(r => r.id)) + 1
      
      this.reports.unshift({
        id: newId,
        ...newReport,
        date: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
        status: 'pending',
        priority: newReport.priority || 'medium'
      })
      
      this.showNewReportModal = false
      this.showToastMessage('Nuevo reporte creado con éxito', 'success')
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    },
    formatDateTime(dateTimeString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
      return new Date(dateTimeString).toLocaleDateString('es-ES', options)
    },
    formatStatus(status) {
      const statusMap = {
        'pending': 'Pendiente',
        'resolved': 'Resuelto',
        'in_progress': 'En Progreso'
      }
      return statusMap[status] || status
    },
    formatPriority(priority) {
      const priorityMap = {
        'high': 'Alta',
        'medium': 'Media',
        'low': 'Baja'
      }
      return priorityMap[priority] || priority
    },
    formatReportType(type) {
      const typeMap = {
        'materiales': 'Materiales',
        'herramientas': 'Herramientas',
        'incidentes': 'Incidentes',
        'produccion': 'Producción',
        'calidad': 'Calidad'
      }
      return typeMap[type] || type
    },
    getReportIcon(type) {
      const icons = {
        'materiales': 'fa-box-open',
        'herramientas': 'fa-tools',
        'incidentes': 'fa-exclamation-triangle',
        'produccion': 'fa-cogs',
        'calidad': 'fa-clipboard-check'
      }
      return icons[type] || 'fa-file-alt'
    },
    getFileIcon(type) {
      const icons = {
        'pdf': 'fa-file-pdf',
        'image': 'fa-file-image',
        'excel': 'fa-file-excel',
        'word': 'fa-file-word',
        'archive': 'fa-file-archive'
      }
      return icons[type] || 'fa-file'
    },
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    goToPage(page) {
      if (page !== '...') {
        this.currentPage = page
      }
    },
    showToastMessage(message, type = 'success') {
      this.toastMessage = message
      this.toastType = type
      this.showToast = true
      
      setTimeout(() => {
        this.showToast = false
      }, 5000)
    }
  },
  watch: {
    itemsPerPage() {
      this.currentPage = 1
    },
    filteredReports() {
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages
      }
    }
  },
  mounted() {
    this.loadReports()
  }
}
</script>