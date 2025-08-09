import UserModal from '@/components/VistasAdmin/ComponentesAdmin/UserModal.vue'
import axios from 'axios'

export default {
  components: { UserModal },

  data() {
    return {
      users: [],
      searchQuery: '',
      userTypeFilter: 'all',
      statusFilter: 'all',
      sortField: 'id',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
      showFilters: true,
      showAddUserModal: false,
      showDeleteModal: false,
      selectedUser: null,
      userToDelete: null,
      loading: false,
      error: null
    }
  },

  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesType = this.userTypeFilter === 'all' ||
          (this.userTypeFilter === 'coordinator' && user.type === 'coordinator') ||
          (this.userTypeFilter === 'employee' && user.type === 'employee') ||
          (this.userTypeFilter === 'admin' && user.type === 'admin')

        const matchesStatus = this.statusFilter === 'all' ||
          user.status === this.statusFilter

        const matchesSearch = this.searchQuery === '' ||
          (user.name && user.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (user.id && String(user.id).includes(this.searchQuery)) ||
          (user.nombre && user.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (user.apellido && user.apellido.toLowerCase().includes(this.searchQuery.toLowerCase()))

        return matchesType && matchesStatus && matchesSearch
      }).sort((a, b) => {
        const modifier = this.sortDirection === 'asc' ? 1 : -1
        if (a[this.sortField] < b[this.sortField]) return -1 * modifier
        if (a[this.sortField] > b[this.sortField]) return 1 * modifier
        return 0
      })
    },

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredUsers.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage)
    },

    pages() {
      const pages = []
      const maxVisiblePages = 5

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) pages.push(i)
        return pages
      }

      let start = Math.max(1, this.currentPage - 2)
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1)

      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1
      }

      if (start > 1) pages.push(1, start > 2 ? '...' : null)
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < this.totalPages) pages.push(end < this.totalPages - 1 ? '...' : null, this.totalPages)

      return pages.filter(p => p)
    },

    showingFrom() {
      return (this.currentPage - 1) * this.itemsPerPage + 1
    },

    showingTo() {
      return Math.min(this.currentPage * this.itemsPerPage, this.filteredUsers.length)
    }
  },

  methods: {
    async loadUsers() {
      this.loading = true
      this.error = null
      try {
        console.log("🔄 Vista: Iniciando carga de usuarios...")

        const response = await axios.get('/api/Usuario')

        // Debug detallado
        console.log("📊 Vista: Respuesta completa del servidor:", response)
        console.log("📊 Vista: Status de respuesta:", response.status)
        console.log("📊 Vista: Datos recibidos:", response.data)
        console.log("📊 Vista: Tipo de datos:", typeof response.data)

        let userData = []

        if (response.data && response.data.success) {
          userData = response.data.data || []
        } else if (Array.isArray(response.data)) {
          userData = response.data
          console.log("✅ Vista: Respuesta es array directo")
        } else {
          console.log("⚠️ Vista: Estructura de respuesta no reconocida")
          userData = []
        }

        console.log("📋 Vista: Datos finales a procesar:", userData)
        console.log("📋 Vista: Cantidad de usuarios:", userData.length)

        if (!Array.isArray(userData)) {
          console.error("❌ Vista: userData no es un array:", typeof userData)
          throw new Error('Los datos recibidos no tienen el formato esperado')
        }

        this.users = userData.map((user, index) => {
          console.log(`👤 Vista: Procesando usuario ${index + 1}:`, user)

          if (!user || typeof user !== 'object') {
            console.warn(`⚠️ Vista: Usuario ${index + 1} no es un objeto válido:`, user)
            return null
          }

          const transformedUser = {
            id: user.id,
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            puesto_id: user.puesto_id || 2,
            estado_id: user.estado_id !== undefined ? user.estado_id : 1,
            password: user.password || '',
            foto_ruta: user.foto_ruta || null,
            es_subcontratado: user.es_subcontratado || false,
            fecha_contratacion: user.fecha_contratacion || null,
            fecha_termino_contrato: user.fecha_termino_contrato || null,
            habilidades_tecnicas: user.habilidades_tecnicas || null,
            turno_id: user.turno_id || null,
            ultimo_acceso: user.ultimo_acceso || null,
            name: user.nombre || '',
            lastname: user.apellido || '',
            type: this.mapPuestoToType(user.puesto_id || 2),
            status: this.mapEstadoToStatus(user.estado_id !== undefined ? user.estado_id : 1),
            last_login: user.ultimo_acceso || null,
            createdAt: user.createdAt || null,
            updatedAt: user.updatedAt || null
          }

          console.log(`✅ Vista: Usuario ${index + 1} transformado:`, transformedUser)
          return transformedUser
        }).filter(user => user !== null)

        console.log(`🎉 Vista: ${this.users.length} usuarios cargados y transformados correctamente`)

        if (this.users.length === 0) {
          console.log("⚠️ Vista: No se encontraron usuarios válidos en la respuesta")
          this.showToast('No se encontraron usuarios', 'info')
        } else {
          console.log("👥 Vista: Lista final de usuarios:", this.users)
        }

      } catch (error) {
        console.error("❌ Vista: Error detallado cargando usuarios:", error)

        if (error.response) {
          console.error("📊 Vista: Error response status:", error.response.status)
          console.error("📊 Vista: Error response data:", error.response.data)
          console.error("📊 Vista: Error response headers:", error.response.headers)

          if (error.response.data && error.response.data.message) {
            this.showToast(`Error del servidor: ${error.response.data.message}`, 'error')
          } else {
            this.showToast(`Error HTTP ${error.response.status}: ${error.response.statusText}`, 'error')
          }
        } else if (error.request) {
          console.error("📊 Vista: Error request (sin respuesta):", error.request)
          this.showToast('No se pudo conectar con el servidor. Verifica tu conexión.', 'error')
        } else {
          console.error("📊 Vista: Error de configuración:", error.message)
          this.showToast(`Error: ${error.message}`, 'error')
        }

        this.error = error
        this.users = []
      } finally {
        this.loading = false
      }
    },

    async testConnection() {
      try {
        console.log("🧪 Vista: Probando conexión con el backend...")
        const response = await axios.get('/api/Usuario/test')
        console.log("🧪 Vista: Respuesta del test:", response.data)

        if (response.data.success) {
          this.showToast(`Test exitoso: ${response.data.testData.usersFound} usuarios encontrados`, 'success')
        } else {
          this.showToast('Test falló: ' + response.data.message, 'error')
        }
      } catch (error) {
        console.error("🧪 Vista: Error en test:", error)
        this.showToast('Error en test de conexión: ' + this.getErrorMessage(error), 'error')
      }
    },

    mapPuestoToType(puestoId) {
      switch (puestoId) {
        case 1:
          return 'coordinator'
        case 2:
          return 'employee'
        case 3:
          return 'admin'
        default:
          return 'employee'
      }
    },

    mapEstadoToStatus(estado) {
      return estado === 1 ? 'active' : 'inactive'
    },

    getErrorMessage(error) {
      if (error.response) {
        return error.response.data.message || error.response.statusText
      }
      return error.message
    },

    applyFilters() {
      this.currentPage = 1
    },

    resetFilters() {
      this.searchQuery = ''
      this.userTypeFilter = 'all'
      this.statusFilter = 'active'
      this.currentPage = 1
    },

    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }
    },

    sortIcon(field) {
      if (this.sortField !== field) return 'fas fa-sort'
      return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    goToPage(page) {
      if (page !== '...') {
        this.currentPage = page
      }
    },

    toggleFilters() {
      this.showFilters = !this.showFilters
    },

    editUser(user) {
      this.selectedUser = { ...user }
      this.showAddUserModal = true
    },

    async toggleUserStatus(user) {
      const currentStatus = user.estado || user.status
      const newStatus = (currentStatus === 'active' || currentStatus === 1) ? 0 : 1

      try {
        const updatedUser = {
          ...user,
          estado: newStatus,
          status: newStatus === 1 ? 'active' : 'inactive'
        }

        await axios.put(`/api/Usuario/${user.id}`, {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          puesto_id: user.puesto_id,
          estado: newStatus
        })

        const index = this.users.findIndex(u => u.id === user.id)
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser)
        }

        this.showToast(`Usuario ${newStatus === 1 ? 'activado' : 'desactivado'}`, 'success')
      } catch (error) {
        console.error("Error cambiando estado:", error)
        this.showToast('Error al cambiar estado: ' + this.getErrorMessage(error), 'error')
      }
    },

    confirmDelete(userId) {
      this.userToDelete = userId
      this.showDeleteModal = true
    },

    async deleteUser() {
      if (!this.userToDelete) return

      try {
        await axios.delete(`/api/Usuario/${this.userToDelete}`)

        this.users = this.users.filter(user => user.id !== this.userToDelete)

        this.showToast('Usuario eliminado correctamente', 'success')
      } catch (error) {
        console.error("Error eliminando usuario:", error)
        this.showToast('Error al eliminar usuario: ' + this.getErrorMessage(error), 'error')
      } finally {
        this.showDeleteModal = false
        this.userToDelete = null
      }
    },

    closeUserModal() {
      this.showAddUserModal = false
      this.selectedUser = null
    },

    async saveUser(userData) {
      // Validaciones mejoradas
      if (!userData.nombre?.trim()) {
        this.showToast('El nombre es requerido', 'error');
        return;
      }

      if (!userData.apellido?.trim()) {
        this.showToast('El apellido es requerido', 'error');
        return;
      }

      if (!userData.email?.trim()) {
        this.showToast('El email es requerido', 'error');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email.trim())) {
        this.showToast('Ingrese un email válido', 'error');
        return;
      }

      try {
        // Preparar datos para el backend
        const payload = {
          nombre: userData.nombre.trim(),
          apellido: userData.apellido.trim(),
          email: userData.email.trim().toLowerCase(),
          puesto_id: userData.puesto_id || 2,
          estado_id: userData.estado_id !== undefined ? userData.estado_id : 1,
          foto_ruta: userData.foto_ruta || null,
          es_subcontratado: Boolean(userData.es_subcontratado),
          fecha_contratacion: userData.fecha_contratacion || null,
          fecha_termino_contrato: userData.fecha_termino_contrato || null,
          habilidades_tecnicas: userData.habilidades_tecnicas || null,
          turno_id: userData.turno_id || null
        };

        // Manejo de contraseña
        if (userData.password?.trim()) {
          if (userData.password.length < 6) {
            this.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
          }
          payload.password = userData.password;
        }

        let response;

        if (userData.id) {
          // Actualizar usuario existente
          response = await axios.put(`/api/Usuario/${userData.id}`, payload);

          // Actualizar lista local
          const index = this.users.findIndex(u => u.id === userData.id);
          if (index !== -1) {
            this.users.splice(index, 1, {
              ...this.users[index],
              ...response.data.data,
              name: response.data.data.nombre,
              lastname: response.data.data.apellido,
              status: response.data.data.estado_id === 1 ? 'active' : 'inactive',
              type: this.mapPuestoToType(response.data.data.puesto_id)
            });
          }

          this.showToast(response.data.message || 'Usuario actualizado correctamente', 'success');
        } else {
          // Crear nuevo usuario
          if (!payload.password) {
            this.showToast('La contraseña es requerida para nuevos usuarios', 'error');
            return;
          }

          response = await axios.post('/api/Usuario', payload);

          // Agregar a lista local
          this.users.unshift({
            ...response.data,
            name: response.data.nombre,
            lastname: response.data.apellido,
            status: response.data.estado_id === 1 ? 'active' : 'inactive',
            type: this.mapPuestoToType(response.data.puesto_id)
          });

          this.showToast(response.data.message || 'Usuario creado correctamente', 'success');
        }

        this.closeUserModal();

      } catch (error) {
        console.error('Error al guardar usuario:', error);

        let errorMsg = 'Error al procesar la solicitud';

        if (error.response) {
          // Manejo de errores del backend
          if (error.response.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.data?.error) {
            errorMsg = error.response.data.error;
          } else if (error.response.status === 400) {
            errorMsg = 'Datos inválidos enviados al servidor';
          } else if (error.response.status === 404) {
            errorMsg = 'Usuario no encontrado';
          } else if (error.response.status === 409) {
            errorMsg = 'El email ya está registrado';
          }
        } else if (error.request) {
          errorMsg = 'No se pudo conectar con el servidor';
        }

        this.showToast(errorMsg, 'error');
      }
    },

    async deleteUser() {
      if (!this.userToDelete) return;

      try {
        await axios.delete(`/api/Usuario/${this.userToDelete}`);

        // Actualizar lista local
        this.users = this.users.filter(user => user.id !== this.userToDelete);

        this.showToast('Usuario eliminado correctamente', 'success');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);

        let errorMsg = 'Error al eliminar usuario';
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.response?.status === 404) {
          errorMsg = 'Usuario no encontrado';
        }

        this.showToast(errorMsg, 'error');
      } finally {
        this.showDeleteModal = false;
        this.userToDelete = null;
      }
    },

    async toggleUserStatus(user) {
      try {
        const newStatus = user.estado_id === 1 ? 0 : 1;

        const response = await axios.patch(`/api/Usuario/${user.id}/status`, {
          estado_id: newStatus
        });

        // Actualizar estado localmente
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index].estado_id = newStatus;
          this.users[index].status = newStatus === 1 ? 'active' : 'inactive';
        }

        this.showToast(
          `Usuario ${newStatus === 1 ? 'activado' : 'desactivado'} correctamente`,
          'success'
        );
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        this.showToast('Error al cambiar estado del usuario', 'error');
      }
    },

    // Helper para mapear puesto_id a tipo
    mapPuestoToType(puestoId) {
      const types = {
        1: 'coordinator',
        2: 'employee',
        3: 'admin'
      };
      return types[puestoId] || 'employee';
    },

    // Helper para mostrar notificaciones
    showToast(message, type = 'success') {
      // Implementa según tu librería de notificaciones
      console.log(`${type.toUpperCase()}: ${message}`);
      // Ejemplo con Vuetify: this.$toast[type](message);
    },

    formatUserType(type) {
      if (typeof type === 'number') {
        const types = {
          1: 'Coordinador',
          2: 'Empleado',
          3: 'Administrador',
          4: 'Tecnico'
        }
        return types[type] || 'Empleado'
      }

      const types = {
        'coordinator': 'Coordinador',
        'employee': 'Empleado',
        'admin': 'Administrador'
      }
      return types[type] || 'Empleado'
    },

    userTypeClass(type) {
      if (typeof type === 'number') {
        return {
          1: 'badge-primary',
          2: 'badge-secondary',
          3: 'badge-warning'
        }[type] || 'badge-light'
      }

      return {
        'coordinator': 'badge-primary',
        'employee': 'badge-secondary',
        'admin': 'badge-warning'
      }[type] || 'badge-light'
    },

    statusClass(status) {
      if (typeof status === 'number') {
        return status === 1 ? 'badge-success' : 'badge-danger'
      }

      return {
        'active': 'badge-success',
        'inactive': 'badge-danger'
      }[status] || 'badge-light'
    },

    formatStatus(status) {
      if (typeof status === 'number') {
        return status === 1 ? 'Activo' : 'Inactivo'
      }

      return {
        'active': 'Activo',
        'inactive': 'Inactivo'
      }[status] || 'Inactivo'
    },

    formatDate(date) {
      if (!date) return 'Nunca'
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    showToast(message, type = 'success') {
      alert(`${type.toUpperCase()}: ${message}`)
    }
  },

  mounted() {
    this.loadUsers()
  }
}