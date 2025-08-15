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
          <input type="text" class="univo-input" v-model="username" required>
        </div>

        <div class="univo-input-group">
          <label class="univo-input-label">Contraseña</label>
          <input type="password" class="univo-input" v-model="password" required>
        </div>

        <div v-if="errorMessage" class="univo-error-message">
          {{ errorMessage }}
        </div>

        <va-button type="submit" class="univo-submit-btn" :disabled="loading" :loading="loading" color="primary" block>
          <span v-if="!loading">Acceder</span>
          <span v-else">Verificando...</span>
        </va-button>
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
              <router-link to="/coordinator/planos-tools" class="univo-quick-link coordinator">
                Planos y Herramientas
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


      <!-- Enlaces de Admin - Sección actualizada -->
      <div class="univo-role-section">
        <h4 class="univo-role-title">Administrador</h4>
        <div class="univo-role-links">
          <router-link to="/admin-dashboard" class="univo-quick-link admin">
            Dashboard Admin
          </router-link>
          <router-link to="/admin/transacciones" class="univo-quick-link admin">
            Transacciones
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

<script src="./scripts/LoginForm.js"></script>
<style src="src/assets/LoginForm.css" scoped></style>
