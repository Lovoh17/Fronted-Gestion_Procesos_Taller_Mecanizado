<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <va-button class="close-btn" @click="close"   >
        ×
      </va-button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="save">
          <!-- Información básica -->
          <div class="form-row">
            <div class="form-group">
              <label>Orden #</label>
              <input 
                v-model="formData.orden" 
                type="text" 
                disabled
              >
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select 
                v-model="formData.estado" 
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>
          </div>

          <!-- Datos del cliente -->
          <div class="form-row">
            <div class="form-group">
              <label>Cliente</label>
              <input 
                v-model="formData.cliente" 
                type="text" 
                required
              >
            </div>
            <div class="form-group">
              <label>Vehículo</label>
              <input 
                v-model="formData.vehiculo" 
                type="text" 
                required
              >
            </div>
          </div>

          <!-- Detalles del trabajo -->
          <div class="form-group">
            <label>Tipo de Trabajo</label>
            <input 
              v-model="formData.tipo" 
              type="text" 
              required
            >
          </div>

          <!-- Asignación y fechas -->
          <div class="form-row">
            <div class="form-group">
              <label>Técnico</label>
              <select 
                v-model="formData.tecnico_id" 
                required
              >
                <option 
                  v-for="tecnico in tecnicos" 
                  :key="tecnico.id" 
                  :value="tecnico.id"
                >
                  {{ tecnico.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha Inicio</label>
              <input 
                v-model="formData.fecha_inicio" 
                type="date" 
                required
              >
            </div>
          </div>

          <!-- Fecha finalización (condicional) -->
          <div class="form-row" v-if="showFechaFin">
            <div class="form-group">
              <label>Fecha Finalización</label>
              <input 
                v-model="formData.fecha_fin" 
                type="date" 
                :required="showFechaFin"
              >
            </div>
          </div>

          <!-- Descripciones -->
          <div class="form-group">
            <label>Detalles</label>
            <textarea 
              v-model="formData.detalles" 
              rows="4"
            ></textarea>
          </div>

          <!-- Observaciones (condicional) -->
          <div class="form-group" v-if="showFechaFin">
            <label>Observaciones</label>
            <textarea 
              v-model="formData.observaciones" 
              rows="3"
            ></textarea>
          </div>

          <!-- Urgencia -->
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="formData.urgente"
              >
              Trabajo Urgente
            </label>
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
  name: 'WorkOrderModal',
  props: {
    trabajo: {
      type: Object,
      default: null
    },
    tecnicos: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      formData: this.getDefaultFormData()
    }
  },
  
  computed: {
    modalTitle() {
      return this.formData.id ? 'Editar Trabajo' : 'Nuevo Trabajo'
    },
    showFechaFin() {
      return ['completado', 'entregado'].includes(this.formData.estado)
    }
  },
  
  watch: {
    trabajo: {
      immediate: true,
      handler(newVal) {
        this.formData = newVal ? { 
          ...this.getDefaultFormData(),
          ...newVal
        } : this.getDefaultFormData()
      }
    }
  },
  
  methods: {
    getDefaultFormData() {
      return {
        id: null,
        orden: '',
        cliente: '',
        vehiculo: '',
        tipo: '',
        tecnico_id: this.tecnicos[0]?.id || null,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        estado: 'pendiente',
        detalles: '',
        observaciones: '',
        urgente: false
      }
    },
    
    close() {
      this.$emit('close')
    },
    
    save() {
      if (!this.validateForm()) return
      
      const trabajoData = { ...this.formData }
      
      if (this.showFechaFin && !trabajoData.fecha_fin) {
        trabajoData.fecha_fin = new Date().toISOString().split('T')[0]
      }
      
      this.$emit('save', trabajoData)
    },
    
    validateForm() {
      const requiredFields = [
        { field: 'cliente', message: 'El cliente es requerido' },
        { field: 'vehiculo', message: 'El vehículo es requerido' },
        { field: 'tipo', message: 'El tipo de trabajo es requerido' },
        { field: 'tecnico_id', message: 'Debe asignar un técnico' }
      ]
      
      for (const { field, message } of requiredFields) {
        if (!this.formData[field]) {
          alert(message)
          return false
        }
      }
      
      if (this.showFechaFin && !this.formData.fecha_fin) {
        alert('La fecha de finalización es requerida')
        return false
      }
      
      return true
    }
  }
}
</script>