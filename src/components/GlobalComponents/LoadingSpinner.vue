<template>
  <div class="loading-container" :class="containerClass">
    <VaProgressCircular 
      :size="progressSize"
      :thickness="thickness"
      :color="color"
      :indeterminate="true"
    />
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    color: {
      type: String,
      default: 'primary'
    },
    message: {
      type: String,
      default: ''
    },
    overlay: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    containerClass() {
      return {
        'loading-overlay': this.overlay,
        'loading-fullscreen': this.fullscreen,
        [`loading-${this.size}`]: true
      };
    },
    progressSize() {
      const sizes = {
        small: '30px',
        medium: '50px', 
        large: '70px'
      };
      return sizes[this.size] || '50px';
    },
    thickness() {
      const thickness = {
        small: 0.1,
        medium: 0.15,
        large: 0.2
      };
      return thickness[this.size] || 0.15;
    }
  }
};
</script>

<style >
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 9999;
}

.loading-message {
  margin-top: 15px;
  color: var(--va-text-secondary);
  font-size: 14px;
  text-align: center;
}
</style>
