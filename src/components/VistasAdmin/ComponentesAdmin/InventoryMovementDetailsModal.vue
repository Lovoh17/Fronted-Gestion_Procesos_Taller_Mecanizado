<template>
  <va-modal v-model="isOpen" hide-default-actions no-padding blur @update:model-value="handleModalChange">
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-exchange-alt mr-2"></i>
          Detalles del Movimiento de Inventario
        </h3>
      </div>
    </template>

    <div class="modal-content" v-if="movement">
      <!-- Información básica del movimiento -->
      <div class="movement-section">
        <h4 class="section-title">
          <i class="fas fa-info-circle mr-2"></i>
          Información del Movimiento
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>ID del Movimiento:</label>
            <span class="value">{{ movement.id }}</span>
          </div>
          <div class="info-item">
            <label>Tipo de Movimiento:</label>
            <span :class="`movement-badge ${getMovementTypeClass(movement.tipo_movimiento.toLowerCase())}`">
              <i :class="getMovementIcon(movement.tipo_movimiento.toLowerCase())" class="mr-1"></i>
              {{ movement.tipo_movimiento }}
            </span>
          </div>
          <div class="info-item">
            <label>Fecha del Movimiento:</label>
            <span class="value">
              <i class="fas fa-calendar mr-1"></i>
              {{ movement.fecha_movimiento_formatted }}
            </span>
          </div>
          <div class="info-item">
            <label>Usuario Responsable:</label>
            <span class="value">
              <i class="fas fa-user mr-1"></i>
              {{ movement.usuario_nombre || 'N/A' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información del producto -->
      <div class="movement-section">
        <h4 class="section-title">
          <i class="fas fa-box mr-2"></i>
          Producto Afectado
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Código del Producto:</label>
            <span class="value product-code">
              <i class="fas fa-barcode mr-1"></i>
              {{ movement.producto_codigo }}
            </span>
          </div>
          <div class="info-item">
            <label>Nombre del Producto:</label>
            <span class="value">
              <i class="fas fa-tag mr-1"></i>
              {{ movement.producto_nombre }}
            </span>
          </div>
          <div class="info-item" v-if="movement.producto_descripcion">
            <label>Descripción:</label>
            <span class="value description">
              {{ movement.producto_descripcion }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información de cantidad -->
      <div class="movement-section">
        <h4 class="section-title">
          <i class="fas fa-balance-scale mr-2"></i>
          Detalles de Cantidad
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Cantidad Movida:</label>
            <span class="value quantity-value" :class="{
              'text-success': movement.tipo_movimiento.toLowerCase() === 'entrada',
              'text-danger': movement.tipo_movimiento.toLowerCase() === 'salida',
              'text-warning': movement.tipo_movimiento.toLowerCase() === 'ajuste',
              'text-info': movement.tipo_movimiento.toLowerCase() === 'transferencia'
            }">
              <i :class="getQuantityIcon(movement.tipo_movimiento.toLowerCase())" class="mr-1"></i>
              {{ movement.tipo_movimiento.toLowerCase() === 'entrada' ? '+' : '' }}{{ movement.cantidad_display }}
            </span>
          </div>
          <div class="info-item" v-if="movement.stock_anterior !== null">
            <label>Stock Anterior:</label>
            <span class="value">
              <i class="fas fa-chart-line mr-1"></i>
              {{ movement.stock_anterior }}
            </span>
          </div>
          <div class="info-item" v-if="movement.stock_actual !== null">
            <label>Stock Resultante:</label>
            <span class="value">
              <i class="fas fa-boxes mr-1"></i>
              {{ movement.stock_actual }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información de pedido (si aplica) -->
      <div class="movement-section" v-if="movement.pedido_id">
        <h4 class="section-title">
          <i class="fas fa-clipboard-list mr-2"></i>
          Información del Pedido
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>ID del Pedido:</label>
            <span class="value pedido-id">
              <i class="fas fa-hashtag mr-1"></i>
              {{ movement.pedido_id }}
            </span>
          </div>
        </div>
      </div>

      <!-- Motivo del movimiento -->
      <div class="movement-section" v-if="movement.motivo">
        <h4 class="section-title">
          <i class="fas fa-comment mr-2"></i>
          Motivo del Movimiento
        </h4>
        <div class="reason-content">
          <div class="reason-text">
            <i class="fas fa-quote-left mr-2"></i>
            {{ movement.motivo }}
            <i class="fas fa-quote-right ml-2"></i>
          </div>
        </div>
      </div>

      <!-- Fechas de registro -->
      <div class="movement-section" v-if="movement.created_at || movement.updated_at">
        <h4 class="section-title">
          <i class="fas fa-clock mr-2"></i>
          Información de Registro
        </h4>
        <div class="info-grid">
          <div class="info-item" v-if="movement.created_at">
            <label>Fecha de Registro:</label>
            <span class="value">
              <i class="fas fa-calendar-plus mr-1"></i>
              {{ formatDate(movement.created_at) }}
            </span>
          </div>
          <div class="info-item" v-if="movement.updated_at && movement.updated_at !== movement.created_at">
            <label>Última Modificación:</label>
            <span class="value">
              <i class="fas fa-calendar-edit mr-1"></i>
              {{ formatDate(movement.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <va-button color="secondary" @click="closeModal" icon="close">
          Cerrar
        </va-button>
        <va-button color="info" @click="viewProduct" icon="visibility" v-if="movement && movement.producto_id">
          Ver Producto
        </va-button>
        <va-button color="primary" @click="printMovement" icon="print">
          Imprimir Detalle
        </va-button>
      </div>
    </template>
  </va-modal>
</template>

<script src="./Script/InventoryMovementDetailsModal.js"></script>
<style src="../../../assets/InventoryMovementDetailsModal.css" ></style>
