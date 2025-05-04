<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ report.title }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Sección de información básica -->
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <span class="info-value" :class="'status-' + report.status">
                {{ formatStatus(report.status) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Reportado por:</span>
              <span class="info-value">{{ report.employee }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha del reporte:</span>
              <span class="info-value">{{ formatDate(report.date) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Prioridad:</span>
              <span class="info-value">{{ report.priority || 'Media' }}</span>
            </div>
          </div>
          
          <!-- Sección de descripción -->
          <div class="description-section">
            <h3>Descripción</h3>
            <p>{{ report.description }}</p>
          </div>
          
          <!-- Sección específica según tipo de reporte -->
          <div v-if="report.type === 'materiales'" class="specific-section">
            <h3>Detalles de Materiales</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Material faltante:</span>
                <span class="info-value">{{ report.material }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Cantidad requerida:</span>
                <span class="info-value">{{ report.quantity }} {{ report.unit }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Proyecto afectado:</span>
                <span class="info-value">{{ report.project || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Urgencia:</span>
                <span class="info-value">{{ report.urgency || 'Media' }}</span>
              </div>
            </div>
          </div>
          
          <div v-else-if="report.type === 'herramientas'" class="specific-section">
            <h3>Detalles de Herramienta</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Herramienta:</span>
                <span class="info-value">{{ report.tool }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Problema detectado:</span>
                <span class="info-value">{{ report.issue }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Último mantenimiento:</span>
                <span class="info-value">{{ report.lastMaintenance || 'No registrado' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Solución recomendada:</span>
                <span class="info-value">{{ report.solution || 'Por determinar' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Historial de acciones -->
          <div class="history-section" v-if="report.history && report.history.length">
            <h3>Historial</h3>
            <div class="timeline">
              <div v-for="(event, index) in report.history" :key="index" class="timeline-event">
                <div class="timeline-badge"></div>
                <div class="timeline-content">
                  <span class="timeline-date">{{ formatDate(event.date) }}</span>
                  <p class="timeline-text">{{ event.action }}</p>
                  <p class="timeline-author" v-if="event.author">- {{ event.author }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Comentarios y solución -->
          <div class="comments-section">
            <h3>Comentarios</h3>
            <div class="comments-list">
              <div v-if="report.comments && report.comments.length">
                <div v-for="(comment, index) in report.comments" :key="index" class="comment">
                  <p class="comment-text">{{ comment.text }}</p>
                  <p class="comment-meta">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-date">{{ formatDate(comment.date) }}</span>
                  </p>
                </div>
              </div>
              <p v-else>No hay comentarios registrados</p>
            </div>
            
            <div class="add-comment">
              <textarea 
                v-model="newComment" 
                placeholder="Agregar comentario o solución..."
                rows="3"
              ></textarea>
              <button class="btn btn-primary" @click="addComment">
                <i class="fas fa-plus"></i> Agregar Comentario
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-secondary" 
            @click="closeModal"
          >
            Cerrar
          </button>
          <button 
            class="btn btn-primary" 
            @click="resolveReport"
            v-if="report.status !== 'resolved'"
          >
            <i class="fas fa-check"></i> Marcar como Resuelto
          </button>
          <button 
            class="btn btn-download" 
            @click="downloadReport"
          >
            <i class="fas fa-file-pdf"></i> Exportar a PDF
          </button>
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
        required: true
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
        this.$emit('resolve', this.report)
      },
      addComment() {
        if (this.newComment.trim()) {
          if (!this.report.comments) {
            this.report.comments = []
          }
          this.report.comments.push({
            text: this.newComment,
            author: 'Usuario Actual', // Reemplazar con usuario real
            date: new Date().toISOString()
          })
          this.newComment = ''
        }
      },
      downloadReport() {
        // Lógica para generar PDF
        console.log('Generando PDF del reporte:', this.report.id)
        // En una implementación real, usarías una librería como jsPDF o html2pdf
      },
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        return new Date(dateString).toLocaleDateString('es-ES', options)
      },
      formatStatus(status) {
        const statusMap = {
          'pending': 'Pendiente',
          'resolved': 'Resuelto',
          'in_progress': 'En Progreso',
          'rejected': 'Rechazado'
        }
        return statusMap[status] || status
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>