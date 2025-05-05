import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  
  // Datos mock integrados
  const mockUsers = [
    {
      username: 'coordinator',
      password: 'coord123',
      userData: {
        id: 1,
        name: 'Coordinador de Producción',
        email: 'coordinator@taller.com',
        role: 'coordinator',
        avatar: '/avatars/coordinator.jpg'
      },
      token: 'mock-token-coordinator'
    },
    {
      username: 'admin',
      password: 'admin123',
      userData: {
        id: 2,
        name: 'Administrador',
        email: 'admin@taller.com',
        role: 'admin',
        avatar: '/avatars/admin.jpg'
      },
      token: 'mock-token-admin'
    }
  ];

  const login = async ({ username, password }) => {
    // Simulamos un delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => 
      u.username === username && u.password === password
    );

    if (foundUser) {
      user.value = foundUser.userData;
      token.value = foundUser.token;
      return true;
    } else {
      throw new Error('Usuario o contraseña incorrectos');
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
  };

  // Método opcional para desarrollo: establecer usuario manualmente
  const setMockUser = (role) => {
    const mockUser = mockUsers.find(u => u.userData.role === role);
    if (mockUser) {
      user.value = mockUser.userData;
      token.value = mockUser.token;
    }
  };

  return {
    user,
    token,
    login,
    logout,
    setMockUser // Opcional: útil para desarrollo
  };
});