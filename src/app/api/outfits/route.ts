import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const outfits = await prisma.outfit.findMany({
      include: {
        products: true
        // Temporarily remove analytics to avoid relation issues
        // analytics: {
        //   orderBy: { date: 'desc' },
        //   take: 1
        // }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ outfits })
  } catch (error) {
    console.error('Error fetching outfits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, imageUrl, category, isPublished, products } = await request.json()

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    const outfit = await prisma.outfit.create({
      data: {
        title,
        description,
        imageUrl,
        category: category || 'outfit', // Default to 'outfit' if not provided
        isPublished: isPublished !== undefined ? isPublished : true, // Default to published
        products: {
          create: (products || []).map((product: any) => ({
            name: product.name,
            brand: product.brand,
            price: product.price || null,
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

    return NextResponse.json({ outfit }, { status: 201 })
  } catch (error) {
    console.error('Error creating outfit:', error)
    return NextResponse.json(
      { error: 'Failed to create outfit' },
      { status: 500 }
    )
  }
}
