<template>
  <div class="transacciones-container">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Transacciones Financieras</h1>
            <p class="header-subtitle">Gestiona y monitorea todas tus transacciones financieras de CMS</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button @click="exportData" color="secondary" icon="download">
            <span>Exportar</span>
          </va-button>
          <va-button @click="showNuevaTransaccionModal = true" color="primary" icon="plus">
            <span>Nueva Transacción</span>
          </va-button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando transacciones...</p>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="dashboard-overview" v-if="!loading">
      <div class="overview-card income-card">
        <div class="card-icon">
          <i class="fas fa-arrow-up"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Ingresos</div>
          <div class="card-amount positive">{{ formatCurrency(totalIngresos) }}</div>
          <div class="card-subtitle">{{ ingresosCount }} transacciones</div>
        </div>
      </div>

      <div class="overview-card expense-card">
        <div class="card-icon">
          <i class="fas fa-arrow-down"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Egresos</div>
          <div class="card-amount negative">{{ formatCurrency(totalEgresos) }}</div>
          <div class="card-subtitle">{{ egresosCount }} transacciones</div>
        </div>
      </div>

      <div class="overview-card balance-card">
        <div class="card-icon">
          <i class="fas fa-balance-scale"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Balance Neto</div>
          <div class="card-amount" :class="balanceClass">{{ formatCurrency(balanceTotal) }}</div>
          <div class="card-subtitle">Diferencia total</div>
        </div>
      </div>

      <div class="overview-card transactions-card">
        <div class="card-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <div class="card-content">
          <div class="card-title">Total Transacciones</div>
          <div class="card-amount neutral">{{ filteredTransacciones.length }}</div>
          <div class="card-subtitle">En el período actual</div>
        </div>
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div class="filters-panel" v-if="!loading">
      <div class="panel-header" @click="toggleFilters">
        <div class="panel-title">
          <i class="fas fa-filter"></i>
          <span>Filtros Avanzados</span>
          <span class="filter-count" v-if="activeFiltersCount > 0">{{ activeFiltersCount }}</span>
        </div>
        <va-button class="panel-toggle">

          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>

        </va-button>
      </div>

      <transition name="slide-down">
        <div class="filters-content" v-if="showFilters">
          <!-- Grid responsivo para filtros en una sola fila -->
          <div class="filters-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-exchange-alt"></i>
                Tipo de Transacción
              </label>
              <select v-model="tipoFilter" class="filter-select">
                <option value="todos">Todos los tipos</option>
                <option value="ingreso">Solo Ingresos</option>
                <option value="egreso">Solo Egresos</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <i class="fas fa-tags"></i>
                Categoría
              </label>
              <select v-model="categoriaFilter" class="filter-select">
                <option value="todos">Todas las categorías</option>
                <option v-for="categoria in categorias" :key="categoria" :value="categoria">
                  {{ categoria }}
                </option>
              </select>
            </div>

            <!-- Período ocupa 2 columnas en pantallas grandes para acomodar los dos inputs -->
            <div class="filter-group xl:col-span-2">
              <label class="filter-label">
                <i class="fas fa-calendar-alt"></i>
                Período
              </label>
              <div class="date-range-container flex items-center space-x-2">
                <input type="date" v-model="fechaInicio" class="filter-input date-input flex-1" placeholder="Desde">
                <span class="date-separator text-sm text-gray-500">hasta</span>
                <input type="date" v-model="fechaFin" class="filter-input date-input flex-1" placeholder="Hasta">
              </div>
            </div>

            <!-- Rango de Monto ocupa 2 columnas en pantallas grandes -->
            <div class="filter-group xl:col-span-2">
              <label class="filter-label">
                <i class="fas fa-dollar-sign"></i>
                Rango de Monto
              </label>
              <div class="amount-range-container flex items-center space-x-2">
                <input type="number" v-model="montoMin" placeholder="Mínimo" class="filter-input amount-input flex-1"
                  step="0.01">
                <span class="amount-separator text-sm text-gray-500">a</span>
                <input type="number" v-model="montoMax" placeholder="Máximo" class="filter-input amount-input flex-1"
                  step="0.01">
              </div>
            </div>

            <!-- Búsqueda en una columna separada -->
            <div class="filter-group search-group">
              <label class="filter-label">
                <i class="fas fa-search"></i>
                Búsqueda
              </label>
              <div class="search-container relative">
                <input v-model="searchQuery" placeholder="Buscar..." class="filter-input search-input pr-10"
                  @keyup.enter="applyFilters">
                <va-button @click="applyFilters" icon="search">



                </va-button>
              </div>
            </div>
          </div>

          <div class="filter-actions flex justify-end space-x-2 pt-2">
            <va-button @click="applyFilters" color="primary" icon="check">


              Aplicar Filtros

            </va-button>
            <va-button @click="resetFilters" color="secondary" icon="times">


              Limpiar Filtros

            </va-button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-table-container" v-if="!loading">
      <div class="table-header">
        <div class="table-title">
          <h3>Lista de Transacciones</h3>
          <div class="results-info">
            {{ filteredTransacciones.length }} resultados encontrados
          </div>
        </div>
        <div class="table-actions">
          <div class="view-options">
            <va-button :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'" icon="table">
              Tabla
            </va-button>
            <va-button :class="{ active: viewMode === 'cards' }" @click="viewMode = 'cards'" icon="th-large">
              Tarjetas
            </va-button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-responsive">
        <vue-good-table
          ref="vueGoodTable"
          :columns="tableColumns"
          :rows="filteredTransacciones"
          max-height="60vh"
          :fixedHeader="true"
          :search-options="{
            enabled: true,
            placeholder: 'Buscar transacciones...',
            externalQuery: searchQuery
          }"
          :pagination-options="{
            enabled: true,
            mode: 'records',
            perPage: itemsPerPage,
            perPageDropdown: [5, 10, 25, 50],
            dropdownAllowAll: false,
            nextLabel: 'Siguiente',
            prevLabel: 'Anterior',
            rowsPerPageLabel: 'Filas por página',
            ofLabel: 'de',
            pageLabel: 'página',
            allLabel: 'Todos'
          }"
          :sort-options="{
            enabled: true,
            initialSortBy: { field: 'fecha', type: 'desc' }
          }"
          :select-options="{
            enabled: false
          }"
          styleClass="vgt-table striped bordered"
          theme="nocturnal"
        >
          <!-- Slot personalizado para cada celda -->
          <template #table-row="props">
            <!-- Columna de Fecha -->
            <span v-if="props.column.field === 'fecha'">
              <div class="date-display">
                {{ formatDate(props.row.fecha) }}
              </div>
            </span>

            <!-- Columna de Descripción -->
            <span v-else-if="props.column.field === 'descripcion'">
              <div class="description-content">
                <span class="description-text">{{ props.row.descripcion }}</span>
                <span v-if="props.row.referencia" class="reference-text">
                  Ref: {{ props.row.referencia }}
                </span>
              </div>
            </span>

            <!-- Columna de Tipo -->
            <span v-else-if="props.column.field === 'tipo'">
              <span :class="['type-badge', props.row.tipo]">
                <i :class="props.row.tipo === 'ingreso' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ formatTipo(props.row.tipo) }}
              </span>
            </span>

            <!-- Columna de Categoría -->
            <span v-else-if="props.column.field === 'categoria'">
              <span class="category-tag">{{ props.row.categoria }}</span>
            </span>

            <!-- Columna de Monto -->
            <span v-else-if="props.column.field === 'monto'">
              <div class="amount-display" :class="props.row.tipo">
                {{ formatCurrency(props.row.monto_total || props.row.monto) }}
              </div>
            </span>

            <!-- Columna de Acciones -->
            <span v-else-if="props.column.field === 'actions'">
              <div class="action-buttons">
                <va-button size="small" preset="plain" color="info" @click="verDetalles(props.row)"
                  title="Ver detalles" icon="eye" class="mr-1"></va-button>
                <va-button size="small" preset="plain" color="warning" @click="editarTransaccion(props.row)"
                  title="Editar" icon="edit" class="mr-1"></va-button>
                <va-button size="small" preset="plain" color="danger"
                  @click="eliminarTransaccion(props.row.id)"
                  :disabled="loadingDelete === props.row.id"
                  title="Eliminar" icon="delete"></va-button>
              </div>
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
                <span class="text-muted">Total: {{ filteredTransacciones.length }} transacciones</span>
              </div>
              <div class="table-actions-buttons">
                <va-button color="success" size="small" @click="exportData" icon="download" class="mr-2">
                  Exportar CSV
                </va-button>
                <va-button color="primary" size="small" @click="loadTransacciones" icon="refresh">
                  Recargar
                </va-button>
              </div>
            </div>
          </template>

          <!-- Mensaje cuando no hay datos -->
          <template #emptystate>
            <div class="text-center py-4">
              <i class="fas fa-money-bill-wave fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">No se encontraron transacciones</h5>
              <p class="text-muted">Intenta ajustar los filtros o crear una nueva transacción</p>
              <va-button color="primary" @click="showNuevaTransaccionModal = true" icon="plus">
                Nueva Transacción
              </va-button>
            </div>
          </template>
        </vue-good-table>
      </div>

      <!-- Cards View -->
      <div v-if="viewMode === 'cards'" class="cards-view">
        <div class="transaction-cards-grid">
          <div v-for="transaccion in paginatedTransacciones" :key="transaccion.id" class="transaction-card"
            @click="verDetalles(transaccion)">
            <div class="card-header">
              <span :class="['type-badge', transaccion.tipo]">
                <i :class="transaccion.tipo === 'ingreso' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ formatTipo(transaccion.tipo) }}
              </span>
            </div>
            <div class="card-content">
              <h4 class="transaction-description">{{ transaccion.descripcion }}</h4>
              <div class="transaction-details">
                <div class="detail-item">
                  <i class="fas fa-calendar-alt"></i>
                  {{ formatDate(transaccion.fecha) }}
                </div>
                <div class="detail-item">
                  <i class="fas fa-tags"></i>
                  {{ transaccion.categoria }}
                </div>
                <div v-if="transaccion.referencia" class="detail-item">
                  <i class="fas fa-hashtag"></i>
                  {{ transaccion.referencia }}
                </div>
              </div>
              <div class="transaction-amount" :class="transaccion.tipo">
                {{ formatCurrency(transaccion.monto_total || transaccion.monto) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTransacciones.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-inbox"></i>
          </div>
          <h3>No se encontraron transacciones</h3>
          <p>Intenta ajustar los filtros o crear una nueva transacción</p>
        </div>
      </div>
    </div>

    <!-- Modals  -->
    <!-- <TransaccionModal 
      v-if="showTransaccionModal" 
      :transaccion="selectedTransaccion"
      @close="closeTransaccionModal"
      @save="saveTransaccion"
    /> -->

    <!-- <NuevaTransaccionModal 
      v-if="showNuevaTransaccionModal"
      @close="showNuevaTransaccionModal = false"
      @save="addTransaccion"
    /> -->
  </div>
</template>

<script>
export { default } from './scripts/transacciones.js'
</script>

<style scoped src="@/assets/transacciones.css"></style>
