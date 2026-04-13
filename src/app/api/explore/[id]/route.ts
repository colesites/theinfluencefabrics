import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
       return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    await writeClient.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
