<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container clientes-modal">
        <div class="modal-header">
          <h3><i class="fas fa-users mr-2"></i>Seleccionar Cliente</h3>
          <div class="header-actions">
            <div class="search-input">
              <input 
                v-model="searchQuery" 
                placeholder="Buscar cliente..."
                @input="searchClients"
              >
              <va-button    icon="search">
        
                
              
      </va-button>
            </div>
            <va-button  @click="close"    icon="times">
        
              
            
      </va-button>
          </div>
        </div>
        
        <div class="modal-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="sortBy('nombre')">
                    Nombre <i :class="sortIcon('nombre')"></i>
                  </th>
                  <th @click="sortBy('telefono')">
                    Teléfono <i :class="sortIcon('telefono')"></i>
                  </th>
                  <th @click="sortBy('vehiculos.length')">
                    Vehículos <i :class="sortIcon('vehiculos.length')"></i>
                  </th>
                  <th>Última Visita</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cliente in filteredClients" :key="cliente.id">
                  <td>{{ cliente.nombre }}</td>
                  <td>{{ cliente.telefono || '-' }}</td>
                  <td>{{ cliente.vehiculos ? cliente.vehiculos.length : 0 }}</td>
                  <td>{{ formatDate(cliente.ultima_visita) }}</td>
                  <td>
                    <va-button 
                      @click="selectClient(cliente)"
                      size="small"  icon="check">
        
                      Seleccionar
                    
      </va-button>
                  </td>
                </tr>
                <tr v-if="filteredClients.length === 0">
                  <td colspan="5" class="text-center py-4">
                    No se encontraron clientes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="modal-footer">
          <va-button  @click="close"   preset="outline" icon="times">
        
            Cancelar
          
      </va-button>
          <va-button  
            @click="showNewClientModal = true"
           color="primary"   icon="plus">
        
            Nuevo Cliente
          
      </va-button>
        </div>
      </div>
  
      <!-- Modal para nuevo cliente -->
      <NewClientModal 
        v-if="showNewClientModal"
        @close="showNewClientModal = false"
        @save="addNewClient"
      />
    </div>
  </template>
  
  <script>
  import NewClientModal from './NewClientModal.vue'
  
  export default {
    components: {
      NewClientModal
    },
    
    data() {
      return {
        clientes: [],
        filteredClients: [],
        searchQuery: '',
        sortField: 'nombre',
        sortDirection: 'asc',
        showNewClientModal: false
      }
    },
    
    computed: {
      sortIcon() {
        return (field) => {
          if (this.sortField !== field) return 'fas fa-sort'
          return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
        }
      }
    },
    
    methods: {
      async loadClients() {
        try {
          // Llamada API real (descomentar cuando esté lista)
          // const response = await this.$http.get('/api/clientes');
          // this.clientes = response.data;
          // this.filteredClients = [...this.clientes];
        } catch (error) {
          console.error("Error cargando clientes:", error);
        }
      },
      
      searchClients() {
  if (!this.searchQuery) {
    this.filteredClients = [...this.clientes];
    return;
  }
  
  const query = this.searchQuery.toLowerCase();
  this.filteredClients = this.clientes.filter(cliente => {
    return (
      cliente.nombre.toLowerCase().includes(query) ||
      (cliente.telefono && cliente.telefono.includes(query)) ||
      (cliente.email && cliente.email.toLowerCase().includes(query)) ||
      (cliente.vehiculos && cliente.vehiculos.some(v => 
        v.placa && v.placa.toLowerCase().includes(query)
      ))
    );
  });
},
      
      sortBy(field) {
        if (this.sortField === field) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField = field;
          this.sortDirection = 'asc';
        }
        
        this.filteredClients.sort((a, b) => {
          // Manejo especial para vehiculos.length
          const aValue = field === 'vehiculos.length' 
            ? (a.vehiculos ? a.vehiculos.length : 0)
            : a[field];
          
          const bValue = field === 'vehiculos.length' 
            ? (b.vehiculos ? b.vehiculos.length : 0)
            : b[field];
          
          if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      },
      
      selectClient(cliente) {
        this.$emit('select', cliente);
        this.close();
      },
      
      addNewClient(newClient) {
        // Generar ID temporal (en producción lo haría el backend)
        const newId = Math.max(...this.clientes.map(c => c.id), 0) + 1;
        const cliente = { id: newId, ...newClient, vehiculos: [] };
        
        this.clientes.unshift(cliente);
        this.filteredClients.unshift(cliente);
        this.showNewClientModal = false;
        
        // Llamada API real (descomentar cuando esté lista)
        // await this.$http.post('/api/clientes', newClient);
        // this.loadClients(); // Recargar lista
      },
      
      formatDate(dateString) {
        if (!dateString) return 'Nunca';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      },
      
      close() {
        this.$emit('close');
      }
    },
    
    mounted() {
      this.loadClients();
    }
  }
  </script>
  
  <style scoped>
  
  </style>