import WorkOrderModal from '@/components/VistasCoordinador/WorkOrderModal.vue';
import OrderDetailsModal from '@/components//VistasCoordinador/ComponentesCoordinador/OrderDetailsModal.vue';

export default {
  components: {
    WorkOrderModal,
    OrderDetailsModal
  },
  data() {
    return {
      orders: [
        {
          id: '',
          client: { id: 1, name: '' },
          description: '',
          priority: '',
          status: '',
          startDate: '',
          endDate: '',
          assignedTo: [
            { id: 1, name: '' },
            { id: 3, name: '' }
          ],
          materials: [
            { id: 1, name: '', quantity: 0, unit: '' },
            { id: 2, name: '', quantity: 0, unit: '' }
          ],
          notes: '',
          progress: 65
        },
      ],
      filters: {
        status: 'all',
        priority: 'all',
        dateRange: 'all',
        startDate: '',
        endDate: ''
      },
      sort: {
        field: 'id',
        order: 'asc'
      },
      currentPage: 1,
      itemsPerPage: 10,
      showModal: false,
      showDetailsModal: false,
      modalMode: 'create',
      currentOrder: this.getEmptyOrder(),
      selectedOrder: null,
      priorityLabels: {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
      },
      statusLabels: {
        pending: 'Pendiente',
        'in-progress': 'En Progreso',
        completed: 'Completada',
        delayed: 'Retrasada'
      }
    };
  },
  computed: {
    filteredOrders() {
      let filtered = [...this.orders];

      // Aplicar filtros
      if (this.filters.status !== 'all') {
        filtered = filtered.filter(o => o.status === this.filters.status);
      }

      if (this.filters.priority !== 'all') {
        filtered = filtered.filter(o => o.priority === this.filters.priority);
      }

      if (this.filters.dateRange !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (this.filters.dateRange) {
          case 'today':
            filtered = filtered.filter(o => new Date(o.endDate).toDateString() === today.toDateString());
            break;
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            filtered = filtered.filter(o => {
              const orderDate = new Date(o.endDate);
              return orderDate >= today && orderDate <= weekEnd;
            });
            break;
          case 'month':
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            filtered = filtered.filter(o => {
              const orderDate = new Date(o.endDate);
              return orderDate >= today && orderDate <= monthEnd;
            });
            break;
          case 'custom':
            if (this.filters.startDate && this.filters.endDate) {
              filtered = filtered.filter(o => {
                const orderDate = new Date(o.endDate);
                const startDate = new Date(this.filters.startDate);
                const endDate = new Date(this.filters.endDate);
                return orderDate >= startDate && orderDate <= endDate;
              });
            }
            break;
        }
      }

      // Ordenar
      filtered.sort((a, b) => {
        let fieldA = a[this.sort.field];
        let fieldB = b[this.sort.field];

        // Manejar campos anidados (como client.name)
        if (this.sort.field.includes('.')) {
          const fields = this.sort.field.split('.');
          fieldA = a[fields[0]][fields[1]];
          fieldB = b[fields[0]][fields[1]];
        }

        if (fieldA < fieldB) return this.sort.order === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return this.sort.order === 'asc' ? 1 : -1;
        return 0;
      });

      // Paginación
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.orders.length / this.itemsPerPage);
    },
    stats() {
      return {
        pending: this.orders.filter(o => o.status === 'pending').length,
        inProgress: this.orders.filter(o => o.status === 'in-progress').length,
        completed: this.orders.filter(o => o.status === 'completed').length,
        delayed: this.orders.filter(o => o.status === 'delayed').length
      };
    }
  },
  methods: {
    getEmptyOrder() {
      return {
        id: '',
        client: { id: null, name: '' },
        description: '',
        priority: 'medium',
        status: 'pending',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        assignedTo: [],
        materials: [],
        notes: '',
        progress: 0
      };
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    sortBy(field) {
      if (this.sort.field === field) {
        this.sort.order = this.sort.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort.field = field;
        this.sort.order = 'asc';
      }
    },
    setFilter(field, value) {
      this.filters[field] = value;
      this.currentPage = 1;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    openCreateModal() {
      this.currentOrder = this.getEmptyOrder();
      this.modalMode = 'create';
      this.showModal = true;
    },
    openEditModal(order) {
      this.currentOrder = JSON.parse(JSON.stringify(order));
      this.modalMode = 'edit';
      this.showModal = true;
    },
    openDetailsModal(order) {
      this.selectedOrder = JSON.parse(JSON.stringify(order));
      this.showDetailsModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },
    saveOrder(order) {
      if (this.modalMode === 'create') {
        order.id = `OT-${new Date().getFullYear()}-${this.orders.length + 1}`;
        this.orders.push(order);
      } else {
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders.splice(index, 1, order);
        }
      }
      this.closeModal();
    },
    changeStatus(order, status) {
      const index = this.orders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        this.orders[index].status = status;
        if (status === 'completed') {
          this.orders[index].progress = 100;
        }
      }
    },
    exportToExcel() {
      // Implementar lógica de exportación a Excel
      console.log('Exportar a Excel', this.filteredOrders);
    }
  }
};