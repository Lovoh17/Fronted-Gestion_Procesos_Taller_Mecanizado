<template>
  <div class="modal-overlay" @click="cancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="modal-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>{{ title }}</h3>
        <va-button  @click="cancel" :disabled="loading"    icon="times">
        
          
        
      </va-button>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
        <div v-if="details" class="details">
          <small>{{ details }}</small>
        </div>
      </div>

      <div class="modal-footer">
        <va-button type="button"
          class="btn btn-secondary"
          @click="cancel"
          :disabled="loading"
         color="secondary"  >
        {{ cancelText }}
      </va-button>
        <va-button type="button"
          class="btn btn-danger"
          @click="confirm"
          :disabled="loading"
         color="danger"   >
        
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          {{ confirmText }}
        
      </va-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
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

  methods: {
    confirm() {
      this.$emit('confirm')
    },

    cancel() {
      if (!this.loading) {
        this.$emit('cancel')
      }
    }
  },

  mounted() {
    // Agregar event listener para ESC
    document.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount() {
    // Remover event listener
    document.removeEventListener('keydown', this.handleKeydown)
  },

  methods: {
    confirm() {
      this.$emit('confirm')
    },

    cancel() {
      if (!this.loading) {
        this.$emit('cancel')
      }
    },

    handleKeydown(event) {
      if (event.key === 'Escape' && !this.loading) {
        this.cancel()
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #dee2e6;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff3cd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #856404;
  font-size: 18px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: auto;
}

.close-btn:hover:not(:disabled) {
  background: #f8f9fa;
  color: #495057;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #495057;
  line-height: 1.5;
}

.details {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #dee2e6;
}

.details small {
  color: #6c757d;
  font-size: 12px;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>