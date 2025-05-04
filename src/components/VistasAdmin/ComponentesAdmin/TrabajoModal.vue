<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="close-btn" @click="close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="save">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Orden #</label>
                <input 
                  v-model="formData.orden" 
                  type="text" 
                  class="form-control"
                  disabled
                >
              </div>
              <div class="form-group col-md-6">
                <label>Estado</label>
                <select 
                  v-model="formData.estado" 
                  class="form-control"
                  required
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
            </div>
  
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Cliente</label>
                <input 
                  v-model="formData.cliente" 
                  type="text" 
                  class="form-control"
                  required
                >
              </div>
              <div class="form-group col-md-6">
                <label>Vehículo</label>
                <input 
                  v-model="formData.vehiculo" 
                  type="text" 
                  class="form-control"
                  required
                >
              </div>
            </div>
  
            <div class="form-group">
              <label>Tipo de Trabajo</label>
              <input 
                v-model="formData.tipo" 
                type="text" 
                class="form-control"
                required
              >
            </div>
  
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Técnico Asignado</label>
                <select 
                  v-model="formData.tecnico_id" 
                  class="form-control"
                  required
                >
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
                <label>Fecha de Inicio</label>
                <input 
                  v-model="formData.fecha_inicio" 
                  type="date" 
                  class="form-control"
                  required
                >
              </div>
            </div>
  
            <div class="form-row" v-if="formData.estado === 'completado' || formData.estado === 'entregado'">
              <div class="form-group col-md-6">
                <label>Fecha de Finalización</label>
                <input 
                  v-model="formData.fecha_fin" 
                  type="date" 
                  class="form-control"
                  :required="formData.estado === 'completado' || formData.estado === 'entregado'"
                >
              </div>
            </div>
  
            <div class="form-group">
              <label>Detalles del Trabajo</label>
              <textarea 
                v-model="formData.detalles" 
                class="form-control" 
                rows="4"
              ></textarea>
            </div>
  
            <div class="form-group" v-if="formData.estado === 'completado' || formData.estado === 'entregado'">
              <label>Observaciones Finales</label>
              <textarea 
                v-model="formData.observaciones" 
                class="form-control" 
                rows="3"
              ></textarea>
            </div>
  
            <div class="form-group">
              <div class="custom-control custom-checkbox">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="urgenteCheck"
                  v-model="formData.urgente"
                >
                <label class="custom-control-label" for="urgenteCheck">
                  Trabajo Urgente
                </label>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="save">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      trabajo: {
        type: Object,
        default: null
      },
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
          id: null,
          orden: '',
          cliente: '',
          vehiculo: '',
          tipo: '',
          tecnico_id: null,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: '',
          estado: 'pendiente',
          detalles: '',
          observaciones: '',
          urgente: false
        }
      }
    },
    
    computed: {
      modalTitle() {
        return this.formData.id ? 'Editar Trabajo' : 'Nuevo Trabajo';
      }
    },
    
    watch: {
      trabajo: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            this.formData = { 
              ...newVal,
              fecha_inicio: newVal.fecha_inicio || new Date().toISOString().split('T')[0],
              fecha_fin: newVal.fecha_fin || '',
              tecnico_id: newVal.tecnico_id || (this.tecnicos.length > 0 ? this.tecnicos[0].id : null)
            };
          } else {
            this.resetForm();
          }
        }
      }
    },
    
    methods: {
      resetForm() {
        this.formData = {
          id: null,
          orden: '',
          cliente: '',
          vehiculo: '',
          tipo: '',
          tecnico_id: this.tecnicos.length > 0 ? this.tecnicos[0].id : null,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: '',
          estado: 'pendiente',
          detalles: '',
          observaciones: '',
          urgente: false
        };
      },
      
      close() {
        this.$emit('close');
      },
      
      save() {
        if (!this.validateForm()) return;
        
        const trabajoData = { ...this.formData };
        
        // Si está completado/entregado y no tiene fecha fin, usar hoy
        if ((trabajoData.estado === 'completado' || trabajoData.estado === 'entregado') && !trabajoData.fecha_fin) {
          trabajoData.fecha_fin = new Date().toISOString().split('T')[0];
        }
        
        this.$emit('save', trabajoData);
      },
      
      validateForm() {
        if (!this.formData.cliente) {
          alert('El cliente es requerido');
          return false;
        }
        
        if (!this.formData.vehiculo) {
          alert('El vehículo es requerido');
          return false;
        }
        
        if (!this.formData.tipo) {
          alert('El tipo de trabajo es requerido');
          return false;
        }
        
        if (!this.formData.tecnico_id) {
          alert('Debe asignar un técnico');
          return false;
        }
        
        if ((this.formData.estado === 'completado' || this.formData.estado === 'entregado') && !this.formData.fecha_fin) {
          alert('La fecha de finalización es requerida para trabajos completados');
          return false;
        }
        
        return true;
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
    z-index: 1000;
  }
  
  .modal-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
  }
  
  .close-btn:hover {
    color: #374151;
  }
  
  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
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
    color: #374151;
  }
  
  .form-control {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #374151;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .form-control:focus {
    border-color: #3b82f6;
    outline: 0;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  textarea.form-control {
    min-height: 100px;
  }
  
  .custom-control {
    position: relative;
    display: block;
    min-height: 1.5rem;
    padding-left: 1.5rem;
  }
  
  .custom-checkbox {
    padding-left: 1.5rem;
  }
  
  .custom-control-input {
    position: absolute;
    left: 0;
    z-index: -1;
    width: 1rem;
    height: 1.25rem;
    opacity: 0;
  }
  
  .custom-control-label {
    position: relative;
    margin-bottom: 0;
    vertical-align: top;
    cursor: pointer;
  }
  
  .custom-control-label::before {
    position: absolute;
    top: 0.25rem;
    left: -1.5rem;
    display: block;
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    content: "";
    background-color: #fff;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
  }
  
  .custom-control-input:checked ~ .custom-control-label::before {
    color: #fff;
    border-color: #3b82f6;
    background-color: #3b82f6;
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
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .btn-primary:hover {
    background-color: #2563eb;
    border-color: #1d4ed8;
  }
  
  .btn-secondary {
    color: #374151;
    background-color: #e5e7eb;
    border-color: #e5e7eb;
  }
  
  .btn-secondary:hover {
    background-color: #d1d5db;
    border-color: #9ca3af;
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
  }
  </style>