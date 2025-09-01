<template>
    <div class="circular-progress" :style="containerStyle">
      <svg 
        class="progress-ring" 
        :width="size" 
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
      >
        <!-- Fondo del círculo -->
        <circle
          class="progress-ring-bg"
          :stroke="backgroundColor"
          :stroke-width="strokeWidth"
          fill="transparent"
          :r="radius"
          :cx="size / 2"
          :cy="size / 2"
        />
        
        <!-- Barra de progreso -->
        <circle
          class="progress-ring-fill"
          :stroke="progressColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          fill="transparent"
          :r="radius"
          :cx="size / 2"
          :cy="size / 2"
          :stroke-linecap="rounded ? 'round' : 'butt'"
        />
      </svg>
      
      <div class="progress-content" :style="contentStyle">
        <slot>
          <span class="progress-value">{{ displayValue }}</span>
          <span v-if="showPercent" class="percent-symbol">%</span>
        </slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    value: { type: Number, default: 0 }, // Valor entre 0-100
    size: { type: Number, default: 80 },
    strokeWidth: { type: Number, default: 8 },
    backgroundColor: { type: String, default: '#f0f0f0' },
    progressColor: { type: String, default: '#4CAF50' },
    rounded: { type: Boolean, default: true },
    showPercent: { type: Boolean, default: true },
    animate: { type: Boolean, default: true },
    animationDuration: { type: Number, default: 1.5 } // segundos
  })
  
  const radius = computed(() => (props.size / 2) - (props.strokeWidth / 2))
  const circumference = computed(() => 2 * Math.PI * radius.value)
  const dashOffset = computed(() => circumference.value * (1 - (props.value / 100)))
  
  const displayValue = computed(() => Math.round(props.value))
  
  const containerStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    '--animation-duration': `${props.animationDuration}s`
  }))
  
  const contentStyle = computed(() => ({
    'font-size': `${props.size * 0.3}px`,
    'color': props.progressColor
  }))
  </script>
  
  <style >
  .circular-progress {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .progress-ring {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotate(-90deg);
  }
  
  .progress-ring-bg {
    opacity: 0.3;
  }
  
  .progress-ring-fill {
    transition: stroke-dashoffset var(--animation-duration) ease-out;
    transform-origin: 50% 50%;
  }
  
  .progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .progress-value {
    font-weight: bold;
    line-height: 1;
  }
  
  .percent-symbol {
    font-size: 0.6em;
    opacity: 0.7;
    margin-left: 2px;
  }
  </style>