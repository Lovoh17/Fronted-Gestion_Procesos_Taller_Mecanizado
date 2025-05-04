<template>
    <div class="date-range-picker">
      <div class="date-inputs">
        <div class="date-input">
          <label>Desde</label>
          <input 
            type="date" 
            v-model="localStartDate" 
            @change="updateRange"
            :max="localEndDate"
          >
        </div>
        <div class="date-input">
          <label>Hasta</label>
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
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DateRangePicker',
    props: {
      modelValue: {
        type: Object,
        required: true
      },
      ranges: {
        type: Object,
        default: () => ({
          'Hoy': [new Date(), new Date()],
          'Ayer': [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))],
          'Últimos 7 días': [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
          'Últimos 30 días': [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
          'Este mes': [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
          'Mes pasado': [new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
        })
      },
      locale: {
        type: Object,
        default: () => ({
          format: 'yyyy-MM-dd',
          separator: ' - ',
          applyLabel: 'Aplicar',
          cancelLabel: 'Cancelar',
          fromLabel: 'Desde',
          toLabel: 'Hasta',
          customRangeLabel: 'Personalizado'
        })
      }
    },
    data() {
      return {
        localStartDate: this.formatDate(this.modelValue.start),
        localEndDate: this.formatDate(this.modelValue.end)
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
        if (!date) return ''
        const d = new Date(date)
        const year = d.getFullYear()
        const month = `${d.getMonth() + 1}`.padStart(2, '0')
        const day = `${d.getDate()}`.padStart(2, '0')
        return `${year}-${month}-${day}`
      },
      updateRange() {
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
  
  <style scoped>
 
  </style>