<template>
  <VaModal 
    :model-value="true" 
    title="Nuevo Departamento" 
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

            <!-- Información adicional para nuevos departamentos -->
            <VaDivider class="my-4" />
            
            <div class="info-section">
              <VaIcon name="info" color="info" class="mr-2" />
              <div class="info-text">
                <p class="mb-2"><strong>Instrucciones:</strong></p>
                <ul class="instructions-list">
                  <li>El código debe ser único y contener solo letras mayúsculas y números</li>
                  <li>El nombre del departamento será visible en todo el sistema</li>
                  <li>Asegúrate de asignar un responsable válido</li>
                  <li>La descripción ayudará a otros usuarios a entender la función del departamento</li>
                </ul>
              </div>
            </div>
          </VaCardContent>
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
          <VaIcon name="add" class="mr-1" />
          Crear Departamento
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
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
const isFormValid = computed(() => {
  return form.value.codigo.trim() &&
         form.value.nombre.trim() &&
         form.value.responsable.trim() &&
         form.value.estado
})

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

  emit('save', departamentoData)
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* Estilos para el formulario de nuevo departamento */
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

/* Estilos para la sección de información */
.info-section {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--va-background-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--va-info);
}

.info-text {
  flex: 1;
}

.info-text p {
  margin: 0;
  color: var(--va-text-primary);
  font-size: 0.9rem;
}

.instructions-list {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--va-text-primary);
}

.instructions-list li {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
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

.info-section {
  transition: all 0.2s ease;
}

.info-section:hover {
  background-color: var(--va-background-element);
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
  
  .info-section {
    flex-direction: column;
    text-align: center;
  }
  
  .instructions-list {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .department-form {
    gap: 1rem;
  }
  
  .form-row {
    gap: 0.75rem;
  }
  
  .info-section {
    padding: 0.75rem;
    gap: 0.5rem;
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

/* Estilos para el divider */
.my-4 {
  margin: 1rem 0;
}

/* Iconos y espaciado */
.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

/* Estilo especial para nueva creación */
.form-section {
  background: linear-gradient(135deg, var(--va-background-primary) 0%, var(--va-background-secondary) 100%);
}

.info-section {
  background: linear-gradient(135deg, rgba(var(--va-info-rgb), 0.05) 0%, rgba(var(--va-info-rgb), 0.1) 100%);
  border-left: 4px solid var(--va-info);
}
</style>
