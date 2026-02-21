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
        { phone: { contains: search } },
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
        customerName: body.customerName,
        phone: body.phone,
        address: body.address,
        district: body.district,
        serviceType: body.serviceType,
        notes: body.notes || null,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        status: 'pending'
      }
    })

    // Send to Google Sheets (if configured)
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: visit.customerId,
            customerName: visit.customerName,
            phone: visit.phone,
            address: visit.address,
            district: visit.district,
            serviceType: visit.serviceType,
            notes: visit.notes || '',
            status: visit.status,
            visitDate: visit.visitDate.toISOString(),
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
        phone: body.phone,
        address: body.address,
        district: body.district,
        serviceType: body.serviceType,
        notes: body.notes,
        status: body.status,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        quotation: body.quotation,
        quotationDate: body.quotationDate ? new Date(body.quotationDate) : null,
        quotationNote: body.quotationNote,
        photos: body.photos,
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
