<template>
    <div class="planning-page" :class="{ 'dark-mode': $root.darkMode }">
      <div class="header">
        <h1><span class="material-icons">schedule</span> Planificación de Producción</h1>
        <div class="controls">
          <button class="btn primary" @click="openCreateModal">
            <span class="material-icons">add</span> Nueva Tarea
          </button>
          <div class="date-navigation">
            <button @click="previousWeek" class="icon-btn">
              <span class="material-icons">chevron_left</span>
            </button>
            <h2>{{ currentWeekRange }}</h2>
            <button @click="nextWeek" class="icon-btn">
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
          <div class="view-options">
            <button @click="viewMode = 'week'" :class="{ active: viewMode === 'week' }">
              Semana
            </button>
            <button @click="viewMode = 'day'" :class="{ active: viewMode === 'day' }">
              Día
            </button>
          </div>
        </div>
      </div>
  
      <!-- Vista Semanal -->
      <div class="week-view" v-if="viewMode === 'week'">
        <div class="calendar-header">
          <div class="resource-header">Recursos</div>
          <div class="day-header" v-for="day in weekDays" :key="day.date">
            <div>{{ day.name }}</div>
            <div>{{ day.date }}</div>
          </div>
        </div>
  
        <div class="calendar-body">
          <div class="resource-row" v-for="resource in resources" :key="resource.id">
            <div class="resource-cell">
              <div class="resource-info">
                <span class="resource-icon material-icons">{{ resource.icon }}</span>
                {{ resource.name }}
              </div>
              <div class="resource-details">
                Cap: {{ resource.capacity }} {{ resource.unit }}
              </div>
            </div>
            <div 
              class="day-cell" 
              v-for="day in weekDays" 
              :key="day.date"
              @drop="onDrop($event, day.date, resource.id)"
              @dragover.prevent
              @dragenter.prevent
            >
              <div 
                class="task-item" 
                v-for="task in getTasksForDayAndResource(day.date, resource.id)"
                :key="task.id"
                :style="{ backgroundColor: task.color }"
                draggable="true"
                @dragstart="onDragStart($event, task)"
              >
                <div class="task-header">
                  <span class="task-title">{{ task.title }}</span>
                  <span class="material-icons task-actions" @click.stop="openEditModal(task)">edit</span>
                </div>
                <div class="task-details">
                  <span class="material-icons">schedule</span>
                  {{ task.startTime }} - {{ task.endTime }}
                </div>
                <div class="task-details">
                  <span class="material-icons">work</span>
                  {{ task.quantity }} {{ resource.unit }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Vista Diaria -->
      <div class="day-view" v-if="viewMode === 'day'">
        <div class="timeline">
          <div class="time-slot" v-for="hour in hours" :key="hour">
            <div class="time-label">{{ hour }}:00</div>
            <div class="time-line"></div>
          </div>
        </div>
        <div class="day-resources">
          <div class="resource-column" v-for="resource in resources" :key="resource.id">
            <div class="resource-header">
              <span class="material-icons">{{ resource.icon }}</span>
              {{ resource.name }}
            </div>
            <div 
              class="time-block" 
              v-for="hour in hours" 
              :key="hour"
              @click="openCreateModalForTime(resource.id, currentDate, hour)"
            >
              <div 
                class="task-block" 
                v-for="task in getTasksForHourAndResource(hour, resource.id)"
                :key="task.id"
                :style="{
                  backgroundColor: task.color,
                  height: calculateTaskHeight(task) + 'px'
                }"
              >
                {{ task.title }} ({{ task.quantity }} {{ resource.unit }})
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modal de Tarea -->
      <div class="modal" v-if="showTaskModal">
        <div class="modal-content">
          <span class="close-btn material-icons" @click="closeModal">close</span>
          <h2>{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
          
          <div class="form-group">
            <label>Título</label>
            <input type="text" v-model="currentTask.title" placeholder="Nombre de la tarea">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Fecha</label>
              <input type="date" v-model="currentTask.date">
            </div>
            <div class="form-group">
              <label>Hora inicio</label>
              <select v-model="currentTask.startTime">
                <option v-for="hour in hours" :value="hour + ':00'">{{ hour }}:00</option>
                <option v-for="hour in hours" :value="hour + ':30'">{{ hour }}:30</option>
              </select>
            </div>
            <div class="form-group">
              <label>Hora fin</label>
              <select v-model="currentTask.endTime">
                <option v-for="hour in hours" :value="hour + ':00'">{{ hour }}:00</option>
                <option v-for="hour in hours" :value="hour + ':30'">{{ hour }}:30</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Recurso</label>
              <select v-model="currentTask.resourceId">
                <option v-for="resource in resources" :value="resource.id">
                  {{ resource.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Cantidad</label>
              <input type="number" v-model="currentTask.quantity" :max="getResourceCapacity(currentTask.resourceId)">
            </div>
          </div>
          
          <div class="form-group">
            <label>Prioridad</label>
            <select v-model="currentTask.priority">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="currentTask.notes" rows="3"></textarea>
          </div>
          
          <div class="form-actions">
            <button class="btn secondary" @click="closeModal">Cancelar</button>
            <button class="btn primary" @click="saveTask">
              {{ editingTask ? 'Actualizar' : 'Guardar' }}
            </button>
            <button 
              class="btn danger" 
              @click="deleteTask" 
              v-if="editingTask"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
  
      <!-- Resumen de Capacidad -->
      <div class="capacity-summary">
        <h3>Resumen de Capacidad</h3>
        <div class="summary-grid">
          <div class="summary-header">Recurso</div>
          <div class="summary-header">Capacidad Total</div>
          <div class="summary-header">Asignado</div>
          <div class="summary-header">Disponible</div>
          
          <template v-for="resource in resources" :key="resource.id">
            <div class="summary-item">{{ resource.name }}</div>
            <div class="summary-item">{{ resource.capacity }} {{ resource.unit }}</div>
            <div class="summary-item" :class="{ 'over-capacity': getAssignedQuantity(resource.id) > resource.capacity }">
              {{ getAssignedQuantity(resource.id) }} {{ resource.unit }}
            </div>
            <div class="summary-item">
              {{ Math.max(0, resource.capacity - getAssignedQuantity(resource.id)) }} {{ resource.unit }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        viewMode: 'week',
        currentDate: new Date(),
        hours: Array.from({ length: 12 }, (_, i) => i + 7), // 7am to 6pm
        resources: [
          { id: 1, name: 'Máquina CNC', icon: 'precision_manufacturing', capacity: 40, unit: 'horas' },
          { id: 2, name: 'Equipo Soldadura', icon: 'handyman', capacity: 35, unit: 'horas' },
          { id: 3, name: 'Pintura', icon: 'format_paint', capacity: 30, unit: 'horas' },
          { id: 4, name: 'Montaje', icon: 'build', capacity: 45, unit: 'horas' },
          { id: 5, name: 'Operario 1', icon: 'engineering', capacity: 40, unit: 'horas' },
          { id: 6, name: 'Operario 2', icon: 'engineering', capacity: 40, unit: 'horas' }
        ],
        tasks: [
          {
            id: 1,
            title: 'Fabricación piezas A',
            date: this.formatDate(new Date()),
            startTime: '8:00',
            endTime: '12:00',
            resourceId: 1,
            quantity: 4,
            priority: 'high',
            notes: 'Usar molde #123',
            color: '#4CAF50'
          },
          {
            id: 2,
            title: 'Ensamblaje B',
            date: this.formatDate(new Date()),
            startTime: '9:00',
            endTime: '11:30',
            resourceId: 4,
            quantity: 2.5,
            priority: 'medium',
            notes: 'Verificar componentes primero',
            color: '#2196F3'
          }
        ],
        showTaskModal: false,
        editingTask: false,
        currentTask: this.getEmptyTask(),
        nextTaskId: 3
      }
    },
    computed: {
      weekDays() {
        const days = [];
        const current = new Date(this.currentDate);
        current.setDate(current.getDate() - current.getDay() + 1); // Start on Monday
        
        for (let i = 0; i < 7; i++) {
          const day = new Date(current);
          day.setDate(current.getDate() + i);
          days.push({
            name: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
            date: this.formatDate(day, false)
          });
        }
        return days;
      },
      currentWeekRange() {
        const start = new Date(this.currentDate);
        start.setDate(start.getDate() - start.getDay() + 1);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        return `${this.formatDate(start, false)} - ${this.formatDate(end, false)}`;
      }
    },
    methods: {
      formatDate(date, includeYear = true) {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        return includeYear ? `${year}-${month}-${day}` : `${day}/${month}`;
      },
      previousWeek() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - 7);
        this.currentDate = newDate;
      },
      nextWeek() {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + 7);
        this.currentDate = newDate;
      },
      getEmptyTask() {
        return {
          id: null,
          title: '',
          date: this.formatDate(new Date()),
          startTime: '8:00',
          endTime: '9:00',
          resourceId: 1,
          quantity: 1,
          priority: 'medium',
          notes: '',
          color: this.getRandomColor()
        };
      },
      getRandomColor() {
        const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#607D8B', '#E91E63'];
        return colors[Math.floor(Math.random() * colors.length)];
      },
      getTasksForDayAndResource(date, resourceId) {
        return this.tasks.filter(task => 
          task.date === date && task.resourceId === resourceId
        );
      },
      getTasksForHourAndResource(hour, resourceId) {
        const targetTime = hour + ':00';
        return this.tasks.filter(task => {
          return task.resourceId === resourceId && 
                 task.date === this.formatDate(this.currentDate) &&
                 task.startTime <= targetTime && 
                 task.endTime >= targetTime;
        });
      },
      calculateTaskHeight(task) {
        const start = parseInt(task.startTime.split(':')[0]);
        const end = parseInt(task.endTime.split(':')[0]);
        return (end - start) * 40; // 40px per hour
      },
      getResourceCapacity(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        return resource ? resource.capacity : 0;
      },
      getAssignedQuantity(resourceId) {
        const resourceTasks = this.tasks.filter(task => task.resourceId === resourceId);
        return resourceTasks.reduce((sum, task) => sum + task.quantity, 0);
      },
      openCreateModal() {
        this.currentTask = this.getEmptyTask();
        this.editingTask = false;
        this.showTaskModal = true;
      },
      openCreateModalForTime(resourceId, date, hour) {
        this.currentTask = this.getEmptyTask();
        this.currentTask.resourceId = resourceId;
        this.currentTask.date = this.formatDate(date);
        this.currentTask.startTime = hour + ':00';
        this.currentTask.endTime = (hour + 1) + ':00';
        this.editingTask = false;
        this.showTaskModal = true;
      },
      openEditModal(task) {
        this.currentTask = { ...task };
        this.editingTask = true;
        this.showTaskModal = true;
      },
      closeModal() {
        this.showTaskModal = false;
      },
      saveTask() {
        if (this.editingTask) {
          const index = this.tasks.findIndex(t => t.id === this.currentTask.id);
          this.tasks.splice(index, 1, this.currentTask);
        } else {
          this.currentTask.id = this.nextTaskId++;
          this.tasks.push(this.currentTask);
        }
        this.closeModal();
      },
      deleteTask() {
        this.tasks = this.tasks.filter(t => t.id !== this.currentTask.id);
        this.closeModal();
      },
      onDragStart(event, task) {
        event.dataTransfer.setData('taskId', task.id);
      },
      onDrop(event, date, resourceId) {
        const taskId = event.dataTransfer.getData('taskId');
        const task = this.tasks.find(t => t.id === parseInt(taskId));
        if (task) {
          task.date = date;
          task.resourceId = resourceId;
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .planning-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  
  .dark-mode .planning-page {
    background-color: #121212;
    color: #ffffff;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .header h1 {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--primary-color);
  }
  
  .controls {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .date-navigation {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .date-navigation h2 {
    margin: 0;
    min-width: 180px;
    text-align: center;
  }
  
  .view-options {
    display: flex;
    border-radius: 5px;
    overflow: hidden;
  }
  
  .view-options button {
    padding: 8px 16px;
    border: none;
    background-color: #e0e0e0;
    cursor: pointer;
  }
  
  .dark-mode .view-options button {
    background-color: #333;
    color: #fff;
  }
  
  .view-options button.active {
    background-color: var(--primary-color);
    color: white;
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
  
  .btn.danger {
    background-color: #f44336;
    color: white;
  }
  
  .btn.danger:hover {
    background-color: #d32f2f;
  }
  
  .icon-btn {
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
  
  .icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  .dark-mode .icon-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  /* Estilos para la vista semanal */
  .week-view {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 30px;
  }
  
  .dark-mode .week-view {
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .calendar-header {
    display: grid;
    grid-template-columns: 200px repeat(7, 1fr);
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
  }
  
  .dark-mode .calendar-header {
    background-color: #2d2d2d;
  }
  
  .resource-header {
    padding: 15px;
    border-right: 1px solid #ddd;
  }
  
  .dark-mode .resource-header {
    border-right-color: #444;
  }
  
  .day-header {
    padding: 10px;
    border-right: 1px solid #ddd;
  }
  
  .dark-mode .day-header {
    border-right-color: #444;
  }
  
  .day-header:last-child {
    border-right: none;
  }
  
  .calendar-body {
    display: grid;
    grid-template-rows: repeat(auto-fill, minmax(100px, auto));
  }
  
  .resource-row {
    display: grid;
    grid-template-columns: 200px repeat(7, 1fr);
    min-height: 100px;
    border-bottom: 1px solid #eee;
  }
  
  .dark-mode .resource-row {
    border-bottom-color: #333;
  }
  
  .resource-row:last-child {
    border-bottom: none;
  }
  
  .resource-cell {
    padding: 10px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .dark-mode .resource-cell {
    border-right-color: #333;
  }
  
  .resource-info {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .resource-icon {
    color: var(--primary-color);
  }
  
  .resource-details {
    font-size: 0.8em;
    color: #666;
  }
  
  .dark-mode .resource-details {
    color: #aaa;
  }
  
  .day-cell {
    padding: 5px;
    border-right: 1px solid #eee;
    min-height: 100px;
    background-color: rgba(0, 0, 0, 0.01);
  }
  
  .dark-mode .day-cell {
    border-right-color: #333;
    background-color: rgba(255, 255, 255, 0.01);
  }
  
  .day-cell:last-child {
    border-right: none;
  }
  
  .task-item {
    padding: 8px;
    margin-bottom: 5px;
    border-radius: 4px;
    color: white;
    font-size: 0.9em;
    cursor: move;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }
  
  .task-title {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .task-actions {
    cursor: pointer;
    opacity: 0.7;
    font-size: 16px;
  }
  
  .task-actions:hover {
    opacity: 1;
  }
  
  .task-details {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.8em;
    margin-top: 3px;
  }
  
  /* Estilos para la vista diaria */
  .day-view {
    display: flex;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 30px;
  }
  
  .dark-mode .day-view {
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .timeline {
    width: 60px;
    background-color: #f5f5f5;
  }
  
  .dark-mode .timeline {
    background-color: #2d2d2d;
  }
  
  .time-slot {
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #ddd;
  }
  
  .dark-mode .time-slot {
    border-bottom-color: #444;
  }
  
  .time-label {
    font-size: 0.8em;
    text-align: center;
    padding: 2px;
  }
  
  .time-line {
    border-top: 1px solid #ddd;
    margin: 0 5px;
  }
  
  .dark-mode .time-line {
    border-top-color: #444;
  }
  
  .day-resources {
    flex: 1;
    display: flex;
    overflow-x: auto;
  }
  
  .resource-column {
    flex: 1;
    min-width: 150px;
  }
  
  .resource-header {
    padding: 10px;
    text-align: center;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .dark-mode .resource-header {
    border-bottom-color: #444;
    border-right-color: #444;
  }
  
  .time-block {
    height: 40px;
    border-bottom: 1px solid #eee;
    border-right: 1px solid #eee;
    position: relative;
    cursor: pointer;
  }
  
  .dark-mode .time-block {
    border-bottom-color: #333;
    border-right-color: #333;
  }
  
  .time-block:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .dark-mode .time-block:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .task-block {
    position: absolute;
    width: 100%;
    padding: 5px;
    color: white;
    font-size: 0.8em;
    border-radius: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  /* Estilos del modal */
  .modal {
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
    padding: 25px;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }
  
  .dark-mode .modal-content {
    background-color: #1e1e1e;
    color: #fff;
  }
  
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    font-size: 24px;
    color: #666;
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
  
  .modal h2 {
    margin-top: 0;
    color: var(--primary-color);
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-row {
    display: flex;
    gap: 15px;
  }
  
  .form-row .form-group {
    flex: 1;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
  }
  
  .dark-mode input, 
  .dark-mode select, 
  .dark-mode textarea {
    background-color: #333;
    color: #fff;
    border-color: #555;
  }
  
  textarea {
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  /* Resumen de capacidad */
  .capacity-summary {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .dark-mode .capacity-summary {
    background-color: #1e1e1e;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  .capacity-summary h3 {
    margin-top: 0;
    color: var(--primary-color);
    margin-bottom: 15px;
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background-color: #eee;
  }
  
  .dark-mode .summary-grid {
    background-color: #444;
  }
  
  .summary-header {
    background-color: #f5f5f5;
    padding: 10px;
    font-weight: bold;
    text-align: center;
  }
  
  .dark-mode .summary-header {
    background-color: #2d2d2d;
  }
  
  .summary-item {
    background-color: white;
    padding: 8px 10px;
    text-align: center;
  }
  
  .dark-mode .summary-item {
    background-color: #1e1e1e;
  }
  
  .over-capacity {
    color: #f44336;
    font-weight: bold;
  }
  
  /* Responsive */
  @media (max-width: 1200px) {
    .week-view {
      overflow-x: auto;
    }
    
    .calendar-header, .resource-row {
      min-width: 1000px;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .controls {
      width: 100%;
      justify-content: space-between;
    }
    
    .form-row {
      flex-direction: column;
      gap: 0;
    }
    
    .summary-grid {
      grid-template-columns: 1.5fr repeat(3, 1fr);
      font-size: 0.9em;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
      padding: 20px 15px;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .btn {
      justify-content: center;
    }
  }
  </style>