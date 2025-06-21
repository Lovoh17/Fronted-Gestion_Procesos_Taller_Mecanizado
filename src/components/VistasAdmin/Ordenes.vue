<template>
  <div class="produccion-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-tools mr-2"></i>Gestión de Producción
      </h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showNuevoTrabajoModal = true">
          <i class="fas fa-plus mr-1"></i>Nuevo Pedido
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
                placeholder="Código, solicitante o proyecto..."
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
                    <th>Código</th>
                    <th>Solicitante</th>
                    <th>Proyecto</th>
                    <th>Tipo</th>
                    <th>Supervisor</th>
                    <th>Solicitud</th>
                    <th>Entrega Estimada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in trabajosProduccion" :key="pedido.id">
                    <td>{{ pedido.codigo_pedido }}</td>
                    <td>{{ pedido.solicitante_nombre }}</td>
                    <td>{{ pedido.proyecto_asociado || 'N/A' }}</td>
                    <td>{{ pedido.tipo_pedido_nombre }}</td>
                    <td>{{ pedido.supervisor_nombre }}</td>
                    <td>{{ formatDate(pedido.fecha_solicitud) }}</td>
                    <td>{{ formatDate(pedido.fecha_estimada_entrega) || 'Pendiente' }}</td>
                    <td>
                      <span :class="['badge', estadoClass(pedido.estado)]">
                        {{ formatEstado(pedido.estado) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-icon" @click="verDetalles(pedido)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-icon" @click="editarTrabajo(pedido)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-icon btn-danger" 
                        @click="eliminarTrabajo(pedido.id)"
                        :disabled="loadingDelete === pedido.id"
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
                    <th>Código</th>
                    <th>Solicitante</th>
                    <th>Proyecto</th>
                    <th>Tipo</th>
                    <th>Supervisor</th>
                    <th>Solicitud</th>
                    <th>Completado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in trabajosHistorial" :key="pedido.id">
                    <td>{{ pedido.codigo_pedido }}</td>
                    <td>{{ pedido.solicitante_nombre }}</td>
                    <td>{{ pedido.proyecto_asociado || 'N/A' }}</td>
                    <td>{{ pedido.tipo_pedido_nombre }}</td>
                    <td>{{ pedido.supervisor_nombre }}</td>
                    <td>{{ formatDate(pedido.fecha_solicitud) }}</td>
                    <td>{{ formatDate(pedido.fecha_completado) }}</td>
                    <td>
                      <span :class="['badge', estadoClass(pedido.estado)]">
                        {{ formatEstado(pedido.estado) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-icon" @click="verDetalles(pedido)">
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
                Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredHistorial.length }} pedidos
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

    <!-- Modal Detalles Pedido -->
    <TrabajoModal 
      v-if="showTrabajoModal" 
      :trabajo="selectedTrabajo"
      @close="closeTrabajoModal"
      @save="saveTrabajo"
    />

    <!-- Modal Nuevo Pedido -->
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
      pedidos: [],
      loading: false,
      loadingDelete: null,
      loadingTecnicos: false,
      searchQuery: '',
      estadoFilter: 'todos',
      tecnicoFilter: 'todos',
      fechaInicio: '',
      fechaFin: '',
      tecnicos: [],
      sortField: 'fecha_solicitud',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: true,
      showTrabajoModal: false,
      showNuevoTrabajoModal: false,
      selectedTrabajo: null,
      tiposPedido: [
        { id: 1, nombre: 'Suministros' },
        { id: 2, nombre: 'Equipamiento' },
        { id: 3, nombre: 'Servicios' }
      ]
    }
  },
  
  computed: {
    trabajosProduccion() {
      return this.pedidos.filter(pedido => 
        pedido.estado !== 'completado' && pedido.estado !== 'entregado'
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
      return this.pedidos.filter(pedido => 
        pedido.estado === 'completado' || pedido.estado === 'entregado'
      ).filter(pedido => {
        // Filtro por estado
        const matchesEstado = this.estadoFilter === 'todos' || 
                            pedido.estado === this.estadoFilter;
        
        // Filtro por técnico
        const matchesTecnico = this.tecnicoFilter === 'todos' || 
                             pedido.supervisor_id == this.tecnicoFilter;
        
        // Filtro por fecha
        const matchesFecha = (!this.fechaInicio || new Date(pedido.fecha_solicitud) >= new Date(this.fechaInicio)) &&
                           (!this.fechaFin || new Date(pedido.fecha_solicitud) <= new Date(this.fechaFin));
        
        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
                            pedido.codigo_pedido.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            pedido.solicitante_nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            (pedido.proyecto_asociado && pedido.proyecto_asociado.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                            pedido.tipo_pedido_nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
        
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
    async loadPedidos() {
      try {
        this.loading = true;
        const response = await axios.get('/api/Pedido');
        
        // Transformar los datos de la API
        this.pedidos = await Promise.all(response.data.map(async pedido => ({
          ...pedido,
          estado: this.resolveEstado(pedido.estado_id),
          solicitante_nombre: await this.resolveUsuario(pedido.solicitante_id),
          supervisor_nombre: await this.resolveUsuario(pedido.supervisor_id),
          tipo_pedido_nombre: this.resolveTipoPedido(pedido.tipo_pedido_id),
          supervisor_id: pedido.supervisor_id
        })));
        
      } catch (error) {
        console.error("Error cargando pedidos:", error);
        this.showToast('Error al cargar pedidos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async loadTecnicos() {
      try {
        this.loadingTecnicos = true;
        const response = await axios.get('/api/Usuario');
        
        // Filtrar solo usuarios con rol empleado (ajusta según tu estructura)
        this.tecnicos = response.data
          .filter(usuario => usuario.puesto_id === 2) // Ajusta el ID según tu sistema
          .map(usuario => ({
            id: usuario.id,
            nombre: usuario.nombre || `${usuario.firstName} ${usuario.lastName}`.trim()
          }));
        
      } catch (error) {
        console.error("Error cargando técnicos:", error);
        this.showToast('Error al cargar técnicos', 'error');
        this.tecnicos = [];
      } finally {
        this.loadingTecnicos = false;
      }
    },

    async obtenerPedidoPorId(id) {
      try {
        const response = await axios.get(`/api/Pedido/${id}`);
        const pedido = response.data;
        
        // Enriquecer los datos con nombres
        return {
          ...pedido,
          estado: this.resolveEstado(pedido.estado_id),
          solicitante_nombre: await this.resolveUsuario(pedido.solicitante_id),
          supervisor_nombre: await this.resolveUsuario(pedido.supervisor_id),
          tipo_pedido_nombre: this.resolveTipoPedido(pedido.tipo_pedido_id)
        };
        
      } catch (error) {
        console.error("Error obteniendo pedido:", error);
        this.showToast('Error al obtener pedido', 'error');
        throw error;
      }
    },

    async crearPedido(pedidoData) {
      try {
        // Convertir los datos al formato esperado por la API
        const apiData = {
          ...pedidoData,
          estado_id: this.resolveEstadoId(pedidoData.estado),
          tipo_pedido_id: this.resolveTipoPedidoId(pedidoData.tipo_pedido_nombre),
          supervisor_id: pedidoData.supervisor_id
        };
        
        const response = await axios.post('/api/Pedido', apiData);
        return response.data;
      } catch (error) {
        console.error("Error creando pedido:", error);
        this.showToast('Error al crear pedido', 'error');
        throw error;
      }
    },

    async actualizarPedido(id, pedidoData) {
      try {
        // Convertir los datos al formato esperado por la API
        const apiData = {
          ...pedidoData,
          estado_id: this.resolveEstadoId(pedidoData.estado),
          tipo_pedido_id: this.resolveTipoPedidoId(pedidoData.tipo_pedido_nombre),
          supervisor_id: pedidoData.supervisor_id
        };
        
        const response = await axios.put(`/api/Pedido/${id}`, apiData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando pedido:", error);
        this.showToast('Error al actualizar pedido', 'error');
        throw error;
      }
    },

    async eliminarPedidoAPI(id) {
      try {
        await axios.delete(`/api/Pedido/${id}`);
      } catch (error) {
        console.error("Error eliminando pedido:", error);
        this.showToast('Error al eliminar pedido', 'error');
        throw error;
      }
    },
    
    // Métodos de resolución
    resolveEstado(estadoId) {
      const estados = {
        1: 'pendiente',
        2: 'en_proceso',
        3: 'completado',
        4: 'entregado'
      };
      return estados[estadoId] || 'pendiente';
    },
    
    resolveEstadoId(estado) {
      const estados = {
        'pendiente': 1,
        'en_proceso': 2,
        'completado': 3,
        'entregado': 4
      };
      return estados[estado] || 1;
    },
    
    async resolveUsuario(usuarioId) {
      try {
        if (!usuarioId) return 'No asignado';
        
        // Primero revisar si está en los técnicos ya cargados
        const tecnico = this.tecnicos.find(t => t.id == usuarioId);
        if (tecnico) return tecnico.nombre;
        
        // Si no, hacer una llamada a la API
        const response = await axios.get(`/api/Usuario/${usuarioId}`);
        return response.data.nombre || `${response.data.firstName} ${response.data.lastName}`.trim() || `Usuario ${usuarioId}`;
      } catch {
        return `Usuario ${usuarioId}`;
      }
    },
    
    resolveTipoPedido(tipoId) {
      const tipo = this.tiposPedido.find(t => t.id == tipoId);
      return tipo ? tipo.nombre : `Tipo ${tipoId}`;
    },
    
    resolveTipoPedidoId(tipoNombre) {
      const tipo = this.tiposPedido.find(t => t.nombre === tipoNombre);
      return tipo ? tipo.id : 1; // Default al primer tipo si no se encuentra
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
    
    async verDetalles(pedido) {
      try {
        // Obtener datos actualizados del pedido
        const pedidoActualizado = await this.obtenerPedidoPorId(pedido.id);
        this.selectedTrabajo = { ...pedidoActualizado };
        this.showTrabajoModal = true;
      } catch (error) {
        // Si falla, usar los datos locales
        this.selectedTrabajo = { ...pedido };
        this.showTrabajoModal = true;
      }
    },
    
    editarTrabajo(pedido) {
      this.selectedTrabajo = { ...pedido };
      this.showTrabajoModal = true;
    },
    
    async eliminarTrabajo(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarPedidoAPI(id);
        
        // Remover del array local
        this.pedidos = this.pedidos.filter(p => p.id !== id);
        
        this.showToast('Pedido eliminado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en eliminarPedidoAPI
      } finally {
        this.loadingDelete = null;
      }
    },
    
    async saveTrabajo(pedidoData) {
      try {
        if (pedidoData.id) {
          // Actualizar pedido existente
          const pedidoActualizado = await this.actualizarPedido(pedidoData.id, pedidoData);
          
          // Actualizar en el array local
          const index = this.pedidos.findIndex(p => p.id === pedidoData.id);
          if (index !== -1) {
            this.pedidos[index] = {
              ...this.pedidos[index],
              ...pedidoActualizado,
              estado: pedidoData.estado,
              solicitante_nombre: pedidoData.solicitante_nombre,
              supervisor_nombre: pedidoData.supervisor_nombre,
              tipo_pedido_nombre: pedidoData.tipo_pedido_nombre
            };
          }
          
          this.showToast('Pedido actualizado correctamente', 'success');
        }
        this.closeTrabajoModal();
      } catch (error) {
        // Error ya manejado en actualizarPedido
      }
    },
    
    async addTrabajo(nuevoPedido) {
      try {
        // Preparar datos del pedido
        const pedidoData = {
          ...nuevoPedido,
          fecha_solicitud: new Date().toISOString(),
          estado_id: this.resolveEstadoId('pendiente'),
          tipo_pedido_id: this.resolveTipoPedidoId(nuevoPedido.tipo_pedido_nombre),
          supervisor_id: nuevoPedido.supervisor_id
        };
        
        const pedidoCreado = await this.crearPedido(pedidoData);
        
        // Enriquecer el pedido creado con los nombres
        const pedidoEnriquecido = {
          ...pedidoCreado,
          estado: 'pendiente',
          solicitante_nombre: await this.resolveUsuario(pedidoCreado.solicitante_id),
          supervisor_nombre: await this.resolveUsuario(pedidoCreado.supervisor_id),
          tipo_pedido_nombre: this.resolveTipoPedido(pedidoCreado.tipo_pedido_id)
        };
        
        // Agregar al array local
        this.pedidos.unshift(pedidoEnriquecido);
        
        this.showNuevoTrabajoModal = false;
        this.showToast('Nuevo pedido creado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en crearPedido
      }
    },
    
    closeTrabajoModal() {
      this.showTrabajoModal = false;
      this.selectedTrabajo = null;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
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
    // Cargar tanto pedidos como técnicos al montar el componente
    await Promise.all([
      this.loadPedidos(),
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

/* Estilos específicos del componente */
.produccion-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filters-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  padding: 0 5px;
}

.search-input {
  position: relative;
}

.search-input input {
  padding-right: 35px;
  width: 100%;
}

.search-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: transparent;
  border: none;
  padding: 0 10px;
  color: #6c757d;
}

.filter-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
}

.apply-btn, .reset-btn {
  padding: 8px 16px;
}

.badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.badge-pendiente { background-color: #ffc107; color: #212529; }
.badge-en_proceso { background-color: #17a2b8; color: white; }
.badge-completado { background-color: #28a745; color: white; }
.badge-entregado { background-color: #6c757d; color: white; }

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
}

.table th {
  font-weight: 600;
  background-color: #f8f9fa;
  white-space: nowrap;
}

.table td, .table th {
  padding: 12px 15px;
  vertical-align: middle;
  border-top: 1px solid #dee2e6;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #6c757d;
  padding: 5px 8px;
  margin: 0 2px;
}

.btn-icon:hover {
  color: #0056b3;
  background-color: rgba(0, 123, 255, 0.1);
}

.pagination-container {
  display: flex;
  justify-content: space-between;
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
  min-width: 36px;
}

.btn-pagination.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.showing-info {
  font-size: 0.9rem;
  color: #6c757d;
}

.tabs-container {
  margin-bottom: 20px;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-link {
  color: #495057;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  padding: 10px 20px;
  font-weight: 500;
}

.nav-link.active {
  color: #0056b3;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
}

.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
  margin-bottom: 20px;
}

.card-body {
  padding: 20px;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, 
              border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  color: #fff;
  background-color: #0069d9;
  border-color: #0062cc;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
</style>