<template>
  <div class="modal-overlay" @click.self="cerrarModal">
    <div class="modal-container large">
      <div class="modal-header">
        <h2>Editar Pedido</h2>
        <button class="close-btn" @click="cerrarModal">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="guardarPedido" class="pedido-form">
          <!-- Información básica -->
          <div class="form-section">
            <h3>Información Básica</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="codigo_pedido">Código del Pedido *</label>
                <input 
                  type="text" 
                  id="codigo_pedido"
                  v-model="formData.codigo_pedido"
                  :disabled="true"
                  class="form-control disabled"
                >
              </div>
              <div class="form-group">
                <label for="tipo_pedido">Tipo de Pedido *</label>
                <select 
                  id="tipo_pedido"
                  v-model="formData.tipo_pedido_id"
                  class="form-control"
                  :class="{ 'error': errors.tipo_pedido_id }"
                >
                  <option value="">Selecciona un tipo</option>
                  <option v-for="tipo in tiposPedido" :key="tipo.id" :value="tipo.id">
                    {{ tipo.nombre }}
                  </option>
                </select>
                <span v-if="errors.tipo_pedido_id" class="error-message">{{ errors.tipo_pedido_id }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="proyecto_asociado">Proyecto Asociado</label>
                <input 
                  type="text" 
                  id="proyecto_asociado"
                  v-model="formData.proyecto_asociado"
                  class="form-control"
                  placeholder="Nombre del proyecto (opcional)"
                >
              </div>
              <div class="form-group">
                <label for="fecha_requerida">Fecha Requerida *</label>
                <input 
                  type="date" 
                  id="fecha_requerida"
                  v-model="formData.fecha_requerida"
                  class="form-control"
                  :class="{ 'error': errors.fecha_requerida }"
                >
                <span v-if="errors.fecha_requerida" class="error-message">{{ errors.fecha_requerida }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="prioridad">Prioridad *</label>
                <select 
                  id="prioridad"
                  v-model="formData.prioridad"
                  class="form-control"
                  :class="{ 'error': errors.prioridad }"
                >
                  <option value="">Selecciona prioridad</option>
                  <option value="1">Alta</option>
                  <option value="2">Media-Alta</option>
                  <option value="3">Media</option>
                  <option value="4">Media-Baja</option>
                  <option value="5">Baja</option>
                </select>
                <span v-if="errors.prioridad" class="error-message">{{ errors.prioridad }}</span>
              </div>
              <div class="form-group">
                <label for="estado">Estado *</label>
                <select 
                  id="estado"
                  v-model="formData.estado_id"
                  class="form-control"
                  :class="{ 'error': errors.estado_id }"
                >
                  <option value="">Selecciona estado</option>
                  <option v-for="estado in estados" :key="estado.id" :value="estado.id">
                    {{ estado.nombre }}
                  </option>
                </select>
                <span v-if="errors.estado_id" class="error-message">{{ errors.estado_id }}</span>
              </div>
            </div>
          </div>

          <!-- Descripción y especificaciones -->
          <div class="form-section">
            <h3>Descripción y Especificaciones</h3>
            <div class="form-group">
              <label for="descripcion">Descripción del Pedido *</label>
              <textarea 
                id="descripcion"
                v-model="formData.descripcion"
                class="form-control"
                :class="{ 'error': errors.descripcion }"
                rows="4"
                placeholder="Describe detalladamente lo que se necesita..."
              ></textarea>
              <span v-if="errors.descripcion" class="error-message">{{ errors.descripcion }}</span>
            </div>

            <div class="form-group">
              <label for="especificaciones">Especificaciones Técnicas</label>
              <textarea 
                id="especificaciones"
                v-model="formData.especificaciones_tecnicas"
                class="form-control"
                rows="3"
                placeholder="Especificaciones técnicas, materiales, dimensiones, etc."
              ></textarea>
            </div>
          </div>

          <!-- Información de costos -->
          <div class="form-section">
            <h3>Información de Costos</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="presupuesto_estimado">Presupuesto Estimado</label>
                <div class="input-group">
                  <span class="input-prefix">Q</span>
                  <input 
                    type="number" 
                    id="presupuesto_estimado"
                    v-model.number="formData.presupuesto_estimado"
                    class="form-control"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  >
                </div>
              </div>
              <div class="form-group">
                <label for="precio_final">Precio Final</label>
                <div class="input-group">
                  <span class="input-prefix">Q</span>
                  <input 
                    type="number" 
                    id="precio_final"
                    v-model.number="formData.precio_final"
                    class="form-control"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Archivos adjuntos -->
          <div class="form-section">
            <h3>Archivos Adjuntos</h3>
            <div class="file-upload-area">
              <input 
                type="file" 
                id="archivos"
                ref="fileInput"
                @change="manejarArchivos"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                class="file-input"
              >
              <label for="archivos" class="file-upload-label">
                <span class="material-icons">cloud_upload</span>
                <span>Seleccionar archivos o arrastrar aquí</span>
                <small>PDF, DOC, DOCX, JPG, PNG, XLSX (máx. 10MB cada uno)</small>
              </label>
            </div>

            <!-- Lista de archivos existentes -->
            <div v-if="formData.archivos_existentes && formData.archivos_existentes.length > 0" class="archivos-existentes">
              <h4>Archivos actuales:</h4>
              <div class="archivo-item" v-for="archivo in formData.archivos_existentes" :key="archivo.id">
                <span class="material-icons">attachment</span>
                <span class="archivo-nombre">{{ archivo.nombre_original }}</span>
                <button type="button" class="btn-eliminar-archivo" @click="eliminarArchivoExistente(archivo.id)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>

            <!-- Lista de archivos nuevos -->
            <div v-if="archivosNuevos.length > 0" class="archivos-nuevos">
              <h4>Archivos nuevos:</h4>
              <div class="archivo-item" v-for="(archivo, index) in archivosNuevos" :key="index">
                <span class="material-icons">attachment</span>
                <span class="archivo-nombre">{{ archivo.name }}</span>
                <span class="archivo-size">({{ formatFileSize(archivo.size) }})</span>
                <button type="button" class="btn-eliminar-archivo" @click="eliminarArchivoNuevo(index)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="form-section">
            <h3>Observaciones</h3>
            <div class="form-group">
              <label for="observaciones">Observaciones Adicionales</label>
              <textarea 
                id="observaciones"
                v-model="formData.observaciones"
                class="form-control"
                rows="3"
                placeholder="Observaciones, notas adicionales o comentarios especiales..."
              ></textarea>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn secondary" @click="cerrarModal" :disabled="guardando">
          Cancelar
        </button>
        <button type="submit" class="btn primary" @click="guardarPedido" :disabled="guardando">
          <span v-if="guardando" class="material-icons spin">refresh</span>
          <span v-else class="material-icons">save</span>
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditarPedidoModal',
  props: {
    pedido: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formData: {
        codigo_pedido: '',
        tipo_pedido_id: '',
        proyecto_asociado: '',
        fecha_requerida: '',
        prioridad: '',
        estado_id: '',
        descripcion: '',
        especificaciones_tecnicas: '',
        presupuesto_estimado: null,
        precio_final: null,
        observaciones: '',
        archivos_existentes: []
      },
      archivosNuevos: [],
      archivosAEliminar: [],
      guardando: false,
      errors: {},
      tiposPedido: [
        { id: 1, nombre: 'Compra de Materiales' },
        { id: 2, nombre: 'Servicios Profesionales' },
        { id: 3, nombre: 'Mantenimiento' },
        { id: 4, nombre: 'Construcción' },
        { id: 5, nombre: 'Consultoría' }
      ],
      estados: [
        { id: 1, nombre: 'Borrador' },
        { id: 2, nombre: 'Pendiente Aprobación' },
        { id: 3, nombre: 'Aprobado' },
        { id: 4, nombre: 'En Proceso' },
        { id: 5, nombre: 'Completado' },
        { id: 6, nombre: 'Cancelado' }
      ]
    }
  },
  mounted() {
    this.inicializarFormulario()
  },
  methods: {
    inicializarFormulario() {
      // Copiar datos del pedido al formulario
      this.formData = {
        codigo_pedido: this.pedido.codigo_pedido || '',
        tipo_pedido_id: this.pedido.tipo_pedido_id || '',
        proyecto_asociado: this.pedido.proyecto_asociado || '',
        fecha_requerida: this.formatDateForInput(this.pedido.fecha_requerida),
        prioridad: this.pedido.prioridad || '',
        estado_id: this.pedido.estado_id || '',
        descripcion: this.pedido.descripcion || '',
        especificaciones_tecnicas: this.pedido.especificaciones_tecnicas || '',
        presupuesto_estimado: this.pedido.presupuesto_estimado || null,
        precio_final: this.pedido.precio_final || null,
        observaciones: this.pedido.observaciones || '',
        archivos_existentes: this.pedido.archivos || []
      }
    },

    formatDateForInput(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    },

    validarFormulario() {
      this.errors = {}

      if (!this.formData.tipo_pedido_id) {
        this.errors.tipo_pedido_id = 'El tipo de pedido es requerido'
      }

      if (!this.formData.fecha_requerida) {
        this.errors.fecha_requerida = 'La fecha requerida es obligatoria'
      }

      if (!this.formData.prioridad) {
        this.errors.prioridad = 'La prioridad es requerida'
      }

      if (!this.formData.estado_id) {
        this.errors.estado_id = 'El estado es requerido'
      }

      if (!this.formData.descripcion || this.formData.descripcion.trim().length < 10) {
        this.errors.descripcion = 'La descripción debe tener al menos 10 caracteres'
      }

      return Object.keys(this.errors).length === 0
    },

    async guardarPedido() {
      if (!this.validarFormulario()) {
        this.showError('Por favor corrige los errores en el formulario')
        return
      }

      this.guardando = true

      try {
        // Preparar los datos para enviar
        const datosActualizados = {
          ...this.formData,
          archivos_a_eliminar: this.archivosAEliminar
        }

        // Crear FormData para enviar archivos
        const formData = new FormData()
        
        // Agregar datos del formulario
        Object.keys(datosActualizados).forEach(key => {
          if (datosActualizados[key] !== null && datosActualizados[key] !== undefined && key !== 'archivos_existentes') {
            if (key === 'archivos_a_eliminar') {
              formData.append(key, JSON.stringify(datosActualizados[key]))
            } else {
              formData.append(key, datosActualizados[key])
            }
          }
        })

        // Agregar archivos nuevos
        this.archivosNuevos.forEach(archivo => {
          formData.append('archivos_nuevos', archivo)
        })

        const response = await fetch(`/api/Pedido/${this.pedido.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error al actualizar el pedido')
        }

        const pedidoActualizado = await response.json()
        
        this.showSuccess('Pedido actualizado correctamente')
        this.$emit('pedidoActualizado', pedidoActualizado)
        this.cerrarModal()

      } catch (error) {
        console.error('Error al guardar:', error)
        this.showError(error.message || 'Error al actualizar el pedido')
      } finally {
        this.guardando = false
      }
    },

    manejarArchivos(event) {
      const archivos = Array.from(event.target.files)
      
      archivos.forEach(archivo => {
        // Validar tamaño del archivo (10MB máximo)
        if (archivo.size > 10 * 1024 * 1024) {
          this.showError(`El archivo ${archivo.name} es demasiado grande (máximo 10MB)`)
          return
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls']
        const extension = '.' + archivo.name.split('.').pop().toLowerCase()
        
        if (!tiposPermitidos.includes(extension)) {
          this.showError(`El archivo ${archivo.name} no tiene un formato válido`)
          return
        }

        this.archivosNuevos.push(archivo)
      })

      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      event.target.value = ''
    },

    eliminarArchivoNuevo(index) {
      this.archivosNuevos.splice(index, 1)
    },

    eliminarArchivoExistente(archivoId) {
      // Agregar a la lista de archivos a eliminar
      this.archivosAEliminar.push(archivoId)
      
      // Remover de la lista de archivos existentes
      this.formData.archivos_existentes = this.formData.archivos_existentes.filter(
        archivo => archivo.id !== archivoId
      )
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    cerrarModal() {
      this.$emit('close')
    },

    getAuthToken() {
      return localStorage.getItem('authToken') || ''
    },

    showError(message) {
      alert('Error: ' + message)
    },

    showSuccess(message) {
      alert('Éxito: ' + message)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-container.large {
  width: 90%;
  max-width: 800px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.pedido-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.form-section h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1em;
  font-weight: 600;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #495057;
  font-size: 0.9em;
}

.form-control {
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.95em;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.form-control.disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  background: #e9ecef;
  border: 2px solid #e9ecef;
  border-right: none;
  padding: 10px 12px;
  border-radius: 6px 0 0 6px;
  font-weight: 500;
  color: #495057;
}

.input-group .form-control {
  border-left: none;
  border-radius: 0 6px 6px 0;
}

.error-message {
  color: #dc3545;
  font-size: 0.85em;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-upload-area {
  position: relative;
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  background: #f8f9ff;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #0056b3;
  background: #f0f4ff;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #007bff;
}

.file-upload-label .material-icons {
  font-size: 2em;
}

.file-upload-label small {
  color: #6c757d;
  font-size: 0.85em;
}

.archivos-existentes,
.archivos-nuevos {
  margin-top: 16px;
}

.archivos-existentes h4,
.archivos-nuevos h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 0.95em;
  font-weight: 600;
}

.archivo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 8px;
}

.archivo-nombre {
  flex: 1;
  font-size: 0.9em;
  color: #495057;
}

.archivo-size {
  font-size: 0.8em;
  color: #6c757d;
}

.btn-eliminar-archivo {
  background: #dc3545;
  border: none;
  color: white;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-eliminar-archivo:hover {
  background: #c82333;
}

.btn-eliminar-archivo .material-icons {
  font-size: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover:not(:disabled) {
  background: #5a6268;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container.large {
    width: 95%;
    margin: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .modal-body {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
  }
}
</style>