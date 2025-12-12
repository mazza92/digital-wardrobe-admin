import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = cache.get<any>(CACHE_KEYS.OUTFITS_LIST)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' }
      })
    }

    // Optimized query with select
    const outfits = await prisma.outfit.findMany({
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        descriptionEn: true,
        imageUrl: true,
        category: true,
        isPublished: true,
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const result = { outfits }
    cache.set(CACHE_KEYS.OUTFITS_LIST, result, CACHE_TTL.MEDIUM)

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS' }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching outfits:', error)
    }
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, titleEn, description, descriptionEn, imageUrl, category, isPublished, products } = await request.json()

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    const outfit = await prisma.outfit.create({
      data: {
        title,
        titleEn,
        description,
        descriptionEn,
        imageUrl,
        category: category || 'outfit', // Default to 'outfit' if not provided
        isPublished: isPublished !== undefined ? isPublished : true, // Default to published
        products: {
          create: (products || []).map((product: any) => ({
            name: product.name,
            brand: product.brand,
            price: product.price || null,
            imageUrl: product.imageUrl || null,
            affiliateLink: product.affiliateLink || null,
            x: product.x,
            y: product.y
          }))
        }
      },
      include: {
        products: true
      }
    })

    // Invalidate cache after creating new outfit
    cache.delete(CACHE_KEYS.OUTFITS_LIST)
    cache.delete(CACHE_KEYS.OUTFITS_EXPORT)

    return NextResponse.json({ outfit }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating outfit:', error)
    }
    return NextResponse.json(
      { error: 'Failed to create outfit' },
      { status: 500 }
    )
  }
}
