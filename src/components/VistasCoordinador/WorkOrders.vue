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
          <va-button color="#003366" @click="openWizardModal" icon="add">
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

    <!-- Tabla de órdenes con vue-good-table-next -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando órdenes de trabajo...</p>
        </div>

        <div v-else>
          <vue-good-table ref="vueGoodTable" :columns="tableColumns" :rows="filteredOrders" max-height="45vh"
            :search-options="{
              enabled: true,
              placeholder: 'Buscar órdenes...',
              externalQuery: searchQuery
            }" :pagination-options="{
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
            }" :sort-options="{
              enabled: true,
              initialSortBy: { field: 'start_date', type: 'desc' }
            }" :select-options="{
              enabled: false
            }" styleClass="vgt-table striped bordered" theme="rinoh">
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
                    <div class="bg-blue-600 h-2 rounded-full" :style="{ width: props.row.progress + '%' }"></div>
                  </div>
                  <span class="text-xs font-medium">{{ props.row.progress }}%</span>
                </div>
              </span>
              
              <!-- Columna de Costo Estimado -->
              <span v-else-if="props.column.field === 'costo_estimado'">
                {{ formatCurrency(props.row.costo_estimado) }}
              </span>

              <!-- Columna de Acciones -->
              <span v-else-if="props.column.field === 'actions'">
                <div class="action-buttons">
                  <va-button size="small" preset="plain" color="info" @click="viewOrder(props.row)" icon="visibility"
                    class="mr-1"></va-button>
                  <va-button size="small" preset="plain" color="warning" @click="editOrder(props.row)" icon="edit"
                    class="mr-1"></va-button>
                  <va-button v-if="props.row.status !== 'completado'" size="small" preset="plain" color="success"
                    @click="completeOrder(props.row)" icon="check_circle" class="mr-1"></va-button>
                  <va-button size="small" preset="plain" color="danger" @click="deleteOrder(props.row.id)"
                    icon="delete"></va-button>
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
                  <va-button color="success" size="small" @click="exportToCSV" icon="download" class="mr-2">
                    Exportar CSV
                  </va-button>
                  <va-button color="primary" size="small" @click="loadOrders" icon="refresh" :loading="loading">
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
                <va-button color="primary" @click="openWizardModal" icon="add">
                  Crear Primera Orden
                </va-button>
              </div>
            </template>
          </vue-good-table>
        </div>
      </div>
    </div>

    <!-- Modal Wizard de Nueva Orden de Trabajo -->
    <NewWorkOrderWizardModal v-model="showWizardModal" @close="onWizardClose" @save="onOrderSave"
      @draft-saved="onDraftSaved" />
  </div>
</template>

<script>
import WorkOrdersScript from './scripts/WorkOrders.js'

export default WorkOrdersScript
</script>
<style src="./styles/WorkOrdersView.css" scoped></style>
<style src="src/assets/EstiloBase.css"></style>