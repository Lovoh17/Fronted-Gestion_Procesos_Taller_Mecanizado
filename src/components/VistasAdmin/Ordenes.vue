<template>
  <div class="produccion-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Gestión de Producción</h1>
            <p class="header-subtitle">Administra y controla los procesos productivos</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" @click="showNuevoTrabajoModal = true" icon="add">
            Nuevo Pedido
          </va-button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border" role="status">
        <span class="sr-only">Cargando...</span>
      </div>
    </div>

    <div class="tabs-container mb-4" v-if="!loading">
      <ul class="flex border-b border-gray-200">
        <li class="mr-1">
          <a @click="activeTab = 'produccion'" :class="{
            'bg-white border-l border-t border-r border-gray-200 text-blue-600': activeTab === 'produccion',
            'text-gray-500 hover:text-gray-700': activeTab !== 'produccion'
          }" class="inline-block py-2 px-4 font-semibold text-sm flex items-center">
            <i class="fas fa-clock mr-2"></i>
            En Producción
          </a>
        </li>
        <li class="mr-1">
          <a @click="activeTab = 'historial'" :class="{
            'bg-white border-l border-t border-r border-gray-200 text-blue-600': activeTab === 'historial',
            'text-gray-500 hover:text-gray-700': activeTab !== 'historial'
          }" class="inline-block py-2 px-4 font-semibold text-sm flex items-center">
            <i class="fas fa-history mr-2"></i>
            Historial
          </a>
        </li>
      </ul>
    </div>

    <!-- Contenido de pestañas -->
    <div class="tab-content" v-if="!loading">
      <!-- Pestaña Producción -->
      <div v-if="activeTab === 'produccion'" class="tab-pane active">
        <div class="card">
          <div class="card-body">
            <vue-good-table ref="vueGoodTableProduccion" :columns="columnsProduccion" max-height="45vh"
              :rows="trabajosProduccion" :search-options="{
                enabled: true,
                placeholder: 'Buscar en pedidos de producción...',
                externalQuery: searchQuery
              }" :pagination-options="{
                enabled: true,
                mode: 'records',
                perPage: 10,
                perPageDropdown: [5, 10, 20, 50],
                dropdownAllowAll: false,
                nextLabel: 'Siguiente',
                prevLabel: 'Anterior',
                rowsPerPageLabel: 'Filas por página',
                ofLabel: 'de',
                pageLabel: 'página',
                allLabel: 'Todos'
              }" :sort-options="{
                enabled: true,
                initialSortBy: { field: 'fecha_solicitud', type: 'desc' }
              }" :select-options="{
                enabled: false
              }" styleClass="vgt-table striped bordered" theme="Black-rhino">
              <!-- Slot personalizado para cada celda -->
              <template #table-row="props">
                <!-- Columna de Proyecto -->
                <span v-if="props.column.field === 'proyecto_asociado'">
                  {{ props.row.proyecto_asociado || 'N/A' }}
                </span>

                <!-- Columna de Fecha de Solicitud -->
                <span v-else-if="props.column.field === 'fecha_solicitud'">
                  {{ formatDate(props.row.fecha_solicitud) }}
                </span>

                <!-- Columna de Fecha Estimada de Entrega -->
                <span v-else-if="props.column.field === 'fecha_estimada_entrega'">
                  {{ formatDate(props.row.fecha_estimada_entrega) || 'Pendiente' }}
                </span>

                <!-- Columna de Estado -->
                <span v-else-if="props.column.field === 'estado'">
                  <span :class="['badge', estadoClass(props.row.estado)]">
                    {{ formatEstado(props.row.estado) }}
                  </span>
                </span>

                <!-- Columna de Acciones -->
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <va-button size="small" preset="plain" color="info" @click="verDetalles(props.row)"
                      icon="visibility" class="mr-1"></va-button>
                    <va-button size="small" preset="plain" color="warning" @click="editarTrabajo(props.row)" icon="edit"
                      class="mr-1"></va-button>
                    <va-button size="small" preset="plain" color="danger" @click="eliminarTrabajo(props.row.id)"
                      icon="delete" :loading="loadingDelete === props.row.id"></va-button>
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
                    <span class="text-muted">Pedidos en producción: {{ trabajosProduccion.length }}</span>
                  </div>
                  <div class="table-actions-buttons">
                    <va-button color="success" size="small" @click="exportProduccionToCSV" icon="download" class="mr-2">
                      Exportar CSV
                    </va-button>
                    <va-button color="primary" size="small" @click="loadPedidos" icon="refresh" :loading="loading">
                      Recargar
                    </va-button>
                  </div>
                </div>
              </template>

              <!-- Mensaje cuando no hay datos -->
              <template #emptystate>
                <div class="text-center py-4">
                  <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay pedidos en producción</h5>
                  <p class="text-muted">Los pedidos pendientes y en proceso aparecerán aquí</p>
                  <va-button color="primary" @click="showNuevoTrabajoModal = true" icon="add">
                    Crear Nuevo Pedido
                  </va-button>
                </div>
              </template>
            </vue-good-table>
          </div>
        </div>
      </div>

      <!-- Pestaña Historial -->
      <div v-if="activeTab === 'historial'" class="tab-pane active">
        <div class="card">
          <div class="card-body">
            <vue-good-table ref="vueGoodTableHistorial" :columns="columnsHistorial" :rows="filteredHistorial"
              :search-options="{
                enabled: true,
                placeholder: 'Buscar en historial de pedidos...',
                externalQuery: searchQuery
              }" :pagination-options="{
                enabled: true,
                mode: 'records',
                perPage: 10,
                perPageDropdown: [5, 10, 20, 50],
                dropdownAllowAll: false,
                nextLabel: 'Siguiente',
                prevLabel: 'Anterior',
                rowsPerPageLabel: 'Filas por página',
                ofLabel: 'de',
                pageLabel: 'página',
                allLabel: 'Todos'
              }" :sort-options="{
                enabled: true,
                initialSortBy: { field: 'fecha_completado', type: 'desc' }
              }" :select-options="{
                enabled: false
              }" styleClass="vgt-table striped bordered" theme="rinoh">
              <!-- Slot personalizado para cada celda -->
              <template #table-row="props">
                <!-- Columna de Proyecto -->
                <span v-if="props.column.field === 'proyecto_asociado'">
                  {{ props.row.proyecto_asociado || 'N/A' }}
                </span>

                <!-- Columna de Fecha de Solicitud -->
                <span v-else-if="props.column.field === 'fecha_solicitud'">
                  {{ formatDate(props.row.fecha_solicitud) }}
                </span>

                <!-- Columna de Fecha Completado -->
                <span v-else-if="props.column.field === 'fecha_completado'">
                  {{ formatDate(props.row.fecha_completado) }}
                </span>

                <!-- Columna de Estado -->
                <span v-else-if="props.column.field === 'estado'">
                  <span :class="['badge', estadoClass(props.row.estado)]">
                    {{ formatEstado(props.row.estado) }}
                  </span>
                </span>

                <!-- Columna de Acciones -->
                <span v-else-if="props.column.field === 'actions'">
                  <div class="action-buttons">
                    <va-button size="small" preset="plain" color="info" @click="verDetalles(props.row)"
                      icon="visibility"></va-button>
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
                    <span class="text-muted">Historial: {{ filteredHistorial.length }} pedidos completados</span>
                  </div>
                  <div class="table-actions-buttons">
                    <va-button color="success" size="small" @click="exportHistorialToCSV" icon="download" class="mr-2">
                      Exportar CSV
                    </va-button>
                    <va-button color="primary" size="small" @click="loadPedidos" icon="refresh" :loading="loading">
                      Recargar
                    </va-button>
                  </div>
                </div>
              </template>

              <!-- Mensaje cuando no hay datos -->
              <template #emptystate>
                <div class="text-center py-4">
                  <i class="fas fa-history fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No hay pedidos en el historial</h5>
                  <p class="text-muted">Los pedidos completados y entregados aparecerán aquí</p>
                </div>
              </template>
            </vue-good-table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalles Pedido -->
    <TrabajoModal v-if="showTrabajoModal" :trabajo="selectedTrabajo" @close="closeTrabajoModal" @save="saveTrabajo" />

    <!-- Modal Nuevo Pedido -->
    <NuevoTrabajoModal v-if="showNuevoTrabajoModal" @close="showNuevoTrabajoModal = false" @save="addTrabajo" />
  </div>
</template>

<script src="./ComponentesAdmin/Script/Ordenes.js"></script>

