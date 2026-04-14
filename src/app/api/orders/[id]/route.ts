import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'

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
