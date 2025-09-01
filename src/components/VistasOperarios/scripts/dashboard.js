import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default function useDashboard() {
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref(null);
  const dashboardData = ref(null);
  const filtroEstado = ref('');
  const showModal = ref(false);
  const pedidoSeleccionado = ref(null);

  // Computed properties para estadísticas
  const pedidosDesconocidos = computed(() =>
    dashboardData.value?.pedidos?.filter(p => p.estado === 'desconocido').length || 0
  );

  const pedidosEnProceso = computed(() =>
    dashboardData.value?.pedidos?.filter(p => p.estado === 'en_proceso').length || 0
  );

  const pedidosCompletados = computed(() =>
    dashboardData.value?.pedidos?.filter(p => p.estado === 'completado').length || 0
  );

  const totalHerramientas = computed(() =>
    dashboardData.value?.herramientas?.total || 0
  );

  // Computed property para pedidos filtrados
  const pedidosFiltrados = computed(() => {
    if (!dashboardData.value?.pedidos) return [];
    if (!filtroEstado.value) return dashboardData.value.pedidos;
    return dashboardData.value.pedidos.filter(p => p.estado === filtroEstado.value);
  });

  // Methods
  const loadDashboard = async () => {
    try {
      loading.value = true;
      error.value = null;
      const operarioId = authStore.user?.id;

      if (!operarioId) {
        throw new Error('No se encontró ID del operario');
      }

      const response = await fetch(`https://gestionprocesostallermecanizado-production-d0de.up.railway.app/dashboard/operario/${operarioId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      dashboardData.value = await response.json();
      console.log('Dashboard data loaded:', dashboardData.value);
      
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      error.value = err.message;
      dashboardData.value = null;
    } finally {
      loading.value = false;
    }
  };

  const iniciarPedido = async (pedido) => {
    try {
      const response = await fetch(`https://gestionprocesostallermecanizado-production-d0de.up.railway.app/api/asignaciones/${pedido.asignacionId}/iniciar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        pedido.estado = 'en_proceso';
      } else {
        throw new Error('Error al iniciar el pedido');
      }
    } catch (err) {
      console.error('Error iniciando pedido:', err);
      alert('Error al iniciar el pedido. Inténtalo nuevamente.');
    }
  };

  const completarPedido = async (pedido) => {
    try {
      const response = await fetch(`https://gestionprocesostallermecanizado-production-d0de.up.railway.app/api/asignaciones/${pedido.asignacionId}/completar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        pedido.estado = 'completado';
      } else {
        throw new Error('Error al completar el pedido');
      }
    } catch (err) {
      console.error('Error completando pedido:', err);
      alert('Error al completar el pedido. Inténtalo nuevamente.');
    }
  };

  const verDetalles = (pedido) => {
    pedidoSeleccionado.value = pedido;
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    pedidoSeleccionado.value = null;
  };

  // Helpers
  const getEstadoText = (estado) => {
    const estados = {
      desconocido: 'Pendiente',
      en_proceso: 'En Proceso',
      completado: 'Completado'
    };
    return estados[estado] || estado;
  };

  const getEstadoClass = (estado) => {
    const clases = {
      desconocido: 'pendiente',
      en_proceso: 'en_proceso',
      completado: 'completado'
    };
    return clases[estado] || 'pendiente';
  };

  const getPrioridad = (pedido) => {
    // Lógica para asignar prioridad basada en el ID de asignación
    if (pedido.asignacionId <= 10) return 'alta';
    if (pedido.asignacionId <= 30) return 'media';
    return 'baja';
  };

  const filtrarPedidos = () => {
    // La filtración se maneja automáticamente por el computed property
  };

  onMounted(() => {
    loadDashboard();
  });

  // Retornar todas las propiedades y métodos que necesitas en tu componente
  return {
    loading,
    error,
    dashboardData,
    filtroEstado,
    showModal,
    pedidoSeleccionado,
    pedidosDesconocidos,
    pedidosEnProceso,
    pedidosCompletados,
    totalHerramientas,
    pedidosFiltrados,
    loadDashboard,
    iniciarPedido,
    completarPedido,
    verDetalles,
    closeModal,
    getEstadoText,
    getEstadoClass,
    getPrioridad,
    filtrarPedidos
  };
}