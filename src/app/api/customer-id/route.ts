import { NextResponse } from 'next/server'

// Generate next customer ID in pattern: A-000a01, A-000a02, ..., Z-999z99, AA-000a01, ...
function generateNextCustomerId(currentId: string | null): string {
  if (!currentId) return 'A-000a01'

  // Parse the current ID
  // Format: PREFIX-NUMBERSletters (e.g., A-000a01, AA-001b23, ZZ-999z99)
  const match = currentId.match(/^([A-Z]+)-(\d{3})([a-z])(\d{2})$/)
  
  if (!match) return 'A-000a01'

  let prefix = match[1]
  let num = parseInt(match[2], 10)
  let letter = match[3]
  let suffix = parseInt(match[4], 10)

  // Increment suffix (01-99)
  suffix++
  if (suffix > 99) {
    suffix = 1
    // Increment letter (a-z)
    const letterCode = letter.charCodeAt(0)
    if (letterCode < 122) { // 'z'
      letter = String.fromCharCode(letterCode + 1)
    } else {
      letter = 'a'
      // Increment number (000-999)
      num++
      if (num > 999) {
        num = 0
        // Increment prefix (A-Z, AA-ZZ, AAA-ZZZ, etc.)
        prefix = incrementPrefix(prefix)
      }
    }
  }

  return `${prefix}-${String(num).padStart(3, '0')}${letter}${String(suffix).padStart(2, '0')}`
}

function incrementPrefix(prefix: string): string {
  const chars = prefix.split('')
  
  for (let i = chars.length - 1; i >= 0; i--) {
    if (chars[i] < 'Z') {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1)
      return chars.join('')
    }
    chars[i] = 'A'
  }
  
  // If all chars are 'Z', add another 'A'
  return 'A' + chars.join('')
}

// In-memory counter for when database is not available
let memoryCounter = 0

export async function GET() {
  try {
    // Try to use database first
    try {
      const { db } = await import('@/lib/db')
      
      // Check if database and table are available
      const latestVisit = await db.siteVisit.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { customerId: true }
      })

      const newId = generateNextCustomerId(latestVisit?.customerId || null)

      return NextResponse.json({ 
        success: true, 
        customerId: newId,
        source: 'database'
      })
    } catch (dbError) {
      // Database not available, use memory counter
      console.log('Database not available, using memory counter')
      memoryCounter++
      
      // Generate ID based on memory counter
      const prefix = 'A'
      const num = Math.floor(memoryCounter / 2599) // 26 * 99 + 1
      const letterCode = Math.floor((memoryCounter % 2599) / 99)
      const suffix = (memoryCounter % 99) + 1
      
      const letter = String.fromCharCode(97 + (letterCode % 26)) // a-z
      const newId = `${prefix}-${String(num).padStart(3, '0')}${letter}${String(suffix).padStart(2, '0')}`

      return NextResponse.json({ 
        success: true, 
        customerId: newId,
        source: 'memory'
      })
    }
  } catch (error) {
    console.error('Error generating customer ID:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate customer ID',
      customerId: 'A-000a01'
    }, { status: 500 })
  }
}
