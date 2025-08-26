import axios from 'axios'
import { VueGoodTable } from 'vue-good-table-next'
import 'vue-good-table-next/dist/vue-good-table-next.css'

export default {
  name: 'AlertasDashboard',
  components: {
    VueGoodTable
  },
  
  data() {
    return {
      // Datos básicos
      alertas: [],
      tiposAlerta: [],
      herramientas: [],
      prioridades: [], // Removido datos de prueba
      loading: false,
      searchQuery: '',
      showFilters: true,
      viewMode: 'table',
      selectedAlerta: null,
      showNewAlertaModal: false,
      
      // Filtros - Inicializar con valores válidos
      tipoAlertaFilter: null,
      statusFilters: {
        '0': true, // Pendiente
        '1': true, // Resuelta
        '2': true, // En proceso (si existe)
      },
      dateRange: {
        start: '',
        end: ''
      },
      prioridadFilter: null,
      herramientaFilter: null,
      
      // Configuración de columnas - CORREGIDA
      tableColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Herramienta',
          field: 'herramienta_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por herramienta'
          }
        },
        {
          label: 'Tipo de Alerta',
          field: 'tipo_alerta_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por tipo'
          }
        },
        {
          label: 'Descripción',
          field: 'descripcion',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por descripción'
          }
        },
        {
          label: 'Estado',
          field: 'estado_reparacion',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: '0', text: 'Pendiente' },
              { value: '1', text: 'Resuelta' },
              { value: '2', text: 'En Proceso' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Prioridad',
          field: 'prioridad_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por prioridad'
          }
        },
        {
          label: 'F. Generación',
          field: 'fecha_generacion',
          type: 'string',
          sortable: true
        },
        {
          label: 'F. Límite',
          field: 'fecha_limite',
          type: 'string',
          sortable: true
        },
        {
          label: 'Resuelta Por',
          field: 'resuelta_por',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por técnico'
          }
        },
        {
          label: 'F. Resolución',
          field: 'fecha_resolucion',
          type: 'string',
          sortable: true
        },
        {
          label: 'Acciones',
          field: 'actions',
          type: 'string',
          sortable: false,
          width: '150px',
          tdClass: 'text-center'
        }
      ]
    }
  },

  computed: {
    // Filtros aplicados
    filteredAlertas() {
      if (!Array.isArray(this.alertas)) {
        return [];
      }

      return this.alertas.filter(alerta => {
        // Filtro por tipo de alerta
        const matchesType = !this.tipoAlertaFilter || 
                           alerta.tipo_alerta_id == this.tipoAlertaFilter;
        
        // Filtro por estado
        const matchesStatus = this.statusFilters[alerta.estado_reparacion?.toString()] !== false;
        
        // Filtro por prioridad
        const matchesPriority = !this.prioridadFilter || 
                               alerta.prioridad_id == this.prioridadFilter;
        
        // Filtro por herramienta
        const matchesHerramienta = !this.herramientaFilter || 
                                  alerta.herramienta_id == this.herramientaFilter;
        
        // Filtro por búsqueda
        const matchesSearch = !this.searchQuery ||
          (alerta.descripcion && alerta.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (alerta.herramienta_nombre && alerta.herramienta_nombre.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (alerta.tipo_alerta_nombre && alerta.tipo_alerta_nombre.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (alerta.resuelta_por && alerta.resuelta_por.toLowerCase().includes(this.searchQuery.toLowerCase()));
          
        // Filtro por fecha
        const matchesDate = (!this.dateRange.start || new Date(alerta.fecha_generacion) >= new Date(this.dateRange.start)) &&
                          (!this.dateRange.end || new Date(alerta.fecha_generacion) <= new Date(this.dateRange.end));
        
        return matchesType && matchesStatus && matchesPriority && matchesHerramienta && matchesSearch && matchesDate;
      });
    },
    
    // Estadísticas para cards
    totalReports() {
      return Array.isArray(this.alertas) ? this.alertas.length : 0;
    },
    
    pendingReports() {
      return Array.isArray(this.alertas) 
        ? this.alertas.filter(alerta => alerta.estado_reparacion === '0').length 
        : 0;
    },
    
    inProgressReports() {
      return Array.isArray(this.alertas) 
        ? this.alertas.filter(alerta => alerta.estado_reparacion === '2').length 
        : 0;
    },
    
    generatedReports() {
      return Array.isArray(this.alertas) 
        ? this.alertas.filter(alerta => alerta.estado_reparacion === '1').length 
        : 0;
    },

    // Estadísticas para alertas (alias)
    totalAlertas() {
      return this.totalReports;
    },
    
    alertasActivas() {
      return this.pendingReports;
    },
    
    alertasPendientes() {
      return this.pendingReports;
    },
    
    alertasEnProceso() {
      return this.inProgressReports;
    },
    
    alertasResueltas() {
      return this.generatedReports;
    },
    
    alertasCriticas() {
      return Array.isArray(this.alertas) 
        ? this.alertas.filter(alerta => this.isAlertaCritica(alerta)).length 
        : 0;
    },

    // Opciones para el filtro de tipos de alerta
    tipoAlertaOptions() {
      const options = [{ text: 'Todos los tipos', value: null }];
      
      if (Array.isArray(this.tiposAlerta)) {
        this.tiposAlerta.forEach(tipo => {
          options.push({
            text: tipo.nombre || tipo.tipo_alerta || `Tipo ${tipo.id}`,
            value: tipo.id
          });
        });
      }
      
      return options;
    },

    // Opciones para el filtro de herramientas
    herramientaOptions() {
      const options = [{ text: 'Todas las herramientas', value: null }];
      
      if (Array.isArray(this.herramientas)) {
        this.herramientas.forEach(herramienta => {
          options.push({
            text: herramienta.nombre || `Herramienta ${herramienta.id}`,
            value: herramienta.id
          });
        });
      }
      
      return options;
    },

    // Opciones para el filtro de prioridades
    prioridadOptions() {
      const options = [{ text: 'Todas las prioridades', value: null }];
      
      if (Array.isArray(this.prioridades)) {
        this.prioridades.forEach(prioridad => {
          options.push({
            text: prioridad.nombre || `Prioridad ${prioridad.id}`,
            value: prioridad.id
          });
        });
      }
      
      return options;
    },

    // Contadores de filtros activos
    hasActiveFilters() {
      return this.tipoAlertaFilter !== null ||
             this.prioridadFilter !== null ||
             this.herramientaFilter !== null ||
             this.dateRange.start !== '' ||
             this.dateRange.end !== '' ||
             this.searchQuery !== '' ||
             !Object.values(this.statusFilters).every(val => val === true);
    },
    
    activeFiltersCount() {
      let count = 0;
      if (this.tipoAlertaFilter !== null) count++;
      if (this.prioridadFilter !== null) count++;
      if (this.herramientaFilter !== null) count++;
      if (this.dateRange.start !== '') count++;
      if (this.dateRange.end !== '') count++;
      if (this.searchQuery !== '') count++;
      if (!Object.values(this.statusFilters).every(val => val === true)) count++;
      return count;
    },

    // Para compatibilidad con el template de reportes
    filteredReports() {
      return this.filteredAlertas;
    },

    // Método auxiliar para calcular días desde detección
    diasDesdeDeteccion() {
      return (fecha) => {
        if (!fecha) return 0;
        const ahora = new Date();
        const fechaLimite = new Date(fecha);
        const diferencia = Math.floor((ahora - fechaLimite) / (1000 * 60 * 60 * 24));
        return diferencia;
      };
    }
  },

  methods: {
    // Métodos de carga de datos
    async loadAlertas() {
      try {
        this.loading = true;
        
        const response = await axios.get('/api/AlertaReparacion', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        let alertas = Array.isArray(response.data) ? response.data : [];
        
        // Enriquecer alertas con nombres de relaciones
        alertas = await this.enrichAlertasData(alertas);
        
        this.alertas = alertas;
        
        console.log('Alertas cargadas:', alertas);
        
      } catch (error) {
        console.error('Error cargando alertas:', error);
        this.showToast('Error al cargar alertas de reparación', 'error');
        this.alertas = [];
      } finally {
        this.loading = false;
      }
    },

    // Enriquecer datos de alertas con nombres de las relaciones
    async enrichAlertasData(alertas) {
      return alertas.map(alerta => ({
        ...alerta,
        tipo_alerta_nombre: this.getTipoAlertaNombre(alerta.tipo_alerta_id),
        herramienta_nombre: this.getHerramientaNombre(alerta.herramienta_id),
        prioridad_nombre: this.getPrioridadNombre(alerta.prioridad_id),
        estado_nombre: this.getEstadoNombre(alerta.estado_reparacion)
      }));
    },
    
    async loadTiposAlerta() {
      try {
        const response = await axios.get('/api/Tipos_Alertas', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        this.tiposAlerta = Array.isArray(response.data) ? response.data : [];
        
      } catch (error) {
        console.error('Error cargando tipos de alerta:', error);
        this.showToast('Error al cargar tipos de alerta', 'error');
        this.tiposAlerta = [];
      }
    },

    // Cargar herramientas
    async loadHerramientas() {
      try {
        const response = await axios.get('/api/Herramienta', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        this.herramientas = Array.isArray(response.data) ? response.data : [];
        
      } catch (error) {
        console.error('Error cargando herramientas:', error);
        this.herramientas = [];
      }
    },

    // Cargar prioridades desde API
    async loadPrioridades() {
      try {
        const response = await axios.get('/api/Prioridades', {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        this.prioridades = Array.isArray(response.data) ? response.data : [];
        
      } catch (error) {
        console.error('Error cargando prioridades:', error);
        this.prioridades = [];
      }
    },

    // Método para refrescar datos
    async refreshData() {
      try {
        await Promise.all([
          this.loadTiposAlerta(),
          this.loadHerramientas(),
          this.loadPrioridades()
        ]);
        
        // Cargar alertas después para poder enriquecer los datos
        await this.loadAlertas();
      } catch (error) {
        console.error('Error en refreshData:', error);
        // Intentar cargar alertas aunque fallen las otras APIs
        await this.loadAlertas();
      }
    },

    // Alias para compatibilidad con template de reportes
    async loadReports() {
      return this.loadAlertas();
    },
    
    // Métodos de UI
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    
    applyFilters() {
      this.showToast('Filtros aplicados', 'success');
    },
    
    resetFilters() {
      this.tipoAlertaFilter = null;
      this.prioridadFilter = null;
      this.herramientaFilter = null;
      this.searchQuery = '';
      this.dateRange = { start: '', end: '' };
      this.statusFilters = {
        '0': true,
        '1': true,
        '2': true
      };
      this.showToast('Filtros restablecidos', 'success');
    },
    
    // Métodos de acciones
    viewAlerta(alerta) {
      this.selectedAlerta = { ...alerta };
      console.log('Viendo alerta:', alerta);
    },

    viewReport(report) {
      return this.viewAlerta(report);
    },

    downloadReport(report) {
      console.log('Funcionalidad de descarga no implementada para alertas');
      this.showToast('Función de descarga no disponible para alertas', 'warning');
    },

    generateReport(report) {
      console.log('Funcionalidad de generación no implementada para alertas');
      this.showToast('Función de generación no disponible para alertas', 'warning');
    },

    async resolverAlerta(alertaId, resuelto_por) {
      try {
        const response = await axios.put(`/api/AlertaReparacion/${alertaId}`, {
          estado_reparacion: '1', // 1 = Resuelta
          fecha_resolucion: new Date().toISOString(),
          resuelta_por: resuelto_por
        }, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        
        // Actualizar la alerta en la lista local
        const index = this.alertas.findIndex(a => a.id === alertaId);
        if (index !== -1) {
          this.alertas[index] = { ...this.alertas[index], ...response.data };
        }
        
        this.showToast('Alerta resuelta exitosamente', 'success');
        
      } catch (error) {
        console.error('Error resolviendo alerta:', error);
        this.showToast('Error al resolver alerta', 'error');
      }
    },

    async deleteAlerta(alertaId) {
      if (confirm('¿Estás seguro de que deseas eliminar esta alerta?')) {
        try {
          await axios.delete(`/api/AlertaReparacion/${alertaId}`, {
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          });
          
          this.alertas = this.alertas.filter(a => a.id !== alertaId);
          this.showToast('Alerta eliminada', 'success');
          
        } catch (error) {
          console.error('Error eliminando alerta:', error);
          this.showToast('Error al eliminar alerta', 'error');
        }
      }
    },

    deleteReport(reportId) {
      return this.deleteAlerta(reportId);
    },
    
    // Métodos de formato y helpers
    formatStatus(estado) {
      const estados = {
        '0': 'Pendiente',
        '1': 'Resuelta', 
        '2': 'En Proceso'
      };
      return estados[estado?.toString()] || `Estado ${estado}`;
    },
    
    statusClass(estado) {
      return {
        '0': 'badge-warning',   // Pendiente
        '1': 'badge-success',   // Resuelta
        '2': 'badge-info'       // En Proceso
      }[estado?.toString()] || 'badge-secondary';
    },
    
    formatPriority(prioridad) {
      return this.getPrioridadNombre(prioridad) || `Prioridad ${prioridad}`;
    },
    
    priorityClass(prioridad) {
      return {
        '1': 'badge-secondary', // Baja
        '2': 'badge-info',      // Media
        '3': 'badge-warning',   // Alta
        '4': 'badge-danger'     // Crítica
      }[prioridad?.toString()] || 'badge-light';
    },

    formatReportType(tipo) {
      return this.getTipoAlertaNombre(tipo) || `Tipo ${tipo}`;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        return new Date(dateString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    },
    
    formatDateOnly(dateString) {
      if (!dateString) return '';
      try {
        return new Date(dateString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    },

    // Días desde detección
    diasDesdeDeteccion(fecha) {
      if (!fecha) return 0;
      const ahora = new Date();
      const fechaLimite = new Date(fecha);
      const diferencia = Math.floor((ahora - fechaLimite) / (1000 * 60 * 60 * 24));
      return diferencia;
    },

    // Verificar si una alerta es crítica
    isAlertaCritica(alerta) {
      return (alerta.prioridad_id == 4 && alerta.estado_reparacion !== '1') ||
             (this.isVencida(alerta.fecha_limite, alerta.estado_reparacion));
    },

    isVencida(fechaLimite, estado) {
      if (estado === '1') return false; // Si está resuelta, no está vencida
      if (!fechaLimite) return false;
      
      const now = new Date();
      const limite = new Date(fechaLimite);
      return now > limite;
    },
    
    // Métodos para obtener nombres de las relaciones
    getTipoAlertaNombre(tipoId) {
      const tipo = this.tiposAlerta.find(t => t.id == tipoId);
      return tipo ? (tipo.nombre || tipo.tipo_alerta) : null;
    },

    getHerramientaNombre(herramientaId) {
      const herramienta = this.herramientas.find(h => h.id == herramientaId);
      return herramienta ? herramienta.nombre : null;
    },

    getPrioridadNombre(prioridadId) {
      const prioridad = this.prioridades.find(p => p.id == prioridadId);
      return prioridad ? prioridad.nombre : null;
    },

    getEstadoNombre(estado) {
      return this.formatStatus(estado);
    },
    
    // Método para exportar
    exportToCSV() {
      try {
        if (this.$refs.vueGoodTable && this.filteredAlertas.length > 0) {
          const fileName = `alertas_reparacion_${new Date().toISOString().split('T')[0]}.csv`;
          this.$refs.vueGoodTable.exportCsv(fileName);
          this.showToast('Tabla exportada exitosamente', 'success');
        } else {
          this.showToast('No hay datos para exportar', 'warning');
        }
      } catch (error) {
        console.error('Error exportando CSV:', error);
        this.showToast('Error al exportar tabla', 'error');
      }
    },
    
    // Helper para obtener token de auth
    getAuthToken() {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
    },
    
    // Helper para mostrar notificaciones
    showToast(message, type = 'success') {
      console.log(`${type.toUpperCase()}: ${message}`);
      
      if (type === 'error') {
        console.error(message);
      } else {
        console.info(message);
      }
    }
  },

  async mounted() {
    try {
      await this.refreshData();
    } catch (error) {
      console.error('Error en mounted:', error);
      this.alertas = [];
      this.tiposAlerta = [];
      this.herramientas = [];
      this.prioridades = [];
    }
  },
  
  beforeUnmount() {
    // Limpiar cualquier interval o timeout si los tienes
  }
}