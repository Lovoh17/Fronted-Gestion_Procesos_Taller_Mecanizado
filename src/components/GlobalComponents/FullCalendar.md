# FullCalendarComponent - Documentación

## Descripción

El `FullCalendarComponent` es un componente Vue 3 personalizado que encapsula la funcionalidad de FullCalendar con un diseño moderno y características avanzadas. Este componente está diseñado específicamente para el sistema de gestión de procesos del taller mecanizado.

## Características Principales

- 🎨 **Interfaz moderna** con header personalizado y controles intuitivos
- 📱 **Completamente responsive** para dispositivos móviles y desktop
- 🔧 **Altamente configurable** con múltiples props y opciones
- 🌐 **Localización en español** con formatos de fecha apropiados
- 🎯 **Sistema de eventos** completo con modales informativos
- 🔒 **Control de permisos** para crear, editar y eliminar eventos
- 🎨 **Estilos personalizados** para diferentes tipos y estados de eventos
- ⚡ **Optimizado** para Vue 3 con Composition API

## Instalación

El componente ya está incluido en el proyecto con todas las dependencias de FullCalendar instaladas:

```bash
# Dependencias ya incluidas en package.json
@fullcalendar/core
@fullcalendar/vue3
@fullcalendar/daygrid
@fullcalendar/timegrid
@fullcalendar/interaction
@fullcalendar/list
```

## Uso Básico

```vue
<template>
  <FullCalendarComponent
    :events="events"
    title="Mi Calendario"
    @event-click="handleEventClick"
  />
</template>

<script>
import FullCalendarComponent from '@/components/GlobalComponents/FullCalendarComponent.vue'

export default {
  components: {
    FullCalendarComponent
  },
  setup() {
    const events = ref([
      {
        id: '1',
        title: 'Reunión de equipo',
        start: '2024-01-15T09:00:00',
        end: '2024-01-15T10:30:00'
      }
    ])

    const handleEventClick = (event) => {
      console.log('Evento clickeado:', event)
    }

    return { events, handleEventClick }
  }
}
</script>
```

## Props

### Configuración Básica

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `title` | String | 'Calendario' | Título mostrado en el header del calendario |
| `events` | Array | [] | Array de eventos a mostrar en el calendario |
| `initialView` | String | 'dayGridMonth' | Vista inicial del calendario |
| `loading` | Boolean | false | Muestra overlay de carga |
| `height` | String/Number | 'auto' | Altura del calendario |

### Configuración de Vistas

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `views` | Array | Vistas predeterminadas | Array de objetos con configuración de vistas disponibles |

**Formato de vistas:**
```javascript
[
  { value: 'dayGridMonth', label: 'Mes', icon: 'fas fa-calendar' },
  { value: 'timeGridWeek', label: 'Semana', icon: 'fas fa-calendar-week' },
  { value: 'timeGridDay', label: 'Día', icon: 'fas fa-calendar-day' },
  { value: 'listWeek', label: 'Lista', icon: 'fas fa-list' }
]
```

### Control de Permisos

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `canCreateEvents` | Boolean | false | Permite crear nuevos eventos |
| `canEditEvents` | Boolean | false | Permite editar eventos existentes |
| `canDeleteEvents` | Boolean | false | Permite eliminar eventos |
| `showControls` | Boolean | true | Muestra controles adicionales |

### Filtrado y Tipos

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `eventTypes` | Array | [] | Tipos de eventos para filtrado |

**Formato de tipos de eventos:**
```javascript
[
  { value: 'meeting', label: 'Reunión' },
  { value: 'maintenance', label: 'Mantenimiento' },
  { value: 'production', label: 'Producción' }
]
```

### Configuración Avanzada

| Prop | Tipo | Defecto | Descripción |
|------|------|---------|-------------|
| `calendarConfig` | Object | {} | Configuraciones adicionales de FullCalendar |

## Eventos (Emits)

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `event-click` | event | Se dispara al hacer clic en un evento |
| `event-create` | - | Se dispara al solicitar crear un nuevo evento |
| `event-edit` | event | Se dispara al solicitar editar un evento |
| `event-delete` | event | Se dispara al solicitar eliminar un evento |
| `date-click` | info | Se dispara al hacer clic en una fecha |
| `view-change` | viewName | Se dispara al cambiar la vista |
| `events-set` | info | Se dispara cuando se establecen los eventos |

## Formato de Eventos

Los eventos deben seguir el formato estándar de FullCalendar con propiedades extendidas:

```javascript
{
  id: 'unique-id',
  title: 'Título del evento',
  start: '2024-01-15T09:00:00', // Fecha de inicio (ISO string)
  end: '2024-01-15T10:30:00',   // Fecha de fin (opcional)
  backgroundColor: '#3b82f6',    // Color de fondo
  borderColor: '#2563eb',        // Color del borde
  textColor: '#ffffff',          // Color del texto
  
  // Propiedades extendidas personalizadas
  extendedProps: {
    type: 'meeting',              // Tipo de evento
    status: 'pending',            // Estado del evento
    description: 'Descripción',   // Descripción detallada
    location: 'Sala A',           // Ubicación
    priority: 'high',             // Prioridad
    assignedTo: 'Juan Pérez',     // Asignado a
    // Cualquier propiedad personalizada...
  }
}
```

## Estilos Personalizados

