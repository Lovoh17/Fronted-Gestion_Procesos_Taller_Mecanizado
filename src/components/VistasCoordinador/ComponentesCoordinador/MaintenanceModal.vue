<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nuevo Mantenimiento</h2>
        <va-button class="close-btn" @click="close"    >
        
          <span class="material-icons">close</span>
        
      </va-button>
      </div>

      <form @submit.prevent="submitForm">
        <div class="modal-body">
          <!-- Campos obligatorios -->
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input v-model="form.nombre" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Herramienta *</label>
              <select v-model="form.herramienta_id" required>
                <option value="">Seleccionar herramienta</option>
                <option 
                  v-for="herramienta in herramientas" 
                  :key="herramienta.id" 
                  :value="herramienta.id"
                >
                  {{ herramienta.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo de Mantenimiento *</label>
              <select v-model="form.tipo_mantenimiento_id" required>
                <option value="">Seleccionar tipo</option>
                <option 
                  v-for="tipo in tiposMantenimiento" 
                  :key="tipo.id" 
                  :value="tipo.id"
                >
                  {{ tipo.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha Programada *</label>
              <input type="date" v-model="form.fecha_programada" required>
            </div>

            <div class="form-group">
              <label>Prioridad *</label>
              <select v-model="form.prioridad_id" required>
                <option value="">Seleccionar prioridad</option>
                <option 
                  v-for="prioridad in prioridades" 
                  :key="prioridad.id" 
                  :value="prioridad.id"
                >
                  {{ prioridad.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Técnico Asignado</label>
              <select v-model="form.tecnico_asignado_id">
                <option value="">Sin asignar</option>
                <option 
                  v-for="tecnico in tecnicos" 
                  :key="tecnico.id" 
                  :value="tecnico.id"
                >
                  {{ tecnico.nombre }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Costo Estimado (S/)</label>
              <input type="number" step="0.01" v-model="form.costo_estimado">
            </div>
          </div>

          <div class="form-group">
            <label>Descripción del Problema *</label>
            <textarea v-model="form.descripcion_problema" required></textarea>
          </div>

          <!-- Campos ocultos con valores por defecto -->
          <input type="hidden" v-model="form.estado_id" value="1">
          <input type="hidden" v-model="form.mantenimiento_hecho_por" :value="usuarioActual.id">
        </div>

        <div class="modal-footer">
          <va-button type="button" class="btn secondary" @click="close"   >
        Cancelar
      </va-button>
          <va-button type="submit" class="btn primary"   >
        Guardar Mantenimiento
      </va-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { toast } from 'vue3-toastify'

export default {
  name: 'NuevoMantenimientoModal',
  props: {
    usuarioActual: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        nombre: '',
        herramienta_id: '',
        tipo_mantenimiento_id: '',
        fecha_programada: new Date().toISOString().split('T')[0],
        estado_id: 1, // Programado por defecto
        prioridad_id: 1, // Baja por defecto
        costo_estimado: 0,
        tecnico_asignado_id: null,
        descripcion_problema: '',
        mantenimiento_hecho_por: null
      },
      herramientas: [],
      tiposMantenimiento: [],
      prioridades: [],
      tecnicos: [],
      loading: false
    }
  },
  async created() {
    await this.cargarDatosIniciales()
    this.form.mantenimiento_hecho_por = this.usuarioActual.id
  },
  methods: {
    async cargarDatosIniciales() {
      try {
        this.loading = true
        const [herramientas, tipos, prioridades, tecnicos] = await Promise.all([
          axios.get('/api/Herramienta'),
          axios.get('/api/Tipo_Mantenimiento'),
          axios.get('/api/Prioridad_Mantenimiento'),
          axios.get('/api/Usuario')
        ])

        this.herramientas = herramientas.data
        this.tiposMantenimiento = tipos.data
        this.prioridades = prioridades.data
        this.tecnicos = tecnicos.data
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        this.loading = false
      }
    },
    async submitForm() {
      try {
        // Validación básica
        if (!this.form.nombre || 
            !this.form.herramienta_id || 
            !this.form.tipo_mantenimiento_id || 
            !this.form.fecha_programada || 
            !this.form.prioridad_id || 
            !this.form.descripcion_problema) {
          toast.error('Por favor complete todos los campos obligatorios')
          return
        }

        const response = await axios.post('/api/Mantenimiento', this.form)
        toast.success('Mantenimiento creado correctamente')
        this.$emit('creado', response.data)
        this.close()
      } catch (error) {
        console.error('Error al crear mantenimiento:', error)
        toast.error(error.response?.data?.message || 'Error al crear mantenimiento')
      }
    },
    close() {
      this.$emit('close')
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .dark-mode .modal-content {
    background-color: #1e1e1e;
    color: #fff;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .dark-mode .modal-header {
    border-bottom-color: #333;
  }
  
  .modal-header h2 {
    margin: 0;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 24px;
  }
  
  .dark-mode .close-btn {
    color: #aaa;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .dark-mode .close-btn:hover {
    color: #fff;
  }
  
  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }
  
  .form-section {
    margin-bottom: 25px;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    color: var(--primary-color);
  }
  
  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
  }
  
  .dark-mode .form-group input,
  .dark-mode .form-group select,
  .dark-mode .form-group textarea {
    background-color: #333;
    color: #fff;
    border-color: #555;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 60px;
  }
  
  .parts-list {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 10px;
  }
  
  .dark-mode .parts-list {
    border-color: #333;
  }
  
  .part-item {
    margin-bottom: 15px;
  }
  
  .part-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  
  .part-select {
    flex: 2;
    min-width: 0;
  }
  
  .quantity-input {
    width: 80px;
  }
  
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #f44336;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  
  .remove-btn:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  .error-message {
    color: #f44336;
    font-size: 0.8em;
    margin-left: 10px;
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .add-btn:hover {
    background-color: rgba(33, 150, 243, 0.1);
  }
  
  .equipment-info {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
  }
  
  .dark-mode .equipment-info {
    background-color: #2d2d2d;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .info-item {
    margin-bottom: 10px;
  }
  
  .info-item label {
    display: block;
    font-weight: 500;
    color: #666;
    margin-bottom: 5px;
    font-size: 0.9em;
  }
  
  .dark-mode .info-item label {
    color: #aaa;
  }
  
  .info-item span {
    word-break: break-word;
  }
  
  .info-item.full-width {
    grid-column: 1 / -1;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    padding: 15px 20px;
    border-top: 1px solid #eee;
  }
  
  .dark-mode .modal-footer {
    border-top-color: #333;
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn.primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn.primary:hover {
    background-color: var(--secondary-color);
  }
  
  .btn.secondary {
    background-color: #e0e0e0;
    color: #333;
  }
  
  .dark-mode .btn.secondary {
    background-color: #333;
    color: #fff;
  }
  
  .btn.secondary:hover {
    background-color: #d0d0d0;
  }
  
  .dark-mode .btn.secondary:hover {
    background-color: #444;
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 0;
    }
    
    .part-row {
      flex-wrap: wrap;
    }
    
    .part-select {
      width: 100%;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
      padding: 15px;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
    }
  }
  </style>