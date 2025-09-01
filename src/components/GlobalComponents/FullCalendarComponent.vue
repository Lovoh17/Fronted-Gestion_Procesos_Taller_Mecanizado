<template>
  <div class="full-calendar-container">
    <!-- Header personalizado -->
    <div class="calendar-header">
      <div class="header-left">
        <div class="calendar-title">
          <i class="fas fa-calendar-alt"></i>
          <h2>{{ title || 'Calendario' }}</h2>
        </div>
        <div class="view-selector">
          <button v-for="view in availableViews" :key="view.value"
            :class="['view-btn', { active: currentView === view.value }]" @click="changeView(view.value)">
            <i :class="view.icon"></i>
            <span>{{ view.label }}</span>
          </button>
        </div>
      </div>

      <div class="header-controls">
        <div class="navigation-controls">
          <button class="nav-btn" @click="goToPrevious" title="Anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="nav-btn today-btn" @click="goToToday">
            Hoy
          </button>
          <button class="nav-btn" @click="goToNext" title="Siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="period-display">
          <span class="current-period">{{ currentPeriod }}</span>
        </div>

        <!-- Controles adicionales si se necesitan -->
        <div v-if="showControls" class="additional-controls">
          <VaButton v-if="canCreateEvents" color="#001F3D" size="small" @click="createEvent" class="create-btn">
            <VaIcon name="add" class="mr-1" />
            <span>Nuevo Evento</span>
          </VaButton>

          <div class="filter-controls">
            <VaSelect v-if="eventTypes.length > 0" v-model="selectedEventType" :options="eventTypeOptions"
              placeholder="Todos los tipos" @update:modelValue="filterEvents" size="small" class="event-type-select" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando calendario...</span>
      </div>
    </div>

    <!-- FullCalendar component -->
    <div class="calendar-wrapper">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" class="custom-calendar" />
    </div>

    <!-- Event details modal -->
    <VaModal v-model="showEventModal" title="Detalles del Evento" size="small" :hide-default-actions="true"
      @close="closeEventModal">
      <template #header>
        <div class="event-modal-header">
          <div class="event-modal-icon">
            <VaIcon name="event" size="large" />
          </div>
          <h3 class="event-modal-title">Detalles del Evento</h3>
        </div>
      </template>

      <div class="event-modal-content">
        <div v-if="selectedEvent" class="event-details">
          <div class="detail-item">
            <label>Título:</label>
            <span>{{ selectedEvent.title }}</span>
          </div>

          <div class="detail-item">
            <label>Fecha:</label>
            <span>{{ formatEventDate(selectedEvent.start, selectedEvent.end) }}</span>
          </div>

          <div v-if="selectedEvent.extendedProps?.description" class="detail-item">
            <label>Descripción:</label>
            <p>{{ selectedEvent.extendedProps.description }}</p>
          </div>

          <div v-if="selectedEvent.extendedProps?.location" class="detail-item">
            <label>Ubicación:</label>
            <span>{{ selectedEvent.extendedProps.location }}</span>
          </div>

          <div v-if="selectedEvent.extendedProps?.status" class="detail-item">
            <label>Estado:</label>
            <span class="status-badge" :class="`status-${selectedEvent.extendedProps.status}`">
              {{ getStatusLabel(selectedEvent.extendedProps.status) }}
            </span>
          </div>

          <div v-if="selectedEvent.extendedProps?.priority" class="detail-item">
            <label>Prioridad:</label>
            <span class="status-badge" :class="`priority-${selectedEvent.extendedProps.priority}`">
              {{ getPriorityLabel(selectedEvent.extendedProps.priority) }}
            </span>
          </div>

          <!-- Campos personalizados adicionales -->
          <div v-for="(value, key) in getCustomFields(selectedEvent)" :key="key" class="detail-item">
            <label>{{ formatFieldName(key) }}:</label>
            <span>{{ value }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="event-modal-actions">
          <VaButton preset="secondary" @click="closeEventModal" class="event-action-button">
            <VaIcon name="close" class="mr-1" />
            Cerrar
          </VaButton>

          <VaButton v-if="canEditEvents" color="primary" @click="editEvent(selectedEvent)" class="event-action-button">
            <VaIcon name="edit" class="mr-1" />
            Editar
          </VaButton>

          <VaButton v-if="canDeleteEvents" color="danger" @click="confirmDeleteEvent(selectedEvent)"
            class="event-action-button">
            <VaIcon name="delete" class="mr-1" />
            Eliminar
          </VaButton>
        </div>
      </template>
    </VaModal>

    <!-- Confirmation modal for delete -->
    <VaModal v-model="showDeleteConfirm" title="Confirmar eliminación" :close-button="!deletingEvent"
      :hide-default-actions="true" :no-outside-dismiss="deletingEvent" :no-escape-dismiss="deletingEvent" size="small"
      @close="cancelDelete">
      <template #header>
        <div class="event-modal-header">
          <div class="event-modal-icon" style="background: #dc3545;">
            <VaIcon name="warning" size="large" />
          </div>
          <h3 class="event-modal-title">Confirmar eliminación</h3>
        </div>
      </template>

      <div class="event-modal-content">
        <p class="confirm-message">
          ¿Estás seguro de que deseas eliminar el evento "{{ eventToDelete?.title }}"?
        </p>
        <div class="confirm-details"
          style="padding: 0.75rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #dc3545; margin-top: 1rem;">
          <small style="color: #6c757d;">Esta acción no se puede deshacer.</small>
        </div>
      </div>

      <template #footer>
        <div class="event-modal-actions">
          <VaButton preset="secondary" @click="cancelDelete" :disabled="deletingEvent" class="event-action-button">
            Cancelar
          </VaButton>

          <VaButton color="danger" @click="deleteEventConfirmed" :disabled="deletingEvent" :loading="deletingEvent"
            class="event-action-button">
            Eliminar
          </VaButton>
        </div>
      </template>
    </VaModal>
  </div>
</template>


<script src="./scripts/FullCalendarComponent.vue.js"></script>
<style src="src/assets/Componentes_Style/FullCalendarComponent.css" ></style>
