<template>
  <VaModal 
    v-model="isVisible" 
    hide-default-actions 
    size="large"
    max-width="900px"
    @click-outside="handleClose"
  >
    <!-- Header con título y botón cerrar -->
    <template #header>
      <VaCard class="modal-header-card">
        <h2 class="modal-title">
          <VaIcon name="add_business" class="mr-2"/> 
          {{ editing ? 'Editar' : 'Nuevo' }} Pedido
        </h2>
      </VaCard>
    </template>

    <!-- Instrucciones para nuevo pedido -->
    <div v-if="!editing" class="pa-4 pb-0">
      <VaCard color="info" class="mb-4">
        <VaCardContent>
          <div class="flex items-center">
            <VaIcon name="info" size="large" class="mr-3"/>
            <div>
              <h4 class="mb-2">Instrucciones para crear un nuevo pedido</h4>
              <ul class="text-sm">
                <li>• Complete todos los campos marcados como requeridos</li>
                <li>• Verifique que el código del pedido sea único</li>
                <li>• Asigne correctamente el solicitante y supervisor</li>
                <li>• Revise la información financiera antes de guardar</li>
              </ul>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Cuerpo del modal -->
    <div class="pa-4">
      <form @submit.prevent="handleSave">
        <!-- Sección Básica -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="info" class="mr-2"/> 
            Información Básica
          </h3>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaInput 
                v-model="formData.codigo_pedido" 
                label="Código Pedido"
                placeholder="Código único del pedido"
                :disabled="editing"
                :rules="[requiredRule]"
                :error="!!errors.codigo_pedido"
                :error-messages="errors.codigo_pedido"
                class="mb-3"
              />
            </div>
            <div class="flex md6 sm12">
              <VaSelect 
                v-model="formData.tipo_pedido_id" 
                label="Tipo de Pedido"
                :options="tiposPedido"
                text-by="nombre"
                value-by="id"
                placeholder="Seleccione tipo"
                :rules="[requiredRule]"
                :error="!!errors.tipo_pedido_id"
                :error-messages="errors.tipo_pedido_id"
                class="mb-3"
              />
            </div>
          </div>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaDateInput 
                v-model="formData.fecha_requerida" 
                label="Fecha Requerida"
                :rules="[requiredRule]"
                :error="!!errors.fecha_requerida"
                :error-messages="errors.fecha_requerida"
                class="mb-3"
              />
            </div>
            <div class="flex md6 sm12">
              <VaSelect 
                v-model="formData.prioridad" 
                label="Prioridad"
                :options="prioridadOptions"
                :rules="[requiredRule]"
                class="mb-3"
              />
            </div>
          </div>
        </div>

        <!-- Sección Asignaciones -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="assignment_ind" class="mr-2"/> 
            Asignaciones
          </h3>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaSelect 
                v-model="formData.solicitante_id" 
                label="Solicitante"
                :options="usuarios"
                text-by="nombre"
                value-by="id"
                placeholder="Seleccione solicitante"
                :rules="[requiredRule]"
                :error="!!errors.solicitante_id"
                :error-messages="errors.solicitante_id"
                class="mb-3"
              />
            </div>
            <div class="flex md6 sm12">
              <VaSelect 
                v-model="formData.supervisor_id" 
                label="Supervisor"
                :options="usuarios"
                text-by="nombre"
                value-by="id"
                placeholder="Seleccione supervisor"
                class="mb-3"
              />
            </div>
          </div>
        </div>

        <!-- Sección Plano -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="engineering" class="mr-2"/> 
            Información del Plano
          </h3>
          
          <VaSelect 
            v-model="formData.plano_id" 
            label="Plano"
            :options="planosFormatted"
            placeholder="Seleccione plano"
            :rules="[requiredRule]"
            :error="!!errors.plano_id"
            :error-messages="errors.plano_id"
            class="mb-3"
          />
        </div>

        <!-- Sección Financiera -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="attach_money" class="mr-2"/> 
            Información Financiera
          </h3>
          
          <div class="row">
            <div class="flex md6 sm12">
              <VaInput 
                v-model="formData.costo_estimado" 
                label="Costo Estimado"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="mb-3"
              >
                <template #prependInner>
                  <VaIcon name="attach_money"/>
                </template>
              </VaInput>
            </div>
            <div class="flex md6 sm12">
              <VaInput 
                v-model="formData.precio_final" 
                label="Precio Final"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                :rules="[requiredRule]"
                :error="!!errors.precio_final"
                :error-messages="errors.precio_final"
                class="mb-3"
              >
                <template #prependInner>
                  <VaIcon name="attach_money"/>
                </template>
              </VaInput>
            </div>
          </div>
        </div>

        <!-- Sección Adicional -->
        <div class="mb-4">
          <h3 class="section-title">
            <VaIcon name="note_add" class="mr-2"/> 
            Información Adicional
          </h3>
          
          <VaInput 
            v-model="formData.proyecto_asociado" 
            label="Proyecto Asociado"
            placeholder="Nombre del proyecto"
            class="mb-3"
          />
          
          <VaTextarea 
            v-model="formData.notas" 
            label="Notas"
            placeholder="Notas adicionales..."
            :min-rows="3"
            :max-rows="5"
            class="mb-3"
          />
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
import { ref, computed, onMounted, watch } from 'vue';

