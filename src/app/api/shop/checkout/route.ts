import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe, calculateShipping, generateOrderNumber } from '@/lib/stripe'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

interface CartItem {
  productId: string
  quantity: number
}

interface CheckoutRequest {
  items: CartItem[]
  customerEmail: string
  customerName: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }
  shippingType?: 'standard' | 'express'
  customerId?: string // Supabase user ID if authenticated
  customerNote?: string
  successUrl: string
  cancelUrl: string
}

// POST /api/shop/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 503, headers: CORS_HEADERS }
      )
    }

    const body: CheckoutRequest = await request.json()
    const {
      items,
      customerEmail,
      customerName,
      shippingAddress,
      shippingType = 'standard',
      customerId,
      customerNote,
      successUrl,
      cancelUrl
    } = body

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    if (!customerEmail || !customerName || !shippingAddress) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // Fetch products and validate stock
    const productIds = items.map(item => item.productId)
    const products = await prisma.shopProduct.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      }
    })

    // Validate all products exist and have stock
    const productMap = new Map(products.map(p => [p.id, p]))
    const lineItems: any[] = []
    const orderItems: any[] = []
    let subtotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)
      
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400, headers: CORS_HEADERS }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400, headers: CORS_HEADERS }
        )
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      // Prepare Stripe line item
      if (product.stripePriceId) {
        lineItems.push({
          price: product.stripePriceId,
          quantity: item.quantity
        })
      } else {
        // Create price on the fly if no Stripe price exists
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined
            },
            unit_amount: Math.round(product.price * 100)
          },
          quantity: item.quantity
        })
      }

      // Prepare order item
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice: product.price,
        quantity: item.quantity,
        total: itemTotal
      })
    }

    // Calculate shipping
    const shippingCost = calculateShipping(subtotal, shippingAddress.country, shippingType)
    const total = subtotal + shippingCost

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order in database (pending status)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        customerId,
        customerEmail,
        customerName,
        shippingAddress,
        subtotal,
        shippingCost,
        total,
        customerNote,
        items: {
          create: orderItems
        }
      }
    })

    // Add shipping as a line item if not free
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: shippingType === 'express' ? 'Livraison Express' : 'Livraison Standard',
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'paypal'],
      line_items: lineItems,
      customer_email: customerEmail,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber
      },
      success_url: `${successUrl}?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?order=${order.orderNumber}`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'NL', 'PT', 'AT', 'GB']
      },
      billing_address_collection: 'required',
      locale: 'fr',
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    })

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      orderNumber: order.orderNumber
    }, { headers: CORS_HEADERS })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

