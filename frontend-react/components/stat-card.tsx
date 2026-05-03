import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  color?: 'blue' | 'green' | 'amber' | 'gray'
  className?: string
}

const colorClasses = {
  blue: {
    iconBg: 'bg-blue-500/10',
    iconText: 'text-blue-400',
  },
  green: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
  },
  gray: {
    iconBg: 'bg-gray-500/10',
    iconText: 'text-gray-400',
  },
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
  className,
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-4 md:p-6 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-blue-500/20 hover:glow-blue',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-xl',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-6 h-6', colors.iconText)} />
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-bold font-display text-foreground">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default StatCard
