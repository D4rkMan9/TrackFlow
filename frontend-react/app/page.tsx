'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TrackingNumber } from '@/components/tracking-number'
import { StatusBadge } from '@/components/status-badge'
import { ShipmentTimeline } from '@/components/shipment-timeline'
import {
  Package,
  ArrowRight,
  Satellite,
  ListChecks,
  Unlock,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import { getTracking, ApiError } from '@/lib/api'
import type { Shipment } from '@/lib/types'

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
        }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

function AnimatedPackage() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      {/* Dashed path circle */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 128 128"
      >
        <circle
          cx="64"
          cy="64"
          r="56"
          fill="none"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="2"
          strokeDasharray="8 8"
          className="animate-spin"
          style={{ animationDuration: '20s' }}
        />
      </svg>
      {/* Package icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-blue-strong">
          <Package className="w-10 h-10 text-primary" />
        </div>
      </div>
      {/* Location pin */}
      <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-success/20 border border-success/40 flex items-center justify-center animate-bounce">
        <MapPin className="w-4 h-4 text-success" />
      </div>
    </div>
  )
}

function TrackingSearchBox() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<Shipment | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setIsLoading(true)
    setResult(null)
    setNotFound(false)
    setErrorMsg('')

    try {
      const shipment = await getTracking(trackingNumber.trim())
      setResult(shipment)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Error al buscar')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Consultá tu envío
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Ej: ENV2512345678"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            className="flex-1 h-12 sm:h-14 bg-card border-border text-foreground font-mono uppercase text-base sm:text-lg placeholder:text-muted-foreground/50 rounded-xl focus:border-primary/40 focus:ring-primary/20 transition-all duration-200"
          />
          <Button
            type="submit"
            disabled={isLoading || !trackingNumber.trim()}
            className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 glow-blue hover:glow-blue-strong"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Buscando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Rastrear
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
      </form>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mt-8 glass-card rounded-2xl p-6 animate-fade-in-up">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-white/5" />
            <Skeleton className="h-6 w-32 bg-white/5" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-12 w-full bg-white/5" />
              <Skeleton className="h-12 w-full bg-white/5" />
              <Skeleton className="h-12 w-3/4 bg-white/5" />
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 glass-card rounded-2xl p-6 animate-fade-in-up border-primary/20 glow-blue">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TrackingNumber number={result.trackingNumber} size="xl" />
            <StatusBadge status={result.status} size="lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-muted-foreground">Descripción</p>
              <p className="text-foreground font-medium">{result.description}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Destino</p>
              <p className="text-foreground font-medium">
                {result.recipient.city}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Historial de estados
            </h4>
            <ShipmentTimeline
              history={result.history}
              currentStatus={result.status}
            />
          </div>
        </div>
      )}

      {/* Not found */}
      {notFound && (
        <div className="mt-8 glass-card rounded-2xl p-6 text-center animate-fade-in-up">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Envío no encontrado
          </h3>
          <p className="text-muted-foreground">
            No encontramos un envío con ese número de seguimiento.
            <br />
            Verificá que esté bien escrito.
          </p>
        </div>
      )}

      {/* Server error */}
      {errorMsg && (
        <div className="mt-8 glass-card rounded-2xl p-6 text-center animate-fade-in-up">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error al buscar
          </h3>
          <p className="text-muted-foreground">{errorMsg}</p>
        </div>
      )}
    </div>
  )
}

const features = [
  {
    icon: Satellite,
    title: 'Tracking en tiempo real',
    description: 'Seguí el recorrido de tu paquete minuto a minuto.',
  },
  {
    icon: ListChecks,
    title: 'Historial completo',
    description: 'Accedé a todos los estados y movimientos de tu envío.',
  },
  {
    icon: Unlock,
    title: 'Sin registrarse',
    description: 'Consultá el estado de tu envío sin crear una cuenta.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen relative">
      <HeroBackground />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              TrackFlow
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl hidden sm:flex">
                Crear cuenta
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <AnimatedPackage />
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 tracking-tight text-balance">
            Tu paquete, siempre en movimiento.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty">
            Seguí tu envío en tiempo real. Simple, rápido, confiable.
          </p>
          <TrackingSearchBox />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:glow-blue animate-fade-in-up"
              style={{
                opacity: 0,
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 TrackFlow. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  )
}
