import axios from 'axios'
import DepartamentoModal from '@/components/VistasAdmin/ComponentesAdmin/DepartamentoModal.vue'
import NuevoDepartamentoModal from '@/components/VistasAdmin/ComponentesAdmin/NuevoDepartamentoModal.vue'

export default {
  name: 'DepartamentosComponent',
  components: {
    DepartamentoModal,
    NuevoDepartamentoModal
  },

  data() {
    return {
      departamentos: [],
      loading: false,
      loadingDelete: null,
      searchQuery: '',
      estadoFilter: 'todos',
      sortField: 'nombre',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 12,
      showFilters: true,
      showDepartamentoModal: false,
      showNuevoDepartamentoModal: false,
      selectedDepartamento: null
    }
  },

  computed: {
    hasActiveFilters() {
      return this.searchQuery !== '' || this.estadoFilter !== 'todos';
    },

    activeFiltersCount() {
      let count = 0;
      if (this.searchQuery !== '') count++;
      if (this.estadoFilter !== 'todos') count++;
      return count;
    },

    filteredDepartamentos() {
      return this.departamentos.filter(departamento => {
        const matchesEstado = this.estadoFilter === 'todos' ||
          departamento.estado === this.estadoFilter;

        const matchesSearch = this.searchQuery === '' ||
          departamento.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (departamento.codigo && departamento.codigo.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (departamento.responsable && departamento.responsable.toLowerCase().includes(this.searchQuery.toLowerCase()));

        return matchesEstado && matchesSearch;
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1;
        if (a[this.sortField] < b[this.sortField]) return -1 * modifier;
        if (a[this.sortField] > b[this.sortField]) return 1 * modifier;
        return 0;
      });
    },

    paginatedDepartamentos() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredDepartamentos.slice(start, start + this.itemsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredDepartamentos.length / this.itemsPerPage);
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

      if (start > 1) pages.push(1, start > 2 ? '...' : null);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < this.totalPages) pages.push(end < this.totalPages - 1 ? '...' : null, this.totalPages);

      return pages.filter(p => p);
    },

    showingFrom() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    showingTo() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredDepartamentos.length);
    }
  },

  methods: {
    // Métodos de API (mantenemos los originales)
    async loadDepartamentos() {
      try {
        this.loading = true;
        const response = await axios.get('/api/DepartamentoUniversidad');
        this.departamentos = response.data;
      } catch (error) {
        console.error("Error cargando departamentos:", error);
        this.showToast('Error al cargar departamentos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async obtenerDepartamentoPorId(id) {
      try {
        const response = await axios.get(`/api/DepartamentoUniversidad/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error obteniendo departamento:", error);
        this.showToast('Error al obtener departamento', 'error');
        throw error;
      }
    },

    async crearDepartamento(departamentoData) {
      try {
        const response = await axios.post('/api/DepartamentoUniversidad', departamentoData);
        return response.data;
      } catch (error) {
        console.error("Error creando departamento:", error);
        this.showToast('Error al crear departamento', 'error');
        throw error;
      }
    },

    async actualizarDepartamento(id, departamentoData) {
      try {
        const response = await axios.put(`/api/DepartamentoUniversidad/${id}`, departamentoData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando departamento:", error);
        this.showToast('Error al actualizar departamento', 'error');
        throw error;
      }
    },

    async eliminarDepartamentoAPI(id) {
      try {
        await axios.delete(`/api/DepartamentoUniversidad/${id}`);
      } catch (error) {
        console.error("Error eliminando departamento:", error);
        this.showToast('Error al eliminar departamento', 'error');
        throw error;
      }
    },

    // Métodos de UI
    applyFilters() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.estadoFilter = 'todos';
      this.currentPage = 1;
    },

    async verDetalles(departamento) {
      try {
        const departamentoActualizado = await this.obtenerDepartamentoPorId(departamento.id);
        this.selectedDepartamento = { ...departamentoActualizado };
        this.showDepartamentoModal = true;
      } catch (error) {
        this.selectedDepartamento = { ...departamento };
        this.showDepartamentoModal = true;
      }
    },

    editarDepartamento(departamento) {
      this.selectedDepartamento = { ...departamento };
      this.showDepartamentoModal = true;
    },

    async eliminarDepartamento(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar este departamento?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarDepartamentoAPI(id);

        this.departamentos = this.departamentos.filter(d => d.id !== id);
        this.showToast('Departamento eliminado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en eliminarDepartamentoAPI
      } finally {
        this.loadingDelete = null;
      }
    },

    async saveDepartamento(departamentoData) {
      try {
        if (departamentoData.id) {
          const departamentoActualizado = await this.actualizarDepartamento(departamentoData.id, departamentoData);

          const index = this.departamentos.findIndex(d => d.id === departamentoData.id);
          if (index !== -1) {
            this.departamentos[index] = departamentoActualizado;
          }

          this.showToast('Departamento actualizado correctamente', 'success');
        }
        this.closeDepartamentoModal();
      } catch (error) {
        // Error ya manejado en actualizarDepartamento
      }
    },

    async addDepartamento(nuevoDepartamento) {
      try {
        const departamentoCreado = await this.crearDepartamento(nuevoDepartamento);

        this.departamentos.unshift(departamentoCreado);
        this.showNuevoDepartamentoModal = false;
        this.showToast('Nuevo departamento creado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en crearDepartamento
      }
    },

    closeDepartamentoModal() {
      this.showDepartamentoModal = false;
      this.selectedDepartamento = null;
    },

    formatEstado(estado) {
      return estado === 'activo' ? 'Activo' : 'Inactivo';
    },

    estadoClass(estado) {
      return estado === 'activo' ? 'status-active' : 'status-inactive';
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    goToPage(page) {
      if (page !== '...') this.currentPage = page;
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
    await this.loadDepartamentos();
  }
}
