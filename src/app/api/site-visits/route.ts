import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all site visits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const district = searchParams.get('district')
    const search = searchParams.get('search')

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
      data: visits 
    })
  } catch (error) {
    console.error('Error fetching site visits:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch site visits' 
    }, { status: 500 })
  }
}

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

// POST - Create new site visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const visit = await db.siteVisit.create({
      data: {
        customerId: body.customerId,
        leadReceivedDate: new Date(body.leadReceivedDate),
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

    // Send to Google Sheets (if configured)
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const sheetsData = {
          customerId: visit.customerId,
          leadReceivedDate: visit.leadReceivedDate.toISOString().split('T')[0],
          customerName: visit.customerName,
          phoneNumber: visit.phoneNumber,
          phoneHasWhatsApp: visit.phoneHasWhatsApp ? 'Yes' : 'No',
          hasWhatsAppNumber: visit.hasWhatsAppNumber !== null ? (visit.hasWhatsAppNumber ? 'Yes' : 'No') : '',
          whatsappNumber: visit.whatsappNumber || '',
          district: visit.district,
          city: visit.city,
          address: visit.address || '',
          googleMapsLink: visit.googleMapsLink || '',
          latitude: visit.latitude || '',
          longitude: visit.longitude || '',
          drawings: visit.drawings || '',
          images: visit.images || '',
          videos: visit.videos || '',
          hasRemovals: visit.hasRemovals ? 'Yes' : 'No',
          removalCharge: visit.removalCharge || 0,
          hasAdditionalLabour: visit.hasAdditionalLabour ? 'Yes' : 'No',
          additionalLabourCharge: visit.additionalLabourCharge || 0,
          serviceType: visit.serviceType,
          ceilingDetails: visit.ceilingDetails || '',
          guttersDetails: visit.guttersDetails || '',
          roofDetails: visit.roofDetails || '',
          quotationNumber: visit.quotationNumber || '',
          quotationPdf: visit.quotationPdf || '',
          totalAmount: visit.totalAmount || 0,
          status: visit.status,
          notes: visit.notes || '',
          createdAt: visit.createdAt.toISOString(),
          updatedAt: new Date().toISOString()
        }

        console.log('Sending to Google Sheets:', process.env.GOOGLE_SHEETS_WEBHOOK_URL)
        
        const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetsData)
        })
        
        const result = await response.text()
        console.log('Google Sheets response:', response.status, result)
        
        if (!response.ok) {
          console.error('Google Sheets sync failed: HTTP', response.status)
        }
      } catch (e) {
        console.error('Google Sheets sync failed:', e)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: visit 
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

    await db.siteVisit.delete({
      where: { id }
    })

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
