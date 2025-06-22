<template>
  <div class="inventario-container">
    <!-- Header con gradiente similar al de departamentos -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Inventario de Materia Prima</h1>
            <p class="header-subtitle">Gestiona el inventario de materiales</p>
          </div>
        </div>
      </div>
    </div>

    <div class="inventory-content">
        <h2 class="title">Inventario de Materia Prima</h2>
        
        <!-- Panel de Filtros -->
        <div class="filters-panel">
          <div class="filters-header">
            <h3>Filtros</h3>
            <button @click="toggleFilters" class="toggle-filters-btn">
              {{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros
            </button>
          </div>
          
          <div v-show="showFilters" class="filters-content">
            <div class="filters-grid">
              <!-- Búsqueda por texto -->
              <div class="filter-group">
                <label>Buscar:</label>
                <input
                  type="text"
                  v-model="filters.search"
                  placeholder="Código, nombre o proveedor..."
                  class="filter-input"
                >
              </div>
              
              <!-- Filtro por estado de stock -->
              <div class="filter-group">
                <label>Estado del Stock:</label>
                <select v-model="filters.stockStatus" class="filter-select">
                  <option value="">Todos</option>
                  <option value="available">Disponible</option>
                  <option value="low">Bajo stock</option>
                  <option value="out">Agotado</option>
                </select>
              </div>
              
              <!-- Filtro por rango de precio -->
              <div class="filter-group">
                <label>Precio desde:</label>
                <input
                  type="number"
                  v-model.number="filters.priceMin"
                  placeholder="0.00"
                  step="0.01"
                  class="filter-input"
                >
              </div>
              
              <div class="filter-group">
                <label>Precio hasta:</label>
                <input
                  type="number"
                  v-model.number="filters.priceMax"
                  placeholder="999999.99"
                  step="0.01"
                  class="filter-input"
                >
              </div>
              
              <!-- Filtro por unidad de medida -->
              <div class="filter-group">
                <label>Unidad de Medida:</label>
                <select v-model="filters.unit" class="filter-select">
                  <option value="">Todas</option>
                  <option v-for="(unit, id) in units" :key="id" :value="id">
                    {{ unit.nombre }}
                  </option>
                </select>
              </div>
              
              <!-- Filtro por proveedor -->
              <div class="filter-group">
                <label>Proveedor:</label>
                <select v-model="filters.supplier" class="filter-select">
                  <option value="">Todos</option>
                  <option v-for="supplier in uniqueSuppliers" :key="supplier" :value="supplier">
                    {{ supplier }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Botones de acción -->
            <div class="filters-actions">
              <button @click="clearFilters" class="btn-secondary">
                Limpiar Filtros
              </button>
              <button @click="exportFiltered" class="btn-primary">
                Exportar Filtrados
              </button>
            </div>
          </div>
        </div>

        <!-- Resumen de filtros activos -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filter-label">Filtros activos:</span>
          <span v-if="filters.search" class="filter-tag">
            Búsqueda: "{{ filters.search }}"
            <button @click="filters.search = ''" class="remove-filter">×</button>
          </span>
          <span v-if="filters.stockStatus" class="filter-tag">
            Estado: {{ getStockStatusLabel(filters.stockStatus) }}
            <button @click="filters.stockStatus = ''" class="remove-filter">×</button>
          </span>
          <span v-if="filters.priceMin" class="filter-tag">
            Precio min: ${{ filters.priceMin }}
            <button @click="filters.priceMin = null" class="remove-filter">×</button>
          </span>
          <span v-if="filters.priceMax" class="filter-tag">
            Precio max: ${{ filters.priceMax }}
            <button @click="filters.priceMax = null" class="remove-filter">×</button>
          </span>
          <span v-if="filters.unit" class="filter-tag">
            Unidad: {{ units[filters.unit]?.nombre }}
            <button @click="filters.unit = ''" class="remove-filter">×</button>
          </span>
          <span v-if="filters.supplier" class="filter-tag">
            Proveedor: {{ filters.supplier }}
            <button @click="filters.supplier = ''" class="remove-filter">×</button>
          </span>
        </div>
        
        <!-- Tabla de productos -->
        <div class="table-responsive">
          <table class="inventory-table">
            <thead>
              <tr>
                <th @click="sortBy('codigo')" class="sortable">
                  Código <SortIcon :direction="sortDirection('codigo')" />
                </th>
                <th @click="sortBy('nombre')" class="sortable">
                  Nombre <SortIcon :direction="sortDirection('nombre')" />
                </th>
                <th @click="sortBy('stock_total')" class="sortable">
                  Stock <SortIcon :direction="sortDirection('stock_total')" />
                </th>
                <th @click="sortBy('costo_unitario')" class="sortable">
                  Precio <SortIcon :direction="sortDirection('costo_unitario')" />
                </th>
                <th>Proveedor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="6" class="no-results">
                  {{ products.length === 0 ? 'Cargando productos...' : 'No se encontraron productos con los filtros aplicados' }}
                </td>
              </tr>
              <tr v-for="product in paginatedProducts" :key="product.id">
                <td>{{ product.codigo }}</td>
                <td>{{ product.nombre }}</td>
                <td :class="stockStatusClass(product)">
                  {{ product.stock_total }} {{ getUnitName(product.unidad_base_id) }}
                </td>
                <td>${{ formatPrice(product.costo_unitario) }}</td>
                <td>{{ product.proveedor_principal || 'N/A' }}</td>
                <td>
                  <span :class="statusBadgeClass(product)">
                    {{ stockStatusText(product) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            « Primera
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ‹ Anterior
          </button>
          
          <span class="pagination-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Siguiente ›
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Última »
          </button>
        </div>

        <!-- Total de items -->
        <div class="results-summary">
          <div class="total-items">
            Mostrando {{ paginatedProducts.length }} de {{ filteredProducts.length }} items
            <span v-if="filteredProducts.length !== products.length">
              ({{ products.length }} total)
            </span>
          </div>
          <div class="items-per-page">
            <label>Items por página:</label>
            <select v-model="itemsPerPage" @change="currentPage = 1">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import SortIcon from '@/components/VistasAdmin/ComponentesAdmin/SortIcon.vue'

export default {
  name: 'ProductInventory',
  components: {
    SortIcon
  },
  data() {
    return {
      products: [],
      sortField: 'codigo',
      sortOrder: 'asc',
      showFilters: true,
      currentPage: 1,
      itemsPerPage: 25,
      
      // Filtros
      filters: {
        search: '',
        stockStatus: '', // available, low, out
        priceMin: null,
        priceMax: null,
        unit: '',
        supplier: ''
      },
      
      units: {
        1: { nombre: 'metros', abreviatura: 'm' },
        2: { nombre: 'litros', abreviatura: 'l' },
        3: { nombre: 'kilogramos', abreviatura: 'kg' }
      }
    }
  },
  computed: {
    // Productos filtrados
    filteredProducts() {
      let filtered = [...this.products]
      
      // Filtro de búsqueda por texto
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase()
        filtered = filtered.filter(product =>
          product.codigo.toLowerCase().includes(searchTerm) ||
          product.nombre.toLowerCase().includes(searchTerm) ||
          (product.proveedor_principal && product.proveedor_principal.toLowerCase().includes(searchTerm))
        )
      }
      
      // Filtro por estado de stock
      if (this.filters.stockStatus) {
        filtered = filtered.filter(product => {
          const status = this.getProductStatus(product)
          return status === this.filters.stockStatus
        })
      }
      
      // Filtro por rango de precio
      if (this.filters.priceMin !== null && this.filters.priceMin !== '') {
        filtered = filtered.filter(product => 
          Number(product.costo_unitario) >= Number(this.filters.priceMin)
        )
      }
      
      if (this.filters.priceMax !== null && this.filters.priceMax !== '') {
        filtered = filtered.filter(product => 
          Number(product.costo_unitario) <= Number(this.filters.priceMax)
        )
      }
      
      // Filtro por unidad de medida
      if (this.filters.unit) {
        filtered = filtered.filter(product => 
          product.unidad_base_id == this.filters.unit
        )
      }
      
      // Filtro por proveedor
      if (this.filters.supplier) {
        filtered = filtered.filter(product => 
          product.proveedor_principal === this.filters.supplier
        )
      }
      
      return filtered
    },
    
    // Productos ordenados
    sortedProducts() {
      return [...this.filteredProducts].sort((a, b) => {
        let valA = a[this.sortField]
        let valB = b[this.sortField]

        // Convertir a número si es posible
        if (!isNaN(valA)) valA = Number(valA)
        if (!isNaN(valB)) valB = Number(valB)

        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },
    
    // Productos paginados
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.sortedProducts.slice(start, end)
    },
    
    // Total de páginas
    totalPages() {
      return Math.ceil(this.sortedProducts.length / this.itemsPerPage)
    },
    
    // Proveedores únicos para el filtro
    uniqueSuppliers() {
      const suppliers = [...new Set(
        this.products
          .map(p => p.proveedor_principal)
          .filter(p => p && p !== 'N/A')
      )]
      return suppliers.sort()
    },
    
    // Verificar si hay filtros activos
    hasActiveFilters() {
      return this.filters.search ||
             this.filters.stockStatus ||
             this.filters.priceMin !== null ||
             this.filters.priceMax !== null ||
             this.filters.unit ||
             this.filters.supplier
    }
  },
  watch: {
    // Resetear página cuando cambian los filtros
    filters: {
      handler() {
        this.currentPage = 1
      },
      deep: true
    }
  },
  async created() {
    await this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await fetch('api/MateriaPrima')
        if (!response.ok) throw new Error('Error en la respuesta del servidor')
        this.products = await response.json()
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
    },
    
    // Métodos de ordenamiento
    sortBy(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
    },
    
    sortDirection(field) {
      return this.sortField === field ? this.sortOrder : null
    },
    
    // Métodos de filtros
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    
    clearFilters() {
      this.filters = {
        search: '',
        stockStatus: '',
        priceMin: null,
        priceMax: null,
        unit: '',
        supplier: ''
      }
    },
    
    getProductStatus(product) {
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)
      
      if (stock === 0) return 'out'
      if (stock < minStock) return 'low'
      return 'available'
    },
    
    getStockStatusLabel(status) {
      const labels = {
        'available': 'Disponible',
        'low': 'Bajo stock',
        'out': 'Agotado'
      }
      return labels[status] || status
    },
    
    // Exportar productos filtrados
    exportFiltered() {
      const csvContent = this.generateCSV(this.filteredProducts)
      this.downloadCSV(csvContent, 'inventario_filtrado.csv')
    },
    
    generateCSV(products) {
      const headers = ['Código', 'Nombre', 'Stock', 'Precio', 'Proveedor', 'Estado']
      const rows = products.map(product => [
        product.codigo,
        product.nombre,
        `${product.stock_total} ${this.getUnitName(product.unidad_base_id)}`,
        `$${this.formatPrice(product.costo_unitario)}`,
        product.proveedor_principal || 'N/A',
        this.stockStatusText(product)
      ])
      
      return [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    },
    
    downloadCSV(content, filename) {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    
    // Métodos auxiliares existentes
    getUnitName(unitId) {
      return this.units[unitId]?.abreviatura || 'unid.'
    },
    
    formatPrice(price) {
      return Number(price).toFixed(2)
    },
    
    stockStatusClass(product) {
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)
      
      if (stock === 0) return 'out-of-stock'
      if (stock < minStock) return 'low-stock'
      return 'in-stock'
    },
    
    stockStatusText(product) {
      const stock = Number(product.stock_total)
      const minStock = Number(product.stock_minimo)
      
      if (stock === 0) return 'Agotado'
      if (stock < minStock) return 'Bajo stock'
      return 'Disponible'
    },
    
    statusBadgeClass(product) {
      const status = this.stockStatusClass(product)
      return `status-badge ${status}`
    }
  }
}
</script>

<style scoped>
.inventory-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Estilos del panel de filtros */
.filters-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.filters-header {
  padding: 15px 20px;
  background: #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

.filters-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
}

.toggle-filters-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.toggle-filters-btn:hover {
  background: #0056b3;
}

.filters-content {
  padding: 20px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.filters-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover {
  background: #218838;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Filtros activos */
.active-filters {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 10px 15px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-label {
  font-weight: 500;
  color: #1976d2;
  margin-right: 10px;
}

.filter-tag {
  background: #2196f3;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-filter {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: 5px;
}

.remove-filter:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

/* Tabla */
.table-responsive {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.inventory-table th,
.inventory-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.inventory-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background-color: #f0f0f0;
}

.inventory-table tbody tr:hover {
  background-color: #f5f5f5;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

/* Estilos de estado */
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
}

.in-stock {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.low-stock {
  background-color: #fff8e1;
  color: #ff8f00;
}

.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.pagination-btn:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.pagination-info {
  padding: 8px 16px;
  color: #495057;
  font-weight: 500;
}

/* Resumen de resultados */
.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.total-items {
  color: #666;
  font-size: 0.9rem;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 0.9rem;
}

.items-per-page select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .inventory-content {
    padding: 10px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-actions {
    flex-direction: column;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .results-summary {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .pagination-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .inventory-table th,
  .inventory-table td {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
  
  .filter-tag {
    font-size: 0.7rem;
    padding: 3px 6px;
  }
}
</style>