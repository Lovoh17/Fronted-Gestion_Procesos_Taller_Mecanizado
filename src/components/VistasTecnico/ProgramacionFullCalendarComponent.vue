<template>
  <div class="full-calendar-container">
    <!-- Header personalizado -->
    <div class="calendar-header">
      <div class="header-left">
        <div class="calendar-title">
          <i class="fas fa-tools"></i>
          <h2>Programación de Mantenimientos</h2>
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

        <!-- Controles adicionales -->
        <div class="additional-controls">
          <div class="filter-controls">
            <select v-model="selectedStatusFilter" @change="filterEvents" class="status-filter">
              <option value="">Todos los estados</option>
              <option v-for="estado in estadosMantenimiento" :key="estado.id" :value="estado.id">
                {{ estado.nombre_estado }}
              </option>
            </select>

            <select v-model="selectedPriorityFilter" @change="filterEvents" class="priority-filter">
              <option value="">Todas las prioridades</option>
              <option v-for="prioridad in prioridadesMantenimiento" :key="prioridad.id" :value="prioridad.id">
                {{ prioridad.nombre_prioridad }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando mantenimientos...</span>
      </div>
    </div>

    <!-- FullCalendar component -->
    <div class="calendar-wrapper">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" class="custom-calendar" />
    </div>



  </div>
</template>

<script src="./script/ProgramacionFullCalendarComponent.js"></script>

<style src="src/assets/ProgramacionFullCalendarComponent.css"></style>
