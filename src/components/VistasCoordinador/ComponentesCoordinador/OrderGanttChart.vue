<template>
  <div class="gantt-container">
    <div class="gantt-header">
      <div class="time-scale">
        <div 
          v-for="hour in timeScale" 
          :key="hour"
          class="time-slot"
        >
          {{ hour }}:00
        </div>
      </div>
    </div>
    
    <div class="gantt-body">
      <div 
        v-for="machine in machinesWithOrders" 
        :key="machine.id"
        class="machine-row"
      >
        <div class="machine-name">{{ machine.name }}</div>
        
        <div class="orders-track">
          <div 
            v-for="order in machine.orders" 
            :key="order.id"
            class="order-bar"
            :style="orderStyle(order)"
            @click="emit('order-selected', order)"
          >
            <div class="order-label">
              #{{ order.id }} - {{ order.product }}
            </div>
            <div class="order-progress" :style="progressStyle(order)">
              {{ order.progress }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  orders: { 
    type: Array,
    required: true,
    default: () => [] // Valor por defecto
  },
  machines: { 
    type: Array,
    required: true,
    default: () => [] // Valor por defecto
  },
  startHour: { 
    type: Number, 
    default: 6,
    validator: value => value >= 0 && value <= 24
  },
  endHour: { 
    type: Number, 
    default: 20,
    validator: value => value >= 0 && value <= 24
  }
})

const emit = defineEmits(['order-selected'])

// Corregido: timeScale computada
const timeScale = computed(() => {
  const hours = []
  for (let i = props.startHour; i <= props.endHour; i++) {
    hours.push(i)
  }
  return hours
})

// Versión segura de machinesWithOrders
const machinesWithOrders = computed(() => {
  if (!Array.isArray(props.machines)) return []
  
  return props.machines.map(machine => ({
    ...machine,
    orders: Array.isArray(props.orders) 
      ? props.orders.filter(o => o.machineId === machine.id)
      : []
  }))
})

const orderStyle = (order) => {
  const startPercent = timeToPercent(order.startTime)
  const endPercent = timeToPercent(order.endTime)
  return {
    left: `${startPercent}%`,
    width: `${endPercent - startPercent}%`,
    'background-color': orderColor(order.priority)
  }
}

const progressStyle = (order) => ({
  width: `${order.progress}%`
})

const timeToPercent = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = (hours - props.startHour) * 60 + minutes
  return (totalMinutes / ((props.endHour - props.startHour) * 60)) * 100
}

const orderColor = (priority) => {
  const colors = {
    high: '#FF5722',
    medium: '#FFC107',
    low: '#8BC34A'
  }
  return colors[priority] || '#9E9E9E'
}
</script>

<style scoped>
.gantt-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.gantt-header {
  background: #f5f5f5;
  padding: 0.5rem 0;
}

.time-scale {
  display: flex;
  height: 30px;
}

.time-slot {
  flex: 1;
  text-align: center;
  font-size: 0.8rem;
  color: #616161;
  border-right: 1px dashed #e0e0e0;
}

.gantt-body {
  overflow-y: auto;
  max-height: 400px;
}

.machine-row {
  display: flex;
  height: 50px;
  border-bottom: 1px solid #f0f0f0;
}

.machine-name {
  width: 150px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  font-weight: 500;
  background: #fafafa;
}

.orders-track {
  flex: 1;
  position: relative;
}

.order-bar {
  position: absolute;
  height: 70%;
  top: 15%;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.order-bar:hover {
  transform: scaleY(1.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.order-label {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  white-space: nowrap;
  color: white;
}

.order-progress {
  height: 20%;
  background: rgba(255,255,255,0.3);
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  padding-left: 0.3rem;
}
</style>