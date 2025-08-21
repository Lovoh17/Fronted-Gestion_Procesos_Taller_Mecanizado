<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalles del Pedido - {{ pedido.codigo_pedido }}</h2>
        <button class="close-btn" @click="close">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="detail-sections">
          <!-- Información básica -->
          <div class="detail-section">
            <h3>Información General</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Estado:</label>
                <span class="status-badge" :class="getStatusClass(pedido.estado_id)">
                  {{ getStatusName(pedido.estado_id) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Prioridad:</label>
                <span class="priority-badge" :class="`priority-${pedido.prioridad}`">
                  {{ getPriorityName(pedido.prioridad) }}
                </span>
              </div>
              <div class="detail-item">
                <label>Tipo:</label>
                <span>{{ pedido.tipo_pedido?.nombre || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <label>Plano:</label>
                <span>{{ pedido.plano?.nombre }} - {{ pedido.plano?.codigo }}</span>
              </div>
            </div>
          </div>

          <!-- Fechas -->
          <div class="detail-section">
            <h3>Fechas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Solicitud:</label>
                <span>{{ formatDateTime(pedido.fecha_solicitud) }}</span>
              </div>
              <div class="detail-item">
                <label>Requerida:</label>
                <span>{{ formatDate(pedido.fecha_requerida) }}</span>
              </div>
              <div class="detail-item">
                <label>Estimada Entrega:</label>
                <span>{{ formatDate(pedido.fecha_estimada_entrega) || 'No definida' }}</span>
              </div>
              <div v-if="pedido.fecha_aprobacion" class="detail-item">
                <label>Aprobación:</label>
                <span>{{ formatDateTime(pedido.fecha_aprobacion) }}</span>
              </div>
            </div>
          </div>

          <!-- Personas involucradas -->
          <div class="detail-section">
            <h3>Personas Involucradas</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Solicitante:</label>
                <span>{{ pedido.solicitante?.nombres }} {{ pedido.solicitante?.apellidos }}</span>
              </div>
              <div v-if="pedido.aprobador" class="detail-item">
                <label>Aprobador:</label>
                <span>{{ pedido.aprobador?.nombres }} {{ pedido.aprobador?.apellidos }}</span>
              </div>
              <div v-if="pedido.supervisor" class="detail-item">
                <label>Supervisor:</label>
                <span>{{ pedido.supervisor?.nombres }} {{ pedido.supervisor?.apellidos }}</span>
              </div>
            </div>
          </div>

          <!-- Información financiera -->
          <div class="detail-section">
            <h3>Información Financiera</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Costo Estimado:</label>
                <span class="price">${{ pedido.costo_estimado?.toLocaleString('es-GT', {minimumFractionDigits: 2}) || '0.00' }}</span>
              </div>
              <div class="detail-item">
                <label>Precio Final:</label>
                <span class="price final">${{ pedido.precio_final?.toLocaleString('es-GT', {minimumFractionDigits: 2}) || '0.00' }}</span>
              </div>
              <div v-if="pedido.costo_estimado && pedido.precio_final" class="detail-item">
                <label>Margen:</label>
                <span class="margen" :class="getMargenClass(pedido)">
                  {{ calcularMargen(pedido) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="detail-section">
            <h3>Información Adicional</h3>
            <div class="detail-grid">
              <div v-if="pedido.proyecto_asociado" class="detail-item full-width">
                <label>Proyecto Asociado:</label>
                <span>{{ pedido.proyecto_asociado }}</span>
              </div>
              <div v-if="pedido.notas" class="detail-item full-width">
                <label>Notas:</label>
                <p class="notes">{{ pedido.notas }}</p>
              </div>
            </div>
          </div>

          <!-- Archivos adjuntos -->
          <div v-if="pedido.archivos && pedido.archivos.length > 0" class="detail-section">
            <h3>Archivos Adjuntos ({{ pedido.archivos.length }})</h3>
            <div class="file-list">
              <div v-for="archivo in pedido.archivos" :key="archivo.id" class="file-item">
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
        <button class="btn secondary" @click="close">Cerrar</button>
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
    }
  },
  methods: {
    close() {
      this.$emit('close')
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
      return new Date(dateString).toLocaleDateString('es-GT')
    },
    
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A'
      return new Date(dateTimeString).toLocaleString('es-GT')
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
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.detail-item span {
  color: #333;
}

.notes {
  margin: 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  line-height: 1.5;
}

.status-badge, .priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.status-badge.draft {
  background: #6c757d;
  color: white;
}

.status-badge.pending {
  background: #ffc107;
  color: #212529;
}

.status-badge.approved {
  background: #17a2b8;
  color: white;
}

.status-badge.in-progress {
  background: #007bff;
  color: white;
}

.status-badge.completed {
  background: #28a745;
  color: white;
}

.status-badge.cancelled {
  background: #dc3545;
  color: white;
}

.priority-1 {
  background: #dc3545;
  color: white;
}

.priority-2 {
  background: #fd7e14;
  color: white;
}

.priority-3 {
  background: #ffc107;
  color: #212529;
}

.priority-4 {
  background: #20c997;
  color: white;
}

.priority-5 {
  background: #6c757d;
  color: white;
}

.price {
  font-weight: 600;
  font-family: monospace;
}

.price.final {
  color: #28a745;
  font-size: 1.1em;
}

.margen {
  font-weight: 600;
  font-family: monospace;
}

.margen.good {
  color: #28a745;
}

.margen.medium {
  color: #ffc107;
}

.margen.low {
  color: #dc3545;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #f8f9fa;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-type {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.download-btn {
  color: #007bff;
  text-decoration: none;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background: #e3f2fd;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #545b62;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>