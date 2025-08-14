import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const formData = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const isSubmitting = ref(false)
    const errorMessage = ref('')

    const validateForm = () => {
      // Limpiar mensajes de error previos
      errorMessage.value = ''

      // Validación de campos requeridos
      if (!formData.value.name.trim()) {
        errorMessage.value = 'El nombre es requerido'
        return false
      }

      if (!formData.value.email.trim()) {
        errorMessage.value = 'El correo electrónico es requerido'
        return false
      }

      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.value.email)) {
        errorMessage.value = 'Por favor ingresa un correo electrónico válido'
        return false
      }

      // Validación de longitud mínima de contraseña
      if (formData.value.password.length < 6) {
        errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
        return false
      }

      // Validación de coincidencia de contraseñas
      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = 'Las contraseñas no coinciden'
        return false
      }

      return true
    }

    const handleSubmit = async () => {
      // Validar formulario antes de proceder
      if (!validateForm()) {
        return
      }

      isSubmitting.value = true
      errorMessage.value = ''
      
      try {
        console.log('Attempting to register user:', formData.value.email)
        
        // Simulación de registro (reemplazar con llamada API real)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Aquí iría la llamada API real:
        /*
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.value.name,
            email: formData.value.email,
            password: formData.value.password
          })
        })
        
        if (!response.ok) {
          throw new Error('Error en el registro')
        }
        
        const result = await response.json()
        */
        
        console.log('Registration successful, redirecting to login')
        
        // Redirección después de registro exitoso
        router.push({ path: '/login', query: { registered: 'true' } })
        
      } catch (error) {
        console.error('Registration error:', error)
        errorMessage.value = error.response?.data?.message || 'Error al registrar. Por favor intenta nuevamente.'
      } finally {
        isSubmitting.value = false
      }
    }

    const clearForm = () => {
      formData.value = {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
      errorMessage.value = ''
    }

    return {
      formData,
      isSubmitting,
      errorMessage,
      handleSubmit,
      clearForm
    }
  }
}
