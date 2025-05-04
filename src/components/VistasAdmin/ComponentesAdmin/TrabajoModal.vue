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
 
  </style>