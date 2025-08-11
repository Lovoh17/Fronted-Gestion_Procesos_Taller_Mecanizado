<template>
  <div class="work-orders-dashboard">
    <!-- Encabezado -->
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
        <div class="header-actions">
          <va-button color="secondary" @click="exportToCSV" icon="download">
            Exportar
          </va-button>
          <va-button color="#003366" @click="showNewOrderModal = true" icon="add">
            Nueva Orden
          </va-button>
        </div>
      </div>
    </div>

    <!-- Resumen estadístico mejorado -->
    <div class="orders-summary mb-6">
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="stat-info">
            <h4>Total Órdenes</h4>
            <p class="stat-value">{{ totalOrders }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <h4>Pendientes</h4>
            <p class="stat-value">{{ pendingOrders }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon progress">
            <i class="fas fa-cogs"></i>
          </div>
          <div class="stat-info">
            <h4>En Progreso</h4>
            <p class="stat-value">{{ inProgressOrders }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-info">
            <h4>Completadas</h4>
            <p class="stat-value">{{ completedOrders }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon delayed">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-info">
            <h4>Retrasadas</h4>
            <p class="stat-value">{{ delayedOrders }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <div class="bg-white rounded-lg shadow-sm mb-4">
      <!-- Encabezado del panel -->
      <div class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        @click="toggleFilters">
        <div class="flex items-center text-gray-700 font-medium">
          <i class="fas fa-filter mr-2 text-gray-500"></i>
          <span>Filtros de Búsqueda</span>
          <div v-if="hasActiveFilters"
            class="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
            {{ activeFiltersCount }}
          </div>
        </div>
        <button class="text-gray-500 hover:text-gray-700">
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </button>
      </div>

      <!-- Contenido de filtros -->
      <div v-if="showFilters" class="p-4 border-t border-gray-200">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          <!-- Filtro Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-toggle-on mr-1 text-gray-500"></i>
              Estado
            </label>
            <va-select v-model="statusFilter" :options="[
              { text: 'Todos', value: 'all' },
              { text: 'Pendiente', value: 'pending' },
              { text: 'En Progreso', value: 'in_progress' },
              { text: 'Completada', value: 'completed' },
              { text: 'Retrasada', value: 'delayed' },
              { text: 'Cancelada', value: 'cancelled' }
            ]" class="w-full" placeholder="Seleccionar estado" clearable />
          </div>

          <!-- Filtro Prioridad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-exclamation-triangle mr-1 text-gray-500"></i>
              Prioridad
            </label>
            <va-select v-model="priorityFilter" :options="[
              { text: 'Todas', value: 'all' },
              { text: 'Baja', value: 'low' },
              { text: 'Media', value: 'medium' },
              { text: 'Alta', value: 'high' },
              { text: 'Urgente', value: 'urgent' }
            ]" class="w-full" placeholder="Seleccionar prioridad" clearable />
          </div>

          <!-- Filtro Cliente -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-building mr-1 text-gray-500"></i>
              Cliente
            </label>
            <va-input v-model="clientFilter" placeholder="Filtrar por cliente" class="w-full" clearable />
          </div>

          <!-- Filtro Asignado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-user mr-1 text-gray-500"></i>
              Asignado a
            </label>
            <va-input v-model="assignedToFilter" placeholder="Filtrar por asignado" class="w-full" clearable />
          </div>

          <!-- Filtro Fecha Inicio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>
              Fecha Desde
            </label>
            <va-input type="date" v-model="dateRange.start" class="w-full" />
          </div>

          <!-- Filtro Fecha Fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>
              Fecha Hasta
            </label>
            <va-input type="date" v-model="dateRange.end" class="w-full" />
          </div>
        </div>

        <!-- Barra de búsqueda -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <i class="fas fa-search mr-1 text-gray-500"></i>
            Búsqueda Global
          </label>
          <va-input v-model="searchQuery" placeholder="Buscar por ID, descripción, cliente o asignado..." 
            class="w-full" clearable>
            <template #prependInner>
              <va-icon name="search" class="text-gray-500" />
            </template>
          </va-input>
        </div>

        <!-- Acciones de filtros -->
        <div class="flex justify-end items-center space-x-3 pt-4 border-t border-gray-100">
          <va-button preset="outline" color="secondary" size="medium" @click="resetFilters" icon="refresh">
            Limpiar Filtros
          </va-button>
          <va-button color="primary" size="medium" @click="applyFilters" icon="check">
            Aplicar Filtros
          </va-button>
        </div>
      </div>
    </div>

    <!-- Tabla de órdenes con vue-good-table-next -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando órdenes de trabajo...</p>
        </div>

        <div v-else>
          <vue-good-table
            ref="vueGoodTable"
            :columns="tableColumns"
            :rows="filteredOrders"
            max-height="45vh"
            :fixedHeader="true"
            :search-options="{
              enabled: true,
              placeholder: 'Buscar órdenes...',
              externalQuery: searchQuery
            }"
            :pagination-options="{
              enabled: true,
              mode: 'records',
              perPage: 15,
              perPageDropdown: [10, 15, 25, 50],
              dropdownAllowAll: false,
              nextLabel: 'Siguiente',
              prevLabel: 'Anterior',
              rowsPerPageLabel: 'Filas por página',
              ofLabel: 'de',
              pageLabel: 'página',
              allLabel: 'Todos'
            }"
            :sort-options="{
              enabled: true,
              initialSortBy: { field: 'start_date', type: 'desc' }
            }"
            :select-options="{
              enabled: false
            }"
            styleClass="vgt-table striped bordered"
            theme="nocturnal"
          >
            <!-- Slot personalizado para cada celda -->
            <template #table-row="props">
              <!-- Columna de Estado -->
              <span v-if="props.column.field === 'status'">
                <span :class="['badge', statusClass(props.row.status)]">
                  {{ formatStatus(props.row.status) }}
                </span>
              </span>
              
              <!-- Columna de Prioridad -->
              <span v-else-if="props.column.field === 'priority'">
                <span :class="['badge', priorityClass(props.row.priority)]">
                  {{ formatPriority(props.row.priority) }}
                </span>
              </span>
              
              <!-- Columna de Fecha de Inicio -->
              <span v-else-if="props.column.field === 'start_date'">
                {{ formatDate(props.row.start_date) }}
              </span>
              
              <!-- Columna de Fecha de Fin -->
              <span v-else-if="props.column.field === 'end_date'">
                {{ formatDate(props.row.end_date) }}
              </span>
              
              <!-- Columna de Progreso -->
              <span v-else-if="props.column.field === 'progress'">
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: props.row.progress + '%' }"></div>
                  </div>
                  <span class="text-xs font-medium">{{ props.row.progress }}%</span>
                </div>
              </span>
              
              <!-- Columna de Acciones -->
              <span v-else-if="props.column.field === 'actions'">
                <div class="action-buttons">
                  <va-button 
                    size="small" 
                    preset="plain" 
                    color="info" 
                    @click="viewOrder(props.row)" 
                    icon="visibility"
                    class="mr-1"
                  ></va-button>
                  <va-button 
                    size="small" 
                    preset="plain" 
                    color="warning" 
                    @click="editOrder(props.row)" 
                    icon="edit"
                    class="mr-1"
                  ></va-button>
                  <va-button 
                    v-if="props.row.status !== 'completed'"
                    size="small" 
                    preset="plain" 
                    color="success" 
                    @click="completeOrder(props.row)" 
                    icon="check_circle"
                    class="mr-1"
                  ></va-button>
                  <va-button 
                    size="small" 
                    preset="plain" 
                    color="danger" 
                    @click="deleteOrder(props.row.id)" 
                    icon="delete"
                  ></va-button>
                </div>
              </span>
              
              <!-- Contenido por defecto -->
              <span v-else>
                {{ props.formattedRow[props.column.field] }}
              </span>
            </template>

            <!-- Slot para acciones en la parte superior de la tabla -->
            <template #table-actions>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="table-info">
                  <span class="text-muted">Órdenes: {{ filteredOrders.length }} de {{ totalOrders }}</span>
                </div>
                <div class="table-actions-buttons">
                  <va-button 
                    color="success" 
                    size="small" 
                    @click="exportToCSV" 
                    icon="download"
                    class="mr-2"
                  >
                    Exportar CSV
                  </va-button>
                  <va-button 
                    color="primary" 
                    size="small" 
                    @click="loadOrders" 
                    icon="refresh"
                    :loading="loading"
                  >
                    Recargar
                  </va-button>
                </div>
              </div>
            </template>

            <!-- Mensaje cuando no hay datos -->
            <template #emptystate>
              <div class="text-center py-4">
                <i class="fas fa-tasks fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No hay órdenes de trabajo disponibles</h5>
                <p class="text-muted">Las órdenes creadas aparecerán aquí</p>
                <va-button color="primary" @click="showNewOrderModal = true" icon="add">
                  Crear Primera Orden
                </va-button>
              </div>
            </template>
          </vue-good-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WorkOrdersScript from './scripts/WorkOrders.js'

export default WorkOrdersScript
</script>
<style src="./styles/WorkOrdersView.css" scoped></style>
<style src="src/assets/EstiloBase.css"></style>