const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const API_ROUTES = {
  // Auth
  login: `${API_BASE_URL}/api/auth/login`,
  registro: `${API_BASE_URL}/api/auth/registro`,
  me: `${API_BASE_URL}/api/auth/me`,
  perfil: `${API_BASE_URL}/api/auth/perfil`,
  cambiarPassword: `${API_BASE_URL}/api/auth/cambiar-password`,

  // Envíos
  envios: `${API_BASE_URL}/api/envios`,
  envioById: (id: string) => `${API_BASE_URL}/api/envios/${id}`,
  cancelarEnvio: (id: string) => `${API_BASE_URL}/api/envios/${id}`,
  enviosStats: `${API_BASE_URL}/api/envios/stats`,

  // Tracking público
  tracking: (numero: string) => `${API_BASE_URL}/api/tracking/${numero}`,

  // Admin
  adminEnvios: `${API_BASE_URL}/api/admin/envios`,
  adminEstado: (id: string) => `${API_BASE_URL}/api/admin/envios/${id}/estado`,
  adminStats: `${API_BASE_URL}/api/admin/stats`,
}
