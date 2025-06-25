<template>

  <div class="work-orders-page" :class="{ 'dark-mode': $root.darkMode }">

    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Órdenes de Trabajo</h1>
            <p class="header-subtitle">Gestiona, asigna y monitorea el progreso de cada solicitud de trabajo</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y controles -->
    <div class="controls-section">


      <div class="filters">
        <div class="filter-group">
          <label>Estado:</label>
          <select v-model="filters.status" class="filter-select">
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="in-progress">En Progreso</option>
            <option value="completed">Completadas</option>
            <option value="delayed">Retrasadas</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Prioridad:</label>
          <select v-model="filters.priority" class="filter-select">
            <option value="all">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Fecha:</label>
          <select v-model="filters.dateRange" class="filter-select">
            <option value="all">Todas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div class="filter-group" v-if="filters.dateRange === 'custom'">
          <label>Desde:</label>
          <input type="date" v-model="filters.startDate">
          <label>Hasta:</label>
          <input type="date" v-model="filters.endDate">
        </div>
      </div>

      <div class="actions">
        <button style="background: #2c3e50;" class="btn primary" @click="openCreateModal">
          <span class="material-icons">add</span> Nueva Orden
        </button>
        <button class="btn secondary" @click="exportToExcel">
          <span class="material-icons">download</span> Exportar
        </button>
      </div>
    </div>

    <!-- Resumen rápido -->
    <div class="summary-cards">
      <div class="summary-card" @click="setFilter('status', 'pending')">
        <div class="card-value">{{ stats.pending }}</div>
        <div class="card-label">Pendientes</div>
      </div>
      <div class="summary-card" @click="setFilter('status', 'in-progress')">
        <div class="card-value">{{ stats.inProgress }}</div>
        <div class="card-label">En Progreso</div>
      </div>
      <div class="summary-card" @click="setFilter('status', 'completed')">
        <div class="card-value">{{ stats.completed }}</div>
        <div class="card-label">Completadas</div>
      </div>
      <div class="summary-card" @click="setFilter('status', 'delayed')">
        <div class="card-value">{{ stats.delayed }}</div>
        <div class="card-label">Retrasadas</div>
      </div>
    </div>

    <!-- Listado de órdenes -->
    <div class="orders-table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th @click="sortBy('id')">
              ID <span class="sort-icon" :class="{ active: sort.field === 'id' }">
                {{ sort.field === 'id' && sort.order === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('client')">Cliente</th>
            <th @click="sortBy('description')">Descripción</th>
            <th @click="sortBy('priority')">Prioridad</th>
            <th @click="sortBy('status')">Estado</th>
            <th @click="sortBy('startDate')">Fecha Inicio</th>
            <th @click="sortBy('endDate')">Fecha Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" :class="[order.status, order.priority]">
            <td>{{ order.id }}</td>
            <td>{{ order.client.name }}</td>
            <td class="description-cell">{{ order.description }}</td>
            <td>
              <span class="priority-badge" :class="order.priority">
                {{ priorityLabels[order.priority] }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="order.status">
                {{ statusLabels[order.status] }}
              </span>
            </td>
            <td>{{ formatDate(order.startDate) }}</td>
            <td>{{ formatDate(order.endDate) }}</td>
            <td class="actions-cell">
              <button class="icon-btn" @click="openEditModal(order)">
                <span class="material-icons">edit</span>
              </button>
              <button class="icon-btn" @click="openDetailsModal(order)">
                <span class="material-icons">visibility</span>
              </button>
              <button class="icon-btn" @click="changeStatus(order, 'completed')" v-if="order.status !== 'completed'">
                <span class="material-icons">check_circle</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">
        <span class="material-icons">chevron_left</span>
      </button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">
        <span class="material-icons">chevron_right</span>
      </button>
    </div>

    <!-- Modal Crear/Editar -->
    <WorkOrderModal v-if="showModal" :order="currentOrder" :mode="modalMode" @save="saveOrder" @close="closeModal" />

    <!-- Modal de Detalles -->
    <OrderDetailsModal v-if="showDetailsModal" :order="selectedOrder" @close="closeDetailsModal" />
  </div>
</template>

<script>
import WorkOrderModal from '@/components/VistasCoordinador/ComponentesCoordinador/WorkOrderModal.vue';
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
</script>

<style scoped>
.work-orders-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: #003366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #003366, #003366);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}

.dark-mode .work-orders-page {
  background-color: #121212;
  color: #ffffff;
}

.controls-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select,
.filter-group input[type="date"] {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
}

.dark-mode .filter-select,
.dark-mode .filter-group input[type="date"] {
  background-color: #333;
  color: #fff;
  border-color: #555;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background-color: var(--primary-color);
  color: white;
}

.btn.primary:hover {
  background-color: var(--secondary-color);
}

.btn.secondary {
  background-color: #e0e0e0;
  color: #333;
}

.dark-mode .btn.secondary {
  background-color: #333;
  color: #fff;
}

.btn.secondary:hover {
  background-color: #d0d0d0;
}

.dark-mode .btn.secondary:hover {
  background-color: #444;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.dark-mode .summary-card {
  background-color: #1e1e1e;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.summary-card:hover {
  transform: translateY(-3px);
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--primary-color);
}

.card-label {
  font-size: 14px;
  color: #666;
}

.dark-mode .card-label {
  color: #aaa;
}

.orders-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.dark-mode .orders-table-container {
  background-color: #1e1e1e;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background-color: #f5f5f5;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.dark-mode .orders-table th {
  background-color: #2d2d2d;
}

.orders-table th:hover {
  background-color: #e0e0e0;
}

.dark-mode .orders-table th:hover {
  background-color: #3d3d3d;
}

.sort-icon {
  margin-left: 5px;
  font-size: 12px;
}

.sort-icon.active {
  color: var(--primary-color);
}

.orders-table td {
  padding: 12px 15px;
  border-top: 1px solid #eee;
}

.dark-mode .orders-table td {
  border-top-color: #333;
}

.orders-table tr:hover {
  background-color: #f9f9f9;
}

.dark-mode .orders-table tr:hover {
  background-color: #2d2d2d;
}

.description-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.priority-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.priority-badge.high {
  background-color: #ffebee;
  color: #c62828;
}

.dark-mode .priority-badge.high {
  background-color: #4a2222;
  color: #ffcdd2;
}

.priority-badge.medium {
  background-color: #fff8e1;
  color: #ff8f00;
}

.dark-mode .priority-badge.medium {
  background-color: #4a3a1a;
  color: #ffe082;
}

.priority-badge.low {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.dark-mode .priority-badge.low {
  background-color: #1a3a1a;
  color: #a5d6a7;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #e3f2fd;
  color: #1565c0;
}

.dark-mode .status-badge.pending {
  background-color: #1a3a4a;
  color: #90caf9;
}

.status-badge.in-progress {
  background-color: #e0f7fa;
  color: #00838f;
}

.dark-mode .status-badge.in-progress {
  background-color: #1a3a3a;
  color: #80deea;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.dark-mode .status-badge.completed {
  background-color: #1a3a1a;
  color: #a5d6a7;
}

.status-badge.delayed {
  background-color: #ffebee;
  color: #c62828;
}

.dark-mode .status-badge.delayed {
  background-color: #4a2222;
  color: #ffcdd2;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.dark-mode .icon-btn {
  color: #aaa;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--primary-color);
}

.dark-mode .icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--primary-color);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark-mode .pagination button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Estilos para filas según estado y prioridad */
tr.pending {
  border-left: 4px solid #1565c0;
}

tr.in-progress {
  border-left: 4px solid #00838f;
}

tr.completed {
  border-left: 4px solid #2e7d32;
}

tr.delayed {
  border-left: 4px solid #c62828;
}

tr.high td:first-child {
  border-left: 4px solid #c62828;
}

tr.medium td:first-child {
  border-left: 4px solid #ff8f00;
}

tr.low td:first-child {
  border-left: 4px solid #2e7d32;
}

@media (max-width: 768px) {
  .controls-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select,
  .filter-group input[type="date"] {
    flex: 1;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }

  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .orders-table th,
  .orders-table td {
    padding: 8px 10px;
    font-size: 14px;
  }

  .btn {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>