<template>
  <div class="container">
    <!-- Encabezado y controles -->
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
          <va-button color="#003366" @click="openCreateModal = true" icon="add">
            Nuevo Pedido
          </va-button>
        </div>
      </div>
    </div>

    <div class="header">
      <h2>Gestión de Mantenimientos</h2>
      <div class="controls">
        <input type="text" v-model="searchQuery" placeholder="Buscar mantenimientos..." class="search-input">

      </div>
    </div>

    <!-- Estado de carga/error -->
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Tabla de mantenimientos/vue-good-table-next -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando mantenimientos...</p>
        </div>

        <div v-else>
          <vue-good-table ref="vueGoodTable" :fixedHeader="true" :columns="tableColumns" max-height="45vh"
            :rows="mantenimientos" :search-options="{
              enabled: true,
              placeholder: 'Buscar mantenimientos por nombre, herramienta o tipo...',
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
          initialSortBy: { field: 'nombre', type: 'asc' }
        }" :select-options="{
          enabled: false
        }" styleClass="vgt-table striped bordered" theme="Black-rhino">

            <!-- Slot personalizado para cada celda -->
            <template #table-row="props">
              <!-- Columna de Nombre -->
              <span v-if="props.column.field === 'nombre'">
                {{ props.row.nombre }}
              </span>

              <!-- Columna de Herramienta -->
              <span v-else-if="props.column.field === 'herramienta_id'">
                {{ getHerramientaName(props.row.herramienta_id) }}
              </span>

              <!-- Columna de Tipo de Mantenimiento -->
              <span v-else-if="props.column.field === 'tipo_mantenimiento_id'">
                <span :class="['badge', tipoMantenimientoClass(props.row.tipo_mantenimiento_id)]">
                  {{ getTipoMantenimientoName(props.row.tipo_mantenimiento_id) }}
                </span>
              </span>

              <!-- Columna de Fecha Programada -->
              <span v-else-if="props.column.field === 'fecha_programada'">
                {{ formatDate(props.row.fecha_programada) }}
              </span>

              <!-- Columna de Estado -->
              <span v-else-if="props.column.field === 'estado_id'">
                <span :class="['badge', estadoClass(props.row.estado_id)]">
                  {{ getEstadoName(props.row.estado_id) }}
                </span>
              </span>

              <!-- Columna de Acciones -->
              <span v-else-if="props.column.field === 'actions'">
                <div class="action-buttons">
                  <va-button size="small" preset="plain" color="info" @click="openEditModal(props.row)" icon="edit"
                    class="mr-1">
                  </va-button>
                  <va-button size="small" preset="plain" color="danger" @click="deleteMantenimiento(props.row.id)"
                    icon="delete">
                  </va-button>
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
                  <span class="text-muted">Total: {{ mantenimientos.length }} mantenimientos</span>
                </div>
                <div class="table-actions-buttons">
                  <va-button color="success" size="small" @click="exportToCSV" icon="download" class="mr-2">
                    Exportar CSV
                  </va-button>
                  <va-button color="info" size="small" @click="testConnection" icon="wifi" class="mr-2">
                    Test Conexión
                  </va-button>
                  <va-button color="primary" size="small" @click="loadMantenimientos" icon="refresh">
                    Recargar
                  </va-button>
                </div>
              </div>
            </template>

            <!-- Mensaje cuando no hay datos -->
            <template #emptystate>
              <div class="text-center py-4">
                <i class="fas fa-tools fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No se encontraron mantenimientos</h5>
                <p class="text-muted">Intenta ajustar los filtros o crear un nuevo mantenimiento</p>
                <va-button color="primary" @click="showAddMantenimientoModal = true" icon="add">
                  Crear Mantenimiento
                </va-button>
              </div>
            </template>
          </vue-good-table>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalMode === 'create' ? 'Nuevo' : 'Editar' }} Mantenimiento</h3>

        <form @submit.prevent="saveMantenimiento">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="currentMantenimiento.nombre" required>
          </div>

          <div class="form-group">
            <label>Herramienta:</label>
            <select v-model="currentMantenimiento.herramienta_id" required>
              <option v-for="(h, id) in herramientas" :key="id" :value="id">
                {{ h.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Tipo de Mantenimiento:</label>
            <select v-model="currentMantenimiento.tipo_mantenimiento_id" required>
              <option v-for="(t, id) in tiposMantenimiento" :key="id" :value="id">
                {{ t.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fecha Programada:</label>
            <input type="date" v-model="currentMantenimiento.fecha_programada" required>
          </div>

          <div class="form-group">
            <label>Descripción del Problema:</label>
            <textarea v-model="currentMantenimiento.descripcion_problema"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="showModal = false" class="btn secondary">
              Cancelar
            </button>
            <button type="submit" class="btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script src="./scripts/Maintenance.js"></script>
<style src="./styles/Maintenance.css"></style>
<style src="src/assets/EstiloBase.css" scoped></style>
