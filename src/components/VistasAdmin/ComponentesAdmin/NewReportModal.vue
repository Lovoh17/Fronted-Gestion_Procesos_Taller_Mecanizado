<template>
  <VaModal :model-value="true" :title="isEditing ? 'Editar Alerta de Reparación' : 'Nueva Alerta de Reparación'"
    size="large" :close-button="false" :no-outside-dismiss="saving" hide-default-actions @close="closeModal"
    :z-index="10000" :backdrop-z-index="9999">
    <form @submit.prevent="submitForm">
      <div class="alert-form">
        <!-- Información de la Alerta -->
        <VaCardTitle>Información de la Alerta</VaCardTitle>
        <VaCardContent>

          <!-- Herramienta y Tipo de Alerta -->
          <div class="form-row">
            <VaSelect v-model="form.herramienta_id" label="Herramienta *" :options="herramientaOptions" value-by="id"
              text-by="label" placeholder="Seleccionar herramienta..." :error="!!errors.herramienta_id"
              :error-messages="errors.herramienta_id" searchable class="form-field" required />

            <VaSelect v-model="form.tipo_alerta_id" label="Tipo de Alerta *" :options="tipoAlertaOptions" value-by="id"
              text-by="label" placeholder="Seleccionar tipo de alerta..." :error="!!errors.tipo_alerta_id"
              :error-messages="errors.tipo_alerta_id" class="form-field" required />
          </div>

          <!-- Descripción -->
          <VaTextarea v-model="form.descripcion" label="Descripción *"
            placeholder="Describe detalladamente el problema o situación que requiere atención..." :min-rows="3"
            :max-rows="6" :error="!!errors.descripcion" :error-messages="errors.descripcion" class="mb-4" required />

          <!-- Prioridad y Fecha Límite -->
          <div class="form-row">
            <div class="form-field">
              <label class="va-input-label">Prioridad *</label>
              <div class="priority-grid">
                <VaRadio v-for="prioridad in prioridadOptions" :key="prioridad.value" v-model="form.prioridad_id"
                  :option="prioridad.value" name="prioridad" class="priority-radio">
                  <template #default>
                    <span :class="['priority-badge', prioridad.class]">
                      {{ prioridad.label }}
                    </span>
                  </template>
                </VaRadio>
              </div>
              <div v-if="errors.prioridad_id" class="va-input-message va-input-message--error">
                {{ errors.prioridad_id }}
              </div>
            </div>

            <VaDateInput v-model="form.fecha_limite" label="Fecha Límite *" placeholder="Seleccionar fecha límite..."
              :error="!!errors.fecha_limite" :error-messages="errors.fecha_limite" :min-date="new Date()"
              format="dd/mm/yyyy" class="form-field" required />
          </div>

          <!-- Estado (solo en edición) -->
          <div v-if="isEditing" class="form-row">
            <VaSelect v-model="form.estado_reparacion" label="Estado de Reparación" :options="estadoOptions"
              value-by="value" text-by="label" placeholder="Seleccionar estado..." class="form-field" />

            <!-- Campo vacío para mantener el grid -->
            <div class="form-field"></div>
          </div>

          <!-- Observaciones de resolución (solo si está resuelto) -->
          <VaTextarea v-if="isEditing && form.estado_reparacion === '5'" v-model="form.observaciones_resolucion"
            label="Observaciones de Resolución" placeholder="Detalles sobre cómo se resolvió la alerta..." :min-rows="2"
            :max-rows="4" class="mb-4" />

        </VaCardContent>

        <!-- Información adicional (solo en edición) -->
        <VaCardTitle v-if="isEditing">Información del Sistema</VaCardTitle>
        <VaCardContent v-if="isEditing">
          <div class="form-row">
            <VaInput :model-value="formatDate(form.fecha_generacion)" label="Fecha de Generación" readonly
              class="form-field" />

            <VaInput v-if="form.fecha_resolucion" :model-value="formatDate(form.fecha_resolucion)"
              label="Fecha de Resolución" readonly class="form-field" />
          </div>

          <div v-if="form.resuelta_por" class="form-row">
            <VaInput :model-value="getUsuarioNombre(form.resuelta_por)" label="Resuelta por" readonly
              class="form-field" />

            <!-- Campo vacío para mantener el grid -->
            <div class="form-field"></div>
          </div>
        </VaCardContent>
      </div>
    </form>

    <template #footer>
      <div class="form-actions">
        <VaButton preset="secondary" @click="closeModal" :disabled="saving">
          Cancelar
        </VaButton>
        <VaButton @click="submitForm" :disabled="saving || !isFormValid" :loading="saving">
          {{ isEditing ? 'Actualizar' : 'Crear' }} Alerta
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
import api from '@/api.js'

