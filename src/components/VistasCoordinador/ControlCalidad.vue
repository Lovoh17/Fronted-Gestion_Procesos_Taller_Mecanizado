<template>
  <div class="quality-control-container">
    <!-- Header con título y filtros -->
    <div class="qc-header">
      <h1 class="qc-title">Control de Calidad</h1>
      <div class="qc-filters">
        <div class="filter-group">
          <label>Estado:</label>
          <select v-model="filters.status" class="qc-select">
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Inspección</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Fecha:</label>
          <select v-model="filters.dateRange" class="qc-select">
            <option value="all">Todas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
        
        <button class="qc-btn refresh-btn" @click="refreshData" :disabled="loading">
          <i class="material-icons">refresh</i> 
          {{ loading ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <!-- Resumen estadístico -->
    <div class="qc-stats">
      <div class="stat-card" @click="setFilter('status', 'pending')">
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-label">Pendientes</div>
      </div>
      <div class="stat-card" @click="setFilter('status', 'in-progress')">
        <div class="stat-value">{{ stats.inProgress }}</div>
        <div class="stat-label">En Inspección</div>
      </div>
      <div class="stat-card" @click="setFilter('status', 'approved')">
        <div class="stat-value">{{ stats.approved }}</div>
        <div class="stat-label">Aprobados</div>
      </div>
      <div class="stat-card" @click="setFilter('status', 'rejected')">
        <div class="stat-value">{{ stats.rejected }}</div>
        <div class="stat-label">Rechazados</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-value">{{ stats.qualityRate }}%</div>
        <div class="stat-label">Tasa Calidad</div>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando planos...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-container">
      <i class="material-icons">error</i>
      <p>{{ error }}</p>
      <button class="btn primary" @click="fetchPlanos">Reintentar</button>
    </div>

    <!-- Listado de trabajos (basado en planos) -->
    <div class="qc-work-orders" v-if="!loading && !error">
      <table class="qc-table">
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
              <button class="icon-btn" @click="downloadPlano(plano)" v-if="plano.rutaArchivo">
                <i class="material-icons">picture_as_pdf</i>
                {{ getFileExtension(plano.rutaArchivo) }}
              </button>
              <span v-else>--</span>
            </td>
            <td>
              <span class="status-badge" :class="getPlanoStatus(plano)">
                {{ getStatusLabel(getPlanoStatus(plano)) }}
              </span>
            </td>
            <td>{{ getInspector(plano) || '--' }}</td>
            <td class="actions-cell">
              <button class="icon-btn" @click="startInspection(plano)" v-if="getPlanoStatus(plano) === 'pending'">
                <i class="material-icons">play_arrow</i>
              </button>
              <button class="icon-btn" @click="openInspection(plano)" v-if="getPlanoStatus(plano) === 'in-progress'">
                <i class="material-icons">engineering</i>
              </button>
              <button class="icon-btn" @click="viewReport(plano)" v-if="['approved', 'rejected'].includes(getPlanoStatus(plano))">
                <i class="material-icons">description</i>
              </button>
              <button class="icon-btn" @click="viewBlueprint(plano)" v-if="plano.rutaArchivo">
                <i class="material-icons">visibility</i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
                  <textarea v-model="rejectionReason" placeholder="Motivo del rechazo" 
                            class="rejection-reason" v-if="inspectionDecision === 'rejected'"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn secondary" @click="closeInspectionModal">Cancelar</button>
          <button class="btn primary" @click="submitInspection" :disabled="!inspectionDecision">
            <i class="material-icons">save</i> Guardar Inspección
          </button>
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
                <span class="report-value" :class="getPlanoStatus(currentPlano)">{{ getStatusLabel(getPlanoStatus(currentPlano)) }}</span>
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
            <button class="btn secondary" @click="printReport">
              <i class="material-icons">print</i> Imprimir Reporte
            </button>
            <button class="btn primary" @click="downloadReport">
              <i class="material-icons">download</i> Descargar PDF
            </button>
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
              <button class="btn primary" @click="downloadPlano(selectedPlano)">
                <i class="material-icons">download</i> Descargar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      planos: [], // Array de planos desde la API
      inspectionData: {}, // Datos de inspección por plano
      loading: false,
      error: null,
      filters: {
        status: 'all',
        dateRange: 'all'
      },
      sort: {
        field: 'numeroPlano',
        order: 'asc'
      },
      statusLabels: {
        pending: 'Pendiente',
        'in-progress': 'En Inspección',
        approved: 'Aprobado',
        rejected: 'Rechazado'
      },
      showInspectionModal: false,
      showReportModal: false,
      showBlueprintModal: false,
      currentPlano: {},
      selectedPlano: {},
      qualityChecklist: [
        { name: 'Verificar dimensiones según plano', checked: false, notes: '' },
        { name: 'Comprobar acabado superficial', checked: false, notes: '' },
        { name: 'Verificar ausencia de rebabas', checked: false, notes: '' },
        { name: 'Confirmar tolerancias geométricas', checked: false, notes: '' },
        { name: 'Revisar especificaciones técnicas', checked: false, notes: '' }
      ],
      measurements: [
        { parameter: 'Longitud', expected: 120, unit: 'mm', tolerance: 0.5, step: 0.1 },
        { parameter: 'Ancho', expected: 80, unit: 'mm', tolerance: 0.3, step: 0.1 },
        { parameter: 'Diámetro', expected: 25.4, unit: 'mm', tolerance: 0.1, step: 0.01 },
        { parameter: 'Altura', expected: 50, unit: 'mm', tolerance: 0.2, step: 0.1 }
      ],
      inspectionDecision: null,
      rejectionReason: ''
    }
  },
  computed: {
    filteredWorkOrders() {
      let filtered = this.planos.slice();
      
      // Aplicar filtros de estado
      if (this.filters.status !== 'all') {
        filtered = filtered.filter(plano => this.getPlanoStatus(plano) === this.filters.status);
      }
      
      // Aplicar filtros de fecha (puedes implementar lógica específica aquí)
      if (this.filters.dateRange !== 'all') {
        // Implementar filtro de fecha basado en fechaCreacion
        const now = new Date();
        const filterDate = new Date();
        
        switch(this.filters.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        filtered = filtered.filter(plano => {
          const planoDate = new Date(plano.fechaCreacion);
          return planoDate >= filterDate;
        });
      }
      
      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let fieldA = a[this.sort.field];
        let fieldB = b[this.sort.field];
        
        // Manejo especial para fechas
        if (this.sort.field === 'fechaCreacion') {
          fieldA = new Date(fieldA);
          fieldB = new Date(fieldB);
        }
        
        if (fieldA < fieldB) return this.sort.order === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return this.sort.order === 'asc' ? 1 : -1;
        return 0;
      });
      
      return filtered;
    },
    stats() {
      const total = this.planos.length;
      const pending = this.planos.filter(p => this.getPlanoStatus(p) === 'pending').length;
      const inProgress = this.planos.filter(p => this.getPlanoStatus(p) === 'in-progress').length;
      const approved = this.planos.filter(p => this.getPlanoStatus(p) === 'approved').length;
      const rejected = this.planos.filter(p => this.getPlanoStatus(p) === 'rejected').length;
      const qualityRate = (approved + rejected) > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;
      
      return { pending, inProgress, approved, rejected, qualityRate };
    }
  },
  mounted() {
    this.fetchPlanos();
  },
  methods: {
    async fetchPlanos() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/Plano');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        this.planos = data;
        
        // Inicializar datos de inspección si no existen
        this.planos.forEach(plano => {
          if (!this.inspectionData[plano.idPlano]) {
            this.inspectionData[plano.idPlano] = {
              status: 'pending',
              inspector: null,
              inspectionDate: null,
              measurements: [],
              rejectionReason: null
            };
          }
        });
        
      } catch (error) {
        this.error = `Error al cargar los planos: ${error.message}`;
        console.error('Error fetching planos:', error);
      } finally {
        this.loading = false;
      }
    },
    
    getPlanoStatus(plano) {
      return this.inspectionData[plano.idPlano]?.status || 'pending';
    },
    
    getInspector(plano) {
      return this.inspectionData[plano.idPlano]?.inspector;
    },
    
    getStatusLabel(status) {
      return this.statusLabels[status] || status;
    },
    
    getFileExtension(filePath) {
      if (!filePath) return '';
      return filePath.split('.').pop().toUpperCase();
    },
    
    sortBy(field) {
      if (this.sort.field === field) {
        this.sort.order = this.sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort.field = field;
        this.sort.order = 'asc';
      }
    },
    
    sortIcon(field) {
      if (this.sort.field !== field) return 'unfold_more';
      return this.sort.order === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
    },
    
    setFilter(field, value) {
      this.filters[field] = value;
    },
    
    refreshData() {
      this.fetchPlanos();
    },
    
    formatDate(dateString) {
      if (!dateString) return '--';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    
    downloadPlano(plano) {
      if (plano.rutaArchivo) {
        // Implementar descarga del archivo
        console.log('Descargando plano:', plano.rutaArchivo);
        // window.open(plano.rutaArchivo, '_blank');
      }
    },
    
    viewBlueprint(plano) {
      this.selectedPlano = plano;
      this.showBlueprintModal = true;
    },
    
    closeBlueprintModal() {
      this.showBlueprintModal = false;
      this.selectedPlano = {};
    },
    
    startInspection(plano) {
      this.currentPlano = JSON.parse(JSON.stringify(plano));
      
      // Actualizar estado a en progreso
      this.inspectionData[plano.idPlano].status = 'in-progress';
      this.inspectionData[plano.idPlano].inspector = 'Inspector Actual'; // Reemplazar con usuario real
      
      // Resetear formulario de inspección
      this.measurements.forEach(measure => {
        measure.actual = null;
      });
      this.qualityChecklist.forEach(item => {
        item.checked = false;
        item.notes = '';
      });
      this.inspectionDecision = null;
      this.rejectionReason = '';
      
      this.showInspectionModal = true;
    },
    
    openInspection(plano) {
      this.currentPlano = JSON.parse(JSON.stringify(plano));
      
      // Cargar datos existentes de la inspección
      const inspectionData = this.inspectionData[plano.idPlano];
      if (inspectionData.measurements.length > 0) {
        this.measurements = JSON.parse(JSON.stringify(inspectionData.measurements));
      }
      
      this.showInspectionModal = true;
    },
    
    closeInspectionModal() {
      this.showInspectionModal = false;
      this.inspectionDecision = null;
      this.rejectionReason = '';
    },
    
    submitInspection() {
      const inspectionData = this.inspectionData[this.currentPlano.idPlano];
      
      // Actualizar datos de inspección
      inspectionData.status = this.inspectionDecision;
      inspectionData.inspectionDate = new Date().toISOString();
      inspectionData.measurements = JSON.parse(JSON.stringify(this.measurements));
      
      if (this.inspectionDecision === 'rejected') {
        inspectionData.rejectionReason = this.rejectionReason;
      }
      
      // Aquí podrías hacer una llamada a la API para guardar los resultados
      console.log('Guardando inspección:', inspectionData);
      
      this.closeInspectionModal();
    },
    
    viewReport(plano) {
      this.currentPlano = JSON.parse(JSON.stringify(plano));
      this.currentPlano.measurements = this.inspectionData[plano.idPlano]?.measurements || [];
      this.currentPlano.inspectionDate = this.inspectionData[plano.idPlano]?.inspectionDate;
      this.currentPlano.rejectionReason = this.inspectionData[plano.idPlano]?.rejectionReason;
      this.showReportModal = true;
    },
    
    closeReportModal() {
      this.showReportModal = false;
    },
    
    getMeasureResult(measure) {
      if (measure.actual === undefined || measure.actual === null) return 'No medido';
      const diff = Math.abs(measure.actual - measure.expected);
      return diff <= measure.tolerance ? 'Dentro' : 'Fuera';
    },
    
    getMeasureClass(measure) {
      if (measure.actual === undefined || measure.actual === null) return '';
      const diff = Math.abs(measure.actual - measure.expected);
      return diff <= measure.tolerance ? 'within-tolerance' : 'out-of-tolerance';
    },
    
    printReport() {
      window.print();
    },
    
    downloadReport() {
      console.log('Generando PDF del reporte...');
      // Implementar generación de PDF
    }
  }
}
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  gap: 15px;
}

