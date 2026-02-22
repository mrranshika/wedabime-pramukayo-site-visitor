import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This endpoint initializes the database schema
// Call it once: GET /api/init-db
export async function GET() {
  try {
    // Create the SiteVisit table if it doesn't exist
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SiteVisit" (
        "id" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "leadReceivedDate" TIMESTAMP(3) NOT NULL,
        "customerName" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "phoneHasWhatsApp" BOOLEAN NOT NULL DEFAULT false,
        "hasWhatsAppNumber" BOOLEAN,
        "whatsappNumber" TEXT,
        "district" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "address" TEXT,
        "googleMapsLink" TEXT,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "drawings" TEXT,
        "images" TEXT,
        "videos" TEXT,
        "hasRemovals" BOOLEAN NOT NULL DEFAULT false,
        "removalCharge" DOUBLE PRECISION,
        "hasAdditionalLabour" BOOLEAN NOT NULL DEFAULT false,
        "additionalLabourCharge" DOUBLE PRECISION,
        "serviceType" TEXT NOT NULL,
        "ceilingDetails" TEXT,
        "guttersDetails" TEXT,
        "roofDetails" TEXT,
        "quotationNumber" TEXT,
        "quotationPdf" TEXT,
        "totalAmount" DOUBLE PRECISION,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "SiteVisit_customerId_key" UNIQUE ("customerId")
      );
    `)
    
    // Create indexes
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "SiteVisit_customerId_idx" ON "SiteVisit"("customerId");
      CREATE INDEX IF NOT EXISTS "SiteVisit_phoneNumber_idx" ON "SiteVisit"("phoneNumber");
      CREATE INDEX IF NOT EXISTS "SiteVisit_district_idx" ON "SiteVisit"("district");
      CREATE INDEX IF NOT EXISTS "SiteVisit_status_idx" ON "SiteVisit"("status");
      CREATE INDEX IF NOT EXISTS "SiteVisit_leadReceivedDate_idx" ON "SiteVisit"("leadReceivedDate");
    `)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema created successfully!'
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
