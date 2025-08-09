export default {
  data() {
    return {
      planos: [], // Array de planos desde la API
      inspectionData: {}, // Datos de inspección por plano
      loading: false,
      error: null,
      filters: {
        status: 'all',
        dateRange: 'all'
      },
      sort: {
        field: 'numeroPlano',
        order: 'asc'
      },
      statusLabels: {
        pending: 'Pendiente',
        'in-progress': 'En Inspección',
        approved: 'Aprobado',
        rejected: 'Rechazado'
      },
      showInspectionModal: false,
      showReportModal: false,
      showBlueprintModal: false,
      currentPlano: {},
      selectedPlano: {},
      qualityChecklist: [
        { name: 'Verificar dimensiones según plano', checked: false, notes: '' },
        { name: 'Comprobar acabado superficial', checked: false, notes: '' },
        { name: 'Verificar ausencia de rebabas', checked: false, notes: '' },
        { name: 'Confirmar tolerancias geométricas', checked: false, notes: '' },
        { name: 'Revisar especificaciones técnicas', checked: false, notes: '' }
      ],
      measurements: [
        { parameter: 'Longitud', expected: 120, unit: 'mm', tolerance: 0.5, step: 0.1 },
        { parameter: 'Ancho', expected: 80, unit: 'mm', tolerance: 0.3, step: 0.1 },
        { parameter: 'Diámetro', expected: 25.4, unit: 'mm', tolerance: 0.1, step: 0.01 },
        { parameter: 'Altura', expected: 50, unit: 'mm', tolerance: 0.2, step: 0.1 }
      ],
      inspectionDecision: null,
      rejectionReason: ''
    }
  },
  computed: {
    filteredWorkOrders() {
      let filtered = this.planos.slice();

      // Aplicar filtros de estado
      if (this.filters.status !== 'all') {
        filtered = filtered.filter(plano => this.getPlanoStatus(plano) === this.filters.status);
      }

      // Aplicar filtros de fecha (puedes implementar lógica específica aquí)
      if (this.filters.dateRange !== 'all') {
        // Implementar filtro de fecha basado en fechaCreacion
        const now = new Date();
        const filterDate = new Date();

        switch (this.filters.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }

        filtered = filtered.filter(plano => {
          const planoDate = new Date(plano.fechaCreacion);
          return planoDate >= filterDate;
        });
      }

      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let fieldA = a[this.sort.field];
        let fieldB = b[this.sort.field];

        // Manejo especial para fechas
        if (this.sort.field === 'fechaCreacion') {
          fieldA = new Date(fieldA);
          fieldB = new Date(fieldB);
        }

        if (fieldA < fieldB) return this.sort.order === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return this.sort.order === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    },
    stats() {
      const total = this.planos.length;
      const pending = this.planos.filter(p => this.getPlanoStatus(p) === 'pending').length;
      const inProgress = this.planos.filter(p => this.getPlanoStatus(p) === 'in-progress').length;
      const approved = this.planos.filter(p => this.getPlanoStatus(p) === 'approved').length;
      const rejected = this.planos.filter(p => this.getPlanoStatus(p) === 'rejected').length;
      const qualityRate = (approved + rejected) > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;

      return { pending, inProgress, approved, rejected, qualityRate };
    }
  },
  mounted() {
    this.fetchPlanos();
  },
  methods: {
    async fetchPlanos() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/Plano');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.planos = data;

        // Inicializar datos de inspección si no existen
        this.planos.forEach(plano => {
          if (!this.inspectionData[plano.idPlano]) {
            this.inspectionData[plano.idPlano] = {
              status: 'pending',
              inspector: null,
              inspectionDate: null,
              measurements: [],
              rejectionReason: null
            };
          }
        });

      } catch (error) {
        this.error = `Error al cargar los planos: ${error.message}`;
        console.error('Error fetching planos:', error);
      } finally {
        this.loading = false;
      }
    },

    getPlanoStatus(plano) {
      return this.inspectionData[plano.idPlano]?.status || 'pending';
    },

    getInspector(plano) {
      return this.inspectionData[plano.idPlano]?.inspector;
    },

    getStatusLabel(status) {
      return this.statusLabels[status] || status;
    },

    getFileExtension(filePath) {
      if (!filePath) return '';
      return filePath.split('.').pop().toUpperCase();
    },

    sortBy(field) {
      if (this.sort.field === field) {
        this.sort.order = this.sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort.field = field;
        this.sort.order = 'asc';
      }
    },

    sortIcon(field) {
      if (this.sort.field !== field) return 'unfold_more';
      return this.sort.order === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
    },

    setFilter(field, value) {
      this.filters[field] = value;
    },

    refreshData() {
      this.fetchPlanos();
    },

    formatDate(dateString) {
      if (!dateString) return '--';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    downloadPlano(plano) {
      if (plano.rutaArchivo) {
        // Implementar descarga del archivo
        console.log('Descargando plano:', plano.rutaArchivo);
        // window.open(plano.rutaArchivo, '_blank');
      }
    },

    viewBlueprint(plano) {
      this.selectedPlano = plano;
      this.showBlueprintModal = true;
    },

    closeBlueprintModal() {
      this.showBlueprintModal = false;
      this.selectedPlano = {};
    },

    startInspection(plano) {
      this.currentPlano = JSON.parse(JSON.stringify(plano));

      // Actualizar estado a en progreso
      this.inspectionData[plano.idPlano].status = 'in-progress';
      this.inspectionData[plano.idPlano].inspector = 'Inspector Actual'; // Reemplazar con usuario real

      // Resetear formulario de inspección
      this.measurements.forEach(measure => {
        measure.actual = null;
      });
      this.qualityChecklist.forEach(item => {
        item.checked = false;
        item.notes = '';
      });
      this.inspectionDecision = null;
      this.rejectionReason = '';

      this.showInspectionModal = true;
    },

    openInspection(plano) {
      this.currentPlano = JSON.parse(JSON.stringify(plano));

      // Cargar datos existentes de la inspección
      const inspectionData = this.inspectionData[plano.idPlano];
      if (inspectionData.measurements.length > 0) {
        this.measurements = JSON.parse(JSON.stringify(inspectionData.measurements));
      }

      this.showInspectionModal = true;
    },

    closeInspectionModal() {
      this.showInspectionModal = false;
      this.inspectionDecision = null;
      this.rejectionReason = '';
    },

    submitInspection() {
      const inspectionData = this.inspectionData[this.currentPlano.idPlano];

      // Actualizar datos de inspección
      inspectionData.status = this.inspectionDecision;
      inspectionData.inspectionDate = new Date().toISOString();
      inspectionData.measurements = JSON.parse(JSON.stringify(this.measurements));

      if (this.inspectionDecision === 'rejected') {
        inspectionData.rejectionReason = this.rejectionReason;
      }

      // Aquí podrías hacer una llamada a la API para guardar los resultados
      console.log('Guardando inspección:', inspectionData);

      this.closeInspectionModal();
    },

    viewReport(plano) {
      this.currentPlano = JSON.parse(JSON.stringify(plano));
      this.currentPlano.measurements = this.inspectionData[plano.idPlano]?.measurements || [];
      this.currentPlano.inspectionDate = this.inspectionData[plano.idPlano]?.inspectionDate;
      this.currentPlano.rejectionReason = this.inspectionData[plano.idPlano]?.rejectionReason;
      this.showReportModal = true;
    },

    closeReportModal() {
      this.showReportModal = false;
    },

    getMeasureResult(measure) {
      if (measure.actual === undefined || measure.actual === null) return 'No medido';
      const diff = Math.abs(measure.actual - measure.expected);
      return diff <= measure.tolerance ? 'Dentro' : 'Fuera';
    },

    getMeasureClass(measure) {
      if (measure.actual === undefined || measure.actual === null) return '';
      const diff = Math.abs(measure.actual - measure.expected);
      return diff <= measure.tolerance ? 'within-tolerance' : 'out-of-tolerance';
    },

    printReport() {
      window.print();
    },

    downloadReport() {
      console.log('Generando PDF del reporte...');
      // Implementar generación de PDF
    }
  }
}