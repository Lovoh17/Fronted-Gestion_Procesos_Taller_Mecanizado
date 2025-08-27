<template>
  <!-- Header -->
  <div class="header">
    <div class="header-content">
      <div class="title-section">
        <i class="material-icons">schedule</i>
        <h1>Programación de Mantenimientos</h1>
      </div>
      <p class="subtitle">Gestiona y visualiza los mantenimientos programados con calendario avanzado</p>
    </div>
  </div>

  <!-- Panel horizontal con estadísticas -->
  <div v-if="!loading && !error" class="horizontal-stats-container">
    <div class="horizontal-stats-panel">
      <!-- Leyenda de prioridades -->
      <div class="horizontal-card">
        <h3>Prioridades</h3>
        <div class="horizontal-priority-legend">
          <div class="priority-item">
            <div class="priority-dot priority-alta"></div>
            <span>Alta</span>
          </div>
          <div class="priority-item">
            <div class="priority-dot priority-media"></div>
            <span>Media</span>
          </div>
          <div class="priority-item">
            <div class="priority-dot priority-baja"></div>
            <span>Baja</span>
          </div>
        </div>
      </div>

      <!-- Estadísticas del mes -->
      <div class="horizontal-card">
        <h3>Resumen General</h3>
        <div class="horizontal-stats">
          <div class="horizontal-stat-item">
            <div class="stat-value total">{{ maintenances.length }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="horizontal-stat-item">
            <div class="stat-value programados">{{ getStatusCount('programado') }}</div>
            <div class="stat-label">Programados</div>
          </div>
          <div class="horizontal-stat-item">
            <div class="stat-value progreso">{{ getStatusCount('en_progreso') }}</div>
            <div class="stat-label">En Progreso</div>
          </div>
          <div class="horizontal-stat-item">
            <div class="stat-value completados">{{ getStatusCount('completado') }}</div>
            <div class="stat-label">Completados</div>
          </div>
        </div>
      </div>

      <!-- Mantenimientos recientes -->
      <div class="horizontal-card recent-card">
        <h3>Mantenimientos Recientes</h3>
        <div class="horizontal-upcoming-list">
          <div v-for="maintenance in maintenances.slice(0, 3)" :key="maintenance.id"
            @click="selectMaintenance(maintenance)" class="horizontal-upcoming-item">
            <div class="upcoming-header">
              <div :class="['priority-dot', `priority-${getPriorityClass(maintenance.prioridad_id)}`]"></div>
              <span class="upcoming-title">{{ maintenance.nombre || maintenance.descripcion_problema ||
                getTipoMantenimientoNombre(maintenance.tipo_mantenimiento_id) }}</span>
            </div>
            <div class="upcoming-date">
              <i class="material-icons">event</i>
              {{ formatDate(maintenance.fecha_creacion) }}
            </div>
          </div>
          <div v-if="maintenances.length === 0" class="no-data">
            <p>No hay mantenimientos registrados</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- FullCalendar Component -->
  <div class="calendar-container">
    <ProgramacionFullCalendarComponent />
  </div>

  <!-- Maintenance Details Modal -->
  <MaintenanceDetailsModal :visible="showModal" :maintenance="selectedMaintenance" :herramientas="herramientas"
    :tipo-mantenimientos="tipoMantenimientos" :estados-mantenimiento="estadosMantenimiento"
    :prioridades-mantenimiento="prioridadesMantenimiento" @close="closeModal" @edit="editMaintenance" />
</template>

<script src="./script/Programacion.js"></script>
<style src="src/assets/Programacion.css" scoped></style>
<style src="src/assets/EstiloBase.css" scoped></style>