<template>
  <div class="gantt-chart-container">
    <!-- Header personalizado -->
    <div class="gantt-header">
      <div class="header-left">
        <div class="gantt-title">
          <i class="fas fa-tasks"></i>
          <h2>{{ title || 'Diagrama de Gantt' }}</h2>
        </div>
        
        <div class="view-selector">
          <button 
            v-for="scale in availableScales" 
            :key="scale.value"
            :class="['view-btn', { active: currentTimeUnit === scale.value }]"
            @click="changeTimeUnit(scale.value)"
          >
            <i :class="scale.icon"></i>
            <span>{{ scale.label }}</span>
          </button>
        </div>
      </div>
      
      <div class="header-controls">
        <div class="navigation-controls">
          <button class="nav-btn" @click="goToPrevious" title="Anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="nav-btn today-btn" @click="goToToday">
            Hoy
          </button>
          <button class="nav-btn" @click="goToNext" title="Siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <!-- Controles adicionales -->
        <div v-if="showControls" class="additional-controls">
          <button v-if="canCreateTasks" class="create-btn" @click="createTask">
            <i class="fas fa-plus"></i>
            <span>Nueva Tarea</span>
          </button>
          
          <div class="filter-controls">
            <select v-if="taskTypes.length > 0" v-model="selectedTaskType" @change="filterTasks">
              <option value="">Todos los tipos</option>
              <option v-for="type in taskTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <div class="zoom-controls">
            <button class="zoom-btn" @click="zoomOut" title="Alejar">
              <i class="fas fa-search-minus"></i>
            </button>
            <button class="zoom-btn" @click="zoomIn" title="Acercar">
              <i class="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Cargando diagrama...</span>
      </div>
    </div>

    <!-- Custom Gantt Chart -->
    <div class="gantt-wrapper">
      <div class="gantt-container">
        <!-- Labels column -->
        <div class="gantt-labels">
          <div class="label-header">Tareas</div>
          <div 
            v-for="row in filteredRows" 
            :key="row.id"
            class="gantt-row-label"
            :style="{ height: rowHeight + 'px' }"
          >
            {{ row.label }}
          </div>
        </div>
        
        <!-- Timeline and content -->
        <div class="gantt-timeline-container" ref="timelineContainer">
          <!-- Timeline header -->
          <div class="gantt-timeline-header">
            <div 
              v-for="(period, index) in timelinePeriods" 
              :key="index"
              class="timeline-period"
              :style="{ width: periodWidth + 'px' }"
            >
              {{ formatTimelinePeriod(period) }}
            </div>
          </div>
          
          <!-- Gantt content -->
          <div class="gantt-content" @click="handleTimelineClick">
            <!-- Grid lines -->
            <div class="gantt-grid">
              <div 
                v-for="(period, index) in timelinePeriods" 
                :key="index"
                class="grid-line"
                :style="{ left: (index * periodWidth) + 'px' }"
              ></div>
            </div>
            
            <!-- Current time line -->
            <div 
              v-if="showCurrentTime && currentTimePosition > 0"
              class="current-time-line"
              :style="{ left: currentTimePosition + 'px' }"
            >
              <div class="current-time-label">Ahora</div>
            </div>
            
            <!-- Gantt rows -->
            <div 
              v-for="(row, rowIndex) in filteredRows" 
              :key="row.id"
              class="gantt-row"
              :style="{ 
                height: rowHeight + 'px',
                top: (rowIndex * rowHeight) + 'px'
              }"
            >
              <!-- Bars for this row -->
              <div 
                v-for="bar in row.bars" 
                :key="bar.id"
                class="gantt-bar"
                :class="[
                  `status-${bar.status || 'default'}`,
                  `type-${bar.type || 'default'}`
                ]"
                :style="getBarStyle(bar)"
                @click="handleBarClick(bar, $event)"
                @mouseenter="handleBarMouseEnter(bar, $event)"
                @mouseleave="handleBarMouseLeave(bar, $event)"
                :title="getBarTooltip(bar)"
              >
                <!-- Progress overlay -->
                <div 
                  v-if="bar.progress !== undefined"
                  class="progress-overlay"
                  :style="{ width: ((bar.progress || 0) * 100) + '%' }"
                ></div>
                
                <!-- Bar content -->
                <div class="bar-content">
                  <div class="bar-title">{{ bar.label }}</div>
                  <div v-if="bar.progress !== undefined" class="bar-progress">
                    {{ Math.round((bar.progress || 0) * 100) }}%
                  </div>
                </div>
                
                <!-- Resize handles -->
                <div 
                  v-if="canEditTasks"
                  class="resize-handle left"
                  @mousedown="startResize(bar, 'left', $event)"
                ></div>
                <div 
                  v-if="canEditTasks"
                  class="resize-handle right"
                  @mousedown="startResize(bar, 'right', $event)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task details modal -->
    <div v-if="showTaskModal" class="task-modal-overlay" @click.self="closeTaskModal">
      <div class="task-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-info-circle"></i>
            Detalles de la Tarea
          </h3>
          <button class="close-btn" @click="closeTaskModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedTask" class="task-details">
            <div class="detail-item">
              <label>Título:</label>
              <span>{{ selectedTask.label }}</span>
            </div>
            
            <div class="detail-item">
              <label>Fecha de Inicio:</label>
              <span>{{ formatDate(selectedTask.start) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Fecha de Fin:</label>
              <span>{{ formatDate(selectedTask.end) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Duración:</label>
              <span>{{ calculateDuration(selectedTask.start, selectedTask.end) }} días</span>
            </div>
            
            <div v-if="selectedTask.progress !== undefined" class="detail-item">
              <label>Progreso:</label>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: ((selectedTask.progress || 0) * 100) + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ Math.round((selectedTask.progress || 0) * 100) }}%</span>
              </div>
            </div>
            
            <div v-if="selectedTask.status" class="detail-item">
              <label>Estado:</label>
              <span class="status-badge" :class="`status-${selectedTask.status}`">
                {{ getStatusLabel(selectedTask.status) }}
              </span>
            </div>
            
            <div v-if="selectedTask.assignee" class="detail-item">
              <label>Asignado a:</label>
              <span>{{ selectedTask.assignee }}</span>
            </div>
            
            <div v-if="selectedTask.description" class="detail-item">
              <label>Descripción:</label>
              <p>{{ selectedTask.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="canEditTasks" class="edit-btn" @click="editTask(selectedTask)">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button v-if="canDeleteTasks" class="delete-btn" @click="deleteTask(selectedTask)">
            <i class="fas fa-trash"></i>
            Eliminar
          </button>
          <button class="cancel-btn" @click="closeTaskModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./scripts/GanttChartComponent.js"></script>
<style src="src/assets/Componentes_Style/GanttChartComponent.css"></style>
