<template>
    <div class="produccion-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-tools mr-2"></i>Gestión de Producción
        </h1>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showNuevoTrabajoModal = true">
            <i class="fas fa-plus mr-1"></i>Nuevo Trabajo
          </button>
        </div>
      </div>
  
      <!-- Loading Spinner -->
      <div v-if="loading" class="loading-container">
        <div class="spinner-border" role="status">
          <span class="sr-only">Cargando...</span>
        </div>
      </div>
  
      <!-- Pestañas -->
      <div class="tabs-container" v-if="!loading">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'produccion' }" 
               @click="activeTab = 'produccion'">
              <i class="fas fa-clock mr-1"></i>En Producción
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'historial' }" 
               @click="activeTab = 'historial'">
              <i class="fas fa-history mr-1"></i>Historial
            </a>
          </li>
        </ul>
      </div>
  
      <!-- Filtros -->
      <div class="filters-panel" v-if="!loading">
        <div class="panel-header" @click="toggleFilters">
          <div class="panel-title">
            <i class="fas fa-filter"></i>
            <span>Filtros de Búsqueda</span>
          </div>
          <button class="panel-toggle">
            <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
        </div>
  
        <div class="report-filters" v-if="showFilters">
          <div class="filter-row">
            <div class="filter-group">
              <label>Estado</label>
              <select v-model="estadoFilter" class="form-control">
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
  
            <div class="filter-group">
              <label>Técnico</label>
              <select v-model="tecnicoFilter" class="form-control">
                <option value="todos">Todos</option>
                <option v-for="tecnico in tecnicos" :key="tecnico.id" :value="tecnico.id">
                  {{ tecnico.nombre }}
                </option>
              </select>
            </div>
  
            <div class="filter-group">
              <label>Fecha</label>
              <div class="date-range">
                <input type="date" v-model="fechaInicio" class="form-control">
                <span class="date-separator">a</span>
                <input type="date" v-model="fechaFin" class="form-control">
              </div>
            </div>
  
            <div class="filter-group">
              <label>Buscar</label>
              <div class="search-input">
                <input 
                  v-model="searchQuery" 
                  placeholder="Cliente, vehículo o trabajo..."
                  @keyup.enter="applyFilters"
                >
                <button class="search-btn" @click="applyFilters">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
  
          <div class="filter-actions">
            <button class="btn btn-primary apply-btn" @click="applyFilters">
              Aplicar Filtros
            </button>
            <button class="btn btn-outline-secondary reset-btn" @click="resetFilters">
              Limpiar
            </button>
          </div>
        </div>
      </div>
  
      <!-- Contenido de pestañas -->
      <div class="tab-content" v-if="!loading">
        <!-- Pestaña Producción -->
        <div v-if="activeTab === 'produccion'" class="tab-pane active">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Orden #</th>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Trabajo</th>
                      <th>Técnico</th>
                      <th>Inicio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="trabajo in trabajosProduccion" :key="trabajo.id">
                      <td>{{ trabajo.orden }}</td>
                      <td>{{ trabajo.cliente }}</td>
                      <td>{{ trabajo.vehiculo }}</td>
                      <td>{{ trabajo.tipo }}</td>
                      <td>{{ trabajo.tecnico }}</td>
                      <td>{{ formatDate(trabajo.fecha_inicio) }}</td>
                      <td>
                        <span :class="['badge', estadoClass(trabajo.estado)]">
                          {{ formatEstado(trabajo.estado) }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-icon" @click="verDetalles(trabajo)">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-icon" @click="editarTrabajo(trabajo)">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-icon btn-danger" 
                          @click="eliminarTrabajo(trabajo.id)"
                          :disabled="loadingDelete === trabajo.id"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Pestaña Historial -->
        <div v-if="activeTab === 'historial'" class="tab-pane active">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Orden #</th>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Trabajo</th>
                      <th>Técnico</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="trabajo in trabajosHistorial" :key="trabajo.id">
                      <td>{{ trabajo.orden }}</td>
                      <td>{{ trabajo.cliente }}</td>
                      <td>{{ trabajo.vehiculo }}</td>
                      <td>{{ trabajo.tipo }}</td>
                      <td>{{ trabajo.tecnico }}</td>
                      <td>{{ formatDate(trabajo.fecha_inicio) }}</td>
                      <td>{{ formatDate(trabajo.fecha_fin) }}</td>
                      <td>
                        <span :class="['badge', estadoClass(trabajo.estado)]">
                          {{ formatEstado(trabajo.estado) }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-icon" @click="verDetalles(trabajo)">
                          <i class="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
  
              <!-- Paginación -->
              <div class="pagination-container">
                <div class="showing-info">
                  Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredHistorial.length }} trabajos
                </div>
                <div class="pagination-controls">
                  <button 
                    class="btn btn-pagination" 
                    @click="prevPage" 
                    :disabled="currentPage === 1"
                  >
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  
                  <button 
                    v-for="page in pages" 
                    :key="page" 
                    class="btn btn-pagination"
                    :class="{ active: page === currentPage }"
                    @click="goToPage(page)"
                    :disabled="page === '...'"
                  >
                    {{ page }}
                  </button>
                  
                  <button 
                    class="btn btn-pagination" 
                    @click="nextPage" 
                    :disabled="currentPage === totalPages"
                  >
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal Detalles Trabajo -->
      <TrabajoModal 
        v-if="showTrabajoModal" 
        :trabajo="selectedTrabajo"
        @close="closeTrabajoModal"
        @save="saveTrabajo"
      />
  
      <!-- Modal Nuevo Trabajo -->
      <NuevoTrabajoModal 
        v-if="showNuevoTrabajoModal"
        @close="showNuevoTrabajoModal = false"
        @save="addTrabajo"
      />
    </div>
  </template>

