<template>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Ventas Mensuales</h2>
        <div class="card-actions">
          <select v-model="localRange" @change="handleRangeChange">
            <option value="monthly">Mensual</option>
            <option value="weekly">Semanal</option>
            <option value="daily">Diario</option>
          </select>
        </div>
      </div>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, watch, onMounted } from 'vue'
  import { Chart } from 'chart.js'
  
  export default {
    props: {
      range: {
        type: String,
        default: 'monthly'
      }
    },
    emits: ['range-change'],
    setup(props, { emit }) {
      const chartCanvas = ref(null)
      const localRange = ref(props.range)
      let chartInstance = null
      
      const createChart = () => {
        if (chartInstance) {
          chartInstance.destroy()
        }
        
        const ctx = chartCanvas.value.getContext('2d')
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: getChartData(),
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        })
      }
      
      const getChartData = () => {
        // Datos de ejemplo según el rango seleccionado
        if (localRange.value === 'weekly') {
          return {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
              label: 'Ventas Semanales',
              data: [4500, 6200, 5800, 7100],
              borderColor: '#c62828',
              backgroundColor: 'rgba(198, 40, 40, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          }
        } else if (localRange.value === 'daily') {
          return {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
              label: 'Ventas Diarias',
              data: [1200, 1900, 1700, 2100, 2400, 1800, 1500],
              borderColor: '#c62828',
              backgroundColor: 'rgba(198, 40, 40, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          }
        } else {
          return {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
              label: 'Ventas Mensuales',
              data: [12500, 19000, 15000, 18000, 21000, 24780],
              borderColor: '#c62828',
              backgroundColor: 'rgba(198, 40, 40, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          }
        }
      }
      
      const handleRangeChange = () => {
        emit('range-change', localRange.value)
        createChart()
      }
      
      onMounted(() => {
        createChart()
      })
      
      watch(() => props.range, (newVal) => {
        localRange.value = newVal
        createChart()
      })
      
      return {
        chartCanvas,
        localRange,
        handleRangeChange
      }
    }
  }
  </script>
  
  <style scoped>

</style>