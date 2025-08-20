<template>
  <div class="admin-container">
    <!-- Header con gradiente -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Recursos Humanos</h1>
            <p class="header-subtitle">Gestiona el personal y recursos humanos del taller</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" icon="person_add">
            Nuevo Empleado
          </va-button>
        </div>
      </div>
    </div>

          <!-- Resumen de métricas -->
      <div v-if="!loading" class="metrics-summary">
        <!-- Métricas de RRHH -->
        <div class="metric-card">
          <div class="metric-icon rrhh">
            <i class="fas fa-users"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ totalOperarios }}</span>
            <span class="metric-label">Total Operarios</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon available">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ operariosActivos }}</span>
            <span class="metric-label">Operarios Activos</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon capacity">
            <i class="fas fa-clock"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ capacidadTotalHoras }}</span>
            <span class="metric-label">Horas/Semana Total</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon supervisors">
            <i class="fas fa-user-tie"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ operariosSupervisores }}</span>
            <span class="metric-label">Supervisores</span>
          </div>
        </div>

        <!-- Métricas de Pedidos (si existen) -->
        <div v-if="pedidos.length > 0" class="metric-card">
          <div class="metric-icon pedidos">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ totalPedidos }}</span>
            <span class="metric-label">Total Pedidos</span>
          </div>
        </div>

        <div v-if="pedidos.length > 0" class="metric-card">
          <div class="metric-icon success">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ pedidosCompletados }}</span>
            <span class="metric-label">Completados</span>
          </div>
        </div>

        <div v-if="pedidos.length > 0" class="metric-card">
          <div class="metric-icon warning">
            <i class="fas fa-clock"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ pedidosEnProceso }}</span>
            <span class="metric-label">En Proceso</span>
          </div>
        </div>

        <div v-if="pedidos.length > 0" class="metric-card">
          <div class="metric-icon danger">
            <i class="fas fa-exclamation"></i>
          </div>
          <div class="metric-info">
            <span class="metric-value">{{ pedidosAlta }}</span>
            <span class="metric-label">Prioridad Alta</span>
          </div>
        </div>
      </div>
    <!-- Sección de Gráficos -->
    <div class="charts-main-section">
      

      <!-- Loading state -->
      <div v-if="loading" class="chart-loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div v-if="!loading" class="charts-grid">
        <!-- Gráfico de Capacidad de Operarios -->
        <div class="chart-card chart-full-width">
          <div class="card-header">
            <h4 class="card-title">
              <i class="fas fa-users-cog"></i>
              Capacidad de Operarios por Puesto
            </h4>
            <div class="chart-actions">
              <va-badge 
                :text="`Total: ${totalOperarios} operarios`" 
                color="primary"
              />
            </div>
          </div>
          <div class="chart-wrapper chart-large">
            <canvas ref="capacidadCanvas" width="800" height="400"></canvas>
          </div>
        </div>

        <!-- Gráfico de Estados de Pedidos -->
        <div class="chart-card" v-if="pedidos.length > 0">
          <div class="card-header">
            <h4 class="card-title">
              <i class="fas fa-tasks"></i>
              Pedidos por Estado
            </h4>
          </div>
          <div class="chart-wrapper">
            <canvas ref="estadosCanvas" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Gráfico de Prioridades -->
        <div class="chart-card" v-if="pedidos.length > 0">
          <div class="card-header">
            <h4 class="card-title">
              <i class="fas fa-exclamation-triangle"></i>
              Pedidos por Prioridad
            </h4>
          </div>
          <div class="chart-wrapper">
            <canvas ref="prioridadesCanvas" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Gráfico de Disponibilidad por Tipo de Contrato -->
        <div class="chart-card">
          <div class="card-header">
            <h4 class="card-title">
              <i class="fas fa-handshake"></i>
              Tipo de Contrato
            </h4>
          </div>
          <div class="chart-wrapper">
            <canvas ref="contratoCanvas" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Gráfico de Timeline de Pedidos -->
        <div class="chart-card chart-full-width" v-if="pedidos.length > 0">
          <div class="card-header">
            <h4 class="card-title">
              <i class="fas fa-calendar-alt"></i>
              Pedidos por Mes
            </h4>
          </div>
          <div class="chart-wrapper">
            <canvas ref="timelineCanvas" width="800" height="300"></canvas>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="!loading && pedidos.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h4 class="empty-title">Sin datos de pedidos disponibles</h4>
        <p class="empty-description">No hay pedidos registrados para mostrar estadísticas, pero puedes ver la información de recursos humanos</p>
      </div>


    </div>

  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { pedidoService } from '@/services/pedidoService.js';
