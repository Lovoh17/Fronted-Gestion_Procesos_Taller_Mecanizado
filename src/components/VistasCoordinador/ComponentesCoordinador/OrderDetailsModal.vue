<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>
          <span class="material-icons">description</span>
          {{ isEditing ? 'Editar' : 'Detalles del' }} Pedido - {{ pedidoData.codigo_pedido }}
        </h2>
        <div class="header-actions">
          <button v-if="!isEditing && canEdit" class="btn-icon edit-btn" @click="enableEdit" title="Editar">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn-icon close-btn" @click="close">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveChanges" v-if="isEditing">
          <div class="detail-sections">
            <!-- Información básica - EDITABLE -->
            <div class="detail-section">
              <h3><span class="material-icons">info</span> Información General</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Estado:</label>
                  <select v-model="pedidoData.estado_id" class="form-select">
                    <option value="1">Borrador</option>
                    <option value="2">Pendiente Aprobación</option>
                    <option value="3">Aprobado</option>
                    <option value="4">En Proceso</option>
                    <option value="5">Completado</option>
                    <option value="6">Cancelado</option>
                  </select>
                </div>
                <div class="detail-item">
                  <label>Prioridad:</label>
                  <select v-model="pedidoData.prioridad" class="form-select">
                    <option value="1">Alta</option>
                    <option value="2">Media-Alta</option>
                    <option value="3">Media</option>
                    <option value="4">Media-Baja</option>
                    <option value="5">Baja</option>
                  </select>
                </div>
                <div class="detail-item">
                  <label>Tipo:</label>
                  <input 
                    type="text" 
                    v-model="pedidoData.tipo_pedido.nombre" 
                    class="form-input"
                    readonly
                  />
                </div>
                <div class="detail-item">
                  <label>Plano:</label>
                  <input 
                    type="text" 
                    :value="`${pedidoData.plano?.nombre} - ${pedidoData.plano?.codigo}`"
                    class="form-input"
                    readonly
                  />
                </div>
              </div>
            </div>

            <!-- Fechas - EDITABLE -->
            <div class="detail-section">
              <h3><span class="material-icons">event</span> Fechas</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Fecha Requerida:</label>
                  <input 
                    type="date" 
                    v-model="pedidoData.fecha_requerida" 
                    class="form-input"
                  />
                </div>
                <div class="detail-item">
                  <label>Fecha Estimada Entrega:</label>
                  <input 
                    type="date" 
                    v-model="pedidoData.fecha_estimada_entrega" 
                    class="form-input"
                  />
                </div>
                <div class="detail-item">
                  <label>Fecha Solicitud:</label>
                  <input 
                    type="datetime-local" 
                    :value="formatDateTimeForInput(pedidoData.fecha_solicitud)"
                    class="form-input"
                    readonly
                  />
                </div>
                <div v-if="pedidoData.fecha_aprobacion" class="detail-item">
                  <label>Fecha Aprobación:</label>
                  <input 
                    type="datetime-local" 
                    :value="formatDateTimeForInput(pedidoData.fecha_aprobacion)"
                    class="form-input"
                    readonly
                  />
                </div>
              </div>
            </div>

            <!-- Información financiera - EDITABLE -->
            <div class="detail-section">
              <h3><span class="material-icons">attach_money</span> Información Financiera</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Costo Estimado:</label>
                  <div class="input-group">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number" 
                      v-model="pedidoData.costo_estimado" 
                      step="0.01" 
                      class="form-input"
                    />
                  </div>
                </div>
                <div class="detail-item">
                  <label>Precio Final:</label>
                  <div class="input-group">
                    <span class="input-prefix">$</span>
                    <input 
                      type="number" 
                      v-model="pedidoData.precio_final" 
                      step="0.01" 
                      class="form-input"
                    />
                  </div>
                </div>
                <div v-if="pedidoData.costo_estimado && pedidoData.precio_final" class="detail-item">
                  <label>Margen:</label>
                  <span class="margen calculated" :class="getMargenClass(pedidoData)">
                    {{ calcularMargen(pedidoData) }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Información adicional - EDITABLE -->
            <div class="detail-section">
              <h3><span class="material-icons">note</span> Información Adicional</h3>
              <div class="detail-grid">
                <div class="detail-item full-width">
                  <label>Proyecto Asociado:</label>
                  <input 
                    type="text" 
                    v-model="pedidoData.proyecto_asociado" 
                    class="form-input"
                    placeholder="Nombre del proyecto asociado"
                  />
                </div>
                <div class="detail-item full-width">
                  <label>Notas:</label>
                  <textarea 
                    v-model="pedidoData.notas" 
                    class="form-textarea"
                    rows="3"
                    placeholder="Agregar notas adicionales..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Personas involucradas - SOLO LECTURA -->
            <div class="detail-section">
              <h3><span class="material-icons">people</span> Personas Involucradas</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Solicitante:</label>
                  <input 
                    type="text" 
                    :value="`${pedidoData.solicitante?.nombres} ${pedidoData.solicitante?.apellidos}`"
                    class="form-input"
                    readonly
                  />
                </div>
                <div v-if="pedidoData.aprobador" class="detail-item">
                  <label>Aprobador:</label>
                  <input 
                    type="text" 
                    :value="`${pedidoData.aprobador?.nombres} ${pedidoData.aprobador?.apellidos}`"
                    class="form-input"
                    readonly
                  />
                </div>
                <div v-if="pedidoData.supervisor" class="detail-item">
                  <label>Supervisor:</label>
                  <input 
                    type="text" 
                    :value="`${pedidoData.supervisor?.nombres} ${pedidoData.supervisor?.apellidos}`"
                    class="form-input"
                    readonly
                  />
                </div>
              </div>
            </div>

            <!-- Archivos adjuntos -->
            <div v-if="pedidoData.archivos && pedidoData.archivos.length > 0" class="detail-section">
              <h3><span class="material-icons">attachment</span> Archivos Adjuntos ({{ pedidoData.archivos.length }})</h3>
              <div class="file-list">
                <div v-for="archivo in pedidoData.archivos" :key="archivo.id" class="file-item">
                  <span class="material-icons">{{ getFileIcon(archivo) }}</span>
                  <div class="file-info">
                    <span class="file-name">{{ archivo.descripcion }}</span>
                    <span class="file-type">{{ archivo.tipo_archivo }}</span>
                  </div>
                  <a :href="archivo.url" target="_blank" class="download-btn" title="Descargar">
                    <span class="material-icons">download</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- MODO SOLO LECTURA -->
        <div v-else class="detail-sections">
          <!-- Información básica - LECTURA -->
          <div class="detail-section">
            <h3><span class="material-icons">info</span> Información General</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Estado:</label>
                <span class="status-badge" :class="getStatusClass(pedidoData.estado_id)">
                  {{ getStatusName(pedidoData.estado_id) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Prioridad:</label>
                <span class="priority-badge" :class="`priority-${pedidoData.prioridad}`">
                  {{ getPriorityName(pedidoData.prioridad) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Tipo:</label>
                <span>{{ pedidoData.tipo_pedido?.nombre || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Plano:</label>
                <span>{{ pedidoData.plano?.plano_id }} - {{ pedidoData.plano?.codigo }}</span>
              </div>
            </div>
          </div>

          <!-- Fechas - LECTURA -->
          <div class="detail-section">
            <h3><span class="material-icons">event</span> Fechas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Solicitud:</label>
                <span>{{ formatDateTime(pedidoData.fecha_solicitud) }}</span>
              </div>
              <div class="detail-item">
                <label>Requerida:</label>
                <span>{{ formatDate(pedidoData.fecha_requerida) }}</span>
              </div>
              <div class="detail-item">
                <label>Estimada Entrega:</label>
                <span>{{ formatDate(pedidoData.fecha_estimada_entrega) || 'No definida' }}</span>
              </div>
              <div v-if="pedidoData.fecha_aprobacion" class="detail-item">
                <label>Aprobación:</label>
                <span>{{ formatDateTime(pedidoData.fecha_aprobacion) }}</span>
              </div>
            </div>
          </div>

          <!-- Personas involucradas - LECTURA -->
          <div class="detail-section">
            <h3><span class="material-icons">people</span> Personas Involucradas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Solicitante:</label>
                <span>{{ pedidoData.solicitante?.nombres }} {{ pedidoData.solicitante?.apellidos }}</span>
              </div>
              <div v-if="pedidoData.aprobador" class="detail-item">
                <label>Aprobador:</label>
                <span>{{ pedidoData.aprobador?.nombres }} {{ pedidoData.aprobador?.apellidos }}</span>
              </div>
              <div v-if="pedidoData.supervisor" class="detail-item">
                <label>Supervisor:</label>
                <span>{{ pedidoData.supervisor?.nombres }} {{ pedidoData.supervisor?.apellidos }}</span>
              </div>
            </div>
          </div>

          <!-- Información financiera - LECTURA -->
          <div class="detail-section">
            <h3><span class="material-icons">attach_money</span> Información Financiera</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Costo Estimado:</label>
                <span class="price">${{ pedidoData.costo_estimado?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '0.00' }}</span>
              </div>
              <div class="detail-item">
                <label>Precio Final:</label>
                <span class="price final">${{ pedidoData.precio_final?.toLocaleString('en-US', {minimumFractionDigits: 2}) || '0.00' }}</span>
              </div>
              <div v-if="pedidoData.costo_estimado && pedidoData.precio_final" class="detail-item">
                <label>Margen:</label>
                <span class="margen" :class="getMargenClass(pedidoData)">
                  {{ calcularMargen(pedidoData) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Información adicional - LECTURA -->
          <div class="detail-section">
            <h3><span class="material-icons">note</span> Información Adicional</h3>
            <div class="detail-grid">
              <div v-if="pedidoData.proyecto_asociado" class="detail-item full-width">
                <label>Proyecto Asociado:</label>
                <span>{{ pedidoData.proyecto_asociado }}</span>
              </div>
              <div v-if="pedidoData.notas" class="detail-item full-width">
                <label>Notas:</label>
                <p class="notes">{{ pedidoData.notas }}</p>
              </div>
            </div>
          </div>

          <!-- Archivos adjuntos - LECTURA -->
          <div v-if="pedidoData.archivos && pedidoData.archivos.length > 0" class="detail-section">
            <h3><span class="material-icons">attachment</span> Archivos Adjuntos ({{ pedidoData.archivos.length }})</h3>
            <div class="file-list">
              <div v-for="archivo in pedidoData.archivos" :key="archivo.id" class="file-item">
                <span class="material-icons">{{ getFileIcon(archivo) }}</span>
                <div class="file-info">
                  <span class="file-name">{{ archivo.descripcion }}</span>
                  <span class="file-type">{{ archivo.tipo_archivo }}</span>
                </div>
                <a :href="archivo.url" target="_blank" class="download-btn" title="Descargar">
                  <span class="material-icons">download</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <template v-if="isEditing">
          <button type="button" class="btn secondary" @click="cancelEdit">Cancelar</button>
          <button type="submit" class="btn primary" @click="saveChanges" :disabled="saving">
            <span v-if="saving" class="material-icons spinning">refresh</span>
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </template>
        <template v-else>
          <button class="btn secondary" @click="close">Cerrar</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PedidoDetalleModal',
  props: {
    pedido: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'view', // 'view' o 'edit'
      validator: value => ['view', 'edit'].includes(value)
    },
    canEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isEditing: false,
      pedidoData: {},
      originalData: {},
      saving: false
    }
  },
  mounted() {
    this.initializeData()
    this.isEditing = this.mode === 'edit'
  },
  watch: {
    pedido: {
      handler() {
        this.initializeData()
      },
      immediate: true
    }
  },
  methods: {
    initializeData() {
      // Hacer una copia profunda del pedido para edición
      this.pedidoData = JSON.parse(JSON.stringify(this.pedido))
      this.originalData = JSON.parse(JSON.stringify(this.pedido))
    },

    enableEdit() {
      this.isEditing = true
    },

    cancelEdit() {
      // Restaurar datos originales
      this.pedidoData = JSON.parse(JSON.stringify(this.originalData))
      this.isEditing = false
    },

    async saveChanges() {
      if (this.saving) return

      this.saving = true
      try {
        // Emitir evento con los datos modificados
        this.$emit('save', {
          id: this.pedidoData.id,
          changes: this.getChanges()
        })
        
        // Actualizar datos originales
        this.originalData = JSON.parse(JSON.stringify(this.pedidoData))
        this.isEditing = false
        
      } catch (error) {
        console.error('Error al guardar:', error)
        this.$emit('error', 'Error al guardar los cambios')
      } finally {
        this.saving = false
      }
    },

    getChanges() {
      const changes = {}
      const compareFields = [
        'estado_id', 'prioridad', 'fecha_requerida', 'fecha_estimada_entrega',
        'costo_estimado', 'precio_final', 'proyecto_asociado', 'notas'
      ]

      compareFields.forEach(field => {
        if (this.pedidoData[field] !== this.originalData[field]) {
          changes[field] = this.pedidoData[field]
        }
      })

      return changes
    },

    close() {
      if (this.isEditing && this.hasUnsavedChanges()) {
        if (confirm('¿Estás seguro de cerrar? Se perderán los cambios no guardados.')) {
          this.$emit('close')
        }
      } else {
        this.$emit('close')
      }
    },

    hasUnsavedChanges() {
      return Object.keys(this.getChanges()).length > 0
    },
    
    getStatusName(estadoId) {
      const estados = {
        1: 'Borrador',
        2: 'Pendiente Aprobación',
        3: 'Aprobado',
        4: 'En Proceso',
        5: 'Completado',
        6: 'Cancelado'
      }
      return estados[estadoId] || 'Desconocido'
    },
    
    getStatusClass(estadoId) {
      const classes = {
        1: 'draft',
        2: 'pending',
        3: 'approved',
        4: 'in-progress',
        5: 'completed',
        6: 'cancelled'
      }
      return classes[estadoId] || 'unknown'
    },
    
    getPriorityName(priority) {
      const priorityMap = {
        '1': 'Alta',
        '2': 'Media-Alta',
        '3': 'Media',
        '4': 'Media-Baja',
        '5': 'Baja'
      }
      return priorityMap[priority] || 'Media'
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    },
    
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A'
      return new Date(dateTimeString).toLocaleString('es-ES')
    },

    formatDateTimeForInput(dateTimeString) {
      if (!dateTimeString) return ''
      const date = new Date(dateTimeString)
      return date.toISOString().slice(0, 16)
    },
    
    calcularMargen(pedido) {
      if (!pedido.costo_estimado || !pedido.precio_final) return 0
      const margen = ((pedido.precio_final - pedido.costo_estimado) / pedido.costo_estimado) * 100
      return margen.toFixed(1)
    },
    
    getMargenClass(pedido) {
      const margen = this.calcularMargen(pedido)
      if (margen > 20) return 'good'
      if (margen > 10) return 'medium'
      return 'low'
    },
    
    getFileIcon(archivo) {
      const tipo = archivo.tipo_archivo?.toLowerCase()
      if (tipo === 'pdf') return 'picture_as_pdf'
      if (tipo === 'imagen') return 'image'
      if (tipo === 'dwg' || tipo === 'dxf') return 'architecture'
      return 'description'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 90%;
  max-width: 900px;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: linear-gradient(to right, #f8f9fa, #f0f4ff);
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  flex: 1;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: #e9ecef;
  transform: scale(1.1);
}

.edit-btn {
  color: #4a6cf7;
}

.close-btn {
  color: #6c757d;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeef2;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.detail-section:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1em;
  font-weight: 600;
  border-bottom: 2px solid #4a6cf7;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-grid {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #394360;
  font-size: 0.9em;
  display: flex;
  align-items: center;
}

.detail-item label::after {
  content: "";
  height: 2px;
  width: 8px;
  background: #4a6cf7;
  margin-left: 4px;
  border-radius: 1px;
}

/* Estilos para elementos de solo lectura */
.status-badge, .priority-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.status-badge.draft { background: #f3f4f6; color: #6b7280; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.in-progress { background: #dbeafe; color: #1e40af; }
.status-badge.completed { background: #d1fae5; color: #065f46; }
.status-badge.cancelled { background: #fee2e2; color: #991b1b; }

.priority-badge.priority-1 { background: #fee2e2; color: #991b1b; }
.priority-badge.priority-2 { background: #fed7aa; color: #c2410c; }
.priority-badge.priority-3 { background: #fef3c7; color: #92400e; }
.priority-badge.priority-4 { background: #d1fae5; color: #065f46; }
.priority-badge.priority-5 { background: #f3f4f6; color: #6c757d; }

.price {
  font-weight: 600;
  color: #059669;
  font-family: 'Courier New', monospace;
}

.price.final {
  color: #dc2626;
}

.margen {
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.margen.good { color: #065f46; }
.margen.medium { color: #92400e; }
.margen.low { color: #991b1b; }
.margen.calculated { 
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 6px;
  width: fit-content;
}

.notes {
  margin: 0;
  color: #6b7280;
  font-style: italic;
  line-height: 1.5;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

/* Estilos para elementos de edición */
.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95em;
  transition: all 0.2s ease;
  background: white;
  font-family: inherit;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.15);
}

.form-input:read-only {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.input-prefix {
  background: #f0f4ff;
  border: 2px solid #e9ecef;
  border-right: none;
  padding: 12px 14px;
  border-radius: 8px 0 0 8px;
  font-weight: 600;
  color: #4a6cf7;
  position: absolute;
  left: 0;
  height: calc(100% - 4px);
  display: flex;
  align-items: center;
  z-index: 1;
}

.input-group .form-input {
  border-left: none;
  border-radius: 0 8px 8px 0;
  padding-left: 45px;
}

/* Lista de archivos */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #4a6cf7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: #111827;
}

.file-type {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
}

.download-btn {
  color: #4a6cf7;
  padding: 8px;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover {
  background: #e5e7eb;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn.primary {
  background: linear-gradient(to right, #4a6cf7, #6a8aff);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3);
}

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(to right, #3a57d7, #5a7aef);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 108, 247, 0.4);
}

.btn.secondary {
  background: #6c757d;
  color: white;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
}

.btn.secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Scroll personalizado para el modal */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .detail-section {
    padding: 16px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-footer {
    padding: 16px 20px;
  }
  
  .file-list {
    padding: 12px;
  }
}
</style>