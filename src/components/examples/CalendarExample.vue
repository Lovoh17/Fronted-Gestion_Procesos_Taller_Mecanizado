<template>
  <div class="calendar-example">
    <div class="page-header">
      <h1>Ejemplo de FullCalendar</h1>
      <p>Demostración del componente FullCalendar personalizado</p>
    </div>

    <!-- Controles de demostración -->
    <div class="demo-controls">
      <button @click="addRandomEvent" class="demo-btn primary">
        <i class="fas fa-plus"></i>
        Agregar Evento Aleatorio
      </button>
      
      <button @click="toggleLoading" class="demo-btn secondary">
        <i class="fas fa-spinner"></i>
        Toggle Loading
      </button>
      
      <button @click="clearEvents" class="demo-btn danger">
        <i class="fas fa-trash"></i>
        Limpiar Eventos
      </button>
    </div>

    <!-- Componente FullCalendar -->
    <FullCalendarComponent
      :title="calendarTitle"
      :events="events"
      :loading="isLoading"
      :can-create-events="true"
      :can-edit-events="true"
      :can-delete-events="true"
      :show-controls="true"
      :event-types="eventTypes"
      :initial-view="'dayGridMonth'"
      :calendar-config="calendarConfig"
      @event-click="handleEventClick"
      @event-create="handleEventCreate"
      @event-edit="handleEventEdit"
      @event-delete="handleEventDelete"
      @date-click="handleDateClick"
      @view-change="handleViewChange"
    />

    <!-- Modal para crear/editar eventos -->
    <div v-if="showEventForm" class="modal-overlay" @click.self="closeEventForm">
      <div class="event-form-modal">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Evento' : 'Nuevo Evento' }}</h3>
          <button @click="closeEventForm" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveEvent" class="event-form">
          <div class="form-group">
            <label for="title">Título *</label>
            <input
              id="title"
              v-model="eventForm.title"
              type="text"
              required
              placeholder="Título del evento"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="start">Fecha de Inicio *</label>
              <input
                id="start"
                v-model="eventForm.start"
                type="datetime-local"
                required
              >
            </div>

            <div class="form-group">
              <label for="end">Fecha de Fin</label>
              <input
                id="end"
                v-model="eventForm.end"
                type="datetime-local"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="type">Tipo</label>
              <select id="type" v-model="eventForm.type">
                <option value="">Seleccionar tipo</option>
                <option v-for="type in eventTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="status">Estado</label>
              <select id="status" v-model="eventForm.status">
                <option value="">Seleccionar estado</option>
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              v-model="eventForm.description"
              rows="3"
              placeholder="Descripción del evento"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="location">Ubicación</label>
            <input
              id="location"
              v-model="eventForm.location"
              type="text"
              placeholder="Ubicación del evento"
            >
          </div>

          <div class="form-actions">
            <button type="button" @click="closeEventForm" class="btn-cancel">
              Cancelar
            </button>
            <button type="submit" class="btn-save">
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import FullCalendarComponent from '@/components/GlobalComponents/FullCalendarComponent.vue'

