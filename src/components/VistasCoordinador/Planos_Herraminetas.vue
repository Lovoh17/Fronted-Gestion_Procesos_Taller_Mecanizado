<template>
  <div class="tool-blueprints-view">
    <div class="header">
      <div class="title-section">
        <h2>
          <i class="material-icons">architecture</i> 
          Planos de Herramientas
        </h2>
        <p class="subtitle">Gestiona y visualiza los planos de herramientas del sistema</p>
      </div>
      <div class="header-actions">
        <button @click="showUploadModal = true" class="upload-button">
          <i class="material-icons">upload_file</i>
          Subir Plano
        </button>
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por nombre de herramienta o código de plano..."
            class="search-input"
          >
          <i class="material-icons search-icon">search</i>
        </div>
      </div>
    </div>

    <div class="loading-state" v-if="loading">
      <div class="loading-spinner">
        <i class="material-icons spin">autorenew</i>
      </div>
      <p class="loading-text">Cargando datos...</p>
    </div>

    <div class="error-state" v-if="error">
      <div class="error-icon">
        <i class="material-icons">error_outline</i>
      </div>
      <p class="error-text">{{ error }}</p>
      <button @click="fetchData" class="retry-button">
        <i class="material-icons">refresh</i>
        Reintentar
      </button>
    </div>

    <div class="results-summary" v-if="!loading && !error">
      <p>Mostrando {{ filteredItems.length }} de {{ items.length }} planos</p>
    </div>

    <div class="blueprints-grid" v-if="!loading && !error && filteredItems.length > 0">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="blueprint-card"
        @click="openDetails(item)"
      >
        <div class="blueprint-image">
          <img 
            v-if="item.plano.imagen_url" 
            :src="item.plano.imagen_url" 
            :alt="`Plano ${item.plano.codigo}`"
            class="blueprint-img"
          >
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

    <div class="empty-state" v-if="!loading && !error && filteredItems.length === 0">
      <div class="empty-icon">
        <i class="material-icons">search_off</i>
      </div>
      <h3>No se encontraron resultados</h3>
      <p>Intenta con otros términos de búsqueda</p>
    </div>

    <!-- Modal de detalles -->
    <div v-if="selectedItem" class="blueprint-modal" @click.self="selectedItem = null">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <h3>{{ selectedItem.herramienta.nombre }}</h3>
            <span class="modal-subtitle">{{ selectedItem.plano.codigo }}</span>
          </div>
          <button @click="selectedItem = null" class="close-button">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="details-layout">
            <div class="details-left">
              <div class="detail-card">
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
                    <p class="detail-description">{{ selectedItem.plano.descripcion || 'Sin descripción disponible' }}</p>
                  </div>
                </div>
              </div>

              <div class="detail-card">
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

              <div class="detail-card">
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

            <div class="details-right" v-if="selectedItem.plano.imagen_url">
              <div class="blueprint-preview">
                <h4 class="detail-title">
                  <i class="material-icons">image</i>
                  Vista Previa del Plano
                </h4>
                <div class="preview-container">
                  <img 
                    :src="selectedItem.plano.imagen_url" 
                    :alt="`Plano ${selectedItem.plano.codigo}`"
                    class="preview-image"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Subida de Archivos -->
    <div v-if="showUploadModal" class="upload-modal" @click.self="closeUploadModal">
      <div class="upload-modal-content">
        <div class="upload-modal-header">
          <div class="upload-modal-title">
            <i class="material-icons">upload_file</i>
            <h3>Subir Plano de Herramienta</h3>
          </div>
          <button @click="closeUploadModal" class="close-button">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="upload-modal-body">
          <!-- Formulario de información básica -->
          <div class="upload-form-section">
            <h4 class="section-title">Información del Plano</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="codigo">Código del Plano *</label>
                <input 
                  type="text" 
                  id="codigo"
                  v-model="uploadForm.codigo" 
                  placeholder="Ej: PLN-001"
                  class="form-input"
                  :class="{ error: uploadForm.errors.codigo }"
                >
                <span v-if="uploadForm.errors.codigo" class="error-message">{{ uploadForm.errors.codigo }}</span>
              </div>
              
              <div class="form-field">
                <label for="version">Versión</label>
                <input 
                  type="text" 
                  id="version"
                  v-model="uploadForm.version" 
                  placeholder="Ej: 1.0"
                  class="form-input"
                >
              </div>
              
              <div class="form-field full-width">
                <label for="descripcion">Descripción</label>
                <textarea 
                  id="descripcion"
                  v-model="uploadForm.descripcion" 
                  placeholder="Descripción detallada del plano..."
                  rows="3"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Zona de subida de archivos -->
          <div class="upload-form-section">
            <h4 class="section-title">Archivo del Plano</h4>
            <div class="upload-zone" 
                 :class="{ 
                   'drag-over': isDragOver, 
                   'has-file': uploadForm.selectedFile,
                   'error': uploadForm.errors.file 
                 }"
                 @drop="handleDrop"
                 @dragover.prevent="isDragOver = true"
                 @dragleave="isDragOver = false"
                 @click="$refs.fileInput.click()"
            >
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
                    <p>{{ formatFileSize(uploadForm.selectedFile.size) }} • {{ getFileType(uploadForm.selectedFile.type) }}</p>
                  </div>
                </div>
                <button @click.stop="removeFile" class="remove-file-button">
                  <i class="material-icons">close</i>
                </button>
              </div>
            </div>
            
            <input 
              ref="fileInput"
              type="file" 
              accept=".pdf,.doc,.docx"
              @change="handleFileSelect"
              style="display: none"
            >
            
            <span v-if="uploadForm.errors.file" class="error-message">{{ uploadForm.errors.file }}</span>
          </div>

          <!-- Barra de progreso -->
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress-section">
            <div class="progress-info">
              <span>Subiendo archivo...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="upload-modal-footer">
          <button @click="closeUploadModal" class="cancel-button" :disabled="uploading">
            Cancelar
          </button>
          <button @click="handleUpload" class="upload-submit-button" :disabled="!canSubmit || uploading">
            <i v-if="uploading" class="material-icons spin">autorenew</i>
            <i v-else class="material-icons">upload</i>
            {{ uploading ? 'Subiendo...' : 'Subir Plano' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./scripts/ToolBlueprintsView.js"></script>

<style src="./styles/ToolBlueprintsView.css" scoped></style>