import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  cta?: string
  onCtaClick?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  onCtaClick,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold font-display text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {cta && (
        <Button
          onClick={onCtaClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
        >
          {cta}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
