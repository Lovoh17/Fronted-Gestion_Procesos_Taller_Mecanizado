<template>
  <Teleport to="body">
    <VaToast 
      v-if="show"
      :message="message"
      :color="toastColor"
      :icon="toastIcon"
      :position="position"
      :duration="duration"
      :closeable="closeable"
      @close="handleClose"
    />
  </Teleport>
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
    },
    position: {
      type: String,
      default: 'bottom-right'
    },
    duration: {
      type: Number,
      default: 4000
    },
    closeable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    toastColor() {
      const colors = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
      };
      return colors[this.type] || 'info';
    },
    toastIcon() {
      const icons = {
        'success': 'check_circle',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
      };
      return icons[this.type] || 'info';
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>
