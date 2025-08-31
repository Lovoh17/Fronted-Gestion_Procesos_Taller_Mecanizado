// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: null
  }),

  getters: {
    userRole: (state) => state.user?.role || localStorage.getItem('userRole'),
    userName: (state) => state.user?.name || localStorage.getItem('userName'),
    userEmail: (state) => state.user?.email || localStorage.getItem('userEmail'),
    userId: (state) => state.user?.id || localStorage.getItem('userId'),
    userPuestoId: (state) => {
      if (state.user?.puesto_id) {
        return parseInt(state.user.puesto_id)
      }
      const stored = localStorage.getItem('userPuesto')
      return stored ? parseInt(stored) : null
    },
    userDepartamentoId: (state) => {
      if (state.user?.departamento_id) {
        return parseInt(state.user.departamento_id)
      }
      const stored = localStorage.getItem('userDepartamento')
      return stored ? parseInt(stored) : null
    },
    nivelJerarquico: (state) => {
      if (state.user?.nivel_jerarquico) {
        return parseInt(state.user.nivel_jerarquico)
      }
      const stored = localStorage.getItem('nivelJerarquico')
      return stored ? parseInt(stored) : null
    },
    esSupervisor: (state) => {
      if (state.user?.es_supervisor !== undefined) {
        return state.user.es_supervisor
      }
      const stored = localStorage.getItem('esSupervisor')
      return stored === 'true'
    }
  },

  actions: {
    initializeAuth() {
      // Inicializar el store desde localStorage al cargar la aplicación
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      const token = localStorage.getItem('authToken')

      if (isAuthenticated && token) {
        this.isAuthenticated = true
        this.token = token

        // Reconstruir el objeto user desde localStorage
        const userRole = localStorage.getItem('userRole')
        const userName = localStorage.getItem('userName')
        const userEmail = localStorage.getItem('userEmail')
        const userId = localStorage.getItem('userId')
        const userPuesto = localStorage.getItem('userPuesto')
        const userDepartamento = localStorage.getItem('userDepartamento')
        const nivelJerarquico = localStorage.getItem('nivelJerarquico')
        const esSupervisor = localStorage.getItem('esSupervisor') === 'true'
        const userAvatar = localStorage.getItem('userAvatar')

        if (userRole && userName && userEmail && userId) {
          this.user = {
            id: parseInt(userId),
            name: userName,
            email: userEmail,
            role: userRole,
            puesto_id: userPuesto ? parseInt(userPuesto) : null,
            departamento_id: userDepartamento ? parseInt(userDepartamento) : null,
            nivel_jerarquico: nivelJerarquico ? parseInt(nivelJerarquico) : null,
            es_supervisor: esSupervisor,
            avatar: userAvatar
          }

          // Agregar especialidades si existen
          const especialidades = localStorage.getItem('userEspecialidades')
          if (especialidades) {
            try {
              this.user.especialidades = JSON.parse(especialidades)
            } catch (e) {
              console.error('Error parsing especialidades:', e)
            }
          }

          // Agregar datos de contrato temporal si existen
          const contratoTemporal = localStorage.getItem('contratoTemporal') === 'true'
          if (contratoTemporal) {
            this.user.contrato_temporal = true
            this.user.fecha_fin_contrato = localStorage.getItem('fechaFinContrato')
          }

          console.log('🔐 [AuthStore] Usuario inicializado desde localStorage:', this.user)
        }
      }
    },

    setUser(userData, token) {
      this.user = userData
      this.isAuthenticated = true
      this.token = token
      
      console.log('🔐 [AuthStore] Usuario establecido:', userData)
    },

    logout() {
      // Limpiar el store
      this.user = null
      this.isAuthenticated = false
      this.token = null

      // Limpiar localStorage
      const keysToRemove = [
        'isAuthenticated',
        'authToken',
        'userRole',
        'userName',
        'userEmail',
        'userId',
        'userPuesto',
        'userDepartamento',
        'nivelJerarquico',
        'esSupervisor',
        'userAvatar',
        'userEspecialidades',
        'contratoTemporal',
        'fechaFinContrato'
      ]

      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      console.log('🔐 [AuthStore] Usuario desconectado')
    }
  }
})