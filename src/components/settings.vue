<template>
  <div class="settings-container">
    <div class="settings-sidebar">
      <div class="user-profile-card">
        <div class="avatar-container">
          <img :src="user.avatar || 'default-avatar.png'" alt="Avatar" class="user-avatar">
          <button class="avatar-edit-btn" @click="triggerAvatarUpload">
            <i class="material-icons">edit</i>
          </button>
          <input type="file" ref="avatarInput" accept="image/*" @change="handleAvatarChange" hidden>
        </div>
        <h3 class="user-name">{{ user.name }}</h3>
        <p class="user-role">{{ user.role }}</p>
        <div class="user-stats">
          <div class="stat-item">
            <i class="material-icons">work</i>
            <span>{{ user.stats.projects }} proyectos</span>
          </div>
          <div class="stat-item">
            <i class="material-icons">event</i>
            <span>Miembro desde {{ formatDate(user.joinDate) }}</span>
          </div>
        </div>
      </div>

      <nav class="settings-nav">
        <ul>
          <li v-for="tab in tabs" :key="tab.id" 
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id">
            <i class="material-icons">{{ tab.icon }}</i>
            {{ tab.label }}
          </li>
        </ul>
      </nav>
    </div>

    <div class="settings-content">
      <!-- Información Personal -->
      <div v-if="activeTab === 'personal'" class="tab-content">
        <h2 class="tab-title">Información Personal</h2>
        <form @submit.prevent="savePersonalInfo" class="settings-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre completo</label>
              <input type="text" v-model="user.name" required>
            </div>
            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" v-model="user.email" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" v-model="user.phone">
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <select v-model="user.department">
                <option value="produccion">Producción</option>
                <option value="calidad">Control de Calidad</option>
                <option value="diseno">Diseño</option>
                <option value="administracion">Administración</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Biografía</label>
            <textarea v-model="user.bio" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn secondary" @click="resetPersonalInfo">Cancelar</button>
            <button type="submit" class="btn primary">Guardar cambios</button>
          </div>
        </form>
      </div>

      <!-- Seguridad -->
      <div v-if="activeTab === 'security'" class="tab-content">
        <h2 class="tab-title">Seguridad y Acceso</h2>
        <form @submit.prevent="updatePassword" class="settings-form">
          <div class="form-group">
            <label>Contraseña actual</label>
            <input type="password" v-model="password.current" required>
          </div>

          <div class="form-group">
            <label>Nueva contraseña</label>
            <input type="password" v-model="password.new" required>
            <div class="password-strength" :class="passwordStrength">
              Seguridad: {{ passwordStrengthText }}
            </div>
          </div>

          <div class="form-group">
            <label>Confirmar nueva contraseña</label>
            <input type="password" v-model="password.confirm" required>
            <div v-if="passwordMismatch" class="error-message">
              Las contraseñas no coinciden
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn primary" :disabled="passwordMismatch || password.new.length < 8">
              Cambiar contraseña
            </button>
          </div>
        </form>

        <div class="security-section">
          <h3>Sesiónes activas</h3>
          <div class="sessions-list">
            <div v-for="session in activeSessions" :key="session.id" class="session-item">
              <div class="session-info">
                <i class="material-icons">devices</i>
                <div>
                  <div class="session-device">{{ session.device }}</div>
                  <div class="session-meta">
                    {{ session.location }} • {{ formatDateTime(session.lastActivity) }}
                  </div>
                </div>
              </div>
              <button class="btn small" @click="revokeSession(session.id)"
                      v-if="session.current">Cerrar otras sesiones</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferencias -->
      <div v-if="activeTab === 'preferences'" class="tab-content">
        <h2 class="tab-title">Preferencias</h2>
        
        <div class="preferences-section">
          <h3>Configuración de la interfaz</h3>
          <div class="preference-item">
            <label class="switch-container">
              Modo oscuro
              <label class="switch">
                <input type="checkbox" v-model="preferences.darkMode">
                <span class="slider"></span>
              </label>
            </label>
          </div>

          <div class="preference-item">
            <label class="switch-container">
              Mostrar notificaciones
              <label class="switch">
                <input type="checkbox" v-model="preferences.notifications">
                <span class="slider"></span>
              </label>
            </label>
          </div>

          <div class="preference-item">
            <label>Densidad de la interfaz</label>
            <div class="radio-group">
              <label class="radio-container">
                Compacta
                <input type="radio" name="density" value="compact" v-model="preferences.density">
                <span class="radiomark"></span>
              </label>
              <label class="radio-container">
                Normal
                <input type="radio" name="density" value="normal" v-model="preferences.density">
                <span class="radiomark"></span>
              </label>
              <label class="radio-container">
                Amplia
                <input type="radio" name="density" value="comfortable" v-model="preferences.density">
                <span class="radiomark"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="preferences-section">
          <h3>Preferencias de idioma</h3>
          <div class="form-group">
            <label>Idioma principal</label>
            <select v-model="preferences.language">
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary" @click="savePreferences">Guardar preferencias</button>
        </div>
      </div>

      <!-- Integraciones -->
      <div v-if="activeTab === 'integrations'" class="tab-content">
        <h2 class="tab-title">Integraciones</h2>
        
        <div class="integrations-grid">
          <div class="integration-card" v-for="integration in availableIntegrations" :key="integration.id">
            <div class="integration-header">
              <img :src="integration.logo" :alt="integration.name" class="integration-logo">
              <h3>{{ integration.name }}</h3>
              <label class="switch">
                <input type="checkbox" v-model="integration.enabled">
                <span class="slider"></span>
              </label>
            </div>
            <p class="integration-description">{{ integration.description }}</p>
            <button class="btn small" @click="configureIntegration(integration.id)"
                    v-if="integration.enabled">Configurar</button>
          </div>
        </div>
      </div>

      <!-- Notificaciones -->
      <div v-if="activeTab === 'notifications'" class="tab-content">
        <h2 class="tab-title">Configuración de Notificaciones</h2>
        
        <div class="notifications-section">
          <h3>Preferencias de notificaciones</h3>
          <div class="notification-preference">
            <label class="notification-label">Notificaciones por correo electrónico</label>
            <div class="notification-options">
              <label class="radio-container">
                Todas
                <input type="radio" name="emailFrequency" value="all" v-model="notifications.emailFrequency">
                <span class="radiomark"></span>
              </label>
              <label class="radio-container">
                Solo importantes
                <input type="radio" name="emailFrequency" value="important" v-model="notifications.emailFrequency">
                <span class="radiomark"></span>
              </label>
              <label class="radio-container">
                Ninguna
                <input type="radio" name="emailFrequency" value="none" v-model="notifications.emailFrequency">
                <span class="radiomark"></span>
              </label>
            </div>
          </div>

          <div class="notification-preference">
            <label class="notification-label">Notificaciones en la aplicación</label>
            <div class="notification-options">
              <label class="radio-container">
                Todas
                <input type="radio" name="appFrequency" value="all" v-model="notifications.appFrequency">
                <span class="radiomark"></span>
              </label>
              <label class="radio-container">
                Solo importantes
                <input type="radio" name="appFrequency" value="important" v-model="notifications.appFrequency">
                <span class="radiomark"></span>
              </label>
            </div>
          </div>
        </div>

        <div class="notifications-section">
          <h3>Tipos de notificaciones</h3>
          <div class="notification-types">
            <div class="notification-type" v-for="type in notificationTypes" :key="type.id">
              <label class="switch-container">
                {{ type.label }}
                <label class="switch">
                  <input type="checkbox" v-model="type.enabled">
                  <span class="slider"></span>
                </label>
              </label>
              <p class="notification-description">{{ type.description }}</p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary" @click="saveNotificationSettings">Guardar configuración</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'personal',
      tabs: [
        { id: 'personal', label: 'Información Personal', icon: 'person' },
        { id: 'security', label: 'Seguridad', icon: 'lock' },
        { id: 'preferences', label: 'Preferencias', icon: 'settings' },
        { id: 'notifications', label: 'Notificaciones', icon: 'notifications' },
        { id: 'integrations', label: 'Integraciones', icon: 'extension' }
      ],
      user: {
        name: 'Juan Pérez',
        email: 'juan.perez@taller.com',
        role: 'Supervisor de Calidad',
        phone: '+52 55 1234 5678',
        department: 'calidad',
        bio: 'Supervisor con 5 años de experiencia en control de calidad en procesos de mecanizado.',
        avatar: 'user-avatar.jpg',
        stats: {
          projects: 24,
          tasks: 156
        },
        joinDate: '2020-05-15'
      },
      originalUser: {},
      password: {
        current: '',
        new: '',
        confirm: ''
      },
      activeSessions: [
        {
          id: 1,
          device: 'Chrome en Windows',
          location: 'Ciudad de México, MX',
          lastActivity: new Date(),
          current: true
        },
        {
          id: 2,
          device: 'Safari en iPhone',
          location: 'Guadalajara, MX',
          lastActivity: new Date(Date.now() - 3600000),
          current: false
        }
      ],
      preferences: {
        darkMode: false,
        notifications: true,
        density: 'normal',
        language: 'es'
      },
      availableIntegrations: [
        {
          id: 1,
          name: 'Google Calendar',
          description: 'Sincroniza tus tareas y eventos con Google Calendar',
          logo: 'google-calendar.png',
          enabled: true
        },
        {
          id: 2,
          name: 'Slack',
          description: 'Recibe notificaciones en tus canales de Slack',
          logo: 'slack.png',
          enabled: false
        },
        {
          id: 3,
          name: 'Microsoft Teams',
          description: 'Integración con Microsoft Teams para notificaciones',
          logo: 'teams.png',
          enabled: true
        }
      ],
      notifications: {
        emailFrequency: 'important',
        appFrequency: 'all'
      },
      notificationTypes: [
        {
          id: 1,
          label: 'Asignación de tareas',
          description: 'Recibir notificaciones cuando se te asigne una nueva tarea',
          enabled: true
        },
        {
          id: 2,
          label: 'Cambios en proyectos',
          description: 'Notificaciones sobre cambios importantes en proyectos asignados',
          enabled: true
        },
        {
          id: 3,
          label: 'Recordatorios',
          description: 'Recordatorios de tareas pendientes y fechas límite',
          enabled: false
        },
        {
          id: 4,
          label: 'Menciones',
          description: 'Cuando alguien te mencione en comentarios o documentos',
          enabled: true
        }
      ]
    }
  },
  created() {
    // Guardar copia original para reset
    this.originalUser = JSON.parse(JSON.stringify(this.user));
  },
  computed: {
    passwordMismatch() {
      return this.password.new !== this.password.confirm && this.password.confirm !== '';
    },
    passwordStrength() {
      if (this.password.new.length === 0) return '';
      if (this.password.new.length < 8) return 'weak';
      
      const hasUpper = /[A-Z]/.test(this.password.new);
      const hasLower = /[a-z]/.test(this.password.new);
      const hasNumber = /[0-9]/.test(this.password.new);
      const hasSpecial = /[^A-Za-z0-9]/.test(this.password.new);
      
      const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
      
      if (strength < 2) return 'weak';
      if (strength < 4) return 'medium';
      return 'strong';
    },
    passwordStrengthText() {
      return {
        '': 'No establecida',
        weak: 'Débil',
        medium: 'Media',
        strong: 'Fuerte'
      }[this.passwordStrength];
    }
  },
  methods: {
    triggerAvatarUpload() {
      this.$refs.avatarInput.click();
    },
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.user.avatar = e.target.result;
          // Aquí normalmente subirías la imagen al servidor
        };
        reader.readAsDataURL(file);
      }
    },
    savePersonalInfo() {
      // Lógica para guardar en el servidor
      console.log('Guardando información personal:', this.user);
      this.originalUser = JSON.parse(JSON.stringify(this.user));
      alert('Información personal actualizada correctamente');
    },
    resetPersonalInfo() {
      this.user = JSON.parse(JSON.stringify(this.originalUser));
    },
    updatePassword() {
      // Lógica para cambiar contraseña
      console.log('Cambiando contraseña');
      this.password = { current: '', new: '', confirm: '' };
      alert('Contraseña actualizada correctamente');
    },
    revokeSession(sessionId) {
      this.activeSessions = this.activeSessions.filter(s => s.id === sessionId || s.current);
      alert('Sesiones revocadas correctamente');
    },
    savePreferences() {
      // Lógica para guardar preferencias
      console.log('Guardando preferencias:', this.preferences);
      alert('Preferencias guardadas correctamente');
    },
    configureIntegration(integrationId) {
      console.log('Configurando integración:', integrationId);
      // Lógica para configurar integración específica
    },
    saveNotificationSettings() {
      // Lógica para guardar configuración de notificaciones
      console.log('Guardando configuración de notificaciones:', this.notifications, this.notificationTypes);
      alert('Configuración de notificaciones guardada');
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    formatDateTime(date) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(date).toLocaleDateString('es-ES', options);
    }
  }
}
</script>

