import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getOwnerSession } from '@/lib/session'

export async function GET() {
  try {
    const query = `*[_type == "explore"] | order(_createdAt desc) {
      _id,
      title,
      content,
      "image": image.asset->url,
      _createdAt
    }`
    const result = await writeClient.fetch(query)
    return NextResponse.json({ success: true, items: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getOwnerSession()
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null

    if (!title || !content || !imageFile) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Process image
    let imageRef = null
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: imageFile.name,
      })
      imageRef = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      }
    } else {
       return NextResponse.json({ success: false, error: 'Image is required' }, { status: 400 })
    }

    const newExplore = {
      _type: 'explore',
      title,
      content,
      image: imageRef
    }

    const result = await writeClient.create(newExplore)

    return NextResponse.json({ success: true, item: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
