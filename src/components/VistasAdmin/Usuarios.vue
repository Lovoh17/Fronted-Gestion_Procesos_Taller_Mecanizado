<template>
  <div class="admin-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-users-cog"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Administración de Usuarios</h1>
            <p class="header-subtitle">Gestiona los accesos y permisos del sistema</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-modern btn-primary" @click="showAddUserModal = true">
            <i class="fas fa-plus"></i>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <!-- Header del panel -->
      <div class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50" @click="toggleFilters">
        <div class="flex items-center text-gray-700 font-medium">
          <i class="fas fa-filter mr-2 text-gray-500"></i>
          <span>Filtros de Búsqueda</span>
        </div>
        <button class="text-gray-500 hover:text-gray-700">
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </button>
      </div>

      <!-- Contenido de filtros -->
      <div v-if="showFilters" class="border-t border-gray-200 p-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Filtro Tipo de Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario</label>
            <select v-model="userTypeFilter"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Todos</option>
              <option value="coordinator">Coordinadores</option>
              <option value="employee">Empleados</option>
            </select>
          </div>

          <!-- Filtro Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select v-model="statusFilter"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <!-- Filtro Búsqueda -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div class="relative">
              <input v-model="searchQuery" placeholder="Nombre, email o ID..."
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                @keyup.enter="applyFilters">
              <button class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
                @click="applyFilters">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end space-x-2 mt-3">
          <button
            class="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            @click="applyFilters">
            Aplicar Filtros
          </button>
          <button
            class="px-3 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            @click="resetFilters">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando usuarios...</p>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="sortBy('id')">
                    ID <i :class="sortIcon('id')"></i>
                  </th>
                  <th @click="sortBy('name')">
                    Nombre <i :class="sortIcon('name')"></i>
                  </th>
                  <th>Email</th>
                  <th @click="sortBy('type')">
                    Tipo <i :class="sortIcon('type')"></i>
                  </th>
                  <th @click="sortBy('status')">
                    Estado <i :class="sortIcon('status')"></i>
                  </th>
                  <th>Último Acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['badge', userTypeClass(user.type)]">
                      {{ formatUserType(user.type) }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', statusClass(user.status)]">
                      {{ formatStatus(user.status) }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.last_login) }}</td>
                  <td>
                    <button class="btn btn-sm btn-icon" @click="editUser(user)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-icon btn-danger" @click="confirmDelete(user.id)" title="Eliminar">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mensaje cuando no hay usuarios -->
          <div v-if="filteredUsers.length === 0" class="text-center py-4">
            <p>No se encontraron usuarios</p>
          </div>

          <!-- Paginación -->
          <div class="pagination-container" v-if="filteredUsers.length > 0">
            <div class="showing-info">
              Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredUsers.length }} usuarios
            </div>
            <div class="pagination-controls">
              <button class="btn btn-pagination" @click="prevPage" :disabled="currentPage === 1">
                <i class="fas fa-chevron-left"></i>
              </button>

              <button v-for="page in pages" :key="page" class="btn btn-pagination"
                :class="{ active: page === currentPage }" @click="goToPage(page)" :disabled="page === '...'">
                {{ page }}
              </button>

              <button class="btn btn-pagination" @click="nextPage" :disabled="currentPage === totalPages">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <UserModal v-if="showAddUserModal" :user="selectedUser" @close="closeUserModal" @save="saveUser" />

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Confirmar Eliminación</h5>
          <button @click="showDeleteModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro que deseas eliminar este usuario?</p>
          <p>Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="deleteUser" class="btn btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
</script>

<style scoped>
.admin-container {
  padding: 10px;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: #003366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #003366, #003366);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 1.1rem;
  font-weight: 500;
}
/* Botones */
.btn-modern {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1.8rem;
  border: none;
  border-radius: 0.8rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn-modern i {
  font-size: 1.1rem;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.6s ease;
}

.btn-modern:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #003366, #003366);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #edf2f7;
  color: #4a5568;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #e2e8f0;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-large {
  padding: 1.2rem 2.4rem;
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .header-info {
    flex-direction: column;
    gap: 1rem;
  }

  .header-text {
    align-items: center;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-modern {
    width: 100%;
    justify-content: center;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
}

.filters-panel {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background-color: #f5f7fa;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
}

.panel-title {
  display: flex;
  align-items: center;
  color: #444;
  font-weight: 500;
}

.panel-title i {
  margin-right: 8px;
}

.report-filters {
  padding: 18px;
  border-top: 1px solid #eaeaea;
  background-color: #fff;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

.search-input {
  display: flex;
}

.search-input input {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #ddd;
}

.search-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.table th:hover {
  background-color: #f1f5f9;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #edf2f7;
  color: #4a5568;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background-color: #f8fafc;
}

.btn-icon {
  padding: 5px 8px;
  margin: 0 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.badge {
  padding: 5px 10px;
  font-size: 0.8rem;
  border-radius: 12px;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
}

.pagination-controls {
  display: flex;
  gap: 5px;
}

.btn-pagination {
  min-width: 36px;
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}
</style>