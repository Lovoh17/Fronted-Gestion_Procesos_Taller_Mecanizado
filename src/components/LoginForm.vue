<template>
  <div class="univo-login-container">
    <div class="univo-login-box">
      <!-- Logo añadido aquí -->
      <div class="univo-logo-container">
        <img src="/src/assets/login.svg" alt="Logo del taller" class="univo-logo">
      </div>

      <form class="univo-form" @submit.prevent="handleLogin">
        <div class="univo-input-group">
          <label class="univo-input-label">Nombre de usuario</label>
          <input type="text" class="univo-input" v-model="username" required @input="watchFormChanges"
            @blur="clearError">
        </div>

        <div class="univo-input-group">
          <label class="univo-input-label">Contraseña</label>
          <div class="univo-password-container">
            <input :type="showPassword ? 'text' : 'password'" class="univo-input" v-model="password" required
              @input="watchFormChanges" @blur="clearError">
          </div>
        </div>

        <div class="univo-checkbox-group">
          <label class="univo-checkbox-label">
            <input type="checkbox" v-model="rememberMe" class="univo-checkbox">
            Recordar usuario
          </label>
        </div>

        <div v-if="errorMessage" class="univo-error-message">
          {{ errorMessage }}
        </div>

        <va-button type="submit" class="univo-submit-btn" :disabled="loading || !isFormValid" :loading="loading"
          color="primary" block>
          <span v-if="!loading">Acceder</span>
          <span v-else>Verificando...</span>
        </va-button>
      </form>

      <div class="univo-links">
        <a href="#" class="univo-link" @click.prevent="handleForgotPassword">
          ¿Olvidó su contraseña?
        </a>
        <button type="button" class="univo-link univo-clear-btn" @click="clearForm" title="Limpiar formulario (Esc)">
          Limpiar formulario
        </button>
      </div>

      <div class="univo-footer">
        <span class="univo-language">Español - Internacional (es) ✔</span>
        <span class="univo-cookies">Aviso de Cookies</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockUsers } from '@/mock/users'

