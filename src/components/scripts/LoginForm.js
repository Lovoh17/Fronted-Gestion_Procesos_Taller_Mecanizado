import { ref } from 'vue'
import { useRouter } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'

export default {
  setup() {
    // Router and store
    const router = useRouter()
    // const authStore = useAuthStore()

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
      // In a real implementation, you would use Vue's watch functionality
      // This is a simplified version for demonstration
      if (username.value || password.value) {
        validateForm()
      }
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

        // Mock authentication logic for development
        if (username.value === 'admin' && password.value === 'admin123') {
          // Simulate admin login
          localStorage.setItem('userRole', 'admin')
          localStorage.setItem('userName', username.value)
          localStorage.setItem('isAuthenticated', 'true')
          
          if (rememberMe.value) {
            localStorage.setItem('rememberedUser', username.value)
          }
          
          console.log('Admin login successful')
          router.push('/admin-dashboard')
          
        } else if (username.value === 'coordinador' && password.value === 'coord123') {
          // Simulate coordinator login
          localStorage.setItem('userRole', 'coordinator')
          localStorage.setItem('userName', username.value)
          localStorage.setItem('isAuthenticated', 'true')
          
          if (rememberMe.value) {
            localStorage.setItem('rememberedUser', username.value)
          }
          
          console.log('Coordinator login successful')
          router.push('/dashboard-coordinador')
          
        } else if (username.value === 'operario' && password.value === 'oper123') {
          // Simulate operator login
          localStorage.setItem('userRole', 'operator')
          localStorage.setItem('userName', username.value)
          localStorage.setItem('isAuthenticated', 'true')
          
          if (rememberMe.value) {
            localStorage.setItem('rememberedUser', username.value)
          }
          
          console.log('Operator login successful')
          router.push('/dashboard-operario')
          
        } else if (username.value === 'tecnico' && password.value === 'tech123') {
          // Simulate technician login
          localStorage.setItem('userRole', 'technician')
          localStorage.setItem('userName', username.value)
          localStorage.setItem('isAuthenticated', 'true')
          
          if (rememberMe.value) {
            localStorage.setItem('rememberedUser', username.value)
          }
          
          console.log('Technician login successful')
          router.push('/tech-dashboard')
          
        } else {
          // Invalid credentials
          throw new Error('Credenciales inválidas')
        }

        // Real API implementation would look like this:
        /*
        await authStore.login({
          username: username.value,
          password: password.value,
          rememberMe: rememberMe.value
        })

        // Redirect based on role
        const userRole = authStore.user?.role
        switch (userRole) {
          case 'admin':
            router.push('/admin-dashboard')
            break
          case 'coordinator':
            router.push('/dashboard-coordinador')
            break
          case 'operator':
            router.push('/dashboard-operario')
            break
          case 'technician':
            router.push('/tech-dashboard')
            break
          default:
            router.push('/dashboard')
        }
        */

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
      // In a real implementation, this would trigger a password reset flow
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
        admin: { username: 'admin', password: 'admin123' },
        coordinator: { username: 'coordinador', password: 'coord123' },
        operator: { username: 'operario', password: 'oper123' },
        technician: { username: 'tecnico', password: 'tech123' }
      }

      const credentials = demoCredentials[role]
      if (credentials) {
        username.value = credentials.username
        password.value = credentials.password
        validateForm()
        console.log(`Demo credentials loaded for ${role}`)
      }
    }

    const getQuickAccessLinks = () => {
      return {
        admin: [
          { path: '/admin-dashboard', label: 'Dashboard Admin', icon: 'fas fa-tachometer-alt' },
          { path: '/admin/users', label: 'Usuarios', icon: 'fas fa-users' },
          { path: '/admin/departments', label: 'Departamentos', icon: 'fas fa-building' },
          { path: '/admin/orders', label: 'Órdenes', icon: 'fas fa-clipboard-list' },
          { path: '/admin/reports', label: 'Reportes', icon: 'fas fa-chart-bar' },
          { path: '/admin/transacciones', label: 'Transacciones', icon: 'fas fa-exchange-alt' }
        ],
        coordinator: [
          { path: '/dashboard-coordinador', label: 'Dashboard Coordinador', icon: 'fas fa-clipboard-list' },
          { path: '/control-calidad', label: 'Control de Calidad', icon: 'fas fa-check-circle' },
          { path: '/coordinator/planning', label: 'Planificación', icon: 'fas fa-calendar' },
          { path: '/coordinator/orders', label: 'Órdenes de Trabajo', icon: 'fas fa-tasks' },
          { path: '/coordinator/maintenance', label: 'Mantenimiento', icon: 'fas fa-wrench' },
          { path: '/coordinator/movimientos', label: 'Movimientos', icon: 'fas fa-arrows-alt' },
          { path: '/coordinator/planos-tools', label: 'Planos y Herramientas', icon: 'fas fa-tools' }
        ],
        operator: [
          { path: '/dashboard-operario', label: 'Dashboard Operario', icon: 'fas fa-user-hard-hat' },
          { path: '/operario/trabajos', label: 'Trabajos', icon: 'fas fa-hammer' },
          { path: '/operario/reportes', label: 'Reportes', icon: 'fas fa-file-alt' }
        ],
        technician: [
          { path: '/tech-dashboard', label: 'Dashboard Técnico', icon: 'fas fa-cogs' },
          { path: '/tech/schedule', label: 'Programación', icon: 'fas fa-calendar-alt' }
        ],
        shared: [
          { path: '/herramientas', label: 'Herramientas', icon: 'fas fa-toolbox' },
          { path: '/inventory', label: 'Inventario', icon: 'fas fa-warehouse' },
          { path: '/settings', label: 'Configuración', icon: 'fas fa-cog' }
        ]
      }
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
      console.log('LoginForm initialized')
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
    // Note: In a real Vue 3 setup, you would use onMounted and onUnmounted
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
      getQuickAccessLinks,
      
      // Lifecycle methods
      initialize,
      cleanup
    }
  }
}
