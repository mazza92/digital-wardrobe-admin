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
      const response = await fetch(feedConfig.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      const products = parseXMLFeed(xmlText)
      
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
    // Simple XML parsing for the specific feed format
    // The feed appears to be space-separated values with product data
    const lines = xmlText.split('\n').filter(line => line.trim())
    const products = []
    
    for (const line of lines) {
      if (line.includes('https://www.soeur.fr')) {
        const parts = line.split(' ')
        if (parts.length >= 8) {
          try {
            const product = {
              id: parts[1] || `soeur_${Date.now()}_${Math.random()}`,
              name: extractProductName(line),
              brand: 'Soeur',
              price: extractPrice(line),
              description: extractDescription(line),
              imageUrl: extractImageUrl(line),
              affiliateLink: extractAffiliateLink(line),
              category: extractCategory(line),
              availability: 'in stock'
            }
            
            if (product.name && product.price) {
              products.push(product)
            }
          } catch (parseError) {
            console.warn('Error parsing product line:', parseError)
          }
        }
      }
    }
    
    return products
  } catch (error) {
    console.error('Error parsing XML feed:', error)
    return []
  }
}

function extractProductName(line: string): string {
  // Extract product name from the line
  const match = line.match(/https:\/\/www\.soeur\.fr\s+([A-Z\s]+)/)
  return match ? match[1].trim() : 'Product'
}

function extractPrice(line: string): string {
  // Extract price (look for pattern like "145.00" or "365.00")
  const priceMatch = line.match(/(\d+\.\d{2})\s+new/)
  return priceMatch ? priceMatch[1] : '0.00'
}

function extractDescription(line: string): string {
  // Extract description from the line
  const parts = line.split(' ')
  const descriptionStart = parts.findIndex(part => part.includes('https://www.soeur.fr')) + 2
  const descriptionEnd = parts.findIndex(part => part.includes('https://lb.affilae.com'))
  
  if (descriptionStart > 1 && descriptionEnd > descriptionStart) {
    return parts.slice(descriptionStart, descriptionEnd).join(' ').trim()
  }
  
  return 'Beautiful product from Soeur'
}

function extractImageUrl(line: string): string {
  // Extract image URL
  const imageMatch = line.match(/https:\/\/cdn\.shopify\.com[^\s]+\.jpg/)
  return imageMatch ? imageMatch[0] : '/placeholder.jpg'
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
