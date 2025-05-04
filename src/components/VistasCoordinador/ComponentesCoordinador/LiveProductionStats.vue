<template>
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-cogs"></i>
        </div>
        <div class="stat-content">
          <h3>Eficiencia General (OEE)</h3>
          <div class="stat-value">
            <span class="main-value">{{ overallOEE }}%</span>
            <span class="trend" :class="oeeTrend">
              <i :class="trendIcon"></i> {{ oeeChange }}%
            </span>
          </div>
          <div class="stat-details">
            <span>Disponibilidad: {{ availability }}%</span>
            <span>Rendimiento: {{ performance }}%</span>
            <span>Calidad: {{ quality }}%</span>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="color: #2196F3;">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>Tiempo de Ciclo Promedio</h3>
          <div class="stat-value">
            <span class="main-value">{{ avgCycleTime }} min</span>
            <span class="trend" :class="cycleTrend">
              <i :class="trendIcon"></i> {{ cycleChange }}%
            </span>
          </div>
          <div class="stat-details">
            <span>Meta: {{ targetCycleTime }} min</span>
            <span>Variación: {{ cycleDeviation }}%</span>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="color: #4CAF50;">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>Órdenes Completadas</h3>
          <div class="stat-value">
            <span class="main-value">{{ completedOrders }}</span>
            <span>/ {{ totalOrders }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: completionRate + '%' }"
            ></div>
          </div>
          <div class="stat-details">
            <span>En tiempo: {{ onTimeOrders }} ({{ onTimeRate }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    stats: {
      type: Object,
      default: () => ({
        oee: 76.5,
        oeeChange: 2.3,
        availability: 85.2,
        performance: 89.7,
        quality: 98.1,
        avgCycleTime: 24.7,
        targetCycleTime: 22.0,
        completedOrders: 42,
        totalOrders: 68,
        onTimeOrders: 35
      })
    }
  })
  
  const overallOEE = computed(() => props.stats.oee.toFixed(1))
  const oeeTrend = computed(() => props.stats.oeeChange >= 0 ? 'positive' : 'negative')
  const oeeChange = computed(() => Math.abs(props.stats.oeeChange).toFixed(1))
  const trendIcon = computed(() => oeeTrend.value === 'positive' ? 'fas fa-arrow-up' : 'fas fa-arrow-down')
  
  const completionRate = computed(() => 
  Math.round((props.stats.completedOrders / props.stats.totalOrders) * 100 || 0))
  
  const onTimeRate = computed(() => (
  props.stats.completedOrders > 0 
    ? Math.round((props.stats.onTimeOrders / props.stats.completedOrders) * 100)
    : 0
))

</script>
  
  <style scoped>
  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    display: flex;
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .stat-icon {
    font-size: 2rem;
    color: #FF9800;
    margin-right: 1rem;
    align-self: center;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-value {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  
  .main-value {
    font-size: 1.8rem;
    font-weight: bold;
  }
  
  .trend {
    font-size: 0.9rem;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    
    &.positive {
      background: #E8F5E9;
      color: #2E7D32;
    }
    
    &.negative {
      background: #FFEBEE;
      color: #C62828;
    }
  }
  
  .stat-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    font-size: 0.8rem;
    color: #616161;
    margin-top: 0.5rem;
  }
  
  .progress-bar {
    height: 6px;
    background: #E0E0E0;
    border-radius: 3px;
    margin: 0.5rem 0;
  }
  
  .progress-fill {
    height: 100%;
    background: #4CAF50;
    border-radius: 3px;
    transition: width 0.5s ease;
  }
  </style>