.error-container i {
  font-size: 48px;
  color: #e74c3c;
}

.qc-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.qc-table th, .qc-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.qc-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.qc-table th:hover {
  background-color: #f1f1f1;
}

.sort-icon {
  vertical-align: middle;
  font-size: 18px;
}

.description-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #f39c12;
  color: white;
}

.status-badge.in-progress {
  background-color: #3498db;
  color: white;
}

.status-badge.approved {
  background-color: #2ecc71;
  color: white;
}

.status-badge.rejected {
  background-color: #e74c3c;
  color: white;
}

.actions-cell {
  white-space: nowrap;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
  padding: 5px;
  margin: 0 2px;
}

.icon-btn:hover {
  color: #2c3e50;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  border: none;
}

.btn.primary {
  background-color: #2c3e50;
  color: white;
}

.btn.primary:hover {
  background-color: #1a252f;
}

.btn.secondary {
  background-color: #ecf0f1;
  color: #7f8c8d;
  border: 1px solid #ddd;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
}

.btn.small {
  padding: 6px 12px;
  font-size: 13px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 1000px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 20px;
}

.inspection-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.inspection-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.inspection-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2c3e50;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  width: 120px;
  color: #7f8c8d;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkmark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #7f8c8d;
  border-radius: 3px;
  position: relative;
}

