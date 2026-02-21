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
  Loader2
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
    { value: 'ceiling', label: t('service.ceiling') },
    { value: 'roofing', label: t('service.roofing') },
    { value: 'gutter', label: t('service.gutter') },
    { value: 'all', label: t('service.all') }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full mb-4">
            <Badge variant="secondary" className="bg-green-600 text-white">
              {isLoading ? '...' : customerId}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
            {t('form.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('app.subtitle')} - {t('app.title')}
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto shadow-xl border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('form.title')}
            </CardTitle>
            <CardDescription className="text-green-100">
              Fill in the details below to register a new site visit
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer ID (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="customerId" className="flex items-center gap-2">
                  <Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center">
                    #
                  </Badge>
                  {t('form.customerId')}
                </Label>
                <Input
                  id="customerId"
                  value={customerId}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 font-mono text-lg"
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  {t('form.customerName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  required
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
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
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  {t('form.address')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                  required
                  rows={2}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  {t('form.district')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
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
                <Label htmlFor="serviceType" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-green-600" />
                  {t('form.serviceType')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder={t('form.selectService')} />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Preferred Visit Date
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  {t('form.notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes or requirements..."
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Submit Status Messages */}
              {submitStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {t('form.success')}
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert variant="destructive">
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
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    {t('form.submit')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Credit */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t('credit.developed')} <span className="font-semibold text-green-600">{t('credit.company')}</span>
          </p>
          <p className="text-xs mt-1">{t('credit.foundation')}</p>
        </footer>
      </div>
    </main>
  )
}
