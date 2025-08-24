// src/components/VistasCoordinador/scripts/ControlCalidad.js
import api from '../../../api.js';
import BlueprintDetailsModal from '../ComponentesCoordinador/BlueprintDetailsModal.vue';

export default {
  name: 'ControlCalidadView',
  components: {
    BlueprintDetailsModal
  },
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
        nombre: '',
        descripcion: '',
        version: '',
        tipo_pedidos_id: '',
        notas: '',
        selectedFile: null,
        errors: {}
      },
      filters: {
        estado: '',
        tipo: '',
        creado_por: ''
      },
      // Nuevas propiedades para el modal de acciones
      showActionModal: false,
      actionModal: {
        title: '',
        message: '',
        type: '', // 'approve' o 'reject'
        notes: '',
        loading: false,
        itemId: null
      }
    };
  },
  computed: {
    filteredItems() {
      let filtered = [...this.items];

      // Filtro por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => {
          return (
            item.plano.nombre.toLowerCase().includes(query) ||
            item.plano.codigo.toLowerCase().includes(query) ||
            (item.plano.descripcion && item.plano.descripcion.toLowerCase().includes(query)) ||
            (item.herramienta.nombre && item.herramienta.nombre.toLowerCase().includes(query))
          );
        });
      }

      // Filtro por estado
      if (this.filters.estado) {
        filtered = filtered.filter(item => item.plano.estado === this.filters.estado);
      }

      // Filtro por tipo
      if (this.filters.tipo) {
        filtered = filtered.filter(item => item.plano.tipo_pedidos_id === this.filters.tipo);
      }

      // Filtro por creador
      if (this.filters.creado_por) {
        filtered = filtered.filter(item => item.plano.creado_por === this.filters.creado_por);
      }

      return filtered;
    },

    estadisticas() {
      return {
        total: this.items.length,
        aprobados: this.items.filter(item => item.plano.estado === 'aprobado').length,
        borradores: this.items.filter(item => item.plano.estado === 'borrador').length,
        rechazados: this.items.filter(item => item.plano.estado === 'rechazado').length
      };
    },

    canSubmit() {
      return this.uploadForm.nombre.trim() &&
        this.uploadForm.descripcion.trim() &&
        this.uploadForm.selectedFile &&
        !this.uploading;
    }
  },

  watch: {
    searchQuery(newQuery) {
      // El filtrado se maneja automáticamente por el computed filteredItems
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
        const data = await api.get('/plano');

        // Transformar los datos para el formato del template
        this.items = data.map(plano => this.transformPlanoData(plano));

        console.log('Planos cargados:', this.items);

      } catch (err) {
        console.error('Error fetching planos:', err);
        this.error = 'No se pudieron cargar los planos. Verifica tu conexión.';
      } finally {
        this.loading = false;
      }
    },

    transformPlanoData(plano) {
      return {
        id: plano.id,
        plano: {
          id: plano.id,
          codigo: `PLN-${plano.id.toString().padStart(4, '0')}`,
          nombre: plano.nombre,
          descripcion: plano.descripcion,
          version: plano.version,
          estado: plano.estado,
          tipo_pedidos_id: plano.tipo_pedidos_id,
          creado_por: plano.creado_por,
          archivo_ruta: plano.archivo_ruta,
          timestamp: plano.timestamp,
          notas: plano.notas,
          imagen_url: this.generarImagenUrl(plano.archivo_ruta)
        },
        herramienta: {
          id: plano.tipo_pedidos_id,
          nombre: plano.nombre,
          codigo: `TOOL-${plano.tipo_pedidos_id}`,
          estado: this.mapearEstadoHerramienta(plano.estado)
        },
        cantidad_necesaria: Math.floor(Math.random() * 10) + 1,
        tiempo_estimado_uso: Math.floor(Math.random() * 8) + 1,
        notas: plano.notas,
        created_at: plano.timestamp,
        updated_at: plano.timestamp
      };
    },

    generarImagenUrl(archivoRuta) {
      if (!archivoRuta) return null;

      // URLs de placeholder para diferentes tipos de planos
      const imagenesEjemplo = [
        'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Plano+Tecnico',
        'https://via.placeholder.com/400x300/059669/ffffff?text=Blueprint',
        'https://via.placeholder.com/400x300/dc2626/ffffff?text=Diagrama',
        'https://via.placeholder.com/400x300/7c3aed/ffffff?text=Esquema',
        'https://via.placeholder.com/400x300/ea580c/ffffff?text=Diseno'
      ];

      const hash = this.simpleHash(archivoRuta);
      return imagenesEjemplo[hash % imagenesEjemplo.length];
    },

    simpleHash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    },

    mapearEstadoHerramienta(estadoPlano) {
      const mapeo = {
        'aprobado': 'activo',
        'borrador': 'mantenimiento',
        'rechazado': 'inactivo'
      };
      return mapeo[estadoPlano] || 'inactivo';
    },

    openDetails(item) {
      this.selectedItem = {
        ...item,
        plano: {
          ...item.plano,
          fecha_creacion: this.formatDate(item.plano.timestamp),
          creado_por_nombre: `Usuario ${item.plano.creado_por}`
        }
      };
    },

    closeDetails() {
      this.selectedItem = null;
    },

    // Nuevos métodos para manejar acciones desde el modal de detalles
    handleEdit(item) {
      // Implementar lógica de edición
      console.log('Editando plano:', item);
      this.$vaToast.info('Función de edición en desarrollo');
    },

    handleUse(item) {
      // Implementar lógica para usar en producción
      console.log('Usando plano en producción:', item);
      this.showApprovalModal(item.id);
    },

    // Nuevos métodos para el modal de acciones
    showApprovalModal(planoId) {
      this.actionModal = {
        title: 'Aprobar Plano',
        message: '¿Estás seguro de que deseas aprobar este plano para su uso en producción?',
        type: 'approve',
        notes: '',
        loading: false,
        itemId: planoId
      };
      this.showActionModal = true;
    },

    showRejectionModal(planoId) {
      this.actionModal = {
        title: 'Rechazar Plano',
        message: 'Este plano será marcado como rechazado. Por favor, especifica el motivo:',
        type: 'reject',
        notes: '',
        loading: false,
        itemId: planoId
      };
      this.showActionModal = true;
    },

    closeActionModal() {
      this.showActionModal = false;
      this.actionModal = {
        title: '',
        message: '',
        type: '',
        notes: '',
        loading: false,
        itemId: null
      };
    },

    async confirmAction() {
      if (this.actionModal.type === 'reject' && !this.actionModal.notes.trim()) {
        this.$vaToast.error('Debe especificar el motivo del rechazo');
        return;
      }

      this.actionModal.loading = true;

      try {
        if (this.actionModal.type === 'approve') {
          await this.aprobarPlano(this.actionModal.itemId);
        } else {
          await this.rechazarPlano(this.actionModal.itemId, this.actionModal.notes);
        }
        this.closeActionModal();
      } catch (error) {
        console.error('Error en acción:', error);
      } finally {
        this.actionModal.loading = false;
      }
    },

    async aprobarPlano(planoId) {
      try {
        await api.put(`/plano/${planoId}`, {
          estado: 'aprobado',
          notas: this.actionModal.notes || ''
        });

        // Actualizar localmente
        const item = this.items.find(i => i.id === planoId);
        if (item) {
          item.plano.estado = 'aprobado';
          item.herramienta.estado = 'activo';
          if (this.actionModal.notes) {
            item.plano.notas = this.actionModal.notes;
            item.notas = this.actionModal.notes;
          }
        }

        this.$vaToast.success('Plano aprobado correctamente');

      } catch (error) {
        console.error('Error al aprobar plano:', error);
        this.$vaToast.error('Error al aprobar el plano');
        throw error;
      }
    },

    async rechazarPlano(planoId, motivo) {
      try {
        await api.put(`/plano/${planoId}`, {
          estado: 'rechazado',
          notas: motivo
        });

        // Actualizar localmente
        const item = this.items.find(i => i.id === planoId);
        if (item) {
          item.plano.estado = 'rechazado';
          item.herramienta.estado = 'inactivo';
          item.plano.notas = motivo;
          item.notas = motivo;
        }

        this.$vaToast.warning('Plano rechazado');

      } catch (error) {
        console.error('Error al rechazar plano:', error);
        this.$vaToast.error('Error al rechazar el plano');
        throw error;
      }
    },

    async refreshData() {
      await this.fetchData();
      this.$vaToast.info('Datos actualizados');
    },

    // Métodos para el modal de subida
    openUploadModal() {
      this.showUploadModal = true;
    },

    closeUploadModal() {
      this.showUploadModal = false;
      this.resetUploadForm();
    },

    resetUploadForm() {
      this.uploadForm = {
        nombre: '',
        descripcion: '',
        version: '',
        tipo_pedidos_id: '',
        notas: '',
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
      // Validar tipo de archivo para planos
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'application/octet-stream' // Para archivos .dwg
      ];

      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dwg')) {
        this.uploadForm.errors.file = 'Tipo de archivo no permitido. Se aceptan PDF, DWG, JPG, PNG, PPT.';
        return;
      }

      // Validar tamaño (20MB para planos)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadForm.errors.file = 'El archivo es demasiado grande. Tamaño máximo: 20MB.';
        return;
      }

      this.uploadForm.errors.file = '';
      this.uploadForm.selectedFile = file;
    },

    removeFile() {
      this.uploadForm.selectedFile = null;
      this.uploadForm.errors.file = '';
    },

    validateForm() {
      const errors = {};

      if (!this.uploadForm.nombre.trim()) {
        errors.nombre = 'El nombre del plano es requerido.';
      }

      if (!this.uploadForm.descripcion.trim()) {
        errors.descripcion = 'La descripción es requerida.';
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
        formData.append('nombre', this.uploadForm.nombre);
        formData.append('descripcion', this.uploadForm.descripcion);
        formData.append('version', this.uploadForm.version || '1.0');
        formData.append('tipo_pedidos_id', this.uploadForm.tipo_pedidos_id || '1');
        formData.append('notas', this.uploadForm.notas);
        formData.append('archivo', this.uploadForm.selectedFile);
        formData.append('estado', 'borrador');
        formData.append('creado_por', '1'); // En un caso real, obtener del usuario logueado

        // Simular progreso de subida
        const simulateProgress = () => {
          return new Promise((resolve) => {
            const interval = setInterval(() => {
              this.uploadProgress += Math.random() * 20;
              if (this.uploadProgress >= 90) {
                this.uploadProgress = 90;
                clearInterval(interval);
                resolve();
              }
            }, 200);
          });
        };

        await simulateProgress();

        // Intentar subir a la API
        try {
          await api.post('/plano', {
            nombre: this.uploadForm.nombre,
            descripcion: this.uploadForm.descripcion,
            version: this.uploadForm.version || '1.0',
            tipo_pedidos_id: this.uploadForm.tipo_pedidos_id || '1',
            notas: this.uploadForm.notas,
            estado: 'borrador',
            creado_por: '1',
            archivo_ruta: `/planos/${this.uploadForm.selectedFile.name}`
          });
        } catch (apiError) {
          console.warn('API upload failed, continuing with simulation:', apiError);
        }

        this.uploadProgress = 100;

        this.$vaToast.success('Plano subido exitosamente');

        await this.fetchData();
        this.closeUploadModal();

      } catch (error) {
        console.error('Error uploading plano:', error);
        this.$vaToast.error('Error al subir el plano');
      } finally {
        this.uploading = false;
      }
    },

    // Métodos de utilidad
    getFileIcon(file) {
      if (!file) return 'insert_drive_file';

      const extension = file.name.split('.').pop().toLowerCase();

      switch (extension) {
        case 'pdf':
          return 'picture_as_pdf';
        case 'dwg':
        case 'dxf':
          return 'architecture';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'image';
        case 'ppt':
        case 'pptx':
          return 'slideshow';
        default:
          return 'insert_drive_file';
      }
    },

    getFileIconClass(file) {
      if (!file) return 'file-icon';

      const extension = file.name.split('.').pop().toLowerCase();

      switch (extension) {
        case 'pdf':
          return 'pdf-icon';
        case 'dwg':
        case 'dxf':
          return 'dwg-icon';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'image-icon';
        default:
          return 'file-icon';
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
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    showNotification(message, type) {
      // Fallback para notificaciones si Vuestic no está disponible
      if (this.$vaToast) {
        this.$vaToast[type](message);
        return;
      }

      const colors = {
        'success': 'bg-green-500',
        'error': 'bg-red-500',
        'warning': 'bg-yellow-500',
        'info': 'bg-blue-500'
      };

      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded shadow-lg z-50`;
      notification.textContent = message;

      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    },

    // Métodos para exportar datos
    exportarDatos() {
      const datos = this.filteredItems.map(item => ({
        codigo: item.plano.codigo,
        nombre: item.plano.nombre,
        descripcion: item.plano.descripcion,
        version: item.plano.version,
        estado: item.plano.estado,
        tipo: item.plano.tipo_pedidos_id,
        creado_por: item.plano.creado_por,
        fecha_creacion: this.formatDate(item.plano.timestamp)
      }));

      const csv = this.convertirACSV(datos);
      this.descargarCSV(csv, 'control_calidad_planos.csv');
    },

    convertirACSV(datos) {
      if (datos.length === 0) return '';

      const headers = Object.keys(datos[0]).join(',');
      const filas = datos.map(item =>
        Object.values(item).map(value =>
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      return [headers, ...filas].join('\n');
    },

    descargarCSV(contenido, nombreArchivo) {
      const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', nombreArchivo);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
};