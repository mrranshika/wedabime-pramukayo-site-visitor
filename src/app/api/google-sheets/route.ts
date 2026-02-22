import { NextRequest, NextResponse } from 'next/server'

// Google Sheets API configuration
const SPREADSHEET_ID = '1fbacGzpr6v894f0bsT8CA7dJGjAHF3r-fB5I19kKpTA'

// Column mapping based on the Google Apps Script headers
const COLUMN_MAP: Record<string, number> = {
  customerId: 0,
  leadReceivedDate: 1,
  day: 2,
  customerName: 3,
  phoneNumber: 4,
  phoneHasWhatsApp: 5,
  hasWhatsAppNumber: 6,
  whatsappNumber: 7,
  district: 8,
  city: 9,
  address: 10,
  googleMapsLink: 11,
  latitude: 12,
  longitude: 13,
  drawings: 14,
  images: 15,
  videos: 16,
  hasRemovals: 17,
  removalCharge: 18,
  hasAdditionalLabour: 19,
  additionalLabourCharge: 20,
  serviceType: 21,
  ceilingType: 22,
  ceilingArea1: 23,
  ceilingArea2: 24,
  ceilingArea3: 25,
  ceilingArea4: 26,
  ceilingTotalArea: 27,
  ceilingPerSqftPrice: 28,
  ceilingTotalPrice: 29,
  guttersMeasurements: 30,
  guttersTotalFeet: 31,
  guttersPerFeetPrice: 32,
  guttersTotalPrice: 33,
  roofType: 34,
  roofWorkType: 35,
  roofMaterialType: 36,
  roofSheetType: 37,
  roofArea: 38,
  roofTotalPrice: 39,
  quotationNumber: 40,
  quotationPdf: 41,
  totalAmount: 42,
  status: 43,
  notes: 44,
  createdAt: 45,
  updatedAt: 46
}

function getCellValue(row: string[], key: string): string {
  const index = COLUMN_MAP[key]
  return row[index] || ''
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const district = searchParams.get('district')
    const search = searchParams.get('search')

    // Fetch data from Google Sheets (public read - no API key needed for published sheets)
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=Site%20Visits`
    
    const response = await fetch(sheetUrl)
    const text = await response.text()
    
    // Parse the JSONP response
    // Format: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/)
    if (!jsonMatch) {
      throw new Error('Could not parse Google Sheets response')
    }
    const data = JSON.parse(jsonMatch[1])
    
    // Extract rows (skip header row)
    const rows = data.table?.rows || []
    
    // Convert to site visits format
    let visits = rows.map((row: { c: Array<{ v: string | null }> }, index: number) => {
      const cells = row.c.map((cell: { v: string | null }) => cell?.v || '')
      
      return {
        id: `sheet-${index + 2}`,
        customerId: getCellValue(cells, 'customerId'),
        leadReceivedDate: getCellValue(cells, 'leadReceivedDate'),
        day: getCellValue(cells, 'day'),
        customerName: getCellValue(cells, 'customerName'),
        phoneNumber: getCellValue(cells, 'phoneNumber'),
        phoneHasWhatsApp: getCellValue(cells, 'phoneHasWhatsApp'),
        hasWhatsAppNumber: getCellValue(cells, 'hasWhatsAppNumber'),
        whatsappNumber: getCellValue(cells, 'whatsappNumber'),
        district: getCellValue(cells, 'district'),
        city: getCellValue(cells, 'city'),
        address: getCellValue(cells, 'address'),
        googleMapsLink: getCellValue(cells, 'googleMapsLink'),
        latitude: getCellValue(cells, 'latitude'),
        longitude: getCellValue(cells, 'longitude'),
        drawings: getCellValue(cells, 'drawings'),
        images: getCellValue(cells, 'images'),
        videos: getCellValue(cells, 'videos'),
        hasRemovals: getCellValue(cells, 'hasRemovals'),
        removalCharge: getCellValue(cells, 'removalCharge'),
        hasAdditionalLabour: getCellValue(cells, 'hasAdditionalLabour'),
        additionalLabourCharge: getCellValue(cells, 'additionalLabourCharge'),
        serviceType: getCellValue(cells, 'serviceType'),
        ceilingType: getCellValue(cells, 'ceilingType'),
        ceilingTotalArea: getCellValue(cells, 'ceilingTotalArea'),
        ceilingPerSqftPrice: getCellValue(cells, 'ceilingPerSqftPrice'),
        ceilingTotalPrice: getCellValue(cells, 'ceilingTotalPrice'),
        guttersTotalFeet: getCellValue(cells, 'guttersTotalFeet'),
        guttersPerFeetPrice: getCellValue(cells, 'guttersPerFeetPrice'),
        guttersTotalPrice: getCellValue(cells, 'guttersTotalPrice'),
        roofType: getCellValue(cells, 'roofType'),
        roofWorkType: getCellValue(cells, 'roofWorkType'),
        roofTotalPrice: getCellValue(cells, 'roofTotalPrice'),
        quotationNumber: getCellValue(cells, 'quotationNumber'),
        totalAmount: getCellValue(cells, 'totalAmount'),
        status: getCellValue(cells, 'status') || 'pending',
        notes: getCellValue(cells, 'notes'),
        createdAt: getCellValue(cells, 'createdAt'),
        updatedAt: getCellValue(cells, 'updatedAt')
      }
    })

    // Apply filters
    if (status && status !== 'all') {
      visits = visits.filter((v: { status: string }) => v.status.toLowerCase() === status.toLowerCase())
    }
    if (district && district !== 'all') {
      visits = visits.filter((v: { district: string }) => v.district === district)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      visits = visits.filter((v: { 
        customerName: string; 
        phoneNumber: string; 
        customerId: string; 
        address: string 
      }) => 
        v.customerName?.toLowerCase().includes(searchLower) ||
        v.phoneNumber?.includes(search) ||
        v.customerId?.toLowerCase().includes(searchLower) ||
        v.address?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: visits,
      source: 'google-sheets',
      total: visits.length
    })
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch from Google Sheets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
