<template>
  <div class="transacciones-container">
    <!-- Header -->
<div class="header-section">
  <div class="header-content">
    <div class="header-info">
      <div class="header-icon">
        <i class="fas fa-money-bill-wave"></i>
      </div>
      <div class="header-text">
        <h1 class="header-title">Transacciones Financieras</h1>
        <p class="header-subtitle">Gestiona y monitorea todas tus transacciones financieras de CMS</p>
      </div>
    </div>
    <div class="header-actions">
      <va-button  @click="exportData" color="secondary"   icon="download">
        
        
        <span>Exportar</span>
      
      </va-button>
      <va-button  @click="showNuevaTransaccionModal = true" color="primary"   icon="plus">
        
        
        <span>Nueva Transacción</span>
      
      </va-button>
    </div>
  </div>
</div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando transacciones...</p>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="dashboard-overview" v-if="!loading">
      <div class="overview-card income-card">
        <div class="card-icon">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Ingresos</div>
          <div class="card-amount positive">{{ formatCurrency(totalIngresos) }}</div>
          <div class="card-subtitle">{{ ingresosCount }} transacciones</div>
        </div>
      </div>
      
      <div class="overview-card expense-card">
        <div class="card-icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Egresos</div>
          <div class="card-amount negative">{{ formatCurrency(totalEgresos) }}</div>
          <div class="card-subtitle">{{ egresosCount }} transacciones</div>
        </div>
      </div>
      
      <div class="overview-card balance-card">
        <div class="card-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Balance Neto</div>
          <div class="card-amount" :class="balanceClass">{{ formatCurrency(balanceTotal) }}</div>
          <div class="card-subtitle">Diferencia total</div>
        </div>
      </div>

      <div class="overview-card transactions-card">
        <div class="card-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Transacciones</div>
          <div class="card-amount neutral">{{ filteredTransacciones.length }}</div>
          <div class="card-subtitle">En el período actual</div>
        </div>
      </div>
    </div>

