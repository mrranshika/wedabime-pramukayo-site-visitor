import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get the latest customer ID
    const latestVisit = await db.siteVisit.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { customerId: true }
    })

    let newId = 'WP-0001'
    
    if (latestVisit?.customerId) {
      const currentNum = parseInt(latestVisit.customerId.replace('WP-', ''), 10)
      newId = `WP-${String(currentNum + 1).padStart(4, '0')}`
    }

    return NextResponse.json({ 
      success: true, 
      customerId: newId 
    })
  } catch (error) {
    console.error('Error generating customer ID:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate customer ID',
      customerId: 'WP-0001'
    }, { status: 500 })
  }
}
