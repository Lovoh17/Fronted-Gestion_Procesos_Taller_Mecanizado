
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
  
  emits: ['close', 'save'],

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
      
      // Agregar id si estamos editando
      if (this.isEditing) {
        userData.id = this.user.id;
      }

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