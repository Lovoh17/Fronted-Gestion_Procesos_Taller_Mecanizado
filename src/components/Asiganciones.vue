<template>
  <div class="asignaciones-container">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <span class="material-icons header-icon">assignment_ind</span>
          <h1>Gestión de Asignaciones</h1>
        </div>
        <div class="header-actions">
          <button class="btn primary" @click="cargarAsignaciones" :disabled="loading">
            <span class="material-icons" :class="{ 'spin': loading }">refresh</span>
            {{ loading ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="filters-section">
      <div class="filter-group">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Buscar asignaciones..." 
          >
        </div>
        
        <div class="filter-controls">
          <select v-model="filtroEstado">
            <option value="">Todos los estados</option>
            <option v-for="estado in estadosPedido" :key="estado.id" :value="estado.id">
              {{ estado.nombre }}
            </option>
          </select>
          
          <select v-model="filtroUsuario">
            <option value="">Todos los trabajadores</option>
            <option v-for="usuario in usuariosUnicos" :key="usuario.id" :value="usuario.id">
              {{ usuario.nombre }} {{ usuario.apellido }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla Vue Good Table -->
    <div class="table-container">
      <vue-good-table
        :columns="columns"
        :rows="asignacionesFiltradas"
        :search-options="{
          enabled: true,
          placeholder: 'Buscar...',
          externalQuery: searchTerm
        }"
        :pagination-options="{
          enabled: true,
          mode: 'pages',
          perPage: itemsPorPagina,
          position: 'bottom',
          perPageDropdown: [10, 25, 50],
          dropdownAllowAll: false,
          nextLabel: 'Siguiente',
          prevLabel: 'Anterior',
          rowsPerPageLabel: 'Filas por página',
          ofLabel: 'de',
          allLabel: 'Todos'
        }"
        :sort-options="{
          enabled: true,
          initialSortBy: { field: 'codigo_pedido', type: 'asc' }
        }"
        style-class="vgt-table striped"
        :isLoading="loading"
      >
        <!-- Template para código de pedido -->
        <template #table-row="props">
          <span v-if="props.column.field === 'codigo_pedido'">
            <div class="codigo-cell">
              <span class="material-icons">receipt</span>
              <strong>{{ props.row.pedido.codigo_pedido }}</strong>
            </div>
          </span>

          <span v-else-if="props.column.field === 'trabajador'">
            <div class="usuario-cell">
              <div class="usuario-avatar">
                <span class="material-icons">person</span>
              </div>
              <div class="usuario-info">
                <strong>{{ props.row.usuario.nombre }} {{ props.row.usuario.apellido }}</strong>
                <span class="usuario-email">{{ props.row.usuario.email }}</span>
              </div>
            </div>
          </span>

          <span v-else-if="props.column.field === 'horas'">
            <span class="horas-badge">
              {{ props.row.horasAsignadas }}h
            </span>
          </span>

          <span v-else-if="props.column.field === 'estado'">
            <span class="estado-badge" :class="getStatusClass(props.row.pedido.estado_id)">
              {{ getStatusName(props.row.pedido.estado_id) }}
            </span>
          </span>

          <span v-else-if="props.column.field === 'prioridad'">
            <span class="prioridad-badge" :class="`priority-${props.row.pedido.prioridad}`">
              {{ getPriorityName(props.row.pedido.prioridad) }}
            </span>
          </span>

          <span v-else-if="props.column.field === 'fecha'">
            {{ formatDate(props.row.pedido.fecha_requerida) }}
          </span>

          <span v-else-if="props.column.field === 'acciones'">
            <div class="action-buttons">
              <button class="btn-icon" @click="verDetalles(props.row)" title="Ver detalles">
                <span class="material-icons">visibility</span>
              </button>
              <button class="btn-icon" @click="editarAsignacion(props.row)" title="Editar">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-icon danger" @click="eliminarAsignacion(props.row)" title="Eliminar">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </span>

          <span v-else>
            {{ props.formattedRow[props.column.field] }}
          </span>
        </template>

        <!-- Estado de carga -->
        <template #loadingContent>
          <div class="loading-state">
            <span class="material-icons spin">refresh</span>
            <p>Cargando asignaciones...</p>
          </div>
        </template>

        <!-- Estado vacío -->
        <template #emptySearchResult>
          <div class="empty-state">
            <span class="material-icons">search_off</span>
            <p>No se encontraron asignaciones que coincidan con la búsqueda</p>
          </div>
        </template>
      </vue-good-table>
    </div>

    <!-- Modal de Detalles -->
    <div v-if="asignacionSeleccionada" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-details">
        <div class="modal-header">
          <h2>Detalles de Asignación</h2>
          <button class="modal-close" @click="cerrarModal">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="detail-sections">
            <!-- Sección Pedido -->
            <div class="detail-section">
              <h3>Información del Pedido</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Código:</label>
                  <span>{{ asignacionSeleccionada.pedido.codigo_pedido }}</span>
                </div>
                <div class="detail-item">
                  <label>Estado:</label>
                  <span :class="getStatusClass(asignacionSeleccionada.pedido.estado_id)">
                    {{ getStatusName(asignacionSeleccionada.pedido.estado_id) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Prioridad:</label>
                  <span :class="`priority-${asignacionSeleccionada.pedido.prioridad}`">
                    {{ getPriorityName(asignacionSeleccionada.pedido.prioridad) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Fecha Requerida:</label>
                  <span>{{ formatDate(asignacionSeleccionada.pedido.fecha_requerida) }}</span>
                </div>
              </div>
            </div>

            <!-- Sección Trabajador -->
            <div class="detail-section">
              <h3>Información del Trabajador</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Nombre:</label>
                  <span>{{ asignacionSeleccionada.usuario.nombre }} {{ asignacionSeleccionada.usuario.apellido }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ asignacionSeleccionada.usuario.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Horas Asignadas:</label>
                  <span class="highlight">{{ asignacionSeleccionada.horasAsignadas }} horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VueGoodTable } from 'vue-good-table-next';
import 'vue-good-table-next/dist/vue-good-table-next.css';

export default {
  name: 'ListadoAsignaciones',
  components: {
    VueGoodTable
  },
  data() {
    return {
      asignaciones: [],
      loading: false,
      searchTerm: '',
      filtroEstado: '',
      filtroUsuario: '',
      itemsPorPagina: 10,
      asignacionSeleccionada: null,
      
      columns: [
        {
          label: 'Código Pedido',
          field: 'codigo_pedido',
          sortable: true,
          width: '150px'
        },
        {
          label: 'Trabajador',
          field: 'trabajador',
          sortable: true,
          sortFn: (a, b) => {
            const nombreA = `${a.usuario.nombre} ${a.usuario.apellido}`;
            const nombreB = `${b.usuario.nombre} ${b.usuario.apellido}`;
            return nombreA.localeCompare(nombreB);
          }
        },
        {
          label: 'Horas',
          field: 'horas',
          sortable: true,
          sortFn: (a, b) => a.horasAsignadas - b.horasAsignadas,
          width: '100px'
        },
        {
          label: 'Estado',
          field: 'estado',
          sortable: true,
          sortFn: (a, b) => a.pedido.estado_id - b.pedido.estado_id,
          width: '140px'
        },
        {
          label: 'Prioridad',
          field: 'prioridad',
          sortable: true,
          sortFn: (a, b) => a.pedido.prioridad - b.pedido.prioridad,
          width: '120px'
        },
        {
          label: 'Fecha Límite',
          field: 'fecha',
          sortable: true,
          sortFn: (a, b) => new Date(a.pedido.fecha_requerida) - new Date(b.pedido.fecha_requerida),
          width: '120px'
        },
        {
          label: 'Acciones',
          field: 'acciones',
          sortable: false,
          width: '120px'
        }
      ],
      
      estadosPedido: [
        { id: 1, nombre: 'Borrador' },
        { id: 2, nombre: 'Pendiente Aprobación' },
        { id: 3, nombre: 'Aprobado' },
        { id: 4, nombre: 'En Proceso' },
        { id: 5, nombre: 'Completado' },
        { id: 6, nombre: 'Cancelado' }
      ]
    }
  },
  computed: {
    usuariosUnicos() {
      const usuarios = this.asignaciones.map(a => a.usuario);
      return [...new Map(usuarios.map(u => [u.id, u])).values()];
    },
    
    asignacionesFiltradas() {
      let filtered = this.asignaciones;
      
      if (this.filtroEstado) {
        filtered = filtered.filter(a => a.pedido.estado_id == this.filtroEstado);
      }
      
      if (this.filtroUsuario) {
        filtered = filtered.filter(a => a.usuario.id == this.filtroUsuario);
      }
      
      return filtered;
    }
  },
  mounted() {
    this.cargarAsignaciones();
  },
  methods: {
    async cargarAsignaciones() {
      this.loading = true;
      try {
        const response = await fetch('/api/Asignaciones', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Error al cargar asignaciones');
        
        const data = await response.json();
        this.asignaciones = data;
        
      } catch (error) {
        console.error('Error:', error);
        this.showError('No se pudieron cargar las asignaciones');
      } finally {
        this.loading = false;
      }
    },
    
    verDetalles(asignacion) {
      this.asignacionSeleccionada = asignacion;
    },
    
    editarAsignacion(asignacion) {
      console.log('Editar asignación:', asignacion);
    },
    
    async eliminarAsignacion(asignacion) {
      if (!confirm(`¿Estás seguro de eliminar la asignación del pedido ${asignacion.pedido.codigo_pedido}?`)) {
        return;
      }
      
      try {
        const response = await fetch(`/api/Asignaciones/${asignacion.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        if (response.ok) {
          this.showSuccess('Asignación eliminada correctamente');
          this.cargarAsignaciones();
        } else {
          throw new Error('Error al eliminar la asignación');
        }
      } catch (error) {
        console.error('Error:', error);
        this.showError('No se pudo eliminar la asignación');
      }
    },
    
    cerrarModal() {
      this.asignacionSeleccionada = null;
    },
    
    getStatusName(estadoId) {
      const estado = this.estadosPedido.find(e => e.id === estadoId);
      return estado ? estado.nombre : 'Desconocido';
    },
    
    getStatusClass(estadoId) {
      const statusClasses = {
        1: 'status-draft',
        2: 'status-pending',
        3: 'status-approved',
        4: 'status-in-progress',
        5: 'status-completed',
        6: 'status-cancelled'
      };
      return statusClasses[estadoId] || 'status-unknown';
    },
    
    getPriorityName(prioridad) {
      const priorities = {
        1: 'Alta',
        2: 'Media-Alta',
        3: 'Media',
        4: 'Media-Baja',
        5: 'Baja'
      };
      return priorities[prioridad] || 'Sin prioridad';
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('es-GT');
    },
    
    getAuthToken() {
      return localStorage.getItem('authToken') || '';
    },
    
    showError(message) {
      alert('Error: ' + message);
    },
    
    showSuccess(message) {
      alert('Éxito: ' + message);
    }
  }
}
</script>

<style >
/* Estilos base simplificados */
.asignaciones-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Header simplificado */
.page-header {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 2rem;
  color: #495057;
}

h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #212529;
}

/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #007bff;
  color: white;
}

.btn.primary:hover {
  background-color: #0056b3;
}

.btn.primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Filtros */
.filters-section {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.search-box .material-icons {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 20px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-controls select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  min-width: 180px;
}

/* Stats cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .material-icons {
  color: #495057;
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

/* Tabla */
.table-container {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

.asignaciones-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.asignaciones-table th {
  background-color: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
  position: relative;
}

.asignaciones-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.asignaciones-table th.sortable:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 8px;
  font-weight: bold;
  color: #007bff;
}

.asignaciones-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

.asignaciones-table tbody tr:hover {
  background-color: #f8f9fa;
}

.asignaciones-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.asignaciones-table tbody tr.row-completed {
  background-color: #d4edda;
}

.asignaciones-table tbody tr.row-cancelled {
  background-color: #f8d7da;
}

.asignaciones-table tbody tr.row-in-progress {
  background-color: #d1ecf1;
}

/* Celdas personalizadas */
.codigo-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #495057;
}

.codigo-cell .material-icons {
  font-size: 18px;
  color: #6c757d;
}

.usuario-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.usuario-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.usuario-avatar .material-icons {
  font-size: 18px;
  color: #6c757d;
}

.usuario-info {
  display: flex;
  flex-direction: column;
}

.usuario-info strong {
  font-size: 14px;
  color: #212529;
}

.usuario-email {
  font-size: 12px;
  color: #6c757d;
}

.descripcion-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badges */
.horas-badge {
  background-color: #17a2b8;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.estado-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-draft { background-color: #e9ecef; color: #495057; }
.status-pending { background-color: #fff3cd; color: #856404; }
.status-approved { background-color: #d1ecf1; color: #0c5460; }
.status-in-progress { background-color: #d4edda; color: #155724; }
.status-completed { background-color: #d4edda; color: #155724; }
.status-cancelled { background-color: #f8d7da; color: #721c24; }

.prioridad-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.priority-1 { background-color: #dc3545; color: white; }
.priority-2 { background-color: #fd7e14; color: white; }
.priority-3 { background-color: #ffc107; color: #000; }
.priority-4 { background-color: #17a2b8; color: white; }
.priority-5 { background-color: #6c757d; color: white; }

.fecha-cell {
  font-size: 14px;
  color: #495057;
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.btn-pagination {
  width: 36px;
  height: 36px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  color: #495057;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-pagination:disabled {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.pagination-info {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.pagination-select {
  padding: 6px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #495057;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #495057;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: #e9ecef;
}

.btn-icon.danger:hover {
  background-color: #dc3545;
  color: white;
}

.btn-icon .material-icons {
  font-size: 16px;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-state .material-icons {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-details {
  background-color: white;
  border-radius: 8px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #495057;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #e9ecef;
}

.modal-content {
  padding: 24px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.detail-section h3 {
  margin: 0;
  padding: 16px 20px;
  background-color: #f8f9fa;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e0e0e0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #212529;
  font-size: 0.95rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.skill-tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: 4px;
  margin-bottom: 4px;
  display: inline-block;
}

.highlight {
  color: #007bff;
  font-weight: 600;
}

/* Animaciones */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .asignaciones-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-details {
    max-height: 95vh;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .asignaciones-vue-table {
    font-size: 0.875rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .btn-icon {
    width: 28px;
    height: 28px;
  }
  
  .usuario-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .codigo-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .asignaciones-container {
    padding: 12px;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .filters-section {
    padding: 16px;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-content {
    padding: 12px;
  }
  
  .detail-grid {
    padding: 16px;
  }
}
</style>