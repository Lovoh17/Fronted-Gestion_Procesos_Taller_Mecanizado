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
  .date-range-picker {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 0.875rem;
  }
  
  .date-inputs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .date-input {
    flex: 1;
  }
  
  .date-input label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #495057;
  }
  
  .date-input input {
    width: 100%;
    padding: 0.375rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .preset-ranges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .preset-btn {
    padding: 0.25rem 0.75rem;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s;
  }
  
  .preset-btn:hover {
    background-color: #e9ecef;
  }
  
  .preset-btn.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  @media (max-width: 576px) {
    .date-inputs {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
  </style>