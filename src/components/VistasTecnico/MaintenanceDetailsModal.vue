<template>
  <VaModal v-if="visible" :model-value="visible" title="Detalles del Mantenimiento" size="large"
    :close-button="true" hide-default-actions @close="closeModal">

    <!-- Información principal del mantenimiento -->
    <div v-if="maintenance" class="maintenance-details">
      <!-- Header con título y prioridad -->
      <VaCard class="mb-4">
        <VaCardTitle>
          <div class="maintenance-header">
            <VaIcon name="build" class="header-icon" />
            <div class="header-info">
              <h3 class="maintenance-title">{{ maintenance.nombre || maintenance.descripcion_problema ||
                getTipoMantenimientoNombre(maintenance.tipo_mantenimiento_id) }}</h3>
              <VaBadge :text="formatPriority(maintenance.prioridad_id) + ' prioridad'"
                :color="getPriorityColor(maintenance.prioridad_id)" class="priority-badge" />
            </div>
          </div>
        </VaCardTitle>
      </VaCard>

      <!-- Información de fechas -->
      <VaCard class="mb-4">
        <VaCardTitle>Fechas importantes</VaCardTitle>
        <VaCardContent>
          <div class="details-grid">
            <VaListItem>
              <VaListItemSection icon>
                <VaIcon name="event" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Fecha de Creación</VaListItemLabel>
                <VaListItemLabel caption>{{ formatDate(maintenance.fecha_creacion) }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>

            <VaListItem v-if="maintenance.fecha_programada">
              <VaListItemSection icon>
                <VaIcon name="schedule" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Fecha Programada</VaListItemLabel>
                <VaListItemLabel caption>{{ formatDate(maintenance.fecha_programada) }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>

            <VaListItem v-if="maintenance.fecha_inicio">
              <VaListItemSection icon>
                <VaIcon name="play_arrow" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Fecha de Inicio</VaListItemLabel>
                <VaListItemLabel caption>{{ formatDate(maintenance.fecha_inicio) }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>

            <VaListItem v-if="maintenance.fecha_fin">
              <VaListItemSection icon>
                <VaIcon name="stop" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Fecha de Finalización</VaListItemLabel>
                <VaListItemLabel caption>{{ formatDate(maintenance.fecha_fin) }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Información general -->
      <VaCard class="mb-4">
        <VaCardTitle class="pb-3">
          <VaIcon name="info_outline" class="mr-2" />
          Información General
        </VaCardTitle>
        <VaCardContent class="pt-0">
          <!-- Grid layout para mejor organización en pantallas grandes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Información del técnico -->
            <div v-if="maintenance.tecnico_asignado_id" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0 mt-1">
                <VaIcon name="person" size="20px" color="primary" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 mb-1">Técnico Asignado</p>
                <p class="text-sm text-gray-600">{{ maintenance.tecnico_asignado_id }}</p>
              </div>
            </div>

            <!-- Información de herramienta -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0 mt-1">
                <VaIcon name="build" size="20px" color="secondary" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 mb-1">Herramienta</p>
                <p class="text-sm text-gray-600">{{ getHerramientaNombre(maintenance.herramienta_id) }}</p>
              </div>
            </div>

            <!-- Tipo de mantenimiento -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0 mt-1">
                <VaIcon name="settings" size="20px" color="warning" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 mb-1">Tipo de Mantenimiento</p>
                <p class="text-sm text-gray-600">{{ getTipoMantenimientoNombre(maintenance.tipo_mantenimiento_id) }}</p>
              </div>
            </div>

            <!-- Estado -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="flex-shrink-0 mt-1">
                <VaIcon name="flag" size="20px" color="info" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 mb-1">Estado</p>
                <VaBadge :text="formatStatus(maintenance.estado_id)" :color="getStatusColor(maintenance.estado_id)"
                  class="text-xs" />
              </div>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Información de costos y tiempo (si existe) -->
      <VaCard class="mb-4" v-if="maintenance.costo_estimado || maintenance.costo_real || maintenance.horas_trabajo">
        <VaCardTitle>Costos y Tiempo</VaCardTitle>
        <VaCardContent>
          <VaList>
            <VaListItem v-if="maintenance.costo_estimado">
              <VaListItemSection icon>
                <VaIcon name="attach_money" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Costo Estimado</VaListItemLabel>
                <VaListItemLabel caption>${{ maintenance.costo_estimado }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>

            <VaListItem v-if="maintenance.costo_real">
              <VaListItemSection icon>
                <VaIcon name="money_off" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Costo Real</VaListItemLabel>
                <VaListItemLabel caption>${{ maintenance.costo_real }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>

            <VaListItem v-if="maintenance.horas_trabajo">
              <VaListItemSection icon>
                <VaIcon name="access_time" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Horas de Trabajo</VaListItemLabel>
                <VaListItemLabel caption>{{ maintenance.horas_trabajo }} horas</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
          </VaList>
        </VaCardContent>
      </VaCard>

      <!-- Acciones y repuestos -->
      <VaCard class="mb-4"
        v-if="maintenance.acciones_realizadas || (maintenance.repuestos_utilizados && maintenance.repuestos_utilizados.length > 0)">
        <VaCardTitle>Acciones y Repuestos</VaCardTitle>
        <VaCardContent>
          <VaList>
            <VaListItem v-if="maintenance.acciones_realizadas">
              <VaListItemSection icon>
                <VaIcon name="done_all" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Acciones Realizadas</VaListItemLabel>
                <VaListItemLabel caption>{{ maintenance.acciones_realizadas }}</VaListItemLabel>
              </VaListItemSection>
            </VaListItem>

            <VaListItem v-if="maintenance.repuestos_utilizados && maintenance.repuestos_utilizados.length > 0">
              <VaListItemSection icon>
                <VaIcon name="construction" />
              </VaListItemSection>
              <VaListItemSection>
                <VaListItemLabel>Repuestos Utilizados</VaListItemLabel>
                <VaListItemLabel caption>
                  <VaChip v-for="repuesto in maintenance.repuestos_utilizados" :key="repuesto" size="small"
                    class="ma-1">
                    {{ repuesto }}
                  </VaChip>
                </VaListItemLabel>
              </VaListItemSection>
            </VaListItem>
          </VaList>
        </VaCardContent>
      </VaCard>

      <!-- Información técnica adicional -->
      <VaCard v-if="showAdditionalDetails" class="mb-4">
        <VaCardTitle>Información Técnica</VaCardTitle>
        <VaCardContent>
          <VaCodeBlock :code="JSON.stringify(maintenance, null, 2)" language="json" copy-button max-height="300px" />
        </VaCardContent>
      </VaCard>

      <!-- Botón para mostrar/ocultar información adicional -->
      <div class="text-center mb-4">
        <VaButton preset="plain" :icon="showAdditionalDetails ? 'expand_less' : 'expand_more'"
          @click="showAdditionalDetails = !showAdditionalDetails">
          {{ showAdditionalDetails ? 'Ocultar' : 'Mostrar' }} información técnica
        </VaButton>
      </div>
    </div>

    <!-- Footer con botones de acción -->
    <template #footer>
      <div class="form-actions">
        <VaButton preset="secondary" @click="closeModal">
          Cerrar
        </VaButton>
        <VaButton @click="editMaintenance">
          Editar Mantenimiento
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>

<script src="./script/MaintenanceDetailsModal.js"></script>
<style scoped src="../../assets/MaintenanceDetailsModal.css"></style>
