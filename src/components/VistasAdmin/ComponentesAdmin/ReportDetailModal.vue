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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .modal-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .modal-header {
    padding: 20px;
    background: #2c3e50;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
  }
  
  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
  }
  
  .info-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .info-row {
    display: flex;
    margin-bottom: 10px;
  }
  
  .info-label {
    font-weight: 600;
    width: 150px;
    color: #555;
  }
  
  .info-value {
    flex: 1;
  }
  
  .status-pending {
    color: #d39e00;
    font-weight: 600;
  }
  
  .status-resolved {
    color: #28a745;
    font-weight: 600;
  }
  
  .status-in_progress {
    color: #17a2b8;
    font-weight: 600;
  }
  
  .description-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .description-section h3 {
    color: #2c3e50;
    margin-top: 0;
  }
  
  .specific-section {
    margin-bottom: 20px;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
  }
  
  .history-section {
    margin-bottom: 20px;
  }
  
  .timeline {
    position: relative;
    padding-left: 30px;
    margin-top: 15px;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #ddd;
  }
  
  .timeline-event {
    position: relative;
    margin-bottom: 15px;
  }
  
  .timeline-badge {
    position: absolute;
    left: -30px;
    top: 0;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3498db;
    border: 3px solid white;
  }
  
  .timeline-date {
    font-size: 0.85rem;
    color: #666;
  }
  
  .timeline-text {
    margin: 5px 0;
  }
  
  .timeline-author {
    font-size: 0.85rem;
    color: #888;
    font-style: italic;
  }
  
  .comments-section {
    margin-bottom: 20px;
  }
  
  .comment {
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .comment-text {
    margin: 0 0 5px 0;
  }
  
  .comment-meta {
    font-size: 0.8rem;
    color: #666;
    display: flex;
    justify-content: space-between;
  }
  
  .add-comment {
    margin-top: 20px;
  }
  
  .add-comment textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    resize: vertical;
  }
  
  .modal-footer {
    padding: 15px 20px;
    background: #f8f9fa;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #eee;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  
  .btn-primary {
    background: #3498db;
    color: white;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
  }
  
  .btn-download {
    background: #dc3545;
    color: white;
  }
  
  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .info-row {
      flex-direction: column;
    }
    
    .info-label {
      width: auto;
      margin-bottom: 5px;
    }
  }
  </style>