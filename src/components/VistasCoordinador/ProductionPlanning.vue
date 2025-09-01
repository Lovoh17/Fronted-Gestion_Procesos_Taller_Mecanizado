<template>
  <div class="">
    <Sidebar :role="'coordinator'" />

    <!-- Panel de Alertas Superior -->
    <div v-if="alerts.length > 0" class="alerts-panel">
      <div v-for="alert in alerts" :key="alert.id" :class="['alert-item', alert.type]">
        <div class="alert-content">
          <i :class="alert.icon"></i>
          <span class="alert-message">{{ alert.message }}</span>
          <button v-if="alert.actionButton" class="alert-action-btn" @click="handleAlertAction(alert)">
            {{ alert.actionButton }}
          </button>
        </div>
        <button class="alert-close" @click="dismissAlert(alert.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Header principal fuera del contenedor del calendario -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Planificación de Producción</h1>
            <p class="header-subtitle">Gestiona la producción con vista de calendario y diagrama de Gantt</p>
          </div>
        </div>

        <div class="header-actions">
          <!-- Botón Solicitar Eventual -->
          <button class="solicitar-eventual-btn" @click="openSolicitarEventualModal">
            <i class="fas fa-user-plus"></i>
            <span>Solicitar Eventual</span>
          </button>

          <!-- Selector de vista -->
          <div class="view-selector-tabs">
            <button :class="['tab-btn', { active: currentView === 'calendar' }]" @click="switchView('calendar')">
              <i class="fas fa-calendar"></i>
              <span>Calendario</span>
            </button>
            <button :class="['tab-btn', { active: currentView === 'gantt' }]" @click="switchView('gantt')">
              <i class="fas fa-chart-gantt"></i>
              <span>Gantt</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <main class="">
      <!-- Vista de Calendario -->
      <div v-show="currentView === 'calendar'" class="calendar-view">
        <div class="calendario-container">
          <FullCalendarComponent :title="calendarTitle" :events="events" :initial-view="selectedView"
            :can-create-events="true" :can-edit-events="true" :can-delete-events="true" :show-controls="true"
            :event-types="eventTypes" :loading="isLoading" height="600px" @event-click="handleEventClick"
            @event-create="handleEventCreate" @event-edit="handleEventEdit" @event-delete="handleEventDelete"
            @date-click="handleDateClick" @view-change="handleViewChange" />
        </div>
      </div>

      <!-- Vista de Gantt -->
      <div v-show="currentView === 'gantt'" class="gantt-view">
        <!-- Leyenda de Códigos de Color por Carga de Trabajo -->
        <div class="workload-legend">
          <div class="legend-item free">
            <div class="legend-dot"></div>
            <span>Libre (0-20%)</span>
          </div>
          <div class="legend-item light">
            <div class="legend-dot"></div>
            <span>Carga Ligera (20-40%)</span>
          </div>
          <div class="legend-item moderate">
            <div class="legend-dot"></div>
            <span>Carga Moderada (40-60%)</span>
          </div>
          <div class="legend-item heavy">
            <div class="legend-dot"></div>
            <span>Carga Pesada (60-80%)</span>
          </div>
          <div class="legend-item critical">
            <div class="legend-dot"></div>
            <span>Crítico (80-100%)</span>
          </div>
          <div class="legend-item overloaded">
            <div class="legend-dot"></div>
            <span>Requiere Contratación (+100%)</span>
          </div>
        </div>

        <div class="gantt-container">
          <GanttChartComponent :title="ganttTitle" :rows="ganttRows" :chart-start="chartStart" :chart-end="chartEnd"
            :precision="precision" :can-create-tasks="canCreateTasks" :can-edit-tasks="canEditTasks"
            :can-delete-tasks="canDeleteTasks" :show-controls="showControls" :task-types="taskTypes"
            :loading="ganttLoading" :show-current-time="showCurrentTime" @task-click="handleTaskClick"
            @task-create="handleTaskCreate" @task-edit="handleTaskEdit" @task-delete="handleTaskDelete"
            @task-drop="handleTaskDrop" @time-unit-change="handleTimeUnitChange" />
        </div>
      </div>
    </main>
  </div>
</template>

<style src="src/assets/EstiloBase.css" ></style>
<script src="./scripts/ProductionPlanning.js"></script>
<style src="src/components/VistasCoordinador/styles/ProductionPlanning.css"></style>
