import { NextRequest, NextResponse } from 'next/server'

// Helper function to convert string to boolean
function parseBoolean(value: unknown): boolean | null {
  if (value === true || value === 'true' || value === 'yes' || value === 1) return true
  if (value === false || value === 'false' || value === 'no' || value === 0) return false
  if (value === '' || value === null || value === undefined) return null
  return Boolean(value)
}

// Helper function to parse number or return null
function parseNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null
  const num = parseFloat(String(value))
  return isNaN(num) ? null : num
}

// Check if database is available
async function isDatabaseAvailable() {
  try {
    const { db } = await import('@/lib/db')
    // Try a simple query to check if table exists
    await db.$queryRaw`SELECT 1 as test`
    return true
  } catch {
    return false
  }
}

// In-memory store for when database is not available (for demo purposes)
// Note: This will reset on each serverless function invocation
const memoryStore: Array<Record<string, unknown>> = []

// GET - Fetch all site visits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const district = searchParams.get('district')
    const search = searchParams.get('search')

    // Check if database is available
    const dbAvailable = await isDatabaseAvailable()
    
    if (dbAvailable) {
      const { db } = await import('@/lib/db')
      const where: Record<string, unknown> = {}
      
      if (status && status !== 'all') {
        where.status = status
      }
      if (district && district !== 'all') {
        where.district = district
      }
      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } },
          { customerId: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      }

      const visits = await db.siteVisit.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ 
        success: true, 
        data: visits,
        source: 'database'
      })
    } else {
      // Return memory store data
      return NextResponse.json({ 
        success: true, 
        data: memoryStore,
        source: 'memory',
        message: 'Database not configured. Data stored in memory only.'
      })
    }
  } catch (error) {
    console.error('Error fetching site visits:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch site visits' 
    }, { status: 500 })
  }
}