<style scoped>
.settings-container {
  display: flex;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.settings-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
}

.user-profile-card {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.avatar-edit-btn:hover {
  background: #1a252f;
}

.user-name {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.user-role {
  margin: 5px 0 15px;
  color: #7f8c8d;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 13px;
  color: #555;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-item i {
  font-size: 16px;
}

.settings-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.settings-nav li {
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 5px;
  transition: all 0.2s;
}

.settings-nav li:hover {
  background-color: #f0f2f5;
}

.settings-nav li.active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.settings-nav li i {
  font-size: 20px;
}

.settings-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tab-title {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 22px;
}

.settings-form {
  max-width: 700px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.btn {
  padding: 10px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
}

.btn.primary {
  background-color: #2c3e50;
  color: white;
}

.btn.primary:hover {
  background-color: #1a252f;
}

.btn.secondary {
  background-color: #f0f0f0;
  color: #555;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
}

.btn.small {
  padding: 6px 12px;
  font-size: 13px;
}

.password-strength {
  margin-top: 5px;
  font-size: 13px;
  padding: 3px 6px;
  border-radius: 3px;
  display: inline-block;
}

.password-strength.weak {
  background-color: #ffebee;
  color: #c62828;
}

.password-strength.medium {
  background-color: #fff8e1;
  color: #f57f17;
}

.password-strength.strong {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-message {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 5px;
}

.security-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.security-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.sessions-list {
  margin-top: 15px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-info i {
  color: #555;
  font-size: 20px;
}

.session-device {
  font-weight: 500;
}

.session-meta {
  font-size: 13px;
  color: #7f8c8d;
}

.preferences-section {
  margin-bottom: 30px;
}

.preference-item {
  margin-bottom: 20px;
}

.switch-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2c3e50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.radio-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.radiomark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #7f8c8d;
  border-radius: 50%;
  position: relative;
}

.radio-container input {
  display: none;
}

.radio-container input:checked + .radiomark {
  border-color: #2c3e50;
}

.radio-container input:checked + .radiomark::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #2c3e50;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.integration-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.integration-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.integration-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.integration-logo {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  object-fit: contain;
}

.integration-header h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
}

.integration-description {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
}

.notifications-section {
  margin-bottom: 30px;
}

.notification-preference {
  margin-bottom: 20px;
}

.notification-label {
  display: block;
  font-weight: 500;
  margin-bottom: 10px;
  color: #555;
}

.notification-options {
  display: flex;
  gap: 20px;
}

.notification-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.notification-type {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
}

.notification-description {
  font-size: 13px;
  color: #7f8c8d;
  margin-top: 8px;
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>