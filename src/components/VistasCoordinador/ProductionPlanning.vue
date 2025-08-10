<template>
  <div class="">
    <Sidebar :role="'coordinator'" />

    <!-- Header principal fuera del contenedor del calendario -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Calendario de producción</h1>
            <p class="header-subtitle">Controla tu inventario y mantén el stock siempre actualizado</p>
          </div>
        </div>
      </div>
    </div>

    <main class="">
      <div class="calendario-container">

        <FullCalendarComponent :title="calendarTitle" :events="events" :initial-view="selectedView"
          :can-create-events="true" :can-edit-events="true" :can-delete-events="true" :show-controls="true"
          :event-types="eventTypes" :loading="isLoading" height="600px" @event-click="handleEventClick"
          @event-create="handleEventCreate" @event-edit="handleEventEdit" @event-delete="handleEventDelete"
          @date-click="handleDateClick" @view-change="handleViewChange" />

      </div>
    </main>
  </div>
</template>

<style src="src/assets/EstiloBase.css" scoped></style>

<script>
import { ref, onMounted } from 'vue'
import FullCalendarComponent from '@/components/GlobalComponents/FullCalendarComponent.vue'

export default {
  name: 'MiPaginaCalendario',
  components: {
    FullCalendarComponent
  },
  setup() {
    // Estados reactivos
    const calendarTitle = ref('Mi Calendario Personal')
    const selectedView = ref('dayGridMonth')
    const isLoading = ref(false)

    // Tipos de eventos para el filtro
    const eventTypes = ref([
      { value: 'meeting', label: 'Reuniones' },
      { value: 'task', label: 'Tareas' },
      { value: 'personal', label: 'Personal' },
      { value: 'holiday', label: 'Vacaciones' }
    ])

    // Eventos del calendario
    const events = ref([
      {
        id: '1',
        title: 'Reunión de equipo',
        start: '2025-08-12T10:00:00',
        end: '2025-08-12T11:00:00',
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        extendedProps: {
          description: 'Reunión semanal del equipo de desarrollo',
          location: 'Sala de conferencias A',
          status: 'pending',
          type: 'meeting',
          priority: 'high'
        }
      },
      {
        id: '2',
        title: 'Completar proyecto X',
        start: '2025-08-13',
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        extendedProps: {
          description: 'Finalizar la implementación del proyecto X',
          status: 'in-progress',
          type: 'task',
          priority: 'medium'
        }
      },
      {
        id: '3',
        title: 'Cita médica',
        start: '2025-08-15T15:30:00',
        end: '2025-08-15T16:30:00',
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        extendedProps: {
          description: 'Consulta médica anual',
          location: 'Hospital Central',
          status: 'pending',
          type: 'personal',
          priority: 'high'
        }
      }
    ])

    // Event handlers
    const handleEventClick = (event) => {
      console.log('Evento clickeado:', event)
      // Aquí puedes manejar el click del evento
      // Por ejemplo, abrir un modal personalizado o navegar a otra página
    }

    const handleEventCreate = () => {
      console.log('Crear nuevo evento')
      // Aquí puedes abrir un formulario para crear eventos
      // Por ejemplo:
      // router.push('/eventos/crear')
      // o abrir un modal
    }

    const handleEventEdit = (event) => {
      console.log('Editar evento:', event)
      // Aquí puedes abrir un formulario de edición
      // Por ejemplo:
      // router.push(`/eventos/editar/${event.id}`)
    }

    const handleEventDelete = (event) => {
      console.log('Eliminar evento:', event)
      // Aquí puedes hacer la llamada a la API para eliminar
      deleteEventFromAPI(event.id)
    }

    const handleDateClick = (dateInfo) => {
      console.log('Fecha clickeada:', dateInfo)
      // Aquí puedes crear un evento en la fecha seleccionada
      const newEvent = {
        id: Date.now().toString(),
        title: 'Nuevo evento',
        start: dateInfo.dateStr,
        backgroundColor: '#6b7280',
        borderColor: '#6b7280',
        extendedProps: {
          status: 'pending',
          type: 'task'
        }
      }
      events.value.push(newEvent)
    }

    const handleViewChange = (viewName) => {
      console.log('Vista cambiada a:', viewName)
      selectedView.value = viewName
    }

    // Métodos para API (ejemplos)
    const deleteEventFromAPI = async (eventId) => {
      try {
        isLoading.value = true
        // Simular llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Eliminar del array local
        events.value = events.value.filter(event => event.id !== eventId)

        console.log(`Evento ${eventId} eliminado correctamente`)
      } catch (error) {
        console.error('Error al eliminar evento:', error)
      } finally {
        isLoading.value = false
      }
    }

    const loadEventsFromAPI = async () => {
      try {
        isLoading.value = true
        // Simular carga de eventos desde API
        await new Promise(resolve => setTimeout(resolve, 1500))

        // En una aplicación real, aquí harías:
        // const response = await api.get('/eventos')
        // events.value = response.data

        console.log('Eventos cargados desde API')
      } catch (error) {
        console.error('Error al cargar eventos:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Lifecycle
    onMounted(() => {
      // Cargar eventos al montar el componente
      loadEventsFromAPI()
    })

    return {
      calendarTitle,
      selectedView,
      isLoading,
      eventTypes,
      events,
      handleEventClick,
      handleEventCreate,
      handleEventEdit,
      handleEventDelete,
      handleDateClick,
      handleViewChange
    }
  }
}
</script>
