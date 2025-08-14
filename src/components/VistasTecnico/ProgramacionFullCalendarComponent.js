import { ref, computed, onMounted, watch, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import axios from 'axios'

export default {
  name: 'ProgramacionFullCalendarComponent',
  components: {
    FullCalendar
  },
  emits: ['maintenance-selected', 'maintenance-edit'],
  setup(props, { emit }) {
    // Reactive data
    const fullCalendar = ref(null)
    const currentView = ref('dayGridMonth')
    const currentPeriod = ref('')
    const loading = ref(true)
    const error = ref(null)

    // Maintenance data
    const maintenances = ref([])
    const herramientas = ref([])
    const tipoMantenimientos = ref([])
    const estadosMantenimiento = ref([])
    const prioridadesMantenimiento = ref([])

    // Filters
    const selectedStatusFilter = ref('')
    const selectedPriorityFilter = ref('')

    // Modal
    const showEventModal = ref(false)
    const selectedMaintenance = ref(null)

    // Available views
    const availableViews = ref([
      { value: 'dayGridMonth', label: 'Mes', icon: 'fas fa-calendar' },
      { value: 'timeGridWeek', label: 'Semana', icon: 'fas fa-calendar-week' },
      { value: 'timeGridDay', label: 'Día', icon: 'fas fa-calendar-day' },
      { value: 'listWeek', label: 'Lista', icon: 'fas fa-list' }
    ])

    // Computed events for FullCalendar
    const calendarEvents = computed(() => {
      let filteredMaintenances = maintenances.value

      // Apply status filter
      if (selectedStatusFilter.value) {
        filteredMaintenances = filteredMaintenances.filter(m =>
          m.estado_id === selectedStatusFilter.value
        )
      }

      // Apply priority filter
      if (selectedPriorityFilter.value) {
        filteredMaintenances = filteredMaintenances.filter(m =>
          m.prioridad_id === selectedPriorityFilter.value
        )
      }

      return filteredMaintenances.map(maintenance => ({
        id: maintenance.id,
        title: maintenance.nombre || maintenance.descripcion_problema || getTipoMantenimientoNombre(maintenance.tipo_mantenimiento_id),
        start: maintenance.fecha_programada || maintenance.fecha_creacion,
        end: maintenance.fecha_fin || null,
        allDay: !maintenance.fecha_inicio, // If no start time, make it all day
        backgroundColor: getPriorityColor(maintenance.prioridad_id),
        borderColor: getStatusColor(maintenance.estado_id),
        textColor: getTextColor(maintenance.prioridad_id),
        extendedProps: {
          maintenance: maintenance,
          status: getStatusClass(maintenance.estado_id),
          priority: getPriorityClass(maintenance.prioridad_id),
          herramienta: getHerramientaNombre(maintenance.herramienta_id),
          tipo: getTipoMantenimientoNombre(maintenance.tipo_mantenimiento_id)
        }
      }))
    })

    // Calendar options
    const calendarOptions = computed(() => ({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: false,
      height: 'auto',
      locale: 'es',
      firstDay: 1, // Start week on Monday
      events: calendarEvents.value,
      eventClick: handleEventClick,
      dateClick: handleDateClick,
      datesSet: handleDatesSet,
      eventDidMount: handleEventDidMount,
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Lista'
      },
      dayHeaderFormat: { weekday: 'short' },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      }
    }))

    // Data loading methods
    const fetchSupportingData = async () => {
      try {
        const [herramientasRes, tipoMantenimientosRes, estadosRes, prioridadesRes] = await Promise.all([
          axios.get('/api/Herramienta'),
          axios.get('/api/Tipo_Mantenimiento'),
          axios.get('/api/EstadoMantenimiento'),
          axios.get('/api/Prioridad_Mantenimiento')
        ])

        herramientas.value = herramientasRes.data
        tipoMantenimientos.value = tipoMantenimientosRes.data
        estadosMantenimiento.value = estadosRes.data
        prioridadesMantenimiento.value = prioridadesRes.data
      } catch (error) {
        console.error('Error loading supporting data:', error)
        // Fallback data
        herramientas.value = [
          { id: "1", nombre: "Soldadora MIG-200" },
          { id: "2", nombre: "Soldadora TIG-ACDC" },
          { id: "3", nombre: "Esmeril angular 7\"" },
          { id: "4", nombre: "Cortadora plasma 40A" },
          { id: "5", nombre: "Soplete oxicorte" }
        ]

        tipoMantenimientos.value = [
          { id: 1, nombre: "Preventivo" },
          { id: 2, nombre: "Correctivo" },
          { id: 3, nombre: "Calibración" },
          { id: 4, nombre: "Limpieza" },
          { id: 5, nombre: "Revisión Seguridad" }
        ]

        estadosMantenimiento.value = [
          { id: 1, nombre_estado: "Pendiente" },
          { id: 2, nombre_estado: "En Proceso" },
          { id: 3, nombre_estado: "Completado" },
          { id: 4, nombre_estado: "Cancelado" },
          { id: 5, nombre_estado: "Reprogramado" }
        ]

        prioridadesMantenimiento.value = [
          { id: 1, nombre_prioridad: "Crítica" },
          { id: 2, nombre_prioridad: "Alta" },
          { id: 3, nombre_prioridad: "Media" },
          { id: 4, nombre_prioridad: "Baja" },
          { id: 5, nombre_prioridad: "Programada" }
        ]
      }
    }

    const fetchMaintenances = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await axios.get('/api/Mantenimiento')
        maintenances.value = response.data
      } catch (error) {
        console.error('Error loading maintenances:', error)
        error.value = 'Error loading maintenance data'

        // Fallback data
        maintenances.value = [
          {
            id: "1",
            nombre: "Mantenimiento preventivo MIG-200",
            herramienta_id: "1",
            tipo_mantenimiento_id: 1,
            fecha_programada: "2025-08-15",
            fecha_inicio: "2025-08-15T09:00:00.000Z",
            fecha_fin: "2025-08-15T12:00:00.000Z",
            estado_id: "1",
            prioridad_id: "5",
            costo_estimado: "250.00",
            descripcion_problema: "Mantenimiento rutinario trimestral",
            fecha_creacion: "2025-08-01T16:00:00.000Z"
          }
        ]
      } finally {
        loading.value = false
      }
    }

    // Helper methods
    const getHerramientaNombre = (herramientaId) => {
      const herramienta = herramientas.value.find(h => h.id === herramientaId)
      return herramienta?.nombre || 'Herramienta desconocida'
    }

    const getTipoMantenimientoNombre = (tipoId) => {
      const tipo = tipoMantenimientos.value.find(t => t.id === tipoId)
      return tipo?.nombre || 'Tipo desconocido'
    }

    const formatStatus = (statusId) => {
      const estado = estadosMantenimiento.value.find(e => e.id === parseInt(statusId))
      return estado?.nombre_estado || 'Estado desconocido'
    }

    const formatPriority = (priorityId) => {
      const prioridad = prioridadesMantenimiento.value.find(p => p.id === parseInt(priorityId))
      return prioridad?.nombre_prioridad || 'Prioridad desconocida'
    }

    const getStatusClass = (statusId) => {
      const estado = estadosMantenimiento.value.find(e => e.id === parseInt(statusId))
      const statusMap = {
        'Pendiente': 'pending',
        'En Proceso': 'in-progress',
        'Completado': 'completed',
        'Cancelado': 'cancelled',
        'Reprogramado': 'pending'
      }
      return statusMap[estado?.nombre_estado] || 'pending'
    }

    const getPriorityClass = (priorityId) => {
      const prioridad = prioridadesMantenimiento.value.find(p => p.id === parseInt(priorityId))
      const priorityMap = {
        'Crítica': 'high',
        'Alta': 'high',
        'Media': 'medium',
        'Baja': 'low',
        'Programada': 'low'
      }
      return priorityMap[prioridad?.nombre_prioridad] || 'low'
    }

    const getPriorityColor = (priorityId) => {
      const priority = getPriorityClass(priorityId)
      const colorMap = {
        'high': '#dc3545',
        'medium': '#ffc107',
        'low': '#28a745'
      }
      return colorMap[priority] || '#6c757d'
    }

    const getStatusColor = (statusId) => {
      const status = getStatusClass(statusId)
      const colorMap = {
        'pending': '#ffc107',
        'in-progress': '#17a2b8',
        'completed': '#28a745',
        'cancelled': '#6c757d'
      }
      return colorMap[status] || '#6c757d'
    }

    const getTextColor = (priorityId) => {
      const priority = getPriorityClass(priorityId)
      return priority === 'medium' ? '#212529' : '#ffffff'
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No especificada'
      return new Date(dateString).toLocaleDateString('es-ES')
    }

    // Navigation methods
    const goToPrevious = () => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        calendarApi.prev()
        updateCurrentPeriod()
      }
    }

    const goToNext = () => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        calendarApi.next()
        updateCurrentPeriod()
      }
    }

    const goToToday = () => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        calendarApi.today()
        updateCurrentPeriod()
      }
    }

    const changeView = (viewName) => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        calendarApi.changeView(viewName)
        currentView.value = viewName
        updateCurrentPeriod()
      }
    }

    const updateCurrentPeriod = () => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        const view = calendarApi.view
        const start = view.currentStart

        switch (view.type) {
          case 'dayGridMonth':
            currentPeriod.value = start.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long'
            })
            break
          case 'timeGridWeek':
          case 'listWeek':
            const end = new Date(view.currentEnd)
            end.setDate(end.getDate() - 1)
            currentPeriod.value = `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`
            break
          case 'timeGridDay':
            currentPeriod.value = start.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
            break
        }
      }
    }

    // Event handlers
    const handleEventClick = (info) => {
      const maintenance = info.event.extendedProps.maintenance
      // Emit event to parent component to show the modal
      emit('maintenance-selected', maintenance)
    }

    const handleDateClick = (info) => {
      // Could emit event for creating new maintenance
      console.log('Date clicked:', info)
    }

    const handleDatesSet = () => {
      updateCurrentPeriod()
    }

    const handleEventDidMount = (info) => {
      if (info.event.extendedProps?.status) {
        info.el.classList.add(`event-status-${info.event.extendedProps.status}`)
      }
      if (info.event.extendedProps?.priority) {
        info.el.classList.add(`event-priority-${info.event.extendedProps.priority}`)
      }
    }

    // Modal methods
    const closeEventModal = () => {
      showEventModal.value = false
      selectedMaintenance.value = null
    }

    const editMaintenance = (maintenance) => {
      // Could emit event for editing
      console.log('Edit maintenance:', maintenance)
      closeEventModal()
    }

    // Filter methods
    const filterEvents = () => {
      // Events will update automatically through computed
    }

    // Lifecycle
    onMounted(async () => {
      await fetchSupportingData()
      await fetchMaintenances()
      nextTick(() => {
        updateCurrentPeriod()
      })
    })

    return {
      // Refs
      fullCalendar,
      currentView,
      currentPeriod,
      loading,
      error,
      maintenances,
      herramientas,
      tipoMantenimientos,
      estadosMantenimiento,
      prioridadesMantenimiento,
      selectedStatusFilter,
      selectedPriorityFilter,
      showEventModal,
      selectedMaintenance,
      availableViews,
      calendarOptions,

      // Methods
      goToPrevious,
      goToNext,
      goToToday,
      changeView,
      closeEventModal,
      editMaintenance,
      filterEvents,
      getHerramientaNombre,
      getTipoMantenimientoNombre,
      formatStatus,
      formatPriority,
      getStatusClass,
      getPriorityClass,
      formatDate
    }
  }
}
