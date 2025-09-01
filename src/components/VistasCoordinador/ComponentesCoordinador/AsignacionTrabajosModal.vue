<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container" ref="modalContainer">
      <div class="modal-header">
        <div class="modal-title-section">
          <span class="material-icons modal-icon">assignment</span>
          <h2>Asignar Pedidos</h2>
        </div>
        <button class="modal-close" @click="$emit('close')" title="Cerrar">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="modal-content">
        <!-- Sección de selección de pedidos -->
        <div class="form-section">
          <div class="form-group">
            <div class="form-label-group">
              <label>Seleccionar Pedidos</label>
              <span class="form-helper">{{ pedidosSeleccionados.length }} pedido(s) seleccionado(s)</span>
            </div>
            
            <div class="pedidos-selection">
              <div class="selection-actions">
                <button 
                  type="button" 
                  class="link-btn" 
                  @click="seleccionarTodosPedidos"
                  :disabled="pedidos.length === 0"
                >
                  Seleccionar todos
                </button>
                <button 
                  type="button" 
                  class="link-btn" 
                  @click="limpiarSeleccionPedidos"
                  :disabled="pedidosSeleccionados.length === 0"
                >
                  Limpiar selección
                </button>
              </div>
              
              <div class="pedidos-list-checkbox" v-if="pedidos.length > 0">
                <div 
                  v-for="pedido in pedidos" 
                  :key="pedido.id" 
                  class="checkbox-item"
                  :class="{ 'selected': pedidosSeleccionados.includes(pedido.id) }"
                >
                  <input 
                    type="checkbox" 
                    :id="'pedido-'+pedido.id" 
                    :value="pedido.id" 
                    v-model="pedidosSeleccionados"
                  >
                  <label :for="'pedido-'+pedido.id" class="pedido-label">
                    <div class="pedido-info">
                      <div class="pedido-header">
                        <strong class="pedido-codigo">{{ pedido.codigo_pedido }}</strong>
                        <span class="pedido-estado" :class="getStatusClass(pedido.estado_id)">
                          {{ getStatusName(pedido.estado_id) }}
                        </span>
                      </div>
                      <div class="pedido-descripcion">{{ pedido.descripcion || 'Sin descripción' }}</div>
                      <div class="pedido-meta">
                        <span class="pedido-fecha">{{ formatDate(pedido.fecha_requerida) }}</span>
                        <span class="pedido-prioridad" :class="`priority-${pedido.prioridad}`">
                          {{ getPriorityName(pedido.prioridad) }}
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div v-else class="empty-pedidos">
                <span class="material-icons">inbox</span>
                <p>No hay pedidos disponibles para asignar</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sección de asignación de trabajadores -->
        <div class="form-section">
          <div class="form-group">
            <div class="form-label-group">
              <label>Asignar a Trabajadores</label>
              <span class="form-helper">{{ usuariosAsignados.length }} trabajador(es) seleccionado(s)</span>
            </div>
            
            <div class="trabajadores-selection">
              <div class="selection-actions">
                <button 
                  type="button" 
                  class="link-btn" 
                  @click="seleccionarTodosTrabajadores"
                  :disabled="usuarios.length === 0"
                >
                  Seleccionar todos
                </button>
                <button 
                  type="button" 
                  class="link-btn" 
                  @click="limpiarSeleccionTrabajadores"
                  :disabled="usuariosAsignados.length === 0"
                >
                  Limpiar selección
                </button>
              </div>
              
              <div class="trabajadores-list-checkbox" v-if="usuarios.length > 0">
                <div 
                  v-for="usuario in usuarios" 
                  :key="usuario.id" 
                  class="checkbox-item"
                  :class="{ 'selected': usuariosAsignados.includes(usuario.id) }"
                >
                  <input 
                    type="checkbox" 
                    :id="'usuario-'+usuario.id" 
                    :value="usuario.id" 
                    v-model="usuariosAsignados"
                  >
                  <label :for="'usuario-'+usuario.id" class="usuario-label">
                    <div class="usuario-info">
                      <div class="usuario-header">
                        <strong class="usuario-nombre">{{ usuario.nombre }} {{ usuario.apellido }}</strong>
                      </div>
                      <div v-if="usuario.email" class="usuario-email">{{ usuario.email }}</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div v-else class="empty-usuarios">
                <span class="material-icons">person_off</span>
                <p>No hay trabajadores disponibles</p>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="fecha-limite">Fecha límite</label>
            <input 
              id="fecha-limite"
              type="date" 
              v-model="fechaLimite"
              :min="fechaMinima"
            >
          </div>
          
          <div class="form-group">
            <label for="horas-asignadas">Horas asignadas *</label>
            <input 
              id="horas-asignadas"
              type="number" 
              v-model="horasAsignadas"
              min="1"
              max="100"
              required
              placeholder="Ej: 8"
            >
            <span class="form-helper">Horas estimadas para completar el trabajo</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-info">
          <div class="info-grid">
            <span v-if="pedidosSeleccionados.length > 0" class="selected-count">
              {{ pedidosSeleccionados.length }} pedido(s) seleccionado(s)
            </span>
            <span v-if="usuariosAsignados.length > 0" class="selected-count">
              {{ usuariosAsignados.length }} trabajador(es) seleccionado(s)
            </span>
          </div>
        </div>
        <div class="footer-actions">
          <button class="btn secondary" @click="$emit('close')">
            Cancelar
          </button>
          <button 
            class="btn primary" 
            @click="confirmarAsignacion" 
            :disabled="!formularioValido"
            :class="{ 'loading': procesando }"
          >
            <span v-if="procesando" class="material-icons spin">refresh</span>
            <span v-else class="material-icons">assignment_turned_in</span>
            {{ procesando ? 'Procesando...' : 'Confirmar Asignación' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="../scripts/AsinacionTrabajadores.js"></script>

<style src="../styles/AsignacionModalStyle.css" ></style>