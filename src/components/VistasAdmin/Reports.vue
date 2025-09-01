<template>
  <div class="alerts-dashboard">
    <div class="content-wrapper">
      <main>
        <!-- Encabezado -->
        <div class="header-section">
          <div class="header-content">
            <div class="header-info">
              <div class="header-icon">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div class="header-text">
                <h1 class="header-title">Alertas de Reparación</h1>
                <p class="header-subtitle">Gestiona las alertas de mantenimiento y reparación de herramientas</p>
              </div>
            </div>
            <div class="header-actions">
              <va-button color="#003366" @click="showNewAlertModal = true" icon="add">
                Nueva Alerta
              </va-button>
            </div>
          </div>
        </div>

        <!-- Resumen estadístico -->
        <div class="alerts-summary mb-6">
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-icon total">
                <i class="fas fa-bell"></i>
              </div>
              <div class="stat-info">
                <h4>Total Alertas</h4>
                <p class="stat-value">{{ totalAlertas }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon pending">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h4>Pendientes</h4>
                <p class="stat-value">{{ alertasPendientes }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon progress">
                <i class="fas fa-wrench"></i>
              </div>
              <div class="stat-info">
                <h4>En Reparación</h4>
                <p class="stat-value">{{ alertasEnReparacion }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon completed">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="stat-info">
                <h4>Resueltas</h4>
                <p class="stat-value">{{ alertasResueltas }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de alertas -->
        <div class="card">
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin fa-2x"></i>
              <p>Cargando alertas...</p>
            </div>

            <div v-else>
              <vue-good-table ref="vueGoodTable" :columns="tableColumns" :rows="filteredAlertas" max-height="45vh"
                :search-options="{
                  enabled: true,
                  placeholder: 'Buscar alertas...',
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
                  initialSortBy: { field: 'fecha_generacion', type: 'desc' }
                }" :select-options="{
                  enabled: false
                }" styleClass="vgt-table striped bordered" theme="rinoh">
                <!-- Slot personalizado para cada celda -->
                <template #table-row="props">
                  <!-- Columna de Tipo de Alerta -->
                  <span v-if="props.column.field === 'tipo_alerta'">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="{
                      'bg-orange-100 text-orange-800': props.row.tipo_alerta_id === '1',
                      'bg-red-100 text-red-800': props.row.tipo_alerta_id === '2',
                      'bg-blue-100 text-blue-800': props.row.tipo_alerta_id === '3',
                      'bg-yellow-100 text-yellow-800': props.row.tipo_alerta_id === '4',
                      'bg-purple-100 text-purple-800': props.row.tipo_alerta_id === '5',
                      'bg-indigo-100 text-indigo-800': props.row.tipo_alerta_id === '6'
                    }">
                      {{ getTipoAlerta(props.row.tipo_alerta_id) }}
                    </span>
                  </span>

                  <!-- Columna de Estado -->
                  <span v-else-if="props.column.field === 'estado_reparacion'">
                    <span :class="['badge', getEstadoClass(props.row.estado_reparacion)]">
                      {{ getEstadoText(props.row.estado_reparacion) }}
                    </span>
                  </span>

                  <!-- Columna de Prioridad -->
                  <span v-else-if="props.column.field === 'prioridad_id'">
                    <span :class="['badge', getPrioridadClass(props.row.prioridad_id)]">
                      {{ getPrioridadText(props.row.prioridad_id) }}
                    </span>
                  </span>

                  <!-- Columna de Fecha de Generación -->
                  <span v-else-if="props.column.field === 'fecha_generacion'">
                    {{ formatDate(props.row.fecha_generacion) }}
                  </span>

                  <!-- Columna de Fecha Límite -->
                  <span v-else-if="props.column.field === 'fecha_limite'">
                    <span :class="getDaysLeftClass(props.row.fecha_limite)">
                      {{ formatDate(props.row.fecha_limite) }}
                      <small class="d-block">{{ getDaysLeft(props.row.fecha_limite) }}</small>
                    </span>
                  </span>

                  <!-- Columna de Fecha Resolución -->
                  <span v-else-if="props.column.field === 'fecha_resolucion'">
                    {{ props.row.fecha_resolucion ? formatDate(props.row.fecha_resolucion) : '-' }}
                  </span>

                  <!-- Columna de Resuelta por -->
                  <span v-else-if="props.column.field === 'resuelta_por'">
                    {{ getUsuarioNombre(props.row.resuelta_por) }}
                  </span>
                  <span v-else-if="props.column.field === 'herramienta'">
                    <div class="herramienta-info">
                      <strong>{{ getHerramientaNombre(props.row.herramienta_id) }}</strong>
                      <small class="d-block text-muted">ID: {{ props.row.herramienta_id }}</small>
                    </div>
                  </span>

                  <!-- Columna de Acciones -->
                  <span v-else-if="props.column.field === 'actions'">
                    <div class="action-buttons">
                      <va-button size="small" preset="plain" color="info" @click="viewAlert(props.row)"
                        icon="visibility" class="mr-1" title="Ver detalles"></va-button>

                      <va-button size="small" preset="plain" color="primary" @click="editAlert(props.row)" icon="edit"
                        class="mr-1" title="Editar"></va-button>

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
                      <span class="text-muted">Alertas: {{ filteredAlertas.length }} de {{ totalAlertas }}</span>
                    </div>
                    <div class="table-actions-buttons">
                      <va-button color="success" size="small" @click="exportToCSV" icon="download" class="mr-2">
                        Exportar CSV
                      </va-button>
                      <va-button color="primary" size="small" @click="loadAlertas" icon="refresh" :loading="loading">
                        Recargar
                      </va-button>
                    </div>
                  </div>
                </template>

                <!-- Mensaje cuando no hay datos -->
                <template #emptystate>
                  <div class="text-center py-4">
                    <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No hay alertas disponibles</h5>
                    <p class="text-muted">Las alertas de reparación aparecerán aquí</p>
                    <va-button color="primary" @click="showNewAlertModal = true" icon="add">
                      Crear Primera Alerta
                    </va-button>
                  </div>
                </template>
              </vue-good-table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal para Ver Detalles de Alerta - MEJORADO -->
    <va-modal v-model="showViewModal" title="Detalles de la Alerta" size="large" :close-button="true"
      class="details-modal">
      <div v-if="selectedAlert" class="alert-details">
        <div class="details-header">
          <div class="alert-id">Alerta #{{ selectedAlert.id }}</div>
          <div :class="['status-badge', getEstadoClass(selectedAlert.estado_reparacion)]">
            {{ getEstadoText(selectedAlert.estado_reparacion) }}
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-tools"></i>
              <h3>Información de la Herramienta</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-item">
                <label>Herramienta:</label>
                <span class="detail-value">{{ getHerramientaNombre(selectedAlert.herramienta_id) }}</span>
              </div>
              <div class="detail-item">
                <label>ID Herramienta:</label>
                <span class="detail-value">{{ selectedAlert.herramienta_id }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-exclamation-circle"></i>
              <h3>Tipo de Alerta</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-item">
                <span :class="['badge-type', getTipoAlertaClass(selectedAlert.tipo_alerta_id)]">
                  <i class="fas fa-bell"></i>
                  {{ getTipoAlerta(selectedAlert.tipo_alerta_id) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-flag"></i>
              <h3>Prioridad</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-item">
                <span :class="['badge-priority', getPrioridadClass(selectedAlert.prioridad_id)]">
                  {{ getPrioridadText(selectedAlert.prioridad_id) }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-card-header">
              <i class="fas fa-calendar"></i>
              <h3>Fechas</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-item">
                <label>Generación:</label>
                <span class="detail-value">{{ formatDate(selectedAlert.fecha_generacion) }}</span>
              </div>
              <div class="detail-item">
                <label>Límite:</label>
                <span class="detail-value" :class="getDaysLeftClass(selectedAlert.fecha_limite)">
                  {{ formatDate(selectedAlert.fecha_limite) }}
                  <span class="days-left">{{ getDaysLeft(selectedAlert.fecha_limite) }}</span>
                </span>
              </div>
              <div class="detail-item" v-if="selectedAlert.fecha_resolucion">
                <label>Resolución:</label>
                <span class="detail-value">{{ formatDate(selectedAlert.fecha_resolucion) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card" v-if="selectedAlert.resuelta_por">
            <div class="detail-card-header">
              <i class="fas fa-user-check"></i>
              <h3>Resuelta por</h3>
            </div>
            <div class="detail-card-body">
              <div class="detail-item">
                <span class="detail-value">{{ getUsuarioNombre(selectedAlert.resuelta_por) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="description-section">
          <div class="section-title">
            <i class="fas fa-align-left"></i>
            <h3>Descripción</h3>
          </div>
          <div class="description-content">
            <p>{{ selectedAlert.descripcion || 'Sin descripción' }}</p>
          </div>
        </div>

        <div class="description-section" v-if="selectedAlert.observaciones">
          <div class="section-title">
            <i class="fas fa-sticky-note"></i>
            <h3>Observaciones</h3>
          </div>
          <div class="description-content">
            <p>{{ selectedAlert.observaciones }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <va-button @click="showViewModal = false" preset="secondary" class="action-btn">
            <i class="fas fa-times"></i> Cerrar
          </va-button>
          <va-button @click="editCurrentAlert" color="primary" class="action-btn">
            <i class="fas fa-edit"></i> Editar
          </va-button>
        </div>
      </template>
    </va-modal>

    <!-- Modal para Nueva/Editar Alerta - MEJORADO -->
    <va-modal v-model="showEditModal" :title="isEditing ? 'Editar Alerta' : 'Nueva Alerta'" size="large"
      :close-button="true" class="edit-modal">
      <va-form ref="alertForm" @submit.prevent="saveAlert">
        <div class="form-grid">
          <div class="form-section">
            <h3 class="section-title"><i class="fas fa-info-circle"></i> Información Básica</h3>

            <div class="form-group">
              <label class="form-label">Herramienta <span class="required">*</span></label>
              <va-select v-model="alertForm.herramienta_id" :options="herramientaOptions"
                placeholder="Seleccionar herramienta" :rules="[required]" text-by="nombre" value-by="id"
                class="form-input">
                <template #prependInner>
                  <i class="fas fa-tools"></i>
                </template>
              </va-select>
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de Alerta <span class="required">*</span></label>
              <va-select v-model="alertForm.tipo_alerta_id" :options="tipoAlertaOptions" placeholder="Seleccionar tipo"
                :rules="[required]" text-by="nombre_alertas" value-by="id" class="form-input">
                <template #prependInner>
                  <i class="fas fa-exclamation-circle"></i>
                </template>
              </va-select>
            </div>

            <div class="form-group">
              <label class="form-label">Prioridad <span class="required">*</span></label>
              <va-select v-model="alertForm.prioridad_id" :options="prioridadOptions"
                placeholder="Seleccionar prioridad" :rules="[required]" class="form-input">
                <template #prependInner>
                  <i class="fas fa-flag"></i>
                </template>
              </va-select>
            </div>

            <div class="form-group">
              <label class="form-label">Estado <span class="required">*</span></label>
              <va-select v-model="alertForm.estado_reparacion" :options="estadoOptions" placeholder="Seleccionar estado"
                :rules="[required]" class="form-input">
                <template #prependInner>
                  <i class="fas fa-status"></i>
                </template>
              </va-select>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title"><i class="fas fa-calendar-alt"></i> Fechas</h3>

            <div class="form-group">
              <label class="form-label">Fecha de Generación <span class="required">*</span></label>
              <va-date-input v-model="alertForm.fecha_generacion" :rules="[required]" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Fecha Límite <span class="required">*</span></label>
              <va-date-input v-model="alertForm.fecha_limite" :rules="[required]" class="form-input" />
            </div>

            <div class="form-group" v-if="alertForm.estado_reparacion === '5'">
              <label class="form-label">Fecha de Resolución</label>
              <va-date-input v-model="alertForm.fecha_resolucion" class="form-input" />
            </div>

            <div class="form-group" v-if="alertForm.estado_reparacion === '5'">
              <label class="form-label">Resuelta por</label>
              <va-select v-model="alertForm.resuelta_por" :options="usuarioOptions" placeholder="Seleccionar usuario"
                text-by="nombre_completo" value-by="id" class="form-input">
                <template #prependInner>
                  <i class="fas fa-user"></i>
                </template>
              </va-select>
            </div>
          </div>
        </div>

        <div class="form-section full-width">
          <h3 class="section-title"><i class="fas fa-align-left"></i> Descripción y Observaciones</h3>

          <div class="form-group">
            <label class="form-label">Descripción <span class="required">*</span></label>
            <va-textarea v-model="alertForm.descripcion" placeholder="Descripción detallada de la alerta"
              :rules="[required]" class="form-textarea" :min-rows="3" />
          </div>
        </div>
      </va-form>

      <template #footer>
        <div class="modal-actions">
          <va-button @click="cancelEdit" preset="secondary" class="action-btn">
            <i class="fas fa-times"></i> Cancelar
          </va-button>
          <va-button @click="saveAlert" color="primary" :loading="saving" class="action-btn">
            <i class="fas fa-save"></i> {{ isEditing ? 'Actualizar' : 'Crear' }}
          </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<style src="src/assets/EstiloBase.css" scoped></style>
<style src="../VistasAdmin/ComponentesAdmin/styles/reportsStye.css" scoped></style>
<script src="../VistasAdmin/ComponentesAdmin/Script/Reports.js"></script>
