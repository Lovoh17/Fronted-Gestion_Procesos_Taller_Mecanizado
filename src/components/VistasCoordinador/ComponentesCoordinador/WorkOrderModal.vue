<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ mode === 'create' ? 'Nueva Orden de Trabajo' : 'Editar Orden #' + order.id }}</h2>
          <button class="close-btn" @click="close">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>Cliente *</label>
                <select v-model="order.client.id" required>
                  <option v-for="client in clients" :key="client.id" :value="client.id">
                    {{ client.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Prioridad *</label>
                <select v-model="order.priority" required>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Descripción *</label>
              <textarea v-model="order.description" rows="3" required></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Fecha Inicio *</label>
                <input type="date" v-model="order.startDate" required>
              </div>
              
              <div class="form-group">
                <label>Fecha Fin Estimada *</label>
                <input type="date" v-model="order.endDate" required>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3 class="section-title">
              <span class="material-icons">people</span> Asignación de Recursos
            </h3>
            
            <div class="resource-grid">
              <div class="resource-item" v-for="resource in resources" :key="resource.id">
                <label class="resource-checkbox">
                  <input type="checkbox" 
                         v-model="order.assignedTo" 
                         :value="{ id: resource.id, name: resource.name }"
                         :disabled="isResourceDisabled(resource)">
                  <span class="checkmark"></span>
                  <span class="resource-name">
                    <span class="material-icons">{{ resource.icon }}</span>
                    {{ resource.name }}
                  </span>
                  <span class="resource-details">({{ resource.type }})</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3 class="section-title">
              <span class="material-icons">inventory</span> Materiales Requeridos
            </h3>
            
            <div class="materials-list">
              <div class="material-item" v-for="(material, index) in order.materials" :key="index">
                <div class="material-row">
                  <select v-model="material.id" class="material-select">
                    <option value="">Seleccionar material</option>
                    <option v-for="mat in materialOptions" 
                            :key="mat.id" 
                            :value="mat.id"
                            :disabled="isMaterialSelected(mat.id, index)">
                      {{ mat.name }} ({{ mat.stock }} {{ mat.unit }} disponibles)
                    </option>
                  </select>
                  
                  <input type="number" 
                         v-model="material.quantity" 
                         min="1" 
                         :max="getMaxQuantity(material.id)"
                         placeholder="Cantidad"
                         class="quantity-input">
                  
                  <span class="material-unit">
                    {{ getMaterialUnit(material.id) }}
                  </span>
                  
                  <button class="remove-btn" @click="removeMaterial(index)">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
                
                <div v-if="materialError(material)" class="error-message">
                  {{ materialError(material) }}
                </div>
              </div>
              
              <button class="add-btn" @click="addMaterial">
                <span class="material-icons">add</span> Agregar Material
              </button>
            </div>
          </div>
          
          <div class="form-section">
            <div class="form-group">
              <label>Notas Adicionales</label>
              <textarea v-model="order.notes" rows="2"></textarea>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn secondary" @click="close">Cancelar</button>
          <button class="btn primary" @click="save">{{ mode === 'create' ? 'Crear Orden' : 'Guardar Cambios' }}</button>
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
      },
      mode: {
        type: String,
        default: 'create',
        validator: value => ['create', 'edit'].includes(value)
      }
    },
    data() {
      return {
        clients: [
          { id: 1, name: 'Industrias ACME' },
          { id: 2, name: 'Talleres Pérez' },
          { id: 3, name: 'Metalúrgica Rodríguez' }
        ],
        resources: [
          { id: 1, name: 'Máquina CNC', type: 'Equipo', icon: 'precision_manufacturing' },
          { id: 2, name: 'Equipo Soldadura', type: 'Equipo', icon: 'handyman' },
          { id: 3, name: 'Operario 1', type: 'Personal', icon: 'engineering' },
          { id: 4, name: 'Operario 2', type: 'Personal', icon: 'engineering' },
          { id: 5, name: 'Pintura', type: 'Área', icon: 'format_paint' }
        ],
        materialOptions: [
          { id: 1, name: 'Acero inoxidable', stock: 150, unit: 'kg' },
          { id: 2, name: 'Tornillos', stock: 500, unit: 'unidades' },
          { id: 3, name: 'Pintura azul', stock: 25, unit: 'litros' },
          { id: 4, name: 'Rodamientos', stock: 80, unit: 'unidades' }
        ]
      };
    },
    methods: {
      close() {
        this.$emit('close');
      },
      save() {
        if (this.validateForm()) {
          this.$emit('save', this.order);
        }
      },
      validateForm() {
        // Validación básica - implementar validación completa según necesidades
        if (!this.order.client.id || !this.order.description || !this.order.startDate || !this.order.endDate) {
          alert('Por favor complete todos los campos requeridos');
          return false;
        }
        return true;
      },
      addMaterial() {
        this.order.materials.push({ id: '', quantity: 1, unit: '' });
      },
      removeMaterial(index) {
        this.order.materials.splice(index, 1);
      },
      isResourceDisabled(resource) {
        // Lógica para deshabilitar recursos no disponibles
        return false; // Implementar según disponibilidad real
      },
      isMaterialSelected(materialId, currentIndex) {
        return this.order.materials.some((mat, index) => 
          mat.id === materialId && index !== currentIndex
        );
      },
      getMaxQuantity(materialId) {
        const material = this.materialOptions.find(m => m.id === materialId);
        return material ? material.stock : 0;
      },
      getMaterialUnit(materialId) {
        const material = this.materialOptions.find(m => m.id === materialId);
        return material ? material.unit : '';
      },
      materialError(material) {
        if (material.id) {
          const selectedMat = this.materialOptions.find(m => m.id === material.id);
          if (selectedMat && material.quantity > selectedMat.stock) {
            return `Cantidad excede el stock disponible (${selectedMat.stock} ${selectedMat.unit})`;
          }
        }
        return null;
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
    max-width: 800px;
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
  }
  
  .dark-mode .modal-header {
    border-bottom-color: #333;
  }
  
  .modal-header h2 {
    margin: 0;
    color: var(--primary-color);
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
  
  .form-section {
    margin-bottom: 25px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: var(--primary-color);
  }
  
  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
  }
  
  .dark-mode .form-group input,
  .dark-mode .form-group select,
  .dark-mode .form-group textarea {
    background-color: #333;
    color: #fff;
    border-color: #555;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 60px;
  }
  
  .resource-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .resource-item {
    margin-bottom: 8px;
  }
  
  .resource-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  
  .resource-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }
  
  .checkmark {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
  }
  
  .dark-mode .checkmark {
    border-color: #555;
  }
  
  .resource-checkbox input:checked ~ .checkmark {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 5px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .resource-checkbox input:checked ~ .checkmark:after {
    display: block;
  }
  
  .resource-name {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .resource-details {
    font-size: 0.8em;
    color: #666;
    margin-left: 5px;
  }
  
  .dark-mode .resource-details {
    color: #aaa;
  }
  
  .materials-list {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
  }
  
  .dark-mode .materials-list {
    border-color: #333;
  }
  
  .material-item {
    margin-bottom: 15px;
  }
  
  .material-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  
  .material-select {
    flex: 2;
    min-width: 0;
  }
  
  .quantity-input {
    width: 80px;
  }
  
  .material-unit {
    width: 70px;
    font-size: 0.9em;
    color: #666;
  }
  
  .dark-mode .material-unit {
    color: #aaa;
  }
  
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #f44336;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  
  .remove-btn:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  .error-message {
    color: #f44336;
    font-size: 0.8em;
    margin-left: 28px;
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .add-btn:hover {
    background-color: rgba(33, 150, 243, 0.1);
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
    .form-row {
      flex-direction: column;
      gap: 0;
    }
    
    .resource-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .material-row {
      flex-wrap: wrap;
    }
    
    .material-select {
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
      padding: 15px;
    }
    
    .resource-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
    }
  }
  </style>