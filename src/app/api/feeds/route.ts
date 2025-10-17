import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Product feed configuration
const FEED_CONFIGS = {
  'soeur': {
    name: 'Soeur Paris',
    url: 'https://feeds.affilae.com/api/feed/affilae/builder?url=https%3A%2F%2Ffeeds.datafeedwatch.com%2F66764%2F8e9cf0a4dca85b9b7e745af1ab4c6cd50c717124.xml&partnershipId=61a73bf6ae143319c822a8d4&encoding=UTF-8&separator=none&format=xml',
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
      
      // Fetch and parse the XML feed
      console.log('Fetching feed from:', feedConfig.url)
      const response = await fetch(feedConfig.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      console.log('Feed fetched, length:', xmlText.length)
      const products = parseXMLFeed(xmlText)
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

function parseXMLFeed(xmlText: string) {
  try {
    console.log('Parsing XML feed, length:', xmlText.length)
    
    // Parse XML by splitting into items
    const items = xmlText.split('<item>').slice(1) // Remove first empty split
    const products = []
    
    console.log('Found', items.length, 'product items')
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      try {
        // Extract data from XML tags
        const id = extractXMLValue(item, 'g:id') || `soeur_${Date.now()}_${i}`
        const title = extractXMLValue(item, 'g:title')
        const description = extractXMLValue(item, 'g:description')
        const link = extractXMLValue(item, 'g:link')
        const imageLink = extractXMLValue(item, 'g:image_link')
        const price = extractXMLValue(item, 'g:price')
        const brand = extractXMLValue(item, 'g:brand') || 'Soeur'
        
        if (title && price) {
          const product = {
            id: id,
            name: title,
            brand: brand,
            price: price,
            description: description || 'Beautiful product from Soeur',
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
