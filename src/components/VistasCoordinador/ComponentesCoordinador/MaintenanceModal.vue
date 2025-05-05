<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h2>
            <span class="material-icons">handyman</span>
            {{ mode === 'create' ? 'Registrar Mantenimiento' : 'Editar Mantenimiento' }}
          </h2>
          <button class="close-btn" @click="close">
            <span class="material-icons">close</span>
          </button>
        </div>
  
        <div class="modal-body">
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>Equipo *</label>
                <select v-model="maintenance.equipmentId" required @change="updateEquipmentInfo">
                  <option value="">Seleccionar equipo</option>
                  <option 
                    v-for="equipment in equipments" 
                    :key="equipment.id" 
                    :value="equipment.id"
                    :disabled="equipment.status === 'in-maintenance' && mode === 'create'"
                  >
                    {{ equipment.name }} 
                    <template v-if="equipment.status === 'in-maintenance'">(En mantenimiento)</template>
                  </option>
                </select>
              </div>
  
              <div class="form-group">
                <label>Tipo de Mantenimiento *</label>
                <select v-model="maintenance.type" required>
                  <option value="preventive">Preventivo</option>
                  <option value="corrective">Correctivo</option>
                  <option value="predictive">Predictivo</option>
                </select>
              </div>
            </div>
  
            <div class="form-row">
              <div class="form-group">
                <label>Fecha Programada *</label>
                <input 
                  type="date" 
                  v-model="maintenance.scheduledDate" 
                  :min="minDate"
                  required
                >
              </div>
  
              <div class="form-group">
                <label>Prioridad *</label>
                <select v-model="maintenance.priority" required>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>
  
            <div class="form-group">
              <label>Responsable *</label>
              <select v-model="maintenance.assignedTo" required>
                <option value="">Seleccionar técnico</option>
                <option 
                  v-for="technician in technicians" 
                  :key="technician.id" 
                  :value="technician.id"
                >
                  {{ technician.name }} ({{ technician.specialty }})
                </option>
              </select>
            </div>
  
            <div class="form-group">
              <label>Descripción del Problema/Actividad *</label>
              <textarea 
                v-model="maintenance.description" 
                rows="3" 
                required
                placeholder="Describa el problema o las actividades de mantenimiento a realizar"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>Procedimiento a Seguir</label>
              <textarea 
                v-model="maintenance.procedure" 
                rows="3" 
                placeholder="Describa el procedimiento técnico a seguir"
              ></textarea>
            </div>
  
            <div class="form-row">
              <div class="form-group">
                <label>Duración Estimada (horas) *</label>
                <input 
                  type="number" 
                  v-model="maintenance.estimatedDuration" 
                  min="1" 
                  max="24" 
                  required
                >
              </div>
  
              <div class="form-group">
                <label>Estado</label>
                <select v-model="maintenance.status" :disabled="mode === 'create'">
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En Progreso</option>
                  <option value="completed">Completado</option>
                  <option value="delayed">Retrasado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
  
            <div v-if="maintenance.status === 'completed'" class="form-group">
              <label>Fecha Real de Ejecución</label>
              <input 
                type="date" 
                v-model="maintenance.actualDate" 
                :max="today"
              >
            </div>
  
            <div v-if="maintenance.status === 'completed'" class="form-group">
              <label>Duración Real (horas)</label>
              <input 
                type="number" 
                v-model="maintenance.actualDuration" 
                min="1" 
                max="24"
              >
            </div>
  
            <div v-if="maintenance.status === 'completed'" class="form-group">
              <label>Resultados y Observaciones</label>
              <textarea 
                v-model="maintenance.results" 
                rows="3" 
                placeholder="Describa los resultados del mantenimiento y cualquier observación relevante"
              ></textarea>
            </div>
  
            <div class="form-group">
              <label>Partes/Repuestos Utilizados</label>
              <div class="parts-list">
                <div class="part-item" v-for="(part, index) in maintenance.partsUsed" :key="index">
                  <div class="part-row">
                    <select v-model="part.id" class="part-select">
                      <option value="">Seleccionar repuesto</option>
                      <option 
                        v-for="p in partsInventory" 
                        :key="p.id" 
                        :value="p.id"
                        :disabled="isPartUnavailable(p.id, index)"
                      >
                        {{ p.name }} (Stock: {{ p.quantity }})
                      </option>
                    </select>
  
                    <input 
                      type="number" 
                      v-model="part.quantity" 
                      min="1" 
                      :max="getMaxPartQuantity(part.id)"
                      placeholder="Cantidad"
                      class="quantity-input"
                    >
  
                    <button class="remove-btn" @click="removePart(index)">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
  
                  <div v-if="partError(part)" class="error-message">
                    {{ partError(part) }}
                  </div>
                </div>
  
                <button class="add-btn" @click="addPart">
                  <span class="material-icons">add</span> Agregar Repuesto
                </button>
              </div>
            </div>
          </div>
  
          <div class="equipment-info" v-if="selectedEquipment">
            <h3 class="section-title">
              <span class="material-icons">info</span> Información del Equipo
            </h3>
  
            <div class="info-grid">
              <div class="info-item">
                <label>Modelo:</label>
                <span>{{ selectedEquipment.model || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Serial:</label>
                <span>{{ selectedEquipment.serial || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <label>Horas de Uso:</label>
                <span>{{ selectedEquipment.usageHours || '0' }} hrs</span>
              </div>
              <div class="info-item">
                <label>Último Mantenimiento:</label>
                <span>{{ selectedEquipment.lastMaintenance || 'Nunca' }}</span>
              </div>
              <div class="info-item full-width">
                <label>Notas:</label>
                <span>{{ selectedEquipment.notes || 'No hay notas registradas' }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <div class="modal-footer">
          <button class="btn secondary" @click="close">
            Cancelar
          </button>
          <button class="btn primary" @click="saveMaintenance">
            {{ mode === 'create' ? 'Registrar Mantenimiento' : 'Guardar Cambios' }}
          </button>
        </div>
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
      mode: {
        type: String,
        default: 'create',
        validator: value => ['create', 'edit'].includes(value)
      }
    },
    data() {
      return {
        equipments: [
          {
            id: 1,
            name: 'Máquina CNC',
            model: 'CNC-3000',
            serial: 'SN-2021-001',
            type: 'Maquinaria',
            usageHours: 1245,
            lastMaintenance: '15/03/2023',
            status: 'operational',
            notes: 'Requiere lubricación cada 200 horas de uso'
          },
          {
            id: 2,
            name: 'Equipo de Soldadura',
            model: 'WELD-MAX',
            serial: 'SN-2020-045',
            type: 'Equipo',
            usageHours: 890,
            lastMaintenance: '22/02/2023',
            status: 'operational',
            notes: 'Revisar cables de alimentación'
          },
          {
            id: 3,
            name: 'Horno Industrial',
            model: 'FURN-500',
            serial: 'SN-2022-012',
            type: 'Maquinaria',
            usageHours: 560,
            lastMaintenance: '10/01/2023',
            status: 'in-maintenance',
            notes: 'En espera de repuestos'
          }
        ],
        technicians: [
          { id: 1, name: 'Juan Pérez', specialty: 'Mecánica' },
          { id: 2, name: 'María Gómez', specialty: 'Electrónica' },
          { id: 3, name: 'Carlos Rojas', specialty: 'Sistemas' }
        ],
        partsInventory: [
          { id: 1, name: 'Rodamientos', quantity: 12 },
          { id: 2, name: 'Correas', quantity: 8 },
          { id: 3, name: 'Filtros', quantity: 5 },
          { id: 4, name: 'Sensores', quantity: 3 }
        ],
        today: new Date().toISOString().split('T')[0],
        minDate: new Date().toISOString().split('T')[0]
      };
    },
    computed: {
      selectedEquipment() {
        return this.equipments.find(e => e.id === this.maintenance.equipmentId);
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      saveMaintenance() {
        if (this.validateForm()) {
          this.$emit('save', this.maintenance);
        }
      },
      validateForm() {
        // Validación básica - implementar validación completa según necesidades
        if (!this.maintenance.equipmentId || 
            !this.maintenance.type || 
            !this.maintenance.scheduledDate || 
            !this.maintenance.priority || 
            !this.maintenance.assignedTo || 
            !this.maintenance.description || 
            !this.maintenance.estimatedDuration) {
          alert('Por favor complete todos los campos requeridos');
          return false;
        }
  
        // Validar repuestos
        for (const part of this.maintenance.partsUsed) {
          if (part.id && part.quantity > this.getMaxPartQuantity(part.id)) {
            alert(`La cantidad para ${this.getPartName(part.id)} excede el stock disponible`);
            return false;
          }
        }
  
        return true;
      },
      updateEquipmentInfo() {
        if (this.selectedEquipment) {
          this.maintenance.equipmentName = this.selectedEquipment.name;
          this.maintenance.equipmentType = this.selectedEquipment.type;
        }
      },
      addPart() {
        this.maintenance.partsUsed.push({ id: '', quantity: 1 });
      },
      removePart(index) {
        this.maintenance.partsUsed.splice(index, 1);
      },
      isPartUnavailable(partId, currentIndex) {
        return this.maintenance.partsUsed.some((part, index) => 
          part.id === partId && index !== currentIndex
        );
      },
      getMaxPartQuantity(partId) {
        const part = this.partsInventory.find(p => p.id === partId);
        return part ? part.quantity : 0;
      },
      getPartName(partId) {
        const part = this.partsInventory.find(p => p.id === partId);
        return part ? part.name : 'Repuesto';
      },
      partError(part) {
        if (part.id) {
          const selectedPart = this.partsInventory.find(p => p.id === part.id);
          if (selectedPart && part.quantity > selectedPart.quantity) {
            return `Cantidad excede el stock disponible (${selectedPart.quantity})`;
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
    display: flex;
    align-items: center;
    gap: 10px;
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
  
  .parts-list {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
  }
  
  .dark-mode .parts-list {
    border-color: #333;
  }
  
  .part-item {
    margin-bottom: 15px;
  }
  
  .part-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  
  .part-select {
    flex: 2;
    min-width: 0;
  }
  
  .quantity-input {
    width: 80px;
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
    margin-left: 10px;
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
  
  .equipment-info {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
  }
  
  .dark-mode .equipment-info {
    background-color: #2d2d2d;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
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
  
  .info-item.full-width {
    grid-column: 1 / -1;
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
    
    .part-row {
      flex-wrap: wrap;
    }
    
    .part-select {
      width: 100%;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
      padding: 15px;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
    }
  }
  </style>