'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  getToken,
  setToken,
  removeToken,
  login as apiLogin,
  registro as apiRegistro,
  getMe,
  ApiError,
} from '@/lib/api'
import type { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  registro: (data: {
    nombre: string
    apellido: string
    email: string
    telefono: string
    password: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const userData = await getMe()
      setUser(userData)
    } catch {
      removeToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password)
    setToken(data.token)
    setUser(data.user)
  }

  const registroHandler = async (data: {
    nombre: string
    apellido: string
    email: string
    telefono: string
    password: string
  }) => {
    await apiRegistro(data)
    // After registration, log in automatically
    await login(data.email, data.password)
  }

  const logout = () => {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        registro: registroHandler,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
