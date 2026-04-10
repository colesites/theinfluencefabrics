import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'

export const dynamic = 'force-dynamic'

interface PaystackMetadata {
  custom_fields?: Array<{
    variable_name: string;
    value: string;
  }>;
}

interface CartItemMetadata {
  id: string;
  qty: number;
  size?: string;
  color?: string;
}

export async function POST(request: Request) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference missing' }, { status: 400 })
    }

    // 1. Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const payload = await paystackRes.json()

    if (!payload.status || payload.data.status !== 'success') {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 })
    }

    const data = payload.data
    const metadata: PaystackMetadata = data.metadata || {}
    const cartItems: CartItemMetadata[] = JSON.parse(metadata.custom_fields?.find((f) => f.variable_name === 'cart_items')?.value || '[]')

    const newOrder = {
      _type: 'order',
      orderNumber: reference,
      customer: {
        name: data.customer.first_name + ' ' + data.customer.last_name,
        email: data.customer.email,
        phone: data.customer.phone || '',
        address: 'Pending manual update (from Paystack customer data)', 
      },
      items: cartItems.map((item) => ({
        _key: crypto.randomUUID(),
        productId: item.id,
        name: 'Item ' + item.id,
        price: 0,
        quantity: item.qty,
        size: item.size,
        color: item.color,
      })),
      totalPrice: data.amount / 100,
      status: 'paid',
      paymentReference: reference,
    }

    const result = await writeClient.create(newOrder)

    return NextResponse.json({ success: true, order: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
