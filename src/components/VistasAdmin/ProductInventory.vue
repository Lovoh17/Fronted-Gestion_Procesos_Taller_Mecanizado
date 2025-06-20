<template>
  <div> 
    <main>
      <div class="inventory-content">
        <!-- Filtros -->
        <div class="inventory-filters">
          <!-- Filtro por Categoría -->
          <div class="filter-group">
            <label for="category-filter">Categoría:</label>
            <select 
              id="category-filter"
              v-model="categoryFilter" 
              @change="filterProducts"
              class="filter-select"
            >
              <option value="">Todas</option>
              <option 
                v-for="category in categories" 
                :key="category" 
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>
          
          <!-- Filtro por Estado -->
          <div class="filter-group">
            <label for="status-filter">Estado:</label>
            <select 
              id="status-filter"
              v-model="statusFilter" 
              @change="filterProducts"
              class="filter-select"
            >
              <option value="">Todos</option>
              <option value="in_stock">En Stock</option>
              <option value="low_stock">Stock Bajo</option>
              <option value="out_of_stock">Agotado</option>
            </select>
          </div>

          <!-- Filtro por Tipo de Inventario -->
          <div class="filter-group">
            <label for="inventory-type-filter">Tipo de Inventario:</label>
            <select 
              id="inventory-type-filter"
              v-model="inventoryTypeFilter" 
              @change="filterProducts"
              class="filter-select"
            >
              <option value="">Todos</option>
              <option value="interno">Trabajos Internos</option>
              <option value="externo">Trabajos Externos</option>
              <option value="practicas">Prácticas</option>
            </select>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="action-buttons">
          <button @click="showAddModal = true" class="btn btn-primary">
            Agregar Materia Prima
          </button>
        </div>
        
        <!-- Componentes modales -->
        <AddMateriaPrima
          v-if="showAddModal"
          @close="showAddModal = false"
          @created="handleMateriaPrimaCreated"
        />
        
        <!-- Modal para edición -->
        <AddMateriaPrima
          v-if="showEditModal"
          :editing="true"
          :materia-prima-to-edit="selectedMateriaPrima"
          @close="showEditModal = false"
          @updated="handleMateriaPrimaUpdated"
        />
        
        <!-- Loading spinner -->
        <div v-if="loading" class="loading-spinner">
          Cargando productos...
        </div>

        <!-- Error message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <!-- Tabla de productos -->
        <div class="table-responsive" v-if="!loading">
          <table class="inventory-table">
            <thead>
              <tr>
                <th @click="sortBy('codigo')" class="sortable">
                  Código
                  <span class="sort-icon" v-if="sortKey === 'codigo'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="sortBy('nombre')" class="sortable">
                  Nombre
                  <span class="sort-icon" v-if="sortKey === 'nombre'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Categoría</th>
                <th @click="sortBy('stock_total')" class="sortable">
                  Stock Total
                  <span class="sort-icon" v-if="sortKey === 'stock_total'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Stock Mínimo</th>
                <th @click="sortBy('costo_unitario')" class="sortable">
                  Costo Unitario
                  <span class="sort-icon" v-if="sortKey === 'costo_unitario'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.id">
                <td>{{ product.codigo }}</td>
                <td>{{ product.nombre }}</td>
                <td>{{ getCategoryName(product.tipo_materia_prima_id) }}</td>
                <td :class="{
                  'text-warning': product.stock_total < product.stock_minimo && product.stock_total > 0,
                  'text-danger': product.stock_total === 0
                }">
                  {{ product.stock_total }} {{ getUnitName(product.unidad_base_id) }}
                </td>
                <td>{{ product.stock_minimo }}</td>
                <td>${{ formatCurrency(product.costo_unitario) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(product)">
                    {{ getStatusText(product) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-icon" @click="editProduct(product)" title="Editar">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-icon" @click="confirmDelete(product)" title="Eliminar">
                    <span class="material-icons">delete</span>
                  </button>
                  <button class="btn-icon" @click="viewDetails(product)" title="Detalles">
                    <span class="material-icons">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mensaje cuando no hay productos -->
          <div v-if="filteredProducts.length === 0" class="no-products">
            No se encontraron productos que coincidan con los filtros aplicados.
          </div>
        </div>
        
        <!-- Paginación -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            &laquo;
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="{ active: currentPage === page }"
            class="pagination-btn"
          >
            {{ page }}
          </button>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            &raquo;
          </button>
        </div>

        <!-- Información de paginación -->
        <div class="pagination-info" v-if="filteredProducts.length > 0">
          Mostrando {{ startItem }} - {{ endItem }} de {{ filteredProducts.length }} productos
        </div>
      </div>
      
      <!-- Modal de confirmación de eliminación -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="confirm-modal">
          <h3>Confirmar Eliminación</h3>
          <p>¿Estás seguro de eliminar la materia prima "{{ productToDelete?.nombre }}"?</p>
          <p class="warning-text">Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button @click="showConfirmModal = false" class="btn btn-outline">
              Cancelar
            </button>
            <button @click="deleteProduct" class="btn btn-danger">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de detalles -->
      <div v-if="showDetailsModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalles de {{ selectedProduct?.nombre }}</h3>
            <button @click="showDetailsModal = false" class="btn-icon">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="product-details" v-if="selectedProduct">
            <div class="detail-row">
              <strong>Código:</strong> {{ selectedProduct.codigo }}
            </div>
            <div class="detail-row">
              <strong>Nombre:</strong> {{ selectedProduct.nombre }}
            </div>
            <div class="detail-row">
              <strong>Descripción:</strong> {{ selectedProduct.descripcion || 'No especificada' }}
            </div>
            <div class="detail-row">
              <strong>Stock Total:</strong> {{ selectedProduct.stock_total }}
            </div>
            <div class="detail-row">
              <strong>Stock Mínimo:</strong> {{ selectedProduct.stock_minimo }}
            </div>
            <div class="detail-row">
              <strong>Stock Máximo:</strong> {{ selectedProduct.stock_maximo }}
            </div>
            <div class="detail-row">
              <strong>Costo Unitario:</strong> ${{ formatCurrency(selectedProduct.costo_unitario) }}
            </div>
            <div class="detail-row">
              <strong>Proveedor Principal:</strong> {{ selectedProduct.proveedor_principal || 'No especificado' }}
            </div>
            <div class="detail-row">
              <strong>Tiempo de Reposición:</strong> {{ selectedProduct.tiempo_reposicion }} días
            </div>
            <div class="detail-row">
              <strong>Es Controlado:</strong> {{ selectedProduct.es_controlado ? 'Sí' : 'No' }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AddMateriaPrima from '@/components/VistasAdmin/ComponentesAdmin/AddMateriaPrima.vue'
import axios from 'axios'

export default {
  name: 'InventoryView',
  components: {
    AddMateriaPrima
  },
  data() {
    return {
      products: [],
      categories: [],
      units: [],
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      inventoryTypeFilter: '',
      filteredProducts: [],
      sortKey: 'codigo',
      sortOrder: 1,
      currentPage: 1,
      itemsPerPage: 10,
      showConfirmModal: false,
      showDetailsModal: false,
      productToDelete: null,
      selectedProduct: null,
      loading: false,
      error: null,
      showAddModal: false,
      showEditModal: false,
      selectedMateriaPrima: null
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    visiblePages() {
      const total = this.totalPages
      const current = this.currentPage
      const delta = 2

      let range = []
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        range.unshift('...')
      }
      if (current + delta < total - 1) {
        range.push('...')
      }

      range.unshift(1)
      if (total !== 1) {
        range.push(total)
      }

      return range
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length)
    }
  },
  async created() {
    await this.fetchProducts()
    await this.fetchCategories()
    await this.fetchUnits()
    this.filterProducts()
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/MateriaPrima')
        this.products = response.data
      } catch (error) {
        this.error = 'Error al cargar los productos: ' + error.message
        console.error('Error fetching products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await axios.get('/TipoMateriaPrima')
        this.categories = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    },

    async fetchUnits() {
      try {
        const response = await axios.get('/UnidadMedida')
        this.units = response.data
      } catch (error) {
        console.error('Error fetching units:', error)
      }
    },
    
    handleSearch(query) {
      this.searchQuery = query
      this.filterProducts()
    },
    
    filterProducts() {
      this.filteredProducts = this.products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            product.codigo.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.categoryFilter || product.tipo_materia_prima_id === this.categoryFilter
        const matchesStatus = this.matchesStatusFilter(product)
        const matchesInventoryType = this.matchesInventoryTypeFilter(product)
        
        return matchesSearch && matchesCategory && matchesStatus && matchesInventoryType
      })
      
      this.sortProducts()
      this.currentPage = 1
    },
    
    matchesStatusFilter(product) {
      if (!this.statusFilter) return true
      
      switch(this.statusFilter) {
        case 'in_stock': return product.stock_total >= product.stock_minimo
        case 'low_stock': return product.stock_total < product.stock_minimo && product.stock_total > 0
        case 'out_of_stock': return product.stock_total === 0
        default: return true
      }
    },

    matchesInventoryTypeFilter(product) {
      if (!this.inventoryTypeFilter) return true
      // Aquí puedes implementar la lógica específica para tipos de inventario
      // según tu modelo de datos
      return true
    },
    
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1
      } else {
        this.sortKey = key
        this.sortOrder = 1
      }
      this.sortProducts()
    },
    
    sortProducts() {
      this.filteredProducts.sort((a, b) => {
        let aVal = a[this.sortKey]
        let bVal = b[this.sortKey]
        
        // Handle null/undefined values
        if (aVal == null) aVal = ''
        if (bVal == null) bVal = ''
        
        if (aVal < bVal) return -1 * this.sortOrder
        if (aVal > bVal) return 1 * this.sortOrder
        return 0
      })
    },
    
    getStatusClass(product) {
      if (product.stock_total === 0) return 'status-out'
      if (product.stock_total < product.stock_minimo) return 'status-low'
      return 'status-ok'
    },
    
    getStatusText(product) {
      if (product.stock_total === 0) return 'Agotado'
      if (product.stock_total < product.stock_minimo) return 'Bajo Stock'
      return 'En Stock'
    },

    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.nombre : 'Sin categoría'
    },

    getUnitName(unitId) {
      const unit = this.units.find(u => u.id === unitId)
      return unit ? unit.nombre : 'unidad'
    },

    formatCurrency(value) {
      if (!value) return '0.00'
      return value.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    
    editProduct(product) {
      this.selectedMateriaPrima = { ...product }
      this.showEditModal = true
    },
    
    handleMateriaPrimaCreated(newMateriaPrima) {
      this.fetchProducts()
      this.showAddModal = false
      this.showNotification('Materia prima creada correctamente', 'success')
    },
    
    handleMateriaPrimaUpdated(updatedMateriaPrima) {
      this.fetchProducts()
      this.showEditModal = false
      this.showNotification('Materia prima actualizada correctamente', 'success')
    },
    
    confirmDelete(product) {
      this.productToDelete = product
      this.showConfirmModal = true
    },
    
    async deleteProduct() {
      if (!this.productToDelete) return
      
      try {
        await axios.delete(`/MateriaPrima/${this.productToDelete.id}`)
        await this.fetchProducts()
        this.showConfirmModal = false
        this.productToDelete = null
        this.filterProducts()
        this.showNotification('Materia prima eliminada correctamente', 'success')
      } catch (error) {
        this.error = 'Error al eliminar el producto: ' + error.message
        console.error('Error deleting product:', error)
        this.showNotification('Error al eliminar la materia prima', 'error')
      }
    },
    
    viewDetails(product) {
      this.selectedProduct = product
      this.showDetailsModal = true
    },

    showNotification(message, type) {
      // Implementar sistema de notificaciones o usar el que tengas disponible
      console.log(`${type.toUpperCase()}: ${message}`)
      // Si tienes $notify disponible:
      // this.$notify({ title: type === 'success' ? 'Éxito' : 'Error', message, type })
    },
    
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    
    goToPage(page) {
      if (page !== '...') {
        this.currentPage = page
      }
    }
  }
}
</script>

<style scoped>
.inventory-content {
  padding: 20px;
}

.inventory-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.action-buttons {
  margin-bottom: 20px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-outline:hover {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.loading-spinner {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.inventory-table th,
.inventory-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.inventory-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #e9ecef;
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

.text-warning {
  color: #856404;
}

.text-danger {
  color: #721c24;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-ok {
  background-color: #d4edda;
  color: #155724;
}

.status-low {
  background-color: #fff3cd;
  color: #856404;
}

.status-out {
  background-color: #f8d7da;
  color: #721c24;
}

.actions-cell {
  white-space: nowrap;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px;
  margin: 0 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #f8f9fa;
}

.material-icons {
  font-size: 18px;
}

.no-products {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 20px 0;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.pagination-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  text-align: center;
  color: #666;
  font-size: 14px;
}

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
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
}

.confirm-modal {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
}

.confirm-modal h3 {
  margin-top: 0;
  color: #721c24;
}

.warning-text {
  color: #856404;
  font-size: 14px;
  font-style: italic;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.product-details {
  padding: 20px;
}

.detail-row {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}
</style>