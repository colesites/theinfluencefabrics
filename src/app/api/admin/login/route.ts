import { NextResponse } from 'next/server'
import { setOwnerSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const masterSecret = process.env.ADMIN_PASSWORD || 'ankara-secret-123'

    if (password !== masterSecret) {
      return NextResponse.json({ success: false, error: 'Cryptographic identity check failed. Access denied.' }, { status: 401 })
    }

    // Set secure HTTP-only cookie for the owner
    await setOwnerSession()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
