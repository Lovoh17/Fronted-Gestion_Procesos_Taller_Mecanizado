export const mockUsers = [
  // puesto_id: 1 Jefe de Taller (nivel_jerarquico: 1, es_supervisor: true)
  {
    username: 'jefeTaller@taller.com',
    password: 'jefe123',
    user: {
      id: 10,
      name: ' RafaelLino',
      email: 'jefeTaller@taller.com',
      role: 'jefe_taller',
      puesto_id: 1,
      nivel_jerarquico: 1,
      es_supervisor: true,
      avatar: '../stores/images/Rafa Note 20 - 2025-08-15 03.37.46.jpg',
      especialidades: ['gestion', 'supervision', 'planificacion'],
      departamento_id: 1
    },
    token: 'mock-token-jefe-taller'
  },

  // puesto_id: 2 Coordinador (nivel_jerarquico: 2, es_supervisor: true)
  {
    username: 'coordinador@taller.com',
    password: 'coord123',
    user: {
      id: 5,
      name: ' Kevin Israel',
      email: 'coordinador@taller.com',
      role: 'coordinador',
      puesto_id: 2,
      nivel_jerarquico: 2,
      es_supervisor: true,
      avatar: '/img/usuarios/jorge_lopez.jpg',
      especialidades: ['supervision', 'calidad_soldadura'],
      departamento_id: 2
    },
    token: 'mock-token-coordinador'
  },

  // puesto_id: 3 Operario (nivel_jerarquico: 3, es_supervisor: false)
  {
    username: 'operario@taller.com',
    password: 'oper123',
    user: {
      id: 1,
      name: 'Gabriel de la O',
      email: 'operario@taller.com',
      role: 'operario',
      puesto_id: 3,
      nivel_jerarquico: 3,
      es_supervisor: false,
      avatar: '/img/usuarios/roberto_sanchez.jpg',
      especialidades: ['soldadura_mig', 'medicion_precision'],
      departamento_id: 1
    },
    token: 'mock-token-operario'
  },

  // puesto_id: 4 Técnico (nivel_jerarquico: 4, es_supervisor: false)
  {
    username: 'tecnico@taller.com',
    password: 'tech123',
    user: {
      id: 7,
      name: 'Arturo Esperanza',
      email: 'tecnico@taller.com',
      role: 'tecnico',
      puesto_id: 4,
      nivel_jerarquico: 4,
      es_supervisor: false,
      avatar: '/img/usuarios/carlos_martin.jpg',
      especialidades: ['preparacion_materiales', 'limpieza'],
      departamento_id: 3,
      contrato_temporal: true,
      fecha_fin_contrato: '2024-04-10'
    },
    token: 'mock-token-tecnico'
  }
];