// Props y Emits
const props = defineProps({
  pedidoData: {
    type: Object,
    default: null
  },
  tiposPedido: {
    type: Array,
    default: () => []
  },
  usuarios: {
    type: Array,
    default: () => []
  },
  planos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save', 'error']);

// Estado reactivo
const isVisible = ref(true);
const loading = ref(false);
const editing = ref(false);
const errors = ref({});
const formData = ref(getDefaultFormData());

// Opciones para selectores
const prioridadOptions = [
  { text: 'Alta', value: 1 },
  { text: 'Media', value: 2 },
  { text: 'Baja', value: 3 }
];

// Validación de campos requeridos
const requiredRule = (v) => !!v || 'Este campo es requerido';

// Computados
const planosFormatted = computed(() => {
  return props.planos.map(plano => ({
    text: `${plano.codigo} - ${plano.nombre}`,
    value: plano.id
  }));
});

// Observadores
watch(() => props.pedidoData, (newValue) => {
  if (newValue) {
    formData.value = { ...getDefaultFormData(), ...newValue };
    editing.value = true;
  } else {
    formData.value = getDefaultFormData();
    editing.value = false;
    // Generar código único para nuevo pedido
    formData.value.codigo_pedido = 'PED-' + Date.now().toString().slice(-6);
  }
}, { immediate: true });

// Métodos
function getDefaultFormData() {
  return {
    codigo_pedido: '',
    tipo_pedido_id: '',
    plano_id: '',
    solicitante_id: '',
    aprobador_id: null,
    supervisor_id: null,
    fecha_solicitud: new Date().toISOString().split('T')[0],
    fecha_requerida: '',
    fecha_estimada_entrega: null,
    estado_id: 1, // Estado inicial (pendiente)
    prioridad: 3,
    proyecto_asociado: '',
    costo_estimado: null,
    precio_final: 0,
    notas: ''
  };
}

function validateForm() {
  errors.value = {};
  const requiredFields = [
    { field: 'codigo_pedido', message: 'El código del pedido es requerido' },
    { field: 'tipo_pedido_id', message: 'El tipo de pedido es requerido' },
    { field: 'plano_id', message: 'Debe seleccionar un plano' },
    { field: 'solicitante_id', message: 'Debe seleccionar un solicitante' },
    { field: 'fecha_requerida', message: 'La fecha requerida es obligatoria' },
    { field: 'precio_final', message: 'El precio final es requerido' }
  ];
  
  let isValid = true;
  
  for (const { field, message } of requiredFields) {
    if (!formData.value[field] || (typeof formData.value[field] === 'number' && formData.value[field] <= 0 && field === 'precio_final')) {
      errors.value[field] = message;
      isValid = false;
    }
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
    const pedidoData = { ...formData.value };
    
    // Asegurar que los números sean correctos
    pedidoData.costo_estimado = pedidoData.costo_estimado ? 
      parseFloat(pedidoData.costo_estimado) : null;
    pedidoData.precio_final = parseFloat(pedidoData.precio_final);
    
    emit('save', pedidoData);
    isVisible.value = false;
  } catch (error) {
    console.error('Error al guardar:', error);
    emit('error', error);
  } finally {
    loading.value = false;
  }
}

// Inicialización
onMounted(() => {
  isVisible.value = true;
  
  if (!props.pedidoData) {
    // Generar código único para nuevo pedido
    formData.value.codigo_pedido = 'PED-' + Date.now().toString().slice(-6);
  }
});
</script>

<style >
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
