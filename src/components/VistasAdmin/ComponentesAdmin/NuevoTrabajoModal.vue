<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h3><i class="fas fa-plus-circle mr-2"></i>Nuevo Trabajo</h3>
          <button class="close-btn" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="save">
            <!-- Sección Cliente y Vehículo -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-user mr-2"></i>Datos del Cliente
              </h4>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Cliente</label>
                  <div class="input-group">
                    <input 
                      v-model="formData.cliente" 
                      type="text" 
                      class="form-control"
                      placeholder="Nombre del cliente"
                      required
                    >
                    <div class="input-group-append">
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button"
                        @click="showClientesList = true"
                      >
                        <i class="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="form-group col-md-6">
                  <label>Teléfono</label>
                  <input 
                    v-model="formData.telefono" 
                    type="tel" 
                    class="form-control"
                    placeholder="Teléfono de contacto"
                  >
                </div>
              </div>
  
              <h4 class="section-title mt-4">
                <i class="fas fa-car mr-2"></i>Datos del Vehículo
              </h4>
              <div class="form-row">
                <div class="form-group col-md-4">
                  <label>Marca</label>
                  <input 
                    v-model="formData.marca" 
                    type="text" 
                    class="form-control"
                    placeholder="Ej: Toyota"
                    required
                  >
                </div>
                <div class="form-group col-md-4">
                  <label>Modelo</label>
                  <input 
                    v-model="formData.modelo" 
                    type="text" 
                    class="form-control"
                    placeholder="Ej: Corolla"
                    required
                  >
                </div>
                <div class="form-group col-md-4">
                  <label>Año</label>
                  <input 
                    v-model="formData.ano" 
                    type="number" 
                    class="form-control"
                    placeholder="Ej: 2020"
                    min="1900"
                    :max="new Date().getFullYear()"
                  >
                </div>
              </div>
              <div class="form-group">
                <label>Placa/Número de Serie</label>
                <input 
                  v-model="formData.placa" 
                  type="text" 
                  class="form-control"
                  placeholder="Placa o VIN"
                >
              </div>
            </div>
  
            <!-- Sección Trabajo -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-tools mr-2"></i>Detalles del Trabajo
              </h4>
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Tipo de Trabajo</label>
                  <select 
                    v-model="formData.tipo" 
                    class="form-control"
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Reparación">Reparación</option>
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="Alineación">Alineación y Balanceo</option>
                    <option value="Pintura">Pintura</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="form-group col-md-6">
                  <label>Prioridad</label>
                  <select 
                    v-model="formData.prioridad" 
                    class="form-control"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                    <option value="express">Express</option>
                  </select>
                </div>
              </div>
  
              <div class="form-group">
                <label>Descripción Detallada</label>
                <textarea 
                  v-model="formData.descripcion" 
                  class="form-control" 
                  rows="3"
                  placeholder="Describa el trabajo a realizar..."
                  required
                ></textarea>
              </div>
  
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Técnico Asignado</label>
                  <select 
                    v-model="formData.tecnico_id" 
                    class="form-control"
                    required
                  >
                    <option value="">Seleccione un técnico</option>
                    <option 
                      v-for="tecnico in tecnicos" 
                      :key="tecnico.id" 
                      :value="tecnico.id"
                    >
                      {{ tecnico.nombre }}
                    </option>
                  </select>
                </div>
                <div class="form-group col-md-6">
                  <label>Fecha Estimada de Entrega</label>
                  <input 
                    v-model="formData.fecha_estimada" 
                    type="date" 
                    class="form-control"
                    :min="new Date().toISOString().split('T')[0]"
                  >
                </div>
              </div>
            </div>
  
            <!-- Sección Documentos -->
            <div class="form-section">
              <h4 class="section-title">
                <i class="fas fa-paperclip mr-2"></i>Documentos Adjuntos
              </h4>
              <div class="form-group">
                <label>Subir Fotos/Archivos</label>
                <div class="custom-file">
                  <input 
                    type="file" 
                    class="custom-file-input" 
                    id="customFile"
                    multiple
                    @change="handleFileUpload"
                  >
                  <label class="custom-file-label" for="customFile">
                    {{ filesLabel }}
                  </label>
                </div>
                <small class="form-text text-muted">
                  Puede subir fotos del vehículo, facturas anteriores, etc.
                </small>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline-secondary" @click="close">
            <i class="fas fa-times mr-1"></i>Cancelar
          </button>
          <button class="btn btn-primary" @click="save">
            <i class="fas fa-save mr-1"></i>Guardar Trabajo
          </button>
        </div>
      </div>
  
      <!-- Modal de selección de clientes -->
      <ClientesListModal 
        v-if="showClientesList"
        @close="showClientesList = false"
        @select="selectCliente"
      />
    </div>
  </template>
  
  <script>
  import ClientesListModal from './ClientesListModal.vue'
  
  export default {
    components: {
      ClientesListModal
    },
    
    props: {
      tecnicos: {
        type: Array,
        default: () => [
          { id: 1, nombre: 'Juan Pérez' },
          { id: 2, nombre: 'María Gómez' },
          { id: 3, nombre: 'Carlos Rodríguez' }
        ]
      }
    },
    
    data() {
      return {
        formData: {
          cliente: '',
          telefono: '',
          marca: '',
          modelo: '',
          ano: '',
          placa: '',
          tipo: '',
          prioridad: 'normal',
          descripcion: '',
          tecnico_id: '',
          fecha_estimada: '',
          documentos: []
        },
        showClientesList: false,
        selectedFiles: []
      }
    },
    
    computed: {
      filesLabel() {
        if (this.selectedFiles.length === 0) return 'Seleccionar archivos...';
        if (this.selectedFiles.length === 1) return this.selectedFiles[0].name;
        return `${this.selectedFiles.length} archivos seleccionados`;
      }
    },
    
    methods: {
      close() {
        this.$emit('close');
      },
      
      save() {
        if (this.validateForm()) {
          const trabajoData = {
            ...this.formData,
            documentos: this.selectedFiles,
            fecha_creacion: new Date().toISOString(),
            estado: 'pendiente'
          };
          this.$emit('save', trabajoData);
        }
      },
      
      validateForm() {
        if (!this.formData.cliente) {
          this.showError('El nombre del cliente es requerido');
          return false;
        }
        
        if (!this.formData.marca || !this.formData.modelo) {
          this.showError('La marca y modelo del vehículo son requeridos');
          return false;
        }
        
        if (!this.formData.tipo) {
          this.showError('Debe seleccionar el tipo de trabajo');
          return false;
        }
        
        if (!this.formData.descripcion) {
          this.showError('La descripción del trabajo es requerida');
          return false;
        }
        
        if (!this.formData.tecnico_id) {
          this.showError('Debe asignar un técnico responsable');
          return false;
        }
        
        return true;
      },
      
      showError(message) {
        alert(message);
        // this.$toast.error(message); // Si estás usando un sistema de notificaciones
      },
      
      handleFileUpload(event) {
        this.selectedFiles = Array.from(event.target.files);
      },
      
      selectCliente(cliente) {
        this.formData.cliente = cliente.nombre;
        this.formData.telefono = cliente.telefono;
        this.showClientesList = false;
        
        if (cliente.vehiculos && cliente.vehiculos.length > 0) {
          const vehiculo = cliente.vehiculos[0];
          this.formData.marca = vehiculo.marca;
          this.formData.modelo = vehiculo.modelo;
          this.formData.ano = vehiculo.ano;
          this.formData.placa = vehiculo.placa;
        }
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
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }
  
  .modal-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8f9fa;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    display: flex;
    align-items: center;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
  }
  
  .close-btn:hover {
    color: #495057;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    background-color: #f8f9fa;
  }
  
  .form-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed #dee2e6;
  }
  
  .form-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }
  
  .form-row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.75rem;
    margin-left: -0.75rem;
  }
  
  .form-row > .form-group {
    padding-right: 0.75rem;
    padding-left: 0.75rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #495057;
  }
  
  .form-control {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .form-control:focus {
    border-color: #4dabf7;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25);
  }
  
  textarea.form-control {
    min-height: 100px;
  }
  
  .input-group {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
  }
  
  .input-group-append {
    margin-left: -1px;
    display: flex;
  }
  
  .input-group .form-control {
    position: relative;
    flex: 1 1 auto;
    width: 1%;
    min-width: 0;
    margin-bottom: 0;
  }
  
  .custom-file {
    position: relative;
    display: inline-block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    margin-bottom: 0;
  }
  
  .custom-file-input {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
  }
  
  .custom-file-label {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .custom-file-label::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    display: block;
    height: calc(1.5em + 0.75rem);
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    color: #495057;
    content: "Buscar";
    background-color: #e9ecef;
    border-left: inherit;
    border-radius: 0 0.375rem 0.375rem 0;
  }
  
  .btn {
    display: inline-block;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.375rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .btn-primary {
    color: #fff;
    background-color: #1976d2;
    border-color: #1976d2;
  }
  
  .btn-primary:hover {
    background-color: #1565c0;
    border-color: #115293;
  }
  
  .btn-outline-secondary {
    color: #6c757d;
    border-color: #6c757d;
  }
  
  .btn-outline-secondary:hover {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
  }
  
  .btn i {
    margin-right: 0.25rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .modal-container {
      width: 95%;
      margin: 0 auto;
    }
    
    .form-row {
      flex-direction: column;
    }
    
    .form-row > .form-group {
      width: 100%;
      padding-right: 0;
      padding-left: 0;
    }
    
    .modal-footer {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .modal-footer .btn {
      width: 100%;
    }
  }
  </style>