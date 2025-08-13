import api from '@/api.js'
import ProductDetailsModal from './ProductDetailsModal.vue'

export default {
  name: 'ProductInventory',
  components: {
    ProductDetailsModal
  },
  data() {
    return {
      products: [],
      materialTypes: [], // Tipos de materia prima desde la API
      searchQuery: '',
      sortField: 'codigo',
      sortOrder: 'asc',
      showFilters: true,
      currentPage: 1,
      itemsPerPage: 25,
      loading: false,
      error: null,

      // Modal de detalles del producto
      showProductModal: false,
      selectedProduct: null,

      // Filtros
      filters: {
        search: '',
        stockStatus: '', // available, low, out
        priceMin: null,
        priceMax: null,
        unit: '',
        supplier: '',
        materialType: '' // Nuevo filtro para tipo de materia prima
      },

      units: {
        1: { nombre: 'metros', abreviatura: 'm' },
        2: { nombre: 'litros', abreviatura: 'l' },
        3: { nombre: 'kilogramos', abreviatura: 'kg' }
      },

      // Configuración de columnas para vue-good-table
      tableColumns: [
        {
          label: 'Código',
          field: 'codigo',
          type: 'string',
          sortable: true,
          width: '120px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por código'
          }
        },
        {
          label: 'Nombre',
          field: 'nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por nombre'
          }
        },
        {
          label: 'Tipo',
          field: 'tipo_materia_prima',
          type: 'string',
          sortable: true,
          width: '150px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por tipo'
          }
        },
        {
          label: 'Stock',
          field: 'stock_display',
          type: 'string',
          sortable: true,
          width: '120px',
          sortFn: (x, y, col, rowX, rowY) => {
            // Ordenar por el valor numérico de stock
            return Number(rowX.stock_total) - Number(rowY.stock_total)
          }
        },
        {
          label: 'Precio',
          field: 'precio_display',
          type: 'string',
          sortable: true,
          width: '100px',
          sortFn: (x, y, col, rowX, rowY) => {
            // Ordenar por el valor numérico de precio
            return Number(rowX.costo_unitario) - Number(rowY.costo_unitario)
          }
        },
        {
          label: 'Proveedor',
          field: 'proveedor_principal',
          type: 'string',
          sortable: true,
          width: '150px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por proveedor'
          }
        },
        {
          label: 'Controlado',
          field: 'es_controlado_display',
          type: 'string',
          sortable: true,
          width: '110px',
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Controlado', text: 'Controlado' },
              { value: 'No Controlado', text: 'No Controlado' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos'
          }
        },
        {
          label: 'Permite Fracción',
          field: 'permite_fraccion_display',
          type: 'string',
          sortable: true,
          width: '130px',
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Sí', text: 'Sí' },
              { value: 'No', text: 'No' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos'
          }
        },
        {
          label: 'Estado',
          field: 'estado_display',
          type: 'string',
          sortable: true,
          width: '100px',
          sortFn: (x, y, col, rowX, rowY) => {
            // Ordenar por estado: disponible < bajo stock < agotado
            const statusOrder = { 'available': 0, 'low': 1, 'out': 2 }
            const statusA = this.getProductStatus(rowX)
            const statusB = this.getProductStatus(rowY)
            return statusOrder[statusA] - statusOrder[statusB]
          },
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Disponible', text: 'Disponible' },
              { value: 'Bajo stock', text: 'Bajo stock' },
              { value: 'Agotado', text: 'Agotado' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Acciones',
          field: 'actions',
          type: 'string',
          sortable: false,
          width: '80px',
          thClass: 'text-center',
          tdClass: 'text-center'
        }
      ]
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

      // Filtro por tipo de materia prima
      if (this.filters.materialType) {
        filtered = filtered.filter(product =>
          product.tipo_materia_prima_id == this.filters.materialType
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
        this.filters.supplier ||
        this.filters.materialType
    },

    // Contar filtros activos
    activeFiltersCount() {
      let count = 0
      if (this.filters.search) count++
      if (this.filters.stockStatus) count++
      if (this.filters.priceMin !== null && this.filters.priceMin !== '') count++
      if (this.filters.priceMax !== null && this.filters.priceMax !== '') count++
      if (this.filters.unit) count++
      if (this.filters.supplier) count++
      if (this.filters.materialType) count++
      return count
    },

    // Verificar si el usuario puede editar productos
    canEditProduct() {
      // Aquí puedes agregar lógica de permisos
      return true // Por ahora permitir siempre
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
    await Promise.all([
      this.fetchProducts(),
      this.fetchMaterialTypes()
    ])
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      try {
        this.products = await api.get('/MateriaPrima')
        console.log('Productos cargados:', this.products.length)
      } catch (error) {
        console.error('Error al cargar productos:', error)
        this.error = error
        this.showToast('Error al cargar productos', 'error')
      } finally {
        this.loading = false
      }
    },

    async fetchMaterialTypes() {
      try {
        this.materialTypes = await api.get('/Tipo_Materia_Prima')
        console.log('Tipos de materia prima cargados:', this.materialTypes.length)
      } catch (error) {
        console.error('Error al cargar tipos de materia prima:', error)
        this.showToast('Error al cargar tipos de materia prima', 'error')
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

    applyFilters() {
      // Combina los filtros del panel con la búsqueda de vue-good-table
      this.searchQuery = this.filters.search
      this.currentPage = 1
      console.log('Filtros aplicados:', this.filters)
    },

    resetFilters() {
      this.filters = {
        search: '',
        stockStatus: '',
        priceMin: null,
        priceMax: null,
        unit: '',
        supplier: '',
        materialType: ''
      }
      this.searchQuery = ''
      this.currentPage = 1
      console.log('Filtros reseteados')
    },

    clearFilters() {
      this.filters = {
        search: '',
        stockStatus: '',
        priceMin: null,
        priceMax: null,
        unit: '',
        supplier: '',
        materialType: ''
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
    },

    // Método para exportar tabla a CSV usando vue-good-table
    exportToCSV() {
      try {
        if (this.$refs.vueGoodTable) {
          const fileName = `inventario_productos_${new Date().toISOString().split('T')[0]}.csv`
          this.$refs.vueGoodTable.exportCsv(fileName)
          this.showToast('Tabla exportada exitosamente', 'success')
        } else {
          this.showToast('Error al exportar: tabla no encontrada', 'error')
        }
      } catch (error) {
        console.error('Error exportando CSV:', error)
        this.showToast('Error al exportar tabla', 'error')
      }
    },

    // Obtener nombre del tipo de materia prima
    getMaterialTypeName(typeId) {
      const type = this.materialTypes.find(t => t.id == typeId)
      return type ? type.nombre : 'N/A'
    },

    // Helper para mostrar notificaciones
    showToast(message, type = 'success') {
      // Implementa según tu librería de notificaciones
      console.log(`${type.toUpperCase()}: ${message}`)
      // Si tienes una librería de notificaciones como va-toast, úsala aquí
      // Ejemplo: this.$vaToast.init({ message, color: type })
    },

    // =========== MÉTODOS DEL MODAL ===========

    // Abrir modal con detalles del producto
    openProductModal(product) {
      console.log('Abriendo modal para producto:', product)
      this.selectedProduct = { ...product } // Crear una copia para evitar mutaciones
      this.showProductModal = true
    },

    // Cerrar modal de detalles
    closeProductModal() {
      console.log('Cerrando modal')
      this.showProductModal = false
      this.selectedProduct = null
    },

    // Editar producto (placeholder)
    editProduct() {
      if (this.selectedProduct) {
        this.showToast(`Editando producto: ${this.selectedProduct.nombre}`, 'info')
        // Aquí puedes agregar la lógica para abrir un modal de edición
        // o navegar a una página de edición
        this.closeProductModal()
      }
    },

    // =========== MÉTODOS DE GESTIÓN DE INVENTARIO ===========

    // Manejar actualización de stock desde el modal
    async handleStockUpdate(updateData) {
      const { action, quantity, reason, product, transactionData } = updateData
      
      try {
        // Aquí implementarías la llamada a la API para actualizar el stock
        // Por ahora simularemos la actualización
        
        console.log('Actualizando stock:', updateData)
        
        // Simular llamada a API
        await this.updateProductStock(product.id, transactionData)
        
        // Actualizar el producto localmente
        const productIndex = this.products.findIndex(p => p.id === product.id)
        if (productIndex !== -1) {
          const newStock = action === 'add' 
            ? Number(product.stock_total) + quantity
            : Number(product.stock_total) - quantity
            
          this.products[productIndex].stock_total = newStock
          
          // Actualizar el producto seleccionado si es el mismo
          if (this.selectedProduct && this.selectedProduct.id === product.id) {
            this.selectedProduct.stock_total = newStock
          }
        }
        
        // Mostrar mensaje de éxito
        const actionText = action === 'add' ? 'agregado' : 'reducido'
        this.showToast(`Stock ${actionText} correctamente`, 'success')
        
      } catch (error) {
        console.error('Error al actualizar stock:', error)
        this.showToast('Error al actualizar el stock', 'error')
      }
    },

    // API call para actualizar stock (implementar según tu backend)
    async updateProductStock(productId, transactionData) {
      try {
        // Ejemplo de llamada a API
        // const response = await api.post('/inventory/transaction', transactionData)
        // return response.data
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Transacción de inventario procesada:', transactionData)
        return { success: true }
      } catch (error) {
        console.error('Error en API de inventario:', error)
        throw error
      }
    },

    // Mostrar notificación toast
    showToast(message, type = 'success') {
      // Implementar según tu sistema de notificaciones
      console.log(`${type.toUpperCase()}: ${message}`)
      
      // Si usas Vuestic toast:
      // this.$vaToast.init({ message, color: type })
      
      // Si usas otra librería como vue-toasted:
      // this.$toast.show(message, { type })
      
      // Por ahora solo mostrar en consola
      if (type === 'success') {
        console.log('✅', message)
      } else if (type === 'error') {
        console.error('❌', message)
      } else if (type === 'warning') {
        console.warn('⚠️', message)
      } else {
        console.info('ℹ️', message)
      }
    }
  }
}
