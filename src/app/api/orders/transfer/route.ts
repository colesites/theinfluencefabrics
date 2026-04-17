import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getAuthSession } from '@/lib/auth-session'
import { sendAdminOrderNotificationEmail, sendCustomerOrderReceivedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

interface TransferCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()
    const formData = await request.formData()
    
    const orderDataString = formData.get('orderData') as string
    const receiptImage = formData.get('receipt') as File | null

    if (!orderDataString) {
      return NextResponse.json({ success: false, error: 'Order data is missing' }, { status: 400 })
    }

    if (!receiptImage || receiptImage.size === 0) {
      return NextResponse.json({ success: false, error: 'A transfer receipt image is required' }, { status: 400 })
    }

    const { customer, items, totalPrice, region } = JSON.parse(orderDataString)

    // Upload receipt image to Sanity
    const buffer = Buffer.from(await receiptImage.arrayBuffer())
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: receiptImage.name,
    })

    const receiptRef = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    }

    // Generate a unique order number for transfers
    const orderNumber = 'TR-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

    const newOrder = {
      _type: 'order',
      orderNumber,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address, 
      },
      customerUserId: session?.user?.id,
      items: items.map((item: TransferCartItem) => ({
        _key: crypto.randomUUID(),
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      })),
      totalPrice,
      status: 'pending',
      paymentMethod: 'transfer',
      paymentReference: orderNumber,
      receiptImage: receiptRef
    }

    const result = await writeClient.create(newOrder)

    try {
      await sendAdminOrderNotificationEmail({
        orderNumber,
        paymentMethod: 'transfer',
        status: 'pending',
        totalPrice,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        },
        items: items.map((item: TransferCartItem) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
      })
    } catch (emailError) {
      console.error('Transfer admin email error:', emailError)
    }

    try {
      await sendCustomerOrderReceivedEmail({
        orderNumber,
        email: customer.email,
        name: customer.name,
        paymentMethod: 'transfer',
        totalPrice,
        shippingToBeDeterminedAtPark: region === 'ekiti_state' || region === 'outside_ekiti',
      })
    } catch (emailError) {
      console.error('Transfer customer email error:', emailError)
    }

    return NextResponse.json({ success: true, order: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Transfer order error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
