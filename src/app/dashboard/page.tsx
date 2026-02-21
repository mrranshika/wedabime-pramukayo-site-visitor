'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Users, 
  BarChart3, 
  FileText, 
  Calendar as CalendarIcon,
  Settings,
  Search,
  Phone,
  MapPin,
  Building2,
  Wrench,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import Header from '@/components/Header'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

// Sri Lankan districts
const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
]

interface SiteVisit {
  id: string
  customerId: string
  customerName: string
  phone: string
  address: string
  district: string
  serviceType: string
  visitDate: string
  scheduledDate: string | null
  status: string
  notes: string | null
  photos: string | null
  quotation: number | null
  quotationDate: string | null
  quotationNote: string | null
  createdAt: string
  updatedAt: string
}

function DashboardContent() {
  const { t, language } = useLanguage()
  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarVisits, setCalendarVisits] = useState<SiteVisit[]>([])

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    thisMonth: 0,
    totalQuotations: 0
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    district: '',
    serviceType: '',
    status: 'pending',
    notes: '',
    scheduledDate: ''
  })

  // Quotation form state
  const [quotationForm, setQuotationForm] = useState({
    quotation: '',
    quotationNote: ''
  })

  // Fetch visits
  const fetchVisits = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (districtFilter !== 'all') params.append('district', districtFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/site-visits?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setVisits(data.data)
        
        // Calculate stats
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        
        setStats({
          total: data.data.length,
          pending: data.data.filter((v: SiteVisit) => v.status === 'pending').length,
          completed: data.data.filter((v: SiteVisit) => v.status === 'completed').length,
          thisMonth: data.data.filter((v: SiteVisit) => new Date(v.createdAt) >= thisMonthStart).length,
          totalQuotations: data.data.reduce((sum: number, v: SiteVisit) => sum + (v.quotation || 0), 0)
        })
      }
    } catch (error) {
      console.error('Error fetching visits:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisits()
  }, [statusFilter, districtFilter, searchTerm])

  // Calendar visits
  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const filtered = visits.filter(v => 
        v.scheduledDate && v.scheduledDate.startsWith(dateStr)
      )
      setCalendarVisits(filtered)
    }
  }, [selectedDate, visits])

  // Open WhatsApp
  const openWhatsApp = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.substring(1) : cleanPhone
    const message = encodeURIComponent(`Hello ${customerName}! This is Wedabime Pramukayo. Thank you for your interest in our services.`)
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank')
  }

  // Edit visit
  const handleEdit = (visit: SiteVisit) => {
    setSelectedVisit(visit)
    setEditForm({
      customerName: visit.customerName,
      phone: visit.phone,
      address: visit.address,
      district: visit.district,
      serviceType: visit.serviceType,
      status: visit.status,
      notes: visit.notes || '',
      scheduledDate: visit.scheduledDate ? visit.scheduledDate.split('T')[0] : ''
    })
    setIsEditDialogOpen(true)
  }

  // Save edit
  const handleSaveEdit = async () => {
    if (!selectedVisit) return
    
    try {
      const response = await fetch('/api/site-visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVisit.id,
          ...editForm
        })
      })
      
      if (response.ok) {
        setIsEditDialogOpen(false)
        fetchVisits()
      }
    } catch (error) {
      console.error('Error updating visit:', error)
    }
  }

  // Delete visit
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    try {
      const response = await fetch(`/api/site-visits?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchVisits()
      }
    } catch (error) {
      console.error('Error deleting visit:', error)
    }
  }

  // Add quotation
  const handleAddQuotation = async () => {
    if (!selectedVisit) return
    
    try {
      const response = await fetch('/api/site-visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVisit.id,
          quotation: parseFloat(quotationForm.quotation),
          quotationNote: quotationForm.quotationNote,
          quotationDate: new Date().toISOString(),
          status: 'completed'
        })
      })
      
      if (response.ok) {
        setIsQuotationDialogOpen(false)
        setQuotationForm({ quotation: '', quotationNote: '' })
        fetchVisits()
      }
    } catch (error) {
      console.error('Error adding quotation:', error)
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Customer ID', 'Name', 'Phone', 'Address', 'District', 'Service', 'Status', 'Date', 'Quotation']
    const rows = visits.map(v => [
      v.customerId,
      v.customerName,
      v.phone,
      v.address,
      v.district,
      v.serviceType,
      v.status,
      new Date(v.createdAt).toLocaleDateString(),
      v.quotation || ''
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `site-visits-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      case 'rescheduled': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Service labels
  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'ceiling': return t('service.ceiling')
      case 'roofing': return t('service.roofing')
      case 'gutter': return t('service.gutter')
      case 'all': return t('service.all')
      default: return service
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        <Tabs defaultValue="visitors" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto bg-green-100 dark:bg-green-900/30">
            <TabsTrigger value="visitors" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.visitors')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.reports')}</span>
            </TabsTrigger>
            <TabsTrigger value="quotations" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.quotations')}</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.calendar')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.settings')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Visitors Tab */}
          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Site Visitors
                    </CardTitle>
                    <CardDescription>Manage all registered site visits</CardDescription>
                  </div>
                  <Button onClick={exportToCSV} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, phone, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No visitors found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell className="font-mono text-sm">{visit.customerId}</TableCell>
                            <TableCell className="font-medium">{visit.customerName}</TableCell>
                            <TableCell>{visit.phone}</TableCell>
                            <TableCell>{visit.district}</TableCell>
                            <TableCell>{getServiceLabel(visit.serviceType)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(visit.status)}>
                                {visit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(visit.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedVisit(visit)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => openWhatsApp(visit.phone, visit.customerName)}
                                  className="text-green-600"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleEdit(visit)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDelete(visit.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Visitors</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    All time registrations
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Pending</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-yellow-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Awaiting completion
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Successfully completed
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>This Month</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.thisMonth}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-blue-600">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    New registrations
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* District Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>District Distribution</CardTitle>
                <CardDescription>Visitors by district</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {districts.slice(0, 10).map(district => {
                    const count = visits.filter(v => v.district === district).length
                    return (
                      <div key={district} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{count}</div>
                        <div className="text-xs text-gray-500">{district}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Service Type Distribution */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['ceiling', 'roofing', 'gutter', 'all'].map(service => {
                    const count = visits.filter(v => v.serviceType === service).length
                    const percentage = visits.length > 0 ? Math.round((count / visits.length) * 100) : 0
                    return (
                      <div key={service} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{count}</div>
                        <div className="text-sm text-gray-500">{getServiceLabel(service)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Quotations Management
                </CardTitle>
                <CardDescription>Total Quotation Value: Rs. {stats.totalQuotations.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Quotation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-mono">{visit.customerId}</TableCell>
                          <TableCell>{visit.customerName}</TableCell>
                          <TableCell>{getServiceLabel(visit.serviceType)}</TableCell>
                          <TableCell>
                            {visit.quotation ? `Rs. ${visit.quotation.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(visit.status)}>
                              {visit.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedVisit(visit)
                                setQuotationForm({
                                  quotation: visit.quotation?.toString() || '',
                                  quotationNote: visit.quotationNote || ''
                                })
                                setIsQuotationDialogOpen(true)
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Quotation
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                  Calendar View
                </CardTitle>
                <CardDescription>View scheduled visits by date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-4">
                      Visits on {selectedDate?.toLocaleDateString()}
                    </h3>
                    {calendarVisits.length === 0 ? (
                      <div className="text-gray-500 py-8 text-center">
                        No visits scheduled for this date
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {calendarVisits.map(visit => (
                          <Card key={visit.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{visit.customerName}</div>
                                <div className="text-sm text-gray-500">{visit.phone}</div>
                                <div className="text-sm text-gray-500">{visit.address}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(visit.status)}>
                                  {visit.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openWhatsApp(visit.phone, visit.customerName)}
                                >
                                  <MessageCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Application Info</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <p><strong>App:</strong> Wedabime Pramukayo Site Visitor Management</p>
                    <p><strong>Version:</strong> 1.0.0</p>
                    <p><strong>Developed by:</strong> ZIPCARTCO</p>
                    <p><strong>Foundation:</strong> Mr. Ranshika Foundation&apos;s IT Company</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                      <h4 className="font-medium">Visitor Registration</h4>
                      <p className="text-sm text-gray-500">Register site visitors with full details</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                      <h4 className="font-medium">WhatsApp Integration</h4>
                      <p className="text-sm text-gray-500">Quick contact via WhatsApp</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                      <h4 className="font-medium">Reports & Analytics</h4>
                      <p className="text-sm text-gray-500">View detailed statistics</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                      <h4 className="font-medium">Quotation System</h4>
                      <p className="text-sm text-gray-500">Manage customer quotations</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                      <h4 className="font-medium">Calendar View</h4>
                      <p className="text-sm text-gray-500">Schedule and track visits</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
                      <h4 className="font-medium">Multi-Language</h4>
                      <p className="text-sm text-gray-500">English, Sinhala, Tamil support</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Services Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50">Ceiling Insulation</Badge>
                    <Badge variant="outline" className="bg-green-50">Roofing Insulation</Badge>
                    <Badge variant="outline" className="bg-green-50">Gutter Insulation</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer ID:</span>
                <span className="font-mono">{selectedVisit.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedVisit.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span>{selectedVisit.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">District:</span>
                <span>{selectedVisit.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service:</span>
                <span>{getServiceLabel(selectedVisit.serviceType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedVisit.status)}>
                  {selectedVisit.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address:</span>
                <span className="text-right">{selectedVisit.address}</span>
              </div>
              {selectedVisit.notes && (
                <div>
                  <span className="text-gray-500">Notes:</span>
                  <p className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}
              {selectedVisit.quotation && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Quotation:</span>
                  <span className="font-semibold text-green-600">
                    Rs. {selectedVisit.quotation.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => selectedVisit && openWhatsApp(selectedVisit.phone, selectedVisit.customerName)}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Visitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div>
              <Label>District</Label>
              <Select value={editForm.district} onValueChange={(v) => setEditForm({ ...editForm, district: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Service Type</Label>
              <Select value={editForm.serviceType} onValueChange={(v) => setEditForm({ ...editForm, serviceType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceiling">Ceiling Insulation</SelectItem>
                  <SelectItem value="roofing">Roofing Insulation</SelectItem>
                  <SelectItem value="gutter">Gutter Insulation</SelectItem>
                  <SelectItem value="all">All Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={editForm.scheduledDate}
                onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quotation Amount (Rs.)</Label>
              <Input
                type="number"
                value={quotationForm.quotation}
                onChange={(e) => setQuotationForm({ ...quotationForm, quotation: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={quotationForm.quotationNote}
                onChange={(e) => setQuotationForm({ ...quotationForm, quotationNote: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuotationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuotation} className="bg-green-600 hover:bg-green-700">Save Quotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t py-3 text-center text-sm text-gray-500">
        Developed by <span className="font-semibold text-green-600">ZIPCARTCO</span> - Mr. Ranshika Foundation&apos;s IT Company
      </footer>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}