.checkbox-container input {
  display: none;
}

.checkbox-container input:checked + .checkmark {
  background-color: #2ecc71;
  border-color: #2ecc71;
}

.checkbox-container input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checklist-notes {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
}

.measurements-table {
  width: 100%;
  border-collapse: collapse;
}

.measurements-table th, .measurements-table td {
  padding: 10px;
  border: 1px solid #eee;
  text-align: center;
}

.measurements-table th {
  background-color: #f1f1f1;
}

.measurements-table input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.measure-result {
  font-weight: 500;
}

.within-tolerance {
  color: #2ecc71;
}

.out-of-tolerance {
  color: #e74c3c;
}

.decision-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.radio-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.radiomark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #7f8c8d;
  border-radius: 50%;
  position: relative;
}

.radio-container input {
  display: none;
}

.radio-container input:checked + .radiomark {
  border-color: #3498db;
}

.radio-container input:checked + .radiomark::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #3498db;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.rejection-reason {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
  margin-top: 10px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.report-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.report-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.report-row {
  display: flex;
  gap: 10px;
}

.report-label {
  font-weight: 500;
  color: #7f8c8d;
}

.report-value {
  flex: 1;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th, .report-table td {
  padding: 10px;
  border: 1px solid #eee;
  text-align: center;
}

.report-table th {
  background-color: #f1f1f1;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.blueprint-viewer {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.blueprint-actions {
  display: flex;
  gap: 15px;
}
</style>