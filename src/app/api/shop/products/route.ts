import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cache } from '@/lib/cache'
import { stripe } from '@/lib/stripe'

// Type-safe Prisma access (workaround for IDE cache issues)
const db = prisma as any

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// GET /api/shop/products - Get all products (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    const products = await db.shopProduct.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ products }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching shop products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// POST /api/shop/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      price,
      compareAtPrice,
      imageUrl,
      images,
      category,
      sku,
      stock,
      lowStockAlert,
      isActive,
      isFeatured,
      weight
    } = body

    // Validation
    if (!name || !price || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, price, and image URL are required' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // Create Stripe product and price if Stripe is configured
    let stripeProductId: string | undefined
    let stripePriceId: string | undefined

    if (stripe) {
      try {
        // Create product in Stripe
        const stripeProduct = await stripe.products.create({
          name,
          description: description || undefined,
          images: [imageUrl],
          metadata: {
            sku: sku || '',
            category: category || 'accessory'
          }
        })
        stripeProductId = stripeProduct.id

        // Create price in Stripe (price in cents)
        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(price * 100),
          currency: 'eur',
        })
        stripePriceId = stripePrice.id
      } catch (stripeError) {
        console.error('Stripe product creation failed:', stripeError)
        // Continue without Stripe IDs - can be added later
      }
    }

    const product = await db.shopProduct.create({
      data: {
        name,
        nameEn,
        description,
        descriptionEn,
        price,
        compareAtPrice,
        imageUrl,
        images: images || [],
        category: category || 'accessory',
        sku,
        stock: stock || 0,
        lowStockAlert: lowStockAlert || 5,
        isActive: isActive !== false,
        isFeatured: isFeatured || false,
        stripeProductId,
        stripePriceId,
        weight
      }
    })

    // Invalidate cache
    cache.delete('shop:products:public')

    return NextResponse.json({ product }, { status: 201, headers: CORS_HEADERS })
  } catch (error: any) {
    console.error('Error creating shop product:', error)
    
    // Handle unique constraint violation (SKU)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

