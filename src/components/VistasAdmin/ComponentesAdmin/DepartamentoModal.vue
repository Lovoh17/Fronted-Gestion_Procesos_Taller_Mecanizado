<template>
  <VaModal 
    :model-value="true" 
    :title="isEditing ? 'Editar Departamento' : 'Nuevo Departamento'" 
    size="large"
    :close-button="!loading" 
    :no-outside-dismiss="loading" 
    hide-default-actions 
    @close="closeModal"
  >
    <form @submit.prevent="submitForm">
      <div class="department-form">
        <!-- Información Principal -->
          <VaCardContent>
            <div class="form-row">
              <VaInput 
                v-model="form.codigo" 
                label="Código *" 
                placeholder="Ej: TEC, ADM, PROD"
                :error="!!errors.codigo"
                :error-messages="errors.codigo"
                class="form-field"
                maxlength="10"
                required 
              />
              
              <VaInput 
                v-model="form.nombre" 
                label="Nombre *" 
                placeholder="Nombre del departamento"
                :error="!!errors.nombre"
                :error-messages="errors.nombre"
                class="form-field"
                required 
              />
            </div>
            
            <div class="form-row">
              <VaInput 
                v-model="form.responsable" 
                label="Responsable *" 
                placeholder="Nombre del responsable"
                :error="!!errors.responsable"
                :error-messages="errors.responsable"
                class="form-field"
                required 
              />
              
              <VaSelect 
                v-model="form.estado" 
                label="Estado *"
                :options="estadoOptions"
                class="form-field"
                required
              />
            </div>
            
            <VaTextarea 
              v-model="form.descripcion" 
              label="Descripción" 
              placeholder="Descripción del departamento (opcional)"
              :error="!!errors.descripcion"
              :error-messages="errors.descripcion"
              :min-rows="3"
              :max-rows="6"
            />
          </VaCardContent>

        <!-- Información Adicional -->
        <VaCard class="form-section" v-if="isEditing">
          <VaCardTitle>Información Adicional</VaCardTitle>
          <VaCardContent>
            <div class="form-row info-row">
              <div class="info-item">
                <VaIcon name="calendar_today" color="primary" />
                <div class="info-content">
                  <span class="info-label">Fecha de Creación:</span>
                  <span class="info-value">{{ formatDate(departamento.created_at) }}</span>
                </div>
              </div>
              
              <div class="info-item" v-if="departamento.updated_at">
                <VaIcon name="update" color="info" />
                <div class="info-content">
                  <span class="info-label">Última Actualización:</span>
                  <span class="info-value">{{ formatDate(departamento.updated_at) }}</span>
                </div>
              </div>
            </div>
          </VaCardContent>
        </VaCard>
      </div>
    </form>

    <template #footer>
      <div class="form-actions">
        <VaButton preset="secondary" @click="closeModal" :disabled="loading">
          <VaIcon name="close" class="mr-1" />
          Cancelar
        </VaButton>
        
        <VaButton 
          @click="submitForm" 
          :disabled="loading || !isFormValid" 
          :loading="loading" 
          color="primary"
        >
          <VaIcon :name="isEditing ? 'edit' : 'add'" class="mr-1" />
          {{ isEditing ? 'Actualizar' : 'Crear' }} Departamento
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  departamento: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// Data
const form = ref({
  codigo: '',
  nombre: '',
  responsable: '',
  estado: 'activo',
  descripcion: ''
})

const errors = ref({})

// Options para el select de estado
const estadoOptions = [
  { text: 'Activo', value: 'activo' },
  { text: 'Inactivo', value: 'inactivo' }
]

// Computed
const isEditing = computed(() => {
  return props.departamento && props.departamento.id
})

const isFormValid = computed(() => {
  return form.value.codigo.trim() &&
         form.value.nombre.trim() &&
         form.value.responsable.trim() &&
         form.value.estado
})

// Watchers
watch(() => props.departamento, (newDepartamento) => {
  if (newDepartamento && newDepartamento.id) {
    // Cargar datos para edición
    form.value = {
      codigo: newDepartamento.codigo || '',
      nombre: newDepartamento.nombre || '',
      responsable: newDepartamento.responsable || '',
      estado: newDepartamento.estado || 'activo',
      descripcion: newDepartamento.descripcion || ''
    }
  } else {
    // Resetear formulario para nuevo departamento
    resetForm()
  }
}, { immediate: true })

// Methods
const validateForm = () => {
  errors.value = {}

  // Validar código
  if (!form.value.codigo.trim()) {
    errors.value.codigo = 'El código es requerido'
  } else if (form.value.codigo.length > 10) {
    errors.value.codigo = 'El código no puede exceder 10 caracteres'
  } else if (!/^[A-Z0-9]+$/.test(form.value.codigo.trim())) {
    errors.value.codigo = 'El código solo debe contener letras mayúsculas y números'
  }

  // Validar nombre
  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es requerido'
  } else if (form.value.nombre.length > 100) {
    errors.value.nombre = 'El nombre no puede exceder 100 caracteres'
  }

  // Validar responsable
  if (!form.value.responsable.trim()) {
    errors.value.responsable = 'El responsable es requerido'
  } else if (form.value.responsable.length > 100) {
    errors.value.responsable = 'El nombre del responsable no puede exceder 100 caracteres'
  }

  // Validar descripción (opcional pero con límite)
  if (form.value.descripcion && form.value.descripcion.length > 500) {
    errors.value.descripcion = 'La descripción no puede exceder 500 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (!validateForm()) {
    return
  }

  const departamentoData = {
    codigo: form.value.codigo.trim().toUpperCase(),
    nombre: form.value.nombre.trim(),
    responsable: form.value.responsable.trim(),
    estado: form.value.estado,
    descripcion: form.value.descripcion.trim() || null
  }

  // Agregar ID si estamos editando
  if (isEditing.value) {
    departamentoData.id = props.departamento.id
  }

  emit('save', departamentoData)
}

const closeModal = () => {
  emit('close')
}

const resetForm = () => {
  form.value = {
    codigo: '',
    nombre: '',
    responsable: '',
    estado: 'activo',
    descripcion: ''
  }
  errors.value = {}
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}
</script>

<style scoped>
/* Estilos para el formulario de departamento */
.department-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  border: 1px solid var(--va-background-border);
  border-radius: 0.5rem;
  overflow: hidden;
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

/* Estilos para la información adicional */
.info-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--va-background-element);
  border-radius: 0.375rem;
  border: 1px solid var(--va-background-border);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--va-text-primary);
  opacity: 0.7;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--va-text-primary);
}

/* Estilos para las acciones del formulario */
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

/* Animaciones y transiciones */
.form-section {
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-item {
  transition: all 0.2s ease;
}

.info-item:hover {
  background-color: var(--va-background-secondary);
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-actions .va-button {
    width: 100%;
  }
  
  .info-row {
    gap: 0.5rem;
  }
  
  .info-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .department-form {
    gap: 1rem;
  }
  
  .form-row {
    gap: 0.75rem;
  }
}

/* Estilos para campos con error */
.form-field.va-input--error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* Mejoras visuales */
.va-card__title {
  font-weight: 600;
  color: var(--va-primary);
  border-bottom: 2px solid var(--va-background-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.va-modal__content {
  max-height: 80vh;
  overflow-y: auto;
}

/* Iconos en botones */
.mr-1 {
  margin-right: 0.25rem;
}
</style>
