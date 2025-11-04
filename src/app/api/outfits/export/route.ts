import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function decodeHtmlEntities(text: string): string {
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  }
  
  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function GET() {
  try {
    console.log('Fetching published outfits...')
    
    const outfits = await prisma.outfit.findMany({
      where: {
        isPublished: true
      },
      include: {
        products: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('Found outfits:', outfits.length)

    // Transform to match frontend format with safe error handling
    const frontendData = {
      influencer: {
        name: "Emmanuelle K",
        brand: "EMMANUELLE K",
        heroImage: "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
        bio: "Luxury fashion & lifestyle content creator. Sharing elegant, sophisticated style for the modern woman."
      },
      outfits: outfits.map(outfit => {
        try {
          return {
            id: outfit.id || '',
            title: outfit.title || '',
            image: outfit.imageUrl || '',
            description: outfit.description || '',
            category: outfit.category || 'outfit',
            createdAt: outfit.createdAt ? outfit.createdAt.toISOString() : new Date().toISOString(),
            products: (outfit.products || []).map(product => {
              try {
                return {
                  id: product.id || '',
                  name: product.name || '',
                  brand: product.brand || '',
                  price: product.price || '',
                  imageUrl: product.imageUrl || '',
                  link: product.affiliateLink ? decodeHtmlEntities(product.affiliateLink) : '',
                  x: typeof product.x === 'number' ? product.x : 0,
                  y: typeof product.y === 'number' ? product.y : 0
                }
              } catch (productError: any) {
                console.error('Error processing product:', product.id, productError)
                return {
                  id: product.id || '',
                  name: product.name || '',
                  brand: product.brand || '',
                  price: '',
                  imageUrl: '',
                  link: '',
                  x: 0,
                  y: 0
                }
              }
            })
          }
        } catch (outfitError: any) {
          console.error('Error processing outfit:', outfit.id, outfitError)
          return {
            id: outfit.id || '',
            title: outfit.title || '',
            image: outfit.imageUrl || '',
            description: '',
            category: 'outfit',
            createdAt: new Date().toISOString(),
            products: []
          }
        }
      }),
      socialMedia: {
        instagram: "https://instagram.com/emmanuellek_",
        tiktok: "https://tiktok.com/@emmanuellek_",
        youtube: "https://youtube.com/@emmanuellek_",
        pinterest: "https://pinterest.com/emmanuellek_"
      }
    }

    return NextResponse.json(frontendData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error: any) {
    console.error('Error exporting outfits:', error)
    console.error('Error details:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    })
    
    // More detailed error response for debugging
    const errorMessage = error?.message || 'Unknown error occurred'
    const errorCode = error?.code || 'UNKNOWN_ERROR'
    
    return NextResponse.json(
      { 
        error: 'Failed to export outfits',
        message: errorMessage,
        code: errorCode
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}
