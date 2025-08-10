<template>
  <VaModal 
    v-model="isVisible" 
    hide-default-actions 
    size="large"
    max-width="800px"
    @click-outside="handleClose"
  >
    <!-- Header con título y botón cerrar -->
    <template #header>
      <VaCard class="modal-header-card">
        <h2 class="modal-title">
          <VaIcon name="work" class="mr-2"/> 
          {{ modalTitle }}
        </h2>
      </VaCard>
    </template>

    <!-- Cuerpo del modal -->
    <div class="pa-4">
      <form @submit.prevent="handleSave">
        <!-- Información básica -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="info" class="mr-2"/> 
            Información General
          </h3>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaInput 
                v-model="formData.orden" 
                label="Orden #"
                placeholder="Número de orden"
                disabled
                class="mb-3"
              />
            </div>
            <div class="flex md6 sm12">
              <VaSelect 
                v-model="formData.estado" 
                label="Estado"
                :options="estadoOptions"
                text-by="text"
                value-by="value"
                :rules="[requiredRule]"
                :error="!!errors.estado"
                :error-messages="errors.estado"
                class="mb-3"
              />
            </div>
          </div>
        </div>

        <!-- Datos del cliente -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="person" class="mr-2"/> 
            Datos del Cliente
          </h3>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaInput 
                v-model="formData.cliente" 
                label="Cliente"
                placeholder="Nombre del cliente"
                :rules="[requiredRule]"
                :error="!!errors.cliente"
                :error-messages="errors.cliente"
                class="mb-3"
              />
            </div>
            <div class="flex md6 sm12">
              <VaInput 
                v-model="formData.vehiculo" 
                label="Vehículo"
                placeholder="Información del vehículo"
                :rules="[requiredRule]"
                :error="!!errors.vehiculo"
                :error-messages="errors.vehiculo"
                class="mb-3"
              />
            </div>
          </div>
        </div>

        <!-- Detalles del trabajo -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="build" class="mr-2"/> 
            Detalles del Trabajo
          </h3>
          
          <VaInput 
            v-model="formData.tipo" 
            label="Tipo de Trabajo"
            placeholder="Descripción del tipo de trabajo"
            :rules="[requiredRule]"
            :error="!!errors.tipo"
            :error-messages="errors.tipo"
            class="mb-3"
          />
        </div>

        <!-- Asignación y fechas -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="assignment_ind" class="mr-2"/> 
            Asignación y Fechas
          </h3>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaSelect 
                v-model="formData.tecnico_id" 
                label="Técnico Asignado"
                :options="tecnicos"
                text-by="nombre"
                value-by="id"
                :rules="[requiredRule]"
                :error="!!errors.tecnico_id"
                :error-messages="errors.tecnico_id"
                class="mb-3"
              />
            </div>
            <div class="flex md6 sm12">
              <VaDateInput 
                v-model="formData.fecha_inicio" 
                label="Fecha de Inicio"
                :rules="[requiredRule]"
                class="mb-3"
              />
            </div>
          </div>

          <!-- Fecha finalización (condicional) -->
          <div v-if="showFechaFin" class="row">
            <div class="flex md6 sm12">
              <VaDateInput 
                v-model="formData.fecha_fin" 
                label="Fecha de Finalización"
                :rules="showFechaFin ? [requiredRule] : []"
                :error="!!errors.fecha_fin"
                :error-messages="errors.fecha_fin"
                class="mb-3"
              />
            </div>
          </div>
        </div>

        <!-- Descripciones -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="description" class="mr-2"/> 
            Descripción
          </h3>
          
          <VaTextarea 
            v-model="formData.detalles" 
            label="Detalles del trabajo"
            placeholder="Descripción detallada del trabajo a realizar..."
            :min-rows="3"
            :max-rows="6"
            class="mb-3"
          />

          <!-- Observaciones (condicional) -->
          <VaTextarea 
            v-if="showFechaFin"
            v-model="formData.observaciones" 
            label="Observaciones"
            placeholder="Observaciones adicionales sobre el trabajo realizado..."
            :min-rows="2"
            :max-rows="4"
            class="mb-3"
          />
        </div>

        <!-- Opciones adicionales -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="settings" class="mr-2"/> 
            Opciones
          </h3>
          
          <VaCheckbox 
            v-model="formData.urgente" 
            label="Trabajo Urgente"
            class="mb-3"
          />
        </div>

        <!-- Información adicional (solo en modo edición) -->
        <div v-if="formData.id && (formData.created_at || formData.updated_at)" class="mb-4">
          <h3 class="section-title">
            <VaIcon name="info_outline" class="mr-2"/> 
            Información Adicional
          </h3>
          
          <div class="row">
            <div v-if="formData.created_at" class="flex md6 sm12">
              <VaInput 
                :model-value="new Date(formData.created_at).toLocaleString()"
                label="Fecha de Creación"
                readonly
                class="mb-3"
              />
            </div>
            <div v-if="formData.updated_at" class="flex md6 sm12">
              <VaInput 
                :model-value="new Date(formData.updated_at).toLocaleString()"
                label="Última Modificación"
                readonly
                class="mb-3"
              />
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Footer con botones -->
    <template #footer>
      <div class="flex justify--end gap-2">
        <VaButton 
          color="secondary" 
          @click="handleClose"
          :disabled="loading"
        >
          <VaIcon name="close" class="mr-1"/> 
          Cancelar
        </VaButton>
        <VaButton 
          color="primary" 
          @click="handleSave"
          :loading="loading"
        >
          <VaIcon name="save" class="mr-1"/> 
          Guardar
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// Props y Emits
const props = defineProps({
  trabajo: {
    type: Object,
    default: null
  },
  tecnicos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

// Estado reactivo
const isVisible = ref(true);
const loading = ref(false);
const errors = ref({});
const formData = ref(getDefaultFormData());

// Opciones para el selector de estados
const estadoOptions = [
  { text: 'Pendiente', value: 'pendiente' },
  { text: 'En Proceso', value: 'en_proceso' },
  { text: 'Completado', value: 'completado' },
  { text: 'Entregado', value: 'entregado' }
];

// Validación de campos requeridos
const requiredRule = (v) => !!v || 'Este campo es requerido';

// Computados
const modalTitle = computed(() => {
  return formData.value.id ? 'Editar Trabajo' : 'Nuevo Trabajo';
});

const showFechaFin = computed(() => {
  return ['completado', 'entregado'].includes(formData.value.estado);
});

// Observadores
watch(() => props.trabajo, (newValue) => {
  if (newValue) {
    formData.value = { ...getDefaultFormData(), ...newValue };
  } else {
    formData.value = getDefaultFormData();
  }
}, { immediate: true });

// Métodos
function getDefaultFormData() {
  return {
    id: null,
    orden: '',
    cliente: '',
    vehiculo: '',
    tipo: '',
    tecnico_id: props.tecnicos[0]?.id || null,
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    estado: 'pendiente',
    detalles: '',
    observaciones: '',
    urgente: false,
    created_at: null,
    updated_at: null
  };
}

function validateForm() {
  errors.value = {};
  const requiredFields = [
    { field: 'cliente', message: 'El cliente es requerido' },
    { field: 'vehiculo', message: 'El vehículo es requerido' },
    { field: 'tipo', message: 'El tipo de trabajo es requerido' },
    { field: 'tecnico_id', message: 'Debe asignar un técnico' }
  ];
  
  let isValid = true;
  
  for (const { field, message } of requiredFields) {
    if (!formData.value[field]) {
      errors.value[field] = message;
      isValid = false;
    }
  }
  
  if (showFechaFin.value && !formData.value.fecha_fin) {
    errors.value.fecha_fin = 'La fecha de finalización es requerida';
    isValid = false;
  }
  
  return isValid;
}

function handleClose() {
  isVisible.value = false;
  emit('close');
}

function handleSave() {
  if (!validateForm()) return;
  
  loading.value = true;
  
  try {
    const trabajoData = { ...formData.value };
    
    if (showFechaFin.value && !trabajoData.fecha_fin) {
      trabajoData.fecha_fin = new Date().toISOString().split('T')[0];
    }
    
    emit('save', trabajoData);
    isVisible.value = false;
  } catch (error) {
    console.error('Error al guardar el trabajo:', error);
  } finally {
    loading.value = false;
  }
}

// Inicialización
onMounted(() => {
  isVisible.value = true;
});
</script>

<style scoped>
.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--va-primary);
}

.modal-header-card {
  margin-bottom: 0;
  background: linear-gradient(to right, var(--va-primary-rgb, #1d7abc), rgba(29, 122, 188, 0.8));
}

.modal-header-card :deep(.va-card-content) {
  padding: 16px !important;
}

.modal-header-card .modal-title {
  color: white;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 1rem;
}

.va-input, .va-select, .va-textarea {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .flex.md6.sm12 {
    width: 100%;
    padding: 0 8px;
  }
  
  .row {
    margin: 0 -8px;
  }
}
</style>
