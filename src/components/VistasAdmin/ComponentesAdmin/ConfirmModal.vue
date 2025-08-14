<template>
  <VaModal v-model="showModal" :title="title" :close-button="!loading" :no-outside-dismiss="loading"
    :no-escape-dismiss="loading" size="small" @close="cancel">
    <template #header>
      <div class="confirm-header">
        <VaIcon name="warning" size="large" color="warning" class="confirm-icon" />
        <h3 class="confirm-title">{{ title }}</h3>
      </div>
    </template>

    <div class="confirm-content">
      <p class="confirm-message">{{ message }}</p>
      <div v-if="details" class="confirm-details">
        <small>{{ details }}</small>
      </div>
    </div>

    <template #footer>
      <div class="confirm-actions">
        <VaButton preset="secondary" @click="cancel" :disabled="loading" class="cancel-button">
          {{ cancelText }}
        </VaButton>

        <VaButton color="danger" @click="confirm" :disabled="loading" :loading="loading" class="confirm-button">
          {{ confirmText }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Confirmar acción'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: null
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'confirm', 'cancel'],

  computed: {
    showModal: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },

  methods: {
    confirm() {
      this.$emit('confirm')
    },

    cancel() {
      if (!this.loading) {
        this.showModal = false
        this.$emit('cancel')
      }
    }
  }
}
</script>

<style scoped>
.confirm-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confirm-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--va-warning);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--va-background-primary);
}

.confirm-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--va-text-primary);
  flex: 1;
}

.confirm-content {
  padding: 1.5rem 0;
}

.confirm-message {
  margin: 0 0 1rem 0;
  color: var(--va-text-primary);
  font-size: 1rem;
  line-height: 1.5;
}

.confirm-details {
  padding: 0.75rem;
  background: var(--va-background-element);
  border-radius: var(--va-border-radius);
  border-left: 3px solid var(--va-info);
}

.confirm-details small {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-button {
  min-width: 6rem;
}

.confirm-button {
  min-width: 6rem;
}

/* Responsive */
@media (max-width: 480px) {
  .confirm-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
  }

  .confirm-header {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
</style>
