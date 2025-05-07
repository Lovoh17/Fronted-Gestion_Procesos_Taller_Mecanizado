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
        
        <!-- Sección de asignación de trabajadores (corregida) -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">engineering</span> Asignación de Trabajadores
          </h3>
          
          <div class="workers-selection">
            <div class="workers-list">
              <div class="worker-item" v-for="worker in workers" :key="worker.id">
                <label class="worker-checkbox">
                  <input 
                    type="checkbox"
                    v-model="order.assignedWorkers"
                    :value="worker.id"
                    :disabled="!worker.available"
                  >
                  <span class="checkmark"></span>
                  <div class="worker-info">
                    <span class="worker-name">{{ worker.name }}</span>
                    <span class="worker-role">{{ worker.role }}</span>
                    <span v-if="!worker.available" class="worker-status unavailable">
                      No disponible
                    </span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="assigned-preview" v-if="order.assignedWorkers && order.assignedWorkers.length > 0">
              <h4>Trabajadores asignados:</h4>
              <div class="assigned-list">
                <span v-for="workerId in order.assignedWorkers" :key="workerId" class="assigned-badge">
                  {{ getWorkerName(workerId) }}
                  <button @click="removeWorker(workerId)" class="remove-worker-btn">
                    <span class="material-icons">close</span>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sección de equipos -->
        <div class="form-section">
          <h3 class="section-title">
            <span class="material-icons">handyman</span> Asignación de Equipos
          </h3>
          
          <div class="resource-grid">
            <div class="resource-item" v-for="resource in equipment" :key="resource.id">
              <label class="resource-checkbox">
                <input 
                  type="checkbox" 
                  v-model="order.assignedEquipment" 
                  :value="resource.id"
                  :disabled="isResourceDisabled(resource)"
                >
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
        
        <!-- Sección de materiales -->
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
                
                <input 
                  type="number" 
                  v-model="material.quantity" 
                  min="1" 
                  :max="getMaxQuantity(material.id)"
                  placeholder="Cantidad"
                  class="quantity-input"
                >
                
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
        
        <!-- Notas adicionales -->
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
      required: true,
      default: () => ({
        id: null,
        client: { id: null },
        priority: 'medium',
        description: '',
        startDate: '',
        endDate: '',
        assignedWorkers: [], // Inicializado correctamente
        assignedEquipment: [],
        materials: [],
        notes: '',
        status: 'pending'
      })
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
      workers: [
        { id: 1, name: 'Juan Pérez', role: 'Soldador', available: true },
        { id: 2, name: 'María Gómez', role: 'Mecánico', available: true },
        { id: 3, name: 'Carlos Ruiz', role: 'Pintor', available: false },
        { id: 4, name: 'Ana López', role: 'Montador', available: true }
      ],
      equipment: [
        { id: 1, name: 'Máquina CNC', type: 'Equipo', icon: 'precision_manufacturing' },
        { id: 2, name: 'Equipo Soldadura', type: 'Equipo', icon: 'handyman' },
        { id: 3, name: 'Horno Industrial', type: 'Equipo', icon: 'oven' }
      ],
      materialOptions: [
        { id: 1, name: 'Acero inoxidable', stock: 150, unit: 'kg' },
        { id: 2, name: 'Tornillos', stock: 500, unit: 'unidades' },
        { id: 3, name: 'Pintura azul', stock: 25, unit: 'litros' }
      ]
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    save() {
      if (this.validateForm()) {
        this.$emit('save', this.order)
      }
    },
    validateForm() {
      const errors = []
      
      if (!this.order.client.id) errors.push('Seleccione un cliente')
      if (!this.order.description.trim()) errors.push('Ingrese una descripción')
      if (!this.order.startDate) errors.push('Seleccione fecha de inicio')
      if (!this.order.endDate) errors.push('Seleccione fecha estimada de fin')
      if (new Date(this.order.endDate) < new Date(this.order.startDate)) {
        errors.push('La fecha de fin no puede ser anterior a la de inicio')
      }
      if (!this.order.assignedWorkers || this.order.assignedWorkers.length === 0) {
        errors.push('Asigne al menos un trabajador')
      }
      
      // Validación de materiales
      this.order.materials.forEach((mat, index) => {
        if (!mat.id) {
          errors.push(`Material #${index + 1}: Seleccione un material`)
        } else if (mat.quantity <= 0) {
          errors.push(`Material #${index + 1}: Cantidad debe ser mayor a 0`)
        } else {
          const material = this.materialOptions.find(m => m.id === mat.id)
          if (material && mat.quantity > material.stock) {
            errors.push(`Material #${index + 1}: Cantidad excede el stock disponible (${material.stock} ${material.unit})`)
          }
        }
      })
      
      if (errors.length > 0) {
        alert('Errores:\n' + errors.join('\n'))
        return false
      }
      return true
    },
    // Métodos para trabajadores
    getWorkerName(workerId) {
      const worker = this.workers.find(w => w.id === workerId)
      return worker ? worker.name : ''
    },
    removeWorker(workerId) {
      this.order.assignedWorkers = this.order.assignedWorkers.filter(id => id !== workerId)
    },
    
    // Métodos para materiales
    addMaterial() {
      this.order.materials.push({ id: '', quantity: 1 })
    },
    removeMaterial(index) {
      this.order.materials.splice(index, 1)
    },
    isMaterialSelected(materialId, currentIndex) {
      return this.order.materials.some((mat, index) => 
        mat.id === materialId && index !== currentIndex
      )
    },
    getMaxQuantity(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId)
      return material ? material.stock : 0
    },
    getMaterialUnit(materialId) {
      const material = this.materialOptions.find(m => m.id === materialId)
      return material ? material.unit : ''
    },
    materialError(material) {
      if (material.id) {
        const selectedMat = this.materialOptions.find(m => m.id === material.id)
        if (selectedMat && material.quantity > selectedMat.stock) {
          return `Cantidad excede el stock disponible (${selectedMat.stock} ${selectedMat.unit})`
        }
      }
      return null
    },
    
    // Métodos para equipos
    isResourceDisabled(resource) {
      // Lógica para verificar disponibilidad de equipos
      return false
    }
  }
}
</script>