export default {
  name: 'CalendarExample',
  components: {
    FullCalendarComponent
  },
  setup() {
    // Estados reactivos
    const events = ref([
      {
        id: '1',
        title: 'Reunión de Equipo',
        start: '2024-01-15T09:00:00',
        end: '2024-01-15T10:30:00',
        backgroundColor: '#3b82f6',
        extendedProps: {
          type: 'meeting',
          status: 'pending',
          description: 'Reunión semanal del equipo de desarrollo',
          location: 'Sala de conferencias A'
        }
      },
      {
        id: '2',
        title: 'Entrega de Proyecto',
        start: '2024-01-20',
        backgroundColor: '#ef4444',
        extendedProps: {
          type: 'deadline',
          status: 'in-progress',
          description: 'Entrega final del proyecto de gestión',
          priority: 'high'
        }
      },
      {
        id: '3',
        title: 'Mantenimiento Programado',
        start: '2024-01-25T14:00:00',
        end: '2024-01-25T18:00:00',
        backgroundColor: '#f59e0b',
        extendedProps: {
          type: 'maintenance',
          status: 'pending',
          description: 'Mantenimiento preventivo de equipos',
          location: 'Taller principal',
          assignedTo: 'Juan Pérez'
        }
      }
    ])

    const isLoading = ref(false)
    const showEventForm = ref(false)
    const isEditing = ref(false)
    const currentEventId = ref(null)

    // Configuración del calendario
    const calendarTitle = ref('Gestión de Procesos - Taller Mecanizado')
    
    const eventTypes = ref([
      { value: 'meeting', label: 'Reunión' },
      { value: 'deadline', label: 'Fecha límite' },
      { value: 'maintenance', label: 'Mantenimiento' },
      { value: 'production', label: 'Producción' },
      { value: 'training', label: 'Capacitación' }
    ])

    const calendarConfig = {
      editable: true,
      selectable: true,
      selectMirror: true,
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5], // Lunes a viernes
        startTime: '08:00',
        endTime: '18:00'
      },
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00'
    }

    // Formulario de eventos
    const eventForm = ref({
      title: '',
      start: '',
      end: '',
      type: '',
      status: '',
      description: '',
      location: ''
    })

    // Métodos para generar eventos aleatorios
    const getRandomEventType = () => {
      const types = eventTypes.value
      return types[Math.floor(Math.random() * types.length)]
    }

    const getRandomStatus = () => {
      const statuses = ['pending', 'in-progress', 'completed', 'cancelled']
      return statuses[Math.floor(Math.random() * statuses.length)]
    }

    const getRandomDate = () => {
      const today = new Date()
      const futureDate = new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
      return futureDate.toISOString().split('T')[0]
    }

    const getRandomColor = () => {
      const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316']
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Event handlers
    const handleEventClick = (event) => {
      console.log('Evento clickeado:', event)
    }

    const handleEventCreate = () => {
      resetEventForm()
      isEditing.value = false
      showEventForm.value = true
    }

    const handleEventEdit = (event) => {
      isEditing.value = true
      currentEventId.value = event.id
      
      // Rellenar el formulario con los datos del evento
      eventForm.value = {
        title: event.title,
        start: event.start?.toISOString().slice(0, 16) || '',
        end: event.end?.toISOString().slice(0, 16) || '',
        type: event.extendedProps?.type || '',
        status: event.extendedProps?.status || '',
        description: event.extendedProps?.description || '',
        location: event.extendedProps?.location || ''
      }
      
      showEventForm.value = true
    }

    const handleEventDelete = (event) => {
      const index = events.value.findIndex(e => e.id === event.id)
      if (index > -1) {
        events.value.splice(index, 1)
        console.log('Evento eliminado:', event.title)
      }
    }

    const handleDateClick = (info) => {
      resetEventForm()
      eventForm.value.start = info.dateStr + 'T09:00'
      isEditing.value = false
      showEventForm.value = true
    }

    const handleViewChange = (viewName) => {
      console.log('Vista cambiada a:', viewName)
    }

    // Métodos del formulario
    const resetEventForm = () => {
      eventForm.value = {
        title: '',
        start: '',
        end: '',
        type: '',
        status: '',
        description: '',
        location: ''
      }
      currentEventId.value = null
    }

    const closeEventForm = () => {
      showEventForm.value = false
      resetEventForm()
    }

    const saveEvent = () => {
      if (!eventForm.value.title || !eventForm.value.start) {
        alert('Por favor completa los campos requeridos')
        return
      }

      const eventData = {
        id: isEditing.value ? currentEventId.value : Date.now().toString(),
        title: eventForm.value.title,
        start: eventForm.value.start,
        end: eventForm.value.end || undefined,
        backgroundColor: getRandomColor(),
        extendedProps: {
          type: eventForm.value.type,
          status: eventForm.value.status,
          description: eventForm.value.description,
          location: eventForm.value.location
        }
      }

      if (isEditing.value) {
        // Actualizar evento existente
        const index = events.value.findIndex(e => e.id === currentEventId.value)
        if (index > -1) {
          events.value[index] = eventData
        }
      } else {
        // Agregar nuevo evento
        events.value.push(eventData)
      }

      closeEventForm()
    }

    // Métodos de demostración
    const addRandomEvent = () => {
      const type = getRandomEventType()
      const status = getRandomStatus()
      const date = getRandomDate()
      
      const newEvent = {
        id: Date.now().toString(),
        title: `${type.label} - ${Math.floor(Math.random() * 1000)}`,
        start: date,
        backgroundColor: getRandomColor(),
        extendedProps: {
          type: type.value,
          status: status,
          description: `Descripción generada automáticamente para ${type.label}`,
          location: 'Ubicación automática'
        }
      }
      
      events.value.push(newEvent)
    }

    const toggleLoading = () => {
      isLoading.value = !isLoading.value
      
      if (isLoading.value) {
        setTimeout(() => {
          isLoading.value = false
        }, 2000)
      }
    }

    const clearEvents = () => {
      if (confirm('¿Estás seguro de que quieres eliminar todos los eventos?')) {
        events.value = []
      }
    }

    return {
      // Estados
      events,
      isLoading,
      showEventForm,
      isEditing,
      eventForm,
      
      // Configuración
      calendarTitle,
      eventTypes,
      calendarConfig,
      
      // Event handlers
      handleEventClick,
      handleEventCreate,
      handleEventEdit,
      handleEventDelete,
      handleDateClick,
      handleViewChange,
      
      // Métodos del formulario
      closeEventForm,
      saveEvent,
      
      // Métodos de demostración
      addRandomEvent,
      toggleLoading,
      clearEvents
    }
  }
}
</script>

<style scoped>
.calendar-example {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.demo-btn.primary {
  background: #3b82f6;
  color: white;
}

.demo-btn.primary:hover {
  background: #2563eb;
}

.demo-btn.secondary {
  background: #6b7280;
  color: white;
}

.demo-btn.secondary:hover {
  background: #4b5563;
}

.demo-btn.danger {
  background: #ef4444;
  color: white;
}

.demo-btn.danger:hover {
  background: #dc2626;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.event-form-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.25rem;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.event-form {
  padding: 1.5rem 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: #3b82f6;
  color: white;
}

.btn-save:hover {
  background: #2563eb;
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-example {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .demo-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .event-form-modal {
    margin: 0;
    border-radius: 0;
  }
  
  .modal-header,
  .event-form {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
