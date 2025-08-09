<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Nuevo Trabajo</h3>
        <va-button class="close-btn" @click="close"   >
        ×
      </va-button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="save">
          <!-- Sección Cliente -->
          <div class="form-section">
            <h4>Datos del Cliente</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Cliente</label>
                <input 
                  v-model="formData.cliente" 
                  type="text" 
                  required
                  placeholder="Nombre del cliente"
                >
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input 
                  v-model="formData.telefono" 
                  type="tel" 
                  placeholder="Teléfono de contacto"
                >
              </div>
            </div>
          </div>

          <!-- Sección Vehículo -->
          <div class="form-section">
            <h4>Datos del Vehículo</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Marca</label>
                <input 
                  v-model="formData.marca" 
                  type="text" 
                  required
                  placeholder="Ej: Toyota"
                >
              </div>
              <div class="form-group">
                <label>Modelo</label>
                <input 
                  v-model="formData.modelo" 
                  type="text" 
                  required
                  placeholder="Ej: Corolla"
                >
              </div>
            </div>
            <div class="form-group">
              <label>Placa/Número de Serie</label>
              <input 
                v-model="formData.placa" 
                type="text" 
                placeholder="Placa o VIN"
              >
            </div>
          </div>

          <!-- Sección Trabajo -->
          <div class="form-section">
            <h4>Detalles del Trabajo</h4>
            <div class="form-group">
              <label>Tipo de Trabajo</label>
              <select v-model="formData.tipo" required>
                <option value="">Seleccione un tipo</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Reparación">Reparación</option>
                <option value="Diagnóstico">Diagnóstico</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Descripción</label>
              <textarea 
                v-model="formData.descripcion" 
                required
                placeholder="Describa el trabajo a realizar..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Técnico</label>
              <select v-model="formData.tecnico_id" required>
                <option value="">Seleccione un técnico</option>
                <option 
                  v-for="tecnico in tecnicos" 
                  :key="tecnico.id" 
                  :value="tecnico.id"
                >
                  {{ tecnico.nombre }}
                </option>
              </select>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <va-button class="btn-secondary" @click="close" color="secondary"  >
        Cancelar
      </va-button>
        <va-button class="btn-primary" @click="save" color="primary"  >
        Guardar
      </va-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewJobModal',
  props: {
    tecnicos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        cliente: '',
        telefono: '',
        marca: '',
        modelo: '',
        placa: '',
        tipo: '',
        descripcion: '',
        tecnico_id: ''
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    save() {
      if (this.validateForm()) {
        this.$emit('save', {
          ...this.formData,
          fecha: new Date().toISOString(),
          estado: 'pendiente'
        })
      }
    },
    validateForm() {
      const required = ['cliente', 'marca', 'modelo', 'tipo', 'descripcion', 'tecnico_id']
      return required.every(field => this.formData[field])
    }
  }
}
</script>
