<template>
  <VaModal :model-value="true" :title="isEditing ? 'Editar Departamento' : 'Nuevo Departamento'" size="medium"
    :close-button="!loading" :no-outside-dismiss="loading" hide-default-actions @close="closeModal">
    <form @submit.prevent="submitForm">
      <div class="department-form">
        <!-- Información Principal -->
        <VaCardContent>
          <VaInput v-model="form.nombre" label="Nombre del Departamento *"
            placeholder="Ingrese el nombre del departamento" :error="!!errors.nombre" :error-messages="errors.nombre"
            class="form-field" maxlength="100" required />
        </VaCardContent>

        <!-- Información Adicional (solo en edición) -->
        <VaCard class="form-section" v-if="isEditing">
          <VaCardTitle>Información del Departamento</VaCardTitle>
          <VaCardContent>
            <div class="info-row">
              <div class="info-item">
                <VaIcon name="tag" color="primary" />
                <div class="info-content">
                  <span class="info-label">ID del Departamento:</span>
                  <span class="info-value">#{{ departamento.id }}</span>
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

        <VaButton @click="submitForm" :disabled="loading || !isFormValid" :loading="loading" color="primary">
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
  nombre: ''
})

const errors = ref({})

// Computed
const isEditing = computed(() => {
  return props.departamento && props.departamento.id
})

const isFormValid = computed(() => {
  return form.value.nombre.trim().length > 0
})

// Watchers
watch(() => props.departamento, (newDepartamento) => {
  if (newDepartamento && newDepartamento.id) {
    // Cargar datos para edición
    form.value = {
      nombre: newDepartamento.nombre || ''
    }
  } else {
    // Resetear formulario para nuevo departamento
    resetForm()
  }
}, { immediate: true })

// Methods
const validateForm = () => {
  errors.value = {}

  // Validar nombre
  if (!form.value.nombre.trim()) {
    errors.value.nombre = 'El nombre es requerido'
  } else if (form.value.nombre.trim().length < 3) {
    errors.value.nombre = 'El nombre debe tener al menos 3 caracteres'
  } else if (form.value.nombre.length > 100) {
    errors.value.nombre = 'El nombre no puede exceder 100 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (!validateForm()) {
    return
  }

  const departamentoData = {
    nombre: form.value.nombre.trim()
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
    nombre: ''
  }
  errors.value = {}
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
}

/* Estilos para campos con error */
.form-field.va-input--error {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
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

/* Estilos específicos para el campo de nombre */
.form-field {
  margin-bottom: 1rem;
}

.form-field .va-input__label {
  font-weight: 500;
  color: var(--va-text-primary);
}

.form-field .va-input__content {
  border-radius: 0.5rem;
}

.form-field .va-input__content:focus-within {
  box-shadow: 0 0 0 2px var(--va-primary);
  border-color: var(--va-primary);
}
</style>