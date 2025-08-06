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

<script>
import axios from 'axios';

export default {
  name: 'ToolBlueprintsView',
  data() {
    return {
      items: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedItem: null,
      showUploadModal: false,
      isDragOver: false,
      uploading: false,
      uploadProgress: 0,
      uploadForm: {
        codigo: '',
        version: '',
        descripcion: '',
        selectedFile: null,
        errors: {}
      }
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.items;
      
      const query = this.searchQuery.toLowerCase();
      return this.items.filter(item => {
        return (
          item.herramienta.nombre.toLowerCase().includes(query) ||
          item.plano.codigo.toLowerCase().includes(query) ||
          (item.plano.descripcion && item.plano.descripcion.toLowerCase().includes(query)) ||
          item.herramienta.codigo.toLowerCase().includes(query)
        );
      });
    },
    canSubmit() {
      return this.uploadForm.codigo.trim() && this.uploadForm.selectedFile && !this.uploading;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      try {
        const [relacionesRes, planosRes, herramientasRes] = await Promise.all([
          axios.get('/api/Plano_Herramienta'),
          axios.get('/api/Plano'),
          axios.get('/api/Herramienta')
        ]);

        this.items = relacionesRes.data.map(relacion => {
          const plano = planosRes.data.find(p => p.id === relacion.plano_id);
          const herramienta = herramientasRes.data.find(h => h.id === relacion.herramienta_id);
          
          return {
            ...relacion,
            plano: {
              id: plano?.id,
              codigo: plano?.codigo || 'N/A',
              descripcion: plano?.descripcion,
              imagen_url: plano?.imagen_url,
              version: plano?.version
            },
            herramienta: {
              id: herramienta?.id,
              nombre: herramienta?.nombre || 'Desconocida',
              codigo: herramienta?.codigo || 'N/A',
              estado: herramienta?.estado || 'N/A'
            }
          };
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        this.error = 'Error al cargar los datos. Por favor, intente nuevamente.';
      } finally {
        this.loading = false;
      }
    },
    
    openDetails(item) {
      this.selectedItem = item;
    },
    
    // Métodos para el modal de subida
    closeUploadModal() {
      this.showUploadModal = false;
      this.resetUploadForm();
    },
    
    resetUploadForm() {
      this.uploadForm = {
        codigo: '',
        version: '',
        descripcion: '',
        selectedFile: null,
        errors: {}
      };
      this.uploadProgress = 0;
      this.isDragOver = false;
      this.uploading = false;
    },
    
    handleDrop(e) {
      e.preventDefault();
      this.isDragOver = false;
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    },
    
    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },
    
    processFile(file) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        this.uploadForm.errors.file = 'Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX.';
        return;
      }
      
      // Validar tamaño (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadForm.errors.file = 'El archivo es demasiado grande. Tamaño máximo: 10MB.';
        return;
      }
      
      // Limpiar errores y establecer archivo
      this.uploadForm.errors.file = '';
      this.uploadForm.selectedFile = file;
    },
    
    removeFile() {
      this.uploadForm.selectedFile = null;
      this.uploadForm.errors.file = '';
    },
    
    validateForm() {
      const errors = {};
      
      if (!this.uploadForm.codigo.trim()) {
        errors.codigo = 'El código del plano es requerido.';
      }
      
      if (!this.uploadForm.selectedFile) {
        errors.file = 'Debe seleccionar un archivo.';
      }
      
      this.uploadForm.errors = errors;
      return Object.keys(errors).length === 0;
    },
    
    async handleUpload() {
      if (!this.validateForm()) return;
      
      this.uploading = true;
      this.uploadProgress = 0;
      
      try {
        const formData = new FormData();
        formData.append('codigo', this.uploadForm.codigo);
        formData.append('version', this.uploadForm.version);
        formData.append('descripcion', this.uploadForm.descripcion);
        formData.append('archivo', this.uploadForm.selectedFile);
        
        const response = await axios.post('/api/Plano/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }
        });
        
        // Simular progreso completo
        this.uploadProgress = 100;
        
        // Mostrar mensaje de éxito
        this.$toast?.success?.('Plano subido exitosamente') || 
        alert('Plano subido exitosamente');
        
        // Recargar datos y cerrar modal
        await this.fetchData();
        this.closeUploadModal();
        
      } catch (error) {
        console.error('Error uploading file:', error);
        const errorMessage = error.response?.data?.message || 'Error al subir el archivo';
        this.$toast?.error?.(errorMessage) || alert(errorMessage);
      } finally {
        this.uploading = false;
      }
    },
    
    // Utilidades para archivos
    getFileIcon(mimeType) {
      switch (mimeType) {
        case 'application/pdf':
          return 'picture_as_pdf';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'description';
        default:
          return 'insert_drive_file';
      }
    },
    
    getFileIconClass(mimeType) {
      switch (mimeType) {
        case 'application/pdf':
          return 'pdf-icon';
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'doc-icon';
        default:
          return 'file-icon';
      }
    },
    
    getFileType(mimeType) {
      switch (mimeType) {
        case 'application/pdf':
          return 'PDF';
        case 'application/msword':
          return 'DOC';
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'DOCX';
        default:
          return 'Archivo';
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    }
  }
};
</script>

<style scoped>

/* Estilos base existentes */
.tool-blueprints-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--background-color);
  min-height: 100vh;
}

