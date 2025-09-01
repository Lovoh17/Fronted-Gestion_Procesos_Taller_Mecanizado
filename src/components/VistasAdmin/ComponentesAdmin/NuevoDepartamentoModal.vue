<template>
  <VaModal :model-value="true" title="Nuevo Departamento" size="medium" :close-button="!loading"
    :no-outside-dismiss="loading" hide-default-actions @close="closeModal">
    <form @submit.prevent="submitForm">
      <div class="department-form">
        <!-- Información Principal -->
        <VaCardContent>
          <VaInput v-model="form.nombre" label="Nombre del Departamento *"
            placeholder="Ingrese el nombre del departamento" :error="!!errors.nombre" :error-messages="errors.nombre"
            class="form-field" maxlength="100" required />

          <!-- Información adicional para nuevos departamentos -->
          <VaDivider class="my-4" />

          <div class="info-section">
            <VaIcon name="info" color="info" class="mr-2" />
            <div class="info-text">
              <p class="mb-2"><strong>Instrucciones:</strong></p>
              <ul class="instructions-list">
                <li>El nombre del departamento debe ser único y descriptivo</li>
                <li>Este nombre será visible en todo el sistema</li>
                <li>Debe tener al menos 3 caracteres y máximo 100</li>
                <li>Se puede modificar posteriormente si es necesario</li>
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

        <VaButton @click="submitForm" :disabled="loading || !isFormValid" :loading="loading" color="primary">
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
  nombre: ''
})

const errors = ref({})

// Computed
const isFormValid = computed(() => {
  return form.value.nombre.trim().length > 0
})

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

  emit('save', departamentoData)
}

const closeModal = () => {
  emit('close')
}
</script>

<style >
/* Estilos para el formulario de nuevo departamento */
.department-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  width: 100%;
  margin-bottom: 1rem;
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
.info-section {
  transition: all 0.2s ease;
}

.info-section:hover {
  background-color: var(--va-background-element);
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
.info-section {
  background: linear-gradient(135deg, rgba(var(--va-info-rgb), 0.05) 0%, rgba(var(--va-info-rgb), 0.1) 100%);
  border-left: 4px solid var(--va-info);
}

/* Estilos específicos para el campo de nombre */
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

/* Mejoras visuales */
.va-modal__content {
  max-height: 80vh;
  overflow-y: auto;
}
</style>