// POST - Create new site visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const now = new Date()
    
    const visitData = {
      id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: body.customerId,
      leadReceivedDate: body.leadReceivedDate,
      customerName: body.customerName,
      phoneNumber: body.phoneNumber,
      phoneHasWhatsApp: Boolean(body.phoneHasWhatsApp),
      hasWhatsAppNumber: parseBoolean(body.hasWhatsAppNumber),
      whatsappNumber: body.whatsappNumber || null,
      district: body.district,
      city: body.city,
      address: body.address || null,
      googleMapsLink: body.googleMapsLink || null,
      latitude: parseNumber(body.latitude),
      longitude: parseNumber(body.longitude),
      drawings: body.drawings || null,
      images: body.images || null,
      videos: body.videos || null,
      hasRemovals: Boolean(body.hasRemovals),
      removalCharge: parseNumber(body.removalCharge),
      hasAdditionalLabour: Boolean(body.hasAdditionalLabour),
      additionalLabourCharge: parseNumber(body.additionalLabourCharge),
      serviceType: body.serviceType,
      ceilingDetails: body.ceilingDetails || null,
      guttersDetails: body.guttersDetails || null,
      roofDetails: body.roofDetails || null,
      quotationNumber: body.quotationNumber || null,
      quotationPdf: body.quotationPdf || null,
      totalAmount: parseNumber(body.totalAmount),
      status: body.status || 'pending',
      notes: body.notes || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    // Try to save to database if available
    let dbSaved = false
    const dbAvailable = await isDatabaseAvailable()
    
    if (dbAvailable) {
      try {
        const { db } = await import('@/lib/db')
        await db.siteVisit.create({
          data: {
            customerId: visitData.customerId,
            leadReceivedDate: new Date(visitData.leadReceivedDate),
            customerName: visitData.customerName,
            phoneNumber: visitData.phoneNumber,
            phoneHasWhatsApp: visitData.phoneHasWhatsApp,
            hasWhatsAppNumber: visitData.hasWhatsAppNumber,
            whatsappNumber: visitData.whatsappNumber,
            district: visitData.district,
            city: visitData.city,
            address: visitData.address,
            googleMapsLink: visitData.googleMapsLink,
            latitude: visitData.latitude,
            longitude: visitData.longitude,
            drawings: visitData.drawings,
            images: visitData.images,
            videos: visitData.videos,
            hasRemovals: visitData.hasRemovals,
            removalCharge: visitData.removalCharge,
            hasAdditionalLabour: visitData.hasAdditionalLabour,
            additionalLabourCharge: visitData.additionalLabourCharge,
            serviceType: visitData.serviceType,
            ceilingDetails: visitData.ceilingDetails,
            guttersDetails: visitData.guttersDetails,
            roofDetails: visitData.roofDetails,
            quotationNumber: visitData.quotationNumber,
            quotationPdf: visitData.quotationPdf,
            totalAmount: visitData.totalAmount,
            status: visitData.status,
            notes: visitData.notes
          }
        })
        dbSaved = true
        console.log('✅ Saved to database')
      } catch (dbError) {
        console.error('Database save failed:', dbError)
      }
    }

    // Also save to memory store as backup
    memoryStore.unshift(visitData)

    // Send to Google Sheets (primary storage for Vercel)
    let sheetsSynced = false
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const sheetsData = {
          customerId: visitData.customerId,
          leadReceivedDate: visitData.leadReceivedDate,
          customerName: visitData.customerName,
          phoneNumber: visitData.phoneNumber,
          phoneHasWhatsApp: visitData.phoneHasWhatsApp ? 'Yes' : 'No',
          hasWhatsAppNumber: visitData.hasWhatsAppNumber !== null ? (visitData.hasWhatsAppNumber ? 'Yes' : 'No') : '',
          whatsappNumber: visitData.whatsappNumber || '',
          district: visitData.district,
          city: visitData.city,
          address: visitData.address || '',
          googleMapsLink: visitData.googleMapsLink || '',
          latitude: visitData.latitude || '',
          longitude: visitData.longitude || '',
          drawings: visitData.drawings || '',
          images: visitData.images || '',
          videos: visitData.videos || '',
          hasRemovals: visitData.hasRemovals ? 'Yes' : 'No',
          removalCharge: visitData.removalCharge || 0,
          hasAdditionalLabour: visitData.hasAdditionalLabour ? 'Yes' : 'No',
          additionalLabourCharge: visitData.additionalLabourCharge || 0,
          serviceType: visitData.serviceType,
          ceilingDetails: visitData.ceilingDetails || '',
          guttersDetails: visitData.guttersDetails || '',
          roofDetails: visitData.roofDetails || '',
          quotationNumber: visitData.quotationNumber || '',
          quotationPdf: visitData.quotationPdf || '',
          totalAmount: visitData.totalAmount || 0,
          status: visitData.status,
          notes: visitData.notes || '',
          createdAt: visitData.createdAt,
          updatedAt: visitData.updatedAt
        }

        console.log('Sending to Google Sheets:', process.env.GOOGLE_SHEETS_WEBHOOK_URL)
        
        const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetsData)
        })
        
        const result = await response.text()
        console.log('Google Sheets response:', response.status, result)
        
        if (response.ok) {
          sheetsSynced = true
          console.log('✅ Synced to Google Sheets')
        } else {
          console.error('Google Sheets sync failed: HTTP', response.status)
        }
      } catch (e) {
        console.error('Google Sheets sync failed:', e)
      }
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      data: visitData,
      storage: {
        database: dbSaved,
        googleSheets: sheetsSynced,
        memory: true
      }
    })
  } catch (error) {
    console.error('Error creating site visit:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create site visit',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update site visit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const dbAvailable = await isDatabaseAvailable()
    
    if (dbAvailable) {
      const { db } = await import('@/lib/db')
      const visit = await db.siteVisit.update({
        where: { id: body.id },
        data: {
          customerName: body.customerName,
          phoneNumber: body.phoneNumber,
          phoneHasWhatsApp: Boolean(body.phoneHasWhatsApp),
          hasWhatsAppNumber: parseBoolean(body.hasWhatsAppNumber),
          whatsappNumber: body.whatsappNumber || null,
          district: body.district,
          city: body.city,
          address: body.address || null,
          googleMapsLink: body.googleMapsLink || null,
          latitude: parseNumber(body.latitude),
          longitude: parseNumber(body.longitude),
          drawings: body.drawings || null,
          images: body.images || null,
          videos: body.videos || null,
          hasRemovals: Boolean(body.hasRemovals),
          removalCharge: parseNumber(body.removalCharge),
          hasAdditionalLabour: Boolean(body.hasAdditionalLabour),
          additionalLabourCharge: parseNumber(body.additionalLabourCharge),
          serviceType: body.serviceType,
          ceilingDetails: body.ceilingDetails || null,
          guttersDetails: body.guttersDetails || null,
          roofDetails: body.roofDetails || null,
          quotationNumber: body.quotationNumber || null,
          quotationPdf: body.quotationPdf || null,
          totalAmount: parseNumber(body.totalAmount),
          status: body.status || 'pending',
          notes: body.notes || null
        }
      })

      return NextResponse.json({ 
        success: true, 
        data: visit 
      })
    } else {
      // Update in memory store
      const index = memoryStore.findIndex(v => v.id === body.id)
      if (index !== -1) {
        memoryStore[index] = { ...memoryStore[index], ...body, updatedAt: new Date().toISOString() }
        return NextResponse.json({ 
          success: true, 
          data: memoryStore[index] 
        })
      }
      return NextResponse.json({ 
        success: false, 
        error: 'Record not found' 
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating site visit:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update site visit' 
    }, { status: 500 })
  }
}

// DELETE - Delete site visit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID is required' 
      }, { status: 400 })
    }

    const dbAvailable = await isDatabaseAvailable()
    
    if (dbAvailable) {
      const { db } = await import('@/lib/db')
      await db.siteVisit.delete({
        where: { id }
      })
    } else {
      // Remove from memory store
      const index = memoryStore.findIndex(v => v.id === id)
      if (index !== -1) {
        memoryStore.splice(index, 1)
      }
    }

    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('Error deleting site visit:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete site visit' 
    }, { status: 500 })
  }
}
