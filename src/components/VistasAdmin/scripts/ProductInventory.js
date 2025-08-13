import ProductDetailsModal from '../ComponentesAdmin/ProductDetailsModal.vue'
import InventoryMovementDetailsModal from '../ComponentesAdmin/InventoryMovementDetailsModal.vue'
import { InventoryTableMixin } from './mixins/InventoryTableMixin.js'
import { MovementsTableMixin } from './mixins/MovementsTableMixin.js'
import { CommonUtilsMixin } from './mixins/CommonUtilsMixin.js'

export default {
  name: 'ProductInventory',
  mixins: [
    CommonUtilsMixin,
    InventoryTableMixin,
    MovementsTableMixin
  ],
  components: {
    ProductDetailsModal,
    InventoryMovementDetailsModal
  },
  
  // Inicialización del componente
  async created() {
    // Cargar datos iniciales de inventario
    await Promise.all([
      this.fetchProducts(),
      this.fetchMaterialTypes()
    ])
  }
}
