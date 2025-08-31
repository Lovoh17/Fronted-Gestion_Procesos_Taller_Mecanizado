import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockUsers } from '@/mock/users'
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

    // Demo/Development utilities - Updated with new mock credentials
    const fillDemoCredentials = (role) => {
      const demoCredentials = {
        jefe_taller: { 
          username: 'jefeTaller@taller.com', 
          password: 'jefe123',
          displayName: 'Isabel Moreno - Jefe de Taller'
        },
        coordinador: { 
          username: 'coordinador@taller.com', 
          password: 'coord123',
          displayName: 'Jorge López - Coordinador'
        },
        operario: { 
          username: 'operario@taller.com', 
          password: 'oper123',
          displayName: 'Roberto Sánchez - Operario'
        },
        tecnico: { 
          username: 'tecnico@taller.com', 
          password: 'tech123',
          displayName: 'Carlos Martín - Técnico'
        }
      }

      const credentials = demoCredentials[role]
      if (credentials) {
        username.value = credentials.username
        password.value = credentials.password
        validateForm()
        console.log(`Demo credentials loaded for ${credentials.displayName}`)
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

    const getQuickAccessLinks = () => {
      return {
        jefe_taller: [
          { path: '/admin-dashboard', label: 'Dashboard Admin', icon: 'fas fa-tachometer-alt' },
          { path: '/admin/users', label: 'Usuarios', icon: 'fas fa-users' },
          { path: '/admin/departments', label: 'Departamentos', icon: 'fas fa-building' },
          { path: '/admin/orders', label: 'Órdenes', icon: 'fas fa-clipboard-list' },
          { path: '/admin/reports', label: 'Reportes', icon: 'fas fa-chart-bar' },
          { path: '/admin/transacciones', label: 'Transacciones', icon: 'fas fa-exchange-alt' }
        ],
        coordinador: [
          { path: '/dashboard-coordinador', label: 'Dashboard Coordinador', icon: 'fas fa-clipboard-list' },
          { path: '/control-calidad', label: 'Control de Calidad', icon: 'fas fa-check-circle' },
          { path: '/coordinator/planning', label: 'Planificación', icon: 'fas fa-calendar' },
          { path: '/coordinator/orders', label: 'Órdenes de Trabajo', icon: 'fas fa-tasks' },
          { path: '/coordinator/maintenance', label: 'Mantenimiento', icon: 'fas fa-wrench' },
          { path: '/coordinator/movimientos', label: 'Movimientos', icon: 'fas fa-arrows-alt' },
          { path: '/coordinator/planos-tools', label: 'Planos y Herramientas', icon: 'fas fa-tools' }
        ],
        operario: [
          { path: '/dashboard-operario', label: 'Dashboard Operario', icon: 'fas fa-user-hard-hat' },
          { path: '/operario/trabajos', label: 'Trabajos', icon: 'fas fa-hammer' },
          { path: '/operario/reportes', label: 'Reportes', icon: 'fas fa-file-alt' }
        ],
        tecnico: [
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
      getDemoUsers,
      getRoleDisplayName,
      
      // Lifecycle methods
      initialize,
      cleanup
    }
  }
}