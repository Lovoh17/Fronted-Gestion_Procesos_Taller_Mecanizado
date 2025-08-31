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

      // PRIMERO: Limpiar COMPLETAMENTE el store de Pinia
      console.log('🧹 [Login] Limpiando store de Pinia antes del nuevo login...')
      authStore.clearUserData()

      // SEGUNDO: Limpiar localStorage completamente del usuario anterior
      const keysToRemove = [
        'userRole', 'userName', 'userEmail', 'userId', 'isAuthenticated',
        'authToken', 'userAvatar', 'userPuesto', 'userDepartamento',
        'nivelJerarquico', 'esSupervisor', 'userEspecialidades',
        'contratoTemporal', 'fechaFinContrato'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // SEGUNDO: Store authentication data in localStorage
      localStorage.setItem('userRole', user.role)
      localStorage.setItem('userName', user.name)
      localStorage.setItem('userEmail', user.email)
      localStorage.setItem('userId', user.id.toString())
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('authToken', token)
      localStorage.setItem('userAvatar', user.avatar || '')

      // IMPORTANTE: Asegurar que puesto_id se guarde correctamente
      localStorage.setItem('userPuesto', user.puesto_id?.toString() || '')
      localStorage.setItem('userDepartamento', user.departamento_id?.toString() || '')
      localStorage.setItem('nivelJerarquico', user.nivel_jerarquico?.toString() || '')
      localStorage.setItem('esSupervisor', user.es_supervisor ? 'true' : 'false')

      if (user.especialidades) {
        localStorage.setItem('userEspecialidades', JSON.stringify(user.especialidades))
      }

      if (user.contrato_temporal) {
        localStorage.setItem('contratoTemporal', 'true')
        localStorage.setItem('fechaFinContrato', user.fecha_fin_contrato || '')
      }

      if (rememberMe.value) {
        localStorage.setItem('rememberedUser', username.value)
      }

      // TERCERO: Actualizar el store de Pinia INMEDIATAMENTE
      authStore.setUser(user, token)

      // CUARTO: Forzar la sincronización del store con localStorage
      authStore.initializeAuth()

      console.log(`${user.role} login successful for ${user.name}`)
      console.log('User data stored:', {
        role: user.role,
        puesto_id: user.puesto_id,
        nivel_jerarquico: user.nivel_jerarquico,
        es_supervisor: user.es_supervisor
      })
      console.log('AuthStore después del login:', authStore.user)

      // Redirect based on role and puesto_id
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