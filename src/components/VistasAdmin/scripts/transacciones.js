import axios from 'axios'
// import TransaccionModal from '@/components/VistasAdmin/ComponentesAdmin/TransaccionModal.vue'
// import NuevaTransaccionModal from '@/components/VistasAdmin/ComponentesAdmin/NuevaTransaccionModal.vue'

export default {
  name: 'TransaccionesFinancieras',
  components: {
    // TransaccionModal,
    // NuevaTransaccionModal
  },

  data() {
    return {
      transacciones: [],
      loading: false,
      loadingDelete: null,
      searchQuery: '',
      tipoFilter: 'todos',
      categoriaFilter: 'todos',
      fechaInicio: '',
      fechaFin: '',
      montoMin: null,
      montoMax: null,
      categorias: ['Ventas', 'Compras', 'Salarios', 'Servicios', 'Impuestos', 'Otros'],
      sortField: 'fecha',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: false,
      showTransaccionModal: false,
      showNuevaTransaccionModal: false,
      selectedTransaccion: null,
      viewMode: 'table', // 'table' or 'cards'
      tableColumns: [
        {
          label: 'Fecha',
          field: 'fecha',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true,
          width: '150px'
        },
        {
          label: 'Descripción',
          field: 'descripcion',
          sortable: true,
          width: '300px'
        },
        {
          label: 'Tipo',
          field: 'tipo',
          sortable: true,
          width: '130px'
        },
        {
          label: 'Categoría',
          field: 'categoria',
          sortable: true,
          width: '150px'
        },
        {
          label: 'Monto',
          field: 'monto',
          type: 'number',
          sortable: true,
          width: '150px'
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
    filteredTransacciones() {
      return this.transacciones.filter(transaccion => {
        const matchesTipo = this.tipoFilter === 'todos' || transaccion.tipo === this.tipoFilter;
        const matchesCategoria = this.categoriaFilter === 'todos' || transaccion.categoria === this.categoriaFilter;
        const matchesFecha = (!this.fechaInicio || new Date(transaccion.fecha) >= new Date(this.fechaInicio)) &&
          (!this.fechaFin || new Date(transaccion.fecha) <= new Date(this.fechaFin));
        const monto = transaccion.monto_total || transaccion.monto || 0;
        const matchesMonto = (!this.montoMin || monto >= this.montoMin) &&
          (!this.montoMax || monto <= this.montoMax);
        const matchesSearch = this.searchQuery === '' ||
          transaccion.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (transaccion.referencia && transaccion.referencia.toLowerCase().includes(this.searchQuery.toLowerCase()));

        return matchesTipo && matchesCategoria && matchesFecha && matchesMonto && matchesSearch;
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1;
        const aVal = a[this.sortField] || '';
        const bVal = b[this.sortField] || '';

        if (this.sortField === 'monto') {
          const aMonto = a.monto_total || a.monto || 0;
          const bMonto = b.monto_total || b.monto || 0;
          return (aMonto - bMonto) * modifier;
        }

        if (aVal < bVal) return -1 * modifier;
        if (aVal > bVal) return 1 * modifier;
        return 0;
      });
    },

    paginatedTransacciones() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTransacciones.slice(start, start + this.itemsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredTransacciones.length / this.itemsPerPage);
    },

    pages() {
      const pages = [];
      const maxVisiblePages = 5;

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) pages.push(i);
        return pages;
      }

      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < this.totalPages) {
        if (end < this.totalPages - 1) pages.push('...');
        pages.push(this.totalPages);
      }

      return pages;
    },

    showingFrom() {
      return Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.filteredTransacciones.length);
    },

    showingTo() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredTransacciones.length);
    },

    totalIngresos() {
      return this.filteredTransacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + (t.monto_total || t.monto || 0), 0);
    },

    totalEgresos() {
      return this.filteredTransacciones
        .filter(t => t.tipo === 'egreso')
        .reduce((sum, t) => sum + (t.monto_total || t.monto || 0), 0);
    },

    balanceTotal() {
      return this.totalIngresos - this.totalEgresos;
    },

    balanceClass() {
      return this.balanceTotal >= 0 ? 'positive' : 'negative';
    },

    ingresosCount() {
      return this.filteredTransacciones.filter(t => t.tipo === 'ingreso').length;
    },

    egresosCount() {
      return this.filteredTransacciones.filter(t => t.tipo === 'egreso').length;
    },

    activeFiltersCount() {
      let count = 0;
      if (this.tipoFilter !== 'todos') count++;
      if (this.categoriaFilter !== 'todos') count++;
      if (this.fechaInicio) count++;
      if (this.fechaFin) count++;
      if (this.montoMin !== null) count++;
      if (this.montoMax !== null) count++;
      if (this.searchQuery) count++;
      return count;
    }
  },

  methods: {
    // API Methods
    async loadTransacciones() {
      try {
        this.loading = true;
        const response = await axios.get('/api/Transaccion_Financiera');
        this.transacciones = response.data.map(t => ({
          ...t,
          fecha: t.fecha || new Date().toISOString().split('T')[0]
        }));
      } catch (error) {
        console.error("Error cargando transacciones:", error);
        this.showToast('Error al cargar transacciones', 'error');
      } finally {
        this.loading = false;
      }
    },

    async obtenerTransaccionPorId(id) {
      try {
        const response = await axios.get(`/api/Transaccion_Financiera/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo transacción:", error);
        this.showToast('Error al obtener transacción', 'error');
        throw error;
      }
    },

    async crearTransaccion(transaccionData) {
      try {
        const response = await axios.post('/api/Transaccion_Financiera', transaccionData);
        return response.data;
      } catch (error) {
        console.error("Error creando transacción:", error);
        this.showToast('Error al crear transacción', 'error');
        throw error;
      }
    },

    async actualizarTransaccion(id, transaccionData) {
      try {
        const response = await axios.put(`/api/Transaccion_Financiera/${id}`, transaccionData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando transacción:", error);
        this.showToast('Error al actualizar transacción', 'error');
        throw error;
      }
    },

    async eliminarTransaccionAPI(id) {
      try {
        await axios.delete(`/api/Transaccion_Financiera/${id}`);
      } catch (error) {
        console.error("Error eliminando transacción:", error);
        this.showToast('Error al eliminar transacción', 'error');
        throw error;
      }
    },

    // UI Methods
    applyFilters() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.tipoFilter = 'todos';
      this.categoriaFilter = 'todos';
      this.fechaInicio = '';
      this.fechaFin = '';
      this.montoMin = null;
      this.montoMax = null;
      this.currentPage = 1;
    },

    async verDetalles(transaccion) {
      try {
        const transaccionActualizada = await this.obtenerTransaccionPorId(transaccion.id);
        this.selectedTransaccion = { ...transaccionActualizada };
        this.showTransaccionModal = true;
      } catch (error) {
        this.selectedTransaccion = { ...transaccion };
        this.showTransaccionModal = true;
      }
    },

    editarTransaccion(transaccion) {
      this.selectedTransaccion = { ...transaccion };
      this.showTransaccionModal = true;
    },

    async eliminarTransaccion(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarTransaccionAPI(id);

        this.transacciones = this.transacciones.filter(t => t.id !== id);
        this.showToast('Transacción eliminada correctamente', 'success');
      } catch (error) {
        // Error already handled in eliminarTransaccionAPI
      } finally {
        this.loadingDelete = null;
      }
    },

    async saveTransaccion(transaccionData) {
      try {
        if (transaccionData.id) {
          const transaccionActualizada = await this.actualizarTransaccion(transaccionData.id, transaccionData);

          const index = this.transacciones.findIndex(t => t.id === transaccionData.id);
          if (index !== -1) {
            this.transacciones[index] = transaccionActualizada;
          }

          this.showToast('Transacción actualizada correctamente', 'success');
        }
        this.closeTransaccionModal();
      } catch (error) {
        // Error already handled in actualizarTransaccion
      }
    },

    async addTransaccion(nuevaTransaccion) {
      try {
        const transaccionCreada = await this.crearTransaccion(nuevaTransaccion);

        this.transacciones.unshift(transaccionCreada);
        this.showNuevaTransaccionModal = false;
        this.showToast('Nueva transacción creada correctamente', 'success');
      } catch (error) {
        // Error already handled in crearTransaccion
      }
    },

    closeTransaccionModal() {
      this.showTransaccionModal = false;
      this.selectedTransaccion = null;
    },

    exportData() {
      const csvContent = this.generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    generateCSV() {
      const headers = ['Fecha', 'Descripción', 'Tipo', 'Categoría', 'Monto', 'Referencia'];
      const rows = this.filteredTransacciones.map(t => [
        this.formatDate(t.fecha),
        t.descripcion,
        this.formatTipo(t.tipo),
        t.categoria,
        t.monto_total || t.monto || 0,
        t.referencia || ''
      ]);

      return [headers, ...rows].map(row =>
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },

    formatCurrency(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return '$0.00';
      }
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount);
    },

    formatTipo(tipo) {
      return tipo === 'ingreso' ? 'Ingreso' : 'Egreso';
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },

    sortIcon(field) {
      if (this.sortField !== field) return 'fas fa-sort';
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    goToPage(page) {
      if (page !== '...' && page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    toggleFilters() {
      this.showFilters = !this.showFilters;
    },

    showToast(message, type = 'success') {
      const alertType = type === 'success' ? 'Éxito' : 'Error';
      alert(`${alertType}: ${message}`);
    }
  },

  async mounted() {
    await this.loadTransacciones();
  }
}
