export type ShipmentStatus =
  | 'PENDIENTE'
  | 'PROCESANDO'
  | 'EN_TRANSITO'
  | 'EN_DISTRIBUCION'
  | 'ENTREGADO'
  | 'CANCELADO'

export interface StatusHistoryEntry {
  status: ShipmentStatus
  description: string
  timestamp: Date
  location?: string
}

export interface Recipient {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  phone: string
}

export interface Shipment {
  id: string
  trackingNumber: string
  description: string
  weight: number
  estimatedDate: Date
  status: ShipmentStatus
  recipient: Recipient
  history: StatusHistoryEntry[]
  createdAt: Date
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  initials: string
}
