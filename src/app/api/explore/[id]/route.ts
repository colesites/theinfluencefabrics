import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getOwnerSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const patchPayload: {
      title: string
      content: string
      image?: {
        _type: string
        asset: {
          _type: string
          _ref: string
        }
      }
    } = {
      title,
      content,
    }

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
      })

      patchPayload.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      }
    }

    const result = await writeClient.patch(id).set(patchPayload).commit()

    return NextResponse.json({ success: true, item: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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
