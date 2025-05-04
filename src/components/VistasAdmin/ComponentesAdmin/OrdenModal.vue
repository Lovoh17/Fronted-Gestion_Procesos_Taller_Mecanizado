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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #2c3e50;
  }
  
  form {
    padding: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
  }
  
  .form-group {
    flex: 1;
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .form-group textarea {
    min-height: 80px;
    resize: vertical;
  }
  
  .products-selector {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 10px;
  }
  
  .product-item {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .product-item select {
    flex: 2;
  }
  
  .product-item input {
    flex: 1;
    max-width: 80px;
  }
  
  .product-subtotal {
    flex: 1;
    text-align: right;
    padding: 0 10px;
    font-weight: 500;
  }
  
  .btn-icon.danger {
    color: #dc3545;
  }
  
  .btn-icon.danger:hover {
    background: #f8d7da;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .btn-outline {
    background: white;
    border: 1px solid #ddd;
    color: #6c757d;
  }
  
  .btn-outline:hover {
    background: #f8f9fa;
  }
  </style>