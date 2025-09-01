<template>
  <div class="reportar-problema-container">
    <!-- Encabezado -->
    <div class="header">
      <h2>Reportar Problema</h2>
      <p>Complete el formulario para generar una alerta de mantenimiento</p>
    </div>

    <!-- Estado de carga/error -->
    <div v-if="loading" class="status-message loading">Cargando datos...</div>
    <div v-if="error" class="status-message error">{{ error }}</div>
    <div v-if="submitSuccess" class="status-message success">
      ¡Alerta creada exitosamente!
      <va-button @click="resetForm" class="btn small"   >
        Crear otra alerta
      </va-button>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="submitForm" v-if="!submitSuccess && !loading" class="problema-form">
      <!-- Selector de herramienta -->
      <div class="form-group" :class="{ 'has-error': errors.herramienta_id }">
        <label>Herramienta:</label>
        <va-select
          v-model="formData.herramienta_id"
          :options="herramientaOptions"
          placeholder="Seleccione una herramienta"
          searchable
          clearable
          :rules="[value => !!value || 'Este campo es requerido']"
        />
        <span class="error-message" v-if="errors.herramienta_id">
          Este campo es requerido
        </span>
      </div>

      <!-- Resto del formulario -->
      <div class="form-group" :class="{ 'has-error': errors.tipo_alerta_id }">
        <label>Tipo de Alerta:</label>
        <va-select
          v-model="formData.tipo_alerta_id"
          :options="tipoAlertaOptions"
          placeholder="Seleccione un tipo"
          clearable
          :rules="[value => !!value || 'Este campo es requerido']"
        />
        <span class="error-message" v-if="errors.tipo_alerta_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.prioridad_id }">
        <label>Prioridad:</label>
        <va-select
          v-model="formData.prioridad_id"
          :options="prioridadOptions"
          placeholder="Seleccione prioridad"
          clearable
          :rules="[value => !!value || 'Este campo es requerido']"
        />
        <span class="error-message" v-if="errors.prioridad_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.fecha_limite }">
        <label>Fecha Límite:</label>
        <va-date-picker 
          v-model="formData.fecha_limite" 
          :min-date="minDate"
          :stateful="false"
          placeholder="Seleccione una fecha"
          format="DD/MM/YYYY"
          :parse-date="parseDate"
          :format-date="formatDate"
          clearable
        />
        <span class="error-message" v-if="errors.fecha_limite">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.descripcion }">
        <label>Descripción del Problema:</label>
        <va-textarea
          v-model="formData.descripcion"
          placeholder="Describa el problema con detalle..."
          :min-rows="4"
          :max-rows="8"
          autosize
          counter
          :rules="[value => !!value?.trim() || 'Este campo es requerido']"
        />
        <span class="error-message" v-if="errors.descripcion">
          Este campo es requerido
        </span>
      </div>

      <div class="form-actions">
        <va-button type="submit" class="btn primary" :disabled="submitting"   >
        {{ submitting ? 'Enviando...' : 'Reportar Problema' }}
      </va-button>
      </div>
    </form>
  </div>
</template>

<script src="./scripts/Reportes.js"></script>
<style src="./styles/Reportes.css" ></style>