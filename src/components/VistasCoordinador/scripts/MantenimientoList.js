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
        this.error = 'Error al guardar el mantenimiento'
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