import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed properties útiles
  const isAuthenticated = computed(() => {
    const auth = !!token.value;
    console.log('🔐 isAuthenticated:', auth);
    return auth;
  });

  const userRole = computed(() => {
    if (!user.value) {
      console.log('🎯 No user, no role');
      return null;
    }

    // Convertir puesto_id a número si es string
    const puestoId = parseInt(user.value.puesto_id);

    let role;
    switch (puestoId) {
      case 1: role = 'admin'; break;
      case 2: role = 'coordinator'; break;
      case 3: role = 'operator'; break;
      default: role = 'user';
    }

    console.log('🎯 User role calculated:', role, 'from puesto_id:', user.value.puesto_id);
    return role;
  });

  const isAdmin = computed(() => userRole.value === 'admin');
  const isCoordinator = computed(() => userRole.value === 'coordinator');
  const isOperator = computed(() => userRole.value === 'operator');

  const login = async ({ username, password, email }) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('🔐 Iniciando login...');
      console.log('📧 Email/Username:', email || username);
      console.log('🔑 Password length:', password ? password.length : 0);

      // Usar tu configuración existente de API
      const loginData = {
        email: email || username, // El backend espera email
        password
      };

      console.log('📤 Enviando datos de login:', { ...loginData, password: '***' });

      // Cambiar a la URL completa de tu backend
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        console.error('❌ Error en respuesta:', data);
        throw new Error(data.message || 'Error en el servidor');
      }

      if (data.success) {
        console.log('✅ Login exitoso!');
        console.log('👤 Usuario recibido:', data.data.usuario);
        console.log('🎫 Token recibido:', data.data.token ? 'SÍ' : 'NO');

        // Almacenar datos del usuario y token
        user.value = data.data.usuario;
        token.value = data.data.token;

        console.log('💾 Guardando en localStorage...');
        // Opcional: guardar en localStorage para persistencia
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('authUser', JSON.stringify(data.data.usuario));

        console.log('🎯 Rol detectado:', userRole.value);
        console.log('🔐 Autenticado:', isAuthenticated.value);

        return true;
      } else {
        console.error('❌ Login falló:', data.message);
        throw new Error(data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('💥 Error completo en login:', error);
      console.error('📋 Stack trace:', error.stack);
      error.value = error.message;
      throw error;
    } finally {
      loading.value = false;
      console.log('🏁 Login process finished');
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    console.log('👤 Usuario actual:', user.value?.nombre || 'N/A');

    user.value = null;
    token.value = null;
    error.value = null;

    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');

    console.log('✅ Sesión cerrada correctamente');
  };

  // Función para restaurar sesión desde localStorage
  const restoreSession = () => {
    console.log('🔄 Intentando restaurar sesión...');
    try {
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('authUser');

      console.log('💾 Token guardado:', savedToken ? 'SÍ' : 'NO');
      console.log('💾 Usuario guardado:', savedUser ? 'SÍ' : 'NO');

      if (savedToken && savedUser) {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);

        console.log('✅ Sesión restaurada exitosamente');
        console.log('👤 Usuario restaurado:', user.value);
        console.log('🎯 Rol detectado:', userRole.value);

        return true;
      } else {
        console.log('❌ No hay sesión guardada');
      }
    } catch (error) {
      console.error('💥 Error al restaurar sesión:', error);
      logout();
    }
    return false;
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isCoordinator,
    isOperator,
    login,
    logout,
    restoreSession
  };
});