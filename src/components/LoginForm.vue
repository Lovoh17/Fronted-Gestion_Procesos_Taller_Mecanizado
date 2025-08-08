<template>
  <div class="univo-login-container">
    <div class="univo-login-box">
      <!-- Logo añadido aquí -->
      <div class="univo-logo-container">
        <img src="/src/assets/login.svg" alt="Logo del taller" class="univo-logo">
      </div>
      
      <form class="univo-form" @submit.prevent="handleLogin">
        <div class="univo-input-group">
          <label class="univo-input-label">Nombre de usuario</label>
          <input 
            type="text"
            class="univo-input"
            v-model="username"
            required
          >
        </div>
         
        <div class="univo-input-group">
          <label class="univo-input-label">Contraseña</label>
          <input 
            type="password"
            class="univo-input"
            v-model="password"
            required
          >
        </div>
         
        <div v-if="errorMessage" class="univo-error-message">
          {{ errorMessage }}
        </div>
         
        <button type="submit" class="univo-submit-btn" :disabled="loading">
          <span v-if="!loading">Acceder</span>
          <span v-else">Verificando...</span>
        </button>
      </form>
      
      <!-- Sección de acceso directo -->
      <div class="univo-quick-access">
        <h3 class="univo-quick-access-title">Acceso Directo</h3>
        <div class="univo-quick-access-grid">
          <!-- Enlaces de Admin -->
          <div class="univo-role-section">
            <h4 class="univo-role-title">Administrador</h4>
            <div class="univo-role-links">
              <router-link to="/admin-dashboard" class="univo-quick-link admin">
                Dashboard Admin
              </router-link>
              <router-link to="/admin/users" class="univo-quick-link admin">
                Usuarios
              </router-link>
              <router-link to="/admin/departments" class="univo-quick-link admin">
                Departamentos
              </router-link>
              <router-link to="/admin/orders" class="univo-quick-link admin">
                Órdenes
              </router-link>
              <router-link to="/admin/reports" class="univo-quick-link admin">
                Reportes
              </router-link>
            </div>
          </div>

          <!-- Enlaces de Coordinador -->
          <div class="univo-role-section">
            <h4 class="univo-role-title">Coordinador</h4>
            <div class="univo-role-links">
              <router-link to="/dashboard-coordinador" class="univo-quick-link coordinator">
                Dashboard Coordinador
              </router-link>
              <router-link to="/control-calidad" class="univo-quick-link coordinator">
                Control de Calidad
              </router-link>
              <router-link to="/coordinator/planning" class="univo-quick-link coordinator">
                Planificación
              </router-link>
              <router-link to="/coordinator/orders" class="univo-quick-link coordinator">
                Órdenes de Trabajo
              </router-link>
              <router-link to="/coordinator/maintenance" class="univo-quick-link coordinator">
                Mantenimiento
              </router-link>
              <router-link to="/coordinator/movimientos" class="univo-quick-link coordinator">
                Movimientos
              </router-link>
            </div>
          </div>

          <!-- Enlaces de Operario -->
          <div class="univo-role-section">
            <h4 class="univo-role-title">Operario</h4>
            <div class="univo-role-links">
              <router-link to="/dashboard-operario" class="univo-quick-link operator">
                Dashboard Operario
              </router-link>
              <router-link to="/operario/trabajos" class="univo-quick-link operator">
                Trabajos
              </router-link>
              <router-link to="/operario/reportes" class="univo-quick-link operator">
                Reportes
              </router-link>
            </div>
          </div>

          <!-- Enlaces de Técnico -->
          <div class="univo-role-section">
            <h4 class="univo-role-title">Técnico</h4>
            <div class="univo-role-links">
              <router-link to="/tech-dashboard" class="univo-quick-link technician">
                Dashboard Técnico
              </router-link>
              <router-link to="/tech/schedule" class="univo-quick-link technician">
                Programación
              </router-link>
            </div>
          </div>
        </div>

        <!-- Enlaces Compartidos -->
        <div class="univo-shared-section">
          <h4 class="univo-role-title">Herramientas Compartidas</h4>
          <div class="univo-shared-links">
            <router-link to="/herramientas" class="univo-quick-link shared">
              Herramientas
            </router-link>
            <router-link to="/inventory" class="univo-quick-link shared">
              Inventario
            </router-link>
            <router-link to="/settings" class="univo-quick-link shared">
              Configuración
            </router-link>
          </div>
        </div>
      </div>
       
      <div class="univo-links">
        <a href="#" class="univo-link">¿Olvidó su contraseña?</a>
      </div>
       
      <div class="univo-footer">
        <span class="univo-language">Español - Internacional (es) ✔</span>
        <span class="univo-cookies">Aviso de Cookies</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const router = useRouter();
// const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
     
    // Aquí deberías reemplazar esto con tu llamada API real
    // await authStore.login({
    //   username: username.value,
    //   password: password.value
    // });

    // Redirección basada en rol
    // if (authStore.user?.role === 'coordinator') {
    //   router.push('/dashboard-coordinador');
    // } else if (authStore.user?.role === 'admin') {
    //   router.push('/admin-dashboard');
    // } else {
    //   router.push('/dashboard-operario');
    // }
       
  } catch (error) {
    console.error('Error de login:', error);
    errorMessage.value = 'Credenciales incorrectas. Por favor intente nuevamente.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Mantener el contenedor principal con scroll */
.univo-login-box {
  max-height: 90vh;
  overflow-y: auto;
}

/* Estilos para la sección de acceso directo */
.univo-quick-access {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.univo-quick-access-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

.univo-quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.univo-role-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.univo-role-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.8rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.univo-role-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.univo-shared-section {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  border: 2px solid #007bff;
}

.univo-shared-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.univo-quick-link {
  display: inline-block;
  padding: 0.5rem 0.8rem;
  text-decoration: none;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

/* Colores por rol */
.univo-quick-link.admin {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.univo-quick-link.admin:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.univo-quick-link.coordinator {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.univo-quick-link.coordinator:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.univo-quick-link.operator {
  background-color: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.univo-quick-link.operator:hover {
  background-color: #e0a800;
  transform: translateY(-1px);
}

.univo-quick-link.technician {
  background-color: #6f42c1;
  color: white;
  border-color: #6f42c1;
}

.univo-quick-link.technician:hover {
  background-color: #5a32a3;
  transform: translateY(-1px);
}

.univo-quick-link.shared {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.univo-quick-link.shared:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .univo-quick-access-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .univo-shared-links {
    flex-direction: column;
  }
  
  .univo-quick-link {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }
}
</style>