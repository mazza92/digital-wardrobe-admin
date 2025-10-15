import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const outfit = await prisma.outfit.findUnique({
      where: { id },
      include: {
        products: true
        // Temporarily remove analytics to avoid relation issues
        // analytics: {
        //   orderBy: { date: 'desc' }
        // }
      }
    })

    if (!outfit) {
      return NextResponse.json(
        { error: 'Outfit not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ outfit })
  } catch (error) {
    console.error('Error fetching outfit:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outfit' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, description, imageUrl, category, isPublished, products } = await request.json()
    
    console.log('Updating outfit:', { id, title, description, imageUrl, isPublished, products })

    const outfit = await prisma.outfit.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        category: category || 'outfit', // Default to 'outfit' if not provided
        isPublished,
        products: {
          deleteMany: {},
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

    return NextResponse.json({ outfit })
  } catch (error) {
    console.error('Error updating outfit:', error)
    return NextResponse.json(
      { error: 'Failed to update outfit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.outfit.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Outfit deleted successfully' })
  } catch (error) {
    console.error('Error deleting outfit:', error)
    return NextResponse.json(
      { error: 'Failed to delete outfit' },
      { status: 500 }
    )
  }
}
