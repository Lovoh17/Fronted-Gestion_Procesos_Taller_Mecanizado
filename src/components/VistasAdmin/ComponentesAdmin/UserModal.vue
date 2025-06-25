<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? 'Editar Empleado' : 'Nuevo Empleado' }}</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="submitForm">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre *</label>
              <input
                id="nombre"
                v-model="form.nombre"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.nombre }"
                placeholder="Ingresa el nombre"
                required
              >
              <div v-if="errors.nombre" class="invalid-feedback">
                {{ errors.nombre }}
              </div>
            </div>

            <div class="form-group">
              <label for="apellido">Apellido *</label>
              <input
                id="apellido"
                v-model="form.apellido"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.apellido }"
                placeholder="Ingresa el apellido"
                required
              >
              <div v-if="errors.apellido" class="invalid-feedback">
                {{ errors.apellido }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="usuario@ejemplo.com"
                required
              >
              <div v-if="errors.email" class="invalid-feedback">
                {{ errors.email }}
              </div>
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono</label>
              <input
                id="telefono"
                v-model="form.telefono"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.telefono }"
                placeholder="0000-0000"
              >
              <div v-if="errors.telefono" class="invalid-feedback">
                {{ errors.telefono }}
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="puesto_id">Puesto *</label>
              <select
                id="puesto_id"
                v-model="form.puesto_id"
                class="form-control"
                :class="{ 'is-invalid': errors.puesto_id }"
                required
              >
                <option value="1">Administrador</option>
                <option value="2">Coordinador</option>
                <option value="3">Empleado</option>
                <option value="4">Tecnico</option>
              </select>
              <div v-if="errors.puesto_id" class="invalid-feedback">
                {{ errors.puesto_id }}
              </div>
            </div>

            <div class="form-group">
              <label for="turno_id">Turno</label>
              <select
                id="turno_id"
                v-model="form.turno_id"
                class="form-control"
              >
                <option :value="null">Sin turno asignado</option>
                <option value="1">Matutino</option>
                <option value="2">Vespertino</option>
                <option value="3">Nocturno</option>
              </select>
            </div>
          </div>

          <!-- Sección de contraseña (visible siempre pero requerida solo para nuevos usuarios) -->
          <div class="form-row">
            <div class="form-group">
              <label for="password">
                {{ isEditing ? 'Nueva Contraseña' : 'Contraseña *' }}
                <small v-if="isEditing" class="text-muted">(Dejar en blanco para no cambiar)</small>
              </label>
              <div class="password-input">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  :placeholder="isEditing ? 'Nueva contraseña' : 'Mínimo 6 caracteres'"
                  :required="!isEditing"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="errors.password" class="invalid-feedback">
                {{ errors.password }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">
                {{ isEditing ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *' }}
              </label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                :placeholder="isEditing ? 'Confirmar nueva contraseña' : 'Confirma la contraseña'"
                :required="!isEditing || form.password.length > 0"
              >
              <div v-if="errors.confirmPassword" class="invalid-feedback">
                {{ errors.confirmPassword }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="habilidades_tecnicas">Habilidades Técnicas</label>
            <textarea
              id="habilidades_tecnicas"
              v-model="form.habilidades_tecnicas"
              class="form-control"
              rows="3"
              placeholder="Describa las habilidades técnicas"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="direccion">Dirección</label>
            <textarea
              id="direccion"
              v-model="form.direccion"
              class="form-control"
              rows="3"
              placeholder="Dirección completa"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="form.estado"
                  type="checkbox"
                  class="form-checkbox"
                >
                <span class="checkmark"></span>
                Usuario activo
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="form.es_subcontratado"
                  type="checkbox"
                  class="form-checkbox"
                >
                <span class="checkmark"></span>
                Es subcontratado
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !isFormValid"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isEditing ? 'Actualizar' : 'Crear' }} Empleado
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserModal',
  props: {
    user: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      form: {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        puesto_id: 2, // Default: empleado
        password: '',
        confirmPassword: '',
        direccion: '',
        estado: true,
        habilidades_tecnicas: '',
        turno_id: null,
        es_subcontratado: false
      },
      errors: {},
      showPassword: false,
      isPasswordModified: false
    }
  },

  computed: {
    isEditing() {
      return this.user && this.user.id
    },

    isFormValid() {
      const basicValid = this.form.nombre.trim() && 
                       this.form.apellido.trim() && 
                       this.form.email.trim();
      
      // Validación de contraseña
      if (!this.isEditing) {
        // Para nuevo usuario, contraseña es obligatoria
        return basicValid && 
               this.form.password.length >= 6 && 
               this.form.password === this.form.confirmPassword;
      } else {
        // Para edición, contraseña es opcional pero si se llena debe ser válida
        const passwordValid = this.form.password.length === 0 || 
                             (this.form.password.length >= 6 && 
                              this.form.password === this.form.confirmPassword);
        return basicValid && passwordValid;
      }
    }
  },

  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          this.form = {
            nombre: newUser.nombre || '',
            apellido: newUser.apellido || '',
            email: newUser.email || '',
            telefono: newUser.telefono || '',
            puesto_id: newUser.puesto_id || 2,
            password: '',
            confirmPassword: '',
            direccion: newUser.direccion || '',
            estado: newUser.estado_id === 1 || newUser.estado !== false,
            habilidades_tecnicas: newUser.habilidades_tecnicas || '',
            turno_id: newUser.turno_id || null,
            es_subcontratado: newUser.es_subcontratado || false
          };
          this.isPasswordModified = false;
        } else {
          this.resetForm();
        }
      }
    },
    'form.password'(newVal) {
      this.isPasswordModified = newVal.length > 0;
    }
  },

  methods: {
    submitForm() {
      if (!this.validateForm()) {
        return;
      }

      const userData = {
        nombre: this.form.nombre.trim(),
        apellido: this.form.apellido.trim(),
        email: this.form.email.trim().toLowerCase(),
        telefono: this.form.telefono.trim(),
        puesto_id: parseInt(this.form.puesto_id),
        direccion: this.form.direccion.trim(),
        estado_id: this.form.estado ? 1 : 0,
        habilidades_tecnicas: this.form.habilidades_tecnicas,
        turno_id: this.form.turno_id,
        es_subcontratado: this.form.es_subcontratado
      };

      // Solo incluir password si se está modificando o es un nuevo usuario
      if ((this.isEditing && this.isPasswordModified) || !this.isEditing) {
        userData.password = this.form.password;
      }

      this.$emit('save', userData);
    },

    validateForm() {
      this.errors = {};

      // Validar nombre
      if (!this.form.nombre.trim()) {
        this.errors.nombre = 'El nombre es requerido';
      }

      // Validar apellido
      if (!this.form.apellido.trim()) {
        this.errors.apellido = 'El apellido es requerido';
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email.trim()) {
        this.errors.email = 'El email es requerido';
      } else if (!emailRegex.test(this.form.email.trim())) {
        this.errors.email = 'El formato del email no es válido';
      }

      // Validar teléfono (opcional pero con formato)
      if (this.form.telefono.trim()) {
        const phoneRegex = /^\d{4}-?\d{4}$/;
        if (!phoneRegex.test(this.form.telefono.trim())) {
          this.errors.telefono = 'El formato del teléfono debe ser 0000-0000';
        }
      }

      // Validar contraseña
      if (!this.isEditing) {
        // Para nuevo usuario
        if (!this.form.password) {
          this.errors.password = 'La contraseña es requerida';
        } else if (this.form.password.length < 6) {
          this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!this.form.confirmPassword) {
          this.errors.confirmPassword = 'Confirma la contraseña';
        } else if (this.form.password !== this.form.confirmPassword) {
          this.errors.confirmPassword = 'Las contraseñas no coinciden';
        }
      } else {
        // Para edición de usuario
        if (this.isPasswordModified) {
          if (this.form.password.length < 6) {
            this.errors.password = 'La contraseña debe tener al menos 6 caracteres';
          }

          if (!this.form.confirmPassword) {
            this.errors.confirmPassword = 'Confirma la nueva contraseña';
          } else if (this.form.password !== this.form.confirmPassword) {
            this.errors.confirmPassword = 'Las contraseñas no coinciden';
          }
        }
      }

      return Object.keys(this.errors).length === 0;
    },

    resetForm() {
      this.form = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        puesto_id: 2,
        password: '',
        confirmPassword: '',
        direccion: '',
        estado: true,
        habilidades_tecnicas: '',
        turno_id: null,
        es_subcontratado: false
      };
      this.errors = {};
      this.showPassword = false;
      this.isPasswordModified = false;
    },

    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
/* Tus estilos existentes se mantienen igual */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
}

.password-toggle:hover {
  color: #495057;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 4px;
  font-size: 12px;
  color: #dc3545;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
}

.form-checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ced4da;
  border-radius: 3px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s;
}

.form-checkbox:checked + .checkmark {
  background: #007bff;
  border-color: #007bff;
}

.form-checkbox:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.text-muted {
  color: #6c757d;
  font-size: 0.875em;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>