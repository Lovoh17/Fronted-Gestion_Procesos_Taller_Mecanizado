<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Orden de Trabajo #{{ order.id }}</h2>
          <div class="order-status">
            <span class="status-badge" :class="order.status">{{ statusLabels[order.status] }}</span>
            <span class="priority-badge" :class="order.priority">{{ priorityLabels[order.priority] }}</span>
          </div>
          <button class="close-btn" @click="close">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="order-section">
            <h3 class="section-title">
              <span class="material-icons">info</span> Información General
            </h3>
            
            <div class="info-grid">
              <div class="info-item">
                <label>Cliente:</label>
                <span>{{ order.client.name }}</span>
              </div>
              <div class="info-item">
                <label>Fecha Creación:</label>
                <span>{{ formatDate(order.startDate) }}</span>
              </div>
              <div class="info-item">
                <label>Fecha Entrega:</label>
                <span>{{ formatDate(order.endDate) }}</span>
              </div>
              <div class="info-item">
                <label>Progreso:</label>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: order.progress + '%' }"></div>
                  <span class="progress-text">{{ order.progress }}%</span>
                </div>
              </div>
            </div>
            
            <div class="info-item full-width">
              <label>Descripción:</label>
              <p>{{ order.description }}</p>
            </div>
          </div>
          
          <div class="order-section">
            <h3 class="section-title">
              <span class="material-icons">people</span> Recursos Asignados
            </h3>
            
            <div class="resource-cards">
              <div class="resource-card" v-for="resource in order.assignedTo" :key="resource.id">
                <span class="material-icons resource-icon">{{ getResourceIcon(resource.id) }}</span>
                <div class="resource-info">
                  <div class="resource-name">{{ resource.name }}</div>
                  <div class="resource-status">
                    <span class="material-icons">schedule</span>
                    {{ getResourceStatus(resource.id) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-section">
            <h3 class="section-title">
              <span class="material-icons">inventory</span> Materiales Utilizados
            </h3>
            
            <table class="materials-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(material, index) in order.materials" :key="index">
                  <td>{{ getMaterialName(material.id) }}</td>
                  <td>{{ material.quantity }}</td>
                  <td>{{ getMaterialUnit(material.id) }}</td>
                  <td>
                    <span class="material-status" :class="getMaterialStatus(material)">
                      {{ getMaterialStatus(material) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="order-section">
            <h3 class="section-title">
              <span class="material-icons">notes</span> Notas y Observaciones
            </h3>
            
            <div class="notes-content" v-if="order.notes">
              {{ order.notes }}
            </div>
            <div class="no-notes" v-else>
              No hay notas registradas para esta orden
            </div>
          </div>
          
          <div class="order-section" v-if="order.history && order.history.length > 0">
            <h3 class="section-title">
              <span class="material-icons">history</span> Historial de Cambios
            </h3>
            
            <div class="timeline">
              <div class="timeline-item" v-for="(event, index) in order.history" :key="index">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-date">{{ formatDateTime(event.date) }}</div>
                  <div class="timeline-event">{{ event.description }}</div>
                  <div class="timeline-user">Por: {{ event.user }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn secondary" @click="close">Cerrar</button>
          <button class="btn primary" @click="printOrder" v-if="!isMobile">
            <span class="material-icons">print</span> Imprimir
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      order: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        statusLabels: {
          pending: 'Pendiente',
          'in-progress': 'En Progreso',
          completed: 'Completada',
          delayed: 'Retrasada'
        },
        priorityLabels: {
          high: 'Alta',
          medium: 'Media',
          low: 'Baja'
        },
        resources: [
          { id: 1, name: 'Máquina CNC', icon: 'precision_manufacturing', status: 'Disponible' },
          { id: 2, name: 'Equipo Soldadura', icon: 'handyman', status: 'En uso' },
          { id: 3, name: 'Operario 1', icon: 'engineering', status: 'Disponible' },
          { id: 4, name: 'Operario 2', icon: 'engineering', status: 'En taller' }
        ],
        materialOptions: [
          { id: 1, name: 'Acero inoxidable', unit: 'kg' },
          { id: 2, name: 'Tornillos', unit: 'unidades' },
          { id: 3, name: 'Pintura azul', unit: 'litros' },
          { id: 4, name: 'Rodamientos', unit: 'unidades' }
        ],
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
      getResourceIcon(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        return resource ? resource.icon : 'help_outline';
      },
      getResourceStatus(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        return resource ? resource.status : 'Desconocido';
      },
      getMaterialName(materialId) {
        const material = this.materialOptions.find(m => m.id === materialId);
        return material ? material.name : 'Desconocido';
      },
      getMaterialUnit(materialId) {
        const material = this.materialOptions.find(m => m.id === materialId);
        return material ? material.unit : '';
      },
      getMaterialStatus(material) {
        // Lógica para determinar estado del material
        return 'Disponible';
      },
      printOrder() {
        window.print();
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
  
  .order-status {
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
  
  .status-badge.pending {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .dark-mode .status-badge.pending {
    background-color: #1a3a4a;
    color: #90caf9;
  }
  
  .status-badge.in-progress {
    background-color: #e0f7fa;
    color: #00838f;
  }
  
  .dark-mode .status-badge.in-progress {
    background-color: #1a3a3a;
    color: #80deea;
  }
  
  .status-badge.completed {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .dark-mode .status-badge.completed {
    background-color: #1a3a1a;
    color: #a5d6a7;
  }
  
  .status-badge.delayed {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .dark-mode .status-badge.delayed {
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
  
  .order-section {
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
  
  .info-item span, .info-item p {
    word-break: break-word;
  }
  
  .info-item.full-width {
    grid-column: 1 / -1;
  }
  
  .progress-bar {
    height: 24px;
    background-color: #eee;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }
  
  .dark-mode .progress-bar {
    background-color: #333;
  }
  
  .progress-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }
  
  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: 500;
    font-size: 0.8em;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
  
  .resource-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .resource-card {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 4px solid var(--primary-color);
  }
  
  .dark-mode .resource-card {
    background-color: #2d2d2d;
  }
  
  .resource-icon {
    font-size: 28px;
    color: var(--primary-color);
  }
  
  .resource-info {
    flex: 1;
  }
  
  .resource-name {
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .resource-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8em;
    color: #666;
  }
  
  .dark-mode .resource-status {
    color: #aaa;
  }
  
  .resource-status .material-icons {
    font-size: 16px;
  }
  
  .materials-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
  }
  
  .materials-table th {
    background-color: #f5f5f5;
    padding: 10px 12px;
    text-align: left;
    font-weight: 500;
    font-size: 0.9em;
  }
  
  .dark-mode .materials-table th {
    background-color: #2d2d2d;
  }
  
  .materials-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
  }
  
  .dark-mode .materials-table td {
    border-bottom-color: #333;
  }
  
  .material-status {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.8em;
    font-weight: 500;
  }
  
  .material-status.available {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .dark-mode .material-status.available {
    background-color: #1a3a1a;
    color: #a5d6a7;
  }
  
  .material-status.pending {
    background-color: #fff8e1;
    color: #ff8f00;
  }
  
  .dark-mode .material-status.pending {
    background-color: #4a3a1a;
    color: #ffe082;
  }
  
  .material-status.unavailable {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .dark-mode .material-status.unavailable {
    background-color: #4a2222;
    color: #ffcdd2;
  }
  
  .notes-content {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 15px;
    white-space: pre-line;
  }
  
  .dark-mode .notes-content {
    background-color: #2d2d2d;
  }
  
  .no-notes {
    color: #666;
    font-style: italic;
  }
  
  .dark-mode .no-notes {
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
  
  @media (max-width: 768px) {
    .modal-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
    
    .order-status {
      margin: 0;
      align-self: flex-start;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .resource-cards {
      grid-template-columns: 1fr;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
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