<template>
  <div class="maintenance-calendar">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="title-section">
          <i class="material-icons">schedule</i>
          <h1>Programación de Mantenimientos</h1>
        </div>
        <p class="subtitle">Gestiona y visualiza los mantenimientos programados por fecha de creación</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando mantenimientos...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <div class="error-message">
        <i class="material-icons">error</i>
        <p>{{ error }}</p>
        <button @click="fetchMaintenances" class="retry-button">Reintentar</button>
      </div>
    </div>

    <div v-if="!loading && !error" class="calendar-container">
      <!-- Calendario Principal -->
      <div class="calendar-section">
        <div class="calendar-card">
          <!-- Controles del calendario -->
          <div class="calendar-header">
            <button @click="changeMonth(-1)" class="nav-button">
              <i class="material-icons">chevron_left</i>
            </button>
            
            <h2 class="month-title">
              {{ months[currentDate.getMonth()] }} {{ currentDate.getFullYear() }}
            </h2>
            
            <button @click="changeMonth(1)" class="nav-button">
              <i class="material-icons">chevron_right</i>
            </button>
          </div>

          <!-- Días de la semana -->
          <div class="weekdays">
            <div v-for="day in dayNames" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>

          <!-- Días del calendario -->
          <div class="calendar-grid">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="getDayClasses(day)"
              @click="selectDay(day)"
            >
              <div class="day-header">
                <span class="day-number">{{ day.getDate() }}</span>
                <span v-if="getMaintenancesForDate(day).length > 0" class="maintenance-count">
                  {{ getMaintenancesForDate(day).length }}
                </span>
              </div>
              
              <!-- Mantenimientos del día -->
              <div class="day-maintenances">
                <div
                  v-for="maintenance in getMaintenancesForDate(day).slice(0, 2)"
                  :key="maintenance.id"
                  @click.stop="selectMaintenance(maintenance)"
                  class="maintenance-item"
                >
                  <div class="maintenance-content">
                    <div :class="['priority-dot', `priority-${getPriorityClass(maintenance.prioridad)}`]"></div>
                    <span class="maintenance-title">{{ maintenance.descripcion || maintenance.tipo_mantenimiento || 'Sin descripción' }}</span>
                  </div>
                </div>
                <div v-if="getMaintenancesForDate(day).length > 2" class="more-items">
                  +{{ getMaintenancesForDate(day).length - 2 }} más
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel lateral -->
      <div class="sidebarP">
        <!-- Leyenda de prioridades -->
        <div class="sidebar-card">
          <h3>Prioridades</h3>
          <div class="priority-legend">
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
        <div class="sidebar-card">
          <h3>Resumen del Mes</h3>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total Mantenimientos</span>
              <span class="stat-value total">{{ maintenances.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Programados</span>
              <span class="stat-value programados">{{ getStatusCount('programado') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">En Progreso</span>
              <span class="stat-value progreso">{{ getStatusCount('en_progreso') }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Completados</span>
              <span class="stat-value completados">{{ getStatusCount('completado') }}</span>
            </div>
          </div>
        </div>

        <!-- Próximos mantenimientos -->
        <div class="sidebar-card">
          <h3>Mantenimientos Recientes</h3>
          <div class="upcoming-list">
            <div
              v-for="maintenance in maintenances.slice(0, 5)"
              :key="maintenance.id"
              @click="selectMaintenance(maintenance)"
              class="upcoming-item"
            >
              <div class="upcoming-header">
                <div :class="['priority-dot', `priority-${getPriorityClass(maintenance.prioridad)}`]"></div>
                <span class="upcoming-title">{{ maintenance.descripcion || maintenance.tipo_mantenimiento || 'Sin descripción' }}</span>
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

    <!-- Modal de detalles -->
    <div v-if="selectedMaintenance" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Mantenimiento</h3>
          <button @click="closeModal" class="close-button">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <h4>{{ selectedMaintenance.descripcion || selectedMaintenance.tipo_mantenimiento || 'Mantenimiento' }}</h4>
            <div class="priority-badge">
              <div :class="['priority-dot', `priority-${getPriorityClass(selectedMaintenance.prioridad)}`]"></div>
              <span>{{ formatPriority(selectedMaintenance.prioridad) }} prioridad</span>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">
                <i class="material-icons">event</i>
                Fecha de Creación
              </div>
              <p>{{ formatDate(selectedMaintenance.fecha_creacion) }}</p>
            </div>

            <div class="detail-item" v-if="selectedMaintenance.fecha_programada">
              <div class="detail-label">
                <i class="material-icons">schedule</i>
                Fecha Programada
              </div>
              <p>{{ formatDate(selectedMaintenance.fecha_programada) }}</p>
            </div>
          </div>

          <div class="detail-item" v-if="selectedMaintenance.tecnico_asignado">
            <div class="detail-label">
              <i class="material-icons">person</i>
              Técnico Asignado
            </div>
            <p>{{ selectedMaintenance.tecnico_asignado }}</p>
          </div>

          <div class="detail-item" v-if="selectedMaintenance.equipo">
            <div class="detail-label">
              <i class="material-icons">build</i>
              Equipo
            </div>
            <p>{{ selectedMaintenance.equipo }}</p>
          </div>

          <div class="detail-item" v-if="selectedMaintenance.tipo_mantenimiento">
            <div class="detail-label">
              <i class="material-icons">settings</i>
              Tipo de Mantenimiento
            </div>
            <p>{{ selectedMaintenance.tipo_mantenimiento }}</p>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <i class="material-icons">info</i>
              Estado
            </div>
            <span :class="['status-badge', `status-${getStatusClass(selectedMaintenance.estado)}`]">
              {{ formatStatus(selectedMaintenance.estado) }}
            </span>
          </div>

          <div class="detail-item" v-if="selectedMaintenance.observaciones">
            <div class="detail-label">
              <i class="material-icons">notes</i>
              Observaciones
            </div>
            <p>{{ selectedMaintenance.observaciones }}</p>
          </div>

          <!-- Mostrar todos los campos adicionales -->
          <div class="additional-details">
            <h5>Información Adicional</h5>
            <div class="json-details">
              <pre>{{ JSON.stringify(selectedMaintenance, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary">Editar</button>
          <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script src ="./script/Programacion.js"></script>
<style src="./style/Programacion.css" scoped></style>