<script>
import axios from 'axios'
import TrabajoModal from '@/components/VistasAdmin/ComponentesAdmin/TrabajoModal.vue'
import NuevoTrabajoModal from '@/components/VistasAdmin/ComponentesAdmin/NuevoTrabajoModal.vue'

export default {
  components: {
    TrabajoModal,
    NuevoTrabajoModal
  },
  
  data() {
    return {
      activeTab: 'produccion',
      trabajos: [],
      loading: false,
      loadingDelete: null,
      loadingTecnicos: false,
      searchQuery: '',
      estadoFilter: 'todos',
      tecnicoFilter: 'todos',
      fechaInicio: '',
      fechaFin: '',
      tecnicos: [], // Ya no tiene datos predeterminados
      sortField: 'fecha_inicio',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: true,
      showTrabajoModal: false,
      showNuevoTrabajoModal: false,
      selectedTrabajo: null,
    }
  },
  
  computed: {
    trabajosProduccion() {
      return this.trabajos.filter(t => 
        t.estado !== 'completado' && t.estado !== 'entregado'
      ).sort((a, b) => {
        const order = {
          'pendiente': 1,
          'en_proceso': 2,
          'completado': 3,
          'entregado': 4
        };
        return order[a.estado] - order[b.estado];
      });
    },
    
    filteredHistorial() {
      return this.trabajos.filter(t => 
        t.estado === 'completado' || t.estado === 'entregado'
      ).filter(trabajo => {
        // Filtro por estado
        const matchesEstado = this.estadoFilter === 'todos' || 
                            trabajo.estado === this.estadoFilter;
        
        // Filtro por técnico
        const matchesTecnico = this.tecnicoFilter === 'todos' || 
                             trabajo.tecnico_id == this.tecnicoFilter;
        
        // Filtro por fecha
        const matchesFecha = (!this.fechaInicio || new Date(trabajo.fecha_inicio) >= new Date(this.fechaInicio)) &&
                           (!this.fechaFin || new Date(trabajo.fecha_inicio) <= new Date(this.fechaFin));
        
        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
                            trabajo.cliente.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            trabajo.vehiculo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            trabajo.tipo.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        return matchesEstado && matchesTecnico && matchesFecha && matchesSearch;
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1;
        if (a[this.sortField] < b[this.sortField]) return -1 * modifier;
        if (a[this.sortField] > b[this.sortField]) return 1 * modifier;
        return 0;
      });
    },
    
    trabajosHistorial() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredHistorial.slice(start, start + this.itemsPerPage);
    },
    
    totalPages() {
      return Math.ceil(this.filteredHistorial.length / this.itemsPerPage);
    },
    
    pages() {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) pages.push(i);
        return pages;
      }
      
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1;
      }
      
      if (start > 1) pages.push(1, start > 2 ? '...' : null);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < this.totalPages) pages.push(end < this.totalPages - 1 ? '...' : null, this.totalPages);
      
      return pages.filter(p => p);
    },
    
    showingFrom() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    
    showingTo() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredHistorial.length);
    }
  },
  
  methods: {
    // Métodos de API
    async loadTrabajos() {
      try {
        this.loading = true;
        const response = await axios.get('/api/Pedido');
        this.trabajos = response.data;
      } catch (error) {
        console.error("Error cargando trabajos:", error);
        this.showToast('Error al cargar trabajos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async loadTecnicos() {
      try {
        this.loadingTecnicos = true;
        const response = await axios.get('/api/Usuario');
        
        // Filtrar solo usuarios con rol empleado
        this.tecnicos = response.data
          .filter(usuario => usuario.puesto_id === 2)
          .map(usuario => ({
            id: usuario.id,
            nombre: usuario.nombre || `${usuario.firstName} ${usuario.lastName}`.trim()
          }));
        
      } catch (error) {
        console.error("Error cargando técnicos:", error);
        this.showToast('Error al cargar técnicos', 'error');
        // En caso de error, mantener array vacío
        this.tecnicos = [];
      } finally {
        this.loadingTecnicos = false;
      }
    },

    async obtenerTrabajoPorId(id) {
      try {
        const response = await axios.get(`/api/Pedido/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo trabajo:", error);
        this.showToast('Error al obtener trabajo', 'error');
        throw error;
      }
    },

    async crearTrabajo(trabajoData) {
      try {
        const response = await axios.post('/api/Pedido', trabajoData);
        return response.data;
      } catch (error) {
        console.error("Error creando trabajo:", error);
        this.showToast('Error al crear trabajo', 'error');
        throw error;
      }
    },

    async actualizarTrabajo(id, trabajoData) {
      try {
        const response = await axios.put(`/api/Pedido/${id}`, trabajoData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando trabajo:", error);
        this.showToast('Error al actualizar trabajo', 'error');
        throw error;
      }
    },

    async eliminarTrabajoAPI(id) {
      try {
        await axios.delete(`/api/Pedido/${id}`);
      } catch (error) {
        console.error("Error eliminando trabajo:", error);
        this.showToast('Error al eliminar trabajo', 'error');
        throw error;
      }
    },
    
    // Métodos de UI
    applyFilters() {
      this.currentPage = 1;
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.estadoFilter = 'todos';
      this.tecnicoFilter = 'todos';
      this.fechaInicio = '';
      this.fechaFin = '';
      this.currentPage = 1;
    },
    
    async verDetalles(trabajo) {
      try {
        // Obtener datos actualizados del trabajo
        const trabajoActualizado = await this.obtenerTrabajoPorId(trabajo.id);
        this.selectedTrabajo = { ...trabajoActualizado };
        this.showTrabajoModal = true;
      } catch (error) {
        // Si falla, usar los datos locales
        this.selectedTrabajo = { ...trabajo };
        this.showTrabajoModal = true;
      }
    },
    
    editarTrabajo(trabajo) {
      this.selectedTrabajo = { ...trabajo };
      this.showTrabajoModal = true;
    },
    
    async eliminarTrabajo(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar este trabajo?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarTrabajoAPI(id);
        
        // Remover del array local
        this.trabajos = this.trabajos.filter(t => t.id !== id);
        
        this.showToast('Trabajo eliminado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en eliminarTrabajoAPI
      } finally {
        this.loadingDelete = null;
      }
    },
    
    async saveTrabajo(trabajoData) {
      try {
        if (trabajoData.id) {
          // Actualizar trabajo existente
          const trabajoActualizado = await this.actualizarTrabajo(trabajoData.id, trabajoData);
          
          // Actualizar en el array local
          const index = this.trabajos.findIndex(t => t.id === trabajoData.id);
          if (index !== -1) {
            this.trabajos[index] = trabajoActualizado;
          }
          
          this.showToast('Trabajo actualizado correctamente', 'success');
        }
        this.closeTrabajoModal();
      } catch (error) {
        // Error ya manejado en actualizarTrabajo
      }
    },
    
    async addTrabajo(nuevoTrabajo) {
      try {
        // Preparar datos del trabajo
        const trabajoData = {
          ...nuevoTrabajo,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: '',
          estado: 'pendiente'
        };
        
        const trabajoCreado = await this.crearTrabajo(trabajoData);
        
        // Agregar al array local
        this.trabajos.unshift(trabajoCreado);
        
        this.showNuevoTrabajoModal = false;
        this.showToast('Nuevo trabajo creado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en crearTrabajo
      }
    },
    
    closeTrabajoModal() {
      this.showTrabajoModal = false;
      this.selectedTrabajo = null;
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    
    formatEstado(estado) {
      const estados = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'completado': 'Completado',
        'entregado': 'Entregado'
      };
      return estados[estado] || estado;
    },
    
    estadoClass(estado) {
      return {
        'pendiente': 'badge-pendiente',
        'en_proceso': 'badge-en_proceso',
        'completado': 'badge-completado',
        'entregado': 'badge-entregado'
      }[estado] || '';
    },
    
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    
    goToPage(page) {
      if (page !== '...') this.currentPage = page;
    },
    
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    
    showToast(message, type = 'success') {
      // Implementar un sistema de notificaciones más sofisticado si es necesario
      const alertType = type === 'success' ? 'Éxito' : 'Error';
      alert(`${alertType}: ${message}`);
    }
  },
  
  async mounted() {
    // Cargar tanto trabajos como técnicos al montar el componente
    await Promise.all([
      this.loadTrabajos(),
      this.loadTecnicos()
    ]);
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Resto de estilos específicos del componente */
.produccion-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
}

.filter-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
}

.badge-pendiente { background-color: #ffc107; }
.badge-en_proceso { background-color: #17a2b8; }
.badge-completado { background-color: #28a745; }
.badge-entregado { background-color: #6c757d; }

.pagination-container {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-top: 20px;
}

.pagination-controls {
  display: flex;
  gap: 5px;
}

.btn-pagination {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
}

.btn-pagination.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>