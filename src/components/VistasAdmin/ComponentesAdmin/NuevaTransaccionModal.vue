<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Nueva Transacción</h3>
        <button class="close-btn" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="save">
          <div class="form-group">
            <label>Tipo</label>
            <select v-model="formData.tipo" class="form-control" required>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Categoría</label>
            <select v-model="formData.categoria" class="form-control" required>
              <option v-for="categoria in categorias" :key="categoria" :value="categoria">
                {{ categoria }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Fecha</label>
            <input type="date" v-model="formData.fecha" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label>Monto</label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input type="number" step="0.01" v-model="formData.monto" class="form-control" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formData.descripcion" class="form-control" rows="3" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Referencia</label>
            <input type="text" v-model="formData.referencia" class="form-control">
          </div>
          
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="formData.notas" class="form-control" rows="2"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="close">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin"></i> Creando...
              </span>
              <span v-else>
                <i class="fas fa-save"></i> Crear Transacción
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        tipo: 'ingreso',
        categoria: 'Ventas',
        fecha: new Date().toISOString().split('T')[0],
        monto: 0,
        descripcion: '',
        referencia: '',
        notas: ''
      },
      categorias: ['Ventas', 'Compras', 'Salarios', 'Servicios', 'Impuestos', 'Otros'],
      loading: false
    }
  },
  
  methods: {
    close() {
      this.$emit('close');
    },
    
    save() {
      this.loading = true;
      
      // Preparar los datos para enviar
      const transaccionData = {
        ...this.formData,
        monto: parseFloat(this.formData.monto)
      };
      
      this.$emit('save', transaccionData);
      this.loading = false;
      
      // Resetear el formulario después de guardar
      this.resetForm();
    },
    
    resetForm() {
      this.formData = {
        tipo: 'ingreso',
        categoria: 'Ventas',
        fecha: new Date().toISOString().split('T')[0],
        monto: 0,
        descripcion: '',
        referencia: '',
        notas: ''
      };
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group {
  display: flex;
}

.input-group-text {
  padding: 8px 12px;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.input-group .form-control {
  border-radius: 0 4px 4px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
  border-color: #0062cc;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}
</style>