<template>
    <transition name="slide-fade">
      <div class="toast-notification" :class="'toast-' + type" v-if="show">
        <div class="toast-icon">
          <i class="fas" :class="getIcon()"></i>
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ message }}</p>
        </div>
        <va-button class="toast-close" @click="$emit('close')"    icon="times">
      </va-button>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: 'ToastNotification',
    props: {
      message: {
        type: String,
        required: true
      },
      type: {
        type: String,
        default: 'success',
        validator: value => ['success', 'error', 'warning', 'info'].includes(value)
      },
      show: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      getIcon() {
        const icons = {
          'success': 'fa-check-circle',
          'error': 'fa-exclamation-circle',
          'warning': 'fa-exclamation-triangle',
          'info': 'fa-info-circle'
        }
        return icons[this.type] || 'fa-info-circle'
      }
    }
  }
  </script>
