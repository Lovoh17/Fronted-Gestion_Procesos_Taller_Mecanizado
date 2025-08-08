import axios from 'axios';

export default {
  name: 'ToolUsageHistoryView',
  data() {
    return {
      usageHistory: [],
      tools: [],
      users: [],
      projects: [],
      returnStatuses: [],
      loading: true,
      error: null,
      filterStatus: 'all',
      filterUsageDate: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      itemsPerPage: 10,
      selectedItem: null,
      sortField: 'fecha_uso',
      sortDirection: 'desc'
    }
  },
  computed: {
    hasActiveFilters() {
      return this.filterStatus !== 'all' || this.filterUsageDate || this.dateFrom || this.dateTo;
    },

    filteredItems() {
      let filtered = [...this.usageHistory];

      // Filtrar por estado
      if (this.filterStatus !== 'all') {
        filtered = filtered.filter(item =>
          item.estado_devolucion_id === this.filterStatus
        );
      }

      // Filtrar por fecha de uso
      if (this.filterUsageDate) {
        const filterDateStr = new Date(this.filterUsageDate).toISOString().split('T')[0];
        filtered = filtered.filter(item =>
          item.fecha_uso.split('T')[0] === filterDateStr
        );
      }

      // Filtrar por rango de fechas
      if (this.dateFrom || this.dateTo) {
        filtered = filtered.filter(item => {
          const usageDate = new Date(item.fecha_uso);
          const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
          const toDate = this.dateTo ? new Date(this.dateTo) : null;

          if (fromDate && toDate) {
            return usageDate >= fromDate && usageDate <= toDate;
          } else if (fromDate) {
            return usageDate >= fromDate;
          } else if (toDate) {
            return usageDate <= toDate;
          }
          return true;
        });
      }

      // Ordenar
      return this.sortItems(filtered);
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + parseInt(this.itemsPerPage);
      return this.filteredItems.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },

    totalHours() {
      return this.filteredItems.reduce((sum, item) => sum + parseFloat(item.horas_utilizada || 0), 0).toFixed(1);
    },

    completedReturns() {
      return this.filteredItems.filter(item => item.fecha_devolucion).length;
    },

    statusOptions() {
      return this.returnStatuses;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;

      try {
        // Obtener todos los datos necesarios
        const [usageRes, toolsRes, usersRes, projectsRes, statusesRes] = await Promise.all([
          axios.get('/api/HistorialUsoHerramienta'),
          axios.get('/api/Herramienta'),
          axios.get('/api/Usuario'),
          axios.get('/api/Tipo_Pedido'),
        ]);

        // Guardar los datos básicos
        this.tools = toolsRes.data || [];
        this.users = usersRes.data || [];
        this.projects = projectsRes.data || [];

        // Combinar los datos del historial con la información relacionada
        this.usageHistory = (usageRes.data || []).map(item => {
          const tool = this.tools.find(t => t.id === item.herramienta_id);
          const user = this.users.find(u => u.id === item.usuario_id);
          const project = this.projects.find(p => p.id === item.proyecto_id);
          const status = this.returnStatuses.find(s => s.id === item.estado_devolucion_id);
          const approvedBy = this.users.find(u => u.id === item.aprobado_por);

          return {
            ...item,
            herramienta: tool,
            usuario: user,
            proyecto: project,
            estado_devolucion: status,
            aprobado_por_nombre: approvedBy?.nombre
          };
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        this.error = 'Error al cargar el historial de uso de herramientas.';
      } finally {
        this.loading = false;
      }
    },

    sortItems(items) {
      return items.sort((a, b) => {
        let valueA = this.getNestedValue(a, this.sortField);
        let valueB = this.getNestedValue(b, this.sortField);

        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (this.sortDirection === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    },

    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj) || '';
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'desc';
      }
    },

    clearFilters() {
      this.filterStatus = 'all';
      this.filterUsageDate = '';
      this.dateFrom = '';
      this.dateTo = '';
      this.currentPage = 1;
    },

    viewDetails(item) {
      this.selectedItem = item;
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }
};