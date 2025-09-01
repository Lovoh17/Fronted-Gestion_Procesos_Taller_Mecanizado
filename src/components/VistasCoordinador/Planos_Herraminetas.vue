<template>
  <!-- Header -->
  <div class="header-section">
    <div class="header-content">
      <div class="header-info">
        <div class="header-icon">
          <i class="fas fa-tools"></i>
        </div>
        <div class="header-text">
          <h1 class="header-title">Planos de Herramientas</h1>
          <p class="subtitle">Gestiona y visualiza los planos de herramientas del sistema</p>
        </div>
      </div>
      <div class="header-actions">
        <va-button @click="showUploadModal = true" color="primary" icon="add">
          <span>Nueva herramienta</span>
        </va-button>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <transition name="fade" mode="out-in">
    <div v-if="loading" class="loading-state">
      <div class="loading-container">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Cargando planos de herramientas...</p>
      </div>
    </div>
  </transition>

  <!-- Error State -->
  <transition name="slide-up">
    <div v-if="error && !loading" class="error-state">
      <div class="error-icon">
        <i class="material-icons">error_outline</i>
      </div>
      <p class="error-text">{{ error }}</p>
      <va-button @click="fetchData" class="retry-button">
        <i class="material-icons">refresh</i>
        Reintentar
      </va-button>
    </div>
  </transition>

  <!-- Results Summary -->
  <transition name="slide-up">
    <div v-if="!loading && !error" class="results-summary">
      <p>Mostrando {{ filteredItems.length }} de {{ items.length }} planos</p>
    </div>
  </transition>

  <!-- Blueprints Grid -->
  <transition name="fade" mode="out-in">
    <div v-if="!loading && !error && filteredItems.length > 0" class="blueprints-grid">
      <div v-for="(item, index) in filteredItems" :key="item.id" class="blueprint-card"
        :style="{ animationDelay: (index * 0.1) + 's' }" @click="openDetails(item)">

        <!-- Header de la card -->
        <div class="blueprint-header">
          <div class="blueprint-content">
            <h3 class="tool-name">{{ item.herramienta.nombre }}</h3>
            <span class="blueprint-code">{{ item.plano.codigo }}</span>

            <div class="blueprint-meta">
              <div class="meta-item">
                <i class="material-icons">build</i>
                <span>{{ item.cantidad_necesaria }} unidades</span>
              </div>
              <div class="meta-item">
                <i class="material-icons">schedule</i>
                <span>{{ item.tiempo_estimado_uso }}h</span>
              </div>
            </div>

            <div class="blueprint-tags">
              <span class="tag version" v-if="item.plano.version">
                v{{ item.plano.version }}
              </span>
            </div>
          </div>
        </div>

        <!-- Overlay de hover -->
        <div class="card-hover-overlay">
          <i class="material-icons">visibility</i>
          <span>Ver detalles</span>
        </div>
      </div>
    </div>
  </transition>

  <!-- Empty State -->
  <transition name="scale-fade">
    <div v-if="!loading && !error && filteredItems.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="material-icons">search_off</i>
      </div>
      <h3>No se encontraron resultados</h3>
      <p>Intenta con otros términos de búsqueda</p>
    </div>
  </transition>

  <!-- Modal de detalles (componente separado) -->
  <ModalDetallesPlanoHerramienta :blueprint-item="selectedItem" @cerrar="selectedItem = null" @editar="editarPlano" />

  <!-- Modal de Subida de Archivos (Componente separado) -->
  <transition name="modal">
    <UploadBlueprintModal v-if="showUploadModal" @close="showUploadModal = false"
      @upload-success="handleUploadSuccess" />
  </transition>
</template>


<script src="./scripts/ToolBlueprintsView.js"></script>
<style src="./styles/ToolBlueprintsView.css" ></style>
<style src="src/assets/Herramientas.css"></style>
<style src="/src/assets/EstiloBase.css" ></style>