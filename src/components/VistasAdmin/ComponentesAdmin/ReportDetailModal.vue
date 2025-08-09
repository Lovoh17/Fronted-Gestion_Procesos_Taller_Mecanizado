<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ report.title }}</h2>
        <va-button class="close-btn" @click="closeModal"   >
        ×
      </va-button>
      </div>
      
      <div class="modal-body">
        <!-- Información básica -->
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Estado:</span>
            <span class="info-value" :class="'status-' + report.status">
              {{ formatStatus(report.status) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Reportado por:</span>
            <span class="info-value">{{ report.employee }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha:</span>
            <span class="info-value">{{ formatDate(report.date) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Prioridad:</span>
            <span class="info-value">{{ report.priority || 'Media' }}</span>
          </div>
        </div>

        <!-- Descripción principal -->
        <div class="section">
          <h3>Descripción</h3>
          <p class="description-text">{{ report.description }}</p>
        </div>

        <!-- Detalles específicos -->
        <div v-if="report.type" class="section">
          <h3>Detalles de {{ report.type === 'materiales' ? 'Materiales' : 'Herramientas' }}</h3>
          <div class="info-grid">
            <template v-if="report.type === 'materiales'">
              <div class="info-item">
                <span class="info-label">Material faltante:</span>
                <span class="info-value">{{ report.material }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cantidad:</span>
                <span class="info-value">{{ report.quantity }} {{ report.unit }}</span>
              </div>
            </template>
            <template v-else-if="report.type === 'herramientas'">
              <div class="info-item">
                <span class="info-label">Herramienta:</span>
                <span class="info-value">{{ report.tool }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Problema:</span>
                <span class="info-value">{{ report.issue }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Historial -->
        <div v-if="report.history?.length" class="section">
          <h3>Historial</h3>
          <div class="timeline">
            <div v-for="(event, index) in report.history" :key="index" class="timeline-event">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-date">{{ formatDate(event.date) }}</span>
                <p>{{ event.action }}</p>
                <p v-if="event.author" class="timeline-author">{{ event.author }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Comentarios -->
        <div class="section">
          <h3>Comentarios</h3>
          <div v-if="report.comments?.length" class="comments">
            <div v-for="(comment, index) in report.comments" :key="index" class="comment">
              <p class="comment-text">{{ comment.text }}</p>
              <p class="comment-meta">{{ comment.author }} · {{ formatDate(comment.date) }}</p>
            </div>
          </div>
          <p v-else class="no-comments">No hay comentarios</p>

          <div class="comment-form">
            <textarea
              v-model="newComment"
              placeholder="Escribe tu comentario..."
              rows="3"
            ></textarea>
            <va-button class="btn" @click="addComment"   >
        Agregar comentario
      </va-button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <va-button class="btn btn-secondary" @click="closeModal" color="secondary"  >
        Cerrar
      </va-button>
        <va-button v-if="report.status !== 'resolved'" 
          class="btn btn-primary" 
          @click="resolveReport"
         color="primary"  >
        Marcar como resuelto
      </va-button>
        <va-button class="btn" @click="downloadReport"   >
        Exportar a PDF
      </va-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportDetailModal',
  props: {
    report: {
      type: Object,
      required: true,
      validator: report => {
        return report.title && report.description && report.status
      }
    }
  },
  data() {
    return {
      newComment: ''
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    resolveReport() {
      this.$emit('resolve', this.report.id)
    },
    addComment() {
      if (!this.newComment.trim()) return
      
      const comment = {
        text: this.newComment,
        author: 'Usuario Actual', // Reemplazar con autenticación real
        date: new Date().toISOString()
      }
      
      this.$emit('add-comment', comment)
      this.newComment = ''
    },
    downloadReport() {
      this.$emit('export', this.report.id)
    },
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    },
    formatStatus(status) {
      const statusMap = {
        'pending': 'Pendiente',
        'resolved': 'Resuelto',
        'in_progress': 'En progreso',
        'rejected': 'Rechazado'
      }
      return statusMap[status] || status
    }
  }
}
</script>