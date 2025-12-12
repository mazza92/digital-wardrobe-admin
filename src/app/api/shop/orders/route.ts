import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Type-safe Prisma access (workaround for IDE cache issues)
const db = prisma as any

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

// GET /api/shop/orders - Get orders (admin or by customer)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const email = searchParams.get('email')
    const orderNumber = searchParams.get('orderNumber')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (email) {
      where.customerEmail = email
    }
    
    if (orderNumber) {
      where.orderNumber = orderNumber
    }
    
    if (status) {
      where.status = status
    }

    const orders = await db.order.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Format dates for JSON
    const formattedOrders = orders.map((order: any) => ({
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
    }))

    return NextResponse.json({ orders: formattedOrders }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

