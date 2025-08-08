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