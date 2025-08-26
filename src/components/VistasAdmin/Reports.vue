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

                      <va-button size="small" preset="plain" color="danger" @click="confirmDeleteAlert(props.row.id)"
                        icon="delete" title="Eliminar"></va-button>
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

    <!-- Modal para Ver Detalles de Alerta -->
    <va-modal v-model="showViewModal" title="Detalles de la Alerta" size="large" :close-button="true">
      <div v-if="selectedAlert" class="alert-details">
        <div class="row">
          <div class="col-md-6">
            <div class="detail-group">
              <label class="detail-label">ID de Alerta:</label>
              <span class="detail-value">{{ selectedAlert.id }}</span>
            </div>
            <div class="detail-group">
              <label class="detail-label">Herramienta:</label>
              <span class="detail-value">{{ getHerramientaNombre(selectedAlert.herramienta_id) }}</span>
            </div>
            <div class="detail-group">
              <label class="detail-label">Tipo de Alerta:</label>
              <span :class="['badge', 'badge-lg', getTipoAlertaClass(selectedAlert.tipo_alerta_id)]">
                {{ getTipoAlerta(selectedAlert.tipo_alerta_id) }}
              </span>
            </div>
            <div class="detail-group">
              <label class="detail-label">Prioridad:</label>
              <span :class="['badge', 'badge-lg', getPrioridadClass(selectedAlert.prioridad_id)]">
                {{ getPrioridadText(selectedAlert.prioridad_id) }}
              </span>
            </div>
            <div class="detail-group">
              <label class="detail-label">Estado:</label>
              <span :class="['badge', 'badge-lg', getEstadoClass(selectedAlert.estado_reparacion)]">
                {{ getEstadoText(selectedAlert.estado_reparacion) }}
              </span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="detail-group">
              <label class="detail-label">Fecha de Generación:</label>
              <span class="detail-value">{{ formatDate(selectedAlert.fecha_generacion) }}</span>
            </div>
            <div class="detail-group">
              <label class="detail-label">Fecha Límite:</label>
              <span class="detail-value" :class="getDaysLeftClass(selectedAlert.fecha_limite)">
                {{ formatDate(selectedAlert.fecha_limite) }}
                <small class="d-block">{{ getDaysLeft(selectedAlert.fecha_limite) }}</small>
              </span>
            </div>
            <div class="detail-group" v-if="selectedAlert.fecha_resolucion">
              <label class="detail-label">Fecha de Resolución:</label>
              <span class="detail-value">{{ formatDate(selectedAlert.fecha_resolucion) }}</span>
            </div>
            <div class="detail-group" v-if="selectedAlert.resuelta_por">
              <label class="detail-label">Resuelta por:</label>
              <span class="detail-value">{{ getUsuarioNombre(selectedAlert.resuelta_por) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-group mt-3" v-if="selectedAlert.descripcion">
          <label class="detail-label">Descripción:</label>
          <p class="detail-value">{{ selectedAlert.descripcion }}</p>
        </div>
        
        <div class="detail-group" v-if="selectedAlert.observaciones">
          <label class="detail-label">Observaciones:</label>
          <p class="detail-value">{{ selectedAlert.observaciones }}</p>
        </div>
      </div>
      
      <template #footer>
        <div class="modal-actions">
          <va-button @click="showViewModal = false" preset="secondary">
            Cerrar
          </va-button>
          <va-button @click="editCurrentAlert" color="primary" icon="edit">
            Editar
          </va-button>
        </div>
      </template>
    </va-modal>

    <!-- Modal para Nueva/Editar Alerta -->
    <va-modal v-model="showEditModal" :title="isEditing ? 'Editar Alerta' : 'Nueva Alerta'" size="large" :close-button="true">
      <va-form ref="alertForm" @submit.prevent="saveAlert">
        <div class="row">
          <div class="col-md-6">
            <va-select
              v-model="alertForm.herramienta_id"
              :options="herramientaOptions"
              label="Herramienta"
              placeholder="Seleccionar herramienta"
              :rules="[required]"
              text-by="nombre"
              value-by="id"
            />
            
            <va-select
              v-model="alertForm.tipo_alerta_id"
              :options="tipoAlertaOptions"
              label="Tipo de Alerta"
              placeholder="Seleccionar tipo"
              :rules="[required]"
              text-by="nombre_alertas"
              value-by="id"
            />
            
            <va-select
              v-model="alertForm.prioridad_id"
              :options="prioridadOptions"
              label="Prioridad"
              placeholder="Seleccionar prioridad"
              :rules="[required]"
            />
            
            <va-select
              v-model="alertForm.estado_reparacion"
              :options="estadoOptions"
              label="Estado"
              placeholder="Seleccionar estado"
              :rules="[required]"
            />
          </div>
          
          <div class="col-md-6">
            <va-date-input
              v-model="alertForm.fecha_generacion"
              label="Fecha de Generación"
              :rules="[required]"
            />
            
            <va-date-input
              v-model="alertForm.fecha_limite"
              label="Fecha Límite"
              :rules="[required]"
            />
            
            <va-date-input
              v-model="alertForm.fecha_resolucion"
              label="Fecha de Resolución"
              v-if="alertForm.estado_reparacion === '5'"
            />
            
            <va-select
              v-model="alertForm.resuelta_por"
              :options="usuarioOptions"
              label="Resuelta por"
              placeholder="Seleccionar usuario"
              text-by="nombre_completo"
              value-by="id"
              v-if="alertForm.estado_reparacion === '5'"
            />
          </div>
        </div>
        
        <div class="row mt-3">
          <div class="col-12">
            <va-textarea
              v-model="alertForm.descripcion"
              label="Descripción"
              placeholder="Descripción de la alerta"
              :rules="[required]"
            />
            
            <va-textarea
              v-model="alertForm.observaciones"
              label="Observaciones"
              placeholder="Observaciones adicionales"
            />
          </div>
        </div>
      </va-form>
      
      <template #footer>
        <div class="modal-actions">
          <va-button @click="cancelEdit" preset="secondary">
            Cancelar
          </va-button>
          <va-button @click="saveAlert" color="primary" :loading="saving">
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </va-button>
        </div>
      </template>
    </va-modal>

    <!-- Modal de Confirmación para Eliminar -->
    <va-modal v-model="showDeleteModal" title="Confirmar Eliminación" size="small" :close-button="false">
      <p>¿Está seguro de que desea eliminar esta alerta?</p>
      <p class="text-danger"><strong>Esta acción no se puede deshacer.</strong></p>
      
      <template #footer>
        <div class="modal-actions">
          <va-button @click="showDeleteModal = false" preset="secondary">
            Cancelar
          </va-button>
          <va-button @click="deleteAlert" color="danger" :loading="deleting">
            Eliminar
          </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<style src="src/assets/EstiloBase.css" scoped></style>
<style scoped>
.alert-details {
  padding: 1rem 0;
}

.detail-group {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #666;
  font-size: 0.95rem;
}

.badge-lg {
  font-size: 0.85rem;
  padding: 0.375rem 0.75rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.herramienta-info strong {
  display: block;
  font-size: 0.9rem;
}

.herramienta-info small {
  font-size: 0.75rem;
}
</style>

<script>
import api from '@/api.js'

export default {
  name: 'AlertaReparacion',
  data() {
    return {
      loading: false,
      saving: false,
      deleting: false,
      searchQuery: '',
      showNewAlertModal: false,
      showViewModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedAlert: null,
      isEditing: false,
      alertToDelete: null,
      alertas: [],
      herramientas: [],
      tiposAlertas: [],
      usuarios: [],
      
      // Formulario para nueva/editar alerta
      alertForm: {
        herramienta_id: null,
        tipo_alerta_id: null,
        prioridad_id: null,
        estado_reparacion: '1',
        fecha_generacion: new Date().toISOString().split('T')[0],
        fecha_limite: null,
        fecha_resolucion: null,
        resuelta_por: null,
        descripcion: '',
        observaciones: ''
      },

      tableColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          width: '80px'
        },
        {
          label: 'Herramienta',
          field: 'herramienta',
          sortable: false
        },
        {
          label: 'Tipo de Alerta',
          field: 'tipo_alerta',
          sortable: false
        },
        {
          label: 'Fecha Generación',
          field: 'fecha_generacion_formatted',
          sortable: true
        },
        {
          label: 'Fecha Límite',
          field: 'fecha_limite_formatted',
          sortable: true
        },
        {
          label: 'Prioridad',
          field: 'prioridad_id'
        },
        {
          label: 'Estado',
          field: 'estado_reparacion'
        },
        {
          label: 'Resuelta por',
          field: 'resuelta_por'
        },
        {
          label: 'Fecha Resolución',
          field: 'fecha_resolucion_formatted',
          sortable: true
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '150px'
        }
      ]
    }
  },

  computed: {
    filteredAlertas() {
      return this.alertas.map(alert => ({
        ...alert,
        fecha_generacion_formatted: this.formatDate(alert.fecha_generacion),
        fecha_limite_formatted: this.formatDate(alert.fecha_limite),
        fecha_resolucion_formatted: this.formatDate(alert.fecha_resolucion)
      }))
    },

    totalAlertas() {
      return this.alertas.length
    },

    alertasPendientes() {
      return this.alertas.filter(alert => alert.estado_reparacion === '1').length
    },

    alertasEnReparacion() {
      return this.alertas.filter(alert => alert.estado_reparacion === '2').length
    },

    alertasResueltas() {
      return this.alertas.filter(alert => alert.estado_reparacion === '5').length
    },

    // Opciones para los selects
    herramientaOptions() {
      return this.herramientas
    },

    tipoAlertaOptions() {
      return this.tiposAlertas
    },

    usuarioOptions() {
      return this.usuarios.map(user => ({
        ...user,
        nombre_completo: `${user.nombre} ${user.apellido}`
      }))
    },

    prioridadOptions() {
      return [
        { id: '1', text: 'Muy Baja' },
        { id: '2', text: 'Baja' },
        { id: '3', text: 'Media' },
        { id: '4', text: 'Alta' },
        { id: '5', text: 'Muy Alta' },
        { id: '6', text: 'Crítica' }
      ]
    },

    estadoOptions() {
      return [
        { id: '1', text: 'Pendiente' },
        { id: '2', text: 'En Progreso' },
        { id: '3', text: 'En Revisión' },
        { id: '4', text: 'Pausado' },
        { id: '5', text: 'Resuelto' }
      ]
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    // Regla de validación
    required(value) {
      return !!value || 'Este campo es obligatorio'
    },

    // Método helper para mostrar notificaciones
    showToast(message, color = 'info') {
      if (this.$va && this.$va.toast) {
        this.$va.toast({
          message,
          color
        })
      } else {
        console.log(`[${color.toUpperCase()}] ${message}`)
      }
    },

    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadAlertas(),
          this.loadHerramientas(),
          this.loadTiposAlertas(),
          this.loadUsuarios()
        ])
      } catch (error) {
        console.error('Error cargando datos:', error)
        this.showToast('Error al cargar los datos', 'danger')
      } finally {
        this.loading = false
      }
    },

    async loadAlertas() {
      try {
        this.alertas = await api.get('/AlertaReparacion')
      } catch (error) {
        console.error('Error cargando alertas:', error)
        this.showToast(`Error al cargar las alertas: ${error.message}`, 'danger')
      }
    },

    async loadHerramientas() {
      try {
        this.herramientas = await api.get('/Herramienta')
      } catch (error) {
        console.error('Error cargando herramientas:', error)
        this.showToast(`Error al cargar las herramientas: ${error.message}`, 'danger')
      }
    },

    async loadTiposAlertas() {
      try {
        this.tiposAlertas = await api.get('/Tipos_Alertas')
      } catch (error) {
        console.error('Error cargando tipos de alertas:', error)
        this.showToast(`Error al cargar los tipos de alertas: ${error.message}`, 'danger')
      }
    },

    async loadUsuarios() {
      try {
        this.usuarios = await api.get('/usuario')
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        this.showToast(`Error al cargar los usuarios: ${error.message}`, 'danger')
      }
    },

    // Métodos de acciones de la tabla
    viewAlert(alert) {
      this.selectedAlert = { ...alert }
      this.showViewModal = true
    },

    editAlert(alert) {
      this.selectedAlert = { ...alert }
      this.isEditing = true
      this.populateForm(alert)
      this.showEditModal = true
    },

    editCurrentAlert() {
      this.showViewModal = false
      this.editAlert(this.selectedAlert)
    },

    confirmDeleteAlert(alertId) {
      this.alertToDelete = alertId
      this.showDeleteModal = true
    },

    // Métodos del formulario
    populateForm(alert) {
      this.alertForm = {
        id: alert.id,
        herramienta_id: alert.herramienta_id,
        tipo_alerta_id: alert.tipo_alerta_id,
        prioridad_id: alert.prioridad_id,
        estado_reparacion: alert.estado_reparacion,
        fecha_generacion: alert.fecha_generacion ? alert.fecha_generacion.split('T')[0] : '',
        fecha_limite: alert.fecha_limite ? alert.fecha_limite.split('T')[0] : '',
        fecha_resolucion: alert.fecha_resolucion ? alert.fecha_resolucion.split('T')[0] : '',
        resuelta_por: alert.resuelta_por,
        descripcion: alert.descripcion || '',
        observaciones: alert.observaciones || ''
      }
    },

    resetForm() {
      this.alertForm = {
        herramienta_id: null,
        tipo_alerta_id: null,
        prioridad_id: null,
        estado_reparacion: '1',
        fecha_generacion: new Date().toISOString().split('T')[0],
        fecha_limite: null,
        fecha_resolucion: null,
        resuelta_por: null,
        descripcion: '',
        observaciones: ''
      }
    },

    cancelEdit() {
      this.showEditModal = false
      this.isEditing = false
      this.selectedAlert = null
      this.resetForm()
    },

    async saveAlert() {
      if (!this.$refs.alertForm.validate()) {
        this.showToast('Por favor, complete todos los campos requeridos', 'warning')
        return
      }

      this.saving = true
      try {
        const alertData = { ...this.alertForm }
        
        // Convertir fechas al formato correcto
        if (alertData.fecha_generacion) {
          alertData.fecha_generacion = new Date(alertData.fecha_generacion).toISOString()
        }
        if (alertData.fecha_limite) {
          alertData.fecha_limite = new Date(alertData.fecha_limite).toISOString()
        }
        if (alertData.fecha_resolucion) {
          alertData.fecha_resolucion = new Date(alertData.fecha_resolucion).toISOString()
        }

        if (this.isEditing) {
          // Actualizar alerta existente
          await api.put(`/AlertaReparacion/${alertData.id}`, alertData)
          
          // Actualizar en la lista local
          const index = this.alertas.findIndex(a => a.id === alertData.id)
          if (index !== -1) {
            this.alertas[index] = { ...this.alertas[index], ...alertData }
          }
          
          this.showToast('Alerta actualizada correctamente', 'success')
        } else {
          // Crear nueva alerta
          const newAlert = await api.post('/AlertaReparacion', alertData)
          this.alertas.unshift(newAlert)
          this.showToast('Alerta creada correctamente', 'success')
        }

        this.cancelEdit()
      } catch (error) {
        console.error('Error guardando alerta:', error)
        this.showToast('Error al guardar la alerta', 'danger')
      } finally {
        this.saving = false
      }
    },

    async deleteAlert() {
      if (!this.alertToDelete) return

      this.deleting = true
      try {
        await api.delete(`/AlertaReparacion/${this.alertToDelete}`)
        
        // Remover de la lista local
        this.alertas = this.alertas.filter(alert => alert.id !== this.alertToDelete)
        
        this.showToast('Alerta eliminada correctamente', 'success')
        this.showDeleteModal = false
        this.alertToDelete = null
      } catch (error) {
        console.error('Error eliminando alerta:', error)
        this.showToast('Error al eliminar la alerta', 'danger')
      } finally {
        this.deleting = false
      }
    },

    // Métodos de formateo y helpers
    getUsuarioNombre(id) {
      if (!id) return '-'
      const usuario = this.usuarios.find(u => u.id === id)
      return usuario ? `${usuario.nombre} ${usuario.apellido}` : `Usuario ${id}`
    },

    getTipoAlerta(id) {
      const tipo = this.tiposAlertas.find(t => t.id === id)
      return tipo ? tipo.nombre_alertas : `Tipo ${id}`
    },

    getTipoAlertaClass(id) {
      const classes = {
        '1': 'badge-warning',
        '2': 'badge-danger', 
        '3': 'badge-info',
        '4': 'badge-primary',
        '5': 'badge-secondary',
        '6': 'badge-dark'
      }
      return classes[id] || 'badge-light'
    },

    getHerramientaNombre(id) {
      const herramienta = this.herramientas.find(h => h.id === id)
      return herramienta ? herramienta.nombre : `Herramienta ${id}`
    },

    getEstadoText(estado) {
      const estados = {
        '1': 'Pendiente',
        '2': 'En Progreso',
        '3': 'En Revisión',
        '4': 'Pausado',
        '5': 'Resuelto'
      }
      return estados[estado] || `Estado ${estado}`
    },

    getEstadoClass(estado) {
      const classes = {
        '1': 'badge-warning',
        '2': 'badge-info',
        '3': 'badge-primary',
        '4': 'badge-secondary',
        '5': 'badge-success'
      }
      return classes[estado] || 'badge-secondary'
    },

    getPrioridadText(prioridad) {
      const prioridades = {
        '1': 'Muy Baja',
        '2': 'Baja',
        '3': 'Media',
        '4': 'Alta',
        '5': 'Muy Alta',
        '6': 'Crítica'
      }
      return prioridades[prioridad] || `Prioridad ${prioridad}`
    },

    getPrioridadClass(prioridad) {
      const classes = {
        '1': 'badge-light',
        '2': 'badge-info',
        '3': 'badge-warning',
        '4': 'badge-danger',
        '5': 'badge-danger',
        '6': 'badge-dark'
      }
      return classes[prioridad] || 'badge-secondary'
    },

    formatDate(date) {
      if (!date) return '-'
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        console.error('Error formateando fecha:', error)
        return date
      }
    },

    getDaysLeft(fechaLimite) {
      if (!fechaLimite) return ''
      try {
        const today = new Date()
        const limite = new Date(fechaLimite)
        const diffTime = limite - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} días`
        if (diffDays === 0) return 'Vence hoy'
        if (diffDays === 1) return 'Vence mañana'
        return `${diffDays} días restantes`
      } catch (error) {
        console.error('Error calculando días restantes:', error)
        return ''
      }
    },

    getDaysLeftClass(fechaLimite) {
      if (!fechaLimite) return ''
      try {
        const today = new Date()
        const limite = new Date(fechaLimite)
        const diffTime = limite - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return 'text-danger'
        if (diffDays <= 2) return 'text-warning'
        return 'text-success'
      } catch (error) {
        console.error('Error obteniendo clase de días restantes:', error)
        return ''
      }
    },

    // Método para exportar a CSV
    exportToCSV() {
      try {
        const headers = ['ID', 'Herramienta', 'Tipo', 'Fecha Generación', 'Fecha Límite', 'Estado', 'Prioridad', 'Descripción']
        const data = this.alertas.map(alert => [
          alert.id,
          this.getHerramientaNombre(alert.herramienta_id),
          this.getTipoAlerta(alert.tipo_alerta_id),
          this.formatDate(alert.fecha_generacion),
          this.formatDate(alert.fecha_limite),
          this.getEstadoText(alert.estado_reparacion),
          this.getPrioridadText(alert.prioridad_id),
          alert.descripcion || ''
        ])

        let csvContent = "data:text/csv;charset=utf-8,"
        csvContent += headers.join(",") + "\n"
        data.forEach(row => {
          csvContent += row.map(field => `"${field}"`).join(",") + "\n"
        })

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `alertas_reparacion_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.showToast('Alertas exportadas a CSV exitosamente', 'success')
      } catch (error) {
        console.error('Error exportando CSV:', error)
        this.showToast('Error al exportar las alertas', 'danger')
      }
    },

    // Método para manejar el watch del showNewAlertModal
    handleNewAlertModal() {
      if (this.showNewAlertModal) {
        this.isEditing = false
        this.resetForm()
        this.showEditModal = true
        this.showNewAlertModal = false
      }
    }
  },

  watch: {
    showNewAlertModal(newVal) {
      if (newVal) {
        this.handleNewAlertModal()
      }
    },

    // Watch para actualizar campos cuando cambia el estado
    'alertForm.estado_reparacion'(newVal) {
      if (newVal === '5') { // Si es "Resuelto"
        if (!this.alertForm.fecha_resolucion) {
          this.alertForm.fecha_resolucion = new Date().toISOString().split('T')[0]
        }
      } else {
        this.alertForm.fecha_resolucion = null
        this.alertForm.resuelta_por = null
      }
    }
  }
}
</script>