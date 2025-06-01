<template>
  <div class="date-range-picker">
    <div class="date-inputs">
      <div class="date-input">
        <label>{{ locale.fromLabel }}</label>
        <input 
          type="date" 
          v-model="localStartDate" 
          @change="updateRange"
          :max="localEndDate"
        >
      </div>
      <div class="date-input">
        <label>{{ locale.toLabel }}</label>
        <input 
          type="date" 
          v-model="localEndDate" 
          @change="updateRange"
          :min="localStartDate"
        >
      </div>
    </div>
    
    <div class="preset-ranges">
      <button 
        v-for="(range, label) in ranges" 
        :key="label"
        @click="setPresetRange(range)"
        class="preset-btn"
        :class="{ 'active': isActivePreset(range) }"
      >
        {{ label }}
      </button>
      <button 
        v-if="showCustomRange" 
        class="preset-btn"
        :class="{ 'active': isCustomRangeSelected }"
      >
        {{ locale.customRangeLabel }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateRangePicker',
  props: {
    modelValue: {
      type: Object,
      required: true,
      validator: value => {
        return value.start instanceof Date && value.end instanceof Date
      }
    },
    ranges: {
      type: Object,
      default: () => ({
        'Hoy': [new Date(), new Date()],
        'Ayer': [new Date(Date.now() - 864e5), new Date(Date.now() - 864e5)],
        'Últimos 7 días': [new Date(Date.now() - 7 * 864e5), new Date()],
        'Últimos 30 días': [new Date(Date.now() - 30 * 864e5), new Date()],
        'Este mes': [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
        'Mes pasado': [
          new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), 
          new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        ]
      })
    },
    locale: {
      type: Object,
      default: () => ({
        fromLabel: 'Desde',
        toLabel: 'Hasta',
        customRangeLabel: 'Personalizado'
      })
    },
    showCustomRange: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localStartDate: this.formatDate(this.modelValue.start),
      localEndDate: this.formatDate(this.modelValue.end)
    }
  },
  computed: {
    isCustomRangeSelected() {
      return !Object.values(this.ranges).some(range => 
        this.formatDate(range[0]) === this.localStartDate &&
        this.formatDate(range[1]) === this.localEndDate
      )
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(newVal) {
        this.localStartDate = this.formatDate(newVal.start)
        this.localEndDate = this.formatDate(newVal.end)
      }
    }
  },
  methods: {
    formatDate(date) {
      if (!(date instanceof Date)) return ''
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    updateRange() {
      if (!this.localStartDate || !this.localEndDate) return
      
      this.$emit('update:modelValue', {
        start: new Date(this.localStartDate),
        end: new Date(this.localEndDate)
      })
    },
    setPresetRange(range) {
      this.localStartDate = this.formatDate(range[0])
      this.localEndDate = this.formatDate(range[1])
      this.updateRange()
    },
    isActivePreset(range) {
      return (
        this.formatDate(range[0]) === this.localStartDate &&
        this.formatDate(range[1]) === this.localEndDate
      )
    }
  }
}
</script>

