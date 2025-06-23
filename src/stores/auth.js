import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  
  // Datos mock mejorados
  const mockUsers = [
    {
      username: 'coordinator',
      password: 'coord123',
      userData: {
        id: 1,
        name: 'Coordinador de Producción',
        email: 'coordinator@taller.com',
        role: 'coordinator',
        puestoId: 2, // ID de puesto para coordinador
        avatar: '/avatars/coordinator.jpg'
      },
      token: 'mock-token-coordinator'
    },
    {
      username: 'admin',
      password: 'admin',
      userData: {
        id: 2,
        name: 'Administrador',
        email: 'admin@taller.com',
        role: 'admin',
        puestoId: 1, // ID de puesto para admin
        avatar: '/avatars/admin.jpg'
      },
      token: 'mock-token-admin'
    },
    {
      username: 'operario',
      password: 'operario',
      userData: {
        id: 3,
        name: 'Operario de Producción',
        email: 'operario@taller.com',
        role: 'operator',
        puestoId: 3, // ID de puesto para operario
        avatar: '/avatars/operator.jpg'
      },
      token: 'mock-token-operator'
    },
    {
      username: 'tecnico',
      password: 'tecnico',
      userData: {
        id: 4,
        name: 'Técnico de Mantenimiento',
        email: 'tecnico@taller.com',
        role: 'technician',
        puestoId: 4, // ID de puesto para técnico
        avatar: '/avatars/tecnico.jpg'
      },
      token: 'mock-token-tecnico'
    }
  ];

  // Computed properties útiles
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role);
  const isAdmin = computed(() => userRole.value === 'admin');
  const isCoordinator = computed(() => userRole.value === 'coordinator');
  const isOperator = computed(() => userRole.value === 'operator');
  const isTechnician = computed(() => userRole.value === 'technician');

  const login = async ({ username, password }) => {
    try {
      // Simulamos un delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundUser = mockUsers.find(u => 
        u.username === username && u.password === password
      );

      if (!foundUser) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      user.value = foundUser.userData || foundUser.user;
      token.value = foundUser.token;

      return true;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
  };

  // Método para desarrollo: establecer usuario manualmente
  const setMockUser = (role) => {
    const mockUser = mockUsers.find(u => 
      (u.userData?.role || u.user?.role) === role
    );
    if (mockUser) {
      user.value = mockUser.userData || mockUser.user;
      token.value = mockUser.token;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    isAdmin,
    isCoordinator,
    isOperator,
    isTechnician, // Nueva propiedad para técnico
    login,
    logout,
    setMockUser
  };
});