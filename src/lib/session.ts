import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET || 'supersecretfallback1234567890'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(input: string) {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export async function setOwnerSession() {
  const sessionExp = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const sessionStr = await encrypt({ role: 'owner', expires: sessionExp.toISOString() })
  
  const cookieStore = await cookies();
  cookieStore.set('owner_session', sessionStr, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: sessionExp,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getOwnerSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('owner_session')?.value
  if (!session) return null
  return await decrypt(session)
}

export async function clearOwnerSession() {
  const cookieStore = await cookies();
  cookieStore.delete('owner_session')
}
