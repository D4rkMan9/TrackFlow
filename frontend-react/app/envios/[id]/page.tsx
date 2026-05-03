'use client'

import { use, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { TrackingNumber } from '@/components/tracking-number'
import { StatusBadge } from '@/components/status-badge'
import { ShipmentTimeline } from '@/components/shipment-timeline'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Package,
  Weight,
  Calendar,
  User,
  MapPin,
  Phone,
  XCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEnvioById, cancelarEnvio, ApiError } from '@/lib/api'
import type { Shipment } from '@/lib/types'

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    getEnvioById(id)
      .then(setShipment)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFoundFlag(true)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (notFoundFlag) notFound()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!shipment) notFound()

  const canCancel = shipment.status === 'PENDIENTE'

  const handleCancel = async () => {
    setIsCancelling(true)
    setCancelError('')
    try {
      await cancelarEnvio(id)
      const updated = await getEnvioById(id)
      setShipment(updated)
      setShowCancelDialog(false)
    } catch (err) {
      setCancelError(
        err instanceof ApiError ? err.message : 'Error al cancelar'
      )
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis envíos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main info card */}
            <div className="glass-card rounded-2xl p-6 border-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <TrackingNumber number={shipment.trackingNumber} size="xl" />
                <StatusBadge status={shipment.status} size="lg" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p className="text-foreground font-medium">
                      {shipment.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Weight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peso</p>
                    <p className="text-foreground font-medium">
                      {shipment.weight} kg
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Fecha estimada
                    </p>
                    <p className="text-foreground font-medium">
                      {formatDate(shipment.estimatedDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipient info */}
              <div className="pt-6">
                <h3 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Destinatario
                </h3>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold">
                      {shipment.recipient.firstName.charAt(0)}
                      {shipment.recipient.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium text-lg">
                      {shipment.recipient.firstName} {shipment.recipient.lastName}
                    </p>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{shipment.recipient.address}</p>
                        <p>
                          {shipment.recipient.city}, {shipment.recipient.postalCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <p>{shipment.recipient.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancel button */}
              {canCancel && (
                <div className="pt-6 mt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 rounded-xl"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar envío
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Timeline */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">
                Historial de estados
              </h3>
              <ShipmentTimeline
                history={shipment.history}
                currentStatus={shipment.status}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              Cancelar envío
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ¿Estás seguro que querés cancelar este envío? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="glass-card rounded-xl p-4">
              <TrackingNumber number={shipment.trackingNumber} size="md" />
              <p className="text-sm text-muted-foreground mt-2">
                {shipment.description}
              </p>
            </div>
            {cancelError && (
              <p className="text-sm text-destructive mt-2">{cancelError}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowCancelDialog(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              {isCancelling ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Cancelando...
                </span>
              ) : (
                'Confirmar cancelación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { ShipmentDetailPage }
