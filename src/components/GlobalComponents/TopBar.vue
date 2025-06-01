<template>
    <div class="top-bar">
      <div class="page-title" style="margin-left: 250px;">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="user-menu">
        <div class="notification-icon" @click="toggleNotifications">
          <span class="material-icons">notifications</span>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="notification-header">
              <h4>Notificaciones</h4>
              <button @click="markAllAsRead" class="btn-link">Marcar todas como leídas</button>
            </div>
            <div class="notification-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id" 
                class="notification-item"
                :class="{ unread: !notification.read }"
              >
                <div class="notification-content">
                  <span class="material-icons notification-icon">{{ notification.icon }}</span>
                  <div>
                    <p class="notification-title">{{ notification.title }}</p>
                    <p class="notification-time">{{ formatTime(notification.time) }}</p>
                  </div>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="empty-notifications">
                No hay notificaciones nuevas
              </div>
            </div>
          </div>
        </div>
        
        <div class="user-profile" @click="toggleUserMenu">
          <img :src="user.avatar" :alt="user.name" class="user-avatar">
          <span class="user-name">{{  }}</span>
          <span class="material-icons">arrow_drop_down</span>
          <div v-if="showUserMenu" class="user-menu-dropdown">
            <div class="user-info">
              <img :src="user.avatar" :alt="user.name" class="dropdown-avatar">
              <div>
                <p class="user-name-dropdown">{{ user.name }}</p>
                <p class="user-email">{{ user.email }}</p>
              </div>
            </div>
            <div class="menu-items">
              <router-link to="/perfil" class="menu-item">
                <span class="material-icons">account_circle</span>
                <span>Mi perfil</span>
              </router-link>
              <router-link to="/ajustes" class="menu-item">
                <span class="material-icons">settings</span>
                <span>Ajustes</span>
              </router-link>
              <div class="divider"></div>
              <button @click="logout" class="menu-item logout">
                <span class="material-icons">logout</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TopBar',
    props: {
      title: {
        type: String,
        default: 'Panel de Control'
      },
      subtitle: {
        type: String,
        default: ''
      },
      user: {
        type: Object,
        default: () => ({
        })
      },
      notifications: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        showNotifications: false,
        showUserMenu: false
      }
    },
    computed: {
      notificationCount() {
        return this.notifications.filter(n => !n.read).length
      }
    },
    methods: {
      toggleNotifications() {
        this.showNotifications = !this.showNotifications
        this.showUserMenu = false
      },
      toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu
        this.showNotifications = false
      },
      markAllAsRead() {
        this.$emit('mark-all-read')
      },
      logout() {
        this.$emit('logout')
      },
      formatTime(time) {
        // Puedes usar librerías como moment.js o date-fns para mejor formato
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    },
    mounted() {
      // Cerrar menús al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!this.$el.contains(e.target)) {
          this.showNotifications = false
          this.showUserMenu = false
        }
      })
    }
  }
  </script>
