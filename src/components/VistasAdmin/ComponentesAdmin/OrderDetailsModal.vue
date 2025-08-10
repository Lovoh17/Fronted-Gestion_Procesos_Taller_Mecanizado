<template>
  <VaModal
    v-model="showModal"
    :title="`Detalles del Pedido #${order.id}`"
    size="large"
    @close="close"
  >
    <div class="order-details">
      <!-- Información básica del pedido -->
      <VaCard class="info-section">
        <VaCardTitle>Información del Pedido</VaCardTitle>
        <VaCardContent>
          <div class="detail-row">
            <span class="detail-label">Cliente:</span>
            <span class="detail-value">{{ order.client }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">{{ formatDate(order.date) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <VaBadge
              :text="getStatusText(order.status)"
              :color="getStatusColor(order.status)"
              class="status-badge"
            />
          </div>
        </VaCardContent>
      </VaCard>
      
      <!-- Lista de productos -->
      <VaCard class="products-section">
        <VaCardTitle>Productos</VaCardTitle>
        <VaCardContent>
          <VaDataTable
            :items="order.products"
            :columns="productColumns"
            class="products-table"
          >
            <template #cell(price)="{ rowData }">
              ${{ formatNumber(rowData.price) }}
            </template>
            <template #cell(subtotal)="{ rowData }">
              ${{ formatNumber(rowData.price * rowData.quantity) }}
            </template>
          </VaDataTable>
          
          <div class="total-section">
            <VaDivider />
            <div class="total-row">
              <span class="total-label">Total:</span>
              <span class="total-value">${{ formatNumber(order.total) }}</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>
      
      <!-- Notas adicionales -->
      <VaCard v-if="order.notes" class="notes-section">
        <VaCardTitle>Notas</VaCardTitle>
        <VaCardContent>
          <p class="notes-text">{{ order.notes }}</p>
        </VaCardContent>
      </VaCard>
    </div>

    <template #footer>
      <div class="modal-actions">
        <VaButton
          color="primary"
          @click="close"
        >
          Cerrar
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script>
export default {
  name: 'OrderDetailsModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    order: {
      type: Object,
      required: true,
      validator: value => {
        return value.id && value.client && value.date && value.products
      }
    }
  },
  
  emits: ['update:modelValue', 'close'],
  
  computed: {
    showModal: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    productColumns() {
      return [
        {
          key: 'name',
          title: 'Producto',
          sortable: true
        },
        {
          key: 'quantity',
          title: 'Cantidad',
          sortable: true
        },
        {
          key: 'price',
          title: 'Precio Unitario',
          sortable: true
        },
        {
          key: 'subtotal',
          title: 'Subtotal'
        }
      ]
    }
  },
  
  methods: {
    close() {
      this.showModal = false
      this.$emit('close')
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('es-ES', options)
    },
    formatNumber(value) {
      return Number(value).toLocaleString('es-ES')
    },
    getStatusColor(status) {
      const statusColors = {
        'pending': 'warning',
        'in_progress': 'info',
        'completed': 'success',
        'cancelled': 'danger'
      }
      return statusColors[status] || 'secondary'
    },
    getStatusText(status) {
      const statusTexts = {
        'pending': 'Pendiente',
        'in_progress': 'En curso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
      }
      return statusTexts[status] || status
    }
  }
}
</script>

<style scoped>
.order-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--va-background-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: var(--va-text-primary);
  min-width: 100px;
}

.detail-value {
  color: var(--va-text-secondary);
  flex: 1;
  text-align: right;
}

.products-section {
  margin-bottom: 1rem;
}

.products-table {
  margin-bottom: 1rem;
}

.total-section {
  margin-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.total-label {
  color: var(--va-text-primary);
}

.total-value {
  color: var(--va-primary);
  font-size: 1.25rem;
}

.notes-section {
  margin-bottom: 1rem;
}

.notes-text {
  margin: 0;
  line-height: 1.6;
  color: var(--va-text-primary);
}

.modal-actions {
  display: flex;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
}
</style>
