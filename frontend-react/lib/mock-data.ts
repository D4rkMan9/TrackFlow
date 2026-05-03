import type { Shipment, User, StatusHistoryEntry } from './types'

export const mockUser: User = {
  id: '1',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '+54 11 1234-5678',
  initials: 'JP',
}

export const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingNumber: 'ENV2512345678',
    description: 'Notebook Dell XPS 15',
    weight: 2.5,
    estimatedDate: new Date('2026-05-01'),
    status: 'EN_TRANSITO',
    recipient: {
      firstName: 'María',
      lastName: 'González',
      address: 'Av. Corrientes 1234, Piso 5',
      city: 'Buenos Aires',
      postalCode: 'C1043AAZ',
      phone: '+54 11 9876-5432',
    },
    history: [
      {
        status: 'PENDIENTE',
        description: 'Envío registrado en el sistema',
        timestamp: new Date('2026-04-20T10:00:00'),
        location: 'Centro de Distribución Córdoba',
      },
      {
        status: 'PROCESANDO',
        description: 'Paquete recibido y en preparación',
        timestamp: new Date('2026-04-21T14:30:00'),
        location: 'Centro de Distribución Córdoba',
      },
      {
        status: 'EN_TRANSITO',
        description: 'En camino hacia destino',
        timestamp: new Date('2026-04-22T08:15:00'),
        location: 'Ruta Nacional 9',
      },
    ],
    createdAt: new Date('2026-04-20T10:00:00'),
  },
  {
    id: '2',
    trackingNumber: 'ENV2587654321',
    description: 'iPhone 15 Pro Max',
    weight: 0.5,
    estimatedDate: new Date('2026-04-28'),
    status: 'ENTREGADO',
    recipient: {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      address: 'Calle San Martín 456',
      city: 'Rosario',
      postalCode: 'S2000',
      phone: '+54 341 456-7890',
    },
    history: [
      {
        status: 'PENDIENTE',
        description: 'Envío registrado en el sistema',
        timestamp: new Date('2026-04-15T09:00:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
      {
        status: 'PROCESANDO',
        description: 'Paquete recibido y en preparación',
        timestamp: new Date('2026-04-15T16:00:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
      {
        status: 'EN_TRANSITO',
        description: 'En camino hacia destino',
        timestamp: new Date('2026-04-16T07:00:00'),
        location: 'Autopista Buenos Aires - Rosario',
      },
      {
        status: 'EN_DISTRIBUCION',
        description: 'En reparto local',
        timestamp: new Date('2026-04-17T10:30:00'),
        location: 'Centro de Distribución Rosario',
      },
      {
        status: 'ENTREGADO',
        description: 'Entregado al destinatario',
        timestamp: new Date('2026-04-17T14:45:00'),
        location: 'Rosario, Santa Fe',
      },
    ],
    createdAt: new Date('2026-04-15T09:00:00'),
  },
  {
    id: '3',
    trackingNumber: 'ENV2511112222',
    description: 'Auriculares Sony WH-1000XM5',
    weight: 0.3,
    estimatedDate: new Date('2026-05-05'),
    status: 'PENDIENTE',
    recipient: {
      firstName: 'Ana',
      lastName: 'Martínez',
      address: 'Pasaje Los Robles 789',
      city: 'Mendoza',
      postalCode: 'M5500',
      phone: '+54 261 234-5678',
    },
    history: [
      {
        status: 'PENDIENTE',
        description: 'Envío registrado en el sistema',
        timestamp: new Date('2026-04-26T11:00:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
    ],
    createdAt: new Date('2026-04-26T11:00:00'),
  },
  {
    id: '4',
    trackingNumber: 'ENV2533334444',
    description: 'Zapatillas Nike Air Max',
    weight: 1.0,
    estimatedDate: new Date('2026-04-30'),
    status: 'EN_DISTRIBUCION',
    recipient: {
      firstName: 'Pedro',
      lastName: 'López',
      address: 'Av. Libertador 2500',
      city: 'San Miguel de Tucumán',
      postalCode: 'T4000',
      phone: '+54 381 987-6543',
    },
    history: [
      {
        status: 'PENDIENTE',
        description: 'Envío registrado en el sistema',
        timestamp: new Date('2026-04-18T08:00:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
      {
        status: 'PROCESANDO',
        description: 'Paquete recibido y en preparación',
        timestamp: new Date('2026-04-18T15:00:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
      {
        status: 'EN_TRANSITO',
        description: 'En camino hacia destino',
        timestamp: new Date('2026-04-19T06:30:00'),
        location: 'Ruta Nacional 9',
      },
      {
        status: 'EN_DISTRIBUCION',
        description: 'En reparto local',
        timestamp: new Date('2026-04-25T09:00:00'),
        location: 'Centro de Distribución Tucumán',
      },
    ],
    createdAt: new Date('2026-04-18T08:00:00'),
  },
  {
    id: '5',
    trackingNumber: 'ENV2555556666',
    description: 'Cámara Canon EOS R5',
    weight: 1.8,
    estimatedDate: new Date('2026-04-22'),
    status: 'CANCELADO',
    recipient: {
      firstName: 'Laura',
      lastName: 'Fernández',
      address: 'Calle Belgrano 123',
      city: 'Salta',
      postalCode: 'A4400',
      phone: '+54 387 111-2222',
    },
    history: [
      {
        status: 'PENDIENTE',
        description: 'Envío registrado en el sistema',
        timestamp: new Date('2026-04-10T12:00:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
      {
        status: 'CANCELADO',
        description: 'Envío cancelado por el remitente',
        timestamp: new Date('2026-04-11T09:30:00'),
        location: 'Centro de Distribución Buenos Aires',
      },
    ],
    createdAt: new Date('2026-04-10T12:00:00'),
  },
]

export function getShipmentById(id: string): Shipment | undefined {
  return mockShipments.find((s) => s.id === id)
}

export function getShipmentByTrackingNumber(trackingNumber: string): Shipment | undefined {
  return mockShipments.find(
    (s) => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase()
  )
}

export function getShipmentStats() {
  const total = mockShipments.length
  const enTransito = mockShipments.filter(
    (s) => s.status === 'EN_TRANSITO' || s.status === 'EN_DISTRIBUCION'
  ).length
  const entregados = mockShipments.filter((s) => s.status === 'ENTREGADO').length

  return { total, enTransito, entregados }
}
