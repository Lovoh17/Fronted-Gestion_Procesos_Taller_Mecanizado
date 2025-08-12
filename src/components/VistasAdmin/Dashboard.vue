<template>
  <div class="dashboard-layout">
    <Sidebar :role="'admin'" />

    <!-- Contenido Principal del Dashboard -->
    <main class="dashboard-main">
      <!-- Header del Dashboard usando EstiloBase -->

      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <i class="fas fa-tachometer-alt"></i>
            </div>
            <div class="header-text">
              <h1 class="header-title">Dashboard Administrativo</h1>
              <p class="header-subtitle">Panel de control y gestión del taller de mecanizado</p>
            </div>
          </div>
          <div class="header-actions">
            <va-button color="#003366" @click="refreshData = true" :disabled="isLoading" icon="update">
              Actualizar
            </va-button>
          </div>
        </div>
      </div>

      <!-- Indicadores de Carga Global -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner-border" role="status">
          <span class="sr-only">Cargando...</span>
        </div>
      </div>

      <!-- Modal de Detalles del Pedido -->
      <OrderDetailsModal v-if="selectedOrder" :order="selectedOrder" @close="selectedOrder = null" />
    </main>
  </div>
</template>
<style src="src/assets/EstiloBase.css" scoped> </style>
<script></script>