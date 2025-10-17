import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { AffilaeAPI } from '@/lib/affilae'

export async function POST(request: Request) {
  try {
    const { productId, outfitId, productName, brand, affiliateLink } = await request.json()

    if (!productId || !outfitId) {
      return NextResponse.json(
        { error: 'Product ID and Outfit ID are required' },
        { status: 400 }
      )
    }

    // Find the product in our database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        outfit: true
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create click tracking record in our database
    const clickRecord = await prisma.productAnalytics.create({
      data: {
        productId: product.id,
        clicks: 1,
        revenue: 0, // Will be updated when conversion happens
        date: new Date()
      }
    })

    // Log the click for debugging
    console.log(`Click tracked for product: ${product.name} (${product.brand})`)

    // If we have Affilae integration, we could also track there
    // For now, we'll just track in our database
    // TODO: Implement Affilae click tracking if needed

    return NextResponse.json({
      success: true,
      clickId: clickRecord.id,
      message: 'Click tracked successfully'
    })

  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
