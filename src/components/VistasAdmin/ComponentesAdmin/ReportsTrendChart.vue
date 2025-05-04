<template>
    <div class="trend-chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from 'chart.js'
  Chart.register(...registerables)
  
  export default {
    name: 'ReportsTrendChart',
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chart: null
      }
    },
    mounted() {
      this.renderChart()
    },
    watch: {
      data: {
        deep: true,
        handler() {
          if (this.chart) {
            this.chart.data = this.data
            this.chart.update()
          } else {
            this.renderChart()
          }
        }
      }
    },
    methods: {
      renderChart() {
        if (this.chart) {
          this.chart.destroy()
        }
        
        const ctx = this.$refs.chartCanvas.getContext('2d')
        this.chart = new Chart(ctx, {
          type: 'line',
          data: this.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            }
          }
        })
      }
    },
    beforeUnmount() {
      if (this.chart) {
        this.chart.destroy()
      }
    }
  }
  </script>
  
  <style scoped>
  .trend-chart-container {
    position: relative;
    height: 300px;
    width: 100%;
  }
  </style>