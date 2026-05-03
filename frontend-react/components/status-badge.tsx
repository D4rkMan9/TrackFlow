import { cn } from '@/lib/utils'
import type { ShipmentStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: ShipmentStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusConfig: Record<
  ShipmentStatus,
  { label: string; bgColor: string; textColor: string; dotColor: string; pulse?: boolean }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-400',
    dotColor: 'bg-gray-400',
  },
  PROCESANDO: {
    label: 'Procesando',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  EN_TRANSITO: {
    label: 'En tránsito',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    dotColor: 'bg-blue-400',
    pulse: true,
  },
  EN_DISTRIBUCION: {
    label: 'En distribución',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    dotColor: 'bg-orange-400',
  },
  ENTREGADO: {
    label: 'Entregado',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  CANCELADO: {
    label: 'Cancelado',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
    dotColor: 'bg-red-400',
  },
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        status === 'CANCELADO' && 'line-through',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          config.dotColor,
          dotSizes[size],
          config.pulse && 'animate-pulse'
        )}
      />
      {config.label}
    </span>
  )
}

export default StatusBadge
