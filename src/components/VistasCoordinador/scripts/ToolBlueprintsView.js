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