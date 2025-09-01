<template>
  <VaNavbar class="top-bar" color="background-secondary">
    <template #left>
      <div class="page-title">
        <VaNavbarItem>
          <h1 class="page-title-text">{{ title }}</h1>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </VaNavbarItem>
      </div>
    </template>

    <template #right>
      <div class="user-menu">
        <!-- Notifications -->
        <VaDropdown v-model="showNotifications" placement="bottom-end" :close-on-content-click="false"
          class="notification-dropdown">
          <template #anchor>
            <VaButton preset="secondary" icon="notifications" :badge="notificationCount > 0"
              :badge-text="notificationCount > 9 ? '9+' : notificationCount.toString()" badge-color="danger"
              @click="toggleNotifications" />
          </template>

          <VaCard class="notifications-card">
            <VaCardHeader>
              <VaCardTitle>Notificaciones</VaCardTitle>
              <VaButton preset="plain" size="small" @click="markAllAsRead">
                Marcar todas como leídas
              </VaButton>
            </VaCardHeader>

            <VaCardContent class="notification-list">
              <div v-if="notifications.length === 0" class="empty-notifications">
                <VaIcon name="notifications_none" size="large" color="secondary" />
                <p>No hay notificaciones nuevas</p>
              </div>

              <div v-else>
                <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                  :class="{ 'notification-unread': !notification.read }">
                  <VaIcon :name="notification.icon" color="primary" class="notification-icon" />
                  <div class="notification-content">
                    <p class="notification-title">{{ notification.title }}</p>
                    <p class="notification-time">{{ formatTime(notification.time) }}</p>
                  </div>
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </VaDropdown>

        <!-- User Menu -->
        <VaDropdown v-model="showUserMenu" placement="bottom-end" :close-on-content-click="false" class="user-dropdown">
          <template #anchor>
            <VaButton preset="secondary" class="user-profile-button" @click="toggleUserMenu">
              <VaAvatar :src="user.avatar || '/src/stores/images/Rafa Note 20 - 2025-08-15 03.37.46.jpg'" :alt="user.name"
                size="small" />
              <span class="user-name">{{ user.name || 'Usuario' }}</span>
              <VaIcon name="arrow_drop_down" />
            </VaButton>
          </template>

          <VaCard class="user-menu-card">
            <VaCardHeader class="user-info">
              <VaAvatar :src="user.avatar || '/src/stores/images/Rafa Note 20 - 2025-08-15 03.37.46.jpg'" :alt="user.name"
                size="medium" />
              <div class="user-details">
                <p class="user-name-dropdown">{{ user.name || 'Usuario' }}</p>
                <p class="user-email">{{ user.email || 'usuario@example.com' }}</p>
              </div>
            </VaCardHeader>

            <VaCardContent class="menu-items">
              <VaButton preset="plain" icon="account_circle" class="menu-item" @click="navigateTo('/perfil')">
                Mi perfil
              </VaButton>

              <VaButton preset="plain" icon="settings" class="menu-item" @click="navigateTo('/ajustes')">
                Ajustes
              </VaButton>

              <VaDivider />

              <VaButton preset="plain" icon="logout" color="danger" class="menu-item logout" @click="logout">
                Cerrar sesión
              </VaButton>
            </VaCardContent>
          </VaCard>
        </VaDropdown>
      </div>
    </template>
  </VaNavbar>
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
        name: '',
        email: '',
        avatar: ''
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
      this.showNotifications = false
    },
    logout() {
      this.$emit('logout')
      this.showUserMenu = false
    },
    navigateTo(route) {
      this.$router.push(route)
      this.showUserMenu = false
    },
    formatTime(time) {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>
<style src="src/assets/TopBar.css"></style>
