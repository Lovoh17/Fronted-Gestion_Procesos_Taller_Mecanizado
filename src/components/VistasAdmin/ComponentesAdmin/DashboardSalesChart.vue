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
.card {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
  transition: var(--transition);
  border: 1px solid var(--gray-lighter);
}

.card:hover {
  box-shadow: var(--shadow-dark);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-dark);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--gray-lighter);
  background-color: white;
  color: var(--gray-dark);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2rem;
}

select:focus {
  outline: none;
  border-color: var(--industrial-red);
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  padding: 0.5rem 1rem 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .card-actions {
    width: 100%;
  }
  
  select {
    width: 100%;
  }
  
  .chart-container {
    height: 250px;
    padding: 0.25rem 0.75rem 1rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .card {
    background: var(--gray-dark);
    border-color: var(--univo-primary-light);
  }
  
  .card-title {
    color: var(--gray-light);
  }
  
  select {
    background-color: var(--univo-primary-light);
    color: var(--gray-light);
    border-color: var(--univo-primary-light);
  }
  
  .card-header {
    border-bottom-color: var(--univo-primary-light);
  }
}
</style>