export default {
  name: 'NewAlertModal',
  props: {
    herramientas: {
      type: Array,
      default: () => []
    },
    tiposAlertas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    },
    alertData: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      saving: false,
      errors: {},
      form: {
        herramienta_id: '',
        tipo_alerta_id: '',
        descripcion: '',
        prioridad_id: '3', // Prioridad media por defecto
        fecha_limite: '',
        estado_reparacion: '1', // Pendiente por defecto
        fecha_generacion: null,
        fecha_resolucion: null,
        resuelta_por: null,
        observaciones_resolucion: ''
      }
    }
  },

  computed: {
    isEditing() {
      return !!this.alertData
    },

    isFormValid() {
      return this.form.herramienta_id &&
        this.form.tipo_alerta_id &&
        this.form.descripcion &&
        this.form.prioridad_id &&
        this.form.fecha_limite
    },

    herramientaOptions() {
      return this.herramientas.map(herramienta => ({
        id: herramienta.id,
        label: `${herramienta.nombre} ${herramienta.codigo ? '- ' + herramienta.codigo : ''}`
      }))
    },

    tipoAlertaOptions() {
      return this.tiposAlertas.map(tipo => ({
        id: tipo.id,
        label: tipo.nombre_alertas
      }))
    },

    prioridadOptions() {
      return [
        { value: '1', label: 'Muy Baja', class: 'muy-baja' },
        { value: '2', label: 'Baja', class: 'baja' },
        { value: '3', label: 'Media', class: 'media' },
        { value: '4', label: 'Alta', class: 'alta' },
        { value: '5', label: 'Muy Alta', class: 'muy-alta' },
        { value: '6', label: 'Crítica', class: 'critica' }
      ]
    },

    estadoOptions() {
      return [
        { value: '1', label: 'Pendiente' },
        { value: '2', label: 'En Progreso' },
        { value: '3', label: 'En Revisión' },
        { value: '4', label: 'Pausado' },
        { value: '5', label: 'Resuelto' }
      ]
    }
  },

  watch: {
    'form.estado_reparacion'(newValue, oldValue) {
      // Si se marca como resuelto y antes no estaba resuelto
      if (newValue === '5' && oldValue !== '5') {
        this.form.fecha_resolucion = new Date().toISOString().split('T')[0]
        this.form.resuelta_por = this.getCurrentUserId()
      }
      // Si se desmarca como resuelto
      else if (newValue !== '5' && oldValue === '5') {
        this.form.fecha_resolucion = null
        this.form.resuelta_por = null
        this.form.observaciones_resolucion = ''
      }
    }
  },

  mounted() {
    if (this.isEditing) {
      this.loadAlertData()
    }
  },

  methods: {
    loadAlertData() {
      if (this.alertData) {
        this.form = {
          ...this.form,
          ...this.alertData,
          fecha_limite: this.alertData.fecha_limite ? new Date(this.alertData.fecha_limite) : '',
          fecha_generacion: this.alertData.fecha_generacion,
          fecha_resolucion: this.alertData.fecha_resolucion,
          resuelta_por: this.alertData.resuelta_por
        }
      }
    },

    closeModal() {
      this.$emit('close')
    },

    validateForm() {
      this.errors = {}

      if (!this.form.herramienta_id) {
        this.errors.herramienta_id = 'La herramienta es requerida'
      }

      if (!this.form.tipo_alerta_id) {
        this.errors.tipo_alerta_id = 'El tipo de alerta es requerido'
      }

      if (!this.form.descripcion || this.form.descripcion.trim().length < 10) {
        this.errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
      }

      if (!this.form.prioridad_id) {
        this.errors.prioridad_id = 'La prioridad es requerida'
      }

      if (!this.form.fecha_limite) {
        this.errors.fecha_limite = 'La fecha límite es requerida'
      } else {
        const fechaLimite = new Date(this.form.fecha_limite)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        if (fechaLimite < hoy) {
          this.errors.fecha_limite = 'La fecha límite no puede ser anterior a hoy'
        }
      }

      return Object.keys(this.errors).length === 0
    },

    async submitForm() {
      if (!this.validateForm()) {
        this.showToast('Por favor corrija los errores en el formulario', 'warning')
        return
      }

      try {
        this.saving = true

        // Preparar los datos para envío
        const alertData = {
          ...this.form,
          fecha_limite: this.form.fecha_limite ?
            (typeof this.form.fecha_limite === 'string' ? this.form.fecha_limite :
              this.form.fecha_limite.toISOString().split('T')[0]) : null,
          fecha_generacion: this.isEditing ? this.form.fecha_generacion :
            new Date().toISOString().split('T')[0]
        }

        // Emitir evento de guardado
        this.$emit('save', {
          data: alertData,
          isEditing: this.isEditing
        })

      } catch (error) {
        console.error('Error al procesar la alerta:', error)
        this.showToast('Error al procesar los datos de la alerta', 'danger')
      } finally {
        this.saving = false
      }
    },

    getCurrentUserId() {
      // Obtener el ID del usuario actual desde el store, localStorage o API
      // Por ahora retornamos 1, deberás implementar según tu sistema de autenticación
      return 1
    },

    getUsuarioNombre(id) {
      if (!id) return '-'
      const usuario = this.usuarios.find(u => u.id === id)
      return usuario ? `${usuario.nombre} ${usuario.apellido}` : `Usuario ${id}`
    },

    formatDate(date) {
      if (!date) return ''
      try {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return date
      }
    },

    showToast(message, color = 'info') {
      // Verificar si $va está disponible
      if (this.$va && this.$va.toast) {
        this.$va.toast({
          message,
          color
        })
      } else {
        // Fallback a console.log si $va no está disponible
        console.log(`[${color.toUpperCase()}] ${message}`)
      }
    }
  }
}
</script>

