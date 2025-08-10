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
          <va-button color="#003366" @click="showAddUserModal = true" icon="book">
            Nuevo Usuario
          </va-button>
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
        <va-button preset="plain" :icon="showFilters ? 'chevron-up' : 'chevron-down'">
        </va-button>
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
              <va-button class="absolute inset-y-0 right-0 flex items-center pr-3" preset="plain" @click="applyFilters"
                icon="search">
              </va-button>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
          <va-button color="primary" size="small" @click="applyFilters" icon="check" class="px-4 py-2">
            Aplicar Filtros
          </va-button>
          <va-button preset="outline" color="secondary" size="small" @click="resetFilters" icon="refresh"
            class="px-4 py-2">
            Limpiar
          </va-button>
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
                    <va-button size="small" preset="plain" color="info" @click="editUser(user)" icon="edit">
                    </va-button>
                    <va-button size="small" preset="plain" color="danger" @click="confirmDelete(user.id)" icon="delete">
                    </va-button>
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
              <va-button size="small" preset="outline" @click="prevPage" :disabled="currentPage === 1"
                icon="arrow_back">
              </va-button>

              <va-button v-for="page in pages" :key="page" size="small"
                :color="page === currentPage ? 'primary' : 'secondary'"
                :preset="page === currentPage ? 'filled' : 'outline'" @click="goToPage(page)"
                :disabled="page === '...'">
                {{ page }}
              </va-button>

              <va-button size="small" preset="outline" @click="nextPage" :disabled="currentPage === totalPages"
                icon="arrow_forward">
              </va-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <UserModal v-if="showAddUserModal" :user="selectedUser" @close="closeUserModal" @save="saveUser" />

    <!-- Modal de confirmación para eliminar -->
    <VaModal v-model="showDeleteModal" title="Confirmar Eliminación"
      message="¿Estás seguro que deseas eliminar este usuario? Esta acción no se puede deshacer." ok-text="Eliminar"
      cancel-text="Cancelar" icon="warning" blur @ok="deleteUser" @cancel="showDeleteModal = false" />

  </div>
</template>
<script src="./ComponentesAdmin/Script/Usuarios.js"></script>
<style src="src/assets/EstiloBase.css" scoped></style>