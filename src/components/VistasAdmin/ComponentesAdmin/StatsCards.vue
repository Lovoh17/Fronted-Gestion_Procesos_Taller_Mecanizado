<template>
    <div class="stats-grid">
      <div 
        v-for="(stat, index) in stats" 
        :key="index" 
        class="stat-card"
        @mouseenter="hoverCard(index)"
        @mouseleave="resetCard(index)"
        :style="{ transform: hoveredCard === index ? 'translateY(-5px)' : 'translateY(0)' }"
      >
        <div class="stat-header">
          <div>
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-change" :class="{ positive: stat.isPositive, negative: !stat.isPositive }">
              <span class="material-icons">
                {{ stat.isPositive ? 'trending_up' : 'trending_down' }}
              </span>
              {{ stat.change }} desde ayer
            </div>
          </div>
          <div class="stat-icon">
            <span class="material-icons">{{ stat.icon }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  
  export default {
    props: {
      stats: {
        type: Array,
        required: true
      }
    },
    setup() {
      const hoveredCard = ref(null)
      
      const hoverCard = (index) => {
        hoveredCard.value = index
      }
      
      const resetCard = () => {
        hoveredCard.value = null
      }
      
      return {
        hoveredCard,
        hoverCard,
        resetCard
      }
    }
  }
  </script>
  
  <style >

</style>