<style scoped>
.alert-form {
  max-width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  width: 100%;
}

.priority-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.priority-radio {
  margin: 0;
}

.priority-badge {
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
  display: block;
  cursor: pointer;
  border: 2px solid transparent;
}

.priority-badge.muy-baja {
  background: #f0f9ff;
  color: #0369a1;
  border-color: #bae6fd;
}

.priority-badge.baja {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.priority-badge.media {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.priority-badge.alta {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
}

.priority-badge.muy-alta {
  background: #fdf2f8;
  color: #be185d;
  border-color: #f9a8d4;
}

.priority-badge.critica {
  background: #1f2937;
  color: #f9fafb;
  border-color: #6b7280;
}

.priority-radio input[type="radio"]:checked+.priority-badge {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.priority-radio input[type="radio"]:checked+.priority-badge.muy-baja {
  border-color: #0369a1;
  background: #0369a1;
  color: white;
}

.priority-radio input[type="radio"]:checked+.priority-badge.baja {
  border-color: #065f46;
  background: #065f46;
  color: white;
}

.priority-radio input[type="radio"]:checked+.priority-badge.media {
  border-color: #92400e;
  background: #92400e;
  color: white;
}

.priority-radio input[type="radio"]:checked+.priority-badge.alta {
  border-color: #b91c1c;
  background: #b91c1c;
  color: white;
}

.priority-radio input[type="radio"]:checked+.priority-badge.muy-alta {
  border-color: #be185d;
  background: #be185d;
  color: white;
}

.priority-radio input[type="radio"]:checked+.priority-badge.critica {
  border-color: #000;
  background: #000;
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.va-input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--va-text-primary);
}

.va-input-message {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.va-input-message--error {
  color: var(--va-danger);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .priority-grid {
    grid-template-columns: 1fr;
  }
}
</style>