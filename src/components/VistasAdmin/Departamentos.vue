<template>
  <div class="departamentos-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-university"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Departamentos Universitarios</h1>
            <p class="header-subtitle">Gestiona los departamentos de tu institución</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-modern btn-primary" @click="showNuevoDepartamentoModal = true">
            <i class="fas fa-plus"></i>
            <span>Nuevo Departamento</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading con mejor diseño -->
    <div v-if="loading" class="modern-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando departamentos...</p>
      </div>
    </div>

    <!-- Panel de filtros mejorado -->
    <div class="filters-card" v-if="!loading && departamentos.length > 0">
      <div class="filters-header" @click="toggleFilters">
        <div class="filters-title">
          <i class="fas fa-filter"></i>
          <span>Filtros de Búsqueda</span>
          <div class="filter-badge" v-if="hasActiveFilters">{{ activeFiltersCount }}</div>
        </div>
        <div class="filters-toggle">
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </div>
      </div>

      <transition name="slide-down">
        <div class="filters-content" v-if="showFilters">
          <div class="filters-grid">
            <div class="filter-item">
              <label class="filter-label">
                <i class="fas fa-toggle-on"></i>
                Estado
              </label>
              <select v-model="estadoFilter" class="modern-select">
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div class="filter-item">
              <label class="filter-label">
                <i class="fas fa-search"></i>
                Búsqueda
              </label>
              <div class="search-container">
                <input 
                  v-model="searchQuery" 
                  placeholder="Buscar por nombre, código..."
                  class="modern-input"
                  @keyup.enter="applyFilters"
                >
                <button class="search-button" @click="applyFilters">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="filters-actions">
            <button class="btn-modern btn-primary" @click="applyFilters">
              <i class="fas fa-check"></i>
              Aplicar Filtros
            </button>
            <button class="btn-modern btn-secondary" @click="resetFilters">
              <i class="fas fa-undo"></i>
              Limpiar Todo
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Estado vacío mejorado -->
    <div class="empty-state" v-if="!loading && departamentos.length === 0">
      <div class="empty-icon">
        <i class="fas fa-university"></i>
      </div>
      <h3 class="empty-title">No hay departamentos registrados</h3>
      <p class="empty-description">Comienza creando tu primer departamento universitario</p>
      <button class="btn-modern btn-primary btn-large" @click="showNuevoDepartamentoModal = true">
        <i class="fas fa-plus"></i>
        <span>Crear Primer Departamento</span>
      </button>
    </div>

    <!-- Tarjetas de departamentos -->
    <div class="departments-grid" v-if="!loading && departamentos.length > 0">
      <transition-group name="fade-in" tag="div" class="grid-container">
        <div 
          v-for="departamento in paginatedDepartamentos" 
          :key="departamento.id"
          class="department-card"
        >
          <div class="card-header">
            <div class="department-id">{{ departamento.id }}</div>
            <div class="card-actions">
              <button class="action-btn view-btn" @click="verDetalles(departamento)" title="Ver detalles">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn edit-btn" @click="editarDepartamento(departamento)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="action-btn delete-btn" 
                @click="eliminarDepartamento(departamento.id)"
                :disabled="loadingDelete === departamento.id"
                title="Eliminar"
              >
                <i v-if="loadingDelete === departamento.id" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="card-body">
            <h3 class="department-name">{{ departamento.nombre }}</h3>
            <div class="department-info">
              <div class="info-item">
                <i class="fas fa-code"></i>
                <span>{{ departamento.codigo || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-user-tie"></i>
                <span>{{ departamento.responsable || 'Sin asignar' }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="status-badge" :class="estadoClass(departamento.estado)">
              <i :class="departamento.estado === 'activo' ? 'fas fa-check-circle' : 'fas fa-pause-circle'"></i>
              {{ formatEstado(departamento.estado) }}
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Paginación moderna -->
    <div class="modern-pagination" v-if="!loading && departamentos.length > 0 && totalPages > 1">
      <div class="pagination-info">
        <span class="info-text">
          Mostrando <strong>{{ showingFrom }}</strong> a <strong>{{ showingTo }}</strong> de <strong>{{ filteredDepartamentos.length }}</strong> departamentos
        </span>
      </div>
      
      <div class="pagination-controls">
        <button 
          class="page-btn prev-btn" 
          @click="prevPage" 
          :disabled="currentPage === 1"
          title="Página anterior"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in pages" 
            :key="page" 
            class="page-btn number-btn"
            :class="{ active: page === currentPage, disabled: page === '...' }"
            @click="goToPage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn next-btn" 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          title="Página siguiente"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modales (mantenemos los componentes originales) -->
    <DepartamentoModal 
      v-if="showDepartamentoModal" 
      :departamento="selectedDepartamento"
      @close="closeDepartamentoModal"
      @save="saveDepartamento"
    />

    <NuevoDepartamentoModal 
      v-if="showNuevoDepartamentoModal"
      @close="showNuevoDepartamentoModal = false"
      @save="addDepartamento"
    />
  </div>
</template>

<script>
import axios from 'axios'
import DepartamentoModal from '@/components/VistasAdmin/ComponentesAdmin/DepartamentoModal.vue'
import NuevoDepartamentoModal from '@/components/VistasAdmin/ComponentesAdmin/NuevoDepartamentoModal.vue'

export default {
  components: {
    DepartamentoModal,
    NuevoDepartamentoModal
  },
  
  data() {
    return {
      departamentos: [],
      loading: false,
      loadingDelete: null,
      searchQuery: '',
      estadoFilter: 'todos',
      sortField: 'nombre',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 12,
      showFilters: true,
      showDepartamentoModal: false,
      showNuevoDepartamentoModal: false,
      selectedDepartamento: null
    }
  },
  
  computed: {
    hasActiveFilters() {
      return this.searchQuery !== '' || this.estadoFilter !== 'todos';
    },
    
    activeFiltersCount() {
      let count = 0;
      if (this.searchQuery !== '') count++;
      if (this.estadoFilter !== 'todos') count++;
      return count;
    },
    
    filteredDepartamentos() {
      return this.departamentos.filter(departamento => {
        const matchesEstado = this.estadoFilter === 'todos' || 
                           departamento.estado === this.estadoFilter;
        
        const matchesSearch = this.searchQuery === '' ||
                            departamento.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            (departamento.codigo && departamento.codigo.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                            (departamento.responsable && departamento.responsable.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        return matchesEstado && matchesSearch;
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1;
        if (a[this.sortField] < b[this.sortField]) return -1 * modifier;
        if (a[this.sortField] > b[this.sortField]) return 1 * modifier;
        return 0;
      });
    },
    
    paginatedDepartamentos() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredDepartamentos.slice(start, start + this.itemsPerPage);
    },
    
    totalPages() {
      return Math.ceil(this.filteredDepartamentos.length / this.itemsPerPage);
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
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredDepartamentos.length);
    }
  },
  
  methods: {
    // Métodos de API (mantenemos los originales)
    async loadDepartamentos() {
      try {
        this.loading = true;
        const response = await axios.get('/api/DepartamentoUniversidad');
        this.departamentos = response.data;
      } catch (error) {
        console.error("Error cargando departamentos:", error);
        this.showToast('Error al cargar departamentos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async obtenerDepartamentoPorId(id) {
      try {
        const response = await axios.get(`/api/DepartamentoUniversidad/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo departamento:", error);
        this.showToast('Error al obtener departamento', 'error');
        throw error;
      }
    },

    async crearDepartamento(departamentoData) {
      try {
        const response = await axios.post('/api/DepartamentoUniversidad', departamentoData);
        return response.data;
      } catch (error) {
        console.error("Error creando departamento:", error);
        this.showToast('Error al crear departamento', 'error');
        throw error;
      }
    },

    async actualizarDepartamento(id, departamentoData) {
      try {
        const response = await axios.put(`/api/DepartamentoUniversidad/${id}`, departamentoData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando departamento:", error);
        this.showToast('Error al actualizar departamento', 'error');
        throw error;
      }
    },

    async eliminarDepartamentoAPI(id) {
      try {
        await axios.delete(`/api/DepartamentoUniversidad/${id}`);
      } catch (error) {
        console.error("Error eliminando departamento:", error);
        this.showToast('Error al eliminar departamento', 'error');
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
      this.currentPage = 1;
    },
    
    async verDetalles(departamento) {
      try {
        const departamentoActualizado = await this.obtenerDepartamentoPorId(departamento.id);
        this.selectedDepartamento = { ...departamentoActualizado };
        this.showDepartamentoModal = true;
      } catch (error) {
        this.selectedDepartamento = { ...departamento };
        this.showDepartamentoModal = true;
      }
    },
    
    editarDepartamento(departamento) {
      this.selectedDepartamento = { ...departamento };
      this.showDepartamentoModal = true;
    },
    
    async eliminarDepartamento(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarDepartamentoAPI(id);
        
        this.departamentos = this.departamentos.filter(d => d.id !== id);
        this.showToast('Departamento eliminado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en eliminarDepartamentoAPI
      } finally {
        this.loadingDelete = null;
      }
    },
    
    async saveDepartamento(departamentoData) {
      try {
        if (departamentoData.id) {
          const departamentoActualizado = await this.actualizarDepartamento(departamentoData.id, departamentoData);
          
          const index = this.departamentos.findIndex(d => d.id === departamentoData.id);
          if (index !== -1) {
            this.departamentos[index] = departamentoActualizado;
          }
          
          this.showToast('Departamento actualizado correctamente', 'success');
        }
        this.closeDepartamentoModal();
      } catch (error) {
        // Error ya manejado en actualizarDepartamento
      }
    },
    
    async addDepartamento(nuevoDepartamento) {
      try {
        const departamentoCreado = await this.crearDepartamento(nuevoDepartamento);
        
        this.departamentos.unshift(departamentoCreado);
        this.showNuevoDepartamentoModal = false;
        this.showToast('Nuevo departamento creado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en crearDepartamento
      }
    },
    
    closeDepartamentoModal() {
      this.showDepartamentoModal = false;
      this.selectedDepartamento = null;
    },
    
    formatEstado(estado) {
      return estado === 'activo' ? 'Activo' : 'Inactivo';
    },
    
    estadoClass(estado) {
      return estado === 'activo' ? 'status-active' : 'status-inactive';
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
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
      const alertType = type === 'success' ? 'Éxito' : 'Error';
      alert(`${alertType}: ${message}`);
    }
  },
  
  async mounted() {
    await this.loadDepartamentos();
  }
}
</script>

<style scoped>
/* Estilos completos para la vista de Departamentos Universitarios */
.departamentos-container {
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: #003366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #003366, #003366);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Botones */
.btn-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 0.8rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn-modern i {
  font-size: 1.1rem;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: all 0.6s ease;
}

.btn-modern:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #003366, #003366);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #edf2f7;
  color: #4a5568;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-large {
  padding: 1.2rem 2.4rem;
  font-size: 1.2rem;
}

/* Loading */
.modern-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  margin: 1.5rem 0;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #edf2f7;
  border-top: 5px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #718096;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Filtros */
.filters-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.filters-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filters-header:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
}

.filters-title i {
  color: #667eea;
  font-size: 1.2rem;
}

.filter-badge {
  background: #667eea;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 50px;
  min-width: 25px;
  text-align: center;
  margin-left: 0.5rem;
}

.filters-toggle {
  color: #718096;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.filters-content {
  padding: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.filter-label i {
  color: #667eea;
  font-size: 1rem;
}

.modern-select,
.modern-input {
  padding: 0.9rem 1.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.8rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  width: 100%;
  font-family: inherit;
}

.modern-select:focus,
.modern-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.search-container {
  position: relative;
}

.search-button {
  position: absolute;
  right: 0.3rem;
  top: 0.3rem;
  bottom: 0.3rem;
  padding: 0 1.2rem;
  background: linear-gradient(135deg, #003366, #003366);
  color: white;
  border: none;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background: linear-gradient(135deg, #003366, #003366);
}

.filters-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Estado vacío */
.empty-state {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  margin: 1.5rem 0;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 2.5rem;
  color: #718096;
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.05);
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.empty-description {
  color: #718096;
  font-size: 1.15rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Grid de departamentos */
.departments-grid {
  margin-bottom: 2rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.department-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.department-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.department-id {
  font-weight: 800;
  font-size: 1.1rem;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 50px;
}

.card-actions {
  display: flex;
  gap: 0.7rem;
}

.action-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.view-btn {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
}

.view-btn:hover {
  background: #4299e1;
  color: white;
}

.edit-btn {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.edit-btn:hover {
  background: #ed8936;
  color: white;
}

.delete-btn {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.delete-btn:hover {
  background: #f56565;
  color: white;
}

.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.card-body {
  padding: 1.5rem;
}

.department-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  line-height: 1.3;
}

.department-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #4a5568;
  font-size: 0.95rem;
}

.info-item i {
  color: #718096;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-active {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.status-inactive {
  background: rgba(160, 174, 192, 0.1);
  color: #a0aec0;
}

.status-badge i {
  font-size: 1rem;
}

/* Paginación */
.modern-pagination {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.pagination-info {
  text-align: center;
}

.info-text {
  color: #718096;
  font-size: 0.95rem;
}

.info-text strong {
  color: #4a5568;
  font-weight: 700;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  background: transparent;
  color: #4a5568;
}

.page-btn:hover:not(.disabled) {
  background: #edf2f7;
  color: #2d3748;
}

.page-btn.active {
  background: linear-gradient(135deg, #003366, #003366);
  color: white;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
  margin: 0 1rem;
}

.prev-btn,
.next-btn {
  background: #edf2f7;
  color: #4a5568;
}

.prev-btn:hover:not(:disabled),
.next-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

/* Transiciones */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.4s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.fade-in-enter-active,
.fade-in-leave-active {
  transition: all 0.5s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .departamentos-container {
    padding: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-text {
    align-items: center;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .department-card {
    max-width: 100%;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
  }
}
</style>