<!-- Advanced Filters Panel -->
    <div class="filters-panel" v-if="!loading">
      <div class="panel-header" @click="toggleFilters">
        <div class="panel-title">
          <i class="fas fa-filter"></i>
          <span>Filtros Avanzados</span>
          <span class="filter-count" v-if="activeFiltersCount > 0">{{ activeFiltersCount }}</span>
        </div>
        <va-button class="panel-toggle"    >
        
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        
      </va-button>
      </div>

      <transition name="slide-down">
        <div class="filters-content" v-if="showFilters">
          <!-- Grid responsivo para filtros en una sola fila -->
          <div class="filters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-exchange-alt"></i>
                Tipo de Transacción
              </label>
              <select v-model="tipoFilter" class="filter-select">
                <option value="todos">Todos los tipos</option>
                <option value="ingreso">Solo Ingresos</option>
                <option value="egreso">Solo Egresos</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-tags"></i>
                Categoría
              </label>
              <select v-model="categoriaFilter" class="filter-select">
                <option value="todos">Todas las categorías</option>
                <option v-for="categoria in categorias" :key="categoria" :value="categoria">
                  {{ categoria }}
                </option>
              </select>
            </div>

            <!-- Período ocupa 2 columnas en pantallas grandes para acomodar los dos inputs -->
            <div class="filter-group xl:col-span-2">
              <label class="filter-label">
                <i class="fas fa-calendar-alt"></i>
                Período
              </label>
              <div class="date-range-container flex items-center space-x-2">
                <input type="date" v-model="fechaInicio" class="filter-input date-input flex-1" placeholder="Desde">
                <span class="date-separator text-sm text-gray-500">hasta</span>
                <input type="date" v-model="fechaFin" class="filter-input date-input flex-1" placeholder="Hasta">
              </div>
            </div>

            <!-- Rango de Monto ocupa 2 columnas en pantallas grandes -->
            <div class="filter-group xl:col-span-2">
              <label class="filter-label">
                <i class="fas fa-dollar-sign"></i>
                Rango de Monto
              </label>
              <div class="amount-range-container flex items-center space-x-2">
                <input 
                  type="number" 
                  v-model="montoMin" 
                  placeholder="Mínimo" 
                  class="filter-input amount-input flex-1"
                  step="0.01"
                >
                <span class="amount-separator text-sm text-gray-500">a</span>
                <input 
                  type="number" 
                  v-model="montoMax" 
                  placeholder="Máximo" 
                  class="filter-input amount-input flex-1"
                  step="0.01"
                >
              </div>
            </div>

            <!-- Búsqueda en una columna separada -->
            <div class="filter-group search-group">
              <label class="filter-label">
                <i class="fas fa-search"></i>
                Búsqueda
              </label>
              <div class="search-container relative">
                <input 
                  v-model="searchQuery" 
                  placeholder="Buscar..."
                  class="filter-input search-input pr-10"
                  @keyup.enter="applyFilters"
                >
                <va-button  @click="applyFilters"    icon="search">
        
                  
                
      </va-button>
              </div>
            </div>
          </div>

          <div class="filter-actions flex justify-end space-x-2 pt-2">
            <va-button  @click="applyFilters" color="primary"   icon="check">
        
              
              Aplicar Filtros
            
      </va-button>
            <va-button  @click="resetFilters" color="secondary"   icon="times">
        
              
              Limpiar Filtros
            
      </va-button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-table-container" v-if="!loading">
      <div class="table-header">
        <div class="table-title">
          <h3>Lista de Transacciones</h3>
          <div class="results-info">
            {{ filteredTransacciones.length }} resultados encontrados
          </div>
        </div>
        <div class="table-actions">
          <div class="view-options">
            <va-button  
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
                icon="table">
        
              
            
      </va-button>
            <va-button  
              :class="{ active: viewMode === 'cards' }"
              @click="viewMode = 'cards'"
                icon="th-large">
        
              
            
      </va-button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-responsive">
        <table class="transactions-table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('fecha')">
                <div class="th-content">
                  <i class="fas fa-calendar-alt"></i>
                  Fecha
                  <i :class="sortIcon('fecha')" class="sort-icon"></i>
                </div>
              </th>
              <th class="sortable" @click="sortBy('descripcion')">
                <div class="th-content">
                  <i class="fas fa-file-alt"></i>
                  Descripción
                  <i :class="sortIcon('descripcion')" class="sort-icon"></i>
                </div>
              </th>
              <th class="sortable" @click="sortBy('tipo')">
                <div class="th-content">
                  <i class="fas fa-exchange-alt"></i>
                  Tipo
                  <i :class="sortIcon('tipo')" class="sort-icon"></i>
                </div>
              </th>
              <th class="sortable amount-column" @click="sortBy('monto')">
                <div class="th-content">
                  <i class="fas fa-dollar-sign"></i>
                  Monto
                  <i :class="sortIcon('monto')" class="sort-icon"></i>
                </div>
              </th>
              <th class="actions-column">
                <div class="th-content">
                  <i class="fas fa-cogs"></i>
                  Acciones
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="transaccion in paginatedTransacciones" 
              :key="transaccion.id"
              class="transaction-row"
              @click="verDetalles(transaccion)"
            >
              <td class="date-cell">
                <div class="date-display">
                  {{ formatDate(transaccion.fecha) }}
                </div>
              </td>
              <td class="description-cell">
                <div class="description-content">
                  <span class="description-text">{{ transaccion.descripcion }}</span>
                  <span v-if="transaccion.referencia" class="reference-text">
                    Ref: {{ transaccion.referencia }}
                  </span>
                </div>
              </td>
              <td class="type-cell">
                <span :class="['type-badge', transaccion.tipo]">
                  <i :class="transaccion.tipo === 'ingreso' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ formatTipo(transaccion.tipo) }}
                </span>
              </td>
              <td class="amount-cell">
                <div class="amount-display" :class="transaccion.tipo">
                  {{ formatCurrency(transaccion.monto_total || transaccion.monto) }}
                </div>
              </td>
              <td class="actions-cell" @click.stop>
                <div class="action-buttons">
                  <va-button  
                    @click="verDetalles(transaccion)"
                    title="Ver detalles"
                      icon="eye">
        
                    
                  
      </va-button>
                  <va-button  
                    @click="editarTransaccion(transaccion)"
                    title="Editar"
                      icon="edit">
        
                    
                  
      </va-button>
                  <va-button  
                    @click="eliminarTransaccion(transaccion.id)"
                    :disabled="loadingDelete === transaccion.id"
                    title="Eliminar"
                      icon="inbox">
        
                    <i v-if="loadingDelete === transaccion.id" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredTransacciones.length === 0" class="empty-state">
          <div class="empty-icon">
            
          </div>
          <h3>No se encontraron transacciones</h3>
          <p>Intenta ajustar los filtros o crear una nueva transacción</p>
        </div>
      </div>

      <!-- Cards View -->
      <div v-if="viewMode === 'cards'" class="cards-view">
        <div class="transaction-cards-grid">
          <div 
            v-for="transaccion in paginatedTransacciones" 
            :key="transaccion.id"
            class="transaction-card"
            @click="verDetalles(transaccion)"
          >
            <div class="card-header">
              <span :class="['type-badge', transaccion.tipo]">
                <i :class="transaccion.tipo === 'ingreso' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ formatTipo(transaccion.tipo) }}
              </span>
              <div class="card-actions" @click.stop>
                <va-button class="action-btn edit-btn" @click="editarTransaccion(transaccion)"    icon="edit">
        </va-button>
                <va-button  
                  @click="eliminarTransaccion(transaccion.id)"
                  :disabled="loadingDelete === transaccion.id"
                    icon="calendar-alt">
        
                  <i v-if="loadingDelete === transaccion.id" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-trash"></i>
      </va-button>
              </div>
            </div>
            <div class="card-content">
              <h4 class="transaction-description">{{ transaccion.descripcion }}</h4>
              <div class="transaction-details">
                <div class="detail-item">
                  
                  {{ formatDate(transaccion.fecha) }}
                </div>
                <div class="detail-item">
                  <i class="fas fa-tags"></i>
                  {{ transaccion.categoria }}
                </div>
                <div v-if="transaccion.referencia" class="detail-item">
                  <i class="fas fa-hashtag"></i>
                  {{ transaccion.referencia }}
                </div>
              </div>
              <div class="transaction-amount" :class="transaccion.tipo">
                {{ formatCurrency(transaccion.monto_total || transaccion.monto) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTransacciones.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-inbox"></i>
          </div>
          <h3>No se encontraron transacciones</h3>
          <p>Intenta ajustar los filtros o crear una nueva transacción</p>
        </div>
      </div>

      <!-- Enhanced Pagination -->
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination-info">
          <span class="showing-text">
            Mostrando {{ showingFrom }} - {{ showingTo }} de {{ filteredTransacciones.length }} transacciones
          </span>
          <select v-model="itemsPerPage" class="items-per-page" @change="currentPage = 1">
            <option :value="5">5 por página</option>
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
          </select>
        </div>
        
        <div class="pagination-controls">
          <va-button class="pagination-btn" 
            @click="goToPage(1)" 
            :disabled="currentPage === 1"
            title="Primera página"
              icon="angle-double-left">
        </va-button>
          
          <va-button  
            @click="prevPage" 
            :disabled="currentPage === 1"
            title="Página anterior"
              icon="angle-left">
        
            
          
      </va-button>
          
          <div class="page-numbers">
            <va-button v-for="page in pages" 
              :key="page" 
              :class="{ active: page === currentPage, ellipsis: page === '...' }"
              @click="goToPage(page)"
              :disabled="page === '...'"
                icon="angle-right">
        
              {{ page }}
      </va-button>
          </div>
          
          <button 
            class="pagination-btn" 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            title="Página siguiente"
          >
            
          
      </va-button>
          
          <va-button  
            @click="goToPage(totalPages)" 
            :disabled="currentPage === totalPages"
            title="Última página"
              icon="angle-double-right">
        
            
          
      </va-button>
        </div>
      </div>
    </div>

    <!-- Modals (assuming they exist) -->
    <TransaccionModal 
      v-if="showTransaccionModal" 
      :transaccion="selectedTransaccion"
      @close="closeTransaccionModal"
      @save="saveTransaccion"
    />

    <NuevaTransaccionModal 
      v-if="showNuevaTransaccionModal"
      @close="showNuevaTransaccionModal = false"
      @save="addTransaccion"
    />
  </div>
</template>

<script>
import axios from 'axios'
import TransaccionModal from '@/components/VistasAdmin/ComponentesAdmin/TransaccionModal.vue'
import NuevaTransaccionModal from '@/components/VistasAdmin/ComponentesAdmin/NuevaTransaccionModal.vue'

export default {
  name: 'TransaccionesFinancieras',
  components: {
    TransaccionModal,
    NuevaTransaccionModal
  },
  
  data() {
    return {
      transacciones: [],
      loading: false,
      loadingDelete: null,
      searchQuery: '',
      tipoFilter: 'todos',
      categoriaFilter: 'todos',
      fechaInicio: '',
      fechaFin: '',
      montoMin: null,
      montoMax: null,
      categorias: ['Ventas', 'Compras', 'Salarios', 'Servicios', 'Impuestos', 'Otros'],
      sortField: 'fecha',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: false,
      showTransaccionModal: false,
      showNuevaTransaccionModal: false,
      selectedTransaccion: null,
      viewMode: 'table' // 'table' or 'cards'
    }
  },
  
  computed: {
    filteredTransacciones() {
      return this.transacciones.filter(transaccion => {
        const matchesTipo = this.tipoFilter === 'todos' || transaccion.tipo === this.tipoFilter;
        const matchesCategoria = this.categoriaFilter === 'todos' || transaccion.categoria === this.categoriaFilter;
        const matchesFecha = (!this.fechaInicio || new Date(transaccion.fecha) >= new Date(this.fechaInicio)) &&
                           (!this.fechaFin || new Date(transaccion.fecha) <= new Date(this.fechaFin));
        const monto = transaccion.monto_total || transaccion.monto || 0;
        const matchesMonto = (!this.montoMin || monto >= this.montoMin) &&
                           (!this.montoMax || monto <= this.montoMax);
        const matchesSearch = this.searchQuery === '' ||
                            transaccion.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            (transaccion.referencia && transaccion.referencia.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        return matchesTipo && matchesCategoria && matchesFecha && matchesMonto && matchesSearch;
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1;
        const aVal = a[this.sortField] || '';
        const bVal = b[this.sortField] || '';
        
        if (this.sortField === 'monto') {
          const aMonto = a.monto_total || a.monto || 0;
          const bMonto = b.monto_total || b.monto || 0;
          return (aMonto - bMonto) * modifier;
        }
        
        if (aVal < bVal) return -1 * modifier;
        if (aVal > bVal) return 1 * modifier;
        return 0;
      });
    },
    
    paginatedTransacciones() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTransacciones.slice(start, start + this.itemsPerPage);
    },
    
    totalPages() {
      return Math.ceil(this.filteredTransacciones.length / this.itemsPerPage);
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
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < this.totalPages) {
        if (end < this.totalPages - 1) pages.push('...');
        pages.push(this.totalPages);
      }
      
      return pages;
    },
    
    showingFrom() {
      return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.filteredTransacciones.length);
    },
    
    showingTo() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredTransacciones.length);
    },
    
    totalIngresos() {
      return this.filteredTransacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (t.monto_total || t.monto || 0), 0);
    },
    
    totalEgresos() {
      return this.filteredTransacciones
        .filter(t => t.tipo === 'egreso')
        .reduce((sum, t) => sum + (t.monto_total || t.monto || 0), 0);
    },
    
    balanceTotal() {
      return this.totalIngresos - this.totalEgresos;
    },
    
    balanceClass() {
      return this.balanceTotal >= 0 ? 'positive' : 'negative';
    },
    
    ingresosCount() {
      return this.filteredTransacciones.filter(t => t.tipo === 'ingreso').length;
    },
    
    egresosCount() {
      return this.filteredTransacciones.filter(t => t.tipo === 'egreso').length;
    },
    
    activeFiltersCount() {
      let count = 0;
      if (this.tipoFilter !== 'todos') count++;
      if (this.categoriaFilter !== 'todos') count++;
      if (this.fechaInicio) count++;
      if (this.fechaFin) count++;
      if (this.montoMin !== null) count++;
      if (this.montoMax !== null) count++;
      if (this.searchQuery) count++;
      return count;
    }
  },
  
  methods: {
    // API Methods
    async loadTransacciones() {
      try {
        this.loading = true;
        const response = await axios.get('/api/Transaccion_Financiera');
        this.transacciones = response.data.map(t => ({
          ...t,
          fecha: t.fecha || new Date().toISOString().split('T')[0]
        }));
      } catch (error) {
        console.error("Error cargando transacciones:", error);
        this.showToast('Error al cargar transacciones', 'error');
      } finally {
        this.loading = false;
      }
    },

    async obtenerTransaccionPorId(id) {
      try {
        const response = await axios.get(`/api/Transaccion_Financiera/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo transacción:", error);
        this.showToast('Error al obtener transacción', 'error');
        throw error;
      }
    },

    async crearTransaccion(transaccionData) {
      try {
        const response = await axios.post('/api/Transaccion_Financiera', transaccionData);
        return response.data;
      } catch (error) {
        console.error("Error creando transacción:", error);
        this.showToast('Error al crear transacción', 'error');
        throw error;
      }
    },

    async actualizarTransaccion(id, transaccionData) {
      try {
        const response = await axios.put(`/api/Transaccion_Financiera/${id}`, transaccionData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando transacción:", error);
        this.showToast('Error al actualizar transacción', 'error');
        throw error;
      }
    },

    async eliminarTransaccionAPI(id) {
      try {
        await axios.delete(`/api/Transaccion_Financiera/${id}`);
      } catch (error) {
        console.error("Error eliminando transacción:", error);
        this.showToast('Error al eliminar transacción', 'error');
        throw error;
      }
    },
    
    // UI Methods
    applyFilters() {
      this.currentPage = 1;
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.tipoFilter = 'todos';
      this.categoriaFilter = 'todos';
      this.fechaInicio = '';
      this.fechaFin = '';
      this.montoMin = null;
      this.montoMax = null;
      this.currentPage = 1;
    },
    
    async verDetalles(transaccion) {
      try {
        const transaccionActualizada = await this.obtenerTransaccionPorId(transaccion.id);
        this.selectedTransaccion = { ...transaccionActualizada };
        this.showTransaccionModal = true;
      } catch (error) {
        this.selectedTransaccion = { ...transaccion };
        this.showTransaccionModal = true;
      }
    },
    
    editarTransaccion(transaccion) {
      this.selectedTransaccion = { ...transaccion };
      this.showTransaccionModal = true;
    },
    
    async eliminarTransaccion(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarTransaccionAPI(id);
        
        this.transacciones = this.transacciones.filter(t => t.id !== id);
        this.showToast('Transacción eliminada correctamente', 'success');
      } catch (error) {
        // Error already handled in eliminarTransaccionAPI
      } finally {
        this.loadingDelete = null;
      }
    },
    
    async saveTransaccion(transaccionData) {
      try {
        if (transaccionData.id) {
          const transaccionActualizada = await this.actualizarTransaccion(transaccionData.id, transaccionData);
          
          const index = this.transacciones.findIndex(t => t.id === transaccionData.id);
          if (index !== -1) {
            this.transacciones[index] = transaccionActualizada;
          }
          
          this.showToast('Transacción actualizada correctamente', 'success');
        }
        this.closeTransaccionModal();
      } catch (error) {
        // Error already handled in actualizarTransaccion
      }
    },
    
    async addTransaccion(nuevaTransaccion) {
      try {
        const transaccionCreada = await this.crearTransaccion(nuevaTransaccion);
        
        this.transacciones.unshift(transaccionCreada);
        this.showNuevaTransaccionModal = false;
        this.showToast('Nueva transacción creada correctamente', 'success');
      } catch (error) {
        // Error already handled in crearTransaccion
      }
    },
    
    closeTransaccionModal() {
      this.showTransaccionModal = false;
      this.selectedTransaccion = null;
    },
    
    exportData() {
      const csvContent = this.generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    generateCSV() {
      const headers = ['Fecha', 'Descripción', 'Tipo', 'Categoría', 'Monto', 'Referencia'];
      const rows = this.filteredTransacciones.map(t => [
        this.formatDate(t.fecha),
        t.descripcion,
        this.formatTipo(t.tipo),
        t.categoria,
        t.monto_total || t.monto || 0,
        t.referencia || ''
      ]);
      
      return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    formatCurrency(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return '$0.00'; 
      }
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount);
    },
    
    formatTipo(tipo) {
      return tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    
    sortIcon(field) {
      if (this.sortField !== field) return 'fas fa-sort';
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },
    
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    
    goToPage(page) {
      if (page !== '...' && page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
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
    await this.loadTransacciones();
  }
}
</script>

<style scoped>
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
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

/* Responsive */
@media (max-width: 768px) {
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

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  .btn-modern {
    width: 100%;
    justify-content: center;
  }
}

/* Container Principal */
.transacciones-container {
  max-width: auto;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title i {
  color: var(--primary-color);
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  line-height: 1.5;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Dashboard Overview */
.dashboard-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.income-card .card-icon {
  background: linear-gradient(135deg, var(--success-color), #34d399);
}

.expense-card .card-icon {
  background: linear-gradient(135deg, var(--danger-color), #f87171);
}

.balance-card .card-icon {
  background: linear-gradient(135deg, var(--info-color), #60a5fa);
}

.transactions-card .card-icon {
  background: linear-gradient(135deg, var(--warning-color), #fbbf24);
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.card-amount {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.card-amount.positive {
  color: var(--success-color);
}

.card-amount.negative {
  color: var(--danger-color);
}

.card-amount.neutral {
  color: var(--dark-color);
}

.card-subtitle {
  font-size: 0.75rem;
  color: var(--secondary-color);
}

/* Filters Panel */
.filters-panel {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--light-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.panel-header:hover {
  background: #f1f5f9;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--dark-color);
}

.filter-count {
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.panel-toggle {
  background: none;
  border: none;
  color: var(--secondary-color);
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.panel-toggle:hover {
  color: var(--primary-color);
}

/* Slide Down Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.filters-content {
  padding: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.search-group {
  grid-column: 1 / -1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--dark-color);
  font-size: 0.875rem;
}

.filter-label i {
  color: var(--primary-color);
  width: 16px;
}

.filter-select,
.filter-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

.date-range-container,
.amount-range-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.date-separator,
.amount-separator {
  color: var(--secondary-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.search-container {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
}

.search-btn {
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn:hover {
  background: var(--primary-dark);
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Transactions Table Container */
.transactions-table-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: var(--light-color);
  border-bottom: 1px solid var(--border-color);
}

.table-title h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark-color);
}

.results-info {
  font-size: 0.875rem;
  color: var(--secondary-color);
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-options {
  display: flex;
  gap: 0.25rem;
  background: var(--border-color);
  padding: 0.25rem;
  border-radius: var(--radius-md);
}

.view-btn {
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--secondary-color);
  transition: all 0.2s ease;
}

.view-btn.active,
.view-btn:hover {
  background: white;
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th {
  background: var(--light-color);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--dark-color);
  border-bottom: 2px solid var(--border-color);
}

.transactions-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.transactions-table th.sortable:hover {
  background: #f1f5f9;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.th-content i:first-child {
  color: var(--primary-color);
}

.sort-icon {
  margin-left: auto;
  color: var(--secondary-color);
  font-size: 0.75rem;
}

.amount-column,
.actions-column {
  width: 120px;
}

.actions-column {
  width: 140px;
}

.transaction-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.transaction-row:hover {
  background: var(--light-color);
}

.transactions-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.date-display {
  font-weight: 500;
  color: var(--dark-color);
}

.description-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.description-text {
  font-weight: 500;
  color: var(--dark-color);
}

.reference-text {
  font-size: 0.75rem;
  color: var(--secondary-color);
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.type-badge.ingreso {
  background: rgb(16 185 129 / 0.1);
  color: var(--success-color);
  border: 1px solid rgb(16 185 129 / 0.2);
}

.type-badge.egreso {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger-color);
  border: 1px solid rgb(239 68 68 / 0.2);
}

.category-tag {
  background: var(--light-color);
  color: var(--secondary-color);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 500;
}

.amount-display {
  font-weight: 700;
  font-size: 1.1rem;
}

.amount-display.ingreso {
  color: var(--success-color);
}

.amount-display.egreso {
  color: var(--danger-color);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.view-btn {
  background: rgb(59 130 246 / 0.1);
  color: var(--info-color);
}

.action-btn.view-btn:hover {
  background: rgb(59 130 246 / 0.2);
}

.action-btn.edit-btn {
  background: rgb(245 158 11 / 0.1);
  color: var(--warning-color);
}

.action-btn.edit-btn:hover {
  background: rgb(245 158 11 / 0.2);
}

.action-btn.delete-btn {
  background: rgb(239 68 68 / 0.1);
  color: var(--danger-color);
}

.action-btn.delete-btn:hover {
  background: rgb(239 68 68 / 0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Cards View */
.cards-view {
  padding: 2rem;
}

.transaction-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.transaction-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transaction-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.transaction-description {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
  margin: 0 0 1rem 0;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--secondary-color);
}

.detail-item i {
  width: 16px;
  color: var(--primary-color);
}

.transaction-amount {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: right;
}

.transaction-amount.ingreso {
  color: var(--success-color);
}

.transaction-amount.egreso {
  color: var(--danger-color);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--secondary-color);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--dark-color);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Enhanced Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: var(--light-color);
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.showing-text {
  font-size: 0.875rem;
  color: var(--secondary-color);
}

.items-per-page {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--secondary-color);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: var(--secondary-color);
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
}

.page-btn.ellipsis:hover {
  background: transparent;
  color: var(--secondary-color);
}

/* Responsive Design */
@media (max-width: 768px) {
  .transacciones-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .dashboard-overview {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .date-range-container,
  .amount-range-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .transaction-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .transactions-table {
    font-size: 0.875rem;
  }
  
  .transactions-table th,
  .transactions-table td {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }
  
  .overview-card {
    padding: 1.5rem;
  }
  
  .card-amount {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>