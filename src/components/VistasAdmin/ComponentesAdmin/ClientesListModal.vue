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
              <button class="search-btn">
                <i class="fas fa-search"></i>
              </button>
            </div>
            <button class="close-btn" @click="close">
              <i class="fas fa-times"></i>
            </button>
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
                    <button 
                      class="btn btn-sm btn-select"
                      @click="selectClient(cliente)"
                    >
                      <i class="fas fa-check mr-1"></i>Seleccionar
                    </button>
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
          <button class="btn btn-outline-secondary" @click="close">
            <i class="fas fa-times mr-1"></i>Cancelar
          </button>
          <button 
            class="btn btn-primary" 
            @click="showNewClientModal = true"
          >
            <i class="fas fa-plus mr-1"></i>Nuevo Cliente
          </button>
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
          // Datos de prueba - reemplazar con API real
          this.clientes = [
            {
              id: 1,
              nombre: 'Juan Pérez',
              telefono: '555-123-4567',
              email: 'juan@example.com',
              direccion: 'Calle Principal 123',
              ultima_visita: '2023-05-15',
              vehiculos: [
                { marca: 'Toyota', modelo: 'Corolla', ano: 2020, placa: 'ABC123' }
              ]
            },
            {
              id: 2,
              nombre: 'María Gómez',
              telefono: '555-234-5678',
              email: 'maria@example.com',
              direccion: 'Avenida Central 456',
              ultima_visita: '2023-05-10',
              vehiculos: [
                { marca: 'Honda', modelo: 'Civic', ano: 2018, placa: 'DEF456' },
                { marca: 'Ford', modelo: 'F-150', ano: 2019, placa: 'GHI789' }
              ]
            },
            {
              id: 3,
              nombre: 'Carlos Rodríguez',
              telefono: '555-345-6789',
              email: 'carlos@example.com',
              direccion: 'Boulevard Norte 789',
              ultima_visita: '2023-04-28',
              vehiculos: [
                { marca: 'Volkswagen', modelo: 'Golf', ano: 2021, placa: 'JKL012' }
              ]
            }
          ];
          this.filteredClients = [...this.clientes];
          
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