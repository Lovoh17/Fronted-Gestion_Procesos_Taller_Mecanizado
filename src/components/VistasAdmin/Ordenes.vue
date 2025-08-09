<template>
  <div class="produccion-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Gestión de Producción</h1>
            <p class="header-subtitle">Administra y controla los procesos productivos</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" @click="showNuevoTrabajoModal = true" icon="add">
            Nuevo Pedido
          </va-button>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border" role="status">
        <span class="sr-only">Cargando...</span>
      </div>
    </div>

    <div class="tabs-container mb-4" v-if="!loading">
      <ul class="flex border-b border-gray-200">
        <li class="mr-1">
          <a @click="activeTab = 'produccion'" :class="{
            'bg-white border-l border-t border-r border-gray-200 text-blue-600': activeTab === 'produccion',
            'text-gray-500 hover:text-gray-700': activeTab !== 'produccion'
          }" class="inline-block py-2 px-4 font-semibold text-sm flex items-center">
            <i class="fas fa-clock mr-2"></i>
            En Producción
          </a>
        </li>
        <li class="mr-1">
          <a @click="activeTab = 'historial'" :class="{
            'bg-white border-l border-t border-r border-gray-200 text-blue-600': activeTab === 'historial',
            'text-gray-500 hover:text-gray-700': activeTab !== 'historial'
          }" class="inline-block py-2 px-4 font-semibold text-sm flex items-center">
            <i class="fas fa-history mr-2"></i>
            Historial
          </a>
        </li>
      </ul>
    </div>

    <!-- Filtros compactos -->
    <div class="bg-white rounded-lg shadow-sm mb-4" v-if="!loading">
      <!-- Encabezado del panel -->
      <div class="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        @click="toggleFilters">
        <div class="flex items-center text-gray-700 font-medium">
          <i class="fas fa-filter mr-2 text-gray-500"></i>
          <span>Filtros de Búsqueda</span>
          <div v-if="hasActiveFilters"
            class="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
            {{ activeFiltersCount }}
          </div>
        </div>
        <button class="text-gray-500 hover:text-gray-700">
          <i :class="showFilters ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </button>
      </div>

      <!-- Contenido de filtros con grid responsivo en una sola fila -->
      <div v-if="showFilters" class="p-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-3">
          <!-- Filtro Estado -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-tasks mr-1 text-gray-500"></i>
              Estado
            </label>
            <select v-model="estadoFilter"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="entregado">Entregado</option>
            </select>
          </div>

          <!-- Filtro Técnico -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-user-cog mr-1 text-gray-500"></i>
              Técnico
            </label>
            <select v-model="tecnicoFilter"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="todos">Todos</option>
              <option v-for="tecnico in tecnicos" :key="tecnico.id" :value="tecnico.id">
                {{ tecnico.nombre }}
              </option>
            </select>
          </div>

          <!-- Filtro Fecha - ocupa 2 columnas en XL para acomodar ambos inputs -->
          <div class="xl:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-calendar-alt mr-1 text-gray-500"></i>
              Período
            </label>
            <div class="flex items-center space-x-2">
              <input type="date" v-model="fechaInicio"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <span class="text-gray-500 text-sm">hasta</span>
              <input type="date" v-model="fechaFin"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>

          <!-- Filtro Búsqueda -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-search mr-1 text-gray-500"></i>
              Buscar
            </label>
            <div class="relative">
              <input v-model="searchQuery" placeholder="Código, solicitante..."
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
        <div class="flex justify-end items-center space-x-2 pt-2 border-t border-gray-100">
          <va-button color="primary" size="small" @click="applyFilters" icon="check" class="text-xs px-3 py-1">
            Aplicar Filtros
          </va-button>
          <va-button preset="outline" color="secondary" size="small" @click="resetFilters" icon="refresh"
            class="text-xs px-3 py-1">
            Limpiar
          </va-button>
        </div>
      </div>
    </div>

    <!-- Contenido de pestañas -->
    <div class="tab-content" v-if="!loading">
      <!-- Pestaña Producción -->
      <div v-if="activeTab === 'produccion'" class="tab-pane active">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Solicitante</th>
                    <th>Proyecto</th>
                    <th>Tipo</th>
                    <th>Supervisor</th>
                    <th>Solicitud</th>
                    <th>Entrega Estimada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in trabajosProduccion" :key="pedido.id">
                    <td>{{ pedido.codigo_pedido }}</td>
                    <td>{{ pedido.solicitante_nombre }}</td>
                    <td>{{ pedido.proyecto_asociado || 'N/A' }}</td>
                    <td>{{ pedido.tipo_pedido_nombre }}</td>
                    <td>{{ pedido.supervisor_nombre }}</td>
                    <td>{{ formatDate(pedido.fecha_solicitud) }}</td>
                    <td>{{ formatDate(pedido.fecha_estimada_entrega) || 'Pendiente' }}</td>
                    <td>
                      <span :class="['badge', estadoClass(pedido.estado)]">
                        {{ formatEstado(pedido.estado) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-icon" @click="verDetalles(pedido)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-icon" @click="editarTrabajo(pedido)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-icon btn-danger" @click="eliminarTrabajo(pedido.id)"
                        :disabled="loadingDelete === pedido.id">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestaña Historial -->
      <div v-if="activeTab === 'historial'" class="tab-pane active">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Solicitante</th>
                    <th>Proyecto</th>
                    <th>Tipo</th>
                    <th>Supervisor</th>
                    <th>Solicitud</th>
                    <th>Completado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in trabajosHistorial" :key="pedido.id">
                    <td>{{ pedido.codigo_pedido }}</td>
                    <td>{{ pedido.solicitante_nombre }}</td>
                    <td>{{ pedido.proyecto_asociado || 'N/A' }}</td>
                    <td>{{ pedido.tipo_pedido_nombre }}</td>
                    <td>{{ pedido.supervisor_nombre }}</td>
                    <td>{{ formatDate(pedido.fecha_solicitud) }}</td>
                    <td>{{ formatDate(pedido.fecha_completado) }}</td>
                    <td>
                      <span :class="['badge', estadoClass(pedido.estado)]">
                        {{ formatEstado(pedido.estado) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-icon" @click="verDetalles(pedido)">
                        <i class="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginación -->
            <div class="pagination-container">
              <div class="showing-info">
                Mostrando {{ showingFrom }} a {{ showingTo }} de {{ filteredHistorial.length }} pedidos
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
    </div>

    <!-- Modal Detalles Pedido -->
    <TrabajoModal v-if="showTrabajoModal" :trabajo="selectedTrabajo" @close="closeTrabajoModal" @save="saveTrabajo" />

    <!-- Modal Nuevo Pedido -->
    <NuevoTrabajoModal v-if="showNuevoTrabajoModal" @close="showNuevoTrabajoModal = false" @save="addTrabajo" />
  </div>
</template>

<script src="./ComponentesAdmin/Script/Ordenes.js"></script>
<style src="src/assets/EstiloBase.css"></style>
