<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ editing ? 'Editar' : 'Nuevo' }} Pedido</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="save">
          <!-- Sección Básica -->
          <div class="form-section">
            <h4>Información Básica</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Código Pedido</label>
                <input 
                  v-model="formData.codigo_pedido" 
                  type="text" 
                  required
                  placeholder="Código único del pedido"
                  :disabled="editing"
                >
              </div>
              <div class="form-group">
                <label>Tipo de Pedido</label>
                <select v-model="formData.tipo_pedido_id" required>
                  <option value="">Seleccione tipo</option>
                  <option 
                    v-for="tipo in tiposPedido" 
                    :key="tipo.id" 
                    :value="tipo.id"
                  >
                    {{ tipo.nombre }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Fecha Requerida</label>
                <input 
                  v-model="formData.fecha_requerida" 
                  type="date" 
                  required
                >
              </div>
              <div class="form-group">
                <label>Prioridad</label>
                <select v-model="formData.prioridad" required>
                  <option value="1">Alta</option>
                  <option value="2">Media</option>
                  <option value="3">Baja</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sección Asignaciones -->
          <div class="form-section">
            <h4>Asignaciones</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Solicitante</label>
                <select v-model="formData.solicitante_id" required>
                  <option value="">Seleccione solicitante</option>
                  <option 
                    v-for="usuario in usuarios" 
                    :key="usuario.id" 
                    :value="usuario.id"
                  >
                    {{ usuario.nombre }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Supervisor</label>
                <select v-model="formData.supervisor_id">
                  <option value="">Seleccione supervisor</option>
                  <option 
                    v-for="usuario in usuarios" 
                    :key="usuario.id" 
                    :value="usuario.id"
                  >
                    {{ usuario.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sección Plano -->
          <div class="form-section">
            <h4>Información del Plano</h4>
            <div class="form-group">
              <label>Plano</label>
              <select v-model="formData.plano_id" required>
                <option value="">Seleccione plano</option>
                <option 
                  v-for="plano in planos" 
                  :key="plano.id" 
                  :value="plano.id"
                >
                  {{ plano.codigo }} - {{ plano.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Sección Financiera -->
          <div class="form-section">
            <h4>Información Financiera</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Costo Estimado</label>
                <input 
                  v-model="formData.costo_estimado" 
                  type="number" 
                  step="0.01"
                  min="0"
                >
              </div>
              <div class="form-group">
                <label>Precio Final</label>
                <input 
                  v-model="formData.precio_final" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                >
              </div>
            </div>
          </div>

          <!-- Sección Adicional -->
          <div class="form-section">
            <h4>Información Adicional</h4>
            <div class="form-group">
              <label>Proyecto Asociado</label>
              <input 
                v-model="formData.proyecto_asociado" 
                type="text" 
                placeholder="Nombre del proyecto"
              >
            </div>
            <div class="form-group">
              <label>Notas</label>
              <textarea 
                v-model="formData.notas" 
                placeholder="Notas adicionales..."
              ></textarea>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Cancelar</button>
        <button class="btn-primary" @click="save">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PedidoModal',
  props: {
    pedidoData: {
      type: Object,
      default: null
    },
    tiposPedido: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    },
    planos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        codigo_pedido: '',
        tipo_pedido_id: '',
        plano_id: '',
        solicitante_id: '',
        aprobador_id: null,
        supervisor_id: null,
        fecha_solicitud: new Date().toISOString().split('T')[0],
        fecha_requerida: '',
        fecha_estimada_entrega: null,
        estado_id: 1, // Estado inicial (pendiente)
        prioridad: 3,
        proyecto_asociado: '',
        costo_estimado: null,
        precio_final: 0,
        notas: ''
      },
      editing: false
    }
  },
  created() {
    if (this.pedidoData) {
      this.formData = { ...this.pedidoData };
      this.editing = true;
    } else {
      // Generar código único para nuevo pedido
      this.formData.codigo_pedido = 'PED-' + Date.now().toString().slice(-6);
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    async save() {
      if (this.validateForm()) {
        try {
          // Asegurar que los números sean correctos
          this.formData.costo_estimado = this.formData.costo_estimado ? 
            parseFloat(this.formData.costo_estimado) : null;
          this.formData.precio_final = parseFloat(this.formData.precio_final);
          
          this.$emit('save', this.formData);
        } catch (error) {
          console.error('Error al guardar:', error);
          this.$emit('error', error);
        }
      }
    },
    validateForm() {
      const required = [
        'codigo_pedido',
        'tipo_pedido_id',
        'plano_id',
        'solicitante_id',
        'fecha_requerida',
        'precio_final'
      ];
      
      return required.every(field => {
        const isValid = !!this.formData[field];
        if (!isValid) {
          console.error(`Campo requerido faltante: ${field}`);
        }
        return isValid;
      });
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
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section h4 {
  margin-bottom: 15px;
  color: #333;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #777;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .modal-container {
    width: 95%;
  }
}
</style>