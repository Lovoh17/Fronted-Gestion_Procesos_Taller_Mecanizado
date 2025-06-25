<template>
  <div class="inventario-container">
    <!-- Header con la misma longitud que Inventario -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Administración de Stock</h1>
            <p class="header-subtitle">Controla tu inventario y mantén el stock siempre actualizado</p>
          </div>
        </div>

      </div>
    </div>

    <div class="inventory-content">
      <h2 class="title">Inventario de Materia Prima</h2>

      <!-- Panel de filtros  -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden"
        v-if="!loading && products.length > 0">
        <div class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          @click="toggleFilters">
          <div class="flex items-center space-x-2">
            <i class="fas fa-filter text-gray-500"></i>
            <span class="font-medium text-gray-700">Filtros de Búsqueda</span>
            <div v-if="hasActiveFilters"
              class="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {{ activeFiltersCount }}
            </div>
          </div>
          <div class="text-gray-500">
            <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </div>
        </div>

        <transition name="slide-down">
          <div v-if="showFilters" class="border-t border-gray-200 p-4">
            <!-- Filtros en una sola fila usando grid responsive -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
              <!-- Filtro Estado de Stock -->
              <div class="space-y-1">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <i class="fas fa-toggle-on mr-2 text-gray-500"></i>
                  Estado del Stock
                </label>
                <select v-model="filters.stockStatus"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos</option>
                  <option value="available">Disponible</option>
                  <option value="low">Bajo stock</option>
                  <option value="out">Agotado</option>
                </select>
              </div>

              <!-- Filtro Búsqueda -->
              <div class="space-y-1">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <i class="fas fa-search mr-2 text-gray-500"></i>
                  Búsqueda
                </label>
                <div class="relative">
                  <input v-model="filters.search" placeholder="Buscar..."
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    @keyup.enter="applyFilters">
                  <button class="absolute right-2 top-2 text-gray-500 hover:text-blue-500" @click="applyFilters">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>

              <!-- Filtro Precio Mínimo -->
              <div class="space-y-1">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <i class="fas fa-dollar-sign mr-2 text-gray-500"></i>
                  Precio mínimo
                </label>
                <input type="number" v-model.number="filters.priceMin" placeholder="0.00" step="0.01"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <!-- Filtro Precio Máximo -->
              <div class="space-y-1">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <i class="fas fa-dollar-sign mr-2 text-gray-500"></i>
                  Precio máximo
                </label>
                <input type="number" v-model.number="filters.priceMax" placeholder="999999.99" step="0.01"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>

              <!-- Filtro Unidad de Medida -->
              <div class="space-y-1">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <i class="fas fa-ruler-combined mr-2 text-gray-500"></i>
                  Unidad de Medida
                </label>
                <select v-model="filters.unit"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todas</option>
                  <option v-for="(unit, id) in units" :key="id" :value="id">
                    {{ unit.nombre }}
                  </option>
                </select>
              </div>

              <!-- Filtro Proveedor -->
              <div class="space-y-1">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <i class="fas fa-truck mr-2 text-gray-500"></i>
                  Proveedor
                </label>
                <select v-model="filters.supplier"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Todos</option>
                  <option v-for="supplier in uniqueSuppliers" :key="supplier" :value="supplier">
                    {{ supplier }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex justify-end space-x-2 pt-2">
              <button
                class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                @click="applyFilters">
                <i class="fas fa-check mr-2"></i>
                Aplicar Filtros
              </button>
              <button
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                @click="resetFilters">
                <i class="fas fa-undo mr-2"></i>
                Limpiar Todo
              </button>
            </div>
          </div>
        </transition>
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
                Código
                <SortIcon :direction="sortDirection('codigo')" />
              </th>
              <th @click="sortBy('nombre')" class="sortable">
                Nombre
                <SortIcon :direction="sortDirection('nombre')" />
              </th>
              <th @click="sortBy('stock_total')" class="sortable">
                Stock
                <SortIcon :direction="sortDirection('stock_total')" />
              </th>
              <th @click="sortBy('costo_unitario')" class="sortable">
                Precio
                <SortIcon :direction="sortDirection('costo_unitario')" />
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
        <button @click="currentPage = 1" :disabled="currentPage === 1" class="pagination-btn">
          « Primera
        </button>
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
          ‹ Anterior
        </button>

        <span class="pagination-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>

        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">
          Siguiente ›
        </button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="pagination-btn">
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
  max-width: auto;
  margin: 0 auto;
}

.inventario-container {
  max-width: auto;
  padding: 2rem;

}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
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

/* Estilos para el primer panel de filtros (mejorado) */
.bg-white {
  background-color: #fff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.mb-4 {
  margin-bottom: 1rem;
}

.overflow-hidden {
  overflow: hidden;
}

/* Transición para el panel desplegable */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  /* Ajusta según necesidad */
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-top-width: 0;
}

/* Estilos para el segundo panel de filtros */
.filters-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.filters-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.toggle-filters-btn {
  background-color: #e9ecef;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-filters-btn:hover {
  background-color: #dee2e6;
}

.filters-content {
  padding: 16px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filters-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Animación para el segundo panel */
.filters-content {
  transition: all 0.3s ease;
  max-height: 1000px;
  /* Ajusta según necesidad */
}

.filters-content[style*="display: none"] {
  display: block !important;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}

/* Transiciones comunes */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Efecto hover para elementos interactivos */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-gray-300:hover {
  background-color: #d1d5db;
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