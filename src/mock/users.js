export const mockUsers = [
    {
      username: 'coordinator',
      password: 'coord123',
      user: {
        id: 1,
        name: 'Coordinador de Producción',
        email: 'coordinator@taller.com',
        role: 'coordinator',
        avatar: '/avatars/coordinator.jpg'
      },
      token: 'mock-token-coordinator'
    },
    {
      username: 'admin',
      password: 'admin123',
      user: {
        id: 2,
        name: 'Administrador',
        email: 'admin@taller.com',
        role: 'admin',
        avatar: '/avatars/admin.jpg'
      },
      token: 'mock-token-admin'
    },
    {
      username: 'technician',
      password: 'tech123',
      user: {
        id: 3,
        name: 'Técnico',
        email: 'technician@taller.com',
        role: 'technician',
        avatar: '/avatars/technician.jpg'
      },
      token: 'mock-token-technician'
    }
  ];