import api from '@/api.js';

Chart.register(...registerables);

export default {
  name: 'RRHH',
  data() {
    return {
      pedidos: [],
      usuarios: [],
      puestos: [],
      loading: false,
      charts: {
        estados: null,
        prioridades: null,
        timeline: null,
        capacidad: null,
        contrato: null
      }
    };
  },
  computed: {
    // Métricas de RRHH
    totalOperarios() {
      return this.usuarios.length;
    },
    operariosActivos() {
      return this.usuarios.filter(u => u.estado_id === 1).length;
    },
    capacidadTotalHoras() {
      return this.usuarios
        .filter(u => u.estado_id === 1)
        .reduce((total, u) => total + (u.capacidad_horas_semana || 0), 0);
    },
    operariosSupervisores() {
      const puestosSupervisores = this.puestos.filter(p => p.es_supervisor).map(p => p.id.toString());
      return this.usuarios.filter(u => puestosSupervisores.includes(u.puesto_id)).length;
    },
    
    // Métricas de Pedidos (existentes)
    totalPedidos() {
      return this.pedidos.length;
    },
    pedidosCompletados() {
      return this.pedidos.filter(p => p.estado_id === 5).length;
    },
    pedidosEnProceso() {
      return this.pedidos.filter(p => p.estado_id === 3).length;
    },
    pedidosAlta() {
      return this.pedidos.filter(p => p.prioridad === 1).length;
    },

    // Data para gráfico de capacidad
    capacidadData() {
      const puestoCapacidad = {};
      const puestoMap = {};
      
      // Crear mapa de puestos
      this.puestos.forEach(puesto => {
        puestoMap[puesto.id] = puesto.nombre_puesto;
        puestoCapacidad[puesto.nombre_puesto] = {
          operarios: 0,
          horasSemanales: 0,
          activos: 0
        };
      });

      // Contar operarios por puesto (solo puestos del 2 al 6)
      this.usuarios
        .filter(u => parseInt(u.puesto_id) >= 2 && parseInt(u.puesto_id) <= 6)
        .forEach(usuario => {
          const nombrePuesto = puestoMap[parseInt(usuario.puesto_id)];
          if (nombrePuesto && puestoCapacidad[nombrePuesto]) {
            puestoCapacidad[nombrePuesto].operarios++;
            puestoCapacidad[nombrePuesto].horasSemanales += usuario.capacidad_horas_semana || 0;
            if (usuario.estado_id === 1) {
              puestoCapacidad[nombrePuesto].activos++;
            }
          }
        });

      const labels = Object.keys(puestoCapacidad);
      
      return {
        labels,
        datasets: [
          {
            label: 'Total Operarios',
            data: labels.map(label => puestoCapacidad[label].operarios),
            backgroundColor: 'rgba(0, 51, 102, 0.7)',
            borderColor: '#003366',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Operarios Activos',
            data: labels.map(label => puestoCapacidad[label].activos),
            backgroundColor: 'rgba(76, 205, 196, 0.7)',
            borderColor: '#4ECDC4',
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: 'Horas Semanales',
            data: labels.map(label => puestoCapacidad[label].horasSemanales),
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: '#FF9F40',
            borderWidth: 2,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      };
    },

    // Data para gráfico de tipo de contrato
    contratoData() {
      const contratos = this.usuarios.reduce((acc, usuario) => {
        const tipo = usuario.es_subcontratado ? 'Subcontratado' : 'Planta';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      return {
        labels: Object.keys(contratos),
        datasets: [{
          data: Object.values(contratos),
          backgroundColor: [
            '#003366', // Planta - Azul oscuro
            '#4ECDC4'  // Subcontratado - Verde azulado
          ],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      };
    },

    // Datos existentes para gráficos de pedidos
    estadosData() {
      const estadosCount = {};
      const estadosLabels = {
        1: 'Pendiente',
        2: 'Aprobado', 
        3: 'En Proceso',
        4: 'Pausado',
        5: 'Completado'
      };

      this.pedidos.forEach(pedido => {
        const estado = estadosLabels[pedido.estado_id] || 'Desconocido';
        estadosCount[estado] = (estadosCount[estado] || 0) + 1;
      });

      return {
        labels: Object.keys(estadosCount),
        datasets: [{
          data: Object.values(estadosCount),
          backgroundColor: [
            '#FF6B6B', // Pendiente - Rojo
            '#4ECDC4', // Aprobado - Verde azulado
            '#45B7D1', // En Proceso - Azul
            '#FFA07A', // Pausado - Naranja claro
            '#98D8C8'  // Completado - Verde
          ],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      };
    },
    prioridadesData() {
      const prioridadesCount = {};
      const prioridadesLabels = {
        1: 'Alta',
        2: 'Media',
        3: 'Baja'
      };

      this.pedidos.forEach(pedido => {
        const prioridad = prioridadesLabels[pedido.prioridad] || 'Desconocida';
        prioridadesCount[prioridad] = (prioridadesCount[prioridad] || 0) + 1;
      });

      return {
        labels: Object.keys(prioridadesCount),
        datasets: [{
          data: Object.values(prioridadesCount),
          backgroundColor: [
            '#E74C3C', // Alta - Rojo intenso
            '#F39C12', // Media - Naranja
            '#27AE60'  // Baja - Verde
          ],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 4
        }]
      };
    },
    timelineData() {
      const monthsCount = {};
      
      this.pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha_solicitud);
        const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        monthsCount[monthKey] = (monthsCount[monthKey] || 0) + 1;
      });

      const sortedMonths = Object.keys(monthsCount).sort();
      
      return {
        labels: sortedMonths.map(month => {
          const [year, monthNum] = month.split('-');
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        }),
        datasets: [{
          label: 'Pedidos por Mes',
          data: sortedMonths.map(month => monthsCount[month]),
          backgroundColor: 'rgba(0, 51, 102, 0.1)',
          borderColor: '#003366',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#003366',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      };
    }
  },
  async mounted() {
    await this.loadAllData();
    this.$nextTick(() => {
      this.createCharts();
    });
  },
  beforeUnmount() {
    this.destroyCharts();
  },
  watch: {
    usuarios: {
      handler() {
        this.$nextTick(() => {
          this.updateRRHHCharts();
        });
      },
      deep: true
    },
    pedidos: {
      handler() {
        this.$nextTick(() => {
          this.updatePedidosCharts();
        });
      },
      deep: true
    }
  },
  methods: {
    async loadAllData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadPedidos(),
          this.loadUsuarios(),
          this.loadPuestos()
        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (this.$vaToast) {
          this.$vaToast.create({
            message: 'Error al cargar algunos datos',
            color: 'warning'
          });
        }
      } finally {
        this.loading = false;
      }
    },
    
    async loadPedidos() {
      try {
        const response = await pedidoService.getAll();
        this.pedidos = response.data || response || [];
        console.log('Pedidos cargados:', this.pedidos.length);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        this.pedidos = [];
      }
    },
    
    async loadUsuarios() {
      try {
        const response = await api.get('/usuario');
        this.usuarios = response.data || response || [];
        console.log('Usuarios cargados:', this.usuarios.length);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
        if (this.$vaToast) {
          this.$vaToast.create({
            message: 'Error al cargar datos de usuarios',
            color: 'danger'
          });
        }
      }
    },
    
    async loadPuestos() {
      try {
        const response = await api.get('/puesto');
        this.puestos = response.data || response || [];
        console.log('Puestos cargados:', this.puestos.length);
      } catch (error) {
        console.error('Error al cargar puestos:', error);
        this.puestos = [];
        if (this.$vaToast) {
          this.$vaToast.create({
            message: 'Error al cargar datos de puestos',
            color: 'danger'
          });
        }
      }
    },

    async refreshAllData() {
      await this.loadAllData();
    },

    createCharts() {
      this.createCapacidadChart();
      this.createContratoChart();
      
      if (this.pedidos.length > 0) {
        this.createEstadosChart();
        this.createPrioridadesChart();
        this.createTimelineChart();
      }
    },

    createCapacidadChart() {
      const canvas = this.$refs.capacidadCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (this.charts.capacidad) {
        this.charts.capacidad.destroy();
      }

      this.charts.capacidad = new Chart(ctx, {
        type: 'bar',
        data: this.capacidadData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 0,
                font: { size: 11 }
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Número de Operarios'
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: { size: 11 }
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Horas Semanales'
              },
              beginAtZero: true,
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                font: { size: 11 }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  if (context.datasetIndex === 2) {
                    return 'horas/semana';
                  }
                  return 'operarios';
                }
              }
            }
          }
        }
      });
    },

    createContratoChart() {
      const canvas = this.$refs.contratoCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (this.charts.contrato) {
        this.charts.contrato.destroy();
      }

      this.charts.contrato = new Chart(ctx, {
        type: 'doughnut',
        data: this.contratoData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },

    createEstadosChart() {
      const canvas = this.$refs.estadosCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (this.charts.estados) {
        this.charts.estados.destroy();
      }

      this.charts.estados = new Chart(ctx, {
        type: 'doughnut',
        data: this.estadosData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    createPrioridadesChart() {
      const canvas = this.$refs.prioridadesCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (this.charts.prioridades) {
        this.charts.prioridades.destroy();
      }

      this.charts.prioridades = new Chart(ctx, {
        type: 'pie',
        data: this.prioridadesData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    createTimelineChart() {
      const canvas = this.$refs.timelineCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (this.charts.timeline) {
        this.charts.timeline.destroy();
      }

      this.charts.timeline = new Chart(ctx, {
        type: 'line',
        data: this.timelineData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: { size: 11 }
              }
            },
            x: {
              ticks: {
                font: { size: 11 }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Pedidos: ${context.parsed.y}`;
                }
              }
            }
          }
        }
      });
    },
    updateRRHHCharts() {
      if (this.charts.capacidad && this.capacidadData.labels.length > 0) {
        this.charts.capacidad.data = this.capacidadData;
        this.charts.capacidad.update();
      }
      if (this.charts.contrato && this.contratoData.labels.length > 0) {
        this.charts.contrato.data = this.contratoData;
        this.charts.contrato.update();
      }
    },
    updatePedidosCharts() {
      if (this.charts.estados && this.estadosData.labels.length > 0) {
        this.charts.estados.data = this.estadosData;
        this.charts.estados.update();
      }
      if (this.charts.prioridades && this.prioridadesData.labels.length > 0) {
        this.charts.prioridades.data = this.prioridadesData;
        this.charts.prioridades.update();
      }
      if (this.charts.timeline && this.timelineData.labels.length > 0) {
        this.charts.timeline.data = this.timelineData;
        this.charts.timeline.update();
      }
    },
    destroyCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    }
  }
};
</script>

<style src="src/assets/EstiloBase.css" ></style>
<style src="src/assets/RRHH.css" ></style>
