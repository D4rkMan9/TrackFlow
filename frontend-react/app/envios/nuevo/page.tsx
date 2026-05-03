'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { Package, User, Check, Copy, Eye } from 'lucide-react'
import Link from 'next/link'
import { crearEnvio, ApiError } from '@/lib/api'

interface FormData {
  weight: string
  description: string
  estimatedDate: string
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  phone: string
}

function SuccessOverlay({
  trackingNumber,
  onClose,
}: {
  trackingNumber: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trackingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in-up">
      <div className="text-center p-8 max-w-md">
        {/* Animated checkmark */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-success/20 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" className="animate-draw-check" />
          </svg>
        </div>

        <h2 className="font-display font-bold text-3xl text-foreground mb-4">
          ¡Envío creado!
        </h2>

        <p className="text-muted-foreground mb-8">
          Tu envío fue registrado exitosamente
        </p>

        {/* Tracking number */}
        <div className="glass-card rounded-2xl p-6 mb-8 border-primary/20 glow-blue-strong">
          <p className="text-sm text-muted-foreground mb-2">
            Número de seguimiento
          </p>
          <p className="font-mono text-3xl md:text-4xl text-primary font-bold tracking-wider">
            {trackingNumber}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1 h-12 rounded-xl border-border text-foreground hover:bg-white/5"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-success" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copiar número
              </>
            )}
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              <Eye className="w-5 h-5 mr-2" />
              Ver mis envíos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function PreviewCard({ formData }: { formData: FormData }) {
  const hasRecipient = formData.firstName || formData.lastName

  return (
    <div className="glass-card rounded-2xl p-6 border-primary/10 sticky top-24">
      <h3 className="font-display font-semibold text-lg text-foreground mb-6 flex items-center gap-2">
        <Eye className="w-5 h-5 text-primary" />
        Vista previa del envío
      </h3>

      {/* Tracking placeholder */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Número de tracking</p>
        <p className="font-mono text-xl text-primary/50 tracking-wider flex items-center gap-2">
          {"ENV25••••••••"}
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Generando tracking...
        </p>
      </div>

      {/* Status */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">Estado</p>
        <StatusBadge status="PENDIENTE" />
      </div>

      {/* Package info */}
      {(formData.weight || formData.description) && (
        <div className="mb-6 pb-6 border-b border-border">
          <p className="text-sm text-muted-foreground mb-2">Paquete</p>
          {formData.weight && (
            <p className="text-foreground text-sm">{formData.weight} kg</p>
          )}
          {formData.description && (
            <p className="text-foreground text-sm mt-1 line-clamp-2">
              {formData.description}
            </p>
          )}
        </div>
      )}

      {/* Recipient */}
      {hasRecipient && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Destinatario</p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-medium text-sm">
                {formData.firstName.charAt(0).toUpperCase()}
                {formData.lastName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-foreground font-medium">
                {formData.firstName} {formData.lastName}
              </p>
              {formData.address && (
                <p className="text-sm text-muted-foreground truncate">
                  {formData.address}
                </p>
              )}
              {(formData.city || formData.postalCode) && (
                <p className="text-sm text-muted-foreground">
                  {formData.city}
                  {formData.city && formData.postalCode && ', '}
                  {formData.postalCode}
                </p>
              )}
              {formData.phone && (
                <p className="text-sm text-muted-foreground">{formData.phone}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NuevoEnvioPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedTracking, setGeneratedTracking] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    weight: '',
    description: '',
    estimatedDate: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await crearEnvio({
        weight: parseFloat(formData.weight),
        description: formData.description,
        estimatedDate: formData.estimatedDate,
        recipient: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
      })
      setGeneratedTracking(result.trackingNumber)
      setShowSuccess(true)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Error al crear el envío'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses =
    'h-12 bg-card border-border text-foreground placeholder:text-muted-foreground/50 rounded-xl focus:border-primary/40 focus:ring-primary/20 transition-all duration-200'

  return (
    <div className="min-h-screen">
      <Navbar />

      {showSuccess && (
        <SuccessOverlay
          trackingNumber={generatedTracking}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-1">
            Nuevo Envío
          </h1>
          <p className="text-muted-foreground">
            Completá los datos para crear un nuevo envío
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Package section */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Datos del paquete
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="weight"
                        className="block text-sm font-medium text-foreground"
                      >
                        Peso (kg)
                      </label>
                      <div className="relative">
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          value={formData.weight}
                          onChange={handleChange}
                          required
                          className={inputClasses}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          kg
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="estimatedDate"
                        className="block text-sm font-medium text-foreground"
                      >
                        Fecha estimada
                      </label>
                      <Input
                        id="estimatedDate"
                        name="estimatedDate"
                        type="date"
                        value={formData.estimatedDate}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-foreground"
                    >
                      Descripción
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describí el contenido del paquete..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground/50 rounded-xl focus:border-primary/40 focus:ring-primary/20 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Recipient section */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg text-foreground mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Datos del destinatario
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-foreground"
                      >
                        Nombre
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-foreground"
                      >
                        Apellido
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Pérez"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-foreground"
                    >
                      Dirección
                    </label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Av. Corrientes 1234, Piso 5"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-foreground"
                      >
                        Localidad
                      </label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Buenos Aires"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-foreground"
                      >
                        Código Postal
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        placeholder="C1043AAZ"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-foreground"
                    >
                      Teléfono
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+54 11 1234-5678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg rounded-xl transition-all duration-200 glow-blue hover:glow-blue-strong"
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
                    Creando envío...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Crear Envío
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <PreviewCard formData={formData} />
          </div>
        </div>
      </main>
    </div>
  )
}

export { NuevoEnvioPage }
