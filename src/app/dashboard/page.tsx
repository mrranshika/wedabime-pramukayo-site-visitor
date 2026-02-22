'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Users, 
  BarChart3, 
  FileText, 
  Calendar as CalendarIcon,
  Settings,
  Search,
  MessageCircle,
  Eye,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Wrench,
  Activity,
  Sparkles,
  Phone,
  ExternalLink,
  Sheet
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
  leadReceivedDate: string
  day: string
  customerName: string
  phoneNumber: string
  phoneHasWhatsApp: string
  hasWhatsAppNumber: string
  whatsappNumber: string
  district: string
  city: string
  address: string
  googleMapsLink: string
  latitude: string
  longitude: string
  serviceType: string
  ceilingType: string
  ceilingTotalPrice: number
  guttersTotalFeet: string
  guttersTotalPrice: string
  roofType: string
  roofTotalPrice: string
  quotationNumber: string
  totalAmount: number
  status: string
  notes: string
  createdAt: string
  updatedAt: string
}

function DashboardContent() {
  const [visits, setVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [dataSource, setDataSource] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    thisMonth: 0,
    totalQuotations: 0
  })

  // Fetch visits from Google Sheets
  const fetchVisits = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (districtFilter !== 'all') params.append('district', districtFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/google-sheets?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setVisits(data.data)
        setDataSource(data.source)
        
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const totalAmount = data.data.reduce((sum: number, v: SiteVisit) => sum + (parseFloat(String(v.totalAmount)) || 0), 0)
        
        setStats({
          total: data.data.length,
          pending: data.data.filter((v: SiteVisit) => v.status === 'pending').length,
          completed: data.data.filter((v: SiteVisit) => v.status === 'complete' || v.status === 'completed').length,
          cancelled: data.data.filter((v: SiteVisit) => v.status === 'cancel' || v.status === 'cancelled').length,
          thisMonth: data.data.filter((v: SiteVisit) => new Date(v.createdAt) >= thisMonthStart).length,
          totalQuotations: totalAmount
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

  // Open WhatsApp
  const openWhatsApp = (phone: string, customerName: string) => {
    const cleanPhone = String(phone).replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.startsWith('0') ? '94' + cleanPhone.substring(1) : cleanPhone
    const message = encodeURIComponent(`Hello ${customerName}! This is Wedabime Pramukayo. Thank you for your interest in our services.`)
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank')
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Customer ID', 'Date', 'Name', 'Phone', 'District', 'City', 'Service', 'Status', 'Total Amount']
    const rows = visits.map(v => [
      v.customerId,
      v.leadReceivedDate,
      v.customerName,
      v.phoneNumber,
      v.district,
      v.city,
      v.serviceType,
      v.status,
      v.totalAmount || 0
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
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'complete':
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'cancelled':
      case 'cancel': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Service labels
  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'ceiling': return 'Ceiling'
      case 'gutters': return 'Gutters'
      case 'roof': return 'Roof'
      default: return service || '-'
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    if (dateStr.startsWith('Date(')) {
      const match = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/)
      if (match) {
        const date = new Date(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]))
        return date.toLocaleDateString()
      }
    }
    try {
      return new Date(dateStr).toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Data Source Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sheet className="h-4 w-4 text-green-600" />
            <span>Connected to Google Sheets</span>
            {dataSource && (
              <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                Live Data
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://docs.google.com/spreadsheets/d/1fbacGzpr6v894f0bsT8CA7dJGjAHF3r-fB5I19kKpTA/edit', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Sheet
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs.{(stats.totalQuotations / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="visitors" className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1 w-full max-w-lg mx-auto grid grid-cols-4">
            <TabsTrigger value="visitors" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Visitors</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="quotations" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Quotations</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Info</span>
            </TabsTrigger>
          </TabsList>

          {/* Visitors Tab */}
          <TabsContent value="visitors">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Site Visitors from Google Sheets
                    </CardTitle>
                    <CardDescription>
                      {visits.length} records found
                    </CardDescription>
                  </div>
                  <Button onClick={exportToCSV} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
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
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="cancel">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger className="w-full md:w-36">
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
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Customer</TableHead>
                          <TableHead className="font-semibold hidden md:table-cell">Phone</TableHead>
                          <TableHead className="font-semibold hidden lg:table-cell">District</TableHead>
                          <TableHead className="font-semibold">Service</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.map((visit) => (
                          <TableRow key={visit.id} className="hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors">
                            <TableCell className="font-mono text-sm">{visit.customerId}</TableCell>
                            <TableCell className="text-sm">{formatDate(visit.leadReceivedDate)}</TableCell>
                            <TableCell className="font-medium">{visit.customerName}</TableCell>
                            <TableCell className="hidden md:table-cell">{visit.phoneNumber}</TableCell>
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
                                  onClick={() => openWhatsApp(visit.phoneNumber, visit.customerName)}
                                  className="hover:bg-green-50 dark:hover:bg-green-950/50"
                                >
                                  <MessageCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                {visit.googleMapsLink && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => window.open(visit.googleMapsLink, '_blank')}
                                    className="hover:bg-red-50 dark:hover:bg-red-950/50"
                                  >
                                    <MapPin className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* District Distribution */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
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
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    Service Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['ceiling', 'gutters', 'roof'].map(service => {
                      const count = visits.filter(v => v.serviceType === service).length
                      const percentage = visits.length > 0 ? Math.round((count / visits.length) * 100) : 0
                      return (
                        <div key={service} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{service}</span>
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
          <TabsContent value="quotations">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Quotations Overview
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
                        <TableHead className="font-semibold">Quotation #</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.filter(v => v.totalAmount > 0).map((visit) => (
                        <TableRow key={visit.id} className="hover:bg-green-50/50 dark:hover:bg-green-950/20">
                          <TableCell className="font-mono">{visit.customerId}</TableCell>
                          <TableCell className="font-medium">{visit.customerName}</TableCell>
                          <TableCell>{getServiceLabel(visit.serviceType)}</TableCell>
                          <TableCell>{visit.quotationNumber || '-'}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            Rs. {parseFloat(String(visit.totalAmount))?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  Application Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 space-y-3">
                  <p className="flex items-center gap-2"><strong>App:</strong> Wedabime Pramukayo Site Visitor Management</p>
                  <p className="flex items-center gap-2"><strong>Version:</strong> 2.0.0 - Google Sheets Edition</p>
                  <p className="flex items-center gap-2"><strong>Data Source:</strong> Google Sheets (Live)</p>
                  <p className="flex items-center gap-2"><strong>Developed by:</strong> <span className="font-bold text-green-600">ZIPCARTCO</span></p>
                  <p className="flex items-center gap-2"><strong>Foundation:</strong> Mr. Ranshika Foundation&apos;s IT Company</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Sheet, title: 'Google Sheets Sync', desc: 'Real-time data from Google Sheets' },
                      { icon: Users, title: 'Visitor Management', desc: 'View all registered site visitors' },
                      { icon: MessageCircle, title: 'WhatsApp Integration', desc: 'Quick contact via WhatsApp' },
                      { icon: BarChart3, title: 'Reports & Analytics', desc: 'View detailed statistics' },
                      { icon: DollarSign, title: 'Quotation Overview', desc: 'Track customer quotations' },
                      { icon: MapPin, title: 'Location Links', desc: 'Direct Google Maps links' },
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
        <DialogContent className="max-w-md">
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
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(selectedVisit.leadReceivedDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{selectedVisit.customerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Phone</span>
                <span>{selectedVisit.phoneNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">WhatsApp</span>
                <span>{selectedVisit.phoneHasWhatsApp === 'Yes' ? '✓ Yes' : '✗ No'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">District</span>
                <span>{selectedVisit.district}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">City</span>
                <span>{selectedVisit.city}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Service</span>
                <span>{getServiceLabel(selectedVisit.serviceType)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getStatusColor(selectedVisit.status)}>{selectedVisit.status}</Badge>
              </div>
              {selectedVisit.address && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-right max-w-[200px]">{selectedVisit.address}</span>
                </div>
              )}
              {selectedVisit.totalAmount > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-green-600">Rs. {parseFloat(String(selectedVisit.totalAmount))?.toLocaleString()}</span>
                </div>
              )}
              {selectedVisit.notes && (
                <div className="py-2">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1 text-sm">{selectedVisit.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              onClick={() => selectedVisit && openWhatsApp(selectedVisit.phoneNumber, selectedVisit.customerName)}
              className="bg-gradient-to-r from-green-500 to-emerald-600"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            {selectedVisit?.googleMapsLink && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedVisit.googleMapsLink, '_blank')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Maps
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t py-3 text-center text-sm text-muted-foreground">
        Developed by <span className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">ZIPCARTCO</span> - Mr. Ranshika Foundation&apos;s IT Company
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
