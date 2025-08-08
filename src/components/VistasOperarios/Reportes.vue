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
      <button @click="resetForm" class="btn small">Crear otra alerta</button>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="submitForm" v-if="!submitSuccess && !loading" class="problema-form">
      <!-- Selector de herramienta -->
      <div class="form-group" :class="{ 'has-error': errors.herramienta_id }">
        <label>Herramienta:</label>
        <select v-model="formData.herramienta_id" required>
          <option value="">Seleccione una herramienta</option>
          <option v-for="herramienta in allHerramientas" :key="herramienta.id" :value="herramienta.id">
            {{ herramienta.nombre }} ({{ herramienta.codigo }})
          </option>
        </select>
        <span class="error-message" v-if="errors.herramienta_id">
          Este campo es requerido
        </span>
      </div>

      <!-- Resto del formulario -->
      <div class="form-group" :class="{ 'has-error': errors.tipo_alerta_id }">
        <label>Tipo de Alerta:</label>
        <select v-model="formData.tipo_alerta_id" required>
          <option value="">Seleccione un tipo</option>
          <option v-for="tipo in tiposAlerta" :key="tipo.id" :value="tipo.id">
            {{ tipo.nombre_alertas }}
          </option>
        </select>
        <span class="error-message" v-if="errors.tipo_alerta_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.prioridad_id }">
        <label>Prioridad:</label>
        <select v-model="formData.prioridad_id" required>
          <option value="">Seleccione prioridad</option>
          <option v-for="prioridad in prioridades" :key="prioridad.id" :value="prioridad.id">
            {{ prioridad.nombre_prioridad }}
          </option>
        </select>
        <span class="error-message" v-if="errors.prioridad_id">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.fecha_limite }">
        <label>Fecha Límite:</label>
        <input type="date" v-model="formData.fecha_limite" required :min="minDate" />
        <span class="error-message" v-if="errors.fecha_limite">
          Este campo es requerido
        </span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.descripcion }">
        <label>Descripción del Problema:</label>
        <textarea v-model="formData.descripcion" required placeholder="Describa el problema con detalle..."></textarea>
        <span class="error-message" v-if="errors.descripcion">
          Este campo es requerido
        </span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn primary" :disabled="submitting">
          {{ submitting ? 'Enviando...' : 'Reportar Problema' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script src="./scripts/Reportes.js"></script>
<style src="./styles/Reportes.css" scoped></style>