El componente incluye estilos automáticos basados en las propiedades de los eventos:

### Estados de Eventos
- `pending` - Amarillo/Naranja
- `in-progress` - Azul
- `completed` - Verde
- `cancelled` - Rojo

### Prioridades
- `high` - Borde rojo izquierdo
- `medium` - Borde naranja izquierdo  
- `low` - Borde verde izquierdo

## Ejemplos Avanzados

### Calendario Completo con Permisos

```vue
<template>
  <FullCalendarComponent
    title="Gestión de Producción"
    :events="productionEvents"
    :loading="isLoading"
    :can-create-events="userRole === 'admin'"
    :can-edit-events="canEdit"
    :can-delete-events="canDelete"
    :event-types="eventTypes"
    :calendar-config="advancedConfig"
    @event-create="showCreateModal"
    @event-edit="showEditModal"
    @event-delete="handleDeleteEvent"
  />
</template>

<script>
import { ref, computed } from 'vue'
import FullCalendarComponent from '@/components/GlobalComponents/FullCalendarComponent.vue'

export default {
  components: { FullCalendarComponent },
  setup() {
    const userRole = ref('admin')
    const isLoading = ref(false)
    
    const productionEvents = ref([
      {
        id: '1',
        title: 'Producción Lote A',
        start: '2024-01-15T08:00:00',
        end: '2024-01-15T16:00:00',
        backgroundColor: '#10b981',
        extendedProps: {
          type: 'production',
          status: 'in-progress',
          machine: 'CNC-001',
          operator: 'Juan Pérez',
          priority: 'high'
        }
      }
    ])

    const eventTypes = ref([
      { value: 'production', label: 'Producción' },
      { value: 'maintenance', label: 'Mantenimiento' },
      { value: 'quality', label: 'Control de Calidad' }
    ])

    const advancedConfig = {
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '18:00'
      },
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00',
      editable: true,
      selectable: true
    }

    const canEdit = computed(() => ['admin', 'supervisor'].includes(userRole.value))
    const canDelete = computed(() => userRole.value === 'admin')

    return {
      userRole,
      isLoading,
      productionEvents,
      eventTypes,
      advancedConfig,
      canEdit,
      canDelete
    }
  }
}
</script>
```

### Integración con API

```vue
<script>
import { ref, onMounted } from 'vue'
import { api } from '@/api'

export default {
  setup() {
    const events = ref([])
    const loading = ref(false)

    const loadEvents = async () => {
      try {
        loading.value = true
        const response = await api.get('/events')
        events.value = response.data.map(event => ({
          id: event.id,
          title: event.title,
          start: event.start_date,
          end: event.end_date,
          backgroundColor: getEventColor(event.type),
          extendedProps: {
            type: event.type,
            status: event.status,
            description: event.description
          }
        }))
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        loading.value = false
      }
    }

    const handleEventCreate = async () => {
      // Lógica para crear evento
      await loadEvents() // Recargar eventos
    }

    const handleEventEdit = async (event) => {
      // Lógica para editar evento
      await loadEvents() // Recargar eventos
    }

    const handleEventDelete = async (event) => {
      try {
        await api.delete(`/events/${event.id}`)
        await loadEvents() // Recargar eventos
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }

    onMounted(loadEvents)

    return {
      events,
      loading,
      handleEventCreate,
      handleEventEdit,
      handleEventDelete
    }
  }
}
</script>
```

## Personalización de Estilos

Para personalizar los estilos del calendario, puedes sobrescribir las clases CSS:

```css
/* Personalizar colores del header */
.full-calendar-container .calendar-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Personalizar eventos */
.full-calendar-container :deep(.fc-event) {
  border-radius: 8px;
  font-weight: 600;
}

/* Estilos personalizados para tipos específicos */
.full-calendar-container :deep(.event-type-production) {
  background: #10b981 !important;
  border-left: 4px solid #059669;
}
```

## Mejores Prácticas

1. **Gestión de Estado**: Usa un store (Pinia) para manejar eventos compartidos entre componentes
2. **Optimización**: Evita recrear el array de eventos innecesariamente
3. **Validación**: Valida siempre los datos de eventos antes de pasarlos al componente
4. **Accesibilidad**: Proporciona textos alt y títulos descriptivos
5. **Responsive**: Testa en diferentes tamaños de pantalla

## Troubleshooting

### Eventos no se muestran
- Verifica que los eventos tengan el formato correcto
- Asegúrate de que las fechas estén en formato ISO
- Revisa la configuración de `initialView`

### Problemas de rendimiento
- Limita el número de eventos mostrados simultáneamente
- Usa paginación o filtrado por fechas
- Considera usar `loading` durante la carga de datos

### Estilos no se aplican
- Verifica que uses `:deep()` para estilos de FullCalendar
- Asegúrate de que la especificidad CSS sea suficiente
- Revisa que los nombres de clases sean correctos

## Compatibilidad

- **Vue**: 3.x
- **FullCalendar**: 6.x
- **Navegadores**: Modernos (Chrome, Firefox, Safari, Edge)
- **Mobile**: Compatible con touch events

## Contribuciones

Para contribuir al componente:

1. Mantén la compatibilidad con la API existente
2. Añade tests para nuevas funcionalidades
3. Actualiza la documentación
4. Sigue las convenciones de código del proyecto
