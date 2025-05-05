<template>
    <div class="maintenance-page" :class="{ 'dark-mode': $root.darkMode }">
      <!-- Header y controles -->
      <div class="page-header">
        <h1><span class="material-icons">handyman</span> Gestión de Mantenimientos</h1>
        
        <div class="controls">
          <div class="view-tabs">
            <button :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
              Pendientes ({{ pendingCount }})
            </button>
            <button :class="{ active: activeTab === 'in-progress' }" @click="activeTab = 'in-progress'">
              En Proceso ({{ inProgressCount }})
            </button>
            <button :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">
              Completados ({{ completedCount }})
            </button>
            <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
              Todos
            </button>
          </div>
          
          <div class="actions">
            <button style="background: #2c3e50" class="btn primary" @click="openCreateModal">
              <span class="material-icons">add</span> Nuevo Mantenimiento
            </button>
            <button class="btn secondary" @click="exportToExcel">
              <span class="material-icons">download</span> Exportar
            </button>
          </div>
        </div>
      </div>
  
      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Tipo:</label>
          <select v-model="filters.type" class="filter-select">
            <option value="all">Todos</option>
            <option v-for="type in maintenanceTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Prioridad:</label>
          <select v-model="filters.priority" class="filter-select">
            <option value="all">Todas</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Equipo:</label>
          <select v-model="filters.equipment" class="filter-select">
            <option value="all">Todos</option>
            <option v-for="eq in equipmentList" :key="eq.id" :value="eq.id">
              {{ eq.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Fecha:</label>
          <select v-model="filters.dateRange" class="filter-select">
            <option value="all">Todas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        
        <div class="filter-group" v-if="filters.dateRange === 'custom'">
          <input type="date" v-model="filters.startDate" placeholder="Desde">
          <input type="date" v-model="filters.endDate" placeholder="Hasta">
        </div>
      </div>
  
      <!-- Tarjetas de resumen -->
      <div class="summary-cards">
        <div class="summary-card" @click="setFilter('type', 'preventive')">
          <div class="card-icon">
            <span class="material-icons">medical_services</span>
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.preventive }}</div>
            <div class="card-label">Preventivos</div>
          </div>
        </div>
        
        <div class="summary-card" @click="setFilter('type', 'corrective')">
          <div class="card-icon">
            <span class="material-icons">build_circle</span>
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.corrective }}</div>
            <div class="card-label">Correctivos</div>
          </div>
        </div>
        
        <div class="summary-card" @click="setFilter('type', 'predictive')">
          <div class="card-icon">
            <span class="material-icons">monitor_heart</span>
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.predictive }}</div>
            <div class="card-label">Predictivos</div>
          </div>
        </div>
        
        <div class="summary-card" @click="setFilter('priority', 'high')">
          <div class="card-icon">
            <span class="material-icons">priority_high</span>
          </div>
          <div class="card-content">
            <div class="card-value">{{ stats.highPriority }}</div>
            <div class="card-label">Alta Prioridad</div>
          </div>
        </div>
      </div>
  
      <!-- Listado de mantenimientos -->
      <div class="maintenance-list">
        <div class="list-header">
          <div class="header-item" style="flex: 0.5;">ID</div>
          <div class="header-item" style="flex: 1.5;">Equipo</div>
          <div class="header-item" style="flex: 1;">Tipo</div>
          <div class="header-item" style="flex: 1.5;">Descripción</div>
          <div class="header-item" style="flex: 1;">Prioridad</div>
          <div class="header-item" style="flex: 1;">Estado</div>
          <div class="header-item" style="flex: 1;">Fecha</div>
          <div class="header-item" style="flex: 0.5;">Acciones</div>
        </div>
        
        <div class="list-body">
          <div class="list-item" v-for="item in filteredMaintenance" :key="item.id" :class="item.status">
            <div class="item-cell" style="flex: 0.5;">{{ item.id }}</div>
            <div class="item-cell" style="flex: 1.5;">
              <span class="mobile-label">Equipo:</span>
              <div class="equipment-info">
                <span class="material-icons">{{ getEquipmentIcon(item.equipmentId) }}</span>
                {{ getEquipmentName(item.equipmentId) }}
              </div>
            </div>
            <div class="item-cell" style="flex: 1;">
              <span class="mobile-label">Tipo:</span>
              <span class="type-badge" :class="item.type">{{ getTypeLabel(item.type) }}</span>
            </div>
            <div class="item-cell" style="flex: 1.5;">
              <span class="mobile-label">Descripción:</span>
              <span class="truncate-text">{{ item.description }}</span>
            </div>
            <div class="item-cell" style="flex: 1;">
              <span class="mobile-label">Prioridad:</span>
              <span class="priority-badge" :class="item.priority">{{ getPriorityLabel(item.priority) }}</span>
            </div>
            <div class="item-cell" style="flex: 1;">
              <span class="mobile-label">Estado:</span>
              <span class="status-badge" :class="item.status">{{ getStatusLabel(item.status) }}</span>
            </div>
            <div class="item-cell" style="flex: 1;">
              <span class="mobile-label">Fecha:</span>
              {{ formatDate(item.scheduledDate) }}
            </div>
            <div class="item-cell actions-cell" style="flex: 0.5;">
              <button class="icon-btn" @click="openEditModal(item)">
                <span class="material-icons">edit</span>
              </button>
              <button class="icon-btn" @click="openDetailsModal(item)">
                <span class="material-icons">visibility</span>
              </button>
              <button class="icon-btn" @click="changeStatus(item, 'completed')" v-if="item.status !== 'completed'">
                <span class="material-icons">check_circle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Paginación -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">
          <span class="material-icons">chevron_left</span>
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
  
      <!-- Modal de Crear/Editar -->
      <MaintenanceModal
        v-if="showModal"
        :maintenance="currentMaintenance"
        :mode="modalMode"
        @save="saveMaintenance"
        @close="closeModal"
      />
  
      <!-- Modal de Detalles -->
      <MaintenanceDetailsModal
        v-if="showDetailsModal"
        :maintenance="selectedMaintenance"
        @close="closeDetailsModal"
      />
    </div>
  </template>
  
  <script>
  import MaintenanceModal from '@/components/VistasCoordinador/ComponentesCoordinador/MaintenanceModal.vue';
  import MaintenanceDetailsModal from '@/components/VistasCoordinador/ComponentesCoordinador/MaintenanceDetailsModal.vue';
  
  export default {
    components: {
      MaintenanceModal,
      MaintenanceDetailsModal
    },
    data() {
      return {
        activeTab: 'pending',
        maintenanceList: [
          {
            id: 'MT-2023-001',
            equipmentId: 1,
            type: 'preventive',
            description: 'Mantenimiento preventivo mensual CNC',
            priority: 'high',
            status: 'pending',
            scheduledDate: '2023-06-15',
            completionDate: null,
            assignedTechnician: 1,
            duration: 4,
            checklist: [
              { id: 1, task: 'Lubricación de ejes', completed: false },
              { id: 2, task: 'Revisión de rodamientos', completed: false },
              { id: 3, task: 'Calibración de precisión', completed: false }
            ],
            notes: 'Requiere parada completa de 4 horas',
            partsUsed: [
              { id: 1, name: 'Aceite lubricante', quantity: 2, unit: 'litros' }
            ]
          },
          // Más registros de ejemplo...
        ],
        maintenanceTypes: [
          { value: 'preventive', label: 'Preventivo' },
          { value: 'corrective', label: 'Correctivo' },
          { value: 'predictive', label: 'Predictivo' },
          { value: 'calibration', label: 'Calibración' }
        ],
        equipmentList: [
          { id: 1, name: 'Máquina CNC', type: 'machine', icon: 'precision_manufacturing' },
          { id: 2, name: 'Equipo Soldadura', type: 'equipment', icon: 'handyman' },
          { id: 3, name: 'Horno Industrial', type: 'furnace', icon: 'thermostat' },
          { id: 4, name: 'Compresor de Aire', type: 'equipment', icon: 'air' }
        ],
        technicians: [
          { id: 1, name: 'Juan Pérez', specialization: 'Mecánica' },
          { id: 2, name: 'María Gómez', specialization: 'Electrónica' },
          { id: 3, name: 'Carlos Ruiz', specialization: 'Sistemas' }
        ],
        filters: {
          type: 'all',
          priority: 'all',
          equipment: 'all',
          dateRange: 'all',
          startDate: '',
          endDate: ''
        },
        currentPage: 1,
        itemsPerPage: 10,
        showModal: false,
        showDetailsModal: false,
        modalMode: 'create',
        currentMaintenance: this.getEmptyMaintenance(),
        selectedMaintenance: null
      };
    },
    computed: {
      filteredMaintenance() {
        let filtered = [...this.maintenanceList];
        
        // Filtrar por pestaña activa
        if (this.activeTab !== 'all') {
          filtered = filtered.filter(item => item.status === this.activeTab);
        }
        
        // Aplicar filtros adicionales
        if (this.filters.type !== 'all') {
          filtered = filtered.filter(item => item.type === this.filters.type);
        }
        
        if (this.filters.priority !== 'all') {
          filtered = filtered.filter(item => item.priority === this.filters.priority);
        }
        
        if (this.filters.equipment !== 'all') {
          filtered = filtered.filter(item => item.equipmentId == this.filters.equipment);
        }
        
        if (this.filters.dateRange !== 'all') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          switch (this.filters.dateRange) {
            case 'today':
              filtered = filtered.filter(item => 
                new Date(item.scheduledDate).toDateString() === today.toDateString()
              );
              break;
            case 'week':
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              filtered = filtered.filter(item => {
                const itemDate = new Date(item.scheduledDate);
                return itemDate >= today && itemDate <= weekEnd;
              });
              break;
            case 'month':
              const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              filtered = filtered.filter(item => {
                const itemDate = new Date(item.scheduledDate);
                return itemDate >= today && itemDate <= monthEnd;
              });
              break;
            case 'custom':
              if (this.filters.startDate && this.filters.endDate) {
                filtered = filtered.filter(item => {
                  const itemDate = new Date(item.scheduledDate);
                  const startDate = new Date(this.filters.startDate);
                  const endDate = new Date(this.filters.endDate);
                  return itemDate >= startDate && itemDate <= endDate;
                });
              }
              break;
          }
        }
        
        // Paginación
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return filtered.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.maintenanceList.length / this.itemsPerPage);
      },
      pendingCount() {
        return this.maintenanceList.filter(item => item.status === 'pending').length;
      },
      inProgressCount() {
        return this.maintenanceList.filter(item => item.status === 'in-progress').length;
      },
      completedCount() {
        return this.maintenanceList.filter(item => item.status === 'completed').length;
      },
      stats() {
        return {
          preventive: this.maintenanceList.filter(item => item.type === 'preventive').length,
          corrective: this.maintenanceList.filter(item => item.type === 'corrective').length,
          predictive: this.maintenanceList.filter(item => item.type === 'predictive').length,
          highPriority: this.maintenanceList.filter(item => item.priority === 'high').length
        };
      }
    },
    methods: {
      getEmptyMaintenance() {
        return {
          id: '',
          equipmentId: null,
          type: 'preventive',
          description: '',
          priority: 'medium',
          status: 'pending',
          scheduledDate: new Date().toISOString().split('T')[0],
          completionDate: null,
          assignedTechnician: null,
          duration: 2,
          checklist: [],
          notes: '',
          partsUsed: []
        };
      },
      formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      },
      getEquipmentName(equipmentId) {
        const equipment = this.equipmentList.find(eq => eq.id === equipmentId);
        return equipment ? equipment.name : 'Desconocido';
      },
      getEquipmentIcon(equipmentId) {
        const equipment = this.equipmentList.find(eq => eq.id === equipmentId);
        return equipment ? equipment.icon : 'help_outline';
      },
      getTypeLabel(type) {
        const typeObj = this.maintenanceTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
      },
      getPriorityLabel(priority) {
        switch (priority) {
          case 'high': return 'Alta';
          case 'medium': return 'Media';
          case 'low': return 'Baja';
          default: return priority;
        }
      },
      getStatusLabel(status) {
        switch (status) {
          case 'pending': return 'Pendiente';
          case 'in-progress': return 'En Proceso';
          case 'completed': return 'Completado';
          default: return status;
        }
      },
      setFilter(field, value) {
        this.filters[field] = value;
        this.currentPage = 1;
      },
      prevPage() {
        if (this.currentPage > 1) this.currentPage--;
      },
      nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
      },
      openCreateModal() {
        this.currentMaintenance = this.getEmptyMaintenance();
        this.modalMode = 'create';
        this.showModal = true;
      },
      openEditModal(maintenance) {
        this.currentMaintenance = JSON.parse(JSON.stringify(maintenance));
        this.modalMode = 'edit';
        this.showModal = true;
      },
      openDetailsModal(maintenance) {
        this.selectedMaintenance = JSON.parse(JSON.stringify(maintenance));
        this.showDetailsModal = true;
      },
      closeModal() {
        this.showModal = false;
      },
      closeDetailsModal() {
        this.showDetailsModal = false;
      },
      saveMaintenance(maintenance) {
        if (this.modalMode === 'create') {
          maintenance.id = `MT-${new Date().getFullYear()}-${this.maintenanceList.length + 1}`;
          this.maintenanceList.push(maintenance);
        } else {
          const index = this.maintenanceList.findIndex(m => m.id === maintenance.id);
          if (index !== -1) {
            this.maintenanceList.splice(index, 1, maintenance);
          }
        }
        this.closeModal();
      },
      changeStatus(maintenance, status) {
        const index = this.maintenanceList.findIndex(m => m.id === maintenance.id);
        if (index !== -1) {
          this.maintenanceList[index].status = status;
          if (status === 'completed') {
            this.maintenanceList[index].completionDate = new Date().toISOString().split('T')[0];
          }
        }
      },
      exportToExcel() {
        // Implementar lógica de exportación
        console.log('Exportando a Excel', this.filteredMaintenance);
      }
    }
  };
  </script>
  
  <style scoped>
  .maintenance-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  
  .dark-mode .maintenance-page {
    background-color: #121212;
    color: #fff;
  }
  
  .page-header {
    margin-bottom: 20px;
  }
  
  .page-header h1 {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--primary-color);
    margin-bottom: 15px;
  }
  
  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .view-tabs {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    background-color: #e0e0e0;
  }
  
  .dark-mode .view-tabs {
    background-color: #333;
  }
  
  .view-tabs button {
    padding: 8px 16px;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 500;
    color: #666;
  }
  
  .dark-mode .view-tabs button {
    color: #aaa;
  }
  
  .view-tabs button.active {
    background-color: var(--primary-color);
    color: white;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
  
  .btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
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
  
  .filters-section {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 20px;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .dark-mode .filters-section {
    background-color: #1e1e1e;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .filter-group label {
    font-size: 0.9em;
    font-weight: 500;
    color: #666;
  }
  
  .dark-mode .filter-group label {
    color: #aaa;
  }
  
  .filter-select, .filter-group input[type="date"] {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
    font-size: 0.9em;
  }
  
  .dark-mode .filter-select,
  .dark-mode .filter-group input[type="date"] {
    background-color: #333;
    color: #fff;
    border-color: #555;
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .summary-card {
    background-color: white;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .dark-mode .summary-card {
    background-color: #1e1e1e;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
  
  .summary-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
  
  .card-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-value {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .card-label {
    font-size: 0.9em;
    color: #666;
  }
  
  .dark-mode .card-label {
    color: #aaa;
  }
  
  .maintenance-list {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .dark-mode .maintenance-list {
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .list-header {
    display: flex;
    background-color: #f5f5f5;
    padding: 12px 15px;
    font-weight: 600;
    border-bottom: 1px solid #ddd;
  }
  
  .dark-mode .list-header {
    background-color: #2d2d2d;
    border-bottom-color: #444;
  }
  
  .header-item {
    padding: 0 5px;
  }
  
  .list-body {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .list-item {
    display: flex;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }
  
  .dark-mode .list-item {
    border-bottom-color: #333;
  }
  
  .list-item:hover {
    background-color: #f9f9f9;
  }
  
  .dark-mode .list-item:hover {
    background-color: #2d2d2d;
  }
  
  .list-item.completed {
    opacity: 0.8;
  }
  
  .item-cell {
    padding: 0 5px;
    display: flex;
    align-items: center;
  }
  
  .mobile-label {
    display: none;
    font-weight: 500;
    margin-right: 5px;
    color: #666;
  }
  
  .dark-mode .mobile-label {
    color: #aaa;
  }
  
  .equipment-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .truncate-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
    display: inline-block;
  }
  
  .type-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 500;
  }
  
  .type-badge.preventive {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .dark-mode .type-badge.preventive {
    background-color: #1a3a4a;
    color: #90caf9;
  }
  
  .type-badge.corrective {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .dark-mode .type-badge.corrective {
    background-color: #4a2222;
    color: #ffcdd2;
  }
  
  .type-badge.predictive {
    background-color: #e0f7fa;
    color: #00838f;
  }
  
  .dark-mode .type-badge.predictive {
    background-color: #1a3a3a;
    color: #80deea;
  }
  
  .type-badge.calibration {
    background-color: #fff8e1;
    color: #ff8f00;
  }
  
  .dark-mode .type-badge.calibration {
    background-color: #4a3a1a;
    color: #ffe082;
  }
  
  .priority-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 500;
  }
  
  .priority-badge.high {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .dark-mode .priority-badge.high {
    background-color: #4a2222;
    color: #ffcdd2;
  }
  
  .priority-badge.medium {
    background-color: #fff8e1;
    color: #ff8f00;
  }
  
  .dark-mode .priority-badge.medium {
    background-color: #4a3a1a;
    color: #ffe082;
  }
  
  .priority-badge.low {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .dark-mode .priority-badge.low {
    background-color: #1a3a1a;
    color: #a5d6a7;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: 500;
  }
  
  .status-badge.pending {
    background-color: #e3f2fd;
    color: #1565c0;
  }
  
  .dark-mode .status-badge.pending {
    background-color: #1a3a4a;
    color: #90caf9;
  }
  
  .status-badge.in-progress {
    background-color: #e0f7fa;
    color: #00838f;
  }
  
  .dark-mode .status-badge.in-progress {
    background-color: #1a3a3a;
    color: #80deea;
  }
  
  .status-badge.completed {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .dark-mode .status-badge.completed {
    background-color: #1a3a1a;
    color: #a5d6a7;
  }
  
  .actions-cell {
    display: flex;
    gap: 8px;
  }
  
  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  
  .dark-mode .icon-btn {
    color: #aaa;
  }
  
  .icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: var(--primary-color);
  }
  
  .dark-mode .icon-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
  }
  
  .pagination button {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: var(--primary-color);
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination button:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  .dark-mode .pagination button:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 1024px) {
    .list-header {
      display: none;
    }
    
    .list-item {
      flex-direction: column;
      gap: 10px;
      padding: 15px;
    }
    
    .item-cell {
      width: 100%;
      flex: none !important;
      justify-content: space-between;
    }
    
    .mobile-label {
      display: inline;
    }
    
    .actions-cell {
      justify-content: flex-end;
      margin-top: 10px;
    }
    
    .truncate-text {
      max-width: none;
    }
  }
  
  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
    }
    
    .view-tabs {
      width: 100%;
      overflow-x: auto;
    }
    
    .actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .filters-section {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .filter-group {
      width: 100%;
    }
    
    .filter-select, .filter-group input[type="date"] {
      flex: 1;
    }
    
    .summary-cards {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  @media (max-width: 480px) {
    .summary-cards {
      grid-template-columns: 1fr;
    }
    
    .btn {
      padding: 8px 12px;
      font-size: 14px;
    }
  }
  </style>