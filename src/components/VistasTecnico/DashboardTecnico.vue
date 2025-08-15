<template>
  <div class="dashboard-tecnico">
    <!-- Header Mejorado -->
    <div class="header">
      <div class="header-content">
        <div class="brand-section">
          <h1>UNIVO<strong>Técnico</strong></h1>
          <h2>PANEL TÉCNICO AVANZADO</h2>
        </div>
        <div class="header-actions">
          <div class="time-display">
            <div class="current-date">{{ currentDate }}</div>
            <div class="current-time">{{ currentTime }}</div>
          </div>
          <va-button @click="refreshData" class="refresh-btn" :class="{ 'refreshing': isRefreshing }">

            <span class="material-icons">refresh</span>

          </va-button>
          <div class="notification-bell" @click="toggleNotifications">
            <span class="material-icons">notifications</span>
            <span v-if="unreadNotifications > 0" class="notification-badge">{{ unreadNotifications }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>
<style src="src/assets/EstiloBase.css" scoped></style>
<script></script>