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

<script>
import axios from 'axios'

export default {
  name: 'MaintenanceCalendar',
  data() {
    return {
      currentDate: new Date(),
      selectedMaintenance: null,
      maintenances: [],
      loading: true,
      error: null,
      months: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      dayNames: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    }
  },
  computed: {
    calendarDays() {
      const days = [];
      const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
      
      const current = new Date(startDate);
      for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    }
  },
  async mounted() {
    await this.fetchMaintenances();
  },
  methods: {
    async fetchMaintenances() {
      this.loading = true;
      this.error = null;
      
      try {
        // Ajusta la URL base según tu configuración
        const response = await axios.get('/api/Mantenimiento');
        this.maintenances = response.data;
        console.log('Mantenimientos cargados:', this.maintenances);
      } catch (error) {
        console.error('Error al cargar mantenimientos:', error);
        this.error = 'Error al cargar los mantenimientos. Verifique la conexión con la API.';
        
        // Si falla la API, usar datos de prueba
        this.maintenances = [
          {
            id: 1,
            descripcion: 'Mantenimiento Preventivo - Servidor Principal',
            fecha_creacion: '2025-06-25',
            tecnico_asignado: 'Juan Pérez',
            prioridad: 'alta',
            estado: 'programado',
            tipo_mantenimiento: 'Preventivo',
            equipo: 'Servidor Dell PowerEdge R740'
          }
        ];
      } finally {
        this.loading = false;
      }
    },
    changeMonth(increment) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + increment, 1);
    },
    getMaintenancesForDate(date) {
      const dateStr = date.toISOString().split('T')[0];
      return this.maintenances.filter(m => {
        const creationDate = new Date(m.fecha_creacion).toISOString().split('T')[0];
        return creationDate === dateStr;
      });
    },
    getDayClasses(day) {
      const isCurrentMonth = day.getMonth() === this.currentDate.getMonth();
      const isToday = day.toDateString() === new Date().toDateString();
      
      return [
        'calendar-day',
        {
          'current-month': isCurrentMonth,
          'other-month': !isCurrentMonth,
          'today': isToday
        }
      ];
    },
    selectDay(day) {
      const maintenancesForDay = this.getMaintenancesForDate(day);
      if (maintenancesForDay.length === 1) {
        this.selectMaintenance(maintenancesForDay[0]);
      }
    },
    selectMaintenance(maintenance) {
      this.selectedMaintenance = maintenance;
    },
    closeModal() {
      this.selectedMaintenance = null;
    },
    getStatusCount(status) {
      return this.maintenances.filter(m => 
        this.getStatusClass(m.estado) === status
      ).length;
    },
    getPriorityCount(priority) {
      return this.maintenances.filter(m => 
        this.getPriorityClass(m.prioridad) === priority
      ).length;
    },
    formatDate(dateString) {
      if (!dateString) return 'No especificada';
      return new Date(dateString).toLocaleDateString('es-ES');
    },
    formatStatus(status) {
      if (!status) return 'Sin estado';
      
      const statusMap = {
        'programado': 'Programado',
        'en_progreso': 'En Progreso',
        'completado': 'Completado',
        'cancelado': 'Cancelado',
        'pendiente': 'Pendiente',
        'finalizado': 'Finalizado'
      };
      return statusMap[status.toLowerCase()] || status;
    },
    formatPriority(priority) {
      if (!priority) return 'Sin prioridad';
      
      const priorityMap = {
        'alta': 'Alta',
        'media': 'Media',
        'baja': 'Baja',
        'high': 'Alta',
        'medium': 'Media',
        'low': 'Baja'
      };
      return priorityMap[priority.toLowerCase()] || priority;
    },
    getPriorityClass(priority) {
      if (!priority) return 'baja';
      
      const priorityClass = {
        'alta': 'alta',
        'media': 'media',
        'baja': 'baja',
        'high': 'alta',
        'medium': 'media',
        'low': 'baja'
      };
      return priorityClass[priority.toLowerCase()] || 'baja';
    },
    getStatusClass(status) {
      if (!status) return 'programado';
      
      const statusClass = {
        'programado': 'programado',
        'en_progreso': 'en_progreso',
        'completado': 'completado',
        'cancelado': 'cancelado',
        'pendiente': 'programado',
        'finalizado': 'completado',
        'en progreso': 'en_progreso'
      };
      return statusClass[status.toLowerCase()] || 'programado';
    }
  }
}
</script>

