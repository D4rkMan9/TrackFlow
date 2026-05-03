'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TrackingNumber } from '@/components/tracking-number'
import { StatusBadge } from '@/components/status-badge'
import type { Shipment } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ShipmentCardProps {
  shipment: Shipment
  className?: string
  showDetailButton?: boolean
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function ShipmentCard({
  shipment,
  className,
  showDetailButton = true,
}: ShipmentCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-4 md:p-6 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-blue-500/20 hover:glow-blue',
        shipment.status === 'CANCELADO' && 'opacity-60',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Left: Tracking & Description */}
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

        {/* Center: Destination & Date */}
        <div className="flex flex-col md:items-center text-sm">
          <p className="text-foreground font-medium">
            {shipment.recipient.city}
          </p>
          <p className="text-muted-foreground">
            {formatDate(shipment.createdAt)}
          </p>
        </div>

        {/* Right: Status & Action */}
        <div className="flex items-center gap-4">
          <StatusBadge status={shipment.status} />
          {showDetailButton && (
            <Link href={`/envios/${shipment.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                Ver detalle
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShipmentCard
