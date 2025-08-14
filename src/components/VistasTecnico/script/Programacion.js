import axios from 'axios'

export default {
  name: 'MaintenanceCalendar',
  data() {
    return {
      currentDate: new Date(),
      selectedMaintenance: null,
      maintenances: [],
      herramientas: [],
      tipoMantenimientos: [],
      estadosMantenimiento: [],
      prioridadesMantenimiento: [],
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
    await this.fetchSupportingData();
    await this.fetchMaintenances();
  },
  methods: {
    async fetchMaintenances() {
      this.loading = true;
      this.error = null;
      
      try {
        // Cargar mantenimientos desde la API
        const response = await axios.get('/api/Mantenimiento');
        this.maintenances = response.data.map(maintenance => ({
          ...maintenance,
          // Enriquecer datos con información de relaciones
          herramienta_info: this.herramientas.find(h => h.id === maintenance.herramienta_id),
          tipo_mantenimiento_info: this.tipoMantenimientos.find(tm => tm.id === maintenance.tipo_mantenimiento_id),
          estado_info: this.estadosMantenimiento.find(em => em.id === parseInt(maintenance.estado_id)),
          prioridad_info: this.prioridadesMantenimiento.find(pm => pm.id === parseInt(maintenance.prioridad_id))
        }));
        
        console.log('Mantenimientos cargados:', this.maintenances);
      } catch (error) {
        console.error('Error al cargar mantenimientos:', error);
        this.error = 'Error al cargar los mantenimientos. Verifique la conexión con la API.';
        
        // Si falla la API, usar datos de prueba basados en la estructura real
        this.maintenances = [
          {
            id: "1",
            nombre: "Mantenimiento preventivo MIG-200",
            herramienta_id: "1",
            tipo_mantenimiento_id: 1,
            fecha_programada: "2025-06-01",
            fecha_inicio: "2025-06-01T14:00:00.000Z",
            fecha_fin: "2025-06-01T18:30:00.000Z",
            estado_id: "3",
            prioridad_id: "5",
            costo_estimado: "250.00",
            costo_real: "225.50",
            tecnico_asignado_id: "3",
            descripcion_problema: "Mantenimiento rutinario trimestral",
            acciones_realizadas: "Limpieza completa, lubricación, revisión eléctrica",
            repuestos_utilizados: ["Aceite lubricante", "Filtros de aire", "Cables de conexión"],
            horas_trabajo: "4.5",
            fecha_creacion: "2025-05-25T16:00:00.000Z"
          }
        ];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSupportingData() {
      try {
        // Cargar datos de apoyo en paralelo
        const [herramientasRes, tipoMantenimientosRes, estadosRes, prioridadesRes] = await Promise.all([
          axios.get('/api/Herramienta'),
          axios.get('/api/Tipo_Mantenimiento'),
          axios.get('/api/EstadoMantenimiento'),
          axios.get('/api/Prioridad_Mantenimiento')
        ]);
        
        this.herramientas = herramientasRes.data;
        this.tipoMantenimientos = tipoMantenimientosRes.data;
        this.estadosMantenimiento = estadosRes.data;
        this.prioridadesMantenimiento = prioridadesRes.data;
        
        console.log('Datos de apoyo cargados:', {
          herramientas: this.herramientas.length,
          tipos: this.tipoMantenimientos.length,
          estados: this.estadosMantenimiento.length,
          prioridades: this.prioridadesMantenimiento.length
        });
      } catch (error) {
        console.error('Error al cargar datos de apoyo:', error);
        // Datos de apoyo por defecto basados en los proporcionados
        this.herramientas = [
          {id: "1", nombre: "Soldadora MIG-200"},
          {id: "2", nombre: "Soldadora TIG-ACDC"},
          {id: "3", nombre: "Esmeril angular 7\""},
          {id: "4", nombre: "Cortadora plasma 40A"},
          {id: "5", nombre: "Soplete oxicorte"}
        ];
        
        this.tipoMantenimientos = [
          {id: 1, nombre: "Preventivo"},
          {id: 2, nombre: "Correctivo"},
          {id: 3, nombre: "Calibración"},
          {id: 4, nombre: "Limpieza"},
          {id: 5, nombre: "Revisión Seguridad"}
        ];
        
        this.estadosMantenimiento = [
          {id: 1, nombre_estado: "Pendiente"},
          {id: 2, nombre_estado: "En Proceso"},
          {id: 3, nombre_estado: "Completado"},
          {id: 4, nombre_estado: "Cancelado"},
          {id: 5, nombre_estado: "Reprogramado"}
        ];
        
        this.prioridadesMantenimiento = [
          {id: 1, nombre_prioridad: "Crítica"},
          {id: 2, nombre_prioridad: "Alta"},
          {id: 3, nombre_prioridad: "Media"},
          {id: 4, nombre_prioridad: "Baja"},
          {id: 5, nombre_prioridad: "Programada"}
        ];
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
      return this.maintenances.filter(m => {
        const estadoInfo = this.estadosMantenimiento.find(e => e.id === parseInt(m.estado_id));
        return this.mapEstadoToStatusClass(estadoInfo?.nombre_estado) === status;
      }).length;
    },
    
    getPriorityCount(priority) {
      return this.maintenances.filter(m => {
        const prioridadInfo = this.prioridadesMantenimiento.find(p => p.id === parseInt(m.prioridad_id));
        return this.mapPrioridadToPriorityClass(prioridadInfo?.nombre_prioridad) === priority;
      }).length;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'No especificada';
      return new Date(dateString).toLocaleDateString('es-ES');
    },
    
    formatStatus(status) {
      if (!status) return 'Sin estado';
      
      // Si es un ID de estado, buscar el nombre
      if (typeof status === 'string' && !isNaN(status)) {
        const estadoInfo = this.estadosMantenimiento.find(e => e.id === parseInt(status));
        return estadoInfo?.nombre_estado || 'Estado desconocido';
      }
      
      return status;
    },
    
    formatPriority(priority) {
      if (!priority) return 'Sin prioridad';
      
      // Si es un ID de prioridad, buscar el nombre
      if (typeof priority === 'string' && !isNaN(priority)) {
        const prioridadInfo = this.prioridadesMantenimiento.find(p => p.id === parseInt(priority));
        return prioridadInfo?.nombre_prioridad || 'Prioridad desconocida';
      }
      
      return priority;
    },
    
    getPriorityClass(priority) {
      let prioridadNombre = priority;
      
      // Si es un ID, buscar el nombre
      if (typeof priority === 'string' && !isNaN(priority)) {
        const prioridadInfo = this.prioridadesMantenimiento.find(p => p.id === parseInt(priority));
        prioridadNombre = prioridadInfo?.nombre_prioridad;
      }
      
      return this.mapPrioridadToPriorityClass(prioridadNombre);
    },
    
    getStatusClass(status) {
      let estadoNombre = status;
      
      // Si es un ID, buscar el nombre
      if (typeof status === 'string' && !isNaN(status)) {
        const estadoInfo = this.estadosMantenimiento.find(e => e.id === parseInt(status));
        estadoNombre = estadoInfo?.nombre_estado;
      }
      
      return this.mapEstadoToStatusClass(estadoNombre);
    },
    
    mapPrioridadToPriorityClass(nombrePrioridad) {
      if (!nombrePrioridad) return 'baja';
      
      const priorityMap = {
        'crítica': 'critica',
        'alta': 'alta',
        'media': 'media',
        'baja': 'baja',
        'programada': 'programada'
      };
      
      return priorityMap[nombrePrioridad.toLowerCase()] || 'baja';
    },
    
    mapEstadoToStatusClass(nombreEstado) {
      if (!nombreEstado) return 'pendiente';
      
      const statusMap = {
        'pendiente': 'programado',
        'en proceso': 'en_progreso',
        'completado': 'completado',
        'cancelado': 'cancelado',
        'reprogramado': 'programado'
      };
      
      return statusMap[nombreEstado.toLowerCase()] || 'programado';
    },
    
    getHerramientaNombre(herramientaId) {
      const herramienta = this.herramientas.find(h => h.id === herramientaId);
      return herramienta?.nombre || 'Herramienta desconocida';
    },
    
    getTipoMantenimientoNombre(tipoId) {
      const tipo = this.tipoMantenimientos.find(t => t.id === tipoId);
      return tipo?.nombre || 'Tipo desconocido';
    }
  }
}