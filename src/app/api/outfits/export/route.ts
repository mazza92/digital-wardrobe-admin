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
        products: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log('Found outfits:', outfits.length)

    // Transform to match frontend format
    const frontendData = {
      influencer: {
        name: "Emmanuelle K",
        brand: "EMMANUELLE K",
        heroImage: "https://www.na-kd.com/cdn-cgi/image/quality=80,sharpen=0.3,width=984/globalassets/oversized_belted_trenchcoat_1858-000002-0765_3_campaign.jpg",
        bio: "Luxury fashion & lifestyle content creator. Sharing elegant, sophisticated style for the modern woman."
      },
      outfits: outfits.map(outfit => ({
        id: outfit.id,
        title: outfit.title,
        image: outfit.imageUrl,
        description: outfit.description || '',
        category: outfit.category || 'outfit',
        createdAt: outfit.createdAt,
        products: outfit.products.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price || '',
          imageUrl: (product as any).imageUrl || '',
          link: product.affiliateLink ? decodeHtmlEntities(product.affiliateLink) : '',
          x: product.x,
          y: product.y
        }))
      })),
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
  } catch (error) {
    console.error('Error exporting outfits:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: 'Failed to export outfits',
        details: error.message 
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
