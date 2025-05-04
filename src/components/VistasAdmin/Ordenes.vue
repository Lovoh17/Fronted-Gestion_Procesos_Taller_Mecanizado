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
  
      <!-- Pestañas -->
      <div class="tabs-container">
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
      <div class="filters-panel">
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
      <div class="tab-content">
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
      searchQuery: '',
      estadoFilter: 'todos',
      tecnicoFilter: 'todos',
      fechaInicio: '',
      fechaFin: '',
      tecnicos: [
        { id: 1, nombre: 'Juan Pérez' },
        { id: 2, nombre: 'María Gómez' },
        { id: 3, nombre: 'Carlos Rodríguez' }
      ],
      sortField: 'fecha_inicio',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: true,
      showTrabajoModal: false,
      showNuevoTrabajoModal: false,
      selectedTrabajo: null
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
    async loadTrabajos() {
  try {
    // Datos de prueba para taller de mecanizado y soldadura
    this.trabajos = [
      {
        id: 1,
        orden: 'MEC-2023-001',
        cliente: 'Industrias Metalúrgicas S.A.',
        proyecto: 'Fabricación de soporte estructural',
        tipo: 'Mecanizado CNC y soldadura',
        tecnico: 'Luis Torres',
        tecnico_id: 1,
        fecha_inicio: '2023-05-10',
        fecha_fin: '2023-05-15',
        estado: 'completado',
        detalles: 'Mecanizado de piezas en acero A36 y soldadura MIG para ensamblaje final.'
      },
      {
        id: 2,
        orden: 'SOL-2023-002',
        cliente: 'Constructora Andina',
        proyecto: 'Reparación de vigas de puente',
        tipo: 'Soldadura de reparación',
        tecnico: 'María Gómez',
        tecnico_id: 2,
        fecha_inicio: '2023-05-12',
        fecha_fin: '',
        estado: 'en_proceso',
        detalles: 'Reparación por fatiga de material en uniones soldadas, proceso SMAW.'
      },
      {
        id: 3,
        orden: 'MEC-2023-003',
        cliente: 'Fábrica de Maquinaria Pesada',
        proyecto: 'Prototipo de componente hidráulico',
        tipo: 'Mecanizado de precisión',
        tecnico: 'Carlos Rodríguez',
        tecnico_id: 3,
        fecha_inicio: '2023-05-15',
        fecha_fin: '',
        estado: 'pendiente',
        detalles: 'Torneado y fresado de componentes en acero inoxidable 304 con tolerancias ±0.01mm.'
      },
      {
        id: 4,
        orden: 'SOL-2023-004',
        cliente: 'Astilleros del Pacífico',
        proyecto: 'Estructura de cubierta naval',
        tipo: 'Soldadura TIG en aluminio',
        tecnico: 'Juan Pérez',
        tecnico_id: 1,
        fecha_inicio: '2023-05-08',
        fecha_fin: '2023-05-18',
        estado: 'entregado',
        detalles: 'Soldadura de paneles de aluminio 5083 para aplicación marina, certificación AWS D1.2.'
      }
    ];
    
  } catch (error) {
    console.error("Error cargando trabajos:", error);
    this.showToast('Error al cargar trabajos', 'error');
  }
},
    
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
    
    verDetalles(trabajo) {
      this.selectedTrabajo = { ...trabajo };
      this.showTrabajoModal = true;
    },
    
    editarTrabajo(trabajo) {
      this.selectedTrabajo = { ...trabajo };
      this.showTrabajoModal = true;
    },
    
    async saveTrabajo(trabajoData) {
      try {
        if (trabajoData.id) {
          // Actualizar trabajo existente
          const index = this.trabajos.findIndex(t => t.id === trabajoData.id);
          if (index !== -1) {
            this.trabajos[index] = trabajoData;
          }
          
          // Llamada API real (descomentar cuando esté lista)
          // await this.$http.put(`/api/trabajos/${trabajoData.id}`, trabajoData);
          
          this.showToast('Trabajo actualizado', 'success');
        }
        this.closeTrabajoModal();
      } catch (error) {
        console.error("Error guardando trabajo:", error);
        this.showToast('Error al guardar trabajo', 'error');
      }
    },
    
    async addTrabajo(nuevoTrabajo) {
      try {
        // Generar ID y orden (en producción esto lo haría el backend)
        const newId = Math.max(...this.trabajos.map(t => t.id), 0) + 1;
        const newOrden = `T-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`;
        
        const trabajo = {
          id: newId,
          orden: newOrden,
          ...nuevoTrabajo,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: '',
          estado: 'pendiente'
        };
        
        this.trabajos.unshift(trabajo);
        
        // Llamada API real (descomentar cuando esté lista)
        // await this.$http.post('/api/trabajos', nuevoTrabajo);
        // this.loadTrabajos(); // Recargar datos
        
        this.showNuevoTrabajoModal = false;
        this.showToast('Nuevo trabajo creado', 'success');
      } catch (error) {
        console.error("Error creando trabajo:", error);
        this.showToast('Error al crear trabajo', 'error');
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
      // Implementación básica - puedes usar un plugin de notificaciones
      alert(`${type.toUpperCase()}: ${message}`);
      // this.$toast(message, { type }); // Si usas un plugin de toasts
    }
  },
  
  mounted() {
    this.loadTrabajos();
  }
}
</script>