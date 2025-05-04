<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Pedido' : 'Nuevo Pedido' }}</h3>
          <button @click="close" class="btn-icon">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <form @submit.prevent="save">
          <div class="form-row">
            <div class="form-group">
              <label>Cliente</label>
              <input v-model="form.client" type="text" required>
            </div>
            
            <div class="form-group">
              <label>Fecha</label>
              <input v-model="form.date" type="date" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Productos</label>
            <div class="products-selector">
              <div class="product-item" v-for="(product, index) in form.products" :key="index">
                <select v-model="product.id" @change="updateProductInfo(index)" required>
                  <option value="">Seleccionar producto</option>
                  <option 
                    v-for="p in availableProducts" 
                    :key="p.id" 
                    :value="p.id"
                    :disabled="isProductSelected(p.id) && !isCurrentProduct(index, p.id)"
                  >
                    {{ p.name }} - ${{ p.price.toLocaleString() }} (Stock: {{ p.stock }})
                  </option>
                </select>
                
                <input 
                  v-model.number="product.quantity" 
                  type="number" 
                  min="1" 
                  :max="getMaxQuantity(index)"
                  @input="calculateTotal"
                  required
                >
                
                <span class="product-subtotal">
                  ${{ (product.price * product.quantity).toLocaleString() }}
                </span>
                
                <button type="button" @click="removeProduct(index)" class="btn-icon danger">
                  <span class="material-icons">delete</span>
                </button>
              </div>
              
              <button type="button" @click="addProduct" class="btn btn-outline">
                <span class="material-icons">add</span>
                Agregar Producto
              </button>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Total</label>
              <input v-model="form.total" type="text" readonly>
            </div>
            
            <div class="form-group">
              <label>Estado</label>
              <select v-model="form.status" required>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En curso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notes"></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="close" class="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      order: {
        type: Object,
        default: null
      },
      products: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        form: {
          client: '',
          date: new Date().toISOString().split('T')[0],
          products: [{ id: '', quantity: 1, price: 0 }],
          total: 0,
          status: 'pending',
          notes: ''
        },
        availableProducts: [...this.products]
      }
    },
    computed: {
      isEditing() {
        return this.order !== null
      }
    },
    created() {
      if (this.order) {
        this.form = JSON.parse(JSON.stringify(this.order))
      }
      this.calculateTotal()
    },
    methods: {
      close() {
        this.$emit('close')
      },
      save() {
        this.$emit('save', this.form)
      },
      addProduct() {
        this.form.products.push({ id: '', quantity: 1, price: 0 })
      },
      removeProduct(index) {
        this.form.products.splice(index, 1)
        this.calculateTotal()
      },
      updateProductInfo(index) {
        const productId = this.form.products[index].id
        const product = this.availableProducts.find(p => p.id === productId)
        if (product) {
          this.form.products[index].price = product.price
          this.form.products[index].name = product.name
        } else {
          this.form.products[index].price = 0
          this.form.products[index].name = ''
        }
        this.calculateTotal()
      },
      calculateTotal() {
        this.form.total = this.form.products.reduce((total, item) => {
          return total + (item.price * item.quantity)
        }, 0)
      },
      isProductSelected(productId) {
        return this.form.products.some(p => p.id === productId)
      },
      isCurrentProduct(index, productId) {
        return this.form.products[index].id === productId
      },
      getMaxQuantity(index) {
        const productId = this.form.products[index].id
        const product = this.availableProducts.find(p => p.id === productId)
        return product ? product.stock : 0
      }
    }
  }
  </script>
  
  <style scoped>
  
  </style>