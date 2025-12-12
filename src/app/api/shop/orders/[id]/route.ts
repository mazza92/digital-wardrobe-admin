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

    // Get current order to check status transitions
    const currentOrder = await db.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404, headers: CORS_HEADERS }
      )
    }

    const updateData: any = {}

    if (status !== undefined && status !== currentOrder.status) {
      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        PENDING: ['PAID', 'CANCELLED'],
        PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED', 'CANCELLED'],
        DELIVERED: ['REFUNDED'],
        CANCELLED: [],
        REFUNDED: []
      }

      if (!validTransitions[currentOrder.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${currentOrder.status} to ${status}` },
          { status: 400, headers: CORS_HEADERS }
        )
      }

      updateData.status = status
      
      // Set timestamps based on status
      if (status === 'PAID' && !currentOrder.paidAt) {
        updateData.paidAt = new Date()
      }
      if (status === 'SHIPPED' && !body.shippedAt) {
        updateData.shippedAt = new Date()
      }
      if (status === 'DELIVERED' && !body.deliveredAt) {
        updateData.deliveredAt = new Date()
      }

      // Handle stock restoration on cancellation
      if (status === 'CANCELLED') {
        // Only restore stock if the order was paid (stock was decremented)
        if (['PAID', 'PROCESSING', 'SHIPPED'].includes(currentOrder.status)) {
          for (const item of currentOrder.items) {
            await db.shopProduct.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            })
          }
          console.log(`Stock restored for cancelled order ${currentOrder.orderNumber}`)
        }
      }

      // Handle refund (stock was already decremented, don't restore for refunds)
      if (status === 'REFUNDED') {
        // TODO: Trigger Stripe refund here if needed
        // For now, just log it
        console.log(`Order ${currentOrder.orderNumber} marked as refunded`)
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber
    }

    if (trackingUrl !== undefined) {
      updateData.trackingUrl = trackingUrl
    }

    if (internalNote !== undefined) {
      // Append to existing note with timestamp
      const timestamp = new Date().toLocaleString('fr-FR')
      const newNote = internalNote 
        ? `[${timestamp}] ${internalNote}`
        : ''
      
      if (currentOrder.internalNote && internalNote) {
        updateData.internalNote = `${currentOrder.internalNote}\n${newNote}`
      } else if (internalNote) {
        updateData.internalNote = newNote
      } else {
        updateData.internalNote = internalNote
      }
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        }
      }
    })

    // Format response
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

    // TODO: Send status update email to customer based on new status
    // - SHIPPED: Send shipping notification with tracking
    // - DELIVERED: Send delivery confirmation
    // - CANCELLED: Send cancellation notification
    // - REFUNDED: Send refund confirmation

    return NextResponse.json({ order: formattedOrder }, { headers: CORS_HEADERS })
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
