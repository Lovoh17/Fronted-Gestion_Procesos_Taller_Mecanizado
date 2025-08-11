import axios from 'axios'

export default {
  name: 'ReportsDashboard',
  
  data() {
    return {
      // Datos básicos
      reports: [],
      loading: false,
      searchQuery: '',
      showFilters: true,
      viewMode: 'table',
      selectedReport: null,
      showNewReportModal: false,
      
      // Filtros
      reportType: 'all',
      statusFilters: {
        pending: true,
        in_progress: true,
        resolved: true,
        generated: true
      },
      dateRange: {
        start: '',
        end: ''
      },
      priorityFilter: 'all',
      
      // Configuración de columnas para vue-good-table-next
      tableColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Tipo',
          field: 'tipo',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'produccion', text: 'Producción' },
              { value: 'calidad', text: 'Control de Calidad' },
              { value: 'mantenimiento', text: 'Mantenimiento' },
              { value: 'inventario', text: 'Inventario' },
              { value: 'costos', text: 'Costos' },
              { value: 'performance', text: 'Performance' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los tipos'
          }
        },
        {
          label: 'Título',
          field: 'titulo',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por título'
          }
        },
        {
          label: 'Estado',
          field: 'estado',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'pending', text: 'Pendiente' },
              { value: 'in_progress', text: 'En Proceso' },
              { value: 'generated', text: 'Generado' },
              { value: 'delivered', text: 'Entregado' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Prioridad',
          field: 'prioridad',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'baja', text: 'Baja' },
              { value: 'media', text: 'Media' },
              { value: 'alta', text: 'Alta' },
              { value: 'critica', text: 'Crítica' }
            ],
            filterMultiselect: false,
            placeholder: 'Todas las prioridades'
          }
        },
        {
          label: 'Solicitante',
          field: 'solicitante_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por solicitante'
          }
        },
        {
          label: 'F. Solicitud',
          field: 'fecha_solicitud',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd HH:mm:ss',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'F. Entrega',
          field: 'fecha_entrega_estimada',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'Progreso',
          field: 'progreso',
          type: 'number',
          sortable: true,
          width: '100px'
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '150px'
        }
      ]
    }
  },

  computed: {
    // Filtros aplicados
    filteredReports() {
      return this.reports.filter(report => {
        // Filtro por tipo
        const matchesType = this.reportType === 'all' || report.tipo === this.reportType;
        
        // Filtro por estado
        const matchesStatus = this.statusFilters[report.estado] !== false;
        
        // Filtro por prioridad
        const matchesPriority = this.priorityFilter === 'all' || report.prioridad === this.priorityFilter;
        
        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
          report.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          report.solicitante_nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
          
        // Filtro por fecha
        const matchesDate = (!this.dateRange.start || new Date(report.fecha_solicitud) >= new Date(this.dateRange.start)) &&
                          (!this.dateRange.end || new Date(report.fecha_solicitud) <= new Date(this.dateRange.end));
        
        return matchesType && matchesStatus && matchesPriority && matchesSearch && matchesDate;
      });
    },
    
    // Estadísticas para cards
    totalReports() {
      return this.reports.length;
    },
    
    pendingReports() {
      return this.reports.filter(report => report.estado === 'pending').length;
    },
    
    inProgressReports() {
      return this.reports.filter(report => report.estado === 'in_progress').length;
    },
    
    generatedReports() {
      return this.reports.filter(report => report.estado === 'generated' || report.estado === 'delivered').length;
    },
    
    // Contadores de filtros activos
    hasActiveFilters() {
      return this.reportType !== 'all' ||
             this.priorityFilter !== 'all' ||
             this.dateRange.start !== '' ||
             this.dateRange.end !== '' ||
             this.searchQuery !== '' ||
             !Object.values(this.statusFilters).every(val => val === true);
    },
    
    activeFiltersCount() {
      let count = 0;
      if (this.reportType !== 'all') count++;
      if (this.priorityFilter !== 'all') count++;
      if (this.dateRange.start !== '') count++;
      if (this.dateRange.end !== '') count++;
      if (this.searchQuery !== '') count++;
      if (!Object.values(this.statusFilters).every(val => val === true)) count++;
      return count;
    }
  },

  methods: {
    // Métodos de carga de datos
    async loadReports() {
      try {
        this.loading = true;
        
        // Simulamos datos realistas de reportes
        // En producción, esto vendría de una API
        this.reports = this.generateMockReports();
        
        // Si tienes una API real, descomenta esto:
        // const response = await axios.get('/api/reports');
        // this.reports = response.data;
        
      } catch (error) {
        console.error('Error cargando reportes:', error);
        this.showToast('Error al cargar reportes', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    // Genera datos mock para demostración
    generateMockReports() {
      const tipos = ['produccion', 'calidad', 'mantenimiento', 'inventario', 'costos', 'performance'];
      const estados = ['pending', 'in_progress', 'generated', 'delivered'];
      const prioridades = ['baja', 'media', 'alta', 'critica'];
      const solicitantes = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martín', 'Luis Rodríguez'];
      
      const reportes = [];
      
      for (let i = 1; i <= 30; i++) {
        const fechaSolicitud = new Date();
        fechaSolicitud.setDate(fechaSolicitud.getDate() - Math.floor(Math.random() * 90));
        
        const fechaEntrega = new Date(fechaSolicitud);
        fechaEntrega.setDate(fechaEntrega.getDate() + Math.floor(Math.random() * 14) + 1);
        
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const estado = estados[Math.floor(Math.random() * estados.length)];
        const prioridad = prioridades[Math.floor(Math.random() * prioridades.length)];
        
        reportes.push({
          id: i,
          tipo: tipo,
          titulo: this.generateReportTitle(tipo, i),
          descripcion: this.generateReportDescription(tipo),
          estado: estado,
          prioridad: prioridad,
          solicitante_id: Math.floor(Math.random() * 5) + 1,
          solicitante_nombre: solicitantes[Math.floor(Math.random() * solicitantes.length)],
          fecha_solicitud: fechaSolicitud.toISOString(),
          fecha_entrega_estimada: fechaEntrega.toISOString().split('T')[0],
          progreso: estado === 'delivered' ? 100 : 
                   estado === 'generated' ? Math.floor(Math.random() * 20) + 80 :
                   estado === 'in_progress' ? Math.floor(Math.random() * 60) + 20 :
                   0,
          archivo_url: estado === 'generated' || estado === 'delivered' ? `/reports/report_${i}.pdf` : null,
          notas: this.generateReportNotes(estado, tipo),
          createdAt: fechaSolicitud.toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return reportes;
    },
    
    generateReportTitle(tipo, id) {
      const titles = {
        produccion: [`Reporte de Producción Semanal #${id}`, `Análisis de Rendimiento Productivo ${id}`, `Informe de Órdenes Completadas ${id}`],
        calidad: [`Control de Calidad Mensual #${id}`, `Reporte de Defectos ${id}`, `Análisis de Conformidad ${id}`],
        mantenimiento: [`Mantenimiento Preventivo #${id}`, `Reporte de Reparaciones ${id}`, `Estado de Equipos ${id}`],
        inventario: [`Inventario de Materiales #${id}`, `Reporte de Stock ${id}`, `Movimientos de Almacén ${id}`],
        costos: [`Análisis de Costos #${id}`, `Reporte Financiero ${id}`, `Evaluación Presupuestaria ${id}`],
        performance: [`KPI Dashboard #${id}`, `Métricas de Rendimiento ${id}`, `Análisis de Eficiencia ${id}`]
      };
      return titles[tipo][Math.floor(Math.random() * titles[tipo].length)];
    },
    
    generateReportDescription(tipo) {
      const descriptions = {
        produccion: 'Análisis detallado de la producción, tiempos de ciclo y eficiencia operacional',
        calidad: 'Evaluación de estándares de calidad, defectos y conformidad de productos',
        mantenimiento: 'Estado de equipos, mantenimientos realizados y programaciones futuras',
        inventario: 'Control de stock, movimientos de materiales y reposición de inventario',
        costos: 'Análisis financiero de costos operacionales y desviaciones presupuestarias',
        performance: 'Métricas de rendimiento y KPIs del sistema de producción'
      };
      return descriptions[tipo];
    },
    
    generateReportNotes(estado, tipo) {
      const notes = {
        pending: ['Esperando aprobación', 'En cola de procesamiento', 'Pendiente de recursos'],
        in_progress: ['Recopilando datos', 'Procesando información', 'Generando gráficos'],
        generated: ['Reporte completado', 'Listo para revisión', 'Pendiente de entrega'],
        delivered: ['Entregado exitosamente', 'Reporte enviado', 'Completado sin observaciones']
      };
      return notes[estado][Math.floor(Math.random() * notes[estado].length)];
    },
    
    // Métodos de UI
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    
    applyFilters() {
      // Los filtros se aplican automáticamente via computed
      this.showToast('Filtros aplicados', 'success');
    },
    
    resetFilters() {
      this.reportType = 'all';
      this.priorityFilter = 'all';
      this.searchQuery = '';
      this.dateRange = { start: '', end: '' };
      this.statusFilters = {
        pending: true,
        in_progress: true,
        resolved: true,
        generated: true
      };
      this.showToast('Filtros restablecidos', 'success');
    },
    
    // Métodos de acciones
    viewReport(report) {
      this.selectedReport = { ...report };
      // Aquí puedes abrir un modal o navegar a vista detalle
    },
    
    downloadReport(report) {
      if (report.archivo_url) {
        // Simular descarga
        this.showToast(`Descargando: ${report.titulo}`, 'success');
        // En producción: window.open(report.archivo_url);
      } else {
        this.showToast('El reporte aún no está disponible para descarga', 'warning');
      }
    },
    
    generateReport(report) {
      if (report.estado === 'pending' || report.estado === 'in_progress') {
        this.showToast('Generando reporte...', 'info');
        // Simular generación
        setTimeout(() => {
          const index = this.reports.findIndex(r => r.id === report.id);
          if (index !== -1) {
            this.reports[index].estado = 'generated';
            this.reports[index].progreso = 100;
            this.reports[index].archivo_url = `/reports/report_${report.id}.pdf`;
          }
          this.showToast('Reporte generado exitosamente', 'success');
        }, 2000);
      }
    },
    
    deleteReport(reportId) {
      if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
        this.reports = this.reports.filter(r => r.id !== reportId);
        this.showToast('Reporte eliminado', 'success');
      }
    },
    
    // Métodos de formato
    formatStatus(estado) {
      const estados = {
        'pending': 'Pendiente',
        'in_progress': 'En Proceso',
        'generated': 'Generado',
        'delivered': 'Entregado'
      };
      return estados[estado] || estado;
    },
    
    statusClass(estado) {
      return {
        'pending': 'badge-warning',
        'in_progress': 'badge-info',
        'generated': 'badge-success',
        'delivered': 'badge-primary'
      }[estado] || 'badge-secondary';
    },
    
    formatPriority(prioridad) {
      const prioridades = {
        'baja': 'Baja',
        'media': 'Media',
        'alta': 'Alta',
        'critica': 'Crítica'
      };
      return prioridades[prioridad] || prioridad;
    },
    
    priorityClass(prioridad) {
      return {
        'baja': 'badge-secondary',
        'media': 'badge-info',
        'alta': 'badge-warning',
        'critica': 'badge-danger'
      }[prioridad] || 'badge-light';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    formatReportType(tipo) {
      const tipos = {
        'produccion': 'Producción',
        'calidad': 'Control de Calidad',
        'mantenimiento': 'Mantenimiento',
        'inventario': 'Inventario',
        'costos': 'Costos',
        'performance': 'Performance'
      };
      return tipos[tipo] || tipo;
    },
    
    // Método para exportar
    exportToCSV() {
      try {
        if (this.$refs.vueGoodTable) {
          const fileName = `reportes_${new Date().toISOString().split('T')[0]}.csv`;
          this.$refs.vueGoodTable.exportCsv(fileName);
          this.showToast('Tabla exportada exitosamente', 'success');
        } else {
          this.showToast('Error al exportar: tabla no encontrada', 'error');
        }
      } catch (error) {
        console.error('Error exportando CSV:', error);
        this.showToast('Error al exportar tabla', 'error');
      }
    },
    
    // Helper para mostrar notificaciones
    showToast(message, type = 'success') {
      console.log(`${type.toUpperCase()}: ${message}`);
      // Aquí puedes integrar tu sistema de notificaciones
      alert(`${type.toUpperCase()}: ${message}`);
    }
  },

  mounted() {
    this.loadReports();
  }
}
