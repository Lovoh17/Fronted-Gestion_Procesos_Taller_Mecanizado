<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Nuevo Reporte</h3>
        <va-button class="btn-close" @click="closeModal"   >
        ×
      </va-button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <!-- Campos básicos -->
          <div class="form-group">
            <label>Tipo de Reporte</label>
            <select v-model="form.type" class="form-control" required>
              <option value="">Seleccionar tipo...</option>
              <option value="materiales">Materiales</option>
              <option value="herramientas">Herramientas</option>
              <option value="incidentes">Incidentes</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Título</label>
            <input v-model="form.title" type="text" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" class="form-control" rows="4" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Prioridad</label>
            <div class="priority-options">
              <label class="priority-option">
                <input type="radio" v-model="form.priority" value="high" required>
                <span class="priority-badge high">Alta</span>
              </label>
              <label class="priority-option">
                <input type="radio" v-model="form.priority" value="medium">
                <span class="priority-badge medium">Media</span>
              </label>
              <label class="priority-option">
                <input type="radio" v-model="form.priority" value="low">
                <span class="priority-badge low">Baja</span>
              </label>
            </div>
          </div>
          
          <!-- Campos específicos dinámicos -->
          <div v-if="form.type === 'materiales'" class="specific-fields">
            <div class="form-group">
              <label>Material faltante</label>
              <input v-model="form.material" type="text" class="form-control" required>
            </div>
          </div>
          
          <div v-else-if="form.type === 'herramientas'" class="specific-fields">
            <div class="form-group">
              <label>Herramienta</label>
              <input v-model="form.tool" type="text" class="form-control" required>
            </div>
          </div>
          
          <div v-else-if="form.type === 'incidentes'" class="specific-fields">
            <div class="form-group">
              <label>Tipo de incidente</label>
              <select v-model="form.incidentType" class="form-control" required>
                <option value="">Seleccionar...</option>
                <option value="seguridad">Seguridad</option>
                <option value="salud">Salud</option>
              </select>
            </div>
          </div>
          
          <!-- Acciones del formulario -->
          <div class="form-actions">
            <va-button type="submit" class="btn btn-primary" color="primary"  >
        Guardar Reporte
      </va-button>
            <va-button type="button" class="btn btn-secondary" @click="closeModal" color="secondary"  >
        Cancelar
      </va-button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewReportModal',
  data() {
    return {
      form: {
        type: '',
        title: '',
        description: '',
        priority: 'medium',
        material: '',
        tool: '',
        incidentType: ''
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    submitForm() {
      this.$emit('save', {
        ...this.form,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      })
    }
  }
}
</script>