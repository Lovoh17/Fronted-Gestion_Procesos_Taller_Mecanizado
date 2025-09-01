<template>
  <div class="configuracion-view">
    <div class="container">
      <!-- Header  -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <div class="header-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <div class="header-text">
              <h1 class="header-title">Configuración del Sistema</h1>
              <p class="header-subtitle">Administra parámetros, accesos y permisos generales</p>
            </div>
          </div>
          <div class="header-actions">
            <!-- Acciones del header -->
          </div>
        </div>
      </div>

      <!-- Tabs principales -->
      <VaTabs v-model="activeTab" class="custom-tabs">
        <template #tabs>
          <VaTab v-for="tab in tabs" :key="tab.key" :name="tab.key">
            {{ tab.label }}
          </VaTab>
        </template>
      </VaTabs>

      <!-- Contenido de Tipos -->
      <div v-if="activeTab === 'tipos'" class="tipos-section">
        <VaTabs v-model="activeTipoTab" class="sub-tabs">
          <template #tabs>
            <VaTab v-for="subtab in tipoSubtabs" :key="subtab.key" :name="subtab.key">
              {{ subtab.label }}
            </VaTab>
          </template>
        </VaTabs>


        <!-- Tabla de configuración para tipos -->
        <ConfigTable :columns="currentConfig.columns" :data="currentConfig.data" :loading="loading"
          @create="(data) => handleGenericCRUD('create', activeTipoTab, data)"
          @update="(data) => handleGenericCRUD('update', activeTipoTab, data)"
          @delete="(id) => handleGenericCRUD('delete', activeTipoTab, id)" />
      </div>

      <!-- Contenido de Alertas -->
      <div v-if="activeTab === 'alertas'" class="alertas-section">
        <ConfigTable :columns="entityConfigs.alertas.columns" :data="entityConfigs.alertas.data" :loading="loading"
          @create="(data) => handleGenericCRUD('create', 'alertas', data)"
          @update="(data) => handleGenericCRUD('update', 'alertas', data)"
          @delete="(id) => handleGenericCRUD('delete', 'alertas', id)" />
      </div>

      <!-- Contenido de Métodos de Pago -->
      <div v-if="activeTab === 'metodos-pago'" class="metodos-pago-section">
        <ConfigTable :columns="entityConfigs['metodos-pago'].columns" :data="entityConfigs['metodos-pago'].data"
          :loading="loading" @create="(data) => handleGenericCRUD('create', 'metodos-pago', data)"
          @update="(data) => handleGenericCRUD('update', 'metodos-pago', data)"
          @delete="(id) => handleGenericCRUD('delete', 'metodos-pago', id)" />
      </div>
    </div>
  </div>
</template>

<script src="./scripts/Settings.js"></script>
<style src="/src/assets/EstiloBase.css"></style>
<style src="../assets/settings.css" ></style>

<style >
/* Espaciado para las secciones de contenido */
.tipos-section,
.alertas-section,
.metodos-pago-section {
  margin-top: 20px;
}

.sub-tabs {
  margin-bottom: 20px;
}

/* Si necesitas ocultar el slider por defecto y crear uno personalizado */
.custom-tabs {
  --va-tabs-slider-height: 2px;
}
</style>
