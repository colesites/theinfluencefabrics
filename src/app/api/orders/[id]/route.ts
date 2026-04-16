import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'
import { decrementInventoryForOrderItems } from '@/lib/inventory'

export const dynamic = 'force-dynamic'

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
      status?: string
      items?: Array<{
        productId?: string
        quantity?: number
        size?: string
        color?: string
      }>
    } | null>(
      `*[_type == "order" && _id == $id][0]{
        _id,
        status,
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

    const wasPaid = currentOrder.status === 'paid'
    const isNowPaid = status === 'paid'
    if (!wasPaid && isNowPaid) {
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

    return NextResponse.json({ success: true, order: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Order patch error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
