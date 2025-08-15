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

    <!-- Tabla de usuarios/vue-good-table-next -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Cargando usuarios...</p>
        </div>

        <div v-else>
          <vue-good-table ref="vueGoodTable" :columns="tableColumns" max-height="50vh"
            :fixedHeader="!showAddUserModal && !showEditUserModal" :rows="users" :search-options="{
              enabled: true,
              placeholder: 'Buscar usuarios por nombre, email o ID...',
              externalQuery: searchQuery
            }" :pagination-options="{
              enabled: true,
              mode: 'records',
              perPage: 10,
              perPageDropdown: [5, 10, 20, 50],
              dropdownAllowAll: false,
              nextLabel: 'Siguiente',
              prevLabel: 'Anterior',
              rowsPerPageLabel: 'Filas por página',
              ofLabel: 'de',
              pageLabel: 'página',
              allLabel: 'Todos'
            }" :sort-options="{
              enabled: true,
              initialSortBy: { field: 'id', type: 'asc' }
            }" :select-options="{
              enabled: false
            }" styleClass="vgt-table striped bordered" theme="Rinoh">
            <!-- Slot personalizado para cada celda -->
            <template #table-row="props">
              <!-- Columna de Nombre completo -->
              <span v-if="props.column.field === 'fullName'">
                {{ props.row.nombre || props.row.name }} {{ props.row.apellido || props.row.lastname }}
              </span>

              <!-- Columna de Tipo de Usuario -->
              <span v-else-if="props.column.field === 'type'">
                <span :class="['badge', userTypeClass(props.row.puesto_id)]">
                  {{ getRolDescripcion(props.row.puesto_id) }}
                </span>
              </span>

              <!-- Columna de Estado -->
              <span v-else-if="props.column.field === 'status'">
                <span :class="['badge', statusClass(props.row.estado_id)]">
                  {{ getEstadoNombre(props.row.estado_id) }}
                </span>
              </span>

              <!-- Columna de Último Acceso -->
              <span v-else-if="props.column.field === 'last_login'">
                {{ formatDate(props.row.last_login || props.row.ultimo_acceso) }}
              </span>

              <!-- Columna de Acciones -->
              <span v-else-if="props.column.field === 'actions'">
                <div class="action-buttons">
                  <va-button size="small" preset="plain" color="info" @click="editUser(props.row)" icon="edit"
                    class="mr-1"></va-button>
                  <va-button size="small" preset="plain" color="warning" @click="toggleUserStatus(props.row)"
                    :icon="(props.row.status === 'active' || props.row.estado_id === 1) ? 'visibility_off' : 'visibility'"
                    class="mr-1"></va-button>
                  <va-button size="small" preset="plain" color="danger" @click="confirmDelete(props.row.id)"
                    icon="delete"></va-button>
                </div>
              </span>

              <!-- Contenido por defecto -->
              <span v-else>
                {{ props.formattedRow[props.column.field] }}
              </span>
            </template>

            <!-- Slot para acciones en la parte superior de la tabla -->
            <template #table-actions>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="table-info">
                  <span class="text-muted">Total: {{ users.length }} usuarios</span>
                </div>
                <div class="table-actions-buttons">
                  <va-button color="success" size="small" @click="exportToCSV" icon="download" class="mr-2">
                    Exportar CSV
                  </va-button>
                  <va-button color="primary" size="small" @click="loadUsers" icon="refresh">
                    Recargar
                  </va-button>
                </div>
              </div>
            </template>

            <!-- Mensaje cuando no hay datos -->
            <template #emptystate>
              <div class="text-center py-4">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No se encontraron usuarios</h5>
                <p class="text-muted">Intenta ajustar los filtros o crear un nuevo usuario</p>
                <va-button color="primary" @click="showAddUserModal = true" icon="add">
                  Crear Usuario
                </va-button>
              </div>
            </template>
          </vue-good-table>
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
