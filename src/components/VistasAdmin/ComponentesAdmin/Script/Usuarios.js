import UserModal from '@/components/VistasAdmin/ComponentesAdmin/UserModal.vue'
import axios from 'axios'

export default {
  components: { UserModal },

  data() {
    return {
      users: [],
      estados: [],
      roles: [],
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
      error: null,
      // Configuración de columnas para vue-good-table-next
      tableColumns: [
        {
          label: 'ID',
          field: 'id',
          type: 'number',
          sortable: true,
          width: '80px'
        },
        {
          label: 'Nombre Completo',
          field: 'fullName',
          type: 'string',
          sortable: false,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por nombre',
            filterValue: '',
            trigger: 'enter'
          }
        },
        {
          label: 'Email',
          field: 'email',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            placeholder: 'Filtrar por email'
          }
        },
        {
          label: 'Rol',
          field: 'type',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [], // Se llenará dinámicamente con los roles
            filterMultiselect: false,
            placeholder: 'Todos los tipos'
          }
        },
        {
          label: 'Estado',
          field: 'status',
          type: 'string',
          sortable: true,
          filterOptions: {
            enabled: true,
            filterDropdownItems: [], // Se llenará dinámicamente
            filterMultiselect: false,
            placeholder: 'Todos los estados'
          }
        },
        {
          label: 'Último Acceso',
          field: 'last_login',
          type: 'date',
          dateInputFormat: 'yyyy-MM-dd HH:mm:ss',
          dateOutputFormat: 'dd/MM/yyyy HH:mm',
          sortable: true
        },
        {
          label: 'Acciones',
          field: 'actions',
          sortable: false,
          width: '150px'
        }
      ]
    }
  },

  computed: {
    // Computed property para obtener los estados editables
    editableEstados() {
      return this.estados.filter(estado => estado.es_editable)
    },

    // Computed property para los filtros de estado
    statusFilterOptions() {
      return this.estados.map(estado => ({
        value: estado.id.toString(),
        text: estado.nombre
      }))
    },

    // Computed property para los filtros de roles
    roleFilterOptions() {
      return this.roles.map(rol => ({
        value: rol.descripcion,
        text: rol.descripcion
      }))
    },


    // Computed property para obtener roles con permiso de subida
    rolesConPermisoSubida() {
      return this.roles.filter(rol => rol.permiso_subida === 1)
    },

    filteredUsers() {
      return this.users.filter(user => {
        const matchesType = this.userTypeFilter === 'all' ||
          user.type === this.userTypeFilter

        const matchesStatus = this.statusFilter === 'all' ||
          user.estado_id === parseInt(this.statusFilter)

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
    async loadRoles() {
      try {
        const response = await axios.get('/api/Rol')

        if (response.data && response.data.success) {
          this.roles = response.data.data || []
        } else if (Array.isArray(response.data)) {
          this.roles = response.data
        } else {
          this.roles = []
        }

        // Actualizar las opciones de filtro de tipo en la configuración de columnas
        const typeColumn = this.tableColumns.find(col => col.field === 'type')
        if (typeColumn && typeColumn.filterOptions) {
          typeColumn.filterOptions.filterDropdownItems = this.roleFilterOptions
        }

        console.log(`✅ ${this.roles.length} roles cargados`)

      } catch (error) {
        console.error("❌ Error cargando roles:", error)
        this.showToast('Error al cargar roles de usuario', 'error')
        this.roles = []
      }
    },

    async loadEstados() {
      try {
        const response = await axios.get('/api/EstadoUsuario')

        if (response.data && response.data.success) {
          this.estados = response.data.data || []
        } else if (Array.isArray(response.data)) {
          this.estados = response.data
        } else {
          this.estados = []
        }

        // Actualizar las opciones de filtro de estado en la configuración de columnas
        const statusColumn = this.tableColumns.find(col => col.field === 'status')
        if (statusColumn && statusColumn.filterOptions) {
          statusColumn.filterOptions.filterDropdownItems = this.statusFilterOptions
        }

        console.log(`✅ ${this.estados.length} estados cargados`)

      } catch (error) {
        console.error("❌ Error cargando estados:", error)
        this.showToast('Error al cargar estados de usuario', 'error')
        this.estados = []
      }
    },

    async loadUsers() {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('/api/Usuario')

        let userData = []

        if (response.data && response.data.success) {
          userData = response.data.data || []
        } else if (Array.isArray(response.data)) {
          userData = response.data
        } else {
          userData = []
        }

        console.log(`📋 ${userData.length} usuarios recibidos del servidor`)

        if (!Array.isArray(userData)) {
          console.error("❌ userData no es un array:", typeof userData)
          throw new Error('Los datos recibidos no tienen el formato esperado')
        }

        this.users = userData.map((user, index) => {
          if (!user || typeof user !== 'object') {
            return null
          }

          const transformedUser = {
            id: user.id,
            fullName: `${user.nombre || ''} ${user.apellido || ''}`.trim(),
            email: user.email || '',
            puesto_id: user.puesto_id,
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
            type: this.getRolDescripcion(user.puesto_id ?? 4),
            status: user.estado_id,
            last_login: user.ultimo_acceso || null,
            createdAt: user.createdAt || null,
            updatedAt: user.updatedAt || null
          }

          return transformedUser
        }).filter(user => user !== null)

        console.log(`✅ ${this.users.length} usuarios cargados correctamente`)

        if (this.users.length === 0) {
          this.showToast('No se encontraron usuarios', 'info')
        }

      } catch (error) {
        console.error("❌ Error cargando usuarios:", error)

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

    getRolById(rolId) {
      return this.roles.find(rol => rol.id === rolId) || null
    },

    getRolDescripcion(rolId) {
      if (rolId === undefined || rolId === null || rolId === '') {
        return 'Sin Rol'
      }
      const rol = this.getRolById(Number(rolId))
      return rol ? rol.descripcion : 'Rol Desconocido'
    },

    hasUploadPermission(rolId) {
      const rol = this.getRolById(rolId)
      return rol ? rol.permiso_subida === 1 : false
    },

    getEstadoById(estadoId) {
      return this.estados.find(estado => estado.id === estadoId) || null
    },

    getEstadoNombre(estadoId) {
      const estado = this.getEstadoById(estadoId)
      return estado ? estado.nombre : 'Desconocido'
    },

    getEstadoColor(estadoId) {
      const estado = this.getEstadoById(estadoId)
      return estado ? estado.color_indicador : 'gray'
    },

    canAccessSystem(estadoId) {
      const estado = this.getEstadoById(estadoId)
      return estado ? estado.permite_acceso : false
    },

    isEstadoEditable(estadoId) {
      const estado = this.getEstadoById(estadoId)
      return estado ? estado.es_editable : false
    },

    formatUserType(puestoId) {
      if (typeof puestoId === 'number') {
        return this.getRolDescripcion(puestoId)
      }
      return puestoId || 'Desconocido'
    },

    userTypeClass(puestoId) {
      const roleClassMap = {
        1: 'badge-warning',    // Administrador
        2: 'badge-primary',    // Jefe de Taller
        3: 'badge-info',       // Supervisor
        4: 'badge-secondary',  // Técnico
        5: 'badge-light'       // Almacenista
      }

      if (typeof puestoId === 'number') {
        return roleClassMap[puestoId] || 'badge-light'
      }

      return 'badge-light'
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
      this.statusFilter = 'all'
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
      try {
        // Buscar el siguiente estado disponible que sea editable
        const currentEstado = this.getEstadoById(user.estado_id)
        if (!currentEstado) {
          this.showToast('Estado actual no encontrado', 'error')
          return
        }

        // Lógica simple: si está activo (ID 1), cambiar a inactivo (ID 2), y viceversa
        // Puedes personalizar esta lógica según tus necesidades
        let newEstadoId
        if (user.estado_id === 1) {
          newEstadoId = 2 // Cambiar a Inactivo
        } else {
          newEstadoId = 1 // Cambiar a Activo
        }

        // Verificar que el nuevo estado existe y es editable
        const newEstado = this.getEstadoById(newEstadoId)
        if (!newEstado || !newEstado.es_editable) {
          this.showToast('No se puede cambiar a este estado', 'error')
          return
        }

        const response = await axios.patch(`/api/Usuario/${user.id}/status`, {
          estado_id: newEstadoId
        })

        // Actualizar estado localmente
        const index = this.users.findIndex(u => u.id === user.id)
        if (index !== -1) {
          this.users[index].estado_id = newEstadoId
          this.users[index].status = newEstadoId
        }

        this.showToast(
          `Usuario cambiado a "${newEstado.nombre}" correctamente`,
          'success'
        )
      } catch (error) {
        console.error('Error al cambiar estado:', error)
        this.showToast('Error al cambiar estado del usuario', 'error')
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
          puesto_id: userData.puesto_id || 4, // Default a Técnico
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
        let isNewUser = !userData.id;

        if (!isNewUser) {
          // Actualizar usuario existente
          response = await axios.put(`/api/Usuario/${userData.id}`, payload);
        } else {
          // Crear nuevo usuario
          if (!payload.password) {
            this.showToast('La contraseña es requerida para nuevos usuarios', 'error');
            return;
          }
          response = await axios.post('/api/Usuario', payload);
        }

        // Verificar si la respuesta fue exitosa
        if (response.status >= 200 && response.status < 300) {
          const responseData = response.data.data || response.data;

          // Actualizar lista local
          if (isNewUser) {
            // Agregar nuevo usuario
            this.users.unshift({
              ...responseData,
              name: responseData.nombre,
              lastname: responseData.apellido,
              status: responseData.estado_id,
              type: this.getRolDescripcion(responseData.puesto_id || 4),
              fullName: `${responseData.nombre || ''} ${responseData.apellido || ''}`.trim()
            });
          } else {
            // Actualizar usuario existente
            const index = this.users.findIndex(u => u.id === userData.id);
            if (index !== -1) {
              this.users.splice(index, 1, {
                ...this.users[index],
                ...responseData,
                name: responseData.nombre,
                lastname: responseData.apellido,
                status: responseData.estado_id,
                type: this.getRolDescripcion(responseData.puesto_id || 4),
                fullName: `${responseData.nombre || ''} ${responseData.apellido || ''}`.trim()
              });
            }
          }

          this.showToast(response.data.message ||
            (isNewUser ? 'Usuario creado correctamente' : 'Usuario actualizado correctamente'),
            'success');

          this.closeUserModal();
          return; // Salir después de éxito
        }

        // Si llegamos aquí, la respuesta no fue exitosa
        throw new Error(response.data.message || 'Respuesta no exitosa del servidor');

      } catch (error) {
        console.error('❌ Error al guardar usuario - Error completo:', error);

        if (error.response) {
          console.error('❌ Response Status:', error.response.status);
          console.error('❌ Response Headers:', error.response.headers);
          console.error('❌ Response Data:', error.response.data);
        }

        if (error.request) {
          console.error('❌ Request que falló:', error.request);
        }

        console.error('❌ Error config:', error.config);

        let errorMsg = 'Error al procesar la solicitud';

        if (error.response) {
          if (error.response.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error.response.data?.error) {
            errorMsg = error.response.data.error;
          } else if (error.response.status === 409) {
            errorMsg = 'El email ya está registrado';
          }
        }

        this.showToast(errorMsg, 'error');
      }
    },

    statusClass(statusId) {
      const colorMap = {
        'green': 'badge-success',
        'gray': 'badge-secondary',
        'blue': 'badge-info',
        'yellow': 'badge-warning',
        'red': 'badge-danger'
      }

      const color = this.getEstadoColor(statusId)
      return colorMap[color] || 'badge-light'
    },

    formatStatus(statusId) {
      return this.getEstadoNombre(statusId)
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
    },

    exportToCSV() {
      try {
        if (this.$refs.vueGoodTable) {
          const fileName = `usuarios_${new Date().toISOString().split('T')[0]}.csv`
          this.$refs.vueGoodTable.exportCsv(fileName)
          this.showToast('Tabla exportada exitosamente', 'success')
        } else {
          this.showToast('Error al exportar: tabla no encontrada', 'error')
        }
      } catch (error) {
        console.error('Error exportando CSV:', error)
        this.showToast('Error al exportar tabla', 'error')
      }
    }
  },

  async mounted() {
    await this.loadRoles()
    await this.loadEstados()
    await this.loadUsers()
  }
}