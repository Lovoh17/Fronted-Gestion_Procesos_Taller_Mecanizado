<template>
  <div class="departamentos-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-university"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Departamentos Universitarios</h1>
            <p class="header-subtitle">Gestiona los departamentos de tu institución</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" @click="showNuevoDepartamentoModal = true" icon="building">
            Nuevo Departamento
          </va-button>
        </div>
      </div>
    </div>

    <!-- Loading con mejor diseño -->
    <div v-if="loading" class="modern-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando departamentos...</p>
      </div>
    </div>

    <!-- Estado vacío mejorado -->
    <div class="empty-state" v-if="!loading && departamentos.length === 0">
      <div class="empty-icon">
        <i class="fas fa-university"></i>
      </div>
      <h3 class="empty-title">No hay departamentos registrados</h3>
      <p class="empty-description">Comienza creando tu primer departamento universitario</p>
      <button class="btn-modern btn-primary btn-large" @click="showNuevoDepartamentoModal = true">
        <i class="fas fa-plus"></i>
        <span>Crear Primer Departamento</span>
      </button>
    </div>

    <!-- Tarjetas de departamentos -->
    <div class="departments-grid" v-if="!loading && departamentos.length > 0">
      <transition-group name="fade-in" tag="div" class="grid-container">
        <div v-for="departamento in paginatedDepartamentos" :key="departamento.id" class="department-card">
          <div class="card-header">
            <div class="department-id">{{ departamento.id }}</div>
            <div class="card-actions">
              <button class="action-btn view-btn" @click="verDetalles(departamento)" title="Ver detalles">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn edit-btn" @click="editarDepartamento(departamento)" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete-btn" @click="eliminarDepartamento(departamento.id)"
                :disabled="loadingDelete === departamento.id" title="Eliminar">
                <i v-if="loadingDelete === departamento.id" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="card-body">
            <h3 class="department-name">{{ departamento.nombre }}</h3>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Paginación moderna -->
    <div class="modern-pagination" v-if="!loading && departamentos.length > 0 && totalPages > 1">
      <div class="pagination-info">
        <span class="info-text">
          Mostrando <strong>{{ showingFrom }}</strong> a <strong>{{ showingTo }}</strong> de <strong>{{
            filteredDepartamentos.length }}</strong> departamentos
        </span>
      </div>

      <div class="pagination-controls">
        <button class="page-btn prev-btn" @click="prevPage" :disabled="currentPage === 1" title="Página anterior">
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="page-numbers">
          <button v-for="page in pages" :key="page" class="page-btn number-btn"
            :class="{ active: page === currentPage, disabled: page === '...' }" @click="goToPage(page)"
            :disabled="page === '...'">
            {{ page }}
          </button>
        </div>

        <button class="page-btn next-btn" @click="nextPage" :disabled="currentPage === totalPages"
          title="Página siguiente">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modales-->
    <DepartamentoModal v-if="showDepartamentoModal" :departamento="selectedDepartamento" @close="closeDepartamentoModal"
      @save="saveDepartamento" />

    <NuevoDepartamentoModal v-if="showNuevoDepartamentoModal" @close="showNuevoDepartamentoModal = false"
      @save="addDepartamento" />
  </div>
</template>

<script src="./ComponentesAdmin/Script/Departamentos.js"></script>
<style src="src/assets/EstiloBase.css" ></style>
<style src="/src/assets/EstiloBase.css" ></style>