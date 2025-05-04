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
                <i class="fas fa-tools mr-2"></i>Datos del Trabajo
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

  </style>