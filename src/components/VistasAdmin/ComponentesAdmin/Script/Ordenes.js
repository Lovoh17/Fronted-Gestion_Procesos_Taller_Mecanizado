import axios from 'axios'
import TrabajoModal from '@/components/VistasAdmin/ComponentesAdmin/TrabajoModal.vue'
import NuevoTrabajoModal from '@/components/VistasAdmin/ComponentesAdmin/NuevoTrabajoModal.vue'

export default {
  components: {
    TrabajoModal,
    NuevoTrabajoModal
  },

  data() {
    return {
      activeTab: 'produccion',
      pedidos: [],
      loading: false,
      loadingDelete: null,
      loadingTecnicos: false,
      searchQuery: '',
      estadoFilter: 'todos',
      tecnicoFilter: 'todos',
      fechaInicio: '',
      fechaFin: '',
      tecnicos: [],
      sortField: 'fecha_solicitud',
      sortDirection: 'desc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: true,
      showTrabajoModal: false,
      showNuevoTrabajoModal: false,
      selectedTrabajo: null,
      tiposPedido: [
        { id: 1, nombre: 'Suministros' },
        { id: 2, nombre: 'Equipamiento' },
        { id: 3, nombre: 'Servicios' }
      ],
      // Configuración de columnas para la tabla de Producción
      columnsProduccion: [
        {
          label: 'Código',
          field: 'codigo_pedido',
          type: 'string',
          sortable: true,
          width: '120px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por código'
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
          label: 'Proyecto',
          field: 'proyecto_asociado',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por proyecto'
          }
        },
        {
          label: 'Tipo',
          field: 'tipo_pedido_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Suministros', text: 'Suministros' },
              { value: 'Equipamiento', text: 'Equipamiento' },
              { value: 'Servicios', text: 'Servicios' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los tipos'
          }
        },
        {
          label: 'Supervisor',
          field: 'supervisor_nombre',
          type: 'string',
          sortable: true
        },
        {
          label: 'F. Solicitud',
          field: 'fecha_solicitud',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'F. Est. Entrega',
          field: 'fecha_estimada_entrega',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'Estado',
          field: 'estado',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'pendiente', text: 'Pendiente' },
              { value: 'en_proceso', text: 'En Proceso' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '120px'
        }
      ],
      // Configuración de columnas para la tabla de Historial
      columnsHistorial: [
        {
          label: 'Código',
          field: 'codigo_pedido',
          type: 'string',
          sortable: true,
          width: '120px',
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por código'
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
          label: 'Proyecto',
          field: 'proyecto_asociado',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por proyecto'
          }
        },
        {
          label: 'Tipo',
          field: 'tipo_pedido_nombre',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'Suministros', text: 'Suministros' },
              { value: 'Equipamiento', text: 'Equipamiento' },
              { value: 'Servicios', text: 'Servicios' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los tipos'
          }
        },
        {
          label: 'Supervisor',
          field: 'supervisor_nombre',
          type: 'string',
          sortable: true
        },
        {
          label: 'F. Solicitud',
          field: 'fecha_solicitud',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'F. Completado',
          field: 'fecha_completado',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd',
          dateOutputFormat: 'dd/MM/yyyy',
          sortable: true
        },
        {
          label: 'Estado',
          field: 'estado',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [
              { value: 'completado', text: 'Completado' },
              { value: 'entregado', text: 'Entregado' }
            ],
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '80px'
        }
      ]
    }
  },

  computed: {
    trabajosProduccion() {
      return this.pedidos.filter(pedido =>
        pedido.estado !== 'completado' && pedido.estado !== 'entregado'
      ).sort((a, b) => {
        const order = {
          'pendiente': 1,
          'en_proceso': 2,
          'completado': 3,
          'entregado': 4
        };
        return order[a.estado] - order[b.estado];
      });
    },

    filteredHistorial() {
      return this.pedidos.filter(pedido =>
        pedido.estado === 'completado' || pedido.estado === 'entregado'
      ).filter(pedido => {
        // Filtro por estado
        const matchesEstado = this.estadoFilter === 'todos' ||
          pedido.estado === this.estadoFilter;

        // Filtro por técnico
        const matchesTecnico = this.tecnicoFilter === 'todos' ||
          pedido.supervisor_id == this.tecnicoFilter;

        // Filtro por fecha
        const matchesFecha = (!this.fechaInicio || new Date(pedido.fecha_solicitud) >= new Date(this.fechaInicio)) &&
          (!this.fechaFin || new Date(pedido.fecha_solicitud) <= new Date(this.fechaFin));

        // Filtro por búsqueda
        const matchesSearch = this.searchQuery === '' ||
          pedido.codigo_pedido.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          pedido.solicitante_nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (pedido.proyecto_asociado && pedido.proyecto_asociado.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          pedido.tipo_pedido_nombre.toLowerCase().includes(this.searchQuery.toLowerCase());

        return matchesEstado && matchesTecnico && matchesFecha && matchesSearch;
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1;
        if (a[this.sortField] < b[this.sortField]) return -1 * modifier;
        if (a[this.sortField] > b[this.sortField]) return 1 * modifier;
        return 0;
      });
    },

    trabajosHistorial() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredHistorial.slice(start, start + this.itemsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredHistorial.length / this.itemsPerPage);
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
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredHistorial.length);
    },

    // Computed properties para los filtros activos
    hasActiveFilters() {
      return this.estadoFilter !== 'todos' ||
             this.tecnicoFilter !== 'todos' ||
             this.fechaInicio !== '' ||
             this.fechaFin !== '' ||
             this.searchQuery !== '';
    },

    activeFiltersCount() {
      let count = 0;
      if (this.estadoFilter !== 'todos') count++;
      if (this.tecnicoFilter !== 'todos') count++;
      if (this.fechaInicio !== '') count++;
      if (this.fechaFin !== '') count++;
      if (this.searchQuery !== '') count++;
      return count;
    }
  },

  methods: {
    // Métodos de API
    async loadPedidos() {
      try {
        this.loading = true;
        const response = await axios.get('/api/Pedido');

        // Transformar los datos de la API
        this.pedidos = await Promise.all(response.data.map(async pedido => ({
          ...pedido,
          estado: this.resolveEstado(pedido.estado_id),
          solicitante_nombre: await this.resolveUsuario(pedido.solicitante_id),
          supervisor_nombre: await this.resolveUsuario(pedido.supervisor_id),
          tipo_pedido_nombre: this.resolveTipoPedido(pedido.tipo_pedido_id),
          supervisor_id: pedido.supervisor_id
        })));

      } catch (error) {
        console.error("Error cargando pedidos:", error);
        this.showToast('Error al cargar pedidos', 'error');
      } finally {
        this.loading = false;
      }
    },

    async loadTecnicos() {
      try {
        this.loadingTecnicos = true;
        const response = await axios.get('/api/Usuario');

        // Filtrar solo usuarios con rol empleado (ajusta según tu estructura)
        this.tecnicos = response.data
          .filter(usuario => usuario.puesto_id === 2) // Ajusta el ID según tu sistema
          .map(usuario => ({
            id: usuario.id,
            nombre: usuario.nombre || `${usuario.firstName} ${usuario.lastName}`.trim()
          }));

      } catch (error) {
        console.error("Error cargando técnicos:", error);
        this.showToast('Error al cargar técnicos', 'error');
        this.tecnicos = [];
      } finally {
        this.loadingTecnicos = false;
      }
    },

    async obtenerPedidoPorId(id) {
      try {
        const response = await axios.get(`/api/Pedido/${id}`);
        const pedido = response.data;

        // Enriquecer los datos con nombres
        return {
          ...pedido,
          estado: this.resolveEstado(pedido.estado_id),
          solicitante_nombre: await this.resolveUsuario(pedido.solicitante_id),
          supervisor_nombre: await this.resolveUsuario(pedido.supervisor_id),
          tipo_pedido_nombre: this.resolveTipoPedido(pedido.tipo_pedido_id)
        };

      } catch (error) {
        console.error("Error obteniendo pedido:", error);
        this.showToast('Error al obtener pedido', 'error');
        throw error;
      }
    },

    async crearPedido(pedidoData) {
      try {
        // Convertir los datos al formato esperado por la API
        const apiData = {
          ...pedidoData,
          estado_id: this.resolveEstadoId(pedidoData.estado),
          tipo_pedido_id: this.resolveTipoPedidoId(pedidoData.tipo_pedido_nombre),
          supervisor_id: pedidoData.supervisor_id
        };

        const response = await axios.post('/api/Pedido', apiData);
        return response.data;
      } catch (error) {
        console.error("Error creando pedido:", error);
        this.showToast('Error al crear pedido', 'error');
        throw error;
      }
    },

    async actualizarPedido(id, pedidoData) {
      try {
        // Convertir los datos al formato esperado por la API
        const apiData = {
          ...pedidoData,
          estado_id: this.resolveEstadoId(pedidoData.estado),
          tipo_pedido_id: this.resolveTipoPedidoId(pedidoData.tipo_pedido_nombre),
          supervisor_id: pedidoData.supervisor_id
        };

        const response = await axios.put(`/api/Pedido/${id}`, apiData);
        return response.data;
      } catch (error) {
        console.error("Error actualizando pedido:", error);
        this.showToast('Error al actualizar pedido', 'error');
        throw error;
      }
    },

    async eliminarPedidoAPI(id) {
      try {
        await axios.delete(`/api/Pedido/${id}`);
      } catch (error) {
        console.error("Error eliminando pedido:", error);
        this.showToast('Error al eliminar pedido', 'error');
        throw error;
      }
    },

    // Métodos de resolución
    resolveEstado(estadoId) {
      const estados = {
        1: 'pendiente',
        2: 'en_proceso',
        3: 'completado',
        4: 'entregado'
      };
      return estados[estadoId] || 'pendiente';
    },

    resolveEstadoId(estado) {
      const estados = {
        'pendiente': 1,
        'en_proceso': 2,
        'completado': 3,
        'entregado': 4
      };
      return estados[estado] || 1;
    },

    async resolveUsuario(usuarioId) {
      try {
        if (!usuarioId) return 'No asignado';

        // Primero revisar si está en los técnicos ya cargados
        const tecnico = this.tecnicos.find(t => t.id == usuarioId);
        if (tecnico) return tecnico.nombre;

        // Si no, hacer una llamada a la API
        const response = await axios.get(`/api/Usuario/${usuarioId}`);
        return response.data.nombre || `${response.data.firstName} ${response.data.lastName}`.trim() || `Usuario ${usuarioId}`;
      } catch {
        return `Usuario ${usuarioId}`;
      }
    },

    resolveTipoPedido(tipoId) {
      const tipo = this.tiposPedido.find(t => t.id == tipoId);
      return tipo ? tipo.nombre : `Tipo ${tipoId}`;
    },

    resolveTipoPedidoId(tipoNombre) {
      const tipo = this.tiposPedido.find(t => t.nombre === tipoNombre);
      return tipo ? tipo.id : 1; // Default al primer tipo si no se encuentra
    },

    // Métodos de UI
    applyFilters() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.searchQuery = '';
      this.estadoFilter = 'todos';
      this.tecnicoFilter = 'todos';
      this.fechaInicio = '';
      this.fechaFin = '';
      this.currentPage = 1;
    },

    async verDetalles(pedido) {
      try {
        // Obtener datos actualizados del pedido
        const pedidoActualizado = await this.obtenerPedidoPorId(pedido.id);
        this.selectedTrabajo = { ...pedidoActualizado };
        this.showTrabajoModal = true;
      } catch (error) {
        // Si falla, usar los datos locales
        this.selectedTrabajo = { ...pedido };
        this.showTrabajoModal = true;
      }
    },

    editarTrabajo(pedido) {
      this.selectedTrabajo = { ...pedido };
      this.showTrabajoModal = true;
    },

    async eliminarTrabajo(id) {
      if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        return;
      }

      try {
        this.loadingDelete = id;
        await this.eliminarPedidoAPI(id);

        // Remover del array local
        this.pedidos = this.pedidos.filter(p => p.id !== id);

        this.showToast('Pedido eliminado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en eliminarPedidoAPI
      } finally {
        this.loadingDelete = null;
      }
    },

    async saveTrabajo(pedidoData) {
      try {
        if (pedidoData.id) {
          // Actualizar pedido existente
          const pedidoActualizado = await this.actualizarPedido(pedidoData.id, pedidoData);

          // Actualizar en el array local
          const index = this.pedidos.findIndex(p => p.id === pedidoData.id);
          if (index !== -1) {
            this.pedidos[index] = {
              ...this.pedidos[index],
              ...pedidoActualizado,
              estado: pedidoData.estado,
              solicitante_nombre: pedidoData.solicitante_nombre,
              supervisor_nombre: pedidoData.supervisor_nombre,
              tipo_pedido_nombre: pedidoData.tipo_pedido_nombre
            };
          }

          this.showToast('Pedido actualizado correctamente', 'success');
        }
        this.closeTrabajoModal();
      } catch (error) {
        // Error ya manejado en actualizarPedido
      }
    },

    async addTrabajo(nuevoPedido) {
      try {
        // Preparar datos del pedido
        const pedidoData = {
          ...nuevoPedido,
          fecha_solicitud: new Date().toISOString(),
          estado_id: this.resolveEstadoId('pendiente'),
          tipo_pedido_id: this.resolveTipoPedidoId(nuevoPedido.tipo_pedido_nombre),
          supervisor_id: nuevoPedido.supervisor_id
        };

        const pedidoCreado = await this.crearPedido(pedidoData);

        // Enriquecer el pedido creado con los nombres
        const pedidoEnriquecido = {
          ...pedidoCreado,
          estado: 'pendiente',
          solicitante_nombre: await this.resolveUsuario(pedidoCreado.solicitante_id),
          supervisor_nombre: await this.resolveUsuario(pedidoCreado.supervisor_id),
          tipo_pedido_nombre: this.resolveTipoPedido(pedidoCreado.tipo_pedido_id)
        };

        // Agregar al array local
        this.pedidos.unshift(pedidoEnriquecido);

        this.showNuevoTrabajoModal = false;
        this.showToast('Nuevo pedido creado correctamente', 'success');
      } catch (error) {
        // Error ya manejado en crearPedido
      }
    },

    closeTrabajoModal() {
      this.showTrabajoModal = false;
      this.selectedTrabajo = null;
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatEstado(estado) {
      const estados = {
        'pendiente': 'Pendiente',
        'en_proceso': 'En Proceso',
        'completado': 'Completado',
        'entregado': 'Entregado'
      };
      return estados[estado] || estado;
    },

    estadoClass(estado) {
      return {
        'pendiente': 'badge-pendiente',
        'en_proceso': 'badge-en_proceso',
        'completado': 'badge-completado',
        'entregado': 'badge-entregado'
      }[estado] || '';
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
      // Implementar un sistema de notificaciones más sofisticado si es necesario
      const alertType = type === 'success' ? 'Éxito' : 'Error';
      alert(`${alertType}: ${message}`);
    },

    // Métodos para exportar tablas a CSV usando vue-good-table-next
    exportProduccionToCSV() {
      try {
        if (this.$refs.vueGoodTableProduccion) {
          const fileName = `pedidos_produccion_${new Date().toISOString().split('T')[0]}.csv`;
          this.$refs.vueGoodTableProduccion.exportCsv(fileName);
          this.showToast('Tabla de producción exportada exitosamente', 'success');
        } else {
          this.showToast('Error al exportar: tabla de producción no encontrada', 'error');
        }
      } catch (error) {
        console.error('Error exportando CSV de producción:', error);
        this.showToast('Error al exportar tabla de producción', 'error');
      }
    },

    exportHistorialToCSV() {
      try {
        if (this.$refs.vueGoodTableHistorial) {
          const fileName = `historial_pedidos_${new Date().toISOString().split('T')[0]}.csv`;
          this.$refs.vueGoodTableHistorial.exportCsv(fileName);
          this.showToast('Historial exportado exitosamente', 'success');
        } else {
          this.showToast('Error al exportar: tabla de historial no encontrada', 'error');
        }
      } catch (error) {
        console.error('Error exportando CSV de historial:', error);
        this.showToast('Error al exportar tabla de historial', 'error');
      }
    }
  },

  async mounted() {
    // Cargar tanto pedidos como técnicos al montar el componente
    await Promise.all([
      this.loadPedidos(),
      this.loadTecnicos()
    ]);
  }
}