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
            <div class="form-group">
              <label>Tipo de Usuario</label>
              <select 
                v-model="formData.type" 
                class="form-control"
                required
              >
                <option value="employee">Empleado</option>
                <option value="coordinator">Coordinador</option>
              </select>
            </div>
            
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Nombre</label>
                <input 
                  v-model="formData.name" 
                  type="text" 
                  class="form-control"
                  required
                >
              </div>
              <div class="form-group col-md-6">
                <label>Email</label>
                <input 
                  v-model="formData.email" 
                  type="email" 
                  class="form-control"
                  required
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Contraseña</label>
                <input 
                  v-model="formData.password" 
                  type="password" 
                  class="form-control"
                  :required="!formData.id"
                  :placeholder="formData.id ? 'Dejar en blanco para no cambiar' : ''"
                >
              </div>
              <div class="form-group col-md-6">
                <label>Confirmar Contraseña</label>
                <input 
                  v-model="formData.password_confirmation" 
                  type="password" 
                  class="form-control"
                  :required="!formData.id && formData.password"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label>Avatar</label>
              <div class="avatar-upload">
                <img 
                  :src="avatarPreview || defaultAvatar" 
                  class="avatar-preview"
                  @click="$refs.avatarInput.click()"
                >
                <input 
                  ref="avatarInput"
                  type="file" 
                  accept="image/*"
                  @change="handleAvatarUpload"
                  style="display: none"
                >
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-secondary"
                  @click="$refs.avatarInput.click()"
                >
                  <i class="fas fa-upload mr-1"></i>Subir imagen
                </button>
                <button 
                  v-if="avatarPreview" 
                  type="button" 
                  class="btn btn-sm btn-outline-danger ml-2"
                  @click="removeAvatar"
                >
                  <i class="fas fa-trash-alt mr-1"></i>Eliminar
                </button>
              </div>
            </div>
            
            <div class="form-group" v-if="formData.id">
              <div class="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="statusSwitch"
                  v-model="formData.status"
                  true-value="active"
                  false-value="inactive"
                >
                <label class="custom-control-label" for="statusSwitch">
                  {{ formData.status === 'active' ? 'Usuario Activo' : 'Usuario Inactivo' }}
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
            {{ formData.id ? 'Actualizar' : 'Crear' }} Usuario
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      user: {
        type: Object,
        default: null
      }
    },
    
    data() {
      return {
        formData: {
          id: null,
          type: 'employee',
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          status: 'active',
          avatar: null
        },
        avatarPreview: null,
        defaultAvatar: require('@/assets/default-avatar.png')
      }
    },
    
    computed: {
      modalTitle() {
        return this.formData.id ? 'Editar Usuario' : 'Nuevo Usuario'
      }
    },
    
    watch: {
      user: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            this.formData = {
              id: newVal.id,
              type: newVal.type,
              name: newVal.name,
              email: newVal.email,
              password: '',
              password_confirmation: '',
              status: newVal.status,
              avatar: null
            }
            this.avatarPreview = newVal.avatar || null
          } else {
            this.resetForm()
          }
        }
      }
    },
    
    methods: {
      resetForm() {
        this.formData = {
          id: null,
          type: 'employee',
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          status: 'active',
          avatar: null
        }
        this.avatarPreview = null
      },
      
      close() {
        this.$emit('close')
      },
      
      save() {
        if (this.formData.password !== this.formData.password_confirmation) {
          alert('Las contraseñas no coinciden')
          return
        }
        
        const userData = new FormData()
        
        // Append all form data
        Object.keys(this.formData).forEach(key => {
          if (this.formData[key] !== null && this.formData[key] !== '') {
            userData.append(key, this.formData[key])
          }
        })
        
        // Append avatar file if exists
        if (this.formData.avatar instanceof File) {
          userData.append('avatar', this.formData.avatar)
        }
        
        this.$emit('save', userData)
      },
      
      handleAvatarUpload(event) {
        const file = event.target.files[0]
        if (!file) return
        
        if (!file.type.match('image.*')) {
          alert('Por favor selecciona una imagen válida')
          return
        }
        
        if (file.size > 2 * 1024 * 1024) {
          alert('La imagen no debe exceder los 2MB')
          return
        }
        
        this.formData.avatar = file
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          this.avatarPreview = e.target.result
        }
        reader.readAsDataURL(file)
      },
      
      removeAvatar() {
        this.formData.avatar = null
        this.avatarPreview = null
      }
    }
  }
  </script>
  
  <style scoped>
 
  </style>