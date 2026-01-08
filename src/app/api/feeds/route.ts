import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Product feed configuration
const FEED_CONFIGS = {
  'soeur': {
    name: 'Soeur Paris',
    url: 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffeeds.datafeedwatch.com%2F66764%2F8e9cf0a4dca85b9b7e745af1ab4c6cd50c717124.xml&partnershipId=61a73bf6ae143319c822a8d4&encoding=UTF-8&separator=none&format=xml',
    format: 'xml',
    enabled: true
  },
  'simone-perele': {
    name: 'Simone Pérèle',
    url: 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Fstorage.googleapis.com%2Fsmart-feeds-data-export-http%2F5130660558143488.csv&partnershipId=6939731e0ebc3c1b9b82f4bb&encoding=UTF-8&separator=,&format=csv',
    format: 'csv',
    enabled: true
  },
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
  },
  'bonsoirs': {
    name: 'Bonsoirs',
    url: 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffiles.channable.com%2FtfxMW9w9v_3sP6PNPSPybA%3D%3D.xml&partnershipId=6939750415a92c7b66d74a26&encoding=UTF-8&separator=none&format=xml',
    format: 'xml',
    enabled: true
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')

    if (brand && FEED_CONFIGS[brand]) {
      const feedConfig = FEED_CONFIGS[brand]
      
      // Fetch and parse the feed (XML or CSV)
      console.log('Fetching feed from:', feedConfig.url)
      const response = await fetch(feedConfig.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`)
      }
      
      const feedText = await response.text()
      console.log('Feed fetched, length:', feedText.length)
      
      // Detect format and parse accordingly
      const feedFormat = feedConfig.format || (feedText.trim().startsWith('<?xml') || feedText.trim().startsWith('<rss') ? 'xml' : 'csv')
      const products = feedFormat === 'xml' 
        ? parseXMLFeed(feedText, feedConfig.name)
        : parseCSVFeed(feedText, feedConfig.name)
      console.log('Products parsed:', products.length)
      
      // Filter and sort products if search term provided
      let filteredProducts = products
      if (search) {
        const searchLower = search.toLowerCase()
        const searchWords = searchLower.split(' ').filter(word => word.length > 0)
        
        filteredProducts = products
          .filter(product => {
            const productName = product.name.toLowerCase()
            const productDescription = product.description.toLowerCase()
            const productBrand = product.brand.toLowerCase()
            
            // Check if any search word matches any field
            return searchWords.some(word => 
              productName.includes(word) ||
              productDescription.includes(word) ||
              productBrand.includes(word)
            )
          })
          .sort((a, b) => {
            // Calculate relevance score for sorting
            const scoreA = calculateRelevanceScore(a, searchWords)
            const scoreB = calculateRelevanceScore(b, searchWords)
            return scoreB - scoreA // Higher score first
          })
      }
      
      return NextResponse.json({ 
        products: filteredProducts.slice(0, 50), // Limit to 50 results
        total: filteredProducts.length,
        brand: feedConfig.name
      })
    }

    // Return available feed configurations
    return NextResponse.json({ 
      feeds: Object.keys(FEED_CONFIGS).map(key => ({
        id: key,
        name: FEED_CONFIGS[key].name,
        enabled: FEED_CONFIGS[key].enabled
      }))
    })
  } catch (error) {
    console.error('Error fetching product feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product feed' },
      { status: 500 }
    )
  }
}

function parseXMLFeed(xmlText: string, brandName: string = 'Unknown') {
  try {
    console.log('Parsing XML feed, length:', xmlText.length)
    
    // Parse XML by splitting into items
    const items = xmlText.split('<item>').slice(1) // Remove first empty split
    const products = []
    
    console.log('Found', items.length, 'product items')
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        // Extract data from XML tags (support both g: and standard tags)
        const id = extractXMLValue(item, 'g:id') || extractXMLValue(item, 'id') || `${brandName.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}_${i}`
        const title = extractXMLValue(item, 'g:title') || extractXMLValue(item, 'title')
        const description = extractXMLValue(item, 'g:description') || extractXMLValue(item, 'description')
        const link = extractXMLValue(item, 'g:link') || extractXMLValue(item, 'link')
        const imageLink = extractXMLValue(item, 'g:image_link') || extractXMLValue(item, 'image_link') || extractXMLValue(item, 'image')
        const price = extractXMLValue(item, 'g:price') || extractXMLValue(item, 'price')
        const brand = extractXMLValue(item, 'g:brand') || extractXMLValue(item, 'brand') || brandName
        
        if (title && price) {
          const product = {
            id: id,
            name: title,
            brand: brand,
            price: price,
            description: description || `Beautiful product from ${brandName}`,
            imageUrl: isValidImageUrl(imageLink) ? imageLink : '',
            affiliateLink: link || '',
            category: extractCategoryFromTitle(title),
            availability: 'in stock'
          }
          
          products.push(product)
          console.log('✅ Added product:', product.name, product.price, 'Image URL:', product.imageUrl)
        } else {
          console.log('❌ Skipped item - missing title or price:', { title, price })
        }
      } catch (parseError) {
        console.warn('Error parsing item:', parseError)
      }
    }
    
    console.log('Total products parsed:', products.length)
    return products
  } catch (error) {
    console.error('Error parsing XML feed:', error)
    return []
  }
}

function parseCSVFeed(csvText: string, brandName: string = 'Unknown') {
  try {
    console.log('Parsing CSV feed, length:', csvText.length)
    
    // Handle different line endings (Windows \r\n, Unix \n, Mac \r)
    let normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    
    // Parse CSV properly handling quoted fields with newlines
    const rows = parseCSVRows(normalizedText)
    
    if (rows.length < 2) {
      console.warn('CSV feed has less than 2 rows (header + data)')
      console.warn('First 200 chars:', csvText.substring(0, 200))
      return []
    }
    
    // Parse header row
    const headers = rows[0]
    console.log('CSV headers:', headers)
    console.log('Header count:', headers.length)
    
    // Find column indices (case-insensitive)
    const getColumnIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => h.toLowerCase() === name.toLowerCase())
        if (index !== -1) return index
      }
      return -1
    }
    
    // Support both English and French column names
    const titleIndex = getColumnIndex([
      'title', 'name', 'product_name', 'product_title', 'item_name',
      'nom du produit', 'nom produit', 'titre', 'titre produit', 'nom'
    ])
    const descriptionIndex = getColumnIndex([
      'description', 'desc', 'product_description', 'item_description',
      'description du produit', 'description produit', 'desc produit'
    ])
    const imageIndex = getColumnIndex([
      'image_link', 'image', 'image_url', 'imageUrl', 'product_image', 'item_image', 'picture_url',
      'lien image', 'image lien', 'url image', 'photo', 'photo produit'
    ])
    const linkIndex = getColumnIndex([
      'link', 'url', 'affiliate_link', 'product_url', 'item_url', 'product_link',
      'url du produit', 'url produit', 'lien', 'lien produit', 'lien affilie'
    ])
    // Try to find sale price first, then regular price
    const salePriceIndex = getColumnIndex([
      'sale_price', 'final_price', 'current_price', 'discounted_price',
      'prix soldes', 'prix final', 'prix reduit', 'prix actuel', 'prix promo'
    ])
    const regularPriceIndex = getColumnIndex([
      'price', 'cost', 'item_price', 'product_price',
      'prix', 'prix produit', 'prix normal'
    ])
    // Use sale price if available, otherwise use regular price
    const priceIndex = salePriceIndex !== -1 ? salePriceIndex : regularPriceIndex
    const brandIndex = getColumnIndex([
      'brand', 'manufacturer', 'vendor', 'brand_name',
      'marque', 'fabricant', 'marque produit'
    ])
    const idIndex = getColumnIndex([
      'id', 'product_id', 'sku', 'gtin', 'item_id', 'product_sku', 'variant_id',
      'id unique', 'id produit', 'reference', 'ref', 'code produit'
    ])
    const availabilityIndex = getColumnIndex([
      'availability', 'stock_status', 'in_stock', 'inventory_status', 'stock', 'available',
      'stock', 'disponibilite', 'en stock', 'disponible', 'statut stock'
    ])
    
    console.log('Column mapping:', {
      title: titleIndex,
      price: priceIndex,
      salePrice: salePriceIndex !== -1 ? salePriceIndex : 'not found, using regular price',
      description: descriptionIndex,
      image: imageIndex,
      link: linkIndex,
      brand: brandIndex,
      id: idIndex,
      availability: availabilityIndex
    })
    
    if (titleIndex === -1 || priceIndex === -1) {
      console.error('CSV feed missing required columns (title or price)')
      console.error('Available headers:', headers)
      console.error('First data row sample:', rows.length > 1 ? rows[1] : 'No data rows')
      return []
    }
    
    const products = []
    
    // Parse data rows
    let skippedCount = 0
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i]
      
      // Skip empty rows
      if (!values || values.length === 0 || values.every(v => !v || !v.trim())) {
        continue
      }
      
      try {
        // Ensure we have enough values (but be flexible - some columns might be empty at the end)
        const minRequiredColumns = Math.max(titleIndex, priceIndex) + 1
        if (values.length < minRequiredColumns) {
          // Try to pad with empty strings if we're close
          if (values.length >= minRequiredColumns - 5) {
            while (values.length < minRequiredColumns) {
              values.push('')
            }
          } else {
            if (i <= 3) {
              console.warn(`Row ${i} has insufficient columns: expected at least ${minRequiredColumns}, got ${values.length}`)
            }
            skippedCount++
            continue
          }
        }
        
        const title = values[titleIndex]?.trim()
        const price = values[priceIndex]?.trim()
        const description = descriptionIndex !== -1 ? values[descriptionIndex]?.trim() : ''
        const imageLink = imageIndex !== -1 ? values[imageIndex]?.trim() : ''
        const link = linkIndex !== -1 ? values[linkIndex]?.trim() : ''
        const brand = brandIndex !== -1 ? values[brandIndex]?.trim() : brandName
        const id = idIndex !== -1 ? values[idIndex]?.trim() : `${brandName.toLowerCase().replace(/\s+/g, '-')}_${i}`
        const availability = availabilityIndex !== -1 ? values[availabilityIndex]?.trim().toLowerCase() : 'in stock'
        
        if (title && price) {
          // Clean price (remove currency symbols, spaces, etc.)
          // Handle formats like "45.00 EUR", "22,50 EUR", "45 EUR", etc.
          let cleanPrice = price.trim()
          // Remove currency text (EUR, €, etc.)
          cleanPrice = cleanPrice.replace(/\s*(EUR|€|USD|\$|GBP|£)\s*/gi, '')
          // Replace comma with dot for decimal
          cleanPrice = cleanPrice.replace(',', '.')
          // Remove any remaining non-numeric characters except dot
          cleanPrice = cleanPrice.replace(/[^\d.]/g, '')
          // Ensure we have a valid number
          if (!cleanPrice || isNaN(parseFloat(cleanPrice))) {
            console.warn(`Invalid price format: ${price}, skipping product`)
            continue
          }
          
          const product = {
            id: id,
            name: title,
            brand: brand || brandName,
            price: cleanPrice,
            description: description || `Beautiful product from ${brandName}`,
            imageUrl: isValidImageUrl(imageLink) ? imageLink : '',
            affiliateLink: link || '',
            category: extractCategoryFromTitle(title),
            availability: availability === 'in stock' || availability === 'available' ? 'in stock' : 'out of stock'
          }
          
          products.push(product)
          if (products.length <= 5) {
            console.log('✅ Added product:', product.name, product.price, 'Image URL:', product.imageUrl)
          }
        } else {
          if (i <= 5) {
            console.log('❌ Skipped row - missing title or price:', { title, price, row: i })
          }
        }
      } catch (parseError) {
        console.warn(`Error parsing CSV row ${i}:`, parseError)
      }
    }
    
    console.log('Total products parsed:', products.length)
    if (skippedCount > 0) {
      console.log(`Skipped ${skippedCount} rows due to insufficient columns or missing data`)
    }
    return products
  } catch (error) {
    console.error('Error parsing CSV feed:', error)
    return []
  }
}

// Helper function to parse entire CSV text into rows (handles newlines inside quoted fields)
function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i]
    const nextChar = csvText[i + 1]
    const prevChar = csvText[i - 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote (double quote)
        currentField += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRow.push(currentField)
      currentField = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Row separator (only if not inside quotes)
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField)
        if (currentRow.some(field => field.trim())) {
          // Only add non-empty rows
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
      }
      // Skip \r if followed by \n
      if (char === '\r' && nextChar === '\n') {
        i++
      }
    } else {
      currentField += char
    }
  }
  
  // Add last field and row if any
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    if (currentRow.some(field => field.trim())) {
      rows.push(currentRow)
    }
  }
  
  return rows
}

// Helper function to parse CSV line (handles quoted fields with commas) - kept for backward compatibility
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

function extractXMLValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractCategoryFromTitle(title: string): string {
  const titleUpper = title.toUpperCase()
  if (titleUpper.includes('BAGUE') || titleUpper.includes('BAGUES')) return 'Jewelry'
  if (titleUpper.includes('BOTTINES') || titleUpper.includes('CHAUSSURES') || titleUpper.includes('BALLERINES')) return 'Shoes'
  if (titleUpper.includes('CARDIGAN') || titleUpper.includes('PULL') || titleUpper.includes('SWEATER')) return 'Clothing'
  if (titleUpper.includes('ROBE') || titleUpper.includes('DRESS')) return 'Clothing'
  if (titleUpper.includes('T-SHIRT') || titleUpper.includes('TEE')) return 'Clothing'
  if (titleUpper.includes('PANTALON') || titleUpper.includes('PANTS')) return 'Clothing'
  if (titleUpper.includes('VESTE') || titleUpper.includes('JACKET')) return 'Clothing'
  if (titleUpper.includes('MANTEAU') || titleUpper.includes('COAT')) return 'Clothing'
  if (titleUpper.includes('ACCESSOIRES') || titleUpper.includes('ACCESSORIES')) return 'Accessories'
  return 'Clothing'
}

function calculateRelevanceScore(product: any, searchWords: string[]): number {
  let score = 0
  const productName = product.name.toLowerCase()
  const productDescription = product.description.toLowerCase()
  const productBrand = product.brand.toLowerCase()
  
  searchWords.forEach(word => {
    // Exact match in name gets highest score
    if (productName === word) score += 100
    else if (productName.startsWith(word)) score += 80
    else if (productName.includes(word)) score += 60
    
    // Brand match gets medium score
    if (productBrand.includes(word)) score += 40
    
    // Description match gets lower score
    if (productDescription.includes(word)) score += 20
    
    // Partial word matches get lower scores
    const nameWords = productName.split(' ')
    nameWords.forEach(nameWord => {
      if (nameWord.startsWith(word)) score += 30
      else if (nameWord.includes(word)) score += 10
    })
  })
  
  return score
}

function isValidImageUrl(url: string): boolean {
  if (!url || !url.startsWith('https://')) return false
  
  // Check for specific known broken image patterns
  const brokenPatterns = [
    'AUT1346TUESDAY25WMAR06_carre.jpg',
    'ZAE-marron-carre.jpg',
    'placeholder.jpg',
    'no-image',
    'missing'
  ]
  
  // Allow most URLs, only filter out specific broken ones
  return !brokenPatterns.some(pattern => url.includes(pattern))
}
