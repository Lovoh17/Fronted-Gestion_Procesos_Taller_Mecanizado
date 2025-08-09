<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Mantenimiento #{{ maintenance.id }}</h2>
          <div class="maintenance-status">
            <span class="status-badge" :class="maintenance.status">{{ statusLabels[maintenance.status] }}</span>
            <span class="priority-badge" :class="maintenance.priority">{{ priorityLabels[maintenance.priority] }}</span>
          </div>
          <va-button class="close-btn" @click="close"    >
        
            <span class="material-icons">close</span>
          
      </va-button>
        </div>
        
        <div class="modal-body">
          <div class="maintenance-section">
            <h3 class="section-title">
              <span class="material-icons">info</span> Información General
            </h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>Equipo:</label>
                <span>{{ maintenance.equipment.name }}</span>
              </div>
              <div class="info-item">
                <label>Tipo:</label>
                <span>{{ typeLabels[maintenance.type] }}</span>
              </div>
              <div class="info-item">
                <label>Fecha Programada:</label>
                <span>{{ formatDate(maintenance.scheduledDate) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha Realización:</label>
                <span>{{ maintenance.completedDate ? formatDate(maintenance.completedDate) : 'Pendiente' }}</span>
              </div>
              <div class="info-item">
                <label>Técnico Asignado:</label>
                <span>{{ maintenance.assignedTechnician || 'Sin asignar' }}</span>
              </div>
              <div class="info-item">
                <label>Duración Estimada:</label>
                <span>{{ maintenance.estimatedDuration }} horas</span>
              </div>
            </div>
          </div>
          
          <div class="maintenance-section">
            <h3 class="section-title">
              <span class="material-icons">description</span> Descripción del Trabajo
            </h3>
            <div class="description-content">
              {{ maintenance.description || 'No hay descripción detallada' }}
            </div>
          </div>
          
          <div class="maintenance-section">
            <h3 class="section-title">
              <span class="material-icons">construction</span> Tareas Realizadas
            </h3>
            
            <div class="tasks-list" v-if="maintenance.tasks && maintenance.tasks.length > 0">
              <div class="task-item" v-for="(task, index) in maintenance.tasks" :key="index">
                <div class="task-header">
                  <span class="task-checkbox">
                    <span class="material-icons" v-if="task.completed">check_circle</span>
                    <span class="material-icons" v-else>radio_button_unchecked</span>
                  </span>
                  <span class="task-name">{{ task.name }}</span>
                </div>
                <div class="task-details" v-if="task.details">
                  {{ task.details }}
                </div>
              </div>
            </div>
            <div class="no-tasks" v-else>
              No se han registrado tareas para este mantenimiento
            </div>
          </div>
          
          <div class="maintenance-section">
            <h3 class="section-title">
              <span class="material-icons">inventory</span> Repuestos Utilizados
            </h3>
            
            <table class="parts-table" v-if="maintenance.partsUsed && maintenance.partsUsed.length > 0">
              <thead>
                <tr>
                  <th>Repuesto</th>
                  <th>Cantidad</th>
                  <th>Código</th>
                  <th>Costo Unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(part, index) in maintenance.partsUsed" :key="index">
                  <td>{{ part.name }}</td>
                  <td>{{ part.quantity }}</td>
                  <td>{{ part.code || 'N/A' }}</td>
                  <td>{{ formatCurrency(part.unitCost) }}</td>
                  <td>{{ formatCurrency(part.quantity * part.unitCost) }}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4">Total en Repuestos</td>
                  <td>{{ formatCurrency(calculatePartsTotal()) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="no-parts" v-else>
              No se registraron repuestos utilizados
            </div>
          </div>
          
          <div class="maintenance-section">
            <h3 class="section-title">
              <span class="material-icons">photo_camera</span> Evidencias Fotográficas
            </h3>
            
            <div class="gallery" v-if="maintenance.evidence && maintenance.evidence.length > 0">
              <div class="image-container" v-for="(image, index) in maintenance.evidence" :key="index">
                <img :src="image.url" :alt="'Evidencia ' + (index + 1)" @click="openImageModal(image.url)">
                <div class="image-caption">{{ image.description || 'Evidencia ' + (index + 1) }}</div>
              </div>
            </div>
            <div class="no-evidence" v-else>
              No hay evidencias fotográficas registradas
            </div>
          </div>
          
          <div class="maintenance-section">
            <h3 class="section-title">
              <span class="material-icons">notes</span> Observaciones y Recomendaciones
            </h3>
            
            <div class="observations-content" v-if="maintenance.observations">
              {{ maintenance.observations }}
            </div>
            <div class="no-observations" v-else>
              No se registraron observaciones
            </div>
          </div>
          
          <div class="maintenance-section" v-if="maintenance.history && maintenance.history.length > 0">
            <h3 class="section-title">
              <span class="material-icons">history</span> Historial del Mantenimiento
            </h3>
            
            <div class="timeline">
              <div class="timeline-item" v-for="(event, index) in maintenance.history" :key="index">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-date">{{ formatDateTime(event.date) }}</div>
                  <div class="timeline-event">{{ event.description }}</div>
                  <div class="timeline-user">Registrado por: {{ event.user }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <va-button class="btn secondary" @click="close"   >
        Cerrar
      </va-button>
          <va-button class="btn primary" @click="printMaintenance" v-if="!isMobile"    >
        
            <span class="material-icons">print</span> Imprimir
          
      </va-button>
          <va-button class="btn action" @click="openEditModal" v-if="canEdit"    >
        
            <span class="material-icons">edit</span> Editar
          
      </va-button>
        </div>
      </div>
    </div>
    
    <!-- Modal para imagen ampliada -->
    <div class="image-modal-overlay" v-if="showImageModal" @click.self="closeImageModal">
      <div class="image-modal-content">
        <va-button class="close-btn" @click="closeImageModal"    >
        
          <span class="material-icons">close</span>
        
      </va-button>
        <img :src="currentImage" alt="Evidencia de mantenimiento">
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      maintenance: {
        type: Object,
        required: true
      },
      canEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        statusLabels: {
          scheduled: 'Programado',
          inProgress: 'En Progreso',
          completed: 'Completado',
          cancelled: 'Cancelado',
          overdue: 'Atrasado'
        },
        priorityLabels: {
          high: 'Alta',
          medium: 'Media',
          low: 'Baja'
        },
        typeLabels: {
          preventive: 'Preventivo',
          corrective: 'Correctivo',
          predictive: 'Predictivo',
          calibration: 'Calibración'
        },
        showImageModal: false,
        currentImage: '',
        isMobile: window.innerWidth < 768
      };
    },
    methods: {
      close() {
        this.$emit('close');
      },
      formatDate(dateString) {
        if (!dateString) return 'No definida';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      },
      formatDateTime(dateString) {
        if (!dateString) return '';
        const options = { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      },
      formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(amount || 0);
      },
      calculatePartsTotal() {
        if (!this.maintenance.partsUsed) return 0;
        return this.maintenance.partsUsed.reduce(
          (total, part) => total + (part.quantity * part.unitCost), 0
        );
      },
      openImageModal(imageUrl) {
        this.currentImage = imageUrl;
        this.showImageModal = true;
      },
      closeImageModal() {
        this.showImageModal = false;
      },
      printMaintenance() {
        window.print();
      },
      openEditModal() {
        this.$emit('edit', this.maintenance);
      }
    }
  };
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
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .dark-mode .modal-content {
    background-color: #1e1e1e;
    color: #fff;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
    position: relative;
  }
  
  .dark-mode .modal-header {
    border-bottom-color: #333;
  }
  
  .modal-header h2 {
    margin: 0;
    color: var(--primary-color);
    flex: 1;
  }
  
  .maintenance-status {
    display: flex;
    gap: 10px;
    margin: 0 15px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .status-badge.scheduled {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .dark-mode .status-badge.scheduled {
    background-color: #1a3a4a;
    color: #90caf9;
  }
  
  .status-badge.inProgress {
    background-color: #fff8e1;
    color: #ff8f00;
  }
  
  .dark-mode .status-badge.inProgress {
    background-color: #4a3a1a;
    color: #ffe082;
  }
  
  .status-badge.completed {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .dark-mode .status-badge.completed {
    background-color: #1a3a1a;
    color: #a5d6a7;
  }
  
  .status-badge.cancelled {
    background-color: #efebe9;
    color: #6d4c41;
  }
  
  .dark-mode .status-badge.cancelled {
    background-color: #3a2a22;
    color: #d7ccc8;
  }
  
  .status-badge.overdue {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .dark-mode .status-badge.overdue {
    background-color: #4a2222;
    color: #ffcdd2;
  }
  
  .priority-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .priority-badge.high {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .dark-mode .priority-badge.high {
    background-color: #4a2222;
    color: #ffcdd2;
  }
  
  .priority-badge.medium {
    background-color: #fff8e1;
    color: #ff8f00;
  }
  
  .dark-mode .priority-badge.medium {
    background-color: #4a3a1a;
    color: #ffe082;
  }
  
  .priority-badge.low {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .dark-mode .priority-badge.low {
    background-color: #1a3a1a;
    color: #a5d6a7;
  }
  
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 24px;
  }
  
  .dark-mode .close-btn {
    color: #aaa;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .dark-mode .close-btn:hover {
    color: #fff;
  }
  
  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }
  
  .maintenance-section {
    margin-bottom: 30px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: var(--primary-color);
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .info-item {
    margin-bottom: 10px;
  }
  
  .info-item label {
    display: block;
    font-weight: 500;
    color: #666;
    margin-bottom: 5px;
    font-size: 0.9em;
  }
  
  .dark-mode .info-item label {
    color: #aaa;
  }
  
  .info-item span {
    word-break: break-word;
  }
  
  .description-content,
  .observations-content {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 15px;
    white-space: pre-line;
  }
  
  .dark-mode .description-content,
  .dark-mode .observations-content {
    background-color: #2d2d2d;
  }
  
  .tasks-list {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
  }
  
  .dark-mode .tasks-list {
    border-color: #333;
  }
  
  .task-item {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
  }
  
  .dark-mode .task-item {
    border-bottom-color: #333;
  }
  
  .task-item:last-child {
    border-bottom: none;
  }
  
  .task-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  
  .task-checkbox {
    color: var(--primary-color);
    display: flex;
  }
  
  .task-name {
    font-weight: 500;
  }
  
  .task-details {
    font-size: 0.9em;
    color: #666;
    margin-left: 28px;
  }
  
  .dark-mode .task-details {
    color: #aaa;
  }
  
  .no-tasks,
  .no-parts,
  .no-evidence,
  .no-observations {
    color: #666;
    font-style: italic;
    padding: 10px;
  }
  
  .dark-mode .no-tasks,
  .dark-mode .no-parts,
  .dark-mode .no-evidence,
  .dark-mode .no-observations {
    color: #aaa;
  }
  
  .parts-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }
  
  .parts-table th {
    background-color: #f5f5f5;
    padding: 10px 12px;
    text-align: left;
    font-weight: 500;
    font-size: 0.9em;
  }
  
  .dark-mode .parts-table th {
    background-color: #2d2d2d;
  }
  
  .parts-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
  }
  
  .dark-mode .parts-table td {
    border-bottom-color: #333;
  }
  
  .total-row {
    font-weight: 500;
    background-color: #f5f5f5;
  }
  
  .dark-mode .total-row {
    background-color: #2d2d2d;
  }
  
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 10px;
  }
  
  .image-container {
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .image-container:hover {
    transform: scale(1.02);
  }
  
  .image-container img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ddd;
  }
  
  .dark-mode .image-container img {
    border-color: #444;
  }
  
  .image-caption {
    font-size: 0.8em;
    text-align: center;
    margin-top: 5px;
    color: #666;
  }
  
  .dark-mode .image-caption {
    color: #aaa;
  }
  
  .timeline {
    position: relative;
    padding-left: 20px;
    margin-left: 10px;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    background-color: #ddd;
  }
  
  .dark-mode .timeline::before {
    background-color: #444;
  }
  
  .timeline-item {
    position: relative;
    padding-bottom: 20px;
  }
  
  .timeline-dot {
    position: absolute;
    left: -26px;
    top: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--primary-color);
    border: 3px solid white;
  }
  
  .dark-mode .timeline-dot {
    border-color: #1e1e1e;
  }
  
  .timeline-content {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 12px 15px;
  }
  
  .dark-mode .timeline-content {
    background-color: #2d2d2d;
  }
  
  .timeline-date {
    font-size: 0.8em;
    color: #666;
    margin-bottom: 5px;
  }
  
  .dark-mode .timeline-date {
    color: #aaa;
  }
  
  .timeline-event {
    margin-bottom: 3px;
  }
  
  .timeline-user {
    font-size: 0.8em;
    color: #666;
    font-style: italic;
  }
  
  .dark-mode .timeline-user {
    color: #aaa;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
  }
  
  .dark-mode .modal-footer {
    border-top-color: #333;
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn.primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn.primary:hover {
    background-color: var(--secondary-color);
  }
  
  .btn.secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  
  .dark-mode .btn.secondary {
    background-color: #333;
    color: #fff;
  }
  
  .btn.secondary:hover {
    background-color: #d0d0d0;
  }
  
  .dark-mode .btn.secondary:hover {
    background-color: #444;
  }
  
  .btn.action {
    background-color: #2196f3;
    color: white;
  }
  
  .btn.action:hover {
    background-color: #1976d2;
  }
  
  /* Modal de imagen */
  .image-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }
  
  .image-modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90vh;
  }
  
  .image-modal-content img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
  }
  
  .image-modal-content .close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    color: white;
    font-size: 30px;
  }
  
  @media (max-width: 768px) {
    .modal-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    
    .maintenance-status {
      margin: 0;
      align-self: flex-start;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .gallery {
      grid-template-columns: 1fr 1fr;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
    }
  }
  
  @media (max-width: 480px) {
    .gallery {
      grid-template-columns: 1fr;
    }
    
    .parts-table {
      font-size: 0.8em;
    }
    
    .parts-table th,
    .parts-table td {
      padding: 8px;
    }
  }
  
  @media print {
    body * {
      visibility: hidden;
    }
    .modal-overlay, .modal-overlay * {
      visibility: visible;
    }
    .modal-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
    }
    .modal-content {
      box-shadow: none;
      max-height: none;
      width: 100%;
    }
    .modal-footer {
      display: none;
    }
  }
  </style>