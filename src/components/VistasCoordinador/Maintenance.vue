<template>
  <div class="container">
    <!-- Encabezado y controles -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon">
            <i class="fas fa-tools"></i>
          </div>
          <div class="header-text">
            <h1 class="header-title">Gestión de Producción</h1>
            <p class="header-subtitle">Administra y controla los procesos productivos</p>
          </div>
        </div>
        <div class="header-actions">
          <va-button color="#003366" @click="openCreateModal = true" icon="add">
            Nuevo Pedido
          </va-button>
        </div>
      </div>
    </div>

    <div class="header">
      <h2>Gestión de Mantenimientos</h2>
      <div class="controls">
        <input type="text" v-model="searchQuery" placeholder="Buscar mantenimientos..." class="search-input">

      </div>
    </div>

    <!-- Estado de carga/error -->
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Tabla de mantenimientos -->
    <table v-if="!loading && !error">
      <thead>
        <tr>
          <th @click="sortBy('nombre')">
            Nombre
            <SortIcon :direction="sortDirection('nombre')" />
          </th>
          <th @click="sortBy('herramienta_id')">
            Herramienta
            <SortIcon :direction="sortDirection('herramienta_id')" />
          </th>
          <th @click="sortBy('tipo_mantenimiento_id')">
            Tipo
            <SortIcon :direction="sortDirection('tipo_mantenimiento_id')" />
          </th>
          <th @click="sortBy('fecha_programada')">
            Fecha Programada
            <SortIcon :direction="sortDirection('fecha_programada')" />
          </th>
          <th @click="sortBy('estado_id')">
            Estado
            <SortIcon :direction="sortDirection('estado_id')" />
          </th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filteredMantenimientos" :key="m.id">
          <td>{{ m.nombre }}</td>
          <td>{{ getHerramientaName(m.herramienta_id) }}</td>
          <td>{{ getTipoMantenimientoName(m.tipo_mantenimiento_id) }}</td>
          <td>{{ formatDate(m.fecha_programada) }}</td>
          <td>{{ getEstadoName(m.estado_id) }}</td>
          <td class="actions">
            <button @click="openEditModal(m)" class="btn small">Editar</button>
            <button @click="deleteMantenimiento(m.id)" class="btn small danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal para crear/editar -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalMode === 'create' ? 'Nuevo' : 'Editar' }} Mantenimiento</h3>

        <form @submit.prevent="saveMantenimiento">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="currentMantenimiento.nombre" required>
          </div>

          <div class="form-group">
            <label>Herramienta:</label>
            <select v-model="currentMantenimiento.herramienta_id" required>
              <option v-for="(h, id) in herramientas" :key="id" :value="id">
                {{ h.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Tipo de Mantenimiento:</label>
            <select v-model="currentMantenimiento.tipo_mantenimiento_id" required>
              <option v-for="(t, id) in tiposMantenimiento" :key="id" :value="id">
                {{ t.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fecha Programada:</label>
            <input type="date" v-model="currentMantenimiento.fecha_programada" required>
          </div>

          <div class="form-group">
            <label>Descripción del Problema:</label>
            <textarea v-model="currentMantenimiento.descripcion_problema"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="showModal = false" class="btn secondary">
              Cancelar
            </button>
            <button type="submit" class="btn primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script src="./scripts/Maintenance.js"></script>
<style src="./styles/Maintenance.css"></style>
<style src="src/assets/EstiloBase.css"></style>
