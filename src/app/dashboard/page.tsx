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
  DialogFooter,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar } from '@/components/ui/calendar'
import { 
  Users, 
  BarChart3, 
  FileText, 
  Calendar as CalendarIcon,
  Settings,
  Search,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
  Wrench,
  Activity,
  Sparkles,
  Phone
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
      case 'pending': return 'status-pending'
      case 'completed': return 'status-completed'
      case 'cancelled': return 'status-cancelled'
      case 'rescheduled': return 'status-rescheduled'
      default: return 'bg-gray-100 text-gray-800'
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
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="stat-card glass-card hover-lift fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card glass-card hover-lift fade-in" style={{ animationDelay: '0.15s' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card glass-card hover-lift fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stat-card glass-card hover-lift fade-in" style={{ animationDelay: '0.25s' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs.{(stats.totalQuotations / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Quotations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visitors" className="space-y-6">
          <TabsList className="glass-card p-1 w-full max-w-xl mx-auto grid grid-cols-5">
            <TabsTrigger value="visitors" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.visitors')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.reports')}</span>
            </TabsTrigger>
            <TabsTrigger value="quotations" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.quotations')}</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.calendar')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.settings')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="fade-in">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Site Visitors
                    </CardTitle>
                    <CardDescription>Manage all registered site visits</CardDescription>
                  </div>
                  <Button onClick={exportToCSV} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 modern-input"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-36 modern-input">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger className="w-full md:w-36 modern-input">
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
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No visitors found</p>
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold hidden md:table-cell">Phone</TableHead>
                          <TableHead className="font-semibold hidden lg:table-cell">District</TableHead>
                          <TableHead className="font-semibold">Service</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.map((visit, index) => (
                          <TableRow key={visit.id} className="hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors">
                            <TableCell className="font-mono text-sm">{visit.customerId}</TableCell>
                            <TableCell className="font-medium">{visit.customerName}</TableCell>
                            <TableCell className="hidden md:table-cell">{visit.phone}</TableCell>
                            <TableCell className="hidden lg:table-cell">{visit.district}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50">
                                {getServiceLabel(visit.serviceType)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(visit.status)}>
                                {visit.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedVisit(visit)
                                    setIsViewDialogOpen(true)
                                  }}
                                  className="hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => openWhatsApp(visit.phone, visit.customerName)}
                                  className="hover:bg-green-50 dark:hover:bg-green-950/50"
                                >
                                  <MessageCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleEdit(visit)}
                                  className="hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                >
                                  <Edit className="h-4 w-4 text-amber-600" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDelete(visit.id)}
                                  className="hover:bg-red-50 dark:hover:bg-red-950/50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
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
          <TabsContent value="reports" className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* District Distribution */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    District Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {districts.slice(0, 9).map(district => {
                      const count = visits.filter(v => v.district === district).length
                      const maxCount = Math.max(...districts.map(d => visits.filter(v => v.district === d).length), 1)
                      const percentage = (count / maxCount) * 100
                      return (
                        <div key={district} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors">
                          <div className="text-xl font-bold text-green-600">{count}</div>
                          <div className="text-xs text-muted-foreground">{district}</div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Service Type Distribution */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    Service Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['ceiling', 'roofing', 'gutter', 'all'].map(service => {
                      const count = visits.filter(v => v.serviceType === service).length
                      const percentage = visits.length > 0 ? Math.round((count / visits.length) * 100) : 0
                      return (
                        <div key={service} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{getServiceLabel(service)}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="fade-in">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Quotations Management
                </CardTitle>
                <CardDescription>
                  Total Value: <span className="font-bold text-green-600">Rs. {stats.totalQuotations.toLocaleString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Service</TableHead>
                        <TableHead className="font-semibold">Quotation</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit) => (
                        <TableRow key={visit.id} className="hover:bg-green-50/50 dark:hover:bg-green-950/20">
                          <TableCell className="font-mono">{visit.customerId}</TableCell>
                          <TableCell className="font-medium">{visit.customerName}</TableCell>
                          <TableCell>{getServiceLabel(visit.serviceType)}</TableCell>
                          <TableCell className="font-semibold">
                            {visit.quotation ? `Rs. ${visit.quotation.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
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
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
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
          <TabsContent value="calendar" className="fade-in">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0 mx-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-xl border shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      Visits on {selectedDate?.toLocaleDateString()}
                    </h3>
                    {calendarVisits.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No visits scheduled for this date</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {calendarVisits.map(visit => (
                          <Card key={visit.id} className="p-4 hover-lift">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{visit.customerName}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  {visit.phone}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
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
          <TabsContent value="settings" className="fade-in">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Application Info</h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 space-y-3">
                    <p className="flex items-center gap-2"><strong>App:</strong> Wedabime Pramukayo Site Visitor Management</p>
                    <p className="flex items-center gap-2"><strong>Version:</strong> 2.0.0 Modern</p>
                    <p className="flex items-center gap-2"><strong>Developed by:</strong> <span className="font-bold text-green-600">ZIPCARTCO</span></p>
                    <p className="flex items-center gap-2"><strong>Foundation:</strong> Mr. Ranshika Foundation&apos;s IT Company</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Users, title: 'Visitor Registration', desc: 'Register site visitors with full details' },
                      { icon: MessageCircle, title: 'WhatsApp Integration', desc: 'Quick contact via WhatsApp' },
                      { icon: BarChart3, title: 'Reports & Analytics', desc: 'View detailed statistics' },
                      { icon: DollarSign, title: 'Quotation System', desc: 'Manage customer quotations' },
                      { icon: CalendarIcon, title: 'Calendar View', desc: 'Schedule and track visits' },
                      { icon: Sparkles, title: 'Multi-Language', desc: 'English, Sinhala, Tamil support' },
                    ].map((feature, i) => (
                      <div key={i} className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                        <feature.icon className="h-5 w-5 text-green-600 mb-2" />
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              Visitor Details
            </DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Customer ID</span>
                <span className="font-mono font-medium">{selectedVisit.customerId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{selectedVisit.customerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Phone</span>
                <span>{selectedVisit.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">District</span>
                <span>{selectedVisit.district}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Service</span>
                <span>{getServiceLabel(selectedVisit.serviceType)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusColor(selectedVisit.status)}>{selectedVisit.status}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right max-w-[200px]">{selectedVisit.address}</span>
              </div>
              {selectedVisit.quotation && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Quotation</span>
                  <span className="font-bold text-green-600">Rs. {selectedVisit.quotation.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => selectedVisit && openWhatsApp(selectedVisit.phone, selectedVisit.customerName)}
              className="bg-gradient-to-r from-green-500 to-emerald-600"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Visitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} className="modern-input" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="modern-input" />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="modern-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>District</Label>
                <Select value={editForm.district} onValueChange={(v) => setEditForm({ ...editForm, district: v })}>
                  <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger className="modern-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-green-500 to-emerald-600">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Dialog */}
      <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quotation Amount (Rs.)</Label>
              <Input type="number" value={quotationForm.quotation} onChange={(e) => setQuotationForm({ ...quotationForm, quotation: e.target.value })} className="modern-input" placeholder="Enter amount" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={quotationForm.quotationNote} onChange={(e) => setQuotationForm({ ...quotationForm, quotationNote: e.target.value })} className="modern-input" placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuotationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddQuotation} className="bg-gradient-to-r from-green-500 to-emerald-600">Save Quotation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 glass-card border-t py-3 text-center text-sm">
        <span className="text-muted-foreground">Developed by</span>{' '}
        <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">ZIPCARTCO</span>
        {' '}<span className="text-muted-foreground">- Mr. Ranshika Foundation&apos;s IT Company</span>
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
