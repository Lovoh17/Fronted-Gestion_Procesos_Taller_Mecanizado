<template>
  <div class="configuracion-view">
    <div class="container">
      <h1>Configuración del Sistema</h1>
      
      <!-- Tabs principales -->
      <div class="main-tabs">
        <va-button v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
           >
        {{ tab.label }}
      </va-button>
      </div>

      <!-- Contenido de Tipos -->
      <div v-if="activeTab === 'tipos'" class="tipos-section">
        <!-- Sub-tabs para tipos -->
        <div class="sub-tabs">
          <va-button v-for="subtab in tipoSubtabs" 
            :key="subtab.key"
            @click="activeTipoTab = subtab.key"
            :class="['subtab-button', { active: activeTipoTab === subtab.key }]"
             >
        {{ subtab.label }}
      </va-button>
        </div>

        <!-- Tabla de configuración para tipos -->
        <ConfigTable
          :columns="currentConfig.columns"
          :data="currentConfig.data"
          :loading="loading"
          @create="(data) => handleGenericCRUD('create', activeTipoTab, data)"
          @update="(data) => handleGenericCRUD('update', activeTipoTab, data)"
          @delete="(id) => handleGenericCRUD('delete', activeTipoTab, id)"
        />
      </div>

      <!-- Contenido de Alertas -->
      <div v-if="activeTab === 'alertas'" class="alertas-section">
        <ConfigTable
          :columns="entityConfigs.alertas.columns"
          :data="entityConfigs.alertas.data"
          :loading="loading"
          @create="(data) => handleGenericCRUD('create', 'alertas', data)"
          @update="(data) => handleGenericCRUD('update', 'alertas', data)"
          @delete="(id) => handleGenericCRUD('delete', 'alertas', id)"
        />
      </div>

      <!-- Contenido de Métodos de Pago -->
      <div v-if="activeTab === 'metodos-pago'" class="metodos-pago-section">
        <ConfigTable
          :columns="entityConfigs['metodos-pago'].columns"
          :data="entityConfigs['metodos-pago'].data"
          :loading="loading"
          @create="(data) => handleGenericCRUD('create', 'metodos-pago', data)"
          @update="(data) => handleGenericCRUD('update', 'metodos-pago', data)"
          @delete="(id) => handleGenericCRUD('delete', 'metodos-pago', id)"
        />
      </div>
    </div>
  </div>
</template>

<script src="./scripts/Settings.js"></script>

<style src="../assets/settings.css" scoped></style>
