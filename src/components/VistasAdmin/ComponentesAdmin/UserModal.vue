<template>
  <VaModal :model-value="true" :title="isEditing ? 'Editar Empleado' : 'Nuevo Empleado'" size="large"
    :close-button="false" :no-outside-dismiss="loading" hide-default-actions @close="closeModal">

    <form @submit.prevent="submitForm">
      <div class="user-form">
        <!-- Información Personal -->
        <VaCardTitle>Información Personal</VaCardTitle>
        <VaCardContent>
          <div class="form-row">
            <VaInput v-model="form.nombre" label="Nombre *" placeholder="Ingresa el nombre" :error="!!errors.nombre"
              :error-messages="errors.nombre" class="form-field" required />
            <VaInput v-model="form.apellido" label="Apellido *" placeholder="Ingresa el apellido"
              :error="!!errors.apellido" :error-messages="errors.apellido" class="form-field" requirAed />
          </div>

          <div class="form-row">
            <VaInput v-model="form.email" type="email" label="Email *" placeholder="usuario@ejemplo.com"
              :error="!!errors.email" :error-messages="errors.email" class="form-field" required />
            <VaInput v-model="form.telefono" type="tel" label="Teléfono" placeholder="0000-0000"
              :error="!!errors.telefono" :error-messages="errors.telefono" class="form-field" />
          </div>

          <!-- Puesto y Turno con VaSelect -->
          <div class="form-row">
            <VaSelect v-model="form.puesto_id" label="Puesto *" :options="puestoOptions" placeholder="Coordinador"
              :error="!!errors.puesto_id" :error-messages="errors.puesto_id" class="form-field" required />
            <VaSelect v-model="form.turno_id" label="Turno" :options="turnoOptions" placeholder="Matutino"
              class="form-field" clearable />
          </div>

          <!-- Sección de contraseña -->
          <div class="form-row">
            <VaInput v-model="form.password" :type="showPassword ? 'text' : 'password'"
              :label="isEditing ? 'Nueva Contraseña' : 'Contraseña *'"
              :placeholder="isEditing ? 'Nueva contraseña' : 'Mínimo 6 caracteres'" :error="!!errors.password"
              :error-messages="errors.password" :required="!isEditing" class="form-field">
              <template #appendInner>
                <VaButton preset="plain" icon size="small" @click="showPassword = !showPassword">
                  <VaIcon :name="showPassword ? 'visibility_off' : 'visibility'" />
                </VaButton>
              </template>
              <template #messages v-if="isEditing">
                <small class="text-muted">(Dejar en blanco para no cambiar)</small>
              </template>
            </VaInput>

            <VaInput v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'"
              :label="isEditing ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'"
              :placeholder="isEditing ? 'Confirmar nueva contraseña' : 'Confirma la contraseña'"
              :error="!!errors.confirmPassword" :error-messages="errors.confirmPassword"
              :required="!isEditing || form.password.length > 0" class="form-field" />
          </div>

          <!-- Habilidades Técnicas -->
          <VaTextarea v-model="form.habilidades_tecnicas" label="Habilidades Técnicas"
            placeholder="Describa las habilidades técnicas" :min-rows="3" class="mb-4" />

          <!-- Dirección -->
          <VaTextarea v-model="form.direccion" label="Dirección" placeholder="Dirección completa" :min-rows="3"
            class="mb-4" />

          <!-- Checkboxes con VaCheckbox -->
          <div class="form-row">
            <VaCheckbox v-model="form.estado" label="Usuario activo" class="form-field" />
            <VaCheckbox v-model="form.es_subcontratado" label="Es subcontratado" class="form-field" />
          </div>
        </VaCardContent>
      </div>
    </form>

    <template #footer>
      <div class="form-actions">
        <VaButton preset="secondary" @click="closeModal" :disabled="loading">
          Cancelar
        </VaButton>
        <VaButton @click="submitForm" :disabled="loading || !isFormValid" :loading="loading">
          {{ isEditing ? 'Actualizar' : 'Crear' }} Empleado
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script src="./Script/UserModal.js"></script>

<style >
.user-form {
  max-width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.text-muted {
  color: var(--va-text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>