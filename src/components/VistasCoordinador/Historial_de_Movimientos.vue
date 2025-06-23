<template>
  <div class="tool-usage-view">
    <div class="header">
      <div class="title-section">
        <h2>
          <i class="material-icons">construction</i> 
          Historial de Uso de Herramientas
        </h2>
        <p class="subtitle">Registro completo de préstamos y devoluciones de herramientas</p>
      </div>
      
      <div class="controls">
        <div class="filters-row">
          <div class="filter-group">
            <label>Estado de Devolución</label>
            <select v-model="filterStatus" class="select-input">
              <option value="all">Todos</option>
              <option v-for="status in statusOptions" :value="status.id">
                {{ status.nombre }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Fecha de Uso</label>
            <input type="date" v-model="filterUsageDate" class="date-input">
          </div>
          
          <div class="filter-group">
            <label>Rango de Fechas</label>
            <div class="date-range">
              <input type="date" v-model="dateFrom" class="date-input" placeholder="Desde">
              <span class="date-separator">—</span>
              <input type="date" v-model="dateTo" class="date-input" placeholder="Hasta">
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-clear" @click="clearFilters" v-if="hasActiveFilters">
            <i class="material-icons">clear_all</i>
            Limpiar Filtros
          </button>
          <button class="btn-refresh" @click="fetchData">
            <i class="material-icons">refresh</i>
            Actualizar
          </button>
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
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            <i class="material-icons">chevron_left</i>
          </button>
          
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
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
                <p><strong>Contacto:</strong> {{ selectedItem.usuario?.email || selectedItem.usuario?.telefono || 'N/A' }}</p>
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

<script>
import axios from 'axios';

export default {
  name: 'ToolUsageHistoryView',
  data() {
    return {
      usageHistory: [],
      tools: [],
      users: [],
      projects: [],
      returnStatuses: [],
      loading: true,
      error: null,
      filterStatus: 'all',
      filterUsageDate: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      itemsPerPage: 10,
      selectedItem: null,
      sortField: 'fecha_uso',
      sortDirection: 'desc'
    }
  },
  computed: {
    hasActiveFilters() {
      return this.filterStatus !== 'all' || this.filterUsageDate || this.dateFrom || this.dateTo;
    },
    
    filteredItems() {
      let filtered = [...this.usageHistory];
      
      // Filtrar por estado
      if (this.filterStatus !== 'all') {
        filtered = filtered.filter(item => 
          item.estado_devolucion_id === this.filterStatus
        );
      }
      
      // Filtrar por fecha de uso
      if (this.filterUsageDate) {
        const filterDateStr = new Date(this.filterUsageDate).toISOString().split('T')[0];
        filtered = filtered.filter(item => 
          item.fecha_uso.split('T')[0] === filterDateStr
        );
      }
      
      // Filtrar por rango de fechas
      if (this.dateFrom || this.dateTo) {
        filtered = filtered.filter(item => {
          const usageDate = new Date(item.fecha_uso);
          const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
          const toDate = this.dateTo ? new Date(this.dateTo) : null;
          
          if (fromDate && toDate) {
            return usageDate >= fromDate && usageDate <= toDate;
          } else if (fromDate) {
            return usageDate >= fromDate;
          } else if (toDate) {
            return usageDate <= toDate;
          }
          return true;
        });
      }
      
      // Ordenar
      return this.sortItems(filtered);
    },
    
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + parseInt(this.itemsPerPage);
      return this.filteredItems.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    
    totalHours() {
      return this.filteredItems.reduce((sum, item) => sum + parseFloat(item.horas_utilizada || 0), 0).toFixed(1);
    },
    
    completedReturns() {
      return this.filteredItems.filter(item => item.fecha_devolucion).length;
    },
    
    statusOptions() {
      return this.returnStatuses;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Obtener todos los datos necesarios
        const [usageRes, toolsRes, usersRes, projectsRes, statusesRes] = await Promise.all([
          axios.get('/api/HistorialUsoHerramienta'),
          axios.get('/api/Herramienta'),
          axios.get('/api/Usuario'),
          axios.get('/api/Tipo_Pedido'),
        ]);

        // Guardar los datos básicos
        this.tools = toolsRes.data || [];
        this.users = usersRes.data || [];
        this.projects = projectsRes.data || [];

        // Combinar los datos del historial con la información relacionada
        this.usageHistory = (usageRes.data || []).map(item => {
          const tool = this.tools.find(t => t.id === item.herramienta_id);
          const user = this.users.find(u => u.id === item.usuario_id);
          const project = this.projects.find(p => p.id === item.proyecto_id);
          const status = this.returnStatuses.find(s => s.id === item.estado_devolucion_id);
          const approvedBy = this.users.find(u => u.id === item.aprobado_por);

          return {
            ...item,
            herramienta: tool,
            usuario: user,
            proyecto: project,
            estado_devolucion: status,
            aprobado_por_nombre: approvedBy?.nombre
          };
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        this.error = 'Error al cargar el historial de uso de herramientas.';
      } finally {
        this.loading = false;
      }
    },
    
    sortItems(items) {
      return items.sort((a, b) => {
        let valueA = this.getNestedValue(a, this.sortField);
        let valueB = this.getNestedValue(b, this.sortField);
        
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();
        
        if (this.sortDirection === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    },
    
    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj) || '';
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'desc';
      }
    },
    
    clearFilters() {
      this.filterStatus = 'all';
      this.filterUsageDate = '';
      this.dateFrom = '';
      this.dateTo = '';
      this.currentPage = 1;
    },
    
    viewDetails(item) {
      this.selectedItem = item;
    },
    
    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }
}
</script>

<style scoped>
/* Estilos generales */
.tool-usage-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.header {
  margin-bottom: 32px;
}

.title-section h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 28px;
}

.title-section h2 .material-icons {
  color: #3498db;
  font-size: 32px;
}

.subtitle {
  color: #7f8c8d;
  margin: 0 0 24px 0;
  font-size: 16px;
}

/* Controles */
.controls {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
  font-size: 14px;
}

.select-input, .date-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  color: #7f8c8d;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-refresh, .btn-clear {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh {
  background: #3498db;
  color: white;
}

