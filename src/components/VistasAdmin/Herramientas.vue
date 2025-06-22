<template>
  <div class="herramientas-container">
    <div class="header">
      <h1><i class="fas fa-tools"></i> Gestión de Herramientas</h1>
      <button @click="showForm = !showForm" class="btn-primary">
        <i class="fas fa-plus"></i> {{ showForm ? 'Ocultar formulario' : 'Nueva herramienta' }}
      </button>
    </div>

    <!-- Formulario para crear/editar herramienta -->
    <transition name="fade">
      <div v-if="showForm" class="card form-container">
        <h2><i class="fas fa-edit"></i> {{ editing ? 'Editar Herramienta' : 'Nueva Herramienta' }}</h2>
        <form @submit.prevent="submitForm">
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre*</label>
              <input type="text" id="nombre" v-model="herramienta.nombre" required>
            </div>

            <div class="form-group">
              <label for="modelo">Modelo*</label>
              <input type="text" id="modelo" v-model="herramienta.modelo" required>
            </div>

            <div class="form-group">
              <label for="fabricante">Fabricante</label>
              <input type="text" id="fabricante" v-model="herramienta.fabricante">
            </div>

            <div class="form-group">
              <label for="numero_serie">Número de serie</label>
              <input type="text" id="numero_serie" v-model="herramienta.numero_serie">
            </div>

            <div class="form-group">
              <label for="codigo_inventario">Código de inventario</label>
              <input type="text" id="codigo_inventario" v-model="herramienta.codigo_inventario">
            </div>

            <div class="form-group">
              <label for="fecha_adquisicion">Fecha adquisición</label>
              <input type="date" id="fecha_adquisicion" v-model="herramienta.fecha_adquisicion">
            </div>

            <div class="form-group">
              <label for="costo_adquisicion">Costo adquisición ($)</label>
              <input type="number" step="0.01" id="costo_adquisicion" v-model="herramienta.costo_adquisicion">
            </div>

            <div class="form-group">
              <label for="vida_util_horas">Vida útil (horas)</label>
              <input type="number" id="vida_util_horas" v-model="herramienta.vida_util_horas">
            </div>

            <div class="form-group">
              <label for="horas_uso_actual">Horas de uso actual</label>
              <input type="number" id="horas_uso_actual" v-model="herramienta.horas_uso_actual">
            </div>

            <div class="form-group">
              <label for="estado_herramienta_id">Estado</label>
              <select id="estado_herramienta_id" v-model="herramienta.estado_herramienta_id">
                <option value="1">Disponible</option>
                <option value="2">En uso</option>
                <option value="3">Mantenimiento</option>
                <option value="4">Dañado</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="especificaciones_tecnicas">Especificaciones técnicas</label>
              <textarea id="especificaciones_tecnicas" v-model="herramienta.especificaciones_tecnicas"></textarea>
            </div>

            <div class="form-group full-width">
              <label for="notas">Notas</label>
              <textarea id="notas" v-model="herramienta.notas"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> {{ editing ? 'Actualizar' : 'Guardar' }}
            </button>
            <button type="button" @click="resetForm" class="btn-secondary">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </transition>

    <!-- Filtros y búsqueda -->
    <div class="filters-container">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input type="text" v-model="searchQuery" placeholder="Buscar herramientas...">
      </div>
      <div class="filter-group">
        <label>Filtrar por estado:</label>
        <select v-model="filterEstado">
          <option value="">Todos</option>
          <option value="1">Disponible</option>
          <option value="2">En uso</option>
          <option value="3">Mantenimiento</option>
          <option value="4">Dañado</option>
        </select>
      </div>
    </div>

    <!-- Listado de herramientas -->
    <div class="tools-list">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando herramientas...
      </div>

      <div v-if="!loading && filteredHerramientas.length === 0" class="no-results">
        No se encontraron herramientas
      </div>

      <div v-for="herramienta in filteredHerramientas" :key="herramienta.id" class="tool-card">
        <div class="tool-header">
          <div class="tool-image" :style="{ 'background-image': 'url(' + (herramienta.imagen_ruta || defaultImage) + ')' }"></div>
          <div class="tool-title">
            <h3>{{ herramienta.nombre }}</h3>
            <span class="tool-model">{{ herramienta.modelo }}</span>
            <span class="tool-status" :class="'status-' + herramienta.estado_herramienta_id">
              {{ getEstadoName(herramienta.estado_herramienta_id) }}
            </span>
          </div>
        </div>

        <div class="tool-details">
          <div class="detail-item">
            <i class="fas fa-industry"></i>
            <span>{{ herramienta.fabricante || 'Sin fabricante' }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-barcode"></i>
            <span>{{ herramienta.codigo_inventario || 'Sin código' }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDate(herramienta.fecha_adquisicion) || 'Sin fecha' }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-dollar-sign"></i>
            <span>${{ formatCurrency(herramienta.costo_adquisicion) }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>{{ herramienta.horas_uso_actual || '0' }} / {{ herramienta.vida_util_horas || 'N/A' }} horas</span>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-label">
            Vida útil: {{ calcularPorcentajeUso(herramienta) }}%
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: calcularPorcentajeUso(herramienta) + '%' }"></div>
          </div>
        </div>

        <div class="tool-actions">
          <button @click="editHerramienta(herramienta.id)" class="btn-edit">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button @click="showDetails(herramienta)" class="btn-info">
            <i class="fas fa-info-circle"></i> Detalles
          </button>
          <button @click="confirmDelete(herramienta.id)" class="btn-delete">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <transition name="modal">
      <div v-if="selectedHerramienta" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Detalles completos</h3>
            <button @click="selectedHerramienta = null" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <div class="modal-image" :style="{ 'background-image': 'url(' + (selectedHerramienta.imagen_ruta || defaultImage) + ')' }"></div>
            <div class="modal-details">
              <h4>{{ selectedHerramienta.nombre }} - {{ selectedHerramienta.modelo }}</h4>
              <div class="detail-row">
                <span class="detail-label">Fabricante:</span>
                <span>{{ selectedHerramienta.fabricante || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Número de serie:</span>
                <span>{{ selectedHerramienta.numero_serie || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Código inventario:</span>
                <span>{{ selectedHerramienta.codigo_inventario || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha adquisición:</span>
                <span>{{ formatDate(selectedHerramienta.fecha_adquisicion) || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Costo:</span>
                <span>${{ formatCurrency(selectedHerramienta.costo_adquisicion) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valor actual:</span>
                <span>${{ formatCurrency(selectedHerramienta.valor_actual) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span :class="'status-' + selectedHerramienta.estado_herramienta_id">
                  {{ getEstadoName(selectedHerramienta.estado_herramienta_id) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Uso:</span>
                <span>{{ selectedHerramienta.horas_uso_actual || '0' }} / {{ selectedHerramienta.vida_util_horas || 'N/A' }} horas</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Último mantenimiento:</span>
                <span>{{ formatDate(selectedHerramienta.fecha_ultimo_mantenimiento) || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Próximo mantenimiento:</span>
                <span>{{ formatDate(selectedHerramienta.fecha_proximo_mantenimiento) || 'N/A' }}</span>
              </div>
              <div class="detail-row full-width">
                <span class="detail-label">Especificaciones técnicas:</span>
                <pre>{{ formatSpecs(selectedHerramienta.especificaciones_tecnicas) }}</pre>
              </div>
              <div class="detail-row full-width">
                <span class="detail-label">Notas:</span>
                <p>{{ selectedHerramienta.notas || 'Ninguna' }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="editHerramienta(selectedHerramienta.id)" class="btn-primary">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button @click="selectedHerramienta = null" class="btn-secondary">
              <i class="fas fa-times"></i> Cerrar
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de confirmación -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-container confirm-modal">
          <div class="modal-header">
            <h3>Confirmar eliminación</h3>
          </div>
          <div class="modal-content">
            <p>¿Estás seguro de que deseas eliminar la herramienta <strong>{{ herramientaToDeleteName }}</strong>?</p>
            <p>Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button @click="deleteHerramienta" class="btn-delete">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
            <button @click="showDeleteModal = false" class="btn-secondary">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HerramientasComponent',
  data() {
    return {
      herramientas: [],
      herramienta: {
        nombre: '',
        modelo: '',
        fabricante: '',
        numero_serie: '',
        codigo_inventario: '',
        estado_herramienta_id: 1,
        vida_util_horas: '',
        horas_uso_actual: '',
        fecha_adquisicion: '',
        costo_adquisicion: '',
        valor_actual: '',
        especificaciones_tecnicas: '',
        imagen_ruta: '',
        fecha_ultimo_mantenimiento: '',
        fecha_proximo_mantenimiento: '',
        notas: ''
      },
      editing: false,
      currentId: null,
      searchQuery: '',
      filterEstado: '',
      loading: false,
      showForm: false,
      selectedHerramienta: null,
      showDeleteModal: false,
      herramientaToDelete: null,
      herramientaToDeleteName: '',
      defaultImage: 'https://via.placeholder.com/300x200?text=Sin+imagen'
    };
  },
  computed: {
    filteredHerramientas() {
      let filtered = this.herramientas;
      
      // Filtrar por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(h => 
          h.nombre.toLowerCase().includes(query) ||
          h.modelo.toLowerCase().includes(query) ||
          (h.fabricante && h.fabricante.toLowerCase().includes(query)) ||
          (h.codigo_inventario && h.codigo_inventario.toLowerCase().includes(query))
        );
      }
      
      // Filtrar por estado
      if (this.filterEstado) {
        filtered = filtered.filter(h => h.estado_herramienta_id == this.filterEstado);
      }
      
      return filtered;
    }
  },
  created() {
    this.fetchHerramientas();
  },
  methods: {
    async fetchHerramientas() {
      this.loading = true;
      try {
        const response = await axios.get('/api/Herramienta');
        this.herramientas = response.data;
      } catch (error) {
        console.error('Error al obtener herramientas:', error);
        this.$toast.error('No se pudieron cargar las herramientas');
      } finally {
        this.loading = false;
      }
    },
    async submitForm() {
      try {
        // Preparar datos para enviar
        const dataToSend = { ...this.herramienta };
        
        // Convertir especificaciones técnicas si es un string
        if (typeof dataToSend.especificaciones_tecnicas === 'string') {
          try {
            dataToSend.especificaciones_tecnicas = JSON.parse(dataToSend.especificaciones_tecnicas);
          } catch {
            dataToSend.especificaciones_tecnicas = {};
          }
        }
        
        if (this.editing) {
          await axios.put(`/api/Herramienta/${this.currentId}`, dataToSend);
          this.$toast.success('Herramienta actualizada correctamente');
        } else {
          await axios.post('/api/Herramienta', dataToSend);
          this.$toast.success('Herramienta creada correctamente');
        }
        
        this.resetForm();
        this.fetchHerramientas();
      } catch (error) {
        console.error('Error al guardar herramienta:', error);
        this.$toast.error('Error al guardar la herramienta');
      }
    },
    async editHerramienta(id) {
      try {
        const response = await axios.get(`/api/Herramienta/${id}`);
        this.herramienta = response.data;
        
        // Convertir especificaciones técnicas a string si es objeto
        if (this.herramienta.especificaciones_tecnicas && typeof this.herramienta.especificaciones_tecnicas === 'object') {
          this.herramienta.especificaciones_tecnicas = JSON.stringify(this.herramienta.especificaciones_tecnicas, null, 2);
        }
        
        this.editing = true;
        this.currentId = id;
        this.showForm = true;
      } catch (error) {
        console.error('Error al obtener herramienta:', error);
        this.$toast.error('No se pudo cargar la herramienta para editar');
      }
    },
    confirmDelete(id) {
      const herramienta = this.herramientas.find(h => h.id === id);
      this.herramientaToDelete = id;
      this.herramientaToDeleteName = herramienta ? `${herramienta.nombre} - ${herramienta.modelo}` : 'esta herramienta';
      this.showDeleteModal = true;
    },
    async deleteHerramienta() {
      try {
        await axios.delete(`/api/Herramienta/${this.herramientaToDelete}`);
        this.$toast.success('Herramienta eliminada correctamente');
        this.fetchHerramientas();
      } catch (error) {
        console.error('Error al eliminar herramienta:', error);
        this.$toast.error('Error al eliminar la herramienta');
      } finally {
        this.showDeleteModal = false;
        this.herramientaToDelete = null;
        this.herramientaToDeleteName = '';
      }
    },
    resetForm() {
      this.herramienta = {
        nombre: '',
        modelo: '',
        fabricante: '',
        numero_serie: '',
        codigo_inventario: '',
        estado_herramienta_id: 1,
        vida_util_horas: '',
        horas_uso_actual: '',
        fecha_adquisicion: '',
        costo_adquisicion: '',
        valor_actual: '',
        especificaciones_tecnicas: '',
        imagen_ruta: '',
        fecha_ultimo_mantenimiento: '',
        fecha_proximo_mantenimiento: '',
        notas: ''
      };
      this.editing = false;
      this.currentId = null;
    },
    showDetails(herramienta) {
      this.selectedHerramienta = { ...herramienta };
    },
    getEstadoName(id) {
      const estados = {
        1: 'Disponible',
        2: 'En uso',
        3: 'Mantenimiento',
        4: 'Dañado'
      };
      return estados[id] || 'Desconocido';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-ES');
    },
    formatCurrency(value) {
      if (!value) return '0.00';
      return parseFloat(value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },
    formatSpecs(specs) {
      if (!specs) return 'N/A';
      if (typeof specs === 'string') return specs;
      return JSON.stringify(specs, null, 2);
    },
    calcularPorcentajeUso(herramienta) {
      if (!herramienta.vida_util_horas || !herramienta.horas_uso_actual) return 0;
      const porcentaje = (herramienta.horas_uso_actual / herramienta.vida_util_horas) * 100;
      return Math.min(100, Math.round(porcentaje));
    }
  }
};
</script>

<style scoped>
/* Variables de colores */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --dark-color: #34495e;
  --light-color: #ecf0f1;
  --gray-color: #95a5a6;
  --border-color: #ddd;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Estilos base */
.herramientas-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  color: var(--dark-color);
  font-size: 28px;
  margin: 0;
}

.header h1 i {
  margin-right: 10px;
  color: var(--primary-color);
}

/* Formulario */
.form-container {
  margin-bottom: 30px;
  padding: 25px;
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.form-container h2 {
  margin-top: 0;
  color: var(--dark-color);
  font-size: 22px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--dark-color);
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

/* Botones */
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: var(--gray-color);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-edit {
  background-color: var(--warning-color);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.btn-edit:hover {
  background-color: #e67e22;
}

.btn-info {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.btn-info:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: var(--danger-color);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.btn-delete:hover {
  background-color: #c0392b;
}

/* Filtros */
.filters-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-bar i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-color);
}

.search-bar input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 600;
  color: var(--dark-color);
  font-size: 14px;
}

.filter-group select {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

/* Listado de herramientas */
.tools-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.tool-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.tool-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.tool-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin-right: 15px;
  border: 1px solid var(--border-color);
}

.tool-title {
  flex: 1;
}

.tool-title h3 {
  margin: 0;
  color: var(--dark-color);
  font-size: 18px;
}

.tool-model {
  display: block;
  color: var(--gray-color);
  font-size: 14px;
  margin: 5px 0;
}

.tool-status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: var(--light-color);
}

.status-1 {
  background-color: #d5f5e3;
  color: #27ae60;
}

.status-2 {
  background-color: #fdebd0;
  color: #d35400;
}

.status-3 {
  background-color: #fadbd8;
  color: #c0392b;
}

.status-4 {
  background-color: #ebedef;
  color: #7f8c8d;
}

.tool-details {
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-item i {
  width: 20px;
  color: var(--gray-color);
  margin-right: 10px;
  text-align: center;
}

.progress-container {
  padding: 0 15px 15px;
}

.progress-label {
  font-size: 12px;
  color: var(--gray-color);
  margin-bottom: 5px;
}

.progress-bar {
  height: 8px;
  background-color: var(--light-color);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71, #3498db);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.tool-actions {
  display: flex;
  padding: 10px 15px;
  border-top: 1px solid var(--border-color);
  gap: 8px;
}

.tool-actions button {
  flex: 1;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalEnter 0.3s ease;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--dark-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--gray-color);
}

.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-image {
  width: 100%;
  height: 200px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.modal-details {
  flex: 1;
}

.modal-details h4 {
  margin-top: 0;
  color: var(--dark-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-label {
  font-weight: 600;
  color: var(--dark-color);
  min-width: 180px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-modal {
  max-width: 500px;
}

/* Animaciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
}

/* Estado de carga */
.loading {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--gray-color);
  font-size: 16px;
}

.loading i {
  margin-right: 10px;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--gray-color);
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-list {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    flex-direction: column;
  }
  
  .modal-image {
    height: 150px;
    margin-bottom: 20px;
  }
}

@keyframes modalEnter {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>