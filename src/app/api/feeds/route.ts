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
      
      // Filter products if search term provided
      let filteredProducts = products
      if (search) {
        const searchLower = search.toLowerCase()
        filteredProducts = products.filter(product => 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.brand.toLowerCase().includes(searchLower)
        )
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
    // The feed appears to be space-separated values with product data
    const lines = xmlText.split('\n').filter(line => line.trim())
    const products = []
    
    console.log('Parsing feed with', lines.length, 'lines')
    
    for (const line of lines) {
      // Look for lines that contain product data (brand name, product names, etc.)
      if (line.includes('Soeur') || line.includes('BAGUE') || line.includes('BOTTINES') || 
          line.includes('CARDIGAN') || line.includes('PULL') || line.includes('ROBE')) {
        
        try {
          const product = {
            id: extractProductId(line),
            name: extractProductName(line),
            brand: 'Soeur',
            price: extractPrice(line),
            description: extractDescription(line),
            imageUrl: extractImageUrl(line),
            affiliateLink: extractAffiliateLink(line),
            category: extractCategory(line),
            availability: 'in stock'
          }
          
          if (product.name && product.price && product.name !== 'Product') {
            products.push(product)
            console.log('Added product:', product.name, product.price)
          }
        } catch (parseError) {
          console.warn('Error parsing product line:', parseError, line.substring(0, 100))
        }
      }
    }
    
    console.log('Total products parsed:', products.length)
    return products
  } catch (error) {
    console.error('Error parsing XML feed:', error)
    return []
  }
}

function extractProductId(line: string): string {
  // Extract product ID from the line (look for long numeric ID)
  const match = line.match(/(\d{14,})/)
  return match ? match[1] : `soeur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function extractProductName(line: string): string {
  // Extract product name from the line - look for patterns like "BAGUE ARGENT", "BOTTINES TEXAS MARRON", etc.
  const patterns = [
    /(BAGUE\s+[A-Z\s]+)/,
    /(BOTTINES\s+[A-Z\s]+)/,
    /(CARDIGAN\s+[A-Z\s]+)/,
    /(PULL\s+[A-Z\s]+)/,
    /(ROBE\s+[A-Z\s]+)/,
    /(CHAUSSURES\s+[A-Z\s]+)/,
    /(ACCESSOIRES\s+[A-Z\s]+)/
  ]
  
  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  // Fallback: look for any all-caps words that might be product names
  const words = line.split(' ').filter(word => 
    word.length > 3 && 
    word === word.toUpperCase() && 
    !word.includes('HTTP') && 
    !word.includes('HTTPS') &&
    !word.match(/^\d+$/)
  )
  
  return words.length > 0 ? words.slice(0, 3).join(' ') : 'Product'
}

function extractPrice(line: string): string {
  // Extract price (look for pattern like "145.00" or "365.00")
  const priceMatch = line.match(/(\d+\.\d{2})\s+new/)
  return priceMatch ? priceMatch[1] : '0.00'
}

function extractDescription(line: string): string {
  // Extract description from the line - look for French descriptions
  const parts = line.split(' ')
  
  // Look for description patterns (French text)
  const descriptionStart = parts.findIndex(part => 
    part.includes('explore') || 
    part.includes('design') || 
    part.includes('ligne') ||
    part.includes('coupe') ||
    part.includes('tricoté')
  )
  
  if (descriptionStart > -1) {
    // Find the end of description (before affiliate link)
    const descriptionEnd = parts.findIndex(part => part.includes('https://lb.affilae.com'))
    if (descriptionEnd > descriptionStart) {
      return parts.slice(descriptionStart, descriptionEnd).join(' ').trim()
    }
  }
  
  return 'Beautiful product from Soeur'
}

function extractImageUrl(line: string): string {
  // Extract image URL - look for various image formats
  const imagePatterns = [
    /https:\/\/cdn\.shopify\.com[^\s]+\.jpg/,
    /https:\/\/cdn\.shopify\.com[^\s]+\.jpeg/,
    /https:\/\/cdn\.shopify\.com[^\s]+\.png/,
    /https:\/\/cdn\.shopify\.com[^\s]+\.webp/
  ]
  
  for (const pattern of imagePatterns) {
    const match = line.match(pattern)
    if (match) {
      return match[0]
    }
  }
  
  // Return a proper placeholder image URL
  return 'https://via.placeholder.com/200x200/f0f0f0/999999?text=No+Image'
}

function extractAffiliateLink(line: string): string {
  // Extract affiliate tracking link
  const affiliateMatch = line.match(/https:\/\/lb\.affilae\.com[^\s]+/)
  return affiliateMatch ? affiliateMatch[0] : ''
}

function extractCategory(line: string): string {
  // Extract category information
  if (line.includes('BAGUE') || line.includes('BAGUES')) return 'Jewelry'
  if (line.includes('BOTTINES') || line.includes('CHAUSSURES')) return 'Shoes'
  if (line.includes('CARDIGAN') || line.includes('PULL')) return 'Clothing'
  if (line.includes('ROBE') || line.includes('DRESS')) return 'Dresses'
  return 'Accessories'
}