export default {
  setup() {
    // Router and store
    const router = useRouter()

    // Reactive data
    const username = ref('')
    const password = ref('')
    const errorMessage = ref('')
    const loading = ref(false)
    const rememberMe = ref(false)
    const showPassword = ref(false)

    // Form validation
    const isFormValid = ref(false)

    // Validation rules
    const validateForm = () => {
      const isUsernameValid = username.value.length >= 3
      const isPasswordValid = password.value.length >= 6
      isFormValid.value = isUsernameValid && isPasswordValid
      return isFormValid.value
    }

    // Watch for form changes to validate
    const watchFormChanges = () => {
      validateForm()
    }

    // Authentication methods
    const handleLogin = async () => {
      try {
        loading.value = true
        errorMessage.value = ''

        // Validate form before submission
        if (!validateForm()) {
          errorMessage.value = 'Por favor complete todos los campos correctamente.'
          return
        }

        console.log('Attempting login for user:', username.value)

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Find user in mock data
        const userCredentials = mockUsers.find(user =>
          user.username === username.value && user.password === password.value
        )

        if (userCredentials) {
          // Successful login
          const { user, token } = userCredentials

          // Store authentication data
          localStorage.setItem('userRole', user.role)
          localStorage.setItem('userName', user.name)
          localStorage.setItem('userEmail', user.email)
          localStorage.setItem('userId', user.id.toString())
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('authToken', token)
          localStorage.setItem('userAvatar', user.avatar || '')
          localStorage.setItem('userDepartamento', user.departamento_id?.toString() || '')
          localStorage.setItem('userPuesto', user.puesto_id?.toString() || '')
          localStorage.setItem('nivelJerarquico', user.nivel_jerarquico?.toString() || '')
          localStorage.setItem('esSupervisor', user.es_supervisor ? 'true' : 'false')

          if (user.especialidades) {
            localStorage.setItem('userEspecialidades', JSON.stringify(user.especialidades))
          }

          if (rememberMe.value) {
            localStorage.setItem('rememberedUser', username.value)
          }

          console.log(`${user.role} login successful for ${user.name}`)

          // Redirect based on role
          switch (user.role) {
            case 'jefe_taller':
              router.push('/admin-dashboard')
              break
            case 'coordinador':
              router.push('/dashboard-coordinador')
              break
            case 'operario':
              router.push('/dashboard-operario')
              break
            case 'tecnico':
              router.push('/tech-dashboard')
              break
            default:
              router.push('/dashboard')
          }

        } else {
          // Invalid credentials
          throw new Error('Credenciales inválidas')
        }

      } catch (error) {
        console.error('Error de login:', error)
        errorMessage.value = error.message || 'Credenciales incorrectas. Por favor intente nuevamente.'

        // Clear password on error
        password.value = ''

        // Focus username field for retry
        setTimeout(() => {
          const usernameInput = document.querySelector('input[type="text"]')
          if (usernameInput) {
            usernameInput.focus()
          }
        }, 100)

      } finally {
        loading.value = false
      }
    }

    const handleForgotPassword = () => {
      console.log('Forgot password requested for:', username.value)
      if (username.value) {
        errorMessage.value = `Se enviarán instrucciones de recuperación a la cuenta asociada con '${username.value}'`
      } else {
        errorMessage.value = 'Por favor ingrese su nombre de usuario primero'
      }
    }

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value
    }

    const clearForm = () => {
      username.value = ''
      password.value = ''
      errorMessage.value = ''
      rememberMe.value = false
      isFormValid.value = false
    }

    const loadRememberedUser = () => {
      const rememberedUser = localStorage.getItem('rememberedUser')
      if (rememberedUser) {
        username.value = rememberedUser
        rememberMe.value = true
        validateForm()
      }
    }

    // Demo/Development utilities
    const fillDemoCredentials = (role) => {
      const demoCredentials = {
        jefe_taller: {
          username: 'jefeTaller@taller.com',
          password: 'jefe123'
        },
        coordinador: {
          username: 'coordinador@taller.com',
          password: 'coord123'
        },
        operario: {
          username: 'operario@taller.com',
          password: 'oper123'
        },
        tecnico: {
          username: 'tecnico@taller.com',
          password: 'tech123'
        }
      }

      const credentials = demoCredentials[role]
      if (credentials) {
        username.value = credentials.username
        password.value = credentials.password
        validateForm()
        console.log(`Demo credentials loaded for ${role}`)
      }
    }

    // Get available demo users for quick access
    const getDemoUsers = () => {
      return mockUsers.map(mockUser => ({
        role: mockUser.user.role,
        name: mockUser.user.name,
        username: mockUser.username,
        displayRole: getRoleDisplayName(mockUser.user.role),
        avatar: mockUser.user.avatar,
        departamento: mockUser.user.departamento_id,
        essupervisor: mockUser.user.es_supervisor,
        especialidades: mockUser.user.especialidades
      }))
    }

    const getRoleDisplayName = (role) => {
      const roleNames = {
        jefe_taller: 'Jefe de Taller',
        coordinador: 'Coordinador',
        operario: 'Operario',
        tecnico: 'Técnico'
      }
      return roleNames[role] || role
    }

    const formatEspecialidad = (especialidad) => {
      return especialidad.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Error handling
    const clearError = () => {
      errorMessage.value = ''
    }

    // Keyboard shortcuts
    const handleKeyDown = (event) => {
      // Ctrl + Enter to submit form
      if (event.ctrlKey && event.key === 'Enter') {
        handleLogin()
      }
      // Escape to clear form
      else if (event.key === 'Escape') {
        clearForm()
      }
    }

    // Initialize component
    const initialize = () => {
      console.log('LoginForm initialized with mock users')
      console.log('Available users:', getDemoUsers())
      loadRememberedUser()

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown)

      // Focus username field on load
      setTimeout(() => {
        const usernameInput = document.querySelector('input[type="text"]')
        if (usernameInput) {
          usernameInput.focus()
        }
      }, 100)
    }

    // Cleanup
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown)
    }

    // Lifecycle equivalent
    setTimeout(initialize, 0)

    // Return all reactive data and methods for the template
    return {
      // Reactive data
      username,
      password,
      errorMessage,
      loading,
      rememberMe,
      showPassword,
      isFormValid,

      // Methods
      handleLogin,
      handleForgotPassword,
      togglePasswordVisibility,
      clearForm,
      clearError,
      validateForm,
      watchFormChanges,
      fillDemoCredentials,
      getDemoUsers,
      getRoleDisplayName,
      formatEspecialidad,

      // Lifecycle methods
      initialize,
      cleanup
    }
  }
}
</script>

<style src="src/assets/LoginForm.css" scoped></style>