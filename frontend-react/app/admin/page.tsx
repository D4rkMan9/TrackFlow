'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Navbar } from '@/components/navbar'
import { StatCard } from '@/components/stat-card'
import { TrackingNumber } from '@/components/tracking-number'
import { StatusBadge } from '@/components/status-badge'
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { getAdminEnvios, actualizarEstadoAdmin, getAdminStats, ApiError } from '@/lib/api'
import type { Shipment, ShipmentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const statusFilters: { value: ShipmentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'PROCESANDO', label: 'Procesando' },
  { value: 'EN_TRANSITO', label: 'En tránsito' },
  { value: 'EN_DISTRIBUCION', label: 'En distribución' },
  { value: 'ENTREGADO', label: 'Entregados' },
  { value: 'CANCELADO', label: 'Cancelados' },
]

const validTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDIENTE: ['PROCESANDO', 'CANCELADO'],
  PROCESANDO: ['EN_TRANSITO', 'CANCELADO'],
  EN_TRANSITO: ['EN_DISTRIBUCION', 'CANCELADO'],
  EN_DISTRIBUCION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function AdminShipmentCard({
  shipment,
  onUpdateStatus,
}: {
  shipment: Shipment
  onUpdateStatus: (shipment: Shipment) => void
}) {
  const canUpdate = validTransitions[shipment.status].length > 0

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-4 md:p-6 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-blue-500/20 hover:glow-blue',
        shipment.status === 'CANCELADO' && 'opacity-60'
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Tracking & Description */}
        <div className="flex-1 min-w-0">
          <TrackingNumber
            number={shipment.trackingNumber}
            size="md"
            className={cn(
              shipment.status === 'CANCELADO' && 'line-through opacity-60'
            )}
          />
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {shipment.description}
          </p>
        </div>

        {/* Recipient */}
        <div className="flex flex-col text-sm lg:w-40">
          <p className="text-foreground font-medium">
            {shipment.recipient.firstName} {shipment.recipient.lastName}
          </p>
          <p className="text-muted-foreground">{shipment.recipient.city}</p>
        </div>

        {/* Date */}
        <div className="flex flex-col text-sm lg:w-28">
          <p className="text-muted-foreground">Creado</p>
          <p className="text-foreground">{formatDate(shipment.createdAt)}</p>
        </div>

        {/* Status & Action */}
        <div className="flex items-center gap-4 lg:w-64 justify-between lg:justify-end">
          <StatusBadge status={shipment.status} />
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(shipment)}
              className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [stats, setStats] = useState({
    total: 0, enTransito: 0, entregados: 0, pendientes: 0, cancelados: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL')
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [newStatus, setNewStatus] = useState<ShipmentStatus | ''>('')
  const [updateNote, setUpdateNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [envios, s] = await Promise.all([
        getAdminEnvios(),
        getAdminStats(),
      ])
      setShipments(envios)
      setStats(s)
    } catch {
      // Error handled silently; data will remain empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter shipments client-side
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      searchQuery === '' ||
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'ALL' || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = async () => {
    if (!selectedShipment || !newStatus) return

    setIsUpdating(true)
    setUpdateError('')
    try {
      await actualizarEstadoAdmin(
        selectedShipment.id,
        newStatus,
        updateNote || undefined
      )
      setSelectedShipment(null)
      setNewStatus('')
      setUpdateNote('')
      await fetchData()
    } catch (err) {
      setUpdateError(
        err instanceof ApiError ? err.message : 'Error al actualizar estado'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const openUpdateDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setNewStatus('')
    setUpdateNote('')
    setUpdateError('')
  }

  return (
    <div className="min-h-screen">
      <Navbar isAdmin />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-1">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestión de envíos y actualizaciones de estado
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Package}
                label="Total envíos"
                value={stats.total}
                color="gray"
              />
              <StatCard
                icon={Clock}
                label="Pendientes"
                value={stats.pendientes}
                color="amber"
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

            {/* Filters */}
            <div className="glass-card rounded-2xl p-4 mb-6 sticky top-20 z-10">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por número de tracking..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    className="h-11 pl-10 bg-card border-border text-foreground font-mono uppercase placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:font-sans rounded-xl focus:border-primary/40 focus:ring-primary/20"
                  />
                </div>

                {/* Status filter tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                  {statusFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        'rounded-lg whitespace-nowrap',
                        statusFilter === filter.value
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shipments list */}
            <div className="space-y-4">
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment, index) => (
                  <div
                    key={shipment.id}
                    className="animate-fade-in-up"
                    style={{
                      opacity: 0,
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <AdminShipmentCard
                      shipment={shipment}
                      onUpdateStatus={openUpdateDialog}
                    />
                  </div>
                ))
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No se encontraron envíos
                  </h3>
                  <p className="text-muted-foreground">
                    Probá ajustando los filtros de búsqueda
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Update status dialog */}
      <Dialog
        open={!!selectedShipment}
        onOpenChange={() => setSelectedShipment(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-display">
              Actualizar estado
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedShipment && (
                <span className="font-mono text-primary">
                  {selectedShipment.trackingNumber}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Current status */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Estado actual</p>
              {selectedShipment && (
                <StatusBadge status={selectedShipment.status} />
              )}
            </div>

            {/* New status select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Nuevo estado
              </label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as ShipmentStatus)}
              >
                <SelectTrigger className="h-12 bg-card border-border text-foreground rounded-xl">
                  <SelectValue placeholder="Seleccioná el nuevo estado" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {selectedShipment &&
                    validTransitions[selectedShipment.status].map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="text-foreground hover:bg-white/5"
                      >
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note textarea */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Descripción / Nota (opcional)
              </label>
              <Textarea
                placeholder="Agregar una nota o descripción del cambio..."
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                rows={3}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground/50 rounded-xl focus:border-primary/40 focus:ring-primary/20 resize-none"
              />
            </div>

            {updateError && (
              <p className="text-sm text-destructive">{updateError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setSelectedShipment(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || isUpdating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              {isUpdating ? (
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
                  Actualizando...
                </span>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { AdminPage }
