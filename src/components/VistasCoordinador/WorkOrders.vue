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

<script src="./scripts/WorkOrdersView.js"></script>
<style src="./styles/WorkOrdersView.css" scoped></style>