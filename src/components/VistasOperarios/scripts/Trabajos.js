import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const trabajos = ref([]);
const filtroEstado = ref('');
const showModal = ref(false);
const trabajoSeleccionado = ref(null);

// Computed properties
const trabajosPendientes = computed(() =>
  trabajos.value.filter(t => t.estado === 'pendiente').length
);

const trabajosEnProceso = computed(() =>
  trabajos.value.filter(t => t.estado === 'en_proceso').length
);

const trabajosCompletados = computed(() =>
  trabajos.value.filter(t => t.estado === 'completado' && isToday(t.fechaCompletado)).length
);

const trabajosFiltrados = computed(() => {
  if (!filtroEstado.value) return trabajos.value;
  return trabajos.value.filter(t => t.estado === filtroEstado.value);
});

// Methods
const loadTrabajos = async () => {
  try {
    loading.value = true;
    const operarioId = authStore.user?.id;

    const response = await fetch(`/api/Trabajos/Operario/${operarioId}`);
    if (!response.ok) throw new Error('Error al cargar trabajos');

    trabajos.value = await response.json();
  } catch (error) {
    console.error('Error cargando trabajos:', error);
    // Datos de ejemplo para desarrollo
    trabajos.value = [
      {
        id: 1,
        titulo: 'Reparación de Motor',
        descripcion: 'Revisar y reparar motor de vehículo modelo 2020',
        estado: 'pendiente',
        prioridad: 'alta',
        fechaAsignacion: '2024-06-20',
        tiempoEstimado: 4,
        cliente: 'Juan Pérez',
        herramientasRequeridas: [
          { id: 1, nombre: 'Llave inglesa' },
          { id: 2, nombre: 'Destornillador' }
        ]
      },
      {
        id: 2,
        titulo: 'Cambio de Aceite',
        descripcion: 'Cambio de aceite y filtro estándar',
        estado: 'en_proceso',
        prioridad: 'media',
        fechaAsignacion: '2024-06-21',
        tiempoEstimado: 1,
        cliente: 'María González',
        herramientasRequeridas: [
          { id: 3, nombre: 'Llave de filtro' }
        ]
      }
    ];
  } finally {
    loading.value = false;
  }
};

const iniciarTrabajo = async (trabajoId) => {
  try {
    const response = await fetch(`/api/Trabajos/${trabajoId}/iniciar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const trabajo = trabajos.value.find(t => t.id === trabajoId);
      if (trabajo) trabajo.estado = 'en_proceso';
    }
  } catch (error) {
    console.error('Error iniciando trabajo:', error);
  }
};

const completarTrabajo = async (trabajoId) => {
  try {
    const response = await fetch(`/api/Trabajos/${trabajoId}/completar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const trabajo = trabajos.value.find(t => t.id === trabajoId);
      if (trabajo) {
        trabajo.estado = 'completado';
        trabajo.fechaCompletado = new Date().toISOString();
      }
    }
  } catch (error) {
    console.error('Error completando trabajo:', error);
  }
};

const verDetalles = (trabajo) => {
  trabajoSeleccionado.value = trabajo;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  trabajoSeleccionado.value = null;
};

const getEstadoText = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completado: 'Completado'
  };
  return estados[estado] || estado;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES');
};

const isToday = (dateString) => {
  if (!dateString) return false;
  const today = new Date().toDateString();
  const date = new Date(dateString).toDateString();
  return today === date;
};

const filtrarTrabajos = () => {
  // La filtración se maneja automáticamente por el computed property
};

onMounted(() => {
  loadTrabajos();
});