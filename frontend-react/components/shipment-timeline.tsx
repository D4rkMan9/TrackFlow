import { cn } from '@/lib/utils'
import type { ShipmentStatus, StatusHistoryEntry } from '@/lib/types'
import {
  Clock,
  Settings,
  Truck,
  Home,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

interface ShipmentTimelineProps {
  history: StatusHistoryEntry[]
  currentStatus: ShipmentStatus
  className?: string
}

const statusIcons: Record<ShipmentStatus, LucideIcon> = {
  PENDIENTE: Clock,
  PROCESANDO: Settings,
  EN_TRANSITO: Truck,
  EN_DISTRIBUCION: Home,
  ENTREGADO: CheckCircle2,
  CANCELADO: XCircle,
}

const statusColors: Record<ShipmentStatus, { bg: string; border: string; text: string }> = {
  PENDIENTE: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/40',
    text: 'text-gray-400',
  },
  PROCESANDO: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
  },
  EN_TRANSITO: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
  },
  EN_DISTRIBUCION: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
  },
  ENTREGADO: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
  },
  CANCELADO: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/40',
    text: 'text-red-400',
  },
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function ShipmentTimeline({
  history,
  currentStatus,
  className,
}: ShipmentTimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {history.map((entry, index) => {
        const Icon = statusIcons[entry.status]
        const colors = statusColors[entry.status]
        const isCurrent = entry.status === currentStatus && index === history.length - 1
        const isPast = index < history.length - 1 || entry.status === 'ENTREGADO' || entry.status === 'CANCELADO'

        return (
          <div
            key={`${entry.status}-${index}`}
            className={cn(
              'relative flex gap-4 pb-8 last:pb-0 animate-fade-in-up',
              `stagger-${Math.min(index + 1, 5)}`
            )}
            style={{ opacity: 0, animationFillMode: 'forwards' }}
          >
            {/* Vertical line */}
            {index < history.length - 1 && (
              <div
                className={cn(
                  'absolute left-5 top-10 w-px h-[calc(100%-2rem)]',
                  isPast ? 'bg-border' : 'border-l border-dashed border-muted-foreground/30'
                )}
              />
            )}

            {/* Icon circle */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                colors.bg,
                colors.border,
                isCurrent && 'animate-pulse-glow ring-2 ring-primary/30'
              )}
            >
              <Icon className={cn('w-5 h-5', colors.text)} />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h4
                  className={cn(
                    'font-medium',
                    isCurrent ? 'text-foreground' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  )}
                >
                  {entry.status.replace('_', ' ')}
                </h4>
              </div>
              <p
                className={cn(
                  'text-sm mt-1',
                  isPast || isCurrent ? 'text-muted-foreground' : 'text-muted-foreground/40'
                )}
              >
                {entry.description}
              </p>
              {entry.location && (
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {entry.location}
                </p>
              )}
              <p className="text-xs text-muted-foreground/50 mt-1">
                {formatDate(entry.timestamp)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ShipmentTimeline
