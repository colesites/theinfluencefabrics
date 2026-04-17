import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getAuthSession } from '@/lib/auth-session'
import { decrementInventoryForOrderItems } from '@/lib/inventory'
import { sendAdminOrderNotificationEmail, sendCustomerOrderReceivedEmail } from '@/lib/email'

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

function getMetadataValue(metadata: PaystackMetadata, key: string) {
  return metadata.custom_fields?.find((f) => f.variable_name === key)?.value;
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
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
    const cartItems: CartItemMetadata[] = JSON.parse(getMetadataValue(metadata, 'cart_items') || '[]')
    const region = getMetadataValue(metadata, 'delivery_region') || ''

    const existingOrder = await writeClient.fetch<{ _id: string } | null>(
      `*[_type == "order" && paymentReference == $reference][0]{ _id }`,
      { reference },
    )

    if (existingOrder?._id) {
      return NextResponse.json({ success: true, order: existingOrder })
    }

    await decrementInventoryForOrderItems(
      cartItems.map((item) => ({
        productId: item.id,
        quantity: item.qty,
        size: item.size,
        color: item.color,
      })),
    )

    const newOrder = {
      _type: 'order',
      orderNumber: reference,
      customer: {
        name: data.customer.first_name + ' ' + data.customer.last_name,
        email: data.customer.email,
        phone: data.customer.phone || '',
        address: 'Pending manual update (from Paystack customer data)', 
      },
      customerUserId: session?.user?.id,
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
      status: 'approved',
      paymentMethod: 'paystack',
      paymentReference: reference,
    }

    const result = await writeClient.create(newOrder)

    try {
      await sendAdminOrderNotificationEmail({
        orderNumber: reference,
        paymentMethod: 'paystack',
        status: 'approved',
        totalPrice: data.amount / 100,
        customer: {
          name: `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() || 'Customer',
          email: data.customer.email,
          phone: data.customer.phone || '',
          address: 'Pending manual update (from Paystack customer data)',
        },
        items: cartItems.map((item) => ({
          name: 'Item ' + item.id,
          quantity: item.qty,
          price: 0,
          size: item.size,
          color: item.color,
        })),
      })
    } catch (emailError) {
      console.error('Paystack admin email error:', emailError)
    }

    try {
      await sendCustomerOrderReceivedEmail({
        orderNumber: reference,
        email: data.customer.email,
        name: `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim() || 'Customer',
        paymentMethod: 'paystack',
        totalPrice: data.amount / 100,
        shippingToBeDeterminedAtPark: region === 'ekiti_state' || region === 'outside_ekiti',
      })
    } catch (emailError) {
      console.error('Paystack customer email error:', emailError)
    }

    return NextResponse.json({ success: true, order: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
