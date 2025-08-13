<template>
  <div class="inventario-container">

    <!-- Header con la misma longitud que Inventario -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-boxes-stacked"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Administración de Stock</h1>
            <p class="header-subtitle">Controla tu inventario y mantén el stock siempre actualizado</p>
          </div>
        </div>

        <div class="header-actions">
          <!-- Selector de vista -->
          <div class="view-selector-tabs">
            <button :class="['tab-btn', { active: currentView === 'calendar' }]" @click="switchView('calendar')">
              <i class="fas fa-calendar"></i>
              <span>Inventario</span>
            </button>
            <button :class="['tab-btn', { active: currentView === 'gantt' }]" @click="switchView('gantt')">
              <i class="fas fa-chart-gantt"></i>
              <span>Movimientos</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="inventory-content">
      <h2 class="title">Inventario de Materia Prima</h2>

      <!-- Tabla de productos con vue-good-table -->
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p>Cargando productos...</p>
          </div>

          <div v-else>
            <vue-good-table ref="vueGoodTable" :columns="tableColumns" max-height="45vh" :fixedHeader="false"
              :rows="products" :search-options="{
                enabled: true,
                placeholder: 'Buscar productos por código, nombre o proveedor...',
                externalQuery: searchQuery
              }" :pagination-options="{
                enabled: true,
                mode: 'records',
                perPage: 25,
                perPageDropdown: [10, 25, 50, 100],
                dropdownAllowAll: false,
                nextLabel: 'Siguiente',
                prevLabel: 'Anterior',
                rowsPerPageLabel: 'Filas por página',
                ofLabel: 'de',
                pageLabel: 'página',
                allLabel: 'Todos'
              }" :sort-options="{
                enabled: true,
                initialSortBy: { field: 'codigo', type: 'asc' }
              }" :select-options="{
                enabled: false
              }" styleClass="vgt-table striped bordered" theme="nocturnal">

              <!-- Slot personalizado para cada celda -->
              <template #table-row="props">
                <!-- Columna de Stock con formato especial -->
                <span v-if="props.column.field === 'stock_display'">
                  <span :class="stockStatusClass(props.row)">
                    {{ props.row.stock_total }} {{ getUnitName(props.row.unidad_base_id) }}
                  </span>
                </span>

                <!-- Columna de Precio formateado -->
                <span v-else-if="props.column.field === 'precio_display'">
                  ${{ formatPrice(props.row.costo_unitario) }}
                </span>

                <!-- Columna de Estado con badge -->
                <span v-else-if="props.column.field === 'estado_display'">
                  <span :class="statusBadgeClass(props.row)">
                    {{ stockStatusText(props.row) }}
                  </span>
                </span>

                <!-- Columna de Proveedor -->
                <span v-else-if="props.column.field === 'proveedor_principal'">
                  {{ props.row.proveedor_principal || 'N/A' }}
                </span>

                <!-- Columna de Tipo de Materia Prima -->
                <span v-else-if="props.column.field === 'tipo_materia_prima'">
                  {{ getMaterialTypeName(props.row.tipo_materia_prima_id) }}
                </span>

                <!-- Columna de Es Controlado -->
                <span v-else-if="props.column.field === 'es_controlado_display'">
                  <span :class="props.row.es_controlado ? 'controlled-badge' : 'not-controlled-badge'">
                    <i :class="props.row.es_controlado ? 'fas fa-shield-alt' : 'fas fa-shield'" class="mr-1"></i>
                    {{ props.row.es_controlado ? 'Controlado' : 'No Controlado' }}
                  </span>
                </span>

                <!-- Columna de Permite Fracción -->
                <span v-else-if="props.column.field === 'permite_fraccion_display'">
                  <span :class="props.row.permite_fraccion ? 'fraction-allowed' : 'fraction-not-allowed'">
                    <i :class="props.row.permite_fraccion ? 'fas fa-check-circle' : 'fas fa-times-circle'"
                      class="mr-1"></i>
                    {{ props.row.permite_fraccion ? 'Sí' : 'No' }}
                  </span>
                </span>

                <!-- Columna de Acciones -->
                <span v-else-if="props.column.field === 'actions'">
                  <va-button size="small" icon="visibility" color="info" :round="false"
                    @click="openProductModal(props.row)" title="Ver detalles del producto" class="action-btn" />
                </span>

                <!-- Contenido por defecto -->
                <span v-else>
                  {{ props.formattedRow[props.column.field] }}
                </span>
              </template>

              <!-- Slot para acciones en la parte superior de la tabla -->
              <template #table-actions>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="table-info">
                    <span class="text-muted">Total: {{ products.length }} productos</span>
                  </div>
                  <div class="table-actions-buttons">
                    <va-button color="success" size="small" @click="exportToCSV" icon="download" class="mr-2">
                      Exportar CSV
                    </va-button>
                    <va-button color="info" size="small" @click="applyFilters" icon="filter_alt" class="mr-2">
                      Aplicar Filtros
                    </va-button>
                    <va-button color="primary" size="small" @click="fetchProducts" icon="refresh">
                      Recargar
                    </va-button>
                  </div>
                </div>
              </template>

              <!-- Mensaje cuando no hay datos -->
              <template #emptystate>
                <div class="text-center py-4">
                  <i class="fas fa-boxes fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">No se encontraron productos</h5>
                  <p class="text-muted">Intenta ajustar los filtros o verifica la conexión</p>
                  <va-button color="primary" @click="fetchProducts" icon="refresh">
                    Recargar Productos
                  </va-button>
                </div>
              </template>
            </vue-good-table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del producto -->
    <ProductDetailsModal :is-visible="showProductModal" :product="selectedProduct" :material-types="materialTypes"
      :units="units" :can-edit="canEditProduct" @close="closeProductModal" @edit="editProduct"
      @update:is-visible="showProductModal = $event" @stock-updated="handleStockUpdate" @show-toast="showToast" />
  </div>
</template>

<script src="./ProductInventory.js"></script>
<style src="./ProductInventory.css" scoped></style>
<style src="src/assets/EstiloBase.css" scoped></style>
