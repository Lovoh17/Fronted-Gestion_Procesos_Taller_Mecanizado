
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
      default: '#1976d2'
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
    spinnerClass() {
      return `spinner-${this.size}`;
    },
    spinnerStyle() {
      return {
        '--spinner-color': this.color
      };
    }
  }
};