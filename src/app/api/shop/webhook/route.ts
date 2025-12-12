import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

// Disable body parsing for webhook (Stripe needs raw body)
export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// POST /api/shop/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe or webhook secret not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutExpired(session)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        // Could send notification to customer
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Handle successful checkout
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  
  if (!orderId) {
    console.error('No orderId in session metadata')
    return
  }

  try {
    // Get the order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      console.error('Order not found:', orderId)
      return
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripePaymentId: session.payment_intent as string,
        paymentMethod: session.payment_method_types?.[0] || 'card',
        paidAt: new Date()
      }
    })

    // Decrease stock for each item
    for (const item of order.items) {
      await prisma.shopProduct.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    console.log(`Order ${order.orderNumber} paid successfully`)

    // TODO: Send confirmation email to customer
    // TODO: Send notification to influencer

  } catch (error) {
    console.error('Error processing checkout complete:', error)
    throw error
  }
}

// Handle expired checkout session
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  
  if (!orderId) return

  try {
    // Cancel the pending order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        internalNote: 'Checkout session expired'
      }
    })

    console.log(`Order ${orderId} cancelled - checkout expired`)
  } catch (error) {
    console.error('Error handling checkout expired:', error)
  }
}

