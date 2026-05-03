import { API_ROUTES } from './config'
import type { Shipment, User, ShipmentStatus } from './types'

// --- Token helpers ---

const TOKEN_KEY = 'trackflow_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// --- Fetch helper ---

async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Error de conexión' }))
    throw new ApiError(res.status, body.error || 'Error desconocido')
  }

  return res.json()
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// --- Auth ---

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  const data = await apiFetch<{ token: string; user: User }>(
    API_ROUTES.login,
    { method: 'POST', body: JSON.stringify({ email, password }) }
  )
  setToken(data.token)
  return data
}

export async function registro(data: {
  nombre: string
  apellido: string
  email: string
  telefono: string
  password: string
}): Promise<{ message: string; user: { id: number; nombre: string; apellido: string; email: string } }> {
  return apiFetch(API_ROUTES.registro, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getMe(): Promise<User> {
  return apiFetch(API_ROUTES.me)
}

export async function updatePerfil(data: {
  nombre?: string
  apellido?: string
  telefono?: string
}): Promise<{ message: string; user: User }> {
  return apiFetch(API_ROUTES.perfil, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function cambiarPassword(
  password_actual: string,
  password_nuevo: string
): Promise<{ message: string }> {
  return apiFetch(API_ROUTES.cambiarPassword, {
    method: 'PUT',
    body: JSON.stringify({ password_actual, password_nuevo }),
  })
}

// --- Envíos ---

export async function getEnvios(): Promise<Shipment[]> {
  const data = await apiFetch<any[]>(API_ROUTES.envios)
  return data.map(parseShipment)
}

export async function getEnvioById(id: string): Promise<Shipment> {
  const data = await apiFetch<any>(API_ROUTES.envioById(id))
  return parseShipment(data)
}

export async function crearEnvio(data: {
  weight: number
  description: string
  estimatedDate: string
  recipient: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    phone: string
  }
}): Promise<{ id: number; trackingNumber: string; status: string }> {
  return apiFetch(API_ROUTES.envios, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function cancelarEnvio(
  id: string
): Promise<{ message: string; status: string }> {
  return apiFetch(API_ROUTES.cancelarEnvio(id), {
    method: 'DELETE',
  })
}

export async function getEnviosStats(): Promise<{
  total: number
  enTransito: number
  entregados: number
}> {
  return apiFetch(API_ROUTES.enviosStats)
}

// --- Tracking público ---

export async function getTracking(
  numero: string
): Promise<Shipment> {
  const data = await apiFetch<any>(API_ROUTES.tracking(numero))
  return parseShipment(data)
}

// --- Admin ---

export async function getAdminEnvios(params?: {
  estado?: string
  q?: string
}): Promise<Shipment[]> {
  const searchParams = new URLSearchParams()
  if (params?.estado) searchParams.set('estado', params.estado)
  if (params?.q) searchParams.set('q', params.q)
  const url = params
    ? `${API_ROUTES.adminEnvios}?${searchParams.toString()}`
    : API_ROUTES.adminEnvios
  const data = await apiFetch<any[]>(url)
  return data.map(parseShipment)
}

export async function actualizarEstadoAdmin(
  id: string,
  estado: ShipmentStatus,
  descripcion?: string
): Promise<{ message: string; estado_nuevo: string }> {
  return apiFetch(API_ROUTES.adminEstado(id), {
    method: 'PUT',
    body: JSON.stringify({ estado, descripcion }),
  })
}

export async function getAdminStats(): Promise<{
  total: number
  enTransito: number
  entregados: number
  pendientes: number
  cancelados: number
}> {
  return apiFetch(API_ROUTES.adminStats)
}

// --- Parser: convierte strings ISO de la API a Date objects ---

function parseShipment(raw: any): Shipment {
  return {
    id: String(raw.id),
    trackingNumber: raw.trackingNumber,
    description: raw.description || '',
    weight: Number(raw.weight),
    estimatedDate: raw.estimatedDate ? new Date(raw.estimatedDate) : new Date(),
    status: raw.status,
    recipient: {
      firstName: raw.recipient.firstName,
      lastName: raw.recipient.lastName,
      address: raw.recipient.address,
      city: raw.recipient.city,
      postalCode: raw.recipient.postalCode || '',
      phone: raw.recipient.phone || '',
    },
    history: (raw.history || []).map((h: any) => ({
      status: h.status,
      description: h.description || '',
      timestamp: new Date(h.timestamp),
      location: h.location,
    })),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  }
}
