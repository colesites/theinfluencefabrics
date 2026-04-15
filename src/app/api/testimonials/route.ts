import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { getAuthSession } from '@/lib/auth-session'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 })
    }

    const testimonials = await writeClient.fetch(
      `*[_type == "testimonial" && product._ref == $productId] | order(_createdAt desc) {
        _id,
        "productId": product._ref,
        userId,
        userName,
        rating,
        comment,
        _createdAt
      }`,
      { productId },
    )

    return NextResponse.json({ success: true, testimonials })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Sign in required' }, { status: 401 })
    }

    const { productId, rating, comment } = await request.json()

    if (!productId || !comment || typeof rating !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedRating = Math.max(1, Math.min(5, Math.round(rating)))
    const trimmedComment = String(comment).trim()
    if (trimmedComment.length < 3) {
      return NextResponse.json({ success: false, error: 'Comment must be at least 3 characters' }, { status: 400 })
    }

    const userId = session.user.id
    const userName = session.user.name || session.user.email || 'Anonymous'

    const existingId = await writeClient.fetch<string | null>(
      `*[_type == "testimonial" && product._ref == $productId && userId == $userId][0]._id`,
      { productId, userId },
    )

    const payload = {
      product: {
        _type: 'reference',
        _ref: productId,
      },
      userId,
      userName,
      rating: normalizedRating,
      comment: trimmedComment,
    }

    const testimonial = existingId
      ? await writeClient.patch(existingId).set(payload).commit()
      : await writeClient.create({
          _type: 'testimonial',
          ...payload,
        })

    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
