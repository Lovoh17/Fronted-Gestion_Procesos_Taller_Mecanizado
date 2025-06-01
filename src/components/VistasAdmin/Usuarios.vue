<template>
    <div class="admin-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-users-cog mr-2"></i>Administración de Usuarios
        </h1>
        <button class="btn btn-primary" @click="showAddUserModal = true">
          <i class="fas fa-plus mr-1"></i>Nuevo Usuario
        </button>
      </div>
  
      <!-- Filtros -->
      <div class="filters-panel">
        <div class="panel-header" @click="toggleFilters">
          <div class="panel-title">
            <i class="fas fa-filter"></i>
            <span>Filtros de Búsqueda</span>
          </div>
          <button class="panel-toggle">
            <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </button>
        </div>
  
        <div class="report-filters" v-if="showFilters">
          <div class="filter-row">
            <div class="filter-group">
              <label>Tipo de Usuario</label>
              <select v-model="userTypeFilter" class="form-control">
                <option value="all">Todos</option>
                <option value="coordinator">Coordinadores</option>
                <option value="employee">Empleados</option>
              </select>
            </div>
  
            <div class="filter-group">
              <label>Estado</label>
              <select v-model="statusFilter" class="form-control">
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
  
            <div class="filter-group">
              <label>Buscar</label>
              <div class="search-input">
                <input 
                  v-model="searchQuery" 
                  placeholder="Nombre, email o ID..."
                  @keyup.enter="applyFilters"
                >
                <button class="search-btn" @click="applyFilters">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
  
          <div class="filter-actions">
            <button class="btn btn-primary apply-btn" @click="applyFilters">
              Aplicar Filtros
            </button>
            <button class="btn btn-outline-secondary reset-btn" @click="resetFilters">
              Limpiar
            </button>
          </div>
        </div>
      </div>
  
      <!-- Tabla de usuarios -->
      <div class="card">
        <div class="card-body">
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
                  <td>
                    <div class="user-avatar">
                      <img src="https://th.bing.com/th/id/OIP.V2K4WFq9X-1OMbCkF9Dc9QAAAA?rs=1&pid=ImgDetMain" class="avatar-img">
                    </div>
                  </td>
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
                    <button 
                      class="btn btn-sm btn-icon" 
                      @click="toggleUserStatus(user)"
                      :title="user.status === 'active' ? 'Desactivar' : 'Activar'"
                    >
                      <i :class="user.status === 'active' ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Paginación -->
          <div class="pagination-container">
            <div class="showing-info">
              Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredUsers.length }} usuarios
            </div>
            <div class="pagination-controls">
              <button 
                class="btn btn-pagination" 
                @click="prevPage" 
                :disabled="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <button 
                v-for="page in pages" 
                :key="page" 
                class="btn btn-pagination"
                :class="{ active: page === currentPage }"
                @click="goToPage(page)"
                :disabled="page === '...'"
              >
                {{ page }}
              </button>
              
              <button 
                class="btn btn-pagination" 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal para agregar/editar usuario -->
      <UserModal 
        v-if="showAddUserModal" 
        :user="selectedUser"
        @close="closeUserModal"
        @save="saveUser"
      />
    </div>
  </template>
  
  <script>
  import UserModal from '@/components/VistasAdmin/ComponentesAdmin/UserModal.vue'
  
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
        selectedUser: null,
      }
    },
    
    computed: {
      filteredUsers() {
        return this.users.filter(user => {
          const matchesType = this.userTypeFilter === 'all' || 
                            (this.userTypeFilter === 'coordinator' && user.type === 'coordinator') ||
                            (this.userTypeFilter === 'employee' && user.type === 'employee')
          
          const matchesStatus = this.statusFilter === 'all' || 
                              user.status === this.statusFilter
          
          const matchesSearch = this.searchQuery === '' ||
                              user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              String(user.id).includes(this.searchQuery)
          
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
        try {
          // Datos de prueba mientras configuras la API real
          this.users = [
            {
              id: 1,
              name: '',
              email: 'example@example.com',
              type: '',
              status: '',
              last_login: new Date().toISOString(),
              avatar: null
            },
          ];
          
          console.log("Usuarios cargados:", this.users);
          
          // Cuando tengas la API real, usa:
          // const response = await this.$http.get('/api/users');
          // this.users = response.data;
        } catch (error) {
          console.error("Error cargando usuarios:", error);
          this.showToast('Error al cargar usuarios', 'error');
          this.users = []; // Asegura que sea array incluso con error
        }
      },
      
      applyFilters() {
        this.currentPage = 1;
        console.log("Filtros aplicados:", {
          search: this.searchQuery,
          type: this.userTypeFilter,
          status: this.statusFilter
        });
      },
      
      resetFilters() {
        this.searchQuery = '';
        this.userTypeFilter = 'all';
        this.statusFilter = 'active'; // Cambiado a 'active' por defecto
        this.currentPage = 1;
        console.log("Filtros reiniciados");
      },
      
      sortBy(field) {
        if (this.sortField === field) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField = field;
          this.sortDirection = 'asc';
        }
        console.log(`Ordenando por ${field} en orden ${this.sortDirection}`);
      },
      
      sortIcon(field) {
        if (this.sortField !== field) return 'fas fa-sort';
        return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
      },
      
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
          console.log("Página anterior:", this.currentPage);
        }
      },
      
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          console.log("Página siguiente:", this.currentPage);
        }
      },
      
      goToPage(page) {
        if (page !== '...') {
          this.currentPage = page;
          console.log("Ir a página:", page);
        }
      },
      
      toggleFilters() {
        this.showFilters = !this.showFilters;
        console.log("Mostrar filtros:", this.showFilters);
      },
      
      editUser(user) {
        console.log("Editando usuario:", user.id);
        this.selectedUser = { ...user };
        this.showAddUserModal = true;
      },
      
      async toggleUserStatus(user) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        console.log(`Cambiando estado de usuario ${user.id} a ${newStatus}`);
        
        try {
          // Simulación de API
          user.status = newStatus;
          this.showToast(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`, 'success');
          
          // En producción usarías:
          // await this.$http.patch(`/api/users/${user.id}/status`, { status: newStatus });
          // this.loadUsers(); // Recargar datos después de cambiar
        } catch (error) {
          console.error("Error cambiando estado:", error);
          this.showToast('Error al cambiar estado', 'error');
        }
      },
      
      closeUserModal() {
        console.log("Cerrando modal de usuario");
        this.showAddUserModal = false;
        this.selectedUser = null;
      },
      
      async saveUser(userData) {
        console.log("Guardando usuario:", userData);
        
        try {
          // Simulación de API
          if (userData.id) {
            // Actualizar usuario existente
            const index = this.users.findIndex(u => u.id === userData.id);
            if (index !== -1) {
              this.users[index] = { ...this.users[index], ...userData };
            }
            this.showToast('Usuario actualizado', 'success');
          } else {
            // Crear nuevo usuario
            const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
            this.users.unshift({
              id: newId,
              ...userData,
              status: 'active',
              last_login: null,
              avatar: null
            });
            this.showToast('Usuario creado', 'success');
          }
          
          this.closeUserModal();
          
          // En producción usarías:
          // if (userData.id) {
          //   await this.$http.put(`/api/users/${userData.id}`, userData);
          // } else {
          //   await this.$http.post('/api/users', userData);
          // }
          // this.loadUsers();
        } catch (error) {
          console.error("Error guardando usuario:", error);
          this.showToast('Error al guardar usuario', 'error');
        }
      },
      
      formatUserType(type) {
        const types = {
          'coordinator': 'Coordinador',
          'employee': 'Empleado'
        };
        return types[type] || type;
      },
      
      userTypeClass(type) {
        return {
          'coordinator': 'badge-primary',
          'employee': 'badge-secondary'
        }[type] || 'badge-light';
      },
      
      statusClass(status) {
        return {
          'active': 'badge-success',
          'inactive': 'badge-danger'
        }[status] || 'badge-light';
      },
      
      formatStatus(status) {
        return {
          'active': 'Activo',
          'inactive': 'Inactivo'
        }[status] || status;
      },
      
      formatDate(date) {
        if (!date) return 'Nunca';
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      
      showToast(message, type = 'success') {
        console.log(`Toast [${type}]: ${message}`);
        // Implementación básica si no tienes un sistema de toasts
        alert(`${type.toUpperCase()}: ${message}`);
        // O si usas un plugin de toasts:
        // this.$toast(message, { type });
      }
    },
    
    mounted() {
      console.log("Componente de usuarios montado");
      this.loadUsers();
      
      // Depuración adicional
      this.$nextTick(() => {
        console.log("Estado inicial:", {
          users: this.users,
          filteredUsers: this.filteredUsers,
          paginatedUsers: this.paginatedUsers
        });
      });
    }
  }
  </script>