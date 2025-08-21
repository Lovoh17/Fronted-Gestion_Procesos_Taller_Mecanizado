<template>
  <div>
    <button @click="showModal = true">Abrir Modal</button>
    
    <WorkOrderModal 
      :show="showModal" 
      mode="create" 
      @save="handleSave" 
      @close="showModal = false" 
    />
  </div>
</template>

<script>
import WorkOrderModal from '../ComponentesCoordinador/WorkOrderModal.vue'

export default {
  components: {
    WorkOrderModal
  },
  data() {
    return {
      showModal: false
    }
  },
  methods: {
    handleSave(pedidoData) {
      console.log('Pedido guardado:', pedidoData)
      this.showModal = false
    }
  }
}
</script>