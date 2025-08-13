<template>
  <VaModal v-model="showModal" size="large" font-size="1.2rem" @close="close" hide-default-actions>
    <!-- Progress Bar -->
    <div class="wizard-header">
      <VaCardTitle class="va-card-title">
        Nuevo Pedido - Formulario de Creación
      </VaCardTitle>

      <!-- SOLUCIÓN 1: Progress Bar con key para forzar re-render -->
      <VaProgressBar :key="`progress-${currentStep}`" :value="progressPercentage" color="primary"
        class="wizard-progress" :model-value="progressPercentage" />
      <div class="step-indicator">
        <span class="step-text">Paso {{ currentStep }} de {{ totalSteps }}</span>
        <span class="step-title">{{ currentStepTitle }}</span>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <!-- Paso 1: Información Básica del Pedido -->
      <div v-if="currentStep === 1" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="assignment" class="step-icon" />
            Información Básica del Pedido
          </VaCardTitle>
          <VaCardContent>
            <div class="form-grid">
              <VaSelect v-model="formData.tipo_pedido_id" label="Tipo de Pedido *" placeholder="Seleccione el tipo"
                :options="tiposPedidoOptions" text-by="nombre" value-by="id" class="form-field" />

              <VaInput v-model="formData.codigo_pedido" label="Código del Pedido *" placeholder="AUTO-GENERADO"
                :disabled="codigoAutoGenerado" class="form-field" />
            </div>

            <div class="form-grid">
              <VaDateInput v-model="formData.fecha_requerida" label="Fecha Requerida *"
                placeholder="Seleccione la fecha" class="form-field" />

              <VaSelect v-model="formData.prioridad" label="Prioridad *" placeholder="Seleccione prioridad"
                :options="prioridadOptions" class="form-field" />
            </div>

            <VaInput v-model="formData.proyecto_asociado" label="Proyecto Asociado"
              placeholder="Nombre del proyecto (opcional)" class="form-field full-width" />

            <VaTextarea v-model="formData.notas" label="Descripción/Notas Iniciales"
              placeholder="Descripción general del pedido..." :min-rows="3" class="form-field full-width" />
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Paso 2: Selección de Plano y Especificaciones -->
      <div v-if="currentStep === 2" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="engineering" class="step-icon" />
            Selección de Plano y Especificaciones
          </VaCardTitle>
          <VaCardContent>
            <div class="form-grid">
              <VaSelect v-model="formData.plano_id" label="Plano a Utilizar *" placeholder="Seleccione el plano"
                :options="planosOptions" text-by="nombre" value-by="id" class="form-field"
                @update:model-value="onPlanoSelected" />

              <VaSelect v-model="formData.version_plano" label="Versión del Plano" placeholder="Última versión"
                :options="versionesPlanoOptions" :disabled="!formData.plano_id" class="form-field" />
            </div>

            <VaTextarea v-model="formData.especificaciones_adicionales" label="Especificaciones Adicionales"
              placeholder="Especificaciones o modificaciones al plano..." :min-rows="3" class="form-field full-width" />

            <!-- Vista previa del plano -->
            <div v-if="selectedPlano" class="plano-preview">
              <VaCard class="preview-card">
                <VaCardTitle>Vista Previa del Plano</VaCardTitle>
                <VaCardContent>
                  <div class="plano-info">
                    <p><strong>Nombre:</strong> {{ selectedPlano.nombre }}</p>
                    <p><strong>Código:</strong> {{ selectedPlano.codigo }}</p>
                    <p><strong>Estado:</strong>
                      <VaBadge :color="selectedPlano.estado === 'aprobado' ? 'success' : 'warning'">
                        {{ selectedPlano.estado }}
                      </VaBadge>
                    </p>
                    <p><strong>Estimación de Costos:</strong> ${{ selectedPlano.costo_estimado }}</p>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Paso 3: Asignación de Personal -->
      <div v-if="currentStep === 3" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="group" class="step-icon" />
            Asignación de Personal
          </VaCardTitle>
          <VaCardContent>
            <VaSelect v-model="formData.supervisor_id" label="Supervisor/Encargado *"
              placeholder="Seleccione el supervisor" :options="supervisoresOptions" text-by="nombre" value-by="id"
              class="form-field full-width" />

            <!-- Técnicos Asignados -->
            <div class="tecnicos-section">
              <h4 class="section-subtitle">Técnicos Asignados</h4>

              <div v-for="(asignacion, index) in formData.tecnicos_asignados" :key="index" class="tecnico-row">
                <div class="form-grid">
                  <VaSelect v-model="asignacion.tecnico_id" label="Técnico" placeholder="Seleccione técnico"
                    :options="tecnicosOptions" text-by="nombre" value-by="id" class="form-field" />

                  <VaInput v-model="asignacion.horas_asignadas" label="Horas Asignadas" type="number"
                    placeholder="Horas" class="form-field" />
                </div>

                <VaButton v-if="formData.tecnicos_asignados.length > 1" preset="plain" icon="delete" color="danger"
                  @click="removeTecnico(index)" class="remove-btn" />
              </div>

              <VaButton preset="secondary" icon="add" @click="addTecnico" class="add-tecnico-btn">
                Agregar Técnico
              </VaButton>
            </div>

            <!-- Resumen de Competencias -->
            <VaCard v-if="formData.tecnicos_asignados.length > 0" class="competencias-card">
              <VaCardTitle>Resumen del Equipo</VaCardTitle>
              <VaCardContent>
                <div class="team-summary">
                  <p><strong>Total de Técnicos:</strong> {{ formData.tecnicos_asignados.length }}</p>
                  <p><strong>Total de Horas:</strong> {{ totalHorasAsignadas }}</p>
                </div>
              </VaCardContent>
            </VaCard>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Paso 4: Selección y Reserva de Herramientas -->
      <div v-if="currentStep === 4" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="build" class="step-icon" />
            Selección y Reserva de Herramientas
          </VaCardTitle>
          <VaCardContent>
            <!-- Herramientas Sugeridas del Plano -->
            <div v-if="herramientasSugeridas.length > 0" class="herramientas-sugeridas">
              <h4 class="section-subtitle">Herramientas Sugeridas del Plano</h4>

              <div v-for="herramienta in herramientasSugeridas" :key="herramienta.id" class="herramienta-row">
                <VaCard class="herramienta-card">
                  <VaCardContent>
                    <div class="herramienta-info">
                      <div class="herramienta-header">
                        <h5>{{ herramienta.nombre }}</h5>
                        <VaBadge :color="getEstadoColor(herramienta.estado)">
                          {{ herramienta.estado }}
                        </VaBadge>
                      </div>

                      <div class="form-grid">
                        <VaInput v-model="herramienta.cantidad_solicitada" label="Cantidad Solicitada" type="number"
                          :placeholder="herramienta.cantidad_sugerida.toString()" class="form-field" />

                        <VaDateInput v-model="herramienta.fecha_devolucion" label="Fecha Est. Devolución"
                          class="form-field" />
                      </div>
                    </div>
                  </VaCardContent>
                </VaCard>
              </div>
            </div>

            <!-- Agregar Herramientas Adicionales -->
            <div class="herramientas-adicionales">
              <h4 class="section-subtitle">Herramientas Adicionales</h4>

              <div v-for="(herramienta, index) in formData.herramientas_adicionales" :key="index"
                class="herramienta-adicional-row">
                <div class="form-grid">
                  <VaSelect v-model="herramienta.herramienta_id" label="Herramienta"
                    placeholder="Seleccione herramienta" :options="todasHerramientasOptions" text-by="nombre"
                    value-by="id" class="form-field" />

                  <VaInput v-model="herramienta.cantidad_solicitada" label="Cantidad" type="number"
                    class="form-field" />

                  <VaDateInput v-model="herramienta.fecha_devolucion" label="Fecha Devolución" class="form-field" />
                </div>

                <VaButton preset="plain" icon="delete" color="danger" @click="removeHerramientaAdicional(index)"
                  class="remove-btn" />
              </div>

              <VaButton preset="secondary" icon="add" @click="addHerramientaAdicional">
                Agregar Herramienta Adicional
              </VaButton>
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Paso 5: Gestión de Materiales y Stock -->
      <div v-if="currentStep === 5" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="inventory" class="step-icon" />
            Gestión de Materiales y Stock
          </VaCardTitle>
          <VaCardContent>
            <!-- Materiales Sugeridos del Plano -->
            <div v-if="materialesSugeridos.length > 0" class="materiales-sugeridos">
              <h4 class="section-subtitle">Materiales Sugeridos del Plano</h4>

              <div v-for="material in materialesSugeridos" :key="material.id" class="material-row">
                <VaCard class="material-card">
                  <VaCardContent>
                    <div class="material-info">
                      <div class="material-header">
                        <h5>{{ material.nombre }}</h5>
                        <div class="stock-info">
                          <span class="stock-label">Stock Disponible:</span>
                          <VaBadge :color="material.stock_suficiente ? 'success' : 'danger'">
                            {{ material.stock_actual }} {{ material.unidad_medida }}
                          </VaBadge>
                        </div>
                      </div>

                      <div class="form-grid">
                        <VaInput v-model="material.cantidad_solicitada" label="Cantidad Solicitada" type="number"
                          :placeholder="material.cantidad_sugerida.toString()" class="form-field" />

                        <VaSelect v-model="material.unidad_medida_id" label="Unidad de Medida"
                          :options="unidadesMedidaOptions" text-by="nombre" value-by="id" class="form-field" />

                        <VaSelect v-model="material.tipo_stock_destino" label="Tipo de Stock Destino"
                          :options="tiposStockOptions" class="form-field" />

                        <VaInput v-model="material.desperdicio_estimado" label="Desperdicio Estimado (%)" type="number"
                          min="0" max="100" class="form-field" />
                      </div>

                      <div class="material-calculations">
                        <p><strong>Costo Unitario:</strong> ${{ material.costo_unitario }}</p>
                        <p><strong>Costo Total:</strong> ${{ calculateMaterialCost(material) }}</p>
                      </div>
                    </div>
                  </VaCardContent>
                </VaCard>
              </div>
            </div>

            <!-- Materiales Adicionales -->
            <div class="materiales-adicionales">
              <h4 class="section-subtitle">Materiales Adicionales</h4>

              <div v-for="(material, index) in formData.materiales_adicionales" :key="index"
                class="material-adicional-row">
                <div class="form-grid">
                  <VaSelect v-model="material.material_id" label="Material" placeholder="Seleccione material"
                    :options="todosMaterialesOptions" text-by="nombre" value-by="id" class="form-field" />

                  <VaInput v-model="material.cantidad_solicitada" label="Cantidad" type="number" class="form-field" />

                  <VaSelect v-model="material.unidad_medida_id" label="Unidad" :options="unidadesMedidaOptions"
                    text-by="nombre" value-by="id" class="form-field" />
                </div>

                <VaButton preset="plain" icon="delete" color="danger" @click="removeMaterialAdicional(index)"
                  class="remove-btn" />
              </div>

              <VaButton preset="secondary" icon="add" @click="addMaterialAdicional">
                Agregar Material Adicional
              </VaButton>
            </div>

            <!-- Alertas de Stock -->
            <VaAlert v-if="alertasStock.length > 0" color="warning" class="stock-alerts">
              <template #title>Alertas de Stock</template>
              <ul>
                <li v-for="alerta in alertasStock" :key="alerta.id">
                  {{ alerta.mensaje }}
                </li>
              </ul>
            </VaAlert>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Paso 6: Presupuesto y Costos -->
      <div v-if="currentStep === 6" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="attach_money" class="step-icon" />
            Presupuesto y Costos
          </VaCardTitle>
          <VaCardContent>
            <!-- Resumen de Costos -->
            <div class="costos-resumen">
              <VaCard class="costo-card">
                <VaCardTitle>Desglose de Costos</VaCardTitle>
                <VaCardContent>
                  <div class="costo-item">
                    <span>Costo de Materiales:</span>
                    <span class="costo-valor">${{ formData.costo_materiales }}</span>
                  </div>
                  <div class="costo-item">
                    <span>Costo de Herramientas:</span>
                    <span class="costo-valor">${{ formData.costo_herramientas }}</span>
                  </div>
                  <div class="costo-item">
                    <span>Costo de Mano de Obra:</span>
                    <span class="costo-valor">${{ formData.costo_mano_obra }}</span>
                  </div>
                  <hr>
                  <div class="costo-item total">
                    <span><strong>Costo Total Estimado:</strong></span>
                    <span class="costo-valor"><strong>${{ costoTotalEstimado }}</strong></span>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>

            <!-- Precio Final y Ajustes -->
            <div class="form-grid">
              <VaInput v-model="formData.precio_final" label="Precio Final *" type="number"
                placeholder="Precio para cliente externo" class="form-field" />

              <VaSelect v-model="formData.centro_costos" label="Centro de Costos/Departamento"
                placeholder="Seleccione centro" :options="centrosCostosOptions" class="form-field" />
            </div>

            <VaTextarea v-model="formData.justificacion_ajustes" label="Justificación de Ajustes"
              placeholder="Explique cualquier ajuste al presupuesto..." :min-rows="2" class="form-field full-width" />

            <!-- Validaciones de Presupuesto -->
            <VaAlert v-if="presupuestoExcedeLimite" color="warning" class="presupuesto-alert">
              <template #title>Atención: Presupuesto Excede Límites</template>
              Este presupuesto requiere aprobación especial. Se enviará automáticamente para revisión.
            </VaAlert>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Paso 7: Revisión Final y Confirmación -->
      <div v-if="currentStep === 7" class="step-content">
        <VaCard>
          <VaCardTitle class="step-card-title">
            <VaIcon name="check_circle" class="step-icon" />
            Revisión Final y Confirmación
          </VaCardTitle>
          <VaCardContent>
            <!-- Resumen Completo -->
            <div class="revision-completa">
              <!-- Información del Pedido -->
              <VaCard class="revision-section">
                <VaCardTitle>Información del Pedido</VaCardTitle>
                <VaCardContent>
                  <div class="revision-grid">
                    <div><strong>Código:</strong> {{ formData.codigo_pedido }}</div>
                    <div><strong>Tipo:</strong> {{ getTipoPedidoNombre() }}</div>
                    <div><strong>Fecha Requerida:</strong> {{ formatDate(formData.fecha_requerida) }}</div>
                    <div><strong>Prioridad:</strong> {{ getPrioridadTexto() }}</div>
                    <div><strong>Proyecto:</strong> {{ formData.proyecto_asociado || 'N/A' }}</div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Personal Asignado -->
              <VaCard class="revision-section">
                <VaCardTitle>Personal Asignado</VaCardTitle>
                <VaCardContent>
                  <p><strong>Supervisor:</strong> {{ getSupervisorNombre() }}</p>
                  <div class="tecnicos-resumen">
                    <p><strong>Técnicos ({{ formData.tecnicos_asignados.length }}):</strong></p>
                    <ul>
                      <li v-for="asignacion in formData.tecnicos_asignados" :key="asignacion.tecnico_id">
                        {{ getTecnicoNombre(asignacion.tecnico_id) }} - {{ asignacion.horas_asignadas }} horas
                      </li>
                    </ul>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Presupuesto Final -->
              <VaCard class="revision-section">
                <VaCardTitle>Presupuesto Final</VaCardTitle>
                <VaCardContent>
                  <div class="presupuesto-final">
                    <div class="presupuesto-item">
                      <span>Costo Total Estimado:</span>
                      <span>${{ costoTotalEstimado }}</span>
                    </div>
                    <div class="presupuesto-item">
                      <span>Precio Final:</span>
                      <span><strong>${{ formData.precio_final }}</strong></span>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Timeline del Proyecto -->
              <VaCard class="revision-section">
                <VaCardTitle>Timeline del Proyecto</VaCardTitle>
                <VaCardContent>
                  <div class="timeline-info">
                    <p><strong>Fecha de Inicio Estimada:</strong> {{ getFechaInicioEstimada() }}</p>
                    <p><strong>Duración Estimada:</strong> {{ getDuracionEstimada() }} días</p>
                    <p><strong>Fecha de Entrega:</strong> {{ formatDate(formData.fecha_requerida) }}</p>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>
          </VaCardContent>
        </VaCard>
      </div>
    </div>

    <!-- Wizard Navigation -->
    <template #footer>
      <div class="wizard-footer">
        <div class="navigation-buttons">
          <VaButton v-if="currentStep > 1" preset="secondary" icon="chevron_left" @click="previousStep">
            Anterior
          </VaButton>

          <VaButton preset="secondary" icon="save" @click="saveAsDraft">
            Guardar Borrador
          </VaButton>

          <VaButton preset="secondary" @click="close">
            Cancelar
          </VaButton>

          <VaButton v-if="currentStep < totalSteps" color="primary" icon-right="chevron_right" @click="nextStep">
            Siguiente
          </VaButton>

          <!-- Botones finales en el último paso -->
          <div v-if="currentStep === totalSteps" class="final-actions">
            <VaButton color="success" icon="send" @click="sendForApproval">
              Enviar para Aprobación
            </VaButton>

            <VaButton v-if="canCreateImmediately" color="primary" icon="check_circle" @click="createImmediately">
              Crear Inmediatamente
            </VaButton>
          </div>
        </div>
      </div>
    </template>
  </VaModal>
</template>

<script src="./scripts/NewWorkOrderWizardModal.js"></script>
<style src="@/assets/NewWorkOrderWizardModal.css" scoped></style>
