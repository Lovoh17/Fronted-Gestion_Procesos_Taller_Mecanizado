<template>
  <div class="tool-blueprints-view">
    <!-- Header con animación de entrada -->
    <div class="header" data-aos="fade-down">
      <div class="title-section">
        <h2>
          <i class="material-icons">architecture</i>
          Planos de Herramientas
        </h2>
        <p class="subtitle">Gestiona y visualiza los planos de herramientas del sistema</p>
      </div>
      <div class="header-actions">
        <va-button @click="showUploadModal = true" class="upload-button">

          <i class="material-icons">upload_file</i>
          Subir Plano

        </va-button>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Buscar por nombre de herramienta o código de plano..."
            class="search-input">
          <i class="material-icons search-icon">search</i>
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
        <p>Intenta con otros términos de búsqueda</p>
      </div>
    </transition>

    <!-- Modal de detalles -->
    <transition name="modal">
      <div v-if="selectedItem" class="blueprint-modal" @click.self="selectedItem = null">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <h3>{{ selectedItem.herramienta.nombre }}</h3>
              <span class="modal-subtitle">{{ selectedItem.plano.codigo }}</span>
            </div>
            <va-button @click="selectedItem = null" class="close-button">

              <i class="material-icons">close</i>

            </va-button>
          </div>

          <div class="modal-body">
            <div class="details-layout">
              <div class="details-left">
                <div class="detail-card" data-aos="fade-right" data-aos-delay="100">
                  <h4 class="detail-title">
                    <i class="material-icons">description</i>
                    Información del Plano
                  </h4>
                  <div class="detail-content">
                    <div class="detail-item">
                      <label>Código</label>
                      <span class="detail-value">{{ selectedItem.plano.codigo }}</span>
                    </div>
                    <div class="detail-item">
                      <label>Versión</label>
                      <span class="detail-value">{{ selectedItem.plano.version || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <label>Descripción</label>
                      <p class="detail-description">{{ selectedItem.plano.descripcion || 'Sin descripción disponible' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="detail-card" data-aos="fade-right" data-aos-delay="200">
                  <h4 class="detail-title">
                    <i class="material-icons">build</i>
                    Información de Herramienta
                  </h4>
                  <div class="detail-content">
                    <div class="detail-item">
                      <label>Nombre</label>
                      <span class="detail-value">{{ selectedItem.herramienta.nombre }}</span>
                    </div>
                    <div class="detail-item">
                      <label>Código</label>
                      <span class="detail-value">{{ selectedItem.herramienta.codigo }}</span>
                    </div>
                    <div class="detail-item">
                      <label>Estado</label>
                      <span class="detail-value">
                        <span :class="['status-badge', selectedItem.herramienta.estado.toLowerCase()]">
                          {{ selectedItem.herramienta.estado }}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="detail-card" data-aos="fade-right" data-aos-delay="300">
                  <h4 class="detail-title">
                    <i class="material-icons">settings</i>
                    Especificaciones de Uso
                  </h4>
                  <div class="detail-content">
                    <div class="detail-item">
                      <label>Cantidad necesaria</label>
                      <span class="detail-value highlight">{{ selectedItem.cantidad_necesaria }} unidades</span>
                    </div>
                    <div class="detail-item">
                      <label>Tiempo estimado</label>
                      <span class="detail-value highlight">{{ selectedItem.tiempo_estimado_uso }} horas</span>
                    </div>
                    <div class="detail-item" v-if="selectedItem.notas">
                      <label>Notas</label>
                      <p class="detail-description">{{ selectedItem.notas }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="details-right" v-if="selectedItem.plano.imagen_url" data-aos="fade-left" data-aos-delay="400">
                <div class="blueprint-preview">
                  <h4 class="detail-title">
                    <i class="material-icons">image</i>
                    Vista Previa del Plano
                  </h4>
                  <div class="preview-container">
                    <img :src="selectedItem.plano.imagen_url" :alt="`Plano ${selectedItem.plano.codigo}`"
                      class="preview-image">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Subida de Archivos -->
    <transition name="modal">
      <div v-if="showUploadModal" class="upload-modal" @click.self="closeUploadModal">
        <div class="upload-modal-content">
          <div class="upload-modal-header">
            <div class="upload-modal-title">
              <i class="material-icons">upload_file</i>
              <h3>Subir Plano de Herramienta</h3>
            </div>
            <va-button @click="closeUploadModal" class="close-button">

              <i class="material-icons">close</i>

            </va-button>
          </div>

          <div class="upload-modal-body">
            <!-- Formulario de información básica -->
            <div class="upload-form-section" data-aos="fade-up" data-aos-delay="100">
              <h4 class="section-title">Información del Plano</h4>
              <div class="form-grid">
                <div class="form-field">
                  <label for="codigo">Código del Plano *</label>
                  <input type="text" id="codigo" v-model="uploadForm.codigo" placeholder="Ej: PLN-001"
                    class="form-input" :class="{ error: uploadForm.errors.codigo }">
                  <span v-if="uploadForm.errors.codigo" class="error-message">{{ uploadForm.errors.codigo }}</span>
                </div>

                <div class="form-field">
                  <label for="version">Versión</label>
                  <input type="text" id="version" v-model="uploadForm.version" placeholder="Ej: 1.0" class="form-input">
                </div>

                <div class="form-field full-width">
                  <label for="descripcion">Descripción</label>
                  <textarea id="descripcion" v-model="uploadForm.descripcion"
                    placeholder="Descripción detallada del plano..." rows="3" class="form-textarea"></textarea>
                </div>
              </div>
            </div>

            <!-- Zona de subida de archivos -->
            <div class="upload-form-section" data-aos="fade-up" data-aos-delay="200">
              <h4 class="section-title">Archivo del Plano</h4>
              <div class="upload-zone" :class="{
                'drag-over': isDragOver,
                'has-file': uploadForm.selectedFile,
                'error': uploadForm.errors.file
              }" @drop="handleDrop" @dragover.prevent="isDragOver = true" @dragleave="isDragOver = false"
                @click="$refs.fileInput.click()">
                <!-- Estado sin archivo -->
                <div v-if="!uploadForm.selectedFile" class="upload-placeholder">
                  <i class="material-icons upload-icon">cloud_upload</i>
                  <h4>Arrastra tu archivo aquí o haz clic para seleccionar</h4>
                  <p>Formatos aceptados: PDF, DOC, DOCX</p>
                  <p class="file-size-limit">Tamaño máximo: 10MB</p>
                </div>

                <!-- Estado con archivo seleccionado -->
                <div v-else class="file-preview">
                  <div class="file-info">
                    <i class="material-icons file-icon" :class="getFileIconClass(uploadForm.selectedFile.type)">
                      {{ getFileIcon(uploadForm.selectedFile.type) }}
                    </i>
                    <div class="file-details">
                      <h4>{{ uploadForm.selectedFile.name }}</h4>
                      <p>{{ formatFileSize(uploadForm.selectedFile.size) }} • {{
                        getFileType(uploadForm.selectedFile.type) }}</p>
                    </div>
                  </div>
                  <va-button @click.stop="removeFile" class="remove-file-button">

                    <i class="material-icons">close</i>

                  </va-button>
                </div>
              </div>

              <input ref="fileInput" type="file" accept=".pdf,.doc,.docx" @change="handleFileSelect"
                style="display: none">
              <span v-if="uploadForm.errors.file" class="error-message">{{ uploadForm.errors.file }}</span>
            </div>

            <!-- Barra de progreso -->
            <transition name="slide-down">
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress-section">
                <div class="progress-info">
                  <span>Subiendo archivo...</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
              </div>
            </transition>
          </div>

          <div class="upload-modal-footer">
            <va-button @click="closeUploadModal" class="cancel-button" :disabled="uploading">
              Cancelar
            </va-button>
            <va-button @click="handleUpload" class="upload-submit-button" :disabled="!canSubmit || uploading">

              <i v-if="uploading" class="material-icons spin">autorenew</i>
              <i v-else class="material-icons">upload</i>
              {{ uploading ? 'Subiendo...' : 'Subir Plano' }}

            </va-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


<style src="./styles/ToolBlueprintsView.css" scoped></style>
<script src="./scripts/ToolBlueprintsView.js"></script>
<style src="src/assets/EstiloBase.css" scoped></style>