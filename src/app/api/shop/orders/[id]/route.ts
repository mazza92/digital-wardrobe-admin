import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Type-safe Prisma access (workaround for IDE cache issues)
const db = prisma as any

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// GET /api/shop/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Can lookup by ID or order number
    const order = await db.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    // Format dates
    const formattedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      shippedAt: order.shippedAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      items: order.items.map((item: any) => ({
        ...item,
        createdAt: item.createdAt.toISOString()
      }))
    }

    return NextResponse.json({ order: formattedOrder }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

// PUT /api/shop/orders/[id] - Update order (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      status,
      trackingNumber,
      trackingUrl,
      internalNote
    } = body

    const updateData: any = {}

    if (status !== undefined) {
      updateData.status = status
      
      // Set timestamps based on status
      if (status === 'SHIPPED' && !body.shippedAt) {
        updateData.shippedAt = new Date()
      }
      if (status === 'DELIVERED' && !body.deliveredAt) {
        updateData.deliveredAt = new Date()
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber
    }

    if (trackingUrl !== undefined) {
      updateData.trackingUrl = trackingUrl
    }

    if (internalNote !== undefined) {
      updateData.internalNote = internalNote
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true
      }
    })

    // TODO: Send status update email to customer

    return NextResponse.json({ order }, { headers: CORS_HEADERS })
  } catch (error: any) {
    console.error('Error updating order:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

