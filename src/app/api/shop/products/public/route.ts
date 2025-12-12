import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cache, CACHE_TTL } from '@/lib/cache'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// GET /api/shop/products/public - Public endpoint for frontend
export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'shop:products:public'
    const cached = cache.get<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { ...CORS_HEADERS, 'X-Cache': 'HIT' }
      })
    }

    // Fetch only active products with stock > 0 (or allow backorder)
    const products = await prisma.shopProduct.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        description: true,
        descriptionEn: true,
        price: true,
        compareAtPrice: true,
        imageUrl: true,
        images: true,
        category: true,
        stock: true,
        isFeatured: true,
        createdAt: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform for frontend
    const data = {
      products: products.map(p => ({
        ...p,
        inStock: p.stock > 0,
        createdAt: p.createdAt.toISOString()
      }))
    }

    // Cache for 2 minutes
    cache.set(cacheKey, data, CACHE_TTL.MEDIUM)

    return NextResponse.json(data, {
      headers: { ...CORS_HEADERS, 'X-Cache': 'MISS' }
    })
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

