import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { CartItem } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })

export async function POST(req: Request) {
  const { items, shipping, customer } = await req.json() as {
    items: CartItem[]
    shipping: { name: string; price: number; time: string }
    customer: { email: string; firstName: string; lastName: string }
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
    price_data: {
      currency: 'pln',
      product_data: {
        name: item.product.name,
        images: item.product.images.slice(0, 1),
        metadata: { sku: item.product.sku, brand: item.product.brand },
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }))

  // Shipping as separate line item if paid
  if (shipping.price > 0) {
    line_items.push({
      price_data: {
        currency: 'pln',
        product_data: { name: `Dostawa: ${shipping.name}` },
        unit_amount: Math.round(shipping.price * 100),
      },
      quantity: 1,
    })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'blik', 'p24'],
    line_items,
    mode: 'payment',
    customer_email: customer.email,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    metadata: {
      customer_name: `${customer.firstName} ${customer.lastName}`,
      shipping_method: shipping.name,
    },
    locale: 'pl',
    billing_address_collection: 'required',
    shipping_address_collection: { allowed_countries: ['PL'] },
  })

  return NextResponse.json({ sessionId: session.id })
}
