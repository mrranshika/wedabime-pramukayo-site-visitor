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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  FileImage,
  Video,
  Plus,
  Trash2,
  Map,
  ChevronRight,
  ChevronLeft,
  Home as HomeIcon,
  Wrench,
  Droplets,
  Cloud,
  Calculator,
  Paperclip,
  FileText
} from 'lucide-react'

// Sri Lankan Districts and Cities
const districtsData: Record<string, string[]> = {
  'Colombo': ['Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Colombo 06', 'Colombo 07', 'Colombo 08', 'Colombo 09', 'Colombo 10', 'Colombo 11', 'Colombo 12', 'Colombo 13', 'Colombo 14', 'Colombo 15', 'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Kesbewa', 'Maharagama', 'Battaramulla', 'Rajagiriya', 'Nugegoda'],
  'Gampaha': ['Gampaha', 'Negombo', 'Katunayake', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Ragama', 'Minuwangoda', 'Divulapitiya', 'Mirigama', 'Attanagalla', 'Yakkala', 'Nittambuwa', 'Kiribathgoda'],
  'Kalutara': ['Kalutara', 'Panadura', 'Beruwala', 'Aluthgama', 'Bentota', 'Bandaragama', 'Horana', 'Matugama', 'Bulathsinhala', 'Ingiriya', 'Wadduwa'],
  'Kandy': ['Kandy', 'Peradeniya', 'Katugastota', 'Matale', 'Nuwara Eliya', 'Gampola', 'Nawalapitiya', 'Akurana', 'Katugastota', 'Digana'],
  'Galle': ['Galle', 'Hikkaduwa', 'Unawatuna', 'Ambalangoda', 'Balapitiya', 'Elpitiya', 'Karapitiya'],
  'Matara': ['Matara', 'Weligama', 'Mirissa', 'Dikwella', 'Tangalle', 'Hambantota'],
  'Jaffna': ['Jaffna', 'Nallur', 'Chavakachcheri', 'Point Pedro', 'Vavuniya'],
  'Anuradhapura': ['Anuradhapura', 'Polonnaruwa', 'Dambulla', 'Sigiriya'],
  'Kurunegala': ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Wariyapola', 'Puttalam', 'Chilaw'],
  'Ratnapura': ['Ratnapura', 'Balangoda', 'Embilipitiya', 'Kegalla', 'Mawanella'],
  'Badulla': ['Badulla', 'Bandarawela', 'Nuwara Eliya', 'Welimada', 'Monaragala'],
  'Other': ['Other']
}

// Ceiling types with default prices
const ceilingTypes = [
  { id: '2x2-eltoro', name: '2 x 2 Eltoro Ceiling', defaultPrice: 180 },
  { id: '2x2-pvc', name: '2 x 2 PVC Ceiling', defaultPrice: 250 },
  { id: 'panel-flat', name: 'Panel Flat Ceiling', defaultPrice: 360 },
  { id: 'panel-box', name: 'Panel Box Ceiling', defaultPrice: 430 }
]

// Roof materials
const roofMaterials = [
  { id: 'asbestos-non-color', name: 'Asbestos (Non Color)' },
  { id: 'asbestos-color', name: 'Asbestos (Color Up)', colors: ['Tile Red', 'Green', 'Brown', 'Ash'] },
  { id: 'tile-ulu', name: 'Tile (Ulu)' },
  { id: 'amano-normal', name: 'Amano Normal' },
  { id: 'amano-curve', name: 'Amano Curve Roof', types: ['Full Curve Roof', 'Half Curve Roof'] },
  { id: 'amano-tile', name: 'Amano Tile Roof' },
  { id: 'upvc', name: 'UPVC Sheet', types: ['J/L Roofing Sheet', 'I Roof Roofing Sheet', 'Anton Roofing Sheet'] },
  { id: 'transparent', name: 'Transparent Roofing Sheet' }
]

export default function Home() {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    customerId: '',
    leadReceivedDate: '',
    customerName: '',
    
    // Step 2: Phone & WhatsApp
    phoneNumber: '',
    phoneHasWhatsApp: false,
    hasWhatsAppNumber: '' as '' | 'yes' | 'no',
    whatsappNumber: '',
    
    // Step 3: Location
    district: '',
    city: '',
    address: '',
    googleMapsLink: '',
    latitude: null as number | null,
    longitude: null as number | null,
    
    // Step 4: Media
    drawings: [] as string[],
    images: [] as string[],
    videos: [] as string[],
    
    // Step 5: Services
    hasRemovals: false,
    removalCharge: 0,
    hasAdditionalLabour: false,
    additionalLabourCharge: 0,
    serviceType: '' as '' | 'ceiling' | 'gutters' | 'roof',
    
    // Ceiling
    ceilingType: '',
    ceilingAreas: 1,
    ceilingPricePerSqFt: 180,
    ceilingMeasurements: [] as { length: string; width: string }[],
    macfoil: '' as '' | 'yes' | 'no',
    
    // Gutters
    guttersMeasurements: {
      guttersAndValance: '',
      bFlashingAndValance: '',
      gutters: '',
      valanceB: '',
      bFlashing: '',
      dPipes: '',
      nozzels: 0,
      nozzelsNotWant: false,
      endCaps: 0,
      endCapsNotWant: false,
      chainPackets: 0,
      chainPacketsNotWant: false,
      wallFSize: '' as '' | '9' | '12',
      wallFMeasurements: '',
      blindWallFlashingSize: '' as '' | '9' | '12',
      blindWallFlashingMeasurements: '',
      ridgeCover: '',
      ratGuard: '',
      customDesignNote: ''
    },
    
    // Roof
    roofType: '' as '' | 'new' | 'repair',
    roofMaterial: '' as '' | 'wood' | 'steel',
    roofFinish: '' as '' | 'normal' | 'finishing',
    roofMaterialType: '',
    roofMaterialColor: '',
    roofMaterialSubType: '',
    
    // Step 6: Quotation & Status
    quotationNumber: '',
    quotationPdf: '',
    totalAmount: 0,
    status: 'pending' as 'pending' | 'running' | 'complete' | 'cancel',
    notes: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Generate Customer ID
  const generateCustomerId = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/customer-id')
      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, customerId: data.customerId }))
      }
    } catch (error) {
      console.error('Error generating customer ID:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateCustomerId()
  }, [])

  // Get day of week from date
  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  // Calculate ceiling total
  const calculateCeilingTotal = () => {
    let totalSqFt = 0
    formData.ceilingMeasurements.forEach(m => {
      const l = parseFloat(m.length) || 0
      const w = parseFloat(m.width) || 0
      totalSqFt += l * w
    })
    return {
      totalSqFt: Math.ceil(totalSqFt),
      totalPrice: Math.ceil(totalSqFt) * formData.ceilingPricePerSqFt
    }
  }

  // Parse measurements string (e.g., "5' + 6' + 3'" = 14)
  const parseMeasurements = (str: string): number => {
    if (!str) return 0
    const parts = str.split('+').map(s => parseFloat(s.trim().replace("'", '')) || 0)
    return parts.reduce((sum, n) => sum + n, 0)
  }

  // Get cities for selected district
  const getCities = () => {
    return districtsData[formData.district] || []
  }

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formData.customerId,
          leadReceivedDate: formData.leadReceivedDate,
          customerName: formData.customerName,
          phoneNumber: formData.phoneNumber,
          phoneHasWhatsApp: formData.phoneHasWhatsApp,
          hasWhatsAppNumber: formData.hasWhatsAppNumber,
          whatsappNumber: formData.whatsappNumber,
          district: formData.district,
          city: formData.city,
          address: formData.address,
          googleMapsLink: formData.googleMapsLink,
          latitude: formData.latitude,
          longitude: formData.longitude,
          drawings: JSON.stringify(formData.drawings),
          images: JSON.stringify(formData.images),
          videos: JSON.stringify(formData.videos),
          hasRemovals: formData.hasRemovals,
          removalCharge: formData.removalCharge,
          hasAdditionalLabour: formData.hasAdditionalLabour,
          additionalLabourCharge: formData.additionalLabourCharge,
          serviceType: formData.serviceType,
          ceilingDetails: JSON.stringify({
            type: formData.ceilingType,
            areas: formData.ceilingAreas,
            pricePerSqFt: formData.ceilingPricePerSqFt,
            measurements: formData.ceilingMeasurements,
            macfoil: formData.macfoil,
            total: calculateCeilingTotal()
          }),
          guttersDetails: JSON.stringify(formData.guttersMeasurements),
          roofDetails: JSON.stringify({
            type: formData.roofType,
            material: formData.roofMaterial,
            finish: formData.roofFinish,
            materialType: formData.roofMaterialType,
            color: formData.roofMaterialColor,
            subType: formData.roofMaterialSubType
          }),
          quotationNumber: formData.quotationNumber,
          totalAmount: calculateCeilingTotal().totalPrice,
          status: formData.status,
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        generateCustomerId()
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

  // Next/Previous step handlers
  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }
  
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Update ceiling measurements array
  const updateCeilingMeasurement = (index: number, field: 'length' | 'width', value: string) => {
    const newMeasurements = [...formData.ceilingMeasurements]
    newMeasurements[index] = { ...newMeasurements[index], [field]: value }
    setFormData(prev => ({ ...prev, ceilingMeasurements: newMeasurements }))
  }

  const addCeilingMeasurement = () => {
    if (formData.ceilingMeasurements.length < formData.ceilingAreas) {
      setFormData(prev => ({
        ...prev,
        ceilingMeasurements: [...prev.ceilingMeasurements, { length: '', width: '' }]
      }))
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Wedabime Pramukayo
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Site Visitor Registration</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div
                key={step}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === currentStep
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Basic</span>
            <span>Contact</span>
            <span>Location</span>
            <span>Media</span>
            <span>Service</span>
            <span>Finish</span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <><User className="h-5 w-5" /> Basic Information</>}
              {currentStep === 2 && <><Phone className="h-5 w-5" /> Contact Details</>}
              {currentStep === 3 && <><MapPin className="h-5 w-5" /> Location</>}
              {currentStep === 4 && <><Camera className="h-5 w-5" /> Media Upload</>}
              {currentStep === 5 && <><Wrench className="h-5 w-5" /> Service Details</>}
              {currentStep === 6 && <><FileText className="h-5 w-5" /> Quotation & Status</>}
            </CardTitle>
            <CardDescription className="text-green-100">
              Step {currentStep} of {totalSteps}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Customer ID */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">#</Badge>
                    Customer ID
                  </Label>
                  <Input
                    value={formData.customerId}
                    readOnly
                    className="bg-gradient-to-r from-green-50 to-blue-50 font-mono text-lg"
                  />
                </div>

                {/* Lead Received Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Date Lead Received <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.leadReceivedDate}
                    onChange={(e) => setFormData({ ...formData, leadReceivedDate: e.target.value })}
                    required
                  />
                  {formData.leadReceivedDate && (
                    <p className="text-sm text-blue-600 font-medium">
                      {getDayOfWeek(formData.leadReceivedDate)}
                    </p>
                  )}
                </div>

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    Customer Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Phone & WhatsApp */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="077-1234567"
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phoneHasWhatsApp"
                      checked={formData.phoneHasWhatsApp}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        phoneHasWhatsApp: checked as boolean,
                        hasWhatsAppNumber: checked ? '' : formData.hasWhatsAppNumber
                      })}
                    />
                    <Label htmlFor="phoneHasWhatsApp" className="text-sm">
                      This number is available on WhatsApp
                    </Label>
                  </div>
                </div>

                {/* Conditional WhatsApp Questions */}
                {!formData.phoneHasWhatsApp && (
                  <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Label>Does the customer have a WhatsApp number?</Label>
                    <RadioGroup
                      value={formData.hasWhatsAppNumber}
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        hasWhatsAppNumber: value as 'yes' | 'no',
                        whatsappNumber: value === 'no' ? '' : formData.whatsappNumber
                      })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="whatsapp-yes" />
                        <Label htmlFor="whatsapp-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="whatsapp-no" />
                        <Label htmlFor="whatsapp-no">No</Label>
                      </div>
                    </RadioGroup>

                    {formData.hasWhatsAppNumber === 'yes' && (
                      <div className="space-y-2">
                        <Label>WhatsApp Number</Label>
                        <Input
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                          placeholder="Enter WhatsApp number"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* District */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) => setFormData({ ...formData, district: value, city: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(districtsData).map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label>City <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    disabled={!formData.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCities().map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    Address (Optional)
                  </Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>

                {/* Google Maps */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-blue-600" />
                    Google Maps Link
                  </Label>
                  <Input
                    value={formData.googleMapsLink}
                    onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                    placeholder="Paste Google Maps link"
                  />
                  <p className="text-xs text-gray-500">
                    Open Google Maps, get directions to location, copy and paste the link
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Media */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Drawings */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-green-600" />
                    Site Drawings (Max 20)
                  </Label>
                  <p className="text-xs text-gray-500">Supported: JPG, JPEG, PNG, HEIC, and other image formats</p>
                  <div className="flex gap-2 flex-wrap">
                    {formData.drawings.map((_, i) => (
                      <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <span className="text-xs text-gray-500">Drawing {i + 1}</span>
                      </div>
                    ))}
                    {formData.drawings.length < 20 && (
                      <button className="w-20 h-20 bg-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300 hover:bg-green-100 transition-colors">
                        <Plus className="h-6 w-6 text-green-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-green-600" />
                    Site Photos (Max 20)
                  </Label>
                  <p className="text-xs text-gray-500">Take photos or upload images</p>
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.map((_, i) => (
                      <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <span className="text-xs text-gray-500">Photo {i + 1}</span>
                      </div>
                    ))}
                    {formData.images.length < 20 && (
                      <button className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-300 hover:bg-blue-100 transition-colors">
                        <Camera className="h-6 w-6 text-blue-500" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Videos */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-green-600" />
                    Videos (Max 2, 30 seconds each)
                  </Label>
                  <div className="flex gap-2">
                    {formData.videos.map((_, i) => (
                      <div key={i} className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <Video className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                    {formData.videos.length < 2 && (
                      <button className="w-24 h-16 bg-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-300 hover:bg-purple-100 transition-colors">
                        <Plus className="h-5 w-5 text-purple-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Service Details */}
            {currentStep === 5 && (
              <div className="space-y-6">
                {/* Removals */}
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasRemovals"
                      checked={formData.hasRemovals}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasRemovals: checked as boolean })}
                    />
                    <Label htmlFor="hasRemovals">Is there anything to remove?</Label>
                  </div>
                  {formData.hasRemovals && (
                    <div className="mt-2">
                      <Label>Removal Charge (Rs.)</Label>
                      <Input
                        type="number"
                        value={formData.removalCharge}
                        onChange={(e) => setFormData({ ...formData, removalCharge: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter removal charge"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Labour */}
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasAdditionalLabour"
                      checked={formData.hasAdditionalLabour}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAdditionalLabour: checked as boolean })}
                    />
                    <Label htmlFor="hasAdditionalLabour">Additional labour charge?</Label>
                  </div>
                  {formData.hasAdditionalLabour && (
                    <div className="mt-2">
                      <Label>Additional Labour Charge (Rs.)</Label>
                      <Input
                        type="number"
                        value={formData.additionalLabourCharge}
                        onChange={(e) => setFormData({ ...formData, additionalLabourCharge: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter additional charge"
                      />
                    </div>
                  )}
                </div>

                {/* Service Type Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Select Service Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'ceiling', icon: HomeIcon, label: 'Ceiling', color: 'green' },
                      { id: 'gutters', icon: Droplets, label: 'Gutters', color: 'blue' },
                      { id: 'roof', icon: Cloud, label: 'Roof', color: 'purple' }
                    ].map(service => (
                      <button
                        key={service.id}
                        onClick={() => setFormData({ ...formData, serviceType: service.id as 'ceiling' | 'gutters' | 'roof' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.serviceType === service.id
                            ? `border-${service.color}-500 bg-${service.color}-50 dark:bg-${service.color}-900/20`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <service.icon className={`h-8 w-8 mx-auto mb-2 ${formData.serviceType === service.id ? `text-${service.color}-600` : 'text-gray-400'}`} />
                        <span className={`font-medium ${formData.serviceType === service.id ? `text-${service.color}-700` : 'text-gray-600'}`}>
                          {service.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ceiling Options */}
                {formData.serviceType === 'ceiling' && (
                  <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-700">Ceiling Options</h4>
                    
                    {/* Ceiling Type */}
                    <div className="space-y-2">
                      <Label>Select Ceiling Type</Label>
                      <Select
                        value={formData.ceilingType}
                        onValueChange={(value) => {
                          const type = ceilingTypes.find(t => t.id === value)
                          setFormData({
                            ...formData,
                            ceilingType: value,
                            ceilingPricePerSqFt: type?.defaultPrice || 180,
                            ceilingMeasurements: []
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ceiling type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ceilingTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name} (Rs. {type.defaultPrice}/sq.ft)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Macfoil Option */}
                    <div className="space-y-2">
                      <Label>Does customer want Macfoil?</Label>
                      <RadioGroup
                        value={formData.macfoil}
                        onValueChange={(value) => setFormData({ ...formData, macfoil: value as 'yes' | 'no' })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="macfoil-yes" />
                          <Label htmlFor="macfoil-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="macfoil-no" />
                          <Label htmlFor="macfoil-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.ceilingType && (
                      <>
                        {/* Number of Areas */}
                        <div className="space-y-2">
                          <Label>How many areas?</Label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={formData.ceilingAreas}
                            onChange={(e) => setFormData({ ...formData, ceilingAreas: parseInt(e.target.value) || 1 })}
                          />
                        </div>

                        {/* Price per sq ft */}
                        <div className="space-y-2">
                          <Label>Price per Square Feet (Rs.)</Label>
                          <Input
                            type="number"
                            value={formData.ceilingPricePerSqFt}
                            onChange={(e) => setFormData({ ...formData, ceilingPricePerSqFt: parseFloat(e.target.value) || 180 })}
                          />
                        </div>

                        {/* Area Measurements */}
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Area Measurements (Length x Width in feet)
                          </Label>
                          
                          {formData.ceilingMeasurements.map((m, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <span className="text-sm font-medium w-16">Area {i + 1}:</span>
                              <Input
                                placeholder="L (ft)"
                                value={m.length}
                                onChange={(e) => updateCeilingMeasurement(i, 'length', e.target.value)}
                                className="w-24"
                              />
                              <span>×</span>
                              <Input
                                placeholder="W (ft)"
                                value={m.width}
                                onChange={(e) => updateCeilingMeasurement(i, 'width', e.target.value)}
                                className="w-24"
                              />
                              <span className="text-sm text-gray-500">
                                = {((parseFloat(m.length) || 0) * (parseFloat(m.width) || 0)).toFixed(2)} sq.ft
                              </span>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addCeilingMeasurement}
                            disabled={formData.ceilingMeasurements.length >= formData.ceilingAreas}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Area
                          </Button>
                        </div>

                        {/* Total Calculation */}
                        {formData.ceilingMeasurements.length > 0 && (
                          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                            <h5 className="font-semibold mb-2">Calculation Summary</h5>
                            <div className="text-sm space-y-1">
                              {formData.ceilingMeasurements.map((m, i) => (
                                <p key={i}>
                                  Area {i + 1}: {m.length}' × {m.width}' = {((parseFloat(m.length) || 0) * (parseFloat(m.width) || 0)).toFixed(2)} sq.ft
                                </p>
                              ))}
                              <p className="font-semibold pt-2 border-t mt-2">
                                Total: {calculateCeilingTotal().totalSqFt} sq.ft × Rs. {formData.ceilingPricePerSqFt} = 
                                <span className="text-green-600 ml-1">Rs. {calculateCeilingTotal().totalPrice.toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Gutters Options */}
                {formData.serviceType === 'gutters' && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-700">Gutters Measurements</h4>
                    <p className="text-xs text-gray-500">Enter measurements like: 5' + 6' + 3' (will calculate total)</p>

                    {Object.entries({
                      guttersAndValance: 'Gutters & Valance/B',
                      bFlashingAndValance: 'B/Flashing & Valance/B',
                      gutters: 'Gutters',
                      valanceB: 'Valance/B',
                      bFlashing: 'B/Flashing',
                      dPipes: 'D/Pipes',
                      ridgeCover: 'Ridge Cover',
                      ratGuard: 'Rat Guard'
                    }).map(([key, label]) => (
                      <div key={key} className="space-y-1">
                        <Label>{label}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={formData.guttersMeasurements[key as keyof typeof formData.guttersMeasurements] as string}
                            onChange={(e) => setFormData({
                              ...formData,
                              guttersMeasurements: {
                                ...formData.guttersMeasurements,
                                [key]: e.target.value
                              }
                            })}
                            placeholder="5' + 6' + 3'"
                          />
                          <span className="flex items-center text-sm font-medium text-blue-600 min-w-16">
                            = {parseMeasurements(formData.guttersMeasurements[key as keyof typeof formData.guttersMeasurements] as string)}'
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Wall/F */}
                    <div className="space-y-2">
                      <Label>Wall/F</Label>
                      <Select
                        value={formData.guttersMeasurements.wallFSize}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          guttersMeasurements: { ...formData.guttersMeasurements, wallFSize: value as '9' | '12' }
                        })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9"</SelectItem>
                          <SelectItem value="12">12"</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={formData.guttersMeasurements.wallFMeasurements}
                        onChange={(e) => setFormData({
                          ...formData,
                          guttersMeasurements: { ...formData.guttersMeasurements, wallFMeasurements: e.target.value }
                        })}
                        placeholder="5' + 6' + 3'"
                      />
                    </div>

                    {/* Nozzels, End Caps, Chain Packets */}
                    {['nozzels', 'endCaps', 'chainPackets'].map(item => (
                      <div key={item} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="capitalize">{item.replace(/([A-Z])/g, ' $1')}</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${item}NotWant`}
                              checked={formData.guttersMeasurements[`${item}NotWant` as keyof typeof formData.guttersMeasurements] as boolean}
                              onCheckedChange={(checked) => setFormData({
                                ...formData,
                                guttersMeasurements: {
                                  ...formData.guttersMeasurements,
                                  [`${item}NotWant`]: checked,
                                  [item]: checked ? 0 : formData.guttersMeasurements[item as keyof typeof formData.guttersMeasurements]
                                }
                              })}
                            />
                            <Label htmlFor={`${item}NotWant`} className="text-xs">Don't want</Label>
                          </div>
                        </div>
                        {!(formData.guttersMeasurements[`${item}NotWant` as keyof typeof formData.guttersMeasurements]) && (
                          <Input
                            type="number"
                            value={formData.guttersMeasurements[item as keyof typeof formData.guttersMeasurements]}
                            onChange={(e) => setFormData({
                              ...formData,
                              guttersMeasurements: {
                                ...formData.guttersMeasurements,
                                [item]: parseInt(e.target.value) || 0
                              }
                            })}
                            placeholder={`How many ${item}?`}
                          />
                        )}
                      </div>
                    ))}

                    {/* Custom Design Note */}
                    <div className="space-y-2">
                      <Label>Custom Design Note</Label>
                      <Textarea
                        value={formData.guttersMeasurements.customDesignNote}
                        onChange={(e) => setFormData({
                          ...formData,
                          guttersMeasurements: { ...formData.guttersMeasurements, customDesignNote: e.target.value }
                        })}
                        placeholder="If customer has custom design, add note..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Roof Options */}
                {formData.serviceType === 'roof' && (
                  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-700">Roof Options</h4>

                    {/* New or Repair */}
                    <div className="space-y-2">
                      <Label>Roof Type</Label>
                      <RadioGroup
                        value={formData.roofType}
                        onValueChange={(value) => setFormData({ ...formData, roofType: value as 'new' | 'repair' })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id="roof-new" />
                          <Label htmlFor="roof-new">New Roof</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="repair" id="roof-repair" />
                          <Label htmlFor="roof-repair">Repair Roof</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.roofType === 'new' && (
                      <>
                        {/* Wood or Steel */}
                        <div className="space-y-2">
                          <Label>Roof Material</Label>
                          <RadioGroup
                            value={formData.roofMaterial}
                            onValueChange={(value) => setFormData({ ...formData, roofMaterial: value as 'wood' | 'steel' })}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wood" id="material-wood" />
                              <Label htmlFor="material-wood">Wood Roof</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="steel" id="material-steel" />
                              <Label htmlFor="material-steel">Steel Roof</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {formData.roofMaterial && (
                          <>
                            {/* Normal or Finishing */}
                            <div className="space-y-2">
                              <Label>Roof Finish</Label>
                              <RadioGroup
                                value={formData.roofFinish}
                                onValueChange={(value) => setFormData({ ...formData, roofFinish: value as 'normal' | 'finishing' })}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="normal" id="finish-normal" />
                                  <Label htmlFor="finish-normal">Normal Roof</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="finishing" id="finish-finishing" />
                                  <Label htmlFor="finish-finishing">Finishing Roof</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* Material Type */}
                            <div className="space-y-2">
                              <Label>Material Type</Label>
                              <Select
                                value={formData.roofMaterialType}
                                onValueChange={(value) => setFormData({ ...formData, roofMaterialType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roofMaterials.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Color Selection for Asbestos Color */}
                            {formData.roofMaterialType === 'asbestos-color' && (
                              <div className="space-y-2">
                                <Label>Select Color</Label>
                                <Select
                                  value={formData.roofMaterialColor}
                                  onValueChange={(value) => setFormData({ ...formData, roofMaterialColor: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {['Tile Red', 'Green', 'Brown', 'Ash'].map(color => (
                                      <SelectItem key={color} value={color.toLowerCase().replace(' ', '-')}>{color}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Quotation & Status */}
            {currentStep === 6 && (
              <div className="space-y-4">
                {/* Quotation Number */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    Quotation Number
                  </Label>
                  <Input
                    value={formData.quotationNumber}
                    onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
                    placeholder="Enter quotation number"
                  />
                </div>

                {/* Quotation PDF */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-blue-600" />
                    Quotation Attachment (PDF)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PDF format only</p>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'pending' | 'running' | 'complete' | 'cancel' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          Pending
                        </span>
                      </SelectItem>
                      <SelectItem value="running">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Running
                        </span>
                      </SelectItem>
                      <SelectItem value="complete">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Complete
                        </span>
                      </SelectItem>
                      <SelectItem value="cancel">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Cancel
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>

                {/* Summary */}
                {formData.serviceType === 'ceiling' && formData.ceilingMeasurements.length > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <h4 className="font-semibold mb-2">Cost Summary</h4>
                    <p className="text-lg font-bold text-green-600">
                      Total: Rs. {calculateCeilingTotal().totalPrice.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 font-medium">
                      Registration submitted successfully! 🎉
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to submit. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            Developed by <span className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">ZIPCARTCO</span>
          </p>
          <p className="text-xs mt-1">Mr. Ranshika Foundation's IT Company</p>
        </footer>
      </div>
    </main>
  )
}
