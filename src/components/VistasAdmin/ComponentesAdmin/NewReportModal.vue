<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3><i class="fas fa-plus-circle"></i> Nuevo Reporte</h3>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>Tipo de Reporte <span class="required">*</span></label>
              <select v-model="form.type" class="form-control" required>
                <option value="">Seleccionar tipo...</option>
                <option value="materiales">Falta de Materiales</option>
                <option value="herramientas">Mantenimiento de Herramientas</option>
                <option value="incidentes">Incidente de Seguridad</option>
                <option value="produccion">Retraso en Producción</option>
                <option value="calidad">Problema de Calidad</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Título <span class="required">*</span></label>
              <input v-model="form.title" type="text" class="form-control" required 
                     placeholder="Ej: Falta de varillas de acero">
            </div>
            
            <div class="form-group">
              <label>Descripción <span class="required">*</span></label>
              <textarea v-model="form.description" class="form-control" rows="4" required
                        placeholder="Describe el problema o situación con detalle"></textarea>
            </div>
            
            <div class="form-group">
              <label>Prioridad <span class="required">*</span></label>
              <div class="priority-options">
                <label class="priority-option">
                  <input type="radio" v-model="form.priority" value="high" required>
                  <span class="priority-badge high">
                    <i class="fas fa-exclamation-triangle"></i> Alta
                  </span>
                </label>
                <label class="priority-option">
                  <input type="radio" v-model="form.priority" value="medium">
                  <span class="priority-badge medium">
                    <i class="fas fa-exclamation-circle"></i> Media
                  </span>
                </label>
                <label class="priority-option">
                  <input type="radio" v-model="form.priority" value="low">
                  <span class="priority-badge low">
                    <i class="fas fa-info-circle"></i> Baja
                  </span>
                </label>
              </div>
            </div>
            
            <!-- Campos específicos por tipo de reporte -->
            <div v-if="form.type === 'materiales'" class="specific-fields">
              <div class="form-group">
                <label>Material faltante <span class="required">*</span></label>
                <input v-model="form.material" type="text" class="form-control" required>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Cantidad <span class="required">*</span></label>
                  <input v-model="form.quantity" type="number" class="form-control" required min="1">
                </div>
                
                <div class="form-group">
                  <label>Unidad de medida <span class="required">*</span></label>
                  <select v-model="form.unit" class="form-control" required>
                    <option value="">Seleccionar...</option>
                    <option value="unidades">Unidades</option>
                    <option value="metros">Metros</option>
                    <option value="litros">Litros</option>
                    <option value="kilogramos">Kilogramos</option>
                    <option value="cajas">Cajas</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Proveedor</label>
                <input v-model="form.supplier" type="text" class="form-control">
              </div>
            </div>
            
            <div v-else-if="form.type === 'herramientas'" class="specific-fields">
              <div class="form-group">
                <label>Herramienta <span class="required">*</span></label>
                <input v-model="form.tool" type="text" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label>Problema detectado <span class="required">*</span></label>
                <textarea v-model="form.issue" class="form-control" rows="3" required></textarea>
              </div>
              
              <div class="form-group">
                <label>Tiempo estimado de reparación</label>
                <input v-model="form.estimatedRepairTime" type="text" class="form-control" 
                       placeholder="Ej: 2 horas, 1 día">
              </div>
            </div>
            
            <div v-else-if="form.type === 'incidentes'" class="specific-fields">
              <div class="form-group">
                <label>Tipo de incidente <span class="required">*</span></label>
                <select v-model="form.incidentType" class="form-control" required>
                  <option value="">Seleccionar...</option>
                  <option value="seguridad">Seguridad</option>
                  <option value="salud">Salud</option>
                  <option value="equipo">Daño a equipo</option>
                  <option value="ambiente">Medio ambiente</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Severidad <span class="required">*</span></label>
                <select v-model="form.severity" class="form-control" required>
                  <option value="">Seleccionar...</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Ubicación</label>
                <input v-model="form.location" type="text" class="form-control">
              </div>
            </div>
            
            <div class="form-group">
              <label>Adjuntar archivos</label>
              <div class="file-upload">
                <input type="file" id="fileInput" ref="fileInput" multiple @change="handleFileUpload">
                <label for="fileInput" class="upload-btn">
                  <i class="fas fa-cloud-upload-alt"></i> Seleccionar archivos
                </label>
                <div class="file-list" v-if="form.attachments.length > 0">
                  <div v-for="(file, index) in form.attachments" :key="index" class="file-item">
                    <i class="fas" :class="getFileIcon(file.type)"></i>
                    <span class="file-name">{{ file.name }}</span>
                    <button type="button" class="btn-remove" @click="removeFile(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Etiquetas (opcional)</label>
              <div class="tags-input">
                <input 
                  type="text" 
                  v-model="tagInput" 
                  @keydown.enter.prevent="addTag"
                  @keydown.backspace="removeLastTag"
                  placeholder="Escribe y presiona Enter para agregar"
                  class="form-control"
                >
                <div class="tags-list">
                  <span v-for="(tag, index) in form.tags" :key="index" class="tag">
                    {{ tag }}
                    <button type="button" @click="removeTag(index)" class="tag-remove">
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <i class="fas fa-save"></i> 
                {{ isSubmitting ? 'Guardando...' : 'Guardar Reporte' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="closeModal" :disabled="isSubmitting">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NewReportModal',
    props: {
      employees: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        form: {
          type: '',
          title: '',
          description: '',
          priority: 'medium',
          material: '',
          quantity: null,
          unit: '',
          supplier: '',
          tool: '',
          issue: '',
          estimatedRepairTime: '',
          incidentType: '',
          severity: '',
          location: '',
          attachments: [],
          tags: []
        },
        tagInput: '',
        isSubmitting: false
      }
    },
    methods: {
      closeModal() {
        this.$emit('close')
      },
      submitForm() {
        this.isSubmitting = true
        
        // Simular envío a API
        setTimeout(() => {
          const newReport = {
            ...this.form,
            id: Math.floor(Math.random() * 1000) + 100, // ID temporal
            employee: 'Usuario Actual', // En una app real sería el usuario autenticado
            department: 'Departamento Actual',
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
          }
          
          this.$emit('save', newReport)
          this.isSubmitting = false
        }, 1000)
      },
      handleFileUpload(event) {
        const files = event.target.files
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileType = this.getFileType(file.type)
          this.form.attachments.push({
            name: file.name,
            type: fileType,
            size: file.size,
            file: file
          })
        }
      },
      getFileType(mimeType) {
        if (mimeType.includes('pdf')) return 'pdf'
        if (mimeType.includes('image')) return 'image'
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'excel'
        if (mimeType.includes('word')) return 'word'
        if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive'
        return 'file'
      },
      removeFile(index) {
        this.form.attachments.splice(index, 1)
      },
      addTag() {
        if (this.tagInput.trim() && !this.form.tags.includes(this.tagInput.trim())) {
          this.form.tags.push(this.tagInput.trim())
          this.tagInput = ''
        }
      },
      removeTag(index) {
        this.form.tags.splice(index, 1)
      },
      removeLastTag() {
        if (this.tagInput === '' && this.form.tags.length > 0) {
          this.form.tags.pop()
        }
      },
      getFileIcon(type) {
        const icons = {
          'pdf': 'fa-file-pdf',
          'image': 'fa-file-image',
          'excel': 'fa-file-excel',
          'word': 'fa-file-word',
          'archive': 'fa-file-archive'
        }
        return icons[type] || 'fa-file'
      }
    }
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }
  
  .modal-container {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.25rem;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .required {
    color: #dc3545;
  }
  
  .form-control {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .form-control:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  textarea.form-control {
    min-height: 100px;
    resize: vertical;
  }
  
  .priority-options {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .priority-option {
    position: relative;
  }
  
  .priority-option input[type="radio"] {
    position: absolute;
    opacity: 0;
  }
  
  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .priority-option input[type="radio"]:checked + .priority-badge {
    transform: scale(1.05);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
  }
  
  .priority-badge.high {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .priority-badge.medium {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .priority-badge.low {
    background-color: #d4edda;
    color: #155724;
  }
  
  .form-row {
    display: flex;
    gap: 1rem;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .specific-fields {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .file-upload {
    margin-top: 0.5rem;
  }
  
  #fileInput {
    display: none;
  }
  
  .upload-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.875rem;
  }
  
  .upload-btn:hover {
    background-color: #dee2e6;
  }
  
  .file-list {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .btn-remove {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    margin-left: auto;
  }
  
  .tags-input {
    margin-top: 0.5rem;
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background-color: #e9ecef;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }
  
  .tag-remove {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    font-size: 0.625rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 0;
    }
    
    .priority-options {
      flex-direction: column;
    }
    
    .priority-badge {
      justify-content: center;
    }
    
    .form-actions {
      flex-direction: column-reverse;
    }
    
    .form-actions button {
      width: 100%;
    }
  }
  </style>