<template>
  <div class="modal-overlay" @click.self="cerrarModal">
    <div class="modal-container large">
      <div class="modal-header">
        <h2>{{ esNuevoPedido ? 'Crear Nuevo Pedido' : 'Editar Pedido' }}</h2>
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
                  :disabled="!esNuevoPedido"
                  :class="['form-control', { 'disabled': !esNuevoPedido }]"
                  :placeholder="esNuevoPedido ? 'Se generará automáticamente' : ''"
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
                  <span class="input-prefix">$</span>
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
                  <span class="input-prefix">$</span>
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
  <!-- BOTÓN TEMPORAL PARA DEBUG -->
  <button type="button" class="btn secondary" @click="debugFormData">
    Debug
  </button>
  
  <button type="button" class="btn secondary" @click="cerrarModal" :disabled="guardando">
    Cancelar
  </button>
  <button type="submit" class="btn primary" @click="guardarPedido" :disabled="guardando">
    <span v-if="guardando" class="material-icons spin">refresh</span>
    <span v-else class="material-icons">save</span>
    {{ guardando ? 'Guardando...' : (esNuevoPedido ? 'Crear Pedido' : 'Guardar Cambios') }}
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

  // AGREGAR WATCHERS PARA OBSERVAR CAMBIOS EN EL PROP
  watch: {
    pedido: {
      handler(newPedido) {
        console.log('👀 Prop pedido cambió:', newPedido)
        this.inicializarFormulario()
      },
      immediate: true,
      deep: true
    }
  },

  computed: {
    esNuevoPedido() {
      return !this.pedido || !this.pedido.id
    }
  },

  mounted() {
    console.log('🔧 Modal de edición montado con pedido:', this.pedido)
  },

  methods: {
    inicializarFormulario() {
      console.log('📝 Inicializando formulario...')
      console.log('📝 Pedido actual:', this.pedido)
      console.log('📝 Es nuevo pedido:', this.esNuevoPedido)
      
      // Crear una copia reactiva de los datos
      this.formData = {
        codigo_pedido: this.pedido?.codigo_pedido || '',
        tipo_pedido_id: this.pedido?.tipo_pedido_id || '',
        proyecto_asociado: this.pedido?.proyecto_asociado || '',
        fecha_requerida: this.formatDateForInput(this.pedido?.fecha_requerida),
        prioridad: this.pedido?.prioridad || '',
        estado_id: this.pedido?.estado_id || (this.esNuevoPedido ? '1' : ''),
        descripcion: this.pedido?.descripcion || '',
        especificaciones_tecnicas: this.pedido?.especificaciones_tecnicas || '',
        presupuesto_estimado: this.pedido?.presupuesto_estimado || null,
        precio_final: this.pedido?.precio_final || null,
        observaciones: this.pedido?.observaciones || '',
        archivos_existentes: Array.isArray(this.pedido?.archivos) ? [...this.pedido.archivos] : []
      }
      
      // Resetear arrays de archivos
      this.archivosNuevos = []
      this.archivosAEliminar = []
      this.errors = {}
      
      console.log('📝 Form data inicializado:', JSON.stringify(this.formData, null, 2))
    },

    formatDateForInput(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    },

    validarFormulario() {
      console.log('✅ Validando formulario...')
      console.log('✅ Datos a validar:', this.formData)
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

      const esValido = Object.keys(this.errors).length === 0
      console.log('✅ Resultado validación:', esValido ? 'VÁLIDO' : 'INVÁLIDO', this.errors)
      
      return esValido
    },

    async guardarPedido() {
      console.log(`💾 INICIANDO GUARDADO`)
      console.log(`💾 Es nuevo pedido: ${this.esNuevoPedido}`)
      console.log(`💾 ID del pedido: ${this.pedido?.id}`)
      console.log('📝 FormData ACTUAL al momento del guardado:', JSON.stringify(this.formData, null, 2))
      
      if (!this.validarFormulario()) {
        this.showError('Por favor corrige los errores en el formulario')
        return
      }

      this.guardando = true

      try {
        const url = this.esNuevoPedido ? '/api/Pedido' : `/api/Pedido/${this.pedido.id}`
        const method = this.esNuevoPedido ? 'POST' : 'PUT'
        
        console.log(`📡 URL: ${url}`)
        console.log(`📡 Método: ${method}`)

        // Crear FormData
        const formData = new FormData()
        
        // Agregar cada campo con logging detallado
        Object.keys(this.formData).forEach(key => {
          if (key !== 'archivos_existentes' && this.formData[key] !== null && this.formData[key] !== undefined && this.formData[key] !== '') {
            console.log(`📋 Agregando al FormData - ${key}:`, this.formData[key], `(tipo: ${typeof this.formData[key]})`)
            formData.append(key, this.formData[key])
          }
        })

        // Agregar archivos a eliminar
        if (this.archivosAEliminar.length > 0) {
          console.log('🗑️ Archivos a eliminar:', this.archivosAEliminar)
          formData.append('archivos_a_eliminar', JSON.stringify(this.archivosAEliminar))
        }

        // Agregar archivos nuevos
        this.archivosNuevos.forEach((archivo, index) => {
          console.log(`📎 Archivo nuevo ${index}:`, archivo.name, archivo.size)
          formData.append('archivos_nuevos', archivo)
        })

        // Verificar contenido final del FormData
        console.log('📦 Contenido final del FormData:')
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`)
          } else {
            console.log(`  ${key}: ${value}`)
          }
        }

        const response = await fetch(url, {
          method: method,
          body: formData
        })

        console.log('📡 Respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        // Obtener el contenido de la respuesta
        let responseData
        const contentType = response.headers.get('content-type') || ''
        
        if (contentType.includes('application/json')) {
          responseData = await response.json()
        } else {
          const textData = await response.text()
          try {
            responseData = JSON.parse(textData)
          } catch (e) {
            responseData = { message: textData }
          }
        }

        console.log('📦 Datos de respuesta:', responseData)

        if (!response.ok) {
          console.error('❌ Error del servidor:', responseData)
          throw new Error(responseData?.message || `Error ${response.status}: ${response.statusText}`)
        }

        // Verificar si hay errores en la respuesta exitosa
        if (responseData && responseData.error) {
          console.error('❌ Error en respuesta exitosa:', responseData.error)
          throw new Error(responseData.error)
        }

        console.log('✅ Pedido guardado exitosamente:', responseData)
        
        this.showSuccess(`Pedido ${this.esNuevoPedido ? 'creado' : 'actualizado'} correctamente`)
        
        this.$emit('saved', responseData)
        this.$emit('pedidoActualizado', responseData)
        
        this.cerrarModal()

      } catch (error) {
        console.error('❌ Error completo al guardar pedido:', {
          message: error.message,
          stack: error.stack
        })
        this.showError(error.message || `Error al ${this.esNuevoPedido ? 'crear' : 'actualizar'} el pedido`)
      } finally {
        this.guardando = false
        console.log('🔄 Guardado finalizado')
      }
    },

    manejarArchivos(event) {
      console.log('📎 Manejando archivos seleccionados...')
      const archivos = Array.from(event.target.files)
      console.log('📎 Archivos seleccionados:', archivos.length)
      
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
        console.log('📎 Archivo agregado:', archivo.name)
      })

      // Limpiar el input
      event.target.value = ''
    },

    eliminarArchivoNuevo(index) {
      console.log('🗑️ Eliminando archivo nuevo en índice:', index)
      this.archivosNuevos.splice(index, 1)
    },

    eliminarArchivoExistente(archivoId) {
      console.log('🗑️ Marcando archivo existente para eliminar:', archivoId)
      this.archivosAEliminar.push(archivoId)
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
      console.log('🚪 Cerrando modal de edición')
      this.$emit('close')
    },

    showError(message) {
      console.log('❌ Mostrando error:', message)
      alert('Error: ' + message)
    },

    showSuccess(message) {
      console.log('✅ Mostrando éxito:', message)
      alert('Éxito: ' + message)
    },

    // MÉTODO ADICIONAL PARA DEBUG
    debugFormData() {
      console.log('🔍 DEBUG COMPLETO:')
      console.log('  Pedido original:', this.pedido)
      console.log('  FormData actual:', this.formData)
      console.log('  Es nuevo pedido:', this.esNuevoPedido)
      console.log('  Archivos nuevos:', this.archivosNuevos)
      console.log('  Archivos a eliminar:', this.archivosAEliminar)
      console.log('  Errores:', this.errors)
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
  backdrop-filter: blur(5px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-container.large {
  width: 90%;
  max-width: 800px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: linear-gradient(to right, #f8f9fa, #f0f4ff);
  position: relative;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  flex: 1;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #6c757d;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fafbfc;
}

.pedido-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeef2;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-section:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.form-section h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1em;
  font-weight: 600;
  border-bottom: 2px solid #4a6cf7;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
}

.form-section h3::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #4a6cf7;
  margin-right: 10px;
  border-radius: 2px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #394360;
  font-size: 0.9em;
  display: flex;
  align-items: center;
}

.form-group label::after {
  content: "";
  height: 2px;
  width: 8px;
  background: #4a6cf7;
  margin-left: 4px;
  border-radius: 1px;
}

.form-control {
  padding: 12px 14px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95em;
  transition: all 0.2s ease;
  background: white;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.15);
}

.form-control.error {
  border-color: #ff5e5e;
  box-shadow: 0 0 0 4px rgba(255, 94, 94, 0.15);
}

.form-control.disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.input-group {
  display: flex;
  align-items: center;
  position: relative;
}

.input-prefix {
  background: #f0f4ff;
  border: 2px solid #e9ecef;
  border-right: none;
  padding: 12px 14px;
  border-radius: 8px 0 0 8px;
  font-weight: 600;
  color: #4a6cf7;
  position: absolute;
  left: 0;
  height: calc(100% - 4px);
  display: flex;
  align-items: center;
  z-index: 1;
}

.input-group .form-control {
  border-left: none;
  border-radius: 0 8px 8px 0;
  padding-left: 45px;
}

.error-message {
  color: #ff5e5e;
  font-size: 0.85em;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message::before {
  content: "⚠";
  font-size: 0.9em;
}

.file-upload-area {
  position: relative;
  border: 2px dashed #4a6cf7;
  border-radius: 10px;
  padding: 30px 24px;
  text-align: center;
  background: #f8f9ff;
  transition: all 0.2s ease;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: #3a57d7;
  background: #f0f4ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 108, 247, 0.15);
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  top: 0;
  left: 0;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #4a6cf7;
}

.file-upload-label .material-icons {
  font-size: 2.5em;
  opacity: 0.8;
}

.file-upload-label span {
  font-weight: 600;
}

.file-upload-label small {
  color: #6c757d;
  font-size: 0.85em;
}

.archivos-existentes,
.archivos-nuevos {
  margin-top: 20px;
}

.archivos-existentes h4,
.archivos-nuevos h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 0.95em;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.archivos-existentes h4::before,
.archivos-nuevos h4::before {
  content: "📁";
  margin-right: 8px;
}

.archivo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.archivo-item:hover {
  border-color: #4a6cf7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.archivo-nombre {
  flex: 1;
  font-size: 0.9em;
  color: #394360;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.archivo-size {
  font-size: 0.8em;
  color: #6c757d;
  font-weight: 500;
}

.btn-eliminar-archivo {
  background: #ff5e5e;
  border: none;
  color: white;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-eliminar-archivo:hover {
  background: #ff4242;
  transform: scale(1.1);
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
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn.primary {
  background: linear-gradient(to right, #4a6cf7, #6a8aff);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3);
}

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(to right, #3a57d7, #5a7aef);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(74, 108, 247, 0.4);
}

.btn.secondary {
  background: #6c757d;
  color: white;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.2);
}

.btn.secondary:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.3);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Scroll personalizado para el modal */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container.large {
    width: 95%;
    margin: 10px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-footer {
    padding: 16px 20px;
  }
  
  .file-upload-area {
    padding: 20px 16px;
  }
}
</style>