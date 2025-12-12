import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

// Precompiled regex for better performance
const HTML_ENTITY_REGEX = /&[a-zA-Z0-9#]+;/g
const ENTITIES_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' '
}

function decodeHtmlEntities(text: string): string {
  return text.replace(HTML_ENTITY_REGEX, (entity) => ENTITIES_MAP[entity] || entity)
}

// Static data that never changes - cached permanently
const STATIC_DATA = {
  influencer: {
    name: "Emmanuelle K",
    brand: "EMMANUELLE K",
    heroImage: "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
    bio: "Luxury fashion & lifestyle content creator. Sharing elegant, sophisticated style for the modern woman."
  },
  socialMedia: {
    instagram: "https://instagram.com/emmanuellek_",
    tiktok: "https://tiktok.com/@emmanuellek_",
    youtube: "https://youtube.com/@emmanuellek_",
    pinterest: "https://pinterest.com/emmanuellek_"
  }
}

// Common CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  })
}

export async function GET() {
  try {
    // Check cache first (60 second TTL)
    const cached = cache.get<any>(CACHE_KEYS.OUTFITS_EXPORT)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          ...CORS_HEADERS,
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }
      })
    }

    // Optimized query: select only needed fields
    const outfits = await prisma.outfit.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        descriptionEn: true,
        imageUrl: true,
        category: true,
        createdAt: true,
        products: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            imageUrl: true,
            affiliateLink: true,
            x: true,
            y: true
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Optimized transformation - minimal object creation
    const frontendData = {
      ...STATIC_DATA,
      outfits: outfits.map(outfit => ({
        id: outfit.id,
        title: outfit.title,
        titleEn: outfit.titleEn || '',
        image: outfit.imageUrl,
        description: outfit.description || '',
        descriptionEn: outfit.descriptionEn || '',
        category: outfit.category,
        createdAt: outfit.createdAt.toISOString(),
        products: outfit.products.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price || '',
          imageUrl: product.imageUrl || '',
          link: product.affiliateLink ? decodeHtmlEntities(product.affiliateLink) : '',
          x: product.x,
          y: product.y
        }))
      }))
    }

    // Cache the result for 60 seconds
    cache.set(CACHE_KEYS.OUTFITS_EXPORT, frontendData, CACHE_TTL.EXPORT)

    return NextResponse.json(frontendData, {
      headers: {
        ...CORS_HEADERS,
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    })
  } catch (error: any) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error exporting outfits:', error)
    }
    
    const isConnectionError = error?.code === 'P1001' || 
                              error?.name === 'PrismaClientInitializationError'
    
    return NextResponse.json(
      { 
        error: isConnectionError ? 'Database connection failed' : 'Failed to export outfits',
        code: error?.code || 'UNKNOWN_ERROR'
      },
      { 
        status: isConnectionError ? 503 : 500,
        headers: CORS_HEADERS
      }
    )
  }
}
