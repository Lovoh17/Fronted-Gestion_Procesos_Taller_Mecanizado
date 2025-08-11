import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'MantenimientoList',
  setup() {
    // Estados reactivos
    const mantenimientos = ref([])
    const loading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    
    // Datos relacionados
    const tiposMantenimiento = ref({})
    const herramientas = ref({})
    const estadosMantenimiento = ref({})
    
    // Modal states
    const showModal = ref(false)
    const showAddMantenimientoModal = ref(false)
    const currentMantenimiento = ref(getEmptyMantenimiento())
    const modalMode = ref('create')

    // Configuración de columnas para vue-good-table-next
    const tableColumns = ref([
      {
        label: 'Nombre',
        field: 'nombre',
        sortable: true,
        width: '200px',
        type: 'text'
      },
      {
        label: 'Herramienta',
        field: 'herramienta_id',
        sortable: true,
        width: '180px',
        type: 'text'
      },
      {
        label: 'Tipo',
        field: 'tipo_mantenimiento_id',
        sortable: true,
        width: '150px',
        type: 'text'
      },
      {
        label: 'Fecha Programada',
        field: 'fecha_programada',
        sortable: true,
        width: '150px',
        type: 'date',
        dateInputFormat: 'yyyy-MM-dd',
        dateOutputFormat: 'dd/MM/yyyy'
      },
      {
        label: 'Estado',
        field: 'estado_id',
        sortable: true,
        width: '120px',
        type: 'text'
      },
      {
        label: 'Acciones',
        field: 'actions',
        sortable: false,
        width: '120px',
        type: 'text'
      }
    ])

    // Funciones auxiliares
    function getEmptyMantenimiento() {
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
    }

    function arrayToMap(array) {
      if (!Array.isArray(array)) return {}
      return array.reduce((map, item) => {
        map[item.id] = item
        return map
      }, {})
    }

    // Métodos auxiliares para mostrar datos relacionados
    const getTipoMantenimientoName = (id) => {
      return tiposMantenimiento.value[id]?.nombre || 'Desconocido'
    }

    const getHerramientaName = (id) => {
      return herramientas.value[id]?.nombre || 'Desconocida'
    }

    const getEstadoName = (id) => {
      return estadosMantenimiento.value[id]?.nombre || 'Desconocido'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'PEN'
      }).format(value)
    }

    // Métodos para las clases de badges
    const tipoMantenimientoClass = (tipoId) => {
      const classMap = {
        1: 'badge-primary',    // Preventivo
        2: 'badge-warning',    // Correctivo  
        3: 'badge-info',       // Predictivo
      }
      return classMap[tipoId] || 'badge-secondary'
    }

    const estadoClass = (estadoId) => {
      const classMap = {
        1: 'badge-success',    // Completado
        2: 'badge-warning',    // Pendiente
        3: 'badge-danger',     // Vencido
        4: 'badge-info',       // En Proceso
      }
      return classMap[estadoId] || 'badge-secondary'
    }

    // Métodos de API
    const fetchMantenimientos = async () => {
      try {
        const response = await axios.get('/api/Mantenimiento')
        // Asegurar que siempre sea un array
        mantenimientos.value = Array.isArray(response.data) ? response.data : []
      } catch (err) {
        console.error('Error fetching mantenimientos:', err)
        mantenimientos.value = []
        throw err
      }
    }

    const fetchTiposMantenimiento = async () => {
      try {
        const response = await axios.get('/api/Tipo_Mantenimiento')
        tiposMantenimiento.value = arrayToMap(response.data)
      } catch (err) {
        console.error('Error fetching tipos mantenimiento:', err)
        tiposMantenimiento.value = {}
        throw err
      }
    }

    const fetchHerramientas = async () => {
      try {
        const response = await axios.get('/api/Herramienta')
        herramientas.value = arrayToMap(response.data)
      } catch (err) {
        console.error('Error fetching herramientas:', err)
        herramientas.value = {}
        throw err
      }
    }

    const fetchEstadosMantenimiento = async () => {
      try {
        const response = await axios.get('/api/EstadoMantenimiento')
        estadosMantenimiento.value = arrayToMap(response.data)
      } catch (err) {
        console.error('Error fetching estados:', err)
        estadosMantenimiento.value = {}
        throw err
      }
    }

    const loadAllData = async () => {
      loading.value = true
      error.value = null
      
      try {
        await Promise.all([
          fetchMantenimientos(),
          fetchTiposMantenimiento(),
          fetchHerramientas(),
          fetchEstadosMantenimiento()
        ])
      } catch (err) {
        console.error('Error al cargar datos:', err)
        error.value = 'Error al cargar los datos'
      } finally {
        loading.value = false
      }
    }

    const loadMantenimientos = async () => {
      await loadAllData()
    }

    // Métodos CRUD
    const openCreateModal = () => {
      currentMantenimiento.value = getEmptyMantenimiento()
      modalMode.value = 'create'
      showModal.value = true
    }

    const openEditModal = (mantenimiento) => {
      currentMantenimiento.value = { ...mantenimiento }
      modalMode.value = 'edit'
      showModal.value = true
    }

    const saveMantenimiento = async () => {
      try {
        if (modalMode.value === 'create') {
          await axios.post('/api/Mantenimiento', currentMantenimiento.value)
        } else {
          await axios.put(`/api/Mantenimiento/${currentMantenimiento.value.id}`, currentMantenimiento.value)
        }
        showModal.value = false
        await fetchMantenimientos()
      } catch (err) {
        console.error('Error al guardar mantenimiento:', err)
        error.value = 'Error al guardar el mantenimiento'
      }
    }

    const deleteMantenimiento = async (id) => {
      if (confirm('¿Está seguro de eliminar este mantenimiento?')) {
        try {
          await axios.delete(`/api/Mantenimiento/${id}`)
          await fetchMantenimientos()
        } catch (err) {
          console.error('Error al eliminar mantenimiento:', err)
          error.value = 'Error al eliminar el mantenimiento'
        }
      }
    }

    // Métodos adicionales para la tabla
    const exportToCSV = () => {
      const csvData = mantenimientos.value.map(m => ({
        Nombre: m.nombre,
        Herramienta: getHerramientaName(m.herramienta_id),
        Tipo: getTipoMantenimientoName(m.tipo_mantenimiento_id),
        'Fecha Programada': formatDate(m.fecha_programada),
        Estado: getEstadoName(m.estado_id)
      }))
      
      console.log('Exportando CSV:', csvData)
      // Aquí implementarías la lógica de exportación real
    }

    const testConnection = () => {
      console.log('Probando conexión...')
      // Implementar test de conexión
    }

    // Lifecycle
    onMounted(() => {
      loadAllData()
    })

    // Return para el template
    return {
      // Estados
      mantenimientos,
      loading,
      error,
      searchQuery,
      
      // Datos relacionados
      tiposMantenimiento,
      herramientas,
      estadosMantenimiento,
      
      // Modal
      showModal,
      showAddMantenimientoModal,
      currentMantenimiento,
      modalMode,
      
      // Configuración tabla
      tableColumns,
      
      // Métodos auxiliares
      getTipoMantenimientoName,
      getHerramientaName,
      getEstadoName,
      formatDate,
      formatCurrency,
      tipoMantenimientoClass,
      estadoClass,
      
      // Métodos CRUD
      openCreateModal,
      openEditModal,
      saveMantenimiento,
      deleteMantenimiento,
      
      // Métodos tabla
      loadMantenimientos,
      exportToCSV,
      testConnection
    }
  }
}