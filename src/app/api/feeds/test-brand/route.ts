import { NextRequest, NextResponse } from 'next/server'

// Product feed configuration (same as main route)
const FEED_CONFIGS = {
  'princesse-tam-tam': {
    name: 'Princesse tam tam',
    url: 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffiles.channable.com%2FN6XT41EeNhRJ0qXB_1Zvpw%3D%3D.csv&partnershipId=6939738915a92c7b66d74a1f&encoding=UTF-8&separator=,&format=csv',
    format: 'csv',
    enabled: true
  },
  'noo-influence': {
    name: 'NOO INFLUENCE',
    url: 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffiles.channable.com%2FlJvv2yV202kjgl5cX6_3JQ%3D%3D.csv&partnershipId=6939748415a92c7b66d74a24&encoding=UTF-8&separator=,&format=csv',
    format: 'csv',
    enabled: true
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand') || 'princesse-tam-tam'
    
    if (!FEED_CONFIGS[brand as keyof typeof FEED_CONFIGS]) {
      return NextResponse.json({ error: 'Invalid brand' }, { status: 400 })
    }
    
    const feedConfig = FEED_CONFIGS[brand as keyof typeof FEED_CONFIGS]
    
    console.log('Testing feed from:', feedConfig.url)
    const response = await fetch(feedConfig.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`)
    }
    
    const feedText = await response.text()
    console.log('Feed fetched, length:', feedText.length)
    
    // Parse CSV
    const lines = feedText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({
        error: 'CSV feed has less than 2 lines',
        feedLength: feedText.length,
        totalLines: lines.length
      })
    }
    
    // Parse header
    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine)
    
    // Parse first few data rows
    const sampleRows = []
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      try {
        const values = parseCSVLine(lines[i])
        sampleRows.push({
          rowIndex: i,
          values: values,
          valueCount: values.length
        })
      } catch (e) {
        sampleRows.push({
          rowIndex: i,
          error: String(e)
        })
      }
    }
    
    // Find column indices
    const getColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => h.toLowerCase() === name.toLowerCase())
        if (index !== -1) return index
      }
      return -1
    }
    
    const columnMapping = {
      title: getColumnIndex(['title', 'name', 'product_name']),
      description: getColumnIndex(['description', 'desc']),
      image: getColumnIndex(['image_link', 'image', 'image_url', 'imageUrl']),
      link: getColumnIndex(['link', 'url', 'affiliate_link', 'product_url']),
      price: getColumnIndex(['price', 'sale_price', 'cost']),
      brand: getColumnIndex(['brand', 'manufacturer']),
      id: getColumnIndex(['id', 'product_id', 'sku', 'gtin']),
      availability: getColumnIndex(['availability', 'stock_status', 'in_stock'])
    }
    
    return NextResponse.json({
      success: true,
      brand: feedConfig.name,
      feedLength: feedText.length,
      totalLines: lines.length,
      headers: headers,
      headerCount: headers.length,
      columnMapping: columnMapping,
      sampleRows: sampleRows,
      firstLinePreview: feedText.substring(0, 500),
      hasTitle: columnMapping.title !== -1,
      hasPrice: columnMapping.price !== -1
    })
  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

// Helper function to parse CSV line (handles quoted fields with commas)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current)
  
  return result
}
