import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cache } from '@/lib/cache'
import { stripe } from '@/lib/stripe'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// GET /api/shop/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await prisma.shopProduct.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    return NextResponse.json({ product }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// PUT /api/shop/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get existing product
    const existing = await prisma.shopProduct.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    // Update Stripe product if price changed
    if (stripe && existing.stripeProductId && price !== existing.price) {
      try {
        // Create new price in Stripe (prices are immutable)
        const newPrice = await stripe.prices.create({
          product: existing.stripeProductId,
          unit_amount: Math.round(price * 100),
          currency: 'eur',
        })
        
        // Archive old price
        if (existing.stripePriceId) {
          await stripe.prices.update(existing.stripePriceId, { active: false })
        }
        
        body.stripePriceId = newPrice.id
      } catch (stripeError) {
        console.error('Stripe price update failed:', stripeError)
      }
    }

    // Update product name/description in Stripe
    if (stripe && existing.stripeProductId && (name !== existing.name || description !== existing.description)) {
      try {
        await stripe.products.update(existing.stripeProductId, {
          name: name || existing.name,
          description: description || existing.description || undefined
        })
      } catch (stripeError) {
        console.error('Stripe product update failed:', stripeError)
      }
    }

    const product = await prisma.shopProduct.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(description !== undefined && { description }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(price !== undefined && { price }),
        ...(compareAtPrice !== undefined && { compareAtPrice }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(images !== undefined && { images }),
        ...(category !== undefined && { category }),
        ...(sku !== undefined && { sku }),
        ...(stock !== undefined && { stock }),
        ...(lowStockAlert !== undefined && { lowStockAlert }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(weight !== undefined && { weight }),
        ...(body.stripePriceId && { stripePriceId: body.stripePriceId })
      }
    })

    // Invalidate cache
    cache.delete('shop:products:public')

    return NextResponse.json({ product }, { headers: CORS_HEADERS })
  } catch (error: any) {
    console.error('Error updating product:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// DELETE /api/shop/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get existing product
    const existing = await prisma.shopProduct.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    // Check if product has orders - if so, just deactivate instead
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      // Soft delete - just deactivate
      await prisma.shopProduct.update({
        where: { id },
        data: { isActive: false }
      })
      
      return NextResponse.json({ 
        message: 'Product deactivated (has associated orders)',
        deactivated: true 
      }, { headers: CORS_HEADERS })
    }

    // Archive in Stripe
    if (stripe && existing.stripeProductId) {
      try {
        await stripe.products.update(existing.stripeProductId, { active: false })
      } catch (stripeError) {
        console.error('Stripe product archive failed:', stripeError)
      }
    }

    // Hard delete
    await prisma.shopProduct.delete({ where: { id } })

    // Invalidate cache
    cache.delete('shop:products:public')

    return NextResponse.json({ message: 'Product deleted' }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