/* Header actualizado */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.upload-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.title-section h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.title-section h2 .material-icons {
  color: var(--primary-color);
  font-size: 2rem;
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

/* Barra de búsqueda */
.search-bar {
  position: relative;
  min-width: 320px;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: 1rem;
  background-color: var(--card-background);
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

/* Estilos del modal de subida */
.upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(128, 128, 128, 0.5); /* Fondo gris claro semi-transparente */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.upload-modal-content {
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  background-color: rgb(255, 243, 243); /* Fondo gris claro semi-transparente */
  width: 90%; /* Reducido de 100% */
  max-width: 600px; /* Reducido de 700px */
  max-height: 80vh; /* Reducido de 90vh */
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: modalSlideIn 0.3s ease-out;
}

.upload-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.upload-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-modal-title i {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.upload-modal-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: var(--transition);
}

.close-button:hover {
  background: var(--background-color);
  color: var(--text-primary);
}

.upload-modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 180px);
}

.upload-form-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: var(--card-background);
  transition: var(--transition);
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(194, 194, 194, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 4px;
}

/* Zona de subida de archivos */
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: var(--background-color);
  position: relative;
}

.upload-zone:hover {
  border-color: var(--primary-color);
  background: rgba(194, 194, 194, 0.05);
}

.upload-zone.drag-over {
  border-color: var(--primary-color);
  background: rgba(194, 194, 194, 0.1);
  transform: scale(1.02);
}

.upload-zone.has-file {
  border-style: solid;
  border-color: var(--success-color);
  background: rgba(16, 185, 129, 0.05);
}

.upload-zone.error {
  border-color: var(--error-color);
  background: rgba(239, 68, 68, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.upload-placeholder h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.upload-placeholder p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.file-size-limit {
  font-size: 0.8rem !important;
  opacity: 0.7;
}

/* Preview del archivo */
.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--card-background);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 2rem;
}

.file-icon.pdf-icon {
  color: #dc2626;
}

.file-icon.doc-icon {
  color: #2563eb;
}

.file-details h4 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.file-details p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.remove-file-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--error-color);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.remove-file-button:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* Barra de progreso */
.upload-progress-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--background-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* Footer del modal */
.upload-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
}

.cancel-button {
  padding: 12px 24px;
  border: 2px solid var(--border-color);
  background: var(--card-background);
  color: var(--text-secondary);
  border-radius: var(--border-radius);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.cancel-button:hover:not(:disabled) {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-submit-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.upload-submit-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.upload-submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Resto de estilos existentes */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 16px;
}

.loading-spinner .material-icons {
  font-size: 3rem;
  color: var(--primary-color);
}

.loading-text {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.error-icon .material-icons {
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: 16px;
}

.error-text {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0 0 24px 0;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.retry-button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.results-summary {
  margin-bottom: 24px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.blueprints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.blueprint-card {
  position: relative;
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.blueprint-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.blueprint-card:hover .card-hover-overlay {
  opacity: 1;
}

.blueprint-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.blueprint-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
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
  color: var(--text-secondary);
}

.no-image .material-icons {
  font-size: 3rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

.card-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e2e2e2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: var(--transition);
}

.card-hover-overlay .material-icons {
  font-size: 2rem;
  margin-bottom: 8px;
}

.blueprint-content {
  padding: 20px;
}

.blueprint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.tool-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.blueprint-code {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.blueprint-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.meta-item .material-icons {
  font-size: 1.1rem;
}

.blueprint-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.tag.version {
  background: var(--background-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon .material-icons {
  font-size: 4rem;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

/* Modal de detalles */
.blueprint-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.modal-title h3 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-body {
  padding: 0 24px 24px 24px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.details-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
}

.details-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  background: var(--background-color);
  border-radius: var(--border-radius);
  padding: 20px;
  border: 1px solid var(--border-color);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-title .material-icons {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: var(--text-primary);
  font-size: 1rem;
}

.detail-value.highlight {
  font-weight: 600;
  color: var(--primary-color);
}

.detail-description {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.activa {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-badge.inactiva {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.blueprint-preview {
  position: sticky;
  top: 0;
}

.preview-container {
  border-radius: var(--border-radius);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--background-color);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

/* Animaciones */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 1200px) {
  .details-layout {
    grid-template-columns: 1fr;
  }
  
  .details-right {
    order: -1;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .tool-blueprints-view {
    padding: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .upload-button {
    width: 100%;
    justify-content: center;
  }
  
  .search-bar {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
  
  .blueprints-grid {
    grid-template-columns: 1fr;
  }
  
  .blueprint-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .blueprint-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .upload-modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }
  
  .upload-modal-header,
  .upload-modal-body,
  .upload-modal-footer {
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-modal-footer {
    flex-direction: column;
  }
  
  .title-section h2 {
    font-size: 1.5rem;
  }
  
  .title-section h2 .material-icons {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .blueprint-content {
    padding: 16px;
  }
  
  .search-input {
    padding: 10px 12px 10px 40px;
  }
  
  .search-icon {
    left: 12px;
  }
  
  .upload-zone {
    padding: 30px 15px;
  }
  
  .upload-placeholder h4 {
    font-size: 1rem;
  }
  
  .upload-placeholder p {
    font-size: 0.8rem;
  }
}
</style>