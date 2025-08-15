<template>
  <va-modal v-model="isOpen" hide-default-actions no-padding blur @update:model-value="handleModalChange">
    <template #header>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-box mr-2"></i>
          Detalles del Producto
        </h3>
      </div>
    </template>

    <div class="modal-content" v-if="product">
      <!-- Información básica -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-info-circle mr-2"></i>
          Información Básica
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Código:</label>
            <span class="value">{{ product.codigo }}</span>
          </div>
          <div class="info-item">
            <label>Nombre:</label>
            <span class="value">{{ product.nombre }}</span>
          </div>
          <div class="info-item">
            <label>Descripción:</label>
            <span class="value">{{ product.descripcion || 'No disponible' }}</span>
          </div>
          <div class="info-item">
            <label>Tipo de Materia Prima:</label>
            <span class="value type-badge">
              <i class="fas fa-layer-group mr-1"></i>
              {{ getMaterialTypeName(product.tipo_materia_prima_id) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información de stock -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-warehouse mr-2"></i>
          Stock e Inventario
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Stock Actual:</label>
            <span class="value stock-value" :class="stockStatusClass(product)">
              <i class="fas fa-boxes mr-1"></i>
              {{ product.stock_total }} {{ getUnitName(product.unidad_base_id) }}
            </span>
          </div>
          <div class="info-item">
            <label>Stock Mínimo:</label>
            <span class="value">
              <i class="fas fa-exclamation-triangle mr-1"></i>
              {{ product.stock_minimo }} {{ getUnitName(product.unidad_base_id) }}
            </span>
          </div>
          <div class="info-item">
            <label>Estado:</label>
            <span :class="statusBadgeClass(product)">
              <i class="fas fa-circle mr-1"></i>
              {{ stockStatusText(product) }}
            </span>
          </div>
          <div class="info-item">
            <label>Unidad Base:</label>
            <span class="value">
              <i class="fas fa-ruler-combined mr-1"></i>
              {{ units[product.unidad_base_id]?.nombre || 'No definida' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información económica -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-dollar-sign mr-2"></i>
          Información Económica
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Costo Unitario:</label>
            <span class="value price-value">
              <i class="fas fa-tag mr-1"></i>
              ${{ formatPrice(product.costo_unitario) }}
            </span>
          </div>
          <div class="info-item">
            <label>Valor Total en Stock:</label>
            <span class="value price-value total-value">
              <i class="fas fa-calculator mr-1"></i>
              ${{ calculateTotalValue(product) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información de proveedor -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-truck mr-2"></i>
          Información de Proveedor
        </h4>
        <div class="info-grid">
          <div class="info-item">
            <label>Proveedor Principal:</label>
            <span class="value">
              <i class="fas fa-building mr-1"></i>
              {{ product.proveedor_principal || 'No asignado' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Características especiales -->
      <div class="product-section">
        <h4 class="section-title">
          <i class="fas fa-cogs mr-2"></i>
          Características
        </h4>
        <div class="characteristics-grid">
          <div class="characteristic-item">
            <div class="characteristic-card" :class="product.es_controlado ? 'controlled' : 'not-controlled'">
              <i :class="product.es_controlado ? 'fas fa-shield-alt' : 'fas fa-shield'" class="characteristic-icon"></i>
              <div class="characteristic-content">
                <span class="characteristic-label">Control</span>
                <span class="characteristic-value">
                  {{ product.es_controlado ? 'Controlado' : 'No Controlado' }}
                </span>
              </div>
            </div>
          </div>
          <div class="characteristic-item">
            <div class="characteristic-card"
              :class="product.permite_fraccion ? 'fraction-allowed' : 'fraction-not-allowed'">
              <i :class="product.permite_fraccion ? 'fas fa-check-circle' : 'fas fa-times-circle'"
                class="characteristic-icon"></i>
              <div class="characteristic-content">
                <span class="characteristic-label">Fraccionable</span>
                <span class="characteristic-value">
                  {{ product.permite_fraccion ? 'Sí permite' : 'No permite' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fechas de registro -->
      <div class="product-section" v-if="product.created_at || product.updated_at">
        <h4 class="section-title">
          <i class="fas fa-clock mr-2"></i>
          Fechas
        </h4>
        <div class="info-grid">
          <div class="info-item" v-if="product.created_at">
            <label>Fecha de Registro:</label>
            <span class="value">
              <i class="fas fa-calendar-plus mr-1"></i>
              {{ formatDate(product.created_at) }}
            </span>
          </div>
          <div class="info-item" v-if="product.updated_at">
            <label>Última Actualización:</label>
            <span class="value">
              <i class="fas fa-calendar-edit mr-1"></i>
              {{ formatDate(product.updated_at) }}
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
        <va-button color="primary" @click="editProduct" icon="edit" :disabled="!canEdit">
          Editar Producto
        </va-button>
        <va-button color="primary" @click="editProduct" icon="edit" :disabled="!canEdit">
          Registrar movimiento
        </va-button>
      </div>
    </template>
  </va-modal>
</template>

<script src="./Script/ProductDetailsModal.js"></script>
<style src="src/assets/ProductDetailsModal.css" scoped></style>