<style scoped>
/* Estilos del modal */
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 24px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

/* Estilos de formulario */
.form-section {
  margin-bottom: 25px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #9da6af;
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
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Estilos para trabajadores */
.workers-selection {
  display: flex;
  gap: 20px;
}

.workers-list {
  flex: 2;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.worker-item {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.worker-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
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

.worker-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.worker-checkbox input:checked ~ .checkmark {
  background-color: #42b983;
  border-color: #42b983;
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

.worker-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.worker-info {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.worker-name {
  font-weight: 500;
}

.worker-role {
  font-size: 0.8em;
  color: #666;
}

.worker-status {
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 4px;
  display: inline-block;
}

.worker-status.unavailable {
  background-color: #ffebee;
  color: #c62828;
}

.assigned-preview {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 15px;
  background-color: #f9f9f9;
}

.assigned-preview h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
}

.assigned-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assigned-badge {
  display: inline-flex;
  align-items: center;
  background-color: #e3f2fd;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85em;
}

.remove-worker-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  margin-left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.8em;
}

.remove-worker-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Estilos para equipos */
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

/* Estilos para materiales */
.materials-list {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
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
  color: #42b983;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 500;
}

.add-btn:hover {
  background-color: rgba(66, 185, 131, 0.1);
}

/* Pie del modal */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #42b983;
  color: white;
}

.btn.primary:hover {
  background-color: #3aa876;
}

.btn.secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn.secondary:hover {
  background-color: #d0d0d0;
}

/* Responsive */
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
  
  .workers-selection {
    flex-direction: column;
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
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>