'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { StatCard } from '@/components/stat-card'
import { ShipmentCard } from '@/components/shipment-card'
import { EmptyState } from '@/components/empty-state'
import { Package, Truck, CheckCircle2, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getEnvios, getEnviosStats, ApiError } from '@/lib/api'
import type { Shipment } from '@/lib/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [stats, setStats] = useState({ total: 0, enTransito: 0, entregados: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getEnvios(), getEnviosStats()])
      .then(([envios, s]) => {
        setShipments(envios)
        setStats(s)
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Error al cargar datos')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground mb-1">
              Mis Envíos
            </h1>
            <p className="text-muted-foreground">
              {stats.total} envíos realizados
            </p>
          </div>
          <Link href="/envios/nuevo">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl glow-blue hover:glow-blue-strong">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo envío
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={Package}
                label="Total envíos"
                value={stats.total}
                color="gray"
              />
              <StatCard
                icon={Truck}
                label="En tránsito"
                value={stats.enTransito}
                color="blue"
              />
              <StatCard
                icon={CheckCircle2}
                label="Entregados"
                value={stats.entregados}
                color="green"
              />
            </div>

            {/* Shipments List */}
            {shipments.length > 0 ? (
              <div className="space-y-4">
                {shipments.map((shipment, index) => (
                  <div
                    key={shipment.id}
                    className="animate-fade-in-up"
                    style={{
                      opacity: 0,
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <ShipmentCard shipment={shipment} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="Todavía no tenés envíos"
                description="¡Creá tu primer envío y empezá a trackear!"
                cta="Crear envío"
                onCtaClick={() => {}}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export { DashboardPage }
