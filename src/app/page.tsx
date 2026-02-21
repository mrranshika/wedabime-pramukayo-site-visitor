'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Wrench, 
  FileText, 
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  Sparkles,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react'

// Sri Lankan districts
const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
]

export default function Home() {
  const { t, language } = useLanguage()
  const [customerId, setCustomerId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    district: '',
    serviceType: '',
    scheduledDate: '',
    notes: ''
  })

  // Fetch customer ID on mount
  useEffect(() => {
    const fetchCustomerId = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/customer-id')
        const data = await response.json()
        if (data.success) {
          setCustomerId(data.customerId)
        } else {
          setCustomerId('WP-0001')
        }
      } catch (error) {
        console.error('Error fetching customer ID:', error)
        setCustomerId('WP-0001')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomerId()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          ...formData
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        // Reset form
        setFormData({
          customerName: '',
          phone: '',
          address: '',
          district: '',
          serviceType: '',
          scheduledDate: '',
          notes: ''
        })
        // Fetch new customer ID
        const idResponse = await fetch('/api/customer-id')
        const idData = await idResponse.json()
        if (idData.success) {
          setCustomerId(idData.customerId)
        }
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const serviceTypes = [
    { value: 'ceiling', label: t('service.ceiling'), icon: '🏠' },
    { value: 'roofing', label: t('service.roofing'), icon: '🏗️' },
    { value: 'gutter', label: t('service.gutter'), icon: '💧' },
    { value: 'all', label: t('service.all'), icon: '✨' }
  ]

  return (
    <main className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-8 pb-24 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
          {/* Customer ID Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full mb-6 shadow-lg shadow-green-500/25">
            <Sparkles className="h-4 w-4 text-white" />
            <Badge variant="secondary" className="bg-white/20 text-white border-0 font-mono text-base">
              {isLoading ? '...' : customerId}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
              {t('form.title')}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Professional ceiling, roofing & gutter insulation services across Sri Lanka
          </p>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full text-sm">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Quality Guaranteed</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full text-sm">
            <Clock className="h-4 w-4 text-green-600" />
            <span>Fast Service</span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 px-4 py-2 rounded-full text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>All Districts</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto glass-card hover-lift fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Register Your Visit
            </CardTitle>
            <CardDescription>
              Fill in the details below to schedule a site inspection
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Customer ID (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="customerId" className="flex items-center gap-2 text-sm font-medium">
                  <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    #
                  </Badge>
                  {t('form.customerId')}
                </Label>
                <Input
                  id="customerId"
                  value={customerId}
                  readOnly
                  className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 font-mono text-lg border-green-200 dark:border-green-800"
                />
              </div>

              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-green-600" />
                    {t('form.customerName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter full name"
                    required
                    className="modern-input h-11"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4 text-green-600" />
                    {t('form.phone')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="077-1234567"
                    required
                    className="modern-input h-11"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-green-600" />
                  {t('form.address')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address with landmarks"
                  required
                  rows={2}
                  className="modern-input resize-none"
                />
              </div>

              {/* District & Service Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="district" className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-green-600" />
                    {t('form.district')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value })}
                  >
                    <SelectTrigger className="h-11 modern-input">
                      <SelectValue placeholder={t('form.selectDistrict')} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="serviceType" className="flex items-center gap-2 text-sm font-medium">
                    <Wrench className="h-4 w-4 text-green-600" />
                    {t('form.serviceType')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger className="h-11 modern-input">
                      <SelectValue placeholder={t('form.selectService')} />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          <span className="flex items-center gap-2">
                            <span>{service.icon}</span>
                            {service.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Preferred Visit Date
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="modern-input h-11"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-green-600" />
                  {t('form.notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional requirements or notes..."
                  rows={3}
                  className="modern-input resize-none"
                />
              </div>

              {/* Submit Status Messages */}
              {submitStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800 scale-in">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400 font-medium">
                    {t('form.success')} 🎉
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert variant="destructive" className="scale-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('form.error')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    {t('form.submit')}
                    <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Credit */}
        <footer className="mt-12 text-center fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center gap-4 bg-white/60 dark:bg-gray-800/60 px-6 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('credit.developed')}</span>
              <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {t('credit.company')}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs text-muted-foreground">{t('credit.foundation')}</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
