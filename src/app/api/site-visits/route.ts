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
        phoneHasWhatsApp: body.phoneHasWhatsApp || false,
        hasWhatsAppNumber: body.hasWhatsAppNumber,
        whatsappNumber: body.whatsappNumber || null,
        district: body.district,
        city: body.city,
        address: body.address || null,
        googleMapsLink: body.googleMapsLink || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        drawings: body.drawings || null,
        images: body.images || null,
        videos: body.videos || null,
        hasRemovals: body.hasRemovals || false,
        removalCharge: body.removalCharge || null,
        hasAdditionalLabour: body.hasAdditionalLabour || false,
        additionalLabourCharge: body.additionalLabourCharge || null,
        serviceType: body.serviceType,
        ceilingDetails: body.ceilingDetails || null,
        guttersDetails: body.guttersDetails || null,
        roofDetails: body.roofDetails || null,
        quotationNumber: body.quotationNumber || null,
        quotationPdf: body.quotationPdf || null,
        totalAmount: body.totalAmount || null,
        status: body.status || 'pending',
        notes: body.notes || null
      }
    })

    // Send to Google Sheets (if configured)
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const ceilingData = body.ceilingDetails ? JSON.parse(body.ceilingDetails) : null
        const guttersData = body.guttersDetails ? JSON.parse(body.guttersDetails) : null
        const roofData = body.roofDetails ? JSON.parse(body.roofDetails) : null

        await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: visit.customerId,
            leadReceivedDate: visit.leadReceivedDate.toISOString().split('T')[0],
            customerName: visit.customerName,
            phoneNumber: visit.phoneNumber,
            phoneHasWhatsApp: visit.phoneHasWhatsApp ? 'Yes' : 'No',
            whatsappNumber: visit.whatsappNumber || '',
            district: visit.district,
            city: visit.city,
            address: visit.address || '',
            googleMapsLink: visit.googleMapsLink || '',
            serviceType: visit.serviceType,
            hasRemovals: visit.hasRemovals ? 'Yes' : 'No',
            removalCharge: visit.removalCharge || 0,
            hasAdditionalLabour: visit.hasAdditionalLabour ? 'Yes' : 'No',
            additionalLabourCharge: visit.additionalLabourCharge || 0,
            ceilingType: ceilingData?.type || '',
            ceilingTotal: ceilingData?.total?.totalPrice || 0,
            totalAmount: visit.totalAmount || 0,
            quotationNumber: visit.quotationNumber || '',
            status: visit.status,
            notes: visit.notes || '',
            createdAt: visit.createdAt.toISOString()
          })
        })
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
      error: 'Failed to create site visit' 
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
        phoneHasWhatsApp: body.phoneHasWhatsApp,
        hasWhatsAppNumber: body.hasWhatsAppNumber,
        whatsappNumber: body.whatsappNumber,
        district: body.district,
        city: body.city,
        address: body.address,
        googleMapsLink: body.googleMapsLink,
        latitude: body.latitude,
        longitude: body.longitude,
        drawings: body.drawings,
        images: body.images,
        videos: body.videos,
        hasRemovals: body.hasRemovals,
        removalCharge: body.removalCharge,
        hasAdditionalLabour: body.hasAdditionalLabour,
        additionalLabourCharge: body.additionalLabourCharge,
        serviceType: body.serviceType,
        ceilingDetails: body.ceilingDetails,
        guttersDetails: body.guttersDetails,
        roofDetails: body.roofDetails,
        quotationNumber: body.quotationNumber,
        quotationPdf: body.quotationPdf,
        totalAmount: body.totalAmount,
        status: body.status,
        notes: body.notes,
        updatedAt: new Date()
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
