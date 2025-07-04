<template>
  <div class="container">
    <!-- Encabezado y controles -->
    <div class="header">
      <h2>Gestión de Mantenimientos</h2>
      <div class="controls">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar mantenimientos..."
          class="search-input"
        >
        <button @click="openCreateModal" class="btn primary">
          Nuevo Mantenimiento
        </button>
      </div>
    </div>

    <!-- Estado de carga/error -->
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Tabla de mantenimientos -->
    <table v-if="!loading && !error">
      <thead>
        <tr>
          <th @click="sortBy('nombre')">
            Nombre <SortIcon :direction="sortDirection('nombre')" />
          </th>
          <th @click="sortBy('herramienta_id')">
            Herramienta <SortIcon :direction="sortDirection('herramienta_id')" />
          </th>
          <th @click="sortBy('tipo_mantenimiento_id')">
            Tipo <SortIcon :direction="sortDirection('tipo_mantenimiento_id')" />
          </th>
          <th @click="sortBy('fecha_programada')">
            Fecha Programada <SortIcon :direction="sortDirection('fecha_programada')" />
          </th>
          <th @click="sortBy('estado_id')">
            Estado <SortIcon :direction="sortDirection('estado_id')" />
          </th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filteredMantenimientos" :key="m.id">
          <td>{{ m.nombre }}</td>
          <td>{{ getHerramientaName(m.herramienta_id) }}</td>
          <td>{{ getTipoMantenimientoName(m.tipo_mantenimiento_id) }}</td>
          <td>{{ formatDate(m.fecha_programada) }}</td>
          <td>{{ getEstadoName(m.estado_id) }}</td>
          <td class="actions">
            <button @click="openEditModal(m)" class="btn small">Editar</button>
            <button @click="deleteMantenimiento(m.id)" class="btn small danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal para crear/editar -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalMode === 'create' ? 'Nuevo' : 'Editar' }} Mantenimiento</h3>
        
        <form @submit.prevent="saveMantenimiento">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="currentMantenimiento.nombre" required>
          </div>
          
          <div class="form-group">
            <label>Herramienta:</label>
            <select v-model="currentMantenimiento.herramienta_id" required>
              <option v-for="(h, id) in herramientas" :key="id" :value="id">
                {{ h.nombre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Tipo de Mantenimiento:</label>
            <select v-model="currentMantenimiento.tipo_mantenimiento_id" required>
              <option v-for="(t, id) in tiposMantenimiento" :key="id" :value="id">
                {{ t.nombre }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Fecha Programada:</label>
            <input type="date" v-model="currentMantenimiento.fecha_programada" required>
          </div>
          
          <div class="form-group">
            <label>Descripción del Problema:</label>
            <textarea v-model="currentMantenimiento.descripcion_problema"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showModal = false" class="btn secondary">
              Cancelar
            </button>
            <button type="submit" class="btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import SortIcon from '@/components/VistasAdmin/ComponentesAdmin/SortIcon.vue'
import axios from 'axios'

export default {
  name: 'MantenimientoList',
  components: {
    SortIcon
  },
  data() {
    return {
      mantenimientos: [],
      sortField: 'fecha_programada',
      sortOrder: 'asc',
      loading: false,
      error: null,
      
      // Datos relacionados
      tiposMantenimiento: {},
      herramientas: {},
      estadosMantenimiento: {},
      
      // Para el formulario/modal
      showModal: false,
      currentMantenimiento: this.getEmptyMantenimiento(),
      modalMode: 'create',
      searchQuery: ''
    }
  },
  
  computed: {
    sortedMantenimientos() {
      return [...this.mantenimientos].sort((a, b) => {
        let valA = a[this.sortField]
        let valB = b[this.sortField]

        // Convertir fechas a timestamps para comparación
        if (this.sortField.includes('fecha')) {
          valA = new Date(valA).getTime()
          valB = new Date(valB).getTime()
        }

        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },
    filteredMantenimientos() {
      if (!this.searchQuery) return this.sortedMantenimientos
      
      const query = this.searchQuery.toLowerCase()
      return this.sortedMantenimientos.filter(m => {
        return (
          m.nombre.toLowerCase().includes(query) ||
          (m.descripcion_problema && m.descripcion_problema.toLowerCase().includes(query)) ||
          (this.getHerramientaName(m.herramienta_id) && this.getHerramientaName(m.herramienta_id).toLowerCase().includes(query))
        )
      })
    }
  },
  async created() {
    await this.loadAllData()
  },
  methods: {
    getEmptyMantenimiento() {
      return {
        id: null,
        nombre: '',
        herramienta_id: null,
        tipo_mantenimiento_id: null,
        fecha_programada: new Date().toISOString().split('T')[0],
        fecha_inicio: null,
        fecha_fin: null,
        estado_id: 1,
        costo_estimado: 0,
        costo_real: 0,
        descripcion_problema: '',
        acciones_realizadas: '',
        repuestos_utilizados: [],
        horas_trabajo: 0
      }
    },
    
    async loadAllData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchMantenimientos(),
          this.fetchTiposMantenimiento(),
          this.fetchHerramientas(),
          this.fetchEstadosMantenimiento()
        ])
      } catch (error) {
        console.error('Error al cargar datos:', error)
        this.error = 'Error al cargar los datos'
      } finally {
        this.loading = false
      }
    },
    
    async fetchMantenimientos() {
      const response = await axios.get('/api/Mantenimiento')
      this.mantenimientos = response.data
    },
    
    async fetchTiposMantenimiento() {
      const response = await axios.get('/api/Tipo_Mantenimiento')
      this.tiposMantenimiento = this.arrayToMap(response.data)
    },
    
    async fetchHerramientas() {
      const response = await axios.get('/api/Herramienta')
      this.herramientas = this.arrayToMap(response.data)
    },
    
    async fetchEstadosMantenimiento() {
      const response = await axios.get('/api/EstadoMantenimiento')
      this.estadosMantenimiento = this.arrayToMap(response.data)
    },
    
    arrayToMap(array) {
      return array.reduce((map, item) => {
        map[item.id] = item
        return map
      }, {})
    },
    
    // Métodos auxiliares para mostrar datos relacionados
    getTipoMantenimientoName(id) {
      return this.tiposMantenimiento[id]?.nombre || 'Desconocido'
    },
    
    getHerramientaName(id) {
      return this.herramientas[id]?.nombre || 'Desconocida'
    },
    
    getEstadoName(id) {
      return this.estadosMantenimiento[id]?.nombre || 'Desconocido'
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    },
    
    formatCurrency(value) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'PEN'
      }).format(value)
    },
    
    // Métodos para el CRUD
    openCreateModal() {
      this.currentMantenimiento = this.getEmptyMantenimiento()
      this.modalMode = 'create'
      this.showModal = true
    },
    
    openEditModal(mantenimiento) {
      this.currentMantenimiento = { ...mantenimiento }
      this.modalMode = 'edit'
      this.showModal = true
    },
    
    async saveMantenimiento() {
      try {
        if (this.modalMode === 'create') {
          await axios.post('/api/Mantenimiento', this.currentMantenimiento)
        } else {
          await axios.put(`/api/Mantenimiento/${this.currentMantenimiento.id}`, this.currentMantenimiento)
        }
        this.showModal = false
        await this.fetchMantenimientos()
      } catch (error) {
        console.error('Error al guardar mantenimiento:', error)
        this.error = 'Error al guardar el mantenimiento',error
      }
    },
    
    async deleteMantenimiento(id) {
      if (confirm('¿Está seguro de eliminar este mantenimiento?')) {
        try {
          await axios.delete(`/api/Mantenimiento/${id}`)
          await this.fetchMantenimientos()
        } catch (error) {
          console.error('Error al eliminar mantenimiento:', error)
          this.error = 'Error al eliminar el mantenimiento'
        }
      }
    },
    
    // Métodos para ordenamiento
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
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 250px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  cursor: pointer;
  user-select: none;
}

th:hover {
  background-color: #eee;
}

.actions {
  display: flex;
  gap: 5px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn.primary {
  background-color: #42b983;
  color: white;
}

.btn.secondary {
  background-color: #f0f0f0;
}

.btn.danger {
  background-color: #ff4444;
  color: white;
}

.btn.small {
  padding: 5px 10px;
  font-size: 0.8em;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error {
  padding: 20px;
  text-align: center;
  color: #ff4444;
  background-color: #ffeeee;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>