.btn-refresh:hover {
  background: #2980b9;
}

.btn-clear {
  background: #e74c3c;
  color: white;
}

.btn-clear:hover {
  background: #c0392b;
}

/* Stats bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  background: #f8f9fa;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .material-icons {
  font-size: 24px;
  color: #3498db;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-x: auto;
}

.usage-table {
  width: 100%;
  border-collapse: collapse;
}

.usage-table th {
  text-align: left;
  padding: 12px 16px;
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
}

.usage-table th:hover {
  background: #e9ecef;
}

.usage-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.usage-row:hover {
  background: #f8f9fa;
}

.tool-info, .user-info {
  display: flex;
  flex-direction: column;
}

.tool-info small, .user-info small {
  font-size: 12px;
  color: #7f8c8d;
}

.hours-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completado, 
.status-badge.bueno, 
.status-badge.aprobado {
  background: #d4edda;
  color: #155724;
}

.status-badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-badge.danado, 
.status-badge.rechazado {
  background: #f8d7da;
  color: #721c24;
}

.action-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e3f2fd;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #7f8c8d;
}

/* Modal */
.usage-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.detail-card h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-content p {
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.detail-content p strong {
  color: #2c3e50;
  min-width: 120px;
  display: inline-block;
}

/* Estados de carga y error */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner, .error-icon, .empty-icon {
  margin-bottom: 16px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon .material-icons {
  font-size: 48px;
  color: #e74c3c;
}

.error-text {
  color: #e74c3c;
  font-size: 18px;
  margin-bottom: 16px;
}

.retry-button {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-icon .material-icons {
  font-size: 48px;
  color: #7f8c8d;
}

.empty-state h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #7f8c8d;
  margin: 0 0 16px 0;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .stats-bar {
    grid-template-columns: 1fr 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .usage-table {
    display: block;
    overflow-x: auto;
  }
}
</style>