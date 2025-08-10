import { ref, computed, onMounted, watch, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

export default {
  name: 'FullCalendarComponent',
  components: {
    FullCalendar
  },
  props: {
    // Título del calendario
    title: {
      type: String,
      default: 'Calendario'
    },

    // Eventos del calendario
    events: {
      type: Array,
      default: () => []
    },

    // Vista inicial
    initialView: {
      type: String,
      default: 'dayGridMonth'
    },

    // Vistas disponibles
    views: {
      type: Array,
      default: () => [
        { value: 'dayGridMonth', label: 'Mes', icon: 'fas fa-calendar' },
        { value: 'timeGridWeek', label: 'Semana', icon: 'fas fa-calendar-week' },
        { value: 'timeGridDay', label: 'Día', icon: 'fas fa-calendar-day' },
        { value: 'listWeek', label: 'Lista', icon: 'fas fa-list' }
      ]
    },

    // Configuraciones de permisos
    canCreateEvents: {
      type: Boolean,
      default: false
    },

    canEditEvents: {
      type: Boolean,
      default: false
    },

    canDeleteEvents: {
      type: Boolean,
      default: false
    },

    // Mostrar controles adicionales
    showControls: {
      type: Boolean,
      default: true
    },

    // Tipos de eventos para filtrado
    eventTypes: {
      type: Array,
      default: () => []
    },

    // Estado de carga
    loading: {
      type: Boolean,
      default: false
    },

    // Configuración de altura
    height: {
      type: [String, Number],
      default: 'auto'
    },

    // Configuraciones adicionales del calendario
    calendarConfig: {
      type: Object,
      default: () => ({})
    }
  },

  emits: [
    'event-click',
    'event-create',
    'event-edit',
    'event-delete',
    'date-click',
    'view-change',
    'events-set'
  ],

  setup(props, { emit }) {
    const fullCalendar = ref(null)
    const currentView = ref(props.initialView)
    const selectedEventType = ref('')
    const showEventModal = ref(false)
    const selectedEvent = ref(null)
    const currentPeriod = ref('')

    // Vistas disponibles
    const availableViews = computed(() => props.views)

    // Eventos filtrados
    const filteredEvents = computed(() => {
      if (!selectedEventType.value) return props.events
      return props.events.filter(event =>
        event.extendedProps?.type === selectedEventType.value
      )
    })

    // Opciones del calendario
    const calendarOptions = computed(() => ({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: props.initialView,
      headerToolbar: false,
      height: props.height,
      locale: 'es',
      firstDay: 1, // Empezar semana en lunes
      events: filteredEvents.value,

      // Configuración de textos
      buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Lista'
      },

      // Configuración de formato de fecha
      dayHeaderFormat: { weekday: 'short' },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: false
      },

      // Event handlers
      eventClick: handleEventClick,
      dateClick: handleDateClick,
      datesSet: handleDatesSet,
      eventDidMount: handleEventDidMount,

      // Configuraciones adicionales del prop
      ...props.calendarConfig
    }))

    // Métodos de navegación
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

    // Cambio de vista
    const changeView = (viewName) => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        calendarApi.changeView(viewName)
        currentView.value = viewName
        emit('view-change', viewName)
        updateCurrentPeriod()
      }
    }

    // Actualizar período actual
    const updateCurrentPeriod = () => {
      const calendarApi = fullCalendar.value?.getApi()
      if (calendarApi) {
        const view = calendarApi.view
        const start = view.currentStart
        const end = view.currentEnd

        const options = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }

        switch (view.type) {
          case 'dayGridMonth':
            currentPeriod.value = start.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long'
            })
            break
          case 'timeGridWeek':
          case 'listWeek':
            const endWeek = new Date(end)
            endWeek.setDate(endWeek.getDate() - 1)
            currentPeriod.value = `${start.toLocaleDateString('es-ES', options)} - ${endWeek.toLocaleDateString('es-ES', options)}`
            break
          case 'timeGridDay':
            currentPeriod.value = start.toLocaleDateString('es-ES', options)
            break
          default:
            currentPeriod.value = start.toLocaleDateString('es-ES', options)
        }
      }
    }

    // Event handlers
    const handleEventClick = (info) => {
      selectedEvent.value = info.event
      showEventModal.value = true
      emit('event-click', info.event)
    }

    const handleDateClick = (info) => {
      emit('date-click', info)
    }

    const handleDatesSet = (info) => {
      updateCurrentPeriod()
      emit('events-set', info)
    }

    const handleEventDidMount = (info) => {
      // Agregar clases CSS personalizadas basadas en propiedades del evento
      if (info.event.extendedProps?.status) {
        info.el.classList.add(`event-status-${info.event.extendedProps.status}`)
      }
      if (info.event.extendedProps?.priority) {
        info.el.classList.add(`event-priority-${info.event.extendedProps.priority}`)
      }
    }

    // Filtrado de eventos
    const filterEvents = () => {
      // Los eventos se filtran automáticamente a través del computed
    }

    // Modal de eventos
    const closeEventModal = () => {
      showEventModal.value = false
      selectedEvent.value = null
    }

    // Acciones de eventos
    const createEvent = () => {
      emit('event-create')
    }

    const editEvent = (event) => {
      emit('event-edit', event)
      closeEventModal()
    }

    const deleteEvent = (event) => {
      if (confirm('¿Está seguro de que desea eliminar este evento?')) {
        emit('event-delete', event)
        closeEventModal()
      }
    }

    // Utilidades
    const formatEventDate = (start, end) => {
      const startDate = new Date(start)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }

      if (!end || start === end) {
        return startDate.toLocaleDateString('es-ES', options)
      }

      const endDate = new Date(end)
      return `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`
    }

    const getStatusLabel = (status) => {
      const statusLabels = {
        'pending': 'Pendiente',
        'in-progress': 'En Progreso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
      }
      return statusLabels[status] || status
    }

    const getCustomFields = (event) => {
      const ignoredFields = ['description', 'location', 'status', 'type', 'priority']
      const customFields = {}

      if (event.extendedProps) {
        Object.keys(event.extendedProps).forEach(key => {
          if (!ignoredFields.includes(key)) {
            customFields[key] = event.extendedProps[key]
          }
        })
      }

      return customFields
    }

    const formatFieldName = (fieldName) => {
      return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')
    }

    // Watchers
    watch(() => props.events, () => {
      // El calendario se actualizará automáticamente cuando cambien los eventos
    }, { deep: true })

    // Lifecycle
    onMounted(() => {
      nextTick(() => {
        updateCurrentPeriod()
      })
    })

    return {
      fullCalendar,
      currentView,
      selectedEventType,
      showEventModal,
      selectedEvent,
      currentPeriod,
      availableViews,
      calendarOptions,
      goToPrevious,
      goToNext,
      goToToday,
      changeView,
      filterEvents,
      createEvent,
      editEvent,
      deleteEvent,
      closeEventModal,
      formatEventDate,
      getStatusLabel,
      getCustomFields,
      formatFieldName
    }
  }
}