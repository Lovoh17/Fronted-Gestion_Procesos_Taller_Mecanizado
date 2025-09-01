<template>
  <VaModal
    v-model="showModal"
    title="Nuevo Trabajo"
    size="large"
    @close="close"
  >
    <form @submit.prevent="save">
      <!-- Sección Cliente -->
      <VaCard class="form-section">
        <VaCardTitle>Datos del Cliente</VaCardTitle>
        <VaCardContent>
          <div class="form-row">
            <VaInput
              v-model="formData.cliente"
              label="Cliente *"
              placeholder="Nombre del cliente"
              required
              class="form-field"
            />
            <VaInput
              v-model="formData.telefono"
              type="tel"
              label="Teléfono"
              placeholder="Teléfono de contacto"
              class="form-field"
            />
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Sección Vehículo -->
      <VaCard class="form-section">
        <VaCardTitle>Datos del Vehículo</VaCardTitle>
        <VaCardContent>
          <div class="form-row">
            <VaInput
              v-model="formData.marca"
              label="Marca *"
              placeholder="Ej: Toyota"
              required
              class="form-field"
            />
            <VaInput
              v-model="formData.modelo"
              label="Modelo *"
              placeholder="Ej: Corolla"
              required
              class="form-field"
            />
          </div>
          <VaInput
            v-model="formData.placa"
            label="Placa/Número de Serie"
            placeholder="Placa o VIN"
            class="form-field"
          />
        </VaCardContent>
      </VaCard>

      <!-- Sección Trabajo -->
      <VaCard class="form-section">
        <VaCardTitle>Detalles del Trabajo</VaCardTitle>
        <VaCardContent>
          <VaSelect
            v-model="formData.tipo"
            label="Tipo de Trabajo *"
            placeholder="Seleccione un tipo"
            :options="tipoOptions"
            required
            class="form-field"
          />
          
          <VaTextarea
            v-model="formData.descripcion"
            label="Descripción *"
            placeholder="Describa el trabajo a realizar..."
            required
            class="form-field"
            :min-rows="3"
          />
          
          <VaSelect
            v-model="formData.tecnico_id"
            label="Técnico *"
            placeholder="Seleccione un técnico"
            :options="tecnicoOptions"
            text-by="nombre"
            value-by="id"
            required
            class="form-field"
          />
        </VaCardContent>
      </VaCard>
    </form>

    <template #footer>
      <div class="form-actions">
        <VaButton
          preset="secondary"
          @click="close"
        >
          Cancelar
        </VaButton>
        <VaButton
          color="primary"
          @click="save"
        >
          Guardar
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
export default {
  name: 'NewJobModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    tecnicos: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['update:modelValue', 'close', 'save'],
  
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
  
  computed: {
    showModal: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    tipoOptions() {
      return [
        { text: 'Mantenimiento', value: 'Mantenimiento' },
        { text: 'Reparación', value: 'Reparación' },
        { text: 'Diagnóstico', value: 'Diagnóstico' }
      ]
    },
    tecnicoOptions() {
      return this.tecnicos.map(tecnico => ({
        id: tecnico.id,
        nombre: tecnico.nombre
      }))
    }
  },
  
  methods: {
    close() {
      this.showModal = false
      this.$emit('close')
    },
    save() {
      if (this.validateForm()) {
        this.$emit('save', {
          ...this.formData,
          fecha: new Date().toISOString(),
          estado: 'pendiente'
        })
        this.resetForm()
        this.close()
      }
    },
    validateForm() {
      const required = ['cliente', 'marca', 'modelo', 'tipo', 'descripcion', 'tecnico_id']
      return required.every(field => this.formData[field])
    },
    resetForm() {
      this.formData = {
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
  }
}
</script>

<style >
.form-section {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