<style scoped>
.maintenance-calendar {
  max-width: auto;
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 24px;
}


.header {
  margin-bottom: 32px;
}

.header-content {
  max-width: auto;
  margin: 0 auto;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.title-section i {
  font-size: 32px;
  color: #3b82f6;
}

.title-section h1 {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #dc2626;
  max-width: 400px;
}

.error-message i {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-button:hover {
  background: #b91c1c;
}

.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.calendar-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.nav-button {
  padding: 8px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: #f3f4f6;
}

.nav-button i {
  color: #6b7280;
}

.month-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-day.current-month {
  background: white;
}

.calendar-day.current-month:hover {
  background-color: #f9fafb;
}

.calendar-day.other-month {
  background-color: #f9fafb;
  color: #9ca3af;
}

.calendar-day.today {
  border: 2px solid #3b82f6;
  background-color: #eff6ff;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
}

.today .day-number {
  color: #3b82f6;
}

.maintenance-count {
  background-color: #3b82f6;
  color: white;
  font-size: 12px;
  border-radius: 50%;
  padding: 2px 6px;
  min-width: 20px;
  text-align: center;
}

.day-maintenances {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.maintenance-item {
  font-size: 12px;
  padding: 6px;
  border-radius: 4px;
  background-color: #dbeafe;
  color: #1e40af;
  cursor: pointer;
  transition: background-color 0.2s;
}

.maintenance-item:hover {
  background-color: #bfdbfe;
}

.maintenance-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.maintenance-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-items {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  padding: 4px;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-alta {
  background-color: #ef4444;
}

.priority-media {
  background-color: #eab308;
}

.priority-baja {
  background-color: #22c55e;
}

.sidebarP {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-card {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px;
}

.sidebar-card:last-child {
  border-bottom: none;
}

.sidebar-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.priority-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.priority-item span {
  font-size: 14px;
  color: #374151;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-value {
  font-weight: 700;
  font-size: 20px;
}

.stat-value.total {
  color: #2563eb;
}

.stat-value.programados {
  color: #16a34a;
}

.stat-value.progreso {
  color: #d97706;
}

.stat-value.completados {
  color: #059669;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-item {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upcoming-item:last-child {
  border-bottom: none;
}

.upcoming-item:hover {
  background-color: #f9fafb;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.upcoming-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.upcoming-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.upcoming-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.upcoming-date i {
  font-size: 12px;
}

.no-data {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0 24px;
  margin-bottom: 16px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
}

.close-button:hover {
  color: #6b7280;
}

.modal-body {
  padding: 0 24px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h4 {
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.priority-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-badge span {
  font-size: 14px;
  color: #6b7280;
  text-transform: capitalize;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.detail-label i {
  font-size: 16px;
}

.detail-item p {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.status-badge {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.status-programado {
  color: #1d4ed8;
  background-color: #dbeafe;
}

.status-en_progreso {
  color: #d97706;
  background-color: #fed7aa;
}

.status-completado {
  color: #059669;
  background-color: #d1fae5;
}

.status-cancelado {
  color: #dc2626;
  background-color: #fee2e2;
}

.additional-details {
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.additional-details h5 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.json-details {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.json-details pre {
  font-size: 12px;
  color: #374151;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  margin-top: 16px;
}

.btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

@media (max-width: 1024px) {
  .calendar-container {
    grid-template-columns: 1fr;
  }
  
  .sidebarP {
    order: -1;
  }
}

@media (max-width: 768px) {
  .maintenance-calendar {
    padding: 16px;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }
  
  .maintenance-item {
    font-size: 10px;
    padding: 4px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-width: 95vw;
    margin: 20px;
  }
}
</style>