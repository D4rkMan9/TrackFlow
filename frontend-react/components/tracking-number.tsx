'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrackingNumberProps {
  number: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showCopyButton?: boolean
}

export function TrackingNumber({
  number,
  size = 'md',
  className,
  showCopyButton = true,
}: TrackingNumberProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl md:text-3xl',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 group cursor-pointer',
        className
      )}
      onClick={handleCopy}
    >
      <span
        className={cn(
          'font-mono uppercase text-primary tracking-wide',
          sizeClasses[size]
        )}
      >
        {number}
      </span>
      {showCopyButton && (
        <button
          type="button"
          className={cn(
            'p-1 rounded-md transition-all duration-200',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-primary/10'
          )}
          aria-label={copied ? 'Copiado' : 'Copiar número de seguimiento'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      )}
      {copied && (
        <span className="text-xs text-success animate-fade-in-up">
          ¡Copiado!
        </span>
      )}
    </div>
  )
}

export default TrackingNumber
