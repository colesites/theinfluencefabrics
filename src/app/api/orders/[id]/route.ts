import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'
import { decrementInventoryForOrderItems } from '@/lib/inventory'
import { sendCustomerOrderStatusEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

function isInventoryCommittedStatus(status: string | undefined) {
  return ['approved', 'shipped', 'delivered'].includes(status || '')
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 })
    }

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid status label' }, { status: 400 })
    }

    const currentOrder = await writeClient.fetch<{
      _id: string
      orderNumber?: string
      status?: string
      customerUserId?: string
      paymentMethod?: string
      totalPrice?: number
      customer?: {
        name?: string
        email?: string
      }
      items?: Array<{
        productId?: string
        quantity?: number
        size?: string
        color?: string
      }>
    } | null>(
      `*[_type == "order" && _id == $id][0]{
        _id,
        orderNumber,
        status,
        customerUserId,
        paymentMethod,
        totalPrice,
        customer{
          name,
          email
        },
        items[]{
          productId,
          quantity,
          size,
          color
        }
      }`,
      { id },
    )

    if (!currentOrder?._id) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const wasInventoryCommitted = isInventoryCommittedStatus(currentOrder.status)
    const isInventoryCommitted = isInventoryCommittedStatus(status)
    if (!wasInventoryCommitted && isInventoryCommitted) {
      await decrementInventoryForOrderItems(
        (currentOrder.items || []).map((item) => ({
          productId: item.productId || '',
          quantity: Number(item.quantity || 0),
          size: item.size,
          color: item.color,
        })),
      )
    }

    const result = await writeClient
      .patch(id)
      .set({ status })
      .commit()

    const statusChanged = currentOrder.status !== status
    const shouldEmailCustomer =
      statusChanged &&
      Boolean(currentOrder.customerUserId) &&
      Boolean(currentOrder.customer?.email) &&
      (
        status === 'approved' ||
        status === 'shipped' ||
        status === 'delivered'
      )

    if (shouldEmailCustomer) {
      try {
        await sendCustomerOrderStatusEmail({
          orderNumber: currentOrder.orderNumber || id,
          email: currentOrder.customer?.email || '',
          name: currentOrder.customer?.name,
          status,
          paymentMethod: currentOrder.paymentMethod,
          totalPrice: currentOrder.totalPrice,
        })
      } catch (emailError) {
        console.error('Customer order status email error:', emailError)
      }
    }

    return NextResponse.json({ success: true, order: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Order patch error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
