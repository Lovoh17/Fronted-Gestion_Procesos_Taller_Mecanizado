<template>
  <div>
    <main>
      <div class="inventory-content">
        <h2 class="title">Inventario de Materia Prima</h2>
        
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
              <tr v-for="product in sortedProducts" :key="product.id">
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

        <!-- Total de items -->
        <div class="total-items">
          Mostrando {{ sortedProducts.length }} items
        </div>
      </div>
    </main>
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
      units: {
        1: { nombre: 'metros', abreviatura: 'm' },
        2: { nombre: 'litros', abreviatura: 'l' },
        3: { nombre: 'kilogramos', abreviatura: 'kg' }
      }
    }
  },
  computed: {
    sortedProducts() {
      return [...this.products].sort((a, b) => {
        let valA = a[this.sortField]
        let valB = b[this.sortField]

        // Convertir a número si es posible
        if (!isNaN(valA)) valA = Number(valA)
        if (!isNaN(valB)) valB = Number(valB)

        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
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

/* Estilos para niveles de stock */
.in-stock {
  color: #2e7d32;
}

.low-stock {
  color: #ff8f00;
}

.out-of-stock {
  color: #c62828;
}

.total-items {
  text-align: right;
  color: #666;
  font-size: 0.9rem;
  margin-top: 10px;
}
</style>