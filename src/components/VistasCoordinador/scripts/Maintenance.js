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
    const prioridades = ref({})
    
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
        type: 'text',
        filterOptions: {
          enabled: true,
          placeholder: 'Filtrar por nombre'
        }
      },
      {
        label: 'Herramienta',
        field: 'herramienta_nombre',
        sortable: true,
        width: '180px',
        type: 'text',
        filterOptions: {
          enabled: true,
          placeholder: 'Filtrar por herramienta'
        }
      },
      {
        label: 'Tipo',
        field: 'tipo_mantenimiento_nombre',
        sortable: true,
        width: '150px',
        type: 'text'
      },
      {
        label: 'Técnico',
        field: 'tecnico_nombre',
        sortable: true,
        width: '150px',
        type: 'text'
      },
      {
        label: 'F. Programada',
        field: 'fecha_programada',
        sortable: true,
        width: '130px',
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
        label: 'Prioridad',
        field: 'prioridad_nombre',
        sortable: true,
        width: '100px',
        type: 'text'
      },
      {
        label: 'Costo Est.',
        field: 'costo_estimado',
        sortable: true,
        width: '110px',
        type: 'number'
      },
      {
        label: 'Horas',
        field: 'horas_trabajo',
        sortable: true,
        width: '80px',
        type: 'number'
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
      return estadosMantenimiento.value[id]?.nombre_estado || 'Desconocido'
    }

    const getPrioridadName = (id) => {
      const prioridadMap = {
        1: 'Crítica',
        2: 'Alta', 
        3: 'Media',
        4: 'Baja',
        5: 'Muy Baja'
      }
      return prioridadMap[id] || 'Media'
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
        1: 'badge-warning',    // Pendiente
        2: 'badge-info',       // En Proceso
        3: 'badge-success',    // Completado
        4: 'badge-danger',     // Cancelado
        5: 'badge-secondary'   // Reprogramado
      }
      return classMap[estadoId] || 'badge-secondary'
    }

    const prioridadClass = (prioridadId) => {
      const classMap = {
        1: 'badge-danger',     // Crítica
        2: 'badge-warning',    // Alta
        3: 'badge-info',       // Media
        4: 'badge-secondary',  // Baja
        5: 'badge-light'       // Muy Baja
      }
      return classMap[prioridadId] || 'badge-info'
    }

    // Métodos de API
    const fetchMantenimientos = async () => {
      try {
        const response = await axios.get('/api/Mantenimiento')
        const rawData = Array.isArray(response.data) ? response.data : []
        
        // Transformar datos y enriquecer con nombres
        mantenimientos.value = await Promise.all(rawData.map(async (item) => {
          return {
            ...item,
            // Resolver nombres desde IDs
            herramienta_nombre: await resolveHerramienta(item.herramienta_id),
            tipo_mantenimiento_nombre: await resolveTipoMantenimiento(item.tipo_mantenimiento_id),
            tecnico_nombre: await resolveUsuario(item.tecnico_asignado_id),
            prioridad_nombre: getPrioridadName(item.prioridad_id),
            // Formatear números
            costo_estimado: parseFloat(item.costo_estimado) || 0,
            costo_real: parseFloat(item.costo_real) || 0,
            horas_trabajo: parseFloat(item.horas_trabajo) || 0,
            // Manejar arrays
            repuestos_utilizados: Array.isArray(item.repuestos_utilizados) ? item.repuestos_utilizados : []
          }
        }))
      } catch (err) {
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
        estadosMantenimiento.value = {}
        throw err
      }
    }

    // Métodos de resolución de nombres
    const resolveHerramienta = async (herramientaId) => {
      if (!herramientaId) return 'Sin especificar'
      
      try {
        const response = await axios.get(`/api/Herramienta/${herramientaId}`)
        return response.data.nombre || `Herramienta ${herramientaId}`
      } catch (error) {
        return `Herramienta ${herramientaId}`
      }
    }

    const resolveTipoMantenimiento = async (tipoId) => {
      const tipos = {
        1: 'Preventivo',
        2: 'Correctivo',
        3: 'Calibración',
        4: 'Limpieza',
        5: 'Inspección'
      }
      return tipos[tipoId] || `Tipo ${tipoId}`
    }

    const resolveUsuario = async (usuarioId) => {
      if (!usuarioId) return 'Sin asignar'
      
      try {
        const response = await axios.get(`/api/Usuario/${usuarioId}`)
        const usuario = response.data
        return `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || `Usuario ${usuarioId}`
      } catch (error) {
        return `Usuario ${usuarioId}`
      }
    }

    const loadAllData = async () => {
      loading.value = true
      error.value = null
      
      try {
        await Promise.all([
          fetchTiposMantenimiento(),
          fetchHerramientas(),
          fetchEstadosMantenimiento()
        ])
        // Cargar mantenimientos después para poder resolver las referencias
        await fetchMantenimientos()
      } catch (err) {
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
        error.value = 'Error al guardar el mantenimiento'
      }
    }

    const deleteMantenimiento = async (id) => {
      if (confirm('¿Está seguro de eliminar este mantenimiento?')) {
        try {
          await axios.delete(`/api/Mantenimiento/${id}`)
          await fetchMantenimientos()
        } catch (err) {
          error.value = 'Error al eliminar el mantenimiento'
        }
      }
    }

    // Función para convertir datos a CSV
    const convertToCSV = (data) => {
      if (!data || data.length === 0) {
        return ''
      }

      // Obtener las cabeceras
      const headers = Object.keys(data[0])
      
      // Crear el contenido CSV
      const csvContent = [
        // Cabeceras
        headers.map(header => `"${header}"`).join(','),
        // Datos
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Manejar valores nulos/undefined
            if (value === null || value === undefined) {
              return '""'
            }
            // Convertir a string y escapar comillas
            const stringValue = String(value).replace(/"/g, '""')
            return `"${stringValue}"`
          }).join(',')
        )
      ].join('\n')

      return csvContent
    }

    // Función para descargar archivo CSV
    const downloadCSV = (csvContent, filename) => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
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
    }

    // Método principal de exportación CSV
    const exportToCSV = () => {
      try {
        if (!mantenimientos.value || mantenimientos.value.length === 0) {
          alert('No hay datos para exportar')
          return
        }

        // Preparar los datos para el CSV con los nombres resueltos
        const csvData = mantenimientos.value.map(m => ({
          'ID': m.id,
          'Nombre': m.nombre || '',
          'Herramienta': m.herramienta_nombre || '',
          'Tipo de Mantenimiento': m.tipo_mantenimiento_nombre || '',
          'Técnico Asignado': m.tecnico_nombre || '',
          'Fecha Programada': m.fecha_programada || '',
          'Fecha Inicio': m.fecha_inicio || '',
          'Fecha Fin': m.fecha_fin || '',
          'Estado': getEstadoName(m.estado_id),
          'Prioridad': m.prioridad_nombre || '',
          'Costo Estimado': m.costo_estimado || 0,
          'Costo Real': m.costo_real || 0,
          'Horas de Trabajo': m.horas_trabajo || 0,
          'Descripción del Problema': m.descripcion_problema || '',
          'Acciones Realizadas': m.acciones_realizadas || '',
          'Repuestos Utilizados': Array.isArray(m.repuestos_utilizados) ? m.repuestos_utilizados.join('; ') : ''
        }))
        
        // Convertir a CSV
        const csvContent = convertToCSV(csvData)
        
        // Generar nombre del archivo con fecha actual
        const now = new Date()
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-')
        const filename = `mantenimientos_${timestamp}.csv`
        
        // Descargar archivo
        downloadCSV(csvContent, filename)
        
        console.log('Archivo CSV exportado exitosamente')
      } catch (error) {
        console.error('Error al exportar CSV:', error)
        error.value = 'Error al exportar datos a CSV'
      }
    }

    const testConnection = async () => {
      try {
        loading.value = true
        await axios.get('/api/Mantenimiento')
        alert('Conexión exitosa con la API')
      } catch (err) {
        alert('Error de conexión con la API')
      } finally {
        loading.value = false
      }
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
      prioridades,
      
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
      getPrioridadName,
      formatDate,
      formatCurrency,
      tipoMantenimientoClass,
      estadoClass,
      prioridadClass,
      
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