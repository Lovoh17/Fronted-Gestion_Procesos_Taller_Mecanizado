<template>
  <div > 
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

  <!-- Nuevo Filtro por Tipo de Inventario -->
  <div class="filter-group">
    <label for="inventory-type-filter">Tipo de Inventario:</label>
    <select 
      id="inventory-type-filter"
      v-model="inventoryTypeFilter" 
      @change="filterProducts"
      class="filter-select"
    >
      <option value="">Todos</option>
      <option value="general">General</option>
      <option value="interno">Trabajos Internos</option>
      <option value="externo">Trabajos Externos</option>
      <option value="practicas">Prácticas</option>
    </select>
  </div>
</div>
        
        <!-- Tabla de productos -->
        <div class="table-responsive">
          <table class="inventory-table">
            <thead>
              <tr>
                <th @click="sortBy('code')">
                  Código
                  <span class="sort-icon" v-if="sortKey === 'code'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="sortBy('name')">
                  Nombre
                  <span class="sort-icon" v-if="sortKey === 'name'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Categoría</th>
                <th @click="sortBy('stock')">
                  Stock
                  <span class="sort-icon" v-if="sortKey === 'stock'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="sortBy('price')">
                  Precio
                  <span class="sort-icon" v-if="sortKey === 'price'">
                    {{ sortOrder === 1 ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.category }}</td>
                <td :class="{
                  'text-warning': product.stock < product.min_stock && product.stock > 0,
                  'text-danger': product.stock === 0
                }">
                  {{ product.stock }} {{ product.unit }}
                </td>
                <td>${{ product.price.toLocaleString() }}</td>
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
            v-for="page in totalPages" 
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
      </div>
      
      <!-- Modal para agregar/editar -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingProduct ? 'Editar Producto' : 'Agregar Producto' }}</h3>
            <button @click="closeModal" class="btn-icon">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form @submit.prevent="saveProduct" class="modal-form">
            <div class="form-group">
              <label>Código</label>
              <input v-model="form.code" type="text" required>
            </div>
            
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="form.name" type="text" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Categoría</label>
                <select v-model="form.category" required>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Unidad de medida</label>
                <select v-model="form.unit" required>
                  <option value="unidades">Unidades</option>
                  <option value="litros">Litros</option>
                  <option value="kg">Kilogramos</option>
                  <option value="metros">Metros</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Stock actual</label>
                <input v-model.number="form.stock" type="number" min="0" required>
              </div>
              
              <div class="form-group">
                <label>Stock mínimo</label>
                <input v-model.number="form.min_stock" type="number" min="0" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Precio unitario</label>
                <input v-model.number="form.price" type="number" min="0" step="0.01" required>
              </div>
              
              <div class="form-group">
                <label>Proveedor</label>
                <input v-model="form.supplier" type="text">
              </div>
            </div>
            
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="form.description"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-outline">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingProduct ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Modal de confirmación -->
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="confirm-modal">
          <h3>Confirmar Eliminación</h3>
          <p>¿Estás seguro de eliminar el producto "{{ productToDelete?.name }}"?</p>
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
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/GlobalComponents/Sidebar.vue'
import TopBar from '@/components/GlobalComponents/TopBar.vue'

export default {
  name: 'InventoryView',
  components: {
    Sidebar,
    TopBar
  },
  data() {
    return {
      products: [
        {
          id: 1,
          code: '',
          name: '"',
          category: '',
          stock: 0,
          min_stock: 0,
          unit: 'unidades',
          price: 0,
          supplier: '',
          description: ''
        },
      
      ],
      categories: [''],
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      filteredProducts: [],
      sortKey: 'code',
      sortOrder: 1,
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      showConfirmModal: false,
      editingProduct: null,
      productToDelete: null,
      form: {
        code: '',
        name: '',
        category: '',
        stock: 0,
        min_stock: 0,
        unit: 'unidades',
        price: 0,
        supplier: '',
        description: ''
      }
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
    }
  },
  created() {
    this.filterProducts()
  },
  methods: {
    handleSearch(query) {
      this.searchQuery = query
      this.filterProducts()
    },
    
    filterProducts() {
      this.filteredProducts = this.products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                            product.code.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter
        const matchesStatus = this.matchesStatusFilter(product)
        
        return matchesSearch && matchesCategory && matchesStatus
      })
      
      this.sortProducts()
      this.currentPage = 1
    },
    
    matchesStatusFilter(product) {
      if (!this.statusFilter) return true
      
      switch(this.statusFilter) {
        case 'in_stock': return product.stock >= product.min_stock
        case 'low_stock': return product.stock < product.min_stock && product.stock > 0
        case 'out_of_stock': return product.stock === 0
        default: return true
      }
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
        if (a[this.sortKey] < b[this.sortKey]) return -1 * this.sortOrder
        if (a[this.sortKey] > b[this.sortKey]) return 1 * this.sortOrder
        return 0
      })
    },
    
    getStatusClass(product) {
      if (product.stock === 0) return 'status-out'
      if (product.stock < product.min_stock) return 'status-low'
      return 'status-ok'
    },
    
    getStatusText(product) {
      if (product.stock === 0) return 'Agotado'
      if (product.stock < product.min_stock) return 'Bajo Stock'
      return 'En Stock'
    },
    
    openAddModal() {
      this.editingProduct = null
      this.resetForm()
      this.showModal = true
    },
    
    editProduct(product) {
      this.editingProduct = product
      this.form = { ...product }
      this.showModal = true
    },
    
    saveProduct() {
      if (this.editingProduct) {
        const index = this.products.findIndex(p => p.id === this.editingProduct.id)
        this.products.splice(index, 1, { ...this.form, id: this.editingProduct.id })
      } else {
        const newId = Math.max(...this.products.map(p => p.id), 0) + 1
        this.products.push({ ...this.form, id: newId })
      }
      
      this.closeModal()
      this.filterProducts()
    },
    
    confirmDelete(product) {
      this.productToDelete = product
      this.showConfirmModal = true
    },
    
    deleteProduct() {
      this.products = this.products.filter(p => p.id !== this.productToDelete.id)
      this.showConfirmModal = false
      this.filterProducts()
    },
    
    viewDetails(product) {
      console.log('Ver detalles:', product)
      alert(`Detalles de ${product.name}\nCódigo: ${product.code}\nStock: ${product.stock} ${product.unit}\nPrecio: $${product.price}`)
    },
    
    resetForm() {
      this.form = {
        code: '',
        name: '',
        category: '',
        stock: 0,
        min_stock: 0,
        unit: 'unidades',
        price: 0,
        supplier: '',
        description: ''
      }
    },
    
    closeModal() {
      this.showModal = false
    },
    
    prevPage() {
      if (this.currentPage > 1) this.currentPage--
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },
    
    goToPage(page) {
      this.currentPage = page
    }
  }
}
</script>