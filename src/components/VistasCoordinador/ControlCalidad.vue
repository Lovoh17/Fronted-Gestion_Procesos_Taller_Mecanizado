<template>
  <div class="produccion-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-clipboard-check"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Control de Calidad</h1>
            <p class="header-subtitle">Gestiona y supervisa la calidad de los planos de producción</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" @click="refreshData" :disabled="loading" icon="refresh">
            {{ loading ? 'Cargando...' : 'Actualizar' }}
          </va-button>
        </div>
      </div>
    </div>

    <!-- Loading State con animación mejorada -->
    <transition name="fade" mode="out-in">
      <div v-if="loading" class="loading-state">
        <div class="loading-container">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Cargando planos de producción...</p>
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
        <va-button @click="refreshData" class="retry-button">
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

    <!-- Blueprints Grid con animaciones escalonadas -->
    <transition name="fade" mode="out-in">
      <div v-if="!loading && !error && filteredItems.length > 0" class="blueprints-grid">
        <div v-for="(item, index) in filteredItems" :key="item.id" class="blueprint-card"
          :style="{ animationDelay: (index * 0.1) + 's' }" @click="openDetails(item)">
          <div class="blueprint-image">
            <img v-if="item.plano.imagen_url" :src="item.plano.imagen_url" :alt="`Plano ${item.plano.codigo}`"
              class="blueprint-img">
            <div v-else class="no-image">
              <i class="material-icons">image_not_supported</i>
              <span>Sin imagen</span>
            </div>
          </div>

          <div class="blueprint-content">
            <div class="blueprint-header">
              <h3 class="tool-name">{{ item.herramienta.nombre }}</h3>
              <span class="blueprint-code">{{ item.plano.codigo }}</span>
            </div>

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
        <p>No hay planos disponibles para revisar</p>
      </div>
    </transition>

    <!-- Modal de detalles usando componente separado -->
    <BlueprintDetailsModal :selectedItem="selectedItem" @close="selectedItem = null" @edit="handleEdit"
      @use="handleUse" />

  </div>
</template>

<script src="./scripts/ControlCalidad.js"></script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.4s ease;
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(-20px);
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 3px solid transparent;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 45px;
  height: 45px;
  top: 7.5px;
  left: 7.5px;
  border-top-color: #06b6d4;
  animation-duration: 1.8s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 30px;
  height: 30px;
  top: 15px;
  left: 15px;
  border-top-color: #8b5cf6;
  animation-duration: 0.8s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 20px;
  color: #64748b;
  font-size: 16px;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon i {
  font-size: 64px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-text {
  margin: 0 0 24px 0;
  color: #374151;
  font-size: 16px;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Results Summary */
.results-summary {
  margin-bottom: 24px;
  color: #64748b;
  font-size: 14px;
}

/* Blueprints Grid */
.blueprints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.blueprint-card {
  background: white;
  border-radius: 2px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  animation: slideInUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.blueprint-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.blueprint-image {
  height: 180px;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
}

.blueprint-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blueprint-card:hover .blueprint-img {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.no-image i {
  font-size: 48px;
  margin-bottom: 8px;
}

.blueprint-content {
  padding: 20px;
}

.blueprint-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
}

.tool-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.blueprint-code {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.blueprint-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.meta-item i {
  font-size: 18px;
  color: #9ca3af;
}

.blueprint-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag.version {
  background: #f0fdf4;
  color: #166534;
}

.card-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(59, 130, 246, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.blueprint-card:hover .card-hover-overlay {
  opacity: 1;
}

.card-hover-overlay i {
  font-size: 32px;
  margin-bottom: 8px;
}

.card-hover-overlay span {
  font-size: 14px;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon i {
  font-size: 64px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

/* Modal Styles */
.blueprint-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.modal-subtitle {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f1f5f9;
  color: #374151;
}

.modal-body {
  padding: 32px;
}

.details-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

.details-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.detail-title i {
  color: #3b82f6;
  font-size: 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  color: #374151;
}

.detail-value.highlight {
  font-weight: 600;
  color: #3b82f6;
}

.detail-description {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.activo {
  background: #dcfce7;
  color: #166534;
}

.status-badge.mantenimiento {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.blueprint-preview {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
}

.preview-container {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .blueprints-grid {
    grid-template-columns: 1fr;
  }

  .details-layout {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
}
</style>

<style src="src/assets/ControlCalidad.css"></style>
<style src="src/assets/EstiloBase.css"></style>