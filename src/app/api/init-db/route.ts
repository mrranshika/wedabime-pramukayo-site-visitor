import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        success: false, 
        message: 'DATABASE_URL not configured. Using memory/Google Sheets mode.',
        mode: 'memory'
      })
    }

    // Try to initialize database
    try {
      const { db } = await import('@/lib/db')
      
      // Test connection
      await db.$queryRaw`SELECT 1 as test`
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database connection successful!',
        mode: 'database'
      })
    } catch (dbError) {
      console.error('Database initialization failed:', dbError)
      
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection failed. App will use memory/Google Sheets mode.',
        mode: 'memory',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      })
    }
  } catch (error) {
    console.error('Init DB error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
