<template>
    <div class="machine-grid">
      <div 
        v-for="machine in machines" 
        :key="machine.id"
        class="machine-card"
        :class="{
          [machine.status]: true,
          'unavailable': machine.maintenance
        }"
        @click="showMachineDetails(machine)"
      >
        <div class="machine-header">
          <i class="fas" :class="machineIcon(machine.type)"></i>
          <h3>{{ machine.name }}</h3>
          <span class="status-badge">{{ machine.statusLabel }}</span>
        </div>
        
        <div class="machine-metrics">
          <div class="metric">
            <span class="label">OEE</span>
            <CircularProgress 
              :value="machine.oee"
              :color="getOeeColor(machine.oee)"
            />
          </div>
          
          <div class="metric">
            <span class="label">Uso</span>
            <span class="value">{{ machine.utilization }}%</span>
          </div>
        </div>
        
        <div v-if="machine.alert" class="machine-alert">
          <i class="fas fa-exclamation-triangle"></i>
          {{ machine.alert }}
        </div>
      </div>
      
      <MachineDetailModal 
        v-if="selectedMachine"
        :machine="selectedMachine"
        @close="selectedMachine = null"
        @start-maintenance="openMaintenanceForm"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import CircularProgress from '@/components/UI/CircularProgress.vue'
  
  const props = defineProps({
    machines: { type: Array, required: true }
  })
  
  const selectedMachine = ref(null)
  
  const machineIcon = (type) => {
    const icons = {
      cnc: 'fa-cog',
      lathe: 'fa-compact-disc',
      welder: 'fa-bolt',
      press: 'fa-hammer'
    }
    return icons[type] || 'fa-cog'
  }
  
  const getOeeColor = (oee) => {
    if (oee > 85) return '#4CAF50'
    if (oee > 60) return '#FFC107'
    return '#F44336'
  }
  
  const showMachineDetails = (machine) => {
    selectedMachine.value = machine
  }
  </script>
  
  <style >
  .machine-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  .machine-card {
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    &.idle { border-left: 4px solid #9E9E9E; }
    &.running { border-left: 4px solid #4CAF50; }
    &.error { border-left: 4px solid #F44336; }
    &.unavailable { opacity: 0.6; background: #f5f5f5; }
  }
  
  .machine-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    i { font-size: 1.2rem; }
  }
  
  .status-badge {
    margin-left: auto;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    background: #e0e0e0;
  }
  
  .machine-metrics {
    display: flex;
    justify-content: space-around;
    margin: 1rem 0;
  }
  
  .metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .label {
      font-size: 0.8rem;
      color: #757575;
    }
    
    .value {
      font-weight: bold;
      margin-top: 0.3rem;
    }
  }
  
  .machine-alert {
    padding: 0.5rem;
    background: #FFF3E0;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #E65100;
  }
  </style>