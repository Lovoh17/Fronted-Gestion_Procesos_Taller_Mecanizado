<template>
    <transition name="slide-fade">
      <div class="toast-notification" :class="'toast-' + type" v-if="show">
        <div class="toast-icon">
          <i class="fas" :class="getIcon()"></i>
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ message }}</p>
        </div>
        <button class="toast-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
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
  
  <style scoped>
  .toast-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    min-width: 300px;
    max-width: 400px;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 1100;
    animation: fadeIn 0.3s ease;
  }
  
  .toast-success {
    background-color: #d4edda;
    color: #155724;
    border-left: 4px solid #28a745;
  }
  
  .toast-error {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 4px solid #dc3545;
  }
  
  .toast-warning {
    background-color: #fff3cd;
    color: #856404;
    border-left: 4px solid #ffc107;
  }
  
  .toast-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border-left: 4px solid #17a2b8;
  }
  
  .toast-icon {
    font-size: 1.5rem;
  }
  
  .toast-content {
    flex: 1;
  }
  
  .toast-message {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .toast-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
    align-self: flex-start;
  }
  
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }
  
  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }
  
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 576px) {
    .toast-notification {
      min-width: auto;
      width: calc(100% - 40px);
      max-width: none;
    }
  }
  </style>